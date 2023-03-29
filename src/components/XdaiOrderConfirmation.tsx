import debug from 'debug';
import { FC, ReactNode } from 'react';

import { Typography, useTheme } from '@mui/material';
import { Stack } from '@mui/system';
import { waitForTransaction } from '@wagmi/core';

import { useContractsAttributes } from '../hooks/useContractsAttributes';
import { UseRemoteDataMethods } from '../hooks/useRemoteData';
import { useWeb3Store } from '../providers/store/StoreProvider';
import { IdenaOrderState } from '../utils/idena';
import { calcCnfOrderMatchDeadline } from '../utils/orderControls';
import { rData, RemoteData } from '../utils/remoteData';
import { getColor } from '../utils/theme';
import { isChainSupported } from '../utils/web3Modal';
import { createXdaiCnfOrder, readXdaiCnfOrder, XdaiConfirmedOrder } from '../utils/xdai';
import { UiBlock, UiBlockTitle, UiError, UiSubmitButton } from './ui';

const log = debug('XdaiOrderConfirmation');

export const XdaiOrderConfirmation: FC<{
  secretHash: string;
  order: IdenaOrderState;
  cnfOrderRD: RemoteData<XdaiConfirmedOrder | null>;
  cnfOrderRDM: UseRemoteDataMethods<XdaiConfirmedOrder | null>;
}> = ({ secretHash, order, cnfOrderRD, cnfOrderRDM }) => {
  const [{ chainId, address }] = useWeb3Store();
  const contractsAttrs = useContractsAttributes();
  const theme = useTheme();
  const error = cnfOrderRD.error;

  const renderOrderBlock = (children: ReactNode) => {
    return (
      <UiBlock>
        <UiBlockTitle>Gnosis chain</UiBlockTitle>
        {children && (
          <Stack mt={2} alignItems="stretch">
            {children}
          </Stack>
        )}
        {error && <UiError mt={1} err={error} />}
      </UiBlock>
    );
  };

  const confirmOrder = () => {
    // TODO: add loader in case of contractsInfo loading
    if (!address || !isChainSupported(chainId) || !contractsAttrs.data) return;

    const matchDeadline = calcCnfOrderMatchDeadline(order, contractsAttrs.data.xdai);
    log('confirmOrder', { order, matchDeadline });

    const processTx = async () => {
      const tx = await createXdaiCnfOrder(secretHash, order.amountXdai, address, matchDeadline);
      const res = await waitForTransaction({ hash: tx.hash });
      log('successfully confirmed');
      return res;
    };

    return cnfOrderRDM.track(processTx().then(() => readXdaiCnfOrder(secretHash)));
  };

  if (rData.isLoading(cnfOrderRD)) {
    return renderOrderBlock('Loading...');
  }

  return renderOrderBlock(
    <Stack alignItems="stretch">
      <Typography color={getColor.textGrey(theme)}>
        Confirm your order to be able to receive xDAI:
      </Typography>
      <UiSubmitButton sx={{ mt: 2 }} onClick={confirmOrder} disabled={rData.isLoading(cnfOrderRD)}>
        Confirm order
      </UiSubmitButton>
    </Stack>,
  );
};
