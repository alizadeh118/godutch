import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia, type Pinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import { mountWith } from '@/test/mount'
import { useTripsStore } from '@/stores/trips'
import ExpenseForm from './ExpenseForm.vue'

interface Exposed {
  submit: () => Promise<boolean>
}
interface SubmitPayload {
  title: string
  amount: number
  payerId: string
  shareIds: string[]
}

describe('ExpenseForm', () => {
  let pinia: Pinia
  let ann: string
  let bob: string

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    const store = useTripsStore()
    store.createTrip('Trip', 'USD')
    ann = store.addPerson('Ann')!
    bob = store.addPerson('Bob')!
  })

  const mountForm = () => mountWith(ExpenseForm, { global: { plugins: [pinia] } })

  it('emits a normalized expense on a valid submit', async () => {
    const wrapper = mountForm()
    const fields = wrapper.findAllComponents({ name: 'VTextField' })
    await fields[0].find('input').setValue('dinner') // title
    await fields[1].find('input').setValue('12.50') // price

    const ok = await (wrapper.vm as unknown as Exposed).submit()
    await flushPromises()

    expect(ok).toBe(true)
    const emitted = wrapper.emitted('submit')
    expect(emitted).toBeTruthy()
    const payload = emitted![0][0] as SubmitPayload
    expect(payload.title).toBe('Dinner') // capitalized
    expect(payload.amount).toBe(1250) // integer minor units
    expect(payload.payerId).toBe(ann) // default payer = first person
    expect(payload.shareIds).toEqual([ann, bob]) // default share = everyone
  })

  it('does not emit when required fields are empty', async () => {
    const wrapper = mountForm()
    const ok = await (wrapper.vm as unknown as Exposed).submit()
    await flushPromises()

    expect(ok).toBe(false)
    expect(wrapper.emitted('submit')).toBeUndefined()
  })
})
