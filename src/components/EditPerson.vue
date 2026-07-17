<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import type { ID } from '@/domain/types'
import { useEventsStore } from '@/stores/events'

const props = defineProps<{ personId: ID }>()

const { t } = useI18n()
const store = useEventsStore()
const { people } = storeToRefs(store)

const dialog = ref(false)
const name = ref('')

const error = computed(() => {
  const v = name.value.trim().toLowerCase()
  if (!v) return ''
  if (people.value.some((p) => p.id !== props.personId && p.name.toLowerCase() === v))
    return t('common.alreadyExists')
  return ''
})

function open() {
  name.value = people.value.find((p) => p.id === props.personId)?.name ?? ''
  dialog.value = true
}

function save() {
  const v = name.value.trim()
  if (!v || error.value) return
  store.updatePerson(props.personId, v.charAt(0).toUpperCase() + v.slice(1))
  dialog.value = false
}
</script>

<template>
  <v-btn icon="mdi-account-edit" variant="text" size="small" color="grey" @click="open" />

  <v-dialog v-model="dialog" max-width="420">
    <v-card>
      <v-card-title>{{ t('person.edit') }}</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="name"
          :label="t('common.name')"
          autofocus
          :error-messages="error"
          @keyup.enter="save"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="dialog = false">{{ t('common.cancel') }}</v-btn>
        <v-btn color="primary" variant="flat" :disabled="!name.trim() || !!error" @click="save">
          {{ t('common.save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
