<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import type { Expense, ID } from '@/domain/types'
import { useTripsStore } from '@/stores/trips'
import { useMoney } from '@/composables/useMoney'
import ExpenseForm from '@/components/ExpenseForm.vue'

const { t } = useI18n()
const { money } = useMoney()
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
    <v-card v-if="expenses.length === 0" variant="tonal" class="text-center pa-8">
      <v-icon size="64" color="grey">mdi-folder-open-outline</v-icon>
      <p class="mt-3 text-medium-emphasis">{{ t('expense.empty') }}</p>
    </v-card>

    <v-list v-else lines="two">
      <v-list-item
        v-for="item in expenses"
        :key="item.id"
        :title="`${item.title} — ${money(item.amount)}`"
        :subtitle="t('expense.paidBy', { name: peopleById[item.payerId] ?? '?' })"
      >
        <template #append>
          <v-btn icon="mdi-pencil" variant="text" size="small" @click="edit(item)" />
          <v-btn
            icon="mdi-delete-outline"
            variant="text"
            size="small"
            color="grey"
            @click="remove(item.id)"
          />
        </template>
      </v-list-item>
    </v-list>

    <v-dialog v-model="dialog" max-width="520">
      <v-card>
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
