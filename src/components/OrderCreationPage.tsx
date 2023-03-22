import debug from 'debug';
import { formatUnits } from 'ethers/lib/utils.js';
import { FC, useState } from 'react';
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
import '../utils/idena';
import { generateRandomSecret, hashSecret } from '../utils/idena';
import { ethers } from 'ethers';

export type OrderCreationFormSchema = z.infer<typeof orderCreationFormSchema>;

const orderCreationFormSchema = z.object({
  amountToSell: z
    .string()
    .refine((arg) => Number(arg) > 0, { message: 'Should be a positive number' }),
  amountToReceive: z
    .string()
    .refine((arg) => Number(arg) > 0, { message: 'Should be a positive number' }),
  idenaAddress: z
    .string()
    .refine((val) => ethers.utils.isAddress(val), { message: 'Invalid Idena address' }),
});

const log = debug('OrderCreationPage');

export const OrderCreationPage = () => {
  const form = useForm<OrderCreationFormSchema>({
    resolver: zodResolver(orderCreationFormSchema),
    defaultValues: {
      amountToSell: '',
      amountToReceive: '',
      idenaAddress: '',
      // secret: generateRandomSecret(),
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
  const [depositChangeRD, depositChangeRDM] = useRemoteData(null);
  const error = securityDepositRD.error || depositChangeRD.error;
  const [secret] = useState(generateRandomSecret);
  const [hash] = useState(() => hashSecret(secret));
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

      depositChangeRDM.track(processTx().then(reloadSecurityDeposit));
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

      depositChangeRDM.track(processTx().then(reloadSecurityDeposit));
    };

    if (rData.isLoading(depositChangeRD))
      return (
        <>
          {depositInfo}
          <UiSubmitButton disabled>Updating xDai deposit...</UiSubmitButton>
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
          Withdraw xDai deposit
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
          {...register('idenaAddress')}
          error={Boolean(errors.idenaAddress)}
          helperText={errors.idenaAddress?.message}
          variant="outlined"
          placeholder="Your Idena identity address"
          size="small"
        />
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

        <Typography>
          A secret code has been automatically generated for your order, which you must copy and
          securely store. Losing this code would prevent you from either completing or canceling
          your order, resulting in the loss of your funds.
        </Typography>
        <TextField
          disabled={true} // prevent auto-generated secret from changing
          variant="outlined"
          placeholder="A secret code to identify the order"
          size="small"
          multiline={true}
          value={secret}
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
