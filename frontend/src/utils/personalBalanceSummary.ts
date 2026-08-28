import type { Balance, Settlement } from '../api/groups'

export interface PersonalBalanceSummary {
  amountToPay: number
  amountToReceive: number
  netAmount: number
  outgoingPayments: number
  incomingPayments: number
}

export function calculatePersonalBalanceSummary(
  balances: Balance[],
  memberId: number,
): PersonalBalanceSummary {
  const personalBalances = balances.reduce(
    (summary, balance) => {
      const amount = Number(balance.amount)
      if (balance.from_member_id === memberId) {
        summary.amountToPay += amount
        summary.outgoingPayments += 1
      }
      if (balance.to_member_id === memberId) {
        summary.amountToReceive += amount
        summary.incomingPayments += 1
      }
      return summary
    },
    {
      amountToPay: 0,
      amountToReceive: 0,
      outgoingPayments: 0,
      incomingPayments: 0,
    },
  )

  return {
    ...personalBalances,
    netAmount: personalBalances.amountToReceive - personalBalances.amountToPay,
  }
}

export function calculatePersonalSettlementSummary(
  settlements: Settlement[],
  memberId: number,
): PersonalBalanceSummary {
  const pendingBalances: Balance[] = settlements
    .filter((settlement) => settlement.status === 'pending')
    .map((settlement) => ({
      from_member_id: settlement.from_member_id,
      from_member_name: '',
      to_member_id: settlement.to_member_id,
      to_member_name: '',
      amount: settlement.amount,
    }))

  return calculatePersonalBalanceSummary(pendingBalances, memberId)
}
