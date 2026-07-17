<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useEventsStore } from '@/stores/events'
import { useAmount } from '@/composables/useAmount'
import { avatarColor, initials } from '@/composables/useAvatar'

const store = useEventsStore()
const router = useRouter()
const { t, locale } = useI18n()
const { format } = useAmount()
const { people, expenses, balances, settlement, peopleById, totalSpent, perPerson } =
  storeToRefs(store)

const isRtl = computed(() => locale.value === 'fa')
const settleArrow = computed(() => (isRtl.value ? 'mdi-arrow-left' : 'mdi-arrow-right'))

const newName = ref('')
const nameError = computed(() => {
  const v = newName.value.trim().toLowerCase()
  if (!v) return ''
  if (people.value.some((p) => p.name.toLowerCase() === v)) return t('common.alreadyExists')
  return ''
})

function addPerson() {
  const name = newName.value.trim()
  if (!name || nameError.value) return
  store.addPerson(name.charAt(0).toUpperCase() + name.slice(1))
  newName.value = ''
}

function openPerson(id: string) {
  router.push({ name: 'person-receipt', params: { personId: id } })
}

const balanceOf = (id: string) => balances.value[id] ?? 0
function balanceLabel(b: number) {
  if (b < 0) return t('receipt.mustPay')
  if (b > 0) return t('receipt.getsBack')
  return t('receipt.settled')
}
function balanceChip(b: number) {
  if (b < 0) return { color: 'error', text: `− ${format(-b)}` }
  if (b > 0) return { color: 'success', text: `+ ${format(b)}` }
  return { color: undefined, text: t('receipt.settled') }
}
</script>

<template>
  <div class="d-flex flex-column ga-4">
    <!-- Summary -->
    <v-card v-if="people.length" rounded="lg" elevation="1" class="pa-4">
      <div class="text-overline text-medium-emphasis">{{ t('summary.total') }}</div>
      <div class="text-h4 font-weight-bold">{{ format(totalSpent) }}</div>
      <div class="d-flex ga-8 mt-3">
        <div>
          <div class="text-h6">{{ format(people.length) }}</div>
          <div class="text-caption text-medium-emphasis">{{ t('summary.people') }}</div>
        </div>
        <div>
          <div class="text-h6">{{ format(expenses.length) }}</div>
          <div class="text-caption text-medium-emphasis">{{ t('summary.items') }}</div>
        </div>
        <div>
          <div class="text-h6">{{ format(perPerson) }}</div>
          <div class="text-caption text-medium-emphasis">{{ t('summary.perPerson') }}</div>
        </div>
      </div>
    </v-card>

    <!-- Add person -->
    <v-text-field
      v-model="newName"
      :label="t('receipt.newPerson')"
      :error-messages="nameError"
      variant="solo-filled"
      flat
      rounded="lg"
      hide-details="auto"
      prepend-inner-icon="mdi-account-plus"
      @keyup.enter="addPerson"
    >
      <template #append-inner>
        <v-btn
          icon="mdi-plus"
          size="small"
          color="primary"
          variant="flat"
          :disabled="!newName.trim() || !!nameError"
          @click="addPerson"
        />
      </template>
    </v-text-field>

    <!-- People & balances -->
    <v-card v-if="people.length" rounded="lg" elevation="1">
      <v-list class="py-0">
        <template v-for="(person, i) in people" :key="person.id">
          <v-list-item class="py-2" @click="openPerson(person.id)">
            <template #prepend>
              <v-avatar :color="avatarColor(person.name)" size="42">
                <span class="text-white font-weight-medium">{{ initials(person.name) }}</span>
              </v-avatar>
            </template>
            <v-list-item-title class="font-weight-medium">{{ person.name }}</v-list-item-title>
            <v-list-item-subtitle>{{ balanceLabel(balanceOf(person.id)) }}</v-list-item-subtitle>
            <template #append>
              <v-chip
                :color="balanceChip(balanceOf(person.id)).color"
                variant="tonal"
                size="small"
                label
              >
                {{ balanceChip(balanceOf(person.id)).text }}
              </v-chip>
            </template>
          </v-list-item>
          <v-divider v-if="i < people.length - 1" inset />
        </template>
      </v-list>
    </v-card>

    <v-card v-else variant="tonal" rounded="lg" class="text-center pa-8">
      <v-icon size="64" color="grey">mdi-account-group-outline</v-icon>
      <p class="mt-3 text-medium-emphasis">{{ t('receipt.empty') }}</p>
    </v-card>

    <!-- Settle up -->
    <v-card v-if="settlement.length" rounded="lg" elevation="2" color="primary" variant="tonal">
      <v-card-title class="d-flex align-center ga-2 text-subtitle-1">
        <v-icon>mdi-swap-horizontal</v-icon>
        {{ t('receipt.settleUp') }}
      </v-card-title>
      <v-list class="bg-transparent py-0">
        <v-list-item v-for="(txn, i) in settlement" :key="i" class="py-2">
          <div class="d-flex align-center ga-2 flex-wrap">
            <v-avatar :color="avatarColor(peopleById[txn.from])" size="28">
              <span class="text-caption text-white">{{ initials(peopleById[txn.from]) }}</span>
            </v-avatar>
            <span class="font-weight-medium">{{ peopleById[txn.from] }}</span>
            <v-icon size="small" class="text-medium-emphasis">{{ settleArrow }}</v-icon>
            <v-avatar :color="avatarColor(peopleById[txn.to])" size="28">
              <span class="text-caption text-white">{{ initials(peopleById[txn.to]) }}</span>
            </v-avatar>
            <span class="font-weight-medium">{{ peopleById[txn.to] }}</span>
            <v-spacer />
            <span class="font-weight-bold">{{ format(txn.amount) }}</span>
          </div>
        </v-list-item>
      </v-list>
    </v-card>
  </div>
</template>
