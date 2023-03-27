import debug from 'debug';
import { isHexString } from 'ethers/lib/utils.js';
import { Transaction } from 'idena-sdk-js';
import { tap } from 'ramda';
import { FC, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { z } from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Grid, Link, Stack, TextField, Tooltip, Typography, useTheme } from '@mui/material';
import { waitForTransaction } from '@wagmi/core';
import { gnosis } from '@wagmi/core/chains';

import abiToReceiveXdai from '../abi/idena-atomic-dex-gnosis.json';
import { APP_CONFIG } from '../app.config';
import { CONTRACTS } from '../constants/contracts';
import { useRemoteData, UseRemoteDataReturn } from '../hooks/useRemoteData';
import { useGetSecurityDepositInfo } from '../hooks/useSecurityDepositInfo';
import { useWeb3Store } from '../providers/store/StoreProvider';
import { shortenHash } from '../utils/address';
import { mapRejected } from '../utils/async';
import {
  buildBurnIdenaOrderTx,
  getIdenaLinkToSignTx,
  getIdenaOrderState,
  getSecretHash,
  IdenaOrderState,
  openIdenaAppToSignTx,
} from '../utils/idena';
import { isOrderConfirmationValid } from '../utils/orderControls';
import { rData, RemoteData } from '../utils/remoteData';
import { getColor } from '../utils/theme';
import { burnXdaiOrder, readXdaiConfirmedOrder, XdaiConfirmedOrder } from '../utils/xdai';
import { ConfirmedOrderInfoBlock } from './ConfirmedOrderInfo';
import { IdenaOrderInfoBlock } from './IdenaOrderInfo';
import { SecurityDeposit } from './SecurityDeposit';
import { UiError, UiPage, UiSpan, UiSubmitButton } from './ui';
import { renderWalletRoutineIfNeeded } from './WalletRoutine';
import { XdaiOrderConfirmation } from './XdaiOrderConfirmation';
import { useContractsStaticInfo } from '../hooks/useContractsStaticInfo';

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
  const [orderRD, orderRDM] = useRemoteData<IdenaOrderState | null>(null);
  const [confirmedOrderRD, confirmedOrderRDM] = useRemoteData<XdaiConfirmedOrder | null>(null);
  const contractsInfoRD = useContractsStaticInfo();

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
    orderRDM.track(getIdenaOrderState(hash));
    confirmedOrderRDM.track(readXdaiConfirmedOrder(hash));
  }, [hash]);

  const renderOrder = () => {
    if (rData.isNotAsked(orderRD) || rData.isLoading(orderRD)) return 'Loading...';
    if (rData.isFailure(orderRD)) return <UiError err={orderRD.error} />;
    return orderRD.data ? null : 'Order not found.';
  };

  const renderConfirmedOrder = () => {
    if (rData.isNotAsked(confirmedOrderRD) || rData.isLoading(confirmedOrderRD))
      return 'Loading...';
    if (rData.isFailure(confirmedOrderRD)) return <UiError err={confirmedOrderRD.error} />;
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
          confirmedOrderRDM={confirmedOrderRDM}
        />
      )) || (
        <Stack mt={4}>
          <Stack spacing={2}>
            <IdenaOrderInfoBlock title="Idena chain" order={orderRD.data} secretHash={hash}>
              {renderOrder()}
            </IdenaOrderInfoBlock>
            <ConfirmedOrderInfoBlock
              isValid={isOrderConfirmationValid(orderRD.data, confirmedOrderRD.data)}
              title="Confirmation in Gnosis chain"
              order={confirmedOrderRD.data}
            >
              {renderConfirmedOrder()}
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
  orderRD: RemoteData<IdenaOrderState | null>;
  idenaOrderRDM: UseRemoteDataReturn<IdenaOrderState | null>[1];
  confirmedOrderRD: RemoteData<XdaiConfirmedOrder | null>;
  confirmedOrderRDM: UseRemoteDataReturn<XdaiConfirmedOrder | null>[1];
}> = ({ secretHash, orderRD, idenaOrderRDM, confirmedOrderRD, confirmedOrderRDM }) => {
  const [web3Store] = useWeb3Store();
  const {
    rData: [securityDepositRD],
    reloadSecurityDeposit,
  } = useGetSecurityDepositInfo(CONTRACTS[gnosis.id].receiveXdai, abiToReceiveXdai);
  const order = orderRD.data;
  // if the order is still without confirmation
  const isConfirmedOrderNotFound = rData.isSuccess(confirmedOrderRD) && !confirmedOrderRD.data;
  const canConfirmOrder =
    order &&
    // TODO: take into account minOrderTTL <= (idena.expirationAt - gnosis.deadline),
    // because there's no need to create confirmation for order that could'n be matched.
    // Should be replaced with: (order.expirationAt - gnosis.minOrderTTL > Date.now())
    order.expirationAt > Date.now() &&
    isConfirmedOrderNotFound;
  const [cancelOrderTxRD, cancelOrderTxRDM] = useRemoteData<Transaction>(null);
  const [burnConfirmedOrderRD, burnConfirmedOrderRDM] = useRemoteData(null);
  const theme = useTheme();
  // TODO: get owner from events in case of order already burned, but confirmed order is still exists.

  const renderOrder = () => {
    if (rData.isNotAsked(orderRD) || rData.isLoading(orderRD)) return 'Loading...';
    if (rData.isFailure(orderRD)) return <UiError err={orderRD.error} />;

    const order = orderRD.data;
    if (!order) return 'Order not found.';

    const buildCancelTxAndSign = async () => {
      cancelOrderTxRDM.track(
        buildBurnIdenaOrderTx(order.owner, secretHash).then(tap(openIdenaAppToSignTx)),
      );
    };

    const reloadOrderState = async () => {
      idenaOrderRDM.track(
        getIdenaOrderState(secretHash).catch(
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

    console.log(cancelOrderTxRD);

    return (
      <Stack spacing={2}>
        {!rData.isSuccess(cancelOrderTxRD) && (
          <UiSubmitButton disabled={!canBeCancelled} onClick={buildCancelTxAndSign}>
            Cancel order
          </UiSubmitButton>
        )}
        {rData.isSuccess(cancelOrderTxRD) && (
          <>
            <Typography color={getColor.textGrey(theme)}>
              Click{' '}
              <Link href={getIdenaLinkToSignTx(cancelOrderTxRD.data)} target="_blank">
                this link
              </Link>{' '}
              if Idena App did not open automatically. Wait for the transaction to complete, then
              reload order state.
            </Typography>
            <UiSubmitButton sx={{ mt: 2 }} onClick={reloadOrderState}>
              Check order status
            </UiSubmitButton>
          </>
        )}
        {rData.isFailure(cancelOrderTxRD) && <UiError err={cancelOrderTxRD.error} />}
      </Stack>
    );
  };

  const renderConfirmedOrder = () => {
    if (rData.isNotAsked(confirmedOrderRD) || rData.isLoading(confirmedOrderRD))
      return 'Loading...';
    if (rData.isFailure(confirmedOrderRD)) return <UiError err={confirmedOrderRD.error} />;

    const confirmedOrder = confirmedOrderRD.data;
    if (!confirmedOrder) return 'Order confirmation not found.';
    if (web3Store.address !== confirmedOrder.owner)
      return (
        <UiError
          msg={
            <UiSpan>
              You are not an owner of this order. Switch account to{' '}
              <UiSpan fontWeight={600}>{confirmedOrder.owner}</UiSpan>
            </UiSpan>
          }
        />
      );

    const burnConfirmedOrder = async () => {
      await burnConfirmedOrderRDM.track(
        burnXdaiOrder(secretHash).then((tx) => waitForTransaction({ hash: tx.hash })),
      );
      await confirmedOrderRDM.track(readXdaiConfirmedOrder(secretHash));
    };

    if (
      confirmedOrder.executionDeadline
        ? confirmedOrder.executionDeadline < Date.now()
        : confirmedOrder.matchDeadline < Date.now()
    ) {
      return (
        <>
          <UiSubmitButton
            disabled={rData.isLoading(burnConfirmedOrderRD)}
            onClick={burnConfirmedOrder}
          >
            Cancel order
          </UiSubmitButton>
          <UiError mt={1} err={burnConfirmedOrderRD.error} />
        </>
      );
    }

    return null;
  };

  return (
    <Stack alignItems="stretch" mt={4}>
      {renderWalletRoutineIfNeeded(web3Store) || (
        <>
          <Stack spacing={2}>
            <IdenaOrderInfoBlock title="Idena chain" order={orderRD.data} secretHash={secretHash}>
              {renderOrder()}
            </IdenaOrderInfoBlock>
            {canConfirmOrder ? (
              <Stack alignItems="stretch" mt={2} spacing={2}>
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
                {renderConfirmedOrder()}
              </ConfirmedOrderInfoBlock>
            )}
          </Stack>
        </>
      )}
    </Stack>
  );
  return null;
};
