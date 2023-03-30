import { gnosis } from '@wagmi/core/chains';
import { formatUnits } from 'ethers/lib/utils.js';
import { SecurityDepositType } from '../types/contracts';
import {
  IdenaContractStaticInfo,
  IdenaOrderState,
  IDENA_BLOCK_DURATION_MS,
  parseIdna,
  readIdenaContractInfo,
} from './idena';
import { XdaiConfirmedOrder, XdaiContractAttributes } from './xdai';
import { isAddrEqual } from './address';

/**
 * A gap between idena.expireAt and xdai.matchDeadline + xdai.ownerClaimPeriod,
 * we need it to make sure that buyer has some time to complete idena order,
 * even if the owner completes xdai order in last seconds.
 */
const GAP_AFTER_MAX_EXECUTION_DEADLINE = 10 * 60 * 1000; // 10 min
const ORDER_MIN_TTL = 4 * 60 * 60 * 1000; // 4h
const NETWORK_ERR = 30 * 1000;

export const getOrderMinTTL = (
  saleContract: IdenaContractStaticInfo,
  cnfContract: XdaiContractAttributes,
) =>
  Math.max(
    ORDER_MIN_TTL,
    Math.max(
      saleContract.minOrderTTL,
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
    cnfOrder.amountXDAI.eq(parseIdna(order.amountXdai)) &&
    isAddrEqual(order.payoutAddress, cnfOrder.payoutAddress) &&
    Math.abs(calcCnfOrderMatchDeadline(order, cnfContract) - cnfOrder.matchDeadline) <=
      IDENA_BLOCK_DURATION_MS + readIdenaContractInfo().fulfilPeriod + NETWORK_ERR
  );
};

// export const isOrderMatchable = (
//   order: IdenaOrderState,
//   cnfOrder: XdaiConfirmedOrder,
//   cnfContract: XdaiContractAttributes,
//   currentTimestamp: number,
// ) => {
//   if (!order || !cnfOrder) return null;

//   if (bignumberishToBigInt(cnfOrder.amountXDAI) !== order.amountXdai) return false;
//   if (BigInt(cnfOrder.payoutAddress) !== BigInt(order.payoutAddress)) return false;

//   if (currentTimestamp + NETWORK_ERR + minTimeForIdena > order.expireAt) return false;
//   if (currentTimestamp + NETWORK_ERR > cnfOrder.matchDeadline) return false;

//   if (order.matcher === null) return true;

//   return currentTimestamp > (order.matchExpireAt as number);
// };

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

// export const canBuyOrder = (order: IdenaOrderState | null, cnfOrder: XdaiConfirmedOrder | null, cnfContract: XdaiContractAttributes | null) => {
//   return Boolean(order && cnfOrder && cnfContract ? order)
// }

export const canMatchOrder = (
  order: IdenaOrderState | null,
  cnfOrder: XdaiConfirmedOrder | null,
  saleContract: IdenaContractStaticInfo,
) => {
  if (!order || !cnfOrder) return false;

  const isOrderNotMatched = !order.matcher && !order.matchExpireAt;
  const isPrevMatchExpired =
    order.matcher && order.matchExpireAt && order.matchExpireAt < Date.now();
  const hasTimeForFulfilling = Date.now() + saleContract.fulfilPeriod < order.expireAt;
  const isOrderPartValid = (isOrderNotMatched || isPrevMatchExpired) && hasTimeForFulfilling;

  const isCnfOrderPartValid = !cnfOrder.matcher && Date.now() < cnfOrder.matchDeadline;

  return Boolean(isOrderPartValid && isCnfOrderPartValid);
};
