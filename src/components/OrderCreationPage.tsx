import debug from 'debug';
import { formatUnits } from 'ethers/lib/utils.js';
import { FC } from 'react';
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
import {
  SecurityDepositInfoType,
  useGetSecurityDepositInfo,
} from '../hooks/useSecurityDepositInfo';
import { useWeb3Store } from '../providers/store/StoreProvider';
import { rData, RemoteData, RemoteDataSuccess } from '../utils/remoteData';
import { DEFAULT_CHAIN_ID, isChainSupported, web3Modal } from '../utils/web3Modal';
import { UiError, UiLogo, UiPage, UiSubmitButton } from './ui';
import { SecurityDepositInfo } from './SecurityDepositInfo';

export type OrderCreationFormSchema = z.infer<typeof orderCreationFormSchema>;

const orderCreationFormSchema = z.object({
  amountToSell: z
    .string()
    .refine((arg) => Number(arg) > 0, { message: 'should be a positive number' }),
  amountToReceive: z
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
      amountToReceive: '',
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
  const [depositChangeRD, depositChangeRDApi] = useRemoteData(null);
  const error = securityDepositRD.error || depositChangeRD.error;
  console.log('>>> error', typeof error, error);
  console.log('>>> sec deposit', securityDepositRD);

  const renderSecurityDepositBlock = () => {
    if (rData.isNotAsked(securityDepositRD) || rData.isLoading(securityDepositRD))
      return <UiSubmitButton disabled>Loading...</UiSubmitButton>;

    if (!rData.isSuccess(securityDepositRD))
      return <UiSubmitButton disabled>Error occurred</UiSubmitButton>;

    const { isInUse } = securityDepositRD.data;

    const depositInfo = <SecurityDepositInfo {...securityDepositRD.data} />;

    if (isInUse)
      return (
        <>
          {depositInfo}
          <UiSubmitButton disabled={true}>Wait for the end of your previous order</UiSubmitButton>
        </>
      );

    const contractInfo = {
      chainId: gnosis.id,
      address: CONTRACTS[gnosis.id].receiveXdai,
      abi: abiToReceiveXdai,
    };

    const replenishDeposit = () => {
      const processTx = async () => {
        const txConfig = await prepareWriteContract({
          ...contractInfo,
          functionName: 'submitSecurityDeposit',
          overrides: {
            value: securityDepositRD.data.requiredAmount,
          },
        });
        log('replenishDeposit txConfig', txConfig);
        const tx = await writeContract(txConfig);
        await waitForTransaction({ hash: tx.hash });
        await reloadSecurityDeposit();
      };

      depositChangeRDApi.track(processTx().then(reloadSecurityDeposit));
    };

    const withdrawDeposit = () => {
      const processTx = async () => {
        const txConfig = await prepareWriteContract({
          ...contractInfo,
          functionName: 'withdrawSecurityDeposit',
        });
        log('withdrawDeposit txConfig', txConfig);
        const tx = await writeContract(txConfig);
        await waitForTransaction({ hash: tx.hash });
        await reloadSecurityDeposit();
      };

      depositChangeRDApi.track(processTx().then(reloadSecurityDeposit));
    };

    if (rData.isLoading(depositChangeRD))
      return (
        <>
          {depositInfo}
          <UiSubmitButton disabled>Updating deposit...</UiSubmitButton>
        </>
      );

    if (!securityDepositRD.data?.isValid)
      return (
        <>
          {depositInfo}
          <UiSubmitButton onClick={replenishDeposit}>
            {`Replenish deposit for ${formatUnits(
              securityDepositRD.data.requiredAmount,
              gnosis.nativeCurrency.decimals,
            )} xDai`}
          </UiSubmitButton>
        </>
      );

    return (
      <>
        {depositInfo}
        <UiSubmitButton variant="outlined" onClick={withdrawDeposit}>
          Withdraw deposit
        </UiSubmitButton>
      </>
    );
  };

  const createOrderToSellBlock = () => {
    return (
      <>
        <UiSubmitButton onClick={() => {}}>Create order to sell IDNA</UiSubmitButton>
      </>
    );
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
          {...register('amountToReceive')}
          error={Boolean(errors.amountToReceive)}
          helperText={errors.amountToReceive?.message}
          variant="outlined"
          placeholder="XDAI amount to receive"
          size="small"
        />
        <TextField
          {...register('secret')}
          error={Boolean(errors.secret)}
          helperText={errors.secret?.message}
          variant="outlined"
          placeholder="A secret code to identify the order"
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
          )) || (
            <>
              {renderSecurityDepositBlock()}
              {rData.isSuccess(securityDepositRD) &&
                securityDepositRD.data.isValid &&
                createOrderToSellBlock()}
            </>
          )}
        {<UiError msg={error?.message || error} />}
      </Stack>
    </UiPage>
  );
};
