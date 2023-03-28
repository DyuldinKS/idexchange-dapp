import debug from 'debug';
import { isHexString } from 'ethers/lib/utils.js';
import { FC, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useSearchParams } from 'react-router-dom';
import { z } from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Grid, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { gnosis } from '@wagmi/core/chains';

import abiToReceiveXdai from '../abi/idena-atomic-dex-gnosis.json';
import { APP_CONFIG } from '../app.config';
import { CONTRACTS } from '../constants/contracts';
import { useContractsAttributes } from '../hooks/useContractsAttributes';
import { useRemoteData } from '../hooks/useRemoteData';
import { useRevision } from '../hooks/useRevision';
import { useGetSecurityDepositInfo } from '../hooks/useSecurityDepositInfo';
import { useWeb3Store } from '../providers/store/StoreProvider';
import { shortenHash } from '../utils/address';
import { getIdenaOrderState, getSecretHash, IdenaOrderState } from '../utils/idena';
import { isCnfOrderValid } from '../utils/orderControls';
import { rData } from '../utils/remoteData';
import { readXdaiConfirmedOrder, XdaiConfirmedOrder } from '../utils/xdai';
import { ConfirmedOrderInfoBlock } from './ConfirmedOrderInfo';
import { IdenaOrderInfoBlock } from './IdenaOrderInfo';
import { OrderBuyerView } from './OrderBuyerView';
import { OrderOwnerView } from './OrderOwnerView';
import { UiError, UiPage } from './ui';

const log = debug('OrderPage');

export type SecretSchema = z.infer<typeof secretSchema>;

const secretSchema = z.object({
  secret: z.string().refine((val) => isHexString(val, APP_CONFIG.idena.secretBytesLength), {
    message: "The order's secret expected to be a hex string.",
  }),
});

export const OrderPage: FC = () => {
  const { hash } = useParams() as { hash: string };
  const [searchParams, setSearchParams] = useSearchParams();
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

  const viewAs = searchParams.get('viewAs');
  const [, rerender] = useRevision();
  useEffect(rerender, [viewAs]);
  const isOwner = viewAs === 'owner';
  const isBuyer = viewAs === 'buyer';

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
      )) ||
        (isBuyer && (
          <OrderBuyerView
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
                    <Grid item xs={12} sm={7}>
                      <TextField
                        {...register('secret')}
                        error={Boolean(errors.secret)}
                        helperText={errors.secret?.message}
                        placeholder="Secret code"
                        fullWidth
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={5}>
                      <Button
                        fullWidth
                        size="large"
                        sx={{ height: '40px' }}
                        variant="outlined"
                        onClick={handleSubmit(({ secret }) => {
                          if (getSecretHash(secret) === hash) {
                            setSearchParams(new URLSearchParams({ viewAs: 'owner' }));
                          } else {
                            setError('secret', {
                              message: 'This is not a secret code of this order.',
                            });
                          }
                        })}
                      >
                        View as order owner
                      </Button>
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        size="large"
                        variant="outlined"
                        fullWidth
                        onClick={() => {
                          setSearchParams(new URLSearchParams({ viewAs: 'buyer' }));
                        }}
                      >
                        View as iDNA buyer
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Stack>
            )}
          </Stack>
        )}
    </UiPage>
  );
};
