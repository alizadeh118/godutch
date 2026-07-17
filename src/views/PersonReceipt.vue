<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import type { ID } from '@/domain/types'
import { useTripsStore } from '@/stores/trips'
import { splitEvenly } from '@/domain/money'
import { useMoney } from '@/composables/useMoney'
import EditPerson from '@/components/EditPerson.vue'
import RemovePerson from '@/components/RemovePerson.vue'

const props = defineProps<{ personId: ID }>()

const store = useTripsStore()
const router = useRouter()
const { t, locale } = useI18n()
const { money } = useMoney()
const { people, expenses, balances, peopleById } = storeToRefs(store)

const listSeparator = computed(() => (locale.value === 'fa' ? '، ' : ', '))

const tab = ref<'costs' | 'payments'>('costs')

const person = computed(() => people.value.find((p) => p.id === props.personId))
const balance = computed(() => balances.value[props.personId] ?? 0)

/** This person's split portion of each expense they share in. */
const sharedItems = computed(() =>
  expenses.value
    .filter((e) => e.shareIds.includes(props.personId))
    .map((e) => {
      const idx = e.shareIds.indexOf(props.personId)
      const portion = splitEvenly(e.amount, e.shareIds.length)[idx]
      return { ...e, portion }
    }),
)
const paidItems = computed(() => expenses.value.filter((e) => e.payerId === props.personId))

const totalCost = computed(() => sharedItems.value.reduce((s, i) => s + i.portion, 0))
const totalPay = computed(() => paidItems.value.reduce((s, i) => s + i.amount, 0))

// If the person was removed / trip switched, go back.
watchEffect(() => {
  if (!person.value) router.replace({ name: 'receipt' })
})
</script>

<template>
  <div v-if="person">
    <div class="d-flex align-center">
      <EditPerson :person-id="person.id" />
      <v-spacer />
      <RemovePerson :person-id="person.id" />
    </div>

    <div class="text-center mb-4">
      <h1 class="text-h5">{{ person.name }}</h1>
      <p v-if="balance < 0" class="text-error">
        {{ t('receipt.mustPay') }} <strong>{{ money(-balance) }}</strong>
      </p>
      <p v-else-if="balance > 0" class="text-success">
        {{ t('receipt.getsBack') }} <strong>{{ money(balance) }}</strong>
      </p>
      <p v-else class="text-medium-emphasis">{{ t('person.settledUp') }}</p>
    </div>

    <v-tabs v-model="tab" grow class="mb-2">
      <v-tab value="costs">{{ t('person.costs') }}</v-tab>
      <v-tab value="payments">{{ t('person.payments') }}</v-tab>
    </v-tabs>

    <v-window v-model="tab">
      <v-window-item value="costs">
        <v-list lines="two">
          <v-list-item
            v-for="item in sharedItems"
            :key="item.id"
            :title="`${item.title} — ${money(item.portion)}`"
            :subtitle="
              item.payerId === person.id
                ? t('person.paidByYou')
                : t('person.paidBy', { name: peopleById[item.payerId] })
            "
          />
          <v-divider />
          <v-list-item class="text-center text-primary">
            <v-list-item-title>
              {{ t('person.totalCosts', { amount: money(totalCost) }) }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-window-item>

      <v-window-item value="payments">
        <v-list lines="two">
          <v-list-item
            v-for="item in paidItems"
            :key="item.id"
            :title="`${item.title} — ${money(item.amount)}`"
            :subtitle="
              t('person.sharedBetween', {
                names: item.shareIds
                  .map((id) => (id === person!.id ? t('person.youCap') : peopleById[id]))
                  .join(listSeparator),
              })
            "
          />
          <v-divider />
          <v-list-item class="text-center text-primary">
            <v-list-item-title>
              {{ t('person.totalPayments', { amount: money(totalPay) }) }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-window-item>
    </v-window>
  </div>
</template>
