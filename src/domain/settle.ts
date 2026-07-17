import type { Expense, ID, Person, Transaction } from './types'
import { splitEvenly } from './money'

/**
 * Amounts can carry up to 3 decimals. All splitting and balance arithmetic is
 * done in this integer scale (×1000) so nothing is ever lost to float error;
 * results are divided back to plain numbers only at the boundary.
 */
const SCALE = 1000
const toScaled = (value: number) => Math.round(value * SCALE)
const fromScaled = (value: number) => value / SCALE

/**
 * Net balance per person.
 *   balance = (total this person paid) - (total this person owes)
 * Positive  => they are owed money (creditor).
 * Negative  => they owe money (debtor).
 *
 * Each expense credits its payer the full amount and debits exactly that same
 * amount across its share members, so the scaled balances always sum to 0.
 * Expenses whose payer or share members are unknown, or that have no share
 * members, are skipped so this invariant is preserved.
 */
export function computeBalances(people: Person[], expenses: Expense[]): Record<ID, number> {
  const scaled: Record<ID, number> = {}
  for (const p of people) scaled[p.id] = 0

  const known = (id: ID) => Object.prototype.hasOwnProperty.call(scaled, id)

  for (const e of expenses) {
    const shareIds = e.shareIds.filter(known)
    if (shareIds.length === 0 || !known(e.payerId)) continue

    const amount = toScaled(e.amount)
    scaled[e.payerId] += amount
    const shares = splitEvenly(amount, shareIds.length)
    shareIds.forEach((pid, i) => {
      scaled[pid] -= shares[i]
    })
  }

  const balances: Record<ID, number> = {}
  for (const id in scaled) balances[id] = fromScaled(scaled[id])
  return balances
}

/**
 * Turn net balances into a minimal-ish set of "who pays whom" transactions
 * using the classic greedy match: repeatedly settle the largest debtor
 * against the largest creditor. Ordering is deterministic (by amount, then id)
 * so the same input always yields the same plan. Runs in the integer scale.
 */
export function settleUp(balances: Record<ID, number>): Transaction[] {
  const byAmountThenId = (a: { id: ID; amount: number }, b: { id: ID; amount: number }) =>
    b.amount - a.amount || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)

  const debtors = Object.entries(balances)
    .map(([id, b]) => ({ id, amount: toScaled(b) }))
    .filter((d) => d.amount < 0)
    .map((d) => ({ id: d.id, amount: -d.amount }))
    .sort(byAmountThenId)
  const creditors = Object.entries(balances)
    .map(([id, b]) => ({ id, amount: toScaled(b) }))
    .filter((c) => c.amount > 0)
    .sort(byAmountThenId)

  const transactions: Transaction[] = []
  let i = 0
  let j = 0
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amount, creditors[j].amount)
    transactions.push({ from: debtors[i].id, to: creditors[j].id, amount: fromScaled(pay) })
    debtors[i].amount -= pay
    creditors[j].amount -= pay
    if (debtors[i].amount === 0) i++
    if (creditors[j].amount === 0) j++
  }

  return transactions
}
