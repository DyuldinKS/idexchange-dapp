import { Address } from '@wagmi/core';
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

export const canCreateCnfOrder = (
  order: IdenaOrderState | null,
  cnfOrder: XdaiConfirmedOrder | null,
  saleContract: IdenaContractStaticInfo,
): order is IdenaOrderState => {
  return Boolean(
    !cnfOrder &&
      order &&
      // if order has matcher then it is already has the confirmation (or had)
      !order.matcher &&
      order.expireAt &&
      Date.now() + saleContract.fulfilPeriodInBlocks < order.expireAt,
  );
};

export const isCnfOrderValid = (
  order: IdenaOrderState | null,
  cnfOrder: XdaiConfirmedOrder | null,
) => {
  return Boolean(
    order &&
      cnfOrder &&
      cnfOrder.amountXDAI.eq(parseIdna(order.amountXdai)) &&
      isAddrEqual(order.payoutAddress, cnfOrder.payoutAddress),
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

  const isCnfOrderPartValid =
    !cnfOrder.matcher && Date.now() < cnfOrder.matchDeadline && isCnfOrderValid(order, cnfOrder);

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

export const canCompleteCnfOrder = (cnfOrder: XdaiConfirmedOrder | null) =>
  cnfOrder &&
  cnfOrder.matcher &&
  cnfOrder.executionDeadline &&
  Date.now() < cnfOrder.executionDeadline;

export const canCompleteOrder = (
  order: IdenaOrderState | null,
  cnfOrder: XdaiConfirmedOrder | null,
  idenaAddress: string,
) => {
  // confirmation order should be already completed
  return (
    !cnfOrder &&
    order &&
    Date.now() < order.expireAt &&
    isAddrEqual(idenaAddress, order.matcher || '')
  );
};
