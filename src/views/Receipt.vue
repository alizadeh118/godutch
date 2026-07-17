<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useTripsStore } from '@/stores/trips'
import { useMoney } from '@/composables/useMoney'

const store = useTripsStore()
const router = useRouter()
const { t } = useI18n()
const { money } = useMoney()
const { people, balances, settlement, peopleById } = storeToRefs(store)

const absMoney = (minor: number) => money(Math.abs(minor))

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
</script>

<template>
  <div>
    <div class="d-flex align-center ga-2 mb-2">
      <v-text-field
        v-model="newName"
        :label="t('receipt.newPerson')"
        :error-messages="nameError"
        hide-details="auto"
        density="comfortable"
        @keyup.enter="addPerson"
      />
      <v-btn color="primary" :disabled="!newName.trim() || !!nameError" @click="addPerson">
        {{ t('common.add') }}
      </v-btn>
    </div>

    <v-list v-if="people.length" lines="two">
      <v-list-item
        v-for="person in people"
        :key="person.id"
        :title="`${person.name} — ${absMoney(balances[person.id] ?? 0)}`"
        @click="openPerson(person.id)"
      >
        <template #subtitle>
          <span v-if="(balances[person.id] ?? 0) < 0" class="text-error">
            {{ t('receipt.mustPay') }}
          </span>
          <span v-else-if="(balances[person.id] ?? 0) > 0" class="text-success">
            {{ t('receipt.getsBack') }}
          </span>
          <span v-else class="text-medium-emphasis">{{ t('receipt.settled') }}</span>
        </template>
        <template #append>
          <v-icon color="grey">mdi-chevron-right</v-icon>
        </template>
      </v-list-item>
    </v-list>

    <v-card v-else variant="tonal" class="text-center pa-8">
      <v-icon size="64" color="grey">mdi-account-group-outline</v-icon>
      <p class="mt-3 text-medium-emphasis">{{ t('receipt.empty') }}</p>
    </v-card>

    <template v-if="settlement.length">
      <v-divider class="my-4" />
      <h3 class="text-subtitle-1 mb-2">{{ t('receipt.settleUp') }}</h3>
      <v-list density="compact">
        <v-list-item v-for="(txn, i) in settlement" :key="i">
          <template #prepend>
            <v-icon color="primary" class="me-2">mdi-arrow-right-thin</v-icon>
          </template>
          <v-list-item-title>
            {{
              t('receipt.pays', {
                from: peopleById[txn.from],
                to: peopleById[txn.to],
                amount: money(txn.amount),
              })
            }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </template>
  </div>
</template>
