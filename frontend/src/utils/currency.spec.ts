import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  CURRENCIES,
  currencyDecimals,
  currencyStep,
  expenseTotalsByCurrency,
  formatCurrency,
  formatCurrencyValue,
  todayDate,
} from './currency'

afterEach(() => vi.useRealTimers())

describe('currency helpers', () => {
  it('includes lek and yen and keeps every currency unique', () => {
    expect(CURRENCIES.map(({ code }) => code)).toEqual(expect.arrayContaining(['ALL', 'JPY']))
    expect(new Set(CURRENCIES.map(({ code }) => code)).size).toBe(CURRENCIES.length)
  })

  it('uses the currency minor unit instead of assuming cents', () => {
    expect(currencyDecimals('JPY')).toBe(0)
    expect(currencyStep('JPY')).toBe(1)
    expect(currencyStep('ALL')).toBe(0.01)
    expect(formatCurrency('1200', 'JPY').replace(/\./g, '')).toContain('1200')
    expect(formatCurrency('1200', 'JPY')).not.toContain(',00')
    expect(formatCurrency('12.50', 'EUR')).toContain('12,50')
  })

  it('preserves migrated fractions when displaying zero-decimal currencies', () => {
    expect(formatCurrency('0.50', 'JPY')).toContain('0,50')
    expect(formatCurrency('0.50', 'JPY')).not.toContain('1')
    expect(formatCurrencyValue('12.25', 'KRW')).toContain('12,25')
    expect(formatCurrency('12', 'VND')).not.toContain(',00')
  })

  it('does not repeat a currency code that is already shown beside the value', () => {
    expect(formatCurrencyValue(1200, 'JPY')).toContain('¥')
    expect(formatCurrencyValue(1200, 'JPY')).not.toContain('JPY')
    expect(formatCurrencyValue(1200, 'USD')).toContain('$')
    expect(formatCurrencyValue(1200, 'ALL')).not.toContain('ALL')
    expect(formatCurrencyValue(1200, 'CHF')).not.toContain('CHF')
  })

  it('never sums different currencies and retains exact cents', () => {
    expect(
      expenseTotalsByCurrency(
        [
          { amount: '100', currency: 'ALL' },
          { amount: 0.1, currency: 'EUR' },
          { amount: 0.2 },
          { amount: 200, currency: 'ALL' },
          { amount: 5, currency: 'JPY' },
        ],
        'EUR',
      ),
    ).toEqual([
      { currency: 'EUR', amount: 0.3 },
      { currency: 'ALL', amount: 300 },
      { currency: 'JPY', amount: 5 },
    ])
    expect(expenseTotalsByCurrency([], 'CHF')).toEqual([{ currency: 'CHF', amount: 0 }])
  })

  it('uses the local calendar date, not a UTC date substring', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 8, 3, 0, 5))
    expect(todayDate()).toBe('2026-09-03')
  })
})
