import type { Balance } from '../api/groups'

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
