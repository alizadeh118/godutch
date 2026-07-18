import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
// Inter for Latin text (English pages); Vazirmatn covers Persian glyphs that
// Inter lacks, so Persian falls back to it per-glyph. Both self-hosted for PWA.
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/700.css'
import '@fontsource/vazirmatn/400.css'
import '@fontsource/vazirmatn/500.css'
import '@fontsource/vazirmatn/700.css'

import { createVuetify } from 'vuetify'
import { useI18n } from 'vue-i18n'
import { createVueI18nAdapter } from 'vuetify/locale/adapters/vue-i18n'
import i18n, { initialLocale } from '@/i18n'
import { resolveTheme } from '@/theme'

export default createVuetify({
  locale: {
    // vue-i18n's strict locale typing ('en' | 'fa') is narrower than the
    // adapter's `string` signature; the runtime contract is satisfied.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adapter: createVueI18nAdapter({ i18n: i18n as any, useI18n }),
    // Vuetify follows i18n's locale via the adapter; this map flips direction.
    rtl: { fa: true, en: false },
  },
  theme: {
    // Resolve up front so there's no flash of the wrong theme on load.
    defaultTheme: resolveTheme(),
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#1867c0',
          secondary: '#5cbbf6',
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: '#2196f3',
          secondary: '#5cbbf6',
        },
      },
    },
  },
})

export { initialLocale }
