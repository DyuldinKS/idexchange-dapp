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

export const getOrderMinTTL = (
  contract: IdenaContractStaticInfo,
  cnfmContract: XdaiContractAttributes,
) =>
  Math.max(
    ORDER_MIN_TTL,
    Math.max(
      contract.minOrderTTL,
      cnfmContract.minOrderTTL + cnfmContract.ownerClaimPeriod + GAP_AFTER_MAX_EXECUTION_DEADLINE,
    ),
  );

export const isOrderConfirmationValid = (
  order: IdenaOrderState | null,
  cnfmOrder: XdaiConfirmedOrder | null,
  cnfmContract: XdaiContractAttributes,
) => {
  // TOOD: move outside
  if (!order || !cnfmOrder) return null;

  return (
    formatUnits(cnfmOrder.amountXDAI, gnosis.nativeCurrency.decimals) === order.amountXdai &&
    order.expireAt - 2 * IDENA_BLOCK_DURATION_MS < cnfmOrder.matchDeadline &&
    cnfmOrder.matchDeadline <
      order.expireAt +
        IDENA_BLOCK_DURATION_MS - // as possible time error when casting blocks to milliseconds
        cnfmContract.ownerClaimPeriod -
        GAP_AFTER_MAX_EXECUTION_DEADLINE
  );
};

export const calcCnfOrderMatchDeadline = (
  order: IdenaOrderState,
  cnfmContract: XdaiContractAttributes,
) =>
  (console.log('calcCnfOrderMatchDeadline', {
    expireAt: order.expireAt,
    ownerClaimPeriod: cnfmContract.ownerClaimPeriod,
    GAP_AFTER_MAX_EXECUTION_DEADLINE,
  }) as any) || order.expireAt - cnfmContract.ownerClaimPeriod - GAP_AFTER_MAX_EXECUTION_DEADLINE;
