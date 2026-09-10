from backend.app.errors import error_code


def test_known_error_has_stable_code():
    assert error_code("Gruppo non trovato", 404) == "GROUP_NOT_FOUND"
    assert (
        error_code(
            "Impossibile eliminare: il membro è coinvolto nello storico dei pagamenti",
            400,
        )
        == "MEMBER_IN_SETTLEMENT_HISTORY"
    )


def test_validation_and_unknown_errors_have_safe_generic_codes():
    assert error_code("Importo non valido per EUR", 400) == "INVALID_EXPENSE"
    assert error_code("Errore inatteso", 500) == "API_ERROR"
