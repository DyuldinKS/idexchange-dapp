import { FC } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, TextField } from '@mui/material';
import { waitForTransaction } from '@wagmi/core';

import { canCompleteCnfOrder } from '../utils/orderControls';
import { completeXdaiCnfOrder, XdaiConfirmedOrder } from '../utils/xdai';
import { UiSubmitButton } from './ui';
import { z } from 'zod';
import { isHexString } from 'ethers/lib/utils.js';
import { APP_CONFIG } from '../app.config';

export type SecretSchema = z.infer<typeof secretSchema>;

export const secretSchema = z.object({
  secret: z.string().refine((val) => isHexString(val, APP_CONFIG.idena.secretBytesLength), {
    message: "The order's secret expected to be a 40 bytes hex string.",
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
        disabled={!canCompleteCnfOrder(cnfOrder)}
        onClick={() => {
          handleSubmit(({ secret }) => {
            completeXdaiCnfOrder(secret)
              .then((tx) => waitForTransaction({ hash: tx.hash }))
              .finally(onComplete);
          });
        }}
      >
        Withdraw xDAI and complete order
      </UiSubmitButton>
    </Stack>
  );
};
export default CnfOrderCompletion;
