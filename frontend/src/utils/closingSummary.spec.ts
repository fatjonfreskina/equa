import { describe, expect, it } from 'vitest'
import type { Balance, Group } from '../api/groups'
import { buildClosingSummary } from './closingSummary'

const group: Group = {
  id: 'group-1',
  name: 'Weekend',
  currency: 'EUR',
  status: 'closing',
  closing_count: 1,
  created_at: '2026-08-28T12:00:00Z',
  members: [
    { id: 1, name: 'Giulia' },
    { id: 2, name: 'Marco' },
  ],
  expenses: [
    {
      id: 1,
      paid_by_member_id: 1,
      description: 'Cena',
      amount: 42.5,
      created_at: '2026-08-28T18:00:00Z',
      splits: [],
    },
  ],
}

describe('buildClosingSummary', () => {
  it('includes totals, payments and the group link', () => {
    const balances: Balance[] = [
      {
        from_member_id: 2,
        from_member_name: 'Marco',
        to_member_id: 1,
        to_member_name: 'Giulia',
        amount: '21.25',
      },
    ]

    const summary = buildClosingSummary(group, balances, 'https://equa.example/group/group-1')

    expect(summary).toContain('🧾 Riepilogo conti - Weekend')
    expect(summary).toContain('Totale spese: 42,50')
    expect(summary).toContain('Marco deve 21,25')
    expect(summary).toContain('https://equa.example/group/group-1')
    expect(summary).not.toContain('versione 1')
  })

  it('labels later closing cycles with their version', () => {
    const summary = buildClosingSummary({ ...group, closing_count: 2 }, [], 'https://equa.example')

    expect(summary).toContain('Riepilogo conti - Weekend - versione 2')
  })

  it('explains when no payment is required', () => {
    expect(buildClosingSummary(group, [], 'https://equa.example')).toContain(
      'Nessun pagamento necessario',
    )
  })
})
