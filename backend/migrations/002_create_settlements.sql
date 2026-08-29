CREATE TABLE `settlements` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `group_id` VARCHAR(36) NOT NULL,
  `from_member_id` INT NOT NULL,
  `to_member_id` INT NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'pending',
  `reported_by_member_id` INT NULL,
  `reported_at` DATETIME NULL,
  `confirmed_by_member_id` INT NULL,
  `confirmed_at` DATETIME NULL,
  `created_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_settlements_group` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`),
  CONSTRAINT `fk_settlements_from_member` FOREIGN KEY (`from_member_id`) REFERENCES `members` (`id`),
  CONSTRAINT `fk_settlements_to_member` FOREIGN KEY (`to_member_id`) REFERENCES `members` (`id`),
  CONSTRAINT `fk_settlements_reported_by_member` FOREIGN KEY (`reported_by_member_id`) REFERENCES `members` (`id`),
  CONSTRAINT `fk_settlements_confirmed_by_member` FOREIGN KEY (`confirmed_by_member_id`) REFERENCES `members` (`id`)
);
