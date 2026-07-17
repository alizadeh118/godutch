import { describe, it, expect } from 'vitest'
import { formatAmount, parseAmount } from './useAmount'

describe('formatAmount', () => {
  it('groups digits for en', () => {
    expect(formatAmount(2500, 'en-US')).toBe('2,500')
    expect(formatAmount(1234567, 'en-US')).toBe('1,234,567')
  })

  it('shows decimals but trims trailing zeros', () => {
    expect(formatAmount(2.5, 'en-US')).toBe('2.5')
    expect(formatAmount(15.75, 'en-US')).toBe('15.75')
    expect(formatAmount(0.833, 'en-US')).toBe('0.833')
  })

  it('renders Persian digits for fa-IR', () => {
    expect(formatAmount(2.5, 'fa-IR')).toMatch(/[۰-۹]/)
  })
})

describe('parseAmount', () => {
  it('parses whole and grouped numbers', () => {
    expect(parseAmount('2500')).toBe(2500)
    expect(parseAmount('1,234,567')).toBe(1234567)
  })

  it('parses decimals up to 3 places', () => {
    expect(parseAmount('2.5')).toBe(2.5)
    expect(parseAmount('15.750')).toBe(15.75)
    expect(parseAmount('0.833')).toBe(0.833)
  })

  it('parses Persian digits and decimal separator', () => {
    expect(parseAmount('۲٬۵۰۰')).toBe(2500)
    expect(parseAmount('۲٫۵')).toBe(2.5)
  })

  it('ignores stray non-numeric characters', () => {
    expect(parseAmount('12a.5b')).toBe(12.5)
  })

  it('rounds a numeric input to 3 places', () => {
    expect(parseAmount(12.6789)).toBe(12.679)
  })

  it('returns 0 for unparseable input', () => {
    expect(parseAmount('')).toBe(0)
    expect(parseAmount('abc')).toBe(0)
  })
})
