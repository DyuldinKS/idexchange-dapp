import { FC } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Stack, TextField, Typography, useTheme } from '@mui/material';
import { waitForTransaction } from '@wagmi/core';

import {
  buildCompleteOrderTx,
  getIdenaLinkToSignTx,
  IdenaOrderState,
  openIdenaAppToSignTx,
} from '../utils/idena';
import { canCompleteOrder } from '../utils/orderControls';
import { completeXdaiCnfOrder, XdaiConfirmedOrder } from '../utils/xdai';
import { SecretSchema, secretSchema } from './CnfOrderCompletion';
import { UiError, UiSubmitButton } from './ui';
import { useRemoteData } from '../hooks/useRemoteData';
import { Transaction } from 'idena-sdk-js';
import { rData } from '../utils/remoteData';
import { getColor } from '../utils/theme';

export const OrderCompletion: FC<{
  order: IdenaOrderState;
  cnfOrder: XdaiConfirmedOrder | null;
  idenaAddress: string;
  secret: string | null;
  secretHash: string;
  onComplete: () => void;
}> = ({ order, cnfOrder, idenaAddress, secret, secretHash, onComplete }) => {
  // TODO: show input to paste secret manually
  // const form = useForm<SecretSchema>({
  //   resolver: zodResolver(secretSchema),
  //   defaultValues: { secret: '' },
  //   mode: 'onChange',
  // });
  // const {
  //   handleSubmit,
  //   register,
  //   formState: { errors },
  // } = form;
  const [completeOrderTxRD, completeOrderTxRDM] = useRemoteData<Transaction>(null);
  const theme = useTheme();

  if (!rData.isSuccess(completeOrderTxRD)) {
    return (
      <Stack spacing={1}>
        {/* <TextField
        {...register('secret')}
        error={Boolean(errors.secret)}
        helperText={errors.secret?.message}
        placeholder="Secret code"
        fullWidth
        size="small"
      /> */}
        <UiSubmitButton
          disabled={!canCompleteOrder(order, cnfOrder, idenaAddress) || !secret}
          onClick={async () => {
            if (!secret) return;
            await completeOrderTxRDM
              .track(buildCompleteOrderTx(idenaAddress, secret))
              .then((tx) => tx && openIdenaAppToSignTx(tx));
          }}
        >
          Withdraw iDNA and complete order
        </UiSubmitButton>
        {completeOrderTxRD.error && <UiError>{completeOrderTxRD.error}</UiError>}
      </Stack>
    );
  }

  return (
    // TODO: move to IdenaTxLinkRoutine component
    <>
      <Typography color={getColor.textGrey(theme)}>
        Click{' '}
        <Link href={getIdenaLinkToSignTx(completeOrderTxRD.data)} target="_blank">
          this link
        </Link>{' '}
        if Idena App did not open automatically. Wait for the transaction to complete, then reload
        order state.
      </Typography>
      <UiSubmitButton sx={{ mt: 2 }} onClick={onComplete}>
        Check order state
      </UiSubmitButton>
    </>
  );
};
