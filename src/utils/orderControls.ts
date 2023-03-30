import { isAddrEqual } from './address';
import { IdenaContractStaticInfo, IdenaOrderState, parseIdna } from './idena';
import { XdaiConfirmedOrder, XdaiContractAttributes } from './xdai';

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
    cnfOrder.matchDeadline + cnfContract.ownerClaimPeriod < order.expireAt
  );
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

export const canMatchCnfOrder = (
  order: IdenaOrderState | null,
  cnfOrder: XdaiConfirmedOrder | null,
  saleContract: IdenaContractStaticInfo,
) => {
  return Boolean(
    order &&
      // if prev match expired
      order.matchExpireAt &&
      Date.now() < order.matchExpireAt &&
      Date.now() + saleContract.fulfilPeriodInBlocks < order.expireAt &&
      cnfOrder &&
      !cnfOrder.matcher &&
      Date.now() < cnfOrder.matchDeadline,
  );
};
