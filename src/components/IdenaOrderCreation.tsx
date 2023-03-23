import debug from 'debug';
import { FC, ReactNode, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

import { Stack, Typography } from '@mui/material';

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
import { theme } from '../utils/theme';
import { IdenaOrderInfoBlock } from './IdenaOrderInfo';
import { OrderCreationFormSchema } from './OrderCreationPage';
import { UiError, UiSubmitButton } from './ui';
import { Transaction } from 'idena-sdk-js';

const log = debug('IdenaOrderCreation');

export const IdenaOrderCreation: FC<{
  idenaOrderRDState: UseRemoteDataReturn<IdnaOrderState>;
  form: UseFormReturn<OrderCreationFormSchema>;
  secret: string;
}> = ({ idenaOrderRDState: [idenaOrderRD, idenaOrderRDM], form: { handleSubmit }, secret }) => {
  const [createOrderTxRD, createOrderTxRDM] = useRemoteData<Transaction>(null);
  const [burnOrderTxRD, burnOrderTxRDM] = useRemoteData<Transaction>(null);
  const [isIdenaTxLinkClicked, setIsIdenaTxLinkClicked] = useState(false);
  const [secretHash] = useState(() => getSecretHash(secret));
  const error = idenaOrderRD.error || createOrderTxRD.error;

  const renderIdenaOrderInfo = (children: ReactNode) => (
    <IdenaOrderInfoBlock order={idenaOrderRD.data}>
      {children}
      {error && <UiError msg={error?.message || String(error)} />}
    </IdenaOrderInfoBlock>
  );

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

  if (rData.isSuccess(idenaOrderRD)) {
    const buildBurnOrderTx = () => {
      setIsIdenaTxLinkClicked(false);
      handleSubmit(({ idenaAddress }) => {
        log('generate tx link to burn order');
        burnOrderTxRDM.track(buildBurnIdenaOrderTx(idenaAddress, secretHash));
      })().catch(() => {});
    };

    return renderIdenaOrderInfo(
      <Stack spacing={1}>
        <UiSubmitButton sx={{ mt: 1 }} variant="outlined" onClick={checkOrderState}>
          Reload order info
        </UiSubmitButton>
        {Date.now() > idenaOrderRD.data.expirationAt &&
          (!rData.isSuccess(burnOrderTxRD) ? (
            <UiSubmitButton disabled={rData.isLoading(burnOrderTxRD)} onClick={buildBurnOrderTx}>
              Cancel order
            </UiSubmitButton>
          ) : (
            <UiSubmitButton
              onClick={() => setIsIdenaTxLinkClicked(true)}
              LinkComponent="a"
              href={getIdenaLinkToSignTx(burnOrderTxRD.data)}
              {...{ target: '_blank' }}
            >
              Sign burning order transaction
            </UiSubmitButton>
          ))}
      </Stack>,
    );
  }

  const buildCreateOrderTx = () => {
    setIsIdenaTxLinkClicked(false);
    handleSubmit((values) => {
      log('generate tx link to create order', values);
      const { idenaAddress, amountToSell, amountToReceive } = values;
      const promisedLink = buildCreateIdenaOrderTx(
        idenaAddress,
        amountToSell,
        amountToReceive,
        secret,
      );
      return createOrderTxRDM.track(promisedLink);
    })().catch(() => {});
  };

  if (rData.isLoading(createOrderTxRD)) {
    return renderIdenaOrderInfo(<UiSubmitButton disabled={true}>Creating order...</UiSubmitButton>);
  }

  if (!rData.isSuccess(createOrderTxRD)) {
    return renderIdenaOrderInfo(
      <UiSubmitButton disabled={rData.isLoading(createOrderTxRD)} onClick={buildCreateOrderTx}>
        Create order in Idena chain
      </UiSubmitButton>,
    );
  }

  const regenerateOrderBtn = (
    <UiSubmitButton
      variant="outlined"
      disabled={rData.isLoading(createOrderTxRD)}
      onClick={buildCreateOrderTx}
    >
      Regenerate order
    </UiSubmitButton>
  );

  if (!isIdenaTxLinkClicked) {
    return renderIdenaOrderInfo(
      <Stack spacing={1}>
        {regenerateOrderBtn}
        <UiSubmitButton
          onClick={() => setIsIdenaTxLinkClicked(true)}
          LinkComponent="a"
          href={getIdenaLinkToSignTx(createOrderTxRD.data)}
          {...{ target: '_blank' }}
        >
          Sign order creation transaction
        </UiSubmitButton>
      </Stack>,
    );
  }

  return renderIdenaOrderInfo(
    <Stack spacing={1}>
      {regenerateOrderBtn}
      <Stack>
        <Typography color={theme.palette.grey[700]}>
          Wait for the transaction to complete and then update state:
        </Typography>
        <UiSubmitButton sx={{ mt: 1 }} onClick={checkOrderState}>
          Check order status
        </UiSubmitButton>
      </Stack>
    </Stack>,
  );
};
