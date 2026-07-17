import { describe, it, expect } from 'vitest'
import { fractionDigits, formatMoney, toMinor, toMajor } from './useMoney'

describe('fractionDigits', () => {
  it('knows common currencies', () => {
    expect(fractionDigits('USD')).toBe(2)
    expect(fractionDigits('EUR')).toBe(2)
    expect(fractionDigits('IRR')).toBe(0)
    expect(fractionDigits('JPY')).toBe(0)
  })

  it('falls back to 2 for an unknown code', () => {
    expect(fractionDigits('ZZZ')).toBe(2)
  })
})

describe('toMinor', () => {
  it('converts major units to integer minor units', () => {
    expect(toMinor('12.34', 'USD')).toBe(1234)
    expect(toMinor(100, 'USD')).toBe(10000)
  })

  it('respects zero-decimal currencies', () => {
    expect(toMinor('1000', 'IRR')).toBe(1000)
  })

  it('strips thousands separators', () => {
    expect(toMinor('1,234.56', 'USD')).toBe(123456)
  })

  it('parses Persian digits and decimal separator', () => {
    expect(toMinor('۱۲٫۳۴', 'USD')).toBe(1234)
    expect(toMinor('۱٬۰۰۰', 'IRR')).toBe(1000)
  })

  it('returns 0 for unparseable input', () => {
    expect(toMinor('', 'USD')).toBe(0)
    expect(toMinor('abc', 'USD')).toBe(0)
  })
})

describe('toMajor', () => {
  it('is the inverse of toMinor for the currency scale', () => {
    expect(toMajor(1234, 'USD')).toBe(12.34)
    expect(toMajor(1000, 'IRR')).toBe(1000)
  })
})

describe('formatMoney', () => {
  it('formats en-US currency exactly', () => {
    expect(formatMoney(1234, 'USD', 'en-US')).toBe('$12.34')
  })

  it('renders Persian digits under fa-IR', () => {
    const out = formatMoney(1234, 'USD', 'fa-IR')
    // Contains at least one Persian digit (۰-۹). ICU wording varies, so we
    // don't assert the whole string.
    expect(out).toMatch(/[۰-۹]/)
  })
})
