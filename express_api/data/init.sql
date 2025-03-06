CREATE TABLE `api`.`users` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `username` varchar(255) UNIQUE NOT NULL,
  `sha256_password` varchar(255) NOT NULL
);

CREATE TABLE `api`.`items` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(255) UNIQUE NOT NULL,
  `descripiton` varchar(255),
  `owner_id` integer NOT NULL
);

CREATE TABLE `api`.`tokens` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `user_id` integer NOT NULL,
  `token` varchar(255) UNIQUE NOT NULL,
  `expires` timestamp NOT NULL
);


ALTER TABLE `api`.`items` ADD FOREIGN KEY (`owner_id`) REFERENCES `api`.`users` (`id`);

ALTER TABLE `api`.`tokens` ADD FOREIGN KEY (`user_id`) REFERENCES `api`.`users` (`id`);
CREATE EVENT
IF NOT EXISTS expire_tokens_event
 ON SCHEDULE EVERY 1 MINUTE
 DO DELETE FROM api.tokens WHERE
 expires > DATE_ADD(NOW(), INTERVAL 10 MINUTE);

CREATE USER `program`@`%` IDENTIFIED WITH 'caching_sha2_password' BY 'password' REQUIRE NONE PASSWORD EXPIRE DEFAULT ACCOUNT UNLOCK PASSWORD HISTORY DEFAULT PASSWORD REUSE INTERVAL DEFAULT PASSWORD REQUIRE CURRENT DEFAULT;
GRANT ALL PRIVILEGES ON api.* TO 'program'@'%'
WITH GRANT OPTION;
FLUSH PRIVILEGES;
