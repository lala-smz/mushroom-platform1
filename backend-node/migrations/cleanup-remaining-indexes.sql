USE mushroom_db;

-- 清理剩余的重复 email 索引
ALTER TABLE users DROP INDEX email_2;
ALTER TABLE users DROP INDEX users_email;

-- 检查剩余的索引
SHOW INDEX FROM users;