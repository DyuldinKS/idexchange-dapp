import { formatEther, isAddress } from 'ethers/lib/utils.js';
import { Transaction } from 'idena-sdk-js';
import { FC, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Stack, TextField, Typography, useTheme } from '@mui/material';
import { waitForTransaction } from '@wagmi/core';

import { useContractsAttributes } from '../hooks/useContractsAttributes';
import { useIdenaSecurityDeposit } from '../hooks/useIdenaSecurityDeposit';
import { useRemoteData, UseRemoteDataReturn } from '../hooks/useRemoteData';
import { useWeb3Store } from '../providers/store/StoreProvider';
import { isAddrEqual } from '../utils/address';
import {
  buildMatchIdenaOrderTx,
  getIdenaLinkToSignTx,
  IdenaOrderState,
  openIdenaAppToSignTx,
  readIdenaOrderState,
} from '../utils/idena';
import {
  canCompleteOrder,
  canMatchCnfOrder,
  canMatchOrder,
  isCnfOrderValid,
} from '../utils/orderControls';
import { rData, RemoteData } from '../utils/remoteData';
import { getColor } from '../utils/theme';
import {
  getSecretFromLogs,
  matchXdaiCnfOrder,
  readXdaiCnfOrder,
  XdaiConfirmedOrder,
} from '../utils/xdai';
import { ConfirmedOrderInfoBlock } from './ConfirmedOrderInfo';
import { IdenaOrderInfoBlock } from './IdenaOrderInfo';
import { IdenaSecurityDeposit } from './IdenaSecurityDeposit';
import { OrderCompletion } from './OrderCompletion';
import { UiError, UiSpan, UiSubmitButton } from './ui';
import { renderWalletRoutineIfNeeded } from './WalletRoutine';
import debug from 'debug';
import { useSearchParams } from 'react-router-dom';
import { BuyerInfoBlock } from './BuyerInfo';

const log = debug('OrderBuyerView');
const logSecret = (...args: any[]) => log('secret', ...args);

export type AddressSchema = z.infer<typeof addressSchema>;

const addressSchema = z.object({
  idenaAddress: z.string().refine((val) => isAddress(val), {
    message: 'Invalid identity address.',
  }),
});

export const OrderBuyerView: FC<{
  secretHash: string;
  orderRD: RemoteData<IdenaOrderState | null>;
  orderRDM: UseRemoteDataReturn<IdenaOrderState | null>[1];
  cnfOrderRD: RemoteData<XdaiConfirmedOrder | null>;
  cnfOrderRDM: UseRemoteDataReturn<XdaiConfirmedOrder | null>[1];
}> = ({ secretHash, orderRD, orderRDM, cnfOrderRD, cnfOrderRDM }) => {
  const [web3Store] = useWeb3Store();
  const contractsAttrsRD = useContractsAttributes();
  const contractsAttrs = contractsAttrsRD.data;
  const order = orderRD.data;
  const cnfOrder = cnfOrderRD.data;
  const [matchOrderTxRD, matchOrderTxRDM] = useRemoteData<Transaction>(null);
  const [matchCnfOrderTxRD, matchCnfOrderTxRDM] = useRemoteData(null);
  const [secretFromLogsRD, secretFromLogsRDM] = useRemoteData<string | null>(null, logSecret);
  const [searchParams, setSearchParams] = useSearchParams();

  const form = useForm<AddressSchema>({
    resolver: zodResolver(addressSchema),
    defaultValues: { idenaAddress: searchParams.get('dnaAddress') || '' },
    mode: 'onChange',
  });
  const {
    register,
    formState: { errors },
    watch,
    setError,
  } = form;

  const idenaAddress = watch('idenaAddress');
  const [securityDepositRD, securityDepositRDM] = useIdenaSecurityDeposit(idenaAddress);

  const theme = useTheme();

  useEffect(() => {
    if (!canCompleteOrder(order, cnfOrder, idenaAddress) || !contractsAttrs) return;

    secretFromLogsRDM.track(
      getSecretFromLogs(
        secretHash,
        contractsAttrs.idena.fulfilPeriod * 2, // expand the window to make sure the fulfilPeriod is covered
      ),
    );
  }, [order, cnfOrder, secretHash, idenaAddress, contractsAttrs]);

  useEffect(() => {
    // ignore invalid address
    const isValidAddress = isAddress(idenaAddress);
    if (idenaAddress && !isValidAddress) return;

    setSearchParams((prev) => {
      // new URLSearchParams([...prev.entries(), ['dnaAddress', idenaAddress]])
      const params = new URLSearchParams(prev);
      if (isValidAddress) {
        params.set('dnaAddress', idenaAddress);
      } else {
        params.delete('dnaAddress');
      }
      return params;
    });
  }, [idenaAddress]);

  useEffect(() => {
    if (!form.getValues('idenaAddress')) {
      setError('idenaAddress', { message: 'Paste your identity address.' }, { shouldFocus: true });
    }
  }, []);

  const renderOrderControls = () => {
    if (rData.isNotAsked(orderRD) || rData.isLoading(orderRD) || !contractsAttrs)
      return 'Loading...';
    if (rData.isFailure(orderRD)) return <UiError err={orderRD.error} />;

    if (!order) return 'The order has already been completed, cancelled, or never existed.';

    // TODO: compare idenaAddress with order.owner

    const buildMatchOrderTx = async (
      evt: React.BaseSyntheticEvent,
    ): Promise<Transaction | null> => {
      return new Promise((resolve) => {
        form
          .handleSubmit(({ idenaAddress }) => {
            const txPromise = buildMatchIdenaOrderTx(idenaAddress, secretHash);
            matchOrderTxRDM.track(txPromise);
            resolve(txPromise);
          })(evt)
          .catch((err) => {
            console.warn('buildMatchOrderTx caught', err);
            resolve(null);
          });
      });
    };

    const buildMatchOrderTxAndSign = async (evt: React.BaseSyntheticEvent) => {
      return buildMatchOrderTx(evt).then((tx) => tx && openIdenaAppToSignTx(tx));
    };

    if (!order.matcher) {
      if (!rData.isSuccess(matchOrderTxRD)) {
        return (
          <UiSubmitButton
            disabled={
              !securityDepositRD.data?.isValid ||
              !canMatchOrder(order, cnfOrder, contractsAttrs.idena) ||
              !isCnfOrderValid(order, cnfOrder, contractsAttrs.xdai) ||
              isAddrEqual(order.owner, idenaAddress)
            }
            onClick={buildMatchOrderTxAndSign}
          >
            Book order
          </UiSubmitButton>
        );
      }

      return (
        // TODO: move to IdenaTxLinkRoutine component
        <>
          <Typography color={getColor.textGrey(theme)}>
            Click{' '}
            <Link href={getIdenaLinkToSignTx(matchOrderTxRD.data)} target="_blank">
              this link
            </Link>{' '}
            if Idena App did not open automatically. Wait for the transaction to complete, then
            reload order state.
          </Typography>
          <UiSubmitButton
            sx={{ mt: 2 }}
            onClick={() => {
              orderRDM.track(readIdenaOrderState(secretHash));
            }}
          >
            Reload order
          </UiSubmitButton>
        </>
      );
    }

    // TODO: compare idenaAddress with order.matcher

    return (
      <OrderCompletion
        order={order}
        cnfOrder={cnfOrder}
        idenaAddress={idenaAddress}
        secret={secretFromLogsRD.data}
        secretHash={secretHash}
        onComplete={() => {
          orderRDM.track(readIdenaOrderState(secretHash));
        }}
      />
    );
  };

  const renderCnfOrderControls = () => {
    if (rData.isNotAsked(cnfOrderRD) || rData.isLoading(cnfOrderRD) || !contractsAttrs)
      return 'Loading...';

    const error = cnfOrderRD.error;
    if (error) return <UiError err={error} />;

    if (!cnfOrder)
      return 'The order confirmation has already been completed, cancelled, or never existed.';
    if (!isCnfOrderValid(order, cnfOrder, contractsAttrs.xdai))
      return <UiError>Invalid confirmation, it is impossible to buy iDNA.</UiError>;

    if (cnfOrder.matcher && !isAddrEqual(web3Store.address || '', cnfOrder.matcher))
      return (
        <UiError
          msg={
            <UiSpan>
              You are not an owner of this order. Switch account to{' '}
              <UiSpan fontWeight={600}>{cnfOrder.owner}</UiSpan>
            </UiSpan>
          }
        />
      );

    if (cnfOrder.matcher) {
      return (
        <UiSpan color={theme.palette.secondary.dark}>{`${formatEther(
          cnfOrder.amountXDAI,
        )} xDAI deposited successfully! Wait for the owner to complete the order, after which you can proceed to claim iDNA.`}</UiSpan>
      );
    }

    const matchCnfOrderAndReload = () =>
      matchCnfOrderTxRDM
        .track(
          matchXdaiCnfOrder(secretHash, cnfOrder.amountXDAI).then(
            (tx) => tx && waitForTransaction({ hash: tx.hash }),
          ),
        )
        .then(() => cnfOrderRDM.track(readXdaiCnfOrder(secretHash)));

    return (
      <>
        <UiSubmitButton
          disabled={
            !isCnfOrderValid(order, cnfOrder, contractsAttrs.xdai) ||
            !canMatchCnfOrder(order, cnfOrder, contractsAttrs.idena)
          }
          onClick={matchCnfOrderAndReload}
        >{`Send ${formatEther(cnfOrder.amountXDAI)} xDAI`}</UiSubmitButton>
        <UiError mt={1} err={matchCnfOrderTxRD.error} />
      </>
    );
  };

  return (
    <Stack alignItems="stretch" mt={4}>
      <Stack spacing={2}>
        <TextField
          {...register('idenaAddress')}
          error={Boolean(errors.idenaAddress)}
          helperText={errors.idenaAddress?.message}
          placeholder="Your Idena address"
          fullWidth
          size="small"
        />
        <IdenaSecurityDeposit
          securityDepositRD={securityDepositRD}
          securityDepositRDM={securityDepositRDM}
          form={form}
          showAlreadyUsedError={Boolean(
            rData.isSuccess(securityDepositRD) &&
              securityDepositRD.data.isInUse &&
              order &&
              idenaAddress &&
              !isAddrEqual(order.matcher || '', idenaAddress),
          )}
        />
        <BuyerInfoBlock />
        <IdenaOrderInfoBlock title="Idena chain" order={orderRD.data} secretHash={secretHash}>
          {renderOrderControls()}
        </IdenaOrderInfoBlock>
        {renderWalletRoutineIfNeeded(web3Store) || (
          <ConfirmedOrderInfoBlock
            isValid={
              contractsAttrs && isCnfOrderValid(orderRD.data, cnfOrderRD.data, contractsAttrs.xdai)
            }
            title="Confirmation in Gnosis chain"
            order={cnfOrderRD.data}
          >
            {renderCnfOrderControls()}
          </ConfirmedOrderInfoBlock>
        )}
      </Stack>
    </Stack>
  );
};
