import { afterEach, describe, expect, it } from 'vitest'
import { apiErrorMessage } from './errors'
import { setLocale } from '../utils/i18n'

afterEach(() => setLocale('it'))

describe('apiErrorMessage', () => {
  it('translates stable backend codes in the selected language', () => {
    setLocale('en')
    expect(
      apiErrorMessage(
        {
          response: {
            headers: { 'x-error-code': 'MEMBER_IN_SETTLEMENT_HISTORY' },
            data: { detail: 'Impossibile eliminare' },
          },
        },
        'Fallback',
      ),
    ).toBe('This participant is part of the payment history and cannot be removed.')
  })

  it('uses Italian legacy details only in Italian and otherwise uses the translated fallback', () => {
    const failure = { response: { data: { detail: 'Messaggio legacy' }, headers: {} } }
    expect(apiErrorMessage(failure, 'Fallback')).toBe('Messaggio legacy')
    setLocale('en')
    expect(apiErrorMessage(failure, 'English fallback')).toBe('English fallback')
  })
})
