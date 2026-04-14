-- 更新 carts 表的唯一索引，添加 type 字段
USE mushroom_db;

-- 查看当前索引
SHOW INDEX FROM carts;

-- 删除旧的唯一索引
SET @dbname = DATABASE();
SET @tablename = 'carts';
SET @oldIndexName = 'userId_productId';
SET @newIndexName = 'carts_userId_productId_type_unique';

-- 删除旧的唯一索引
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (table_schema = @dbname)
      AND (table_name = @tablename)
      AND (index_name = @oldIndexName)
  ) > 0,
  CONCAT('ALTER TABLE ', @tablename, ' DROP INDEX ', @oldIndexName),
  'SELECT 1'
));
PREPARE dropOldIndex FROM @preparedStatement;
EXECUTE dropOldIndex;
DEALLOCATE PREPARE dropOldIndex;

-- 添加新的唯一索引（包含 type 字段）
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (table_schema = @dbname)
      AND (table_name = @tablename)
      AND (index_name = @newIndexName)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD UNIQUE INDEX ', @newIndexName, ' (userId, productId, type)')
));
PREPARE addNewIndex FROM @preparedStatement;
EXECUTE addNewIndex;
DEALLOCATE PREPARE addNewIndex;

-- 验证索引已更新
SHOW INDEX FROM carts;

SELECT '唯一索引更新完成！' AS message;
