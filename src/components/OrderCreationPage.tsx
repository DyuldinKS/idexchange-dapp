import { useState } from 'react';
import { Box, Breakpoint, Button, ButtonProps, Stack, styled, TextField } from '@mui/material';
import { switchNetwork } from '@wagmi/core';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWeb3Store } from '../providers/store/StoreProvider';
import { DEFAULT_CHAIN_ID, isChainSupported, web3Modal } from '../utils/web3modal';
import { UiPage, UiSubmitButton } from './ui';

export type OrderCreationFormSchema = z.infer<typeof orderCreationFormSchema>;

const orderCreationFormSchema = z.object({
  amountToSell: z
    .string()
    .refine((arg) => Number(arg) > 0, { message: 'should be a positive number' }),
  amountToBuy: z
    .string()
    .refine((arg) => Number(arg) > 0, { message: 'should be a positive number' }),
  secret: z.string().nonempty().min(12),
});

export const OrderCreationPage = () => {
  const form = useForm<OrderCreationFormSchema>({
    resolver: zodResolver(orderCreationFormSchema),
    defaultValues: {
      amountToSell: '',
      amountToBuy: '',
      secret: '',
    },
    mode: 'onChange',
  });
  const { handleSubmit, register, formState } = form;
  const { errors, isSubmitting, isSubmitSuccessful, isValid } = formState;
  const [{ chainId, address }] = useWeb3Store();

  return (
    <UiPage width="sm">
      <Stack spacing="1rem">
        <TextField
          {...register('amountToSell')}
          error={Boolean(errors.amountToSell)}
          helperText={errors.amountToSell?.message}
          variant="outlined"
        />
        <TextField
          {...register('amountToBuy')}
          error={Boolean(errors.amountToBuy)}
          helperText={errors.amountToBuy?.message}
          variant="outlined"
        />
        <TextField
          {...register('secret')}
          error={Boolean(errors.secret)}
          helperText={errors.secret?.message}
          variant="outlined"
        />
        {(!address && (
          <UiSubmitButton onClick={() => web3Modal.openModal()} variant="contained">
            Connect wallet
          </UiSubmitButton>
        )) ||
          (!isChainSupported(chainId) && (
            <UiSubmitButton onClick={() => switchNetwork({ chainId: DEFAULT_CHAIN_ID })}>
              Switch network
            </UiSubmitButton>
          )) || <UiSubmitButton>Replenish xDai deposit</UiSubmitButton>}
      </Stack>
    </UiPage>
  );
};
