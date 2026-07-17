import { useI18n } from 'vue-i18n'
import { localeMeta, type LocaleCode } from '@/i18n'

/**
 * Amounts are plain whole numbers (no currency, no decimals) — the value the
 * user typed, in whatever unit they have in mind. These helpers format them
 * with locale-aware digit grouping and parse user input back to an integer.
 */

/** Map Persian (۰-۹) and Arabic-Indic (٠-٩) digits to ASCII. */
function normalizeDigits(input: string): string {
  return input.replace(/[٠-٩۰-۹]/g, (d) => {
    const code = d.charCodeAt(0)
    const base = code >= 0x06f0 ? 0x06f0 : 0x0660
    return String(code - base)
  })
}

/** Format an integer with locale digit grouping/shaping, e.g. 2500 -> "2,500" / "۲٬۵۰۰". */
export function formatAmount(value: number, locale?: string): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value)
}

/** Parse user input into a whole number (tolerates Persian digits and separators). */
export function parseAmount(input: string | number): number {
  if (typeof input === 'number') return Math.round(input)
  const cleaned = normalizeDigits(input).replace(/[^\d-]/g, '')
  const value = parseInt(cleaned, 10)
  return Number.isFinite(value) ? value : 0
}

/** Reactive formatter bound to the active UI locale. */
export function useAmount() {
  const { locale } = useI18n()
  const intlLocale = () => localeMeta(locale.value as LocaleCode).intl
  return {
    format: (value: number) => formatAmount(value, intlLocale()),
    parse: parseAmount,
  }
}
