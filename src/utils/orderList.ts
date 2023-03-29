import { ContractArgumentFormat as CAF } from 'idena-sdk-js';
import { getIdenaOrderState, handleNilData, IdenaOrderState } from './idena';
import { CONTRACTS } from '../constants/contracts';
import { readXdaiConfirmedOrder, XdaiConfirmedOrder } from './xdai';
import idenaProvider from '../providers/idenaProvider';

export type IdenaOrderListState = NonNullable<Awaited<ReturnType<typeof getIdenaOrderListState>>>;


export async function getIdenaOrderListState() {
  const { Contract } = idenaProvider;

  const results = []
  let current
  let i = 0
  while (current = await Contract.readMap(CONTRACTS.idena.sellIdna, "activeOrders", numToHex(i++), CAF.Hex).catch(handleNilData('getIdenaOrderListState'))) {
    results.push(current)
  }

  const [dnaStates, xdaiStates] = await Promise.all([Promise.all(results.map(getIdenaOrderState)), Promise.all(results.map(readXdaiConfirmedOrder))])

  const orders: { dnaState: IdenaOrderState, xdaiState: XdaiConfirmedOrder, hash: string }[] = []

  results.forEach((hash, i) => {
    if (!dnaStates[i]) return
    if (!xdaiStates[i]) return
    orders.push({ dnaState: (dnaStates[i] as IdenaOrderState), xdaiState: (xdaiStates[i] as XdaiConfirmedOrder), hash })
  })

  console.log(orders)

  return orders
}

function numToHex(num: number) {
  return `0x${(num.toString(16).padStart(8, '0').match(/../g) as string[]).reverse().join('')}`
}