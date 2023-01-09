-- MySQL dump 10.13  Distrib 8.0.30, for Win64 (x86_64)
--
-- Host: 172.16.0.112    Database: ThidleDB
-- ------------------------------------------------------
-- Server version	8.0.27

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
-- Table structure for table `Audios`
--

DROP TABLE IF EXISTS `Audios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Audios` (
  `AudioID` bigint NOT NULL AUTO_INCREMENT,
  `AudioName` varchar(255) NOT NULL,
  `AudioHash` varchar(256) NOT NULL,
  `AudioBitrate` int NOT NULL,
  `AudioCreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `AudioCreatedBy` bigint NOT NULL,
  `AudioOriginalSize` int NOT NULL,
  `AudioOriginalMime` int NOT NULL,
  `AudioOriginalContainer` int NOT NULL,
  `AudioOriginalCodec` int NOT NULL,
  `AudioFile` bigint NOT NULL,
  PRIMARY KEY (`AudioID`),
  UNIQUE KEY `AudioID_UNIQUE` (`AudioID`),
  UNIQUE KEY `AudioName_UNIQUE` (`AudioName`),
  KEY `AudioByRef_idx` (`AudioCreatedBy`),
  KEY `AudioMimeRef_idx` (`AudioOriginalMime`),
  KEY `AudioCodecRef_idx` (`AudioOriginalCodec`),
  KEY `AudioContainerRef_idx` (`AudioOriginalContainer`),
  KEY `AudioFileRef_idx` (`AudioFile`),
  CONSTRAINT `AudioByRef` FOREIGN KEY (`AudioCreatedBy`) REFERENCES `Users` (`UserId`),
  CONSTRAINT `AudioCodecRef` FOREIGN KEY (`AudioOriginalCodec`) REFERENCES `MediaCodecs` (`CodecID`),
  CONSTRAINT `AudioContainerRef` FOREIGN KEY (`AudioOriginalContainer`) REFERENCES `MediaContainers` (`ContainerID`),
  CONSTRAINT `AudioFileRef` FOREIGN KEY (`AudioFile`) REFERENCES `UploadFiles` (`FileID`),
  CONSTRAINT `AudioMimeRef` FOREIGN KEY (`AudioOriginalMime`) REFERENCES `MimeTypes` (`MimeTypeID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Cities`
--

DROP TABLE IF EXISTS `Cities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Cities` (
  `CityID` bigint NOT NULL AUTO_INCREMENT,
  `CityName` varchar(500) NOT NULL,
  `CityCountry` int NOT NULL,
  `CityState` int NOT NULL,
  PRIMARY KEY (`CityID`),
  UNIQUE KEY `CityID_UNIQUE` (`CityID`),
  KEY `CityStateRef_idx` (`CityState`),
  KEY `CityCountryRef_idx` (`CityCountry`),
  CONSTRAINT `CityCountryRef` FOREIGN KEY (`CityCountry`) REFERENCES `Countries` (`CountryId`),
  CONSTRAINT `CityStateRef` FOREIGN KEY (`CityState`) REFERENCES `States` (`StateId`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Countries`
--

DROP TABLE IF EXISTS `Countries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Countries` (
  `CountryId` int NOT NULL,
  `CountryName` varchar(100) NOT NULL,
  `CountryHasStates` tinyint(1) NOT NULL DEFAULT '1',
  `CountryHasCities` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`CountryId`),
  UNIQUE KEY `CountryId_UNIQUE` (`CountryId`),
  UNIQUE KEY `CountryName_UNIQUE` (`CountryName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Follows`
--

DROP TABLE IF EXISTS `Follows`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Follows` (
  `FollowFrom` bigint NOT NULL,
  `FollowTo` bigint NOT NULL,
  `FollowCreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `FollowNeedApproval` tinyint(1) NOT NULL,
  `FollowApproveStatus` char(1) DEFAULT NULL COMMENT 'P = PENDING\nA = ACCEPTED\nR = REFUSED\n',
  `FollowApprovedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`FollowFrom`,`FollowTo`),
  UNIQUE KEY `Follow_UNIQUE` (`FollowFrom`,`FollowTo`),
  KEY `FollowTo` (`FollowTo`),
  CONSTRAINT `FollowFrom` FOREIGN KEY (`FollowFrom`) REFERENCES `Users` (`UserId`),
  CONSTRAINT `FollowTo` FOREIGN KEY (`FollowTo`) REFERENCES `Users` (`UserId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`dba`@`%`*/ /*!50003 TRIGGER `Follows_AFTER_INSERT` AFTER INSERT ON `Follows` FOR EACH ROW BEGIN
	IF NEW.FollowNeedApproval = 0 THEN
		UPDATE Users SET UserObservingCount = UserObservingCount+1 WHERE UserId = NEW.FollowFrom;
		UPDATE Users SET UserObserverCount = UserObserverCount+1 WHERE UserId = NEW.FollowTo;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`dba`@`%`*/ /*!50003 TRIGGER `Follows_AFTER_UPDATE` AFTER UPDATE ON `Follows` FOR EACH ROW BEGIN
	IF OLD.FollowNeedApproval = 1 AND NEW.FollowApproveStatus = 'A' THEN
		UPDATE Users SET UserObservingCount = UserObservingCount+1 WHERE UserId = OLD.FollowFrom;
		UPDATE Users SET UserObserverCount = UserObserverCount+1 WHERE UserId = OLD.FollowTo;
	END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`dba`@`%`*/ /*!50003 TRIGGER `Follows_AFTER_DELETE` AFTER DELETE ON `Follows` FOR EACH ROW BEGIN
	IF OLD.FollowNeedApproval = 0 OR (OLD.FollowNeedApproval = 1 AND OLD.FollowApproveStatus = 'A') THEN
		UPDATE Users SET UserObservingCount = UserObservingCount-1 WHERE UserId = OLD.FollowFrom;
		UPDATE Users SET UserObserverCount = UserObserverCount-1 WHERE UserId = OLD.FollowTo;
	END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `Images`
--

DROP TABLE IF EXISTS `Images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Images` (
  `ImageID` bigint NOT NULL AUTO_INCREMENT,
  `ImageCreatedBy` bigint NOT NULL,
  `ImageCreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ImageAlt` varchar(255) NOT NULL,
  `ImageX` int NOT NULL,
  `ImageY` int NOT NULL,
  `ImageSize` bigint NOT NULL,
  `ImageFile` bigint NOT NULL,
  `ImageMime` int NOT NULL,
  PRIMARY KEY (`ImageID`),
  UNIQUE KEY `ImageID_UNIQUE` (`ImageID`),
  KEY `ImageUserRef_idx` (`ImageCreatedBy`),
  KEY `ImageFileRef_idx` (`ImageFile`),
  KEY `ImageMimeRef_idx` (`ImageMime`),
  CONSTRAINT `ImageFileRef` FOREIGN KEY (`ImageFile`) REFERENCES `UploadFiles` (`FileID`),
  CONSTRAINT `ImageMimeRef` FOREIGN KEY (`ImageMime`) REFERENCES `MimeTypes` (`MimeTypeID`),
  CONSTRAINT `ImageUserRef` FOREIGN KEY (`ImageCreatedBy`) REFERENCES `Users` (`UserId`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Locations`
--

DROP TABLE IF EXISTS `Locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Locations` (
  `LocationID` bigint NOT NULL AUTO_INCREMENT,
  `LocationName` varchar(75) NOT NULL,
  `LocationCountry` int DEFAULT NULL,
  `LocationState` int DEFAULT NULL,
  `LocationCity` bigint DEFAULT NULL,
  `LocationBy` bigint DEFAULT NULL,
  PRIMARY KEY (`LocationID`),
  UNIQUE KEY `LocationID_UNIQUE` (`LocationID`),
  UNIQUE KEY `Location_UNIQUE` (`LocationName`,`LocationCountry`,`LocationState`,`LocationCity`),
  KEY `CountryRef_idx` (`LocationCountry`),
  KEY `StateRef_idx` (`LocationState`),
  KEY `CityRef_idx` (`LocationCity`),
  KEY `UserRef_idx` (`LocationBy`),
  CONSTRAINT `CityRef` FOREIGN KEY (`LocationCity`) REFERENCES `Cities` (`CityID`),
  CONSTRAINT `CountryRef` FOREIGN KEY (`LocationCountry`) REFERENCES `Countries` (`CountryId`),
  CONSTRAINT `LocationUserRef` FOREIGN KEY (`LocationBy`) REFERENCES `Users` (`UserId`),
  CONSTRAINT `StateRef` FOREIGN KEY (`LocationState`) REFERENCES `States` (`StateId`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `MailVerifications`
--

DROP TABLE IF EXISTS `MailVerifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `MailVerifications` (
  `MailVerificationID` bigint NOT NULL AUTO_INCREMENT,
  `MailVerificationMail` bigint NOT NULL,
  `MailVerificationCode` varchar(6) NOT NULL,
  `MailVerificationCreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `MailVerificationExpiresAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `MailVerificationCancelled` tinyint(1) NOT NULL DEFAULT '0',
  `MailVerificationSent` tinyint(1) NOT NULL DEFAULT '0',
  `MailVerificationUsed` tinyint(1) NOT NULL DEFAULT '0',
  `MailVerificationURI` varchar(3000) DEFAULT NULL,
  PRIMARY KEY (`MailVerificationID`),
  UNIQUE KEY `MailVerificationID_UNIQUE` (`MailVerificationID`),
  KEY `MailVerificationRef_idx` (`MailVerificationMail`),
  CONSTRAINT `MailVerificationRef` FOREIGN KEY (`MailVerificationMail`) REFERENCES `Mails` (`MailId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`dba`@`%`*/ /*!50003 TRIGGER `MailVerifications_BEFORE_INSERT` BEFORE INSERT ON `MailVerifications` FOR EACH ROW BEGIN
	SET NEW.MailVerificationExpiresAt = DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 10 MINUTE);
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `Mails`
--

DROP TABLE IF EXISTS `Mails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Mails` (
  `MailId` bigint NOT NULL AUTO_INCREMENT,
  `MailUser` bigint NOT NULL,
  `MailAddress` varchar(320) NOT NULL,
  `MailCreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `MailVerificated` tinyint(1) NOT NULL DEFAULT '0',
  `MailVerificationAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`MailId`),
  UNIQUE KEY `MailId_UNIQUE` (`MailId`),
  UNIQUE KEY `MailAddress_UNIQUE` (`MailAddress`),
  KEY `MailUserRef_idx` (`MailUser`),
  CONSTRAINT `MailUserRef` FOREIGN KEY (`MailUser`) REFERENCES `Users` (`UserId`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `MediaCodecs`
--

DROP TABLE IF EXISTS `MediaCodecs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `MediaCodecs` (
  `CodecID` int NOT NULL AUTO_INCREMENT,
  `CodecName` varchar(100) NOT NULL,
  `CodecCreatedAt` timestamp NOT NULL,
  PRIMARY KEY (`CodecID`),
  UNIQUE KEY `ContainerID_UNIQUE` (`CodecID`),
  UNIQUE KEY `ContainerName_UNIQUE` (`CodecName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `MediaContainers`
--

DROP TABLE IF EXISTS `MediaContainers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `MediaContainers` (
  `ContainerID` int NOT NULL AUTO_INCREMENT,
  `ContainerName` varchar(100) NOT NULL,
  `ContainerCreatedAt` timestamp NOT NULL,
  PRIMARY KEY (`ContainerID`),
  UNIQUE KEY `ContainerID_UNIQUE` (`ContainerID`),
  UNIQUE KEY `ContainerName_UNIQUE` (`ContainerName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `MimeTypes`
--

DROP TABLE IF EXISTS `MimeTypes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `MimeTypes` (
  `MimeTypeID` int NOT NULL AUTO_INCREMENT,
  `MimeTypeName` varchar(100) NOT NULL,
  `MimeTypeExtension` varchar(20) NOT NULL,
  `MimeTypeCreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`MimeTypeID`),
  UNIQUE KEY `ContainerID_UNIQUE` (`MimeTypeID`),
  UNIQUE KEY `ContainerName_UNIQUE` (`MimeTypeName`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Notifications`
--

DROP TABLE IF EXISTS `Notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Notifications` (
  `NotificationID` bigint NOT NULL,
  `NotificationTo` bigint NOT NULL,
  `NotificationCreationTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `NotificationUpdateTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `NotificationData` varchar(3000) NOT NULL,
  `NotificationType` char(1) NOT NULL COMMENT 'L = Like\nF = Follow\nC = Comment\nM = Mention\n',
  PRIMARY KEY (`NotificationID`),
  UNIQUE KEY `NotificationID_UNIQUE` (`NotificationID`),
  KEY `NotificationUserRef_idx` (`NotificationTo`),
  CONSTRAINT `NotificationUserRef` FOREIGN KEY (`NotificationTo`) REFERENCES `Users` (`UserId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `PhoneVerifications`
--

DROP TABLE IF EXISTS `PhoneVerifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PhoneVerifications` (
  `PhoneVerificationID` bigint NOT NULL AUTO_INCREMENT,
  `PhoneVerificationPhone` bigint NOT NULL,
  `PhoneVerificationCode` varchar(6) NOT NULL,
  `PhoneVerificationCreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `PhoneVerificationExpiresAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `PhoneVerificationCancelled` tinyint(1) NOT NULL DEFAULT '0',
  `PhoneVerificationSent` tinyint(1) NOT NULL DEFAULT '0',
  `PhoneVerificationUsed` tinyint(1) NOT NULL DEFAULT '0',
  `PhoneVerificationURI` varchar(3000) DEFAULT NULL,
  PRIMARY KEY (`PhoneVerificationID`),
  UNIQUE KEY `MailVerificationID_UNIQUE` (`PhoneVerificationID`),
  KEY `PhoneVerificationRef_idx` (`PhoneVerificationPhone`),
  CONSTRAINT `PhoneVerificationRef` FOREIGN KEY (`PhoneVerificationPhone`) REFERENCES `Phones` (`PhoneId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`dba`@`%`*/ /*!50003 TRIGGER `PhoneVerifications_BEFORE_INSERT` BEFORE INSERT ON `PhoneVerifications` FOR EACH ROW BEGIN
	SET NEW.PhoneVerificationExpiresAt = DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 10 MINUTE);
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `Phones`
--

DROP TABLE IF EXISTS `Phones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Phones` (
  `PhoneId` bigint NOT NULL AUTO_INCREMENT,
  `PhoneUser` bigint NOT NULL,
  `PhoneAddress` varchar(320) NOT NULL,
  `PhoneCreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `PhoneVerificated` tinyint(1) NOT NULL DEFAULT '0',
  `PhoneVerificationAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`PhoneId`),
  UNIQUE KEY `MailId_UNIQUE` (`PhoneId`),
  UNIQUE KEY `MailAddress_UNIQUE` (`PhoneAddress`),
  KEY `PhoneUserRef_idx` (`PhoneUser`),
  CONSTRAINT `PhoneUserRef` FOREIGN KEY (`PhoneUser`) REFERENCES `Users` (`UserId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Pronoums`
--

DROP TABLE IF EXISTS `Pronoums`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Pronoums` (
  `PronoumID` int NOT NULL AUTO_INCREMENT,
  `PronoumName` varchar(45) NOT NULL,
  `PronoumIcon` varchar(45) NOT NULL,
  PRIMARY KEY (`PronoumID`),
  UNIQUE KEY `PronoumName_UNIQUE` (`PronoumName`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `SelectedPeople`
--

DROP TABLE IF EXISTS `SelectedPeople`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SelectedPeople` (
  `SelectedFrom` bigint NOT NULL,
  `SelectedUser` bigint NOT NULL,
  `SelectedDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`SelectedFrom`,`SelectedUser`),
  UNIQUE KEY `SelectedKey_UNIQUE` (`SelectedFrom`,`SelectedUser`),
  KEY `SelectedUserRef` (`SelectedUser`),
  CONSTRAINT `SelectedFromRef` FOREIGN KEY (`SelectedFrom`) REFERENCES `Users` (`UserId`),
  CONSTRAINT `SelectedUserRef` FOREIGN KEY (`SelectedUser`) REFERENCES `Users` (`UserId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `States`
--

DROP TABLE IF EXISTS `States`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `States` (
  `StateId` int NOT NULL AUTO_INCREMENT,
  `StateName` varchar(350) NOT NULL,
  `StateCountry` int NOT NULL,
  `StateHasCities` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`StateId`),
  UNIQUE KEY `StateId_UNIQUE` (`StateId`),
  KEY `CountryStateRef_idx` (`StateCountry`),
  CONSTRAINT `CountryStateRef` FOREIGN KEY (`StateCountry`) REFERENCES `Countries` (`CountryId`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ThidleSettings`
--

DROP TABLE IF EXISTS `ThidleSettings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ThidleSettings` (
  `Name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Value` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`Name`),
  UNIQUE KEY `Rule_UNIQUE` (`Name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ThoughtAudios`
--

DROP TABLE IF EXISTS `ThoughtAudios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ThoughtAudios` (
  `ThoughtAudioThought` bigint NOT NULL,
  `ThoughtAudioAudio` bigint NOT NULL,
  `ThoughtAudioCreation` timestamp NOT NULL,
  `ThoughtAudioUser` bigint NOT NULL,
  PRIMARY KEY (`ThoughtAudioThought`,`ThoughtAudioAudio`),
  UNIQUE KEY `ThoughtAudioThought_UNIQUE` (`ThoughtAudioThought`,`ThoughtAudioAudio`),
  KEY `ThoughtAudioAudioRef_idx` (`ThoughtAudioAudio`),
  KEY `ThoughtAudioUserRef_idx` (`ThoughtAudioUser`),
  CONSTRAINT `ThoughtAudioAudioRef` FOREIGN KEY (`ThoughtAudioAudio`) REFERENCES `Audios` (`AudioID`),
  CONSTRAINT `ThoughtAudioThoughtRef` FOREIGN KEY (`ThoughtAudioThought`) REFERENCES `Thoughts` (`ThoughtID`),
  CONSTRAINT `ThoughtAudioUserRef` FOREIGN KEY (`ThoughtAudioUser`) REFERENCES `Users` (`UserId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ThoughtImages`
--

DROP TABLE IF EXISTS `ThoughtImages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ThoughtImages` (
  `ThoughtImage` bigint NOT NULL AUTO_INCREMENT,
  `ThoughtImageThought` bigint NOT NULL,
  `ThoughtImageCreation` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ThoughtImageUser` bigint NOT NULL,
  `ThoughtImageOriginalFile` bigint NOT NULL,
  PRIMARY KEY (`ThoughtImage`,`ThoughtImageThought`),
  UNIQUE KEY `ThoughtImageThought_UNIQUE` (`ThoughtImageThought`),
  UNIQUE KEY `ThoughtsImageImage_UNIQUE` (`ThoughtImage`),
  CONSTRAINT `ThoughtImageImageRef` FOREIGN KEY (`ThoughtImage`) REFERENCES `Images` (`ImageID`),
  CONSTRAINT `ThoughtImageThoughtRef` FOREIGN KEY (`ThoughtImageThought`) REFERENCES `Thoughts` (`ThoughtID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ThoughtLikes`
--

DROP TABLE IF EXISTS `ThoughtLikes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ThoughtLikes` (
  `ThoughtLikeThought` bigint NOT NULL,
  `ThoughtLikeBy` bigint NOT NULL,
  `ThoughtLikeCreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ThoughtLikeThought`,`ThoughtLikeBy`),
  UNIQUE KEY `ThoughtLikeThought_UNIQUE` (`ThoughtLikeThought`,`ThoughtLikeBy`) /*!80000 INVISIBLE */,
  KEY `ThoughtLikeUserRef_idx` (`ThoughtLikeBy`),
  CONSTRAINT `ThoughtLikeThoughtRef` FOREIGN KEY (`ThoughtLikeThought`) REFERENCES `Thoughts` (`ThoughtID`),
  CONSTRAINT `ThoughtLikeUserRef` FOREIGN KEY (`ThoughtLikeBy`) REFERENCES `Users` (`UserId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`dba`@`%`*/ /*!50003 TRIGGER `ThoughtLikes_AFTER_INSERT` AFTER INSERT ON `ThoughtLikes` FOR EACH ROW BEGIN
	UPDATE Thoughts SET ThoughtLikeCount = ThoughtLikeCount+1 WHERE ThoughtID = NEW.ThoughtLikeThought;
	UPDATE Users SET UserMadeLikeCount = UserMadeLikeCount+1 WHERE UserId = NEW.ThoughtLikeBy;
	UPDATE Users SET UserReceivedLikeCount = UserReceivedLikeCount+1 WHERE UserId = (SELECT ThoughtMadeBy FROM Thoughts WHERE ThoughtID = NEW.ThoughtLikeThought);
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`dba`@`%`*/ /*!50003 TRIGGER `ThoughtLikes_AFTER_DELETE` AFTER DELETE ON `ThoughtLikes` FOR EACH ROW BEGIN
	UPDATE Thoughts SET ThoughtLikeCount = ThoughtLikeCount-1 WHERE ThoughtID = OLD.ThoughtLikeThought;
	UPDATE Users SET UserMadeLikeCount = UserMadeLikeCount-1 WHERE UserId = OLD.ThoughtLikeBy;
	UPDATE Users SET UserReceivedLikeCount = UserReceivedLikeCount-1 WHERE UserId = (SELECT ThoughtMadeBy FROM Thoughts WHERE ThoughtID = OLD.ThoughtLikeThought);
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `ThoughtPoll`
--

DROP TABLE IF EXISTS `ThoughtPoll`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ThoughtPoll` (
  `ThoughtPollID` bigint NOT NULL AUTO_INCREMENT,
  `ThoughtPollThought` bigint NOT NULL,
  `ThoughtPollTitle` varchar(100) NOT NULL,
  `ThoughtPollCreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ThoughtPollUser` bigint NOT NULL,
  `ThoughtPollHasRightAnswer` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`ThoughtPollID`),
  UNIQUE KEY `ThoughtPollID_UNIQUE` (`ThoughtPollID`),
  KEY `ThoughtPollThoughtRef_idx` (`ThoughtPollThought`),
  KEY `ThoughtPollUserRef_idx` (`ThoughtPollUser`),
  CONSTRAINT `ThoughtPollThoughtRef` FOREIGN KEY (`ThoughtPollThought`) REFERENCES `Thoughts` (`ThoughtID`),
  CONSTRAINT `ThoughtPollUserRef` FOREIGN KEY (`ThoughtPollUser`) REFERENCES `Users` (`UserId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ThoughtPollAnswers`
--

DROP TABLE IF EXISTS `ThoughtPollAnswers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ThoughtPollAnswers` (
  `ThoughtPollAnswerUser` bigint NOT NULL,
  `ThoughtPollAnswerPoll` bigint NOT NULL,
  `ThoughtPollAnswerOption` bigint NOT NULL,
  `ThoughtPollAnswerDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ThoughtPollAnswerUser`,`ThoughtPollAnswerPoll`),
  UNIQUE KEY `ThoughtPollAnswer_UNIQUE` (`ThoughtPollAnswerUser`,`ThoughtPollAnswerPoll`),
  KEY `ThoughtPollAnswerPollRef_idx` (`ThoughtPollAnswerPoll`) /*!80000 INVISIBLE */,
  KEY `ThoughtPollAnswerOptionRef_idx` (`ThoughtPollAnswerOption`),
  KEY `ToughtPollAnswerIndex` (`ThoughtPollAnswerPoll`,`ThoughtPollAnswerOption`,`ThoughtPollAnswerUser`),
  CONSTRAINT `ThoughtPollAnswerOptionRef` FOREIGN KEY (`ThoughtPollAnswerOption`) REFERENCES `ThoughtPollOptions` (`ThoughtPollOptionPoll`),
  CONSTRAINT `ThoughtPollAnswerPollRef` FOREIGN KEY (`ThoughtPollAnswerPoll`) REFERENCES `ThoughtPoll` (`ThoughtPollID`),
  CONSTRAINT `ThoughtPollAnswerUserRef` FOREIGN KEY (`ThoughtPollAnswerUser`) REFERENCES `Users` (`UserId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ThoughtPollOptions`
--

DROP TABLE IF EXISTS `ThoughtPollOptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ThoughtPollOptions` (
  `ThoughtPollOptionID` bigint NOT NULL AUTO_INCREMENT,
  `ThoughtPollOptionPoll` bigint NOT NULL,
  `ThoughtPollOptionValue` varchar(300) NOT NULL,
  `ThoughtPollOptionIsRight` tinyint(1) NOT NULL,
  `ThoughtPollOptionAnswerAverage` float NOT NULL DEFAULT '0',
  PRIMARY KEY (`ThoughtPollOptionID`),
  UNIQUE KEY `ThoughtPollOptionID_UNIQUE` (`ThoughtPollOptionID`),
  KEY `ThoughtPollOptionRef_idx` (`ThoughtPollOptionPoll`),
  CONSTRAINT `ThoughtPollOptionRef` FOREIGN KEY (`ThoughtPollOptionPoll`) REFERENCES `ThoughtPoll` (`ThoughtPollID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ThoughtVideos`
--

DROP TABLE IF EXISTS `ThoughtVideos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ThoughtVideos` (
  `ThoughtVideoThought` bigint NOT NULL AUTO_INCREMENT,
  `ThoughtVideo` bigint NOT NULL,
  `ThoughtVideoCreation` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ThoughtVideoUser` bigint NOT NULL,
  PRIMARY KEY (`ThoughtVideoThought`,`ThoughtVideo`),
  UNIQUE KEY `ThoughtVideoThought_UNIQUE` (`ThoughtVideoThought`,`ThoughtVideo`),
  KEY `ThoughtVideoUserRef_idx` (`ThoughtVideoUser`),
  KEY `ThoughtVideoRef_idx` (`ThoughtVideo`),
  CONSTRAINT `ThoughtVideoRef` FOREIGN KEY (`ThoughtVideo`) REFERENCES `Videos` (`VideoID`),
  CONSTRAINT `ThoughtVideoThoughtRef` FOREIGN KEY (`ThoughtVideoThought`) REFERENCES `Thoughts` (`ThoughtID`),
  CONSTRAINT `ThoughtVideoUserRef` FOREIGN KEY (`ThoughtVideoUser`) REFERENCES `Users` (`UserId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Thoughts`
--

DROP TABLE IF EXISTS `Thoughts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Thoughts` (
  `ThoughtID` bigint NOT NULL AUTO_INCREMENT,
  `ThoughtMadeBy` bigint NOT NULL,
  `ThoughtText` text,
  `ThoughtCreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ThoughtActiveAt` timestamp NULL DEFAULT NULL,
  `ThoughtPrivacyStatus` char(1) NOT NULL COMMENT 'P = PUBLIC\nF = FRIENDS ONLY (FOLLOWERS THAT I FOLLOW)\nS = SELECTED PEOPLE (LIST OF SELECTED PEOPLE)\nA = ANONYMOUS',
  `ThoughtCommentPrivacy` char(1) NOT NULL COMMENT 'P = PUBLIC\nF = FRIENDS ONLY (FOLLOWERS THAT I FOLLOW)\nT = TAGGED PEOPLE ONLY\nD = DISABLED',
  `ThoughtLikeCount` bigint NOT NULL DEFAULT '0',
  `ThoughtCommentCount` bigint NOT NULL DEFAULT '0',
  `ThoughtRethoughtCount` bigint NOT NULL DEFAULT '0',
  `ThoughtShareCount` bigint NOT NULL DEFAULT '0',
  `ThoughtInteractionCount` bigint NOT NULL DEFAULT '0',
  `ThoughtParent` bigint DEFAULT NULL,
  `ThoughtEmbeed` bigint DEFAULT NULL,
  `ThoughtEdited` tinyint(1) NOT NULL DEFAULT '0',
  `ThoughtIsRethought` tinyint(1) NOT NULL DEFAULT '0',
  `ThoughtPublished` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`ThoughtID`),
  UNIQUE KEY `ThoughtId_UNIQUE` (`ThoughtID`),
  KEY `ThoughtUserRef_idx` (`ThoughtMadeBy`) /*!80000 INVISIBLE */,
  KEY `ThoughtParentRef_idx` (`ThoughtParent`) /*!80000 INVISIBLE */,
  KEY `ThoughtEmbeedRef_idx` (`ThoughtEmbeed`) /*!80000 INVISIBLE */,
  KEY `ThoughtRethoughtBy_Idx` (`ThoughtIsRethought`,`ThoughtMadeBy`) /*!80000 INVISIBLE */,
  KEY `ThoughtViewIndex` (`ThoughtPublished`,`ThoughtActiveAt`),
  KEY `ThoughtParent_idx` (`ThoughtParent`,`ThoughtMadeBy`),
  KEY `ThoughtEmbeed_idx` (`ThoughtEmbeed`,`ThoughtMadeBy`),
  CONSTRAINT `ThoughtEmbeedRef` FOREIGN KEY (`ThoughtEmbeed`) REFERENCES `Thoughts` (`ThoughtID`),
  CONSTRAINT `ThoughtParentRef` FOREIGN KEY (`ThoughtParent`) REFERENCES `Thoughts` (`ThoughtID`),
  CONSTRAINT `ThoughtUserRef` FOREIGN KEY (`ThoughtMadeBy`) REFERENCES `Users` (`UserId`)
) ENGINE=InnoDB AUTO_INCREMENT=4060054 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `ThoughtsByDate`
--

DROP TABLE IF EXISTS `ThoughtsByDate`;
/*!50001 DROP VIEW IF EXISTS `ThoughtsByDate`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `ThoughtsByDate` AS SELECT 
 1 AS `ThoughtID`,
 1 AS `ThoughtMadeBy`,
 1 AS `ThoughtParent`,
 1 AS `ThoughtIsRethought`,
 1 AS `ThoughtPrivacyStatus`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `Tokens`
--

DROP TABLE IF EXISTS `Tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Tokens` (
  `TokenUser` bigint NOT NULL,
  `TokenHash` varchar(64) NOT NULL,
  `TokenType` char(1) NOT NULL COMMENT 'T = Token\nR = Revalidate Token',
  `TokenCreation` bigint NOT NULL,
  `TokenExpiration` bigint NOT NULL,
  `TokenInvalidated` tinyint(1) NOT NULL,
  `TokenRevokeDate` bigint DEFAULT NULL,
  PRIMARY KEY (`TokenUser`,`TokenHash`,`TokenType`),
  UNIQUE KEY `Token_UNIQUE` (`TokenUser`,`TokenHash`,`TokenType`),
  CONSTRAINT `TokenUserRef` FOREIGN KEY (`TokenUser`) REFERENCES `Users` (`UserId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `UploadFiles`
--

DROP TABLE IF EXISTS `UploadFiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `UploadFiles` (
  `FileID` bigint NOT NULL AUTO_INCREMENT,
  `FileName` varchar(255) NOT NULL,
  `FileHash` varchar(255) NOT NULL,
  `FileCreation` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `FileUploaded` tinyint(1) NOT NULL DEFAULT '0',
  `FileUploadStart` timestamp NULL DEFAULT NULL,
  `FileUploadEnd` timestamp NULL DEFAULT NULL,
  `FileUploadHash` varchar(512) NOT NULL,
  `FileSegments` int NOT NULL DEFAULT '0',
  `FileUploadUpdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `FileTo` char(1) NOT NULL COMMENT 'I = IMAGE\nV = VIDEO\nA = AUDIO',
  `FileSize` bigint NOT NULL DEFAULT '0',
  `FileBy` bigint NOT NULL,
  PRIMARY KEY (`FileID`),
  UNIQUE KEY `FileID_UNIQUE` (`FileID`),
  KEY `FileHash_idx` (`FileHash`),
  KEY `FileUploadHash_idx` (`FileUploadHash`),
  KEY `FileUserRef_idx` (`FileBy`),
  CONSTRAINT `FileUserRef` FOREIGN KEY (`FileBy`) REFERENCES `Users` (`UserId`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `UserAdditionalInfo`
--

DROP TABLE IF EXISTS `UserAdditionalInfo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `UserAdditionalInfo` (
  `UserID` bigint NOT NULL,
  `UserLocation` bigint DEFAULT NULL,
  `UserPronoum` int DEFAULT NULL,
  `UserInstagram` varchar(50) DEFAULT NULL,
  `UserWebsite` varchar(1500) DEFAULT NULL,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `UserID_UNIQUE` (`UserID`),
  KEY `LocationRef_idx` (`UserLocation`),
  KEY `PronoumRef_idx` (`UserPronoum`),
  CONSTRAINT `AdditionalInfoUserRef` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserId`),
  CONSTRAINT `LocationRef` FOREIGN KEY (`UserLocation`) REFERENCES `Locations` (`LocationID`),
  CONSTRAINT `PronoumRef` FOREIGN KEY (`UserPronoum`) REFERENCES `Pronoums` (`PronoumID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `UserId` bigint NOT NULL AUTO_INCREMENT,
  `UserName` varchar(50) NOT NULL,
  `UserUsername` varchar(25) NOT NULL,
  `UserBirthday` date NOT NULL,
  `UserDescription` varchar(350) DEFAULT NULL,
  `UserProfilePicture` bigint DEFAULT NULL,
  `UserProfileBackground` bigint DEFAULT NULL,
  `UserMadeLikeCount` bigint NOT NULL DEFAULT '0',
  `UserMediaCount` bigint NOT NULL DEFAULT '0',
  `UserObserverCount` bigint NOT NULL DEFAULT '0',
  `UserObservingCount` bigint NOT NULL DEFAULT '0',
  `UserFastMediaCount` bigint NOT NULL DEFAULT '0',
  `UserMadeCommentCount` bigint NOT NULL DEFAULT '0',
  `UserReceivedCommentCount` bigint NOT NULL DEFAULT '0',
  `UserReceivedLikeCount` bigint NOT NULL DEFAULT '0',
  `UserIsPrivate` tinyint(1) NOT NULL DEFAULT '0',
  `UserCreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UserUpdatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `UserPassword` varchar(250) NOT NULL,
  `UserIsVerified` tinyint(1) NOT NULL DEFAULT '0',
  `UserPublicKey` tinyblob,
  `UserPrivateKey` tinyblob,
  `UserServerPrivateKey` tinyblob,
  `UserServerPublicKey` tinyblob,
  PRIMARY KEY (`UserId`),
  UNIQUE KEY `UserId_UNIQUE` (`UserId`),
  UNIQUE KEY `UserUsername_UNIQUE` (`UserUsername`),
  KEY `Username_Idx` (`UserUsername`) /*!80000 INVISIBLE */,
  KEY `User_name_idx` (`UserName`),
  KEY `ProfilePictureRef_idx` (`UserProfilePicture`),
  KEY `BackgroundPictureRef_idx` (`UserProfileBackground`),
  CONSTRAINT `BackgroundPictureRef` FOREIGN KEY (`UserProfileBackground`) REFERENCES `Images` (`ImageID`),
  CONSTRAINT `ProfilePictureRef` FOREIGN KEY (`UserProfilePicture`) REFERENCES `Images` (`ImageID`)
) ENGINE=InnoDB AUTO_INCREMENT=400003 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`dba`@`%`*/ /*!50003 TRIGGER `Users_AFTER_UPDATE` AFTER UPDATE ON `Users` FOR EACH ROW BEGIN
	IF OLD.UserIsPrivate = 1 AND NEW.UserIsPrivate = 0 THEN
		UPDATE `Follows` SET FollowApproveStatus = 'A' WHERE FollowTo = OLD.UserID AND FollowNeedApproval = 1 AND FollowApproveStatus = 'P';
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `VideoManifests`
--

DROP TABLE IF EXISTS `VideoManifests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `VideoManifests` (
  `ManifestId` bigint NOT NULL AUTO_INCREMENT,
  `ManifestVideo` bigint NOT NULL,
  `ManifestType` int NOT NULL,
  `ManifestCodec` int NOT NULL,
  `ManifestContainer` int NOT NULL,
  `ManifestFile` bigint NOT NULL,
  PRIMARY KEY (`ManifestId`),
  UNIQUE KEY `ManifestId_UNIQUE` (`ManifestId`),
  KEY `VideoManifestFile_idx` (`ManifestFile`),
  KEY `VideoManifestCodec_idx` (`ManifestCodec`),
  KEY `VideoManifestContainer_idx` (`ManifestContainer`),
  KEY `VideoManifestMime_idx` (`ManifestType`),
  KEY `VideoManifestVideo_idx` (`ManifestVideo`),
  CONSTRAINT `VideoManifestCodec` FOREIGN KEY (`ManifestCodec`) REFERENCES `MediaCodecs` (`CodecID`),
  CONSTRAINT `VideoManifestContainer` FOREIGN KEY (`ManifestContainer`) REFERENCES `MediaContainers` (`ContainerID`),
  CONSTRAINT `VideoManifestFile` FOREIGN KEY (`ManifestFile`) REFERENCES `UploadFiles` (`FileID`),
  CONSTRAINT `VideoManifestMime` FOREIGN KEY (`ManifestType`) REFERENCES `MimeTypes` (`MimeTypeID`),
  CONSTRAINT `VideoManifestVideo` FOREIGN KEY (`ManifestVideo`) REFERENCES `Videos` (`VideoID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `VideoOptions`
--

DROP TABLE IF EXISTS `VideoOptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `VideoOptions` (
  `VideoOptionID` bigint NOT NULL AUTO_INCREMENT,
  `VideoOptionManifest` bigint NOT NULL,
  `VideoOptionBitrate` int NOT NULL,
  `VideoOptionSizeX` int NOT NULL,
  `VideoOptionSizeY` int NOT NULL,
  `VideoOptionFile` bigint NOT NULL,
  `VideoOptionConversionTime` time NOT NULL,
  PRIMARY KEY (`VideoOptionID`),
  UNIQUE KEY `VideoMetadataID_UNIQUE` (`VideoOptionID`),
  KEY `VideoOptionFile_idx` (`VideoOptionFile`),
  KEY `VideoOptionManifest_idx` (`VideoOptionManifest`),
  CONSTRAINT `VideoOptionFile` FOREIGN KEY (`VideoOptionFile`) REFERENCES `UploadFiles` (`FileID`),
  CONSTRAINT `VideoOptionManifest` FOREIGN KEY (`VideoOptionManifest`) REFERENCES `VideoManifests` (`ManifestId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Videos`
--

DROP TABLE IF EXISTS `Videos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Videos` (
  `VideoID` bigint NOT NULL AUTO_INCREMENT,
  `VideoName` varchar(512) NOT NULL,
  `VideoOriginalX` int NOT NULL,
  `VideoOriginalY` int NOT NULL,
  `VideoOriginalContainer` int NOT NULL,
  `VideoOriginalVideoCodec` int NOT NULL,
  `VideoOriginalAudioCodec` int NOT NULL,
  `VideoOriginalMime` int NOT NULL,
  `VideoColorSpace` varchar(45) NOT NULL,
  `VideoIsHDR` tinyint(1) NOT NULL,
  `VideoOriginalBitrate` int NOT NULL,
  `VideoOriginalFramerate` int NOT NULL,
  `VideoCreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `VideoSize` bigint NOT NULL,
  `VideoFile` bigint NOT NULL,
  `VideoCreatedBy` bigint NOT NULL,
  PRIMARY KEY (`VideoID`),
  UNIQUE KEY `VideoID_UNIQUE` (`VideoID`),
  KEY `VideoUserRef_idx` (`VideoCreatedBy`),
  KEY `VideoFileRef_idx` (`VideoFile`),
  KEY `VideoContainerRef_idx` (`VideoOriginalContainer`),
  KEY `VideoCodecRef_idx` (`VideoOriginalVideoCodec`),
  KEY `VideoAudioCodecRef_idx` (`VideoOriginalAudioCodec`),
  KEY `VideoMimeRef_idx` (`VideoOriginalMime`),
  CONSTRAINT `VideoAudioCodecRef` FOREIGN KEY (`VideoOriginalAudioCodec`) REFERENCES `MediaCodecs` (`CodecID`),
  CONSTRAINT `VideoCodecRef` FOREIGN KEY (`VideoOriginalVideoCodec`) REFERENCES `MediaCodecs` (`CodecID`),
  CONSTRAINT `VideoContainerRef` FOREIGN KEY (`VideoOriginalContainer`) REFERENCES `MediaContainers` (`ContainerID`),
  CONSTRAINT `VideoFileRef` FOREIGN KEY (`VideoFile`) REFERENCES `UploadFiles` (`FileID`),
  CONSTRAINT `VideoMimeRef` FOREIGN KEY (`VideoOriginalMime`) REFERENCES `MimeTypes` (`MimeTypeID`),
  CONSTRAINT `VideoUserRef` FOREIGN KEY (`VideoCreatedBy`) REFERENCES `Users` (`UserId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping events for database 'ThidleDB'
--

--
-- Dumping routines for database 'ThidleDB'
--
/*!50003 DROP FUNCTION IF EXISTS `GetFollowStatus` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`dba`@`%` FUNCTION `GetFollowStatus`(FOLLOW_FROM BIGINT, FOLLOW_TO BIGINT) RETURNS json
BEGIN
	DECLARE FollowInfo JSON DEFAULT NULL;
    
    SET FollowInfo = (
		SELECT JSON_OBJECT(
			'status', IF(FollowNeedApproval = 0, 1, 
				CASE
					WHEN FollowApproveStatus = 'A' THEN 1
					WHEN FollowApproveStatus = 'P' THEN 2
					WHEN FollowApproveStatus = 'R' THEN 0
					ELSE 0
				END
			),
            'date', FollowCreatedAt
		)
		FROM `Follows` 
        WHERE FollowFrom = FOLLOW_FROM AND FollowTo = FOLLOW_TO
	);
    
	RETURN IF(FollowInfo IS NULL, 
		JSON_OBJECT('status', 0),
        FollowInfo
	);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `GetImage` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`dba`@`%` FUNCTION `GetImage`(Id BIGINT) RETURNS json
BEGIN
	IF Id IS NULL THEN
		RETURN NULL;
	ELSE
		RETURN (
            SELECT 
				JSON_OBJECT('url', CONCAT(
					(
						SELECT Value 
						FROM ThidleSettings 
						WHERE Name = 'THIDLE_IMAGE_URL'
					), 
					DATE_FORMAT(Images.ImageCreatedAt, "%Y%m%d%H%i%s"), 
					'/', 
					UploadFiles.FileHash,
                    '/',
                    CONCAT(Images.ImageID, UploadFiles.FileID),
                    '_',
                    Images.ImageX,
                    'x',
                    Images.ImageY,
                    '.',
                    MimeTypes.MimeTypeExtension
				), 
				'alt', Images.ImageAlt)
            FROM ThidleDB.Images
            INNER JOIN UploadFiles ON UploadFiles.FileID = Images.ImageFile
            INNER JOIN MimeTypes ON MimeTypeID = Images.ImageMime
            WHERE ImageId = Id
		);
	END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `GetPronoum` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`dba`@`%` FUNCTION `GetPronoum`(PID INT) RETURNS json
BEGIN
	RETURN (SELECT JSON_OBJECT('pronoums', PronoumName, 'icon', PronoumIcon) FROM Pronoums WHERE PronoumID = PID);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `GetThought` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`dba`@`%` FUNCTION `GetThought`(ThoughtID BIGINT, CurrentUser BIGINT, MaxComments INT, MaxDepht INT, CurrentDepht INT) RETURNS json
BEGIN
	DECLARE ThoughtResult JSON DEFAULT NULL;
	CALL ThidleDB.GetThought(ThoughtID, CurrentUser, TRUE, CEIL(MaxComments / CurrentDepht), MaxDepht, CurrentDepht, TRUE, TRUE, ThoughtResult);
	RETURN (SELECT ThoughtResult);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `GetThoughtImages` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`dba`@`%` FUNCTION `GetThoughtImages`(TID BIGINT) RETURNS json
BEGIN
	RETURN (SELECT JSON_ARRAYAGG(GetImage(ThoughtImage)) FROM ThoughtImages WHERE ThoughtImageThought = TID ORDER BY ThoughtImageCreation ASC);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `GetThoughtPoll` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`dba`@`%` FUNCTION `GetThoughtPoll`(TID BIGINT, CurrentUser BIGINT) RETURNS json
BEGIN
	RETURN (
		SELECT JSON_ARRAYAGG(JSON_OBJECT(
			'title', ThoughtPollTitle, 
            'right', ThoughtPollHasRightAnswer = 1, 
            'options', (
				SELECT JSON_ARRAYAGG(JSON_OBJECT(
					'id', ThoughtPollOptionID,
					'value', ThoughtPollOptionValue,
                    'right', ThoughtPollOptionIsRight = 1,
                    'average', ThoughtPollOptionAnswerAverage
                ))
                FROM ThoughtPollOptions 
                WHERE ThoughtPollOptionPoll = ThoughtPollID
			),
            'selected', (
				SELECT ThoughtPollAnswerOption 
                FROM ThoughtPollAnswers 
                WHERE 
					ThoughtPollAnswerUser = CurrentUser AND 
                    ThoughtPollAnswerPoll = ThoughtPollID
			)
		))
        FROM ThoughtPoll
        WHERE ThoughtPollThought = TID 
        ORDER BY ThoughtPollCreatedAt ASC
	);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `GetThoughtUser` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`dba`@`%` FUNCTION `GetThoughtUser`(Privacy JSON, UID BIGINT, VIEWERID BIGINT) RETURNS json
BEGIN
	RETURN 
        IF(
			Privacy = 'A' AND VIEWERID != UID, 
			JSON_OBJECT(
				'id', NULL, 
				'name', NULL, 
				'username', NULL,
				'description', NULL,
				'picture', NULL,
				'private', CAST(1 = 0 as JSON)
			), (
				SELECT JSON_OBJECT(
					'id', UserId, 
					'name', UserName, 
					'username', UserUsername,
					'description', UserDescription,
					'picture', GetImage(UserProfilePicture),
					'private', CAST(UserIsPrivate = 1 as JSON)
				)
				FROM Users WHERE UserId = UID
			)
		);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `GetThoughtVideos` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`dba`@`%` FUNCTION `GetThoughtVideos`(TID BIGINT) RETURNS json
BEGIN
	RETURN (
		SELECT JSON_ARRAYAGG(GetVideo(ThoughtVideo)) 
        FROM ThoughtVideos
        WHERE ThoughtVideoThought = TID 
        ORDER BY ThoughtVideoCreation ASC
	);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `GetUserAdditionalInfo` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`dba`@`%` FUNCTION `GetUserAdditionalInfo`(UID BIGINT) RETURNS json
BEGIN
	RETURN (
		SELECT JSON_OBJECT(
			'location', LocationName,
            'instagram', UserInstagram,
            'website', UserWebsite,
            'pronoum', GetPronoum(UserPronoum)
		) 
        FROM UserAdditionalInfo 
        LEFT JOIN Locations ON LocationID = UserLocation
        WHERE UserID = UID
	);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `GetVideo` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`dba`@`%` FUNCTION `GetVideo`(Id BIGINT) RETURNS json
BEGIN
	IF Id IS NULL THEN
		RETURN NULL;
	ELSE
		RETURN (
			SELECT 
				JSON_ARRAYAGG(
					CONCAT(
						(
							SELECT Value 
							FROM ThidleSettings 
							WHERE Name = 'THIDLE_VIDEO_URL'
						), 
						DATE_FORMAT(UploadFiles.FileCreation, "%Y/%m/%d/%H/%i/%s"), 
						'/', 
						UploadFiles.FileHash,
						'/mnfst'
					)
                )
            FROM ThidleDB.Videos
            INNER JOIN UploadFiles ON UploadFiles.FileID = ManifestFile
            WHERE ManifestVideo = Id
		);
	END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetThought` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`dba`@`%` PROCEDURE `GetThought`(
	IN GetThoughtID BIGINT, 
    IN CurrentUser BIGINT, 
    
    IN GetComments BOOLEAN,  
    IN MaxComments INT, 
    IN MaxDepht INT, 
    IN CurrentDepht INT, 
    
    IN GetParent BOOLEAN,
    IN GetEmbeed BOOLEAN,
    OUT Thought JSON
)
BEGIN 
	# Declare Variables for data storing 
	DECLARE ThoughtInfo JSON DEFAULT NULL;
	DECLARE EmbeededThoughtInfo JSON DEFAULT NULL;
	DECLARE ParentThoughtInfo JSON DEFAULT NULL;
	DECLARE CommentThoughtInfo JSON DEFAULT NULL;

	# Get Thought Info Data
	SELECT JSON_OBJECT(
		'id', ThoughtID,
		'by', ThoughtMadeBy,
		'text', ThoughtText,
		'date', ThoughtActiveAt,
		'thoughtPrivacy', ThoughtPrivacyStatus,
		'commentPrivacy', ThoughtCommentPrivacy,
		'likes', ThoughtLikeCount,
		'comments', ThoughtCommentCount,
		'rethoughts', ThoughtRethoughtCount,
		'shares', ThoughtShareCount,
		'embeed', ThoughtEmbeed,
		'parent', ThoughtParent,
        'isRethought', ThoughtIsRethought,
        'edited', ThoughtEdited
	)
	FROM Thoughts
	WHERE ThoughtID = GetThoughtID
    INTO ThoughtInfo;
    
    IF ThoughtInfo->'$.id' IS NOT NULL THEN
		
		/*
			Here is a little complicated: 
			If get embeeded is set to TRUE, then ask the thought, are you a rethought?
			If yes, then it needs to have it's own embeeded thought and the embeeded thought comments, because a rethought is nothing more than an embeeded thought inside a thought.
			If it is not a rethought, then just bring the default information, without the comments and/or the embeed
			
			Notes: 
				1 - Something is a rethought if it only has the rethought. If it has anything above the embeeded, it is counted as a normal thought.
				2 - It is impossible for a rethought to be rethoughted. If it happens, it will rethought the embeeded thought.
		*/
		IF (GetEmbeed = TRUE AND JSON_TYPE(ThoughtInfo->'$.embeed') != 'NULL') THEN
			CALL GetThought(
				ThoughtInfo->'$.embeed', 
				CurrentUser,
				IF(ThoughtInfo->'$.isRethought' = 1, TRUE, FALSE),
                MaxComments,
                MaxDepht,
                CurrentDepht,
				TRUE,
				IF(ThoughtInfo->'$.isRethought' = 1, TRUE, FALSE),
				EmbeededThoughtInfo
			);
		END IF;
		
		/*
			If the thought has a parent thought, then recover it.
			Note: the rethought will only be shown if the parent owner is followed by the caller.
		*/
		IF (GetParent = TRUE AND JSON_TYPE(ThoughtInfo->'$.parent') != 'NULL') THEN
			CALL GetThought(
				ThoughtInfo->'$.parent', 
				CurrentUser,
				TRUE,
                MaxComments,
                MaxDepht,
                CurrentDepht,
				FALSE,
				FALSE,
				ParentThoughtInfo
			);
		END IF;
		
		
		# Get Comments if need to. 
        # For it, check if get comments is TRUE, if so, 
        # check if max comments is bigger than 0, and 
        # finally, check if current depht is lower
        # than current depht and current depht is 
        # lower than max recursive call stack
		IF (GetComments = TRUE AND MaxComments > 0 AND MaxDepht >= CurrentDepht AND CurrentDepht < 250) THEN
			CALL GetThoughtComments(
				ThoughtInfo->'$.id', 
				CurrentUser,
                MaxComments,
                MaxDepht,
                CurrentDepht,
				CommentThoughtInfo
			);
		END IF;
		
		SELECT JSON_OBJECT(
			'id', ThoughtInfo->'$.id',
			'by', GetThoughtUser(ThoughtInfo->'$.thoughtPrivacy', ThoughtInfo->'$.by', CurrentUser),
			'images', GetThoughtImages(ThoughtInfo->'$.id'),
			'videos', GetThoughtVideos(ThoughtInfo->'$.id'),
            'poll', GetThoughtPoll(ThoughtInfo->'$.id', CurrentUser),
			'text', ThoughtInfo->'$.text',
			'date', ThoughtInfo->'$.date',
			'privacy', JSON_OBJECT(
				'main', ThoughtInfo->'$.thoughtPrivacy',
				'comment', ThoughtInfo->'$.commentPrivacy'
			),
			'count', JSON_OBJECT(
				'like', ThoughtInfo->'$.likes',
				'comment', ThoughtInfo->'$.comments',
				'rethought', ThoughtInfo->'$.rethoughts',
				'share', ThoughtInfo->'$.shares'
			),
			'user', JSON_OBJECT(
				'like', CAST((SELECT COUNT(*) FROM ThoughtLikes WHERE ThoughtLikeThought = CAST(ThoughtInfo->'$.id' AS UNSIGNED) AND ThoughtLikeBy = CurrentUser) = 1 AS JSON),
				'comment', CAST((SELECT COUNT(*) FROM Thoughts WHERE ThoughtParent = CAST(ThoughtInfo->'$.id' AS UNSIGNED) AND ThoughtMadeBy = CurrentUser) > 0 AS JSON),
				'rethought', CAST((SELECT COUNT(*) FROM Thoughts WHERE ThoughtEmbeed = CAST(ThoughtInfo->'$.id' AS UNSIGNED) AND ThoughtMadeBy = CurrentUser) > 0 AS JSON),
                'currentUser', CurrentUser,
                'id', ThoughtInfo->'$.id'
			),
			'embeed', EmbeededThoughtInfo,
			'parent', ParentThoughtInfo,
			'comments', IF(CommentThoughtInfo IS NULL, JSON_ARRAY(), CommentThoughtInfo),
            'rethought', CAST(ThoughtInfo->'$.isRethought' = 1 AS JSON),
			'followed', CAST((SELECT COUNT(*) FROM Follows WHERE FollowFrom = CurrentUser AND FollowTo = CAST(ThoughtInfo->'$.by' as UNSIGNED)) = 1 AS JSON),
			'edited', CAST(ThoughtInfo->'$.edited' = 1 AS JSON)
		) INTO Thought;
	END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetThoughtComments` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`dba`@`%` PROCEDURE `GetThoughtComments`(
	IN CommentThoughtID BIGINT, 
    IN CurrentUser BIGINT, 
    IN MaxComments INT, 
    IN MaxDepht INT, 
    IN CurrentDepht INT, 
    OUT CommentsResult JSON
)
BEGIN
	DECLARE CommentCursorFinished BOOLEAN DEFAULT FALSE;
	DECLARE CommentCurrentId BIGINT DEFAULT NULL;
	DECLARE CommentCurrentRow JSON DEFAULT NULL;
	DECLARE CommentList CURSOR FOR SELECT ThoughtID FROM Thoughts WHERE ThoughtParent = CommentThoughtID LIMIT MaxComments;
	DECLARE CONTINUE HANDLER FOR NOT FOUND SET CommentCursorFinished = TRUE;
    
    SELECT JSON_ARRAY() INTO CommentsResult;
	
    OPEN CommentList;
	CommentLoop: LOOP
		FETCH CommentList INTO CommentCurrentId;
		IF CommentCursorFinished THEN 
			LEAVE CommentLoop; 
		END IF;

		CALL GetThought(CommentCurrentId, CurrentUser, TRUE, MaxComments, MaxDepht, CurrentDepht + 1, FALSE, TRUE, CommentCurrentRow);
        SELECT JSON_ARRAY_APPEND(CommentsResult, '$', CommentCurrentRow) INTO CommentsResult;
	END LOOP CommentLoop;
	CLOSE CommentList;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Final view structure for view `ThoughtsByDate`
--

/*!50001 DROP VIEW IF EXISTS `ThoughtsByDate`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`dba`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `ThoughtsByDate` AS select `Thoughts`.`ThoughtID` AS `ThoughtID`,`Thoughts`.`ThoughtMadeBy` AS `ThoughtMadeBy`,`Thoughts`.`ThoughtParent` AS `ThoughtParent`,`Thoughts`.`ThoughtIsRethought` AS `ThoughtIsRethought`,`Thoughts`.`ThoughtPrivacyStatus` AS `ThoughtPrivacyStatus` from `Thoughts` where ((`Thoughts`.`ThoughtPublished` = 1) and (`Thoughts`.`ThoughtActiveAt` <= now())) order by `Thoughts`.`ThoughtActiveAt` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-01-08 22:00:41
