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

function openTrip(id: string) {
  store.setActiveTrip(id)
  router.push({ name: 'receipt' })
}

function createTrip() {
  if (!name.value.trim()) return
  store.createTrip(name.value.trim())
  dialog.value = false
  name.value = ''
  router.push({ name: 'receipt' })
}

const pendingDelete = ref<{ id: string; name: string } | null>(null)

function askDelete(trip: { id: string; name: string }) {
  pendingDelete.value = { id: trip.id, name: trip.name }
}

function confirmDelete() {
  if (pendingDelete.value) store.deleteTrip(pendingDelete.value.id)
  pendingDelete.value = null
}
</script>

<template>
  <div>
    <div class="d-flex align-center mb-4">
      <h2 class="text-h6">{{ t('trips.heading') }}</h2>
      <v-spacer />
      <v-btn color="primary" rounded="lg" prepend-icon="mdi-plus" @click="dialog = true">
        {{ t('trips.newTrip') }}
      </v-btn>
    </div>

    <v-card v-if="trips.length === 0" variant="tonal" rounded="lg" class="text-center pa-8">
      <v-icon size="64" color="grey">mdi-bag-suitcase</v-icon>
      <p class="mt-3 text-medium-emphasis">{{ t('trips.empty') }}</p>
      <v-btn color="primary" rounded="lg" class="mt-4" prepend-icon="mdi-plus" @click="dialog = true">
        {{ t('trips.newTrip') }}
      </v-btn>
    </v-card>

    <div v-else class="d-flex flex-column ga-3">
      <v-card
        v-for="trip in trips"
        :key="trip.id"
        rounded="lg"
        elevation="1"
        @click="openTrip(trip.id)"
      >
        <v-list-item class="py-3">
          <template #prepend>
            <v-avatar color="primary" variant="tonal" size="46">
              <v-icon>mdi-bag-suitcase</v-icon>
            </v-avatar>
          </template>
          <v-list-item-title class="text-subtitle-1 font-weight-medium">
            {{ trip.name }}
          </v-list-item-title>
          <v-list-item-subtitle>
            {{
              t('trips.summary', {
                people: trip.people.length,
                items: trip.expenses.length,
              })
            }}
          </v-list-item-subtitle>
          <template #append>
            <v-btn
              icon="mdi-delete-outline"
              variant="text"
              size="small"
              color="grey"
              @click.stop="askDelete(trip)"
            />
          </template>
        </v-list-item>
      </v-card>
    </div>

    <!-- Create trip -->
    <v-dialog v-model="dialog" max-width="420">
      <v-card rounded="lg">
        <v-card-title>{{ t('trips.newTrip') }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="name" :label="t('trips.name')" autofocus @keyup.enter="createTrip" />
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

    <!-- Delete confirmation -->
    <v-dialog :model-value="!!pendingDelete" max-width="420" @update:model-value="pendingDelete = null">
      <v-card rounded="lg">
        <v-card-title class="text-error">{{ t('trips.deleteTitle') }}</v-card-title>
        <v-card-text>
          <i18n-t keypath="trips.deleteBody" tag="span">
            <template #name>
              <strong>{{ pendingDelete?.name }}</strong>
            </template>
          </i18n-t>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="pendingDelete = null">{{ t('common.cancel') }}</v-btn>
          <v-btn color="error" variant="flat" @click="confirmDelete">{{ t('common.delete') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
