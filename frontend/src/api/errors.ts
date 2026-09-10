import { getLocale } from '../utils/i18n'

const messages: Record<string, { it: string; en: string }> = {
  GROUP_NOT_FOUND: { it: 'Gruppo non trovato.', en: 'Group not found.' },
  EXPENSE_NOT_FOUND: { it: 'Spesa non trovata.', en: 'Expense not found.' },
  MEMBER_NOT_FOUND: { it: 'Membro non trovato.', en: 'Participant not found.' },
  SETTLEMENT_NOT_FOUND: { it: 'Pagamento non trovato.', en: 'Payment not found.' },
  EXPENSES_LOCKED: {
    it: 'Le spese sono bloccate durante la chiusura dei conti.',
    en: 'Expenses are locked while balances are being settled.',
  },
  MEMBERS_LOCKED: {
    it: 'I partecipanti sono bloccati durante la chiusura dei conti.',
    en: 'Participants are locked while balances are being settled.',
  },
  SETTLEMENTS_NOT_AVAILABLE: {
    it: 'I pagamenti sono disponibili solo durante la chiusura dei conti.',
    en: 'Payments are available only while balances are being settled.',
  },
  INVALID_STATUS_TRANSITION: {
    it: 'Transizione di stato non consentita.',
    en: 'This status change is not allowed.',
  },
  EXPENSE_REQUIRED_TO_CLOSE: {
    it: 'Aggiungi almeno una spesa prima di chiudere i conti.',
    en: 'Add at least one expense before settling balances.',
  },
  OPEN_SETTLEMENTS: {
    it: 'Conferma tutti i pagamenti prima di chiudere il gruppo.',
    en: 'Confirm every payment before closing the group.',
  },
  MISSING_EXCHANGE_RATES: {
    it: 'Completa i cambi mancanti nelle spese prima di unificare i conti.',
    en: 'Complete the missing exchange rates before combining balances.',
  },
  AUTOMATIC_RATE_UNAVAILABLE: {
    it: 'Cambio automatico non disponibile. Puoi inserirlo manualmente.',
    en: 'The automatic exchange rate is unavailable. You can enter it manually.',
  },
  INVALID_EXPENSE: {
    it: 'I dati della spesa non sono validi.',
    en: 'The expense data is invalid.',
  },
  INVALID_PAYER: {
    it: 'Il pagante non è membro del gruppo.',
    en: 'The payer is not a participant in this group.',
  },
  EMPTY_SPLIT: { it: 'Seleziona almeno un membro.', en: 'Select at least one participant.' },
  DUPLICATE_SPLIT: {
    it: 'I partecipanti non possono essere duplicati.',
    en: 'Participants cannot be duplicated.',
  },
  FOREIGN_MEMBER_SPLIT: {
    it: 'Una quota appartiene a un membro di un altro gruppo.',
    en: 'A share belongs to a participant from another group.',
  },
  SPLIT_TOTAL_MISMATCH: {
    it: 'La somma delle quote non corrisponde al totale.',
    en: 'The shares do not add up to the total.',
  },
  MEMBER_PAID_EXPENSE: {
    it: 'Il partecipante ha pagato una o più spese e non può essere rimosso.',
    en: 'This participant paid one or more expenses and cannot be removed.',
  },
  MEMBER_IN_EXPENSE: {
    it: 'Il partecipante è coinvolto in una o più spese e non può essere rimosso.',
    en: 'This participant is involved in one or more expenses and cannot be removed.',
  },
  MEMBER_IN_SETTLEMENT_HISTORY: {
    it: 'Il partecipante è coinvolto nello storico dei pagamenti e non può essere rimosso.',
    en: 'This participant is part of the payment history and cannot be removed.',
  },
  SETTLEMENT_ALREADY_REPORTED: {
    it: 'Questo pagamento è già stato segnalato o chiuso.',
    en: 'This payment has already been reported or closed.',
  },
  SETTLEMENT_WRONG_PAYER: {
    it: 'Solo chi deve pagare può segnalare questo pagamento.',
    en: 'Only the payer can report this payment.',
  },
  SETTLEMENT_NOT_REPORTED: {
    it: 'Il pagamento deve prima essere segnalato da chi paga.',
    en: 'The payer must report this payment first.',
  },
  SETTLEMENT_WRONG_RECEIVER: {
    it: 'Solo chi riceve può confermare questo pagamento.',
    en: 'Only the recipient can confirm this payment.',
  },
  AMOUNT_LIMIT_EXCEEDED: {
    it: "L'importo supera il limite consentito.",
    en: 'The amount exceeds the allowed limit.',
  },
}

type ApiFailure = {
  response?: {
    data?: { detail?: unknown }
    headers?: Record<string, unknown>
  }
}

export function apiErrorMessage(cause: unknown, fallback: string): string {
  const response = (cause as ApiFailure)?.response
  const code = response?.headers?.['x-error-code']
  if (typeof code === 'string' && messages[code]) return messages[code][getLocale()]
  if (getLocale() === 'it' && typeof response?.data?.detail === 'string') {
    return response.data.detail
  }
  return fallback
}
