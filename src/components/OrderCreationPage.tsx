import debug from 'debug';
import { ethers } from 'ethers';
import { FC, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, TextField, Typography } from '@mui/material';

import { useRemoteData } from '../hooks/useRemoteData';
import { useXdaiSecurityDeposit } from '../hooks/useXdaiSecurityDeposit';
import { useWeb3Store } from '../providers/store/StoreProvider';
import {
  generateRandomSecret,
  getSecretHash,
  IdenaOrderState,
  MIN_IDNA_AMOUNT_TO_SELL,
} from '../utils/idena';
import { rData } from '../utils/remoteData';
import { IdenaOrderCreation } from './IdenaOrderCreation';
import { SecretCodeForm } from './SecretCodeForm';
import { UiPage } from './ui';
import { renderWalletRoutineIfNeeded } from './WalletRoutine';
import { XdaiSecurityDepositControls, XdaiSecurityDepositOwnerView } from './XdaiSecurityDeposit';
import { SellerInfoBlock } from './SellerInfo';

export type OrderCreationFormSchema = z.infer<typeof orderCreationFormSchema>;

const orderCreationFormSchema = z.object({
  amountToSell: z.string().refine((arg) => Number(arg) >= MIN_IDNA_AMOUNT_TO_SELL, {
    message: `Min amount: ${MIN_IDNA_AMOUNT_TO_SELL}`,
  }),
  amountToReceive: z
    .string()
    .refine((arg) => Number(arg) > 0, { message: 'Should be a positive number' }),
  idenaAddress: z
    .string()
    .refine((val) => ethers.utils.isAddress(val), { message: 'Invalid Idena address' }),
});

const log = debug('OrderCreationPage');

export const OrderCreationPage: FC = () => {
  const [web3Store] = useWeb3Store();
  const form = useForm<OrderCreationFormSchema>({
    resolver: zodResolver(orderCreationFormSchema),
    defaultValues: {
      amountToSell: '',
      amountToReceive: '',
      idenaAddress: '',
    },
    mode: 'onChange',
  });
  const { register, formState, handleSubmit } = form;
  const { errors, isSubmitting } = formState;
  const [securityDepositRD, securityDepositRDM] = useXdaiSecurityDeposit();
  const [idenaOrderRD, idenaOrderRDM] = useRemoteData<IdenaOrderState | null>(null);
  const navigate = useNavigate();
  const [secret] = useState(generateRandomSecret);
  const [secretHash] = useState(() => getSecretHash(secret));
  const [isSecretSaved, setIsSecretSaved] = useState(false);

  const isOrderSuccessfullyCreated = Boolean(rData.isSuccess(idenaOrderRD) && idenaOrderRD.data);

  useEffect(() => {
    if (rData.isSuccess(idenaOrderRD) && idenaOrderRD.data) {
      navigate(`/order/${secretHash}?viewAs=owner`);
    }
  }, [idenaOrderRD]);

  return (
    <UiPage maxWidth="sm">
      <Typography variant="h4" component="h1" fontWeight={400}>
        Create an order to sell iDNA for xDAI
      </Typography>
      <Stack spacing="1rem" mt={4}>
        <TextField
          {...register('idenaAddress')}
          disabled={isSubmitting || isOrderSuccessfullyCreated || isSecretSaved}
          error={Boolean(errors.idenaAddress)}
          helperText={errors.idenaAddress?.message}
          variant="outlined"
          placeholder="Your address in Idena chain"
          size="small"
        />
        <TextField
          {...register('amountToSell')}
          disabled={isSubmitting || isOrderSuccessfullyCreated || isSecretSaved}
          error={Boolean(errors.amountToSell)}
          helperText={errors.amountToSell?.message}
          variant="outlined"
          placeholder="iDNA amount to sell"
          size="small"
        />
        <TextField
          {...register('amountToReceive')}
          disabled={isSubmitting || isOrderSuccessfullyCreated || isSecretSaved}
          error={Boolean(errors.amountToReceive)}
          helperText={errors.amountToReceive?.message}
          variant="outlined"
          placeholder="xDAI amount to receive"
          size="small"
        />
      </Stack>
      <SellerInfoBlock />
      <SecretCodeForm
        form={form}
        secret={secret}
        secretHash={secretHash}
        isSaved={isSecretSaved}
        setIsSaved={setIsSecretSaved}
      />
      <Stack>
        {isSecretSaved && (
          <Stack alignItems="stretch" mt={4}>
            {renderWalletRoutineIfNeeded(web3Store) || (
              <>
                {
                  <XdaiSecurityDepositOwnerView
                    securityDepositRD={securityDepositRD}
                    controls={
                      <XdaiSecurityDepositControls
                        address={web3Store.address}
                        securityDepositRD={securityDepositRD}
                        securityDepositRDM={securityDepositRDM}
                      />
                    }
                  />
                }
                {rData.isSuccess(securityDepositRD) && securityDepositRD.data.isValid && (
                  <Stack alignItems="stretch" mt={2}>
                    <IdenaOrderCreation
                      idenaOrderRD={idenaOrderRD}
                      idenaOrderRDM={idenaOrderRDM}
                      form={form}
                      secretHash={secretHash}
                    />
                  </Stack>
                )}
              </>
            )}
          </Stack>
        )}
      </Stack>
    </UiPage>
  );
};
