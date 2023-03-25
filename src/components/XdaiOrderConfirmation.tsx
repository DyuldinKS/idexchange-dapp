import { Typography, useTheme } from '@mui/material';
import { Stack } from '@mui/system';
import { waitForTransaction } from '@wagmi/core';
import debug from 'debug';
import { FC, ReactNode, useEffect } from 'react';
import { useRemoteData } from '../hooks/useRemoteData';
import { useWeb3Store } from '../providers/store/StoreProvider';
import { IdnaOrderState } from '../utils/idena';
import { rData } from '../utils/remoteData';
import { getColor } from '../utils/theme';
import { isChainSupported } from '../utils/web3Modal';
import {
  createXdaiConfirmedOrder,
  XdaiConfirmedOrder,
  readXdaiConfirmedOrder,
} from '../utils/xdai';
import { UiBlock, UiBlockTitle, UiError, UiSubmitButton } from './ui';

const log = debug('XdaiOrderConfirmation');

export const XdaiOrderConfirmation: FC<{
  secretHash: string;
  idenaOrder: NonNullable<IdnaOrderState>;
}> = ({ secretHash, idenaOrder }) => {
  const [orderRD, orderRDM] = useRemoteData<XdaiConfirmedOrder>(null);
  const [{ chainId, address }] = useWeb3Store();
  const theme = useTheme();
  console.log('>>> orderRD', orderRD);
  const error = orderRD.error;

  useEffect(() => {
    orderRDM.track(readXdaiConfirmedOrder(secretHash));
  }, [secretHash]);

  const renderOrderBlock = (children: ReactNode) => {
    return (
      <UiBlock>
        <UiBlockTitle>Order to receive xDAI</UiBlockTitle>
        {children && (
          <Stack mt="2" alignItems="stretch">
            {children}
          </Stack>
        )}
        {error && <UiError msg={error.message || String(error)}>{error}</UiError>}
      </UiBlock>
    );
  };

  const confirmOrder = () => {
    if (!address || !isChainSupported(chainId)) return;

    const processTx = async () => {
      const tx = await createXdaiConfirmedOrder(
        secretHash,
        idenaOrder.amountXdai,
        address,
        idenaOrder.expirationAt,
      );
      const res = await waitForTransaction({ hash: tx.hash });
      log('successfully confirmed');
      return res;
    };

    return orderRDM.track(processTx().then(() => readXdaiConfirmedOrder(secretHash)));
  };

  if (rData.isLoading(orderRD)) {
    return renderOrderBlock(<UiSubmitButton disabled={true}>Loading...</UiSubmitButton>);
  }

  return renderOrderBlock(
    <Stack alignItems="stretch">
      <Typography color={getColor.textGrey(theme)}>Create an order to receive xDai:</Typography>
      <UiSubmitButton sx={{ mt: 1 }} onClick={confirmOrder} disabled={rData.isLoading(orderRD)}>
        Create order in Gnosis Chain
      </UiSubmitButton>
    </Stack>,
  );
};
