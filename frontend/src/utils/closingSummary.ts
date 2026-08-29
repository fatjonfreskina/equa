import type { Balance, Group } from '../api/groups'

export function buildClosingSummary(group: Group, balances: Balance[], groupLink: string): string {
  const amountFormatter = new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: group.currency,
  })
  const totalExpenses = group.expenses.reduce((total, expense) => total + Number(expense.amount), 0)
  const payments = balances.length
    ? balances.map(
        (balance) =>
          `• ${balance.from_member_name} deve ${amountFormatter.format(Number(balance.amount))} a ${balance.to_member_name}`,
      )
    : ['• Nessun pagamento necessario: i conti sono già in pari 🎉']
  const version = group.closing_count > 1 ? ` - versione ${group.closing_count}` : ''

  return [
    `🧾 Riepilogo conti - ${group.name}${version}`,
    '',
    `💰 Totale spese: ${amountFormatter.format(totalExpenses)}`,
    `👥 Partecipanti: ${group.members.length}`,
    '',
    '💸 Pagamenti da effettuare:',
    ...payments,
    '',
    '🔒 Il gruppo è ora in chiusura: spese e partecipanti sono bloccati.',
    '🔗 Apri Equa per segnalare un pagamento o confermare una ricezione:',
    groupLink,
  ].join('\n')
}
