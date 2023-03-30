import debug from 'debug';
import { Transaction } from 'idena-sdk-js';
import { FC, ReactNode, useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

import { Link, Stack, Typography } from '@mui/material';

import { useRemoteData, UseRemoteDataReturn } from '../hooks/useRemoteData';
import { mapRejected } from '../utils/async';
import {
  buildCreateIdenaOrderTx,
  getIdenaLinkToSignTx,
  readIdenaOrderState,
  IdenaOrderState,
  openIdenaAppToSignTx,
} from '../utils/idena';
import { rData } from '../utils/remoteData';
import { getColor, theme } from '../utils/theme';
import { IdenaOrderInfoBlock } from './IdenaOrderInfo';
import { OrderCreationFormSchema } from './OrderCreationPage';
import { UiError, UiSubmitButton } from './ui';
import { getOrderMinTTL } from '../utils/orderControls';
import { useContractsAttributes } from '../hooks/useContractsAttributes';
import { useWeb3Store } from '../providers/store/StoreProvider';

const log = debug('IdenaOrderCreation');

export const IdenaOrderCreation: FC<{
  idenaOrderRD: UseRemoteDataReturn<IdenaOrderState | null>[0];
  idenaOrderRDM: UseRemoteDataReturn<IdenaOrderState | null>[1];
  form: UseFormReturn<OrderCreationFormSchema>;
  secretHash: string;
}> = ({ idenaOrderRD, idenaOrderRDM, form: { handleSubmit }, secretHash }) => {
  const [{ address }] = useWeb3Store();
  const [createOrderTxRD, createOrderTxRDM] = useRemoteData<Transaction>(null);
  const contractsAttrsRD = useContractsAttributes();
  const error = idenaOrderRD.error || createOrderTxRD.error || contractsAttrsRD.error;
  const orderInfo = idenaOrderRD.data;

  useEffect(() => {
    reloadOrderState();
  }, [secretHash]);

  const reloadOrderState = async () => {
    idenaOrderRDM.track(
      readIdenaOrderState(secretHash).catch(
        mapRejected((err: any) => {
          console.error('Failed to load order state:', err);
          return err;
        }),
      ),
    );
  };

  const renderIdenaOrderInfo = (children: ReactNode) => (
    <IdenaOrderInfoBlock title="Order in Idena chain" order={orderInfo} secretHash={secretHash}>
      {children}
      {error && <UiError err={error} />}
    </IdenaOrderInfoBlock>
  );

  const buildCreateOrderTx = (evt: React.BaseSyntheticEvent): Promise<Transaction | null> => {
    idenaOrderRDM.setNotAsked();
    return new Promise((resolve) => {
      if (!contractsAttrsRD.data || !address)
        return createOrderTxRDM.setFailure('No contracts info or wallet address');

      handleSubmit((values) => {
        log('generate tx link to create order', values);
        const { idenaAddress, amountToSell, amountToReceive } = values;
        const orderMinTTL = getOrderMinTTL(contractsAttrsRD.data.idena, contractsAttrsRD.data.xdai);
        log('handleSubmit', values, { orderMinTTL });
        const txPromise = buildCreateIdenaOrderTx(
          idenaAddress,
          amountToSell,
          amountToReceive,
          address,
          secretHash,
          orderMinTTL,
        );
        createOrderTxRDM.track(txPromise);
        resolve(txPromise);
      })(evt).catch((err) => {
        console.warn('buildCreateOrderTx caught', err);
        resolve(null);
      });
    });
  };

  const buildOrderTxAndSign = (evt: React.BaseSyntheticEvent) => {
    buildCreateOrderTx(evt).then((tx: Transaction | null) => {
      if (tx) {
        openIdenaAppToSignTx(tx);
      }
    });
  };

  if (rData.isNotAsked(createOrderTxRD) && orderInfo) {
    return renderIdenaOrderInfo(<UiError msg="Order with this id (secret hash) already exists." />);
  }

  if (rData.isLoading(createOrderTxRD)) {
    return renderIdenaOrderInfo(<UiSubmitButton disabled={true}>Creating order...</UiSubmitButton>);
  }

  if (!rData.isSuccess(createOrderTxRD)) {
    return renderIdenaOrderInfo(
      <>
        <Typography color={getColor.textGrey(theme)}>
          To create an order you need to sign transaction in Idena App:
        </Typography>
        <UiSubmitButton
          sx={{ mt: 1 }}
          disabled={rData.isLoading(createOrderTxRD)}
          onClick={buildOrderTxAndSign}
        >
          Create order
        </UiSubmitButton>
      </>,
    );
  }

  if (rData.isLoading(idenaOrderRD) || rData.isLoading(contractsAttrsRD)) {
    return renderIdenaOrderInfo(
      <UiSubmitButton disabled={true}>Loading order info...</UiSubmitButton>,
    );
  }

  if (rData.isSuccess(idenaOrderRD) && orderInfo) {
    return renderIdenaOrderInfo(null);
  }

  return renderIdenaOrderInfo(
    <Stack>
      <Typography color={getColor.textGrey(theme)}>
        Click{' '}
        <Link href={getIdenaLinkToSignTx(createOrderTxRD.data)} target="_blank">
          this link
        </Link>{' '}
        if Idena App did not open automatically. Wait for the transaction to complete, then load the
        order data to continue.
      </Typography>
      <UiSubmitButton sx={{ mt: 2 }} onClick={reloadOrderState}>
        {rData.isSuccess(idenaOrderRD) && !orderInfo
          ? 'Order not found. Try again.'
          : 'Check order status'}
      </UiSubmitButton>
      <Typography mt={2} color={getColor.textGrey(theme)}>
        If something wrong you can try to{' '}
        <Link sx={{ cursor: 'pointer' }} onClick={buildOrderTxAndSign}>
          regenerate
        </Link>{' '}
        the order creation transaction and sign it again.
      </Typography>
    </Stack>,
  );
};
