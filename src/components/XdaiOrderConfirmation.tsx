import { gnosis } from '@wagmi/core/chains';
import { FC } from 'react';
import { CONTRACTS } from '../constants/contracts';
import { useRemoteData } from '../hooks/useRemoteData';
import abiToReceiveXdai from '../abi/idena-atomic-dex-gnosis.json';
import { UiBlock, UiBlockTitle, UiSubmitButton } from './ui';
import {
  Address,
  prepareWriteContract,
  readContract,
  writeContract,
  waitForTransaction,
} from '@wagmi/core';
import { BigNumber } from 'ethers';
import { useWeb3Store } from '../providers/store/StoreProvider';
import { isChainSupported } from '../utils/web3Modal';
import debug from 'debug';
import { parseUnits } from 'ethers/lib/utils.js';
import { IdnaOrderState } from '../utils/idena';
import { hexToUint8Array, toHexString } from 'idena-sdk-js';

const log = debug('XdaiOrderConfirmation');

const contractInfo = {
  chainId: gnosis.id,
  address: CONTRACTS[gnosis.id].receiveXdai,
  abi: abiToReceiveXdai,
};

export type OrderConfirmation = {
  confirmed: Boolean;
  owner: Address;
  payoutAddress: Address;
  matcher: Address | null;
  amountXDAI: BigNumber;
  matchDeadline: BigNumber;
  executionDeadline: BigNumber | null;
};

const readXdaiConfirmedOrder = (secretHashHex: string) => {
  log('readXdaiConfirmedOrder', secretHashHex, [hexToUint8Array(secretHashHex)]);
  return readContract({
    ...contractInfo,
    functionName: 'orders',
    args: [hexToUint8Array(secretHashHex)],
  }) as Promise<OrderConfirmation>;
};

(window as any).readXdaiConfirmedOrder = readXdaiConfirmedOrder;

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
      const args = [
        hexToUint8Array(secretHash),
        parseUnits(idenaOrder.amountXdai, gnosis.nativeCurrency.decimals),
        address,
        Math.floor(idenaOrder?.expirationAt / 1000),
      ];
      console.log('>>> args', args);
      const txConfig = await prepareWriteContract({
        ...contractInfo,
        functionName: 'confirmOrder',
        args,
      });
      log('confirmOrder txConfig:', txConfig);
      const tx = await writeContract(txConfig);
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
