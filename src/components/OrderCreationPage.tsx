import debug from 'debug';
import { formatUnits } from 'ethers/lib/utils.js';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, TextField, Tooltip, Typography } from '@mui/material';
import {
  prepareWriteContract,
  switchNetwork,
  waitForTransaction,
  writeContract,
} from '@wagmi/core';
import { gnosis } from '@wagmi/core/chains';

import abiToReceiveXdai from '../abi/idena-atomic-dex-gnosis.json';
import { CONTRACTS } from '../constants/contracts';
import { useRemoteData } from '../hooks/useRemoteData';
import { useGetSecurityDepositInfo } from '../hooks/useSecurityDepositInfo';
import { useWeb3Store } from '../providers/store/StoreProvider';
import { rData } from '../utils/remoteData';
import { DEFAULT_CHAIN_ID, isChainSupported, web3Modal } from '../utils/web3Modal';
import { UiError, UiLogo, UiPage, UiSubmitButton } from './ui';

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

const log = debug('OrderCreationPage');

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
  const {
    rData: [securityDepositRD],
    reloadSecurityDeposit,
  } = useGetSecurityDepositInfo(CONTRACTS[gnosis.id].receiveXdai, abiToReceiveXdai);
  const [submitDepositRD, submitDepositRDApi] = useRemoteData(null);
  const error = securityDepositRD.error || submitDepositRD.error;
  console.log('>>> error', typeof error, error);
  console.log('>>> sec deposit', securityDepositRD);

  const renderSecurityDepositBlock = () => {
    if (rData.isNotAsked(securityDepositRD) || rData.isLoading(securityDepositRD))
      return <UiSubmitButton disabled>Loading...</UiSubmitButton>;

    if (!rData.isSuccess(securityDepositRD))
      return <UiSubmitButton disabled>Error occurred</UiSubmitButton>;

    const { isInUse } = securityDepositRD.data;

    const commonInfo = (
      <Stack alignItems="start">
        <Typography>{`Current security deposit: ${formatUnits(
          securityDepositRD.data.amount,
          gnosis.nativeCurrency.decimals,
        )}`}</Typography>
        {securityDepositRD.data.amount.gt(0) && (
          <Tooltip
            placement="top-start"
            title={
              <>
                Shows if your deposit is already being used to confirm another order. If it is true,
                you will need to wait until your previous order is complete or use a different
                account to create a new order.
              </>
            }
          >
            <Typography>{`Already in use: ${isInUse} (?)`}</Typography>
          </Tooltip>
        )}
      </Stack>
    );

    if (isInUse)
      return (
        <>
          {commonInfo}
          <UiSubmitButton disabled={true}>Wait for the end of your previous order</UiSubmitButton>
        </>
      );

    const replenishDeposit = () => {
      const callSubmitDeposit = async () => {
        const txConfig = await prepareWriteContract({
          chainId: gnosis.id,
          address: CONTRACTS[gnosis.id].receiveXdai,
          abi: abiToReceiveXdai,
          functionName: 'submitSecurityDeposit',
          overrides: {
            value: securityDepositRD.data.requiredAmount,
          },
        });
        log('replenishDeposit txConfig', txConfig);
        const tx = await writeContract(txConfig);
        console.log('>>> tx', tx);
        const { hash } = tx;
        const data = await waitForTransaction({ hash });
        console.log('>>> data', data);
        await reloadSecurityDeposit();
      };

      submitDepositRDApi.track(callSubmitDeposit());
    };

    if (rData.isLoading(submitDepositRD))
      return (
        <>
          {commonInfo}
          <UiSubmitButton disabled>Loading...</UiSubmitButton>
        </>
      );

    if (!securityDepositRD.data?.isValid)
      return (
        <>
          {commonInfo}
          <UiSubmitButton onClick={replenishDeposit}>
            {`Replenish deposit for ${formatUnits(
              securityDepositRD.data.requiredAmount,
              gnosis.nativeCurrency.decimals,
            )} xDai`}
          </UiSubmitButton>
        </>
      );

    return null;
  };

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
          placeholder="XDAI amount to receive"
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
          renderSecurityDepositBlock()}
        {<UiError msg={error?.message || error} />}
      </Stack>
    </UiPage>
  );
};
