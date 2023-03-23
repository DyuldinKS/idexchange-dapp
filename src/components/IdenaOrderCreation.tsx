import { FC, ReactNode, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

import { Stack, Typography } from '@mui/material';

import { useRemoteData, UseRemoteDataReturn } from '../hooks/useRemoteData';
import { mapRejected } from '../utils/async';
import {
  createOrderToSellIdnaTx,
  getIdenaLinkToSignTx,
  getIdnaOrderState,
  getSecretHash,
  IdnaOrderState,
} from '../utils/idena';
import { rData } from '../utils/remoteData';
import { theme } from '../utils/theme';
import { IdenaOrderInfo } from './IdenaOrderInfo';
import { OrderCreationFormSchema } from './OrderCreationPage';
import { UiError, UiSubmitButton } from './ui';
import debug from 'debug';

const log = debug('IdenaOrderCreation');

export const IdenaOrderCreation: FC<{
  idenaOrderRDState: UseRemoteDataReturn<IdnaOrderState>;
  form: UseFormReturn<OrderCreationFormSchema>;
  secret: string;
}> = ({ idenaOrderRDState: [idenaOrderRD, idenaOrderRDM], form: { handleSubmit }, secret }) => {
  const [idenaTxLinkRD, idenaTxLinkRDM] = useRemoteData<string>(null);
  const [isIdenaTxLinkClicked, setIsIdenaTxLinkClicked] = useState(false);
  const [secretHash] = useState(() => getSecretHash(secret));
  const error = idenaOrderRD.error || idenaTxLinkRD.error;

  const renderIdenaOrderInfo = (children: ReactNode) => (
    <IdenaOrderInfo infoRD={idenaOrderRD}>
      {children}
      {error && <UiError msg={error?.message || String(error)} />}
    </IdenaOrderInfo>
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
    return renderIdenaOrderInfo(
      <UiSubmitButton sx={{ mt: 1 }} variant="outlined" onClick={checkOrderState}>
        Check order status
      </UiSubmitButton>,
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

  if (rData.isLoading(idenaTxLinkRD)) {
    return renderIdenaOrderInfo(<UiSubmitButton disabled={true}>Creating order...</UiSubmitButton>);
  }

  if (!rData.isSuccess(idenaTxLinkRD)) {
    return renderIdenaOrderInfo(
      <UiSubmitButton disabled={rData.isLoading(idenaTxLinkRD)} onClick={generateTxLink}>
        Create order in Idena chain
      </UiSubmitButton>,
    );
  }

  const regenerateOrderBtn = (
    <UiSubmitButton
      variant="outlined"
      disabled={rData.isLoading(idenaTxLinkRD)}
      onClick={generateTxLink}
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
          href={idenaTxLinkRD.data}
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
