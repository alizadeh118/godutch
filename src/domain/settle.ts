import type { Expense, ID, Person, Transaction } from './types'
import { splitEvenly } from './money'

/**
 * Net balance per person, in minor units.
 *   balance = (total this person paid) - (total this person owes)
 * Positive  => they are owed money (creditor).
 * Negative  => they owe money (debtor).
 *
 * Because each expense credits its payer the full amount and debits exactly
 * that same amount across its share members, the balances always sum to 0.
 * Expenses whose payer or share members are unknown, or that have no share
 * members, are skipped so this invariant is preserved.
 */
export function computeBalances(people: Person[], expenses: Expense[]): Record<ID, number> {
  const balances: Record<ID, number> = {}
  for (const p of people) balances[p.id] = 0

  const known = (id: ID) => Object.prototype.hasOwnProperty.call(balances, id)

  for (const e of expenses) {
    const shareIds = e.shareIds.filter(known)
    if (shareIds.length === 0 || !known(e.payerId)) continue

    balances[e.payerId] += e.amount
    const shares = splitEvenly(e.amount, shareIds.length)
    shareIds.forEach((pid, i) => {
      balances[pid] -= shares[i]
    })
  }

  return balances
}

/**
 * Turn net balances into a minimal-ish set of "who pays whom" transactions
 * using the classic greedy match: repeatedly settle the largest debtor
 * against the largest creditor. Ordering is deterministic (by amount, then
 * id) so the same input always yields the same plan. All amounts stay integer.
 */
export function settleUp(balances: Record<ID, number>): Transaction[] {
  const byAmountThenId = (a: { id: ID; amount: number }, b: { id: ID; amount: number }) =>
    b.amount - a.amount || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)

  const debtors = Object.entries(balances)
    .filter(([, b]) => b < 0)
    .map(([id, b]) => ({ id, amount: -b }))
    .sort(byAmountThenId)
  const creditors = Object.entries(balances)
    .filter(([, b]) => b > 0)
    .map(([id, b]) => ({ id, amount: b }))
    .sort(byAmountThenId)

  const transactions: Transaction[] = []
  let i = 0
  let j = 0
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amount, creditors[j].amount)
    transactions.push({ from: debtors[i].id, to: creditors[j].id, amount: pay })
    debtors[i].amount -= pay
    creditors[j].amount -= pay
    if (debtors[i].amount === 0) i++
    if (creditors[j].amount === 0) j++
  }

  return transactions
}
