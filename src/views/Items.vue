<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import type { Expense, ID } from '@/domain/types'
import { useTripsStore } from '@/stores/trips'
import { useAmount } from '@/composables/useAmount'
import { avatarColor, initials } from '@/composables/useAvatar'
import ExpenseForm from '@/components/ExpenseForm.vue'

const { t } = useI18n()
const { format } = useAmount()
const store = useTripsStore()
const { expenses, peopleById } = storeToRefs(store)

const dialog = ref(false)
const editing = ref<Expense | undefined>()
const formRef = ref<InstanceType<typeof ExpenseForm>>()

function edit(expense: Expense) {
  editing.value = { ...expense, shareIds: [...expense.shareIds] }
  dialog.value = true
}

function onSubmit(data: Omit<Expense, 'id'> & { id?: ID }) {
  if (data.id) store.updateExpense(data as Expense)
  dialog.value = false
}

async function save() {
  await formRef.value?.submit()
}

function remove(id: ID) {
  store.removeExpense(id)
}
</script>

<template>
  <div>
    <v-card v-if="expenses.length === 0" variant="tonal" rounded="lg" class="text-center pa-8">
      <v-icon size="64" color="grey">mdi-folder-open-outline</v-icon>
      <p class="mt-3 text-medium-emphasis">{{ t('expense.empty') }}</p>
    </v-card>

    <v-card v-else rounded="lg" elevation="1">
      <v-list class="py-0">
        <template v-for="(item, i) in expenses" :key="item.id">
          <v-list-item class="py-2">
            <template #prepend>
              <v-avatar :color="avatarColor(peopleById[item.payerId] ?? '?')" size="42">
                <span class="text-white font-weight-medium">
                  {{ initials(peopleById[item.payerId] ?? '?') }}
                </span>
              </v-avatar>
            </template>
            <v-list-item-title class="font-weight-medium">{{ item.title }}</v-list-item-title>
            <v-list-item-subtitle>
              {{ t('expense.paidBy', { name: peopleById[item.payerId] ?? '?' }) }} ·
              {{ t('expense.splitWays', { count: item.shareIds.length }) }}
            </v-list-item-subtitle>
            <template #append>
              <div class="d-flex align-center ga-1">
                <span class="font-weight-bold me-1">{{ format(item.amount) }}</span>
                <v-btn icon="mdi-pencil" variant="text" size="small" @click="edit(item)" />
                <v-btn
                  icon="mdi-delete-outline"
                  variant="text"
                  size="small"
                  color="grey"
                  @click="remove(item.id)"
                />
              </div>
            </template>
          </v-list-item>
          <v-divider v-if="i < expenses.length - 1" inset />
        </template>
      </v-list>
    </v-card>

    <v-dialog v-model="dialog" max-width="520">
      <v-card rounded="lg">
        <v-toolbar color="primary" density="compact">
          <v-toolbar-title>{{ t('expense.update') }}</v-toolbar-title>
          <v-spacer />
          <v-btn variant="text" @click="save">{{ t('common.save') }}</v-btn>
        </v-toolbar>
        <v-card-text>
          <ExpenseForm ref="formRef" :expense="editing" @submit="onSubmit" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
