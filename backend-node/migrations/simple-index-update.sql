USE mushroom_db;

ALTER TABLE carts DROP INDEX userId_productId;

ALTER TABLE carts ADD UNIQUE INDEX carts_userId_productId_type_unique (userId, productId, type);

SHOW INDEX FROM carts;
