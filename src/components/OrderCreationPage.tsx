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
import { useGetSecurityDepositInfo } from '../hooks/useSecurityDepositInfo';
import { useWeb3Store } from '../providers/store/StoreProvider';
import { rData } from '../utils/remoteData';
import { DEFAULT_CHAIN_ID, isChainSupported, web3Modal } from '../utils/web3Modal';
import { UiError, UiLogo, UiPage, UiSubmitButton } from './ui';
import { SecurityDepositInfo } from './SecurityDepositInfo';
import '../utils/idena';
import {
  createOrderToSellIdnaTx,
  generateRandomSecret,
  getIdenaLinkToSignTx,
  getIdnaOrderState,
  getSecretHash,
  IdnaOrderState,
  MIN_IDNA_AMOUNT_TO_SELL,
} from '../utils/idena';
import { ethers } from 'ethers';
import { mapRejected } from '../utils/async';

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
      amountToSell: '',
      amountToReceive: '',
      idenaAddress: '',
      // amountToSell: '101',
      // amountToReceive: '2.2',
      // idenaAddress: '0x75d6cE9A43A681BD21B79ccB148C07DA65345072',
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
  const [idenaTxLinkRD, idenaTxLinkRDM] = useRemoteData<string>(null);
  const [isIdenaTxLinkClicked, setIsIdenaTxLinkClicked] = useState(false);
  const [idenaOrderRD, idenaOrderRDM] = useRemoteData<IdnaOrderState>(null);
  const isOrderSuccessfullyCreated = rData.isSuccess(idenaOrderRD);

  const [secret] = useState(generateRandomSecret);
  // const secret = '0x58cc7a0588b09d10a2874f6e50dceed3fcb3580de658767b09fbd93c71a5bff2';
  const [secretHash] = useState(() => getSecretHash(secret));

  const error = securityDepositRD.error || depositChangeRD.error || idenaTxLinkRD.error;

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
          <UiSubmitButton disabled>Updating xDAI deposit...</UiSubmitButton>
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
            )} xDAI`}
          </UiSubmitButton>
        </>
      );

    if (!isOrderSuccessfullyCreated) {
      return (
        <>
          {depositInfo}
          <UiSubmitButton color="error" variant="outlined" onClick={withdrawDeposit}>
            Withdraw xDAI deposit
          </UiSubmitButton>
        </>
      );
    }

    return depositInfo;
  };

  const renderIdnaOrderBlock = () => {
    if (isOrderSuccessfullyCreated) {
      return (
        <Stack>
          <Typography>Order successfully created!</Typography>
          <Typography>Expiration block {idenaOrderRD.data.expirationBlock}</Typography>
        </Stack>
      );
    }

    const generateTxLink = () => {
      setIsIdenaTxLinkClicked(false);
      handleSubmit((values) => {
        log('generate tx link to create order', values);
        const { idenaAddress, amountToSell, amountToReceive } = values;
        const promisedLink = createOrderToSellIdnaTx(
          idenaAddress,
          amountToSell,
          amountToReceive,
          secret,
        ).then(getIdenaLinkToSignTx);
        idenaTxLinkRDM.track(promisedLink);
        return promisedLink;
      })().catch(() => {});
    };

    if (!rData.isSuccess(idenaTxLinkRD)) {
      return (
        <>
          <UiSubmitButton disabled={rData.isLoading(idenaTxLinkRD)} onClick={generateTxLink}>
            Prepare order to sell iDNA
          </UiSubmitButton>
        </>
      );
    }

    const regenerateOrderBtn = (
      <UiSubmitButton
        variant="outlined"
        disabled={rData.isLoading(idenaTxLinkRD)}
        onClick={generateTxLink}
      >
        Regenerate order to sell iDNA
      </UiSubmitButton>
    );

    if (!isIdenaTxLinkClicked) {
      return (
        <>
          {regenerateOrderBtn}
          <UiSubmitButton
            onClick={() => setIsIdenaTxLinkClicked(true)}
            LinkComponent="a"
            href={idenaTxLinkRD.data}
            {...{ target: '_blank' }}
          >
            Sign order creation transaction
          </UiSubmitButton>
        </>
      );
    }

    const checkOrderState = async () => {
      idenaOrderRDM.track(
        getIdnaOrderState(secretHash).catch(
          mapRejected((err: any) => {
            console.error('Failed to load order state:', err);
            return err;
          }),
        ),
      );
    };

    return (
      <>
        {regenerateOrderBtn}
        <Stack>
          <Typography>Wait for the transaction to complete:</Typography>
          <UiSubmitButton sx={{ mt: 1 }} onClick={checkOrderState}>
            Check order status
          </UiSubmitButton>
        </Stack>
      </>
    );
  };

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
      <Typography variant="h4" component="h2" mt={4}>
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
          placeholder="XDAI amount to receive"
          size="small"
        />
        <Stack>
          <Tooltip
            placement="top-start"
            title="A secret code has been automatically generated for your order, which you must copy and
          securely store. Losing this code would prevent you from either completing or canceling
          your order, resulting in the loss of your funds."
          >
            <Typography>Secret code (?)</Typography>
          </Tooltip>
          <TextField
            sx={{ mt: 1 }}
            disabled={true} // prevent auto-generated secret from changing
            variant="outlined"
            placeholder="A secret code to identify the order"
            size="small"
            multiline={true}
            value={secret}
          />
        </Stack>
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
                renderIdnaOrderBlock()}
              {isOrderSuccessfullyCreated && renderXdaiOrderBlock()}
            </>
          )}
        {<UiError msg={error?.message || error} />}
      </Stack>
    </UiPage>
  );
};
