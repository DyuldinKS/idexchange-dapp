import { isHexString } from 'ethers/lib/utils.js';
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, TextField } from '@mui/material';
import { waitForTransaction } from '@wagmi/core';

import { APP_CONFIG } from '../app.config';
import { canCompleteCnfOrder } from '../utils/orderControls';
import { completeXdaiCnfOrder, XdaiConfirmedOrder } from '../utils/xdai';
import { UiSubmitButton } from './ui';

export type SecretSchema = z.infer<typeof secretSchema>;

const secretSchema = z.object({
  secret: z.string().refine((val) => isHexString(val, APP_CONFIG.idena.secretBytesLength), {
    message: "The order's secret expected to be a hex string.",
  }),
});

export const CnfOrderCompletion: FC<{ cnfOrder: XdaiConfirmedOrder; onComplete: () => void }> = ({
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
    <Stack>
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
        Take xDAI and complete order
      </UiSubmitButton>
    </Stack>
  );
};
