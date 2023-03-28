import { gnosis } from '@wagmi/core/chains';
import { formatUnits } from 'ethers/lib/utils.js';
import { IDENA_BLOCK_DURATION_MS, IdenaOrderState, IdenaContractStaticInfo } from './idena';
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

export const isOrderConfirmationValid = (
  order: IdenaOrderState | null,
  cnfOrder: XdaiConfirmedOrder | null,
  cnfContract: XdaiContractAttributes,
) => {
  // TOOD: move outside
  if (!order || !cnfOrder) return null;

  return (
    formatUnits(cnfOrder.amountXDAI, gnosis.nativeCurrency.decimals) === order.amountXdai &&
    Math.abs(calcCnfOrderMatchDeadline(order, cnfContract) - cnfOrder.matchDeadline) <
      IDENA_BLOCK_DURATION_MS + NETWORK_ERR
  );
};

export const calcCnfOrderMatchDeadline = (
  order: IdenaOrderState,
  cnfContract: XdaiContractAttributes,
) =>
  (console.log('calcCnfOrderMatchDeadline', {
    expireAt: order.expireAt,
    ownerClaimPeriod: cnfContract.ownerClaimPeriod,
    GAP_AFTER_MAX_EXECUTION_DEADLINE,
  }) as any) || order.expireAt - cnfContract.ownerClaimPeriod - GAP_AFTER_MAX_EXECUTION_DEADLINE;
