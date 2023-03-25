import debug from 'debug';
import { FC, ReactNode, useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

import { Button, Link, Stack, Typography } from '@mui/material';

import { useRemoteData, UseRemoteDataReturn } from '../hooks/useRemoteData';
import { mapRejected } from '../utils/async';
import {
  buildCreateIdenaOrderTx,
  buildBurnIdenaOrderTx,
  getIdenaLinkToSignTx,
  getIdnaOrderState,
  getSecretHash,
  IdnaOrderState,
} from '../utils/idena';
import { rData } from '../utils/remoteData';
import { getColor, theme } from '../utils/theme';
import { IdenaOrderInfoBlock } from './IdenaOrderInfo';
import { OrderCreationFormSchema } from './OrderCreationPage';
import { UiError, UiSubmitButton } from './ui';
import { Transaction } from 'idena-sdk-js';

const log = debug('IdenaOrderCreation');

export const IdenaOrderCreation: FC<{
  idenaOrderRDState: UseRemoteDataReturn<IdnaOrderState>;
  form: UseFormReturn<OrderCreationFormSchema>;
  secretHash: string;
}> = ({ idenaOrderRDState: [idenaOrderRD, idenaOrderRDM], form: { handleSubmit }, secretHash }) => {
  const [createOrderTxRD, createOrderTxRDM] = useRemoteData<Transaction>(null);
  const [burnOrderTxRD, burnOrderTxRDM] = useRemoteData<Transaction>(null);
  const [isIdenaTxLinkClicked, setIsIdenaTxLinkClicked] = useState(false);
  const error = idenaOrderRD.error || createOrderTxRD.error;
  const orderInfo = idenaOrderRD.data;

  useEffect(() => {
    reloadOrderState();
  }, [secretHash]);

  const reloadOrderState = async () => {
    idenaOrderRDM.track(
      getIdnaOrderState(secretHash).catch(
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
      {error && <UiError msg={error?.message || String(error)} />}
    </IdenaOrderInfoBlock>
  );

  const buildCreateOrderTx = (evt: React.BaseSyntheticEvent): Promise<Transaction | null> => {
    idenaOrderRDM.setNotAsked();
    return new Promise((resolve) => {
      setIsIdenaTxLinkClicked(false);
      handleSubmit((values) => {
        log('generate tx link to create order', values);
        const { idenaAddress, amountToSell, amountToReceive } = values;
        const txPromise = buildCreateIdenaOrderTx(
          idenaAddress,
          amountToSell,
          amountToReceive,
          secretHash,
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
      console.log('try to sign tx', createOrderTxRD, tx);
      if (tx) {
        console.log('open window to sign tx');
        window.open(getIdenaLinkToSignTx(tx), '_blank')?.focus();
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
          Create order in Idena chain
        </UiSubmitButton>
      </>,
    );
  }

  if (rData.isLoading(idenaOrderRD)) {
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
