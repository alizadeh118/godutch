import { ref } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'auto'

const STORAGE_KEY = 'godutch-theme'

function readStored(): ThemeMode {
  const v = localStorage.getItem(STORAGE_KEY)
  return v === 'light' || v === 'dark' || v === 'auto' ? v : 'auto'
}

/** The user's chosen mode: an explicit theme or 'auto' (follow the OS). */
export const themeMode = ref<ThemeMode>(readStored())

const media = window.matchMedia?.('(prefers-color-scheme: dark)')
/** Live reflection of the OS colour-scheme preference. */
export const systemDark = ref(media?.matches ?? false)
media?.addEventListener('change', (e) => {
  systemDark.value = e.matches
})

/** The concrete Vuetify theme name to apply for the current mode + OS state. */
export function resolveTheme(mode: ThemeMode = themeMode.value): 'light' | 'dark' {
  if (mode === 'auto') return systemDark.value ? 'dark' : 'light'
  return mode
}

export function setThemeMode(mode: ThemeMode) {
  themeMode.value = mode
  localStorage.setItem(STORAGE_KEY, mode)
}
