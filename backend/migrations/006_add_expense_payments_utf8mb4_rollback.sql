-- Stop the updated backend before this rollback.
-- The rollback is intentionally blocked if any expense has multiple payers.
-- utf8mb4 is retained because reverting it could destroy Unicode data.
DELIMITER //
CREATE PROCEDURE equa_rollback_006()
BEGIN
    IF EXISTS (
        SELECT 1
        FROM expense_payments
        GROUP BY expense_id
        HAVING COUNT(*) <> 1
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Rollback 006 blocked: multi-payer expenses exist';
    END IF;

    UPDATE expenses AS e
    JOIN expense_payments AS p ON p.expense_id = e.id
    SET e.paid_by_member_id = p.member_id;

    DROP TABLE expense_payments;
END//
DELIMITER ;

CALL equa_rollback_006();
DROP PROCEDURE equa_rollback_006;
