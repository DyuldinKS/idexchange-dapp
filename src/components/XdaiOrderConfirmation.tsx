import debug from 'debug';
import { parseUnits } from 'ethers/lib/utils.js';
import { FC, ReactNode } from 'react';

import { Typography, useTheme } from '@mui/material';
import { Stack } from '@mui/system';
import { waitForTransaction } from '@wagmi/core';
import { gnosis } from '@wagmi/core/chains';

import { useContractsAttributes } from '../hooks/useContractsAttributes';
import { UseRemoteDataMethods } from '../hooks/useRemoteData';
import { useWeb3Store } from '../providers/store/StoreProvider';
import { IdenaOrderState } from '../utils/idena';
import { calcCnfOrderMatchDeadline, canCreateCnfOrder } from '../utils/orderControls';
import { rData, RemoteData } from '../utils/remoteData';
import { getColor } from '../utils/theme';
import { isChainSupported } from '../utils/web3Modal';
import { createXdaiCnfOrder, readXdaiCnfOrder, XdaiConfirmedOrder } from '../utils/xdai';
import { UiBlock, UiBlockTitle, UiError, UiSpan, UiSubmitButton } from './ui';
import { isAddrEqual } from '../utils/address';

const log = debug('XdaiOrderConfirmation');

export const XdaiOrderConfirmation: FC<{
  secretHash: string;
  order: IdenaOrderState;
  cnfOrderRD: RemoteData<XdaiConfirmedOrder | null>;
  cnfOrderRDM: UseRemoteDataMethods<XdaiConfirmedOrder | null>;
}> = ({ secretHash, order, cnfOrderRD, cnfOrderRDM }) => {
  const [{ chainId, address }] = useWeb3Store();
  const contractsAttrsRD = useContractsAttributes();
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

  if (rData.isLoading(cnfOrderRD) || !rData.isSuccess(contractsAttrsRD)) {
    return renderOrderBlock('Loading...');
  }

  const confirmOrder = () => {
    if (!address || !isChainSupported(chainId)) return;

    const matchDeadline = calcCnfOrderMatchDeadline(order, contractsAttrsRD.data.xdai);
    log('confirmOrder', { order, matchDeadline });

    const processTx = async () => {
      const tx = await createXdaiCnfOrder(
        secretHash,
        parseUnits(order.amountXdai, gnosis.nativeCurrency.decimals),
        address,
        matchDeadline,
      );
      const res = await waitForTransaction({ hash: tx.hash });
      log('successfully confirmed');
      return res;
    };

    return cnfOrderRDM.track(processTx().then(() => readXdaiCnfOrder(secretHash)));
  };

  const isWrongAddress = isAddrEqual(address || '', order.payoutAddress);

  return renderOrderBlock(
    <Stack alignItems="stretch">
      <Typography color={getColor.textGrey(theme)}>
        Confirm your order to be able to receive xDAI:
      </Typography>
      {isWrongAddress && (
        <UiError
          mt={2}
          msg={
            <UiSpan>
              Wrong address. Switch account to{' '}
              <UiSpan fontWeight={600}>{order.payoutAddress}</UiSpan> since it has been used to
              create the order in Idena chain.
            </UiSpan>
          }
        />
      )}
      <UiSubmitButton
        sx={{ mt: 2 }}
        onClick={confirmOrder}
        disabled={canCreateCnfOrder(order, address, cnfOrderRD.data, contractsAttrsRD.data.idena)}
      >
        Confirm order
      </UiSubmitButton>
    </Stack>,
  );
};
