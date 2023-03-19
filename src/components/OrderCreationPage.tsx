import { useEffect } from 'react';
import { Stack, TextField, Typography } from '@mui/material';
import { getProvider, readContract, switchNetwork } from '@wagmi/core';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWeb3Store } from '../providers/store/StoreProvider';
import { DEFAULT_CHAIN_ID, isChainSupported, web3Modal } from '../utils/web3Modal';
import { UiError, UiLogo, UiPage, UiSubmitButton } from './ui';
import { useRemoteData } from '../hooks/useRemoteData';
import BigNumber from 'bignumber.js';
import { CONTRACTS } from '../constants/contracts';
import { gnosis } from '@wagmi/core/chains';
import responseOrderAbi from '../abi/idena-atomic-dex-gnosis.json';
import debug from 'debug';
import { BN } from '../utils/bignumber';
import { rData } from '../utils/remoteData';

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

type SecurityDepositInfo = {
  amount: BigNumber;
  isInUse: Boolean;
  minRequiredAmount: BigNumber;
  isValid: Boolean;
};

const log = debug('hooks:useSecurityDepositInfo');

const useSecurityDepositInfo = () => {
  const [{ chainId, address }] = useWeb3Store();
  const rd = useRemoteData<SecurityDepositInfo | null>(null, log);
  const [, rdApi] = rd;

  useEffect(() => {
    if (!address || !chainId) return;

    const contractInfo = {
      address: CONTRACTS[gnosis.id].responseOrderCreation,
      abi: responseOrderAbi,
    };
    rdApi.track(
      Promise.all([
        readContract({
          ...contractInfo,
          functionName: 'securityDeposits',
          args: [address],
        }),
        readContract({
          ...contractInfo,
          functionName: 'securityDepositsInUse',
          args: [address],
        }),
        readContract({
          ...contractInfo,
          functionName: 'securityDepositAmount',
        }),
      ]).then(([amount, isInUse, minRequiredAmount]: any[]) => ({
        amount,
        isInUse,
        minRequiredAmount,
        isValid: BN(amount).gte(minRequiredAmount) && !isInUse,
      })),
    );
  }, [address, chainId, rdApi]);

  return rd;
};

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
  const [securityDepositRD] = useSecurityDepositInfo();
  const error = securityDepositRD.error;
  console.log('>>> error', typeof error, error);

  return (
    <UiPage width="sm">
      <UiLogo />
      <Typography variant="h4" component="h2" mt={4}>
        Create an order to sell IDNA
      </Typography>
      <Stack spacing="1rem" mt={4}>
        <TextField
          {...register('amountToSell')}
          error={Boolean(errors.amountToSell)}
          helperText={errors.amountToSell?.message}
          variant="outlined"
          placeholder="IDNA amount to sell"
          size="small"
        />
        <TextField
          {...register('amountToBuy')}
          error={Boolean(errors.amountToBuy)}
          helperText={errors.amountToBuy?.message}
          variant="outlined"
          placeholder="XDAI amount to buy"
          size="small"
        />
        <TextField
          {...register('secret')}
          error={Boolean(errors.secret)}
          helperText={errors.secret?.message}
          variant="outlined"
          placeholder="Come up with a secret order code"
          size="small"
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
          )) ||
          (rData.isFailure(securityDepositRD) && (
            <UiSubmitButton disabled>Error occurred</UiSubmitButton>
          )) ||
          ((rData.isNotAsked(securityDepositRD) || rData.isLoading(securityDepositRD)) && (
            <UiSubmitButton disabled>Loading...</UiSubmitButton>
          )) ||
          (securityDepositRD.data?.isValid && (
            <UiSubmitButton>Replenish xDai deposit</UiSubmitButton>
          ))}
        {<UiError msg={error?.message || error} />}
      </Stack>
    </UiPage>
  );
};
