-- Run once after 005, before deploying multi-payer expenses.
-- utf8mb4 is required for emoji and the full Unicode range.
ALTER DATABASE CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

SET @EQUA_OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS;
SET FOREIGN_KEY_CHECKS = 0;
ALTER TABLE `groups` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE members CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE expenses CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE expense_splits CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE settlements CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE email_link_challenges CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE email_link_rate_limits CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SET FOREIGN_KEY_CHECKS = @EQUA_OLD_FOREIGN_KEY_CHECKS;

CREATE TABLE expense_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    expense_id INT NOT NULL,
    member_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    CONSTRAINT uq_expense_payment_member UNIQUE (expense_id, member_id),
    CONSTRAINT fk_expense_payments_expense
        FOREIGN KEY (expense_id) REFERENCES expenses(id),
    CONSTRAINT fk_expense_payments_member
        FOREIGN KEY (member_id) REFERENCES members(id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO expense_payments (expense_id, member_id, amount)
SELECT id, paid_by_member_id, amount
FROM expenses;
