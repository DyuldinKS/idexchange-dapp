import debug from 'debug';
import { BigNumber, ethers } from 'ethers';
import { hexToUint8Array } from 'idena-sdk-js';
import { zipObj } from 'ramda';

import {
  Address,
  prepareWriteContract as prepareWriteContractOriginal,
  readContract,
  writeContract,
} from '@wagmi/core';
import { gnosis } from '@wagmi/core/chains';

import abiToReceiveXdai from '../abi/idena-atomic-dex-gnosis.json';
import { CONTRACTS } from '../constants/contracts';
import { SecurityDepositType } from '../types/contracts';
import { isAddrEqual, ZERO_ADDRESS } from './address';
import { wagmiClient } from './web3Modal';

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

const XDAI_BLOCK_DURATION_MS = 5000;
const XDAI_BLOCK_DURATION_ERR = 0.2; // 20%
const CONTRACT_INFO = {
  chainId: gnosis.id,
  address: CONTRACTS[gnosis.id].receiveXdai,
  abi: abiToReceiveXdai,
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

export const readXdaiCnfOrder = async (secretHash: string) => {
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

export const readXdaiSecurityDeposit = async (
  address: string,
  { securityDepositAmount }: XdaiContractAttributes,
): Promise<SecurityDepositType> => {
  const [amount, isInUse] = (await Promise.all([
    readContract({
      ...CONTRACT_INFO,
      functionName: 'securityDeposits',
      args: [address],
    }),
    readContract({
      ...CONTRACT_INFO,
      functionName: 'securityDepositInUse',
      args: [address],
    }),
  ])) as [BigNumber, boolean];
  return {
    amount,
    isInUse,
    requiredAmount: securityDepositAmount,
    isValid: amount.eq(securityDepositAmount) && !isInUse,
  };
};

const prepareWriteContract: typeof prepareWriteContractOriginal = (txConfig) => {
  log('prepareWriteContract', txConfig);
  return prepareWriteContractOriginal(txConfig);
};

export const createXdaiCnfOrder = async (
  secretHash: string,
  amountXdai: BigNumber,
  receiverAddress: string,
  deadlineMs: number,
) => {
  const args = [
    hexToUint8Array(secretHash),
    amountXdai,
    receiverAddress,
    Math.floor(deadlineMs / 1000),
  ];
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

export const matchXdaiCnfOrder = async (secretHash: string, amount: BigNumber) => {
  const args = [hexToUint8Array(secretHash)];
  return prepareWriteContract({
    ...CONTRACT_INFO,
    functionName: 'matchOrder',
    args,
    overrides: {
      value: amount,
    },
  }).then(writeContract);
};

export const completeXdaiCnfOrder = async (secret: string) => {
  const args = [hexToUint8Array(secret)];
  return prepareWriteContract({
    ...CONTRACT_INFO,
    functionName: 'completeOrder',
    args,
  }).then(writeContract);
};

export const submitXdaiSecutityDeposit = async (amount: BigNumber) => {
  return prepareWriteContract({
    ...CONTRACT_INFO,
    functionName: 'submitSecurityDeposit',
    overrides: {
      value: amount,
    },
  }).then(writeContract);
};

export const getSecretFromLogs = async (secretHash: string, timeWindowMs: number) => {
  const contract = new ethers.Contract(CONTRACT_INFO.address, CONTRACT_INFO.abi);
  const filter = contract.filters.OrderCompleted(secretHash, null);

  const rpcProvider = wagmiClient.getProvider();
  const lastBlock = await rpcProvider.getBlockNumber();
  const fromBlock = Math.floor(
    lastBlock - (timeWindowMs * (1 + XDAI_BLOCK_DURATION_ERR)) / XDAI_BLOCK_DURATION_MS,
  );
  contract.interface.events;

  const rawLogs = await rpcProvider.getLogs({ ...filter, fromBlock });
  const logs = rawLogs
    .map((log) => {
      try {
        return contract.interface.decodeEventLog('OrderCompleted', log.data, log.topics);
      } catch (err) {
        console.error('getSecretFromLogs decodeEventLog', err);
        return null;
      }
    })
    .filter(Boolean);

  log('getSecretFromLogs result', logs);

  return logs[0]?.secret || null;
};

export const withdrawXdaiSecurityDeposit = async () => {
  return prepareWriteContract({
    ...CONTRACT_INFO,
    functionName: 'withdrawSecurityDeposit',
  }).then(writeContract);
};
