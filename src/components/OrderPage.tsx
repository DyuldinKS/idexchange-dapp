import debug from 'debug';
import { FC, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Box, Grid, Link, Stack, TextField, Tooltip, Typography, useTheme } from '@mui/material';
import { gnosis } from '@wagmi/core/chains';

import abiToReceiveXdai from '../abi/idena-atomic-dex-gnosis.json';
import { CONTRACTS } from '../constants/contracts';
import { useRemoteData, UseRemoteDataReturn } from '../hooks/useRemoteData';
import { useGetSecurityDepositInfo } from '../hooks/useSecurityDepositInfo';
import { useWeb3Store } from '../providers/store/StoreProvider';
import { shortenHash } from '../utils/address';
import {
  buildBurnIdenaOrderTx,
  getIdenaLinkToSignTx,
  getIdnaOrderState,
  getSecretHash,
  IdnaOrderState,
  openIdenaAppToSignTx,
} from '../utils/idena';
import { isOrderConfirmationValid } from '../utils/orderControls';
import { rData, RemoteData } from '../utils/remoteData';
import { readXdaiConfirmedOrder, XdaiConfirmedOrder } from '../utils/xdai';
import { ConfirmedOrderInfoBlock } from './ConfirmedOrderInfo';
import { IdenaOrderInfoBlock } from './IdenaOrderInfo';
import { UiError, UiPage, UiSubmitButton } from './ui';
import { isHexString } from 'ethers/lib/utils.js';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { APP_CONFIG } from '../app.config';
import { DEFAULT_CHAIN_ID, isChainSupported, web3Modal } from '../utils/web3Modal';
import { switchNetwork } from '@wagmi/core';
import { renderWalletRoutineIfNeeded } from './WalletRoutine';
import { SecurityDeposit } from './SecurityDeposit';
import { XdaiOrderConfirmation } from './XdaiOrderConfirmation';
import { Transaction } from 'idena-sdk-js';
import { getColor } from '../utils/theme';
import { mapRejected } from '../utils/async';

const log = debug('OrderPage');

export type SecretSchema = z.infer<typeof secretSchema>;

const secretSchema = z.object({
  secret: z.string().refine(
    (val) =>
      // TODO: remove 24 bytes secret
      isHexString(val, 24) || isHexString(val, APP_CONFIG.idena.secretBytesLength),
    {
      message: "The order's secret expected to be a hex string.",
    },
  ),
});

export const OrderPage: FC = () => {
  const { hash } = useParams() as { hash: string };
  const [{ chainId, address }] = useWeb3Store();
  const {
    rData: [securityDepositRD],
    reloadSecurityDeposit,
  } = useGetSecurityDepositInfo(CONTRACTS[gnosis.id].receiveXdai, abiToReceiveXdai);
  const [orderRD, orderRDM] = useRemoteData<IdnaOrderState | null>(null);
  const [confirmedOrderRD, confirmedOrderRDM] = useRemoteData<XdaiConfirmedOrder | null>(null);

  // owner part
  const form = useForm<SecretSchema>({
    resolver: zodResolver(secretSchema),
    defaultValues: { secret: '' },
    mode: 'onChange',
  });
  const {
    handleSubmit,
    register,
    formState: { errors },
    setError,
  } = form;
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    orderRDM.track(getIdnaOrderState(hash));
    confirmedOrderRDM.track(readXdaiConfirmedOrder(hash));
  }, [hash]);

  const renderOrderContent = () => {
    if (rData.isNotAsked(orderRD) || rData.isLoading(orderRD)) return 'Loading...';
    if (rData.isFailure(orderRD)) return <UiError msg={orderRD.error} />;
    return orderRD.data ? null : 'Order not found.';
  };

  const renderConfirmedOrderInfo = () => {
    if (rData.isNotAsked(confirmedOrderRD) || rData.isLoading(confirmedOrderRD))
      return 'Loading...';
    if (rData.isFailure(confirmedOrderRD)) return <UiError msg={confirmedOrderRD.error} />;
    return confirmedOrderRD.data ? null : 'Order confirmation not found.';
  };

  return (
    <UiPage maxWidth="sm">
      <Tooltip title={hash}>
        <Typography variant="h4" component="h1" fontWeight={400}>
          {`Order ${shortenHash(hash, 6, 5)}`}
        </Typography>
      </Tooltip>
      {(isOwner && (
        <OrderOwnerView
          secretHash={hash}
          orderRD={orderRD}
          idenaOrderRDM={orderRDM}
          confirmedOrderRD={confirmedOrderRD}
        />
      )) || (
        <Stack mt={4}>
          <Stack spacing={2}>
            <IdenaOrderInfoBlock title="Idena chain" order={orderRD.data} secretHash={hash}>
              {renderOrderContent()}
            </IdenaOrderInfoBlock>
            <ConfirmedOrderInfoBlock
              isValid={isOrderConfirmationValid(orderRD.data, confirmedOrderRD.data)}
              title="Confirmation in Gnosis chain"
              order={confirmedOrderRD.data}
            >
              {renderConfirmedOrderInfo()}
            </ConfirmedOrderInfoBlock>
          </Stack>
          {(orderRD.data || confirmedOrderRD.data) && (
            <Stack mt={2} spacing={2}>
              <Box>
                <Grid container spacing={1}>
                  {!isOwner && (
                    <>
                      <Grid item xs={12} sm={8}>
                        <TextField
                          {...register('secret')}
                          error={Boolean(errors.secret)}
                          helperText={errors.secret?.message}
                          placeholder="Secret code"
                          fullWidth
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <UiSubmitButton
                          fullWidth
                          sx={{ height: '40px' }}
                          variant="outlined"
                          onClick={handleSubmit(({ secret }) => {
                            if (getSecretHash(secret) === hash) {
                              setIsOwner(true);
                            } else {
                              setError('secret', {
                                message: 'This is not a secret code of this order.',
                              });
                            }
                          })}
                        >
                          Manage as owner
                        </UiSubmitButton>
                      </Grid>
                    </>
                  )}
                </Grid>
              </Box>
            </Stack>
          )}
        </Stack>
      )}
    </UiPage>
  );
};

export const OrderOwnerView: FC<{
  secretHash: string;
  orderRD: RemoteData<IdnaOrderState | null>;
  idenaOrderRDM: UseRemoteDataReturn<IdnaOrderState | null>[1];
  confirmedOrderRD: RemoteData<XdaiConfirmedOrder | null>;
}> = ({ secretHash, orderRD, idenaOrderRDM, confirmedOrderRD }) => {
  const [web3Store] = useWeb3Store();
  const {
    rData: [securityDepositRD],
    reloadSecurityDeposit,
  } = useGetSecurityDepositInfo(CONTRACTS[gnosis.id].receiveXdai, abiToReceiveXdai);
  const order = orderRD.data;
  // if the order is still without confirmation
  const canConfirmOrder =
    order &&
    // TODO: take into account minOrderTTL <= (idena.expirationAt - gnosis.deadline),
    // because there's no need to create confirmation for order that could'n be matched.
    // Should be replaced with: (order.expirationAt - gnosis.minOrderTTL < Date.now())
    order.expirationAt < Date.now() &&
    rData.isSuccess(confirmedOrderRD) &&
    !confirmedOrderRD.data;
  const [cancelOrderTxRD, cancelOrderTxRDM] = useRemoteData<Transaction>(null);
  const theme = useTheme();
  // TODO: get owner from events in case of order already burned, but confirmed order is still exists.

  const renderOrderContent = () => {
    if (rData.isNotAsked(orderRD) || rData.isLoading(orderRD)) return 'Loading...';
    if (rData.isFailure(orderRD)) return <UiError msg={orderRD.error} />;

    const order = orderRD.data;
    if (!order) return 'Order not found.';

    const buildCancelTxAndSign = async () => {
      const tx = await buildBurnIdenaOrderTx(order.owner, secretHash);
      openIdenaAppToSignTx(tx);
    };

    const reloadOrderState = async () => {
      idenaOrderRDM.track(
        getIdnaOrderState(secretHash).catch(
          mapRejected((err: any) => {
            console.error('Failed to load order state:', err);
            return err;
          }),
        ),
      );
    };

    const canBeCancelled =
      Date.now() > order.expirationAt &&
      !confirmedOrderRD.data &&
      !rData.isLoading(cancelOrderTxRD);

    return (
      <Stack spacing={2}>
        <UiSubmitButton disabled={!canBeCancelled} onClick={buildCancelTxAndSign}>
          Cancel order
        </UiSubmitButton>
        {rData.isSuccess(cancelOrderTxRD) && (
          <>
            <Typography color={getColor.textGrey(theme)}>
              Click{' '}
              <Link href={getIdenaLinkToSignTx(cancelOrderTxRD.data)} target="_blank">
                this link
              </Link>{' '}
              if Idena App did not open automatically. Wait for the transaction to complete, then
              load the order data to continue.
            </Typography>
            <UiSubmitButton sx={{ mt: 2 }} onClick={reloadOrderState}>
              Check order status
            </UiSubmitButton>
          </>
        )}
        {rData.isFailure(cancelOrderTxRD) && <UiError msg={cancelOrderTxRD.error} />}
      </Stack>
    );
  };

  const renderConfirmedOrderInfo = () => {
    if (rData.isNotAsked(confirmedOrderRD) || rData.isLoading(confirmedOrderRD))
      return 'Loading...';
    if (rData.isFailure(confirmedOrderRD)) return <UiError msg={confirmedOrderRD.error} />;
    return confirmedOrderRD.data ? null : 'Order confirmation not found.';
  };

  return (
    <Stack alignItems="stretch" mt={4}>
      {renderWalletRoutineIfNeeded(web3Store) || (
        <>
          <Stack spacing={2}>
            <IdenaOrderInfoBlock title="Idena chain" order={orderRD.data} secretHash={secretHash}>
              {renderOrderContent()}
            </IdenaOrderInfoBlock>
            {canConfirmOrder ? (
              <Stack alignItems="stretch" mt={2}>
                <SecurityDeposit
                  state={securityDepositRD}
                  reloadSecurityDeposit={reloadSecurityDeposit}
                />
                <XdaiOrderConfirmation secretHash={secretHash} idenaOrder={order} />
              </Stack>
            ) : (
              <ConfirmedOrderInfoBlock
                isValid={isOrderConfirmationValid(orderRD.data, confirmedOrderRD.data)}
                title="Confirmation in Gnosis chain"
                order={confirmedOrderRD.data}
              >
                {renderConfirmedOrderInfo()}
              </ConfirmedOrderInfoBlock>
            )}
          </Stack>
        </>
      )}
    </Stack>
  );
  return null;
};
