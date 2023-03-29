const ONE = 10n ** 18n

export default function(amount: string): bigint {
  const dotIndex = amount.indexOf('.')
  if (dotIndex === -1) {
    return BigInt(amount) * ONE
  }
  const afterDot = BigInt(amount.substring(dotIndex + 1).padEnd(18, '0'))
  return BigInt(amount.substring(0, dotIndex)) * ONE + afterDot
}