<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import type { ID } from '@/domain/types'
import { useEventsStore } from '@/stores/events'

const props = defineProps<{ personId: ID }>()

const { t } = useI18n()
const store = useEventsStore()
const router = useRouter()
const { people, expenses } = storeToRefs(store)

const dialog = ref(false)
const alterPayerId = ref<ID | null>(null)

const person = computed(() => people.value.find((p) => p.id === props.personId))
const otherPeople = computed(() => people.value.filter((p) => p.id !== props.personId))
/** Does this person have any payments that must be reassigned on removal? */
const hasPayments = computed(() => expenses.value.some((e) => e.payerId === props.personId))

function open() {
  alterPayerId.value = null
  // If there's nothing to reassign, remove immediately.
  if (!hasPayments.value) {
    remove()
    return
  }
  dialog.value = true
}

function remove() {
  if (hasPayments.value && !alterPayerId.value) return
  store.removePerson(props.personId, alterPayerId.value ?? undefined)
  dialog.value = false
  router.push({ name: 'receipt' })
}
</script>

<template>
  <v-btn icon="mdi-delete-outline" variant="text" size="small" color="grey" @click="open" />

  <v-dialog v-model="dialog" max-width="460">
    <v-card>
      <v-card-title>{{ t('person.remove', { name: person?.name }) }}</v-card-title>
      <v-card-text>
        <v-select
          v-model="alterPayerId"
          :label="t('person.reassign', { name: person?.name })"
          :items="otherPeople"
          item-title="name"
          item-value="id"
          :no-data-text="t('person.needAnother')"
        />
        <p class="text-medium-emphasis text-body-2">{{ t('person.reassignHint') }}</p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="dialog = false">{{ t('common.cancel') }}</v-btn>
        <v-btn color="error" variant="flat" :disabled="!alterPayerId" @click="remove">
          {{ t('common.remove') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
