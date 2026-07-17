/**
 * Money is always represented as an integer number of minor units (e.g. cents).
 * These helpers keep every split exact so that no fraction of a unit is ever
 * lost or invented — the sum of the parts always equals the original amount.
 */

/**
 * Split an integer `amount` into `count` shares as evenly as possible.
 *
 * The remainder (amount % count) is distributed one unit at a time to the
 * first shares, so the returned array always sums exactly to `amount`.
 * Distribution is deterministic given the share order.
 *
 * @example splitEvenly(100, 3) -> [34, 33, 33]
 */
export function splitEvenly(amount: number, count: number): number[] {
  if (!Number.isInteger(amount)) {
    throw new Error(`amount must be an integer number of minor units, got ${amount}`)
  }
  if (count <= 0) return []

  const base = Math.trunc(amount / count)
  const remainder = amount - base * count // in [0, count) for amount >= 0
  const shares = new Array<number>(count).fill(base)
  for (let i = 0; i < remainder; i++) shares[i] += 1
  return shares
}
