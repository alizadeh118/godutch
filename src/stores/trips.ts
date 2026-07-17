import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Expense, ID, Trip } from '@/domain/types'
import { computeBalances, settleUp } from '@/domain/settle'

const uid = (): ID => crypto.randomUUID()

export const useTripsStore = defineStore(
  'trips',
  () => {
    const trips = ref<Trip[]>([])
    const activeTripId = ref<ID | null>(null)

    const activeTrip = computed<Trip | null>(
      () => trips.value.find((t) => t.id === activeTripId.value) ?? null,
    )
    const people = computed(() => activeTrip.value?.people ?? [])
    const expenses = computed(() => activeTrip.value?.expenses ?? [])
    const currency = computed(() => activeTrip.value?.currency ?? 'USD')

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
      people.value.length ? Math.round(totalSpent.value / people.value.length) : 0,
    )

    // ---- trips -------------------------------------------------------------
    function createTrip(name: string, currency = 'USD', createdAt = new Date().toISOString()): ID {
      const trip: Trip = { id: uid(), name, currency, people: [], expenses: [], createdAt }
      trips.value.push(trip)
      activeTripId.value = trip.id
      return trip.id
    }

    function deleteTrip(id: ID) {
      trips.value = trips.value.filter((t) => t.id !== id)
      if (activeTripId.value === id) activeTripId.value = null
    }

    function setActiveTrip(id: ID | null) {
      activeTripId.value = id
    }

    // ---- people ------------------------------------------------------------
    function addPerson(name: string): ID | null {
      if (!activeTrip.value) return null
      const id = uid()
      activeTrip.value.people.push({ id, name })
      return id
    }

    function updatePerson(id: ID, name: string) {
      const person = activeTrip.value?.people.find((p) => p.id === id)
      if (person) person.name = name
    }

    /**
     * Remove a person. Expenses they paid for are reassigned to `alterPayerId`;
     * they are dropped from every share list.
     */
    function removePerson(id: ID, alterPayerId?: ID) {
      const trip = activeTrip.value
      if (!trip) return
      for (const e of trip.expenses) {
        if (e.payerId === id && alterPayerId) e.payerId = alterPayerId
        e.shareIds = e.shareIds.filter((pid) => pid !== id)
      }
      trip.people = trip.people.filter((p) => p.id !== id)
    }

    // ---- expenses ----------------------------------------------------------
    function addExpense(data: Omit<Expense, 'id'>): ID | null {
      if (!activeTrip.value) return null
      const id = uid()
      activeTrip.value.expenses.push({ id, ...data })
      return id
    }

    function updateExpense(expense: Expense) {
      const trip = activeTrip.value
      if (!trip) return
      const idx = trip.expenses.findIndex((e) => e.id === expense.id)
      if (idx !== -1) trip.expenses[idx] = { ...expense }
    }

    function removeExpense(id: ID) {
      const trip = activeTrip.value
      if (trip) trip.expenses = trip.expenses.filter((e) => e.id !== id)
    }

    return {
      trips,
      activeTripId,
      activeTrip,
      people,
      expenses,
      currency,
      peopleById,
      balances,
      settlement,
      totalSpent,
      perPerson,
      createTrip,
      deleteTrip,
      setActiveTrip,
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
      pick: ['trips', 'activeTripId'],
    },
  },
)
