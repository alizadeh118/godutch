import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { localeMeta, type LocaleCode } from '@/i18n'
import { useTripsStore } from '@/stores/trips'

/**
 * Money formatting/parsing helpers. Internally every amount is an integer
 * number of minor units; these convert to and from the human-facing major
 * unit for a given ISO-4217 currency, honouring that currency's decimal places
 * (e.g. 2 for USD, 0 for IRR/JPY) and the active locale's digit shaping.
 */

/** Map Persian (۰-۹) and Arabic-Indic (٠-٩) digits to ASCII so parsing works. */
function normalizeDigits(input: string): string {
  return input.replace(/[٠-٩۰-۹]/g, (d) => {
    const code = d.charCodeAt(0)
    const base = code >= 0x06f0 ? 0x06f0 : 0x0660
    return String(code - base)
  })
}

export function fractionDigits(currency: string): number {
  try {
    return (
      new Intl.NumberFormat('en', {
        style: 'currency',
        currency,
      }).resolvedOptions().maximumFractionDigits ?? 2
    )
  } catch {
    return 2
  }
}

/** Format minor units as a localized currency string, e.g. 12345 -> "$123.45". */
export function formatMoney(minor: number, currency: string, locale?: string): string {
  const digits = fractionDigits(currency)
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(
    minor / 10 ** digits,
  )
}

/** Parse a major-unit value (number or string like "12.34" / "۱۲٫۳۴") into minor units. */
export function toMinor(major: number | string, currency: string): number {
  let value: number
  if (typeof major === 'string') {
    const normalized = normalizeDigits(major)
      .replace(/[٫]/g, '.') // Persian/Arabic decimal separator -> dot
      .replace(/[,٬\s]/g, '') // thousands separators (Latin, Persian) and spaces
      .replace(/[^\d.-]/g, '')
    value = parseFloat(normalized)
  } else {
    value = major
  }
  if (!Number.isFinite(value)) return 0
  return Math.round(value * 10 ** fractionDigits(currency))
}

/** Convert minor units back to a major-unit number for editing in a form. */
export function toMajor(minor: number, currency: string): number {
  return minor / 10 ** fractionDigits(currency)
}

/**
 * Reactive formatter bound to the active UI locale and the current trip's
 * currency — use this in components instead of calling formatMoney directly.
 */
export function useMoney() {
  const { locale } = useI18n()
  const store = useTripsStore()
  const { currency } = storeToRefs(store)

  const intlLocale = () => localeMeta(locale.value as LocaleCode).intl

  return {
    money: (minor: number) => formatMoney(minor, currency.value, intlLocale()),
    toMinor: (major: number | string) => toMinor(major, currency.value),
    toMajor: (minor: number) => toMajor(minor, currency.value),
  }
}
