import { describe, it, expect } from 'vitest'
import { formatAmount, parseAmount } from './useAmount'

describe('formatAmount', () => {
  it('groups digits for en', () => {
    expect(formatAmount(2500, 'en-US')).toBe('2,500')
    expect(formatAmount(1234567, 'en-US')).toBe('1,234,567')
  })

  it('renders Persian digits for fa-IR', () => {
    const out = formatAmount(2500, 'fa-IR')
    expect(out).toMatch(/[۰-۹]/)
  })

  it('never shows decimals', () => {
    expect(formatAmount(2500.9, 'en-US')).not.toContain('.')
  })
})

describe('parseAmount', () => {
  it('parses plain and grouped numbers', () => {
    expect(parseAmount('2500')).toBe(2500)
    expect(parseAmount('1,234,567')).toBe(1234567)
  })

  it('parses Persian digits and separators', () => {
    expect(parseAmount('۲٬۵۰۰')).toBe(2500)
  })

  it('rounds a numeric input to a whole number', () => {
    expect(parseAmount(12.6)).toBe(13)
  })

  it('returns 0 for unparseable input', () => {
    expect(parseAmount('')).toBe(0)
    expect(parseAmount('abc')).toBe(0)
  })
})
