import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useEventsStore } from './events'

function setup() {
  const store = useEventsStore()
  store.createEvent('Event')
  const ann = store.addPerson('Ann')!
  const bob = store.addPerson('Bob')!
  const cy = store.addPerson('Cy')!
  return { store, ann, bob, cy }
}

describe('events store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('events', () => {
    it('creates an event and makes it active', () => {
      const store = useEventsStore()
      const id = store.createEvent('Kish')
      expect(store.activeEventId).toBe(id)
      expect(store.activeEvent?.name).toBe('Kish')
      expect(store.people).toEqual([])
    })

    it('deletes an event and clears the active id when it was active', () => {
      const store = useEventsStore()
      const id = store.createEvent('Kish')
      store.deleteEvent(id)
      expect(store.events).toHaveLength(0)
      expect(store.activeEventId).toBeNull()
    })

    it('deleting a non-active event keeps the active one', () => {
      const store = useEventsStore()
      const other = store.createEvent('Other')
      const active = store.createEvent('Active')
      store.deleteEvent(other)
      expect(store.activeEventId).toBe(active)
    })
  })

  describe('people & expenses', () => {
    it('adds and updates people on the active event', () => {
      const { store, ann } = setup()
      expect(store.people).toHaveLength(3)
      store.updatePerson(ann, 'Anne')
      expect(store.people.find((p) => p.id === ann)?.name).toBe('Anne')
    })

    it('adds an expense', () => {
      const { store, ann, bob, cy } = setup()
      store.addExpense({ title: 'Dinner', amount: 300, payerId: ann, shareIds: [ann, bob, cy] })
      expect(store.expenses).toHaveLength(1)
      expect(store.expenses[0].amount).toBe(300)
    })

    it('returns null when there is no active event', () => {
      const store = useEventsStore()
      expect(store.addPerson('X')).toBeNull()
      expect(store.addExpense({ title: 'x', amount: 1, payerId: 'a', shareIds: ['a'] })).toBeNull()
    })
  })

  describe('balances & settlement', () => {
    it('computes balances that net to zero', () => {
      const { store, ann, bob, cy } = setup()
      store.addExpense({ title: 'Dinner', amount: 300, payerId: ann, shareIds: [ann, bob, cy] })
      expect(store.balances).toEqual({ [ann]: 200, [bob]: -100, [cy]: -100 })
      const sum = Object.values(store.balances).reduce((s, b) => s + b, 0)
      expect(sum).toBe(0)
    })

    it('produces a settle-up plan that clears every balance', () => {
      const { store, ann, bob, cy } = setup()
      store.addExpense({ title: 'Dinner', amount: 300, payerId: ann, shareIds: [ann, bob, cy] })
      const plan = store.settlement
      const net = { ...store.balances }
      for (const t of plan) {
        net[t.from] += t.amount
        net[t.to] -= t.amount
      }
      expect(Object.values(net).every((v) => v === 0)).toBe(true)
    })

    it('averages total spend per person', () => {
      const { store, ann, bob, cy } = setup()
      store.addExpense({ title: 'Dinner', amount: 300, payerId: ann, shareIds: [ann, bob, cy] })
      expect(store.perPerson).toBe(100)
    })
  })

  describe('removePerson', () => {
    it('reassigns the payer and drops the person from shares', () => {
      const { store, ann, bob, cy } = setup()
      store.addExpense({ title: 'Dinner', amount: 300, payerId: ann, shareIds: [ann, bob, cy] })
      store.removePerson(ann, bob)

      expect(store.people.find((p) => p.id === ann)).toBeUndefined()
      const expense = store.expenses[0]
      expect(expense.payerId).toBe(bob) // reassigned
      expect(expense.shareIds).toEqual([bob, cy]) // ann dropped
    })
  })
})
