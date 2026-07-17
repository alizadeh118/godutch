import { describe, it, expect } from 'vitest'
import { computeBalances, settleUp } from './settle'
import type { Expense, Person } from './types'

const people: Person[] = [
  { id: 'a', name: 'Ann' },
  { id: 'b', name: 'Bob' },
  { id: 'c', name: 'Cy' },
]

function expense(partial: Partial<Expense>): Expense {
  return {
    id: 'x',
    title: 't',
    amount: 0,
    payerId: 'a',
    shareIds: ['a', 'b', 'c'],
    ...partial,
  }
}

/** Exact zero-sum check in the integer (×1000) scale — avoids float noise. */
const scaledSum = (balances: Record<string, number>) =>
  Object.values(balances).reduce((s, b) => s + Math.round(b * 1000), 0)

describe('computeBalances', () => {
  it('credits the payer and debits every share member', () => {
    // Ann pays 300 split 3 ways => Ann +200 net, Bob -100, Cy -100
    const balances = computeBalances(people, [expense({ amount: 300, payerId: 'a' })])
    expect(balances).toEqual({ a: 200, b: -100, c: -100 })
  })

  it('always nets to zero, even with a non-divisible amount', () => {
    const balances = computeBalances(people, [expense({ amount: 100, payerId: 'a' })])
    expect(scaledSum(balances)).toBe(0)
  })

  it('handles decimal amounts and stays exact', () => {
    // Ann pays 2.5 split 3 ways => shares 0.834 / 0.833 / 0.833
    const balances = computeBalances(people, [expense({ amount: 2.5, payerId: 'a' })])
    expect(balances).toEqual({ a: 1.666, b: -0.833, c: -0.833 })
    expect(scaledSum(balances)).toBe(0)
  })

  it('nets to zero on mixed / partial shares (the old buggy case)', () => {
    const expenses: Expense[] = [
      expense({ id: '1', amount: 100, payerId: 'a', shareIds: ['a', 'b', 'c'] }), // all
      expense({ id: '2', amount: 50, payerId: 'b', shareIds: ['b', 'c'] }), // subset
      expense({ id: '3', amount: 15.75, payerId: 'c', shareIds: ['a', 'c'] }), // subset, decimal
    ]
    const balances = computeBalances(people, expenses)
    expect(scaledSum(balances)).toBe(0)
  })

  it('skips expenses with unknown payer or no share members (preserves zero-sum)', () => {
    const expenses: Expense[] = [
      expense({ id: '1', amount: 100, payerId: 'ghost', shareIds: ['a', 'b'] }),
      expense({ id: '2', amount: 100, payerId: 'a', shareIds: [] }),
      expense({ id: '3', amount: 90, payerId: 'a', shareIds: ['a', 'b', 'c'] }),
    ]
    const balances = computeBalances(people, expenses)
    expect(balances).toEqual({ a: 60, b: -30, c: -30 })
    expect(Object.values(balances).reduce((s, b) => s + b, 0)).toBe(0)
  })
})

describe('settleUp', () => {
  it('produces transactions that exactly clear every balance', () => {
    const balances = { a: 200, b: -100, c: -100 }
    const txns = settleUp(balances)
    // apply the plan and confirm everyone ends at zero
    const net = { ...balances }
    for (const t of txns) {
      net[t.from as keyof typeof net] += t.amount
      net[t.to as keyof typeof net] -= t.amount
    }
    expect(Object.values(net).every((v) => v === 0)).toBe(true)
  })

  it('never emits a zero or negative amount', () => {
    const txns = settleUp({ a: 200, b: -100, c: -100 })
    expect(txns.every((t) => t.amount > 0)).toBe(true)
  })

  it('clears decimal balances exactly', () => {
    const balances = { a: 1.666, b: -0.833, c: -0.833 }
    const txns = settleUp(balances)
    const net = { ...balances }
    for (const t of txns) {
      net[t.from as keyof typeof net] += t.amount
      net[t.to as keyof typeof net] -= t.amount
    }
    expect(scaledSum(net)).toBe(0)
    expect(Object.values(net).every((v) => Math.round(v * 1000) === 0)).toBe(true)
  })

  it('is minimal for a simple two-party debt', () => {
    expect(settleUp({ a: 100, b: -100 })).toEqual([{ from: 'b', to: 'a', amount: 100 }])
  })

  it('returns nothing when all settled', () => {
    expect(settleUp({ a: 0, b: 0 })).toEqual([])
  })

  it('is deterministic for equal amounts', () => {
    const once = settleUp({ a: 100, b: 100, c: -100, d: -100 })
    const twice = settleUp({ a: 100, b: 100, c: -100, d: -100 })
    expect(once).toEqual(twice)
  })
})
