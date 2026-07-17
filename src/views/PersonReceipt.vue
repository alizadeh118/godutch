<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import type { ID } from '@/domain/types'
import { useTripsStore } from '@/stores/trips'
import { splitEvenly } from '@/domain/money'
import { useMoney } from '@/composables/useMoney'
import { avatarColor, initials } from '@/composables/useAvatar'
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

const headerBalance = computed(() => {
  const b = balance.value
  if (b < 0) return { color: 'error', text: `${t('receipt.mustPay')} ${money(-b)}` }
  if (b > 0) return { color: 'success', text: `${t('receipt.getsBack')} ${money(b)}` }
  return { color: undefined, text: t('person.settledUp') }
})

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
  <div v-if="person" class="d-flex flex-column ga-4">
    <!-- Header -->
    <v-card rounded="lg" elevation="1" class="pa-4">
      <div class="d-flex justify-space-between">
        <EditPerson :person-id="person.id" />
        <RemovePerson :person-id="person.id" />
      </div>
      <div class="text-center">
        <v-avatar :color="avatarColor(person.name)" size="72" class="mb-2">
          <span class="text-h5 text-white">{{ initials(person.name) }}</span>
        </v-avatar>
        <div class="text-h6">{{ person.name }}</div>
        <v-chip :color="headerBalance.color" variant="tonal" class="mt-2" label>
          {{ headerBalance.text }}
        </v-chip>
      </div>
    </v-card>

    <!-- Costs / payments -->
    <v-card rounded="lg" elevation="1">
      <v-tabs v-model="tab" grow color="primary">
        <v-tab value="costs">{{ t('person.costs') }}</v-tab>
        <v-tab value="payments">{{ t('person.payments') }}</v-tab>
      </v-tabs>

      <v-window v-model="tab">
        <v-window-item value="costs">
          <v-list class="py-0">
            <v-list-item v-for="item in sharedItems" :key="item.id" class="py-2">
              <v-list-item-title class="font-weight-medium">{{ item.title }}</v-list-item-title>
              <v-list-item-subtitle>
                {{
                  item.payerId === person.id
                    ? t('person.paidByYou')
                    : t('person.paidBy', { name: peopleById[item.payerId] })
                }}
              </v-list-item-subtitle>
              <template #append>
                <span class="font-weight-bold">{{ money(item.portion) }}</span>
              </template>
            </v-list-item>
            <v-divider />
            <v-list-item class="py-2">
              <v-list-item-title class="text-medium-emphasis">
                {{ t('person.costs') }}
              </v-list-item-title>
              <template #append>
                <span class="font-weight-bold text-primary">{{ money(totalCost) }}</span>
              </template>
            </v-list-item>
          </v-list>
        </v-window-item>

        <v-window-item value="payments">
          <v-list class="py-0">
            <v-list-item v-for="item in paidItems" :key="item.id" class="py-2">
              <v-list-item-title class="font-weight-medium">{{ item.title }}</v-list-item-title>
              <v-list-item-subtitle>
                {{
                  t('person.sharedBetween', {
                    names: item.shareIds
                      .map((id) => (id === person!.id ? t('person.youCap') : peopleById[id]))
                      .join(listSeparator),
                  })
                }}
              </v-list-item-subtitle>
              <template #append>
                <span class="font-weight-bold">{{ money(item.amount) }}</span>
              </template>
            </v-list-item>
            <v-divider />
            <v-list-item class="py-2">
              <v-list-item-title class="text-medium-emphasis">
                {{ t('person.payments') }}
              </v-list-item-title>
              <template #append>
                <span class="font-weight-bold text-primary">{{ money(totalPay) }}</span>
              </template>
            </v-list-item>
          </v-list>
        </v-window-item>
      </v-window>
    </v-card>
  </div>
</template>
