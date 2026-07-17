import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Expense, ID, Event } from '@/domain/types'
import { computeBalances, settleUp } from '@/domain/settle'

const uid = (): ID => crypto.randomUUID()

export const useEventsStore = defineStore(
  'events',
  () => {
    const events = ref<Event[]>([])
    const activeEventId = ref<ID | null>(null)

    const activeEvent = computed<Event | null>(
      () => events.value.find((t) => t.id === activeEventId.value) ?? null,
    )
    const people = computed(() => activeEvent.value?.people ?? [])
    const expenses = computed(() => activeEvent.value?.expenses ?? [])

    /** person id -> name, for quick lookup in views. */
    const peopleById = computed<Record<ID, string>>(() =>
      Object.fromEntries(people.value.map((p) => [p.id, p.name])),
    )

    const balances = computed<Record<ID, number>>(() =>
      computeBalances(people.value, expenses.value),
    )
    const settlement = computed(() => settleUp(balances.value))
    /** Total of expenses shared by everyone — used for the "per person" chip. */
    const totalSpent = computed(() => expenses.value.reduce((sum, e) => sum + e.amount, 0))
    const perPerson = computed(() =>
      people.value.length ? totalSpent.value / people.value.length : 0,
    )

    // ---- events -------------------------------------------------------------
    function createEvent(name: string, createdAt = new Date().toISOString()): ID {
      const event: Event = { id: uid(), name, people: [], expenses: [], createdAt }
      events.value.push(event)
      activeEventId.value = event.id
      return event.id
    }

    function deleteEvent(id: ID) {
      events.value = events.value.filter((t) => t.id !== id)
      if (activeEventId.value === id) activeEventId.value = null
    }

    function setActiveEvent(id: ID | null) {
      activeEventId.value = id
    }

    // ---- people ------------------------------------------------------------
    function addPerson(name: string): ID | null {
      if (!activeEvent.value) return null
      const id = uid()
      activeEvent.value.people.push({ id, name })
      return id
    }

    function updatePerson(id: ID, name: string) {
      const person = activeEvent.value?.people.find((p) => p.id === id)
      if (person) person.name = name
    }

    /**
     * Remove a person. Expenses they paid for are reassigned to `alterPayerId`;
     * they are dropped from every share list.
     */
    function removePerson(id: ID, alterPayerId?: ID) {
      const event = activeEvent.value
      if (!event) return
      for (const e of event.expenses) {
        if (e.payerId === id && alterPayerId) e.payerId = alterPayerId
        e.shareIds = e.shareIds.filter((pid) => pid !== id)
      }
      event.people = event.people.filter((p) => p.id !== id)
    }

    // ---- expenses ----------------------------------------------------------
    function addExpense(data: Omit<Expense, 'id'>): ID | null {
      if (!activeEvent.value) return null
      const id = uid()
      activeEvent.value.expenses.push({ id, ...data })
      return id
    }

    function updateExpense(expense: Expense) {
      const event = activeEvent.value
      if (!event) return
      const idx = event.expenses.findIndex((e) => e.id === expense.id)
      if (idx !== -1) event.expenses[idx] = { ...expense }
    }

    function removeExpense(id: ID) {
      const event = activeEvent.value
      if (event) event.expenses = event.expenses.filter((e) => e.id !== id)
    }

    return {
      events,
      activeEventId,
      activeEvent,
      people,
      expenses,
      peopleById,
      balances,
      settlement,
      totalSpent,
      perPerson,
      createEvent,
      deleteEvent,
      setActiveEvent,
      addPerson,
      updatePerson,
      removePerson,
      addExpense,
      updateExpense,
      removeExpense,
    }
  },
  {
    persist: {
      key: 'godutch',
      pick: ['events', 'activeEventId'],
    },
  },
)
