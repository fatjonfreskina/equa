import type { Balance, Group } from '../api/groups'
import { expenseTotalsByCurrency, formatCurrency, formatCurrencyValue } from './currency'

export function buildClosingSummary(
  group: Group,
  balances: Balance[],
  groupLink: string,
  locale = 'it-IT',
): string {
  const english = locale.startsWith('en')
  const totals = expenseTotalsByCurrency(group.expenses, group.currency)
  const totalLines =
    totals.length === 1
      ? [
          `💰 ${english ? 'Total expenses' : 'Totale spese'}: ${formatCurrency(totals[0]!.amount, totals[0]!.currency, locale)}`,
        ]
      : [
          english ? '💰 Expense totals by currency:' : '💰 Totali spese per valuta:',
          ...totals.map(
            (total) =>
              `• ${total.currency}: ${formatCurrencyValue(total.amount, total.currency, locale)}`,
          ),
        ]
  const unified = group.closing_balance_mode === 'unified'
  const hasForeignExpenses = group.expenses.some(
    (expense) => expense.currency && expense.currency !== group.currency,
  )
  if (unified && hasForeignExpenses) {
    const convertedAmounts = group.expenses.map((expense) =>
      !expense.currency || expense.currency === group.currency
        ? Number(expense.amount)
        : expense.converted_amount == null
          ? null
          : Number(expense.converted_amount),
    )
    if (convertedAmounts.every((amount) => amount !== null && Number.isFinite(amount))) {
      const convertedCents = convertedAmounts.reduce(
        (sum: number, amount) => sum + Math.round(amount! * 100),
        0,
      )
      totalLines.push(
        `💱 ${english ? 'Combined total' : 'Totale unificato'}: ${formatCurrency(convertedCents / 100, group.currency, locale)}`,
      )
    }
    totalLines.push(
      english
        ? 'Rates saved on each expense and fixed for this settlement.'
        : 'Cambi salvati sulle singole spese, fissati per questa chiusura.',
    )
  }
  const payments = balances.length
    ? balances.map(
        (balance) =>
          `• ${balance.from_member_name} ${english ? 'owes' : 'deve'} ${formatCurrency(balance.amount, balance.currency || group.currency, locale)} ${english ? 'to' : 'a'} ${balance.to_member_name}`,
      )
    : [
        english
          ? '• No payments needed: everyone is even 🎉'
          : '• Nessun pagamento necessario: i conti sono già in pari 🎉',
      ]
  const version =
    group.closing_count > 1 ? ` - ${english ? 'version' : 'versione'} ${group.closing_count}` : ''

  return [
    `🧾 ${english ? 'Balance summary' : 'Riepilogo conti'} - ${group.name}${version}`,
    '',
    ...totalLines,
    `👥 ${english ? 'Participants' : 'Partecipanti'}: ${group.members.length}`,
    '',
    english ? '💸 Payments to make:' : '💸 Pagamenti da effettuare:',
    ...payments,
    '',
    english
      ? '🔒 The group is being settled: expenses and participants are locked.'
      : '🔒 Il gruppo è ora in chiusura: spese e partecipanti sono bloccati.',
    english
      ? '🔗 Open Equa to report a payment or confirm receipt:'
      : '🔗 Apri Equa per segnalare un pagamento o confermare una ricezione:',
    groupLink,
  ].join('\n')
}
