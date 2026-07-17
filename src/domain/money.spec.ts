import { describe, it, expect } from 'vitest'
import { splitEvenly } from './money'

describe('splitEvenly', () => {
  it('splits evenly when divisible', () => {
    expect(splitEvenly(100, 4)).toEqual([25, 25, 25, 25])
  })

  it('distributes the remainder to the leading shares', () => {
    expect(splitEvenly(100, 3)).toEqual([34, 33, 33])
    expect(splitEvenly(10, 3)).toEqual([4, 3, 3])
  })

  it('always sums back to the original amount', () => {
    for (const amount of [0, 1, 7, 99, 100, 12345, 1_000_000]) {
      for (const count of [1, 2, 3, 4, 7, 13]) {
        const parts = splitEvenly(amount, count)
        expect(parts).toHaveLength(count)
        expect(parts.reduce((a, b) => a + b, 0)).toBe(amount)
      }
    }
  })

  it('handles a single share', () => {
    expect(splitEvenly(999, 1)).toEqual([999])
  })

  it('returns an empty array for zero shares', () => {
    expect(splitEvenly(100, 0)).toEqual([])
  })

  it('rejects non-integer amounts (no floats allowed)', () => {
    expect(() => splitEvenly(10.5, 2)).toThrow()
  })
})
