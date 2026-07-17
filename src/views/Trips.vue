<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useTripsStore } from '@/stores/trips'

const store = useTripsStore()
const router = useRouter()
const { t } = useI18n()
const { trips } = storeToRefs(store)

const dialog = ref(false)
const name = ref('')
const currency = ref('USD')

// A small, common set; the field is free-text so any ISO code works.
const currencies = ['USD', 'EUR', 'GBP', 'IRR', 'AED', 'TRY', 'CAD', 'AUD', 'JPY']

function openTrip(id: string) {
  store.setActiveTrip(id)
  router.push({ name: 'receipt' })
}

function createTrip() {
  if (!name.value.trim()) return
  store.createTrip(name.value.trim(), currency.value)
  dialog.value = false
  name.value = ''
  router.push({ name: 'receipt' })
}

function confirmDelete(id: string) {
  store.deleteTrip(id)
}
</script>

<template>
  <div>
    <div class="d-flex align-center mb-4">
      <h2 class="text-h6">{{ t('trips.heading') }}</h2>
      <v-spacer />
      <v-btn color="primary" prepend-icon="mdi-plus" @click="dialog = true">
        {{ t('trips.newTrip') }}
      </v-btn>
    </div>

    <v-card v-if="trips.length === 0" variant="tonal" class="text-center pa-8">
      <v-icon size="64" color="grey">mdi-bag-suitcase</v-icon>
      <p class="mt-3 text-medium-emphasis">{{ t('trips.empty') }}</p>
    </v-card>

    <v-list v-else lines="two">
      <v-list-item
        v-for="trip in trips"
        :key="trip.id"
        :title="trip.name"
        :subtitle="
          t('trips.summary', {
            people: trip.people.length,
            items: trip.expenses.length,
            currency: trip.currency,
          })
        "
        @click="openTrip(trip.id)"
      >
        <template #prepend>
          <v-avatar color="primary" variant="tonal">
            <v-icon>mdi-bag-suitcase</v-icon>
          </v-avatar>
        </template>
        <template #append>
          <v-btn
            icon="mdi-delete-outline"
            variant="text"
            size="small"
            color="grey"
            @click.stop="confirmDelete(trip.id)"
          />
        </template>
      </v-list-item>
    </v-list>

    <v-dialog v-model="dialog" max-width="420">
      <v-card>
        <v-card-title>{{ t('trips.newTrip') }}</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="name"
            :label="t('trips.name')"
            autofocus
            @keyup.enter="createTrip"
          />
          <v-combobox v-model="currency" :items="currencies" :label="t('trips.currency')" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">{{ t('common.cancel') }}</v-btn>
          <v-btn color="primary" variant="flat" :disabled="!name.trim()" @click="createTrip">
            {{ t('common.create') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
