<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Expense, ID } from '@/domain/types'
import { useEventsStore } from '@/stores/events'
import ExpenseForm from '@/components/ExpenseForm.vue'

const { t } = useI18n()
const store = useEventsStore()
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
    <v-card rounded="lg" elevation="1" class="pa-4">
      <ExpenseForm ref="formRef" @submit="onSubmit" />
      <v-btn
        color="primary"
        block
        size="large"
        rounded="lg"
        class="mt-2"
        prepend-icon="mdi-check"
        @click="save"
      >
        {{ t('expense.addItem') }}
      </v-btn>
    </v-card>

    <v-snackbar v-model="snackbar" timeout="1500" color="success">
      {{ t('expense.added') }}
    </v-snackbar>
  </div>
</template>
