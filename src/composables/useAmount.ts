import { useI18n } from 'vue-i18n'
import { localeMeta, type LocaleCode } from '@/i18n'

/**
 * Amounts are plain numbers with up to 3 decimal places (e.g. 2500, 2.5,
 * 15.75) — the value the user typed, in whatever unit they have in mind, no
 * currency. These helpers format them with locale-aware digit grouping/shaping
 * and parse user input back to a number.
 */

/** Max decimal places we keep. Splitting/balances scale by this to stay exact. */
export const DECIMALS = 3

/** Map Persian (۰-۹) and Arabic-Indic (٠-٩) digits to ASCII. */
function normalizeDigits(input: string): string {
  return input.replace(/[٠-٩۰-۹]/g, (d) => {
    const code = d.charCodeAt(0)
    const base = code >= 0x06f0 ? 0x06f0 : 0x0660
    return String(code - base)
  })
}

/** Round to DECIMALS places, avoiding trailing float noise. */
function roundAmount(value: number): number {
  const f = 10 ** DECIMALS
  return Math.round(value * f) / f
}

/** Format a number with locale grouping/shaping, trimming trailing zeros, e.g. 2.5 -> "2.5". */
export function formatAmount(value: number, locale?: string): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: DECIMALS }).format(value)
}

/** Parse user input into a number (tolerates Persian digits, separators and decimal mark). */
export function parseAmount(input: string | number): number {
  if (typeof input === 'number') return Number.isFinite(input) ? roundAmount(input) : 0
  const cleaned = normalizeDigits(input)
    .replace(/٫/g, '.') // Persian decimal separator -> dot
    .replace(/[^\d.-]/g, '') // drop grouping separators and anything else
  const value = parseFloat(cleaned)
  return Number.isFinite(value) ? roundAmount(value) : 0
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
