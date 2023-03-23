import debug from 'debug';
import { ethers } from 'ethers';
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, TextField, Typography } from '@mui/material';
import { switchNetwork } from '@wagmi/core';
import { gnosis } from '@wagmi/core/chains';

import abiToReceiveXdai from '../abi/idena-atomic-dex-gnosis.json';
import { CONTRACTS } from '../constants/contracts';
import { useRemoteData } from '../hooks/useRemoteData';
import { useGetSecurityDepositInfo } from '../hooks/useSecurityDepositInfo';
import { useWeb3Store } from '../providers/store/StoreProvider';
import { IdnaOrderState, MIN_IDNA_AMOUNT_TO_SELL } from '../utils/idena';
import { rData } from '../utils/remoteData';
import { DEFAULT_CHAIN_ID, isChainSupported, web3Modal } from '../utils/web3Modal';
import { IdenaOrderCreation } from './IdenaOrderCreation';
import { SecurityDeposit } from './SecurityDeposit';
import { UiLabel, UiLogo, UiPage, UiSubmitButton } from './ui';

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
  const form = useForm<OrderCreationFormSchema>({
    resolver: zodResolver(orderCreationFormSchema),
    defaultValues: {
      // amountToSell: '',
      // amountToReceive: '',
      // idenaAddress: '',
      amountToSell: '101',
      amountToReceive: '2.2',
      idenaAddress: '0x75d6cE9A43A681BD21B79ccB148C07DA65345072',
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
  const idenaOrderRDState = useRemoteData<IdnaOrderState>(null);
  const [idenaOrderRD, idenaOrderRDM] = idenaOrderRDState;
  const isOrderSuccessfullyCreated = rData.isSuccess(idenaOrderRD);

  // const [secret] = useState(generateRandomSecret);
  const secret = '0x58cc7a0588b09d10a2874f6e50dceed3fcb3580de658767b09fbd93c71a5bff2';

  const renderXdaiOrderBlock = () => {
    return (
      <UiSubmitButton
        onClick={() => {
          // TODO: to be implemented
        }}
      >
        Create order to receive xDAI
      </UiSubmitButton>
    );
  };

  return (
    <UiPage width="sm">
      <UiLogo />
      <Typography variant="h4" component="h2" mt={4} fontWeight="bold">
        Create an order to sell iDNA for xDAI
      </Typography>
      <Stack spacing="1rem" mt={4}>
        <TextField
          {...register('idenaAddress')}
          disabled={isSubmitting || isOrderSuccessfullyCreated}
          error={Boolean(errors.idenaAddress)}
          helperText={errors.idenaAddress?.message}
          variant="outlined"
          placeholder="Your address in Idena chain"
          size="small"
        />
        <TextField
          {...register('amountToSell')}
          disabled={isSubmitting || isOrderSuccessfullyCreated}
          error={Boolean(errors.amountToSell)}
          helperText={errors.amountToSell?.message}
          variant="outlined"
          placeholder="iDNA amount to sell"
          size="small"
        />
        <TextField
          {...register('amountToReceive')}
          disabled={isSubmitting || isOrderSuccessfullyCreated}
          error={Boolean(errors.amountToReceive)}
          helperText={errors.amountToReceive?.message}
          variant="outlined"
          placeholder="xDAI amount to receive"
          size="small"
        />
      </Stack>
      <Stack>
        <UiLabel
          mt={4}
          label="Secret code"
          tooltip="A secret code has been automatically generated for your order, which you must copy and
          securely store. Losing this code would prevent you from either completing or canceling
          your order, resulting in the loss of your funds."
        >
          <TextField
            disabled={true} // prevent auto-generated secret from changing
            variant="outlined"
            placeholder="A secret code to identify the order"
            size="small"
            multiline={true}
            value={secret}
          />
        </UiLabel>
        <Stack alignItems="stretch" mt={4}>
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
                {
                  <SecurityDeposit
                    state={securityDepositRD}
                    reloadSecurityDeposit={reloadSecurityDeposit}
                    isWithdrawDisabled={isOrderSuccessfullyCreated}
                  />
                }
                {rData.isSuccess(securityDepositRD) && securityDepositRD.data.isValid && (
                  <Stack alignItems="stretch" mt={2}>
                    <IdenaOrderCreation
                      idenaOrderRDState={idenaOrderRDState}
                      form={form}
                      secret={secret}
                    />
                  </Stack>
                )}
                {isOrderSuccessfullyCreated && renderXdaiOrderBlock()}
              </>
            )}
        </Stack>
      </Stack>
    </UiPage>
  );
};
