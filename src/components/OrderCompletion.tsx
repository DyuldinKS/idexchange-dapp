import { FC } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, TextField } from '@mui/material';
import { waitForTransaction } from '@wagmi/core';

import { IdenaOrderState } from '../utils/idena';
import { canCompleteOrder } from '../utils/orderControls';
import { completeXdaiCnfOrder, XdaiConfirmedOrder } from '../utils/xdai';
import { SecretSchema, secretSchema } from './CnfOrderCompletion';
import { UiSubmitButton } from './ui';

export const OrderCompletion: FC<{
  order: IdenaOrderState;
  cnfOrder: XdaiConfirmedOrder | null;
  idenaAddress: string;
  onComplete: () => void;
}> = ({ order, cnfOrder, idenaAddress, onComplete }) => {
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
        disabled={!canCompleteOrder(order, cnfOrder, idenaAddress)}
        onClick={() => {
          handleSubmit(({ secret }) => {
            completeXdaiCnfOrder(secret)
              .then((tx) => waitForTransaction({ hash: tx.hash }))
              .finally(onComplete);
          });
        }}
      >
        Take iDNA and complete order
      </UiSubmitButton>
    </Stack>
  );
};
