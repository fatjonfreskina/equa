ERROR_CODES = {
    "Gruppo non trovato": "GROUP_NOT_FOUND",
    "Spesa non trovata": "EXPENSE_NOT_FOUND",
    "Membro non trovato": "MEMBER_NOT_FOUND",
    "Pagamento non trovato": "SETTLEMENT_NOT_FOUND",
    "Le spese sono bloccate durante la chiusura dei conti": "EXPENSES_LOCKED",
    "I partecipanti sono bloccati durante la chiusura dei conti": "MEMBERS_LOCKED",
    "I pagamenti sono disponibili solo durante la chiusura dei conti": "SETTLEMENTS_NOT_AVAILABLE",
    "Transizione di stato non consentita": "INVALID_STATUS_TRANSITION",
    "Aggiungi almeno una spesa prima di chiudere i conti": "EXPENSE_REQUIRED_TO_CLOSE",
    "Conferma tutti i pagamenti prima di chiudere il gruppo": "OPEN_SETTLEMENTS",
    "Completa i cambi mancanti nelle spese prima di unificare i conti": "MISSING_EXCHANGE_RATES",
    "Cambio automatico non disponibile. Puoi inserirlo manualmente o salvare la spesa senza cambio": "AUTOMATIC_RATE_UNAVAILABLE",
    "Il pagante non è membro del gruppo": "INVALID_PAYER",
    "Seleziona almeno un membro": "EMPTY_SPLIT",
    "I partecipanti non possono essere duplicati": "DUPLICATE_SPLIT",
    "Una quota appartiene a un membro di un altro gruppo": "FOREIGN_MEMBER_SPLIT",
    "La somma delle quote non corrisponde al totale": "SPLIT_TOTAL_MISMATCH",
    "Impossibile eliminare: il membro ha pagato una o più spese": "MEMBER_PAID_EXPENSE",
    "Impossibile eliminare: il membro è coinvolto in una o più spese": "MEMBER_IN_EXPENSE",
    "Impossibile eliminare: il membro è coinvolto nello storico dei pagamenti": "MEMBER_IN_SETTLEMENT_HISTORY",
    "Questo pagamento è già stato segnalato o chiuso": "SETTLEMENT_ALREADY_REPORTED",
    "Solo chi deve pagare può segnalare questo pagamento": "SETTLEMENT_WRONG_PAYER",
    "Il pagamento deve prima essere segnalato da chi paga": "SETTLEMENT_NOT_REPORTED",
    "Solo chi riceve può confermare questo pagamento": "SETTLEMENT_WRONG_RECEIVER",
    "Un pagamento supera il limite di importo consentito": "AMOUNT_LIMIT_EXCEEDED",
    "L'importo convertito supera il limite consentito": "AMOUNT_LIMIT_EXCEEDED",
    "Feedback non disponibile.": "FEEDBACK_UNAVAILABLE",
    "Troppe segnalazioni. Riprova più tardi.": "FEEDBACK_RATE_LIMIT",
    "Invio del feedback non riuscito. Riprova più tardi.": "FEEDBACK_DELIVERY_FAILED",
}


def error_code(detail: object, status_code: int) -> str:
    if isinstance(detail, str) and detail in ERROR_CODES:
        return ERROR_CODES[detail]
    if status_code in {400, 422}:
        return "INVALID_EXPENSE"
    return "API_ERROR"
