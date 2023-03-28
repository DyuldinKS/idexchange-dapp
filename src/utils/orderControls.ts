import { gnosis } from '@wagmi/core/chains';
import { formatUnits } from 'ethers/lib/utils.js';
import { IDENA_BLOCK_DURATION_MS, IdenaOrderState, IdenaContractStaticInfo } from './idena';
import { XdaiConfirmedOrder, XdaiContractAttributes } from './xdai';
import dnaToBigInt from './dnaToBigInt';
import bignumberishToBigInt from './bignumberishToBigInt';

/**
 * A gap between idena.expireAt and xdai.matchDeadline + xdai.ownerClaimPeriod,
 * we need it to make sure that buyer has some time to complete idena order,
 * even if the owner completes xdai order in last seconds.
 */
const GAP_AFTER_MAX_EXECUTION_DEADLINE = 10 * 60 * 1000; // 10 min
const ORDER_MIN_TTL = 4 * 60 * 60 * 1000; // 4h
const NETWORK_ERR = 30 * 1000;
export const minTimeForIdena = 3_600 * 1000; // 1h
const minTimeForGnosis = minTimeForIdena / 2; // 30min

export const getOrderMinTTL = (
  contract: IdenaContractStaticInfo,
  cnfContract: XdaiContractAttributes,
) =>
  Math.max(
    ORDER_MIN_TTL,
    Math.max(
      contract.minOrderTTL,
      cnfContract.minOrderTTL + cnfContract.ownerClaimPeriod + GAP_AFTER_MAX_EXECUTION_DEADLINE,
    ),
  );

export const isCnfOrderValid = (
  order: IdenaOrderState | null,
  cnfOrder: XdaiConfirmedOrder | null,
  cnfContract: XdaiContractAttributes,
) => {
  // TOOD: move outside
  if (!order || !cnfOrder) return null;

  return (
    formatUnits(cnfOrder.amountXDAI, gnosis.nativeCurrency.decimals) === order.amountXdai &&
    Math.abs(calcCnfOrderMatchDeadline(order, cnfContract) - cnfOrder.matchDeadline) <=
      IDENA_BLOCK_DURATION_MS
  );
};

export const isOrderMatchable = (
  order: IdenaOrderState,
  cnfOrder: XdaiConfirmedOrder,
  cnfContract: XdaiContractAttributes,
  currentTimestamp: number,
) => {
  if (!order || !cnfOrder) return null;

  if (bignumberishToBigInt(cnfOrder.amountXDAI) !== dnaToBigInt(order.amountXdai)) return false;
  if (BigInt(cnfOrder.payoutAddress) !== BigInt(order.payoutAddress)) return false;

  if (currentTimestamp + NETWORK_ERR + minTimeForIdena > order.expireAt) return false;
  if (currentTimestamp + NETWORK_ERR > cnfOrder.matchDeadline) return false;

  if (order.matcher === null) return true;

  return currentTimestamp > (order.matchExpireAt as number);
};

export const calcCnfOrderMatchDeadline = (
  order: IdenaOrderState,
  cnfContract: XdaiContractAttributes,
) => order.expireAt - cnfContract.ownerClaimPeriod - GAP_AFTER_MAX_EXECUTION_DEADLINE;

export const canCancelCnfOrder = (cnfOrder: XdaiConfirmedOrder | null) =>
  Boolean(
    cnfOrder &&
      (cnfOrder.executionDeadline
        ? cnfOrder.executionDeadline < Date.now()
        : cnfOrder.matchDeadline < Date.now()),
  );
