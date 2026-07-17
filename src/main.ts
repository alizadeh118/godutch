import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import i18n, { setLocale, initialLocale } from './i18n'

// Apply the detected/persisted locale to <html lang/dir> before mount.
setLocale(initialLocale)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

createApp(App).use(pinia).use(router).use(i18n).use(vuetify).mount('#app')
