import {
  Address,
  prepareWriteContract as prepareWriteContractOriginal,
  readContract,
  writeContract,
} from '@wagmi/core';
import { gnosis } from '@wagmi/core/chains';
import debug from 'debug';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils.js';
import { hexToUint8Array } from 'idena-sdk-js';
import { zipObj } from 'ramda';
import abiToReceiveXdai from '../abi/idena-atomic-dex-gnosis.json';
import { CONTRACTS } from '../constants/contracts';
import { SecurityDepositType } from '../types/contracts';
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
  log('createXdaiCnfOrder args:', args);
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

export const matchXdaiCnfOrder = (secretHash: string, amount: BigNumber) => {
  const args = [hexToUint8Array(secretHash)];
  log('matchCnfOrder args:', args);
  return prepareWriteContract({
    ...CONTRACT_INFO,
    functionName: 'matchOrder',
    args,
    overrides: {
      value: amount,
    },
  }).then(writeContract);
};

export const completeXdaiCnfOrder = (secret: string) => {
  const args = [hexToUint8Array(secret)];
  // TODO: remove and decorate prepareWriteContract with logging
  log('completeXdaiCnfOrder args:', args);
  return prepareWriteContract({
    ...CONTRACT_INFO,
    functionName: 'completeOrder',
    args,
  }).then(writeContract);
};
