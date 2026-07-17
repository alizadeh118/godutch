<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Expense, ID } from '@/domain/types'
import { useTripsStore } from '@/stores/trips'
import ExpenseForm from '@/components/ExpenseForm.vue'

const { t } = useI18n()
const store = useTripsStore()
const formRef = ref<InstanceType<typeof ExpenseForm>>()
const snackbar = ref(false)

function onSubmit(data: Omit<Expense, 'id'> & { id?: ID }) {
  store.addExpense(data)
  snackbar.value = true
}

async function save() {
  await formRef.value?.submit()
}
</script>

<template>
  <div>
    <ExpenseForm ref="formRef" @submit="onSubmit" />
    <v-btn color="primary" block class="mt-4" @click="save">{{ t('expense.addItem') }}</v-btn>

    <v-snackbar v-model="snackbar" timeout="1500" color="success">
      {{ t('expense.added') }}
    </v-snackbar>
  </div>
</template>
