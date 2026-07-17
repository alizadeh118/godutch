<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import type { Expense, ID } from '@/domain/types'
import { useEventsStore } from '@/stores/events'
import { parseAmount } from '@/composables/useAmount'

const { t } = useI18n()

const props = defineProps<{ expense?: Expense }>()
const emit = defineEmits<{ submit: [data: Omit<Expense, 'id'> & { id?: ID }] }>()

const store = useEventsStore()
const { people, expenses } = storeToRefs(store)

interface FormState {
  title: string
  price: string // major units, as typed
  payerId: ID | null
  shareIds: ID[]
}

/** Default payer = whoever has paid most so far, else the first person. */
function defaultPayer(): ID | null {
  const paid: Record<ID, number> = {}
  for (const e of expenses.value) paid[e.payerId] = (paid[e.payerId] ?? 0) + e.amount
  let best: ID | null = people.value[0]?.id ?? null
  let max = -1
  for (const [id, amount] of Object.entries(paid)) {
    if (amount > max) {
      max = amount
      best = id
    }
  }
  return best
}

function blankForm(): FormState {
  return {
    title: '',
    price: '',
    payerId: defaultPayer(),
    shareIds: people.value.map((p) => p.id),
  }
}

function fromExpense(e: Expense): FormState {
  return {
    title: e.title,
    price: String(e.amount),
    payerId: e.payerId,
    shareIds: [...e.shareIds],
  }
}

const form = reactive<FormState>(props.expense ? fromExpense(props.expense) : blankForm())

watch(
  () => props.expense,
  (e) => Object.assign(form, e ? fromExpense(e) : blankForm()),
)

/** Keep only digits (ASCII/Persian/Arabic) and a single decimal separator. */
function sanitizePrice(v: string): string {
  let s = v.replace(/[^\d۰-۹٠-٩.٫]/g, '')
  const sep = s.search(/[.٫]/)
  if (sep !== -1) s = s.slice(0, sep + 1) + s.slice(sep + 1).replace(/[.٫]/g, '')
  return s
}

// Reject non-numeric input as it's typed/pasted.
watch(
  () => form.price,
  (v) => {
    const clean = sanitizePrice(v)
    if (clean !== v) form.price = clean
  },
)

const formRef = ref()

const rules = {
  required: (v: unknown) => !!v || t('common.required'),
  requiredArray: (v: unknown[]) => v.length > 0 || t('common.pickAtLeastOne'),
  price: (v: string) =>
    /^[\d٠-٩۰-۹]+([.٫][\d٠-٩۰-۹]+)?$/.test(v.replace(/[,٬\s]/g, '')) || t('common.numbersOnly'),
}

const noPeople = computed(() => people.value.length === 0)

async function submit(): Promise<boolean> {
  const { valid } = await formRef.value.validate()
  if (!valid || !form.payerId) return false

  const title = form.title.charAt(0).toUpperCase() + form.title.slice(1)
  const data = {
    ...(props.expense ? { id: props.expense.id } : {}),
    title,
    amount: parseAmount(form.price),
    payerId: form.payerId,
    shareIds: [...form.shareIds],
  }
  emit('submit', data)
  if (!props.expense) Object.assign(form, blankForm())
  return true
}

defineExpose({ submit })
</script>

<template>
  <v-form ref="formRef">
    <v-alert v-if="noPeople" type="info" variant="tonal" class="mb-4">
      {{ t('expense.needPeople') }}
    </v-alert>

    <v-text-field
      v-model="form.title"
      :label="t('expense.title')"
      :rules="[rules.required]"
      prepend-inner-icon="mdi-tag-outline"
      class="mb-2"
    />
    <v-text-field
      v-model="form.price"
      :label="t('expense.price')"
      inputmode="decimal"
      :rules="[rules.required, rules.price]"
      prepend-inner-icon="mdi-cash"
      class="mb-2"
    />
    <v-select
      v-model="form.payerId"
      :label="t('expense.payer')"
      :items="people"
      item-title="name"
      item-value="id"
      :rules="[rules.required]"
      prepend-inner-icon="mdi-account-cash"
      class="mb-2"
    />
    <v-select
      v-model="form.shareIds"
      :label="t('expense.sharedBetween')"
      multiple
      chips
      :items="people"
      item-title="name"
      item-value="id"
      :rules="[rules.requiredArray]"
      prepend-inner-icon="mdi-account-multiple"
    />
  </v-form>
</template>
