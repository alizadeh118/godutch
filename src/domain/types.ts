/** A stable unique id (crypto.randomUUID). */
export type ID = string

export interface Person {
  id: ID
  name: string
}

export interface Expense {
  id: ID
  title: string
  /** Integer amount in the trip currency's minor units (e.g. cents). Never a float. */
  amount: number
  /** Person who paid the full amount up front. */
  payerId: ID
  /** People this expense is split between. Must contain at least one id. */
  shareIds: ID[]
}

export interface Trip {
  id: ID
  name: string
  /** ISO-4217 currency code, e.g. 'USD', 'EUR', 'IRR'. */
  currency: string
  people: Person[]
  expenses: Expense[]
  /** ISO-8601 creation timestamp. */
  createdAt: string
}

/** A single "X pays Y" instruction in a settle-up plan. */
export interface Transaction {
  from: ID
  to: ID
  /** Integer minor units, always > 0. */
  amount: number
}
