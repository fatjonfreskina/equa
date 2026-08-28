ALTER TABLE `groups`
ADD COLUMN `closing_count` INT NOT NULL DEFAULT 0;

UPDATE `groups`
SET `closing_count` = 1
WHERE `status` IN ('closing', 'closed')
   OR EXISTS (
     SELECT 1
     FROM `settlements`
     WHERE `settlements`.`group_id` = `groups`.`id`
   );
