import debug from 'debug';
import { FC, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Box, Grid, Stack, TextField, Tooltip, Typography, useTheme } from '@mui/material';
import { gnosis } from '@wagmi/core/chains';

import abiToReceiveXdai from '../abi/idena-atomic-dex-gnosis.json';
import { CONTRACTS } from '../constants/contracts';
import { useRemoteData } from '../hooks/useRemoteData';
import { useGetSecurityDepositInfo } from '../hooks/useSecurityDepositInfo';
import { useWeb3Store } from '../providers/store/StoreProvider';
import { shortenHash } from '../utils/address';
import { getIdnaOrderState, getSecretHash, IdnaOrderState } from '../utils/idena';
import { isOrderConfirmationValid } from '../utils/orderControls';
import { rData } from '../utils/remoteData';
import { readXdaiConfirmedOrder, XdaiConfirmedOrder } from '../utils/xdai';
import { ConfirmedOrderInfoBlock } from './ConfirmedOrderInfo';
import { IdenaOrderInfoBlock } from './IdenaOrderInfo';
import { UiError, UiPage, UiSubmitButton } from './ui';
import { isHexString } from 'ethers/lib/utils.js';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { APP_CONFIG } from '../app.config';

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
  const [confirmedOrderRD, confirmedOrderRDM] = useRemoteData<XdaiConfirmedOrder>(null);
  const theme = useTheme();

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
      <Stack mt={4} spacing={2}>
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
      <Stack mt={4} spacing={2}>
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
                        setError('secret', { message: 'This is not a secret code of this order.' });
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
    </UiPage>
  );
};
