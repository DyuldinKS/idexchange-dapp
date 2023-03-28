import { Address, prepareWriteContract, readContract, writeContract } from '@wagmi/core';
import { gnosis } from '@wagmi/core/chains';
import debug from 'debug';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils.js';
import { hexToUint8Array } from 'idena-sdk-js';
import { zipObj } from 'ramda';
import abiToReceiveXdai from '../abi/idena-atomic-dex-gnosis.json';
import { CONTRACTS } from '../constants/contracts';
import { isAddrEqual, ZERO_ADDRESS } from './address';

const log = debug('utils:xdai');

export type XdaiRawConfirmedOrder = {
  confirmed: Boolean;
  owner: Address;
  payoutAddress: Address;
  matcher: Address;
  amountXDAI: BigNumber;
  matchDeadline: BigNumber;
  executionDeadline: BigNumber;
};

export type XdaiContractAttributes = Awaited<ReturnType<typeof readXdaiContractInfo>>;

export type XdaiConfirmedOrder = Omit<
  XdaiRawConfirmedOrder,
  'matcher' | 'matchDeadline' | 'executionDeadline'
> & {
  matcher: Address | null;
  matchDeadline: number; // ms
  executionDeadline: number | null; // ms
};

const CONTRACT_INFO = {
  chainId: gnosis.id,
  address: CONTRACTS[gnosis.id].receiveXdai,
  abi: abiToReceiveXdai,
};

export const readXdaiConfirmedOrder = async (secretHash: string) => {
  return (
    readContract({
      ...CONTRACT_INFO,
      functionName: 'orders',
      args: [hexToUint8Array(secretHash)],
    }) as Promise<XdaiRawConfirmedOrder | null>
  ).then((res) =>
    res && !isAddrEqual(res.owner, ZERO_ADDRESS)
      ? {
          ...res,
          matcher: isAddrEqual(res.matcher, ZERO_ADDRESS) ? null : res.matcher,
          matchDeadline: res.matchDeadline.toNumber() * 1000,
          executionDeadline: res.executionDeadline.eq(0)
            ? null
            : res.executionDeadline.toNumber() * 1000,
        }
      : null,
  ) as Promise<XdaiConfirmedOrder>;
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

export const burnXdaiOrder = async (secretHash: string) => {
  const args = [hexToUint8Array(secretHash)];
  return prepareWriteContract({
    ...CONTRACT_INFO,
    functionName: 'burnOrder',
    args,
  }).then(writeContract);
};

export const readXdaiContractInfo = async () => {
  const funcNames = [
    'ownerClaimPeriod',
    'minOrderTTL',
    'securityDepositAmount',
    'protocolPenaltyFee',
  ] as const;
  const rawRes = await Promise.all(
    funcNames.map((functionName) =>
      readContract({
        ...CONTRACT_INFO,
        functionName,
      }),
    ),
  );
  const res = zipObj(funcNames, rawRes) as Record<typeof funcNames[number], BigNumber>;
  return {
    ...res,
    minOrderTTL: res.minOrderTTL.toNumber() * 1000,
    ownerClaimPeriod: res.ownerClaimPeriod.toNumber() * 1000,
  };
};
