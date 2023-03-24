import { Address, prepareWriteContract, readContract, writeContract } from '@wagmi/core';
import { gnosis } from '@wagmi/core/chains';
import debug from 'debug';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils.js';
import { hexToUint8Array } from 'idena-sdk-js';
import abiToReceiveXdai from '../abi/idena-atomic-dex-gnosis.json';
import { CONTRACTS } from '../constants/contracts';

const log = debug('utils:xdai');

export type OrderConfirmation = {
  confirmed: Boolean;
  owner: Address;
  payoutAddress: Address;
  matcher: Address | null;
  amountXDAI: BigNumber;
  matchDeadline: BigNumber;
  executionDeadline: BigNumber | null;
};

const CONTRACT_INFO = {
  chainId: gnosis.id,
  address: CONTRACTS[gnosis.id].receiveXdai,
  abi: abiToReceiveXdai,
};

export const readXdaiConfirmedOrder = async (secretHash: string) => {
  return readContract({
    ...CONTRACT_INFO,
    functionName: 'orders',
    args: [hexToUint8Array(secretHash)],
  }) as Promise<OrderConfirmation>;
};

export const createXdaiConfirmedOrder = async (
  secretHash: string,
  amountXdai: string,
  receiverAddress: string,
  deadlineMs: number,
) => {
  const args = [
    hexToUint8Array(secretHash),
    parseUnits(amountXdai, gnosis.nativeCurrency.decimals),
    receiverAddress,
    Math.floor(deadlineMs / 1000),
  ];
  log('createXdaiConfirmedOrder args:', args);
  return prepareWriteContract({
    ...CONTRACT_INFO,
    functionName: 'confirmOrder',
    args,
  }).then(writeContract);
};

export const burnOrder = async (secretHash: string) => {
  const args = [hexToUint8Array(secretHash)];
  return prepareWriteContract({
    ...CONTRACT_INFO,
    functionName: 'burnOrder',
    args,
  }).then(writeContract);
};
