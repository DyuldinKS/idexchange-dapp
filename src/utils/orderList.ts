import { ContractArgumentFormat as CAF } from 'idena-sdk-js';
import { readIdenaOrderState, handleNilData, IdenaOrderState } from './idena';
import { CONTRACTS } from '../constants/contracts';
import { readXdaiCnfOrder, XdaiConfirmedOrder } from './xdai';
import { idenaProvider } from '../providers/idenaProvider';
import debug from 'debug';

export type IdenaOrderListState = NonNullable<Awaited<ReturnType<typeof getIdenaOrderListState>>>;

const log = debug('utils:orderList');

export async function getIdenaOrderListState() {
  const { Contract } = idenaProvider;

  const secretHashes = [];
  let current;
  let i = 0;
  while (
    (current = await Contract.readMap(
      CONTRACTS.idena.sellIdna,
      'activeOrders',
      numToHex(i++),
      CAF.Hex,
    ).catch(handleNilData('getIdenaOrderListState')))
  ) {
    secretHashes.push(current);
  }

  const rawOrders = await Promise.all(
    secretHashes.map((hash) =>
      Promise.all([readIdenaOrderState(hash), readXdaiCnfOrder(hash)] as const)
        .then(([dnaState, xdaiState]) =>
          dnaState && xdaiState ? { hash, dnaState, xdaiState } : null,
        )
        .catch((err) => {
          console.log('getIdenaOrderListState caught err for hash', hash, err);
          return null;
        }),
    ),
  );

  const orders = rawOrders.filter(Boolean);
  log('loaded orders:', orders);
  return orders;
}

function numToHex(num: number) {
  return `0x${(num.toString(16).padStart(8, '0').match(/../g) as string[]).reverse().join('')}`;
}
