import debug from 'debug';
import { isHexString } from 'ethers/lib/utils.js';
import { FC, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useSearchParams } from 'react-router-dom';
import { z } from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Grid, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { gnosis } from '@wagmi/core/chains';

import abiToReceiveXdai from '../abi/idena-atomic-dex-gnosis.json';
import { APP_CONFIG } from '../app.config';
import { CONTRACTS } from '../constants/contracts';
import { useContractsAttributes } from '../hooks/useContractsAttributes';
import { useRemoteData } from '../hooks/useRemoteData';
import { useGetSecurityDepositInfo } from '../hooks/useSecurityDepositInfo';
import { useWeb3Store } from '../providers/store/StoreProvider';
import { shortenHash } from '../utils/address';
import { getIdenaOrderState, getSecretHash, IdenaOrderState } from '../utils/idena';
import { isCnfOrderValid } from '../utils/orderControls';
import { rData } from '../utils/remoteData';
import { readXdaiConfirmedOrder, XdaiConfirmedOrder } from '../utils/xdai';
import { ConfirmedOrderInfoBlock } from './ConfirmedOrderInfo';
import { IdenaOrderInfoBlock } from './IdenaOrderInfo';
import { UiError, UiPage, UiSubmitButton } from './ui';
import { OrderOwnerView } from './OrderOwnerView';

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
  const [searchParams] = useSearchParams();
  const [{ chainId, address }] = useWeb3Store();
  const {
    rData: [securityDepositRD],
    reloadSecurityDeposit,
  } = useGetSecurityDepositInfo(CONTRACTS[gnosis.id].receiveXdai, abiToReceiveXdai);
  const [orderRD, orderRDM] = useRemoteData<IdenaOrderState | null>(null);
  const [cnfOrderRD, cnfOrderRDM] = useRemoteData<XdaiConfirmedOrder | null>(null);
  const contractsAttrsRD = useContractsAttributes();
  const contractsAttrs = contractsAttrsRD.data;

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
  const [isOwner, setIsOwner] = useState(searchParams.get('viewAs') === 'owner');

  useEffect(() => {
    orderRDM.track(getIdenaOrderState(hash));
    cnfOrderRDM.track(readXdaiConfirmedOrder(hash));
  }, [hash]);

  const renderOrder = () => {
    if (rData.isNotAsked(orderRD) || rData.isLoading(orderRD)) return 'Loading...';
    if (rData.isFailure(orderRD)) return <UiError err={orderRD.error} />;
    return orderRD.data ? null : 'Order not found.';
  };

  const renderConfirmedOrder = () => {
    const error = cnfOrderRD.error || contractsAttrsRD.error;
    if (
      rData.isNotAsked(cnfOrderRD) ||
      rData.isLoading(cnfOrderRD) ||
      rData.isLoading(contractsAttrsRD)
    )
      return 'Loading...';
    if (error) return <UiError err={error} />;

    return cnfOrderRD.data ? null : 'Order confirmation not found.';
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
          orderRDM={orderRDM}
          cnfOrderRD={cnfOrderRD}
          cnfOrderRDM={cnfOrderRDM}
        />
      )) || (
        <Stack mt={4}>
          <Stack spacing={2}>
            <IdenaOrderInfoBlock title="Idena chain" order={orderRD.data} secretHash={hash}>
              {renderOrder()}
            </IdenaOrderInfoBlock>
            <ConfirmedOrderInfoBlock
              isValid={
                contractsAttrs &&
                isCnfOrderValid(orderRD.data, cnfOrderRD.data, contractsAttrs.xdai)
              }
              title="Confirmation in Gnosis chain"
              order={cnfOrderRD.data}
            >
              {renderConfirmedOrder()}
            </ConfirmedOrderInfoBlock>
          </Stack>
          {(orderRD.data || cnfOrderRD.data) && (
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
