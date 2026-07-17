import { createI18n } from 'vue-i18n'
import { en as vuetifyEn, fa as vuetifyFa } from 'vuetify/locale'
import en from './locales/en'
import fa from './locales/fa'

export type LocaleCode = 'en' | 'fa'

export interface LocaleMeta {
  code: LocaleCode
  label: string
  dir: 'ltr' | 'rtl'
  /** BCP-47 tag used for Intl number/currency formatting. */
  intl: string
}

export const SUPPORTED_LOCALES: LocaleMeta[] = [
  { code: 'en', label: 'English', dir: 'ltr', intl: 'en' },
  { code: 'fa', label: 'فارسی', dir: 'rtl', intl: 'fa-IR' },
]

const STORAGE_KEY = 'godutch-locale'

function detectLocale(): LocaleCode {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'en' || stored === 'fa') return stored
  const nav = navigator.language?.toLowerCase() ?? ''
  return nav.startsWith('fa') ? 'fa' : 'en'
}

export const initialLocale = detectLocale()

const i18n = createI18n({
  legacy: false,
  locale: initialLocale,
  fallbackLocale: 'en',
  // Vuetify's own component strings live under the `$vuetify` key so the
  // vue-i18n adapter can resolve them too.
  messages: {
    en: { $vuetify: vuetifyEn, ...en },
    fa: { $vuetify: vuetifyFa, ...fa },
  },
})

export function localeMeta(code: LocaleCode): LocaleMeta {
  return SUPPORTED_LOCALES.find((l) => l.code === code) ?? SUPPORTED_LOCALES[0]
}

/** Apply a locale everywhere: i18n, <html lang/dir>, and persistence. */
export function setLocale(code: LocaleCode) {
  i18n.global.locale.value = code
  const meta = localeMeta(code)
  document.documentElement.setAttribute('lang', code)
  document.documentElement.setAttribute('dir', meta.dir)
  localStorage.setItem(STORAGE_KEY, code)
}

export default i18n
