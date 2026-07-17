<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTheme } from 'vuetify'
import { storeToRefs } from 'pinia'
import { useTripsStore } from '@/stores/trips'
import { formatMoney } from '@/composables/useMoney'
import { SUPPORTED_LOCALES, setLocale, localeMeta, type LocaleCode } from '@/i18n'
import { themeMode, setThemeMode, resolveTheme, type ThemeMode } from '@/theme'

const store = useTripsStore()
const router = useRouter()
const { t, locale } = useI18n()
const { activeTrip, perPerson, currency } = storeToRefs(store)

// Keep Vuetify's active theme in sync with the chosen mode (and the OS, in auto).
const vuetifyTheme = useTheme()
watchEffect(() => {
  vuetifyTheme.global.name.value = resolveTheme(themeMode.value)
})

const themeOptions: { mode: ThemeMode; icon: string }[] = [
  { mode: 'light', icon: 'mdi-white-balance-sunny' },
  { mode: 'dark', icon: 'mdi-weather-night' },
  { mode: 'auto', icon: 'mdi-theme-light-dark' },
]
const themeIcon = computed(
  () => themeOptions.find((o) => o.mode === themeMode.value)?.icon ?? 'mdi-theme-light-dark',
)

const perPersonLabel = computed(() =>
  perPerson.value
    ? formatMoney(perPerson.value, currency.value, localeMeta(locale.value as LocaleCode).intl)
    : '',
)

const resetDialog = ref(false)

function leaveTrip() {
  store.setActiveTrip(null)
  router.push({ name: 'trips' })
}

function clearTripData() {
  const trip = activeTrip.value
  if (trip) {
    trip.people = []
    trip.expenses = []
  }
  resetDialog.value = false
  router.push({ name: 'receipt' })
}
</script>

<template>
  <v-app>
    <v-app-bar color="surface" flat border>
      <v-btn v-if="activeTrip" icon="mdi-arrow-left" @click="leaveTrip" />
      <v-app-bar-title>
        {{ activeTrip ? activeTrip.name : t('app.brand') }}
      </v-app-bar-title>

      <v-spacer />

      <v-chip v-if="perPersonLabel" color="blue-grey" variant="flat" class="mr-2">
        {{ t('app.perPerson') }}: <strong class="ms-1">{{ perPersonLabel }}</strong>
      </v-chip>

      <v-menu>
        <template #activator="{ props }">
          <v-btn :icon="themeIcon" v-bind="props" :aria-label="t('theme.label')" />
        </template>
        <v-list density="compact">
          <v-list-item
            v-for="o in themeOptions"
            :key="o.mode"
            :title="t(`theme.${o.mode}`)"
            :prepend-icon="o.icon"
            :active="themeMode === o.mode"
            @click="setThemeMode(o.mode)"
          />
        </v-list>
      </v-menu>

      <v-menu>
        <template #activator="{ props }">
          <v-btn icon="mdi-translate" v-bind="props" :aria-label="t('app.language')" />
        </template>
        <v-list density="compact">
          <v-list-item
            v-for="l in SUPPORTED_LOCALES"
            :key="l.code"
            :title="l.label"
            :active="locale === l.code"
            @click="setLocale(l.code)"
          />
        </v-list>
      </v-menu>

      <v-btn v-if="activeTrip" icon="mdi-refresh" @click="resetDialog = true" />
    </v-app-bar>

    <v-main>
      <v-container>
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </v-container>
    </v-main>

    <v-bottom-navigation v-if="activeTrip" grow color="primary">
      <v-btn :to="{ name: 'receipt' }" exact>
        <v-icon>mdi-receipt-text</v-icon>
        <span>{{ t('nav.receipt') }}</span>
      </v-btn>
      <v-btn :to="{ name: 'add' }" exact>
        <v-icon>mdi-plus-circle</v-icon>
        <span>{{ t('nav.add') }}</span>
      </v-btn>
      <v-btn :to="{ name: 'items' }" exact>
        <v-icon>mdi-format-list-bulleted</v-icon>
        <span>{{ t('nav.items') }}</span>
      </v-btn>
    </v-bottom-navigation>

    <v-dialog v-model="resetDialog" max-width="420">
      <v-card>
        <v-card-title class="text-error">{{ t('reset.title') }}</v-card-title>
        <v-card-text>
          <i18n-t keypath="reset.body" tag="span">
            <template #name>
              <strong>{{ activeTrip?.name }}</strong>
            </template>
          </i18n-t>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="resetDialog = false">{{ t('common.cancel') }}</v-btn>
          <v-btn color="error" variant="flat" @click="clearTripData">{{ t('common.reset') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

body {
  font-family: 'Vazirmatn', 'Roboto', sans-serif;
}
</style>
