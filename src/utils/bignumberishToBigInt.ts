import { BigNumber } from 'ethers';

export default function(amount: BigNumber): bigint {
  return BigInt(amount.toHexString())
}