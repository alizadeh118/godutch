<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTheme } from 'vuetify'
import { storeToRefs } from 'pinia'
import { useTripsStore } from '@/stores/trips'
import { SUPPORTED_LOCALES, setLocale } from '@/i18n'
import { themeMode, setThemeMode, resolveTheme, type ThemeMode } from '@/theme'

const store = useTripsStore()
const router = useRouter()
const { t, locale } = useI18n()
const { activeTrip } = storeToRefs(store)

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

// Back points left in LTR, right in RTL.
const backIcon = computed(() => (locale.value === 'fa' ? 'mdi-arrow-right' : 'mdi-arrow-left'))

function leaveTrip() {
  store.setActiveTrip(null)
  router.push({ name: 'trips' })
}
</script>

<template>
  <v-app>
    <v-app-bar color="surface" flat border>
      <v-btn v-if="activeTrip" :icon="backIcon" @click="leaveTrip" />
      <v-app-bar-title>
        {{ activeTrip ? activeTrip.name : t('app.brand') }}
      </v-app-bar-title>

      <v-spacer />

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
    </v-app-bar>

    <v-main>
      <v-container class="app-column pa-4">
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
  </v-app>
</template>

<style>
/* Mobile-first column that stays comfortable on desktop. */
.app-column {
  max-width: 680px;
  margin-inline: auto;
  padding-bottom: 88px; /* clear the fixed bottom navigation */
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
