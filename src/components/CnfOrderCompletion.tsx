import { FC } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, TextField } from '@mui/material';
import { waitForTransaction } from '@wagmi/core';

import { canCompleteCnfOrder } from '../utils/orderControls';
import { completeXdaiCnfOrder, XdaiConfirmedOrder } from '../utils/xdai';
import { UiError, UiSubmitButton } from './ui';
import { z } from 'zod';
import { isHexString } from 'ethers/lib/utils.js';
import { APP_CONFIG } from '../app.config';
import { useRemoteData } from '../hooks/useRemoteData';
import { rData } from '../utils/remoteData';

export type SecretSchema = z.infer<typeof secretSchema>;

export const secretSchema = z.object({
  secret: z.string().refine((val) => isHexString(val, APP_CONFIG.idena.secretBytesLength), {
    message: `The order's secret expected to be a ${APP_CONFIG.idena.secretBytesLength} bytes hex string.`,
  }),
});

const CnfOrderCompletion: FC<{ cnfOrder: XdaiConfirmedOrder; onComplete: () => void }> = ({
  cnfOrder,
  onComplete,
}) => {
  const form = useForm<SecretSchema>({
    resolver: zodResolver(secretSchema),
    defaultValues: { secret: '' },
    mode: 'onChange',
  });
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = form;
  // TODO: fix component unmount and state reload
  const [txRD, txRDM] = useRemoteData(null);

  return (
    <Stack spacing={1}>
      <TextField
        {...register('secret')}
        error={Boolean(errors.secret)}
        helperText={errors.secret?.message}
        placeholder="Secret code"
        fullWidth
        size="small"
      />
      <UiSubmitButton
        disabled={!canCompleteCnfOrder(cnfOrder) || rData.isLoading(txRD)}
        onClick={(evt) => {
          handleSubmit(({ secret }) => {
            txRDM.track(
              completeXdaiCnfOrder(secret).then((tx) =>
                waitForTransaction({ hash: tx.hash }).then(onComplete),
              ),
            );
          })(evt).catch((err) => console.warn('completeXdaiCnfOrder', err));
        }}
      >
        {rData.isLoading(txRD) ? 'Sending transaction...' : 'Withdraw xDAI and complete order'}
      </UiSubmitButton>
      <UiError err={txRD.error} />
    </Stack>
  );
};
export default CnfOrderCompletion;
