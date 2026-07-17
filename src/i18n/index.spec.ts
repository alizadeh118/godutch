import { describe, it, expect, afterEach } from 'vitest'
import i18n, { toPersianDigits, setLocale } from './index'

describe('toPersianDigits', () => {
  it('converts ASCII digits and leaves the rest untouched', () => {
    expect(toPersianDigits('3 نفر · 2 قلم')).toBe('۳ نفر · ۲ قلم')
    expect(toPersianDigits('no digits here')).toBe('no digits here')
  })
})

describe('Persian digit postTranslation', () => {
  afterEach(() => setLocale('en'))

  it('renders interpolated counts with Persian digits under fa', () => {
    setLocale('fa')
    expect(i18n.global.t('events.summary', { people: 3, items: 2 })).toBe('۳ نفر · ۲ قلم')
  })

  it('leaves ASCII digits under en', () => {
    setLocale('en')
    expect(i18n.global.t('events.summary', { people: 3, items: 2 })).toBe('3 people · 2 items')
  })
})
