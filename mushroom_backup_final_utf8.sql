-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: mushroom_db
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `addresses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL COMMENT '鐢ㄦ埛ID',
  `receiver` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '鏀朵欢浜哄鍚?,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '鑱旂郴鐢佃瘽',
  `province` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '鐪佷唤',
  `city` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '鍩庡競',
  `district` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '鍖哄幙',
  `detail` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '璇︾粏鍦板潃',
  `postalCode` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '閭斂缂栫爜',
  `isDefault` tinyint(1) NOT NULL DEFAULT '0' COMMENT '鏄惁榛樿鍦板潃',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='鐢ㄦ埛鍦板潃琛?;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresses`
--

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
INSERT INTO `addresses` VALUES (1,2,'张三','13845557834','河北省','承德市','双桥区','xxxxxxxxxxxxxx','010000',0,'2026-01-24 09:35:29','2026-02-22 04:41:50'),(2,2,'ddd','13351326666','d','fefef','ddd','efdwf\ndwq',NULL,0,'2026-01-24 09:35:57','2026-02-22 04:41:50'),(3,3,'11111111','13351344444','wfefe','fefef','44444444','efdwf\ndwq',NULL,0,'2026-02-19 10:47:36','2026-02-19 10:47:36'),(4,36,'111111','13351324465','河北省','承德市','44','xxxxxxxxxxxxxx','010000',1,'2026-04-11 07:53:48','2026-04-11 07:53:48'),(5,4,'11','13351324443','河北省','承德市','44','xxxxxxxxxxxxxx','010000',0,'2026-04-13 04:30:37','2026-04-13 04:30:37');
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carts` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '鐠?澧挎潪?D',
  `userId` int NOT NULL COMMENT '鐢ㄦ埛ID',
  `productId` int NOT NULL COMMENT '鍟嗗搧ID',
  `type` enum('product','box') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'product' COMMENT '鍟嗗搧绫诲瀷锛歱roduct-鏅€氬晢鍝侊紝box-鐩茬洅',
  `quantity` int NOT NULL DEFAULT '1' COMMENT '鍟嗗搧鏁伴噺',
  `selected` tinyint(1) NOT NULL DEFAULT '1' COMMENT '鏄惁閫変腑',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `carts_userId_productId_type_unique` (`userId`,`productId`,`type`),
  UNIQUE KEY `carts_user_id_product_id_type` (`userId`,`productId`,`type`),
  KEY `userId` (`userId`),
  KEY `productId` (`productId`),
  KEY `idx_type` (`type`),
  KEY `carts_user_id` (`userId`),
  KEY `carts_product_id` (`productId`),
  KEY `carts_type` (`type`),
  CONSTRAINT `carts_ibfk_23` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `carts_ibfk_24` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=115 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='鐠?澧挎潪锕併€?;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '鍒嗙被ID',
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '鍒嗙被鍚嶇О',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '鍒嗙被鎻忚堪',
  `sortOrder` int NOT NULL DEFAULT '0' COMMENT '鎺掑簭椤哄簭',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active' COMMENT '鐘舵€侊紙active/inactive锛?,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `name_2` (`name`),
  UNIQUE KEY `name_3` (`name`),
  UNIQUE KEY `name_4` (`name`),
  UNIQUE KEY `name_5` (`name`),
  UNIQUE KEY `name_6` (`name`),
  UNIQUE KEY `name_7` (`name`),
  UNIQUE KEY `name_8` (`name`),
  UNIQUE KEY `name_9` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'食用菌','可食用的菌类产品',1,'active','2026-04-05 13:38:20','2026-04-05 13:38:20'),(2,'平菇类','包含灰平菇、白平菇、榆黄蘑、凤尾菇等同类商品',1,'active','2026-04-05 13:38:20','2026-04-05 13:38:20'),(3,'灰平菇',NULL,1,'active','2026-04-05 13:38:20','2026-04-05 13:38:20'),(4,'白平菇',NULL,2,'active','2026-04-05 13:38:20','2026-04-05 13:38:20'),(5,'榆黄蘑',NULL,3,'active','2026-04-05 13:38:20','2026-04-05 13:38:20'),(6,'凤尾菇',NULL,4,'active','2026-04-05 13:38:20','2026-04-05 13:38:20'),(7,'木耳类','包含黑木耳、毛木耳、玉木耳、皱木耳等同类商品',2,'active','2026-04-05 13:38:20','2026-04-05 13:38:20'),(8,'黑木耳',NULL,1,'active','2026-04-05 13:38:20','2026-04-05 13:38:20'),(9,'毛木耳',NULL,2,'active','2026-04-05 13:38:20','2026-04-05 13:38:20'),(10,'玉木耳',NULL,3,'active','2026-04-05 13:38:20','2026-04-05 13:38:20'),(11,'皱木耳',NULL,4,'active','2026-04-05 13:38:20','2026-04-05 13:38:20'),(12,'香菇类','包含鲜香菇、干香菇、花菇等同类商品',3,'active','2026-04-05 13:38:20','2026-04-05 13:38:20'),(13,'鲜香菇',NULL,1,'active','2026-04-05 13:38:20','2026-04-05 13:38:20'),(14,'干香菇',NULL,2,'active','2026-04-05 13:38:20','2026-04-05 13:38:20'),(15,'花菇',NULL,3,'active','2026-04-05 13:38:20','2026-04-05 13:38:20'),(16,'口蘑类','包含双孢菇、褐蘑菇、草原口蘑等同类商品',4,'active','2026-04-05 13:38:20','2026-04-05 13:38:20'),(17,'金针菇类','金针菇相关产品',5,'active','2026-04-05 13:38:20','2026-04-05 13:38:20'),(18,'杏鲍菇/白灵菇类','杏鲍菇和白灵菇相关产品',6,'active','2026-04-05 13:38:20','2026-04-05 13:38:20'),(19,'其他食用菌','包含羊肚菌、牛肝菌等人工栽培品种',7,'active','2026-04-05 13:38:20','2026-04-05 13:38:20'),(20,'药用菌','具有药用价值的菌类产品',2,'active','2026-04-05 13:38:20','2026-04-05 13:38:20'),(21,'灵芝类',NULL,1,'active','2026-04-05 13:38:20','2026-04-05 13:38:20'),(22,'虫草类',NULL,2,'active','2026-04-05 13:38:20','2026-04-05 13:38:20'),(23,'茯苓/天麻类',NULL,3,'active','2026-04-05 13:38:20','2026-04-05 13:38:20'),(24,'猴头菇类',NULL,4,'active','2026-04-05 13:38:20','2026-04-05 13:38:20'),(25,'其他药用菌',NULL,5,'active','2026-04-05 13:38:20','2026-04-05 13:38:20'),(26,'野生菌','野生生长的菌类产品',3,'active','2026-04-05 13:38:20','2026-04-05 13:38:20'),(27,'牛肝菌类',NULL,1,'active','2026-04-05 13:38:20','2026-04-05 13:38:20'),(28,'羊肚菌类',NULL,2,'active','2026-04-05 13:38:20','2026-04-05 13:38:20'),(29,'鸡枞类',NULL,3,'active','2026-04-05 13:38:20','2026-04-05 13:38:20'),(30,'其他野生菌',NULL,4,'active','2026-04-05 13:38:20','2026-04-05 13:38:20'),(31,'野生木耳类','野生木耳相关产品',5,'active','2026-04-05 13:38:20','2026-04-05 13:38:20'),(32,'菌包','用于种植的菌包产品',4,'active','2026-04-05 13:38:20','2026-04-05 13:38:20'),(33,'平菇菌包',NULL,1,'active','2026-04-05 13:38:20','2026-04-05 13:38:20'),(34,'木耳菌包',NULL,2,'active','2026-04-05 13:38:20','2026-04-05 13:38:20'),(35,'香菇菌包',NULL,3,'active','2026-04-05 13:38:20','2026-04-05 13:38:20'),(36,'其他菌包',NULL,4,'active','2026-04-05 13:38:20','2026-04-05 13:38:20'),(37,'菌种','用于繁殖的菌种产品',5,'active','2026-04-05 13:38:20','2026-04-05 13:38:20'),(38,'平菇菌种',NULL,1,'active','2026-04-05 13:38:20','2026-04-05 13:38:20'),(39,'木耳菌种',NULL,2,'active','2026-04-05 13:38:20','2026-04-05 13:38:20'),(40,'香菇菌种',NULL,3,'active','2026-04-05 13:38:20','2026-04-05 13:38:20'),(41,'其他菌种',NULL,4,'active','2026-04-05 13:38:20','2026-04-05 13:38:20'),(42,'时令菌菇盲盒','按季节周期/产品组合划分的盲盒产品',6,'active','2026-04-05 13:38:20','2026-04-05 13:38:20'),(43,'春季盲盒','',1,'active','2026-04-05 13:38:20','2026-04-06 02:14:13'),(44,'夏季盲盒',NULL,2,'active','2026-04-05 13:38:20','2026-04-05 13:38:20'),(45,'秋季盲盒',NULL,3,'active','2026-04-05 13:38:20','2026-04-05 13:38:20'),(46,'冬季盲盒',NULL,4,'active','2026-04-05 13:38:20','2026-04-05 13:38:20'),(47,'菌菇','兜底分类，仅限放置无法归入上述分类的特殊商品',7,'active','2026-04-05 13:38:20','2026-04-05 13:38:20');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '璇勮ID',
  `workId` int NOT NULL COMMENT '浣滃搧ID',
  `userId` int NOT NULL COMMENT '鐢ㄦ埛ID',
  `content` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `parentId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `workId` (`workId`),
  KEY `userId` (`userId`),
  KEY `comments_work_id` (`workId`),
  KEY `comments_user_id` (`userId`),
  KEY `comments_created_at` (`createdAt`),
  KEY `parentId` (`parentId`),
  CONSTRAINT `comments_ibfk_29` FOREIGN KEY (`workId`) REFERENCES `works` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `comments_ibfk_30` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `comments_ibfk_31` FOREIGN KEY (`parentId`) REFERENCES `comments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='璇勮琛?;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (1,5,2,'杀杀杀杀杀杀杀杀杀','2026-02-07 14:42:55','2026-02-07 14:42:55',NULL,NULL),(2,5,2,'水水水水水水水水','2026-02-07 14:43:00','2026-02-07 14:43:00',NULL,NULL),(4,5,2,'l\n','2026-02-07 15:08:18','2026-02-07 15:08:18',NULL,NULL),(5,3,2,'顶顶顶顶顶顶顶顶顶','2026-02-07 15:14:17','2026-02-07 15:14:17',NULL,NULL),(6,3,2,'的','2026-02-07 15:15:34','2026-02-07 15:15:34',NULL,NULL),(7,3,2,'dddddd','2026-02-07 15:19:14','2026-02-07 15:19:14',NULL,NULL),(8,7,2,'ss','2026-02-07 15:51:10','2026-02-07 15:51:10',NULL,NULL),(9,7,2,'ss','2026-02-07 15:52:01','2026-02-07 15:52:01',NULL,NULL),(10,7,2,'','2026-02-07 16:01:51','2026-02-07 16:01:51',4,NULL),(11,7,2,'的','2026-02-07 16:02:03','2026-02-07 16:02:03',2,NULL),(13,7,2,'','2026-02-07 16:21:04','2026-02-07 16:21:04',3,NULL),(15,7,2,'','2026-02-07 16:33:46','2026-02-07 16:33:46',2,NULL),(16,3,2,'','2026-02-08 02:47:31','2026-02-08 02:47:31',2,NULL),(23,5,2,'ssss','2026-02-08 03:15:31','2026-02-08 03:15:31',NULL,NULL),(24,5,2,'','2026-02-08 03:17:07','2026-02-08 03:17:07',4,NULL),(25,5,2,'6566','2026-02-08 03:17:29','2026-02-08 03:17:29',3,NULL),(26,5,2,'','2026-02-08 03:47:50','2026-02-08 03:47:50',3,NULL),(27,5,2,'','2026-02-08 03:58:55','2026-02-08 03:58:55',3,NULL),(28,5,2,'44\n','2026-02-08 03:59:33','2026-02-08 03:59:33',5,NULL),(29,5,2,'地对地导弹的','2026-02-08 04:19:27','2026-02-08 04:19:27',5,NULL),(30,5,2,'顶顶顶顶顶','2026-02-08 04:19:56','2026-02-08 04:19:56',5,NULL),(31,5,2,'6','2026-02-08 04:45:04','2026-02-08 04:45:04',5,NULL),(32,5,2,'7\n','2026-02-08 05:43:17','2026-02-08 05:43:17',5,NULL),(33,5,2,'44','2026-02-08 05:49:57','2026-02-08 05:49:57',5,NULL),(34,5,2,'就看见','2026-02-08 05:51:31','2026-02-08 05:51:31',5,NULL),(35,3,2,'','2026-02-08 07:08:54','2026-02-08 07:08:54',2,NULL),(36,3,2,'ii','2026-02-08 07:09:05','2026-02-08 07:09:05',5,NULL),(37,8,2,'','2026-02-08 07:11:45','2026-02-08 07:11:45',3,NULL),(38,8,2,'ddd','2026-02-08 08:50:21','2026-02-08 08:50:21',4,NULL),(39,3,2,'','2026-02-08 13:00:30','2026-02-08 13:00:30',2,NULL),(40,3,2,'4444','2026-02-08 13:00:38','2026-02-08 13:00:38',4,NULL),(41,3,2,'呱呱呱呱呱呱','2026-02-08 13:00:42','2026-02-08 13:00:42',5,40),(42,3,2,'灌灌灌灌灌灌灌灌','2026-02-08 13:00:47','2026-02-08 13:00:47',5,40),(43,3,2,'嘎嘎嘎嘎嘎嘎嘎','2026-02-08 13:00:57','2026-02-08 13:00:57',5,39),(44,3,2,'111','2026-02-10 09:39:26','2026-02-10 09:39:26',5,40),(48,5,2,'','2026-02-17 02:43:22','2026-02-17 02:43:22',5,NULL),(49,5,2,'','2026-02-17 02:48:50','2026-02-17 02:48:50',3,NULL),(50,5,2,'','2026-02-17 02:50:28','2026-02-17 02:50:28',3,NULL),(51,5,2,'','2026-02-17 03:08:11','2026-02-17 03:08:11',2,NULL),(53,3,2,'','2026-02-17 03:48:44','2026-02-17 03:48:44',4,NULL),(54,3,2,'','2026-02-17 04:03:12','2026-02-17 04:03:12',2,NULL),(55,3,2,'ddddddddd','2026-02-17 04:10:18','2026-02-17 04:10:18',4,NULL),(56,3,2,'','2026-02-17 04:18:28','2026-02-17 04:18:28',3,NULL),(57,3,2,'','2026-02-17 04:18:57','2026-02-17 04:18:57',5,NULL),(58,5,2,'','2026-02-17 04:32:07','2026-02-17 04:32:07',3,NULL),(59,5,3,'水水水水水水','2026-02-19 02:36:27','2026-02-19 02:36:27',5,34),(62,4,2,'s','2026-04-04 01:47:39','2026-04-04 01:47:39',2,NULL),(63,5,36,'4','2026-04-11 07:55:46','2026-04-11 07:55:46',4,NULL);
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `content_reviews`
--

DROP TABLE IF EXISTS `content_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `content_reviews` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '瀹℃牳ID',
  `contentType` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '鍐呭绫诲瀷锛坢ushroom/recipe/cookingVideo锛?,
  `contentId` int NOT NULL COMMENT '鍐呭ID',
  `reviewerId` int DEFAULT NULL COMMENT '瀹℃牳鍛業D',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT '瀹℃牳鐘舵€侊紙pending/approved/rejected锛?,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `reviewNote` text COLLATE utf8mb4_unicode_ci COMMENT '瀹℃牳澶囨敞',
  `accuracyScore` int DEFAULT NULL COMMENT '鍑嗙‘鎬ц瘎鍒嗭紙1-5锛?,
  `professionalismScore` int DEFAULT NULL COMMENT '涓撲笟鎬ц瘎鍒嗭紙1-5锛?,
  `legalityScore` int DEFAULT NULL COMMENT '鍚堟硶鎬ц瘎鍒嗭紙1-5锛?,
  `issueTypes` json DEFAULT NULL COMMENT '闂绫诲瀷锛屽锛歔"淇℃伅閿欒", "涓撲笟鏈涓嶅噯纭?]',
  `suggestedChanges` text COLLATE utf8mb4_unicode_ci COMMENT '寤鸿淇敼鍐呭',
  PRIMARY KEY (`id`),
  KEY `contentType` (`contentType`),
  KEY `contentId` (`contentId`),
  KEY `reviewerId` (`reviewerId`),
  KEY `status` (`status`),
  CONSTRAINT `content_reviews_reviewerId_foreign` FOREIGN KEY (`reviewerId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='鍐呭瀹℃牳琛?;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `content_reviews`
--

LOCK TABLES `content_reviews` WRITE;
/*!40000 ALTER TABLE `content_reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `content_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversations`
--

DROP TABLE IF EXISTS `conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `initiatorId` int NOT NULL COMMENT '鍙戣捣鑰匢D',
  `initiatorRole` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '鍙戣捣鑰呰鑹诧紙user/seller/admin锛?,
  `receiverId` int NOT NULL COMMENT '鎺ユ敹鑰匢D',
  `receiverRole` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '鎺ユ敹鑰呰鑹诧紙user/seller/admin锛?,
  `lastMessageId` int DEFAULT NULL COMMENT '鏈€鍚庝竴鏉℃秷鎭疘D',
  `unreadCount` int DEFAULT '0' COMMENT '鏈娑堟伅鏁伴噺',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='瀵硅瘽琛?;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversations`
--

LOCK TABLES `conversations` WRITE;
/*!40000 ALTER TABLE `conversations` DISABLE KEYS */;
INSERT INTO `conversations` VALUES (1,2,'admin',2,'seller',23,0,'2026-01-24 12:10:39','2026-04-12 07:01:34'),(2,2,'admin',3,'seller',45,0,'2026-01-24 12:57:12','2026-04-12 07:01:35'),(3,3,'seller',3,'seller',NULL,0,'2026-02-05 07:01:26','2026-04-04 13:35:57');
/*!40000 ALTER TABLE `conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cooking_videos`
--

DROP TABLE IF EXISTS `cooking_videos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cooking_videos` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '瑙嗛ID',
  `title` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '瑙嗛鏍囬',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '瑙嗛鎻忚堪',
  `videoUrl` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '瑙嗛URL',
  `thumbnailUrl` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '瑙嗛缂╃暐鍥綰RL',
  `duration` int DEFAULT NULL COMMENT '瑙嗛鏃堕暱锛堢锛?,
  `mushroomType` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '鑿岃弴绫诲瀷',
  `difficulty` enum('easy','medium','hard') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'medium' COMMENT '闅惧害绛夌骇',
  `views` int NOT NULL DEFAULT '0' COMMENT '瑙傜湅娆℃暟',
  `likes` int NOT NULL DEFAULT '0' COMMENT '鐐硅禐鏁?,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active' COMMENT '鐘舵€侊紙active/inactive锛?,
  `createdBy` int DEFAULT NULL COMMENT '鍒涘缓鑰匢D',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `recipeId` int DEFAULT NULL COMMENT '鍏宠仈鐨勮彍璋盜D',
  `mushroomId` int DEFAULT NULL COMMENT '鍏宠仈鐨勮弻鑿嘔D',
  `mushroomBoxId` int DEFAULT NULL COMMENT '鍏宠仈鐨勭洸鐩扞D',
  `category` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'cultivation' COMMENT '瑙嗛鍒嗙被锛坈ultivation/cooking/identification/general锛?,
  `sortOrder` int NOT NULL DEFAULT '0' COMMENT '鎺掑簭椤哄簭',
  `tags` text COLLATE utf8mb4_unicode_ci COMMENT '瑙嗛鏍囩锛圝SON鏁扮粍鏍煎紡锛?,
  `quality` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '瑙嗛璐ㄩ噺锛坔d/sd锛?,
  `source` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '瑙嗛鏉ユ簮',
  `viewCount` int NOT NULL DEFAULT '0' COMMENT '瑙傜湅娆℃暟',
  `likeCount` int NOT NULL DEFAULT '0' COMMENT '鐐硅禐娆℃暟',
  `favoriteCount` int NOT NULL DEFAULT '0' COMMENT '鏀惰棌娆℃暟',
  `reviewStatus` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'approved' COMMENT '瀹℃牳鐘舵€侊紙pending/approved/rejected锛?,
  `reviewNote` text COLLATE utf8mb4_unicode_ci COMMENT '瀹℃牳澶囨敞',
  PRIMARY KEY (`id`),
  KEY `mushroomType` (`mushroomType`),
  KEY `difficulty` (`difficulty`),
  KEY `status` (`status`),
  KEY `createdBy` (`createdBy`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='鐑归オ瑙嗛琛?;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cooking_videos`
--

LOCK TABLES `cooking_videos` WRITE;
/*!40000 ALTER TABLE `cooking_videos` DISABLE KEYS */;
INSERT INTO `cooking_videos` VALUES (2,'平菇种植全教程 - 从接种到收获','详细讲解平菇的完整种植过程，包括基质准备、接种、发菌管理和收获等关键步骤。适合初学者入门学习。','https://example.com/videos/oyster-mushroom-cultivation.mp4','https://example.com/thumbnails/oyster-mushroom.jpg',1800,'平菇','medium',1250,89,'active',2,'2026-02-17 00:48:22','2026-02-19 11:00:56',NULL,NULL,77,'cultivation',1,'[\"平菇\",\"种植\",\"教程\"]','hd','原创',1250,89,45,'approved',NULL),(3,'香菇滑鸡家常做法',NULL,'https://example.com/videos/chicken-mushroom.mp4','https://example.com/thumbnails/chicken-mushroom.jpg',1200,'香菇','easy',800,56,'active',2,'2026-02-17 00:48:22','2026-02-19 11:00:56',NULL,NULL,78,'cooking',2,NULL,'hd','原创',800,56,23,'approved',NULL),(4,'常见食用蘑菇识别指南',NULL,'https://example.com/videos/mushroom-identification.mp4','https://example.com/thumbnails/mushroom-id.jpg',900,'多种','easy',450,32,'active',2,'2026-02-17 00:48:22','2026-02-19 11:00:56',NULL,NULL,79,'identification',3,NULL,'hd','原创',450,32,12,'approved',NULL),(6,'11111111111','视频创建失败: 创建烹饪视频失败: Field \'mushroomType\' doesn\'t have a default value','http://localhost:3003/uploads/videos/video-1771334659939-9665984.mp4','http://localhost:3303/uploads/video-thumbnails/thumbnail-1775912382620-791313262.png',60,NULL,'medium',0,0,'active',NULL,'2026-02-17 13:24:27','2026-04-11 12:59:47',NULL,NULL,74,'cultivation',0,'[\"[\\\"[\\\\\\\"[]\\\\\\\"]\\\"]\"]','hd',NULL,0,0,0,'approved',NULL);
/*!40000 ALTER TABLE `cooking_videos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dishes`
--

DROP TABLE IF EXISTS `dishes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dishes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '鑿滆偞鍚嶇О',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '鑿滆偞鎻忚堪',
  `price` decimal(10,2) NOT NULL COMMENT '鑿滆偞浠锋牸',
  `category` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '鑿滆偞鍒嗙被',
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '鑿滆偞鍥剧墖',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active' COMMENT '鑿滆偞鐘舵€侊細active-娲昏穬 | inactive-闈炴椿璺?,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='鑿滆偞琛?;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dishes`
--

LOCK TABLES `dishes` WRITE;
/*!40000 ALTER TABLE `dishes` DISABLE KEYS */;
/*!40000 ALTER TABLE `dishes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `draw_results`
--

DROP TABLE IF EXISTS `draw_results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `draw_results` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `boxId` int NOT NULL,
  `drawTime` datetime NOT NULL,
  `boxName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `boxImage` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `boxPrice` decimal(10,2) NOT NULL,
  `items` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `draw_results`
--

LOCK TABLES `draw_results` WRITE;
/*!40000 ALTER TABLE `draw_results` DISABLE KEYS */;
INSERT INTO `draw_results` VALUES (37,2,78,'2026-02-18 12:34:33','夏季清凉盲盒 - 清爽菌菇组合',NULL,79.00,'[{\"id\": 667, \"image\": \"/mushrooms/houtou.jpg\", \"quantity\": 2, \"mushroomId\": 10, \"mushroomName\": \"猴头菇\", \"mushroomType\": \"common\"}, {\"id\": 668, \"image\": \"https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=shiitake%20mushroom%20fresh%20with%20dark%20brown%20cap%20and%20white%20stem&image_size=square\", \"quantity\": 2, \"mushroomId\": 11, \"mushroomName\": \"香菇\", \"mushroomType\": \"common\"}, {\"id\": 669, \"image\": \"https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=oyster%20mushroom%20fresh%20with%20gray%20cap%20and%20white%20stem&image_size=square\", \"quantity\": 2, \"mushroomId\": 12, \"mushroomName\": \"平菇\", \"mushroomType\": \"common\"}, {\"id\": 670, \"image\": \"https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=king%20oyster%20mushroom%20fresh%20with%20white%20cap%20and%20long%20white%20stem&image_size=square\", \"quantity\": 2, \"mushroomId\": 13, \"mushroomName\": \"杏鲍菇\", \"mushroomType\": \"common\"}]','2026-02-18 12:34:33','2026-02-18 12:34:33'),(38,3,77,'2026-02-19 10:46:47','春季养生盲盒 - 鲜嫩菌菇礼盒',NULL,89.00,'[{\"id\": 663, \"image\": \"/mushrooms/xianggu.jpg\", \"quantity\": 2, \"mushroomId\": 6, \"mushroomName\": \"香菇\", \"mushroomType\": \"common\"}, {\"id\": 664, \"image\": \"/mushrooms/pinggu.jpg\", \"quantity\": 2, \"mushroomId\": 7, \"mushroomName\": \"平菇\", \"mushroomType\": \"common\"}, {\"id\": 665, \"image\": \"/mushrooms/xingbao.jpg\", \"quantity\": 2, \"mushroomId\": 8, \"mushroomName\": \"杏鲍菇\", \"mushroomType\": \"common\"}, {\"id\": 666, \"image\": \"/mushrooms/jinzhen.jpg\", \"quantity\": 2, \"mushroomId\": 9, \"mushroomName\": \"金针菇\", \"mushroomType\": \"common\"}]','2026-02-19 10:46:47','2026-02-19 10:46:47'),(39,2,79,'2026-02-19 11:02:12','秋季滋补盲盒 - 滋补菌菇套餐',NULL,129.00,'[{\"id\": 671, \"image\": \"https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=shiitake%20mushroom%20fresh%20with%20dark%20brown%20cap%20and%20white%20stem&image_size=square\", \"quantity\": 1, \"mushroomId\": 14, \"mushroomName\": \"香菇\", \"mushroomType\": \"common\"}, {\"id\": 672, \"image\": \"https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=oyster%20mushroom%20fresh%20with%20gray%20cap%20and%20white%20stem&image_size=square\", \"quantity\": 1, \"mushroomId\": 15, \"mushroomName\": \"平菇\", \"mushroomType\": \"common\"}, {\"id\": 673, \"image\": \"https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=king%20oyster%20mushroom%20fresh%20with%20white%20cap%20and%20long%20white%20stem&image_size=square\", \"quantity\": 1, \"mushroomId\": 16, \"mushroomName\": \"杏鲍菇\", \"mushroomType\": \"common\"}, {\"id\": 674, \"image\": \"https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=shiitake%20mushroom%20fresh%20with%20dark%20brown%20cap%20and%20white%20stem&image_size=square\", \"quantity\": 1, \"mushroomId\": 17, \"mushroomName\": \"香菇\", \"mushroomType\": \"common\"}]','2026-02-19 11:02:12','2026-02-19 11:02:12'),(40,2,80,'2026-02-21 14:21:56','冬季暖心盲盒 - 暖身菌菇礼盒',NULL,99.00,'[{\"id\": 675, \"image\": \"https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=oyster%20mushroom%20fresh%20with%20gray%20cap%20and%20white%20stem&image_size=square\", \"quantity\": 2, \"mushroomId\": 31, \"mushroomName\": \"平菇\", \"mushroomType\": \"common\"}, {\"id\": 676, \"image\": \"/uploads/upload-1771667923500-262170868.webp\", \"quantity\": 2, \"mushroomId\": 53, \"mushroomName\": \"杏鲍菇\", \"mushroomType\": \"common\"}, {\"id\": 677, \"image\": \"/uploads/upload-1771667893684-748051072.webp\", \"quantity\": 2, \"mushroomId\": 52, \"mushroomName\": \"香菇\", \"mushroomType\": \"common\"}, {\"id\": 678, \"image\": \"/mushrooms/pinggu.jpg\", \"quantity\": 2, \"mushroomId\": 31, \"mushroomName\": \"平菇\", \"mushroomType\": \"common\"}]','2026-02-21 14:21:56','2026-02-21 14:21:56'),(41,2,80,'2026-02-21 14:22:06','冬季暖心盲盒 - 暖身菌菇礼盒',NULL,99.00,'[{\"id\": 675, \"image\": \"https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=oyster%20mushroom%20fresh%20with%20gray%20cap%20and%20white%20stem&image_size=square\", \"quantity\": 2, \"mushroomId\": 31, \"mushroomName\": \"平菇\", \"mushroomType\": \"common\"}, {\"id\": 676, \"image\": \"/uploads/upload-1771667923500-262170868.webp\", \"quantity\": 2, \"mushroomId\": 53, \"mushroomName\": \"杏鲍菇\", \"mushroomType\": \"common\"}, {\"id\": 677, \"image\": \"/uploads/upload-1771667893684-748051072.webp\", \"quantity\": 2, \"mushroomId\": 52, \"mushroomName\": \"香菇\", \"mushroomType\": \"common\"}, {\"id\": 678, \"image\": \"/mushrooms/pinggu.jpg\", \"quantity\": 2, \"mushroomId\": 31, \"mushroomName\": \"平菇\", \"mushroomType\": \"common\"}]','2026-02-21 14:22:06','2026-02-21 14:22:06'),(42,2,80,'2026-02-21 14:22:09','冬季暖心盲盒 - 暖身菌菇礼盒',NULL,99.00,'[{\"id\": 675, \"image\": \"https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=oyster%20mushroom%20fresh%20with%20gray%20cap%20and%20white%20stem&image_size=square\", \"quantity\": 2, \"mushroomId\": 31, \"mushroomName\": \"平菇\", \"mushroomType\": \"common\"}, {\"id\": 676, \"image\": \"/uploads/upload-1771667923500-262170868.webp\", \"quantity\": 2, \"mushroomId\": 53, \"mushroomName\": \"杏鲍菇\", \"mushroomType\": \"common\"}, {\"id\": 677, \"image\": \"/uploads/upload-1771667893684-748051072.webp\", \"quantity\": 2, \"mushroomId\": 52, \"mushroomName\": \"香菇\", \"mushroomType\": \"common\"}, {\"id\": 678, \"image\": \"/mushrooms/pinggu.jpg\", \"quantity\": 2, \"mushroomId\": 31, \"mushroomName\": \"平菇\", \"mushroomType\": \"common\"}]','2026-02-21 14:22:09','2026-02-21 14:22:09'),(43,2,78,'2026-02-21 14:22:12','夏季清凉盲盒 - 清爽菌菇组合',NULL,79.00,'[{\"id\": 667, \"image\": \"/mushrooms/houtou.jpg\", \"quantity\": 2, \"mushroomId\": 34, \"mushroomName\": \"猴头菇\", \"mushroomType\": \"common\"}, {\"id\": 668, \"image\": \"/uploads/upload-1771667893684-748051072.webp\", \"quantity\": 2, \"mushroomId\": 52, \"mushroomName\": \"香菇\", \"mushroomType\": \"common\"}, {\"id\": 669, \"image\": \"https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=oyster%20mushroom%20fresh%20with%20gray%20cap%20and%20white%20stem&image_size=square\", \"quantity\": 2, \"mushroomId\": 31, \"mushroomName\": \"平菇\", \"mushroomType\": \"common\"}, {\"id\": 670, \"image\": \"/uploads/upload-1771667923500-262170868.webp\", \"quantity\": 2, \"mushroomId\": 53, \"mushroomName\": \"杏鲍菇\", \"mushroomType\": \"common\"}]','2026-02-21 14:22:12','2026-02-21 14:22:12'),(44,2,81,'2026-02-22 04:43:57','全家享盲盒 - 精选菌菇组合','/uploads/upload-1771726220885-254262274.webp',149.01,'[{\"id\": 847, \"image\": \"/uploads/upload-1771667893684-748051072.webp?t=1771726217002\", \"quantity\": 2, \"mushroomId\": 52, \"mushroomName\": \"香菇\", \"mushroomType\": \"common\"}, {\"id\": 848, \"image\": \"/uploads/upload-1771652237701-654685118.jpg?t=1771726217002\", \"quantity\": 2, \"mushroomId\": 31, \"mushroomName\": \"平菇\", \"mushroomType\": \"common\"}, {\"id\": 849, \"image\": \"/uploads/upload-1771667923500-262170868.webp?t=1771726217002\", \"quantity\": 2, \"mushroomId\": 53, \"mushroomName\": \"杏鲍菇\", \"mushroomType\": \"common\"}, {\"id\": 850, \"image\": \"/uploads/upload-1771652265102-229560094.jpg?t=1771726217002\", \"quantity\": 2, \"mushroomId\": 33, \"mushroomName\": \"金针菇\", \"mushroomType\": \"common\"}, {\"id\": 851, \"image\": \"/uploads/upload-1771652207680-244808221.jpg?t=1771726217002\", \"quantity\": 2, \"mushroomId\": 34, \"mushroomName\": \"猴头菇\", \"mushroomType\": \"common\"}, {\"id\": 852, \"image\": \"/uploads/upload-1771667893684-748051072.webp?t=1771726217002\", \"quantity\": 2, \"mushroomId\": 52, \"mushroomName\": \"香菇\", \"mushroomType\": \"common\"}]','2026-02-22 04:43:57','2026-02-22 04:43:57'),(45,2,81,'2026-04-04 01:53:03','全家享盲盒 - 精选菌菇组合','/uploads/upload-1771726220885-254262274.webp',149.01,'[{\"id\": 847, \"image\": \"/uploads/upload-1771667893684-748051072.webp?t=1771726217002\", \"quantity\": 2, \"mushroomId\": 52, \"mushroomName\": \"香菇\", \"mushroomType\": \"common\"}, {\"id\": 848, \"image\": \"/uploads/upload-1771652237701-654685118.jpg?t=1771726217002\", \"quantity\": 2, \"mushroomId\": 31, \"mushroomName\": \"平菇\", \"mushroomType\": \"common\"}, {\"id\": 849, \"image\": \"/uploads/upload-1771667923500-262170868.webp?t=1771726217002\", \"quantity\": 2, \"mushroomId\": 53, \"mushroomName\": \"杏鲍菇\", \"mushroomType\": \"common\"}, {\"id\": 850, \"image\": \"/uploads/upload-1771652265102-229560094.jpg?t=1771726217002\", \"quantity\": 2, \"mushroomId\": 33, \"mushroomName\": \"金针菇\", \"mushroomType\": \"common\"}, {\"id\": 851, \"image\": \"/uploads/upload-1771652207680-244808221.jpg?t=1771726217002\", \"quantity\": 2, \"mushroomId\": 34, \"mushroomName\": \"猴头菇\", \"mushroomType\": \"common\"}, {\"id\": 852, \"image\": \"/uploads/upload-1771667893684-748051072.webp?t=1771726217002\", \"quantity\": 2, \"mushroomId\": 52, \"mushroomName\": \"香菇\", \"mushroomType\": \"common\"}]','2026-04-04 01:53:03','2026-04-04 01:53:03'),(46,2,81,'2026-04-11 07:11:17','全家享盲盒 - 精选菌菇组合','/uploads/upload-1771726220885-254262274.webp',149.01,'[{\"id\": 848, \"image\": \"/uploads/upload-1771652237701-654685118.jpg?t=1771726217002\", \"quantity\": 2, \"mushroomId\": 31, \"mushroomName\": \"平菇\", \"mushroomType\": \"common\"}, {\"id\": 850, \"image\": \"/uploads/upload-1771652265102-229560094.jpg?t=1771726217002\", \"quantity\": 2, \"mushroomId\": 33, \"mushroomName\": \"金针菇\", \"mushroomType\": \"common\"}, {\"id\": 851, \"image\": \"/uploads/upload-1771652207680-244808221.jpg?t=1771726217002\", \"quantity\": 2, \"mushroomId\": 34, \"mushroomName\": \"猴头菇\", \"mushroomType\": \"common\"}]','2026-04-11 07:11:17','2026-04-11 07:11:17');
/*!40000 ALTER TABLE `draw_results` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorites`
--

DROP TABLE IF EXISTS `favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorites` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '鏀惰棌ID',
  `workId` int NOT NULL COMMENT '浣滃搧ID',
  `userId` int NOT NULL COMMENT '鐢ㄦ埛ID',
  `createdAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `workId_userId` (`workId`,`userId`),
  UNIQUE KEY `favorites_work_id_user_id` (`workId`,`userId`),
  KEY `workId` (`workId`),
  KEY `userId` (`userId`),
  KEY `favorites_work_id` (`workId`),
  KEY `favorites_user_id` (`userId`),
  CONSTRAINT `favorites_ibfk_17` FOREIGN KEY (`workId`) REFERENCES `works` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `favorites_ibfk_18` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='鏀惰棌琛?;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorites`
--

LOCK TABLES `favorites` WRITE;
/*!40000 ALTER TABLE `favorites` DISABLE KEYS */;
INSERT INTO `favorites` VALUES (8,2,2,'2026-02-22 03:45:32'),(9,5,36,'2026-04-11 07:55:30'),(10,3,25,'2026-04-12 02:29:54'),(11,15,2,'2026-04-14 05:31:23');
/*!40000 ALTER TABLE `favorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `follows`
--

DROP TABLE IF EXISTS `follows`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `follows` (
  `id` int NOT NULL AUTO_INCREMENT,
  `followerId` int NOT NULL,
  `followingId` int NOT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `follows_follower_id_following_id` (`followerId`,`followingId`),
  KEY `follows_follower_id` (`followerId`),
  KEY `follows_following_id` (`followingId`),
  CONSTRAINT `follows_ibfk_1` FOREIGN KEY (`followerId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `follows_ibfk_2` FOREIGN KEY (`followingId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `follows`
--

LOCK TABLES `follows` WRITE;
/*!40000 ALTER TABLE `follows` DISABLE KEYS */;
INSERT INTO `follows` VALUES (1,3,2,'2026-01-31 01:07:05','2026-01-31 01:07:05'),(2,25,2,'2026-04-12 02:30:47','2026-04-12 02:30:47');
/*!40000 ALTER TABLE `follows` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kitchen_post_favorites`
--

DROP TABLE IF EXISTS `kitchen_post_favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kitchen_post_favorites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `postId` int NOT NULL COMMENT '鍘ㄦ埧甯栧瓙ID',
  `userId` int NOT NULL COMMENT '鐢ㄦ埛ID',
  `favoritedAt` datetime NOT NULL COMMENT '鏀惰棌鏃堕棿',
  `createdAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `kitchen_post_favorites_post_id_user_id` (`postId`,`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='甯栧瓙鏀惰棌琛紙鐢ㄦ埛鏀惰棌鐨勫笘瀛愶級';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kitchen_post_favorites`
--

LOCK TABLES `kitchen_post_favorites` WRITE;
/*!40000 ALTER TABLE `kitchen_post_favorites` DISABLE KEYS */;
/*!40000 ALTER TABLE `kitchen_post_favorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kitchen_post_likes`
--

DROP TABLE IF EXISTS `kitchen_post_likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kitchen_post_likes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `postId` int NOT NULL COMMENT '鍘ㄦ埧甯栧瓙ID',
  `userId` int NOT NULL COMMENT '鐢ㄦ埛ID',
  `likedAt` datetime NOT NULL COMMENT '鐐硅禐鏃堕棿',
  `createdAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `kitchen_post_likes_post_id_user_id` (`postId`,`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='甯栧瓙鐐硅禐琛紙鐢ㄦ埛瀵瑰笘瀛愮殑鐐硅禐锛?;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kitchen_post_likes`
--

LOCK TABLES `kitchen_post_likes` WRITE;
/*!40000 ALTER TABLE `kitchen_post_likes` DISABLE KEYS */;
/*!40000 ALTER TABLE `kitchen_post_likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kitchen_post_mushrooms`
--

DROP TABLE IF EXISTS `kitchen_post_mushrooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kitchen_post_mushrooms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `postId` int NOT NULL COMMENT '鍘ㄦ埧甯栧瓙ID',
  `mushroomTypeId` int NOT NULL COMMENT '鑿岃弴绫诲瀷ID',
  `quantity` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '浣跨敤鐨勮弻鑿囨暟閲忥細濡?00g銆?鏈电瓑',
  `isMainIngredient` tinyint(1) NOT NULL DEFAULT '0' COMMENT '鏄惁涓轰富椋熸潗',
  PRIMARY KEY (`id`),
  UNIQUE KEY `kitchen_post_mushrooms_post_id_mushroom_type_id` (`postId`,`mushroomTypeId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='甯栧瓙-鑿岃弴鍏宠仈琛紙璁板綍甯栧瓙浣跨敤鐨勮弻鑿囩被鍨嬪拰鏁伴噺锛?;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kitchen_post_mushrooms`
--

LOCK TABLES `kitchen_post_mushrooms` WRITE;
/*!40000 ALTER TABLE `kitchen_post_mushrooms` DISABLE KEYS */;
/*!40000 ALTER TABLE `kitchen_post_mushrooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kitchen_post_ratings`
--

DROP TABLE IF EXISTS `kitchen_post_ratings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kitchen_post_ratings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `postId` int NOT NULL COMMENT '鍘ㄦ埧甯栧瓙ID',
  `userId` int NOT NULL COMMENT '鐢ㄦ埛ID',
  `rating` int NOT NULL COMMENT '璇勫垎锛?-5鍒?,
  `comment` text COLLATE utf8mb4_unicode_ci COMMENT '璇勮鍐呭',
  `createdAt` datetime NOT NULL COMMENT '璇勫垎鏃堕棿',
  PRIMARY KEY (`id`),
  UNIQUE KEY `kitchen_post_ratings_post_id_user_id` (`postId`,`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='甯栧瓙璇勫垎琛紙鐢ㄦ埛瀵瑰笘瀛愮殑璇勫垎鍜岃瘎璁猴級';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kitchen_post_ratings`
--

LOCK TABLES `kitchen_post_ratings` WRITE;
/*!40000 ALTER TABLE `kitchen_post_ratings` DISABLE KEYS */;
/*!40000 ALTER TABLE `kitchen_post_ratings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kitchen_posts`
--

DROP TABLE IF EXISTS `kitchen_posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kitchen_posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL COMMENT '鐢ㄦ埛ID',
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '甯栧瓙鏍囬',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '甯栧瓙鎻忚堪',
  `images` json NOT NULL COMMENT '鑿滆偞鐓х墖鍒楄〃',
  `cookTime` int NOT NULL COMMENT '鐑归オ鏃堕棿锛堝垎閽燂級',
  `difficulty` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '闅惧害锛歟asy-绠€鍗?| medium-涓瓑 | hard-鍥伴毦',
  `ingredients` json NOT NULL COMMENT '椋熸潗鍒楄〃',
  `steps` json NOT NULL COMMENT '鐑归オ姝ラ',
  `tips` text COLLATE utf8mb4_unicode_ci COMMENT '鐑归オ蹇冨緱鎴栧皬璐村＋',
  `tags` json DEFAULT NULL COMMENT '鏍囩锛氬绱犻銆佸甯歌彍銆佸揩鎵嬭彍绛?,
  `viewCount` int NOT NULL DEFAULT '0' COMMENT '娴忚娆℃暟',
  `likeCount` int NOT NULL DEFAULT '0' COMMENT '鐐硅禐鏁?,
  `commentCount` int NOT NULL DEFAULT '0' COMMENT '璇勮鏁?,
  `favoriteCount` int NOT NULL DEFAULT '0' COMMENT '鏀惰棌鏁?,
  `rating` decimal(3,1) DEFAULT NULL COMMENT '璇勫垎锛?-5鍒?,
  `ratingCount` int NOT NULL DEFAULT '0' COMMENT '璇勫垎浜烘暟',
  `isActive` tinyint(1) NOT NULL DEFAULT '1' COMMENT '鏄惁鍙敤',
  `isFeatured` tinyint(1) NOT NULL DEFAULT '0' COMMENT '鏄惁绮鹃€?,
  `leaderboardRank` int DEFAULT NULL COMMENT '鍦ㄨ弻鑿囩編椋熸涓殑鎺掑悕',
  `lastRankUpdate` datetime DEFAULT NULL COMMENT '鎺掑悕鏈€鍚庢洿鏂版椂闂?,
  `rewardPoints` int NOT NULL DEFAULT '0' COMMENT '鑾峰緱鐨勫鍔辩Н鍒?,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='鍘ㄦ埧甯栧瓙琛紙鐢ㄦ埛涓婁紶鐨勮弻鑿囪彍鑲达級';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kitchen_posts`
--

LOCK TABLES `kitchen_posts` WRITE;
/*!40000 ALTER TABLE `kitchen_posts` DISABLE KEYS */;
/*!40000 ALTER TABLE `kitchen_posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leaderboard`
--

DROP TABLE IF EXISTS `leaderboard`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leaderboard` (
  `id` int NOT NULL AUTO_INCREMENT,
  `postId` int NOT NULL COMMENT '鍘ㄦ埧甯栧瓙ID',
  `rank` int NOT NULL COMMENT '鎺掑悕',
  `score` decimal(10,2) NOT NULL COMMENT '鎺掕姒滃垎鏁帮細鍩轰簬璇勫垎銆佺偣璧炪€佹敹钘忋€佽瘎璁虹瓑璁＄畻',
  `rating` decimal(3,1) NOT NULL COMMENT '甯栧瓙璇勫垎',
  `likeCount` int NOT NULL COMMENT '鐐硅禐鏁?,
  `commentCount` int NOT NULL COMMENT '璇勮鏁?,
  `favoriteCount` int NOT NULL COMMENT '鏀惰棌鏁?,
  `viewCount` int NOT NULL COMMENT '娴忚娆℃暟',
  `updatedAt` datetime NOT NULL COMMENT '鎺掑悕鏇存柊鏃堕棿',
  PRIMARY KEY (`id`),
  UNIQUE KEY `postId` (`postId`),
  UNIQUE KEY `rank` (`rank`),
  KEY `leaderboard_rank` (`rank`),
  KEY `leaderboard_score` (`score`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='鑿岃弴缇庨姒滐紙鐑棬鑿岃弴鑿滆偞鎺掕姒滐級';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leaderboard`
--

LOCK TABLES `leaderboard` WRITE;
/*!40000 ALTER TABLE `leaderboard` DISABLE KEYS */;
/*!40000 ALTER TABLE `leaderboard` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `likes`
--

DROP TABLE IF EXISTS `likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `likes` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '鐐硅禐ID',
  `workId` int NOT NULL COMMENT '浣滃搧ID',
  `userId` int NOT NULL COMMENT '鐢ㄦ埛ID',
  `createdAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `workId_userId` (`workId`,`userId`),
  UNIQUE KEY `likes_work_id_user_id` (`workId`,`userId`),
  KEY `workId` (`workId`),
  KEY `userId` (`userId`),
  KEY `likes_work_id` (`workId`),
  KEY `likes_user_id` (`userId`),
  CONSTRAINT `likes_ibfk_17` FOREIGN KEY (`workId`) REFERENCES `works` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `likes_ibfk_18` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='鐐硅禐琛?;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `likes`
--

LOCK TABLES `likes` WRITE;
/*!40000 ALTER TABLE `likes` DISABLE KEYS */;
INSERT INTO `likes` VALUES (4,5,2,'2026-02-08 05:51:53'),(5,3,2,'2026-02-21 12:19:58'),(6,5,36,'2026-04-11 07:55:14');
/*!40000 ALTER TABLE `likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `conversationId` int NOT NULL COMMENT '鎵€灞炲璇滻D',
  `senderId` int NOT NULL COMMENT '鍙戦€佽€匢D',
  `senderRole` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '鍙戦€佽€呰鑹诧紙user/seller/admin锛?,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '娑堟伅鍐呭',
  `type` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'text' COMMENT '娑堟伅绫诲瀷锛坱ext/image/file锛?,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'sent' COMMENT '娑堟伅鐘舵€侊紙sent/delivered/read锛?,
  `fileUrl` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '鏂囦欢URL锛堢敤浜庡浘鐗囥€佹枃浠剁瓑澶氬獟浣撴秷鎭級',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `conversationId` (`conversationId`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`conversationId`) REFERENCES `conversations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='娑堟伅琛?;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (1,1,2,'admin','aaaa','text','sent',NULL,'2026-01-24 14:02:31','2026-01-24 14:02:31'),(2,2,2,'admin','gougougouGougoUgo狗','text','read',NULL,'2026-01-24 14:11:47','2026-04-04 12:50:43'),(3,2,2,'admin','灌灌灌灌','text','read',NULL,'2026-01-24 14:22:38','2026-04-04 12:50:43'),(4,2,2,'admin','666','text','read',NULL,'2026-01-24 14:23:18','2026-04-04 12:50:43'),(5,2,3,'seller','你装逼','text','read',NULL,'2026-01-24 14:39:06','2026-04-12 07:01:35'),(6,2,3,'seller','又主页','text','read',NULL,'2026-01-24 14:39:20','2026-04-12 07:01:35'),(7,2,2,'admin','你别管','text','read',NULL,'2026-01-24 14:40:25','2026-04-04 12:50:43'),(8,2,2,'admin','666','text','read',NULL,'2026-01-24 15:07:44','2026-04-04 12:50:43'),(9,2,2,'admin','44444444','text','read',NULL,'2026-01-25 01:36:06','2026-04-04 12:50:43'),(10,2,3,'seller','搜索','text','read',NULL,'2026-01-25 01:36:37','2026-04-12 07:01:35'),(11,2,2,'admin','诗人吗','text','read',NULL,'2026-01-25 02:06:13','2026-04-04 12:50:43'),(12,2,2,'admin','反反复复反反复复烦烦烦','text','read',NULL,'2026-01-25 09:40:50','2026-04-04 12:50:43'),(13,2,2,'admin','不是','text','read',NULL,'2026-01-25 13:04:32','2026-04-04 12:50:43'),(14,2,3,'seller','刚刚','text','read',NULL,'2026-01-25 13:04:57','2026-04-12 07:01:35'),(15,2,3,'seller','666','text','read',NULL,'2026-01-25 13:35:12','2026-04-12 07:01:35'),(16,2,2,'admin','dd','text','read',NULL,'2026-01-25 13:39:32','2026-04-04 12:50:43'),(17,2,2,'admin','s','text','read',NULL,'2026-01-25 19:58:09','2026-04-04 12:50:43'),(18,2,2,'admin','水水水水水水水杀杀杀sss','text','read',NULL,'2026-02-05 11:35:19','2026-04-04 12:50:43'),(19,2,2,'admin','ssssssssssssssssss','text','read',NULL,'2026-02-05 11:35:23','2026-04-04 12:50:43'),(20,2,2,'admin','sssssssssssssss','text','read',NULL,'2026-02-05 11:35:25','2026-04-04 12:50:43'),(21,2,2,'admin','ssssssssssss','text','read',NULL,'2026-02-05 11:35:27','2026-04-04 12:50:43'),(22,1,22,'user','WebSocket测试消息','text','read',NULL,'2026-02-07 10:54:11','2026-04-12 07:01:34'),(23,1,2,'admin','杀杀杀杀杀杀杀杀杀搜索','text','sent',NULL,'2026-02-17 02:11:38','2026-02-17 02:11:38'),(24,2,2,'admin','喜喜喜喜喜喜喜喜喜喜','text','read',NULL,'2026-02-19 10:50:52','2026-04-04 12:50:43'),(25,2,3,'seller','4444','text','read',NULL,'2026-04-04 12:03:40','2026-04-12 07:01:35'),(26,2,3,'seller','啵啵啵啵啵啵','text','read',NULL,'2026-04-04 12:26:13','2026-04-12 07:01:35'),(27,2,2,'admin','你这傻话','text','read',NULL,'2026-04-04 12:41:41','2026-04-04 12:50:43'),(28,2,3,'seller','点','text','read',NULL,'2026-04-04 12:45:08','2026-04-12 07:01:35'),(29,2,3,'seller','时','text','read',NULL,'2026-04-04 12:49:36','2026-04-12 07:01:35'),(30,2,3,'seller','11','text','read',NULL,'2026-04-04 12:49:44','2026-04-12 07:01:35'),(31,2,3,'seller','22','text','read',NULL,'2026-04-04 12:49:48','2026-04-12 07:01:35'),(32,2,3,'admin','s1','text','read',NULL,'2026-04-04 12:50:25','2026-04-12 07:01:35'),(33,2,3,'admin','sq','text','read',NULL,'2026-04-04 12:50:42','2026-04-12 07:01:35'),(34,2,3,'admin','s','text','read',NULL,'2026-04-04 12:50:52','2026-04-12 07:01:35'),(35,2,2,'admin','ssssssss1','text','sent',NULL,'2026-04-04 12:57:11','2026-04-04 12:57:11'),(36,2,2,'admin','1','text','sent',NULL,'2026-04-04 13:04:02','2026-04-04 13:04:02'),(37,2,3,'seller','d','text','read',NULL,'2026-04-04 13:06:08','2026-04-12 07:01:35'),(38,2,2,'admin','d1','text','sent',NULL,'2026-04-04 13:06:20','2026-04-04 13:06:20'),(39,2,3,'seller','d2','text','read',NULL,'2026-04-04 13:07:15','2026-04-12 07:01:35'),(40,2,2,'admin','d3','text','sent',NULL,'2026-04-04 13:07:27','2026-04-04 13:07:27'),(41,2,3,'seller','3','text','read',NULL,'2026-04-04 13:12:45','2026-04-12 07:01:35'),(42,2,2,'admin','4','text','sent',NULL,'2026-04-04 13:13:00','2026-04-04 13:13:00'),(43,2,3,'seller','11','text','read',NULL,'2026-04-04 13:25:57','2026-04-12 07:01:35'),(44,2,2,'admin','22','text','sent',NULL,'2026-04-04 13:26:09','2026-04-04 13:26:09'),(45,2,2,'admin','a','text','sent',NULL,'2026-04-04 13:35:25','2026-04-04 13:35:25');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mushroom_box_items`
--

DROP TABLE IF EXISTS `mushroom_box_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mushroom_box_items` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '涓婚敭ID',
  `boxId` int NOT NULL COMMENT '鐩茬洅ID',
  `mushroomId` int DEFAULT NULL COMMENT '鑿岃弴/鍟嗗搧ID锛堝彲浠ユ槸mushrooms琛ㄦ垨products琛ㄧ殑ID锛?,
  `quantity` int NOT NULL DEFAULT '1' COMMENT '鏁伴噺锛堝悜鍚庡吋瀹癸級',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `probability` float NOT NULL DEFAULT '0' COMMENT '姒傜巼',
  `mushroomName` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '鑿岃弴/鍟嗗搧鍚嶇О',
  `mushroomType` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '鑿岃弴/鍟嗗搧绫诲瀷',
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '鑿岃弴/鍟嗗搧鍥剧墖',
  `minQuantity` int NOT NULL DEFAULT '1' COMMENT '鏈€灏忔暟閲?,
  `maxQuantity` int NOT NULL DEFAULT '1' COMMENT '鏈€澶ф暟閲?,
  PRIMARY KEY (`id`),
  KEY `mushroomId` (`mushroomId`),
  KEY `boxId` (`boxId`),
  CONSTRAINT `mushroom_box_items_ibfk_1` FOREIGN KEY (`boxId`) REFERENCES `mushroom_boxes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=884 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mushroom_box_items`
--

LOCK TABLES `mushroom_box_items` WRITE;
/*!40000 ALTER TABLE `mushroom_box_items` DISABLE KEYS */;
INSERT INTO `mushroom_box_items` VALUES (832,77,31,2,'2026-02-22 02:00:46','2026-02-22 02:00:46',25,'平菇','common','/uploads/upload-1771652237701-654685118.jpg?t=1771725634252',1,3),(834,77,33,2,'2026-02-22 02:00:46','2026-02-22 02:00:46',25,'金针菇','common','/uploads/upload-1771652265102-229560094.jpg?t=1771725634252',1,3),(835,78,34,2,'2026-02-22 02:05:38','2026-02-22 02:05:38',25,'猴头菇','common','/uploads/upload-1771652207680-244808221.jpg?t=1771725646791',1,3),(837,78,31,2,'2026-02-22 02:05:38','2026-02-22 02:05:38',25,'平菇','common','/uploads/upload-1771652237701-654685118.jpg?t=1771725646791',1,3),(843,80,31,2,'2026-02-22 02:10:16','2026-02-22 02:10:16',25,'平菇','common','/uploads/upload-1771652237701-654685118.jpg?t=1771726204377',1,3),(846,80,31,2,'2026-02-22 02:10:16','2026-02-22 02:10:16',25,'平菇','common','/uploads/upload-1771652237701-654685118.jpg?t=1771726204377',1,3),(869,79,31,1,'2026-04-11 11:45:40','2026-04-11 11:45:40',100,'平菇','common','/uploads/upload-1771652237701-654685118.jpg?t=1775907935067',1,2),(875,97,52,2,'2026-04-14 06:04:13','2026-04-14 06:04:13',50,'香菇','common',NULL,1,3),(876,97,31,2,'2026-04-14 06:04:13','2026-04-14 06:04:13',50,'平菇','common',NULL,1,3),(877,98,34,2,'2026-04-14 06:04:13','2026-04-14 06:04:13',50,'猴头菇','common',NULL,1,3),(878,98,53,2,'2026-04-14 06:04:13','2026-04-14 06:04:13',50,'杏鲍菇','common',NULL,1,3),(879,99,52,2,'2026-04-14 06:04:13','2026-04-14 06:04:13',50,'香菇','common',NULL,1,2),(880,99,33,1,'2026-04-14 06:04:13','2026-04-14 06:04:13',50,'金针菇','common',NULL,1,2),(881,100,52,2,'2026-04-14 06:04:13','2026-04-14 06:04:13',33,'香菇','common',NULL,1,3),(882,100,53,2,'2026-04-14 06:04:13','2026-04-14 06:04:13',33,'杏鲍菇','common',NULL,1,3),(883,100,34,1,'2026-04-14 06:04:13','2026-04-14 06:04:13',34,'猴头菇','common',NULL,1,2);
/*!40000 ALTER TABLE `mushroom_box_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mushroom_boxes`
--

DROP TABLE IF EXISTS `mushroom_boxes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mushroom_boxes` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '鐩茬洅ID',
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '鐩茬洅鍚嶇О',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '鐩茬洅鎻忚堪',
  `price` decimal(10,2) NOT NULL COMMENT '鐩茬洅浠锋牸',
  `stock` int NOT NULL DEFAULT '1' COMMENT '鐩茬洅搴撳瓨鏁伴噺',
  `season` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '瀛ｈ妭',
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '鐩茬洅鍥剧墖锛堝吋瀹规棫鐗堟湰锛?,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active' COMMENT '鐘舵€侊紙active/inactive锛?,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `cultivationService` tinyint(1) NOT NULL DEFAULT '0' COMMENT '鏄惁鍖呭惈浠ｅ煿鏈嶅姟',
  `cultivationPrice` decimal(10,2) DEFAULT NULL COMMENT '浠ｅ煿鏈嶅姟浠锋牸',
  `cultivationDuration` int DEFAULT NULL COMMENT '浠ｅ煿鏃堕暱锛堝ぉ锛?,
  `cultivationInclusions` text COLLATE utf8mb4_unicode_ci COMMENT '浠ｅ煿鏈嶅姟鍖呭惈鍐呭',
  `cultivationDescription` text COLLATE utf8mb4_unicode_ci COMMENT '浠ｅ煿鏈嶅姟鎻忚堪',
  `totalQuantity` int NOT NULL DEFAULT '10' COMMENT '鐩茬洅鍐呭晢鍝佹€绘暟閲?,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mushroom_boxes`
--

LOCK TABLES `mushroom_boxes` WRITE;
/*!40000 ALTER TABLE `mushroom_boxes` DISABLE KEYS */;
INSERT INTO `mushroom_boxes` VALUES (77,'春季养生盲盒 - 鲜嫩菌菇礼盒','精选春季时令菌菇，春季养生必备！包含香菇、平菇、金针菇等多种美味菌菇',89.00,46,'spring','/uploads/upload-1771725644281-199753931.webp','active','2026-02-15 05:36:55','2026-04-04 11:27:23',0,NULL,NULL,'','',10),(78,'夏季清凉盲盒 - 清爽菌菇组合','夏季清爽口味，包含猴头菇、香菇、平菇、杏鲍菇等清凉菌菇',79.01,37,'summer','/uploads/upload-1771725933078-894649708.webp','active','2026-02-15 05:36:55','2026-04-04 10:49:07',0,NULL,NULL,'','',8),(79,'秋季滋补盲盒 - 滋补菌菇套餐','秋季滋补养生，包含多种珍贵菌菇组合',128.99,28,'autumn','http://localhost:3303/uploads/upload-1771726202406-297154618.webp','active','2026-02-15 05:36:55','2026-04-11 11:45:40',0,NULL,NULL,'','',6),(80,'冬季暖心盲盒 - 暖身菌菇礼盒','冬季暖心滋补，包含多种滋补菌菇组合',99.01,35,'winter','/uploads/upload-1771726209962-506702561.webp','active','2026-02-15 05:36:55','2026-02-22 02:10:16',0,NULL,NULL,'','',9),(97,'春季踏青盲盒','春季限定盲盒，包含新鲜春菇、春笋等时令菌菇，适合踏青野餐',88.00,50,'spring',NULL,'active','2026-04-14 06:04:13','2026-04-14 06:04:13',0,NULL,NULL,NULL,NULL,10),(98,'夏季解暑菌汤盲盒','夏日解暑菌菇汤料包，清凉滋补',58.00,100,'summer',NULL,'active','2026-04-14 06:04:13','2026-04-14 06:04:13',0,NULL,NULL,NULL,NULL,8),(99,'秋季丰收盲盒','秋季限定，丰收季节的珍稀野生菌组合',158.00,40,'autumn',NULL,'active','2026-04-14 06:04:13','2026-04-14 06:04:13',0,NULL,NULL,NULL,NULL,6),(100,'冬季节庆年货盲盒','年货精选，高端菌菇礼盒装',268.00,20,'winter',NULL,'active','2026-04-14 06:04:13','2026-04-14 06:04:13',0,NULL,NULL,NULL,NULL,8);
/*!40000 ALTER TABLE `mushroom_boxes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mushroom_requests`
--

DROP TABLE IF EXISTS `mushroom_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mushroom_requests` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '璇锋眰ID',
  `userId` int NOT NULL COMMENT '璇锋眰鐢ㄦ埛ID',
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '鑿岃弴鍚嶇О',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '鑿岃弴鎻忚堪',
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '鑿岃弴鍥剧墖',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT '鐘舵€侊紙pending: 寰呭鏍? approved: 宸查€氳繃, rejected: 宸叉嫆缁濓級',
  `adminNote` text COLLATE utf8mb4_unicode_ci COMMENT '绠＄悊鍛樺娉?,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `mushroom_requests_user_id` (`userId`),
  KEY `mushroom_requests_status` (`status`),
  KEY `mushroom_requests_created_at` (`createdAt`),
  CONSTRAINT `mushroom_requests_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mushroom_requests`
--

LOCK TABLES `mushroom_requests` WRITE;
/*!40000 ALTER TABLE `mushroom_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `mushroom_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mushroom_types`
--

DROP TABLE IF EXISTS `mushroom_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mushroom_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '鑿岃弴鍚嶇О',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '鑿岃弴鎻忚堪',
  `season` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '瀛ｈ妭锛歴pring-鏄ュ | summer-澶忓 | autumn-绉嬪 | winter-鍐 | all-鍏ㄥ勾',
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '鑿岃弴鍥剧墖',
  `nutritionInfo` text COLLATE utf8mb4_unicode_ci COMMENT '钀ュ吇淇℃伅',
  `isActive` tinyint(1) NOT NULL DEFAULT '1' COMMENT '鏄惁鍙敤',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='鑿岃弴绫诲瀷琛?;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mushroom_types`
--

LOCK TABLES `mushroom_types` WRITE;
/*!40000 ALTER TABLE `mushroom_types` DISABLE KEYS */;
/*!40000 ALTER TABLE `mushroom_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mushroom_varieties`
--

DROP TABLE IF EXISTS `mushroom_varieties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mushroom_varieties` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '鑿岃弴鍝佺鍚嶇О',
  `scientificName` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '鑿岃弴瀛﹀悕',
  `season` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '鐢熼暱瀛ｈ妭锛氬鏄ュ銆佸瀛ｃ€佺瀛ｃ€佸啲瀛ｃ€佸叏骞?,
  `growthCycle` int NOT NULL COMMENT '鐢熼暱鍛ㄦ湡锛堝ぉ锛?,
  `nutritionalValue` text COLLATE utf8mb4_unicode_ci COMMENT '钀ュ吇浠峰€?,
  `tasteDescription` text COLLATE utf8mb4_unicode_ci COMMENT '鍙ｅ懗鎻忚堪',
  `cookingMethods` json DEFAULT NULL COMMENT '鎺ㄨ崘鐑归オ鏂瑰紡',
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '鑿岃弴鍥剧墖',
  `isActive` tinyint(1) NOT NULL DEFAULT '1' COMMENT '鏄惁涓哄綋鍓嶆椿鍔ㄥ搧绉?,
  `difficulty` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'easy' COMMENT '鍩硅偛闅惧害锛歟asy-绠€鍗?| medium-涓瓑 | hard-鍥伴毦',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='鑿岃弴鍝佺琛?;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mushroom_varieties`
--

LOCK TABLES `mushroom_varieties` WRITE;
/*!40000 ALTER TABLE `mushroom_varieties` DISABLE KEYS */;
/*!40000 ALTER TABLE `mushroom_varieties` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mushrooms`
--

DROP TABLE IF EXISTS `mushrooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mushrooms` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '鑿岃弴ID',
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '鑿岃弴鍚嶇О',
  `scientificName` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '瀛﹀悕',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '鎻忚堪',
  `cultivationGuide` text COLLATE utf8mb4_unicode_ci COMMENT '鍩硅偛鎸囧崡',
  `season` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '鐢熼暱瀛ｈ妭锛屾敮鎸佸涓鑺傦紝濡傦細"鏄ュ,绉嬪"',
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '鑿岃弴鍥剧墖',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `growthEnvironment` text COLLATE utf8mb4_unicode_ci COMMENT '鐢熼暱鐜锛屽寘鎷皵鍊欐潯浠躲€佸湡澹よ姹傜瓑',
  `nutritionalValue` json DEFAULT NULL COMMENT '钀ュ吇浠峰€硷紝鍖呮嫭铔嬬櫧璐ㄣ€佺淮鐢熺礌銆佺熆鐗╄川绛夊惈閲?,
  `safetyInfo` text COLLATE utf8mb4_unicode_ci COMMENT '椋熺敤瀹夊叏鎬э紝鍖呮嫭姣掓€с€侀鐢ㄧ蹇岀瓑',
  `morphology` text COLLATE utf8mb4_unicode_ci COMMENT '褰㈡€佺壒寰侊紝鍖呮嫭鑿岀洊銆佽弻瑜躲€佽弻鏌勭瓑鎻忚堪',
  `cookingMethods` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '閫傚疁鐨勭児楗柟娉?,
  `selectionTips` text COLLATE utf8mb4_unicode_ci COMMENT '閫夎喘寤鸿锛屽寘鎷柊椴滃害鍒ゆ柇銆佸偍瀛樻柟娉曠瓑',
  `cultivationDifficulty` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '鍩硅偛闅惧害锛坋asy/medium/hard锛?,
  `category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '鍒嗙被锛屽锛?椋熺敤鑿?銆?鑽敤鑿?',
  `originInfo` json DEFAULT NULL COMMENT '浜у湴淇℃伅锛屽寘鎷富瑕佷骇鍖恒€佸湴鐞嗙幆澧冪瓑',
  `storageMethods` text COLLATE utf8mb4_unicode_ci COMMENT '淇濆瓨鏂规硶锛屽寘鎷俯搴︺€佹箍搴︺€佷繚瀛樻椂闂寸瓑',
  `healthBenefits` text COLLATE utf8mb4_unicode_ci COMMENT '鍔熸晥涓庝綔鐢紝鍖呮嫭鑽敤浠峰€笺€佷繚鍋ュ姛鑳界瓑',
  `culturalInfo` text COLLATE utf8mb4_unicode_ci COMMENT '鍘嗗彶鏂囧寲锛屽寘鎷鐢ㄥ巻鍙层€佹枃鍖栨剰涔夌瓑',
  `marketInfo` json DEFAULT NULL COMMENT '甯傚満淇℃伅锛屽寘鎷环鏍煎尯闂淬€佸競鍦洪渶姹傜瓑',
  `dataSource` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '鏁版嵁鏉ユ簮锛屽锛?涓浗椋熺敤鑿屽崗浼?',
  `dataUpdatedAt` datetime DEFAULT NULL COMMENT '鏁版嵁鏇存柊鏃堕棿',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active' COMMENT '鐘舵€侊紙active/inactive锛?,
  `type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'common' COMMENT '鑿岃弴绫诲瀷锛坈ommon: 甯歌鑿岃弴, product: 鑷湁鍟嗗搧鑿岃弴锛?,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `mushrooms_name` (`name`),
  KEY `mushrooms_category` (`category`),
  KEY `mushrooms_type` (`type`),
  KEY `mushrooms_status` (`status`),
  KEY `mushrooms_cultivation_difficulty` (`cultivationDifficulty`),
  KEY `mushrooms_created_at` (`createdAt`)
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mushrooms`
--

LOCK TABLES `mushrooms` WRITE;
/*!40000 ALTER TABLE `mushrooms` DISABLE KEYS */;
INSERT INTO `mushrooms` VALUES (95,'顶顶顶','大大大','',NULL,'summer,autumn','/uploads/upload-1775480667650-12858666.png','2026-04-06 11:47:46','2026-04-07 13:02:20',NULL,NULL,NULL,NULL,NULL,NULL,'easy','食用菇',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','common'),(96,'香菇','Lentinula edodes','香菇是一种常见的食用真菌，具有浓郁的香气和丰富的营养价值。',NULL,'秋季,冬季','/mushrooms/xianggu.jpg','2026-04-09 13:26:26','2026-04-09 13:26:26','生于阔叶树的倒木上，喜欢温暖湿润的环境，适宜生长温度为15-25℃，相对湿度80-90%。','{\"fat\": 0.3, \"fiber\": 3.3, \"protein\": 2.2, \"calories\": 25, \"minerals\": {\"iron\": 0.8, \"potassium\": 455, \"phosphorus\": 86}, \"vitamins\": {\"vitaminC\": 0, \"vitaminD\": 0.2, \"vitaminB2\": 0.1}, \"carbohydrates\": 5.2}','香菇是安全可食用的食用菌，但过敏体质者可能会出现过敏反应。','菌盖呈圆形或椭圆形，直径5-12厘米，表面呈褐色或深褐色，有鳞片；菌褶白色，密集；菌柄中生或偏生，白色或淡黄色。','炒、炖、煮、蒸、烤等','选择菌盖完整、菌褶紧密、无异味、无腐烂的香菇，储存时应放在阴凉干燥处或冰箱中。','medium','食用菇',NULL,NULL,NULL,NULL,NULL,'中国食用菌协会',NULL,'active','common'),(97,'平菇','Pleurotus ostreatus','平菇是一种广泛栽培的食用菌，味道鲜美，营养丰富。',NULL,'春季,秋季','/mushrooms/pinggu.jpg','2026-04-09 13:26:26','2026-04-09 13:26:26','生于阔叶树的倒木或腐木上，适应性强，生长温度范围广，10-30℃均可生长，最适温度20-25℃，相对湿度85-95%。','{\"fat\": 0.4, \"fiber\": 2.3, \"protein\": 3.3, \"calories\": 35, \"minerals\": {\"iron\": 0.9, \"potassium\": 370, \"phosphorus\": 80}, \"vitamins\": {\"vitaminC\": 2, \"vitaminB1\": 0.1, \"vitaminB2\": 0.3}, \"carbohydrates\": 6.1}','平菇是安全可食用的食用菌，无毒性报告。','菌盖呈扇形或贝壳形，直径5-15厘米，表面呈灰白色或浅灰色，边缘内卷；菌褶白色，延生；菌柄侧生，白色或淡黄色。','炒、炖、煮、蒸等','选择菌盖完整、菌褶紧密、无异味、无腐烂的平菇，储存时应放在冰箱中，避免潮湿。','easy','食用菇',NULL,NULL,NULL,NULL,NULL,'中国食用菌协会',NULL,'active','common'),(98,'杏鲍菇','Pleurotus eryngii','杏鲍菇具有杏仁香味和鲍鱼口感，是一种高档食用菌。',NULL,'秋季,冬季','/mushrooms/xingbao.jpg','2026-04-09 13:26:26','2026-04-09 13:26:26','生于伞形科植物的根部或枯茎上，适宜生长温度为15-25℃，相对湿度80-90%，需要较低的光照。','{\"fat\": 0.1, \"fiber\": 1.7, \"protein\": 1.4, \"calories\": 31, \"minerals\": {\"iron\": 0.5, \"potassium\": 240, \"phosphorus\": 46}, \"vitamins\": {\"vitaminC\": 0, \"vitaminB1\": 0.05, \"vitaminB2\": 0.11}, \"carbohydrates\": 7.3}','杏鲍菇是安全可食用的食用菌，无毒性报告。','菌盖呈圆形或扇形，直径3-8厘米，表面呈灰白色或浅褐色，光滑；菌褶白色，密集；菌柄粗壮，白色，肉质坚实。','炒、煎、烤、炖等','选择菌盖完整、菌柄粗壮、无异味、无腐烂的杏鲍菇，储存时应放在冰箱中，可保存3-5天。','medium','食用菇',NULL,NULL,NULL,NULL,NULL,'中国食用菌协会',NULL,'active','common'),(99,'金针菇','Flammulina velutipes','金针菇细长如针，味道鲜美，富含蛋白质和膳食纤维。',NULL,'冬季,春季','/mushrooms/jinzhen.jpg','2026-04-09 13:26:26','2026-04-09 13:26:26','生于阔叶树的倒木或腐木上，适宜生长温度为5-15℃，相对湿度85-95%，需要黑暗或弱光环境。','{\"fat\": 0.4, \"fiber\": 2.4, \"protein\": 2.4, \"calories\": 32, \"minerals\": {\"iron\": 1.4, \"potassium\": 195, \"phosphorus\": 42}, \"vitamins\": {\"vitaminC\": 2, \"vitaminB1\": 0.1, \"vitaminB2\": 0.3}, \"carbohydrates\": 6}','金针菇是安全可食用的食用菌，但未煮熟的金针菇可能会引起肠胃不适，应彻底煮熟后食用。','菌盖呈球形或半球形，直径1-3厘米，表面呈淡黄色或淡褐色，光滑；菌褶白色，延生；菌柄细长，白色，柔软。','炒、煮、涮、烤等','选择菌柄细长、菌盖小、颜色均匀、无异味的金针菇，储存时应放在冰箱中，可保存3-5天。','medium','食用菇',NULL,NULL,NULL,NULL,NULL,'中国食用菌协会',NULL,'active','common'),(100,'猴头菇','Hericium erinaceus','猴头菇因外形似猴子的头而得名，是一种珍贵的食用菌。',NULL,'春季,夏季','/mushrooms/houtou.jpg','2026-04-09 13:26:26','2026-04-09 13:26:26','生于阔叶树的活立木或倒木上，适宜生长温度为18-25℃，相对湿度85-90%，需要充足的通风。','{\"fat\": 0.2, \"fiber\": 4.2, \"protein\": 2.5, \"calories\": 35, \"minerals\": {\"iron\": 1.1, \"potassium\": 530, \"phosphorus\": 85}, \"vitamins\": {\"vitaminC\": 4, \"vitaminB1\": 0.1, \"vitaminB2\": 0.1}, \"carbohydrates\": 7.3}','猴头菇是安全可食用的食用菌，具有较高的营养价值和药用价值。','子实体呈块状，直径5-15厘米，表面覆盖着密集的针状菌刺，颜色为白色或淡黄色，成熟后变为淡褐色。','炖、煮、蒸、炒等','选择菌刺密集、颜色洁白、无异味、无腐烂的猴头菇，储存时应放在阴凉干燥处或冰箱中。','hard','食用菇',NULL,NULL,NULL,NULL,NULL,'中国食用菌协会',NULL,'active','common');
/*!40000 ALTER TABLE `mushrooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '閫氱煡ID',
  `userId` int NOT NULL COMMENT '鐢ㄦ埛ID',
  `type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '閫氱煡绫诲瀷锛坈ultivation_reminder/recipe_recommendation/system_notice锛?,
  `title` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '閫氱煡鏍囬',
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '閫氱煡鍐呭',
  `relatedId` int DEFAULT NULL COMMENT '鍏宠仈ID锛堝璁㈠崟ID銆侀璋盜D锛?,
  `isRead` tinyint(1) NOT NULL DEFAULT '0' COMMENT '鏄惁宸茶',
  `readAt` datetime DEFAULT NULL COMMENT '璇诲彇鏃堕棿',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `operation_logs`
--

DROP TABLE IF EXISTS `operation_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `operation_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL COMMENT '鎿嶄綔鐢ㄦ埛ID',
  `username` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '鎿嶄綔鐢ㄦ埛鍚?,
  `role` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '鐢ㄦ埛瑙掕壊',
  `action` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '鎿嶄綔绫诲瀷锛歝reate, update, delete, view, approve, reject绛?,
  `module` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '鎿嶄綔妯″潡锛歱roduct, order, user, recipe, video绛?,
  `targetId` int DEFAULT NULL COMMENT '鐩爣瀵硅薄ID',
  `targetName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '鐩爣瀵硅薄鍚嶇О',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '鎿嶄綔鎻忚堪',
  `ipAddress` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '鎿嶄綔IP鍦板潃',
  `userAgent` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '鐢ㄦ埛浠ｇ悊淇℃伅',
  `beforeData` json DEFAULT NULL COMMENT '鎿嶄綔鍓嶆暟鎹?,
  `afterData` json DEFAULT NULL COMMENT '鎿嶄綔鍚庢暟鎹?,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `operation_logs_user_id` (`userId`),
  KEY `operation_logs_role` (`role`),
  KEY `operation_logs_module` (`module`),
  KEY `operation_logs_action` (`action`),
  KEY `operation_logs_target_id` (`targetId`),
  KEY `operation_logs_created_at` (`createdAt`),
  CONSTRAINT `operation_logs_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='鎿嶄綔鏃ュ織琛?;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `operation_logs`
--

LOCK TABLES `operation_logs` WRITE;
/*!40000 ALTER TABLE `operation_logs` DISABLE KEYS */;
INSERT INTO `operation_logs` VALUES (1,2,'admin','admin','create','product',60,'aa','管理员创建商品','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0',NULL,'{\"id\": 60, \"name\": \"aa\", \"isHot\": false, \"price\": 20, \"stock\": 6, \"images\": [\"/uploads/upload-1775895023744-124521605.png\"], \"status\": \"approved\", \"category\": \"野生菌\", \"sellerId\": 2, \"createdAt\": \"2026-04-11T08:10:28.059Z\", \"updatedAt\": \"2026-04-11T08:10:28.059Z\", \"viewCount\": 0, \"description\": \"sssssssssss\"}','2026-04-11 08:10:28','2026-04-11 08:10:28'),(2,2,'admin','admin','delete','product',60,'aa','管理员删除商品','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0','{\"id\": 60, \"name\": \"aa\", \"isHot\": true, \"price\": \"20.00\", \"stock\": 6, \"images\": [\"/uploads/upload-1775895023744-124521605.png\"], \"status\": \"approved\", \"category\": \"野生菌\", \"sellerId\": 2, \"createdAt\": \"2026-04-11T08:10:28.000Z\", \"updatedAt\": \"2026-04-11T08:41:20.000Z\", \"viewCount\": 3, \"rejectRule\": null, \"rejectType\": null, \"rejectedAt\": null, \"description\": \"sssssssssss\", \"rejectReason\": null}',NULL,'2026-04-11 08:41:21','2026-04-11 08:41:21'),(3,2,'admin','admin','create','product',61,'????','管理员创建商品','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7019',NULL,'{\"id\": 61, \"name\": \"????\", \"isHot\": false, \"price\": 10, \"stock\": 10, \"images\": [], \"status\": \"approved\", \"category\": \"test123\", \"sellerId\": 2, \"createdAt\": \"2026-04-13T09:17:12.910Z\", \"updatedAt\": \"2026-04-13T09:17:12.910Z\", \"viewCount\": 0, \"description\": \"??\", \"subCategory\": \"sgqsefglq-mnwz2t3c\"}','2026-04-13 09:17:12','2026-04-13 09:17:12'),(4,2,'admin','admin','create','product',62,'????2','管理员创建商品','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7019',NULL,'{\"id\": 62, \"name\": \"????2\", \"isHot\": false, \"price\": 20, \"stock\": 5, \"images\": [], \"status\": \"approved\", \"category\": \"test123\", \"sellerId\": 2, \"createdAt\": \"2026-04-13T09:19:46.342Z\", \"updatedAt\": \"2026-04-13T09:19:46.342Z\", \"viewCount\": 0, \"description\": \"????\", \"subCategory\": \"sgqsefglq-mnwz2t3c\"}','2026-04-13 09:19:46','2026-04-13 09:19:46'),(5,2,'admin','admin','create','product',63,'????5','管理员创建商品','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7019',NULL,'{\"id\": 63, \"name\": \"????5\", \"isHot\": false, \"price\": 50, \"stock\": 8, \"images\": [], \"status\": \"approved\", \"category\": \"medicinal\", \"sellerId\": 2, \"createdAt\": \"2026-04-13T09:20:46.912Z\", \"updatedAt\": \"2026-04-13T09:20:46.912Z\", \"viewCount\": 0, \"description\": \"????\", \"subCategory\": \"otherMedicinal\"}','2026-04-13 09:20:46','2026-04-13 09:20:46'),(6,2,'admin','admin','create','product',64,'????6','管理员创建商品','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7019',NULL,'{\"id\": 64, \"name\": \"????6\", \"isHot\": false, \"price\": 60, \"stock\": 10, \"images\": [], \"status\": \"approved\", \"category\": \"medicinal\", \"sellerId\": 2, \"createdAt\": \"2026-04-13T09:21:34.644Z\", \"updatedAt\": \"2026-04-13T09:21:34.644Z\", \"viewCount\": 0, \"description\": \"????\"}','2026-04-13 09:21:34','2026-04-13 09:21:34'),(7,2,'admin','admin','create','product',65,'????7','管理员创建商品','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7019',NULL,'{\"id\": 65, \"name\": \"????7\", \"isHot\": false, \"price\": 70, \"stock\": 8, \"images\": [], \"status\": \"approved\", \"category\": \"test123\", \"sellerId\": 2, \"createdAt\": \"2026-04-13T09:21:34.709Z\", \"updatedAt\": \"2026-04-13T09:21:34.709Z\", \"viewCount\": 0, \"description\": \"????\", \"subCategory\": \"sgqsefglq-mnwz2t3c\"}','2026-04-13 09:21:34','2026-04-13 09:21:34'),(8,2,'admin','admin','create','product',66,'343','管理员创建商品','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0',NULL,'{\"id\": 66, \"name\": \"343\", \"isHot\": false, \"price\": 0.01, \"stock\": 1, \"images\": [\"/uploads/upload-1776072171071-302916304.png\"], \"status\": \"approved\", \"category\": \"test123\", \"sellerId\": 2, \"createdAt\": \"2026-04-13T09:22:52.135Z\", \"updatedAt\": \"2026-04-13T09:22:52.135Z\", \"viewCount\": 0, \"description\": \"333333333333333333333333333\", \"subCategory\": \"sgqsefglq-mnwz2t3c\", \"subSubCategory\": \"ho9ho9ho9-mnwz2xpu\"}','2026-04-13 09:22:52','2026-04-13 09:22:52'),(9,2,'admin','admin','delete','product',64,'????6','管理员删除商品','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0','{\"id\": 64, \"name\": \"????6\", \"isHot\": false, \"price\": \"60.00\", \"stock\": 10, \"images\": [], \"status\": \"approved\", \"category\": \"medicinal\", \"sellerId\": 2, \"createdAt\": \"2026-04-13T09:21:34.000Z\", \"updatedAt\": \"2026-04-13T09:21:34.000Z\", \"viewCount\": 0, \"rejectRule\": null, \"rejectType\": null, \"rejectedAt\": null, \"description\": \"????\", \"subCategory\": \"\", \"rejectReason\": null, \"subSubCategory\": null}',NULL,'2026-04-13 09:52:28','2026-04-13 09:52:28'),(10,2,'admin','admin','delete','product',65,'????7','管理员删除商品','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0','{\"id\": 65, \"name\": \"????7\", \"isHot\": false, \"price\": \"70.00\", \"stock\": 8, \"images\": [], \"status\": \"approved\", \"category\": \"test123\", \"sellerId\": 2, \"createdAt\": \"2026-04-13T09:21:34.000Z\", \"updatedAt\": \"2026-04-13T09:21:34.000Z\", \"viewCount\": 0, \"rejectRule\": null, \"rejectType\": null, \"rejectedAt\": null, \"description\": \"????\", \"subCategory\": \"sgqsefglq-mnwz2t3c\", \"rejectReason\": null, \"subSubCategory\": null}',NULL,'2026-04-13 09:52:31','2026-04-13 09:52:31'),(11,2,'admin','admin','delete','product',63,'????5','管理员删除商品','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0','{\"id\": 63, \"name\": \"????5\", \"isHot\": false, \"price\": \"50.00\", \"stock\": 8, \"images\": [], \"status\": \"approved\", \"category\": \"medicinal\", \"sellerId\": 2, \"createdAt\": \"2026-04-13T09:20:46.000Z\", \"updatedAt\": \"2026-04-13T09:20:46.000Z\", \"viewCount\": 0, \"rejectRule\": null, \"rejectType\": null, \"rejectedAt\": null, \"description\": \"????\", \"subCategory\": \"otherMedicinal\", \"rejectReason\": null, \"subSubCategory\": null}',NULL,'2026-04-13 09:52:32','2026-04-13 09:52:32'),(12,2,'admin','admin','delete','product',62,'????2','管理员删除商品','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0','{\"id\": 62, \"name\": \"????2\", \"isHot\": false, \"price\": \"20.00\", \"stock\": 5, \"images\": [], \"status\": \"approved\", \"category\": \"test123\", \"sellerId\": 2, \"createdAt\": \"2026-04-13T09:19:46.000Z\", \"updatedAt\": \"2026-04-13T09:19:46.000Z\", \"viewCount\": 0, \"rejectRule\": null, \"rejectType\": null, \"rejectedAt\": null, \"description\": \"????\", \"subCategory\": \"sgqsefglq-mnwz2t3c\", \"rejectReason\": null, \"subSubCategory\": null}',NULL,'2026-04-13 09:52:33','2026-04-13 09:52:33'),(13,2,'admin','admin','delete','product',61,'????','管理员删除商品','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0','{\"id\": 61, \"name\": \"????\", \"isHot\": true, \"price\": \"10.00\", \"stock\": 10, \"images\": [], \"status\": \"approved\", \"category\": \"test123\", \"sellerId\": 2, \"createdAt\": \"2026-04-13T09:17:12.000Z\", \"updatedAt\": \"2026-04-13T09:52:36.000Z\", \"viewCount\": 0, \"rejectRule\": null, \"rejectType\": null, \"rejectedAt\": null, \"description\": \"??\", \"subCategory\": \"sgqsefglq-mnwz2t3c\", \"rejectReason\": null, \"subSubCategory\": null}',NULL,'2026-04-13 09:52:38','2026-04-13 09:52:38');
/*!40000 ALTER TABLE `operation_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '鐠併垹宕熸い绗紻',
  `orderId` int NOT NULL COMMENT '璁㈠崟ID',
  `productId` int NOT NULL COMMENT '鍟嗗搧ID',
  `type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'product' COMMENT '绫诲瀷锛歱roduct-鍟嗗搧 | box-鐩茬洅',
  `productName` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '鍟嗗搧/鐩茬洅鍚嶇О',
  `price` decimal(10,2) NOT NULL COMMENT '鍟嗗搧/鐩茬洅浠锋牸',
  `quantity` int NOT NULL COMMENT '鍟嗗搧/鐩茬洅鏁伴噺',
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '鍟嗗搧/鐩茬洅鍥剧墖',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `orderId` (`orderId`),
  KEY `productId` (`productId`),
  CONSTRAINT `order_items_ibfk_79` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `order_items_ibfk_80` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=96 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='鐠併垹宕熸い纭呫€?;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (33,30,34,'product','猴头菇',29.99,2,'/mushrooms/houtougu.jpg','2026-02-06 03:22:15','2026-02-06 03:22:15'),(34,31,31,'product','平菇',15.99,1,'/mushrooms/pinggu.jpg','2026-02-07 02:28:46','2026-02-07 02:28:46'),(44,41,31,'product','平菇',15.99,2,'/mushrooms/pinggu.jpg','2026-02-07 11:43:21','2026-02-07 11:43:21'),(45,42,31,'product','平菇',15.99,2,'/mushrooms/pinggu.jpg','2026-02-07 12:06:31','2026-02-07 12:06:31'),(46,43,31,'product','平菇',15.99,2,'/mushrooms/pinggu.jpg','2026-02-07 13:35:30','2026-02-07 13:35:30'),(67,52,33,'product','金针菇',12.99,2,'/mushrooms/jinzhengu.jpg','2026-02-20 14:07:04','2026-02-20 14:07:04'),(71,53,31,'product','平菇',16.00,1,'/uploads/upload-1771652237701-654685118.jpg','2026-02-22 04:42:26','2026-02-22 04:42:26'),(72,53,53,'product','杏鲍菇',29.91,1,'/uploads/upload-1771667923500-262170868.webp','2026-02-22 04:42:26','2026-02-22 04:42:26'),(74,54,31,'product','平菇',16.00,3,'/uploads/upload-1771652237701-654685118.jpg','2026-04-04 01:52:28','2026-04-04 01:52:28'),(79,59,34,'product','猴头菇',30.00,1,'/uploads/upload-1771652207680-244808221.jpg','2026-04-04 10:53:32','2026-04-04 10:53:32'),(80,60,53,'product','杏鲍菇',29.91,2,'/uploads/upload-1771667923500-262170868.webp','2026-04-04 11:00:30','2026-04-04 11:00:30'),(81,61,53,'product','杏鲍菇',29.91,2,'/uploads/upload-1771667923500-262170868.webp','2026-04-04 11:08:32','2026-04-04 11:08:32'),(82,62,31,'product','平菇',16.00,2,'/uploads/upload-1771652237701-654685118.jpg','2026-04-04 11:19:10','2026-04-04 11:19:10'),(85,65,53,'product','杏鲍菇',29.91,3,'/uploads/upload-1771667923500-262170868.webp','2026-04-05 03:03:48','2026-04-05 03:03:48'),(86,66,53,'product','杏鲍菇',29.91,2,'/uploads/upload-1771667923500-262170868.webp','2026-04-09 13:36:54','2026-04-09 13:36:54'),(87,67,52,'product','香菇',29.91,2,'/uploads/upload-1771667893684-748051072.webp','2026-04-10 06:31:24','2026-04-10 06:31:24'),(88,68,53,'product','杏鲍菇',29.91,2,'/uploads/upload-1771667923500-262170868.webp','2026-04-10 06:51:09','2026-04-10 06:51:09'),(89,69,53,'product','杏鲍菇',29.91,1,'/uploads/upload-1771667923500-262170868.webp','2026-04-10 06:59:46','2026-04-10 06:59:46'),(90,70,33,'product','金针菇',13.00,1,'/uploads/upload-1771652265102-229560094.jpg','2026-04-11 07:53:56','2026-04-11 07:53:56'),(91,71,53,'product','杏鲍菇',29.91,2,'/uploads/upload-1771667923500-262170868.webp','2026-04-13 04:27:39','2026-04-13 04:27:39'),(92,72,53,'product','杏鲍菇',29.91,1,'/uploads/upload-1771667923500-262170868.webp','2026-04-13 04:30:44','2026-04-13 04:30:44'),(93,73,53,'product','杏鲍菇',29.91,2,'/uploads/upload-1771667923500-262170868.webp','2026-04-13 04:36:28','2026-04-13 04:36:28'),(94,74,52,'product','香菇',29.91,1,'/uploads/upload-1771667893684-748051072.webp','2026-04-13 04:41:43','2026-04-13 04:41:43'),(95,75,31,'product','平菇',16.00,2,'/uploads/upload-1771652237701-654685118.jpg','2026-04-13 06:15:42','2026-04-13 06:15:42');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '鐠併垹宕烮D',
  `orderNo` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '璁㈠崟缂栧彿',
  `userId` int NOT NULL COMMENT '鐢ㄦ埛ID',
  `totalAmount` decimal(10,2) NOT NULL COMMENT '鎬婚噾棰?,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT '璁㈠崟鐘舵€侊細pending-寰呮敮浠?| paid-宸叉敮浠?| delivered-宸插彂璐?| completed-宸插畬鎴?| cancelled-宸插彇娑?,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '鏀惰揣鍦板潃',
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '鑱旂郴鐢佃瘽',
  `receiver` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '鏀惰揣浜?,
  `paymentMethod` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '鏀粯鏂瑰紡',
  `paymentTime` datetime DEFAULT NULL COMMENT '鏀粯鏃堕棿',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `paymentSignature` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '鏀粯绛惧悕',
  `paymentTimeout` datetime DEFAULT NULL COMMENT '鏀粯瓒呮椂鏃堕棿',
  `transactionId` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '浜ゆ槗ID',
  `paymentInfo` json DEFAULT NULL COMMENT '鏀粯淇℃伅',
  `cancelledReason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '鍙栨秷鍘熷洜',
  PRIMARY KEY (`id`),
  UNIQUE KEY `orderNo` (`orderNo`),
  UNIQUE KEY `orders_order_no` (`orderNo`),
  UNIQUE KEY `orderNo_2` (`orderNo`),
  UNIQUE KEY `orderNo_3` (`orderNo`),
  UNIQUE KEY `orderNo_4` (`orderNo`),
  UNIQUE KEY `orderNo_5` (`orderNo`),
  UNIQUE KEY `orderNo_6` (`orderNo`),
  UNIQUE KEY `orderNo_7` (`orderNo`),
  UNIQUE KEY `orderNo_8` (`orderNo`),
  UNIQUE KEY `orderNo_9` (`orderNo`),
  UNIQUE KEY `orderNo_10` (`orderNo`),
  UNIQUE KEY `orderNo_11` (`orderNo`),
  UNIQUE KEY `orderNo_12` (`orderNo`),
  UNIQUE KEY `orderNo_13` (`orderNo`),
  UNIQUE KEY `orderNo_14` (`orderNo`),
  UNIQUE KEY `orderNo_15` (`orderNo`),
  UNIQUE KEY `orderNo_16` (`orderNo`),
  UNIQUE KEY `orderNo_17` (`orderNo`),
  UNIQUE KEY `orderNo_18` (`orderNo`),
  UNIQUE KEY `orderNo_19` (`orderNo`),
  UNIQUE KEY `orderNo_20` (`orderNo`),
  UNIQUE KEY `orderNo_21` (`orderNo`),
  UNIQUE KEY `orderNo_22` (`orderNo`),
  UNIQUE KEY `orderNo_23` (`orderNo`),
  UNIQUE KEY `orderNo_24` (`orderNo`),
  UNIQUE KEY `orderNo_25` (`orderNo`),
  UNIQUE KEY `orderNo_26` (`orderNo`),
  UNIQUE KEY `orderNo_27` (`orderNo`),
  UNIQUE KEY `orderNo_28` (`orderNo`),
  UNIQUE KEY `orderNo_29` (`orderNo`),
  UNIQUE KEY `orderNo_30` (`orderNo`),
  UNIQUE KEY `orderNo_31` (`orderNo`),
  UNIQUE KEY `orderNo_32` (`orderNo`),
  UNIQUE KEY `orderNo_33` (`orderNo`),
  UNIQUE KEY `orderNo_34` (`orderNo`),
  UNIQUE KEY `orderNo_35` (`orderNo`),
  UNIQUE KEY `orderNo_36` (`orderNo`),
  UNIQUE KEY `orderNo_37` (`orderNo`),
  UNIQUE KEY `orderNo_38` (`orderNo`),
  UNIQUE KEY `orderNo_39` (`orderNo`),
  UNIQUE KEY `orderNo_40` (`orderNo`),
  UNIQUE KEY `orderNo_41` (`orderNo`),
  KEY `userId` (`userId`),
  KEY `status` (`status`),
  KEY `orders_user_id` (`userId`),
  KEY `orders_status` (`status`),
  KEY `orders_created_at` (`createdAt`),
  KEY `orders_payment_time` (`paymentTime`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=76 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='鐠併垹宕熺悰';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'ORD1769227025204849',2,0.21,'pending','建国路88号','13800138000','张三','alipay',NULL,'2026-01-24 03:57:05','2026-01-24 03:57:05',NULL,NULL,NULL,NULL,NULL),(2,'ORD1769228649977376',2,0.06,'pending','建国路88号','13800138000','张三','alipay',NULL,'2026-01-24 04:24:09','2026-01-24 04:24:09',NULL,NULL,NULL,NULL,NULL),(3,'ORD1769228924759851',2,0.06,'pending','建国路88号','13800138000','张三','wechat',NULL,'2026-01-24 04:28:44','2026-01-24 04:28:44',NULL,NULL,NULL,NULL,NULL),(4,'ORD176922894646223',2,0.06,'pending','建国路88号','13800138000','张三','alipay',NULL,'2026-01-24 04:29:06','2026-01-24 04:29:06',NULL,NULL,NULL,NULL,NULL),(5,'ORD176922963200836',2,0.09,'pending','建国路88号','13800138000','张三','alipay',NULL,'2026-01-24 04:40:32','2026-01-24 04:40:32',NULL,NULL,NULL,NULL,NULL),(6,'ORD1769234891836774',2,0.21,'pending','建国路88号','13800138000','张三','alipay',NULL,'2026-01-24 06:08:11','2026-01-24 06:08:11',NULL,NULL,NULL,NULL,NULL),(7,'ORD1769235235678280',6,0.01,'pending','????','13800138000','????','alipay',NULL,'2026-01-24 06:13:55','2026-01-24 06:13:55',NULL,NULL,NULL,NULL,NULL),(8,'ORD1769235996130327',2,0.09,'pending','建国路88号','13800138000','张三','alipay',NULL,'2026-01-24 06:26:36','2026-01-24 06:26:36',NULL,NULL,NULL,NULL,NULL),(9,'ORD1769236456329696',2,0.01,'pending','建国路88号','13800138000','张三','alipay',NULL,'2026-01-24 06:34:16','2026-01-24 06:34:16',NULL,NULL,NULL,NULL,NULL),(10,'ORD176923650063651',2,0.02,'pending','efdwf\ndwq','13351324444','xxx','wechat',NULL,'2026-01-24 06:35:00','2026-01-24 06:35:00',NULL,NULL,NULL,NULL,NULL),(11,'ORD176924461148289',2,0.09,'cancelled','建国路88号','13800138000','张三','wechat',NULL,'2026-01-24 08:50:11','2026-01-24 08:50:25',NULL,NULL,NULL,NULL,NULL),(12,'ORD1769244648830847',2,0.06,'cancelled','建国路88号','13800138000','张三','alipay',NULL,'2026-01-24 08:50:48','2026-01-24 08:51:11',NULL,NULL,NULL,NULL,NULL),(13,'ORD1769245727467635',2,0.03,'completed','建国路88号','13800138000','张三','alipay',NULL,'2026-01-24 09:08:47','2026-04-05 03:13:39',NULL,NULL,NULL,NULL,NULL),(14,'ORD1769246521641101',2,0.06,'cancelled','efdwf\ndwq','13351324444','xxx','alipay',NULL,'2026-01-24 09:22:01','2026-01-24 09:22:09',NULL,NULL,NULL,NULL,NULL),(15,'ORD1769246541215219',2,0.06,'cancelled','建国路88号','13800138000','张三','alipay',NULL,'2026-01-24 09:22:21','2026-01-24 09:22:24',NULL,NULL,NULL,NULL,NULL),(16,'ORD1769247331874122',2,0.06,'pending','efdwf\ndwq','13351324444','xxx','alipay',NULL,'2026-01-24 09:35:31','2026-01-24 09:35:31',NULL,NULL,NULL,NULL,NULL),(17,'ORD1769247363275482',2,0.06,'pending','efdwf\ndwq','13351326666','ddd','alipay',NULL,'2026-01-24 09:36:03','2026-01-24 09:36:03',NULL,NULL,NULL,NULL,NULL),(18,'ORD1769269766821619',2,0.03,'pending','efdwf\ndwq','13351324444','xxx','alipay',NULL,'2026-01-24 15:49:26','2026-01-24 15:49:26',NULL,NULL,NULL,NULL,NULL),(19,'ORD1769316130686959',2,0.02,'pending','efdwf\ndwq','13351326666','ddd','alipay',NULL,'2026-01-25 04:42:10','2026-01-25 04:42:10',NULL,NULL,NULL,NULL,NULL),(20,'ORD1770095977885126',2,0.02,'paid','efdwf\ndwq','13351324444','xxx','alipay',NULL,'2026-02-03 05:19:37','2026-02-05 05:52:44',NULL,NULL,NULL,NULL,NULL),(21,'ORD1770277140534486',2,2.10,'pending','efdwf\ndwq','13351326666','ddd','alipay',NULL,'2026-02-05 07:39:00','2026-02-05 07:39:00',NULL,NULL,NULL,NULL,NULL),(22,'ORD1770277181477758',2,1.01,'cancelled','efdwf\ndwq','13351326666','ddd','alipay',NULL,'2026-02-05 07:39:41','2026-02-05 07:39:57',NULL,NULL,NULL,NULL,NULL),(23,'ORD177027820823548',2,1.01,'cancelled','efdwf\ndwq','13351326666','ddd','alipay',NULL,'2026-02-05 07:56:48','2026-02-05 08:26:05',NULL,NULL,NULL,NULL,NULL),(24,'ORD1770278249268101',2,3.03,'pending','efdwf\ndwq','13351326666','ddd','alipay',NULL,'2026-02-05 07:57:29','2026-02-05 07:57:29',NULL,NULL,NULL,NULL,NULL),(25,'ORD17702812084563',2,2.02,'pending','efdwf\ndwq','13351326666','ddd','alipay',NULL,'2026-02-05 08:46:48','2026-02-05 08:46:48',NULL,NULL,NULL,NULL,NULL),(26,'ORD1770281687031616',2,3.03,'pending','efdwf\ndwq','13351326666','ddd','alipay',NULL,'2026-02-05 08:54:47','2026-02-05 08:54:47',NULL,NULL,NULL,NULL,NULL),(27,'ORD1770285144426898',2,0.06,'pending','efdwf\ndwq','13351326666','ddd','alipay',NULL,'2026-02-05 09:52:24','2026-02-05 09:52:24',NULL,NULL,NULL,NULL,NULL),(28,'ORD1770285255602396',2,0.03,'pending','efdwf\ndwq','13351324444','xxx','wechat',NULL,'2026-02-05 09:54:15','2026-02-05 09:54:15',NULL,NULL,NULL,NULL,NULL),(29,'ORD1770285924342171',2,2.02,'pending','efdwf\ndwq','13351324444','xxx','alipay',NULL,'2026-02-05 10:05:24','2026-02-05 10:05:24',NULL,NULL,NULL,NULL,NULL),(30,'ORD1770348135719114',2,61.02,'pending','efdwf\ndwq','13351326666','ddd','alipay',NULL,'2026-02-06 03:22:15','2026-02-06 03:22:15',NULL,NULL,NULL,NULL,NULL),(31,'ORD1770431326434155',2,15.99,'pending','efdwf\ndwq','13351326666','ddd','alipay',NULL,'2026-02-07 02:28:46','2026-02-07 02:28:46',NULL,NULL,NULL,NULL,NULL),(32,'ORD1770461132299556',22,0.03,'pending','测试地址','13800138000','测试用户','alipay',NULL,'2026-02-07 10:45:32','2026-02-07 10:45:32','298d65d4fef8299b039cadfc5c1b448f','2026-02-07 11:15:32',NULL,'{\"method\": \"alipay\", \"signature\": \"298d65d4fef8299b039cadfc5c1b448f\", \"timestamp\": 1770461132307}',NULL),(33,'ORD177046116077581',22,0.03,'pending','测试地址','13800138000','测试用户','alipay',NULL,'2026-02-07 10:46:00','2026-02-07 10:46:00','6fa42030b04592b832e572e0dd44d17d','2026-02-07 11:16:00',NULL,'{\"method\": \"alipay\", \"signature\": \"6fa42030b04592b832e572e0dd44d17d\", \"timestamp\": 1770461160782}',NULL),(34,'ORD1770461160831265',22,0.03,'pending','测试地址','13800138000','测试用户','wechat',NULL,'2026-02-07 10:46:00','2026-02-07 10:46:00','df15b9399f28b46c9674fba12d731375','2026-02-07 11:16:00',NULL,'{\"method\": \"wechat\", \"signature\": \"df15b9399f28b46c9674fba12d731375\", \"timestamp\": 1770461160833}',NULL),(35,'ORD1770461160853428',22,0.03,'pending','测试地址','13800138000','测试用户','alipay',NULL,'2026-02-07 10:46:00','2026-02-07 10:46:00','b7bcb153b4a2f475ab6e766a2cf8955c','2026-02-07 11:16:00',NULL,'{\"method\": \"alipay\", \"signature\": \"b7bcb153b4a2f475ab6e766a2cf8955c\", \"timestamp\": 1770461160854}',NULL),(36,'ORD1770461160871979',22,0.03,'pending','测试地址','13800138000','测试用户','wechat',NULL,'2026-02-07 10:46:00','2026-02-07 10:46:00','d8b6e4f7693f6e93c6afa79157ec611f','2026-02-07 11:16:00',NULL,'{\"method\": \"wechat\", \"signature\": \"d8b6e4f7693f6e93c6afa79157ec611f\", \"timestamp\": 1770461160873}',NULL),(37,'ORD1770461160893417',22,0.03,'pending','测试地址','13800138000','测试用户','bank',NULL,'2026-02-07 10:46:00','2026-02-07 10:46:00','10eb16e9eeea3b2d57cfcb39174d8f38','2026-02-07 11:16:00',NULL,'{\"method\": \"bank\", \"signature\": \"10eb16e9eeea3b2d57cfcb39174d8f38\", \"timestamp\": 1770461160895}',NULL),(38,'ORD1770461160911647',22,0.03,'pending','测试地址','13800138000','测试用户','alipay',NULL,'2026-02-07 10:46:00','2026-02-07 10:46:00','809ebc68587186015d9a2b9cdedb38a2','2026-02-07 11:16:00',NULL,'{\"method\": \"alipay\", \"signature\": \"809ebc68587186015d9a2b9cdedb38a2\", \"timestamp\": 1770461160913}',NULL),(39,'ORD177046116093463',22,0.03,'pending','测试地址','13800138000','测试用户','bank',NULL,'2026-02-07 10:46:00','2026-02-07 10:46:00','f0f26315a0bfe067cc974a29787a743d','2026-02-07 11:16:00',NULL,'{\"method\": \"bank\", \"signature\": \"f0f26315a0bfe067cc974a29787a743d\", \"timestamp\": 1770461160936}',NULL),(40,'ORD1770461404869856',2,0.01,'pending','efdwf\ndwq','13351326666','ddd','wechat',NULL,'2026-02-07 10:50:04','2026-02-07 10:50:04','87174105786c514af6dd0453109c63e6','2026-02-07 11:20:04',NULL,'{\"method\": \"wechat\", \"signature\": \"87174105786c514af6dd0453109c63e6\", \"timestamp\": 1770461404872}',NULL),(41,'ORD1770464601083417',2,31.98,'pending','efdwf\ndwq','13351326666','ddd','wechat',NULL,'2026-02-07 11:43:21','2026-02-07 11:43:21','3fc1aa47fa2ae6c996f8b7eb2d7bbeec','2026-02-07 12:13:21',NULL,'{\"method\": \"wechat\", \"signature\": \"3fc1aa47fa2ae6c996f8b7eb2d7bbeec\", \"timestamp\": 1770464601085}',NULL),(42,'ORD1770465991538341',2,31.98,'shipping','efdwf\ndwq','13351326666','ddd','alipay',NULL,'2026-02-07 12:06:31','2026-02-21 10:22:14','8191b7659069c717b47ba9122ca8cac9','2026-02-07 12:36:31',NULL,'{\"method\": \"alipay\", \"signature\": \"8191b7659069c717b47ba9122ca8cac9\", \"timestamp\": 1770465991540}',NULL),(43,'ORD1770471330580856',2,31.98,'pending','efdwf\ndwq','13351326666','ddd','alipay',NULL,'2026-02-07 13:35:30','2026-02-07 13:35:30','c5e83524ee9c52b5140734152b9c5056','2026-02-07 14:05:30',NULL,'{\"method\": \"alipay\", \"signature\": \"c5e83524ee9c52b5140734152b9c5056\", \"timestamp\": 1770471330583}',NULL),(44,'ORD1770716318820668',2,0.01,'cancelled','efdwf\ndwq','13351326666','ddd','alipay',NULL,'2026-02-10 09:38:38','2026-02-10 09:38:51','e154decdc49370adbdc4cf93b2f66c5c','2026-02-10 10:08:38',NULL,'{\"method\": \"alipay\", \"signature\": \"e154decdc49370adbdc4cf93b2f66c5c\", \"timestamp\": 1770716318824}',NULL),(45,'ORD1771498069124750',3,0.03,'pending','efdwf\ndwq','13351344444','11111111','alipay',NULL,'2026-02-19 10:47:49','2026-02-19 10:47:49','b462f1ac1cffcd7bed4bf966739366dd','2026-02-19 11:17:49',NULL,'{\"method\": \"alipay\", \"signature\": \"b462f1ac1cffcd7bed4bf966739366dd\", \"timestamp\": 1771498069133}',NULL),(46,'ORD1771591039435326',2,60.07,'pending','efdwf\ndwq','13351324444','xxx','alipay',NULL,'2026-02-20 12:37:19','2026-02-20 12:37:19','d018315080e289e7b449d7c2b3d240c3','2026-02-20 13:07:19',NULL,'{\"method\": \"alipay\", \"signature\": \"d018315080e289e7b449d7c2b3d240c3\", \"timestamp\": 1771591039447}',NULL),(47,'ORD1771591907020527',2,0.03,'cancelled','efdwf\ndwq','13351324444','xxx','alipay',NULL,'2026-02-20 12:51:47','2026-02-20 12:51:53','bc15efdbae305fbbed5e62f47adf1a55','2026-02-20 13:21:47',NULL,'{\"method\": \"alipay\", \"signature\": \"bc15efdbae305fbbed5e62f47adf1a55\", \"timestamp\": 1771591907023}',NULL),(52,'ORD1771596424299610',2,115.01,'pending','efdwf\ndwq','13351324444','xxx','alipay',NULL,'2026-02-20 14:07:04','2026-02-20 14:07:04','be02df3b7ba24178b868bdeb1b623355','2026-02-20 14:37:04',NULL,'{\"method\": \"alipay\", \"signature\": \"be02df3b7ba24178b868bdeb1b623355\", \"timestamp\": 1771596424326}',NULL),(53,'ORD1771735346044237',2,124.92,'pending','xxxxxxxxxxxxxx','13845557834','张三','bank',NULL,'2026-02-22 04:42:26','2026-02-22 04:42:26','9aa275b591e5badef6b87951d4af58ac','2026-02-22 05:12:26',NULL,'{\"method\": \"bank\", \"signature\": \"9aa275b591e5badef6b87951d4af58ac\", \"timestamp\": 1771735346064}',NULL),(54,'ORD1775267548655569',2,48.00,'cancelled','xxxxxxxxxxxxxx','13845557834','张三','wechat',NULL,'2026-04-04 01:52:28','2026-04-04 01:52:34','db3d64438a229bb3da448584fcdbfebe','2026-04-04 02:22:28',NULL,'{\"method\": \"wechat\", \"signature\": \"db3d64438a229bb3da448584fcdbfebe\", \"timestamp\": 1775267548666}',NULL),(55,'ORD1775294829522961',2,79.01,'cancelled','efdwf\ndwq','13351326666','ddd','alipay',NULL,'2026-04-04 09:27:09','2026-04-04 09:27:15','b094569ad5cbfeba77f34a4e1bb2f00f','2026-04-04 09:57:09',NULL,'{\"method\": \"alipay\", \"signature\": \"b094569ad5cbfeba77f34a4e1bb2f00f\", \"timestamp\": 1775294829532}',NULL),(56,'ORD1775295533578764',2,178.00,'cancelled','efdwf\ndwq','13351326666','ddd','alipay',NULL,'2026-04-04 09:38:53','2026-04-04 09:38:58','5e44bb1f37314ed55d96dace43ab8697','2026-04-04 10:08:53',NULL,'{\"method\": \"alipay\", \"signature\": \"5e44bb1f37314ed55d96dace43ab8697\", \"timestamp\": 1775295533585}',NULL),(57,'ORD1775299747626248',2,79.01,'cancelled','efdwf\ndwq','13351326666','ddd','alipay',NULL,'2026-04-04 10:49:07','2026-04-04 10:49:11','350d8ac41c72d3e996ff88b0490e6170','2026-04-04 11:19:07',NULL,'{\"method\": \"alipay\", \"signature\": \"350d8ac41c72d3e996ff88b0490e6170\", \"timestamp\": 1775299747640}',NULL),(58,'ORD177529978713698',2,129.00,'cancelled','efdwf\ndwq','13351326666','ddd','alipay',NULL,'2026-04-04 10:49:47','2026-04-04 10:49:53','dc20b7698951956b71fb122b7b71d2de','2026-04-04 11:19:47',NULL,'{\"method\": \"alipay\", \"signature\": \"dc20b7698951956b71fb122b7b71d2de\", \"timestamp\": 1775299787143}',NULL),(59,'ORD1775300012515752',2,30.00,'cancelled','efdwf\ndwq','13351326666','ddd','alipay',NULL,'2026-04-04 10:53:32','2026-04-04 10:53:36','c98438aa7355ecf1c689633a4587a647','2026-04-04 11:23:32',NULL,'{\"method\": \"alipay\", \"signature\": \"c98438aa7355ecf1c689633a4587a647\", \"timestamp\": 1775300012522}',NULL),(60,'ORD1775300430578844',2,59.82,'cancelled','xxxxxxxxxxxxxx','13845557834','张三','alipay',NULL,'2026-04-04 11:00:30','2026-04-04 11:00:37','09be02a45c948548b0e0b899f7ebd09d','2026-04-04 11:30:30',NULL,'{\"method\": \"alipay\", \"signature\": \"09be02a45c948548b0e0b899f7ebd09d\", \"timestamp\": 1775300430584}',NULL),(61,'ORD1775300912067768',2,59.82,'cancelled','efdwf\ndwq','13351326666','ddd','alipay',NULL,'2026-04-04 11:08:32','2026-04-04 11:08:35','7a300e4a6acda4790ca1d236015cb6ef','2026-04-04 11:38:32',NULL,'{\"method\": \"alipay\", \"signature\": \"7a300e4a6acda4790ca1d236015cb6ef\", \"timestamp\": 1775300912074}',NULL),(62,'ORD1775301550326195',2,32.00,'cancelled','efdwf\ndwq','13351326666','ddd','alipay',NULL,'2026-04-04 11:19:10','2026-04-04 11:19:14','c7bc30711b67b4a7cd028a849b84b204','2026-04-04 11:49:10',NULL,'{\"method\": \"alipay\", \"signature\": \"c7bc30711b67b4a7cd028a849b84b204\", \"timestamp\": 1775301550332}',NULL),(63,'ORD1775301736034751',2,129.00,'cancelled','efdwf\ndwq','13351326666','ddd','alipay',NULL,'2026-04-04 11:22:16','2026-04-04 11:22:19','c96d29c4871faea06ef13df32674e1dd','2026-04-04 11:52:16',NULL,'{\"method\": \"alipay\", \"signature\": \"c96d29c4871faea06ef13df32674e1dd\", \"timestamp\": 1775301736042}',NULL),(64,'ORD1775302043808751',2,89.00,'cancelled','efdwf\ndwq','13351326666','ddd','alipay',NULL,'2026-04-04 11:27:23','2026-04-04 11:27:27','204f24a8111e79917d9a9a7ccdfc2f49','2026-04-04 11:57:23',NULL,'{\"method\": \"alipay\", \"signature\": \"204f24a8111e79917d9a9a7ccdfc2f49\", \"timestamp\": 1775302043817}',NULL),(65,'ORD1775358228218680',2,89.73,'cancelled','efdwf\ndwq','13351326666','ddd','alipay',NULL,'2026-04-05 03:03:48','2026-04-05 03:03:52','27d46f3d4db3265a163799e63ad4fa73','2026-04-05 03:33:48',NULL,'{\"method\": \"alipay\", \"signature\": \"27d46f3d4db3265a163799e63ad4fa73\", \"timestamp\": 1775358228227}',NULL),(66,'ORD1775741814022853',2,59.82,'cancelled','efdwf\ndwq','13351326666','ddd','alipay',NULL,'2026-04-09 13:36:54','2026-04-09 13:36:57','793b95ce36efea602664aa6820903489','2026-04-09 14:06:54',NULL,'{\"method\": \"alipay\", \"signature\": \"793b95ce36efea602664aa6820903489\", \"timestamp\": 1775741814032}','用户主动取消'),(67,'ORD1775802684901698',2,59.82,'cancelled','efdwf\ndwq','13351326666','ddd','alipay',NULL,'2026-04-10 06:31:24','2026-04-10 06:31:29','2de346ef642de62712c057667ebfebb1','2026-04-10 07:01:24',NULL,'{\"method\": \"alipay\", \"signature\": \"2de346ef642de62712c057667ebfebb1\", \"timestamp\": 1775802684905}','用户主动取消'),(68,'ORD1775803869933450',2,59.82,'cancelled','efdwf\ndwq','13351326666','ddd','alipay',NULL,'2026-04-10 06:51:09','2026-04-10 06:51:14','3ec786b312874671d150c44d4ba1b051','2026-04-10 07:21:09',NULL,'{\"method\": \"alipay\", \"signature\": \"3ec786b312874671d150c44d4ba1b051\", \"timestamp\": 1775803869942}','用户主动取消'),(69,'ORD1775804386242573',2,29.91,'cancelled','efdwf\ndwq','13351326666','ddd','alipay',NULL,'2026-04-10 06:59:46','2026-04-10 06:59:51','7d864da8e3573b30fbff5f009bf05dce','2026-04-10 07:29:46',NULL,'{\"method\": \"alipay\", \"signature\": \"7d864da8e3573b30fbff5f009bf05dce\", \"timestamp\": 1775804386248}','用户主动取消'),(70,'ORD1775894036780518',36,13.00,'cancelled','xxxxxxxxxxxxxx','13351324465','111111','bank',NULL,'2026-04-11 07:53:56','2026-04-11 07:54:01','34b4aad20843354f84923b2798cc5fe4','2026-04-11 08:23:56',NULL,'{\"method\": \"bank\", \"signature\": \"34b4aad20843354f84923b2798cc5fe4\", \"timestamp\": 1775894036790}','用户主动取消'),(71,'ORD1776054459086290',2,59.82,'cancelled','efdwf\ndwq','13351326666','ddd','alipay',NULL,'2026-04-13 04:27:39','2026-04-13 04:28:06','04ea35ede20a339e3205fe2b5921ce0b','2026-04-13 04:57:39',NULL,'{\"method\": \"alipay\", \"signature\": \"04ea35ede20a339e3205fe2b5921ce0b\", \"timestamp\": 1776054459096}','用户主动取消'),(72,'ORD1776054644018670',4,29.91,'cancelled','xxxxxxxxxxxxxx','13351324443','11','wechat',NULL,'2026-04-13 04:30:44','2026-04-13 06:15:20','a981fad15beedfc12450985baf46c7cc','2026-04-13 05:00:44',NULL,'{\"method\": \"wechat\", \"signature\": \"a981fad15beedfc12450985baf46c7cc\", \"timestamp\": 1776054644038}','支付超时'),(73,'ORD1776054988534326',4,59.82,'cancelled','xxxxxxxxxxxxxx','13351324443','11','wechat',NULL,'2026-04-13 04:36:28','2026-04-13 06:10:53','a8664f9492a5022a3bb073517e7dd73a','2026-04-13 05:06:28',NULL,'{\"method\": \"wechat\", \"signature\": \"a8664f9492a5022a3bb073517e7dd73a\", \"timestamp\": 1776054988544}','支付超时'),(74,'ORD1776055303349263',4,29.91,'cancelled','xxxxxxxxxxxxxx','13351324443','11','wechat',NULL,'2026-04-13 04:41:43','2026-04-13 06:08:11','54db9ad7655b7444b3160eee82a73f50','2026-04-13 05:11:43',NULL,'{\"method\": \"wechat\", \"signature\": \"54db9ad7655b7444b3160eee82a73f50\", \"timestamp\": 1776055303354}','支付超时'),(75,'ORD1776060942600765',4,32.00,'cancelled','xxxxxxxxxxxxxx','13351324443','11','wechat',NULL,'2026-04-13 06:15:42','2026-04-13 06:45:43','88087dc1779e9cda55d3dd429aeb3c40','2026-04-13 06:45:42',NULL,'{\"method\": \"wechat\", \"signature\": \"88087dc1779e9cda55d3dd429aeb3c40\", \"timestamp\": 1776060942604}','支付超时');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '鏉冮檺鍚嶇О锛堝锛歱roduct:create, product:read, product:update, product:delete锛?,
  `displayName` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '鏉冮檺鏄剧ず鍚嶇О锛堝锛氬垱寤哄晢鍝併€佹煡鐪嬪晢鍝併€佷慨鏀瑰晢鍝併€佸垹闄ゅ晢鍝侊級',
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '鏉冮檺鎻忚堪',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `name_2` (`name`),
  UNIQUE KEY `name_3` (`name`),
  UNIQUE KEY `name_4` (`name`),
  UNIQUE KEY `name_5` (`name`),
  UNIQUE KEY `name_6` (`name`),
  UNIQUE KEY `name_7` (`name`),
  UNIQUE KEY `name_8` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='鏉冮檺琛?;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_categories`
--

DROP TABLE IF EXISTS `product_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `key` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `label` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `level` int NOT NULL DEFAULT '1' COMMENT '鍒嗙被灞傜骇锛?/2/3锛?,
  `parentKey` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sortOrder` int DEFAULT '0' COMMENT '鎺掑簭椤哄簭',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'active' COMMENT '鐘舵€?,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`),
  KEY `product_categories_level` (`level`),
  KEY `product_categories_parent_key` (`parentKey`),
  KEY `product_categories_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_categories`
--

LOCK TABLES `product_categories` WRITE;
/*!40000 ALTER TABLE `product_categories` DISABLE KEYS */;
INSERT INTO `product_categories` VALUES (11,'medicinal','药用菌','具有药用价值的菌菇',1,NULL,0,'active','2026-04-12 07:20:38','2026-04-12 07:20:38'),(12,'ganoderma','灵芝类','灵芝相关产品',2,'medicinal',0,'active','2026-04-12 07:20:38','2026-04-12 07:20:38'),(13,'cordyceps','冬虫夏草','冬虫夏草相关产品',2,'medicinal',0,'active','2026-04-12 07:20:38','2026-04-12 07:20:38'),(14,'antler','鹿茸菇','鹿茸菇相关产品',2,'medicinal',0,'active','2026-04-12 07:20:38','2026-04-12 07:20:38'),(15,'poria','茯苓类','茯苓相关产品',2,'medicinal',0,'active','2026-04-12 07:20:38','2026-04-12 07:20:38'),(16,'otherMedicinal','其他药用菌','其他药用菌菇',2,'medicinal',0,'active','2026-04-12 07:20:38','2026-04-12 07:20:38'),(17,'wild','野生菌','野生采摘的珍稀菌菇',1,NULL,0,'active','2026-04-12 07:20:38','2026-04-12 07:20:38'),(18,'matsutake','松茸类','松茸相关产品',2,'wild',0,'active','2026-04-12 07:20:38','2026-04-12 07:20:38'),(19,'bolete','牛肝菌类','牛肝菌相关产品',2,'wild',0,'active','2026-04-12 07:20:38','2026-04-12 07:20:38'),(20,'morel','羊肚菌类','羊肚菌相关产品',2,'wild',0,'active','2026-04-12 07:20:38','2026-04-12 07:20:38'),(21,'chanterelle','鸡油菌类','鸡油菌相关产品',2,'wild',0,'active','2026-04-12 07:20:38','2026-04-12 07:20:38'),(22,'truffle','松露类','松露相关产品',2,'wild',0,'active','2026-04-12 07:20:38','2026-04-12 07:20:38'),(23,'otherWild','其他野生菌','其他野生菌菇',2,'wild',0,'active','2026-04-12 07:20:38','2026-04-12 07:20:38'),(24,'mushroomBag','菌包','家庭种植菌包',1,NULL,0,'active','2026-04-12 07:20:38','2026-04-12 07:20:38'),(25,'shiitakeBag','香菇菌包','香菇种植菌包',2,'mushroomBag',0,'active','2026-04-12 07:20:38','2026-04-12 07:20:38'),(26,'oysterBag','平菇菌包','平菇种植菌包',2,'mushroomBag',0,'active','2026-04-12 07:20:38','2026-04-12 07:20:38'),(27,'enokiBag','金针菇菌包','金针菇种植菌包',2,'mushroomBag',0,'active','2026-04-12 07:20:38','2026-04-12 07:20:38'),(28,'woodEarBag','木耳菌包','木耳种植菌包',2,'mushroomBag',0,'active','2026-04-12 07:20:38','2026-04-12 07:20:38'),(29,'kingOysterBag','杏鲍菇菌包','杏鲍菇种植菌包',2,'mushroomBag',0,'active','2026-04-12 07:20:38','2026-04-12 07:20:38'),(30,'funBag','趣味菌包','趣味种植套装',2,'mushroomBag',0,'active','2026-04-12 07:20:38','2026-04-12 07:20:38'),(32,'spawn','菌种','菌种种苗',1,NULL,0,'active','2026-04-12 07:20:38','2026-04-12 07:20:38'),(33,'shiitakeSpawn','香菇菌种','香菇菌种',2,'spawn',0,'active','2026-04-12 07:20:38','2026-04-12 07:20:38'),(34,'oysterSpawn','平菇菌种','平菇菌种',2,'spawn',0,'active','2026-04-12 07:20:38','2026-04-12 07:20:38'),(35,'enokiSpawn','金针菇菌种','金针菇菌种',2,'spawn',0,'active','2026-04-12 07:20:38','2026-04-12 07:20:38'),(36,'woodEarSpawn','木耳菌种','木耳菌种',2,'spawn',0,'active','2026-04-12 07:20:38','2026-04-12 07:20:38'),(37,'otherSpawn','其他菌种','其他珍稀菌种',2,'spawn',0,'active','2026-04-12 07:20:38','2026-04-12 07:20:38'),(43,'other','菌菇（兜底）','特殊/定制商品',1,NULL,0,'active','2026-04-12 07:20:38','2026-04-12 07:20:38'),(44,'custom','定制商品','客户定制商品',2,'other',0,'active','2026-04-12 07:20:38','2026-04-12 07:20:38'),(45,'processed','加工食品','菌菇深加工产品',2,'other',0,'active','2026-04-12 07:20:39','2026-04-12 07:20:39'),(46,'misc','其他','无法归入其他分类的商品',2,'other',0,'active','2026-04-12 07:20:39','2026-04-12 07:20:39'),(48,'test123','测试分类','测试',1,NULL,0,'active','2026-04-12 07:30:08','2026-04-12 07:30:08'),(96,'sgqsefglq-mnwz2t3c','通过后','',2,'test123',0,'active','2026-04-13 09:10:39','2026-04-13 09:10:39'),(97,'ho9ho9ho9-mnwz2xpu','她她她','',3,'sgqsefglq-mnwz2t3c',0,'active','2026-04-13 09:10:45','2026-04-13 09:10:45'),(98,'shilingmanghe-mny6viez','时令盲盒','按季节分类的盲盒商品',1,NULL,99,'active','2026-04-14 05:36:41','2026-04-14 05:36:41'),(99,'chunjimanghe-mny6vifb','春季盲盒','春季限定盲盒商品',2,'shilingmanghe-mny6viez',1,'active','2026-04-14 05:36:41','2026-04-14 05:36:41'),(100,'xiajimanghe-mny6vifh','夏季盲盒','夏季限定盲盒商品',2,'shilingmanghe-mny6viez',2,'active','2026-04-14 05:36:41','2026-04-14 05:36:41'),(101,'qiujimanghe-mny6vifl','秋季盲盒','秋季限定盲盒商品',2,'shilingmanghe-mny6viez',3,'active','2026-04-14 05:36:41','2026-04-14 05:36:41'),(102,'dongjimanghe-mny6vifq','冬季盲盒','冬季限定盲盒商品',2,'shilingmanghe-mny6viez',4,'active','2026-04-14 05:36:41','2026-04-14 05:36:41');
/*!40000 ALTER TABLE `product_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '閸熷棗鎼D',
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '鍟嗗搧鍚嶇О',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '鍟嗗搧鎻忚堪',
  `price` decimal(10,2) NOT NULL COMMENT '鍟嗗搧浠锋牸',
  `stock` int NOT NULL DEFAULT '0' COMMENT '搴撳瓨鏁伴噺',
  `category` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '鍟嗗搧鍒嗙被',
  `images` json DEFAULT NULL COMMENT '鍟嗗搧鍥剧墖',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT '鍟嗗搧鐘舵€侊細pending-寰呭鏍?| approved-宸插鏍?| rejected-宸叉嫆缁?,
  `viewCount` int NOT NULL DEFAULT '0' COMMENT '娴忚娆℃暟',
  `sellerId` int NOT NULL COMMENT '鍗栧ID',
  `rejectReason` text COLLATE utf8mb4_unicode_ci COMMENT '鎷掔粷鍘熷洜鏂囨湰',
  `rejectType` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '鎷掔粷绫诲瀷锛氬鍐呭杩濊銆佷环鏍煎紓甯搞€佸浘鐗囪繚瑙勭瓑',
  `rejectRule` text COLLATE utf8mb4_unicode_ci COMMENT '鐩稿叧瑙勫垯渚濇嵁',
  `rejectedAt` datetime DEFAULT NULL COMMENT '鎷掔粷鏃堕棿',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `isHot` tinyint(1) NOT NULL DEFAULT '0' COMMENT '鏄惁鐑棬鍟嗗搧',
  `subCategory` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' COMMENT '浜岀骇鍒嗙被',
  `subSubCategory` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '涓夌骇鍒嗙被',
  PRIMARY KEY (`id`),
  KEY `sellerId` (`sellerId`),
  KEY `category` (`category`),
  KEY `status` (`status`),
  KEY `idx_isHot` (`isHot`),
  KEY `products_seller_id` (`sellerId`),
  KEY `products_category` (`category`),
  KEY `products_status` (`status`),
  KEY `products_price` (`price`),
  KEY `products_view_count` (`viewCount`),
  KEY `products_created_at` (`createdAt`),
  KEY `products_is_hot` (`isHot`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`sellerId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=75 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='閸熷棗鎼х悰';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (5,'灌灌灌灌','嘎嘎嘎嘎嘎嘎嘎嘎嘎嘎嘎嘎嘎嘎',0.01,16,'菌包','[\"/uploads/1769270194934-???????????????è?????????????? (2).png\"]','rejected',12,2,NULL,NULL,NULL,NULL,'2026-01-24 15:57:03','2026-01-25 07:03:27',0,'',NULL),(11,'ddddddddd','ddddddddddd',0.01,4,'食用菌','[\"/uploads/1769331171737-???????????????è?????????????? (2).png\"]','rejected',0,3,NULL,NULL,NULL,NULL,'2026-01-25 08:52:52','2026-01-25 08:53:17',0,'',NULL),(14,'嗡嗡嗡嗡嗡嗡嗡嗡嗡嗡嗡嗡嗡嗡嗡嗡嗡嗡我','少时诵诗书水水水水水水水水',0.01,4,'药用菌','[\"/uploads/1769333969096-???????????????è?????????????? (5).png\"]','rejected',0,3,'水水水水','price','杀杀杀','2026-01-25 09:39:45','2026-01-25 09:39:30','2026-01-25 09:39:45',0,'',NULL),(16,'靠靠靠靠靠靠靠靠靠靠靠靠靠靠靠靠靠靠靠','酷酷酷酷酷酷酷酷酷酷酷酷酷酷酷酷酷酷',0.01,5,'野生菌','[\"/uploads/1769336512856-???????????????è?????????????? (2).png\"]','rejected',0,3,'就将计就计','quality','斤斤计较经济界','2026-01-25 10:22:14','2026-01-25 10:21:53','2026-01-25 10:22:14',0,'',NULL),(31,'平菇','平菇是一种广泛栽培的食用菌，味道鲜美，营养丰富。',16.00,85,'菌菇','[\"/uploads/upload-1771652237701-654685118.jpg\"]','approved',17,3,NULL,NULL,NULL,NULL,'2026-02-05 16:45:59','2026-04-13 06:15:42',0,'',NULL),(33,'金针菇','金针菇口感脆嫩，富含多种氨基酸和维生素。',13.00,98,'菌菇','[\"/uploads/upload-1771652265102-229560094.jpg\"]','approved',6,3,NULL,NULL,NULL,NULL,'2026-02-05 16:45:59','2026-04-11 08:19:28',0,'',NULL),(34,'猴头菇','猴头菇是一种珍贵的食用菌，具有很高的营养价值和药用价值。',30.00,97,'菌菇','[\"/uploads/upload-1771652207680-244808221.jpg\"]','approved',14,3,NULL,NULL,NULL,NULL,'2026-02-05 16:45:59','2026-04-11 01:59:19',0,'',NULL),(35,'sssssssz','aaaaaaaaaaaaaaaaa',0.01,7,'食用菌','[\"/uploads/?±?????????? 2025-05-21 194643-1770565747519-947619695.png\"]','pending',0,2,NULL,NULL,NULL,NULL,'2026-02-08 15:49:46','2026-02-08 15:49:46',0,'',NULL),(36,'666666s','ssssssssss',0.01,6,'菌包','[\"/uploads/???????????????è?????????????? (2) (1)-1770565925736-883086986.png\"]','pending',0,2,NULL,NULL,NULL,NULL,'2026-02-08 15:52:07','2026-02-08 15:52:07',0,'',NULL),(37,'xxxxx','xxxxxxxxxxxxxxxx',0.01,1,'食用菌','[\"/uploads/???????????????è?????????????? (2)-1770568058066-643298763.png\"]','pending',0,2,NULL,NULL,NULL,NULL,'2026-02-08 16:27:39','2026-02-08 16:27:39',0,'',NULL),(38,'aa','aaaaaaaaaaaaaaa',0.01,1,'菌包','[\"/uploads/???????????????è?????????????? (1)-1770568100858-360659775.png\"]','pending',0,2,NULL,NULL,NULL,NULL,'2026-02-08 16:28:26','2026-02-08 16:28:26',0,'',NULL),(39,'sssssq','aaaaaaaaaaaaaaaa',0.01,1,'食用菌','[\"/uploads/???????????????è?????????????? (2) (1)-1770568664779-117737282.png\"]','pending',0,2,NULL,NULL,NULL,NULL,'2026-02-08 16:37:46','2026-02-08 16:37:46',0,'',NULL),(40,'3333333','33333333333',0.01,30,'菌包','[\"/uploads/???????????????è?????????????? (5)-1770569740120-456583406.png\"]','pending',1,2,NULL,NULL,NULL,NULL,'2026-02-08 16:55:41','2026-02-21 13:24:21',0,'',NULL),(41,'111111111','111111111111111',0.01,1,'食用菌','[\"/uploads/???????????????è?????????????? (2)-1770570042620-30883244.png\"]','rejected',0,2,NULL,NULL,NULL,'2026-02-21 13:16:51','2026-02-08 17:00:43','2026-02-21 13:16:51',0,'',NULL),(47,'1111111111111111','11111111111111111111',0.01,4,'菌包','[\"/uploads/???????????????è?????????????? (2) (1)-1770637793664-940963499.png\"]','rejected',1,3,'水水水水水水水水','content','杀杀杀杀杀杀杀杀杀','2026-02-09 13:35:47','2026-02-09 11:49:54','2026-04-04 01:56:40',0,'',NULL),(52,'香菇','香菇是一种常见的食用真菌，具有浓郁的香气和丰富的营养价值。',29.91,99,'菌菇','[\"/uploads/upload-1771667893684-748051072.webp\"]','approved',9,2,NULL,NULL,NULL,NULL,'2026-02-21 08:02:39','2026-04-13 04:41:43',0,'',NULL),(53,'杏鲍菇','杏鲍菇具有杏仁香味和鲍鱼口感，是一种高档食用菌。',29.91,89,'菌菇','[\"/uploads/upload-1771667923500-262170868.webp\"]','approved',11,2,NULL,NULL,NULL,NULL,'2026-02-21 08:02:39','2026-04-13 04:36:28',1,'',NULL),(66,'343','333333333333333333333333333',0.01,1,'test123','[\"/uploads/upload-1776072171071-302916304.png\"]','approved',0,2,NULL,NULL,NULL,NULL,'2026-04-13 09:22:52','2026-04-13 09:23:06',1,'sgqsefglq-mnwz2t3c','ho9ho9ho9-mnwz2xpu'),(67,'春季踏青盲盒','春季限定盲盒，包含新鲜春菇、春笋等时令菌菇，适合踏青野餐',88.00,50,'时令盲盒','[]','approved',0,2,NULL,NULL,NULL,NULL,'2026-04-14 05:38:49','2026-04-14 05:38:49',1,'春季盲盒',NULL),(68,'春季清明菌菇礼盒','清明节限定，精选春季新鲜菌菇组合',128.00,30,'时令盲盒','[]','approved',0,2,NULL,NULL,NULL,NULL,'2026-04-14 05:38:49','2026-04-14 05:38:49',0,'春季盲盒',NULL),(69,'夏季清凉盲盒','夏季限定，清凉爽口的菌菇拼盘，消暑必备',68.00,80,'时令盲盒','[]','approved',0,2,NULL,NULL,NULL,NULL,'2026-04-14 05:38:49','2026-04-14 05:38:49',1,'夏季盲盒',NULL),(70,'夏季解暑菌汤盲盒','夏日解暑菌菇汤料包，清凉滋补',58.00,100,'时令盲盒','[]','approved',0,2,NULL,NULL,NULL,NULL,'2026-04-14 05:38:49','2026-04-14 05:38:49',0,'夏季盲盒',NULL),(71,'秋季丰收盲盒','秋季限定，丰收季节的珍稀野生菌组合',158.00,40,'时令盲盒','[]','approved',0,2,NULL,NULL,NULL,NULL,'2026-04-14 05:38:49','2026-04-14 05:38:49',1,'秋季盲盒',NULL),(72,'秋季进补礼盒','金秋进补首选，精选滋补菌菇组合',198.00,25,'时令盲盒','[]','approved',0,2,NULL,NULL,NULL,NULL,'2026-04-14 05:38:49','2026-04-14 05:38:49',0,'秋季盲盒',NULL),(73,'冬季暖身盲盒','冬季限定，暖心暖胃的菌菇火锅套餐',98.00,60,'时令盲盒','[]','approved',0,2,NULL,NULL,NULL,NULL,'2026-04-14 05:38:49','2026-04-14 05:38:49',1,'冬季盲盒',NULL),(74,'冬季节庆年货盲盒','年货精选，高端菌菇礼盒装',268.00,20,'时令盲盒','[]','approved',0,2,NULL,NULL,NULL,NULL,'2026-04-14 05:38:49','2026-04-14 05:38:49',0,'冬季盲盒',NULL);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rating_histories`
--

DROP TABLE IF EXISTS `rating_histories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rating_histories` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '鍘嗗彶ID',
  `workId` int NOT NULL COMMENT '浣滃搧ID',
  `createdAt` datetime DEFAULT NULL,
  `averageRating` float NOT NULL,
  `ratingCount` int NOT NULL DEFAULT '0',
  `period` enum('daily','weekly','monthly','quarterly') COLLATE utf8mb4_unicode_ci NOT NULL,
  `periodStart` datetime NOT NULL,
  `periodEnd` datetime NOT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `workId` (`workId`),
  KEY `rating_histories_work_id` (`workId`),
  KEY `rating_histories_period` (`period`),
  KEY `rating_histories_period_start` (`periodStart`),
  KEY `rating_histories_work_id_period_period_start` (`workId`,`period`,`periodStart`),
  CONSTRAINT `rating_histories_ibfk_1` FOREIGN KEY (`workId`) REFERENCES `works` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='璇勫垎鍘嗗彶琛?;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rating_histories`
--

LOCK TABLES `rating_histories` WRITE;
/*!40000 ALTER TABLE `rating_histories` DISABLE KEYS */;
INSERT INTO `rating_histories` VALUES (1,5,'2026-04-11 07:55:18',3.5,2,'daily','2026-04-10 16:00:00','2026-04-11 15:59:59','2026-04-11 07:55:46'),(2,5,'2026-04-11 07:55:18',3.5,2,'weekly','2026-04-05 15:59:59','2026-04-11 15:59:59','2026-04-11 07:55:46'),(3,5,'2026-04-11 07:55:18',3.5,2,'monthly','2026-03-31 16:00:00','2026-04-29 16:00:00','2026-04-11 07:55:46'),(4,5,'2026-04-11 07:55:18',3.5,2,'quarterly','2026-03-31 16:00:00','2026-06-29 16:00:00','2026-04-11 07:55:46');
/*!40000 ALTER TABLE `rating_histories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rating_weights`
--

DROP TABLE IF EXISTS `rating_weights`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rating_weights` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '鏉冮噸ID',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `roleType` enum('user','vip','judge') COLLATE utf8mb4_unicode_ci NOT NULL,
  `weight` float NOT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `roleType` (`roleType`),
  UNIQUE KEY `roleType_2` (`roleType`),
  UNIQUE KEY `roleType_3` (`roleType`),
  UNIQUE KEY `roleType_4` (`roleType`),
  UNIQUE KEY `roleType_5` (`roleType`),
  UNIQUE KEY `roleType_6` (`roleType`),
  UNIQUE KEY `roleType_7` (`roleType`),
  UNIQUE KEY `roleType_8` (`roleType`),
  UNIQUE KEY `roleType_9` (`roleType`),
  KEY `rating_weights_role_type` (`roleType`),
  KEY `rating_weights_is_active` (`isActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='璇勫垎鏉冮噸琛?;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rating_weights`
--

LOCK TABLES `rating_weights` WRITE;
/*!40000 ALTER TABLE `rating_weights` DISABLE KEYS */;
/*!40000 ALTER TABLE `rating_weights` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recipe_ingredients`
--

DROP TABLE IF EXISTS `recipe_ingredients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recipe_ingredients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `recipeId` int NOT NULL COMMENT '椋熻氨ID',
  `mushroomId` int DEFAULT NULL COMMENT '鑿岃弴ID锛堝彲涓虹┖锛?,
  `ingredientName` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '閰嶆枡鍚嶇О',
  `quantity` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '鏁伴噺',
  `unit` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '鍗曚綅',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `recipeId` (`recipeId`),
  CONSTRAINT `recipe_ingredients_ibfk_1` FOREIGN KEY (`recipeId`) REFERENCES `recipes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=238 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recipe_ingredients`
--

LOCK TABLES `recipe_ingredients` WRITE;
/*!40000 ALTER TABLE `recipe_ingredients` DISABLE KEYS */;
INSERT INTO `recipe_ingredients` VALUES (166,69,NULL,'口蘑','200','克','2026-02-21 10:02:23','2026-02-21 10:02:23'),(167,69,NULL,'洋葱','1','个','2026-02-21 10:02:23','2026-02-21 10:02:23'),(168,69,NULL,'黄油','30','克','2026-02-21 10:02:23','2026-02-21 10:02:23'),(169,69,NULL,'面粉','2','勺','2026-02-21 10:02:23','2026-02-21 10:02:23'),(170,69,NULL,'淡奶油','200','毫升','2026-02-21 10:02:23','2026-02-21 10:02:23'),(171,69,NULL,'鸡汤','500','毫升','2026-02-21 10:02:23','2026-02-21 10:02:23'),(172,69,NULL,'盐','1','克','2026-02-21 10:02:23','2026-02-21 10:02:23'),(173,69,NULL,'黑胡椒','1','克','2026-02-21 10:02:23','2026-02-21 10:02:23'),(174,68,NULL,'香菇','10','朵','2026-02-21 10:04:24','2026-02-21 10:04:24'),(175,68,NULL,'鸡胸肉','300','克','2026-02-21 10:04:24','2026-02-21 10:04:24'),(176,68,NULL,'生姜','3','片','2026-02-21 10:04:24','2026-02-21 10:04:24'),(177,68,NULL,'大蒜','3','瓣','2026-02-21 10:04:24','2026-02-21 10:04:24'),(178,68,NULL,'生抽','2','勺','2026-02-21 10:04:24','2026-02-21 10:04:24'),(179,68,NULL,'料酒','1','勺','2026-02-21 10:04:24','2026-02-21 10:04:24'),(180,68,NULL,'淀粉','1','勺','2026-02-21 10:04:24','2026-02-21 10:04:24'),(181,68,NULL,'盐','1','克','2026-02-21 10:04:24','2026-02-21 10:04:24'),(182,70,NULL,'金针菇','150','克','2026-02-21 10:05:03','2026-02-21 10:05:03'),(183,70,NULL,'肥牛片','200','克','2026-02-21 10:05:03','2026-02-21 10:05:03'),(184,70,NULL,'生抽','2','勺','2026-02-21 10:05:03','2026-02-21 10:05:03'),(185,70,NULL,'料酒','1','勺','2026-02-21 10:05:03','2026-02-21 10:05:03'),(186,70,NULL,'白糖','1','勺','2026-02-21 10:05:03','2026-02-21 10:05:03'),(187,70,NULL,'蚝油','1','勺','2026-02-21 10:05:03','2026-02-21 10:05:03'),(188,70,NULL,'白芝麻','1','克','2026-02-21 10:05:03','2026-02-21 10:05:03'),(189,71,NULL,'杏鲍菇','2','个','2026-02-21 10:06:01','2026-02-21 10:06:01'),(190,71,NULL,'牛肉','250','克','2026-02-21 10:06:01','2026-02-21 10:06:01'),(191,71,NULL,'青椒','1','个','2026-02-21 10:06:01','2026-02-21 10:06:01'),(192,71,NULL,'红椒','1','个','2026-02-21 10:06:01','2026-02-21 10:06:01'),(193,71,NULL,'生姜','3','片','2026-02-21 10:06:01','2026-02-21 10:06:01'),(194,71,NULL,'大蒜','3','瓣','2026-02-21 10:06:01','2026-02-21 10:06:01'),(195,71,NULL,'生抽','2','勺','2026-02-21 10:06:01','2026-02-21 10:06:01'),(196,71,NULL,'淀粉','1','勺','2026-02-21 10:06:01','2026-02-21 10:06:01'),(197,71,NULL,'料酒','1','勺','2026-02-21 10:06:01','2026-02-21 10:06:01'),(198,72,NULL,'平菇','200','克','2026-02-21 10:07:46','2026-02-21 10:07:46'),(199,72,NULL,'青菜','300','克','2026-02-21 10:07:46','2026-02-21 10:07:46'),(200,72,NULL,'大蒜','3','瓣','2026-02-21 10:07:46','2026-02-21 10:07:46'),(201,72,NULL,'盐','1','克','2026-02-21 10:07:46','2026-02-21 10:07:46'),(202,72,NULL,'生抽','1','勺','2026-02-21 10:07:46','2026-02-21 10:07:46'),(203,73,NULL,'松茸','4','个','2026-02-21 10:08:29','2026-02-21 10:08:29'),(204,73,NULL,'黄油','20','克','2026-02-21 10:08:29','2026-02-21 10:08:29'),(205,73,NULL,'盐','1','克','2026-02-21 10:08:29','2026-02-21 10:08:29'),(206,73,NULL,'黑胡椒','1','克','2026-02-21 10:08:29','2026-02-21 10:08:29'),(207,73,NULL,'柠檬','1','瓣','2026-02-21 10:08:29','2026-02-21 10:08:29'),(215,74,NULL,'茶树菇','100','克','2026-02-21 10:15:32','2026-02-21 10:15:32'),(216,74,NULL,'老鸭','1','只','2026-02-21 10:15:32','2026-02-21 10:15:32'),(217,74,NULL,'生姜','5','片','2026-02-21 10:15:32','2026-02-21 10:15:32'),(218,74,NULL,'大葱','2','段','2026-02-21 10:15:32','2026-02-21 10:15:32'),(219,74,NULL,'料酒','3','勺','2026-02-21 10:15:32','2026-02-21 10:15:32'),(220,74,NULL,'盐','1','克','2026-02-21 10:15:32','2026-02-21 10:15:32'),(221,74,NULL,'枸杞','20','粒','2026-02-21 10:15:32','2026-02-21 10:15:32'),(230,75,NULL,'木耳','50','克','2026-02-21 10:16:30','2026-02-21 10:16:30'),(231,75,NULL,'黄瓜','2','根','2026-02-21 10:16:30','2026-02-21 10:16:30'),(232,75,NULL,'大蒜','4','瓣','2026-02-21 10:16:30','2026-02-21 10:16:30'),(233,75,NULL,'小米辣','3','个','2026-02-21 10:16:30','2026-02-21 10:16:30'),(234,75,NULL,'生抽','2','勺','2026-02-21 10:16:30','2026-02-21 10:16:30'),(235,75,NULL,'醋','2','勺','2026-02-21 10:16:30','2026-02-21 10:16:30'),(236,75,NULL,'香油','1','勺','2026-02-21 10:16:30','2026-02-21 10:16:30'),(237,75,NULL,'白糖','1','勺','2026-02-21 10:16:30','2026-02-21 10:16:30');
/*!40000 ALTER TABLE `recipe_ingredients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recipe_mushrooms`
--

DROP TABLE IF EXISTS `recipe_mushrooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recipe_mushrooms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `recipeId` int NOT NULL COMMENT '椋熻氨ID',
  `mushroomTypeId` int NOT NULL COMMENT '鑿岃弴绫诲瀷ID',
  `quantity` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '鎵€闇€鑿岃弴鏁伴噺锛氬100g銆?鏈电瓑',
  `isMainIngredient` tinyint(1) NOT NULL DEFAULT '0' COMMENT '鏄惁涓轰富椋熸潗',
  PRIMARY KEY (`id`),
  UNIQUE KEY `recipe_mushrooms_recipe_id_mushroom_type_id` (`recipeId`,`mushroomTypeId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='椋熻氨-鑿岃弴鍏宠仈琛紙璁板綍椋熻氨鎵€闇€鐨勮弻鑿囩被鍨嬪拰鏁伴噺锛?;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recipe_mushrooms`
--

LOCK TABLES `recipe_mushrooms` WRITE;
/*!40000 ALTER TABLE `recipe_mushrooms` DISABLE KEYS */;
/*!40000 ALTER TABLE `recipe_mushrooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recipe_steps`
--

DROP TABLE IF EXISTS `recipe_steps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recipe_steps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `recipeId` int NOT NULL COMMENT '椋熻氨ID',
  `stepNumber` int NOT NULL COMMENT '姝ラ搴忓彿',
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '姝ラ鎻忚堪',
  `videoUrl` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '姝ラ瑙嗛URL锛堝彲閫夛級',
  `imageUrl` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '姝ラ鍥剧墖URL锛堝彲閫夛級',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `recipeId` (`recipeId`),
  CONSTRAINT `recipe_steps_ibfk_1` FOREIGN KEY (`recipeId`) REFERENCES `recipes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=284 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recipe_steps`
--

LOCK TABLES `recipe_steps` WRITE;
/*!40000 ALTER TABLE `recipe_steps` DISABLE KEYS */;
INSERT INTO `recipe_steps` VALUES (203,69,1,'口蘑洗净切片，洋葱切碎备用',NULL,NULL,'2026-02-21 10:02:23','2026-02-21 10:02:23'),(204,69,2,'锅中小火融化黄油，放入洋葱碎炒至透明',NULL,NULL,'2026-02-21 10:02:23','2026-02-21 10:02:23'),(205,69,3,'加入口蘑片，中火翻炒至口蘑出水变软',NULL,NULL,'2026-02-21 10:02:23','2026-02-21 10:02:23'),(206,69,4,'筛入面粉，快速翻炒均匀，炒出香味',NULL,NULL,'2026-02-21 10:02:23','2026-02-21 10:02:23'),(207,69,5,'慢慢倒入鸡汤，边倒边搅拌，避免结块',NULL,NULL,'2026-02-21 10:02:23','2026-02-21 10:02:23'),(208,69,6,'大火煮沸后转小火，煮10分钟让汤浓稠',NULL,NULL,'2026-02-21 10:02:23','2026-02-21 10:02:23'),(209,69,7,'倒入淡奶油，搅拌均匀，加盐和黑胡椒调味',NULL,NULL,'2026-02-21 10:02:23','2026-02-21 10:02:23'),(210,69,8,'关火，汤可以用搅拌机打至更顺滑（可选），即可享用',NULL,NULL,'2026-02-21 10:02:23','2026-02-21 10:02:23'),(211,68,1,'鸡胸肉洗净切成薄片，加入1勺生抽、1勺料酒、1勺淀粉抓匀，腌制15分钟',NULL,NULL,'2026-02-21 10:04:24','2026-02-21 10:04:24'),(212,68,2,'香菇去蒂洗净，切成薄片备用；生姜切丝，大蒜切末',NULL,NULL,'2026-02-21 10:04:24','2026-02-21 10:04:24'),(213,68,3,'热锅倒入适量油，放入姜丝和蒜末爆香',NULL,NULL,'2026-02-21 10:04:24','2026-02-21 10:04:24'),(214,68,4,'放入腌制好的鸡肉片，快速翻炒至变色',NULL,NULL,'2026-02-21 10:04:24','2026-02-21 10:04:24'),(215,68,5,'加入香菇片继续翻炒2-3分钟，让香菇出香味',NULL,NULL,'2026-02-21 10:04:24','2026-02-21 10:04:24'),(216,68,6,'加入剩余的1勺生抽和适量盐调味，翻炒均匀',NULL,NULL,'2026-02-21 10:04:24','2026-02-21 10:04:24'),(217,68,7,'转小火收汁1分钟，即可出锅装盘',NULL,NULL,'2026-02-21 10:04:24','2026-02-21 10:04:24'),(218,70,1,'金针菇去蒂洗净，分成小撮备用',NULL,NULL,'2026-02-21 10:05:03','2026-02-21 10:05:03'),(219,70,2,'取一片肥牛，放上一小撮金针菇，从一头卷起',NULL,NULL,'2026-02-21 10:05:03','2026-02-21 10:05:03'),(220,70,3,'依次卷好所有的肥牛卷',NULL,NULL,'2026-02-21 10:05:03','2026-02-21 10:05:03'),(221,70,4,'调制酱汁：生抽2勺、料酒1勺、白糖1勺、蚝油1勺混合均匀',NULL,NULL,'2026-02-21 10:05:03','2026-02-21 10:05:03'),(222,70,5,'平底锅刷少许油，放入肥牛卷，中小火煎至两面金黄',NULL,NULL,'2026-02-21 10:05:03','2026-02-21 10:05:03'),(223,70,6,'倒入调好的酱汁，中小火煮2分钟让肥牛入味',NULL,NULL,'2026-02-21 10:05:03','2026-02-21 10:05:03'),(224,70,7,'大火收汁，撒上白芝麻点缀，即可出锅',NULL,NULL,'2026-02-21 10:05:03','2026-02-21 10:05:03'),(225,71,1,'牛肉洗净切片，加1勺生抽、1勺料酒、1勺淀粉抓匀腌制15分钟',NULL,NULL,'2026-02-21 10:06:01','2026-02-21 10:06:01'),(226,71,2,'杏鲍菇洗净切片，青椒和红椒洗净去籽切小块',NULL,NULL,'2026-02-21 10:06:01','2026-02-21 10:06:01'),(227,71,3,'生姜切丝，大蒜切末备用',NULL,NULL,'2026-02-21 10:06:01','2026-02-21 10:06:01'),(228,71,4,'热锅多倒些油，油温六成热放入牛肉片滑炒至变色盛出',NULL,NULL,'2026-02-21 10:06:01','2026-02-21 10:06:01'),(229,71,5,'锅中留底油，放入姜丝和蒜末爆香',NULL,NULL,'2026-02-21 10:06:01','2026-02-21 10:06:01'),(230,71,6,'放入杏鲍菇片，中火炒至变软出水',NULL,NULL,'2026-02-21 10:06:01','2026-02-21 10:06:01'),(231,71,7,'加入青椒和红椒块，翻炒1分钟',NULL,NULL,'2026-02-21 10:06:01','2026-02-21 10:06:01'),(232,71,8,'倒入滑好的牛肉片，加入剩余1勺生抽调味',NULL,NULL,'2026-02-21 10:06:01','2026-02-21 10:06:01'),(233,71,9,'大火快速翻炒均匀，即可出锅',NULL,NULL,'2026-02-21 10:06:01','2026-02-21 10:06:01'),(234,72,1,'平菇去蒂洗净，撕成小朵，沥干水分备用',NULL,NULL,'2026-02-21 10:07:46','2026-02-21 10:07:46'),(235,72,2,'青菜洗净，切成段备用；大蒜切末',NULL,NULL,'2026-02-21 10:07:46','2026-02-21 10:07:46'),(236,72,3,'热锅倒入油，放入蒜末爆香',NULL,NULL,'2026-02-21 10:07:46','2026-02-21 10:07:46'),(237,72,4,'放入平菇，大火翻炒2-3分钟至出水变软',NULL,NULL,'2026-02-21 10:07:46','2026-02-21 10:07:46'),(238,72,5,'加入青菜段，继续大火翻炒1-2分钟至青菜断生',NULL,NULL,'2026-02-21 10:07:46','2026-02-21 10:07:46'),(239,72,6,'加入适量盐和1勺生抽调味',NULL,NULL,'2026-02-21 10:07:46','2026-02-21 10:07:46'),(240,72,7,'翻炒均匀后立即出锅，保持青菜脆嫩',NULL,NULL,'2026-02-21 10:07:46','2026-02-21 10:07:46'),(241,73,1,'松茸用干净的布轻轻擦去表面泥土（不要用水洗）',NULL,NULL,'2026-02-21 10:08:29','2026-02-21 10:08:29'),(242,73,2,'松茸切成3-5毫米厚的片',NULL,NULL,'2026-02-21 10:08:29','2026-02-21 10:08:29'),(243,73,3,'烤盘铺上锡纸，刷上一层融化的黄油',NULL,NULL,'2026-02-21 10:08:29','2026-02-21 10:08:29'),(244,73,4,'将松茸片均匀摆放在烤盘上',NULL,NULL,'2026-02-21 10:08:29','2026-02-21 10:08:29'),(245,73,5,'在松茸片上再刷上一层黄油，撒少许盐和黑胡椒',NULL,NULL,'2026-02-21 10:08:29','2026-02-21 10:08:29'),(246,73,6,'烤箱预热200℃，放入松茸烤8-10分钟',NULL,NULL,'2026-02-21 10:08:29','2026-02-21 10:08:29'),(247,73,7,'取出后挤上几滴柠檬汁，趁热享用',NULL,NULL,'2026-02-21 10:08:29','2026-02-21 10:08:29'),(257,74,1,'茶树菇提前用温水泡发30分钟，去蒂洗净',NULL,NULL,'2026-02-21 10:15:32','2026-02-21 10:15:32'),(258,74,2,'老鸭处理干净，剁成大块，冷水下锅焯水去血沫',NULL,NULL,'2026-02-21 10:15:32','2026-02-21 10:15:32'),(259,74,3,'焯水后捞出鸭子，用温水冲洗干净',NULL,NULL,'2026-02-21 10:15:32','2026-02-21 10:15:32'),(260,74,4,'砂锅加入足够的清水，放入鸭块、姜片、葱段',NULL,NULL,'2026-02-21 10:15:32','2026-02-21 10:15:32'),(261,74,5,'加入3勺料酒，大火煮沸后撇去浮沫',NULL,NULL,'2026-02-21 10:15:32','2026-02-21 10:15:32'),(262,74,6,'转小火，盖上盖子慢炖1.5小时',NULL,NULL,'2026-02-21 10:15:32','2026-02-21 10:15:32'),(263,74,7,'加入泡好的茶树菇，继续小火炖30分钟',NULL,NULL,'2026-02-21 10:15:32','2026-02-21 10:15:32'),(264,74,8,'最后10分钟加入枸杞，加盐调味',NULL,NULL,'2026-02-21 10:15:32','2026-02-21 10:15:32'),(265,74,9,'关火，盛出享用鲜美的老鸭汤',NULL,NULL,'2026-02-21 10:15:32','2026-02-21 10:15:32'),(275,75,1,'木耳提前用冷水泡发1-2小时，泡发后去蒂洗净',NULL,NULL,'2026-02-21 10:16:30','2026-02-21 10:16:30'),(276,75,2,'锅中烧开水，放入木耳焯水2-3分钟，捞出过凉水',NULL,NULL,'2026-02-21 10:16:30','2026-02-21 10:16:30'),(277,75,3,'黄瓜洗净，用刀背轻轻拍裂，切成滚刀块',NULL,NULL,'2026-02-21 10:16:30','2026-02-21 10:16:30'),(278,75,4,'大蒜切末，小米辣切圈备用',NULL,NULL,'2026-02-21 10:16:30','2026-02-21 10:16:30'),(279,75,5,'木耳沥干水分，和黄瓜块一起放入大碗中',NULL,NULL,'2026-02-21 10:16:30','2026-02-21 10:16:30'),(280,75,6,'加入蒜末、小米辣圈',NULL,NULL,'2026-02-21 10:16:30','2026-02-21 10:16:30'),(281,75,7,'加入2勺生抽、2勺醋、1勺香油、1勺白糖',NULL,NULL,'2026-02-21 10:16:30','2026-02-21 10:16:30'),(282,75,8,'充分拌匀，腌制10分钟让其入味',NULL,NULL,'2026-02-21 10:16:30','2026-02-21 10:16:30'),(283,75,9,'装盘即可享用爽脆的凉拌菜',NULL,NULL,'2026-02-21 10:16:30','2026-02-21 10:16:30');
/*!40000 ALTER TABLE `recipe_steps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recipe_videos`
--

DROP TABLE IF EXISTS `recipe_videos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recipe_videos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `recipeId` int NOT NULL COMMENT '鍏宠仈椋熻氨ID',
  `title` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '瑙嗛鏍囬',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '瑙嗛鎻忚堪',
  `url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '瑙嗛閾炬帴',
  `thumbnail` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '瑙嗛缂╃暐鍥?,
  `duration` int NOT NULL COMMENT '瑙嗛鏃堕暱锛堢锛?,
  `videoType` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'recipe' COMMENT '瑙嗛绫诲瀷锛歳ecipe-瀹屾暣椋熻氨 | step-鍒嗘鎸囧',
  `stepIndex` int DEFAULT NULL COMMENT '濡傛灉鏄垎姝ヨ棰戯紝鏍囪瘑姝ラ绱㈠紩',
  `viewCount` int NOT NULL DEFAULT '0' COMMENT '瑙傜湅娆℃暟',
  `isActive` tinyint(1) NOT NULL DEFAULT '1' COMMENT '鏄惁涓哄綋鍓嶆椿鍔ㄨ棰?,
  `pushStatus` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT '鎺ㄩ€佺姸鎬侊細pending-寰呮帹閫?| pushed-宸叉帹閫?| failed-鎺ㄩ€佸け璐?,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `recipeId` (`recipeId`),
  CONSTRAINT `recipe_videos_ibfk_1` FOREIGN KEY (`recipeId`) REFERENCES `recipes` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='鐑归オ瑙嗛琛?;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recipe_videos`
--

LOCK TABLES `recipe_videos` WRITE;
/*!40000 ALTER TABLE `recipe_videos` DISABLE KEYS */;
/*!40000 ALTER TABLE `recipe_videos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recipes`
--

DROP TABLE IF EXISTS `recipes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recipes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '椋熻氨鎻忚堪',
  `videoUrl` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '鐑归オ瑙嗛URL',
  `cookTime` int NOT NULL COMMENT '鐑归オ鏃堕棿锛堝垎閽燂級',
  `difficulty` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '鐑归オ闅惧害锛坆eginner/intermediate/advanced锛?,
  `servings` int NOT NULL COMMENT '浠介噺',
  `rating` float NOT NULL DEFAULT '0' COMMENT '璇勫垎',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '椋熻氨鍚嶇О',
  `prepTime` int NOT NULL COMMENT '鍑嗗鏃堕棿锛堝垎閽燂級',
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '椋熻氨鍥剧墖',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active' COMMENT '鐘舵€侊紙active/inactive锛?,
  `nutritionalAnalysis` json DEFAULT NULL COMMENT '钀ュ吇鎴愬垎鍒嗘瀽',
  `suitableFor` json DEFAULT NULL COMMENT '閫傜敤浜虹兢',
  `flavorProfile` json DEFAULT NULL COMMENT '鍙ｅ懗鐗圭偣',
  `cuisineType` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '鑿滅郴绫诲瀷',
  `mealType` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '椁愮偣绫诲瀷',
  `mushroomCount` int NOT NULL DEFAULT '0' COMMENT '铇戣弴鏁伴噺',
  `popularity` float NOT NULL DEFAULT '0' COMMENT '娴佽搴?,
  `reviewCount` int NOT NULL DEFAULT '0' COMMENT '璇勮鏁伴噺',
  PRIMARY KEY (`id`),
  KEY `recipes_status` (`status`),
  KEY `recipes_rating` (`rating`),
  KEY `recipes_popularity` (`popularity`),
  KEY `recipes_difficulty` (`difficulty`),
  KEY `recipes_cuisine_type` (`cuisineType`),
  KEY `recipes_meal_type` (`mealType`),
  KEY `recipes_created_at` (`createdAt`)
) ENGINE=InnoDB AUTO_INCREMENT=78 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='椋熻氨琛?;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recipes`
--

LOCK TABLES `recipes` WRITE;
/*!40000 ALTER TABLE `recipes` DISABLE KEYS */;
INSERT INTO `recipes` VALUES (68,'经典粤菜，香菇的鲜香与鸡肉的嫩滑完美结合，是一道老少皆宜的家常菜。',NULL,11,'beginner',2,4.5,'2026-02-16 03:59:57','2026-02-21 10:04:24','香菇滑鸡',10,'/uploads/upload-1771668261110-873209853.jpg','active','{\"fat\": 0, \"carbs\": 0, \"fiber\": 0, \"sodium\": 0, \"protein\": 0, \"calories\": 0}',NULL,'\"savory\"','中式','晚餐',1,45,120),(69,'浓郁丝滑的西式经典汤品，蘑菇的鲜香与奶油的醇厚完美融合。',NULL,24,'intermediate',2,4.8,'2026-02-16 03:59:57','2026-02-21 10:02:14','奶油蘑菇汤',7,'/uploads/upload-1771668127078-292830760.jpg','active','{\"fat\": 0, \"carbs\": 0, \"fiber\": 0, \"sodium\": 0, \"protein\": 0, \"calories\": 0}',NULL,'\"savory\"','西式','午餐',1,52,180),(70,'日式料理经典，肥牛的鲜嫩与金针菇的脆爽完美搭配，一口一个超满足！',NULL,38,'beginner',2,4.7,'2026-02-16 03:59:57','2026-02-21 10:05:03','金针菇肥牛卷',6,'/uploads/upload-1771668299541-520506628.jpg','active','{\"fat\": 0, \"carbs\": 0, \"fiber\": 0, \"sodium\": 0, \"protein\": 0, \"calories\": 0}',NULL,'\"sweet\"','日式','晚餐',1,68,250),(71,'杏鲍菇的嚼劲与牛肉的嫩滑相得益彰，是一道营养丰富的下饭菜。',NULL,19,'intermediate',2,4.6,'2026-02-16 03:59:57','2026-02-21 10:06:01','杏鲍菇炒牛肉',11,'/uploads/upload-1771668350685-272412315.jpg','active','{\"fat\": 0, \"carbs\": 0, \"fiber\": 0, \"sodium\": 0, \"protein\": 0, \"calories\": 0}',NULL,'\"savory\"','中式','晚餐',1,48,150),(72,'清淡健康的家常菜，平菇的鲜香让简单的青菜也变得美味可口。',NULL,24,'beginner',2,4.3,'2026-02-16 03:59:57','2026-02-21 10:07:46','平菇炒青菜',9,'/uploads/upload-1771668456438-448192198.jpg','active','{\"fat\": 0, \"carbs\": 0, \"fiber\": 0, \"sodium\": 0, \"protein\": 0, \"calories\": 0}',NULL,'\"savory\"','中式','午餐',1,35,90),(73,'高端料理的代表，只需简单的调味就能激发出松茸最原始的鲜美。',NULL,14,'beginner',2,5,'2026-02-16 03:59:57','2026-02-21 10:08:29','烤松茸',12,'/uploads/upload-1771668503985-803763858.jpg','active','{\"fat\": 0, \"carbs\": 0, \"fiber\": 0, \"sodium\": 0, \"protein\": 0, \"calories\": 0}',NULL,'\"sweet\"','日式','晚餐',1,75,320),(74,'滋补养生的经典汤品，茶树菇的独特香气与鸭肉的鲜美完美融合。',NULL,24,'advanced',2,4.9,'2026-02-16 03:59:57','2026-02-21 10:15:32','茶树菇老鸭汤',7,'/uploads/upload-1771668930557-524232492.jpg','active','{\"fat\": 0, \"carbs\": 0, \"fiber\": 0, \"sodium\": 0, \"protein\": 0, \"calories\": 0}',NULL,'\"savory\"','中式','晚餐',1,58,200),(75,'清爽开胃的夏日凉菜，木耳的脆爽与黄瓜的清香，简单却美味。',NULL,36,'beginner',2,4.4,'2026-02-16 03:59:57','2026-02-21 10:16:30','木耳凉拌黄瓜',17,'/uploads/upload-1771668986313-343550356.jpg','active','{\"fat\": 0, \"carbs\": 0, \"fiber\": 0, \"sodium\": 0, \"protein\": 0, \"calories\": 0}',NULL,'\"savory\"','中式','点心',1,42,110);
/*!40000 ALTER TABLE `recipes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recommended_recipes`
--

DROP TABLE IF EXISTS `recommended_recipes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recommended_recipes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL COMMENT '鐢ㄦ埛ID',
  `recipeId` int NOT NULL COMMENT '椋熻氨ID',
  `recommendedAt` datetime NOT NULL COMMENT '鎺ㄨ崘鏃堕棿',
  `reason` json DEFAULT NULL COMMENT '鎺ㄨ崘鍘熷洜锛氬鍩轰簬鍙ｅ懗鍋忓ソ銆佹嫢鏈夌殑鑿岃弴绛?,
  `hasViewed` tinyint(1) NOT NULL DEFAULT '0' COMMENT '鐢ㄦ埛鏄惁宸叉煡鐪?,
  `viewedAt` datetime DEFAULT NULL COMMENT '鐢ㄦ埛鏌ョ湅鏃堕棿',
  `hasMade` tinyint(1) NOT NULL DEFAULT '0' COMMENT '鐢ㄦ埛鏄惁宸插皾璇曞埗浣?,
  `madeAt` datetime DEFAULT NULL COMMENT '鐢ㄦ埛鍒朵綔鏃堕棿',
  `rating` int DEFAULT NULL COMMENT '鐢ㄦ埛瀵规帹鑽愮殑璇勫垎锛?-5鍒?,
  `usedMushrooms` json DEFAULT NULL COMMENT '鐢ㄦ埛浣跨敤鐨勮弻鑿囧垪琛細鍩轰簬鍝簺鑿岃弴鎺ㄨ崘鐨?,
  `createdAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='鎺ㄨ崘璁板綍锛堝瓨鍌ㄧ郴缁熸帹鑽愬巻鍙诧級';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recommended_recipes`
--

LOCK TABLES `recommended_recipes` WRITE;
/*!40000 ALTER TABLE `recommended_recipes` DISABLE KEYS */;
/*!40000 ALTER TABLE `recommended_recipes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `score_config_logs`
--

DROP TABLE IF EXISTS `score_config_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `score_config_logs` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '鏃ュ織ID',
  `configId` int NOT NULL COMMENT '閰嶇疆ID',
  `operatorId` int NOT NULL COMMENT '鎿嶄綔鑰匢D',
  `changeReason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `oldConfig` json NOT NULL,
  `newConfig` json NOT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `configId` (`configId`),
  KEY `operatorId` (`operatorId`),
  KEY `score_config_logs_config_id` (`configId`),
  KEY `score_config_logs_operator_id` (`operatorId`),
  KEY `score_config_logs_created_at` (`createdAt`),
  CONSTRAINT `score_config_logs_ibfk_17` FOREIGN KEY (`configId`) REFERENCES `score_configs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `score_config_logs_ibfk_18` FOREIGN KEY (`operatorId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='璇勫垎閰嶇疆鍙樻洿鏃ュ織琛?;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `score_config_logs`
--

LOCK TABLES `score_config_logs` WRITE;
/*!40000 ALTER TABLE `score_config_logs` DISABLE KEYS */;
INSERT INTO `score_config_logs` VALUES (5,1,2,'??????','{\"ratingWeight\": 0.3, \"qualityWeight\": 0.2, \"recencyWeight\": 0.1, \"creativityWeight\": 0.15, \"interactionWeight\": 0.25}','{\"ratingWeight\": 0.3, \"qualityWeight\": 0.2, \"recencyWeight\": 0.1, \"creativityWeight\": 0.15, \"interactionWeight\": 0.25}','2026-02-07 11:23:59','2026-02-07 11:23:59'),(6,1,2,'','{\"ratingWeight\": 0.3, \"qualityWeight\": 0.2, \"recencyWeight\": 0.1, \"creativityWeight\": 0.15, \"interactionWeight\": 0.25}','{\"ratingWeight\": 0.3, \"qualityWeight\": 0.2, \"recencyWeight\": 0.1, \"creativityWeight\": 0.15, \"interactionWeight\": 0.25}','2026-02-07 11:25:02','2026-02-07 11:25:02'),(7,1,2,'','{\"ratingWeight\": 0.3, \"qualityWeight\": 0.2, \"recencyWeight\": 0.1, \"creativityWeight\": 0.15, \"interactionWeight\": 0.25}','{\"ratingWeight\": 0.3, \"qualityWeight\": 0.2, \"recencyWeight\": 0.1, \"creativityWeight\": 0.15, \"interactionWeight\": 0.25}','2026-02-19 11:00:02','2026-02-19 11:00:02'),(8,1,2,'','{\"ratingWeight\": 0.3, \"qualityWeight\": 0.2, \"recencyWeight\": 0.1, \"creativityWeight\": 0.15, \"interactionWeight\": 0.25}','{\"ratingWeight\": 0.25, \"qualityWeight\": 0.3, \"recencyWeight\": 0.1, \"creativityWeight\": 0.15, \"interactionWeight\": 0.2}','2026-04-11 09:18:50','2026-04-11 09:18:50');
/*!40000 ALTER TABLE `score_config_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `score_configs`
--

DROP TABLE IF EXISTS `score_configs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `score_configs` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '閰嶇疆ID',
  `ratingWeight` float NOT NULL DEFAULT '0.3',
  `interactionWeight` float NOT NULL DEFAULT '0.25',
  `qualityWeight` float NOT NULL DEFAULT '0.2',
  `creativityWeight` float NOT NULL DEFAULT '0.15',
  `recencyWeight` float NOT NULL DEFAULT '0.1',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `score_configs_is_active` (`isActive`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='璇勫垎閰嶇疆琛?;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `score_configs`
--

LOCK TABLES `score_configs` WRITE;
/*!40000 ALTER TABLE `score_configs` DISABLE KEYS */;
INSERT INTO `score_configs` VALUES (1,0.25,0.2,0.3,0.15,0.1,1,'2026-02-07 01:47:40','2026-04-11 09:18:50');
/*!40000 ALTER TABLE `score_configs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seller_mushrooms`
--

DROP TABLE IF EXISTS `seller_mushrooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seller_mushrooms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sellerId` int NOT NULL,
  `mushroomId` int NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'approved',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sellerId` (`sellerId`,`mushroomId`),
  KEY `mushroomId` (`mushroomId`),
  KEY `status` (`status`),
  CONSTRAINT `seller_mushrooms_ibfk_1` FOREIGN KEY (`sellerId`) REFERENCES `users` (`id`),
  CONSTRAINT `seller_mushrooms_ibfk_2` FOREIGN KEY (`mushroomId`) REFERENCES `mushrooms` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seller_mushrooms`
--

LOCK TABLES `seller_mushrooms` WRITE;
/*!40000 ALTER TABLE `seller_mushrooms` DISABLE KEYS */;
INSERT INTO `seller_mushrooms` VALUES (15,27,95,'pending','2026-04-06 11:48:42','2026-04-06 11:48:42');
/*!40000 ALTER TABLE `seller_mushrooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscription_box_contents`
--

DROP TABLE IF EXISTS `subscription_box_contents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscription_box_contents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `subscriptionBoxId` int NOT NULL COMMENT '鐩茬洅濂楅ID',
  `mushroomId` int NOT NULL COMMENT '鑿岃弴鍝佺ID',
  `quantity` int NOT NULL DEFAULT '1' COMMENT '鑿岃弴鏁伴噺',
  `isMain` tinyint(1) NOT NULL DEFAULT '0' COMMENT '鏄惁涓轰富鎵撳搧绉?,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `subscriptionBoxId` (`subscriptionBoxId`),
  KEY `mushroomId` (`mushroomId`),
  CONSTRAINT `subscription_box_contents_ibfk_1` FOREIGN KEY (`subscriptionBoxId`) REFERENCES `subscription_boxes` (`id`),
  CONSTRAINT `subscription_box_contents_ibfk_2` FOREIGN KEY (`mushroomId`) REFERENCES `mushroom_varieties` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='鐩茬洅鍐呭鍏宠仈琛?;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscription_box_contents`
--

LOCK TABLES `subscription_box_contents` WRITE;
/*!40000 ALTER TABLE `subscription_box_contents` DISABLE KEYS */;
/*!40000 ALTER TABLE `subscription_box_contents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscription_boxes`
--

DROP TABLE IF EXISTS `subscription_boxes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscription_boxes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '鐩茬洅濂楅鍚嶇О',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '鐩茬洅濂楅鎻忚堪',
  `price` decimal(10,2) NOT NULL COMMENT '鐩茬洅濂楅浠锋牸',
  `duration` int NOT NULL COMMENT '濂楅鍛ㄦ湡锛堝懆锛?,
  `mushroomCount` int NOT NULL DEFAULT '3' COMMENT '姣忎釜鐩茬洅鍖呭惈鐨勮弻鑿囧搧绉嶆暟閲?,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '鐩茬洅濂楅鍥剧墖',
  `isActive` tinyint(1) NOT NULL DEFAULT '1' COMMENT '鏄惁涓哄綋鍓嶆椿鍔ㄥ椁?,
  `category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '鐩茬洅鍒嗙被锛氬鏂版墜鍏ラ棬銆佽繘闃跺皾椴溿€侀珮绔搧閴?,
  `features` json DEFAULT NULL COMMENT '濂楅鐗硅壊',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='鐩茬洅濂楅琛?;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscription_boxes`
--

LOCK TABLES `subscription_boxes` WRITE;
/*!40000 ALTER TABLE `subscription_boxes` DISABLE KEYS */;
/*!40000 ALTER TABLE `subscription_boxes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscription_items`
--

DROP TABLE IF EXISTS `subscription_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscription_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `subscriptionId` int NOT NULL COMMENT '璁㈤槄ID',
  `deliveryDate` datetime NOT NULL COMMENT '閰嶉€佹棩鏈?,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT '閰嶉€佺姸鎬侊細pending-寰呴厤閫?| delivered-宸查厤閫?| failed-閰嶉€佸け璐?| canceled-宸插彇娑?,
  `mushrooms` json NOT NULL COMMENT '鏈閰嶉€佺殑鑿岃弴鍒楄〃锛氬寘鍚弻鑿囩被鍨婭D銆佹暟閲忋€侀噸閲忕瓑淇℃伅',
  `actualDeliveryDate` datetime DEFAULT NULL COMMENT '瀹為檯閰嶉€佹棩鏈?,
  `orderId` int DEFAULT NULL COMMENT '鍏宠仈璁㈠崟ID',
  `notes` text COLLATE utf8mb4_unicode_ci COMMENT '閰嶉€佸娉?,
  `trackingNumber` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '鐗╂祦杩借釜鍙?,
  `rating` int DEFAULT NULL COMMENT '鐢ㄦ埛璇勫垎锛?-5鍒?,
  `feedback` text COLLATE utf8mb4_unicode_ci COMMENT '鐢ㄦ埛鍙嶉',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='璁㈤槄椤硅〃锛堟瘡娆￠厤閫佺殑鍏蜂綋鍐呭锛?;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscription_items`
--

LOCK TABLES `subscription_items` WRITE;
/*!40000 ALTER TABLE `subscription_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `subscription_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscriptionboxcontents`
--

DROP TABLE IF EXISTS `subscriptionboxcontents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscriptionboxcontents` (
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `mushroomId` int NOT NULL,
  `subscriptionBoxId` int NOT NULL,
  PRIMARY KEY (`mushroomId`,`subscriptionBoxId`),
  KEY `subscriptionBoxId` (`subscriptionBoxId`),
  CONSTRAINT `subscriptionboxcontents_ibfk_1` FOREIGN KEY (`mushroomId`) REFERENCES `mushroom_varieties` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `subscriptionboxcontents_ibfk_2` FOREIGN KEY (`subscriptionBoxId`) REFERENCES `subscription_boxes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='鑿岃弴鍝佺琛?;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscriptionboxcontents`
--

LOCK TABLES `subscriptionboxcontents` WRITE;
/*!40000 ALTER TABLE `subscriptionboxcontents` DISABLE KEYS */;
/*!40000 ALTER TABLE `subscriptionboxcontents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscriptions`
--

DROP TABLE IF EXISTS `subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL COMMENT '鐢ㄦ埛ID',
  `planType` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '璁㈤槄璁″垝绫诲瀷锛歮onthly-鏈堝害 | quarterly-瀛ｅ害 | yearly-骞村害',
  `deliveryCycle` int NOT NULL COMMENT '閰嶉€佸懆鏈燂紙澶╋級',
  `startDate` datetime NOT NULL COMMENT '璁㈤槄寮€濮嬫棩鏈?,
  `endDate` datetime DEFAULT NULL COMMENT '璁㈤槄缁撴潫鏃ユ湡',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active' COMMENT '璁㈤槄鐘舵€侊細active-娲昏穬 | paused-鏆傚仠 | canceled-宸插彇娑?| expired-宸茶繃鏈?,
  `totalPrice` decimal(10,2) NOT NULL COMMENT '璁㈤槄鎬讳环鏍?,
  `deliveryAddress` json NOT NULL COMMENT '閰嶉€佸湴鍧€',
  `mushroomCount` int NOT NULL DEFAULT '3' COMMENT '姣忔閰嶉€佺殑鑿岃弴绉嶇被鏁伴噺',
  `preferences` json DEFAULT NULL COMMENT '璁㈤槄鍋忓ソ锛氬鍠滄鐨勮弻鑿囩被鍨嬨€侀厤閫佹椂闂寸瓑',
  `lastDeliveryDate` datetime DEFAULT NULL COMMENT '涓婃閰嶉€佹棩鏈?,
  `nextDeliveryDate` datetime DEFAULT NULL COMMENT '涓嬫閰嶉€佹棩鏈?,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='璁㈤槄琛?;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscriptions`
--

LOCK TABLES `subscriptions` WRITE;
/*!40000 ALTER TABLE `subscriptions` DISABLE KEYS */;
/*!40000 ALTER TABLE `subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '鏍囩鍚嶇О',
  `color` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '鏍囩棰滆壊锛圚EX鏍煎紡锛?,
  `usageCount` int NOT NULL DEFAULT '0' COMMENT '浣跨敤娆℃暟',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active' COMMENT '鐘舵€侊紙active/inactive锛?,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `name_2` (`name`),
  UNIQUE KEY `name_3` (`name`),
  UNIQUE KEY `name_4` (`name`),
  UNIQUE KEY `name_5` (`name`),
  UNIQUE KEY `name_6` (`name`),
  UNIQUE KEY `name_7` (`name`),
  UNIQUE KEY `name_8` (`name`),
  UNIQUE KEY `name_9` (`name`),
  UNIQUE KEY `name_10` (`name`),
  KEY `status` (`status`),
  KEY `usageCount` (`usageCount`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tags`
--

LOCK TABLES `tags` WRITE;
/*!40000 ALTER TABLE `tags` DISABLE KEYS */;
INSERT INTO `tags` VALUES (1,'新鲜','#409eff',0,'active','2026-04-05 13:48:56','2026-04-05 13:48:56'),(2,'有机','#67c23a',0,'active','2026-04-05 13:48:56','2026-04-05 13:48:56'),(3,'野生','#e6a23c',0,'active','2026-04-05 13:48:56','2026-04-05 13:48:56'),(4,'干品','#909399',0,'active','2026-04-05 13:48:56','2026-04-05 13:48:56'),(5,'稀有','#f56c6c',0,'active','2026-04-05 13:48:56','2026-04-05 13:48:56');
/*!40000 ALTER TABLE `tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_box_orders`
--

DROP TABLE IF EXISTS `user_box_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_box_orders` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '璁㈠崟ID',
  `userId` int NOT NULL COMMENT '鐢ㄦ埛ID',
  `boxId` int NOT NULL COMMENT '鐩茬洅ID',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT '璁㈠崟鐘舵€侊紙pending/paid/shipped/completed锛?,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '鏀惰揣鍦板潃',
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '鑱旂郴鐢佃瘽',
  `receiver` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '鏀惰揣浜?,
  `paymentMethod` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '鏀粯鏂瑰紡',
  `paymentTime` datetime DEFAULT NULL COMMENT '鏀粯鏃堕棿',
  `deliveryDate` datetime DEFAULT NULL COMMENT '鍙戣揣鏃ユ湡',
  `deliveryMethod` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '閰嶉€佹柟寮?,
  `trackingNumber` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '鐗╂祦鍗曞彿',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `totalPrice` decimal(10,2) NOT NULL COMMENT '璁㈠崟鎬讳环鏍?,
  `cultivationService` tinyint(1) NOT NULL DEFAULT '0' COMMENT '鏄惁閫夋嫨浜嗕唬鍩规湇鍔?,
  `cultivationStatus` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '浠ｅ煿鐘舵€侊紙pending/in_progress/completed/cancelled锛?,
  `cultivationStartDate` datetime DEFAULT NULL COMMENT '浠ｅ煿寮€濮嬫棩鏈?,
  `cultivationEndDate` datetime DEFAULT NULL COMMENT '棰勮浠ｅ煿缁撴潫鏃ユ湡',
  `cultivationProgress` int DEFAULT NULL COMMENT '浠ｅ煿杩涘害锛堢櫨鍒嗘瘮锛?,
  `cultivationNotes` text COLLATE utf8mb4_unicode_ci COMMENT '浠ｅ煿澶囨敞',
  `cultivationUpdates` json DEFAULT NULL COMMENT '浠ｅ煿鏇存柊璁板綍',
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `boxId` (`boxId`),
  CONSTRAINT `user_box_orders_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_box_orders_ibfk_2` FOREIGN KEY (`boxId`) REFERENCES `mushroom_boxes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_box_orders`
--

LOCK TABLES `user_box_orders` WRITE;
/*!40000 ALTER TABLE `user_box_orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_box_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_mushrooms`
--

DROP TABLE IF EXISTS `user_mushrooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_mushrooms` (
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `userId` int NOT NULL,
  `mushroomId` int NOT NULL,
  PRIMARY KEY (`userId`,`mushroomId`),
  KEY `mushroomId` (`mushroomId`),
  CONSTRAINT `user_mushrooms_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_mushrooms_ibfk_2` FOREIGN KEY (`mushroomId`) REFERENCES `mushrooms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='鐢ㄦ埛琛?;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_mushrooms`
--

LOCK TABLES `user_mushrooms` WRITE;
/*!40000 ALTER TABLE `user_mushrooms` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_mushrooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_permissions`
--

DROP TABLE IF EXISTS `user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_permissions` (
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `userId` int NOT NULL,
  `permissionId` int NOT NULL,
  PRIMARY KEY (`userId`,`permissionId`),
  KEY `permissionId` (`permissionId`),
  CONSTRAINT `user_permissions_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_permissions_ibfk_2` FOREIGN KEY (`permissionId`) REFERENCES `permissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='鐢ㄦ埛琛?;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_permissions`
--

LOCK TABLES `user_permissions` WRITE;
/*!40000 ALTER TABLE `user_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_preferences`
--

DROP TABLE IF EXISTS `user_preferences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_preferences` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '涓婚敭ID',
  `userId` int NOT NULL COMMENT '鐢ㄦ埛ID',
  `tastePreferences` json DEFAULT NULL COMMENT '鍙ｅ懗鍋忓ソ锛堝锛歿"spicy": true, "sweet": false}锛?,
  `dietaryRestrictions` json DEFAULT NULL COMMENT '楗绂佸繉锛堝锛歔"vegetarian", "gluten_free"]锛?,
  `cookingSkill` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'beginner' COMMENT '鐑归オ鎶€鑳斤紙beginner/intermediate/advanced锛?,
  `favoriteMushrooms` json DEFAULT NULL COMMENT '鍠滅埍鐨勮弻鑿囩被鍨?,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `userId` (`userId`),
  UNIQUE KEY `userId_2` (`userId`),
  UNIQUE KEY `userId_3` (`userId`),
  UNIQUE KEY `userId_4` (`userId`),
  UNIQUE KEY `userId_5` (`userId`),
  UNIQUE KEY `userId_6` (`userId`),
  UNIQUE KEY `userId_7` (`userId`),
  UNIQUE KEY `userId_8` (`userId`),
  UNIQUE KEY `userId_9` (`userId`),
  UNIQUE KEY `userId_10` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_preferences`
--

LOCK TABLES `user_preferences` WRITE;
/*!40000 ALTER TABLE `user_preferences` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_preferences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_recipe_history`
--

DROP TABLE IF EXISTS `user_recipe_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_recipe_history` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '涓婚敭ID',
  `userId` int NOT NULL COMMENT '鐢ㄦ埛ID',
  `recipeId` int NOT NULL COMMENT '椋熻氨ID',
  `action` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '鎿嶄綔绫诲瀷锛坴iew/like/save/cook锛?,
  `timestamp` datetime NOT NULL COMMENT '鎿嶄綔鏃堕棿',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_recipe_history`
--

LOCK TABLES `user_recipe_history` WRITE;
/*!40000 ALTER TABLE `user_recipe_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_recipe_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_taste_histories`
--

DROP TABLE IF EXISTS `user_taste_histories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_taste_histories` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '鍘嗗彶ID',
  `userId` int NOT NULL COMMENT '鐢ㄦ埛ID',
  `workId` int NOT NULL COMMENT '浣滃搧ID',
  `createdAt` datetime DEFAULT NULL,
  `tasteDate` datetime NOT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_taste_histories_user_id_work_id` (`userId`,`workId`),
  KEY `userId` (`userId`),
  KEY `workId` (`workId`),
  KEY `user_taste_histories_user_id` (`userId`),
  KEY `user_taste_histories_work_id` (`workId`),
  KEY `user_taste_histories_taste_date` (`tasteDate`),
  CONSTRAINT `user_taste_histories_ibfk_15` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_taste_histories_ibfk_16` FOREIGN KEY (`workId`) REFERENCES `works` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='鐢ㄦ埛鍝佸皾鍘嗗彶琛?;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_taste_histories`
--

LOCK TABLES `user_taste_histories` WRITE;
/*!40000 ALTER TABLE `user_taste_histories` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_taste_histories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '鐢ㄦ埛ID',
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '鐢ㄦ埛鍚?,
  `password` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '鍔犲瘑瀵嗙爜',
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '閭',
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '鎵嬫満鍙?,
  `role` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user' COMMENT '鐢ㄦ埛瑙掕壊锛歶ser-鏅€氱敤鎴?| seller-鍗栧 | admin-绠＄悊鍛?,
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '璐﹀彿鐘舵€侊細true-姝ｅ父锛宖alse-绂佺敤',
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '澶村儚',
  `lastLoginAt` datetime DEFAULT NULL COMMENT '鏈€鍚庣櫥褰曟椂闂?,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `username_2` (`username`),
  UNIQUE KEY `users_username` (`username`),
  UNIQUE KEY `username_3` (`username`),
  UNIQUE KEY `username_4` (`username`),
  UNIQUE KEY `username_5` (`username`),
  UNIQUE KEY `username_6` (`username`),
  UNIQUE KEY `username_7` (`username`),
  UNIQUE KEY `username_8` (`username`),
  UNIQUE KEY `username_9` (`username`),
  UNIQUE KEY `username_10` (`username`),
  UNIQUE KEY `username_11` (`username`),
  UNIQUE KEY `username_12` (`username`),
  UNIQUE KEY `username_13` (`username`),
  UNIQUE KEY `username_14` (`username`),
  UNIQUE KEY `username_15` (`username`),
  UNIQUE KEY `username_16` (`username`),
  UNIQUE KEY `username_17` (`username`),
  UNIQUE KEY `username_18` (`username`),
  UNIQUE KEY `username_19` (`username`),
  UNIQUE KEY `username_20` (`username`),
  UNIQUE KEY `username_21` (`username`),
  UNIQUE KEY `username_22` (`username`),
  UNIQUE KEY `username_23` (`username`),
  UNIQUE KEY `username_24` (`username`),
  UNIQUE KEY `username_25` (`username`),
  UNIQUE KEY `username_26` (`username`),
  UNIQUE KEY `username_27` (`username`),
  UNIQUE KEY `username_28` (`username`),
  UNIQUE KEY `username_29` (`username`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `users_email` (`email`),
  UNIQUE KEY `email_3` (`email`),
  UNIQUE KEY `email_4` (`email`),
  UNIQUE KEY `email_5` (`email`),
  UNIQUE KEY `email_6` (`email`),
  UNIQUE KEY `email_7` (`email`),
  UNIQUE KEY `email_8` (`email`),
  UNIQUE KEY `email_9` (`email`),
  UNIQUE KEY `email_10` (`email`),
  UNIQUE KEY `email_11` (`email`),
  UNIQUE KEY `email_12` (`email`),
  UNIQUE KEY `email_13` (`email`),
  UNIQUE KEY `email_14` (`email`),
  UNIQUE KEY `email_15` (`email`),
  UNIQUE KEY `email_16` (`email`),
  UNIQUE KEY `email_17` (`email`),
  UNIQUE KEY `email_18` (`email`),
  UNIQUE KEY `email_19` (`email`),
  UNIQUE KEY `email_20` (`email`),
  UNIQUE KEY `email_21` (`email`),
  UNIQUE KEY `email_22` (`email`),
  UNIQUE KEY `email_23` (`email`),
  UNIQUE KEY `email_24` (`email`),
  UNIQUE KEY `email_25` (`email`),
  UNIQUE KEY `email_26` (`email`),
  UNIQUE KEY `email_27` (`email`),
  UNIQUE KEY `email_28` (`email`),
  UNIQUE KEY `email_29` (`email`),
  KEY `users_role` (`role`),
  KEY `users_status` (`status`),
  KEY `users_created_at` (`createdAt`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='鐢ㄦ埛琛?;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,'admin','$2a$10$VA/sWjf3ZPSWQKId3QfZ.O84KfsX6Ax3EM08WEKAQcduphVIA6ZzW','3130826545@qq.com','13305446541','admin',1,NULL,'2026-04-13 09:25:05','2026-01-21 13:08:03','2026-04-13 09:25:05'),(3,'小狗狗','$2a$10$nNZdi3lnTAdigM/H/vOK2uuqXPvmLu0qXHjzxz9DCsaGkju8u8nJG','3130826555@qq.com','13354546666','seller',1,NULL,'2026-04-05 12:33:18','2026-01-21 17:49:29','2026-04-05 12:33:18'),(4,'普通人','$2a$10$RtlZeKqCtviSwdl5neKBlOwpOPFBg1vM.lgYPCZWyVUnZiMLWhnGC','3130825555@qq.com','','user',1,NULL,'2026-04-13 04:37:44','2026-01-21 17:49:58','2026-04-13 04:37:44'),(5,'testuser','$2a$10$wMzJgavX5eeq/vEUbPBzyeLM0VlS1okp1dkHqgafNRcQeIyPU0FQS',NULL,NULL,'user',1,NULL,'2026-02-06 02:58:51','2026-01-22 05:40:41','2026-02-06 02:58:51'),(6,'testuser2','$2a$10$WnWM0CYRbHvfdmeEycZwQ.7COLA5GA7/BWI6okE55wU0Aqkg4N7e6','test2@example.com',NULL,'user',1,NULL,'2026-01-24 13:45:11','2026-01-24 06:01:02','2026-01-24 13:45:11'),(22,'paymenttest','$2a$10$TqmYAgnnLSTp1JhYEW7GReu82hv9bpAJUeTRtF8/1V5y6j01V3cKq','payment@example.com',NULL,'user',1,NULL,'2026-02-07 10:37:13','2026-02-07 10:36:58','2026-02-07 10:37:13'),(23,'普通人1','$2a$10$vSIgpltJCkMZWVg0XPivc.UcMV1GrvvOkj3MH7XaXOFfW8neS4B8.','313082655@qq.com','13351324444','seller',1,NULL,NULL,'2026-04-04 13:43:37','2026-04-04 13:43:37'),(24,'普通人2','$2a$10$JbjzGNLLwNzQXtBYeNS7jeWEetRa2BE5nUIGxen76eFW/eHtlAUHO','313022655@qq.com','13351324444','seller',1,NULL,NULL,'2026-04-04 13:46:29','2026-04-04 13:46:29'),(25,'小狗狗1','$2a$10$C.hv68650CWewleagV6rpuzlo0b7IBTYMZ55YVJ069rR0zm6ojHGG','31302265@qq.com','13351324444','seller',1,NULL,'2026-04-12 02:58:02','2026-04-05 11:09:57','2026-04-12 02:58:02'),(27,'小狗狗123','$2a$10$EvXcPbT.h2IHWKdd1vYX5uTpGzyFoDiQdIWSG8B/OqdcTJGNaH222','31308265435@qq.com','13351324698','seller',1,NULL,'2026-04-12 07:12:46','2026-04-05 12:36:27','2026-04-12 07:12:46'),(34,'小狗狗1234','$2a$10$fPTNAzxwgV7F7zpfb1W26un8r/tbW6ikYQ3QYUklA9hJvO3ujWbGi','313082635@qq.com','13351324465','seller',1,NULL,'2026-04-12 02:58:19','2026-04-10 08:00:45','2026-04-12 02:58:19'),(35,'小狗狗4','$2a$10$0qcUmMU0KZgNTdMgG0q33OsRyk7DF1CiPLQlqc.I/SJn25AFCLaEa','31308235@qq.com','13351324465','seller',1,NULL,'2026-04-11 13:34:03','2026-04-10 09:46:29','2026-04-11 13:34:03'),(36,'小白白','$2a$10$XxdwlBvjmrYFopYjQM7U6OoP6Ok3YVJb38EAhVvHCRx7BnlUnKXFe','3130823@qq.com','13351324468','user',1,NULL,'2026-04-11 07:53:20','2026-04-11 07:53:17','2026-04-11 07:53:20'),(37,'小狗狗12345','$2a$10$JwiSfqEWd2Zmlu8vyquJKuL8Mty1TZUHB82c/Gi63nWxaJ7RX9hkG','330823@qq.com','13351324465','seller',1,NULL,'2026-04-12 03:06:54','2026-04-12 03:06:51','2026-04-12 03:06:54');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `video_recipes`
--

DROP TABLE IF EXISTS `video_recipes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `video_recipes` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '涓婚敭ID',
  `videoId` int NOT NULL COMMENT '瑙嗛ID',
  `recipeId` int NOT NULL COMMENT '椋熻氨ID',
  `matchingScore` float NOT NULL DEFAULT '0' COMMENT '鍖归厤搴﹁瘎鍒嗭紙0-1涔嬮棿锛?,
  `isPrimary` tinyint(1) NOT NULL DEFAULT '0' COMMENT '鏄惁涓轰富瑙嗛',
  `relevance` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '鍏宠仈绫诲瀷锛堝锛氬畬鏁撮璋便€佸崟涓楠わ級',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `video_recipes_video_id_recipe_id` (`videoId`,`recipeId`),
  KEY `recipeId` (`recipeId`),
  CONSTRAINT `video_recipes_ibfk_1` FOREIGN KEY (`videoId`) REFERENCES `videos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `video_recipes_ibfk_2` FOREIGN KEY (`recipeId`) REFERENCES `recipes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `video_recipes`
--

LOCK TABLES `video_recipes` WRITE;
/*!40000 ALTER TABLE `video_recipes` DISABLE KEYS */;
/*!40000 ALTER TABLE `video_recipes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `videos`
--

DROP TABLE IF EXISTS `videos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `videos` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '瑙嗛ID',
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '瑙嗛鏍囬',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '瑙嗛鎻忚堪',
  `url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '瑙嗛URL',
  `thumbnail` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '瑙嗛缂╃暐鍥?,
  `duration` int NOT NULL COMMENT '瑙嗛鏃堕暱锛堢锛?,
  `source` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '瑙嗛鏉ユ簮锛堝锛欱绔欍€乊ouTube锛?,
  `copyrightInfo` text COLLATE utf8mb4_unicode_ci COMMENT '鐗堟潈淇℃伅',
  `quality` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '720p' COMMENT '瑙嗛璐ㄩ噺锛堝锛?80p銆?20p銆?080p锛?,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active' COMMENT '瑙嗛鐘舵€侊紙active/inactive锛?,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `videos`
--

LOCK TABLES `videos` WRITE;
/*!40000 ALTER TABLE `videos` DISABLE KEYS */;
/*!40000 ALTER TABLE `videos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `work_ratings`
--

DROP TABLE IF EXISTS `work_ratings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `work_ratings` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '璇勫垎ID',
  `workId` int NOT NULL COMMENT '浣滃搧ID',
  `userId` int NOT NULL COMMENT '鐢ㄦ埛ID',
  `rating` int NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `workId_userId` (`workId`,`userId`),
  UNIQUE KEY `work_ratings_work_id_user_id` (`workId`,`userId`),
  KEY `workId` (`workId`),
  KEY `userId` (`userId`),
  KEY `work_ratings_work_id` (`workId`),
  KEY `work_ratings_user_id` (`userId`),
  KEY `work_ratings_created_at` (`createdAt`),
  CONSTRAINT `work_ratings_ibfk_17` FOREIGN KEY (`workId`) REFERENCES `works` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `work_ratings_ibfk_18` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='浣滃搧璇勫垎琛?;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `work_ratings`
--

LOCK TABLES `work_ratings` WRITE;
/*!40000 ALTER TABLE `work_ratings` DISABLE KEYS */;
INSERT INTO `work_ratings` VALUES (3,7,2,5,'','2026-02-07 10:19:25','2026-02-07 16:35:05',1),(4,5,2,3,'订单','2026-02-07 14:42:52','2026-02-17 04:32:07',1),(5,3,2,5,'非常好吃看着，想吃\n','2026-02-07 15:07:36','2026-02-21 12:09:21',1),(6,8,2,4,NULL,'2026-02-08 07:11:45','2026-02-08 08:50:21',1),(9,4,2,2,NULL,'2026-04-04 01:47:39','2026-04-04 01:47:39',1),(10,5,36,4,'44','2026-04-11 07:55:18','2026-04-11 07:55:46',1);
/*!40000 ALTER TABLE `work_ratings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `works`
--

DROP TABLE IF EXISTS `works`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `works` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '浣滃搧ID',
  `userId` int NOT NULL COMMENT '鐢ㄦ埛ID',
  `title` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `imageUrl` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` int NOT NULL,
  `mushroomType` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `likes` int DEFAULT '0',
  `comments` int DEFAULT '0',
  `totalScore` float DEFAULT '0',
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'approved',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `mushroomType` (`mushroomType`),
  KEY `rating` (`rating`),
  KEY `likes` (`likes`),
  KEY `totalScore` (`totalScore`),
  KEY `createdAt` (`createdAt`),
  KEY `status` (`status`),
  KEY `works_user_id` (`userId`),
  KEY `works_mushroom_type` (`mushroomType`),
  KEY `works_rating` (`rating`),
  KEY `works_likes` (`likes`),
  KEY `works_total_score` (`totalScore`),
  KEY `works_created_at` (`createdAt`),
  CONSTRAINT `works_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='浣滃搧琛?;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `works`
--

LOCK TABLES `works` WRITE;
/*!40000 ALTER TABLE `works` DISABLE KEYS */;
INSERT INTO `works` VALUES (2,2,'金针菇豆腐汤','金针菇豆腐汤是一道清爽的汤品，金针菇的鲜味与豆腐的嫩滑相得益彰。这道汤制作简单，营养丰富，适合全家老少食用。金针菇含有丰富的蛋白质和多种氨基酸，豆腐则是优质植物蛋白的来源。','/uploads/upload-1771640027143-374709583.jpg',4,'enoki',12,5,5.39255,'approved','2026-02-07 01:48:20','2026-04-11 09:18:50'),(3,2,'杏鲍菇烤串','杏鲍菇烤串是一道美味的素食烧烤，杏鲍菇肉质厚实，口感类似肉类，搭配特制调料烤制，香气四溢。这是一道适合聚会和户外烧烤的菜品，既健康又美味。','/uploads/upload-1771640078976-375587406.jpg',5,'king',21,25,6.29081,'approved','2026-02-07 01:48:20','2026-04-12 02:29:53'),(4,2,'平菇意大利面','平菇意大利面是一道融合中西美食的创新菜品，平菇的鲜美与意大利面的经典口感相结合，搭配奶油白酱，味道浓郁丰富。这道菜既保留了平菇的营养，又展现了西餐的魅力。','/uploads/upload-1771640758308-969788937.png',4,'oyster',18,7,5.79559,'approved','2026-02-07 01:48:20','2026-04-11 09:18:50'),(5,2,'松茸土鸡煲','松茸土鸡煲是一道高端滋补菜品，松茸的浓郁香气与土鸡的鲜美完美融合，汤汁醇厚，营养丰富。松茸是珍贵的食用菌，具有很高的营养价值和独特的风味，搭配土鸡煲制，是一道不可多得的美味佳肴。','/uploads/upload-1771645036324-182311587.jpg',4,'松茸',27,32,6.14085,'approved','2026-02-07 01:48:20','2026-04-11 09:18:50'),(6,2,'混合菌菇披萨','混合菌菇披萨是一道融合多种菌菇美味的创意菜品，将香菇、平菇、杏鲍菇等多种菌菇搭配芝士和特制酱料，铺在酥脆的披萨底上烤制而成。这道菜既有菌菇的鲜美，又有披萨的经典风味。','/uploads/upload-1771645076907-256094994.webp',4,'other',22,7,5.57743,'approved','2026-02-07 01:48:20','2026-04-11 09:18:50'),(7,2,'香菇滑鸡','香菇滑鸡是一道经典的中式菜品，香菇的鲜味与鸡肉的嫩滑相得益彰，口感丰富，营养均衡。这道菜制作简单，适合家庭日常食用，也是宴客的不错选择。','/uploads/upload-1771641411641-132075816.webp',5,'shiitake',30,18,6.46597,'approved','2026-02-07 01:48:20','2026-04-11 09:18:50'),(8,2,'金针菇肥牛卷','金针菇肥牛卷是一道美味的火锅菜品，金针菇的脆嫩与肥牛的鲜嫩相结合，口感丰富，味道鲜美。这道菜既适合火锅涮制，也可以作为独立菜品煎制，是很多人喜爱的美食。','/uploads/upload-1771641397690-711263275.jpg',4,'enoki',28,11,5.9494,'approved','2026-02-07 01:48:20','2026-04-11 09:18:50'),(15,36,'好吃到爆','22222222222222222222222222222222222222222222222222','/uploads/upload-1775894055418-262560137.png',3,'king',0,0,5.07483,'approved','2026-04-11 07:54:34','2026-04-11 09:18:50');
/*!40000 ALTER TABLE `works` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-17 14:47:04

