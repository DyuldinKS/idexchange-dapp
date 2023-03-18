import BigNumber from 'bignumber.js';

BigNumber.config({
  ROUNDING_MODE: BigNumber.ROUND_DOWN,
  EXPONENTIAL_AT: 1e9,
  DECIMAL_PLACES: 18,
});

export const BN = (num: BigNumber.Value): BigNumber => new BigNumber(num);

export function getDisplayAmount(
  value: BigNumber.Value,
  { decimals = 18, round = 4, cut = true } = {},
) {
  const res = BN(value).div(BN(10).pow(decimals));
  if (!cut) return res.toString();

  const getFirstTwoNonZeroValues = /^-?\d*\.?0*\d{0,2}/;
  if (BN(res).lt(0.0001)) return (res.toString().match(getFirstTwoNonZeroValues) || ['0'])[0];
  if (res.toString().includes('.')) return res.toString().slice(0, res.toString().indexOf('.') + 5);
  return res.toFixed(round);
}

export function getAtomicAmount(value: string, decimals = 18) {
  return BN(value).times(BN(10).pow(decimals)).toFixed(0);
}

export const safeBN = (n: string) => {
  try {
    return BN(n);
  } catch (err) {
    return null;
  }
};
