-- MySQL dump 10.13  Distrib 8.0.36, for Linux (x86_64)
--
-- Host: 127.0.0.1    Database: NewReactJsApp
-- ------------------------------------------------------
-- Server version	8.0.39-0ubuntu0.22.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `StaticContents`
--

DROP TABLE IF EXISTS `StaticContents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `StaticContents` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `type` enum('privacy_policy','terms_of_service','faq','about_us') NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `version` varchar(255) NOT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `publishedBy` bigint unsigned DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `publishedBy` (`publishedBy`),
  CONSTRAINT `StaticContents_ibfk_1` FOREIGN KEY (`publishedBy`) REFERENCES `Users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `StaticContents`
--

LOCK TABLES `StaticContents` WRITE;
/*!40000 ALTER TABLE `StaticContents` DISABLE KEYS */;
INSERT INTO `StaticContents` VALUES (1,'about_us','about us','about us content','1',1,NULL,'2025-06-03 09:42:45','2025-06-03 09:42:45'),(2,'faq','faq','faq content','1',1,NULL,'2025-06-03 09:42:45','2025-06-03 09:42:45'),(3,'privacy_policy','privacy policy','privacy content','1',1,NULL,'2025-06-03 09:42:45','2025-06-03 09:42:45'),(4,'terms_of_service','terms of service','terms of service content','1',1,NULL,'2025-06-03 09:42:45','2025-06-03 09:42:45');
/*!40000 ALTER TABLE `StaticContents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `stripe_customer_id` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `firstName` varchar(255) DEFAULT NULL,
  `lastName` varchar(255) DEFAULT NULL,
  `phoneNumber` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `isVerified` tinyint(1) DEFAULT '0',
  `isActive` tinyint(1) DEFAULT '1',
  `lastLogin` datetime DEFAULT NULL,
  `loginAttempts` int DEFAULT '0',
  `resetPasswordToken` varchar(255) DEFAULT NULL,
  `resetPasswordExpires` datetime DEFAULT NULL,
  `verificationToken` varchar(255) DEFAULT NULL,
  `verificationExpires` datetime DEFAULT NULL,
  `isDeleted` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `email_3` (`email`),
  UNIQUE KEY `email_4` (`email`),
  UNIQUE KEY `email_5` (`email`),
  UNIQUE KEY `email_6` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES (1,NULL,'test_user@test.com','$2b$10$qgUZVMbE/GHxo4w8yL01yeePLcG/0sI37q92RaGiadx4kDW1TsRcy','test','user','','','user',1,1,'2025-06-03 09:38:40',0,NULL,NULL,NULL,NULL,0,'2025-06-03 09:37:30','2025-06-03 09:41:37'),(2,NULL,'test_admin@test.com','$2b$10$qgUZVMbE/GHxo4w8yL01yeePLcG/0sI37q92RaGiadx4kDW1TsRcy','test','admin',NULL,NULL,'admin',1,1,'2025-06-03 09:42:45',0,NULL,NULL,NULL,NULL,0,'2025-06-03 09:40:11','2025-06-03 09:42:45');
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-03 15:21:10
