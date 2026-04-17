USE railway;

-- 删除现有表
DROP TABLE IF EXISTS `addresses`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;

-- 创建 users 表
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_login_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建 categories 表
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_id` int DEFAULT '0',
  `sort_order` int DEFAULT '0',
  `status` tinyint(1) DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建 products 表
CREATE TABLE IF NOT EXISTS `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(10,2) NOT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `category_id` int DEFAULT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint(1) DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建 addresses 表
CREATE TABLE IF NOT EXISTS `addresses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `province` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `district` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `detail` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_default` tinyint(1) DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入测试用户
INSERT INTO `users` (`id`, `username`, `password`, `email`, `phone`, `role`, `status`, `created_at`, `updated_at`) VALUES
(1, 'admin', '$2a$10$5YliCX/zf6Bt50Xspwl7.uEMIOqyyykLZH3ACzdtkhFEm75zOyt6e', 'admin@example.com', '13800138000', 'admin', 1, '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(2, 'aaa', '$2b$10$N9qo8uLOickgx2ZMRZoMye.IjzqAKL9xL5jvMFVdNJHvGCgTq/VEq', 'aaa@example.com', '13800138001', 'seller', 1, '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(3, 'user1', '$2b$10$N9qo8uLOickgx2ZMRZoMye.IjzqAKL9xL5jvMFVdNJHvGCgTq/VEq', 'user1@example.com', '13800138002', 'user', 1, '2024-01-01 00:00:00', '2024-01-01 00:00:00');

-- 插入测试分类
INSERT INTO `categories` (`id`, `name`, `parent_id`, `sort_order`, `status`, `created_at`, `updated_at`) VALUES
(1, '时令盲盒', 0, 1, 1, '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(2, '新鲜菌菇', 0, 2, 1, '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(3, '干货特产', 0, 3, 1, '2024-01-01 00:00:00', '2024-01-01 00:00:00');

-- 插入测试商品
INSERT INTO `products` (`id`, `name`, `description`, `price`, `stock`, `category_id`, `image`, `status`, `created_at`, `updated_at`) VALUES
(1, '香菇', '新鲜香菇，产地直供', 25.00, 100, 2, '/images/mushroom1.jpg', 1, '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(2, '金针菇', '新鲜金针菇，口感爽脆', 15.00, 200, 2, '/images/mushroom2.jpg', 1, '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(3, '时令盲盒A', '精选时令菌菇盲盒', 99.00, 50, 1, '/images/box1.jpg', 1, '2024-01-01 00:00:00', '2024-01-01 00:00:00');