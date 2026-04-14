USE mushroom_db;

-- 清理重复的 username 索引
ALTER TABLE users DROP INDEX users_username;
ALTER TABLE users DROP INDEX username_2;
ALTER TABLE users DROP INDEX username_3;
ALTER TABLE users DROP INDEX username_4;
ALTER TABLE users DROP INDEX username_5;
ALTER TABLE users DROP INDEX username_6;
ALTER TABLE users DROP INDEX username_7;
ALTER TABLE users DROP INDEX username_8;
ALTER TABLE users DROP INDEX username_9;
ALTER TABLE users DROP INDEX username_10;
ALTER TABLE users DROP INDEX username_11;
ALTER TABLE users DROP INDEX username_12;
ALTER TABLE users DROP INDEX username_13;
ALTER TABLE users DROP INDEX username_14;
ALTER TABLE users DROP INDEX username_15;
ALTER TABLE users DROP INDEX username_16;
ALTER TABLE users DROP INDEX username_17;
ALTER TABLE users DROP INDEX username_18;
ALTER TABLE users DROP INDEX username_19;
ALTER TABLE users DROP INDEX username_20;
ALTER TABLE users DROP INDEX username_21;
ALTER TABLE users DROP INDEX username_22;
ALTER TABLE users DROP INDEX username_23;
ALTER TABLE users DROP INDEX username_24;
ALTER TABLE users DROP INDEX username_25;
ALTER TABLE users DROP INDEX username_26;
ALTER TABLE users DROP INDEX username_27;
ALTER TABLE users DROP INDEX username_28;
ALTER TABLE users DROP INDEX username_29;
ALTER TABLE users DROP INDEX username_30;

-- 清理重复的 email 索引
ALTER TABLE users DROP INDEX users_email;
ALTER TABLE users DROP INDEX email_2;
ALTER TABLE users DROP INDEX email_3;
ALTER TABLE users DROP INDEX email_4;
ALTER TABLE users DROP INDEX email_5;
ALTER TABLE users DROP INDEX email_6;
ALTER TABLE users DROP INDEX email_7;
ALTER TABLE users DROP INDEX email_8;
ALTER TABLE users DROP INDEX email_9;
ALTER TABLE users DROP INDEX email_10;
ALTER TABLE users DROP INDEX email_11;
ALTER TABLE users DROP INDEX email_12;
ALTER TABLE users DROP INDEX email_13;
ALTER TABLE users DROP INDEX email_14;
ALTER TABLE users DROP INDEX email_15;
ALTER TABLE users DROP INDEX email_16;
ALTER TABLE users DROP INDEX email_17;
ALTER TABLE users DROP INDEX email_18;
ALTER TABLE users DROP INDEX email_19;
ALTER TABLE users DROP INDEX email_20;
ALTER TABLE users DROP INDEX email_21;
ALTER TABLE users DROP INDEX email_22;
ALTER TABLE users DROP INDEX email_23;
ALTER TABLE users DROP INDEX email_24;
ALTER TABLE users DROP INDEX email_25;
ALTER TABLE users DROP INDEX email_26;
ALTER TABLE users DROP INDEX email_27;
ALTER TABLE users DROP INDEX email_28;

-- 检查剩余的索引
SHOW INDEX FROM users;