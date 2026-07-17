import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import i18n, { setLocale, initialLocale } from './i18n'

// Apply the detected/persisted locale to <html lang/dir> before mount.
setLocale(initialLocale)

// One-time migration: the persisted shape was renamed { trips, activeTripId }
// -> { events, activeEventId }. Rewrite old storage before the store hydrates.
function migrateStorage() {
  const raw = localStorage.getItem('godutch')
  if (!raw) return
  try {
    const data = JSON.parse(raw)
    if (data && data.trips && !data.events) {
      localStorage.setItem(
        'godutch',
        JSON.stringify({ events: data.trips, activeEventId: data.activeTripId ?? null }),
      )
    }
  } catch {
    // ignore malformed storage
  }
}
migrateStorage()

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

createApp(App).use(pinia).use(router).use(i18n).use(vuetify).mount('#app')
