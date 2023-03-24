import { waitForTransaction } from '@wagmi/core';
import { gnosis } from '@wagmi/core/chains';
import debug from 'debug';
import { FC } from 'react';
import abiToReceiveXdai from '../abi/idena-atomic-dex-gnosis.json';
import { CONTRACTS } from '../constants/contracts';
import { useRemoteData } from '../hooks/useRemoteData';
import { useWeb3Store } from '../providers/store/StoreProvider';
import { IdnaOrderState } from '../utils/idena';
import { isChainSupported } from '../utils/web3Modal';
import { createXdaiConfirmedOrder, OrderConfirmation, readXdaiConfirmedOrder } from '../utils/xdai';
import { UiBlock, UiBlockTitle, UiSubmitButton } from './ui';

const log = debug('XdaiOrderConfirmation');

const contractInfo = {
  chainId: gnosis.id,
  address: CONTRACTS[gnosis.id].receiveXdai,
  abi: abiToReceiveXdai,
};

export const XdaiOrderConfirmation: FC<{
  secretHash: string;
  idenaOrder: NonNullable<IdnaOrderState>;
}> = ({ secretHash, idenaOrder }) => {
  const [orderConfirmRD, orderConfirmRDM] = useRemoteData<OrderConfirmation>(null);
  const [{ chainId, address }] = useWeb3Store();
  console.log('>>> orderConfirmRD', orderConfirmRD);

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

    return orderConfirmRDM.track(processTx().then(() => readXdaiConfirmedOrder(secretHash)));
  };

  return (
    <UiBlock>
      <UiBlockTitle>Order to receive xDAI</UiBlockTitle>
      <UiSubmitButton onClick={confirmOrder}>Create order in Gnosis chain</UiSubmitButton>
    </UiBlock>
  );
};
