import { describe, expect, it } from 'vitest'
import type { Balance } from '../api/groups'
import { calculatePersonalBalanceSummary } from './personalBalanceSummary'

const balances: Balance[] = [
  {
    from_member_id: 1,
    from_member_name: 'Marco',
    to_member_id: 2,
    to_member_name: 'Giulia',
    amount: '20.50',
  },
  {
    from_member_id: 3,
    from_member_name: 'Luca',
    to_member_id: 1,
    to_member_name: 'Marco',
    amount: '8.25',
  },
  {
    from_member_id: 3,
    from_member_name: 'Luca',
    to_member_id: 2,
    to_member_name: 'Giulia',
    amount: '4.00',
  },
]

describe('calculatePersonalBalanceSummary', () => {
  it('calculates incoming, outgoing and net amounts for the selected member', () => {
    expect(calculatePersonalBalanceSummary(balances, 1)).toEqual({
      amountToPay: 20.5,
      amountToReceive: 8.25,
      netAmount: -12.25,
      outgoingPayments: 1,
      incomingPayments: 1,
    })
  })

  it('returns an empty summary for a member without payments', () => {
    expect(calculatePersonalBalanceSummary(balances, 99)).toEqual({
      amountToPay: 0,
      amountToReceive: 0,
      netAmount: 0,
      outgoingPayments: 0,
      incomingPayments: 0,
    })
  })
})
