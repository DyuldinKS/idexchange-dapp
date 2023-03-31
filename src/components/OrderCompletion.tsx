import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Checkbox,
  FormControlLabel,
  Link,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
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
import { UiError, UiSpan, UiSubmitButton } from './ui';
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
}> = ({ order, cnfOrder, idenaAddress, secret: loadedSecret, onComplete }) => {
  const [iKnowSecret, setIKnowSecret] = useState(false);
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
  const [completeOrderTxRD, completeOrderTxRDM] = useRemoteData<Transaction>(null);
  const theme = useTheme();

  const canComplete = canCompleteOrder(order, cnfOrder, idenaAddress);
  const complete = async (secretCode: string) =>
    completeOrderTxRDM
      .track(buildCompleteOrderTx(idenaAddress, secretCode))
      .then((tx) => tx && openIdenaAppToSignTx(tx));

  // TODO: fix unmounting this component and completeOrderTxRD state reload
  if (!rData.isSuccess(completeOrderTxRD)) {
    if (!loadedSecret) {
      return (
        <Stack spacing={1}>
          {canComplete && (
            <>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={iKnowSecret}
                    onChange={() => setIKnowSecret((prev) => !prev)}
                  />
                }
                label="I know the secret."
              />
              {iKnowSecret && (
                <TextField
                  {...register('secret')}
                  error={Boolean(errors.secret)}
                  helperText={errors.secret?.message}
                  placeholder="Secret code"
                  fullWidth
                  size="small"
                />
              )}
            </>
          )}
          <UiSubmitButton
            disabled={!canComplete || !iKnowSecret}
            onClick={handleSubmit(({ secret: pastedSecret }) => complete(pastedSecret))}
          >
            Withdraw iDNA and complete order
          </UiSubmitButton>
          {completeOrderTxRD.error && <UiError>{completeOrderTxRD.error}</UiError>}
        </Stack>
      );
    }

    return (
      <Stack spacing={1}>
        <UiSpan color={theme.palette.secondary.dark}></UiSpan>
        <UiSubmitButton
          disabled={!canComplete || !loadedSecret}
          onClick={() => loadedSecret && complete(loadedSecret)}
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
