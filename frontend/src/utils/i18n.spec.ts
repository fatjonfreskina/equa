import { afterEach, describe, expect, it } from 'vitest'
import { getLocale, setLocale, translate } from './i18n'

afterEach(() => {
  setLocale('it')
  localStorage.clear()
})

describe('i18n', () => {
  it('switches language, updates the document and persists only the preference', () => {
    setLocale('en')
    expect(getLocale()).toBe('en')
    expect(document.documentElement.lang).toBe('en')
    expect(localStorage.getItem('equa.locale')).toBe('en')
    expect(translate('createGroup')).toBe('Create a group')
  })

  it('interpolates dynamic values in both languages', () => {
    expect(translate('memberCount', { count: 3 })).toBe('3 partecipanti')
    setLocale('en')
    expect(translate('removeRecentAria', { name: 'Holiday' })).toBe(
      'Remove Holiday from recent groups',
    )
    expect(translate('datedExchangeRate', { label: 'Reference rate', date: 'Sep 2, 2026' })).toBe(
      'Reference rate from Sep 2, 2026.',
    )
    expect(translate('reopenConfirm')).toBe('Reopen balances')
  })
})
