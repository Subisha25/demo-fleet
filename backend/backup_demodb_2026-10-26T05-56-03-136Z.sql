-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: demodb
-- ------------------------------------------------------
-- Server version	8.4.7

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
-- Table structure for table `booking`
--

DROP TABLE IF EXISTS `booking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking` (
  `bookingId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `bookingDate` datetime DEFAULT NULL,
  `bookingTime` time DEFAULT NULL,
  `signature` varchar(255) DEFAULT NULL,
  `bookingCode` varchar(255) DEFAULT NULL,
  `userId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `employeeId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `pickupPoint` varchar(255) DEFAULT NULL,
  `pickupCity` varchar(255) DEFAULT NULL,
  `pickupArea` varchar(255) DEFAULT NULL,
  `predefinedArea` varchar(255) DEFAULT NULL,
  `dropPoint` varchar(255) DEFAULT NULL,
  `pickupLongitude` varchar(255) DEFAULT NULL,
  `pickupLatitude` varchar(255) DEFAULT NULL,
  `dropLatitude` varchar(255) DEFAULT NULL,
  `dropLongitude` varchar(255) DEFAULT NULL,
  `travellersCount` int DEFAULT NULL,
  `femaleCount` int DEFAULT NULL,
  `maleCount` int DEFAULT NULL,
  `pickupAirport` varchar(255) DEFAULT NULL,
  `pickupStation` varchar(255) DEFAULT NULL,
  `approximatetds2` varchar(255) DEFAULT NULL,
  `approximatetds1` varchar(255) DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `purpose` varchar(255) DEFAULT NULL,
  `confirmStatus` varchar(255) DEFAULT NULL,
  `bookingStatus` varchar(255) DEFAULT NULL,
  `preferredType` varchar(255) DEFAULT NULL,
  `roundTrip` varchar(255) DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `vehicleId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `vehicleMasterId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `paymentId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `vehicleTypeId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `driverId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `createdBy` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `travelLatitude` varchar(255) DEFAULT NULL,
  `travelTrail` json NOT NULL,
  `travelLongitude` varchar(255) DEFAULT NULL,
  `angle` varchar(255) DEFAULT NULL,
  `bookingCreatedBy` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `behalfOfName` varchar(255) DEFAULT NULL,
  `behalfOfPhone` varchar(255) DEFAULT NULL,
  `costCenter` varchar(255) DEFAULT NULL,
  `managerUserId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `managerApprovalToken` text,
  `managerEmail` varchar(255) DEFAULT NULL,
  `autoApproveStatus` varchar(255) DEFAULT NULL,
  `companyId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `selfName` varchar(255) DEFAULT NULL,
  `driverTripStatus` varchar(255) DEFAULT NULL,
  `tenantId` varchar(36) DEFAULT 'e7b8a1c0-0000-0000-0000-000000000001',
  PRIMARY KEY (`bookingId`),
  UNIQUE KEY `bookingCode` (`bookingCode`),
  UNIQUE KEY `bookingCode_2` (`bookingCode`),
  UNIQUE KEY `bookingCode_3` (`bookingCode`),
  UNIQUE KEY `bookingCode_4` (`bookingCode`),
  UNIQUE KEY `bookingCode_5` (`bookingCode`),
  UNIQUE KEY `bookingCode_6` (`bookingCode`),
  UNIQUE KEY `bookingCode_7` (`bookingCode`),
  UNIQUE KEY `bookingCode_8` (`bookingCode`),
  UNIQUE KEY `bookingCode_9` (`bookingCode`),
  UNIQUE KEY `bookingCode_10` (`bookingCode`),
  UNIQUE KEY `bookingCode_11` (`bookingCode`),
  UNIQUE KEY `bookingCode_12` (`bookingCode`),
  UNIQUE KEY `bookingCode_13` (`bookingCode`),
  UNIQUE KEY `bookingCode_14` (`bookingCode`),
  UNIQUE KEY `bookingCode_15` (`bookingCode`),
  UNIQUE KEY `bookingCode_16` (`bookingCode`),
  UNIQUE KEY `bookingCode_17` (`bookingCode`),
  UNIQUE KEY `bookingCode_18` (`bookingCode`),
  UNIQUE KEY `bookingCode_19` (`bookingCode`),
  UNIQUE KEY `bookingCode_20` (`bookingCode`),
  UNIQUE KEY `bookingCode_21` (`bookingCode`),
  UNIQUE KEY `bookingCode_22` (`bookingCode`),
  UNIQUE KEY `bookingCode_23` (`bookingCode`),
  UNIQUE KEY `bookingCode_24` (`bookingCode`),
  UNIQUE KEY `bookingCode_25` (`bookingCode`),
  UNIQUE KEY `bookingCode_26` (`bookingCode`),
  UNIQUE KEY `bookingCode_27` (`bookingCode`),
  UNIQUE KEY `bookingCode_28` (`bookingCode`),
  UNIQUE KEY `bookingCode_29` (`bookingCode`),
  UNIQUE KEY `bookingCode_30` (`bookingCode`),
  UNIQUE KEY `bookingCode_31` (`bookingCode`),
  UNIQUE KEY `bookingCode_32` (`bookingCode`),
  UNIQUE KEY `bookingCode_33` (`bookingCode`),
  UNIQUE KEY `bookingCode_34` (`bookingCode`),
  UNIQUE KEY `bookingCode_35` (`bookingCode`),
  UNIQUE KEY `bookingCode_36` (`bookingCode`),
  UNIQUE KEY `bookingCode_37` (`bookingCode`),
  KEY `userId` (`userId`),
  KEY `employeeId` (`employeeId`),
  KEY `vehicleId` (`vehicleId`),
  KEY `paymentId` (`paymentId`),
  KEY `vehicleTypeId` (`vehicleTypeId`),
  KEY `driverId` (`driverId`),
  KEY `vehicleMasterId` (`vehicleMasterId`),
  KEY `managerUserId` (`managerUserId`),
  KEY `companyId` (`companyId`),
  CONSTRAINT `booking_ibfk_101` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_107` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_11` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_113` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_119` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_125` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_131` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_137` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_143` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_149` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_155` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_161` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_167` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_17` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_173` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_179` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_185` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_191` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_197` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_203` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_209` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_215` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_221` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_227` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_23` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_233` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_239` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_245` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_251` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_257` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_263` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_269` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_275` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_281` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_287` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_29` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_293` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_299` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_305` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_313` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_319` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_325` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_336` FOREIGN KEY (`vehicleMasterId`) REFERENCES `vehiclemaster` (`vehicleMasterId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_338` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_345` FOREIGN KEY (`vehicleMasterId`) REFERENCES `vehiclemaster` (`vehicleMasterId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_347` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_35` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_354` FOREIGN KEY (`vehicleMasterId`) REFERENCES `vehiclemaster` (`vehicleMasterId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_356` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_363` FOREIGN KEY (`vehicleMasterId`) REFERENCES `vehiclemaster` (`vehicleMasterId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_365` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_372` FOREIGN KEY (`vehicleMasterId`) REFERENCES `vehiclemaster` (`vehicleMasterId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_374` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_381` FOREIGN KEY (`vehicleMasterId`) REFERENCES `vehiclemaster` (`vehicleMasterId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_383` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_390` FOREIGN KEY (`vehicleMasterId`) REFERENCES `vehiclemaster` (`vehicleMasterId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_392` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_399` FOREIGN KEY (`vehicleMasterId`) REFERENCES `vehiclemaster` (`vehicleMasterId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_401` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_408` FOREIGN KEY (`vehicleMasterId`) REFERENCES `vehiclemaster` (`vehicleMasterId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_41` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_410` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_417` FOREIGN KEY (`vehicleMasterId`) REFERENCES `vehiclemaster` (`vehicleMasterId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_419` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_426` FOREIGN KEY (`vehicleMasterId`) REFERENCES `vehiclemaster` (`vehicleMasterId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_428` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_435` FOREIGN KEY (`vehicleMasterId`) REFERENCES `vehiclemaster` (`vehicleMasterId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_437` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_444` FOREIGN KEY (`vehicleMasterId`) REFERENCES `vehiclemaster` (`vehicleMasterId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_446` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_453` FOREIGN KEY (`vehicleMasterId`) REFERENCES `vehiclemaster` (`vehicleMasterId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_455` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_462` FOREIGN KEY (`vehicleMasterId`) REFERENCES `vehiclemaster` (`vehicleMasterId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_464` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_47` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_471` FOREIGN KEY (`vehicleMasterId`) REFERENCES `vehiclemaster` (`vehicleMasterId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_473` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_480` FOREIGN KEY (`vehicleMasterId`) REFERENCES `vehiclemaster` (`vehicleMasterId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_482` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_489` FOREIGN KEY (`vehicleMasterId`) REFERENCES `vehiclemaster` (`vehicleMasterId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_491` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_498` FOREIGN KEY (`vehicleMasterId`) REFERENCES `vehiclemaster` (`vehicleMasterId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_5` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_500` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_507` FOREIGN KEY (`vehicleMasterId`) REFERENCES `vehiclemaster` (`vehicleMasterId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_509` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_516` FOREIGN KEY (`vehicleMasterId`) REFERENCES `vehiclemaster` (`vehicleMasterId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_518` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_525` FOREIGN KEY (`vehicleMasterId`) REFERENCES `vehiclemaster` (`vehicleMasterId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_527` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_53` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_534` FOREIGN KEY (`vehicleMasterId`) REFERENCES `vehiclemaster` (`vehicleMasterId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_536` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_543` FOREIGN KEY (`vehicleMasterId`) REFERENCES `vehiclemaster` (`vehicleMasterId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_545` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_552` FOREIGN KEY (`vehicleMasterId`) REFERENCES `vehiclemaster` (`vehicleMasterId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_554` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_561` FOREIGN KEY (`vehicleMasterId`) REFERENCES `vehiclemaster` (`vehicleMasterId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_563` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_570` FOREIGN KEY (`vehicleMasterId`) REFERENCES `vehiclemaster` (`vehicleMasterId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_572` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_579` FOREIGN KEY (`vehicleMasterId`) REFERENCES `vehiclemaster` (`vehicleMasterId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_581` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_588` FOREIGN KEY (`vehicleMasterId`) REFERENCES `vehiclemaster` (`vehicleMasterId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_59` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_590` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_597` FOREIGN KEY (`vehicleMasterId`) REFERENCES `vehiclemaster` (`vehicleMasterId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_599` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_606` FOREIGN KEY (`vehicleMasterId`) REFERENCES `vehiclemaster` (`vehicleMasterId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_608` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_615` FOREIGN KEY (`vehicleMasterId`) REFERENCES `vehiclemaster` (`vehicleMasterId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_617` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_624` FOREIGN KEY (`vehicleMasterId`) REFERENCES `vehiclemaster` (`vehicleMasterId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_626` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_630` FOREIGN KEY (`userId`) REFERENCES `user` (`userId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_631` FOREIGN KEY (`employeeId`) REFERENCES `employee` (`employeeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_632` FOREIGN KEY (`vehicleId`) REFERENCES `vehicle` (`vehicleId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_633` FOREIGN KEY (`vehicleMasterId`) REFERENCES `vehiclemaster` (`vehicleMasterId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_634` FOREIGN KEY (`paymentId`) REFERENCES `payment` (`paymentId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_635` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_636` FOREIGN KEY (`driverId`) REFERENCES `drivers` (`driverId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_637` FOREIGN KEY (`managerUserId`) REFERENCES `user` (`userId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_638` FOREIGN KEY (`companyId`) REFERENCES `company` (`companyId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_65` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_71` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_77` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_83` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_89` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `booking_ibfk_95` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking`
--

LOCK TABLES `booking` WRITE;
/*!40000 ALTER TABLE `booking` DISABLE KEYS */;
/*!40000 ALTER TABLE `booking` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `booking_sequence`
--

DROP TABLE IF EXISTS `booking_sequence`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking_sequence` (
  `seq_date` date NOT NULL,
  `last_number` int DEFAULT NULL,
  PRIMARY KEY (`seq_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_sequence`
--

LOCK TABLES `booking_sequence` WRITE;
/*!40000 ALTER TABLE `booking_sequence` DISABLE KEYS */;
/*!40000 ALTER TABLE `booking_sequence` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `closependings`
--

DROP TABLE IF EXISTS `closependings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `closependings` (
  `closependingId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `pickupDate` datetime NOT NULL,
  `garageKms` int DEFAULT '0',
  `garageOpenDateTime` datetime DEFAULT NULL,
  `garageCloseDateTime` datetime DEFAULT NULL,
  `guestKms` int DEFAULT '0',
  `guestOpenDateTime` datetime DEFAULT NULL,
  `guestCloseDateTime` datetime DEFAULT NULL,
  `hideGuestDetails` tinyint(1) DEFAULT '0',
  `packageDataId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `extraDriverBeta` decimal(10,2) DEFAULT '0.00',
  `companyId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `additionalKms` int DEFAULT '0',
  `additionalHours` int DEFAULT '0',
  `discountAmount` decimal(10,2) DEFAULT '0.00',
  `cgstApplicable` tinyint(1) DEFAULT '0',
  `igstApplicable` tinyint(1) DEFAULT '0',
  `sgstApplicable` tinyint(1) DEFAULT '0',
  `packageAmount` decimal(10,2) DEFAULT '0.00',
  `additionalKmsAmount` decimal(10,2) DEFAULT '0.00',
  `additionalHoursAmount` decimal(10,2) DEFAULT '0.00',
  `totalAmount` decimal(10,2) DEFAULT '0.00',
  `extraCharges` decimal(10,2) DEFAULT '0.00',
  `totalDue` decimal(10,2) DEFAULT '0.00',
  `cgstAmount` decimal(10,2) DEFAULT '0.00',
  `igstAmount` decimal(10,2) DEFAULT '0.00',
  `sgstAmount` decimal(10,2) DEFAULT '0.00',
  `totalTaxAmount` decimal(10,2) DEFAULT '0.00',
  `isDeleted` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `garageOpenKm` int DEFAULT NULL,
  `garageCloseKm` int DEFAULT NULL,
  `guestOpenKm` int DEFAULT NULL,
  `guestCloseKm` int DEFAULT NULL,
  `chargesRemarks` varchar(255) DEFAULT NULL,
  `chargesTitle` varchar(255) DEFAULT NULL,
  `selectedPackageData` json DEFAULT NULL,
  `advanceAmount` decimal(10,2) DEFAULT '0.00',
  `total` decimal(10,2) DEFAULT '0.00',
  `usageHours` varchar(255) DEFAULT NULL,
  `driverBetaDays` int DEFAULT '0',
  `tripSheetNumber` varchar(255) DEFAULT NULL,
  `extraChargesBreakup` json DEFAULT NULL,
  `tenantId` varchar(36) DEFAULT 'e7b8a1c0-0000-0000-0000-000000000001',
  PRIMARY KEY (`closependingId`),
  KEY `packageDataId` (`packageDataId`),
  CONSTRAINT `closependings_ibfk_1` FOREIGN KEY (`packageDataId`) REFERENCES `packagedata` (`packageDataId`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `closependings`
--

LOCK TABLES `closependings` WRITE;
/*!40000 ALTER TABLE `closependings` DISABLE KEYS */;
/*!40000 ALTER TABLE `closependings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `company`
--

DROP TABLE IF EXISTS `company`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `company` (
  `companyId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `companyName` varchar(255) DEFAULT NULL,
  `companyPhno` varchar(255) DEFAULT NULL,
  `userId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `employeeId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `domainName` varchar(255) DEFAULT NULL,
  `seoUrl` varchar(255) DEFAULT NULL,
  `managerEmail` text,
  `managerApproval` tinyint(1) DEFAULT '0',
  `allowTax` varchar(255) DEFAULT NULL,
  `needEmail` tinyint(1) DEFAULT '0',
  `companyLogo` text,
  `companyAddress` varchar(255) DEFAULT NULL,
  `isDeleted` tinyint(1) DEFAULT '0',
  `createdAt` datetime DEFAULT NULL,
  `startTime` varchar(255) DEFAULT NULL,
  `closeTime` varchar(255) DEFAULT NULL,
  `priorMinutes` varchar(255) DEFAULT NULL,
  `gstNo` varchar(255) DEFAULT NULL,
  `companyCode` varchar(255) DEFAULT NULL,
  `tenantId` varchar(36) DEFAULT 'e7b8a1c0-0000-0000-0000-000000000001',
  PRIMARY KEY (`companyId`),
  KEY `userId` (`userId`),
  KEY `employeeId` (`employeeId`),
  CONSTRAINT `company_ibfk_199` FOREIGN KEY (`userId`) REFERENCES `user` (`userId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `company_ibfk_200` FOREIGN KEY (`employeeId`) REFERENCES `employee` (`employeeId`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `company`
--

LOCK TABLES `company` WRITE;
/*!40000 ALTER TABLE `company` DISABLE KEYS */;
/*!40000 ALTER TABLE `company` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `company_policies`
--

DROP TABLE IF EXISTS `company_policies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `company_policies` (
  `policyId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `tenantId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `companyId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `policySettings` json NOT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`policyId`),
  UNIQUE KEY `companyId` (`companyId`),
  CONSTRAINT `company_policies_ibfk_1` FOREIGN KEY (`companyId`) REFERENCES `company` (`companyId`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `company_policies`
--

LOCK TABLES `company_policies` WRITE;
/*!40000 ALTER TABLE `company_policies` DISABLE KEYS */;
/*!40000 ALTER TABLE `company_policies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `configuration`
--

DROP TABLE IF EXISTS `configuration`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuration` (
  `configId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `serviceTaxPercentage` float DEFAULT NULL,
  `dueDays` int DEFAULT NULL,
  `invoiceNoStartingFrom` varchar(255) DEFAULT NULL,
  `cancelBookingHours` int DEFAULT NULL,
  `invoiceNoPrefix` varchar(255) DEFAULT NULL,
  `smtpServer` varchar(255) DEFAULT NULL,
  `smtpEmailAddress` varchar(255) DEFAULT NULL,
  `smtpEmailPassword` varchar(255) DEFAULT NULL,
  `smtpEmailPort` int DEFAULT NULL,
  `outstationHasTax` tinyint(1) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `tenantId` varchar(36) DEFAULT 'e7b8a1c0-0000-0000-0000-000000000001',
  PRIMARY KEY (`configId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuration`
--

LOCK TABLES `configuration` WRITE;
/*!40000 ALTER TABLE `configuration` DISABLE KEYS */;
INSERT INTO `configuration` VALUES ('2818f17f-8ec5-4453-9505-d1bfce2fde5c',70,20,'3000',10,'2025-26-','smtpout.secureserver.net','traveldesk@gracecabs.com','gracecabs@2005',587,0,'2025-10-07 07:12:45','2025-11-21 12:12:37','e7b8a1c0-0000-0000-0000-000000000001');
/*!40000 ALTER TABLE `configuration` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_notifications`
--

DROP TABLE IF EXISTS `customer_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_notifications` (
  `notificationId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `bookingId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRIVER_ASSIGNED',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notificationId`),
  KEY `userId_idx` (`userId`),
  KEY `bookingId_idx` (`bookingId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_notifications`
--

LOCK TABLES `customer_notifications` WRITE;
/*!40000 ALTER TABLE `customer_notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `customer_notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `driver_notifications`
--

DROP TABLE IF EXISTS `driver_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `driver_notifications` (
  `notificationId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `driverId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `bookingId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NEW_RIDE_ASSIGNED',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `readStatus` tinyint(1) NOT NULL DEFAULT '0',
  `isRead` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notificationId`),
  KEY `driverId_idx` (`driverId`),
  KEY `bookingId_idx` (`bookingId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `driver_notifications`
--

LOCK TABLES `driver_notifications` WRITE;
/*!40000 ALTER TABLE `driver_notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `driver_notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `drivers`
--

DROP TABLE IF EXISTS `drivers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `drivers` (
  `driverId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `driverName` varchar(255) DEFAULT NULL,
  `driverEmail` varchar(255) DEFAULT NULL,
  `phno` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `pincode` varchar(255) DEFAULT NULL,
  `licenseNo` varchar(255) DEFAULT NULL,
  `otp` int DEFAULT NULL,
  `ratings` int DEFAULT NULL,
  `trackLocation` varchar(255) DEFAULT NULL,
  `vehicleId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `createdBy` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `isDeleted` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime DEFAULT NULL,
  `vehicleTypeId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `fcm_token` varchar(255) DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `licExpDate` datetime DEFAULT NULL,
  `trackingsource` varchar(255) DEFAULT NULL,
  `tenantId` varchar(36) DEFAULT 'e7b8a1c0-0000-0000-0000-000000000001',
  PRIMARY KEY (`driverId`),
  KEY `vehicleId` (`vehicleId`),
  KEY `createdBy` (`createdBy`),
  KEY `vehicleTypeId` (`vehicleTypeId`),
  KEY `idx_drivers_tenant_phno` (`tenantId`,`phno`),
  CONSTRAINT `drivers_ibfk_123` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `drivers_ibfk_126` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `drivers_ibfk_129` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `drivers_ibfk_132` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `drivers_ibfk_135` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `drivers_ibfk_138` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `drivers_ibfk_141` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `drivers_ibfk_144` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `drivers_ibfk_147` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `drivers_ibfk_150` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `drivers_ibfk_153` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `drivers_ibfk_156` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `drivers_ibfk_159` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `drivers_ibfk_162` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `drivers_ibfk_165` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `drivers_ibfk_168` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `drivers_ibfk_171` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `drivers_ibfk_174` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `drivers_ibfk_177` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `drivers_ibfk_180` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `drivers_ibfk_183` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `drivers_ibfk_186` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `drivers_ibfk_189` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `drivers_ibfk_192` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `drivers_ibfk_195` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `drivers_ibfk_198` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `drivers_ibfk_201` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `drivers_ibfk_204` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `drivers_ibfk_207` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `drivers_ibfk_210` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `drivers_ibfk_213` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `drivers_ibfk_216` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `drivers_ibfk_219` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `drivers_ibfk_222` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `drivers_ibfk_225` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `drivers_ibfk_226` FOREIGN KEY (`vehicleId`) REFERENCES `vehicle` (`vehicleId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `drivers_ibfk_227` FOREIGN KEY (`createdBy`) REFERENCES `employee` (`employeeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `drivers_ibfk_228` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `drivers`
--

LOCK TABLES `drivers` WRITE;
/*!40000 ALTER TABLE `drivers` DISABLE KEYS */;
INSERT INTO `drivers` VALUES ('2d98e1f4-50f9-4d5d-bdba-4135c5718e4b','Vikram Singh','vikram-1792992944219@beta.com','9510997059','$2b$10$zDE9bLdfJzttqYImhylRpuK99kL7Sk2VOPR0w0eY5w5U72Yb9t/.i','Beta City','Maharashtra','India','456 Beta Road','400001','DL-BETA-67890',NULL,NULL,NULL,NULL,NULL,0,'2026-10-26 05:35:44',NULL,NULL,'driver','2029-06-30 00:00:00','MobileApp','tenant-test-beta'),('6db25e66-9a65-43e9-80ed-b9d2bd9577fa','Suresh Kumar Reactivated',NULL,'9510997059','$2b$10$PMoGVKvXVlu8fDNwA1KccO.Xdn2idx6u8q9sBZ8TwKOclJ/ey1ivu',NULL,NULL,NULL,NULL,NULL,'DL-ALPHA-RENEWED',NULL,NULL,NULL,NULL,NULL,0,'2026-10-26 05:35:33',NULL,NULL,'driver',NULL,NULL,'a1a1a1a1-1111-4111-a111-111111111111');
/*!40000 ALTER TABLE `drivers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `emailconfiguration`
--

DROP TABLE IF EXISTS `emailconfiguration`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emailconfiguration` (
  `emailConfigId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emailCode` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` longtext COLLATE utf8mb4_unicode_ci,
  `fromName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fromAddress` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emailBcc` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `tenantId` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT 'e7b8a1c0-0000-0000-0000-000000000001',
  PRIMARY KEY (`emailConfigId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `emailconfiguration`
--

LOCK TABLES `emailconfiguration` WRITE;
/*!40000 ALTER TABLE `emailconfiguration` DISABLE KEYS */;
INSERT INTO `emailconfiguration` VALUES ('0ab59c1a-2c37-4037-aecf-55760a4863fe','Forgot Password Email','FORGOT_PASWRD_EMPLOYEE','Password Reset for your Account - GraceCabs','<p>Dear ###DisplayName###,</p>\n<p>Your login details given below</p>\n<p>Your Name is : ###DisplayName###</p>\n<p>Email : ###EmployeeEmail###</p>\n<p>Your Password is : ###Password###</p>\n<p><a style=\"color: blue; text-decoration: underline;\" href=\"http://gracecabs.com/login\" target=\"_blank\" rel=\"noopener\">Click here</a>to login</p>\n<p>Keep the above information for future use.</p>\n<p>Good luck and thank you for using GRACE CABS</p>\n<p>You can always contact us at traveldesk@gracecabs.com</p>\n<p>Regards,</p>\n<p>Team Grace cabs</p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2025-09-26 05:57:31','2026-01-19 10:37:20','e7b8a1c0-0000-0000-0000-000000000001'),('1034141a-f20d-457a-86f4-cf5a28f78564','Partner Details','PARTNER_MESSAGE','Confirm Your Partner Registration with Gracecabs.in','<p>Hello ###UserName###,</p>\n<p>Thank you for registering as a Partner with <strong>Grace Travel</strong>. We have received your vehicle &amp; personal details successfully. Below is the information provided by you:</p>\n<p><strong>Partner Information:</strong></p>\n<ul>\n<li><strong>Name:</strong> ###Name###</li>\n<li><strong>Email:</strong> ###Email###</li>\n<li><strong>Contact Number:</strong> ###ContactNumber###</li>\n<li><strong>Present Address:</strong> ###PresentAddress###</li>\n<li><strong>City Preferred:</strong> ###CityPreferred###</li>\n</ul>\n<p><strong>Vehicle Information:</strong></p>\n<ul>\n<li><strong>Vehicle Type:</strong> ###VehicleType###</li>\n<li><strong>Vehicle Name:</strong> ###VehicleName###</li>\n<li><strong>Registration Number:</strong> ###RegistrationNumber###</li>\n<li><strong>Registration Year:</strong> ###RegistrationYear###</li>\n<li><strong>Fuel Type:</strong> ###FuelType###</li>\n<li><strong>Passenger Capacity:</strong> ###PassengerCapacity###</li>\n</ul>\n<p>Our team will verify your details and contact you shortly.</p>\n<p>If you have any queries, feel free to reach out to us at <a>traveldesk@gracecabs.com</a></p>\n<p>Regards,<br><strong>Team Grace Cabs</strong></p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2025-11-28 10:09:40','2026-01-19 10:10:35','e7b8a1c0-0000-0000-0000-000000000001'),('1727e710-0eb4-48f4-93f2-7f279bab24db','Confirmation Messages','USER_CONFIRMATION_MESSAGE','Confirm Your Registration with GraceCabs.com','<p>Hello ###UserName###,</p>\n<p>Thank you for signing up with us. An important account activation information is below:</p>\n<p><strong>or Copy and paste the given below URL in your browser</strong></p>\n<p><strong>Keep the above information for future use.</strong>Good luck and thank you for using Grace Cabs</p>\n<p>You can always contact us at traveldesk@gracecabs.com</p>\n<p>Regards,</p>\n<p>Team <strong>Grace Cabs</strong></p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2025-10-08 05:23:30','2026-01-19 10:34:36','e7b8a1c0-0000-0000-0000-000000000001'),('1e397a7f-7315-40e6-837d-ba7785775be9','Invoice detail message','INVOICE_MSG','Reminding about your pending invoice #: ###InvoiceNumber### - GraceCabs','<p>Dear ###UserName###,<br><br>We remind you to pay for pending Payment of your order.<br><br>Here your invoice details:<br><br><strong>Invoice Details</strong><br>###InvoiceList###<br><br><a style=\"color: #ffffff; background-color: #007bff; padding: 10px 20px; text-decoration: none; border-radius: 5px;\" href=\"###PaymentLink###\">Click here to Pay</a><br><br>Thanks &amp; Regards,<br>GraceCabs</p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2025-08-29 17:40:23','2026-01-19 10:00:10','e7b8a1c0-0000-0000-0000-000000000001'),('390dc55c-9877-4653-a158-961ea5389edd','Forgot Password Email To User','FORGOT_PASWRD_USER','Password Reset for your Account - Gracecabs','<p>Hello ###UserName###,</p>\r <p>Your login details given below</p>\r <p>Your Email Address is : ###UserEmail###</p>\r <p>Your Password is : ###Password###</p>\r <p>Keep the above information for future use.</p>\r <p>Good luck and thank you for using GRACE CABS</p>\r <p>You can always contact us at traveldesk@gracecabs.com</p>\r <p>Regards,</p>\r <p>Team Grace cabs</p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2025-09-26 06:01:01','2025-09-26 07:07:54','e7b8a1c0-0000-0000-0000-000000000001'),('44eb5191-1e54-4ca3-9c82-cf4b2d265757','Order Cancellation Email','ORDER_CANCEL_EMAIL_TO_CLIENT','The Order #: ###OrderNumber### has been cancelled - GraceCabs','<p>Dear ###UserName###,</p>\n<p>Your Order No. <strong>###OrderNumber###</strong></p>\n<p>We inform that the following items in your order <strong>###OrderNumber###</strong> has been Cancelled</p>\n<p>###BookingDetails###</p>\n<p>Thank you,<br>GraceCabs</p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2025-09-05 06:28:26','2026-01-19 10:07:11','e7b8a1c0-0000-0000-0000-000000000001'),('4b4bc6f6-9e7d-4b35-ba73-638861b65066','User Registration','USER_REGISTRATION_EMAIL_TO_USER','User Account Login Details - GraceCabs','<p>Hello ###UserName###,</p><p>Welcome to Grace Cabs! Your user account has been successfully created.</p><p><strong>Your Account Login Details:</strong></p><p>Email Address: <strong>###UserEmail###</strong></p><p>Temporary Password: <strong>###Password###</strong></p><p>Company Portal: <a href=\"###CompanySeoUrl###\">###CompanySeoUrl###</a></p><p>Common Login URL: <a href=\"###LoginUrl###\">###LoginUrl###</a></p><p><strong>Setup Instructions:</strong> Please visit your Company Portal link above, log in with your temporary password, and update your password under My Account for security.</p><p>You can always reach our 24/7 support desk at traveldesk@gracecabs.com</p><p>Regards,<br>Team Grace Cabs</p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2025-10-23 04:47:55','2026-01-19 10:07:45','e7b8a1c0-0000-0000-0000-000000000001'),('57066938-5f8d-4e40-a00f-cdc2e065541b','Manager Alert','MANAGER_ALERT','Requested Manager Approval: ###BookingNumber### with Gracecabs.com','<p>Hello ###UserName###,</p><p>Please approve the booking ###BookingDetails###</p><p>###Alert###</p><p>Regards,</p><p>Gracecabs</p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2026-02-23 09:26:35','2026-02-23 09:26:35','e7b8a1c0-0000-0000-0000-000000000001'),('6212885e-3a4f-48bf-9c3d-502bd392aa8b','Confirmation Message','USER_CONFIRMATION_MESSAGE','Confirm Your Registration with GraceCabs','<p>Hello ###UserName###,</p>\n<p>Thank you for signing up with us. An important account activation information is below: <strong>or Copy and paste the given below URL in your browser</strong></p>\n<p>###SERVER_PATH###Registration.asp?RefNo=###RefNo###<strong>Keep the above information for future use.</strong>Good luck and thank you for using ###WEB_SITE_NAME###</p>\n<p>You can always contact us at ###WEB_SITE_EMAIL###.</p>\n<p>Regards,</p>\n<p>Team <strong>###WEB_SITE_NAME###</strong></p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2025-10-08 05:07:12','2026-01-19 10:34:07','e7b8a1c0-0000-0000-0000-000000000001'),('62417638-f948-46bc-a748-d928b8e9c604','ManagerCancelBooking','ManagerCancelBooking','Booking Cancelled By Manager: ###BookingNumber### ','Hai ###UserName###, <br/> Your booking ###BookingDetails### has been cancelled by ###ManagerDetails### <br/> Thanks, <br/> Gracecabs PVT Ltd ','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2026-02-27 10:51:29','2026-02-27 10:51:29','e7b8a1c0-0000-0000-0000-000000000001'),('71417777-f0a6-4195-88fd-d1309baf7ede','Order Booking - Confirmation Message For Client','ORDER_BOOKING_EMAIL_TO_CLIENT','[Alpha Fleet VIP] Booking Confirmed ###BookingCode###','<p>Dear ###UserName###,</p>\n<p>Your Order No. ###OrderNumber###</p>\n<p>We have accepted your cab request. Cabs are assigned ###CabAssignedMinutes### minutes before travel time.</p>\n<p>We will send your cab details by email once your cab is assigned. ###BookingDetails###</p>\n<p>Thank you,<br>GraceCabs</p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2026-10-24 06:28:41','2026-10-24 06:28:41','a1a1a1a1-1111-4111-a111-111111111111'),('743dcb41-c8f8-4e4b-9843-f2c9076f61ee','Order Booking - autoapprove Message For Client','BOOKING_AUTOAPPROVE_EMAIL_TO_CLIENT','Order booking request created. Order #: ###OrderNumber### - GraceCabs','<p>Dear ###UserName###,</p>The booking was auto approved.<p></p> <p>Your Order No. ###OrderNumber###</p> <p>Cabs are assigned ###CabAssignedMinutes### minutes before travel time.</p> <p>We will send your cab details by email once your cab is assigned. ###BookingDetails###</p> <p>Thank you,<br>GraceCabs</p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2026-03-10 03:41:05','2026-03-10 03:41:05','e7b8a1c0-0000-0000-0000-000000000001'),('79b4da5d-0e20-4062-a26b-3222152ec92a','Order Booking - Confirmation Message','ORDER_BOOKING_EMAIL_TO_ADMIN','Order booking request created. Order No #: ###OrderNumber### - GraceCabs','<p>Dear ###AdminName###,<br><br>###UserName### placed an order.<br><br>###BookingDetails###<br><br>Please confirm the order. Order No. ###OrderNumber###<br><br>Regards,<br>GraceCabs</p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2025-08-28 10:20:17','2026-01-19 10:35:48','e7b8a1c0-0000-0000-0000-000000000001'),('86565456-0988-449b-bd25-cac4b8bfcdbc','Driver Account Registration','DRIVER_REGISTRATION_EMAIL_TO_DRIVER','Driver Account Created - GraceCabs','<p>Hello ###DriverName###,</p><p>Welcome to Grace Cabs! Your driver account has been created successfully.</p><p>Registered Mobile: ###DriverPhone###</p><p>You can log in to the driver application using your registered mobile number and password.</p><p>Regards,<br>Team Grace Cabs</p>','GraceCabs','traveldesk@gracecabs.com',NULL,'2026-10-23 15:55:37','2026-10-23 15:55:37','e7b8a1c0-0000-0000-0000-000000000001'),('891d593e-c71e-41cc-bc8f-0a71c00ca0c2','Pay Invoice - Message','USER_INVOICE_EMAIL','Invoice Details for Order #: ###OrderNumber### - GraceCabss','<p>Dear ###UserName###,</p>\r     <p>Invoice details for your booking <strong>Order #: ###OrderNumber###</strong></p>\r     <p>###InvoiceTemple###<br><br></p>\r     <p><a title=\"Click here to Pay\" href=\"https://gracecabs.com/adminlogin\" target=\"_blank\" rel=\"noopener\">###PayLink###</a><br><br></p>\r     <p>Thank you,<br>GraceCabs</p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2025-08-27 10:18:52','2025-08-29 16:34:22','e7b8a1c0-0000-0000-0000-000000000001'),('96495218-5116-4a5f-8169-caef51ef14d1','Monthly Booking','MONTHLY_BOOKING','Monthly Booking Details: ###BookingNumber### with Gracecabs.com','<p>Dear Customer,</p>\n<p>Monthly Invoice details <strong>Order #: ###OrderNumber###</strong></p>\n<p>###InvoiceTemple###<br><br></p>\n<p><br><br></p>\n<p>Thank you,<br>GraceCabs</p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2026-01-06 07:22:30','2026-01-19 10:05:28','e7b8a1c0-0000-0000-0000-000000000001'),('a23808cf-a207-4052-95c9-99c8406292a0','Forget password otp','FORGET_PASSWORD_OTP','OTP sent to reset for your password - GraceCabs','<p>Dear ###DisplayName###,</p>\n<p>Your otp details given below</p>\n<p>Your Name is : ###DisplayName###</p>\n<p>Email : ###EmployeeEmail###</p>\n<p>Your OTP is : ###OTP###</p>\n<p>Good luck and thank you for using GRACE CABS</p>\n<p>You can always contact us at traveldesk@gracecabs.com</p>\n<p>Regards,</p>\n<p>Team Grace Cabs</p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2025-10-22 06:55:26','2026-01-19 10:11:20','e7b8a1c0-0000-0000-0000-000000000001'),('bee9d650-c646-490b-9bae-399d90693fa8','confirmed message for driver','ORDER_CONFIRMATION_DRIVER','Order booking request created. Order #: ###OrderNumber### - GraceCabs','<p>Dear ###DriverName###, </p>\r  <p>Your new booking request has been assigned. </p>\r  <p>Order No.: ###OrderNumber### </p>\r  <p>Booking Details: ###BookingDetails###</p>\r  <p>Customer Details: ###UserDetails###&nbsp;<br><br>Please review the trip details carefully and be ready for the assignment. Thanks, GraceCabs</p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2025-08-29 11:15:12','2025-08-29 11:55:31','e7b8a1c0-0000-0000-0000-000000000001'),('d3ca957f-3e22-4f96-90f1-58b68ff7b63e','Order Confirmation Message','ORDER_CONFIRMATION_NOTIF','Your booking request has been confirmed. Order #: ####OrderNumber### - GraceCabs','<p>Dear ###UserName###,<br><br>Order No. ###OrderNumber###<br><br>###BookingDetails###</p>\n<p>###DriverDetails###</p>\n<p>Thank you,<br>GraceCabs</p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2025-08-28 07:42:47','2026-01-20 05:54:52','e7b8a1c0-0000-0000-0000-000000000001'),('e20c0afc-cbee-46eb-bffb-56856981d85e','Order Cancellation','ORDER_CANCEL_EMAIL_TO_ADMIN','The Order #: ###OrderNumber### has been cancelled - GraceCabs ','<p>Dear ###UserName###,</p>\r <p> Order No. <strong>###OrderNumber###</strong></p>\r <p>We inform that the following items in order <strong>###OrderNumber###</strong> has been Cancelled.</p>\r<p> <p>###InvoiceDetails###</p></p> <p>###BookingDetails###</p>\r <p>Thank you,<br>GraceCabs</p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2025-09-05 06:17:16','2026-01-19 10:09:59','e7b8a1c0-0000-0000-0000-000000000001'),('ef77cffa-4338-48a5-8418-1e5c56df4d57','Order Booking - autoapprove Message For Manager','BOOKING_AUTOAPPROVE_EMAIL_TO_MANAGER','Booking Autoapproved. Order #: ###OrderNumber### - GraceCabs','<p>Dear Manager,</p>\n<p>The booking was auto approved.</p>\n<p>&nbsp;</p>\n<p>Order No. ###OrderNumber###</p>\n<p>Auto approved booking details. ###BookingDetails###</p>\n<p>Thank you,<br>GraceCabs</p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2026-03-22 12:12:44','2026-05-22 05:04:13','e7b8a1c0-0000-0000-0000-000000000001'),('f52aa4f4-b175-4f8b-b0b2-3c65100cfe0a','admin cancelled order details','ADMIN_CANCEL_ORDER','Order Cancelled by admin #: ###OrderNumber### - GraceCabs','<p>Dear ###UserName###,</p><p>Order has been cancelled by admin. Booking details are given below <b></p><p>###BookingDetails###</p>   <p>Thank you,<br>GraceCabs</p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2025-10-07 09:01:07','2025-10-07 09:01:07','e7b8a1c0-0000-0000-0000-000000000001'),('ffd6414a-4afb-4385-acef-3c44f0f3ab3e','Order Booking - Confirmation Message For Client','ORDER_BOOKING_EMAIL_TO_CLIENT','Order booking request created. Order #: ###OrderNumber### - GraceCabs','<p>Dear ###UserName###,</p>\n<p>Your Order No. ###OrderNumber###</p>\n<p>We have accepted your cab request. Cabs are assigned ###CabAssignedMinutes### minutes before travel time.</p>\n<p>We will send your cab details by email once your cab is assigned. ###BookingDetails###</p>\n<p>Thank you,<br>GraceCabs</p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2025-08-29 09:58:25','2026-01-19 10:36:18','e7b8a1c0-0000-0000-0000-000000000001');
/*!40000 ALTER TABLE `emailconfiguration` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee`
--

DROP TABLE IF EXISTS `employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee` (
  `employeeId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `username` varchar(255) DEFAULT NULL,
  `empManager` tinyint(1) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phno` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `fcm_token` varchar(255) DEFAULT NULL,
  `tenantId` varchar(36) DEFAULT 'e7b8a1c0-0000-0000-0000-000000000001',
  PRIMARY KEY (`employeeId`),
  KEY `idx_employee_tenant_phno` (`tenantId`,`phno`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee`
--

LOCK TABLES `employee` WRITE;
/*!40000 ALTER TABLE `employee` DISABLE KEYS */;
INSERT INTO `employee` VALUES ('364aed6d-3cb3-40f4-b3c1-2ed3970a6cce','Super Admin',0,'subisha2002.m@gmail.com','9080280818','$2b$10$2BHQBl.x8BTwCF/wDmRniu7A3vjezfRSTA/qRGQTmsTdnrTDGg1CK','superadmin','2026-10-16 12:08:03',NULL,'e7b8a1c0-0000-0000-0000-000000000001');
/*!40000 ALTER TABLE `employee` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoice`
--

DROP TABLE IF EXISTS `invoice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice` (
  `invoiceId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `invoiceNumber` varchar(255) DEFAULT NULL,
  `startDate` datetime DEFAULT NULL,
  `endDate` datetime DEFAULT NULL,
  `invoiceAmount` int DEFAULT NULL,
  `userId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `vendorId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `invoiceStatus` varchar(255) DEFAULT NULL,
  `vehicleTypeId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `bookingId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `companyId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `paymentId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `closePendingId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `monthlyInvoiceId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `tenantId` varchar(36) DEFAULT 'e7b8a1c0-0000-0000-0000-000000000001',
  PRIMARY KEY (`invoiceId`),
  UNIQUE KEY `invoiceNumber` (`invoiceNumber`),
  UNIQUE KEY `invoiceNumber_2` (`invoiceNumber`),
  UNIQUE KEY `invoiceNumber_3` (`invoiceNumber`),
  UNIQUE KEY `invoiceNumber_4` (`invoiceNumber`),
  UNIQUE KEY `invoiceNumber_5` (`invoiceNumber`),
  UNIQUE KEY `invoiceNumber_6` (`invoiceNumber`),
  UNIQUE KEY `invoiceNumber_7` (`invoiceNumber`),
  UNIQUE KEY `invoiceNumber_8` (`invoiceNumber`),
  UNIQUE KEY `invoiceNumber_9` (`invoiceNumber`),
  UNIQUE KEY `invoiceNumber_10` (`invoiceNumber`),
  UNIQUE KEY `invoiceNumber_11` (`invoiceNumber`),
  UNIQUE KEY `invoiceNumber_12` (`invoiceNumber`),
  UNIQUE KEY `invoiceNumber_13` (`invoiceNumber`),
  UNIQUE KEY `invoiceNumber_14` (`invoiceNumber`),
  UNIQUE KEY `invoiceNumber_15` (`invoiceNumber`),
  UNIQUE KEY `invoiceNumber_16` (`invoiceNumber`),
  UNIQUE KEY `invoiceNumber_17` (`invoiceNumber`),
  UNIQUE KEY `invoiceNumber_18` (`invoiceNumber`),
  UNIQUE KEY `invoiceNumber_19` (`invoiceNumber`),
  UNIQUE KEY `invoiceNumber_20` (`invoiceNumber`),
  UNIQUE KEY `invoiceNumber_21` (`invoiceNumber`),
  UNIQUE KEY `invoiceNumber_22` (`invoiceNumber`),
  UNIQUE KEY `invoiceNumber_23` (`invoiceNumber`),
  UNIQUE KEY `invoiceNumber_24` (`invoiceNumber`),
  UNIQUE KEY `invoiceNumber_25` (`invoiceNumber`),
  UNIQUE KEY `invoiceNumber_26` (`invoiceNumber`),
  UNIQUE KEY `invoiceNumber_27` (`invoiceNumber`),
  UNIQUE KEY `invoiceNumber_28` (`invoiceNumber`),
  UNIQUE KEY `invoiceNumber_29` (`invoiceNumber`),
  UNIQUE KEY `invoiceNumber_30` (`invoiceNumber`),
  UNIQUE KEY `invoiceNumber_31` (`invoiceNumber`),
  UNIQUE KEY `invoiceNumber_32` (`invoiceNumber`),
  UNIQUE KEY `invoiceNumber_33` (`invoiceNumber`),
  UNIQUE KEY `invoiceNumber_34` (`invoiceNumber`),
  UNIQUE KEY `invoiceNumber_35` (`invoiceNumber`),
  KEY `userId` (`userId`),
  KEY `vendorId` (`vendorId`),
  KEY `vehicleTypeId` (`vehicleTypeId`),
  KEY `bookingId` (`bookingId`),
  KEY `companyId` (`companyId`),
  KEY `paymentId` (`paymentId`),
  KEY `closePendingId` (`closePendingId`),
  KEY `monthlyInvoiceId` (`monthlyInvoiceId`),
  CONSTRAINT `invoice_ibfk_105` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_111` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_117` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_123` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_129` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_135` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_141` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_147` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_15` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_153` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_159` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_165` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_171` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_177` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_183` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_189` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_195` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_201` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_208` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_21` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_215` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_222` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_229` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_236` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_243` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_250` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_257` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_264` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_27` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_271` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_278` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_285` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_292` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_299` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_3` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_306` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_313` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_320` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_327` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_33` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_334` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_341` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_348` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_355` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_363` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_371` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_379` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_387` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_39` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_395` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_403` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_411` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_419` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_427` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_435` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_443` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_45` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_451` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_459` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_467` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_475` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_483` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_491` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_499` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_507` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_51` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_515` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_523` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_531` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_539` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_547` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_555` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_563` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_57` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_571` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_579` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_587` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_595` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_601` FOREIGN KEY (`userId`) REFERENCES `user` (`userId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_602` FOREIGN KEY (`vendorId`) REFERENCES `vendor` (`vendorId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_603` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_604` FOREIGN KEY (`bookingId`) REFERENCES `booking` (`bookingId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_605` FOREIGN KEY (`companyId`) REFERENCES `company` (`companyId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_606` FOREIGN KEY (`paymentId`) REFERENCES `payment` (`paymentId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_607` FOREIGN KEY (`closePendingId`) REFERENCES `closependings` (`closependingId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_608` FOREIGN KEY (`monthlyInvoiceId`) REFERENCES `monthly_invoice` (`monthlyInvoiceId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_63` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_69` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_75` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_81` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_87` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_9` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_93` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_99` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice`
--

LOCK TABLES `invoice` WRITE;
/*!40000 ALTER TABLE `invoice` DISABLE KEYS */;
/*!40000 ALTER TABLE `invoice` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoice_sequences`
--

DROP TABLE IF EXISTS `invoice_sequences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice_sequences` (
  `current` int DEFAULT '0',
  `companyId` varchar(36) NOT NULL,
  `financialYear` varchar(7) NOT NULL,
  PRIMARY KEY (`companyId`,`financialYear`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice_sequences`
--

LOCK TABLES `invoice_sequences` WRITE;
/*!40000 ALTER TABLE `invoice_sequences` DISABLE KEYS */;
/*!40000 ALTER TABLE `invoice_sequences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mapcount`
--

DROP TABLE IF EXISTS `mapcount`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mapcount` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `appCount` int DEFAULT '0',
  `webCount` int DEFAULT '0',
  `isDeleted` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mapcount`
--

LOCK TABLES `mapcount` WRITE;
/*!40000 ALTER TABLE `mapcount` DISABLE KEYS */;
/*!40000 ALTER TABLE `mapcount` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `monthly_invoice`
--

DROP TABLE IF EXISTS `monthly_invoice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `monthly_invoice` (
  `monthlyInvoiceId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `invoiceDate` date NOT NULL,
  `invoiceMonth` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `companyId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `companyName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vehicleTypeId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `vehicleTypeName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vehicleNumber` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `packageDataId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `packageDetails` json DEFAULT NULL,
  `extraKm` double NOT NULL DEFAULT '0',
  `extraDays` double NOT NULL DEFAULT '0',
  `extraHrs` double NOT NULL DEFAULT '0',
  `extraHourRate` double NOT NULL DEFAULT '0',
  `extraChargeType` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'toll',
  `extraChargesInputAmount` double NOT NULL DEFAULT '0',
  `extraCharges` json DEFAULT NULL,
  `discount` double NOT NULL DEFAULT '0',
  `advance` double NOT NULL DEFAULT '0',
  `packageAmount` double NOT NULL DEFAULT '0',
  `extraKmAmount` double NOT NULL DEFAULT '0',
  `extraDaysAmount` double NOT NULL DEFAULT '0',
  `extraHrsAmount` double NOT NULL DEFAULT '0',
  `netTotal` double NOT NULL DEFAULT '0',
  `taxes` json DEFAULT NULL,
  `totalTaxAmount` double NOT NULL DEFAULT '0',
  `finalTotal` double NOT NULL DEFAULT '0',
  `balanceDue` double NOT NULL DEFAULT '0',
  `createdAt` datetime DEFAULT NULL,
  `closeStatus` int NOT NULL DEFAULT '0',
  `invoiceId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `route` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `companyAddress` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `monthlyBookingCode` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tenantId` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT 'e7b8a1c0-0000-0000-0000-000000000001',
  PRIMARY KEY (`monthlyInvoiceId`),
  UNIQUE KEY `monthlyBookingCode` (`monthlyBookingCode`),
  UNIQUE KEY `monthlyBookingCode_2` (`monthlyBookingCode`),
  UNIQUE KEY `monthlyBookingCode_3` (`monthlyBookingCode`),
  UNIQUE KEY `monthlyBookingCode_4` (`monthlyBookingCode`),
  UNIQUE KEY `monthlyBookingCode_5` (`monthlyBookingCode`),
  UNIQUE KEY `monthlyBookingCode_6` (`monthlyBookingCode`),
  UNIQUE KEY `monthlyBookingCode_7` (`monthlyBookingCode`),
  UNIQUE KEY `monthlyBookingCode_8` (`monthlyBookingCode`),
  UNIQUE KEY `monthlyBookingCode_9` (`monthlyBookingCode`),
  UNIQUE KEY `monthlyBookingCode_10` (`monthlyBookingCode`),
  UNIQUE KEY `monthlyBookingCode_11` (`monthlyBookingCode`),
  UNIQUE KEY `monthlyBookingCode_12` (`monthlyBookingCode`),
  UNIQUE KEY `monthlyBookingCode_13` (`monthlyBookingCode`),
  UNIQUE KEY `monthlyBookingCode_14` (`monthlyBookingCode`),
  UNIQUE KEY `monthlyBookingCode_15` (`monthlyBookingCode`),
  KEY `idx_monthly_invoice_company` (`companyId`),
  KEY `idx_monthly_invoice_month` (`invoiceMonth`),
  KEY `idx_monthly_invoice_vehicle` (`vehicleTypeId`),
  KEY `idx_monthly_invoice_date` (`invoiceDate`),
  KEY `invoiceId` (`invoiceId`),
  CONSTRAINT `monthly_invoice_ibfk_29` FOREIGN KEY (`companyId`) REFERENCES `company` (`companyId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `monthly_invoice_ibfk_30` FOREIGN KEY (`invoiceId`) REFERENCES `invoice` (`invoiceId`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `monthly_invoice`
--

LOCK TABLES `monthly_invoice` WRITE;
/*!40000 ALTER TABLE `monthly_invoice` DISABLE KEYS */;
/*!40000 ALTER TABLE `monthly_invoice` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `monthly_invoice_items`
--

DROP TABLE IF EXISTS `monthly_invoice_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `monthly_invoice_items` (
  `monthlyInvoiceItemId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `monthlyInvoiceId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `route` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vehicleTypeId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `vehicleTypeName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vehicleNumber` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `packageDataId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `packageDetails` json DEFAULT NULL,
  `packageAmount` double NOT NULL DEFAULT '0',
  `extraKm` double NOT NULL DEFAULT '0',
  `extraKmAmount` double NOT NULL DEFAULT '0',
  `extraDays` double NOT NULL DEFAULT '0',
  `extraDaysAmount` double NOT NULL DEFAULT '0',
  `extraHrs` double NOT NULL DEFAULT '0',
  `extraHourRate` double NOT NULL DEFAULT '0',
  `extraHrsAmount` double NOT NULL DEFAULT '0',
  `extraChargeType` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'toll',
  `extraChargesInputAmount` double NOT NULL DEFAULT '0',
  `extraCharges` json DEFAULT NULL,
  `discount` double NOT NULL DEFAULT '0',
  `advance` double NOT NULL DEFAULT '0',
  `netTotal` double NOT NULL DEFAULT '0',
  `taxes` json DEFAULT NULL,
  `totalTaxAmount` double NOT NULL DEFAULT '0',
  `finalTotal` double NOT NULL DEFAULT '0',
  `balanceDue` double NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`monthlyInvoiceItemId`),
  KEY `idx_monthlyInvoiceId` (`monthlyInvoiceId`),
  CONSTRAINT `monthly_invoice_items_ibfk_1` FOREIGN KEY (`monthlyInvoiceId`) REFERENCES `monthly_invoice` (`monthlyInvoiceId`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `monthly_invoice_items`
--

LOCK TABLES `monthly_invoice_items` WRITE;
/*!40000 ALTER TABLE `monthly_invoice_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `monthly_invoice_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `monthlybookingsequence`
--

DROP TABLE IF EXISTS `monthlybookingsequence`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `monthlybookingsequence` (
  `financialYear` varchar(10) DEFAULT NULL,
  `companyCode` varchar(10) NOT NULL,
  `lastNumber` int NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `monthlybookingsequence`
--

LOCK TABLES `monthlybookingsequence` WRITE;
/*!40000 ALTER TABLE `monthlybookingsequence` DISABLE KEYS */;
/*!40000 ALTER TABLE `monthlybookingsequence` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_logs`
--

DROP TABLE IF EXISTS `notification_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification_logs` (
  `logId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `channel` enum('EMAIL','SMS') COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipient` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `templateCode` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `referenceEntity` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `referenceId` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `providerStatus` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `providerMessageId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `errorDetails` text COLLATE utf8mb4_unicode_ci,
  `retryCount` int NOT NULL DEFAULT '0',
  `maxRetries` int NOT NULL DEFAULT '3',
  `metadata` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`logId`),
  KEY `idx_notif_channel` (`channel`),
  KEY `idx_notif_recipient` (`recipient`),
  KEY `idx_notif_ref` (`referenceId`),
  KEY `idx_notif_template` (`templateCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_logs`
--

LOCK TABLES `notification_logs` WRITE;
/*!40000 ALTER TABLE `notification_logs` DISABLE KEYS */;
INSERT INTO `notification_logs` VALUES ('00ccd91d-8f37-4591-a0f1-8364ddab230b','SMS','9080280818','SUPERADMIN_NEW_APPLICATION_SMS','REGISTRATION_REQUEST','1284a65a-f8fd-40e5-9c88-4876608e7510','SENT','a4f07a044a135b2f-BOM',NULL,0,3,NULL,'2026-10-23 11:42:05','2026-10-23 11:42:05'),('01480bc8-4bf1-4199-b87a-03b52ce70502','EMAIL','subisha2002.m@gmail.com','FORGET_PASSWORD_OTP','EMAIL_CONF','','SENT','<c8c97c73-5911-786a-a83f-db3d0ebc24cb@gmail.com>',NULL,0,3,'{\"subject\": \"OTP sent to reset for your password - GraceCabs\", \"accepted\": [\"subisha2002.m@gmail.com\", \"gracecabs1975@gmail.com\"]}','2026-10-23 10:04:15','2026-10-23 10:04:15'),('0307fb51-01d6-4e17-8048-62a6070a294d','EMAIL','employee_1792810606156@alphatech.com','USER_REGISTRATION_EMAIL_TO_USER','EMAIL_CONF','','SENT','<ada858ba-5be0-bfed-7be0-a7ac973d3bc5@gracecabs.com>',NULL,0,3,'{\"subject\": \"User Account Login Details - GraceCabs\", \"accepted\": [\"employee_1792810606156@alphatech.com\", \"gracecabs1975@gmail.com\"]}','2026-10-24 02:56:57','2026-10-24 02:56:57'),('04b1e596-7221-4776-82f0-6fbd179ae502','EMAIL','ramesh.rg452021@swiftlogistics.com','TENANT_ADMIN_ACTIVATION_LINK','TENANT','c2d8727d-e378-4c23-afca-b91ec6b925aa','SENT','<ec661e1a-4ccb-5eff-0693-2adeacd6a046@gracecabs.com>',NULL,0,3,'{\"loginUrl\": \"http://localhost:3000/adminlogin\", \"tenantId\": \"c2d8727d-e378-4c23-afca-b91ec6b925aa\", \"attachments\": [{\"path\": \"D:\\\\demobooking\\\\demo-bookings\\\\backend\\\\uploads\\\\plans\\\\Plan_Summary_RG452021_c2d8727d.pdf\", \"filename\": \"Plan_Summary_RG452021_c2d8727d.pdf\"}], \"activationUrl\": \"http://localhost:3000/activate-account?token=act_33b488dfaed62ec08de0b1b1dddadc22311d26cab964db95377b9fe35cb6d4c2\", \"planSummaryPdfUrl\": \"http://localhost:5000/api/tenants/plan-summary/download/Plan_Summary_RG452021_c2d8727d.pdf?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRJZCI6ImMyZDg3MjdkLWUzNzgtNGMyMy1hZmNhLWI5MWVjNmI5MjVhYSIsImZpbGVOYW1lIjoiUGxhbl9TdW1tYXJ5X1JHNDUyMDIxX2MyZDg3MjdkLnBkZiIsInR5cGUiOiJQTEFOX1NVTU1BUlkiLCJpYXQiOjE3OTI4MjM0NjIsImV4cCI6MTc5NTQxNTQ2Mn0.1YO10sG2ZDw1NptVmwzSp2S96mYoKuHaAnYMh5DLj60\"}','2026-10-24 06:31:11','2026-10-24 06:31:11'),('05df2424-74c7-4c3d-af06-72a5009b6698','EMAIL','subisha2002.m@gmail.com','FORGET_PASSWORD_OTP','EMAIL_CONF','','SENT','<3c198f9e-a17e-60f2-c9e8-668e4a07dcff@gmail.com>',NULL,0,3,'{\"subject\": \"OTP sent to reset for your password - GraceCabs\", \"accepted\": [\"subisha2002.m@gmail.com\", \"gracecabs1975@gmail.com\"]}','2026-10-23 10:04:12','2026-10-23 10:04:12'),('079b9811-700d-4031-aa14-871e7f1ada16','EMAIL','subipcs@gmail.com','DRIVER_REGISTRATION_EMAIL_TO_DRIVER','EMAIL_CONF','86565456-0988-449b-bd25-cac4b8bfcdbc','SENT','<e912b340-ed39-5a7d-3383-46c904850811@gracecabs.com>',NULL,0,3,'{\"subject\": \"Driver Account Created - GraceCabs\", \"accepted\": [\"subipcs@gmail.com\"], \"tenantId\": \"86dd7cb6-db2b-41f2-84b8-084239222083\"}','2026-10-24 07:46:50','2026-10-24 07:46:50'),('082c33a8-b8cc-4ca9-a8b1-7372899d94b1','EMAIL','subipcs@gmail.com','REGISTRATION_RECEIVED','REGISTRATION_REQUEST','3e961ada-525c-4ad4-9dc4-d8b609707107','SENT','<dfb0b478-bf82-e629-67bb-5ced3d4af3a9@gmail.com>',NULL,0,3,NULL,'2026-10-23 05:20:22','2026-10-23 05:20:22'),('0973e9a1-788e-4b92-a93c-89271dbb6e78','SMS','9080280818','SUPERADMIN_NEW_APPLICATION_SMS','REGISTRATION_REQUEST','8686ae47-a760-437a-ab41-f8a62f7ec439','SENT','a4f5cab8bd3b4732-BOM',NULL,0,3,NULL,'2026-10-24 03:11:00','2026-10-24 03:11:00'),('0a715a44-501d-47a5-8b67-ad34f9b9d72d','EMAIL','vikram-1792826619768@beta.com','DRIVER_REGISTRATION_EMAIL_TO_DRIVER','EMAIL_CONF','86565456-0988-449b-bd25-cac4b8bfcdbc','SENT','<0df706a9-1ebe-abd3-32f8-14915fb5ee57@gracecabs.com>',NULL,0,3,'{\"subject\": \"Driver Account Created - GraceCabs\", \"accepted\": [\"vikram-1792826619768@beta.com\"], \"tenantId\": \"b2b2b2b2-2222-4222-b222-222222222222\"}','2026-10-24 07:23:47','2026-10-24 07:23:47'),('0afc0034-8fe3-433e-aa3e-86eb94b6999b','SMS','9840123456','REGISTRATION_RECEIVED_SMS','REGISTRATION_REQUEST','c2e16c8b-be45-4fce-a43d-8c7977ae5672','SENT','a4f6f0996caa88ec-BOM',NULL,0,3,NULL,'2026-10-24 06:31:36','2026-10-24 06:31:36'),('0c107bfc-b57b-4c03-8ca7-7d90e5f88d9f','EMAIL','admin@gracecabs.com','SUPERADMIN_NEW_APPLICATION_ALERT','REGISTRATION_REQUEST','f8b30c07-67ca-44b5-b4fe-0ed4b665da90','FAILED',NULL,'Invalid login: 535 Authentication failed',0,3,NULL,'2026-10-22 06:24:19','2026-10-22 06:24:19'),('0e2746aa-2138-45cc-8e69-3f0afad6e18a','SMS','9840123456','REGISTRATION_RECEIVED_SMS','REGISTRATION_REQUEST','8686ae47-a760-437a-ab41-f8a62f7ec439','SENT','a4f5cab8b8fc88ec-BOM',NULL,0,3,NULL,'2026-10-24 03:11:00','2026-10-24 03:11:00'),('0f07f9a4-7ae0-4a4d-8294-d5069a772385','EMAIL','applicant_1792752479080@skylinecabs.in','REGISTRATION_RECEIVED','REGISTRATION_REQUEST','1ddba0ad-8316-490a-aee2-e260dea1a32e','SENT','<dd300317-f446-f30f-8b9d-498721e1ef61@gracecabs.com>',NULL,0,3,NULL,'2026-10-23 10:48:07','2026-10-23 10:48:07'),('0f549765-9f12-4780-b23f-347dcf2b63ab','EMAIL','subisha2002.m@gmail.com','SUPERADMIN_NEW_APPLICATION_ALERT','REGISTRATION_REQUEST','c2e16c8b-be45-4fce-a43d-8c7977ae5672','SENT','<1c15a8c4-3243-8158-c503-05f37eb86bf8@gracecabs.com>',NULL,0,3,'{\"reviewUrl\": \"http://localhost:3000/admin/registrations\", \"actionText\": \"Review Inbound Applications\"}','2026-10-24 06:31:45','2026-10-24 06:31:45'),('0fe314d8-112a-4bf0-93d0-7b3200e4d87e','EMAIL','subisha2002@gmail.com','SUPERADMIN_NEW_APPLICATION_ALERT','REGISTRATION_REQUEST','d02cdf22-a7eb-4041-9b69-e8e088f019f2','SENT','<53567a82-efe2-9f1e-1322-ccf1b4739dd9@gmail.com>',NULL,0,3,'{\"reviewUrl\": \"http://localhost:3001/admin/registrations\", \"actionText\": \"Review Inbound Applications\"}','2026-10-22 11:50:10','2026-10-22 11:50:10'),('1000c95e-d21a-403c-a3fe-c2a32e8f8241','SMS','+919876543210','REGISTRATION_RECEIVED_SMS','REGISTRATION_REQUEST','ad371ca6-7565-48b2-ba2e-2fbd13328730','SENT','a4f02cf0ec255b2f-BOM',NULL,0,3,NULL,'2026-10-23 10:49:28','2026-10-23 10:49:28'),('115a3bcf-c19e-489d-8a60-d7951ed4521a','EMAIL','employee_1792817849442@alphatech.com','USER_REGISTRATION_EMAIL_TO_USER','EMAIL_CONF','','SENT','<f1351629-410f-511c-e940-4a22aa98f95d@gracecabs.com>',NULL,0,3,'{\"subject\": \"User Account Login Details - GraceCabs\", \"accepted\": [\"employee_1792817849442@alphatech.com\", \"gracecabs1975@gmail.com\"]}','2026-10-24 04:57:38','2026-10-24 04:57:38'),('12aa11cb-9ca4-4c06-9a0a-c4a25ffeed13','EMAIL','employee_1792810964994@alphatech.com','USER_REGISTRATION_EMAIL_TO_USER','EMAIL_CONF','','SENT','<f71324da-8174-353a-9920-c388c5ae802e@gracecabs.com>',NULL,0,3,'{\"subject\": \"User Account Login Details - GraceCabs\", \"accepted\": [\"employee_1792810964994@alphatech.com\", \"gracecabs1975@gmail.com\"]}','2026-10-24 03:02:56','2026-10-24 03:02:56'),('130541c9-ab06-4817-9d5b-d317c59b125f','EMAIL','apex.admin.1792818243235@example.com','TENANT_ADMIN_ACTIVATION_LINK','TENANT','1955aa22-d93f-4279-ad55-22f656aa504d','SENT','<b4975363-3eb4-ffe3-b437-9642674f3084@gracecabs.com>',NULL,0,3,'{\"loginUrl\": \"http://localhost:3000/adminlogin\", \"tenantId\": \"1955aa22-d93f-4279-ad55-22f656aa504d\", \"attachments\": [{\"path\": \"D:\\\\demobooking\\\\demo-bookings\\\\backend\\\\uploads\\\\plans\\\\Plan_Summary_APX235_1955aa22.pdf\", \"filename\": \"Plan_Summary_APX235_1955aa22.pdf\"}], \"activationUrl\": \"http://localhost:3000/activate-account?token=act_48643fe7ba27b7351f18d6a99dbe96efe6567a34244991b90f71859050cf6441\", \"planSummaryPdfUrl\": \"http://localhost:5000/api/tenants/plan-summary/download/Plan_Summary_APX235_1955aa22.pdf?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRJZCI6IjE5NTVhYTIyLWQ5M2YtNDI3OS1hZDU1LTIyZjY1NmFhNTA0ZCIsImZpbGVOYW1lIjoiUGxhbl9TdW1tYXJ5X0FQWDIzNV8xOTU1YWEyMi5wZGYiLCJ0eXBlIjoiUExBTl9TVU1NQVJZIiwiaWF0IjoxNzkyODE4MjQ1LCJleHAiOjE3OTU0MTAyNDV9.tOrHMVHcCSkwk1N6vPrWuUa1qKszf2crKxeBZhCK96c\"}','2026-10-24 05:04:14','2026-10-24 05:04:14'),('1324110b-ae85-4d64-8680-cb235693d157','EMAIL','subisha2002.m@gamil.com','ACCOUNT_ACTIVATED','TENANT','49009545-0e4d-4856-b21a-debcfa08b16c','SENT','<4a26ddb0-4ffc-4c69-de83-7671c7a58dfc@gmail.com>',NULL,0,3,'{\"loginUrl\": \"http://localhost:3001/login\", \"actionText\": \"Sign In to Fleet Portal\"}','2026-10-23 10:02:49','2026-10-23 10:02:49'),('13f9552d-abf8-4784-9fc3-834ff2d25bbf','EMAIL','subisha2002.m@gmail.com','SUPERADMIN_NEW_APPLICATION_ALERT','REGISTRATION_REQUEST','d8c7da45-b39c-45cb-9ab5-ca7288936bbc','SENT','<5c6f17c5-b0e2-976d-5716-625d5a0548b1@gmail.com>',NULL,0,3,'{\"reviewUrl\": \"http://localhost:3001/admin/registrations\", \"actionText\": \"Review Inbound Applications\"}','2026-10-23 04:57:32','2026-10-23 04:57:32'),('14187cad-c6d8-46b1-95e5-0178204c80b8','EMAIL','gracecabs1975@gmail.com','TEST_PROHIBITED_CONTACT',NULL,NULL,'FAILED',NULL,'Blocked: Delivery to obsolete Grace Cabs customer (gracecabs1975) is prohibited.',0,3,NULL,'2026-10-24 07:23:16','2026-10-24 07:23:16'),('146d4c86-20ae-44a6-b9c5-a64a0d11fe48','EMAIL','alpha_worker_1792823422345@alphatech.com','FORGET_PASSWORD_OTP','EMAIL_CONF','a23808cf-a207-4052-95c9-99c8406292a0','SENT','<89a46e8a-a721-1810-d744-f6dc3a9f5c33@gracecabs.com>',NULL,0,3,'{\"subject\": \"OTP sent to reset for your password - GraceCabs\", \"accepted\": [\"alpha_worker_1792823422345@alphatech.com\", \"gracecabs1975@gmail.com\"], \"tenantId\": \"e7b8a1c0-0000-0000-0000-000000000001\"}','2026-10-24 06:30:32','2026-10-24 06:30:32'),('1542987e-77c7-4e49-add7-910262d8d45f','EMAIL','subisha2002.m@gmail.com','DIAGNOSTIC_VERIFICATION',NULL,NULL,'SENT','<34fdc2d5-af51-865b-1a4e-bee20c5366e7@gmail.com>',NULL,0,3,'{\"host\": \"smtp.gmail.com\", \"sender\": \"subisha2002.m@gmail.com\"}','2026-10-23 06:38:08','2026-10-23 06:38:08'),('1573b3cb-e337-407e-a140-ceaeeafb38b9','EMAIL','subisha2002.m@gmail.com','SUPERADMIN_NEW_APPLICATION_ALERT','REGISTRATION_REQUEST','e35726b9-2f57-4dc5-bb1c-1a397854fec4','SENT','<0ff68371-cbb9-9f35-f3e7-fb60c620d622@gracecabs.com>',NULL,0,3,'{\"reviewUrl\": \"http://localhost:3000/admin/registrations\", \"actionText\": \"Review Inbound Applications\"}','2026-10-24 06:31:00','2026-10-24 06:31:00'),('15a3ca47-55e6-4b66-9ccf-b30bde5fab08','EMAIL','applicant_1792756477251@skylinecabs.in','REGISTRATION_RECEIVED','REGISTRATION_REQUEST','eef347ad-2e5e-42d7-843d-854d44cb4fba','SENT','<87cc5a41-e8d7-807c-54dc-ec6f142625d2@gracecabs.com>',NULL,0,3,NULL,'2026-10-23 11:54:45','2026-10-23 11:54:45'),('164e295e-58b9-4b36-8188-440b44fe7bc3','EMAIL','ramesh.rg350253@swiftlogistics.com','REGISTRATION_RECEIVED','REGISTRATION_REQUEST','de0aa92f-c287-48ff-b851-67c81a8238aa','SENT','<823d6001-e0bf-8979-1e4c-d1654ff15c70@gracecabs.com>',NULL,0,3,NULL,'2026-10-23 11:52:37','2026-10-23 11:52:37'),('1688fbb5-a2e5-41f8-aeb8-36d6db9ff7bf','EMAIL','subisha2002.m@gmail.com','DIAGNOSTIC_VERIFICATION',NULL,NULL,'SENT','<658d7ee1-f684-dd6b-e529-ce5c0934de07@gmail.com>',NULL,0,3,'{\"host\": \"smtp.gmail.com\", \"sender\": \"subisha2002.m@gmail.com\"}','2026-10-23 04:59:45','2026-10-23 04:59:45'),('168dbff8-895f-4d36-8d2f-c276a7cd39b9','SMS','9080280818','SUPERADMIN_NEW_APPLICATION_SMS','REGISTRATION_REQUEST','eef347ad-2e5e-42d7-843d-854d44cb4fba','SENT','a4f08c61ea404732-BOM',NULL,0,3,NULL,'2026-10-23 11:54:37','2026-10-23 11:54:37'),('181dfa14-378f-48f6-a617-0abfdffff3c4','SMS','9840123456','REGISTRATION_RECEIVED_SMS','REGISTRATION_REQUEST','70692e5e-1781-4321-9d02-fada6ce07767','SENT','a4f66d23d825b330-BOM',NULL,0,3,NULL,'2026-10-24 05:01:52','2026-10-24 05:01:52'),('185187fa-6878-4f4a-870a-e079433185d0','EMAIL','subisha2002.m@gmail.com','FORGET_PASSWORD_OTP','EMAIL_CONF','','SENT','<cfd7820e-ab66-1e39-8b28-5f0622f0319c@gmail.com>',NULL,0,3,'{\"subject\": \"OTP sent to reset for your password - GraceCabs\", \"accepted\": [\"subisha2002.m@gmail.com\", \"gracecabs1975@gmail.com\"]}','2026-10-23 10:04:17','2026-10-23 10:04:17'),('1a3d0875-9b3a-4433-acf2-37d466eb62f0','EMAIL','suresh-1792823368587@alpha.com','DRIVER_REGISTRATION_EMAIL_TO_DRIVER','EMAIL_CONF','86565456-0988-449b-bd25-cac4b8bfcdbc','SENT','<67f7ab9e-0f4a-6ab7-c8fa-1424b9eb6a60@gracecabs.com>',NULL,0,3,'{\"subject\": \"Driver Account Created - GraceCabs\", \"accepted\": [\"suresh-1792823368587@alpha.com\"], \"tenantId\": \"a1a1a1a1-1111-4111-a111-111111111111\"}','2026-10-24 06:29:36','2026-10-24 06:29:36'),('1dd5de3a-4293-4ffe-8d6a-82927582e17c','EMAIL','gracecabs1975@gmail.com','TEST_ISOLATION',NULL,NULL,'FAILED',NULL,'Blocked: Delivery to obsolete Grace Cabs customer (gracecabs1975) is prohibited.',0,3,NULL,'2026-10-24 07:14:26','2026-10-24 07:14:26'),('20bec2da-735e-4966-b1cf-6deb2fb968ec','SMS','9810617537','DRIVER_WELCOME_SMS','DRIVER','292cb327-da73-4579-aa70-8a1933230c33','FAILED',NULL,'Incorrect sender id and TemplateName provided',0,3,'{\"driverId\": \"292cb327-da73-4579-aa70-8a1933230c33\", \"driverName\": \"Senthil Murugan\"}','2026-10-24 02:57:10','2026-10-24 02:57:10'),('20e842e6-2f04-40c3-9f6b-4805bf6cd7a7','SMS','9080280818','SUPERADMIN_NEW_APPLICATION_SMS','REGISTRATION_REQUEST','e35726b9-2f57-4dc5-bb1c-1a397854fec4','SENT','a4f6ef82fcdb5b2f-BOM',NULL,0,3,NULL,'2026-10-24 06:30:52','2026-10-24 06:30:52'),('2146f60c-7714-47b6-bf68-c4428227ec8f','EMAIL','driver_1792823411664@alphafleet.com','DRIVER_REGISTRATION_EMAIL_TO_DRIVER','EMAIL_CONF','86565456-0988-449b-bd25-cac4b8bfcdbc','SENT','<f9903b9d-efcf-2fd9-dc62-7bbf26d04006@gracecabs.com>',NULL,0,3,'{\"subject\": \"Driver Account Created - GraceCabs\", \"accepted\": [\"driver_1792823411664@alphafleet.com\"], \"tenantId\": \"d6acc1a3-6116-4fad-802d-f6157dd941a8\"}','2026-10-24 06:30:19','2026-10-24 06:30:19'),('2156096b-db1d-4ab8-bf64-a0bfd6d7eafd','EMAIL','subisha2002.m@gmail.com','SUPERADMIN_NEW_APPLICATION_ALERT','REGISTRATION_REQUEST','b69a8cbb-1ec7-418c-ba02-5817603b0224','SENT','<43aeb520-5727-2317-74fd-3f08030e3253@gmail.com>',NULL,0,3,'{\"reviewUrl\": \"http://localhost:3001/admin/registrations\", \"actionText\": \"Review Inbound Applications\"}','2026-10-23 06:16:27','2026-10-23 06:16:27'),('21b8eddf-5bf8-4fdc-9e48-cb87ccb90ab2','EMAIL','ramesh.rg265945@swiftlogistics.com','ACCOUNT_ACTIVATED','TENANT','b1e23f69-e694-4399-9021-e4284590c401','SENT','<33502c03-70f9-978f-fa1e-c0c8ad6b23f8@gracecabs.com>',NULL,0,3,'{\"loginUrl\": \"http://localhost:3000/login\", \"actionText\": \"Sign In to Fleet Portal\"}','2026-10-24 03:08:16','2026-10-24 03:08:16'),('230e70e3-867f-4d8c-90f3-351b895d6f38','EMAIL','applicant_1792811459975@skylinecabs.in','ACCOUNT_ACTIVATED','TENANT','32f12cf7-933a-4d2b-a979-0e555833871e','SENT','<29bc190b-290f-04b4-c090-4582378351b7@gracecabs.com>',NULL,0,3,'{\"loginUrl\": \"http://localhost:3000/login\", \"actionText\": \"Sign In to Fleet Portal\"}','2026-10-24 03:11:29','2026-10-24 03:11:29'),('232b37ca-dc42-4639-bbcf-949cb987731d','EMAIL','applicant_1792737447321@skylinecabs.in','TENANT_ADMIN_ACTIVATION_LINK','TENANT','4ba6faf9-fa09-4027-b5be-805b4bd81a45','SENT','<085828f9-3c3a-1834-a957-792b171b8c2b@gmail.com>',NULL,0,3,'{\"tenantId\": \"4ba6faf9-fa09-4027-b5be-805b4bd81a45\", \"activationUrl\": \"http://localhost:3001/activate-account?token=act_1ba726055d507c3ce77a6a0d579d3f9f060923657b8bd70720f5ede874be96e8\"}','2026-10-23 06:37:34','2026-10-23 06:37:34'),('239145fe-9d1e-471f-b8ae-1ecb20175762','EMAIL','subisha2002.m@gmail.com','SUPERADMIN_NEW_APPLICATION_ALERT','REGISTRATION_REQUEST','f4a0eb8c-cc94-4e3b-8aba-ced0bc6bd497','SENT','<79baefd5-3cbd-8331-3fb0-d4110f4ca3f7@gmail.com>',NULL,0,3,'{\"reviewUrl\": \"http://localhost:3001/admin/registrations\", \"actionText\": \"Review Inbound Applications\"}','2026-10-23 10:11:47','2026-10-23 10:11:47'),('23dfd840-1903-4f1a-8a56-f3aaeb6bfebe','EMAIL','admin@gracecabs.com','SUPERADMIN_NEW_APPLICATION_ALERT','REGISTRATION_REQUEST','4f50e079-c6bc-4454-be2d-4f7e5dffab24','FAILED',NULL,'Invalid login: 535 Authentication failed',0,3,NULL,'2026-10-22 05:18:02','2026-10-22 05:18:02'),('24899975-7027-439e-ab95-4e011e937311','EMAIL','ganthimurugan1977@gmail.com','REGISTRATION_RECEIVED','REGISTRATION_REQUEST','f4a0eb8c-cc94-4e3b-8aba-ced0bc6bd497','SENT','<7b26d749-064f-48d7-94cd-63e4f2c74b6d@gmail.com>',NULL,0,3,NULL,'2026-10-23 10:11:47','2026-10-23 10:11:47'),('259a9237-40cf-4193-82e4-74c3144bea5c','SMS','9810976727','DRIVER_WELCOME_SMS','DRIVER','57d21dad-b3f7-42dd-92ea-60cc1d8ea91f','FAILED',NULL,'Incorrect sender id and TemplateName provided',0,3,'{\"driverId\": \"57d21dad-b3f7-42dd-92ea-60cc1d8ea91f\", \"driverName\": \"Senthil Murugan\"}','2026-10-24 03:03:12','2026-10-24 03:03:12'),('27497dd2-0bc9-4a73-b6c4-b0ddc7b1f2c3','EMAIL','subipcs@gmail.com','REGISTRATION_RECEIVED','REGISTRATION_REQUEST','f85733d6-f08d-46b3-97ec-8ba291e821f1','SENT','<ae66e1ef-f350-d606-f2c3-be82968cd0bd@gmail.com>',NULL,0,3,NULL,'2026-10-22 11:42:08','2026-10-22 11:42:08'),('27c416c3-b379-4ed3-9d73-8e8b649dc73a','EMAIL','employee_1792823402010@alphatech.com','USER_REGISTRATION_EMAIL_TO_USER','EMAIL_CONF','4b4bc6f6-9e7d-4b35-ba73-638861b65066','SENT','<a34cb966-b07b-7b23-076c-aa64c352f039@gracecabs.com>',NULL,0,3,'{\"subject\": \"User Account Login Details - GraceCabs\", \"accepted\": [\"employee_1792823402010@alphatech.com\", \"gracecabs1975@gmail.com\"], \"tenantId\": \"d6acc1a3-6116-4fad-802d-f6157dd941a8\"}','2026-10-24 06:30:11','2026-10-24 06:30:11'),('28651bfd-bb06-48ca-b07a-06cb1ac386bd','EMAIL','subisha2002.m@gmail.com','SUPERADMIN_NEW_APPLICATION_ALERT','REGISTRATION_REQUEST','1ddba0ad-8316-490a-aee2-e260dea1a32e','SENT','<8ce441eb-1f4f-a56c-9415-443322167425@gracecabs.com>',NULL,0,3,'{\"reviewUrl\": \"http://localhost:3001/admin/registrations\", \"actionText\": \"Review Inbound Applications\"}','2026-10-23 10:48:07','2026-10-23 10:48:07'),('29c03431-bb63-4f4c-869f-3343f8d0745b','EMAIL','ramesh.rg999930@swiftlogistics.com','TENANT_ADMIN_ACTIVATION_LINK','TENANT','1e787664-832a-4465-8c1a-3db73301538e','SENT','<81800f18-3f66-6e74-49b6-7be22b46e35d@gracecabs.com>',NULL,0,3,'{\"loginUrl\": \"http://localhost:3000/adminlogin\", \"tenantId\": \"1e787664-832a-4465-8c1a-3db73301538e\", \"attachments\": [{\"path\": \"D:\\\\demobooking\\\\demo-bookings\\\\backend\\\\uploads\\\\plans\\\\Plan_Summary_RG999930_1e787664.pdf\", \"filename\": \"Plan_Summary_RG999930_1e787664.pdf\"}], \"activationUrl\": \"http://localhost:3000/activate-account?token=act_7e775f9994263dc73f79ffaf49f4dcd08747b3333112a69aa37b4e5e3672fde9\", \"planSummaryPdfUrl\": \"http://localhost:5000/api/tenants/plan-summary/download/Plan_Summary_RG999930_1e787664.pdf?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRJZCI6IjFlNzg3NjY0LTgzMmEtNDQ2NS04YzFhLTNkYjczMzAxNTM4ZSIsImZpbGVOYW1lIjoiUGxhbl9TdW1tYXJ5X1JHOTk5OTMwXzFlNzg3NjY0LnBkZiIsInR5cGUiOiJQTEFOX1NVTU1BUlkiLCJpYXQiOjE3OTI4MTgwMTAsImV4cCI6MTc5NTQxMDAxMH0.C1-P6QmDZyVphAGmWLHyly7-HeGuyQtuQu4Y6leS4no\"}','2026-10-24 05:00:19','2026-10-24 05:00:19'),('2a202e4d-058e-4270-bec7-4a3bd0085576','EMAIL','ramesh.rg265945@swiftlogistics.com','TENANT_ADMIN_ACTIVATION_LINK','TENANT','b1e23f69-e694-4399-9021-e4284590c401','SENT','<921f48d2-5451-feae-83b0-6be99f2e15ea@gracecabs.com>',NULL,0,3,'{\"tenantId\": \"b1e23f69-e694-4399-9021-e4284590c401\", \"activationUrl\": \"http://localhost:3000/activate-account?token=act_ad2d3f64d0e3bc9e4fdc91798dab784fcc76ddd72f5f43ecf2b759dc57c55b94\"}','2026-10-24 03:08:07','2026-10-24 03:08:07'),('2b146adf-88cc-4207-a65e-c4a0b9c6cc06','EMAIL','applicant_1792737104267@skylinecabs.in','REGISTRATION_RECEIVED','REGISTRATION_REQUEST','5d6fd131-6304-4063-8f46-ecc0c18945f2','SENT','<4a618d27-e14f-a746-b7bd-d140bb915ab7@gmail.com>',NULL,0,3,NULL,'2026-10-23 06:31:48','2026-10-23 06:31:48'),('2d13d935-bca3-43db-8188-113bbe70c811','EMAIL','ramesh.rg999930@swiftlogistics.com','ACCOUNT_ACTIVATED','TENANT','1e787664-832a-4465-8c1a-3db73301538e','SENT','<b6376d32-e411-2aa0-5401-9941e4337b13@gracecabs.com>',NULL,0,3,'{\"loginUrl\": \"http://localhost:3000/login\", \"actionText\": \"Sign In to Fleet Portal\"}','2026-10-24 05:00:27','2026-10-24 05:00:27'),('2dd2da76-3165-4f3c-a98e-de150f845e89','EMAIL','gracecabs1975@gmail.com, traveldesk@gracecabs.com','MONTHLY_BOOKING','EMAIL_CONF','','SENT','<d542a56e-8b4a-d8ed-a6aa-0aab10e4b1c7@gracecabs.com>',NULL,0,3,'{\"subject\": \"Monthly Booking Details: acf9a82b-6831-4d4b-939b-eb33b4ff2b14 with Gracecabs.com\", \"accepted\": [\"gracecabs1975@gmail.com\", \"traveldesk@gracecabs.com\"]}','2026-10-22 10:44:19','2026-10-22 10:44:19'),('304d2ae6-3c88-4be6-a2e7-f2b5bd1e3686','SMS','9840123456','REGISTRATION_RECEIVED_SMS','REGISTRATION_REQUEST','81ea148e-d3c3-47b7-8e68-ebbf436507cf','SENT','a4eea5b25eff88ec-BOM',NULL,0,3,NULL,'2026-10-23 06:22:23','2026-10-23 06:22:23'),('306fb4c0-35c4-4942-88da-3e354f272a5f','EMAIL','gracecabs1975@gmail.com,traveldesk@gracecabs.com','USER_INVOICE_EMAIL','EMAIL_CONF','','SENT','<92299c8f-563c-45c4-eabc-04447c8cf3ff@gracecabs.com>',NULL,0,3,'{\"subject\": \"Invoice Details for Order #: 202610220026 - GraceCabss\", \"accepted\": [\"gracecabs1975@gmail.com\", \"traveldesk@gracecabs.com\"]}','2026-10-22 10:44:06','2026-10-22 10:44:06'),('3247f042-ed5e-4c2f-9413-4711ab0f0c8e','EMAIL','subisha2002@gmail.com','SUPERADMIN_NEW_APPLICATION_ALERT','REGISTRATION_REQUEST','910e30ed-9c4a-4e30-9a49-6277ff3228f3','SENT','<811b96b9-0fea-384a-833e-100d4d89f3dd@gracecabs.com>',NULL,0,3,'{\"reviewUrl\": \"http://localhost:3001/admin/registrations\", \"actionText\": \"Review Inbound Applications\"}','2026-10-22 08:51:58','2026-10-22 08:51:58'),('32af5f02-e5ab-4037-bc26-f477b526dd23','SMS','9510997059','DRIVER_WELCOME_SMS','DRIVER','6db25e66-9a65-43e9-80ed-b9d2bd9577fa','FAILED',NULL,'Incorrect sender id and TemplateName provided',0,3,'{\"driverId\": \"6db25e66-9a65-43e9-80ed-b9d2bd9577fa\", \"driverName\": \"Suresh Kumar\"}','2026-10-26 05:35:44','2026-10-26 05:35:44'),('339a2866-8e16-4278-afbc-92e7006fb59e','EMAIL','ramesh.rg724871@swiftlogistics.com','REGISTRATION_RECEIVED','REGISTRATION_REQUEST','1284a65a-f8fd-40e5-9c88-4876608e7510','SENT','<31400b2f-86c6-cbe7-dcfb-e697b3690b17@gracecabs.com>',NULL,0,3,NULL,'2026-10-23 11:42:12','2026-10-23 11:42:12'),('34526031-7f14-4a96-be4b-7c643733042f','EMAIL','applicant_1792818112160@skylinecabs.in','TENANT_ADMIN_ACTIVATION_LINK','TENANT','fcf4a249-65e2-4259-8e61-f6d1e5a4ade5','SENT','<4f7b88d2-eb2c-1d3e-111c-99fffdb36473@gracecabs.com>',NULL,0,3,'{\"loginUrl\": \"http://localhost:3000/adminlogin\", \"tenantId\": \"fcf4a249-65e2-4259-8e61-f6d1e5a4ade5\", \"attachments\": [{\"path\": \"D:\\\\demobooking\\\\demo-bookings\\\\backend\\\\uploads\\\\plans\\\\Plan_Summary_SKY2160_fcf4a249.pdf\", \"filename\": \"Plan_Summary_SKY2160_fcf4a249.pdf\"}], \"activationUrl\": \"http://localhost:3000/activate-account?token=act_ca3c7cf205bab5b4b0de6cf9ab30c174faae53fd64ce6507ccb97ae5a62b7ec3\", \"planSummaryPdfUrl\": \"http://localhost:5000/api/tenants/plan-summary/download/Plan_Summary_SKY2160_fcf4a249.pdf?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRJZCI6ImZjZjRhMjQ5LTY1ZTItNDI1OS04ZTYxLWY2ZDFlNWE0YWRlNSIsImZpbGVOYW1lIjoiUGxhbl9TdW1tYXJ5X1NLWTIxNjBfZmNmNGEyNDkucGRmIiwidHlwZSI6IlBMQU5fU1VNTUFSWSIsImlhdCI6MTc5MjgxODEyMiwiZXhwIjoxNzk1NDEwMTIyfQ.PmojWM6F5EyLWPYOD_KN-iyU7BCjRy6UQbHPmulimkc\"}','2026-10-24 05:02:09','2026-10-24 05:02:09'),('34a4f6f6-c03d-4164-a054-e611488ea7a4','SMS','9080280818','SUPERADMIN_NEW_APPLICATION_SMS','REGISTRATION_REQUEST','d8c7da45-b39c-45cb-9ab5-ca7288936bbc','SENT','a4ee294dcfa74732-BOM',NULL,0,3,NULL,'2026-10-23 04:57:28','2026-10-23 04:57:28'),('356a8690-02d4-4b7a-9b19-dcaf71b9408c','SMS','+919876543210','REGISTRATION_RECEIVED_SMS','REGISTRATION_REQUEST','aaebdfa1-ade2-4ed9-8f48-efe7c14db73f','UNCONFIGURED',NULL,'No SMS provider configured. Set TWO_FACTOR_API_KEY or TWILIO credentials in backend/.env',0,3,NULL,'2026-10-22 10:43:00','2026-10-22 10:43:00'),('357f036a-9a32-401a-8da9-ce853f7647bb','SMS','9840123456','REGISTRATION_RECEIVED_SMS','REGISTRATION_REQUEST','1284a65a-f8fd-40e5-9c88-4876608e7510','SENT','a4f07a04197c88ec-BOM',NULL,0,3,NULL,'2026-10-23 11:42:05','2026-10-23 11:42:05'),('36dfc7fe-f229-43db-b8e3-93c2e02b063a','SMS','9575491629','DRIVER_WELCOME_SMS','DRIVER','56f166fd-ce9b-4b8a-b17c-dafac96072ff','FAILED',NULL,'Incorrect sender id and TemplateName provided',0,3,'{\"driverId\": \"56f166fd-ce9b-4b8a-b17c-dafac96072ff\", \"driverName\": \"Suresh Kumar\"}','2026-10-24 06:28:51','2026-10-24 06:28:51'),('3759460a-7d01-4ff9-8cd4-c8b9ab516909','EMAIL','alpha_worker_1792810995112@alphatech.com','FORGET_PASSWORD_OTP','EMAIL_CONF','','SENT','<b392ba7b-e697-553a-df83-1016de0794b9@gracecabs.com>',NULL,0,3,'{\"subject\": \"OTP sent to reset for your password - GraceCabs\", \"accepted\": [\"alpha_worker_1792810995112@alphatech.com\", \"gracecabs1975@gmail.com\"]}','2026-10-24 03:03:27','2026-10-24 03:03:27'),('384b9321-7d00-45fa-984b-ec3c211fa494','EMAIL','subipcs@gmail.com','REGISTRATION_RECEIVED','REGISTRATION_REQUEST','f8b30c07-67ca-44b5-b4fe-0ed4b665da90','FAILED',NULL,'Invalid login: 535 Authentication failed',0,3,NULL,'2026-10-22 06:24:17','2026-10-22 06:24:17'),('3a0d2c0c-4ca9-4ef5-bf66-1b2868e5705d','EMAIL','driver_1792810976727@alphafleet.com','DRIVER_REGISTRATION_EMAIL_TO_DRIVER','EMAIL_CONF','','SENT','<be4f4286-9abc-9497-f539-297a2df193ee@gracecabs.com>',NULL,0,3,'{\"subject\": \"Driver Account Created - GraceCabs\", \"accepted\": [\"driver_1792810976727@alphafleet.com\"]}','2026-10-24 03:03:10','2026-10-24 03:03:10'),('3b0cf981-ecc4-42bd-8715-b5804e7e03b4','SMS','9817966574','DRIVER_WELCOME_SMS','DRIVER','22b33a52-a2aa-46ab-9761-94c1e6013344','FAILED',NULL,'Incorrect sender id and TemplateName provided',0,3,'{\"driverId\": \"22b33a52-a2aa-46ab-9761-94c1e6013344\", \"driverName\": \"Senthil Murugan\"}','2026-10-24 04:59:36','2026-10-24 04:59:36'),('3baddbb4-4580-4f94-9551-18881560f983','SMS','9080280818','SUPERADMIN_NEW_APPLICATION_SMS','REGISTRATION_REQUEST','22eda7cc-21e1-4b56-ac54-13928681db7b','SENT','a4ee2b85dfb54732-BOM',NULL,0,3,NULL,'2026-10-23 04:58:59','2026-10-23 04:58:59'),('3d032791-575f-4ca3-8270-a2a4a506a9a5','EMAIL','driver_1792810698727@alphafleet.com','DRIVER_REGISTRATION_EMAIL_TO_DRIVER','EMAIL_CONF','','SENT','<576ba64c-3a2d-f51f-2300-b08a01dfd079@gracecabs.com>',NULL,0,3,'{\"subject\": \"Driver Account Created - GraceCabs\", \"accepted\": [\"driver_1792810698727@alphafleet.com\"]}','2026-10-24 02:58:27','2026-10-24 02:58:27'),('3d6b6505-49d4-499c-a79f-308c350481ec','EMAIL','alpha_worker_1792810632344@alphatech.com','FORGET_PASSWORD_OTP','EMAIL_CONF','','SENT','<2b333ab7-1004-4f38-c58f-96d9859e2252@gracecabs.com>',NULL,0,3,'{\"subject\": \"OTP sent to reset for your password - GraceCabs\", \"accepted\": [\"alpha_worker_1792810632344@alphatech.com\", \"gracecabs1975@gmail.com\"]}','2026-10-24 02:57:25','2026-10-24 02:57:25'),('3dc86a28-dcdb-4fde-95b9-885fb046835a','EMAIL','subipcs@gmail.com','ACCOUNT_ACTIVATED','TENANT','86dd7cb6-db2b-41f2-84b8-084239222083','SENT','<4404ba9e-5a7c-ea1d-b9a7-5cdfc03e0e97@gmail.com>',NULL,0,3,'{\"loginUrl\": \"http://localhost:3001/login\", \"actionText\": \"Sign In to Fleet Portal\"}','2026-10-23 05:37:57','2026-10-23 05:37:57'),('3f0737d5-9230-4d06-8d04-c19aa48ea163','EMAIL','employee_1792817957571@alphatech.com','USER_REGISTRATION_EMAIL_TO_USER','EMAIL_CONF','','SENT','<6762cd30-17e1-78f4-2a0a-3c60b2281219@gracecabs.com>',NULL,0,3,'{\"subject\": \"User Account Login Details - GraceCabs\", \"accepted\": [\"employee_1792817957571@alphatech.com\", \"gracecabs1975@gmail.com\"]}','2026-10-24 04:59:26','2026-10-24 04:59:26'),('3ff38e7b-3b62-47b1-a8d1-59f0427b649b','EMAIL','admin@gracecabs.com','SUPERADMIN_NEW_APPLICATION_ALERT','REGISTRATION_REQUEST','45c1a48a-5e67-451e-a8be-fd4d91aa3e52','FAILED',NULL,'Invalid login: 535 Authentication failed',0,3,NULL,'2026-10-22 05:20:23','2026-10-22 05:20:23'),('4010f881-51f8-4d4c-bc49-922325bbf00b','EMAIL','suresh-1792826611488@alpha.com','DRIVER_REGISTRATION_EMAIL_TO_DRIVER','EMAIL_CONF','86565456-0988-449b-bd25-cac4b8bfcdbc','SENT','<a41dd807-6579-8365-c003-9352b13a7a4e@gracecabs.com>',NULL,0,3,'{\"subject\": \"Driver Account Created - GraceCabs\", \"accepted\": [\"suresh-1792826611488@alpha.com\"], \"tenantId\": \"a1a1a1a1-1111-4111-a111-111111111111\"}','2026-10-24 07:23:39','2026-10-24 07:23:39'),('4096a398-c2e1-46b9-85f9-c1ccf591faa9','EMAIL','subisha2002.m@gmail.com','SUPERADMIN_NEW_APPLICATION_ALERT','REGISTRATION_REQUEST','3e961ada-525c-4ad4-9dc4-d8b609707107','SENT','<c4f8f9e6-9183-9c09-3e7b-3aef6c7f8bb2@gmail.com>',NULL,0,3,'{\"reviewUrl\": \"http://localhost:3001/admin/registrations\", \"actionText\": \"Review Inbound Applications\"}','2026-10-23 05:20:22','2026-10-23 05:20:22'),('41598f7d-ca40-446d-addc-7345ef1248e3','EMAIL','ramesh.rg440482@swiftlogistics.com','ACCOUNT_ACTIVATED','TENANT','9ac80877-705b-4d72-b42b-5b5ffd741ab1','SENT','<e965cee9-d2db-86a0-f6b4-9bd972f4273e@gracecabs.com>',NULL,0,3,'{\"loginUrl\": \"http://localhost:3000/login\", \"actionText\": \"Sign In to Fleet Portal\"}','2026-10-23 11:54:23','2026-10-23 11:54:23'),('4186e083-87ff-4efc-a839-219b53fe23c2','EMAIL','apex.admin.1792992654059@example.com','TENANT_ADMIN_ACTIVATION_LINK','TENANT','14bb904a-d2c1-40e6-a977-35c989edc4c7','SENT','<cc751be6-8925-3922-72e2-7eb06d2726ce@gracecabs.com>',NULL,0,3,'{\"loginUrl\": \"http://localhost:3000/adminlogin\", \"tenantId\": \"14bb904a-d2c1-40e6-a977-35c989edc4c7\", \"attachments\": [{\"path\": \"D:\\\\demobooking\\\\demo-bookings\\\\backend\\\\uploads\\\\plans\\\\Plan_Summary_APX059_14bb904a.pdf\", \"filename\": \"Plan_Summary_APX059_14bb904a.pdf\"}], \"activationUrl\": \"http://localhost:3000/activate-account?token=act_d90bb95a4802257c30f1368ca922af7da75ffa1708ea16ef31e77aeb6e94544a\", \"planSummaryPdfUrl\": \"http://localhost:5000/api/tenants/plan-summary/download/Plan_Summary_APX059_14bb904a.pdf?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRJZCI6IjE0YmI5MDRhLWQyYzEtNDBlNi1hOTc3LTM1Yzk4OWVkYzRjNyIsImZpbGVOYW1lIjoiUGxhbl9TdW1tYXJ5X0FQWDA1OV8xNGJiOTA0YS5wZGYiLCJ0eXBlIjoiUExBTl9TVU1NQVJZIiwiaWF0IjoxNzkyOTkyNjU2LCJleHAiOjE3OTU1ODQ2NTZ9.QKC970QYAUwzMxQHZMQcrrRTxzVb9_MoQKwKQH5bIKo\"}','2026-10-26 05:31:06','2026-10-26 05:31:06'),('422f5b68-a9bb-4b1b-adb1-17b8cdcb4a20','EMAIL','ramesh.rg999930@swiftlogistics.com','REGISTRATION_RECEIVED','REGISTRATION_REQUEST','e0ebf804-180b-42d9-90a0-859cfb72759f','SENT','<1d042c79-d606-efdf-bbfb-e57a5f27b685@gracecabs.com>',NULL,0,3,NULL,'2026-10-24 05:00:08','2026-10-24 05:00:08'),('434343c5-ebf5-45a2-a324-56f25faa712b','EMAIL','subisha2002.m@gmail.com','SUPERADMIN_NEW_APPLICATION_ALERT','REGISTRATION_REQUEST','c8cd01f3-ca7f-4450-8c3d-214d5c64c95a','SENT','<bef28d7e-d382-6604-62c3-e40abbd9dc57@gracecabs.com>',NULL,0,3,'{\"reviewUrl\": \"http://localhost:3000/admin/registrations\", \"actionText\": \"Review Inbound Applications\"}','2026-10-23 11:54:08','2026-10-23 11:54:08'),('43c8fce1-d5a7-49d3-8c0c-b186c200a398','SMS','9840123456','REGISTRATION_RECEIVED_SMS','REGISTRATION_REQUEST','3a85126f-206c-4b89-a53d-2b2bda35fdea','SENT','a4f07cf4cf9d88ec-BOM',NULL,0,3,NULL,'2026-10-23 11:44:10','2026-10-23 11:44:10'),('4431bce3-e284-46a2-a865-94d83cc559c8','SMS','9080280818','SUPERADMIN_NEW_APPLICATION_SMS','REGISTRATION_REQUEST','e39ca843-8f7e-4d3a-8a1f-d58d3b8a2f5b','SENT','a4e8464c3c935b2f-BOM',NULL,0,3,NULL,'2026-10-22 11:48:41','2026-10-22 11:48:41'),('44e69fcd-0a3d-4392-85e6-ffb311e00d93','SMS','9810844838','DRIVER_WELCOME_SMS','DRIVER','a4634b0b-cb54-45c6-9d15-e3050c1902ef','FAILED',NULL,'Incorrect sender id and TemplateName provided',0,3,'{\"driverId\": \"a4634b0b-cb54-45c6-9d15-e3050c1902ef\", \"driverName\": \"Senthil Murugan\"}','2026-10-24 03:01:01','2026-10-24 03:01:01'),('452f34ef-ec71-4e5f-9e71-13c755d40757','EMAIL','subisha2002.m@gmail.com','SUPERADMIN_NEW_APPLICATION_ALERT','REGISTRATION_REQUEST','ad371ca6-7565-48b2-ba2e-2fbd13328730','SENT','<3aed2c79-716e-ba08-f8a7-e301add0da4f@gracecabs.com>',NULL,0,3,'{\"reviewUrl\": \"http://localhost:3001/admin/registrations\", \"actionText\": \"Review Inbound Applications\"}','2026-10-23 10:49:36','2026-10-23 10:49:36'),('46451084-4b1a-4d05-9b93-0ed2c002930e','EMAIL','applicant_1792737447321@skylinecabs.in','ACCOUNT_ACTIVATED','TENANT','4ba6faf9-fa09-4027-b5be-805b4bd81a45','SENT','<b4a32b9d-0978-285c-8629-11ea4ad477c8@gmail.com>',NULL,0,3,'{\"loginUrl\": \"http://localhost:3001/login\", \"actionText\": \"Sign In to Fleet Portal\"}','2026-10-23 06:37:38','2026-10-23 06:37:38'),('4898af2b-a756-4283-a9e9-0e82e3bfc8d6','SMS','9533155616','DRIVER_WELCOME_SMS','DRIVER','9d074958-62ac-4674-a3e1-974e27b4889a','FAILED',NULL,'Incorrect sender id and TemplateName provided',0,3,'{\"driverId\": \"9d074958-62ac-4674-a3e1-974e27b4889a\", \"driverName\": \"Vikram Singh\"}','2026-10-24 07:23:48','2026-10-24 07:23:48'),('48a2da4d-984c-4ea0-a3c9-fb95370b3871','EMAIL','ops@tst6761.com','TENANT_ADMIN_ACTIVATION_LINK','TENANT','81a5f5d9-8b0b-4754-a148-a03d538ee684','SENT','<53feb51f-b6f4-9be3-545b-1ad49706b78d@gracecabs.com>',NULL,0,3,'{\"tenantId\": \"81a5f5d9-8b0b-4754-a148-a03d538ee684\", \"actionText\": \"Set Password & Activate\", \"activationUrl\": \"http://localhost:3001/activate-account?token=act_ac9625d7f7f04e677be8987412ff1debf26ef8400ed8221f903f10569a4b7027\"}','2026-10-22 10:44:44','2026-10-22 10:44:44'),('4aaae0bc-4615-40a9-8de6-f407a1d8aaef','EMAIL','subisha2002@gmail.com','DIAGNOSTIC_VERIFICATION',NULL,NULL,'SENT','<6655fed6-d78c-20e9-40fa-4190e36bf3c9@gmail.com>',NULL,0,3,'{\"host\": \"smtp.gmail.com\", \"sender\": \"subisha2002.m@gmail.com\"}','2026-10-22 11:47:30','2026-10-22 11:47:30'),('4acb8172-9f45-45c1-af3e-59a078ecc5f9','EMAIL','ramesh.rg452021@swiftlogistics.com','ACCOUNT_ACTIVATED','TENANT','c2d8727d-e378-4c23-afca-b91ec6b925aa','SENT','<d690b7b0-a1cf-a04e-cce5-8ebfab70b6ac@gracecabs.com>',NULL,0,3,'{\"loginUrl\": \"http://localhost:3000/login\", \"actionText\": \"Sign In to Fleet Portal\"}','2026-10-24 06:31:20','2026-10-24 06:31:20'),('4becd5d9-94ca-45cc-8a55-2b0145ce986b','SMS','9575491629','DRIVER_WELCOME_SMS','DRIVER','4c7f5464-ecc1-4a48-9b57-c702544be68c','FAILED',NULL,'Incorrect sender id and TemplateName provided',0,3,'{\"driverId\": \"4c7f5464-ecc1-4a48-9b57-c702544be68c\", \"driverName\": \"Vikram Singh\"}','2026-10-24 06:29:00','2026-10-24 06:29:00'),('4fc38d85-8015-4ea9-bcde-254dae1aa555','EMAIL','driver_1792810844838@alphafleet.com','DRIVER_REGISTRATION_EMAIL_TO_DRIVER','EMAIL_CONF','','SENT','<d66a6e16-e4cd-de11-b66d-990294c52294@gracecabs.com>',NULL,0,3,'{\"subject\": \"Driver Account Created - GraceCabs\", \"accepted\": [\"driver_1792810844838@alphafleet.com\"]}','2026-10-24 03:00:58','2026-10-24 03:00:58'),('50a2516e-317f-47bd-9a30-d130c9aa6c16','SMS','9080280818','SUPERADMIN_NEW_APPLICATION_SMS','REGISTRATION_REQUEST','3770f16c-5aa8-4ca3-ac27-718b01a02516','SENT','a4f5c5fb8cb3b330-BOM',NULL,0,3,NULL,'2026-10-24 03:07:46','2026-10-24 03:07:46'),('5211033f-accb-483e-9d9d-b68a474fc139','EMAIL','subisha2002.m@gmail.com','SUPERADMIN_NEW_APPLICATION_ALERT','REGISTRATION_REQUEST','f5f8a573-bdf4-4297-8af0-c53d564007f5','FAILED',NULL,'Invalid login: 535 Authentication failed',0,3,'{\"reviewUrl\": \"http://localhost:3001/admin/registrations\", \"actionText\": \"Review Inbound Applications\"}','2026-10-22 07:34:27','2026-10-22 07:34:27'),('5327f02c-92e3-4cbc-a7eb-8895f72378d6','EMAIL','subisha2002@gmail.com','SUPERADMIN_NEW_APPLICATION_ALERT','REGISTRATION_REQUEST','f85733d6-f08d-46b3-97ec-8ba291e821f1','SENT','<2ff12ad3-09f3-caf7-e6bd-562cb575bd2f@gmail.com>',NULL,0,3,'{\"reviewUrl\": \"http://localhost:3001/admin/registrations\", \"actionText\": \"Review Inbound Applications\"}','2026-10-22 11:42:08','2026-10-22 11:42:08'),('5489bb50-3c30-4929-ae4e-4d4d1c22e6ef','EMAIL','subisha2002.m@gmail.com','SUPERADMIN_NEW_APPLICATION_ALERT','REGISTRATION_REQUEST','2354fc96-d4c0-4fff-a396-b7e56eb78e3b','SENT','<5cf293f5-d17a-d13a-f749-a6e1041ec8f5@gracecabs.com>',NULL,0,3,'{\"reviewUrl\": \"http://localhost:3000/admin/registrations\", \"actionText\": \"Review Inbound Applications\"}','2026-10-23 11:48:40','2026-10-23 11:48:40'),('5498e436-37b2-4cf8-8839-f36743b48c56','EMAIL','subisha2002.m@gmail.com','SUPERADMIN_NEW_APPLICATION_ALERT','REGISTRATION_REQUEST','f42a5f7c-9375-4f26-b047-cb9c2e491370','FAILED',NULL,'Invalid login: 535 Authentication failed',0,3,'{\"reviewUrl\": \"http://localhost:3001/admin/registrations\", \"actionText\": \"Review Inbound Applications\"}','2026-10-22 07:40:53','2026-10-22 07:40:53'),('556c1b9f-2899-426f-b4ce-31bd40aa8050','EMAIL','employee_1792810831101@alphatech.com','USER_REGISTRATION_EMAIL_TO_USER','EMAIL_CONF','','SENT','<82c153de-8b46-f754-1a24-d99c344bc7ef@gracecabs.com>',NULL,0,3,'{\"subject\": \"User Account Login Details - GraceCabs\", \"accepted\": [\"employee_1792810831101@alphatech.com\", \"gracecabs1975@gmail.com\"]}','2026-10-24 03:00:44','2026-10-24 03:00:44'),('57270db6-a443-4949-8e91-91c31460362a','EMAIL','subisha2002@gmail.com','DIAGNOSTIC_VERIFICATION',NULL,NULL,'SENT','<6f0b786b-5e3c-1a6a-ecd5-070f8772e1c0@gracecabs.com>',NULL,0,3,'{\"host\": \"smtpout.secureserver.net\", \"sender\": \"traveldesk@gracecabs.com\"}','2026-10-22 10:40:39','2026-10-22 10:40:39'),('576d6885-6dc1-4813-833c-8efc422888a5','EMAIL','applicant_1792756477251@skylinecabs.in','TENANT_ADMIN_ACTIVATION_LINK','TENANT','f6ce715e-b3b1-4aa7-bdf7-19d3200a0582','SENT','<1ebd3a9e-24b6-18be-465f-415f6479e4b2@gracecabs.com>',NULL,0,3,'{\"tenantId\": \"f6ce715e-b3b1-4aa7-bdf7-19d3200a0582\", \"activationUrl\": \"http://localhost:3000/activate-account?token=act_bd7ca5c43790bb1c405a5704e4a3b6d769f301e4523d75daefffa0186451c98a\"}','2026-10-23 11:54:54','2026-10-23 11:54:54'),('582d38d7-9a7d-4d06-8568-72cb8dca0b24','SMS','9840123456','REGISTRATION_RECEIVED_SMS','REGISTRATION_REQUEST','1ddba0ad-8316-490a-aee2-e260dea1a32e','SENT','a4f02ac51f655b2f-BOM',NULL,0,3,NULL,'2026-10-23 10:47:59','2026-10-23 10:47:59'),('58e986a1-74f2-48c1-bdcb-7e96c68913b8','EMAIL','admin@gracecabs.com','SUPERADMIN_NEW_APPLICATION_ALERT','REGISTRATION_REQUEST','746f0757-38b4-4bb6-b25c-14928f4146a8','FAILED',NULL,'Invalid login: 535 Authentication failed',0,3,NULL,'2026-10-22 06:22:30','2026-10-22 06:22:30'),('5aca318c-11a5-4b6c-9cdb-e1c88ec92448','EMAIL','subisha2002@gmail.com','SUPERADMIN_NEW_APPLICATION_ALERT','REGISTRATION_REQUEST','781819ee-98f5-456a-b9b8-d0c144024492','SENT','<e9babddc-aa62-7c09-5dcf-9bc6bac04b9e@gracecabs.com>',NULL,0,3,'{\"reviewUrl\": \"http://localhost:3001/admin/registrations\", \"actionText\": \"Review Inbound Applications\"}','2026-10-22 09:53:50','2026-10-22 09:53:50'),('5b880d5b-0d99-4196-80b9-4bb0de80d829','EMAIL','subisha2002.m@gmail.com','SUPERADMIN_NEW_APPLICATION_ALERT','REGISTRATION_REQUEST','3a85126f-206c-4b89-a53d-2b2bda35fdea','SENT','<fa070e6e-1c5b-dee5-d143-707e4da0465c@gracecabs.com>',NULL,0,3,'{\"reviewUrl\": \"http://localhost:3000/admin/registrations\", \"actionText\": \"Review Inbound Applications\"}','2026-10-23 11:44:14','2026-10-23 11:44:14'),('5d1279ff-64ee-40b3-beeb-32d40f7dd490','EMAIL','subisha2002@gmail.com','REGISTRATION_RECEIVED','REGISTRATION_REQUEST','d02cdf22-a7eb-4041-9b69-e8e088f019f2','SENT','<267f0d9c-e970-dc5e-faf6-1ed6a095ae0c@gmail.com>',NULL,0,3,NULL,'2026-10-22 11:50:09','2026-10-22 11:50:09'),('5dcd4686-3b9d-4977-bfe4-a35640734b5d','SMS','+919876543210','REGISTRATION_RECEIVED_SMS','REGISTRATION_REQUEST','b69a8cbb-1ec7-418c-ba02-5817603b0224','SENT','a4ee9ce7aaec40a5-BOM',NULL,0,3,NULL,'2026-10-23 06:16:23','2026-10-23 06:16:23'),('5eb9bd73-afac-4b4a-ae47-8529739246ba','SMS','9080280818','REGISTRATION_RECEIVED_SMS','REGISTRATION_REQUEST','d02cdf22-a7eb-4041-9b69-e8e088f019f2','SENT','a4e848639a295b2f-BOM',NULL,0,3,NULL,'2026-10-22 11:50:06','2026-10-22 11:50:06'),('6174cee1-8071-434f-8d28-ececb875e71e','SMS','9080280818','REGISTRATION_RECEIVED_SMS','REGISTRATION_REQUEST','f85733d6-f08d-46b3-97ec-8ba291e821f1','FAILED',NULL,'Incorrect sender id and TemplateName provided',0,3,NULL,'2026-10-22 11:42:06','2026-10-22 11:42:06'),('649ec01c-736e-4dc2-85ae-9a630d7a3b36','EMAIL','subisha2002.m@gmail.com','SUPERADMIN_NEW_APPLICATION_ALERT','REGISTRATION_REQUEST','a0a73963-c83a-4c5e-870b-8c62c13bd7b3','SENT','<4158cb35-8264-f38d-fd97-32b815ce4c27@gmail.com>',NULL,0,3,'{\"reviewUrl\": \"http://localhost:3001/admin/registrations\", \"actionText\": \"Review Inbound Applications\"}','2026-10-23 09:56:19','2026-10-23 09:56:19'),('64e33640-1f56-4572-914a-5420bf005266','SMS','9811221066','DRIVER_WELCOME_SMS','DRIVER','ac851e7c-c0db-477b-b355-8ee59f6ea0de','FAILED',NULL,'Incorrect sender id and TemplateName provided',0,3,'{\"driverId\": \"ac851e7c-c0db-477b-b355-8ee59f6ea0de\", \"driverName\": \"Senthil Murugan\"}','2026-10-24 03:07:18','2026-10-24 03:07:18'),('64f2cfdb-e08b-41fb-8ee4-54616a80ac17','SMS','9080280818','SUPERADMIN_NEW_APPLICATION_SMS','REGISTRATION_REQUEST','2354fc96-d4c0-4fff-a396-b7e56eb78e3b','SENT','a4f0837ea81f88ec-BOM',NULL,0,3,NULL,'2026-10-23 11:48:33','2026-10-23 11:48:33'),('6683a236-5399-450f-aca0-90b01eb15748','EMAIL','ramesh.rg845390@swiftlogistics.com','REGISTRATION_RECEIVED','REGISTRATION_REQUEST','3a85126f-206c-4b89-a53d-2b2bda35fdea','SENT','<3b7c58c6-6cb8-3492-5111-830b60de4779@gracecabs.com>',NULL,0,3,NULL,'2026-10-23 11:44:13','2026-10-23 11:44:13'),('67a2331b-5bbc-45ca-b148-7df24eab0fce','EMAIL','alpha_worker_1792810711513@alphatech.com','FORGET_PASSWORD_OTP','EMAIL_CONF','','SENT','<c0081d43-9b6f-7b67-cf05-3be67308fa25@gracecabs.com>',NULL,0,3,'{\"subject\": \"OTP sent to reset for your password - GraceCabs\", \"accepted\": [\"alpha_worker_1792810711513@alphatech.com\", \"gracecabs1975@gmail.com\"]}','2026-10-24 02:58:41','2026-10-24 02:58:41'),('6847e3f8-5dd0-4f86-8880-690bab2dce7e','SMS','9080280818','SUPERADMIN_NEW_APPLICATION_SMS','REGISTRATION_REQUEST','de0aa92f-c287-48ff-b851-67c81a8238aa','SENT','a4f0894859a28377-BOM',NULL,0,3,NULL,'2026-10-23 11:52:30','2026-10-23 11:52:30'),('68f64f95-02f4-4fbd-864a-acc35944ace8','EMAIL','subisha2002.m@gamil.com','TENANT_ADMIN_ACTIVATION_LINK','TENANT','49009545-0e4d-4856-b21a-debcfa08b16c','SENT','<330c0ea5-e178-e25b-9e09-c327ed047468@gmail.com>',NULL,0,3,'{\"tenantId\": \"49009545-0e4d-4856-b21a-debcfa08b16c\", \"activationUrl\": \"http://localhost:3001/activate-account?token=act_0a9c4d09ff39b312a784c3cfdb517ddd9e7996428ff50184ce9c8543323fadaa\"}','2026-10-23 10:01:21','2026-10-23 10:01:21'),('69419cb1-594a-451d-966f-9fae7919517e','SMS','9510997059','DRIVER_WELCOME_SMS','DRIVER','2d98e1f4-50f9-4d5d-bdba-4135c5718e4b','FAILED',NULL,'Incorrect sender id and TemplateName provided',0,3,'{\"driverId\": \"2d98e1f4-50f9-4d5d-bdba-4135c5718e4b\", \"driverName\": \"Vikram Singh\"}','2026-10-26 05:35:54','2026-10-26 05:35:54'),('697754a4-d398-44b0-804d-43418926cca7','SMS','9080280818','REGISTRATION_RECEIVED_SMS','REGISTRATION_REQUEST','d8c7da45-b39c-45cb-9ab5-ca7288936bbc','SENT','a4ee294dbbb9b330-BOM',NULL,0,3,NULL,'2026-10-23 04:57:28','2026-10-23 04:57:28'),('6992a128-36d7-43a8-98cf-d3dbb1a4988c','EMAIL','subipcs@gmail.com','ORDER_BOOKING_EMAIL_TO_CLIENT','EMAIL_CONF','','SENT','<5f68c9f3-197d-7139-4cbc-12db9394ac13@gmail.com>',NULL,0,3,'{\"subject\": \"Order booking request created. Order #: 202610230006 - GraceCabs\", \"accepted\": [\"subipcs@gmail.com\", \"gracecabs1975@gmail.com\"]}','2026-10-23 09:44:29','2026-10-23 09:44:29'),('6be5da83-d2bf-4bdf-91fb-d512874c5970','EMAIL','apex.admin.1792817821536@example.com','TENANT_ADMIN_ACTIVATION_LINK','TENANT','919ef8ea-215e-4977-955c-713270581800','SENT','<4b0fcc72-c9c2-6f4c-5cfd-65bfcefe5008@gracecabs.com>',NULL,0,3,'{\"loginUrl\": \"http://localhost:3000/adminlogin\", \"tenantId\": \"919ef8ea-215e-4977-955c-713270581800\", \"attachments\": [{\"path\": \"D:\\\\demobooking\\\\demo-bookings\\\\backend\\\\uploads\\\\plans\\\\Plan_Summary_APX536_919ef8ea.pdf\", \"filename\": \"Plan_Summary_APX536_919ef8ea.pdf\"}], \"activationUrl\": \"http://localhost:3000/activate-account?token=act_40f2e99625caf2ac2a77898e2af2e64c79f2c5905df0be683bf02f44c63a7c1d\", \"planSummaryPdfUrl\": \"http://localhost:5000/api/tenants/plan-summary/download/Plan_Summary_APX536_919ef8ea.pdf?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRJZCI6IjkxOWVmOGVhLTIxNWUtNDk3Ny05NTVjLTcxMzI3MDU4MTgwMCIsImZpbGVOYW1lIjoiUGxhbl9TdW1tYXJ5X0FQWDUzNl85MTllZjhlYS5wZGYiLCJ0eXBlIjoiUExBTl9TVU1NQVJZIiwiaWF0IjoxNzkyODE3ODIzLCJleHAiOjE3OTU0MDk4MjN9.dUzJNSpwk13Yv8kkQ6dv3Ux22G88cxY6SXifjr5Uw28\"}','2026-10-24 04:57:13','2026-10-24 04:57:13'),('6c3b2fcd-9e32-4af7-b37b-036996020bf3','SMS','9533155616','DRIVER_WELCOME_SMS','DRIVER','7351cea8-d82b-4cc8-b114-f2285613751f','FAILED',NULL,'Incorrect sender id and TemplateName provided',0,3,'{\"driverId\": \"7351cea8-d82b-4cc8-b114-f2285613751f\", \"driverName\": \"Suresh Kumar Reactivated\"}','2026-10-24 07:23:48','2026-10-24 07:23:48'),('6c536556-9cac-44b2-b6fd-88e20ef33c41','EMAIL','alpha_worker_1792817869462@alphatech.com','FORGET_PASSWORD_OTP','EMAIL_CONF','','SENT','<2036ab3d-5e9d-581e-06e3-49179d059ca9@gracecabs.com>',NULL,0,3,'{\"subject\": \"OTP sent to reset for your password - GraceCabs\", \"accepted\": [\"alpha_worker_1792817869462@alphatech.com\", \"gracecabs1975@gmail.com\"]}','2026-10-24 04:57:58','2026-10-24 04:57:58'),('6e3c8ab5-0d18-4f0c-867a-f770a1a03031','EMAIL','ramesh.rg350253@swiftlogistics.com','TENANT_ADMIN_ACTIVATION_LINK','TENANT','49302af4-707c-44b6-91bf-6f5f737d97f5','SENT','<c0fd25ba-e05c-2622-9050-764768e938d9@gracecabs.com>',NULL,0,3,'{\"tenantId\": \"49302af4-707c-44b6-91bf-6f5f737d97f5\", \"activationUrl\": \"http://localhost:3000/activate-account?token=act_0ad967db7b64314d01ea083aec3edf11cd5bb5f1641d8cca80df744cc348fba8\"}','2026-10-23 11:52:45','2026-10-23 11:52:45'),('6f7bb996-f91f-44a0-be16-7a5200c9c67b','EMAIL','employee_1792811209291@alphatech.com','USER_REGISTRATION_EMAIL_TO_USER','EMAIL_CONF','','SENT','<ac45afe2-25ac-9beb-8169-bdb492950902@gracecabs.com>',NULL,0,3,'{\"subject\": \"User Account Login Details - GraceCabs\", \"accepted\": [\"employee_1792811209291@alphatech.com\", \"gracecabs1975@gmail.com\"]}','2026-10-24 03:07:00','2026-10-24 03:07:00'),('7062c631-aa5e-497c-a662-634b49a1bc55','EMAIL','subisha2002.m@gmail.com','REGISTRATION_RECEIVED','REGISTRATION_REQUEST','6f189888-fe5c-4ccc-a066-04c1a6437f60','FAILED',NULL,'Invalid login: 535 Authentication failed',0,3,NULL,'2026-10-22 08:18:59','2026-10-22 08:18:59'),('71261367-11fc-4735-8fa7-4a74593ab68f','EMAIL','employee_1792810684439@alphatech.com','USER_REGISTRATION_EMAIL_TO_USER','EMAIL_CONF','','SENT','<a3ecca67-7ec0-78cf-e657-883a5ff6ce72@gracecabs.com>',NULL,0,3,'{\"subject\": \"User Account Login Details - GraceCabs\", \"accepted\": [\"employee_1792810684439@alphatech.com\", \"gracecabs1975@gmail.com\"]}','2026-10-24 02:58:18','2026-10-24 02:58:18'),('71ce61b6-4fbe-4a99-b763-b1f65a5f0a59','EMAIL','subisha2002.m@gmail.com','FORGET_PASSWORD_OTP','EMAIL_CONF','','SENT','<cd85ecbe-7368-2f0e-b736-f62586955cb9@gmail.com>',NULL,0,3,'{\"subject\": \"OTP sent to reset for your password - GraceCabs\", \"accepted\": [\"subisha2002.m@gmail.com\", \"gracecabs1975@gmail.com\"]}','2026-10-23 10:05:22','2026-10-23 10:05:22'),('72d4dc96-e68d-4f2f-92be-1ce4956d1ccd','EMAIL','applicant_1792823496564@skylinecabs.in','REGISTRATION_RECEIVED','REGISTRATION_REQUEST','c2e16c8b-be45-4fce-a43d-8c7977ae5672','SENT','<5f64e72a-a7f2-f795-57be-c7e96eb542b6@gracecabs.com>',NULL,0,3,NULL,'2026-10-24 06:31:44','2026-10-24 06:31:44'),('72f9610c-a472-4b30-90af-af84d163733e','SMS','9840123456','REGISTRATION_RECEIVED_SMS','REGISTRATION_REQUEST','2354fc96-d4c0-4fff-a396-b7e56eb78e3b','SENT','a4f0837e2e1cb330-BOM',NULL,0,3,NULL,'2026-10-23 11:48:33','2026-10-23 11:48:33'),('73e674e8-6294-4564-963c-a4b39f007edc','SMS','9876543210','BOOKING_CREATED','USER','aaaa4444-4444-4444-4444-444444444444','SENT','a4f02c10adb5c87d-BOM',NULL,0,3,NULL,'2026-10-23 10:48:52','2026-10-23 10:48:52'),('73eb3039-ffe2-4cf3-9803-8f969f79f8a1','SMS','9573644664','DRIVER_WELCOME_SMS','DRIVER','dc98b354-6d0f-49d2-96bd-c9e0e9c2bbbf','FAILED',NULL,'Incorrect sender id and TemplateName provided',0,3,'{\"driverId\": \"dc98b354-6d0f-49d2-96bd-c9e0e9c2bbbf\", \"driverName\": \"Suresh Kumar\"}','2026-10-24 06:29:36','2026-10-24 06:29:36'),('76742354-fae7-4d1f-99fc-e2b943802d6a','EMAIL','applicant_1792811459975@skylinecabs.in','TENANT_ADMIN_ACTIVATION_LINK','TENANT','32f12cf7-933a-4d2b-a979-0e555833871e','SENT','<5aa1d7d0-2f8d-9420-090b-aac4e637b2b8@gracecabs.com>',NULL,0,3,'{\"tenantId\": \"32f12cf7-933a-4d2b-a979-0e555833871e\", \"activationUrl\": \"http://localhost:3000/activate-account?token=act_ff98a3c2d8ef42823335753e62d723478e764fd6acfce7e97eadbc420332c316\"}','2026-10-24 03:11:19','2026-10-24 03:11:19'),('768c4fb1-1127-4fd8-9b33-cc8810d95c42','SMS','9817858511','DRIVER_WELCOME_SMS','DRIVER','91a94b16-6520-4321-891a-6eab1cfec750','FAILED',NULL,'Incorrect sender id and TemplateName provided',0,3,'{\"driverId\": \"91a94b16-6520-4321-891a-6eab1cfec750\", \"driverName\": \"Senthil Murugan\"}','2026-10-24 04:57:48','2026-10-24 04:57:48'),('77f77fec-8c44-4bc6-9bbb-236e836cab9e','EMAIL','admin@gracecabs.com','SUPERADMIN_NEW_APPLICATION_ALERT','REGISTRATION_REQUEST','f186a351-3313-4e94-80a5-ee41159993d7','FAILED',NULL,'Invalid login: 535 Authentication failed',0,3,NULL,'2026-10-22 05:22:22','2026-10-22 05:22:22'),('79bdfa45-e5a5-456a-a8c1-318e8adcd285','SMS','9080280818','REGISTRATION_RECEIVED_SMS','REGISTRATION_REQUEST','a0a73963-c83a-4c5e-870b-8c62c13bd7b3','SENT','a4efdefe1fef4732-BOM',NULL,0,3,NULL,'2026-10-23 09:56:15','2026-10-23 09:56:15'),('79ea2f40-0cf0-4a0c-a5e8-00e2697b80a2','EMAIL','ramesh.rg072262@swiftlogistics.com','ACCOUNT_ACTIVATED','TENANT','02a7f906-14e7-4ada-8281-9687c2fe7c6b','SENT','<ca47b6c6-bcb1-2ecd-e7d1-020f5cd970a4@gracecabs.com>',NULL,0,3,'{\"loginUrl\": \"http://localhost:3000/login\", \"actionText\": \"Sign In to Fleet Portal\"}','2026-10-24 05:01:40','2026-10-24 05:01:40'),('7ac88006-bf96-4bcb-ad91-c112ee6c94bf','EMAIL','subisha2002@gmail.com','DIAGNOSTIC_VERIFICATION',NULL,NULL,'SENT','<57574a8f-7cfc-6b63-a014-a17898c02c99@gmail.com>',NULL,0,3,'{\"host\": \"smtp.gmail.com\", \"sender\": \"subisha2002.m@gmail.com\"}','2026-10-22 11:01:39','2026-10-22 11:01:39'),('7ce07ef5-d138-400b-a7ed-0f28d939ea71','EMAIL','alpha_worker_1792811240783@alphatech.com','FORGET_PASSWORD_OTP','EMAIL_CONF','','SENT','<259fa5ba-99ee-7117-aad0-0229a5e32ed6@gracecabs.com>',NULL,0,3,'{\"subject\": \"OTP sent to reset for your password - GraceCabs\", \"accepted\": [\"alpha_worker_1792811240783@alphatech.com\", \"gracecabs1975@gmail.com\"]}','2026-10-24 03:07:32','2026-10-24 03:07:32'),('7d08d4d4-a029-4331-b7c3-4f9b25f10a33','SMS','9080280818','SUPERADMIN_NEW_APPLICATION_SMS','REGISTRATION_REQUEST','c2e16c8b-be45-4fce-a43d-8c7977ae5672','SENT','a4f6f0996d65c87d-BOM',NULL,0,3,NULL,'2026-10-24 06:31:36','2026-10-24 06:31:36'),('7f5f3a25-268f-4ce8-9e5c-43aba19cac04','SMS','9080280818','SUPERADMIN_NEW_APPLICATION_SMS','REGISTRATION_REQUEST','b69a8cbb-1ec7-418c-ba02-5817603b0224','SENT','a4ee9ce79e4ac87d-BOM',NULL,0,3,NULL,'2026-10-23 06:16:23','2026-10-23 06:16:23'),('80292b17-2721-4620-b11f-9c43cc81f66b','EMAIL','alpha_worker_1792817978164@alphatech.com','FORGET_PASSWORD_OTP','EMAIL_CONF','','SENT','<3ae97e0a-4efa-113d-982d-0a3f63b1544e@gracecabs.com>',NULL,0,3,'{\"subject\": \"OTP sent to reset for your password - GraceCabs\", \"accepted\": [\"alpha_worker_1792817978164@alphatech.com\", \"gracecabs1975@gmail.com\"]}','2026-10-24 04:59:47','2026-10-24 04:59:47'),('82d1f0c9-9f16-463b-ac9c-8b9b5a01c3f1','EMAIL','applicant_1792736543286@skylinecabs.in','TENANT_ADMIN_ACTIVATION_LINK','TENANT','14d12472-5b43-4742-88f2-c68d9c4e7b9a','SENT','<4f037733-f4e2-b3ea-086c-cec571576592@gmail.com>',NULL,0,3,'{\"tenantId\": \"14d12472-5b43-4742-88f2-c68d9c4e7b9a\", \"activationUrl\": \"http://localhost:3001/activate-account?token=act_8a214b28d2d969f9a685ec3ed8f61214752c8a876b7ea7d109269541290f391b\"}','2026-10-23 06:22:31','2026-10-23 06:22:31'),('846e53eb-c4f6-44f0-b1bb-64289716f427','SMS','+919876543210','REGISTRATION_RECEIVED_SMS','REGISTRATION_REQUEST','c1775d3e-9fdb-454d-b6cc-833bb6ff7756','SENT','a4eeb45c99f68377-BOM',NULL,0,3,NULL,'2026-10-23 06:32:24','2026-10-23 06:32:24'),('84c89357-b3ae-415e-8ccb-b9b54993f647','EMAIL','subisha2002.m@gmail.com','SUPERADMIN_NEW_APPLICATION_ALERT','REGISTRATION_REQUEST','c1775d3e-9fdb-454d-b6cc-833bb6ff7756','SENT','<e44c67f1-ef87-f79c-3941-15ea51210e85@gmail.com>',NULL,0,3,'{\"reviewUrl\": \"http://localhost:3001/admin/registrations\", \"actionText\": \"Review Inbound Applications\"}','2026-10-23 06:32:27','2026-10-23 06:32:27'),('8522dcd4-af98-4b16-abdb-557c44768cff','EMAIL','subisha2002.m@gmail.com','SUPERADMIN_NEW_APPLICATION_ALERT','REGISTRATION_REQUEST','6f189888-fe5c-4ccc-a066-04c1a6437f60','FAILED',NULL,'Invalid login: 535 Authentication failed',0,3,'{\"reviewUrl\": \"http://localhost:3001/admin/registrations\", \"actionText\": \"Review Inbound Applications\"}','2026-10-22 08:19:01','2026-10-22 08:19:01'),('87e344ac-052b-4bbe-ac2d-11cdd00d2347','EMAIL','admin@gracecabs.com','SUPERADMIN_NEW_APPLICATION_ALERT','REGISTRATION_REQUEST','62d6146a-c356-4a19-b594-b2fcfe53c9b4','FAILED',NULL,'Invalid login: 535 Authentication failed',0,3,NULL,'2026-10-22 05:21:17','2026-10-22 05:21:17'),('8805760d-5c53-4e1a-b257-4113266218c1','EMAIL','subisha2002.m@gmail.com','SUPERADMIN_NEW_APPLICATION_ALERT','REGISTRATION_REQUEST','de0aa92f-c287-48ff-b851-67c81a8238aa','SENT','<1dd80900-e8ed-6e76-aff1-17345c89878f@gracecabs.com>',NULL,0,3,'{\"reviewUrl\": \"http://localhost:3000/admin/registrations\", \"actionText\": \"Review Inbound Applications\"}','2026-10-23 11:52:37','2026-10-23 11:52:37'),('89f81ad6-feb7-4ac7-ae4c-2e7df85f1cd7','SMS','9840123456','REGISTRATION_RECEIVED_SMS','REGISTRATION_REQUEST','e0ebf804-180b-42d9-90a0-859cfb72759f','SENT','a4f66a6739b84732-BOM',NULL,0,3,NULL,'2026-10-24 05:00:00','2026-10-24 05:00:00'),('8a12e388-67fa-4434-8487-15d719e93455','EMAIL','ramesh.rg724871@swiftlogistics.com','TENANT_ADMIN_ACTIVATION_LINK','TENANT','52dba215-88f6-4c66-b050-302d389909be','SENT','<a3cd74f1-0b61-17fd-a644-61113734d0ab@gracecabs.com>',NULL,0,3,'{\"tenantId\": \"52dba215-88f6-4c66-b050-302d389909be\", \"activationUrl\": \"http://localhost:3000/activate-account?token=act_3f31be279152d273ccc3e983464ce20df15cfa6b2911ccd2fdf5fdb75a4454cc\"}','2026-10-23 11:42:21','2026-10-23 11:42:21'),('8c2d51a8-1798-4a97-8f82-3601b2b0359a','EMAIL','apex.admin.1792817765449@example.com','TENANT_ADMIN_ACTIVATION_LINK','TENANT','895a164d-3b99-48d3-8fc0-ff3c0b58e23b','SENT','<e5db2168-d8ec-613d-8272-348669e852e4@gracecabs.com>',NULL,0,3,'{\"loginUrl\": \"http://localhost:3000/adminlogin\", \"tenantId\": \"895a164d-3b99-48d3-8fc0-ff3c0b58e23b\", \"attachments\": [{\"path\": \"D:\\\\demobooking\\\\demo-bookings\\\\backend\\\\uploads\\\\plans\\\\Plan_Summary_APX448_895a164d.pdf\", \"filename\": \"Plan_Summary_APX448_895a164d.pdf\"}], \"activationUrl\": \"http://localhost:3000/activate-account?token=act_6720cbb97b05c247f9644e7be85c4d47c6369c583147e87ce92c87c698440e36\", \"planSummaryPdfUrl\": \"http://localhost:5000/api/tenants/plan-summary/download/Plan_Summary_APX448_895a164d.pdf?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRJZCI6Ijg5NWExNjRkLTNiOTktNDhkMy04ZmMwLWZmM2MwYjU4ZTIzYiIsImZpbGVOYW1lIjoiUGxhbl9TdW1tYXJ5X0FQWDQ0OF84OTVhMTY0ZC5wZGYiLCJ0eXBlIjoiUExBTl9TVU1NQVJZIiwiaWF0IjoxNzkyODE3NzY3LCJleHAiOjE3OTU0MDk3Njd9.bbLbBT-r4Vvsd3iNG1LN7ZoR8FLycJ9VFhoPHs9MltA\"}','2026-10-24 04:56:16','2026-10-24 04:56:16'),('8cbd4449-63c0-41d9-ba42-0250c96d1d3f','SMS','9840123456','REGISTRATION_RECEIVED_SMS','REGISTRATION_REQUEST','de0aa92f-c287-48ff-b851-67c81a8238aa','SENT','a4f08948499c8377-BOM',NULL,0,3,NULL,'2026-10-23 11:52:30','2026-10-23 11:52:30'),('8e289289-20c8-4c4b-875b-c04fac1e89d1','EMAIL','driver_1792817858511@alphafleet.com','DRIVER_REGISTRATION_EMAIL_TO_DRIVER','EMAIL_CONF','','SENT','<69df6642-801e-3066-ef68-53301cb1a4c1@gracecabs.com>',NULL,0,3,'{\"subject\": \"Driver Account Created - GraceCabs\", \"accepted\": [\"driver_1792817858511@alphafleet.com\"]}','2026-10-24 04:57:47','2026-10-24 04:57:47'),('8fa33bec-5b5e-4f8b-a8e5-22aa51b2597d','EMAIL','vikram-1792823376778@beta.com','DRIVER_REGISTRATION_EMAIL_TO_DRIVER','EMAIL_CONF','86565456-0988-449b-bd25-cac4b8bfcdbc','SENT','<d66082fa-3b92-3b50-1cf0-9153c996c85b@gracecabs.com>',NULL,0,3,'{\"subject\": \"Driver Account Created - GraceCabs\", \"accepted\": [\"vikram-1792823376778@beta.com\"], \"tenantId\": \"b2b2b2b2-2222-4222-b222-222222222222\"}','2026-10-24 06:29:45','2026-10-24 06:29:45'),('90316400-7ca3-4bcd-a6e8-8b34584aa45d','SMS','9573644664','DRIVER_WELCOME_SMS','DRIVER','c2f53cb7-ed46-4463-83f8-6a22106f2ba2','FAILED',NULL,'Incorrect sender id and TemplateName provided',0,3,'{\"driverId\": \"c2f53cb7-ed46-4463-83f8-6a22106f2ba2\", \"driverName\": \"Vikram Singh\"}','2026-10-24 06:29:46','2026-10-24 06:29:46'),('906a6ba7-d7e4-4477-bcfe-ad6b2d882da3','EMAIL','subisha2002.m@gmail.com','FORGET_PASSWORD_OTP','EMAIL_CONF','','SENT','<82dbdd58-e42a-5430-9b82-6c4efa1a7a55@gracecabs.com>',NULL,0,3,'{\"subject\": \"OTP sent to reset for your password - GraceCabs\", \"accepted\": [\"subisha2002.m@gmail.com\", \"gracecabs1975@gmail.com\"]}','2026-10-24 02:31:27','2026-10-24 02:31:27'),('91573c24-0820-4caf-b509-11e1681cc029','SMS','9080280818','SUPERADMIN_NEW_APPLICATION_SMS','REGISTRATION_REQUEST','a0a73963-c83a-4c5e-870b-8c62c13bd7b3','SENT','a4efdefc1f9cb330-BOM',NULL,0,3,NULL,'2026-10-23 09:56:15','2026-10-23 09:56:15'),('94480d92-4108-4776-98fc-2bab1aa0d8c0','EMAIL','admin@gracecabs.com','SUPERADMIN_NEW_APPLICATION_ALERT','REGISTRATION_REQUEST','ad4757f7-8e74-4f71-b29f-361a8f5e0382','FAILED',NULL,'Invalid login: 535 Authentication failed',0,3,NULL,'2026-10-22 05:55:52','2026-10-22 05:55:52'),('9583293d-179d-4a7a-9a98-1f345026f7e6','EMAIL','subipcs@gmail.com','REGISTRATION_RECEIVED','REGISTRATION_REQUEST','781819ee-98f5-456a-b9b8-d0c144024492','SENT','<bbd0d885-3d25-abde-0ed8-94829eedb685@gracecabs.com>',NULL,0,3,NULL,'2026-10-22 09:53:39','2026-10-22 09:53:39'),('9594f24c-a868-4b80-b924-8c0790c018c2','EMAIL','subisruya525@gmail.com','USER_REGISTRATION_EMAIL_TO_USER','EMAIL_CONF','','SENT','<3f2ba2d7-13cb-8048-b4f5-61d072fd7c6b@gmail.com>',NULL,0,3,'{\"subject\": \"User Account Login Details - GraceCabs\", \"accepted\": [\"subisruya525@gmail.com\", \"gracecabs1975@gmail.com\"]}','2026-10-23 07:08:25','2026-10-23 07:08:25'),('96225038-19bb-49cf-abd3-e3152e8bff1e','SMS','9533155616','DRIVER_WELCOME_SMS','DRIVER','7351cea8-d82b-4cc8-b114-f2285613751f','FAILED',NULL,'Incorrect sender id and TemplateName provided',0,3,'{\"driverId\": \"7351cea8-d82b-4cc8-b114-f2285613751f\", \"driverName\": \"Suresh Kumar\"}','2026-10-24 07:23:39','2026-10-24 07:23:39'),('96cf8b0f-cb67-4b69-b0bf-6144c3de3bbc','SMS','+919876543210','REGISTRATION_RECEIVED_SMS','REGISTRATION_REQUEST','e39ca843-8f7e-4d3a-8a1f-d58d3b8a2f5b','SENT','a4e8464c1c8f5b2f-BOM',NULL,0,3,NULL,'2026-10-22 11:48:41','2026-10-22 11:48:41'),('9780d85b-0381-4462-a8d3-9081cc321b5c','SMS','9840123456','REGISTRATION_RECEIVED_SMS','REGISTRATION_REQUEST','5d6fd131-6304-4063-8f46-ecc0c18945f2','SENT','a4eeb365aea840a5-BOM',NULL,0,3,NULL,'2026-10-23 06:31:44','2026-10-23 06:31:44'),('983e92f6-248a-46f0-957a-97c6698ee5c3','EMAIL','admin@gracecabs.com','SUPERADMIN_NEW_APPLICATION_ALERT','REGISTRATION_REQUEST','6db72212-f1ad-432e-9c77-f8a729f50bc8','FAILED',NULL,'Invalid login: 535 Authentication failed',0,3,NULL,'2026-10-22 06:10:08','2026-10-22 06:10:08'),('98c1f64c-1ab2-464b-8444-5b86692a78f1','EMAIL','ramesh.rg440482@swiftlogistics.com','TENANT_ADMIN_ACTIVATION_LINK','TENANT','9ac80877-705b-4d72-b42b-5b5ffd741ab1','SENT','<85cd15fe-80a8-884a-1306-f6eb10cd24ae@gracecabs.com>',NULL,0,3,'{\"tenantId\": \"9ac80877-705b-4d72-b42b-5b5ffd741ab1\", \"activationUrl\": \"http://localhost:3000/activate-account?token=act_8f82ed278f5d25ba71dbcbdb3583309d6c95751ca9a162f960c7105d02449249\"}','2026-10-23 11:54:16','2026-10-23 11:54:16'),('9a5e0ede-29c7-4fff-944e-a643a6a70856','SMS','9840123456','REGISTRATION_RECEIVED_SMS','REGISTRATION_REQUEST','eef347ad-2e5e-42d7-843d-854d44cb4fba','SENT','a4f08c61f8de40a5-BOM',NULL,0,3,NULL,'2026-10-23 11:54:37','2026-10-23 11:54:37'),('9a83f0f4-558c-4e94-ba7d-a8fa44bab0c4','EMAIL','gracecabs1975@gmail.com,traveldesk@gracecabs.com','USER_INVOICE_EMAIL','EMAIL_CONF','','SENT','<7fb4b8ab-bb38-15f1-06a9-4617d55d7527@gracecabs.com>',NULL,0,3,'{\"subject\": \"Invoice Details for Order #: 202610230008 - GraceCabss\", \"accepted\": [\"gracecabs1975@gmail.com\", \"traveldesk@gracecabs.com\"]}','2026-10-23 10:49:00','2026-10-23 10:49:00'),('9c905e54-4464-40e0-89fa-6257e812b745','EMAIL','ramesh.rg845390@swiftlogistics.com','TENANT_ADMIN_ACTIVATION_LINK','TENANT','42b707ca-9524-4eb9-beeb-ae9255ad6d37','SENT','<cfb864d5-1034-d367-6100-7ae12adbe0d4@gracecabs.com>',NULL,0,3,'{\"tenantId\": \"42b707ca-9524-4eb9-beeb-ae9255ad6d37\", \"activationUrl\": \"http://localhost:3000/activate-account?token=act_5e3d3741373196feb16d31d94b9421f2a0097874f24890acc6e54c6cc59a386f\"}','2026-10-23 11:44:22','2026-10-23 11:44:22'),('9cd91385-9145-4a19-bbf2-b435b7c96e84','EMAIL','applicant_1792737104267@skylinecabs.in','TENANT_ADMIN_ACTIVATION_LINK','TENANT','79e44b0e-751a-4aee-8c1a-6a516196cc39','SENT','<08a8d285-0cff-5595-c7a0-692475fdea36@gmail.com>',NULL,0,3,'{\"tenantId\": \"79e44b0e-751a-4aee-8c1a-6a516196cc39\", \"activationUrl\": \"http://localhost:3001/activate-account?token=act_151fee4632dc0bc114f335821c8abcf8c15dc5c91a6b83b4bd555a12bd4dae0c\"}','2026-10-23 06:31:51','2026-10-23 06:31:51'),('9d8a80ea-aff7-4457-aa37-a336b69134b0','EMAIL','gracecabs1975@gmail.com, traveldesk@gracecabs.com','MONTHLY_BOOKING','EMAIL_CONF','','SENT','<5e17fd8a-f4e8-9394-7594-c7d3b707993b@gracecabs.com>',NULL,0,3,'{\"subject\": \"Monthly Booking Details: 8e1aa3bf-604c-4363-9d1f-a07da77dd0a5 with Gracecabs.com\", \"accepted\": [\"gracecabs1975@gmail.com\", \"traveldesk@gracecabs.com\"]}','2026-10-23 10:49:13','2026-10-23 10:49:13'),('9e839572-07b0-4fac-99d7-29cf997776cd','SMS','9573644664','DRIVER_WELCOME_SMS','DRIVER','dc98b354-6d0f-49d2-96bd-c9e0e9c2bbbf','FAILED',NULL,'Incorrect sender id and TemplateName provided',0,3,'{\"driverId\": \"dc98b354-6d0f-49d2-96bd-c9e0e9c2bbbf\", \"driverName\": \"Suresh Kumar Reactivated\"}','2026-10-24 06:29:46','2026-10-24 06:29:46'),('9f16fbef-28f2-473d-8f5c-f1ef9c410509','SMS','9080280818','SUPERADMIN_NEW_APPLICATION_SMS','REGISTRATION_REQUEST','81ea148e-d3c3-47b7-8e68-ebbf436507cf','SENT','a4eea5b23b3c40a5-BOM',NULL,0,3,NULL,'2026-10-23 06:22:23','2026-10-23 06:22:23'),('9fb492bc-3974-4ab3-b58b-9c173204d406','EMAIL','applicant_1792736543286@skylinecabs.in','ACCOUNT_ACTIVATED','TENANT','14d12472-5b43-4742-88f2-c68d9c4e7b9a','SENT','<79fa18ca-fa67-7547-4640-721156b98586@gmail.com>',NULL,0,3,'{\"loginUrl\": \"http://localhost:3001/login\", \"actionText\": \"Sign In to Fleet Portal\"}','2026-10-23 06:22:35','2026-10-23 06:22:35'),('a225dafe-103d-47ea-bc51-5ba1293c2c4b','EMAIL','applicant_1792736543286@skylinecabs.in','REGISTRATION_RECEIVED','REGISTRATION_REQUEST','81ea148e-d3c3-47b7-8e68-ebbf436507cf','SENT','<fc4e9935-2c4d-bf66-d78c-4fd4448d5b30@gmail.com>',NULL,0,3,NULL,'2026-10-23 06:22:27','2026-10-23 06:22:27'),('a268b12a-cfb2-47ad-95ee-a3a73638c4bd','EMAIL','subisha2002.m@gmail.com','SUPERADMIN_NEW_APPLICATION_ALERT','REGISTRATION_REQUEST','bf3a9ff8-ff03-4a64-854d-683bb6892af9','SENT','<338073b5-ff60-356f-2c0f-7831d7211cca@gracecabs.com>',NULL,0,3,'{\"reviewUrl\": \"http://localhost:3000/admin/registrations\", \"actionText\": \"Review Inbound Applications\"}','2026-10-24 05:01:19','2026-10-24 05:01:19'),('a2880649-6ad5-46e3-bed9-f95d22c76ef4','EMAIL','applicant_1792737447321@skylinecabs.in','REGISTRATION_RECEIVED','REGISTRATION_REQUEST','db170a9b-3d35-48ed-a8db-212ba69ac4c7','SENT','<c01c4465-ea17-a326-45f7-e2454324ec9f@gmail.com>',NULL,0,3,NULL,'2026-10-23 06:37:31','2026-10-23 06:37:31'),('a455ae7a-823e-4c47-99ed-a5557f173181','EMAIL','applicant_1792737104267@skylinecabs.in','ACCOUNT_ACTIVATED','TENANT','79e44b0e-751a-4aee-8c1a-6a516196cc39','SENT','<47527eaf-4103-1b48-9187-1ff224d085cf@gmail.com>',NULL,0,3,'{\"loginUrl\": \"http://localhost:3001/login\", \"actionText\": \"Sign In to Fleet Portal\"}','2026-10-23 06:31:55','2026-10-23 06:31:55'),('a4593cf3-f4a0-4619-ad90-c3be3205b549','SMS','9810698727','DRIVER_WELCOME_SMS','DRIVER','59257249-83d8-44f7-8c43-9acde0e80da8','FAILED',NULL,'Incorrect sender id and TemplateName provided',0,3,'{\"driverId\": \"59257249-83d8-44f7-8c43-9acde0e80da8\", \"driverName\": \"Senthil Murugan\"}','2026-10-24 02:58:29','2026-10-24 02:58:29'),('a4d37388-37f7-4505-9bae-8eadf7137f7d','SMS','9840123456','REGISTRATION_RECEIVED_SMS','REGISTRATION_REQUEST','db170a9b-3d35-48ed-a8db-212ba69ac4c7','SENT','a4eebbc528594732-BOM',NULL,0,3,NULL,'2026-10-23 06:37:27','2026-10-23 06:37:27'),('a4e7c29c-62f0-4504-aaf0-18b17f965769','EMAIL','subisha2002@gmail.com','DIAGNOSTIC_VERIFICATION',NULL,NULL,'SENT','<5556f019-1b4d-2e28-7a4c-32d57b74264b@gmail.com>',NULL,0,3,'{\"host\": \"smtp.gmail.com\", \"sender\": \"subisha2002.m@gmail.com\"}','2026-10-22 11:03:08','2026-10-22 11:03:08'),('a562abc5-0e59-416e-8189-040a2793dae3','EMAIL','subisha2002.m@gmail.com','SUPERADMIN_NEW_APPLICATION_ALERT','REGISTRATION_REQUEST','07e28592-524d-46e5-9a1f-316b85f79f27','FAILED',NULL,'Blocked: Delivery to obsolete Grace Cabs customer (subisha2002.m) is prohibited.',0,3,'{\"reviewUrl\": \"http://localhost:3000/admin/registrations\", \"actionText\": \"Review Inbound Applications\"}','2026-10-26 05:33:22','2026-10-26 05:33:22'),('a6f2521c-7596-40c1-9ce5-4489044dcf68','SMS','9080280818','SUPERADMIN_NEW_APPLICATION_SMS','REGISTRATION_REQUEST','e0ebf804-180b-42d9-90a0-859cfb72759f','SENT','a4f66a69aa0d40a5-BOM',NULL,0,3,NULL,'2026-10-24 05:00:00','2026-10-24 05:00:00'),('a777e224-d352-4141-b2e1-87bea8de3739','EMAIL','subisha2002.m@gmail.com','SUPERADMIN_NEW_APPLICATION_ALERT','REGISTRATION_REQUEST','3770f16c-5aa8-4ca3-ac27-718b01a02516','SENT','<8aa1b1ed-c279-6b35-a3d9-6d56abd02f6d@gracecabs.com>',NULL,0,3,'{\"reviewUrl\": \"http://localhost:3000/admin/registrations\", \"actionText\": \"Review Inbound Applications\"}','2026-10-24 03:07:57','2026-10-24 03:07:57'),('a7d9d301-0672-46f6-b9c3-79443e8a301c','EMAIL','vikram-1792823331515@beta.com','DRIVER_REGISTRATION_EMAIL_TO_DRIVER','EMAIL_CONF','86565456-0988-449b-bd25-cac4b8bfcdbc','SENT','<eda7f7a3-1165-ec91-877c-b37d0c85e355@gracecabs.com>',NULL,0,3,'{\"subject\": \"Driver Account Created - GraceCabs\", \"accepted\": [\"vikram-1792823331515@beta.com\"], \"tenantId\": \"b2b2b2b2-2222-4222-b222-222222222222\"}','2026-10-24 06:29:00','2026-10-24 06:29:00'),('a944b3c5-f12d-4aef-b56d-fa40f45a2ce8','EMAIL','ramesh.rg072262@swiftlogistics.com','TENANT_ADMIN_ACTIVATION_LINK','TENANT','02a7f906-14e7-4ada-8281-9687c2fe7c6b','SENT','<56c86522-fd72-26eb-811c-34183a42144f@gracecabs.com>',NULL,0,3,'{\"loginUrl\": \"http://localhost:3000/adminlogin\", \"tenantId\": \"02a7f906-14e7-4ada-8281-9687c2fe7c6b\", \"attachments\": [{\"path\": \"D:\\\\demobooking\\\\demo-bookings\\\\backend\\\\uploads\\\\plans\\\\Plan_Summary_RG072262_02a7f906.pdf\", \"filename\": \"Plan_Summary_RG072262_02a7f906.pdf\"}], \"activationUrl\": \"http://localhost:3000/activate-account?token=act_654ec957770884b79e21155c5ca6ece30d54d5979225ff116f242798a5fd5555\", \"planSummaryPdfUrl\": \"http://localhost:5000/api/tenants/plan-summary/download/Plan_Summary_RG072262_02a7f906.pdf?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRJZCI6IjAyYTdmOTA2LTE0ZTctNGFkYS04MjgxLTk2ODdjMmZlN2M2YiIsImZpbGVOYW1lIjoiUGxhbl9TdW1tYXJ5X1JHMDcyMjYyXzAyYTdmOTA2LnBkZiIsInR5cGUiOiJQTEFOX1NVTU1BUlkiLCJpYXQiOjE3OTI4MTgwODIsImV4cCI6MTc5NTQxMDA4Mn0.dm_-bd9Erfg-eYUagtvRPzVowfRPsdHBFtLCegCy2Fo\"}','2026-10-24 05:01:31','2026-10-24 05:01:31'),('a9c7e11f-06ec-4550-8c0d-0b4f1ac860d5','EMAIL','subisha2002.m@gmail.com','SUPERADMIN_NEW_APPLICATION_ALERT','REGISTRATION_REQUEST','5d6fd131-6304-4063-8f46-ecc0c18945f2','SENT','<0235532d-9859-428b-884d-37a287c65096@gmail.com>',NULL,0,3,'{\"reviewUrl\": \"http://localhost:3001/admin/registrations\", \"actionText\": \"Review Inbound Applications\"}','2026-10-23 06:31:48','2026-10-23 06:31:48'),('a9dd8da1-05f2-46cd-960f-c600d902d8ec','EMAIL','alpha_worker_1792810863185@alphatech.com','FORGET_PASSWORD_OTP','EMAIL_CONF','','SENT','<b9cbb06c-0597-2a26-e58c-e211e5716198@gracecabs.com>',NULL,0,3,'{\"subject\": \"OTP sent to reset for your password - GraceCabs\", \"accepted\": [\"alpha_worker_1792810863185@alphatech.com\", \"gracecabs1975@gmail.com\"]}','2026-10-24 03:01:16','2026-10-24 03:01:16'),('ab40fc69-b23e-44bf-a242-b5e6b5e581c9','EMAIL','suresh-1792992933870@alpha.com','DRIVER_REGISTRATION_EMAIL_TO_DRIVER','EMAIL_CONF','86565456-0988-449b-bd25-cac4b8bfcdbc','SENT','<54228e39-b6fa-e30c-2199-bb18aecd07fb@gracecabs.com>',NULL,0,3,'{\"subject\": \"Driver Account Created - GraceCabs\", \"accepted\": [\"suresh-1792992933870@alpha.com\"], \"tenantId\": \"a1a1a1a1-1111-4111-a111-111111111111\"}','2026-10-26 05:35:43','2026-10-26 05:35:43'),('ab4ff4ca-91f3-4ae8-b36f-b2f1c3d4b85c','SMS','9823411664','DRIVER_WELCOME_SMS','DRIVER','6c97349e-ee1e-4d0b-b130-c83ea2489f97','FAILED',NULL,'Incorrect sender id and TemplateName provided',0,3,'{\"driverId\": \"6c97349e-ee1e-4d0b-b130-c83ea2489f97\", \"driverName\": \"Senthil Murugan\"}','2026-10-24 06:30:20','2026-10-24 06:30:20'),('adc48286-b33e-4794-95b0-10a2f0ad371a','EMAIL','ramesh.rg350253@swiftlogistics.com','ACCOUNT_ACTIVATED','TENANT','49302af4-707c-44b6-91bf-6f5f737d97f5','SENT','<5aa34832-393a-1797-2923-b3cb09ea482a@gracecabs.com>',NULL,0,3,'{\"loginUrl\": \"http://localhost:3000/login\", \"actionText\": \"Sign In to Fleet Portal\"}','2026-10-23 11:52:54','2026-10-23 11:52:54'),('ae5209bb-3f7d-4774-88f0-60d9efacc156','EMAIL','subisha2002.m@gmail.com','SUPERADMIN_NEW_APPLICATION_ALERT','REGISTRATION_REQUEST','22eda7cc-21e1-4b56-ac54-13928681db7b','SENT','<178422c5-de96-0180-a91b-463281ec21e6@gmail.com>',NULL,0,3,'{\"reviewUrl\": \"http://localhost:3001/admin/registrations\", \"actionText\": \"Review Inbound Applications\"}','2026-10-23 04:59:02','2026-10-23 04:59:02'),('af103e8b-6ce8-4381-83e8-c26d6ffc84f8','EMAIL','gracecabs1975@gmail.com','TEST_ISOLATION',NULL,NULL,'FAILED',NULL,'Blocked: Delivery to obsolete Grace Cabs customer (gracecabs1975) is prohibited.',0,3,NULL,'2026-10-24 07:15:15','2026-10-24 07:15:15'),('af1efbb8-3716-49e7-b965-d6f59f8e7882','EMAIL','applicant_1792752479080@skylinecabs.in','ACCOUNT_ACTIVATED','TENANT','fe5817a8-5a77-4530-9cc1-903bb3139e39','SENT','<da14f2ea-2b5d-189f-2cdf-b712130e31de@gracecabs.com>',NULL,0,3,'{\"loginUrl\": \"http://localhost:3001/login\", \"actionText\": \"Sign In to Fleet Portal\"}','2026-10-23 10:48:22','2026-10-23 10:48:22'),('af364885-920c-4635-b32b-4879b30bd2b0','SMS','9080280818','SUPERADMIN_NEW_APPLICATION_SMS','REGISTRATION_REQUEST','f4a0eb8c-cc94-4e3b-8aba-ced0bc6bd497','SENT','a4eff5a63ac440a5-BOM',NULL,0,3,NULL,'2026-10-23 10:11:43','2026-10-23 10:11:43'),('afbae056-4cf0-4a92-8808-5f3cb3b11392','EMAIL','subisha2002@gmail.com','SUPERADMIN_NEW_APPLICATION_ALERT','REGISTRATION_REQUEST','aaebdfa1-ade2-4ed9-8f48-efe7c14db73f','SENT','<7ccf6bed-8167-96d1-4a39-69dc38f55753@gracecabs.com>',NULL,0,3,'{\"reviewUrl\": \"http://localhost:3001/admin/registrations\", \"actionText\": \"Review Inbound Applications\"}','2026-10-22 10:43:09','2026-10-22 10:43:09'),('b11e4ccb-c5ae-49e8-bcd5-849b337f5fd5','SMS','9840123456','REGISTRATION_RECEIVED_SMS','REGISTRATION_REQUEST','e35726b9-2f57-4dc5-bb1c-1a397854fec4','SENT','a4f6ef82fe6db330-BOM',NULL,0,3,NULL,'2026-10-24 06:30:52','2026-10-24 06:30:52'),('b1fab93f-16aa-417a-b2d9-1b6d26e4efcd','EMAIL','apex.admin.1792817712684@example.com','TENANT_ADMIN_ACTIVATION_LINK','TENANT','b7a72f7a-3ea9-43c3-8ece-6454c03dc229','SENT','<a729cca9-e4ee-cf3d-d650-6f9da2b5c4ae@gracecabs.com>',NULL,0,3,'{\"loginUrl\": \"http://localhost:3000/adminlogin\", \"tenantId\": \"b7a72f7a-3ea9-43c3-8ece-6454c03dc229\", \"attachments\": [{\"path\": \"D:\\\\demobooking\\\\demo-bookings\\\\backend\\\\uploads\\\\plans\\\\Plan_Summary_APX684_b7a72f7a.pdf\", \"filename\": \"Plan_Summary_APX684_b7a72f7a.pdf\"}], \"activationUrl\": \"http://localhost:3000/activate-account?token=act_e47ff9ae9758fc7b2a260de535ac37956b3cc6b161df60ccad7aa0c960e8b3ce\", \"planSummaryPdfUrl\": \"http://localhost:5000/api/tenants/plan-summary/download/Plan_Summary_APX684_b7a72f7a.pdf?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRJZCI6ImI3YTcyZjdhLTNlYTktNDNjMy04ZWNlLTY0NTRjMDNkYzIyOSIsImZpbGVOYW1lIjoiUGxhbl9TdW1tYXJ5X0FQWDY4NF9iN2E3MmY3YS5wZGYiLCJ0eXBlIjoiUExBTl9TVU1NQVJZIiwiaWF0IjoxNzkyODE3NzE1LCJleHAiOjE3OTU0MDk3MTV9.ltVpgnrfVBwstYSkcRGlmsdD7EeoYOJkwdtZubTuEhY\"}','2026-10-24 04:55:23','2026-10-24 04:55:23'),('b37b8f9e-7090-46f6-b2e0-ad8b698e3836','EMAIL','gracecabs1975@gmail.com, traveldesk@gracecabs.com','MONTHLY_BOOKING','EMAIL_CONF','','SENT','<03aad555-9bdb-eef8-905c-10d4a98aecdb@gmail.com>',NULL,0,3,'{\"subject\": \"Monthly Booking Details: 6472bc75-25c3-40d9-a172-59fde09fa8f9 with Gracecabs.com\", \"accepted\": [\"gracecabs1975@gmail.com\", \"traveldesk@gracecabs.com\"]}','2026-10-23 06:33:38','2026-10-23 06:33:38'),('b485d70f-46a9-4e8e-89cb-ff42fade5565','EMAIL','driver_1792810617537@alphafleet.com','DRIVER_REGISTRATION_EMAIL_TO_DRIVER','EMAIL_CONF','','SENT','<01fda17f-fcca-dd92-b9f3-1b23efe1a6f0@gracecabs.com>',NULL,0,3,'{\"subject\": \"Driver Account Created - GraceCabs\", \"accepted\": [\"driver_1792810617537@alphafleet.com\"]}','2026-10-24 02:57:07','2026-10-24 02:57:07'),('b4872c98-00ae-4cb7-8ec6-8631248035e6','SMS','9080280818','SUPERADMIN_NEW_APPLICATION_SMS','REGISTRATION_REQUEST','db170a9b-3d35-48ed-a8db-212ba69ac4c7','SENT','a4eebbc55d8bb330-BOM',NULL,0,3,NULL,'2026-10-23 06:37:27','2026-10-23 06:37:27'),('b48aacec-fffe-45be-855b-6e1bb4afdcf9','EMAIL','subisha2002.m@gmail.com','SUPERADMIN_NEW_APPLICATION_ALERT','REGISTRATION_REQUEST','8686ae47-a760-437a-ab41-f8a62f7ec439','SENT','<ed0588f9-f866-c6df-1fe1-852aea22a013@gracecabs.com>',NULL,0,3,'{\"reviewUrl\": \"http://localhost:3000/admin/registrations\", \"actionText\": \"Review Inbound Applications\"}','2026-10-24 03:11:10','2026-10-24 03:11:10'),('b4e07327-2e26-4f33-a296-a5173d75a423','SMS','9080280818','DRIVER_WELCOME_SMS','DRIVER','783377ff-6e96-4095-af2e-95e89b0ff6bb','FAILED',NULL,'Blocked: Transmission to obsolete customer phone number (90802...) is prohibited.',0,3,'{\"driverId\": \"783377ff-6e96-4095-af2e-95e89b0ff6bb\", \"driverName\": \"driver\"}','2026-10-24 07:46:50','2026-10-24 07:46:50'),('b57fb418-605f-4822-96b1-502a74dd695e','EMAIL','ramesh.rg112913@swiftlogistics.com','REGISTRATION_RECEIVED','REGISTRATION_REQUEST','2354fc96-d4c0-4fff-a396-b7e56eb78e3b','SENT','<b49db5a1-7215-0a63-e87d-9ac41c2e555d@gracecabs.com>',NULL,0,3,NULL,'2026-10-23 11:48:41','2026-10-23 11:48:41'),('b9dbd9d6-093d-4c4e-8859-ccc6d2c5a5e3','SMS','9510997059','DRIVER_WELCOME_SMS','DRIVER','6db25e66-9a65-43e9-80ed-b9d2bd9577fa','FAILED',NULL,'Incorrect sender id and TemplateName provided',0,3,'{\"driverId\": \"6db25e66-9a65-43e9-80ed-b9d2bd9577fa\", \"driverName\": \"Suresh Kumar Reactivated\"}','2026-10-26 05:35:55','2026-10-26 05:35:55'),('b9edd098-9ff6-4110-9331-c68429c3cce2','EMAIL','subisha2002@gmail.com','GMAIL_SMTP_VERIFICATION',NULL,NULL,'SENT','<f715a1fd-78b5-bf25-c179-c00f37febce0@gmail.com>',NULL,0,3,'{\"host\": \"smtp.gmail.com\", \"sender\": \"subisha2002.m@gmail.com\", \"response\": \"250 2.0.0 OK  1792666685 a92af1059eb24-1903aefe90asm13072600c88.9 - gsmtp\"}','2026-10-22 10:58:03','2026-10-22 10:58:03'),('be89e6bb-eeeb-4cde-9dab-63f257d25f5e','SMS','9840123456','REGISTRATION_RECEIVED_SMS','REGISTRATION_REQUEST','3770f16c-5aa8-4ca3-ac27-718b01a02516','SENT','a4f5c5fb8e504732-BOM',NULL,0,3,NULL,'2026-10-24 03:07:46','2026-10-24 03:07:46'),('be906e55-57c4-466f-a42f-8af66854c264','SMS','9840123456','REGISTRATION_RECEIVED_SMS','REGISTRATION_REQUEST','bf3a9ff8-ff03-4a64-854d-683bb6892af9','SENT','a4f66c2ad8f75b2f-BOM',NULL,0,3,NULL,'2026-10-24 05:01:12','2026-10-24 05:01:12'),('bee27354-cf2f-4c9b-b22e-f184e3839755','EMAIL','admin@gracecabs.com','SUPERADMIN_NEW_APPLICATION_ALERT','REGISTRATION_REQUEST','18a6a781-f5fb-4296-8940-7af34646d3e3','FAILED',NULL,'Invalid login: 535 Authentication failed',0,3,NULL,'2026-10-22 05:23:55','2026-10-22 05:23:55'),('beeeb2a3-1a71-4fb8-8570-638362266998','EMAIL','subisha2002.m@gmail.com','SUPERADMIN_NEW_APPLICATION_ALERT','REGISTRATION_REQUEST','1284a65a-f8fd-40e5-9c88-4876608e7510','SENT','<4cde392c-a4fe-2582-996f-ff7993a13376@gracecabs.com>',NULL,0,3,'{\"reviewUrl\": \"http://localhost:3000/admin/registrations\", \"actionText\": \"Review Inbound Applications\"}','2026-10-23 11:42:13','2026-10-23 11:42:13'),('bf5536a2-e485-4ca1-9b4a-9cc9f5cc34aa','EMAIL','suresh-1792823321474@alpha.com','DRIVER_REGISTRATION_EMAIL_TO_DRIVER','EMAIL_CONF','86565456-0988-449b-bd25-cac4b8bfcdbc','SENT','<e6e75855-10ec-20fb-68fc-51d16849fb1c@gracecabs.com>',NULL,0,3,'{\"subject\": \"Driver Account Created - GraceCabs\", \"accepted\": [\"suresh-1792823321474@alpha.com\"], \"tenantId\": \"a1a1a1a1-1111-4111-a111-111111111111\"}','2026-10-24 06:28:51','2026-10-24 06:28:51'),('bfc2ab4d-6f5a-4e35-bbd2-e4084660fd73','SMS','9080280818','SUPERADMIN_NEW_APPLICATION_SMS','REGISTRATION_REQUEST','07e28592-524d-46e5-9a1f-316b85f79f27','FAILED',NULL,'Blocked: Delivery to obsolete Grace Cabs customer phone (90802) is prohibited.',0,3,NULL,'2026-10-26 05:33:22','2026-10-26 05:33:22'),('c039d137-de85-4107-8000-1ca644342c13','SMS','9080280818','SUPERADMIN_NEW_APPLICATION_SMS','REGISTRATION_REQUEST','bf3a9ff8-ff03-4a64-854d-683bb6892af9','SENT','a4f66c2adbb840a5-BOM',NULL,0,3,NULL,'2026-10-24 05:01:12','2026-10-24 05:01:12'),('c1c049a5-5392-45ca-822c-868a8cf80422','SMS','9080280818','SUPERADMIN_NEW_APPLICATION_SMS','REGISTRATION_REQUEST','d02cdf22-a7eb-4041-9b69-e8e088f019f2','SENT','a4e8486568bc40a5-BOM',NULL,0,3,NULL,'2026-10-22 11:50:07','2026-10-22 11:50:07'),('c345a086-2752-44e3-b196-8c8a26a10a14','SMS','+919876543210','REGISTRATION_RECEIVED_SMS','REGISTRATION_REQUEST','22eda7cc-21e1-4b56-ac54-13928681db7b','SENT','a4ee2b85c8b08377-BOM',NULL,0,3,NULL,'2026-10-23 04:58:59','2026-10-23 04:58:59'),('c54fbd43-0f91-477a-95ef-bff079066afa','SMS','9080280818','SUPERADMIN_NEW_APPLICATION_SMS','REGISTRATION_REQUEST','3e961ada-525c-4ad4-9dc4-d8b609707107','SENT','a4ee4ac53bd3b330-BOM',NULL,0,3,NULL,'2026-10-23 05:20:19','2026-10-23 05:20:19'),('c59c472f-5f53-484b-ac1d-e7d071487302','EMAIL','subisha2002.m@gmail.com','SUPERADMIN_NEW_APPLICATION_ALERT','REGISTRATION_REQUEST','e0ebf804-180b-42d9-90a0-859cfb72759f','SENT','<e8d7952f-bd2e-7766-379d-adbfd0297a11@gracecabs.com>',NULL,0,3,'{\"reviewUrl\": \"http://localhost:3000/admin/registrations\", \"actionText\": \"Review Inbound Applications\"}','2026-10-24 05:00:08','2026-10-24 05:00:08'),('c5ea9d83-3b26-47d4-86a2-f76e3c49d041','EMAIL','applicant_1792756477251@skylinecabs.in','ACCOUNT_ACTIVATED','TENANT','f6ce715e-b3b1-4aa7-bdf7-19d3200a0582','SENT','<6633ecb4-2628-e5a1-b45a-c6b50c52f8ed@gracecabs.com>',NULL,0,3,'{\"loginUrl\": \"http://localhost:3000/login\", \"actionText\": \"Sign In to Fleet Portal\"}','2026-10-23 11:55:02','2026-10-23 11:55:02'),('c66a0ac4-fb64-4c88-bce2-a03993214ab4','EMAIL','ramesh.rg724871@swiftlogistics.com','ACCOUNT_ACTIVATED','TENANT','52dba215-88f6-4c66-b050-302d389909be','SENT','<700c683f-b203-3a8c-c626-235611cf24c0@gracecabs.com>',NULL,0,3,'{\"loginUrl\": \"http://localhost:3000/login\", \"actionText\": \"Sign In to Fleet Portal\"}','2026-10-23 11:42:31','2026-10-23 11:42:31'),('c7ae9543-e600-4260-9a64-603f3dbdfe13','SMS','+919876543210','REGISTRATION_RECEIVED_SMS','REGISTRATION_REQUEST','07e28592-524d-46e5-9a1f-316b85f79f27','SENT','a507161108724732-BOM',NULL,0,3,NULL,'2026-10-26 05:33:23','2026-10-26 05:33:23'),('c8225968-7528-4fd5-b6b7-c511b99dde2d','SMS','9080280818','SUPERADMIN_NEW_APPLICATION_SMS','REGISTRATION_REQUEST','1ddba0ad-8316-490a-aee2-e260dea1a32e','SENT','a4f02ac51b4040a5-BOM',NULL,0,3,NULL,'2026-10-23 10:47:59','2026-10-23 10:47:59'),('c931d06d-ff68-4b48-93bc-ba553a4abe53','EMAIL','gracecabs1975@gmail.com,traveldesk@gracecabs.com','USER_INVOICE_EMAIL','EMAIL_CONF','','SENT','<69d7c493-5416-1f0b-cf5c-4b32f7675905@gmail.com>',NULL,0,3,'{\"subject\": \"Invoice Details for Order #: 202610230004 - GraceCabss\", \"accepted\": [\"gracecabs1975@gmail.com\", \"traveldesk@gracecabs.com\"]}','2026-10-23 06:33:27','2026-10-23 06:33:27'),('c9643b2a-cf14-46c5-9d06-6eec287b26dd','SMS','9080280818','SUPERADMIN_NEW_APPLICATION_SMS','REGISTRATION_REQUEST','3a85126f-206c-4b89-a53d-2b2bda35fdea','SENT','a4f07cf4cfa388ec-BOM',NULL,0,3,NULL,'2026-10-23 11:44:06','2026-10-23 11:44:06'),('cb38bdf7-ef6a-46bf-ab20-b5b4c7451186','SMS','9080280818','SUPERADMIN_NEW_APPLICATION_SMS','REGISTRATION_REQUEST','5d6fd131-6304-4063-8f46-ecc0c18945f2','SENT','a4eeb3657b515b2f-BOM',NULL,0,3,NULL,'2026-10-23 06:31:44','2026-10-23 06:31:44'),('ccdd13fb-e017-4e36-bae5-e9a1cea46a38','EMAIL','subisha2002.m@gmail.com','FORGET_PASSWORD_OTP','EMAIL_CONF','','SENT','<6d9cc2a6-bab0-db4e-720c-c2525d5befa2@gmail.com>',NULL,0,3,'{\"subject\": \"OTP sent to reset for your password - GraceCabs\", \"accepted\": [\"subisha2002.m@gmail.com\", \"gracecabs1975@gmail.com\"]}','2026-10-23 10:04:14','2026-10-23 10:04:14'),('ce7a08a1-2c6b-4414-bef8-38d264f99032','EMAIL','subipcs@gmail.com','TENANT_ADMIN_ACTIVATION_LINK','TENANT','86dd7cb6-db2b-41f2-84b8-084239222083','SENT','<06599e31-760a-158c-1cc7-0dc18e40a1a5@gmail.com>',NULL,0,3,'{\"tenantId\": \"86dd7cb6-db2b-41f2-84b8-084239222083\", \"activationUrl\": \"http://localhost:3001/activate-account?token=act_765a802469009ddd1a60b900cf891b3091e3f9a897d2f5515b1399ca1646eefc\"}','2026-10-23 05:22:32','2026-10-23 05:22:32'),('cef4ad08-7a0b-4cc5-a8dc-27c774b373f5','EMAIL','applicant_1792752479080@skylinecabs.in','TENANT_ADMIN_ACTIVATION_LINK','TENANT','fe5817a8-5a77-4530-9cc1-903bb3139e39','SENT','<ba40097f-56ff-7b64-17a0-82afb0abbacd@gracecabs.com>',NULL,0,3,'{\"tenantId\": \"fe5817a8-5a77-4530-9cc1-903bb3139e39\", \"activationUrl\": \"http://localhost:3001/activate-account?token=act_b124195e7154e0c03b176f9b6eadb58824bcd6a189f5db8c4837b2ee99dff11c\"}','2026-10-23 10:48:15','2026-10-23 10:48:15'),('cf3fdf47-7572-43fd-8175-b4b2f57d224c','EMAIL','applicant_1792823496564@skylinecabs.in','TENANT_ADMIN_ACTIVATION_LINK','TENANT','1898508d-17e4-4d65-8436-47bae92adaa3','SENT','<5e0a4f65-98ec-67de-4105-ec12b6978d97@gracecabs.com>',NULL,0,3,'{\"loginUrl\": \"http://localhost:3000/adminlogin\", \"tenantId\": \"1898508d-17e4-4d65-8436-47bae92adaa3\", \"attachments\": [{\"path\": \"D:\\\\demobooking\\\\demo-bookings\\\\backend\\\\uploads\\\\plans\\\\Plan_Summary_SKY6564_1898508d.pdf\", \"filename\": \"Plan_Summary_SKY6564_1898508d.pdf\"}], \"activationUrl\": \"http://localhost:3000/activate-account?token=act_f68ec113eab013516cfa2a029e2741b46e334df1d1c11eabf57d6f1a8e28ec74\", \"planSummaryPdfUrl\": \"http://localhost:5000/api/tenants/plan-summary/download/Plan_Summary_SKY6564_1898508d.pdf?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRJZCI6IjE4OTg1MDhkLTE3ZTQtNGQ2NS04NDM2LTQ3YmFlOTJhZGFhMyIsImZpbGVOYW1lIjoiUGxhbl9TdW1tYXJ5X1NLWTY1NjRfMTg5ODUwOGQucGRmIiwidHlwZSI6IlBMQU5fU1VNTUFSWSIsImlhdCI6MTc5MjgyMzUwNywiZXhwIjoxNzk1NDE1NTA3fQ.HLr9AjTSROHfopyXwfmL-9rp2dQ86TUQsMIyzrs4Uwg\"}','2026-10-24 06:31:56','2026-10-24 06:31:56'),('d157bc5d-5ad7-4239-8c1f-0721321fb265','SMS','9080280818','SUPERADMIN_NEW_APPLICATION_SMS','REGISTRATION_REQUEST','c8cd01f3-ca7f-4450-8c3d-214d5c64c95a','SENT','a4f08b7c68acc87d-BOM',NULL,0,3,NULL,'2026-10-23 11:54:00','2026-10-23 11:54:00'),('d24aff43-13b9-45b0-b710-3fa64d3a8e40','EMAIL','subisha2002.m@gmail.com','SUPERADMIN_NEW_APPLICATION_ALERT','REGISTRATION_REQUEST','70692e5e-1781-4321-9d02-fada6ce07767','SENT','<b7233c50-f086-5e68-d4f9-a4c0d01a68ab@gracecabs.com>',NULL,0,3,'{\"reviewUrl\": \"http://localhost:3000/admin/registrations\", \"actionText\": \"Review Inbound Applications\"}','2026-10-24 05:02:00','2026-10-24 05:02:00'),('d2b5bf73-bf33-43e9-a901-1aedea67e9ae','EMAIL','driver_1792817966574@alphafleet.com','DRIVER_REGISTRATION_EMAIL_TO_DRIVER','EMAIL_CONF','','SENT','<60fbca4d-e70b-05f8-872b-b28d4fdced51@gracecabs.com>',NULL,0,3,'{\"subject\": \"Driver Account Created - GraceCabs\", \"accepted\": [\"driver_1792817966574@alphafleet.com\"]}','2026-10-24 04:59:36','2026-10-24 04:59:36'),('d2cb26cd-d346-447e-aa20-acff8b7903ee','EMAIL','applicant_1792818112160@skylinecabs.in','REGISTRATION_RECEIVED','REGISTRATION_REQUEST','70692e5e-1781-4321-9d02-fada6ce07767','SENT','<cf204f66-86b7-6362-0682-a183b6339372@gracecabs.com>',NULL,0,3,NULL,'2026-10-24 05:02:00','2026-10-24 05:02:00'),('d35f5f6e-4048-4905-86da-d7b7d6da4397','EMAIL','gracecabs1975@gmail.com','TEST_PROHIBITED_CONTACT',NULL,NULL,'FAILED',NULL,'Blocked: Delivery to obsolete Grace Cabs customer (gracecabs1975) is prohibited.',0,3,NULL,'2026-10-24 07:22:44','2026-10-24 07:22:44'),('d48029a1-8854-430f-b6f3-52e9644b8c34','SMS','9080280818','SUPERADMIN_NEW_APPLICATION_SMS','REGISTRATION_REQUEST','70692e5e-1781-4321-9d02-fada6ce07767','SENT','a4f66d23e82fb330-BOM',NULL,0,3,NULL,'2026-10-24 05:01:52','2026-10-24 05:01:52'),('d62c71e9-a15d-4bad-9be5-d98a295bcb72','EMAIL','subisha2002.m@gmail.com','FORGET_PASSWORD_OTP','EMAIL_CONF','','SENT','<64a69d6e-3540-5b4f-3263-a64621fb2234@gmail.com>',NULL,0,3,'{\"subject\": \"OTP sent to reset for your password - GraceCabs\", \"accepted\": [\"subisha2002.m@gmail.com\", \"gracecabs1975@gmail.com\"]}','2026-10-23 10:04:16','2026-10-23 10:04:16'),('d67f063f-c875-4c99-bd7c-cffea1ec1e23','EMAIL','ramesh.rg452021@swiftlogistics.com','REGISTRATION_RECEIVED','REGISTRATION_REQUEST','e35726b9-2f57-4dc5-bb1c-1a397854fec4','SENT','<43927b25-1248-f546-93f5-580b9f2a1bc8@gracecabs.com>',NULL,0,3,NULL,'2026-10-24 06:31:00','2026-10-24 06:31:00'),('d6e11fce-c006-46f4-bad0-90c3b12c8ffd','EMAIL','ramesh.rg112913@swiftlogistics.com','TENANT_ADMIN_ACTIVATION_LINK','TENANT','4835fdbe-0b47-4ec8-91c7-4bffe0827246','SENT','<8f7bef3e-51cc-e911-20a6-2e84d231da0a@gracecabs.com>',NULL,0,3,'{\"tenantId\": \"4835fdbe-0b47-4ec8-91c7-4bffe0827246\", \"activationUrl\": \"http://localhost:3000/activate-account?token=act_7ed6d754d4784ce34e9cad9f3f154e4bca47af794b5294f248ef2e8ffcd47e13\"}','2026-10-23 11:48:49','2026-10-23 11:48:49'),('d7afb33b-c12a-4c53-8995-6e4a872c0b88','EMAIL','subisha2002.m@gmail.com','SUPERADMIN_NEW_APPLICATION_ALERT','REGISTRATION_REQUEST','db170a9b-3d35-48ed-a8db-212ba69ac4c7','SENT','<b6db87c5-c56d-350b-8baf-16f7e8660960@gmail.com>',NULL,0,3,'{\"reviewUrl\": \"http://localhost:3001/admin/registrations\", \"actionText\": \"Review Inbound Applications\"}','2026-10-23 06:37:30','2026-10-23 06:37:30'),('d8af0dc5-8ae9-4134-ae5f-7b9102b44901','EMAIL','ramesh.rg072262@swiftlogistics.com','REGISTRATION_RECEIVED','REGISTRATION_REQUEST','bf3a9ff8-ff03-4a64-854d-683bb6892af9','SENT','<ca34389b-d4c7-eac4-1620-54976c21f620@gracecabs.com>',NULL,0,3,NULL,'2026-10-24 05:01:20','2026-10-24 05:01:20'),('d97ed3c3-74da-43bf-9e1a-a6af9916f0bf','EMAIL','driver_1792811221066@alphafleet.com','DRIVER_REGISTRATION_EMAIL_TO_DRIVER','EMAIL_CONF','','SENT','<5148a1ee-36e7-c163-b8b9-4a065edae453@gracecabs.com>',NULL,0,3,'{\"subject\": \"Driver Account Created - GraceCabs\", \"accepted\": [\"driver_1792811221066@alphafleet.com\"]}','2026-10-24 03:07:16','2026-10-24 03:07:16'),('dd5a192e-38df-4579-be93-004d2d49f833','EMAIL','subisha2002@gmail.com','SUPERADMIN_NEW_APPLICATION_ALERT','REGISTRATION_REQUEST','cfd84dbf-4341-49a2-bbd0-9913b8cb1798','SENT','<0773726a-fde9-5cc0-d78f-c596b902acd1@gracecabs.com>',NULL,0,3,'{\"reviewUrl\": \"http://localhost:3001/admin/registrations\", \"actionText\": \"Review Inbound Applications\"}','2026-10-22 08:50:47','2026-10-22 08:50:47'),('ddde69e0-0f71-46f6-8c89-2bfd0c3268a9','EMAIL','subisha2002@gmail.com','TEST_EMAIL','DIAGNOSTIC','DIAG_1792659000057','SENT','<801a9a09-a641-077c-f38e-59ddac81ca19@gracecabs.com>',NULL,0,3,NULL,'2026-10-22 08:50:07','2026-10-22 08:50:07'),('de6e28e0-dc54-410e-ba5b-66b0984c4a71','EMAIL','ramesh.rg845390@swiftlogistics.com','ACCOUNT_ACTIVATED','TENANT','42b707ca-9524-4eb9-beeb-ae9255ad6d37','SENT','<4c48b6bb-cd0d-5004-8d8c-8b07d0787484@gracecabs.com>',NULL,0,3,'{\"loginUrl\": \"http://localhost:3000/login\", \"actionText\": \"Sign In to Fleet Portal\"}','2026-10-23 11:44:31','2026-10-23 11:44:31'),('de828d96-19e5-4d7a-a270-493bbca4f206','EMAIL','applicant_1792811459975@skylinecabs.in','REGISTRATION_RECEIVED','REGISTRATION_REQUEST','8686ae47-a760-437a-ab41-f8a62f7ec439','SENT','<1180e3c4-3d2e-2ee0-4836-c5f644a0c3d2@gracecabs.com>',NULL,0,3,NULL,'2026-10-24 03:11:10','2026-10-24 03:11:10'),('ded64410-83f5-4f46-87d9-d9d0be49ff19','SMS','99999999999','BOOKING_CREATED','USER','e22df857-1acc-4fbe-b0b1-ce9c6e84d6ad','FAILED',NULL,'Invalid phone length: 11 digits (10 digits required)',0,3,NULL,'2026-10-23 09:44:29','2026-10-23 09:44:29'),('dfbc24c2-d8be-4ef5-bbe5-9199efb71414','SMS','9080280818','REGISTRATION_RECEIVED_SMS','REGISTRATION_REQUEST','3e961ada-525c-4ad4-9dc4-d8b609707107','SENT','a4ee4ac51b108377-BOM',NULL,0,3,NULL,'2026-10-23 05:20:19','2026-10-23 05:20:19'),('e0bb4b3e-1c50-495a-8e81-0b385401cb66','EMAIL','ganthimurugan1977@gmail.com','ACCOUNT_ACTIVATED','TENANT','dcb6e17e-9dfe-45d2-b7c7-bf1d65c9b7be','SENT','<cf0e597b-f3ad-dafd-db79-60cad6ef0e50@gmail.com>',NULL,0,3,'{\"loginUrl\": \"http://localhost:3001/login\", \"actionText\": \"Sign In to Fleet Portal\"}','2026-10-23 10:13:50','2026-10-23 10:13:50'),('e2517d86-adb8-4787-bb66-bc1b46956786','EMAIL','applicant_1792823496564@skylinecabs.in','ACCOUNT_ACTIVATED','TENANT','1898508d-17e4-4d65-8436-47bae92adaa3','SENT','<fdb37cf2-5b8a-c921-b71b-9a4a6371c8af@gracecabs.com>',NULL,0,3,'{\"loginUrl\": \"http://localhost:3000/login\", \"actionText\": \"Sign In to Fleet Portal\"}','2026-10-24 06:32:04','2026-10-24 06:32:04'),('e5480074-d4bf-4aac-9cf5-ab6ca00661e0','EMAIL','ganthimurugan1977@gmail.com','TENANT_ADMIN_ACTIVATION_LINK','TENANT','dcb6e17e-9dfe-45d2-b7c7-bf1d65c9b7be','SENT','<a8b7e276-f353-fd0e-8252-52ad3624aee1@gmail.com>',NULL,0,3,'{\"tenantId\": \"dcb6e17e-9dfe-45d2-b7c7-bf1d65c9b7be\", \"activationUrl\": \"http://localhost:3001/activate-account?token=act_6bc6c559699690cacaba9ce68c749ce5cc05fccb9200a8c8c905be5215793dd3\"}','2026-10-23 10:12:34','2026-10-23 10:12:34'),('e5ea0f31-a01e-43a8-ac14-7bf0f88030e4','EMAIL','subisha2002.m@gmail.com','REGISTRATION_RECEIVED','REGISTRATION_REQUEST','d8c7da45-b39c-45cb-9ab5-ca7288936bbc','SENT','<494f408a-bda1-8038-c337-11b4573648ed@gmail.com>',NULL,0,3,NULL,'2026-10-23 04:57:32','2026-10-23 04:57:32'),('e653e267-59b6-4e30-949b-03c7b67d3d53','EMAIL','subisha2002.m@gmail.com','SUPERADMIN_NEW_APPLICATION_ALERT','REGISTRATION_REQUEST','81ea148e-d3c3-47b7-8e68-ebbf436507cf','SENT','<957a29e3-d58b-e6f5-6207-673929431404@gmail.com>',NULL,0,3,'{\"reviewUrl\": \"http://localhost:3001/admin/registrations\", \"actionText\": \"Review Inbound Applications\"}','2026-10-23 06:22:27','2026-10-23 06:22:27'),('e829b9e7-1bbc-43b7-8406-448a830c1a1b','EMAIL','ramesh.rg265945@swiftlogistics.com','REGISTRATION_RECEIVED','REGISTRATION_REQUEST','3770f16c-5aa8-4ca3-ac27-718b01a02516','SENT','<d0a96845-458b-c0e6-0364-f844c6392e8a@gracecabs.com>',NULL,0,3,NULL,'2026-10-24 03:07:57','2026-10-24 03:07:57'),('ed37b15a-a947-4cc4-8c4d-260eee724803','EMAIL','subisurya525@gamil.com','REGISTRATION_RECEIVED','REGISTRATION_REQUEST','a0a73963-c83a-4c5e-870b-8c62c13bd7b3','SENT','<8d086a89-c2dc-8274-5e7b-55cf34077d2f@gmail.com>',NULL,0,3,NULL,'2026-10-23 09:56:19','2026-10-23 09:56:19'),('efbca2dc-7a83-49e7-997b-214abe7e3c4a','EMAIL','ramesh.rg440482@swiftlogistics.com','REGISTRATION_RECEIVED','REGISTRATION_REQUEST','c8cd01f3-ca7f-4450-8c3d-214d5c64c95a','SENT','<dd2c51e6-7d33-55b2-717c-08c654022649@gracecabs.com>',NULL,0,3,NULL,'2026-10-23 11:54:08','2026-10-23 11:54:08'),('f0bd7078-7d24-444d-a290-f903b4c0c590','EMAIL','vikram-1792992944219@beta.com','DRIVER_REGISTRATION_EMAIL_TO_DRIVER','EMAIL_CONF','86565456-0988-449b-bd25-cac4b8bfcdbc','SENT','<0c701238-e5e4-3e46-3a9d-e43fc03b1fa3@gracecabs.com>',NULL,0,3,'{\"subject\": \"Driver Account Created - GraceCabs\", \"accepted\": [\"vikram-1792992944219@beta.com\"], \"tenantId\": \"tenant-test-beta\"}','2026-10-26 05:35:53','2026-10-26 05:35:53'),('f1dc75ed-3aab-4752-a46b-90216ed77df8','EMAIL','subisha2002@gmail.com','SUPERADMIN_NEW_APPLICATION_ALERT','REGISTRATION_REQUEST','e39ca843-8f7e-4d3a-8a1f-d58d3b8a2f5b','SENT','<75f043e3-c92e-8fa4-6232-58159a8fb3fe@gmail.com>',NULL,0,3,'{\"reviewUrl\": \"http://localhost:3001/admin/registrations\", \"actionText\": \"Review Inbound Applications\"}','2026-10-22 11:48:44','2026-10-22 11:48:44'),('f30ed5f6-1266-48a0-b436-f36d49158383','SMS','9080280818','SUPERADMIN_NEW_APPLICATION_SMS','REGISTRATION_REQUEST','ad371ca6-7565-48b2-ba2e-2fbd13328730','SENT','a4f02cf12c5788ec-BOM',NULL,0,3,NULL,'2026-10-23 10:49:28','2026-10-23 10:49:28'),('f39baaf4-6883-4533-b76e-5a65595dae90','SMS','9840123456','REGISTRATION_RECEIVED_SMS','REGISTRATION_REQUEST','c8cd01f3-ca7f-4450-8c3d-214d5c64c95a','SENT','a4f08b7c6d094732-BOM',NULL,0,3,NULL,'2026-10-23 11:54:00','2026-10-23 11:54:00'),('f6ac3647-c2d2-4f75-af42-218a589d6657','EMAIL','subisha2002.m@gmail.com','FORGET_PASSWORD_OTP','EMAIL_CONF','','SENT','<4b9927fb-8cf6-97ad-c0c3-13c338beec26@gmail.com>',NULL,0,3,'{\"subject\": \"OTP sent to reset for your password - GraceCabs\", \"accepted\": [\"subisha2002.m@gmail.com\", \"gracecabs1975@gmail.com\"]}','2026-10-23 10:04:16','2026-10-23 10:04:16'),('f6d8d686-72d7-4378-b583-428fb2ec370c','EMAIL','applicant_1792818112160@skylinecabs.in','ACCOUNT_ACTIVATED','TENANT','fcf4a249-65e2-4259-8e61-f6d1e5a4ade5','SENT','<654e3bf2-30ef-28f9-7ed4-8d7c4226f2cd@gracecabs.com>',NULL,0,3,'{\"loginUrl\": \"http://localhost:3000/login\", \"actionText\": \"Sign In to Fleet Portal\"}','2026-10-24 05:02:17','2026-10-24 05:02:17'),('f7011b6a-9b9b-45ca-a752-6e79c9119d41','EMAIL','ramesh.rg112913@swiftlogistics.com','ACCOUNT_ACTIVATED','TENANT','4835fdbe-0b47-4ec8-91c7-4bffe0827246','SENT','<a7ae0f0d-11d7-e176-bf53-1eaa61d940c0@gracecabs.com>',NULL,0,3,'{\"loginUrl\": \"http://localhost:3000/login\", \"actionText\": \"Sign In to Fleet Portal\"}','2026-10-23 11:48:56','2026-10-23 11:48:56'),('f7318644-6fa7-4082-ae07-7ae70f880d1f','SMS','9876543210','BOOKING_CREATED','USER','aaaa4444-4444-4444-4444-444444444444','UNCONFIGURED',NULL,'SMS provider configuration missing: TWO_FACTOR_API_KEY / TWOFACTOR_API_KEY not configured in backend/.env',0,3,NULL,'2026-10-22 10:43:56','2026-10-22 10:43:56'),('f74e10bc-64c5-4344-abee-90de970000ce','SMS','9080280818','REGISTRATION_RECEIVED_SMS','REGISTRATION_REQUEST','f4a0eb8c-cc94-4e3b-8aba-ced0bc6bd497','SENT','a4eff5a6384c4732-BOM',NULL,0,3,NULL,'2026-10-23 10:11:43','2026-10-23 10:11:43'),('f7b80ae8-66da-4301-9214-26f5d43245c6','SMS','9876543210','BOOKING_CREATED','USER','aaaa4444-4444-4444-4444-444444444444','SENT','a4eeb5ccba2a40a5-BOM',NULL,0,3,NULL,'2026-10-23 06:33:23','2026-10-23 06:33:23'),('fc2571f4-8778-4ba8-b6ff-6096cc09131c','EMAIL','admin@gracecabs.com','SUPERADMIN_NEW_APPLICATION_ALERT','REGISTRATION_REQUEST','444bab71-35ae-4f77-8007-bd2c4abfacab','FAILED',NULL,'Invalid login: 535 Authentication failed',0,3,NULL,'2026-10-22 05:32:10','2026-10-22 05:32:10'),('fd24517f-ce08-4b1f-95fa-b6a82da7ade4','EMAIL','subisha2002.m@gmail.com','SUPERADMIN_NEW_APPLICATION_ALERT','REGISTRATION_REQUEST','eef347ad-2e5e-42d7-843d-854d44cb4fba','SENT','<2770e81a-7425-efc9-0665-a6e0d6584e19@gracecabs.com>',NULL,0,3,'{\"reviewUrl\": \"http://localhost:3000/admin/registrations\", \"actionText\": \"Review Inbound Applications\"}','2026-10-23 11:54:45','2026-10-23 11:54:45'),('fe6af3cf-60b1-4ff3-96d0-f610d5e70702','SMS','9080280818','SUPERADMIN_NEW_APPLICATION_SMS','REGISTRATION_REQUEST','c1775d3e-9fdb-454d-b6cc-833bb6ff7756','SENT','a4eeb45c89f18377-BOM',NULL,0,3,NULL,'2026-10-23 06:32:24','2026-10-23 06:32:24');
/*!40000 ALTER TABLE `notification_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `oncallinvoice`
--

DROP TABLE IF EXISTS `oncallinvoice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `oncallinvoice` (
  `onCallBillId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `onCallInvoiceCode` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `companyId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `companyName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `invoiceSubTotal` decimal(18,2) DEFAULT NULL,
  `invoiceTaxBreakup` text COLLATE utf8mb4_unicode_ci,
  `tripSheetNumbers` text COLLATE utf8mb4_unicode_ci,
  `totalAmount` decimal(18,2) DEFAULT NULL,
  `isDeleted` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime DEFAULT NULL,
  `totalTaxAmount` text COLLATE utf8mb4_unicode_ci,
  `tenantId` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT 'e7b8a1c0-0000-0000-0000-000000000001',
  PRIMARY KEY (`onCallBillId`),
  UNIQUE KEY `onCallInvoiceCode` (`onCallInvoiceCode`),
  UNIQUE KEY `onCallInvoiceCode_2` (`onCallInvoiceCode`),
  UNIQUE KEY `onCallInvoiceCode_3` (`onCallInvoiceCode`),
  UNIQUE KEY `onCallInvoiceCode_4` (`onCallInvoiceCode`),
  UNIQUE KEY `onCallInvoiceCode_5` (`onCallInvoiceCode`),
  UNIQUE KEY `onCallInvoiceCode_6` (`onCallInvoiceCode`),
  UNIQUE KEY `onCallInvoiceCode_7` (`onCallInvoiceCode`),
  UNIQUE KEY `onCallInvoiceCode_8` (`onCallInvoiceCode`),
  UNIQUE KEY `onCallInvoiceCode_9` (`onCallInvoiceCode`),
  UNIQUE KEY `onCallInvoiceCode_10` (`onCallInvoiceCode`),
  UNIQUE KEY `onCallInvoiceCode_11` (`onCallInvoiceCode`),
  UNIQUE KEY `onCallInvoiceCode_12` (`onCallInvoiceCode`),
  UNIQUE KEY `onCallInvoiceCode_13` (`onCallInvoiceCode`),
  UNIQUE KEY `onCallInvoiceCode_14` (`onCallInvoiceCode`),
  UNIQUE KEY `onCallInvoiceCode_15` (`onCallInvoiceCode`),
  UNIQUE KEY `onCallInvoiceCode_16` (`onCallInvoiceCode`),
  KEY `companyId` (`companyId`),
  CONSTRAINT `oncallinvoice_ibfk_1` FOREIGN KEY (`companyId`) REFERENCES `company` (`companyId`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `oncallinvoice`
--

LOCK TABLES `oncallinvoice` WRITE;
/*!40000 ALTER TABLE `oncallinvoice` DISABLE KEYS */;
/*!40000 ALTER TABLE `oncallinvoice` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `oncallinvoiceitems`
--

DROP TABLE IF EXISTS `oncallinvoiceitems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `oncallinvoiceitems` (
  `onCallInvoiceItemId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `onCallBillId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `tripSheetNo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `vehicleTypeId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vehicleNo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `driverName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `guestName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bookedBy` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tripDetails` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `garageOpenKm` float DEFAULT NULL,
  `garageCloseKm` float DEFAULT NULL,
  `garageKms` float DEFAULT NULL,
  `guestOpenKm` float DEFAULT NULL,
  `guestCloseKm` float DEFAULT NULL,
  `guestKms` float DEFAULT NULL,
  `hideGuestDetails` tinyint(1) DEFAULT NULL,
  `startingTime` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `closingTime` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `usageHours` float DEFAULT NULL,
  `packageType` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `travelPackage` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `packageDays` int DEFAULT NULL,
  `driverDays` int DEFAULT NULL,
  `selectedPackageMeta` text COLLATE utf8mb4_unicode_ci,
  `packageAmount` decimal(18,2) DEFAULT NULL,
  `additionalKms` float DEFAULT NULL,
  `additionalKmsAmount` decimal(18,2) DEFAULT NULL,
  `additionalHours` float DEFAULT NULL,
  `additionalHoursAmount` decimal(18,2) DEFAULT NULL,
  `driverBatta` decimal(18,2) DEFAULT NULL,
  `extraChargesBreakup` text COLLATE utf8mb4_unicode_ci,
  `extraCharges` decimal(18,2) DEFAULT NULL,
  `discountAmount` decimal(18,2) DEFAULT NULL,
  `advanceAmount` decimal(18,2) DEFAULT NULL,
  `taxes` text COLLATE utf8mb4_unicode_ci,
  `totalTaxAmount` decimal(18,2) DEFAULT NULL,
  `amount` decimal(18,2) DEFAULT NULL,
  `total` decimal(18,2) DEFAULT NULL,
  `totalDue` decimal(18,2) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  PRIMARY KEY (`onCallInvoiceItemId`),
  KEY `idx_oncallinvoiceitems_billid` (`onCallBillId`),
  CONSTRAINT `fk_oncallinvoiceitems_billid` FOREIGN KEY (`onCallBillId`) REFERENCES `oncallinvoice` (`onCallBillId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `oncallinvoiceitems_ibfk_1` FOREIGN KEY (`onCallBillId`) REFERENCES `oncallinvoice` (`onCallBillId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `oncallinvoiceitems_ibfk_10` FOREIGN KEY (`onCallBillId`) REFERENCES `oncallinvoice` (`onCallBillId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `oncallinvoiceitems_ibfk_11` FOREIGN KEY (`onCallBillId`) REFERENCES `oncallinvoice` (`onCallBillId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `oncallinvoiceitems_ibfk_12` FOREIGN KEY (`onCallBillId`) REFERENCES `oncallinvoice` (`onCallBillId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `oncallinvoiceitems_ibfk_13` FOREIGN KEY (`onCallBillId`) REFERENCES `oncallinvoice` (`onCallBillId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `oncallinvoiceitems_ibfk_14` FOREIGN KEY (`onCallBillId`) REFERENCES `oncallinvoice` (`onCallBillId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `oncallinvoiceitems_ibfk_2` FOREIGN KEY (`onCallBillId`) REFERENCES `oncallinvoice` (`onCallBillId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `oncallinvoiceitems_ibfk_3` FOREIGN KEY (`onCallBillId`) REFERENCES `oncallinvoice` (`onCallBillId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `oncallinvoiceitems_ibfk_4` FOREIGN KEY (`onCallBillId`) REFERENCES `oncallinvoice` (`onCallBillId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `oncallinvoiceitems_ibfk_5` FOREIGN KEY (`onCallBillId`) REFERENCES `oncallinvoice` (`onCallBillId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `oncallinvoiceitems_ibfk_6` FOREIGN KEY (`onCallBillId`) REFERENCES `oncallinvoice` (`onCallBillId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `oncallinvoiceitems_ibfk_7` FOREIGN KEY (`onCallBillId`) REFERENCES `oncallinvoice` (`onCallBillId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `oncallinvoiceitems_ibfk_8` FOREIGN KEY (`onCallBillId`) REFERENCES `oncallinvoice` (`onCallBillId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `oncallinvoiceitems_ibfk_9` FOREIGN KEY (`onCallBillId`) REFERENCES `oncallinvoice` (`onCallBillId`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `oncallinvoiceitems`
--

LOCK TABLES `oncallinvoiceitems` WRITE;
/*!40000 ALTER TABLE `oncallinvoiceitems` DISABLE KEYS */;
/*!40000 ALTER TABLE `oncallinvoiceitems` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ordersummery`
--

DROP TABLE IF EXISTS `ordersummery`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ordersummery` (
  `ordersummeryid` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `companyId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `invoiceId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `taxId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `tenantId` varchar(36) DEFAULT 'e7b8a1c0-0000-0000-0000-000000000001',
  PRIMARY KEY (`ordersummeryid`),
  KEY `companyId` (`companyId`),
  KEY `invoiceId` (`invoiceId`),
  KEY `taxId` (`taxId`),
  CONSTRAINT `ordersummery_ibfk_205` FOREIGN KEY (`companyId`) REFERENCES `company` (`companyId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `ordersummery_ibfk_206` FOREIGN KEY (`invoiceId`) REFERENCES `invoice` (`invoiceId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `ordersummery_ibfk_207` FOREIGN KEY (`taxId`) REFERENCES `tax` (`taxId`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ordersummery`
--

LOCK TABLES `ordersummery` WRITE;
/*!40000 ALTER TABLE `ordersummery` DISABLE KEYS */;
/*!40000 ALTER TABLE `ordersummery` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `otp`
--

DROP TABLE IF EXISTS `otp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `otp` (
  `otpId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `otp` varchar(6) DEFAULT NULL,
  `loginId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expiresAt` datetime NOT NULL,
  `createdAt` datetime DEFAULT NULL,
  `sessionId` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`otpId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `otp`
--

LOCK TABLES `otp` WRITE;
/*!40000 ALTER TABLE `otp` DISABLE KEYS */;
/*!40000 ALTER TABLE `otp` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `owner`
--

DROP TABLE IF EXISTS `owner`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `owner` (
  `ownerId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `ownerName` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phno` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `isDeleted` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL,
  PRIMARY KEY (`ownerId`),
  UNIQUE KEY `phno` (`phno`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `owner`
--

LOCK TABLES `owner` WRITE;
/*!40000 ALTER TABLE `owner` DISABLE KEYS */;
/*!40000 ALTER TABLE `owner` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `package`
--

DROP TABLE IF EXISTS `package`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `package` (
  `packageId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `companyId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `packageType` enum('Out Station','Local City Use') NOT NULL,
  `isDeleted` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime DEFAULT NULL,
  `tenantId` varchar(36) DEFAULT 'e7b8a1c0-0000-0000-0000-000000000001',
  PRIMARY KEY (`packageId`),
  KEY `companyId` (`companyId`),
  CONSTRAINT `package_ibfk_1` FOREIGN KEY (`companyId`) REFERENCES `company` (`companyId`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `package`
--

LOCK TABLES `package` WRITE;
/*!40000 ALTER TABLE `package` DISABLE KEYS */;
/*!40000 ALTER TABLE `package` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `packagedata`
--

DROP TABLE IF EXISTS `packagedata`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `packagedata` (
  `packageDataId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `packageType` varchar(255) DEFAULT NULL,
  `companyId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `packages` longtext,
  `isDeleted` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime DEFAULT NULL,
  `tenantId` varchar(36) DEFAULT 'e7b8a1c0-0000-0000-0000-000000000001',
  PRIMARY KEY (`packageDataId`),
  KEY `companyId` (`companyId`),
  CONSTRAINT `packagedata_ibfk_1` FOREIGN KEY (`companyId`) REFERENCES `company` (`companyId`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `packagedata`
--

LOCK TABLES `packagedata` WRITE;
/*!40000 ALTER TABLE `packagedata` DISABLE KEYS */;
/*!40000 ALTER TABLE `packagedata` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `partners`
--

DROP TABLE IF EXISTS `partners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `partners` (
  `partnerId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `contactNumber` varchar(255) DEFAULT NULL,
  `presentAddress` varchar(255) DEFAULT NULL,
  `cityPreferred` varchar(255) DEFAULT NULL,
  `vehicleType` varchar(255) DEFAULT NULL,
  `registrationNumber` varchar(255) DEFAULT NULL,
  `registrationYear` varchar(255) DEFAULT NULL,
  `fuelType` varchar(255) DEFAULT NULL,
  `passengerCapacity` int DEFAULT NULL,
  `isDeleted` tinyint(1) DEFAULT '0',
  `createdAt` datetime DEFAULT NULL,
  `licenseNo` varchar(255) DEFAULT NULL,
  `tenantId` varchar(36) DEFAULT 'e7b8a1c0-0000-0000-0000-000000000001',
  PRIMARY KEY (`partnerId`),
  UNIQUE KEY `registrationNumber` (`registrationNumber`),
  UNIQUE KEY `contactNumber` (`contactNumber`),
  UNIQUE KEY `licenseNo` (`licenseNo`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `contactNumber_2` (`contactNumber`),
  UNIQUE KEY `registrationNumber_2` (`registrationNumber`),
  UNIQUE KEY `licenseNo_2` (`licenseNo`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `contactNumber_3` (`contactNumber`),
  UNIQUE KEY `registrationNumber_3` (`registrationNumber`),
  UNIQUE KEY `licenseNo_3` (`licenseNo`),
  UNIQUE KEY `email_3` (`email`),
  UNIQUE KEY `contactNumber_4` (`contactNumber`),
  UNIQUE KEY `registrationNumber_4` (`registrationNumber`),
  UNIQUE KEY `licenseNo_4` (`licenseNo`),
  UNIQUE KEY `email_4` (`email`),
  UNIQUE KEY `contactNumber_5` (`contactNumber`),
  UNIQUE KEY `registrationNumber_5` (`registrationNumber`),
  UNIQUE KEY `licenseNo_5` (`licenseNo`),
  UNIQUE KEY `email_5` (`email`),
  UNIQUE KEY `contactNumber_6` (`contactNumber`),
  UNIQUE KEY `registrationNumber_6` (`registrationNumber`),
  UNIQUE KEY `licenseNo_6` (`licenseNo`),
  UNIQUE KEY `email_6` (`email`),
  UNIQUE KEY `contactNumber_7` (`contactNumber`),
  UNIQUE KEY `registrationNumber_7` (`registrationNumber`),
  UNIQUE KEY `licenseNo_7` (`licenseNo`),
  UNIQUE KEY `email_7` (`email`),
  UNIQUE KEY `contactNumber_8` (`contactNumber`),
  UNIQUE KEY `registrationNumber_8` (`registrationNumber`),
  UNIQUE KEY `licenseNo_8` (`licenseNo`),
  UNIQUE KEY `email_8` (`email`),
  UNIQUE KEY `contactNumber_9` (`contactNumber`),
  UNIQUE KEY `registrationNumber_9` (`registrationNumber`),
  UNIQUE KEY `licenseNo_9` (`licenseNo`),
  UNIQUE KEY `email_9` (`email`),
  UNIQUE KEY `contactNumber_10` (`contactNumber`),
  UNIQUE KEY `registrationNumber_10` (`registrationNumber`),
  UNIQUE KEY `licenseNo_10` (`licenseNo`),
  UNIQUE KEY `email_10` (`email`),
  UNIQUE KEY `contactNumber_11` (`contactNumber`),
  UNIQUE KEY `registrationNumber_11` (`registrationNumber`),
  UNIQUE KEY `licenseNo_11` (`licenseNo`),
  UNIQUE KEY `email_11` (`email`),
  UNIQUE KEY `contactNumber_12` (`contactNumber`),
  UNIQUE KEY `registrationNumber_12` (`registrationNumber`),
  UNIQUE KEY `licenseNo_12` (`licenseNo`),
  UNIQUE KEY `email_12` (`email`),
  UNIQUE KEY `contactNumber_13` (`contactNumber`),
  UNIQUE KEY `registrationNumber_13` (`registrationNumber`),
  UNIQUE KEY `licenseNo_13` (`licenseNo`),
  UNIQUE KEY `email_13` (`email`),
  UNIQUE KEY `contactNumber_14` (`contactNumber`),
  UNIQUE KEY `registrationNumber_14` (`registrationNumber`),
  UNIQUE KEY `licenseNo_14` (`licenseNo`),
  UNIQUE KEY `email_14` (`email`),
  UNIQUE KEY `contactNumber_15` (`contactNumber`),
  UNIQUE KEY `registrationNumber_15` (`registrationNumber`),
  UNIQUE KEY `licenseNo_15` (`licenseNo`),
  UNIQUE KEY `email_15` (`email`),
  UNIQUE KEY `contactNumber_16` (`contactNumber`),
  UNIQUE KEY `registrationNumber_16` (`registrationNumber`),
  UNIQUE KEY `licenseNo_16` (`licenseNo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `partners`
--

LOCK TABLES `partners` WRITE;
/*!40000 ALTER TABLE `partners` DISABLE KEYS */;
/*!40000 ALTER TABLE `partners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment`
--

DROP TABLE IF EXISTS `payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment` (
  `paymentId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `paymentMode` varchar(255) DEFAULT NULL,
  `isOnline` tinyint(1) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT NULL,
  `transactionId` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `amount` decimal(10,0) DEFAULT NULL,
  `tax` decimal(10,0) DEFAULT NULL,
  `orderId` varchar(255) DEFAULT NULL,
  `gatewayOrderId` varchar(255) DEFAULT NULL,
  `paymentUrl` varchar(255) DEFAULT NULL,
  `clientAuthToken` varchar(255) DEFAULT NULL,
  `expiresAt` datetime DEFAULT NULL,
  `meta` json DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `tenantId` varchar(36) DEFAULT 'e7b8a1c0-0000-0000-0000-000000000001',
  PRIMARY KEY (`paymentId`),
  UNIQUE KEY `transactionId` (`transactionId`),
  UNIQUE KEY `transactionId_2` (`transactionId`),
  UNIQUE KEY `transactionId_3` (`transactionId`),
  UNIQUE KEY `transactionId_4` (`transactionId`),
  UNIQUE KEY `transactionId_5` (`transactionId`),
  UNIQUE KEY `transactionId_6` (`transactionId`),
  UNIQUE KEY `transactionId_7` (`transactionId`),
  UNIQUE KEY `transactionId_8` (`transactionId`),
  UNIQUE KEY `transactionId_9` (`transactionId`),
  UNIQUE KEY `transactionId_10` (`transactionId`),
  UNIQUE KEY `transactionId_11` (`transactionId`),
  UNIQUE KEY `transactionId_12` (`transactionId`),
  UNIQUE KEY `transactionId_13` (`transactionId`),
  UNIQUE KEY `transactionId_14` (`transactionId`),
  UNIQUE KEY `transactionId_15` (`transactionId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment`
--

LOCK TABLES `payment` WRITE;
/*!40000 ALTER TABLE `payment` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_sequence`
--

DROP TABLE IF EXISTS `payment_sequence`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_sequence` (
  `seq_date` date NOT NULL,
  `last_number` int DEFAULT NULL,
  PRIMARY KEY (`seq_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_sequence`
--

LOCK TABLES `payment_sequence` WRITE;
/*!40000 ALTER TABLE `payment_sequence` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment_sequence` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `paymentmode`
--

DROP TABLE IF EXISTS `paymentmode`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `paymentmode` (
  `paymentmodeId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `modelname` varchar(255) DEFAULT NULL,
  `sortorder` varchar(255) DEFAULT NULL,
  `isOnline` tinyint(1) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT NULL,
  `isDeleted` tinyint(1) NOT NULL DEFAULT '0',
  `tenantId` varchar(36) DEFAULT 'e7b8a1c0-0000-0000-0000-000000000001',
  `createdAt` datetime DEFAULT NULL,
  PRIMARY KEY (`paymentmodeId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `paymentmode`
--

LOCK TABLES `paymentmode` WRITE;
/*!40000 ALTER TABLE `paymentmode` DISABLE KEYS */;
INSERT INTO `paymentmode` VALUES ('14b97486-75a0-411b-be28-8bf5041f043b','COD',NULL,0,1,1,'e7b8a1c0-0000-0000-0000-000000000001','2026-10-16 09:43:45'),('16fae8fb-b149-46a6-9abd-9e0d7bca406a','CREDIT CARD',NULL,1,1,0,'e7b8a1c0-0000-0000-0000-000000000001','2026-10-17 03:39:33'),('6c85fd12-5e47-47c7-a91a-dfc2e2503eea','Cash',NULL,0,1,0,'e7b8a1c0-0000-0000-0000-000000000001','2026-10-21 08:03:45'),('83d62ebb-3203-4675-b5f9-697f75a2658b','AlphaPay-1792992933606',NULL,1,NULL,0,'a1a1a1a1-1111-4111-a111-111111111111','2026-10-26 05:35:33'),('c27a9e44-c12e-41ab-8c1c-227e7d29e559','DEBITCARD',NULL,1,1,0,'e7b8a1c0-0000-0000-0000-000000000001','2026-10-17 03:39:47'),('e9d69aa4-0afd-490e-8450-61fc460419f4','COD',NULL,1,1,0,'e7b8a1c0-0000-0000-0000-000000000001','2026-10-23 07:05:30'),('ec21c2bb-b1ab-4b67-b5cf-99e427e4729d','BetaPay-1792992933611',NULL,0,NULL,0,'tenant-test-beta','2026-10-26 05:35:33'),('f8b0c05c-0dd2-4bd6-a218-f705d49cacd5','GPAY',NULL,1,1,0,'e7b8a1c0-0000-0000-0000-000000000001','2026-10-17 03:38:57');
/*!40000 ALTER TABLE `paymentmode` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pickuparea`
--

DROP TABLE IF EXISTS `pickuparea`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pickuparea` (
  `areaId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `pickupCity` varchar(255) DEFAULT NULL,
  `pickupArea` varchar(255) DEFAULT NULL,
  `isDeleted` tinyint(1) NOT NULL DEFAULT '0',
  `tenantId` varchar(36) DEFAULT 'e7b8a1c0-0000-0000-0000-000000000001',
  `createdAt` datetime DEFAULT NULL,
  PRIMARY KEY (`areaId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pickuparea`
--

LOCK TABLES `pickuparea` WRITE;
/*!40000 ALTER TABLE `pickuparea` DISABLE KEYS */;
INSERT INTO `pickuparea` VALUES ('7b9731a4-f163-4c27-9bb7-56b87ca43e4b','chennai','T Nagar',0,'e7b8a1c0-0000-0000-0000-000000000001','2026-10-23 06:54:31'),('ba26f77b-883b-4004-98a7-9240cf020533','AlphaCity-1792992933473','Alpha Main Area',0,'a1a1a1a1-1111-4111-a111-111111111111','2026-10-26 05:35:33'),('ec9dfd51-bbbf-4560-8402-b8c891244c1e','chennai','PORUR',0,'e7b8a1c0-0000-0000-0000-000000000001','2026-10-17 03:20:36');
/*!40000 ALTER TABLE `pickuparea` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pickupcity`
--

DROP TABLE IF EXISTS `pickupcity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pickupcity` (
  `cityId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `country` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `pickupCity` varchar(255) DEFAULT NULL,
  `sortOrder` varchar(255) DEFAULT NULL,
  `isPickupCity` varchar(255) DEFAULT NULL,
  `isDeleted` tinyint(1) NOT NULL DEFAULT '0',
  `tenantId` varchar(36) DEFAULT 'e7b8a1c0-0000-0000-0000-000000000001',
  `createdAt` datetime DEFAULT NULL,
  PRIMARY KEY (`cityId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pickupcity`
--

LOCK TABLES `pickupcity` WRITE;
/*!40000 ALTER TABLE `pickupcity` DISABLE KEYS */;
INSERT INTO `pickupcity` VALUES ('0b238c0d-91a8-48bf-825c-8a15af8c59ac','India','Tamil Nadu','Vandalur',NULL,'1',0,'e7b8a1c0-0000-0000-0000-000000000001','2026-10-17 03:20:56'),('2d4444e8-4c25-4217-8b61-6c30efdd8ce4','India','Tamil Nadu','chennai',NULL,'1',0,'e7b8a1c0-0000-0000-0000-000000000001','2026-10-16 07:38:25'),('66cbe446-625b-4232-80b9-4a7ae2790582',NULL,NULL,'AlphaCity-1792992933473',NULL,NULL,0,'a1a1a1a1-1111-4111-a111-111111111111','2026-10-26 05:35:33'),('700def61-fb0e-412c-9213-70571ca2cf62','India','Tamil Nadu','Kilambakkam',NULL,'1',0,'e7b8a1c0-0000-0000-0000-000000000001','2026-10-17 03:21:15'),('a24ab0eb-6c39-46ac-9332-a11c9cec5871',NULL,NULL,'BetaCity-1792992933516',NULL,NULL,0,'tenant-test-beta','2026-10-26 05:35:33'),('c0ed2899-9659-4064-a752-f80a2af436a7','India','Tamil Nadu','tenkasi',NULL,'1',0,'e7b8a1c0-0000-0000-0000-000000000001','2026-10-23 06:54:46');
/*!40000 ALTER TABLE `pickupcity` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `saas_plans`
--

DROP TABLE IF EXISTS `saas_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `saas_plans` (
  `planId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `planTier` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `priceMonthlyINR` decimal(10,2) NOT NULL DEFAULT '299.00',
  `priceAnnualINR` decimal(10,2) NOT NULL DEFAULT '3050.00',
  `priceMonthlyUSD` decimal(10,2) NOT NULL DEFAULT '5.00',
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'INR',
  `billingFrequency` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MONTHLY',
  `billingCycles` json DEFAULT NULL,
  `maxVehicles` int NOT NULL DEFAULT '15',
  `maxDrivers` int NOT NULL DEFAULT '15',
  `maxCompanies` int NOT NULL DEFAULT '3',
  `maxUsers` int NOT NULL DEFAULT '5',
  `monthlyTripQuota` int NOT NULL DEFAULT '1000',
  `isUnlimitedVehicles` tinyint(1) NOT NULL DEFAULT '0',
  `isUnlimitedDrivers` tinyint(1) NOT NULL DEFAULT '0',
  `isUnlimitedCompanies` tinyint(1) NOT NULL DEFAULT '0',
  `isUnlimitedUsers` tinyint(1) NOT NULL DEFAULT '0',
  `isUnlimitedTrips` tinyint(1) NOT NULL DEFAULT '0',
  `features` json DEFAULT NULL,
  `featureEntitlements` json DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`planId`),
  UNIQUE KEY `planTier` (`planTier`),
  UNIQUE KEY `planTier_2` (`planTier`),
  UNIQUE KEY `planTier_3` (`planTier`),
  UNIQUE KEY `planTier_4` (`planTier`),
  UNIQUE KEY `planTier_5` (`planTier`),
  UNIQUE KEY `planTier_6` (`planTier`),
  UNIQUE KEY `planTier_7` (`planTier`),
  UNIQUE KEY `planTier_8` (`planTier`),
  UNIQUE KEY `planTier_9` (`planTier`),
  UNIQUE KEY `planTier_10` (`planTier`),
  UNIQUE KEY `planTier_11` (`planTier`),
  UNIQUE KEY `planTier_12` (`planTier`),
  UNIQUE KEY `planTier_13` (`planTier`),
  UNIQUE KEY `planTier_14` (`planTier`),
  UNIQUE KEY `planTier_15` (`planTier`),
  UNIQUE KEY `planTier_16` (`planTier`),
  UNIQUE KEY `planTier_17` (`planTier`),
  UNIQUE KEY `planTier_18` (`planTier`),
  UNIQUE KEY `planTier_19` (`planTier`),
  UNIQUE KEY `planTier_20` (`planTier`),
  UNIQUE KEY `planTier_21` (`planTier`),
  UNIQUE KEY `planTier_22` (`planTier`),
  UNIQUE KEY `planTier_23` (`planTier`),
  UNIQUE KEY `planTier_24` (`planTier`),
  UNIQUE KEY `planTier_25` (`planTier`),
  UNIQUE KEY `planTier_26` (`planTier`),
  UNIQUE KEY `planTier_27` (`planTier`),
  UNIQUE KEY `planTier_28` (`planTier`),
  UNIQUE KEY `planTier_29` (`planTier`),
  UNIQUE KEY `planTier_30` (`planTier`),
  UNIQUE KEY `planTier_31` (`planTier`),
  UNIQUE KEY `planTier_32` (`planTier`),
  UNIQUE KEY `planTier_33` (`planTier`),
  UNIQUE KEY `planTier_34` (`planTier`),
  UNIQUE KEY `planTier_35` (`planTier`),
  UNIQUE KEY `planTier_36` (`planTier`),
  UNIQUE KEY `planTier_37` (`planTier`),
  UNIQUE KEY `planTier_38` (`planTier`),
  UNIQUE KEY `planTier_39` (`planTier`),
  UNIQUE KEY `planTier_40` (`planTier`),
  UNIQUE KEY `planTier_41` (`planTier`),
  UNIQUE KEY `planTier_42` (`planTier`),
  UNIQUE KEY `planTier_43` (`planTier`),
  UNIQUE KEY `planTier_44` (`planTier`),
  UNIQUE KEY `planTier_45` (`planTier`),
  UNIQUE KEY `planTier_46` (`planTier`),
  UNIQUE KEY `planTier_47` (`planTier`),
  UNIQUE KEY `planTier_48` (`planTier`),
  UNIQUE KEY `planTier_49` (`planTier`),
  UNIQUE KEY `planTier_50` (`planTier`),
  UNIQUE KEY `planTier_51` (`planTier`),
  UNIQUE KEY `planTier_52` (`planTier`),
  UNIQUE KEY `planTier_53` (`planTier`),
  UNIQUE KEY `planTier_54` (`planTier`),
  UNIQUE KEY `planTier_55` (`planTier`),
  UNIQUE KEY `planTier_56` (`planTier`),
  UNIQUE KEY `planTier_57` (`planTier`),
  UNIQUE KEY `planTier_58` (`planTier`),
  UNIQUE KEY `planTier_59` (`planTier`),
  UNIQUE KEY `planTier_60` (`planTier`),
  UNIQUE KEY `planTier_61` (`planTier`),
  UNIQUE KEY `planTier_62` (`planTier`),
  UNIQUE KEY `planTier_63` (`planTier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `saas_plans`
--

LOCK TABLES `saas_plans` WRITE;
/*!40000 ALTER TABLE `saas_plans` DISABLE KEYS */;
INSERT INTO `saas_plans` VALUES ('11710615-3e19-48d1-993d-91d5a409138f','BASIC','Starter Mobility','Essential fleet and trip dispatch operations for emerging operators.',299.00,3050.00,4.00,'INR','MONTHLY','[\"MONTHLY\", \"ANNUAL\"]',15,15,3,5,1000,0,0,0,0,0,'[\"Fleet & Driver Operations (Up to 15 Vehicles / 15 Drivers)\", \"Up to 3 Corporate Client Accounts\", \"Basic Booking-to-Invoice Lifecycle & Dispatch\", \"Automated Standard Tax & Trip Rate Calculation\", \"Standard PDF Invoice Generation\", \"Email Notification Support\"]','{\"multiBranch\": false, \"customDomain\": false, \"customBranding\": false, \"advancedReports\": false, \"pdfCustomizationTier\": \"STANDARD\", \"dedicatedPolicyEngine\": false}',1,'2026-10-24 04:53:53','2026-10-24 04:53:53'),('28f80e21-cb2a-4e7e-8683-af0006340330','ENTERPRISE','Enterprise Mobility Suite','High-volume platform with full tenant scoping, custom domains, and VIP telemetry.',549.00,5600.00,7.00,'INR','MONTHLY','[\"MONTHLY\", \"ANNUAL\"]',250,250,100,100,50000,0,0,0,0,0,'[\"High-Volume Fleet Operations (Up to 250 Vehicles / 250 Drivers)\", \"Up to 100 Corporate Client Accounts\", \"Full Multi-Tenant SaaS Isolation & Custom Domains\", \"Dedicated Database Tenant Scoping & Policy Engine\", \"Consolidated Monthly Corporate Route Invoicing\", \"Multi-Role Server Authorization\", \"Priority Support & High-Volume Telemetry Metering\"]','{\"multiBranch\": true, \"customDomain\": true, \"customBranding\": true, \"advancedReports\": true, \"pdfCustomizationTier\": \"ADVANCED\", \"dedicatedPolicyEngine\": true}',1,'2026-10-24 04:53:53','2026-10-24 04:53:53'),('31c7872b-bb42-47c9-95d3-99a861a04c7f','TEST_CUSTOM_2652','Custom Enterprise Tier','Dedicated test tier',999.00,9999.00,0.00,'INR','MONTHLY','[\"MONTHLY\", \"ANNUAL\"]',50,50,10,100,5000,0,0,0,0,0,'[\"advanced_pdf\", \"api_access\"]','{\"customTheme\": true, \"pdfBranding\": true}',1,'2026-10-24 04:54:02','2026-10-24 04:54:02'),('b8dcf23c-27d1-45ef-94d0-8ea2629e6621','PRO','Growth Fleet Pro','Scalable multi-company corporate transit with customized branding.',349.00,3560.00,5.00,'INR','MONTHLY','[\"MONTHLY\", \"ANNUAL\"]',75,75,20,25,10000,0,0,0,0,0,'[\"Expanded Fleet Management (Up to 75 Vehicles / 75 Drivers)\", \"Up to 20 Corporate Client Accounts\", \"On-Call, Monthly Consolidated & Spot Trip Invoicing\", \"Advanced Tenant Branding & Portal Theming\", \"Dynamic Corporate Booking Policies & Domain Validation\", \"Route Card Aggregation & Financial Summary Reports\", \"Custom Email/SMS Reminders & Payment Tracking\"]','{\"multiBranch\": true, \"customDomain\": false, \"customBranding\": true, \"advancedReports\": true, \"pdfCustomizationTier\": \"BRANDED\", \"dedicatedPolicyEngine\": true}',1,'2026-10-24 04:53:53','2026-10-24 04:53:53');
/*!40000 ALTER TABLE `saas_plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `short_links`
--

DROP TABLE IF EXISTS `short_links`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `short_links` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `fullUrl` text NOT NULL,
  `createdAt` datetime DEFAULT NULL,
  `expiresAt` datetime DEFAULT NULL COMMENT 'If set, short link expires at this time',
  `tenantId` varchar(36) DEFAULT 'e7b8a1c0-0000-0000-0000-000000000001',
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  UNIQUE KEY `short_links_code` (`code`),
  UNIQUE KEY `code_2` (`code`),
  UNIQUE KEY `code_3` (`code`),
  UNIQUE KEY `code_4` (`code`),
  UNIQUE KEY `code_5` (`code`),
  UNIQUE KEY `code_6` (`code`),
  UNIQUE KEY `code_7` (`code`),
  UNIQUE KEY `code_8` (`code`),
  UNIQUE KEY `code_9` (`code`),
  UNIQUE KEY `code_10` (`code`),
  UNIQUE KEY `code_11` (`code`),
  UNIQUE KEY `code_12` (`code`),
  UNIQUE KEY `code_13` (`code`),
  UNIQUE KEY `code_14` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `short_links`
--

LOCK TABLES `short_links` WRITE;
/*!40000 ALTER TABLE `short_links` DISABLE KEYS */;
INSERT INTO `short_links` VALUES (1,'h5ehZZRV','https://www.google.com/maps/dir/?api=1&origin=chennai&destination=t%20nagar&travelmode=driving&dir_action=navigate','2025-12-10 09:53:55',NULL,'e7b8a1c0-0000-0000-0000-000000000001'),(2,'endOyy4d','https://www.google.com/maps/dir/?api=1&origin=jhdjkhs&destination=bdjhn&travelmode=driving&dir_action=navigate','2025-12-17 11:09:53',NULL,'e7b8a1c0-0000-0000-0000-000000000001'),(3,'FokC9mGf','https://www.google.com/maps/dir/?api=1&origin=hujkkuj&destination=uyhuf&travelmode=driving&dir_action=navigate','2025-12-18 05:08:39',NULL,'e7b8a1c0-0000-0000-0000-000000000001'),(4,'lGQR1hl2','https://www.google.com/maps/dir/?api=1&origin=jnkkjbjh&destination=Chennai&travelmode=driving&dir_action=navigate','2025-12-18 05:24:41',NULL,'e7b8a1c0-0000-0000-0000-000000000001'),(5,'iqs9mwkb','https://www.google.com/maps/dir/?api=1&origin=huiehf&destination=jngdjkn&travelmode=driving&dir_action=navigate','2025-12-18 05:28:19',NULL,'e7b8a1c0-0000-0000-0000-000000000001'),(6,'PW335Rt','https://www.google.com/maps/dir/?api=1&origin=jnefjk&destination=nfjkengjk&travelmode=driving&dir_action=navigate','2025-12-18 07:10:25',NULL,'e7b8a1c0-0000-0000-0000-000000000001'),(7,'gv176lCh','https://www.google.com/maps/dir/?api=1&origin=jnjhnh&destination=hbnjhb&travelmode=driving&dir_action=navigate','2025-12-24 07:46:05',NULL,'e7b8a1c0-0000-0000-0000-000000000001'),(8,'Q0G1F4J','https://www.google.com/maps/dir/?api=1&origin=bhsfhb&destination=Coimbatore&travelmode=driving&dir_action=navigate','2025-12-24 07:53:02',NULL,'e7b8a1c0-0000-0000-0000-000000000001'),(9,'jzwFU2p','https://www.google.com/maps/dir/?api=1&origin=hbjhb&destination=Chennai&travelmode=driving&dir_action=navigate','2025-12-26 07:30:59',NULL,'e7b8a1c0-0000-0000-0000-000000000001'),(10,'DQiXMEGB','https://www.google.com/maps/dir/?api=1&origin=jhsdkfjhfndjkj&destination=jnfjk&travelmode=driving&dir_action=navigate','2025-12-26 11:38:51',NULL,'e7b8a1c0-0000-0000-0000-000000000001'),(11,'AFA9Fn1S','https://www.google.com/maps/dir/?api=1&origin=dkljb&destination=gjuir&travelmode=driving&dir_action=navigate','2026-01-08 07:12:35',NULL,'e7b8a1c0-0000-0000-0000-000000000001'),(12,'IBIZTFAo','https://www.google.com/maps/dir/?api=1&origin=bvhgv&destination=Coimbatore&travelmode=driving&dir_action=navigate','2026-01-12 09:58:13',NULL,'e7b8a1c0-0000-0000-0000-000000000001'),(13,'jm14ibYE','https://www.google.com/maps/dir/?api=1&origin=Kodampakkam&destination=Ballary&travelmode=driving&dir_action=navigate','2026-01-19 08:53:49',NULL,'e7b8a1c0-0000-0000-0000-000000000001'),(14,'PMS1FcpD','https://www.google.com/maps/dir/?api=1&origin=Kodampakkam&destination=Coimbatore&travelmode=driving&dir_action=navigate','2026-01-20 06:16:57',NULL,'e7b8a1c0-0000-0000-0000-000000000001'),(15,'pNxADvMB','https://www.google.com/maps/dir/?api=1&origin=bjhbj&destination=Coimbatore&travelmode=driving&dir_action=navigate','2026-01-21 09:11:12',NULL,'e7b8a1c0-0000-0000-0000-000000000001'),(16,'EgZVAXUo','https://www.google.com/maps/dir/?api=1&origin=dd&destination=jhgdhjjh&travelmode=driving&dir_action=navigate','2026-01-21 09:57:25',NULL,'e7b8a1c0-0000-0000-0000-000000000001'),(17,'aUluzXRL','https://www.google.com/maps/dir/?api=1&origin=kodampakkam&destination=porur&travelmode=driving&dir_action=navigate','2026-02-25 06:26:16',NULL,'e7b8a1c0-0000-0000-0000-000000000001'),(18,'jLeoCuft','https://www.google.com/maps/dir/?api=1&origin=wertyu&destination=ertyui&travelmode=driving&dir_action=navigate','2026-03-27 05:28:26',NULL,'e7b8a1c0-0000-0000-0000-000000000001'),(19,'lVsIPK3','https://www.google.com/maps/dir/?api=1&origin=kovai&destination=valparai&travelmode=driving&dir_action=navigate','2026-07-02 05:41:57',NULL,'e7b8a1c0-0000-0000-0000-000000000001'),(20,'4q8gvyfD','https://www.google.com/maps/dir/?api=1&origin=airport&destination=t%20nagar&travelmode=driving&dir_action=navigate','2026-10-16 09:37:15',NULL,'e7b8a1c0-0000-0000-0000-000000000001'),(21,'wCxQ3XJe','https://www.google.com/maps/dir/?api=1&origin=vandalur&destination=tambaram&travelmode=driving&dir_action=navigate','2026-10-17 04:21:31',NULL,'e7b8a1c0-0000-0000-0000-000000000001');
/*!40000 ALTER TABLE `short_links` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sms_logs`
--

DROP TABLE IF EXISTS `sms_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sms_logs` (
  `smsLogId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `bookingId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recipientType` enum('CUSTOMER','DRIVER') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipientId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phoneNumber` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `messageType` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `messageBody` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('SENT','FAILED','SKIPPED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SENT',
  `providerMessageId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `errorMessage` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `sentAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deliveryStatus` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `providerStatus` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'SUCCESS',
  `deliveredAt` datetime DEFAULT NULL,
  PRIMARY KEY (`smsLogId`),
  KEY `bookingId_idx` (`bookingId`),
  KEY `recipientType_idx` (`recipientType`),
  KEY `messageType_idx` (`messageType`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sms_logs`
--

LOCK TABLES `sms_logs` WRITE;
/*!40000 ALTER TABLE `sms_logs` DISABLE KEYS */;
INSERT INTO `sms_logs` VALUES ('00a46f7d-827b-46ca-b996-3bd14e9bd3d7','5b84be2d-0d95-45bc-87c9-29776c2dcfd2','CUSTOMER','fda73bba-549b-457e-bd3b-4a931839eb3a','8072336983','DRIVER_ASSIGNED_TO_CUSTOMER','EasyRide: Your driver has been assigned.\nBooking: 202608250007\nDriver: manju\nPhone: 7373869011\nVehicle: suv\nVehicle No: \nPickup: Guindy\nDrop: T. Nagar\nDate: 25 Aug 2026\nTime: 16:09:00','SENT','a309fabaaa38ff70-BOM',NULL,'2026-08-25 10:40:35','2026-08-25 10:40:35','PENDING','SUCCESS','2026-08-25 10:40:35'),('1397663a-f35d-496d-8cb9-df66ad779ee0','73d22f64-e902-45a4-b70b-d020b38b6d4c','DRIVER','8ced02a9-34dc-454d-8a21-29100cafa12a','7373869011','RIDE_ASSIGNED_TO_DRIVER','EasyRide: New ride assigned.\nBooking: 202608250004\nCustomer: Subisha\nPhone: 8072336983\nPickup: Guindy\nDrop: Chennai Central Railway Station\nDate: \nTime: 12:32:00\nVehicle: Tata\nVehicle No: TN 76 AB 1234','SENT','a308bc2968f585ee-BOM',NULL,'2026-08-25 07:03:06','2026-08-25 07:03:06','PENDING','SUCCESS','2026-08-25 07:03:06'),('15998675-8ea0-4c2b-93cd-44687e2891d0','73d22f64-e902-45a4-b70b-d020b38b6d4c','CUSTOMER','fda73bba-549b-457e-bd3b-4a931839eb3a','8072336983','DRIVER_ASSIGNED_TO_CUSTOMER','EasyRide: Your driver has been assigned.\nBooking: 202608250004\nDriver: manju\nPhone: 7373869011\nVehicle: Tata\nVehicle No: TN 76 AB 1234\nPickup: Guindy\nDrop: Chennai Central Railway Station\nDate: \nTime: 12:32:00','SENT','a308bc26afe485ee-BOM',NULL,'2026-08-25 07:03:06','2026-08-25 07:03:06','PENDING','SUCCESS','2026-08-25 07:03:06'),('1a7899f5-3a4e-4cb4-bbbb-1e33cd47e3bc','e80302a4-d75c-40e6-b136-40204670c291','DRIVER','8ced02a9-34dc-454d-8a21-29100cafa12a','7373869011','RIDE_ASSIGNED_TO_DRIVER','EasyRide – New Ride Assigned\n\nDear manju,\n\nYou have a new confirmed booking.\n\nBooking ID: 202608250009\n\nCustomer: Rams\nPhone: 8072336982\n\nPickup:\nOMR IT Corridor (Tidel Park)\n\nDrop:\nChennai Central Railway Station\n\nDate:\n25 Aug 2026\n\nTime:\n17:33:00\n\nVehicle:\nomni\n\nVehicle No:\nNot Added\n\nPlease pick up the customer on time.\n\nCall Customer:\n8072336982','SENT','a30a76e23e1c7ed0-MAA',NULL,'2026-08-25 12:05:20','2026-08-25 12:05:20','PENDING','SUCCESS','2026-08-25 12:05:20'),('1d9490d1-57ee-4ff0-a658-3a90643dbca4','57857724-8475-4c1a-acce-a9b48c584c0e','DRIVER','af20f37b-eb16-4739-915e-8b8d50003185','9994789683','RIDE_ASSIGNED_TO_DRIVER','EasyRide: New ride assigned.\nBooking: 202608240001\nCustomer: Rams\nPhone: 8072336982\nPickup: OMR IT Corridor (Tidel Park)\nDrop: T. Nagar\nDate: Mon Aug 24 2026 16:45:00 GM\nTime: 11:15:00\nVehicle: Xuv\nVehicle No: TN 76 AB 1234','SENT','Missing TemplateName value',NULL,'2026-08-25 06:48:22','2026-08-25 06:48:22','PENDING','SUCCESS',NULL),('1dc2a10d-52e0-46a2-a45f-044684bfada9','57857724-8475-4c1a-acce-a9b48c584c0e','CUSTOMER','3e7362b5-d731-4775-99bd-1a8118e6d0d4','8072336982','DRIVER_ASSIGNED_TO_CUSTOMER','EasyRide: Your driver has been assigned.\nBooking: 202608240001\nDriver: Rams\nPhone: 9994789683\nVehicle: Xuv\nVehicle No: TN 76 AB 1234\nPickup: OMR IT Corridor (Tidel Park)\nDrop: T. Nagar\nDate: Mon Aug 24 2026 16:45:00 GM\nTime: 11:15:00','SENT','Missing TemplateName value',NULL,'2026-08-25 06:48:21','2026-08-25 06:48:21','PENDING','SUCCESS',NULL),('24148914-6ac1-48c5-8245-562720e0fbad','7298d5e7-2553-493d-8a66-0dcfbd2e3afc','CUSTOMER',NULL,'8072336983','DRIVER_ASSIGNED_TO_CUSTOMER','EasyRide: Your driver has been assigned.\nBooking: 202608250008\nDriver: Ramesh TestChauffeur\nPhone: 9876500001\nVehicle: kutty cycle \nVehicle No: MP 343536\nPickup: Chennai Central Railway Station\nDrop: OMR IT Corridor (Tidel Park)\nDate: 25 Aug 2026\nTime: 17:15:00','SENT','a3110eb57a8b17a2-MAA',NULL,'2026-08-26 07:17:33','2026-08-26 07:17:33','PENDING','SUCCESS','2026-08-26 07:17:33'),('264cc9d2-4506-45e4-83f1-6be8b66e5b8a','5b292962-60a8-404a-a293-4ee32c04e3c4','CUSTOMER','3e7362b5-d731-4775-99bd-1a8118e6d0d4','8072336983','DRIVER_ASSIGNED_TO_CUSTOMER','EasyRide: Your driver has been assigned.\nBooking: 202608260003\nDriver: manju\nPhone: 7373869011\nVehicle: Swift\nVehicle No: TN 72 MR 0711\nPickup: Chennai Central Railway Station\nDrop: T. Nagar\nDate: 26 Aug 2026\nTime: 11:18:00','SENT','a3108f88685217a2-MAA',NULL,'2026-08-26 05:50:43','2026-08-26 05:50:43','PENDING','SUCCESS','2026-08-26 05:50:43'),('348b3fb9-eb87-4328-b875-b751ac73dd24','15841046-1594-4c19-abe3-d9d4f65146ba','CUSTOMER','8c25e535-173f-4b14-bc04-9e80c997ba42','7373869011','DRIVER_ASSIGNED_TO_CUSTOMER','EasyRide: Your driver has been assigned.\nBooking: 202608260002\nDriver: subi\nPhone: 8790678756\nVehicle: Swift\nVehicle No: TN 72 MR 0711\nPickup: Koyambedu CMBT\nDrop: Guindy\nDate: 26 Aug 2026\nTime: 16:10:00','SENT','a310819688924e78-BOM',NULL,'2026-08-26 05:41:12','2026-08-26 05:41:12','PENDING','SUCCESS','2026-08-26 05:41:12'),('4d3e5a25-b1e4-4ff6-ad30-cb65cc109416','030ca80f-b18e-4303-a0cd-d7fd6464b0e7','CUSTOMER','8c25e535-173f-4b14-bc04-9e80c997ba42','7373869011','DRIVER_ASSIGNED_TO_CUSTOMER','EasyRide: Your driver has been assigned.\nBooking: 202608250001\nDriver: manju\nPhone: 7373869011\nVehicle: Toyoto\nVehicle No: TN 76 AB 1234\nPickup: OMR IT Corridor (Tidel Park)\nDrop: Chennai Airport (MAA)\nDate: \nTime: 17:00:00','SENT','Missing TemplateName value',NULL,'2026-08-25 06:18:41','2026-08-25 06:18:41','PENDING','SUCCESS',NULL),('5e6af927-b0f7-4d80-bdd5-55c0050dc255','e80302a4-d75c-40e6-b136-40204670c291','CUSTOMER','3e7362b5-d731-4775-99bd-1a8118e6d0d4','8072336982','DRIVER_ASSIGNED_TO_CUSTOMER','EasyRide: Your driver has been assigned.\nBooking: 202608250009\nDriver: manju\nPhone: 7373869011\nVehicle: omni\nVehicle No: Not Added\nPickup: OMR IT Corridor (Tidel Park)\nDrop: Chennai Central Railway Station\nDate: 25 Aug 2026\nTime: 17:33:00','SENT','a30a76debcd87ed0-MAA',NULL,'2026-08-25 12:05:20','2026-08-25 12:05:20','PENDING','SUCCESS','2026-08-25 12:05:20'),('5f8cd32d-1015-4fe3-878c-a4bc84a69db7','199552f3-3149-44c7-baa4-bef238abd0a3','DRIVER','70a45c3b-a0f5-42f0-83bb-2e3925603085','9080280818','RIDE_ASSIGNED_TO_DRIVER','EasyRide – New Ride Assigned\n\nDear Subisha,\n\nYou have a new confirmed booking.\n\nBooking ID: 202608260005\n\nCustomer: Rams\nPhone: 8072336983\n\nPickup:\nOMR IT Corridor (Tidel Park)\n\nDrop:\nAnna Nagar\n\nDate:\n26 Aug 2026\n\nTime:\n16:14:00\n\nVehicle:\nSwift\n\nVehicle No:\nTN 72 MR 0711\n\nPlease pick up the customer on time.\n\nCall Customer:\n8072336983','SENT','a31241733c644e78-MAA',NULL,'2026-08-26 10:46:56','2026-08-26 10:46:56','PENDING','SUCCESS','2026-08-26 10:46:56'),('807c2078-3684-4c03-bedf-22573e627ad7','b7796f97-70ee-4425-8d50-bdc8b52d6501','CUSTOMER','3e7362b5-d731-4775-99bd-1a8118e6d0d4','8072336983','DRIVER_ASSIGNED_TO_CUSTOMER','EasyRide: Your driver has been assigned.\nBooking: 202608260004\nDriver: manju\nPhone: 7373869011\nVehicle: Swift\nVehicle No: TN 72 MR 0711\nPickup: T. Nagar\nDrop: Chennai Central Railway Station\nDate: 26 Aug 2026\nTime: 12:03:00','SENT','a310e7c83a3d7ed0-MAA',NULL,'2026-08-26 06:50:58','2026-08-26 06:50:58','PENDING','SUCCESS','2026-08-26 06:50:58'),('8282aa01-578e-4641-8879-89d8b3102938','1cbdea97-eff8-40d5-93db-2962d6ee23d2','DRIVER','af20f37b-eb16-4739-915e-8b8d50003185','9994789683','RIDE_ASSIGNED_TO_DRIVER','EasyRide – New Ride Assigned\n\nDear Rams,\n\nYou have a new confirmed booking.\n\nBooking ID: 202608260001\n\nCustomer: Manju\nPhone: 7373869011\n\nPickup:\nChennai Central Railway Station\n\nDrop:\nT. Nagar\n\nDate:\n27 Aug 2026\n\nTime:\n19:00:00\n\nVehicle:\nomni\n\nVehicle No:\nTN 55 MC 0714\n\nPlease pick up the customer on time.\n\nCall Customer:\n7373869011','SENT','a310730f0b3117a2-MAA',NULL,'2026-08-26 05:31:17','2026-08-26 05:31:17','PENDING','SUCCESS','2026-08-26 05:31:17'),('83981c7b-e066-4b92-b6a4-707ffc6c664c','5b292962-60a8-404a-a293-4ee32c04e3c4','DRIVER','8ced02a9-34dc-454d-8a21-29100cafa12a','7373869011','RIDE_ASSIGNED_TO_DRIVER','EasyRide – New Ride Assigned\n\nDear manju,\n\nYou have a new confirmed booking.\n\nBooking ID: 202608260003\n\nCustomer: Rams\nPhone: 8072336983\n\nPickup:\nChennai Central Railway Station\n\nDrop:\nT. Nagar\n\nDate:\n26 Aug 2026\n\nTime:\n11:18:00\n\nVehicle:\nSwift\n\nVehicle No:\nTN 72 MR 0711\n\nPlease pick up the customer on time.\n\nCall Customer:\n8072336983','SENT','a3108f8b394217a2-MAA',NULL,'2026-08-26 05:50:44','2026-08-26 05:50:44','PENDING','SUCCESS','2026-08-26 05:50:44'),('8c2e8a6d-1b5a-43b0-9891-69d6062ac5b6','b7796f97-70ee-4425-8d50-bdc8b52d6501','DRIVER','8ced02a9-34dc-454d-8a21-29100cafa12a','7373869011','RIDE_ASSIGNED_TO_DRIVER','EasyRide – New Ride Assigned\n\nDear manju,\n\nYou have a new confirmed booking.\n\nBooking ID: 202608260004\n\nCustomer: Rams\nPhone: 8072336983\n\nPickup:\nT. Nagar\n\nDrop:\nChennai Central Railway Station\n\nDate:\n26 Aug 2026\n\nTime:\n12:03:00\n\nVehicle:\nSwift\n\nVehicle No:\nTN 72 MR 0711\n\nPlease pick up the customer on time.\n\nCall Customer:\n8072336983','SENT','a310e7cb0b967ed0-MAA',NULL,'2026-08-26 06:50:58','2026-08-26 06:50:58','PENDING','SUCCESS','2026-08-26 06:50:58'),('b13e697c-b437-408a-817f-79795b94c5fb','199552f3-3149-44c7-baa4-bef238abd0a3','CUSTOMER','3e7362b5-d731-4775-99bd-1a8118e6d0d4','8072336983','DRIVER_ASSIGNED_TO_CUSTOMER','EasyRide: Your driver has been assigned.\nBooking: 202608260005\nDriver: Subisha\nPhone: 9080280818\nVehicle: Swift\nVehicle No: TN 72 MR 0711\nPickup: OMR IT Corridor (Tidel Park)\nDrop: Anna Nagar\nDate: 26 Aug 2026\nTime: 16:14:00','SENT','a312416ffb394e78-MAA',NULL,'2026-08-26 10:46:56','2026-08-26 10:46:56','PENDING','SUCCESS','2026-08-26 10:46:56'),('b5a64ed6-223e-4b38-a190-bb366e42f28c','600f3edf-e1a3-411e-86d7-cf97014b48ac','DRIVER','8ced02a9-34dc-454d-8a21-29100cafa12a','7373869011','RIDE_ASSIGNED_TO_DRIVER','EasyRide – New Ride Assigned\n\nDear manju,\n\nYou have a new confirmed booking.\n\nBooking ID: 202608250005\n\nCustomer: Subisha\nPhone: 8072336983\n\nPickup:\nOMR IT Corridor (Tidel Park)\n\nDrop:\nChennai Central Railway Station\n\nDate:\n25 Aug 2026\n\nTime:\n15:25:00\n\nVehicle:\nsuv\n\nVehicle No:\nTN 76 AB 1234\n\nPlease pick up the customer on time.\n\nCall Customer:\n8072336983','SENT','a309bbb36bf9c0d9-BOM',NULL,'2026-08-25 09:57:33','2026-08-25 09:57:33','PENDING','SUCCESS','2026-08-25 09:57:33'),('b63a6ac9-b14b-49f9-9523-e9f66ba09ee7','b40e03b1-07e9-492c-a6ba-8d3ecb220bf1','CUSTOMER','fda73bba-549b-457e-bd3b-4a931839eb3a','8072336983','DRIVER_ASSIGNED_TO_CUSTOMER','EasyRide: Your driver has been assigned.\nBooking: 202608250002\nDriver: Rams\nPhone: 9994789683\nVehicle: mahintra1\nVehicle No: TN 76 AB 1234\nPickup: T. Nagar\nDrop: Koyambedu CMBT\nDate: \nTime: 11:52:00','SENT','Missing TemplateName value',NULL,'2026-08-25 06:26:01','2026-08-25 06:26:01','PENDING','SUCCESS',NULL),('bf4f43eb-6b33-44be-9ea5-b9e303ec3bbd','030ca80f-b18e-4303-a0cd-d7fd6464b0e7','DRIVER','8ced02a9-34dc-454d-8a21-29100cafa12a','7373869011','RIDE_ASSIGNED_TO_DRIVER','EasyRide: New ride assigned.\nBooking: 202608250001\nCustomer: Manju\nPhone: 7373869011\nPickup: OMR IT Corridor (Tidel Park)\nDrop: Chennai Airport (MAA)\nDate: \nTime: 17:00:00\nVehicle: Toyoto\nVehicle No: TN 76 AB 1234','SENT','Missing TemplateName value',NULL,'2026-08-25 06:18:41','2026-08-25 06:18:41','PENDING','SUCCESS',NULL),('c0f323e7-6b02-4ab1-b7d1-0d145e06cbf1','2dc93167-2a87-48f8-a661-bed51ce280af','CUSTOMER','fda73bba-549b-457e-bd3b-4a931839eb3a','8072336983','DRIVER_ASSIGNED_TO_CUSTOMER','EasyRide: Your driver has been assigned.\nBooking: 202608250003\nDriver: manju\nPhone: 7373869011\nVehicle: Sedan\nVehicle No: TN76AB1234\nPickup: T. Nagar\nDrop: Tambaram\nDate: 25 Aug 2026\nTime: 12:06:00','SENT','a308da6848b1ff70-BOM',NULL,'2026-08-25 07:23:45','2026-08-25 07:23:45','PENDING','SUCCESS','2026-08-25 07:23:45'),('c785cd97-5f27-4773-a9c3-9c6e720ef213','7298d5e7-2553-493d-8a66-0dcfbd2e3afc','DRIVER','2affc55a-16d8-4ab9-b9d6-cdb7b60753e5','9876500001','RIDE_ASSIGNED_TO_DRIVER','EasyRide – New Ride Assigned\n\nDear Ramesh TestChauffeur,\n\nYou have a new confirmed booking.\n\nBooking ID: 202608250008\n\nCustomer: Subisha\nPhone: 8072336983\n\nPickup:\nChennai Central Railway Station\n\nDrop:\nOMR IT Corridor (Tidel Park)\n\nDate:\n25 Aug 2026\n\nTime:\n17:15:00\n\nVehicle:\nkutty cycle \n\nVehicle No:\nMP 343536\n\nPlease pick up the customer on time.\n\nCall Customer:\n8072336983','SENT','a3110eb95c2b17a2-MAA',NULL,'2026-08-26 07:17:33','2026-08-26 07:17:33','PENDING','SUCCESS','2026-08-26 07:17:33'),('dcc2d3f1-6542-4a9a-9f8c-10be61727b48','1cbdea97-eff8-40d5-93db-2962d6ee23d2','CUSTOMER','8c25e535-173f-4b14-bc04-9e80c997ba42','7373869011','DRIVER_ASSIGNED_TO_CUSTOMER','EasyRide: Your driver has been assigned.\nBooking: 202608260001\nDriver: Rams\nPhone: 9994789683\nVehicle: omni\nVehicle No: TN 55 MC 0714\nPickup: Chennai Central Railway Station\nDrop: T. Nagar\nDate: 27 Aug 2026\nTime: 19:00:00','SENT','a310730be9f117a2-MAA',NULL,'2026-08-26 05:31:17','2026-08-26 05:31:17','PENDING','SUCCESS','2026-08-26 05:31:17'),('e28d1381-2704-44c1-8528-fd3003fcf69c','564fc417-e78e-419a-a449-10d3aafe35c4','CUSTOMER','fda73bba-549b-457e-bd3b-4a931839eb3a','8072336983','DRIVER_ASSIGNED_TO_CUSTOMER','EasyRide: Your driver has been assigned.\nBooking: 202608250006\nDriver: Rams\nPhone: 9994789683\nVehicle: Police Cars\nVehicle No: TN 76 AB 1234\nPickup: Chennai Airport (MAA)\nDrop: T. Nagar\nDate: 25 Aug 2026\nTime: 15:46:00','SENT','a309d9213af07ed0-MAA',NULL,'2026-08-25 10:17:39','2026-08-25 10:17:39','PENDING','SUCCESS','2026-08-25 10:17:39'),('e6fc5aea-1b77-4596-b978-33db89c8bf2f','15841046-1594-4c19-abe3-d9d4f65146ba','DRIVER','00f6a2a2-a4f6-4d92-97a0-ec47d5563a20','8790678756','RIDE_ASSIGNED_TO_DRIVER','EasyRide – New Ride Assigned\n\nDear subi,\n\nYou have a new confirmed booking.\n\nBooking ID: 202608260002\n\nCustomer: Manju\nPhone: 7373869011\n\nPickup:\nKoyambedu CMBT\n\nDrop:\nGuindy\n\nDate:\n26 Aug 2026\n\nTime:\n16:10:00\n\nVehicle:\nSwift\n\nVehicle No:\nTN 72 MR 0711\n\nPlease pick up the customer on time.\n\nCall Customer:\n7373869011','SENT','a3108199bb4b4e78-BOM',NULL,'2026-08-26 05:41:13','2026-08-26 05:41:13','PENDING','SUCCESS','2026-08-26 05:41:13'),('e92c679f-1c2d-4320-8432-5ec9d0fa44e9','5b84be2d-0d95-45bc-87c9-29776c2dcfd2','DRIVER','8ced02a9-34dc-454d-8a21-29100cafa12a','7373869011','RIDE_ASSIGNED_TO_DRIVER','EasyRide – New Ride Assigned\n\nDear manju,\n\nYou have a new confirmed booking.\n\nBooking ID: 202608250007\n\nCustomer: Subisha\nPhone: 8072336983\n\nPickup:\nGuindy\n\nDrop:\nT. Nagar\n\nDate:\n25 Aug 2026\n\nTime:\n16:09:00\n\nVehicle:\nsuv\n\nVehicle No:\n\n\nPlease pick up the customer on time.\n\nCall Customer:\n8072336983','SENT','a309fabc6bacff70-BOM',NULL,'2026-08-25 10:40:35','2026-08-25 10:40:35','PENDING','SUCCESS','2026-08-25 10:40:35'),('f037b364-a401-4855-a65d-6c8a60057c67','2dc93167-2a87-48f8-a661-bed51ce280af','DRIVER','8ced02a9-34dc-454d-8a21-29100cafa12a','7373869011','RIDE_ASSIGNED_TO_DRIVER','EasyRide – New Ride Assigned\n\nDear manju,\n\nYou have a new confirmed booking.\n\nBooking ID: 202608250003\n\nCustomer: Subisha\nPhone: 8072336983\n\nPickup:\nT. Nagar\n\nDrop:\nTambaram\n\nDate:\n25 Aug 2026\n\nTime:\n12:06:00\n\nVehicle:\nSedan\n\nVehicle No:\nTN76AB1234\n\nPlease pick up the customer on time.\n\nCall Customer:\n8072336983','SENT','a308da6aeb42ff70-BOM',NULL,'2026-08-25 07:23:46','2026-08-25 07:23:46','PENDING','SUCCESS','2026-08-25 07:23:46'),('f62792a9-df30-4df7-8d41-f687c58c2e9a','b40e03b1-07e9-492c-a6ba-8d3ecb220bf1','DRIVER','af20f37b-eb16-4739-915e-8b8d50003185','9994789683','RIDE_ASSIGNED_TO_DRIVER','EasyRide: New ride assigned.\nBooking: 202608250002\nCustomer: Subisha\nPhone: 8072336983\nPickup: T. Nagar\nDrop: Koyambedu CMBT\nDate: \nTime: 11:52:00\nVehicle: mahintra1\nVehicle No: TN 76 AB 1234','SENT','Missing TemplateName value',NULL,'2026-08-25 06:26:01','2026-08-25 06:26:01','PENDING','SUCCESS',NULL),('f6d76cda-398d-48b6-868d-f2ecae31bc67','564fc417-e78e-419a-a449-10d3aafe35c4','DRIVER','af20f37b-eb16-4739-915e-8b8d50003185','9994789683','RIDE_ASSIGNED_TO_DRIVER','EasyRide – New Ride Assigned\n\nDear Rams,\n\nYou have a new confirmed booking.\n\nBooking ID: 202608250006\n\nCustomer: Subisha\nPhone: 8072336983\n\nPickup:\nChennai Airport (MAA)\n\nDrop:\nT. Nagar\n\nDate:\n25 Aug 2026\n\nTime:\n15:46:00\n\nVehicle:\nPolice Cars\n\nVehicle No:\nTN 76 AB 1234\n\nPlease pick up the customer on time.\n\nCall Customer:\n8072336983','SENT','a309d9249bfb7ed0-MAA',NULL,'2026-08-25 10:17:39','2026-08-25 10:17:39','PENDING','SUCCESS','2026-08-25 10:17:39'),('fde40d98-51f2-41a7-878f-0ee134adf538','600f3edf-e1a3-411e-86d7-cf97014b48ac','CUSTOMER','fda73bba-549b-457e-bd3b-4a931839eb3a','8072336983','DRIVER_ASSIGNED_TO_CUSTOMER','EasyRide: Your driver has been assigned.\nBooking: 202608250005\nDriver: manju\nPhone: 7373869011\nVehicle: suv\nVehicle No: TN 76 AB 1234\nPickup: OMR IT Corridor (Tidel Park)\nDrop: Chennai Central Railway Station\nDate: 25 Aug 2026\nTime: 15:25:00','SENT','a309bbb1696bc0d9-BOM',NULL,'2026-08-25 09:57:33','2026-08-25 09:57:33','PENDING','SUCCESS','2026-08-25 09:57:33');
/*!40000 ALTER TABLE `sms_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sms_templates`
--

DROP TABLE IF EXISTS `sms_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sms_templates` (
  `smsTemplateId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `templateCode` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `senderId` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'GRCCAB',
  `tenantId` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT 'e7b8a1c0-0000-0000-0000-000000000001',
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`smsTemplateId`),
  KEY `idx_sms_template_tenant_code` (`tenantId`,`templateCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sms_templates`
--

LOCK TABLES `sms_templates` WRITE;
/*!40000 ALTER TABLE `sms_templates` DISABLE KEYS */;
INSERT INTO `sms_templates` VALUES ('11111111-0000-0000-0000-000000000001','Booking Creation Confirmation','BOOKING_CREATION','Dear ###CustomerName###, your booking ###BookingNumber### with ###FleetName### has been confirmed for ###BookingDate###. Thank you!','GRCCAB','e7b8a1c0-0000-0000-0000-000000000001',1,'2026-10-24 05:46:44','2026-10-24 05:46:44'),('11111111-0000-0000-0000-000000000002','Driver Assigned - Customer Alert','DRIVER_ASSIGNED_TO_CUSTOMER','###FleetName### Alert: Driver ###DriverName### (Mob: ###DriverPhone###) assigned for booking ###BookingNumber###. Vehicle: ###VehicleNumber###. Track: ###TrackingLink###','GRCCAB','e7b8a1c0-0000-0000-0000-000000000001',1,'2026-10-24 05:46:44','2026-10-24 05:46:44'),('11111111-0000-0000-0000-000000000003','Driver Assignment Notification','DRIVER_ASSIGNED_TO_DRIVER','###FleetName### Duty Alert: You have been assigned trip ###BookingNumber###. Customer: ###CustomerName### (###CustomerPhone###). Pickup: ###PickupPoint### at ###BookingDate###.','GRCCAB','e7b8a1c0-0000-0000-0000-000000000001',1,'2026-10-24 05:46:44','2026-10-24 05:46:44'),('11111111-0000-0000-0000-000000000004','Driver Welcome Message','DRIVER_WELCOME_SMS','Welcome to ###FleetName###, ###DriverName###! Your driver account is active. Mobile: ###DriverPhone###. Drive safely!','GRCCAB','e7b8a1c0-0000-0000-0000-000000000001',1,'2026-10-24 05:46:44','2026-10-24 05:46:44'),('11111111-0000-0000-0000-000000000005','Customer OTP Verification','CUSTOMER_OTP_SMS','Your verification OTP for ###FleetName### is ###OTP###. Valid for 10 minutes. Do not share this with anyone.','GRCCAB','e7b8a1c0-0000-0000-0000-000000000001',1,'2026-10-24 05:46:44','2026-10-24 05:46:44'),('11111111-0000-0000-0000-000000000006','Invoice Generated Notification','INVOICE_GENERATED_SMS','Dear ###CustomerName###, invoice ###InvoiceNumber### for trip ###BookingNumber### is generated. Amount: Rs. ###TotalAmount###. View: ###InvoiceLink###. ###FleetName###','GRCCAB','e7b8a1c0-0000-0000-0000-000000000001',1,'2026-10-24 05:46:44','2026-10-24 05:46:44'),('cd0d0e84-2a1e-42b0-900c-8c7bbea7a411','Booking Creation Confirmation','BOOKING_CREATION','Alpha Cabs: Trip ###BookingCode### booked! Thank you ###CustomerName###.','GRCCAB','a1a1a1a1-1111-4111-a111-111111111111',1,'2026-10-24 06:28:41','2026-10-24 06:28:41');
/*!40000 ALTER TABLE `sms_templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscription_invoices`
--

DROP TABLE IF EXISTS `subscription_invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscription_invoices` (
  `subscriptionInvoiceId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `tenantId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `subscriptionId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `invoiceNumber` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `planTier` enum('BASIC','PRO','ENTERPRISE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `billingCycle` enum('MONTHLY','ANNUAL') COLLATE utf8mb4_unicode_ci NOT NULL,
  `baseAmount` decimal(10,2) NOT NULL,
  `taxRate` decimal(5,2) NOT NULL DEFAULT '18.00',
  `taxAmount` decimal(10,2) NOT NULL,
  `totalAmount` decimal(10,2) NOT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'INR',
  `paymentStatus` enum('PENDING','PAID','FAILED','REFUNDED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `paymentMethod` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transactionReference` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `billingPeriodStart` datetime NOT NULL,
  `billingPeriodEnd` datetime NOT NULL,
  `paidAt` datetime DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`subscriptionInvoiceId`),
  UNIQUE KEY `invoiceNumber` (`invoiceNumber`),
  UNIQUE KEY `idx_subinv_number` (`invoiceNumber`),
  KEY `subscriptionId` (`subscriptionId`),
  KEY `idx_subinv_tenant` (`tenantId`),
  KEY `idx_subinv_status` (`paymentStatus`),
  CONSTRAINT `subscription_invoices_ibfk_1` FOREIGN KEY (`tenantId`) REFERENCES `tenants` (`tenantId`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `subscription_invoices_ibfk_2` FOREIGN KEY (`subscriptionId`) REFERENCES `tenant_subscriptions` (`subscriptionId`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscription_invoices`
--

LOCK TABLES `subscription_invoices` WRITE;
/*!40000 ALTER TABLE `subscription_invoices` DISABLE KEYS */;
/*!40000 ALTER TABLE `subscription_invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tax`
--

DROP TABLE IF EXISTS `tax`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tax` (
  `taxId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `taxName` varchar(255) DEFAULT NULL,
  `taxPercent` double DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT NULL,
  `tenantId` varchar(36) DEFAULT 'e7b8a1c0-0000-0000-0000-000000000001',
  `createdAt` datetime NOT NULL,
  PRIMARY KEY (`taxId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tax`
--

LOCK TABLES `tax` WRITE;
/*!40000 ALTER TABLE `tax` DISABLE KEYS */;
INSERT INTO `tax` VALUES ('0439af49-8cb1-4ead-b7be-9c1cf77990dd','CGST',2.5,1,'e7b8a1c0-0000-0000-0000-000000000001','2026-10-16 07:13:25'),('bc9174f3-78ec-4ac5-a88d-f13264f2b405','Alpha GST 5% - 1792992933444',NULL,NULL,'a1a1a1a1-1111-4111-a111-111111111111','2026-10-26 05:35:33'),('c9ac79f5-aae5-48d1-b69b-dddf0485be61','Beta GST 12% - 1792992933461',NULL,NULL,'tenant-test-beta','2026-10-26 05:35:33');
/*!40000 ALTER TABLE `tax` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenant_activation_tokens`
--

DROP TABLE IF EXISTS `tenant_activation_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenant_activation_tokens` (
  `tokenId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `tenantId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `adminEmail` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `adminName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tokenHash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiresAt` datetime NOT NULL,
  `usedAt` datetime DEFAULT NULL,
  `isRevoked` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`tokenId`),
  UNIQUE KEY `tokenHash` (`tokenHash`),
  UNIQUE KEY `idx_act_token_hash` (`tokenHash`),
  KEY `idx_act_tenant` (`tenantId`),
  KEY `idx_act_email` (`adminEmail`),
  CONSTRAINT `tenant_activation_tokens_ibfk_1` FOREIGN KEY (`tenantId`) REFERENCES `tenants` (`tenantId`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_activation_tokens`
--

LOCK TABLES `tenant_activation_tokens` WRITE;
/*!40000 ALTER TABLE `tenant_activation_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `tenant_activation_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenant_registration_requests`
--

DROP TABLE IF EXISTS `tenant_registration_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenant_registration_requests` (
  `requestId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `fleetName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `legalName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `displayName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `registeredAddress` text COLLATE utf8mb4_unicode_ci,
  `gstin` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `panNumber` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sacCode` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT '996609',
  `website` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `businessEmail` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `businessPhone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `billingFooterText` text COLLATE utf8mb4_unicode_ci,
  `businessCode` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ownerName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contactEmail` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contactPhone` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `state` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pinCode` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logoUrl` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `requestedPlanTier` enum('BASIC','PRO','ENTERPRISE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PRO',
  `billingCycle` enum('MONTHLY','ANNUAL') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MONTHLY',
  `fleetSize` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `rejectionReason` text COLLATE utf8mb4_unicode_ci,
  `reviewNotes` text COLLATE utf8mb4_unicode_ci,
  `reviewedBy` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `reviewedAt` datetime DEFAULT NULL,
  `tenantId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `termsConsent` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `isNotificationRead` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`requestId`),
  KEY `idx_reg_status` (`status`),
  KEY `idx_reg_email` (`contactEmail`),
  KEY `idx_reg_code` (`businessCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_registration_requests`
--

LOCK TABLES `tenant_registration_requests` WRITE;
/*!40000 ALTER TABLE `tenant_registration_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `tenant_registration_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenant_subscriptions`
--

DROP TABLE IF EXISTS `tenant_subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenant_subscriptions` (
  `subscriptionId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `tenantId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `planTier` enum('BASIC','PRO','ENTERPRISE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PRO',
  `status` enum('TRIALING','ACTIVE','PAST_DUE','SUSPENDED','CANCELED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `vehicleQuota` int NOT NULL DEFAULT '75',
  `driverQuota` int NOT NULL DEFAULT '75',
  `companyQuota` int NOT NULL DEFAULT '20',
  `monthlyTripQuota` int NOT NULL DEFAULT '10000',
  `allowOverage` tinyint(1) NOT NULL DEFAULT '1',
  `monthlyOverageSpendCap` double NOT NULL DEFAULT '1000',
  `currentPeriodStart` datetime DEFAULT NULL,
  `currentPeriodEnd` datetime DEFAULT NULL,
  `trialEndsAt` datetime DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `billingCycle` enum('MONTHLY','ANNUAL') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MONTHLY',
  `agreedPrice` decimal(10,2) DEFAULT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'INR',
  `lastPaymentDate` datetime DEFAULT NULL,
  `lastPaymentAmount` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`subscriptionId`),
  KEY `tenantId` (`tenantId`),
  CONSTRAINT `tenant_subscriptions_ibfk_1` FOREIGN KEY (`tenantId`) REFERENCES `tenants` (`tenantId`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_subscriptions`
--

LOCK TABLES `tenant_subscriptions` WRITE;
/*!40000 ALTER TABLE `tenant_subscriptions` DISABLE KEYS */;
INSERT INTO `tenant_subscriptions` VALUES ('0f3c1df0-2d48-41f3-a675-6db7d9f36393','a1a1a1a1-1111-4111-a111-111111111111','BASIC','ACTIVE',15,15,3,1000,0,2000,'2026-10-26 05:35:33','2026-11-25 05:35:33',NULL,'2026-10-26 05:35:33','2026-10-26 05:35:33','MONTHLY',299.00,'INR',NULL,NULL),('24a88e81-4f5d-4f76-8514-01bd209c72c0','e7b8a1c0-0000-0000-0000-000000000001','ENTERPRISE','ACTIVE',999999,999999,999999,999999,1,1000,NULL,NULL,NULL,'2026-10-20 09:47:22','2026-10-20 09:47:22','MONTHLY',NULL,'INR',NULL,NULL),('3fca0869-3786-4574-965e-970a853f56d9','tenant-test-beta','BASIC','ACTIVE',15,15,3,1000,0,2000,'2026-10-26 05:35:44','2026-11-25 05:35:44',NULL,'2026-10-26 05:35:44','2026-10-26 05:35:44','MONTHLY',299.00,'INR',NULL,NULL),('d4ba53a2-6046-4e7c-ac67-76476e1968ce','tenant-test-alpha','BASIC','ACTIVE',15,15,3,1000,0,2000,'2026-10-26 05:28:58','2026-11-25 05:28:58',NULL,'2026-10-26 05:28:58','2026-10-26 05:28:58','MONTHLY',299.00,'INR',NULL,NULL);
/*!40000 ALTER TABLE `tenant_subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenant_usage_meters`
--

DROP TABLE IF EXISTS `tenant_usage_meters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenant_usage_meters` (
  `meterId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `tenantId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `billingMonth` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `metricName` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` bigint NOT NULL DEFAULT '0',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`meterId`),
  KEY `tenantId` (`tenantId`),
  CONSTRAINT `tenant_usage_meters_ibfk_1` FOREIGN KEY (`tenantId`) REFERENCES `tenants` (`tenantId`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_usage_meters`
--

LOCK TABLES `tenant_usage_meters` WRITE;
/*!40000 ALTER TABLE `tenant_usage_meters` DISABLE KEYS */;
/*!40000 ALTER TABLE `tenant_usage_meters` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenants`
--

DROP TABLE IF EXISTS `tenants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenants` (
  `tenantId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `legalName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `displayName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `registeredAddress` text COLLATE utf8mb4_unicode_ci,
  `gstin` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `panNumber` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sacCode` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT '996609',
  `website` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `businessEmail` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `businessPhone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `billingFooterText` text COLLATE utf8mb4_unicode_ci,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pinCode` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logoUrl` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subdomain` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customDomain` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('TRIALING','ACTIVE','PAST_DUE','SUSPENDED','CANCELED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `planTier` enum('BASIC','PRO','ENTERPRISE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PRO',
  `contactEmail` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contactPhone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `brandingTokens` json DEFAULT NULL,
  `isDeleted` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`tenantId`),
  UNIQUE KEY `code` (`code`),
  UNIQUE KEY `subdomain` (`subdomain`),
  UNIQUE KEY `customDomain` (`customDomain`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenants`
--

LOCK TABLES `tenants` WRITE;
/*!40000 ALTER TABLE `tenants` DISABLE KEYS */;
INSERT INTO `tenants` VALUES ('a1a1a1a1-1111-4111-a111-111111111111','Alpha Fleet Logistics',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'ALPHA',NULL,NULL,'ACTIVE','PRO','admin@alphafleet.com','9876543210',NULL,0,'2026-10-26 05:34:18','2026-10-26 05:34:18'),('e7b8a1c0-0000-0000-0000-000000000001','Grace Cabs Fleet Operations',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'GC','gracecabs',NULL,'ACTIVE','ENTERPRISE','admin@gracecabs.com',NULL,'{\"portalTitle\": \"Grace Cabs SaaS Platform\", \"primaryColor\": \"#275981\", \"secondaryColor\": \"#1d4260\"}',0,'2026-10-20 09:47:22','2026-10-20 09:47:22'),('tenant-test-alpha','Alpha Mobility Services','Alpha Mobility Services Pvt Ltd','Alpha Cabs','Suite 101, Alpha Towers, Anna Salai, Chennai, TN - 600002','33AAACA1111A1Z1','AAACA1111A','996609','https://alphamobility.co.in','billing@alphamobility.co.in','9876500001','Alpha Mobility Services: 24x7 Enterprise Logistics. Disputes subject to Chennai jurisdiction.','Chennai','Tamil Nadu','600002','data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"160\" height=\"40\"><rect width=\"160\" height=\"40\" fill=\"%230052cc\"/><text x=\"10\" y=\"25\" fill=\"white\" font-weight=\"bold\">ALPHA FLEET</text></svg>','ALPH','alpha',NULL,'ACTIVE','PRO','admin@alphamobility.co.in','9876500001',NULL,0,'2026-10-24 10:58:32','2026-10-24 10:58:32'),('tenant-test-beta','Beta Rapid Logistics','Beta Rapid Logistics LLP','Beta Express','Level 4, Beta Tech Hub, Outer Ring Road, Bengaluru, KA - 560103','29BBBCB2222B1Z2','BBBCB2222B','996609','https://betarapid.in','accounts@betarapid.in','9876500002','Beta Rapid Logistics: Fast & Reliable Corporate Dispatch. Disputes subject to Bengaluru jurisdiction.','Bengaluru','Karnataka','560103','data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"160\" height=\"40\"><rect width=\"160\" height=\"40\" fill=\"%23107c41\"/><text x=\"10\" y=\"25\" fill=\"white\" font-weight=\"bold\">BETA FLEET</text></svg>','BETA','beta',NULL,'ACTIVE','PRO','admin@betarapid.in','9876500002',NULL,0,'2026-10-24 10:58:32','2026-10-24 10:58:32');
/*!40000 ALTER TABLE `tenants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `userId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `username` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `mobile` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `companyId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `status` enum('active','inactive','suspended','pending') NOT NULL DEFAULT 'active',
  `presentAddress` varchar(255) DEFAULT NULL,
  `pinCode` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `userAddress` varchar(255) DEFAULT NULL,
  `addresses` json DEFAULT NULL,
  `isDeleted` tinyint(1) NOT NULL DEFAULT '0',
  `isConfirmed` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime DEFAULT NULL,
  `isPayHolder` tinyint(1) NOT NULL DEFAULT '0',
  `fcm_token` varchar(255) DEFAULT NULL,
  `isManager` tinyint(1) DEFAULT NULL,
  `companyManager` tinyint(1) DEFAULT NULL,
  `approvedManagerById` varchar(36) DEFAULT NULL,
  `managerId` varchar(255) DEFAULT NULL,
  `managerEmail` varchar(255) DEFAULT NULL,
  `danfossuserId` varchar(255) DEFAULT NULL,
  `costCenter` varchar(255) DEFAULT NULL,
  `tenantId` varchar(36) DEFAULT 'e7b8a1c0-0000-0000-0000-000000000001',
  PRIMARY KEY (`userId`),
  KEY `companyId` (`companyId`),
  CONSTRAINT `user_ibfk_1` FOREIGN KEY (`companyId`) REFERENCES `company` (`companyId`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicle`
--

DROP TABLE IF EXISTS `vehicle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicle` (
  `vehicleId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `vehicleName` varchar(255) DEFAULT NULL,
  `vehicleTypeId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `manufacturing` varchar(255) NOT NULL,
  `vehicleImg` json DEFAULT NULL,
  `availableStatus` varchar(255) DEFAULT NULL,
  `isDeleted` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime DEFAULT NULL,
  `tenantId` varchar(36) DEFAULT 'e7b8a1c0-0000-0000-0000-000000000001',
  PRIMARY KEY (`vehicleId`),
  KEY `vehicleTypeId` (`vehicleTypeId`),
  CONSTRAINT `vehicle_ibfk_1` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_10` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_11` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_12` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_13` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_14` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_15` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_16` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_17` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_18` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_19` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_2` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_20` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_21` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_22` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_23` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_24` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_25` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_26` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_27` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_28` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_29` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_3` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_30` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_31` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_32` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_33` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_34` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_35` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_36` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_37` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_38` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_39` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_4` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_40` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_41` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_42` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_43` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_44` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_45` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_46` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_47` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_48` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_49` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_5` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_50` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_51` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_52` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_53` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_54` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_55` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_56` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_57` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_58` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_59` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_6` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_60` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_61` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_62` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_63` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_64` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_65` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_66` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_67` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_68` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_69` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_7` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_70` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_71` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_72` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_73` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_74` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_75` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_76` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_77` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_78` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_79` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_8` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_80` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_81` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_82` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_83` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_84` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_85` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_86` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_87` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_88` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_89` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_9` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_90` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_91` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_92` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_93` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_94` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicle`
--

LOCK TABLES `vehicle` WRITE;
/*!40000 ALTER TABLE `vehicle` DISABLE KEYS */;
INSERT INTO `vehicle` VALUES ('138e2eda-3776-42da-9afb-41bbba8a112d','Alpha Innova-1792992933671','8e1008e2-89a4-4d2d-b5a8-7fb962a4aa49','2024','[]','Available',0,'2026-10-26 05:35:33','a1a1a1a1-1111-4111-a111-111111111111');
/*!40000 ALTER TABLE `vehicle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehiclemaster`
--

DROP TABLE IF EXISTS `vehiclemaster`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehiclemaster` (
  `vehicleMasterId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `vehicleNumber` varchar(255) DEFAULT NULL,
  `vehicleId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `vehicleModelName` varchar(255) DEFAULT NULL,
  `vehicleType` varchar(255) DEFAULT NULL,
  `vendorId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `vendorName` varchar(255) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `isDeleted` int DEFAULT '0',
  `deletedAt` datetime DEFAULT NULL,
  `vehicleTypeId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `tenantId` varchar(36) DEFAULT 'e7b8a1c0-0000-0000-0000-000000000001',
  PRIMARY KEY (`vehicleMasterId`),
  KEY `vehicleId` (`vehicleId`),
  KEY `ownerId` (`vendorId`),
  KEY `vehicleTypeId` (`vehicleTypeId`),
  CONSTRAINT `vehiclemaster_ibfk_12` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `vehiclemaster_ibfk_15` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `vehiclemaster_ibfk_18` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `vehiclemaster_ibfk_21` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `vehiclemaster_ibfk_24` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `vehiclemaster_ibfk_27` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `vehiclemaster_ibfk_3` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `vehiclemaster_ibfk_30` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `vehiclemaster_ibfk_33` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `vehiclemaster_ibfk_36` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `vehiclemaster_ibfk_39` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `vehiclemaster_ibfk_42` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `vehiclemaster_ibfk_43` FOREIGN KEY (`vehicleId`) REFERENCES `vehicle` (`vehicleId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `vehiclemaster_ibfk_44` FOREIGN KEY (`vendorId`) REFERENCES `vendor` (`vendorId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `vehiclemaster_ibfk_45` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `vehiclemaster_ibfk_6` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `vehiclemaster_ibfk_9` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype` (`vehicleTypeId`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehiclemaster`
--

LOCK TABLES `vehiclemaster` WRITE;
/*!40000 ALTER TABLE `vehiclemaster` DISABLE KEYS */;
INSERT INTO `vehiclemaster` VALUES ('4c44cf05-0b4b-45fc-83bd-63a737698260','KA-01-AL-5400','138e2eda-3776-42da-9afb-41bbba8a112d','Alpha Innova-1792992933671','AlphaSUV-1792992933622','b21db9f8-87ee-4f29-be5b-ff52878c9ebc','Alpha Partner Transport','2026-10-26 05:35:33',0,NULL,'8e1008e2-89a4-4d2d-b5a8-7fb962a4aa49','a1a1a1a1-1111-4111-a111-111111111111');
/*!40000 ALTER TABLE `vehiclemaster` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicletype`
--

DROP TABLE IF EXISTS `vehicletype`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicletype` (
  `vehicleTypeId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `vehicleType` varchar(255) DEFAULT NULL,
  `AdvanceBookingHours` varchar(255) DEFAULT NULL,
  `isDeleted` tinyint(1) NOT NULL DEFAULT '0',
  `tenantId` varchar(36) DEFAULT 'e7b8a1c0-0000-0000-0000-000000000001',
  `createdAt` datetime DEFAULT NULL,
  `seatCapacity` int DEFAULT NULL,
  `priorMinutes` int NOT NULL DEFAULT '0',
  `bookingType` varchar(255) NOT NULL DEFAULT 'regular',
  `vehicleImg` json DEFAULT NULL,
  PRIMARY KEY (`vehicleTypeId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicletype`
--

LOCK TABLES `vehicletype` WRITE;
/*!40000 ALTER TABLE `vehicletype` DISABLE KEYS */;
INSERT INTO `vehicletype` VALUES ('0cdccbff-8861-4479-9482-a75742be4c90','car',NULL,1,'e7b8a1c0-0000-0000-0000-000000000001','2026-10-16 07:24:17',4,24,'regular','[\"1792135457873-images (1).jpg\"]'),('1d216e3b-12a5-486e-b922-87d4d6f08271','SEDAN CARS',NULL,0,'e7b8a1c0-0000-0000-0000-000000000001','2026-10-17 03:41:13',5,2,'regular','[\"1792208473372-img6.c7c5fcaebb509ca534c1.png\"]'),('4d55d1dc-8a47-41c4-8848-81110e910cd3','BetaSedan-1792992933632',NULL,0,'tenant-test-beta','2026-10-26 05:35:33',4,15,'regular','[]'),('8c95eca4-c465-43f0-b972-7f161ae8e1fe','Executive Sedan',NULL,0,'e7b8a1c0-0000-0000-0000-000000000001','2026-10-21 08:04:49',4,0,'regular',NULL),('8e1008e2-89a4-4d2d-b5a8-7fb962a4aa49','AlphaSUV-1792992933622',NULL,0,'a1a1a1a1-1111-4111-a111-111111111111','2026-10-26 05:35:33',6,30,'regular','[]'),('9dde8951-bfdb-4f0d-82ff-f490e95c4b67','BIKE',NULL,0,'e7b8a1c0-0000-0000-0000-000000000001','2026-10-16 09:19:18',2,24,'regular','[\"1792142358010-images (1).jpg\"]'),('d108c14d-85a8-4ec1-aba6-d07e71e5a33d','car',NULL,0,'e7b8a1c0-0000-0000-0000-000000000001','2026-10-23 06:59:20',4,20,'regular','[\"1792738760083-images (1).jpg\"]');
/*!40000 ALTER TABLE `vehicletype` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendor`
--

DROP TABLE IF EXISTS `vendor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendor` (
  `vendorId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `vendorName` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phno` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `vehicleCount` int DEFAULT NULL,
  `refererVendor` varchar(255) DEFAULT NULL,
  `createdBy` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `isDeleted` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime DEFAULT NULL,
  `fcm_token` varchar(255) DEFAULT NULL,
  `tenantId` varchar(36) DEFAULT 'e7b8a1c0-0000-0000-0000-000000000001',
  PRIMARY KEY (`vendorId`),
  KEY `createdBy` (`createdBy`),
  KEY `idx_vendor_tenant_phno` (`tenantId`,`phno`),
  CONSTRAINT `vendor_ibfk_1` FOREIGN KEY (`createdBy`) REFERENCES `employee` (`employeeId`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendor`
--

LOCK TABLES `vendor` WRITE;
/*!40000 ALTER TABLE `vendor` DISABLE KEYS */;
INSERT INTO `vendor` VALUES ('b21db9f8-87ee-4f29-be5b-ff52878c9ebc','Alpha Partner Transport','partner@alpha-1792992933682.com','9718932118','$2b$10$6RS/tRzQ9k9Rgt32.c7UeOKfZtAmggsdf9NBXHi35oX5jCYmWIHMG',NULL,NULL,NULL,'Alpha City','admin',NULL,NULL,NULL,0,'2026-10-26 05:35:33',NULL,'a1a1a1a1-1111-4111-a111-111111111111'),('f435ca69-1387-4685-a4d9-8f0a79b058b8','Beta Partner Fleet','partner@beta-1792992933745.com','9666096081','$2b$10$SmHrycs8SensBpIs01676.riqooJ668gWDLVa5fNrdtLeqbNuItA.',NULL,NULL,NULL,'Beta City','admin',NULL,NULL,NULL,0,'2026-10-26 05:35:33',NULL,'tenant-test-beta');
/*!40000 ALTER TABLE `vendor` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-26 11:26:03
