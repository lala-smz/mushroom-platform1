-- 购物车表添加 type 字段的迁移脚本
-- 执行前请先备份数据库

USE mushroom_db;

-- 检查 type 字段是否存在，如果不存在则添加
SET @dbname = DATABASE();
SET @tablename = 'carts';
SET @columnname = 'type';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_schema = @dbname)
      AND (table_name = @tablename)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT(
    'ALTER TABLE ', @tablename, ' ADD COLUMN `type` ENUM(\'product\', \'box\') NOT NULL DEFAULT \'product\' COMMENT \'商品类型：product-普通商品，box-盲盒\' AFTER `productId`'
  )
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 更新唯一索引
-- 先删除旧的唯一索引
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (table_schema = @dbname)
      AND (table_name = @tablename)
      AND (index_name = 'carts_userid_productid_unique')
  ) > 0,
  'ALTER TABLE carts DROP INDEX carts_userid_productid_unique',
  'SELECT 1'
));
PREPARE dropIndexIfExists FROM @preparedStatement;
EXECUTE dropIndexIfExists;
DEALLOCATE PREPARE dropIndexIfExists;

-- 添加新的唯一索引（包含 type 字段）
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (table_schema = @dbname)
      AND (table_name = @tablename)
      AND (index_name = 'carts_userid_productid_type_unique')
  ) > 0,
  'SELECT 1',
  'ALTER TABLE carts ADD UNIQUE INDEX carts_userid_productid_type_unique (userId, productId, type)'
));
PREPARE addIndexIfNotExists FROM @preparedStatement;
EXECUTE addIndexIfNotExists;
DEALLOCATE PREPARE addIndexIfNotExists;

-- 添加 type 字段的索引
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (table_schema = @dbname)
      AND (table_name = @tablename)
      AND (index_name = 'idx_type')
  ) > 0,
  'SELECT 1',
  'ALTER TABLE carts ADD INDEX idx_type (type)'
));
PREPARE addTypeIndexIfNotExists FROM @preparedStatement;
EXECUTE addTypeIndexIfNotExists;
DEALLOCATE PREPARE addTypeIndexIfNotExists;

SELECT '数据库迁移完成！' AS message;
