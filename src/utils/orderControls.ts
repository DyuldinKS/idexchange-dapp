import { gnosis } from '@wagmi/core/chains';
import { formatUnits } from 'ethers/lib/utils.js';
import { IDENA_BLOCK_DURATION_MS, IdenaOrderState } from './idena';
import { XdaiConfirmedOrder } from './xdai';

const NETWORK_TIME_ERROR = 5000;

export const isOrderConfirmationValid = (
  order: IdenaOrderState | null,
  confirmedOrder: XdaiConfirmedOrder | null,
) => {
  if (!order || !confirmedOrder) return null;

  return (
    formatUnits(confirmedOrder.amountXDAI, gnosis.nativeCurrency.decimals) === order.amountXdai &&
    order.expirationAt - 2 * IDENA_BLOCK_DURATION_MS < confirmedOrder.matchDeadline &&
    confirmedOrder.matchDeadline < order.expirationAt - IDENA_BLOCK_DURATION_MS
  );
};
