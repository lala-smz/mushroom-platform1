-- 移除 carts 表的外键约束
USE mushroom_db;

-- 首先查看 carts 表的外键约束
SHOW CREATE TABLE carts;

-- 移除 carts 表的 productId 外键约束
SET @dbname = DATABASE();
SET @tablename = 'carts';
SET @foreignKeyName = 'carts_productId_foreign';

-- 查找并删除外键约束
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE
      (table_schema = @dbname)
      AND (table_name = @tablename)
      AND (constraint_name = @foreignKeyName)
  ) > 0,
  CONCAT('ALTER TABLE ', @tablename, ' DROP FOREIGN KEY ', @foreignKeyName),
  'SELECT 1'
));
PREPARE dropForeignKey FROM @preparedStatement;
EXECUTE dropForeignKey;
DEALLOCATE PREPARE dropForeignKey;

-- 再次查看 carts 表的结构，确认外键约束已被移除
SHOW CREATE TABLE carts;

SELECT '外键约束移除完成！' AS message;
