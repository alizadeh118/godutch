import { describe, it, expect, beforeEach } from 'vitest'
import { themeMode, systemDark, resolveTheme, setThemeMode } from './theme'

describe('theme', () => {
  beforeEach(() => {
    localStorage.clear()
    themeMode.value = 'auto'
    systemDark.value = false
  })

  it('resolves explicit modes directly', () => {
    expect(resolveTheme('light')).toBe('light')
    expect(resolveTheme('dark')).toBe('dark')
  })

  it('resolves auto from the system preference', () => {
    systemDark.value = false
    expect(resolveTheme('auto')).toBe('light')
    systemDark.value = true
    expect(resolveTheme('auto')).toBe('dark')
  })

  it('defaults its argument to the current mode', () => {
    setThemeMode('dark')
    expect(resolveTheme()).toBe('dark')
  })

  it('setThemeMode updates state and persists', () => {
    setThemeMode('light')
    expect(themeMode.value).toBe('light')
    expect(localStorage.getItem('godutch-theme')).toBe('light')
  })
})
