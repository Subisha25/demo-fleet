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
-- Current Database: `demodb`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `demodb` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `demodb`;

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
  `notes` text,
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
INSERT INTO `configuration` VALUES ('2818f17f-8ec5-4453-9505-d1bfce2fde5c',70,20,'3000',10,'2025-26-','smtpout.secureserver.net','traveldesk@gracecabs.com','gracecabs@2005',587,0,'2025-10-07 07:12:45','2026-11-05 07:10:22','e7b8a1c0-0000-0000-0000-000000000001');
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
  `scope` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'FLEET',
  `category` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OPERATIONAL',
  `placeholders` text COLLATE utf8mb4_unicode_ci,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`emailConfigId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `emailconfiguration`
--

LOCK TABLES `emailconfiguration` WRITE;
/*!40000 ALTER TABLE `emailconfiguration` DISABLE KEYS */;
INSERT INTO `emailconfiguration` VALUES ('0a4277f1-f9bf-4e96-8268-cbaeb01c819f','Fleet Application Rejection Notice','REGISTRATION_REJECTED','Update on Your FleetFlow Application: ###FleetName###','<div style=\"font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E0DAD1; border-radius: 12px; overflow: hidden;\">\n          <div style=\"background: #2B2927; padding: 20px 24px; color: #FFFFFF;\">\n            <h1 style=\"margin: 0; font-size: 20px; font-weight: 800;\">FLEETFLOW</h1>\n            <p style=\"margin: 4px 0 0; font-size: 12px; opacity: 0.9;\">Application Status Notice</p>\n          </div>\n          <div style=\"padding: 24px; color: #2B2927;\">\n            <h2 style=\"margin: 0 0 16px; font-size: 17px; color: #1C1A18;\">Dear ###OwnerName###,</h2>\n            <p style=\"margin: 0 0 14px; font-size: 14px; line-height: 1.6;\">Thank you for your interest in FleetFlow. After review, we are unable to approve the application for <strong>###FleetName###</strong> at this time.</p>\n            <div style=\"background: #FFF5F5; border: 1px solid #FED7D7; border-radius: 8px; padding: 16px; margin: 20px 0;\">\n              <p style=\"margin: 0 0 6px; font-size: 12px; font-weight: 700; color: #C53030; text-transform: uppercase;\">Reason for Decision:</p>\n              <p style=\"margin: 0; font-size: 14px; color: #2D3748;\">###RejectionReason###</p>\n            </div>\n            <p style=\"margin: 0 0 14px; font-size: 13px; line-height: 1.6; color: #5C5752;\">If you would like to clarify details, update documentation, or reapply, please contact our support team at <a href=\"mailto:###SupportEmail###\" style=\"color: #C04E24;\">###SupportEmail###</a>.</p>\n          </div>\n          <div style=\"background: #F5F2EB; padding: 14px 24px; text-align: center; font-size: 11px; color: #7A7570; border-top: 1px solid #E0DAD1;\">\n            FleetFlow SaaS Platform Team\n          </div>\n        </div>','FleetFlow Platform','noreply@fleetflow.com',NULL,'2026-10-26 06:08:59','2026-10-26 06:08:59','e7b8a1c0-0000-0000-0000-000000000001','PLATFORM','SAAS_LIFECYCLE','###FleetName###,###OwnerName###,###RejectionReason###,###SupportEmail###',1),('0ab59c1a-2c37-4037-aecf-55760a4863fe','Forgot Password Email','FORGOT_PASWRD_EMPLOYEE','Password Reset for your Account - ###FleetName###','<p>Dear ###DisplayName###,</p>\n<p>Your login details given below</p>\n<p>Your Name is : ###DisplayName###</p>\n<p>Email : ###EmployeeEmail###</p>\n<p>Your Password is : ###Password###</p>\n<p><a style=\"color: blue; text-decoration: underline;\" href=\"http://gracecabs.com/login\" target=\"_blank\" rel=\"noopener\">Click here</a>to login</p>\n<p>Keep the above information for future use.</p>\n<p>Good luck and thank you for using GRACE CABS</p>\n<p>You can always contact us at traveldesk@gracecabs.com</p>\n<p>Regards,</p>\n<p>Team Grace cabs</p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2025-09-26 05:57:31','2026-01-19 10:37:20','e7b8a1c0-0000-0000-0000-000000000001','FLEET','AUTH',NULL,1),('1034141a-f20d-457a-86f4-cf5a28f78564','Partner Details','PARTNER_MESSAGE','Confirm Your Partner Registration with Gracecabs.in','<p>Hello ###UserName###,</p>\n<p>Thank you for registering as a Partner with <strong>Grace Travel</strong>. We have received your vehicle &amp; personal details successfully. Below is the information provided by you:</p>\n<p><strong>Partner Information:</strong></p>\n<ul>\n<li><strong>Name:</strong> ###Name###</li>\n<li><strong>Email:</strong> ###Email###</li>\n<li><strong>Contact Number:</strong> ###ContactNumber###</li>\n<li><strong>Present Address:</strong> ###PresentAddress###</li>\n<li><strong>City Preferred:</strong> ###CityPreferred###</li>\n</ul>\n<p><strong>Vehicle Information:</strong></p>\n<ul>\n<li><strong>Vehicle Type:</strong> ###VehicleType###</li>\n<li><strong>Vehicle Name:</strong> ###VehicleName###</li>\n<li><strong>Registration Number:</strong> ###RegistrationNumber###</li>\n<li><strong>Registration Year:</strong> ###RegistrationYear###</li>\n<li><strong>Fuel Type:</strong> ###FuelType###</li>\n<li><strong>Passenger Capacity:</strong> ###PassengerCapacity###</li>\n</ul>\n<p>Our team will verify your details and contact you shortly.</p>\n<p>If you have any queries, feel free to reach out to us at <a>traveldesk@gracecabs.com</a></p>\n<p>Regards,<br><strong>Team ###FleetName###</strong></p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2025-11-28 10:09:40','2026-01-19 10:10:35','e7b8a1c0-0000-0000-0000-000000000001','FLEET','OPERATIONAL',NULL,1),('1727e710-0eb4-48f4-93f2-7f279bab24db','Confirmation Messages','USER_CONFIRMATION_MESSAGE','Confirm Your Registration with ###FleetName###.com','<p>Hello ###UserName###,</p>\n<p>Thank you for signing up with us. An important account activation information is below:</p>\n<p><strong>or Copy and paste the given below URL in your browser</strong></p>\n<p><strong>Keep the above information for future use.</strong>Good luck and thank you for using ###FleetName###</p>\n<p>You can always contact us at traveldesk@gracecabs.com</p>\n<p>Regards,</p>\n<p>Team <strong>###FleetName###</strong></p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2025-10-08 05:23:30','2026-01-19 10:34:36','e7b8a1c0-0000-0000-0000-000000000001','FLEET','AUTH',NULL,1),('17492c54-adf2-44b7-8712-ceabd8e4c41c','New Fleet Application Alert (SuperAdmin)','SUPERADMIN_NEW_APPLICATION_ALERT','🚨 New Fleet Application Received: ###FleetName### (###BusinessCode###)','<div style=\"font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E0DAD1; border-radius: 12px; overflow: hidden;\">\n          <div style=\"background: #C04E24; padding: 20px 24px; color: #FFFFFF;\">\n            <h1 style=\"margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px;\">FLEETFLOW SAAS PLATFORM</h1>\n            <p style=\"margin: 4px 0 0; font-size: 12px; opacity: 0.9;\">SuperAdmin Application Review Alert</p>\n          </div>\n          <div style=\"padding: 24px; color: #2B2927;\">\n            <h2 style=\"margin: 0 0 16px; font-size: 17px; color: #1C1A18;\">New Fleet Application Received</h2>\n            <p style=\"margin: 0 0 16px; font-size: 14px; line-height: 1.6;\">A new fleet transport operator has submitted a registration application for review:</p>\n            <table style=\"width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;\">\n              <tr><td style=\"padding: 6px 0; color: #7A7570; width: 140px;\">Fleet Name:</td><td style=\"padding: 6px 0; font-weight: 700; color: #1C1A18;\">###FleetName###</td></tr>\n              <tr><td style=\"padding: 6px 0; color: #7A7570;\">Business Code:</td><td style=\"padding: 6px 0; font-weight: 700; color: #C04E24;\">###BusinessCode###</td></tr>\n              <tr><td style=\"padding: 6px 0; color: #7A7570;\">Applicant / Owner:</td><td style=\"padding: 6px 0; font-weight: 600;\">###OwnerName###</td></tr>\n              <tr><td style=\"padding: 6px 0; color: #7A7570;\">Contact Email:</td><td style=\"padding: 6px 0;\">###ContactEmail###</td></tr>\n              <tr><td style=\"padding: 6px 0; color: #7A7570;\">Contact Phone:</td><td style=\"padding: 6px 0;\">###ContactPhone###</td></tr>\n              <tr><td style=\"padding: 6px 0; color: #7A7570;\">Location:</td><td style=\"padding: 6px 0;\">###City###, ###State###</td></tr>\n              <tr><td style=\"padding: 6px 0; color: #7A7570;\">Requested Plan:</td><td style=\"padding: 6px 0; font-weight: 700;\">###PlanTier### (###BillingCycle###)</td></tr>\n              <tr><td style=\"padding: 6px 0; color: #7A7570;\">Agreed Price:</td><td style=\"padding: 6px 0; font-weight: 700; color: #2E7D32;\">₹###AgreedPrice###</td></tr>\n            </table>\n            <div style=\"text-align: center; margin: 24px 0;\">\n              <a href=\"###ReviewUrl###\" style=\"background: #C04E24; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;\">Review Application Queue &rarr;</a>\n            </div>\n          </div>\n          <div style=\"background: #F5F2EB; padding: 14px 24px; text-align: center; font-size: 11px; color: #7A7570; border-top: 1px solid #E0DAD1;\">\n            FleetFlow SaaS Platform &bull; Automated Platform Administration Alert\n          </div>\n        </div>','FleetFlow Platform','noreply@fleetflow.com',NULL,'2026-10-26 06:08:59','2026-10-26 06:08:59','e7b8a1c0-0000-0000-0000-000000000001','PLATFORM','SAAS_LIFECYCLE','###FleetName###,###BusinessCode###,###OwnerName###,###ContactEmail###,###ContactPhone###,###City###,###State###,###PlanTier###,###BillingCycle###,###AgreedPrice###,###ReviewUrl###',1),('1e397a7f-7315-40e6-837d-ba7785775be9','Invoice detail message','INVOICE_MSG','Reminding about your pending invoice #: ###InvoiceNumber### - ###FleetName###','<p>Dear ###UserName###,<br><br>We remind you to pay for pending Payment of your order.<br><br>Here your invoice details:<br><br><strong>Invoice Details</strong><br>###InvoiceList###<br><br><a style=\"color: #ffffff; background-color: #007bff; padding: 10px 20px; text-decoration: none; border-radius: 5px;\" href=\"###PaymentLink###\">Click here to Pay</a><br><br>Thanks &amp; Regards,<br>###FleetName###</p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2025-08-29 17:40:23','2026-01-19 10:00:10','e7b8a1c0-0000-0000-0000-000000000001','FLEET','BILLING',NULL,1),('24646e30-1118-4b70-a6e5-5d231b4974d2','Forget password otp','FORGET_PASSWORD_OTP','Fleet A Custom Subject - 1793079238821','<p>Dear ###DisplayName###,</p>\n<p>Your otp details given below</p>\n<p>Your Name is : ###DisplayName###</p>\n<p>Email : ###EmployeeEmail###</p>\n<p>Your OTP is : ###OTP###</p>\n<p>Good luck and thank you for using GRACE CABS</p>\n<p>You can always contact us at traveldesk@gracecabs.com</p>\n<p>Regards,</p>\n<p>Team ###FleetName###</p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2026-10-27 05:33:58','2026-10-27 05:33:58','b0581acf-3c54-4164-9466-89a3ea80d471','FLEET','OPERATIONAL',NULL,1),('38b4d487-35d2-439f-bc78-ec83b6845cad','Fleet Account Approved & Password Setup','TENANT_ADMIN_ACTIVATION_LINK','🎉 Congratulations! Your FleetFlow Account is Approved: ###FleetName###','<div style=\"font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E0DAD1; border-radius: 12px; overflow: hidden;\">\n          <div style=\"background: #C04E24; padding: 20px 24px; color: #FFFFFF;\">\n            <h1 style=\"margin: 0; font-size: 20px; font-weight: 800;\">FLEETFLOW</h1>\n            <p style=\"margin: 4px 0 0; font-size: 12px; opacity: 0.9;\">Account Activation & Onboarding</p>\n          </div>\n          <div style=\"padding: 24px; color: #2B2927;\">\n            <h2 style=\"margin: 0 0 16px; font-size: 17px; color: #1C1A18;\">Congratulations ###OwnerName###!</h2>\n            <p style=\"margin: 0 0 14px; font-size: 14px; line-height: 1.6;\">Your application for <strong>###FleetName###</strong> has been approved on FleetFlow SaaS Platform.</p>\n            <div style=\"background: #FDF6F0; border: 1px solid #F3D0BD; border-radius: 8px; padding: 16px; margin: 20px 0;\">\n              <p style=\"margin: 0 0 6px; font-size: 13px;\"><strong>Plan:</strong> ###PlanTier###</p>\n              <p style=\"margin: 0 0 6px; font-size: 13px;\"><strong>Billing Cycle:</strong> ###BillingCycle###</p>\n              <p style=\"margin: 0; font-size: 13px;\"><strong>Agreed Rate:</strong> ₹###AgreedPrice### / ###BillingCycle###</p>\n            </div>\n            <p style=\"margin: 0 0 8px; font-size: 14px; font-weight: 700; color: #1C1A18;\">Step 1 — Set Up Your Password:</p>\n            <p style=\"margin: 0 0 16px; font-size: 13px; color: #5C5752;\">Click the secure link below to set your password. This link expires in 24 hours.</p>\n            <div style=\"text-align: center; margin: 20px 0;\">\n              <a href=\"###ActivationUrl###\" style=\"background: #C04E24; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;\">Set Up Administrator Password &rarr;</a>\n            </div>\n            <p style=\"margin: 20px 0 8px; font-size: 14px; font-weight: 700; color: #1C1A18;\">Step 2 — Fleet Operator Dashboard:</p>\n            <p style=\"margin: 0 0 16px; font-size: 13px; color: #5C5752;\">Access your dashboard at: <a href=\"###LoginUrl###\" style=\"color: #C04E24;\">###LoginUrl###</a></p>\n          </div>\n          <div style=\"background: #F5F2EB; padding: 14px 24px; text-align: center; font-size: 11px; color: #7A7570; border-top: 1px solid #E0DAD1;\">\n            FleetFlow SaaS Platform &bull; Keep this email for your records\n          </div>\n        </div>','FleetFlow Platform','noreply@fleetflow.com',NULL,'2026-10-26 06:08:59','2026-10-26 06:08:59','e7b8a1c0-0000-0000-0000-000000000001','PLATFORM','SAAS_LIFECYCLE','###FleetName###,###OwnerName###,###PlanTier###,###AgreedPrice###,###BillingCycle###,###ActivationUrl###,###LoginUrl###,###PlanSummaryPdfUrl###',1),('390dc55c-9877-4653-a158-961ea5389edd','Forgot Password Email To User','FORGOT_PASWRD_USER','Password Reset for your Account - Gracecabs','<p>Hello ###UserName###,</p>\r <p>Your login details given below</p>\r <p>Your Email Address is : ###UserEmail###</p>\r <p>Your Password is : ###Password###</p>\r <p>Keep the above information for future use.</p>\r <p>Good luck and thank you for using GRACE CABS</p>\r <p>You can always contact us at traveldesk@gracecabs.com</p>\r <p>Regards,</p>\r <p>Team Grace cabs</p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2025-09-26 06:01:01','2025-09-26 07:07:54','e7b8a1c0-0000-0000-0000-000000000001','FLEET','AUTH',NULL,1),('44eb5191-1e54-4ca3-9c82-cf4b2d265757','Order Cancellation Email','ORDER_CANCEL_EMAIL_TO_CLIENT','The Order #: ###OrderNumber### has been cancelled - ###FleetName###','<p>Dear ###UserName###,</p>\n<p>Your Order No. <strong>###OrderNumber###</strong></p>\n<p>We inform that the following items in your order <strong>###OrderNumber###</strong> has been Cancelled</p>\n<p>###BookingDetails###</p>\n<p>Thank you,<br>###FleetName###</p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2025-09-05 06:28:26','2026-01-19 10:07:11','e7b8a1c0-0000-0000-0000-000000000001','FLEET','OPERATIONAL',NULL,1),('4b4bc6f6-9e7d-4b35-ba73-638861b65066','User Registration','USER_REGISTRATION_EMAIL_TO_USER','User Account Login Details - ###FleetName###','<p>Hello ###UserName###,</p><p>Welcome to ###FleetName###! Your user account has been successfully created.</p><p><strong>Your Account Login Details:</strong></p><p>Email Address: <strong>###UserEmail###</strong></p><p>Temporary Password: <strong>###Password###</strong></p><p>Company Portal: <a href=\"###CompanySeoUrl###\">###CompanySeoUrl###</a></p><p>Common Login URL: <a href=\"###LoginUrl###\">###LoginUrl###</a></p><p><strong>Setup Instructions:</strong> Please visit your Company Portal link above, log in with your temporary password, and update your password under My Account for security.</p><p>You can always reach our 24/7 support desk at traveldesk@gracecabs.com</p><p>Regards,<br>Team ###FleetName###</p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2025-10-23 04:47:55','2026-01-19 10:07:45','e7b8a1c0-0000-0000-0000-000000000001','FLEET','OPERATIONAL',NULL,1),('55fa0958-b6b6-44df-a8da-5a029bdf5365','Subscription Renewal Reminder','SUBSCRIPTION_RENEWAL_REMINDER','Reminder: Your FleetFlow Subscription Renews in ###DaysRemaining### Days','<div style=\"font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E0DAD1; border-radius: 12px; overflow: hidden;\">\n          <div style=\"background: #C04E24; padding: 20px 24px; color: #FFFFFF;\">\n            <h1 style=\"margin: 0; font-size: 20px; font-weight: 800;\">FLEETFLOW</h1>\n            <p style=\"margin: 4px 0 0; font-size: 12px; opacity: 0.9;\">Subscription Renewal Notice</p>\n          </div>\n          <div style=\"padding: 24px; color: #2B2927;\">\n            <h2 style=\"margin: 0 0 16px; font-size: 17px; color: #1C1A18;\">Dear Fleet Administrator,</h2>\n            <p style=\"margin: 0 0 14px; font-size: 14px; line-height: 1.6;\">Your <strong>###PlanTier###</strong> subscription for <strong>###FleetName###</strong> is scheduled to expire on <strong>###ExpiryDate###</strong> (in ###DaysRemaining### days).</p>\n            <p style=\"margin: 0 0 16px; font-size: 14px; line-height: 1.6;\">Please renew promptly to ensure uninterrupted dispatching, driver tracking, corporate invoicing, and booking operations.</p>\n            <div style=\"background: #FDF6F0; border: 1px solid #F3D0BD; border-radius: 8px; padding: 16px; margin: 20px 0;\">\n              <p style=\"margin: 0 0 6px; font-size: 13px;\"><strong>Plan:</strong> ###PlanTier### (###BillingCycle###)</p>\n              <p style=\"margin: 0 0 6px; font-size: 13px;\"><strong>Renewal Amount:</strong> ₹###RenewalAmount###</p>\n              <p style=\"margin: 0; font-size: 13px;\"><strong>Renewal Date:</strong> ###ExpiryDate###</p>\n            </div>\n            <div style=\"text-align: center; margin: 24px 0;\">\n              <a href=\"###RenewalUrl###\" style=\"background: #C04E24; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;\">Renew Subscription Online &rarr;</a>\n            </div>\n          </div>\n          <div style=\"background: #F5F2EB; padding: 14px 24px; text-align: center; font-size: 11px; color: #7A7570; border-top: 1px solid #E0DAD1;\">\n            FleetFlow SaaS Platform &bull; Automated Subscription Reminder\n          </div>\n        </div>','FleetFlow Platform','noreply@fleetflow.com',NULL,'2026-10-26 06:08:59','2026-10-27 08:22:24','e7b8a1c0-0000-0000-0000-000000000001','PLATFORM','BILLING','###FleetName###,###PlanTier###,###BillingCycle###,###DaysRemaining###,###ExpiryDate###,###RenewalAmount###,###RenewalUrl###',1),('57066938-5f8d-4e40-a00f-cdc2e065541b','Manager Alert','MANAGER_ALERT','Requested Manager Approval: ###BookingNumber### with Gracecabs.com','<p>Hello ###UserName###,</p><p>Please approve the booking ###BookingDetails###</p><p>###Alert###</p><p>Regards,</p><p>Gracecabs</p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2026-02-23 09:26:35','2026-02-23 09:26:35','e7b8a1c0-0000-0000-0000-000000000001','FLEET','OPERATIONAL',NULL,1),('6212885e-3a4f-48bf-9c3d-502bd392aa8b','Confirmation Message','USER_CONFIRMATION_MESSAGE','Confirm Your Registration with ###FleetName###','<p>Hello ###UserName###,</p>\n<p>Thank you for signing up with us. An important account activation information is below: <strong>or Copy and paste the given below URL in your browser</strong></p>\n<p>###SERVER_PATH###Registration.asp?RefNo=###RefNo###<strong>Keep the above information for future use.</strong>Good luck and thank you for using ###WEB_SITE_NAME###</p>\n<p>You can always contact us at ###WEB_SITE_EMAIL###.</p>\n<p>Regards,</p>\n<p>Team <strong>###WEB_SITE_NAME###</strong></p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2025-10-08 05:07:12','2026-01-19 10:34:07','e7b8a1c0-0000-0000-0000-000000000001','FLEET','AUTH',NULL,1),('62417638-f948-46bc-a748-d928b8e9c604','ManagerCancelBooking','ManagerCancelBooking','Booking Cancelled By Manager: ###BookingNumber### ','Hai ###UserName###, <br/> Your booking ###BookingDetails### has been cancelled by ###ManagerDetails### <br/> Thanks, <br/> Gracecabs PVT Ltd ','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2026-02-27 10:51:29','2026-02-27 10:51:29','e7b8a1c0-0000-0000-0000-000000000001','FLEET','OPERATIONAL',NULL,1),('6c7ab74a-856a-4030-9d9f-d45fdd6e3d5f','Subscription Suspension Notice','SUBSCRIPTION_RESTRICTION_NOTICE','Suspension Notice: Fleet Dispatch Restricted Due to Unpaid Subscription','<div style=\"font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E0DAD1; border-radius: 12px; overflow: hidden;\">\n          <div style=\"background: #DC2626; padding: 20px 24px; color: #FFFFFF;\">\n            <h1 style=\"margin: 0; font-size: 20px; font-weight: 800;\">FLEETFLOW</h1>\n            <p style=\"margin: 4px 0 0; font-size: 12px; opacity: 0.9;\">Operations Suspension Notice</p>\n          </div>\n          <div style=\"padding: 24px; color: #2B2927;\">\n            <h2 style=\"margin: 0 0 16px; font-size: 17px; color: #1C1A18;\">Fleet Operations Suspended</h2>\n            <p style=\"margin: 0 0 14px; font-size: 14px; line-height: 1.6;\">The subscription for <strong>###FleetName###</strong> has exceeded the 3-day grace period without renewal. Dispatching and new booking operations are currently restricted.</p>\n            <p style=\"margin: 0 0 14px; font-size: 14px; line-height: 1.6;\">Your historical data, vehicles, drivers, and reports are safely preserved. You can restore full operational access at any time by paying your renewal invoice.</p>\n            <div style=\"text-align: center; margin: 24px 0;\">\n              <a href=\"###RenewalUrl###\" style=\"background: #DC2626; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;\">Restore Full Access Now &rarr;</a>\n            </div>\n          </div>\n          <div style=\"background: #F5F2EB; padding: 14px 24px; text-align: center; font-size: 11px; color: #7A7570; border-top: 1px solid #E0DAD1;\">\n            FleetFlow SaaS Platform &bull; Automated Lifecycle Alert\n          </div>\n        </div>','FleetFlow Platform','noreply@fleetflow.com',NULL,'2026-10-26 06:08:59','2026-10-26 06:08:59','e7b8a1c0-0000-0000-0000-000000000001','PLATFORM','BILLING','###FleetName###,###PlanTier###,###RenewalUrl###',1),('6d30f6ca-8f64-4f86-9c46-8e7d3df5f413','Forget password otp','FORGET_PASSWORD_OTP','Fleet A Custom Subject - 1793077355651','<p>Dear ###DisplayName###,</p>\n<p>Your otp details given below</p>\n<p>Your Name is : ###DisplayName###</p>\n<p>Email : ###EmployeeEmail###</p>\n<p>Your OTP is : ###OTP###</p>\n<p>Good luck and thank you for using GRACE CABS</p>\n<p>You can always contact us at traveldesk@gracecabs.com</p>\n<p>Regards,</p>\n<p>Team ###FleetName###</p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2026-10-27 05:02:35','2026-10-27 05:02:35','3d482f21-8dd3-475d-b81e-c250dfd6efbb','FLEET','OPERATIONAL',NULL,1),('71417777-f0a6-4195-88fd-d1309baf7ede','Order Booking - Confirmation Message For Client','ORDER_BOOKING_EMAIL_TO_CLIENT','[Alpha Fleet VIP] Booking Confirmed ###BookingCode###','<p>Dear ###UserName###,</p>\n<p>Your Order No. ###OrderNumber###</p>\n<p>We have accepted your cab request. Cabs are assigned ###CabAssignedMinutes### minutes before travel time.</p>\n<p>We will send your cab details by email once your cab is assigned. ###BookingDetails###</p>\n<p>Thank you,<br>###FleetName###</p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2026-10-24 06:28:41','2026-10-24 06:28:41','a1a1a1a1-1111-4111-a111-111111111111','FLEET','OPERATIONAL',NULL,1),('743dcb41-c8f8-4e4b-9843-f2c9076f61ee','Order Booking - autoapprove Message For Client','BOOKING_AUTOAPPROVE_EMAIL_TO_CLIENT','Order booking request created. Order #: ###OrderNumber### - ###FleetName###','<p>Dear ###UserName###,</p>The booking was auto approved.<p></p> <p>Your Order No. ###OrderNumber###</p> <p>Cabs are assigned ###CabAssignedMinutes### minutes before travel time.</p> <p>We will send your cab details by email once your cab is assigned. ###BookingDetails###</p> <p>Thank you,<br>###FleetName###</p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2026-03-10 03:41:05','2026-03-10 03:41:05','e7b8a1c0-0000-0000-0000-000000000001','FLEET','OPERATIONAL',NULL,1),('77fa8435-a54f-416a-a4da-d23ec2a18e9b','Subscription Payment Failed','SUBSCRIPTION_PAYMENT_FAILED','Payment Failed: FleetFlow Subscription Invoice ###InvoiceNumber###','<div style=\"font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E0DAD1; border-radius: 12px; overflow: hidden;\">\n          <div style=\"background: #DC2626; padding: 20px 24px; color: #FFFFFF;\">\n            <h1 style=\"margin: 0; font-size: 20px; font-weight: 800;\">FLEETFLOW</h1>\n            <p style=\"margin: 4px 0 0; font-size: 12px; opacity: 0.9;\">Payment Failed Notice</p>\n          </div>\n          <div style=\"padding: 24px; color: #2B2927;\">\n            <h2 style=\"margin: 0 0 16px; font-size: 17px; color: #1C1A18;\">Payment Unsuccessful</h2>\n            <p style=\"margin: 0 0 14px; font-size: 14px; line-height: 1.6;\">We were unable to process the payment for subscription invoice <strong>###InvoiceNumber###</strong> (###FleetName###).</p>\n            <div style=\"background: #FFF5F5; border: 1px solid #FED7D7; border-radius: 8px; padding: 14px; margin: 16px 0;\">\n              <p style=\"margin: 0; font-size: 13px; color: #C53030;\"><strong>Reason:</strong> ###FailureReason###</p>\n            </div>\n            <p style=\"margin: 0 0 16px; font-size: 14px; line-height: 1.6;\">Please update your payment method or retry the transaction to maintain continuous fleet service.</p>\n            <div style=\"text-align: center; margin: 20px 0;\">\n              <a href=\"###RetryUrl###\" style=\"background: #C04E24; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;\">Retry Payment &rarr;</a>\n            </div>\n          </div>\n          <div style=\"background: #F5F2EB; padding: 14px 24px; text-align: center; font-size: 11px; color: #7A7570; border-top: 1px solid #E0DAD1;\">\n            FleetFlow SaaS Platform &bull; Billing Department\n          </div>\n        </div>','FleetFlow Platform','noreply@fleetflow.com',NULL,'2026-10-26 06:08:59','2026-10-26 06:08:59','e7b8a1c0-0000-0000-0000-000000000001','PLATFORM','BILLING','###FleetName###,###InvoiceNumber###,###TotalAmount###,###FailureReason###,###RetryUrl###',1),('79b4da5d-0e20-4062-a26b-3222152ec92a','Order Booking - Confirmation Message','ORDER_BOOKING_EMAIL_TO_ADMIN','Order booking request created. Order No #: ###OrderNumber### - ###FleetName###','<p>Dear ###AdminName###,<br><br>###UserName### placed an order.<br><br>###BookingDetails###<br><br>Please confirm the order. Order No. ###OrderNumber###<br><br>Regards,<br>###FleetName###</p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2025-08-28 10:20:17','2026-01-19 10:35:48','e7b8a1c0-0000-0000-0000-000000000001','FLEET','OPERATIONAL',NULL,1),('86565456-0988-449b-bd25-cac4b8bfcdbc','Driver Account Registration','DRIVER_REGISTRATION_EMAIL_TO_DRIVER','Driver Account Created - ###FleetName###','<p>Hello ###DriverName###,</p><p>Welcome to ###FleetName###! Your driver account has been created successfully.</p><p>Registered Mobile: ###DriverPhone###</p><p>You can log in to the driver application using your registered mobile number and password.</p><p>Regards,<br>Team ###FleetName###</p>','GraceCabs','traveldesk@gracecabs.com',NULL,'2026-10-23 15:55:37','2026-10-23 15:55:37','e7b8a1c0-0000-0000-0000-000000000001','FLEET','OPERATIONAL',NULL,1),('891d593e-c71e-41cc-bc8f-0a71c00ca0c2','Pay Invoice - Message','USER_INVOICE_EMAIL','Invoice Details for Order #: ###OrderNumber### - ###FleetName###s','<p>Dear ###UserName###,</p>\r     <p>Invoice details for your booking <strong>Order #: ###OrderNumber###</strong></p>\r     <p>###InvoiceTemple###<br><br></p>\r     <p><a title=\"Click here to Pay\" href=\"https://gracecabs.com/adminlogin\" target=\"_blank\" rel=\"noopener\">###PayLink###</a><br><br></p>\r     <p>Thank you,<br>###FleetName###</p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2025-08-27 10:18:52','2025-08-29 16:34:22','e7b8a1c0-0000-0000-0000-000000000001','FLEET','BILLING',NULL,1),('8b02032e-d80e-4267-9cc1-67f7622b3b8a','Subscription Payment Receipt','SUBSCRIPTION_PAYMENT_RECEIPT','Payment Receipt: FleetFlow Subscription Invoice ###InvoiceNumber###','<div style=\"font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E0DAD1; border-radius: 12px; overflow: hidden;\">\n          <div style=\"background: #C04E24; padding: 20px 24px; color: #FFFFFF;\">\n            <h1 style=\"margin: 0; font-size: 20px; font-weight: 800;\">FLEETFLOW</h1>\n            <p style=\"margin: 4px 0 0; font-size: 12px; opacity: 0.9;\">Official Payment Receipt</p>\n          </div>\n          <div style=\"padding: 24px; color: #2B2927;\">\n            <h2 style=\"margin: 0 0 16px; font-size: 17px; color: #1C1A18;\">Payment Successfully Processed</h2>\n            <p style=\"margin: 0 0 14px; font-size: 14px; line-height: 1.6;\">Thank you for your payment for <strong>###FleetName###</strong>. Your subscription has been activated with full platform access.</p>\n            <table style=\"width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;\">\n              <tr><td style=\"padding: 6px 0; color: #7A7570; width: 140px;\">Invoice Number:</td><td style=\"padding: 6px 0; font-weight: 700; color: #1C1A18;\">###InvoiceNumber###</td></tr>\n              <tr><td style=\"padding: 6px 0; color: #7A7570;\">Plan Tier:</td><td style=\"padding: 6px 0; font-weight: 700;\">###PlanTier### (###BillingCycle###)</td></tr>\n              <tr><td style=\"padding: 6px 0; color: #7A7570;\">Total Paid:</td><td style=\"padding: 6px 0; font-weight: 800; color: #2E7D32; font-size: 15px;\">₹###TotalAmount### INR</td></tr>\n              <tr><td style=\"padding: 6px 0; color: #7A7570;\">Transaction Ref:</td><td style=\"padding: 6px 0; font-family: monospace;\">###TransactionReference###</td></tr>\n              <tr><td style=\"padding: 6px 0; color: #7A7570;\">Valid Until:</td><td style=\"padding: 6px 0; font-weight: 700;\">###PeriodEnd###</td></tr>\n            </table>\n            <div style=\"text-align: center; margin: 20px 0;\">\n              <a href=\"###DashboardUrl###\" style=\"background: #C04E24; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;\">Go to Fleet Dashboard &rarr;</a>\n            </div>\n          </div>\n          <div style=\"background: #F5F2EB; padding: 14px 24px; text-align: center; font-size: 11px; color: #7A7570; border-top: 1px solid #E0DAD1;\">\n            FleetFlow SaaS Platform &bull; Billing & Payments\n          </div>\n        </div>','FleetFlow Platform','noreply@fleetflow.com',NULL,'2026-10-26 06:08:59','2026-10-26 06:08:59','e7b8a1c0-0000-0000-0000-000000000001','PLATFORM','BILLING','###FleetName###,###InvoiceNumber###,###PlanTier###,###BillingCycle###,###TotalAmount###,###TransactionReference###,###PeriodEnd###,###DashboardUrl###',1),('8f05b6eb-cacc-4bb8-8312-d4c00b01b939','Forget password otp','FORGET_PASSWORD_OTP','Fleet A Custom Subject - 1793082384937','<p>Dear ###DisplayName###,</p>\n<p>Your otp details given below</p>\n<p>Your Name is : ###DisplayName###</p>\n<p>Email : ###EmployeeEmail###</p>\n<p>Your OTP is : ###OTP###</p>\n<p>Good luck and thank you for using GRACE CABS</p>\n<p>You can always contact us at traveldesk@gracecabs.com</p>\n<p>Regards,</p>\n<p>Team ###FleetName###</p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2026-10-27 06:26:24','2026-10-27 06:26:24','7afb9ae4-b340-4c72-b5bf-7158e0255e31','FLEET','OPERATIONAL',NULL,1),('96495218-5116-4a5f-8169-caef51ef14d1','Monthly Booking','MONTHLY_BOOKING','Monthly Booking Details: ###BookingNumber### with Gracecabs.com','<p>Dear Customer,</p>\n<p>Monthly Invoice details <strong>Order #: ###OrderNumber###</strong></p>\n<p>###InvoiceTemple###<br><br></p>\n<p><br><br></p>\n<p>Thank you,<br>###FleetName###</p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2026-01-06 07:22:30','2026-01-19 10:05:28','e7b8a1c0-0000-0000-0000-000000000001','FLEET','OPERATIONAL',NULL,1),('a23808cf-a207-4052-95c9-99c8406292a0','Forget password otp','FORGET_PASSWORD_OTP','OTP sent to reset for your password - ###FleetName###','<p>Dear ###DisplayName###,</p>\n<p>Your otp details given below</p>\n<p>Your Name is : ###DisplayName###</p>\n<p>Email : ###EmployeeEmail###</p>\n<p>Your OTP is : ###OTP###</p>\n<p>Good luck and thank you for using GRACE CABS</p>\n<p>You can always contact us at traveldesk@gracecabs.com</p>\n<p>Regards,</p>\n<p>Team ###FleetName###</p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2025-10-22 06:55:26','2026-01-19 10:11:20','e7b8a1c0-0000-0000-0000-000000000001','FLEET','AUTH',NULL,1),('b73135de-b432-4831-ba05-ac5d07d14f21','Fleet Application Received (Applicant)','REGISTRATION_RECEIVED','Application Received: Welcome to FleetFlow — ###FleetName###','<div style=\"font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E0DAD1; border-radius: 12px; overflow: hidden;\">\n          <div style=\"background: #C04E24; padding: 20px 24px; color: #FFFFFF;\">\n            <h1 style=\"margin: 0; font-size: 20px; font-weight: 800;\">FLEETFLOW</h1>\n            <p style=\"margin: 4px 0 0; font-size: 12px; opacity: 0.9;\">Intelligent Fleet Mobility Platform</p>\n          </div>\n          <div style=\"padding: 24px; color: #2B2927;\">\n            <h2 style=\"margin: 0 0 16px; font-size: 17px; color: #1C1A18;\">Hello ###OwnerName###,</h2>\n            <p style=\"margin: 0 0 14px; font-size: 14px; line-height: 1.6;\">Thank you for registering <strong>###FleetName###</strong> with FleetFlow!</p>\n            <p style=\"margin: 0 0 14px; font-size: 14px; line-height: 1.6;\">Your application has been received and is currently under review by our platform administration team.</p>\n            <div style=\"background: #FDF6F0; border: 1px solid #F3D0BD; border-radius: 8px; padding: 16px; margin: 20px 0;\">\n              <p style=\"margin: 0 0 8px; font-size: 13px;\"><strong>Business Code:</strong> <span style=\"font-family: monospace; color: #C04E24;\">###BusinessCode###</span></p>\n              <p style=\"margin: 0 0 8px; font-size: 13px;\"><strong>Selected Plan:</strong> ###PlanTier### (###BillingCycle###)</p>\n              <p style=\"margin: 0; font-size: 13px;\"><strong>Agreed Price:</strong> ₹###AgreedPrice###</p>\n            </div>\n            <p style=\"margin: 0 0 14px; font-size: 14px; line-height: 1.6;\">Once approved, you will receive a secure activation invitation link to set up your administrator password and start managing your fleet.</p>\n            <p style=\"margin: 0; font-size: 13px; color: #7A7570;\">Need assistance? Contact us at <a href=\"mailto:###SupportEmail###\" style=\"color: #C04E24;\">###SupportEmail###</a></p>\n          </div>\n          <div style=\"background: #F5F2EB; padding: 14px 24px; text-align: center; font-size: 11px; color: #7A7570; border-top: 1px solid #E0DAD1;\">\n            FleetFlow SaaS Platform &bull; Automated Operational Notification\n          </div>\n        </div>','FleetFlow Platform','noreply@fleetflow.com',NULL,'2026-10-26 06:08:59','2026-10-26 06:08:59','e7b8a1c0-0000-0000-0000-000000000001','PLATFORM','SAAS_LIFECYCLE','###FleetName###,###OwnerName###,###BusinessCode###,###PlanTier###,###AgreedPrice###,###BillingCycle###,###SupportEmail###',1),('bd77d2b8-b5ad-4555-9e95-f1f82d34129a','Booking Confirmed - Apex Alpha Style','BOOKING_CONFIRMED','Your Apex Alpha Cab is Confirmed! (Ref: {{bookingId}})','<div>Apex Alpha Cab Confirmed for {{customerName}}</div>',NULL,NULL,NULL,'2026-10-26 07:05:52','2026-10-26 07:05:52','fa111111-1111-1111-1111-111111111111','FLEET','OPERATIONAL',NULL,1),('bee9d650-c646-490b-9bae-399d90693fa8','confirmed message for driver','ORDER_CONFIRMATION_DRIVER','Order booking request created. Order #: ###OrderNumber### - ###FleetName###','<p>Dear ###DriverName###, </p>\r  <p>Your new booking request has been assigned. </p>\r  <p>Order No.: ###OrderNumber### </p>\r  <p>Booking Details: ###BookingDetails###</p>\r  <p>Customer Details: ###UserDetails###&nbsp;<br><br>Please review the trip details carefully and be ready for the assignment. Thanks, ###FleetName###</p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2025-08-29 11:15:12','2025-08-29 11:55:31','e7b8a1c0-0000-0000-0000-000000000001','FLEET','AUTH',NULL,1),('cf3642de-8721-4d2c-9416-a27255971070','Subscription Grace Period Notice','SUBSCRIPTION_GRACE_PERIOD_NOTICE','Action Required: Your Fleet Subscription is Past Due (3-Day Grace Period)','<div style=\"font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E0DAD1; border-radius: 12px; overflow: hidden;\">\n          <div style=\"background: #D97706; padding: 20px 24px; color: #FFFFFF;\">\n            <h1 style=\"margin: 0; font-size: 20px; font-weight: 800;\">FLEETFLOW</h1>\n            <p style=\"margin: 4px 0 0; font-size: 12px; opacity: 0.9;\">Grace Period Warning</p>\n          </div>\n          <div style=\"padding: 24px; color: #2B2927;\">\n            <h2 style=\"margin: 0 0 16px; font-size: 17px; color: #1C1A18;\">Action Required: Past Due Notice</h2>\n            <p style=\"margin: 0 0 14px; font-size: 14px; line-height: 1.6;\">Your <strong>###PlanTier###</strong> subscription for <strong>###FleetName###</strong> expired on <strong>###ExpiryDate###</strong>.</p>\n            <p style=\"margin: 0 0 14px; font-size: 14px; line-height: 1.6;\">Your fleet has entered a <strong>3-day grace period</strong>. Your operations remain active, but you must renew immediately to avoid suspension of new dispatches and bookings.</p>\n            <div style=\"text-align: center; margin: 24px 0;\">\n              <a href=\"###RenewalUrl###\" style=\"background: #D97706; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;\">Pay & Renew Now &rarr;</a>\n            </div>\n          </div>\n          <div style=\"background: #F5F2EB; padding: 14px 24px; text-align: center; font-size: 11px; color: #7A7570; border-top: 1px solid #E0DAD1;\">\n            FleetFlow SaaS Platform &bull; Automated Lifecycle Alert\n          </div>\n        </div>','FleetFlow Platform','noreply@fleetflow.com',NULL,'2026-10-26 06:08:59','2026-10-26 06:08:59','e7b8a1c0-0000-0000-0000-000000000001','PLATFORM','BILLING','###FleetName###,###PlanTier###,###ExpiryDate###,###RenewalUrl###',1),('d01aaf65-42bb-4f79-a3c8-f0506df74f05','Forget password otp','FORGET_PASSWORD_OTP','Fleet A Custom Subject - 1793013221456','<p>Dear ###DisplayName###,</p>\n<p>Your otp details given below</p>\n<p>Your Name is : ###DisplayName###</p>\n<p>Email : ###EmployeeEmail###</p>\n<p>Your OTP is : ###OTP###</p>\n<p>Good luck and thank you for using GRACE CABS</p>\n<p>You can always contact us at traveldesk@gracecabs.com</p>\n<p>Regards,</p>\n<p>Team ###FleetName###</p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2026-10-26 11:13:41','2026-10-26 11:13:41','1df70f4b-625f-45cb-91e9-7e0bcd3fa898','FLEET','OPERATIONAL',NULL,1),('d25742fe-2789-491a-ad3a-2d021e6904d0','Forget password otp','FORGET_PASSWORD_OTP','Fleet A Custom Subject - 1793089344116','<p>Dear ###DisplayName###,</p>\n<p>Your otp details given below</p>\n<p>Your Name is : ###DisplayName###</p>\n<p>Email : ###EmployeeEmail###</p>\n<p>Your OTP is : ###OTP###</p>\n<p>Good luck and thank you for using GRACE CABS</p>\n<p>You can always contact us at traveldesk@gracecabs.com</p>\n<p>Regards,</p>\n<p>Team ###FleetName###</p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2026-10-27 08:22:24','2026-10-27 08:22:24','5956da65-26f8-45b7-837e-14d325ea828f','FLEET','OPERATIONAL',NULL,1),('d3ca957f-3e22-4f96-90f1-58b68ff7b63e','Order Confirmation Message','ORDER_CONFIRMATION_NOTIF','Your booking request has been confirmed. Order #: ####OrderNumber### - ###FleetName###','<p>Dear ###UserName###,<br><br>Order No. ###OrderNumber###<br><br>###BookingDetails###</p>\n<p>###DriverDetails###</p>\n<p>Thank you,<br>###FleetName###</p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2025-08-28 07:42:47','2026-01-20 05:54:52','e7b8a1c0-0000-0000-0000-000000000001','FLEET','AUTH',NULL,1),('e0fc039c-58d3-4396-8125-9cc4a82f95f4','Forget password otp','FORGET_PASSWORD_OTP','OTP sent to reset for your password - ###FleetName###','<p>Dearrrrr ###DisplayName###,</p>\n<p>Your otp details given below</p>\n<p>Your Name is : ###DisplayName###</p>\n<p>Email : ###EmployeeEmail###</p>\n<p>Your OTP is : ###OTP###</p>\n<p>Good luck and thank you for using GRACE CABS</p>\n<p>You can always contact us at traveldesk@gracecabs.com</p>\n<p>Regards,</p>\n<p>Team ###FleetName###</p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com','','2026-10-26 09:50:32','2026-10-26 09:50:32','027bb9d5-b665-473f-95ae-ed58e0054811','FLEET','OPERATIONAL',NULL,1),('e20c0afc-cbee-46eb-bffb-56856981d85e','Order Cancellation','ORDER_CANCEL_EMAIL_TO_ADMIN','The Order #: ###OrderNumber### has been cancelled - ###FleetName### ','<p>Dear ###UserName###,</p>\r <p> Order No. <strong>###OrderNumber###</strong></p>\r <p>We inform that the following items in order <strong>###OrderNumber###</strong> has been Cancelled.</p>\r<p> <p>###InvoiceDetails###</p></p> <p>###BookingDetails###</p>\r <p>Thank you,<br>###FleetName###</p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2025-09-05 06:17:16','2026-01-19 10:09:59','e7b8a1c0-0000-0000-0000-000000000001','FLEET','OPERATIONAL',NULL,1),('ef590f28-cd64-4cca-b472-af7bc273d504','Forget password otp','FORGET_PASSWORD_OTP','Fleet A Custom Subject - 1793013179474','<p>Dear ###DisplayName###,</p>\n<p>Your otp details given below</p>\n<p>Your Name is : ###DisplayName###</p>\n<p>Email : ###EmployeeEmail###</p>\n<p>Your OTP is : ###OTP###</p>\n<p>Good luck and thank you for using GRACE CABS</p>\n<p>You can always contact us at traveldesk@gracecabs.com</p>\n<p>Regards,</p>\n<p>Team ###FleetName###</p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2026-10-26 11:12:59','2026-10-26 11:12:59','7d20ff43-937f-4d04-acb3-1047a5dc5cfa','FLEET','OPERATIONAL',NULL,1),('ef77cffa-4338-48a5-8418-1e5c56df4d57','Order Booking - autoapprove Message For Manager','BOOKING_AUTOAPPROVE_EMAIL_TO_MANAGER','Booking Autoapproved. Order #: ###OrderNumber### - ###FleetName###','<p>Dear Manager,</p>\n<p>The booking was auto approved.</p>\n<p>&nbsp;</p>\n<p>Order No. ###OrderNumber###</p>\n<p>Auto approved booking details. ###BookingDetails###</p>\n<p>Thank you,<br>###FleetName###</p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2026-03-22 12:12:44','2026-05-22 05:04:13','e7b8a1c0-0000-0000-0000-000000000001','FLEET','OPERATIONAL',NULL,1),('f52aa4f4-b175-4f8b-b0b2-3c65100cfe0a','admin cancelled order details','ADMIN_CANCEL_ORDER','Order Cancelled by admin #: ###OrderNumber### - ###FleetName###','<p>Dear ###UserName###,</p><p>Order has been cancelled by admin. Booking details are given below <b></p><p>###BookingDetails###</p>   <p>Thank you,<br>###FleetName###</p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2025-10-07 09:01:07','2025-10-07 09:01:07','e7b8a1c0-0000-0000-0000-000000000001','FLEET','OPERATIONAL',NULL,1),('ffd6414a-4afb-4385-acef-3c44f0f3ab3e','Order Booking - Confirmation Message For Client','ORDER_BOOKING_EMAIL_TO_CLIENT','Order booking request created. Order #: ###OrderNumber### - ###FleetName###','<p>Dear ###UserName###,</p>\n<p>Your Order No. ###OrderNumber###</p>\n<p>We have accepted your cab request. Cabs are assigned ###CabAssignedMinutes### minutes before travel time.</p>\n<p>We will send your cab details by email once your cab is assigned. ###BookingDetails###</p>\n<p>Thank you,<br>###FleetName###</p>','GraceCabs (traveldesk@gracecabs.com)','traveldesk@gracecabs.com',NULL,'2025-08-29 09:58:25','2026-01-19 10:36:18','e7b8a1c0-0000-0000-0000-000000000001','FLEET','OPERATIONAL',NULL,1);
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
  `address` varchar(500) DEFAULT NULL,
  `gstin` varchar(15) DEFAULT NULL,
  `profileImage` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`employeeId`),
  KEY `idx_employee_tenant_phno` (`tenantId`,`phno`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee`
--

LOCK TABLES `employee` WRITE;
/*!40000 ALTER TABLE `employee` DISABLE KEYS */;
INSERT INTO `employee` VALUES ('364aed6d-3cb3-40f4-b3c1-2ed3970a6cce','Super Administrator',0,'subisha2002.m@gmail.com','9080280818','$2b$10$9txfvuknQ6xhHkIBsF4mQu2rh5.Aig756beG6.eNGliGch.Y/4ipi','superadmin','2026-10-16 12:08:03',NULL,'e7b8a1c0-0000-0000-0000-000000000001','Tower 4, Level 7, OMR Tech Corridor, Chennai, TN 600096','33AAMCG2518C1Z0','/uploads/profileImg/profile_1794378084801_3337.jpg'),('a576862c-5bd4-40dc-ba61-3b907351f466','ganthi',NULL,'subipcs@gmail.com','9007989595','$2b$10$KKAFtIR3vv0DMcnG/p6zAe0R5LAkrRo2ebhMZDK0qzsC5DsyGN2cC','fleet_admin','2026-10-26 09:46:29',NULL,'027bb9d5-b665-473f-95ae-ed58e0054811',NULL,NULL,NULL);
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
  `tenantId` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `templateCode` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `referenceEntity` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `referenceId` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `idempotencyKey` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
INSERT INTO `notification_logs` VALUES ('331aab28-3e34-4c3d-914f-009cdb37109b','SMS','9080280818',NULL,'APP_LOGIN_OTP',NULL,NULL,NULL,'FAILED',NULL,'[NETWORK GUARD VIOLATION] Real SMS provider call attempted to URL: https://2factor.in/API/V1/c7a289f8-9abb-11f0-b922-0200cd936042/SMS/9080280818/123456/OTP1',0,3,'{\"otp\": \"123456\"}','2026-11-10 06:34:04','2026-11-10 06:34:04'),('3f49821d-7a74-401f-b3d3-44c6ab09c36c','SMS','9080280818',NULL,'MANAGER_BOOKING_CONFIRMATION',NULL,NULL,NULL,'FAILED',NULL,'[NETWORK GUARD VIOLATION] Real SMS provider call attempted to URL: https://2factor.in/API/R1/?module=TRANS_SMS&apikey=c7a289f8-9abb-11f0-b922-0200cd936042&to=9080280818&from=GRCCAB&templatename=ManageAlert&var1=Manager&var2=BK-TEST&var3=John%20Doe&var4=9840112233&var5=Koyambedu&var6=Airport',0,3,NULL,'2026-11-10 06:34:04','2026-11-10 06:34:04'),('79898892-4db8-4cb9-ba17-0165bda59456','SMS','9080280818','e7b8a1c0-0000-0000-0000-000000000001','PUBLIC_BOOKING_OTP','OTP_SESSION','PUB_d645fe425b865aff2b9de79789ff56da',NULL,'SENT','3a26b244-b1ee-4813-a413-f8ab49c395b3',NULL,0,3,'{\"template\": \"OTP1\", \"sessionId\": \"PUB_d645fe425b865aff2b9de79789ff56da\"}','2026-11-10 06:34:22','2026-11-10 06:34:22');
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
  `otp` varchar(255) DEFAULT NULL,
  `loginId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expiresAt` datetime NOT NULL,
  `createdAt` datetime DEFAULT NULL,
  `sessionId` varchar(100) DEFAULT NULL,
  `attempts` int DEFAULT '0',
  `verifiedAt` datetime DEFAULT NULL,
  `resetToken` varchar(255) DEFAULT NULL,
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
  `maxTaxes` int NOT NULL DEFAULT '1',
  `isUnlimitedTaxes` tinyint(1) NOT NULL DEFAULT '0',
  `themeLevel` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'STANDARD',
  `maxPickupAreas` int NOT NULL DEFAULT '10',
  `isUnlimitedPickupAreas` tinyint(1) NOT NULL DEFAULT '0',
  `maxPickupCities` int NOT NULL DEFAULT '5',
  `isUnlimitedPickupCities` tinyint(1) NOT NULL DEFAULT '0',
  `maxPackages` int NOT NULL DEFAULT '5',
  `isUnlimitedPackages` tinyint(1) NOT NULL DEFAULT '0',
  `maxPaymentModes` int NOT NULL DEFAULT '3',
  `isUnlimitedPaymentModes` tinyint(1) NOT NULL DEFAULT '0',
  `annualTripQuota` int DEFAULT NULL,
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
INSERT INTO `saas_plans` VALUES ('11710615-3e19-48d1-993d-91d5a409138f','BASIC','Starter Mobility','Essential fleet and trip dispatch operations for emerging operators.',299.00,3050.00,4.00,'INR','MONTHLY','[\"MONTHLY\", \"ANNUAL\"]',15,15,3,5,100,0,0,0,0,0,'[\"Fleet & Driver Operations (Up to 15 Vehicles / 15 Drivers)\", \"Up to 3 Corporate Client Accounts\", \"Basic Booking-to-Invoice Lifecycle & Dispatch\", \"Automated Standard Tax & Trip Rate Calculation\", \"Standard PDF Invoice Generation\", \"Email Notification Support\"]','{\"bulkUpload\": false, \"themeLevel\": \"STANDARD\", \"multiBranch\": false, \"customDomain\": false, \"smsTemplates\": false, \"customBranding\": false, \"emailTemplates\": false, \"advancedReports\": false, \"onCallInvoicing\": false, \"monthlyInvoicing\": false, \"pdfCustomizationTier\": \"STANDARD\", \"dedicatedPolicyEngine\": false}',1,'2026-10-24 04:53:53','2026-10-24 04:53:53',1,0,'STANDARD',10,0,5,0,5,0,3,0,NULL),('28f80e21-cb2a-4e7e-8683-af0006340330','ENTERPRISE','Enterprise Mobility Suite','High-volume platform with full tenant scoping, custom domains, and VIP telemetry.',549.00,5600.00,7.00,'INR','MONTHLY','[\"MONTHLY\", \"ANNUAL\"]',0,250,100,100,0,1,1,1,1,1,'[\"High-Volume Fleet Operations (Up to 250 Vehicles / 250 Drivers)\", \"Up to 100 Corporate Client Accounts\", \"Full Multi-Tenant SaaS Isolation & Custom Domains\", \"Dedicated Database Tenant Scoping & Policy Engine\", \"Consolidated Monthly Corporate Route Invoicing\", \"Multi-Role Server Authorization\", \"Priority Support & High-Volume Telemetry Metering\"]','{\"bulkUpload\": true, \"themeLevel\": \"CUSTOM\", \"multiBranch\": true, \"customDomain\": true, \"smsTemplates\": true, \"themePresets\": [\"terracotta\", \"emerald\", \"slate\", \"indigo\"], \"customBranding\": true, \"emailTemplates\": true, \"advancedReports\": true, \"onCallInvoicing\": true, \"monthlyInvoicing\": true, \"pdfCustomizationTier\": \"ADVANCED\", \"dedicatedPolicyEngine\": true}',1,'2026-10-24 04:53:53','2026-10-24 04:53:53',0,1,'CUSTOM',10,1,5,1,5,1,3,1,NULL),('31c7872b-bb42-47c9-95d3-99a861a04c7f','TEST_CUSTOM_2652','Custom Enterprise Tier','Dedicated test tier',999.00,9999.00,0.00,'INR','MONTHLY','[\"MONTHLY\", \"ANNUAL\"]',50,50,10,100,5000,0,0,0,0,0,'[\"advanced_pdf\", \"api_access\"]','{\"customTheme\": true, \"pdfBranding\": true}',1,'2026-10-24 04:54:02','2026-10-24 04:54:02',1,0,'STANDARD',10,0,5,0,5,0,3,0,NULL),('b8dcf23c-27d1-45ef-94d0-8ea2629e6621','PRO','Growth Fleet Pro','Scalable multi-company corporate transit with customized branding.',349.00,3560.00,5.00,'INR','MONTHLY','[\"MONTHLY\", \"ANNUAL\"]',75,75,20,25,250,0,0,0,0,0,'[\"Expanded Fleet Management (Up to 75 Vehicles / 75 Drivers)\", \"Up to 20 Corporate Client Accounts\", \"On-Call, Monthly Consolidated & Spot Trip Invoicing\", \"Advanced Tenant Branding & Portal Theming\", \"Dynamic Corporate Booking Policies & Domain Validation\", \"Route Card Aggregation & Financial Summary Reports\", \"Custom Email/SMS Reminders & Payment Tracking\"]','{\"bulkUpload\": true, \"themeLevel\": \"PRESETS\", \"multiBranch\": true, \"customDomain\": false, \"smsTemplates\": true, \"themePresets\": [\"terracotta\", \"emerald\", \"slate\", \"indigo\"], \"customBranding\": true, \"emailTemplates\": true, \"advancedReports\": true, \"onCallInvoicing\": true, \"monthlyInvoicing\": true, \"pdfCustomizationTier\": \"BRANDED\", \"dedicatedPolicyEngine\": true}',1,'2026-10-24 04:53:53','2026-10-24 04:53:53',2,0,'PRESETS',50,0,25,0,25,0,10,0,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `short_links`
--

LOCK TABLES `short_links` WRITE;
/*!40000 ALTER TABLE `short_links` DISABLE KEYS */;
INSERT INTO `short_links` VALUES (1,'h5ehZZRV','https://www.google.com/maps/dir/?api=1&origin=chennai&destination=t%20nagar&travelmode=driving&dir_action=navigate','2025-12-10 09:53:55',NULL,'e7b8a1c0-0000-0000-0000-000000000001'),(2,'endOyy4d','https://www.google.com/maps/dir/?api=1&origin=jhdjkhs&destination=bdjhn&travelmode=driving&dir_action=navigate','2025-12-17 11:09:53',NULL,'e7b8a1c0-0000-0000-0000-000000000001'),(3,'FokC9mGf','https://www.google.com/maps/dir/?api=1&origin=hujkkuj&destination=uyhuf&travelmode=driving&dir_action=navigate','2025-12-18 05:08:39',NULL,'e7b8a1c0-0000-0000-0000-000000000001'),(4,'lGQR1hl2','https://www.google.com/maps/dir/?api=1&origin=jnkkjbjh&destination=Chennai&travelmode=driving&dir_action=navigate','2025-12-18 05:24:41',NULL,'e7b8a1c0-0000-0000-0000-000000000001'),(5,'iqs9mwkb','https://www.google.com/maps/dir/?api=1&origin=huiehf&destination=jngdjkn&travelmode=driving&dir_action=navigate','2025-12-18 05:28:19',NULL,'e7b8a1c0-0000-0000-0000-000000000001'),(6,'PW335Rt','https://www.google.com/maps/dir/?api=1&origin=jnefjk&destination=nfjkengjk&travelmode=driving&dir_action=navigate','2025-12-18 07:10:25',NULL,'e7b8a1c0-0000-0000-0000-000000000001'),(7,'gv176lCh','https://www.google.com/maps/dir/?api=1&origin=jnjhnh&destination=hbnjhb&travelmode=driving&dir_action=navigate','2025-12-24 07:46:05',NULL,'e7b8a1c0-0000-0000-0000-000000000001'),(8,'Q0G1F4J','https://www.google.com/maps/dir/?api=1&origin=bhsfhb&destination=Coimbatore&travelmode=driving&dir_action=navigate','2025-12-24 07:53:02',NULL,'e7b8a1c0-0000-0000-0000-000000000001'),(9,'jzwFU2p','https://www.google.com/maps/dir/?api=1&origin=hbjhb&destination=Chennai&travelmode=driving&dir_action=navigate','2025-12-26 07:30:59',NULL,'e7b8a1c0-0000-0000-0000-000000000001'),(10,'DQiXMEGB','https://www.google.com/maps/dir/?api=1&origin=jhsdkfjhfndjkj&destination=jnfjk&travelmode=driving&dir_action=navigate','2025-12-26 11:38:51',NULL,'e7b8a1c0-0000-0000-0000-000000000001'),(11,'AFA9Fn1S','https://www.google.com/maps/dir/?api=1&origin=dkljb&destination=gjuir&travelmode=driving&dir_action=navigate','2026-01-08 07:12:35',NULL,'e7b8a1c0-0000-0000-0000-000000000001'),(12,'IBIZTFAo','https://www.google.com/maps/dir/?api=1&origin=bvhgv&destination=Coimbatore&travelmode=driving&dir_action=navigate','2026-01-12 09:58:13',NULL,'e7b8a1c0-0000-0000-0000-000000000001'),(13,'jm14ibYE','https://www.google.com/maps/dir/?api=1&origin=Kodampakkam&destination=Ballary&travelmode=driving&dir_action=navigate','2026-01-19 08:53:49',NULL,'e7b8a1c0-0000-0000-0000-000000000001'),(14,'PMS1FcpD','https://www.google.com/maps/dir/?api=1&origin=Kodampakkam&destination=Coimbatore&travelmode=driving&dir_action=navigate','2026-01-20 06:16:57',NULL,'e7b8a1c0-0000-0000-0000-000000000001'),(15,'pNxADvMB','https://www.google.com/maps/dir/?api=1&origin=bjhbj&destination=Coimbatore&travelmode=driving&dir_action=navigate','2026-01-21 09:11:12',NULL,'e7b8a1c0-0000-0000-0000-000000000001'),(16,'EgZVAXUo','https://www.google.com/maps/dir/?api=1&origin=dd&destination=jhgdhjjh&travelmode=driving&dir_action=navigate','2026-01-21 09:57:25',NULL,'e7b8a1c0-0000-0000-0000-000000000001'),(17,'aUluzXRL','https://www.google.com/maps/dir/?api=1&origin=kodampakkam&destination=porur&travelmode=driving&dir_action=navigate','2026-02-25 06:26:16',NULL,'e7b8a1c0-0000-0000-0000-000000000001'),(18,'jLeoCuft','https://www.google.com/maps/dir/?api=1&origin=wertyu&destination=ertyui&travelmode=driving&dir_action=navigate','2026-03-27 05:28:26',NULL,'e7b8a1c0-0000-0000-0000-000000000001'),(19,'lVsIPK3','https://www.google.com/maps/dir/?api=1&origin=kovai&destination=valparai&travelmode=driving&dir_action=navigate','2026-07-02 05:41:57',NULL,'e7b8a1c0-0000-0000-0000-000000000001'),(20,'4q8gvyfD','https://www.google.com/maps/dir/?api=1&origin=airport&destination=t%20nagar&travelmode=driving&dir_action=navigate','2026-10-16 09:37:15',NULL,'e7b8a1c0-0000-0000-0000-000000000001'),(21,'wCxQ3XJe','https://www.google.com/maps/dir/?api=1&origin=vandalur&destination=tambaram&travelmode=driving&dir_action=navigate','2026-10-17 04:21:31',NULL,'e7b8a1c0-0000-0000-0000-000000000001'),(22,'F7Gg2RS','https://www.google.com/maps/dir/?api=1&origin=Chennai%20Central&destination=T%20Nagar&travelmode=driving&dir_action=navigate','2026-11-06 10:45:24',NULL,'e7b8a1c0-0000-0000-0000-000000000001'),(23,'frjXN0','https://www.google.com/maps/dir/?api=1&origin=Chennai%20Central&destination=T%20Nagar&travelmode=driving&dir_action=navigate','2026-11-06 10:45:24',NULL,'e7b8a1c0-0000-0000-0000-000000000001'),(24,'shBzMwS','https://www.google.com/maps/dir/?api=1&origin=Chennai%20Central&destination=T%20Nagar&travelmode=driving&dir_action=navigate','2026-11-06 10:46:56',NULL,'e7b8a1c0-0000-0000-0000-000000000001'),(25,'BZpNUbB2','https://www.google.com/maps/dir/?api=1&origin=Chennai%20Central&destination=T%20Nagar&travelmode=driving&dir_action=navigate','2026-11-06 10:46:56',NULL,'e7b8a1c0-0000-0000-0000-000000000001'),(26,'5jwTveo','https://www.google.com/maps/dir/?api=1&origin=Chennai%20Central&destination=T%20Nagar&travelmode=driving&dir_action=navigate','2026-11-10 06:34:22',NULL,'e7b8a1c0-0000-0000-0000-000000000001'),(27,'DYKSmQeB','https://www.google.com/maps/dir/?api=1&origin=Chennai%20Central&destination=T%20Nagar&travelmode=driving&dir_action=navigate','2026-11-10 06:34:23',NULL,'e7b8a1c0-0000-0000-0000-000000000001');
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
INSERT INTO `subscription_invoices` VALUES ('13aa9a65-6a4c-4029-9399-9bb402c18763','00336a35-b499-4f29-8311-3a9ca67ff43d','46db23f2-2406-4759-b296-d0310a0dd757','SUB-202610-7044','BASIC','MONTHLY',299.00,18.00,53.82,352.82,'INR','PAID','TEST_SANDBOX','TXN_MOCK_1793013221392','2026-10-26 11:13:41','2026-11-26 11:13:41','2026-10-26 11:13:41','{\"cgst\": 26.91, \"sgst\": 26.91, \"cgstRate\": \"9%\", \"planName\": \"Starter Mobility\", \"sgstRate\": \"9%\", \"grossAmount\": 299, \"taxableAmount\": 299, \"discountAmount\": 0, \"discountApplied\": \"0%\"}','2026-10-26 11:13:41','2026-10-26 11:13:41'),('2c75afdd-c0c8-463f-854a-9c3a9a593684','84d4cfab-e4aa-48f1-aa7a-f4ed4ad3f2d3','ee73b6c8-8331-4f92-9a92-a4a1f4abd275','SUB-202610-5983','BASIC','MONTHLY',299.00,18.00,53.82,352.82,'INR','PAID','TEST_SANDBOX','TXN_MOCK_1793077355540','2026-10-27 05:02:35','2026-11-27 05:02:35','2026-10-27 05:02:35','{\"cgst\": 26.91, \"sgst\": 26.91, \"cgstRate\": \"9%\", \"planName\": \"Starter Mobility\", \"sgstRate\": \"9%\", \"grossAmount\": 299, \"taxableAmount\": 299, \"discountAmount\": 0, \"discountApplied\": \"0%\"}','2026-10-27 05:02:35','2026-10-27 05:02:35'),('49278057-ed4c-4796-8654-0d1001231529','3e3ac612-ec08-46ad-8e38-634f67878e3a','f89fb089-8f8f-44a0-8530-93486604929f','SUB-202610-8355','BASIC','MONTHLY',299.00,18.00,53.82,352.82,'INR','PAID','TEST_SANDBOX','TXN_MOCK_1793012917869','2026-10-26 11:08:37','2026-11-26 11:08:37','2026-10-26 11:08:37','{\"cgst\": 26.91, \"sgst\": 26.91, \"cgstRate\": \"9%\", \"planName\": \"Starter Mobility\", \"sgstRate\": \"9%\", \"grossAmount\": 299, \"taxableAmount\": 299, \"discountAmount\": 0, \"discountApplied\": \"0%\"}','2026-10-26 11:08:37','2026-10-26 11:08:37'),('63eed077-11a5-4ba6-bc0d-9e9dc4c0eaae','027bb9d5-b665-473f-95ae-ed58e0054811','9f692efa-5339-48f6-ac22-88ff095efc3b','SUB-202610-5596','BASIC','MONTHLY',299.00,18.00,53.82,352.82,'INR','PAID','TEST_SANDBOX','SIM_TXN_1793008328649','2026-10-26 09:52:01','2026-11-26 09:52:01','2026-10-26 09:52:08','{\"cgst\": 26.91, \"sgst\": 26.91, \"cgstRate\": \"9%\", \"planName\": \"Starter Mobility\", \"sgstRate\": \"9%\", \"grossAmount\": 299, \"taxableAmount\": 299, \"discountAmount\": 0, \"discountApplied\": \"0%\"}','2026-10-26 09:52:01','2026-10-26 09:52:08'),('69e774a3-09b4-4602-b305-481e0b893343','947137fb-2d6a-4d64-be86-af111ae6edca','25ec4f07-d62c-4a8c-a0f4-992ea59d4d6f','SUB-202610-8691','BASIC','MONTHLY',299.00,18.00,53.82,352.82,'INR','PAID','TEST_SANDBOX','TXN_MOCK_1793089344046','2026-10-27 08:22:24','2026-11-27 08:22:24','2026-10-27 08:22:24','{\"cgst\": 26.91, \"sgst\": 26.91, \"cgstRate\": \"9%\", \"planName\": \"Starter Mobility\", \"sgstRate\": \"9%\", \"grossAmount\": 299, \"taxableAmount\": 299, \"discountAmount\": 0, \"discountApplied\": \"0%\"}','2026-10-27 08:22:24','2026-10-27 08:22:24'),('77042475-90ea-4999-9089-763076e00c91','4fbcd6ad-61b0-4ee7-9a10-51879e4aede9','ae22cc03-5c44-4bb1-a3ae-dcad3d7825d6','SUB-202610-9500','BASIC','MONTHLY',299.00,18.00,53.82,352.82,'INR','PENDING','GATEWAY',NULL,'2026-10-26 11:06:28','2026-11-26 11:06:28',NULL,'{\"cgst\": 26.91, \"sgst\": 26.91, \"cgstRate\": \"9%\", \"planName\": \"Starter Mobility\", \"sgstRate\": \"9%\", \"grossAmount\": 299, \"taxableAmount\": 299, \"discountAmount\": 0, \"discountApplied\": \"0%\"}','2026-10-26 11:06:28','2026-10-26 11:06:28'),('888b2344-93cc-4b44-b1e4-f28032454b12','11b60fbd-1b26-4cf2-837f-0d60f68b7a06','bfcdf272-5981-4e78-b87e-ab9302459896','SUB-202610-9509','BASIC','MONTHLY',299.00,18.00,53.82,352.82,'INR','PAID','TEST_SANDBOX','TXN_MOCK_1793013179411','2026-10-26 11:12:59','2026-11-26 11:12:59','2026-10-26 11:12:59','{\"cgst\": 26.91, \"sgst\": 26.91, \"cgstRate\": \"9%\", \"planName\": \"Starter Mobility\", \"sgstRate\": \"9%\", \"grossAmount\": 299, \"taxableAmount\": 299, \"discountAmount\": 0, \"discountApplied\": \"0%\"}','2026-10-26 11:12:59','2026-10-26 11:12:59'),('be65d6cd-bf87-4c6a-9f0b-94ecbc72e4d3','fa111111-1111-1111-1111-111111111111','780cc58c-e7aa-4390-9c2a-e06d162eed37','SUB-202610-5855','PRO','ANNUAL',3560.00,18.00,640.80,4200.80,'INR','PAID','TEST_SANDBOX','TXN_1792998356842_788D5E','2026-10-26 07:05:56','2027-10-26 07:05:56','2026-10-26 07:05:56','{\"cgst\": 320.4, \"sgst\": 320.4, \"cgstRate\": \"9%\", \"planName\": \"Growth Fleet Pro\", \"sgstRate\": \"9%\", \"grossAmount\": 4188, \"taxableAmount\": 3560, \"discountAmount\": 628, \"discountApplied\": \"15%\"}','2026-10-26 07:05:56','2026-10-26 07:05:56'),('c2533540-1ce6-42f7-ac24-f2008aa229aa','72cb90df-c8bb-4a68-a14b-97d9066643b5','3b277e70-644c-4ab4-a349-deb36faa541d','SUB-202610-8674','BASIC','MONTHLY',299.00,18.00,53.82,352.82,'INR','PAID','TEST_SANDBOX','TXN_MOCK_1793012831703','2026-10-26 11:07:11','2026-11-26 11:07:11','2026-10-26 11:07:11','{\"cgst\": 26.91, \"sgst\": 26.91, \"cgstRate\": \"9%\", \"planName\": \"Starter Mobility\", \"sgstRate\": \"9%\", \"grossAmount\": 299, \"taxableAmount\": 299, \"discountAmount\": 0, \"discountApplied\": \"0%\"}','2026-10-26 11:07:11','2026-10-26 11:07:11'),('dbcd6a53-8e7e-446c-b463-d537bbe3da17','df68e4a7-a776-4b75-b265-908dd6cf572d','191cfb39-ff3d-4284-bfb1-4111268470b0','SUB-202610-9008','BASIC','MONTHLY',299.00,18.00,53.82,352.82,'INR','PAID','TEST_SANDBOX','TXN_MOCK_1793082384878','2026-10-27 06:26:24','2026-11-27 06:26:24','2026-10-27 06:26:24','{\"cgst\": 26.91, \"sgst\": 26.91, \"cgstRate\": \"9%\", \"planName\": \"Starter Mobility\", \"sgstRate\": \"9%\", \"grossAmount\": 299, \"taxableAmount\": 299, \"discountAmount\": 0, \"discountApplied\": \"0%\"}','2026-10-27 06:26:24','2026-10-27 06:26:24'),('edcbc569-82fd-47f5-b620-71a55589917e','8c0e1bbc-bc5d-43b6-b1b7-4579226d1789','5286b4b0-6a7d-4467-b518-3e8fc0af168c','SUB-202610-9439','BASIC','MONTHLY',299.00,18.00,53.82,352.82,'INR','PAID','TEST_SANDBOX','TXN_MOCK_1793079238724','2026-10-27 05:33:58','2026-11-27 05:33:58','2026-10-27 05:33:58','{\"cgst\": 26.91, \"sgst\": 26.91, \"cgstRate\": \"9%\", \"planName\": \"Starter Mobility\", \"sgstRate\": \"9%\", \"grossAmount\": 299, \"taxableAmount\": 299, \"discountAmount\": 0, \"discountApplied\": \"0%\"}','2026-10-27 05:33:58','2026-10-27 05:33:58');
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
INSERT INTO `tenant_activation_tokens` VALUES ('0d197799-364b-4a2b-9b71-180b3bc94e17','30ff1eb9-f9c0-4125-95b5-3b250fa9beae','direct_1793012032905@example.com','Direct Fleet 1793012032905','3895f7fdbe3bd6d78eaa2347c97f1cc961ee9f2764736cfb2ecfc44ebe460194','2026-10-27 10:53:52',NULL,0,'2026-10-26 10:53:52','2026-10-26 10:53:52'),('1180854b-2849-43ef-9697-7feacd306da2','c6cdfc18-6b09-4fde-b9bf-abbbd54e7367','direct_1793011635272@example.com','Direct Fleet 1793011635272','d5a597cfe202734b4789585b7fdcc2182390809947906a96f8ea872f4ee8aaf3','2026-10-27 10:47:15',NULL,0,'2026-10-26 10:47:15','2026-10-26 10:47:15'),('14431044-5d9e-4c29-99e6-325409a1c293','3db3c1ed-028b-45b5-a606-6ef474beddef','direct_1793012118536@example.com','Direct Fleet 1793012118536','e2a900f7189e1cc9eb53493bc4d1a331a04cc89307dfdb0e240b16ec80105f6f','2026-10-27 10:55:18',NULL,0,'2026-10-26 10:55:18','2026-10-26 10:55:18'),('1b062d47-a48e-4cf1-a0a4-53914c1501f5','d36935f0-cabf-4458-b031-c662d48ebb28','cosmic-1792998117247@example.com','Karan Mehra','74e4520db8829cd0912e3ba6d93fea18f6214757d0e6011b0fd80e85f3f669c8','2026-10-27 07:01:57',NULL,0,'2026-10-26 07:01:57','2026-10-26 07:01:57'),('2ebf2834-da50-4b25-bcef-f4c9955e28b7','d9f8f4eb-ff1c-4b26-a180-f90800bfd971','direct_1793013178800@example.com','Direct Fleet 1793013178800','9478ec547958895d70bf4d1d81e1efe4d1c39651f9341c3ad939e96543dd936f','2026-10-27 11:12:58',NULL,0,'2026-10-26 11:12:58','2026-10-26 11:12:58'),('31279dec-bb80-425b-8f15-4ca4faf1952b','4ef075e3-83c4-488f-b35e-ab6ff11cfd84','direct_1793011900968@example.com','Direct Fleet 1793011900968','67644f2c37a179e4e4c3734c4f091593f48e0dbf303a8a186e188a64ef8aa249','2026-10-27 10:51:41',NULL,0,'2026-10-26 10:51:41','2026-10-26 10:51:41'),('390d9a07-08c1-49bf-a31d-0aec09cec414','b6acd454-82f0-4eec-b6de-cfc048ca1eb6','direct_1793012472502@example.com','Direct Fleet 1793012472502','3f85aa5cc4f778fb6cac492d2466b6e9847dad33b9e1464063932771c4c8cdea','2026-10-27 11:01:12',NULL,0,'2026-10-26 11:01:12','2026-10-26 11:01:12'),('3967556e-a5d2-4764-be60-9650dca31352','bc95b9f7-d75f-470c-b7f9-bc733eac8dc3','cosmic-1792998058419@example.com','Karan Mehra','781d9dfeff089b59d0e62024d32ab911b66650630b088589f051fe9232d24941','2026-10-27 07:01:00',NULL,0,'2026-10-26 07:01:00','2026-10-26 07:01:00'),('3cc87598-0e57-42ce-9610-8605199c854c','052b6939-2e08-4ee0-a63b-55d5cebb3d46','direct_1793012831205@example.com','Direct Fleet 1793012831205','7a48c9eeea9f47c7c6969a61f9b52eb0947e3a818bf3531bc88ed3e1db31b405','2026-10-27 11:07:11',NULL,0,'2026-10-26 11:07:11','2026-10-26 11:07:11'),('3fe0e6ca-65d2-464c-9d56-1069013e8166','fdb07a63-3e5d-4200-85f4-de4301459af2','direct_1793082384274@example.com','Direct Fleet 1793082384274','232635908ef80c46ea255d7b2ee7dac436e2c8d776e1378e88833ec431036672','2026-10-28 06:26:24',NULL,0,'2026-10-27 06:26:24','2026-10-27 06:26:24'),('405492ce-c8c4-45e5-bf9d-420c8850482d','88f558db-5b1d-479c-928a-47f1fa5da23d','direct_1793012653918@example.com','Direct Fleet 1793012653918','d6a2378360addda25dbc8482cd999d0d348f779f8b950f1bc767c7ef4b373499','2026-10-27 11:04:13',NULL,0,'2026-10-26 11:04:13','2026-10-26 11:04:13'),('580e256e-3b4f-4d4d-be51-179e8dd68052','400f6d65-2390-4bf3-8c22-b897976d514e','direct_1793011744228@example.com','Direct Fleet 1793011744228','11afc4f7f4bff199f8eca1aca2a64c753d65b047d7c5d2c65c8687c39dd43145','2026-10-27 10:49:04',NULL,0,'2026-10-26 10:49:04','2026-10-26 10:49:04'),('5b8f182e-bdd7-45bf-a13f-482160527314','de9d4370-779d-4bd9-8a8b-241168061f63','direct_1793012706237@example.com','Direct Fleet 1793012706237','11c48ee6fd20ccb74fa7e76dc523397ad3499893180be62fb1b55847c890f7e1','2026-10-27 11:05:06',NULL,0,'2026-10-26 11:05:06','2026-10-26 11:05:06'),('5c3002ac-f429-466a-9929-b1aa920580c9','48a79c2c-150a-4e54-8b52-807f647d6d73','direct_1793011769326@example.com','Direct Fleet 1793011769326','83026c59afa00e7e0794f132a06ff457cdeefb7814a1cccc18c904664e0ed41f','2026-10-27 10:49:29',NULL,0,'2026-10-26 10:49:29','2026-10-26 10:49:29'),('74ef4a55-d897-47db-9b6f-a405a9aca95d','e50a37d2-f716-467c-b6c5-ef9656060d3d','direct_1793011582026@example.com','Direct Fleet 1793011582026','4a51da7a609eede931aca276a53ae5aef00a3abfea59d1b785434edf391b57c3','2026-10-27 10:46:22',NULL,0,'2026-10-26 10:46:22','2026-10-26 10:46:22'),('7769a985-c911-44b0-8d8c-d268d0087399','f76680e7-acf7-4214-a39c-4d4c070f65b1','direct_1793012788215@example.com','Direct Fleet 1793012788215','26827094b65f30fbc637c63024eba8b9cd5c5270620a949a642948b497c3c82b','2026-10-27 11:06:28',NULL,0,'2026-10-26 11:06:28','2026-10-26 11:06:28'),('79e51413-650f-4bf9-843e-050686dfbda2','bc102a2e-f2e9-404b-86db-3ff2b1535b64','cosmic-1792997998924@example.com','Karan Mehra','fe4ad389710ab4293221eed926334274adf83c6ad26ee8dba3f8ab7424e30d0e','2026-10-27 06:59:59',NULL,0,'2026-10-26 06:59:59','2026-10-26 06:59:59'),('81680ee8-69e7-4025-ada1-d6632e4924d0','76cee6fb-3d8c-430f-a8e4-c1ea14542050','direct_1793013220844@example.com','Direct Fleet 1793013220844','8efad4285a7a313d256399095d7b75344443bbc39ea308226377bf4857df3e9b','2026-10-27 11:13:40',NULL,0,'2026-10-26 11:13:40','2026-10-26 11:13:40'),('90bee154-06cd-482c-b9ea-94de1adea544','ec9fb839-a5e6-4025-95d9-5b0ac17ab8df','direct_1793012337034@example.com','Direct Fleet 1793012337034','5d2992012b0079511e060a46b026532b6ae2ae59028e58db27d4bc892cf4ec98','2026-10-27 10:58:57',NULL,0,'2026-10-26 10:58:57','2026-10-26 10:58:57'),('943d0d57-e9f0-447f-846a-7ca75cf909b1','f5101119-65a7-4959-a682-d45938b161c2','direct_1793089343420@example.com','Direct Fleet 1793089343420','edca97737c66fd1256911c86ed3441f2780e93fdaf9b63a8686d20bab0295eed','2026-10-28 08:22:23',NULL,0,'2026-10-27 08:22:23','2026-10-27 08:22:23'),('b482ab96-bcad-49b8-8b49-ecc532877e32','06df8157-f143-4da2-954c-b4b4a0754a80','direct_1793012203359@example.com','Direct Fleet 1793012203359','6063da2ec0fc73ef7e368b6726beb825f45c560dbf2cdbd837d47b2b87545584','2026-10-27 10:56:43',NULL,0,'2026-10-26 10:56:43','2026-10-26 10:56:43'),('b96f68a5-a267-4fc0-b3c1-2dc20e42324b','3b80ee47-fc07-4f1f-8350-54fb5182e4c9','direct_1793077354095@example.com','Direct Fleet 1793077354095','d4af36fc6f6b226963060cf87561eb928455f155ca1e0bada6ab139ea92fa9f1','2026-10-28 05:02:34',NULL,0,'2026-10-27 05:02:34','2026-10-27 05:02:34'),('bb2b22fe-b8e2-423a-9965-5c5e991da081','ada467ee-14ca-4f9f-8cfc-56a5c6e93267','direct_1793012424957@example.com','Direct Fleet 1793012424957','9fb01959a3ec345350c747cf2cf1f80d3f8d147436ea8cd334da768092153fbd','2026-10-27 11:00:25',NULL,0,'2026-10-26 11:00:25','2026-10-26 11:00:25'),('be3f4f83-b9a5-4eaa-bf1f-f28eb9156be5','0e5d09bb-da06-459e-a99f-e397522a36f7','cosmic-1792997835216@example.com','Karan Mehra','cf98c55d2e5df9097c01b1b8f540faca8ccd84bd788ec8d1f1113402f2130095','2026-10-27 06:57:15',NULL,0,'2026-10-26 06:57:15','2026-10-26 06:57:15'),('becd3388-6478-4e34-914d-0a0b0349686c','aab57fb6-54fd-4a08-9553-c1771dc94612','direct_1793012917361@example.com','Direct Fleet 1793012917361','6cae4eb18f5be981aa0f9c336ec46fb6a10a6533ba39023dbcebe61e9229dbc9','2026-10-27 11:08:37',NULL,0,'2026-10-26 11:08:37','2026-10-26 11:08:37'),('c66e6895-3a0c-404f-9212-6fc5dfb28d50','b84a1dc8-afdf-433d-afad-2aa2465a8be7','cosmic-1792998352879@example.com','Karan Mehra','5c10c148cd9b174277c9cc7f239e1a23ba5db41017fcbdd52ba3656e0fa17952','2026-10-27 07:05:53',NULL,0,'2026-10-26 07:05:53','2026-10-26 07:05:53'),('cba2f36a-9f38-46d7-88e8-724105643c56','f9243fc5-fa39-418d-b4f7-416965eb34b9','direct_1793011690084@example.com','Direct Fleet 1793011690084','5d4f93c21807cdb6d9d4c090c18e45c9cab0ea4ab005d055dbbb062a9710dc25','2026-10-27 10:48:10',NULL,0,'2026-10-26 10:48:10','2026-10-26 10:48:10'),('d05342d5-58bc-40f8-835c-10cc8c8885a3','027bb9d5-b665-473f-95ae-ed58e0054811','subipcs@gmail.com','ganthi','6e764f049967846f14f9ce5a2395bb07add20c59ed9276bb031e57d532ae3ef7','2026-10-27 09:45:09','2026-10-26 09:46:29',0,'2026-10-26 09:45:09','2026-10-26 09:46:29'),('d34d72f3-134d-48d8-8e61-17588e2513a8','d93c22fe-4a1c-46a6-a902-83abb963886d','direct_1793079237524@example.com','Direct Fleet 1793079237524','be02aca24ee5cd3f14a5bc5a442870e4fe7e0ffeeb97acd75324ee9c8c8d454b','2026-10-28 05:33:57',NULL,0,'2026-10-27 05:33:57','2026-10-27 05:33:57'),('df043faa-30e7-40ed-a7a9-0a2781be699e','2f3261a0-0ba0-4ce4-a0a6-9168a9aed68a','direct_1793011936886@example.com','Direct Fleet 1793011936886','39eecf0618d05776d5c0c36d3eeb7fdbaeebe500d514f63fcc27f1104cef572a','2026-10-27 10:52:16',NULL,0,'2026-10-26 10:52:16','2026-10-26 10:52:16'),('eb23244d-f9a3-4138-a9be-bbf9446b0d0a','cfa950ac-ad3e-4869-a88d-db11c2df302b','direct_1793011971856@example.com','Direct Fleet 1793011971856','519a4b68d3a50732ab793cf2fe95b43584d8b6e295be18b2db9e3666bda08c30','2026-10-27 10:52:51',NULL,0,'2026-10-26 10:52:51','2026-10-26 10:52:51'),('ed5c4167-c9ac-4bef-b8d7-c1c37ca189ff','60c05b9e-ac6c-47c0-9343-e31b2eba7897','direct_1793012150497@example.com','Direct Fleet 1793012150497','794ddb671c428a1b15d10df54e4d26c02deb03e07b1206941918e19790930a4d','2026-10-27 10:55:50',NULL,0,'2026-10-26 10:55:50','2026-10-26 10:55:50'),('fa88410e-d706-47e4-a414-302cc2242a7b','6b01d3e6-6551-40a6-80e1-5c516bdb1101','subisha2002.m@gmail.com','murugan','2658e1fe03c59223708586a69a82df04d35b433fd9d3563106520e046075a4dd','2026-10-27 09:41:33',NULL,0,'2026-10-26 09:41:33','2026-10-26 09:41:33'),('fcfe37ca-81ee-4113-aa2f-82e6e4452764','735dca32-4751-4843-b907-5d3cb08c435e','direct_1793012369837@example.com','Direct Fleet 1793012369837','e436eb1d945f08f3ad8020b3d7e27e8c1e911413d1ca4f17c7ce1b6ef6eca6ba','2026-10-27 10:59:29',NULL,0,'2026-10-26 10:59:29','2026-10-26 10:59:29'),('fd3ca848-7dfb-430a-bca4-74ed8c45d5be','ab56c8c9-cfaf-4a4a-ac85-060901910390','cosmic-1792997602281@example.com','Karan Mehra','5d2ac6a5eea30115c8e4ce13dcf39d47f16b221f808a5c29b80cf22d550d2a00','2026-10-27 06:53:22',NULL,0,'2026-10-26 06:53:22','2026-10-26 06:53:22');
/*!40000 ALTER TABLE `tenant_activation_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenant_initial_allowance`
--

DROP TABLE IF EXISTS `tenant_initial_allowance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenant_initial_allowance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenantId` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `module` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `usedCount` int NOT NULL DEFAULT '1',
  `firstUsedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lastUsedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tenant_module` (`tenantId`,`module`),
  KEY `idx_allowance_tenant` (`tenantId`)
) ENGINE=InnoDB AUTO_INCREMENT=130 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_initial_allowance`
--

LOCK TABLES `tenant_initial_allowance` WRITE;
/*!40000 ALTER TABLE `tenant_initial_allowance` DISABLE KEYS */;
INSERT INTO `tenant_initial_allowance` VALUES (1,'ee497c22-bd54-46d9-aef0-2fee2092e4d6','VEHICLES',1,'2026-10-26 10:52:17','2026-10-26 10:52:17'),(2,'7167a639-c5e9-4b87-9e19-b5343a249ff6','VEHICLES',1,'2026-10-26 10:52:52','2026-10-26 10:52:52'),(3,'bb245216-06d4-44cf-8771-7c2cbdb4caf6','VEHICLES',1,'2026-10-26 10:53:53','2026-10-26 10:53:53'),(4,'531837cf-e639-4f92-8025-a6e11b7935bb','VEHICLES',1,'2026-10-26 10:55:18','2026-10-26 10:55:18'),(5,'531837cf-e639-4f92-8025-a6e11b7935bb','COMPANIES',1,'2026-10-26 10:55:18','2026-10-26 10:55:18'),(6,'59a0185e-a748-43d5-857f-e5033068dba3','VEHICLES',1,'2026-10-26 10:55:18','2026-10-26 10:55:18'),(11,'50717437-1869-49e6-b8b5-dbc3453571f0','VEHICLES',1,'2026-10-26 10:55:50','2026-10-26 10:55:50'),(12,'50717437-1869-49e6-b8b5-dbc3453571f0','COMPANIES',1,'2026-10-26 10:55:50','2026-10-26 10:55:50'),(13,'51154808-6063-460c-8d27-520fb7658994','VEHICLES',1,'2026-10-26 10:55:50','2026-10-26 10:55:50'),(18,'7a79db14-42c3-4bf8-a32d-fc2c71ae6431','VEHICLES',1,'2026-10-26 10:56:43','2026-10-26 10:56:43'),(19,'7a79db14-42c3-4bf8-a32d-fc2c71ae6431','COMPANIES',1,'2026-10-26 10:56:43','2026-10-26 10:56:43'),(20,'70adcfea-e31d-4d01-b09a-50c20f23d02b','VEHICLES',1,'2026-10-26 10:56:43','2026-10-26 10:56:43'),(25,'9555e488-f206-41df-9d36-1cacbdb5ee45','VEHICLES',1,'2026-10-26 10:58:57','2026-10-26 10:58:57'),(26,'9555e488-f206-41df-9d36-1cacbdb5ee45','COMPANIES',1,'2026-10-26 10:58:57','2026-10-26 10:58:57'),(27,'e3714a2e-f85a-4848-9cd2-1a5bfce0782a','VEHICLES',1,'2026-10-26 10:58:57','2026-10-26 10:58:57'),(32,'c0d2223e-ff29-4d73-a6c1-4eec5ed203ba','VEHICLES',1,'2026-10-26 10:59:30','2026-10-26 10:59:30'),(33,'c0d2223e-ff29-4d73-a6c1-4eec5ed203ba','COMPANIES',1,'2026-10-26 10:59:30','2026-10-26 10:59:30'),(34,'971d5f55-000c-42a5-99d7-847f558030ab','VEHICLES',1,'2026-10-26 10:59:30','2026-10-26 10:59:30'),(39,'d3740a34-464f-4e2e-b8c9-19605fe92861','VEHICLES',1,'2026-10-26 11:00:25','2026-10-26 11:00:25'),(40,'d3740a34-464f-4e2e-b8c9-19605fe92861','COMPANIES',1,'2026-10-26 11:00:25','2026-10-26 11:00:25'),(41,'6ce01506-2fc2-4b10-9ea1-bfca2f1cf6d9','VEHICLES',1,'2026-10-26 11:00:25','2026-10-26 11:00:25'),(46,'594d4f70-4c89-42a4-88e9-a6d383b7f18f','VEHICLES',1,'2026-10-26 11:01:12','2026-10-26 11:01:12'),(47,'594d4f70-4c89-42a4-88e9-a6d383b7f18f','COMPANIES',1,'2026-10-26 11:01:12','2026-10-26 11:01:12'),(48,'a784fac0-0d30-4702-9f58-1f8225da5f3c','VEHICLES',1,'2026-10-26 11:01:13','2026-10-26 11:01:13'),(53,'907eb507-feb7-4349-b931-e269dcf8711d','VEHICLES',1,'2026-10-26 11:04:14','2026-10-26 11:04:14'),(54,'907eb507-feb7-4349-b931-e269dcf8711d','COMPANIES',1,'2026-10-26 11:04:14','2026-10-26 11:04:14'),(55,'a2d742c4-5599-482b-8fe4-84700f5b3e8b','VEHICLES',1,'2026-10-26 11:04:14','2026-10-26 11:04:14'),(60,'c2b5a6d2-8565-4d83-a7b7-4b6135acfe2e','VEHICLES',1,'2026-10-26 11:05:06','2026-10-26 11:05:06'),(61,'c2b5a6d2-8565-4d83-a7b7-4b6135acfe2e','COMPANIES',1,'2026-10-26 11:05:06','2026-10-26 11:05:06'),(62,'d79536bf-9fbc-4f30-8fb6-8418f8387b4d','VEHICLES',1,'2026-10-26 11:05:06','2026-10-26 11:05:06'),(67,'4fbcd6ad-61b0-4ee7-9a10-51879e4aede9','VEHICLES',1,'2026-10-26 11:06:28','2026-10-26 11:06:28'),(68,'4fbcd6ad-61b0-4ee7-9a10-51879e4aede9','COMPANIES',1,'2026-10-26 11:06:28','2026-10-26 11:06:28'),(69,'1409083b-bc3a-477f-9768-2ff2eef1c877','VEHICLES',1,'2026-10-26 11:06:28','2026-10-26 11:06:28'),(74,'72cb90df-c8bb-4a68-a14b-97d9066643b5','VEHICLES',1,'2026-10-26 11:07:11','2026-10-26 11:07:11'),(75,'72cb90df-c8bb-4a68-a14b-97d9066643b5','COMPANIES',1,'2026-10-26 11:07:11','2026-10-26 11:07:11'),(76,'416b880c-4a51-4df0-b1d8-cb6f344aea8d','VEHICLES',1,'2026-10-26 11:07:11','2026-10-26 11:07:11'),(81,'3e3ac612-ec08-46ad-8e38-634f67878e3a','VEHICLES',1,'2026-10-26 11:08:37','2026-10-26 11:08:37'),(82,'3e3ac612-ec08-46ad-8e38-634f67878e3a','COMPANIES',1,'2026-10-26 11:08:37','2026-10-26 11:08:37'),(83,'067bf9a4-3ac0-4294-8b29-4a45697fba2f','VEHICLES',1,'2026-10-26 11:08:37','2026-10-26 11:08:37'),(88,'11b60fbd-1b26-4cf2-837f-0d60f68b7a06','VEHICLES',1,'2026-10-26 11:12:59','2026-10-26 11:12:59'),(89,'11b60fbd-1b26-4cf2-837f-0d60f68b7a06','COMPANIES',1,'2026-10-26 11:12:59','2026-10-26 11:12:59'),(90,'831f577b-d063-4260-9b05-a567599bec10','VEHICLES',1,'2026-10-26 11:12:59','2026-10-26 11:12:59'),(95,'00336a35-b499-4f29-8311-3a9ca67ff43d','VEHICLES',1,'2026-10-26 11:13:41','2026-10-26 11:13:41'),(96,'00336a35-b499-4f29-8311-3a9ca67ff43d','COMPANIES',1,'2026-10-26 11:13:41','2026-10-26 11:13:41'),(97,'0117af5a-ef34-4798-a6c5-d5440c811d0e','VEHICLES',1,'2026-10-26 11:13:41','2026-10-26 11:13:41'),(102,'84d4cfab-e4aa-48f1-aa7a-f4ed4ad3f2d3','VEHICLES',1,'2026-10-27 05:02:35','2026-10-27 05:02:35'),(103,'84d4cfab-e4aa-48f1-aa7a-f4ed4ad3f2d3','COMPANIES',1,'2026-10-27 05:02:35','2026-10-27 05:02:35'),(104,'f6c8c79c-7a77-4473-9cf6-9106b7df2ee7','VEHICLES',1,'2026-10-27 05:02:35','2026-10-27 05:02:35'),(109,'8c0e1bbc-bc5d-43b6-b1b7-4579226d1789','VEHICLES',1,'2026-10-27 05:33:58','2026-10-27 05:33:58'),(110,'8c0e1bbc-bc5d-43b6-b1b7-4579226d1789','COMPANIES',1,'2026-10-27 05:33:58','2026-10-27 05:33:58'),(111,'9fdc26c3-64b3-4c6b-8139-a2d33273a542','VEHICLES',1,'2026-10-27 05:33:58','2026-10-27 05:33:58'),(116,'df68e4a7-a776-4b75-b265-908dd6cf572d','VEHICLES',1,'2026-10-27 06:26:24','2026-10-27 06:26:24'),(117,'df68e4a7-a776-4b75-b265-908dd6cf572d','COMPANIES',1,'2026-10-27 06:26:24','2026-10-27 06:26:24'),(118,'438ad98c-7797-4a23-bc3a-9b7e2a2b1b89','VEHICLES',1,'2026-10-27 06:26:24','2026-10-27 06:26:24'),(123,'947137fb-2d6a-4d64-be86-af111ae6edca','VEHICLES',1,'2026-10-27 08:22:23','2026-10-27 08:22:23'),(124,'947137fb-2d6a-4d64-be86-af111ae6edca','COMPANIES',1,'2026-10-27 08:22:23','2026-10-27 08:22:23'),(125,'630999b4-e63d-4baf-9b75-2536bc8bb057','VEHICLES',1,'2026-10-27 08:22:23','2026-10-27 08:22:23');
/*!40000 ALTER TABLE `tenant_initial_allowance` ENABLE KEYS */;
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
  `slug` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
INSERT INTO `tenant_registration_requests` VALUES ('0756ed27-3f28-4721-b44e-88d1f60e3b4e','Express Fleet 1793012032524','express-fleet-9','Express Fleet Logistics Pvt Ltd','Express Fleet','77 Anna Salai, Chennai, Tamil Nadu 600002','33AABCE1234F1Z5','AABCE1234F','996601',NULL,'vikram_1793012032524@example.com','9840123456',NULL,'EXP2524','Vikram Singh','vikram_1793012032524@example.com','9840123456','Chennai','Tamil Nadu','600002',NULL,'PRO','MONTHLY','1-15','PENDING',NULL,NULL,NULL,NULL,NULL,1,'2026-10-26 10:53:52','2026-10-27 04:57:14',1),('0ae71e34-1d9b-417c-9709-0f8a75226399','Express Fleet 1793011971383','express-fleet-8','Express Fleet Logistics Pvt Ltd','Express Fleet','77 Anna Salai, Chennai, Tamil Nadu 600002','33AABCE1234F1Z5','AABCE1234F','996601',NULL,'vikram_1793011971383@example.com','9840123456',NULL,'EXP1383','Vikram Singh','vikram_1793011971383@example.com','9840123456','Chennai','Tamil Nadu','600002',NULL,'PRO','MONTHLY','1-15','PENDING',NULL,NULL,NULL,NULL,NULL,1,'2026-10-26 10:52:51','2026-10-26 10:52:51',0),('15a38e48-dce0-443c-85c2-7655c200b35e','Rejected Fleet Corp',NULL,NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,'REJ490','Vijay Kumar','reject-1792998353935@example.com','9988776611','Bangalore','Karnataka',NULL,NULL,'BASIC','MONTHLY',NULL,'REJECTED','Incomplete commercial fleet registration documents provided.',NULL,'SuperAdmin','2026-10-26 07:05:53',NULL,1,'2026-10-26 07:05:53','2026-10-26 07:05:53',0),('18f07193-0fe9-4e8c-9415-252e79a2c8e0','Cosmic Cabs Logistics',NULL,'Cosmic Cabs Logistics LLP','Cosmic Cabs Logistics','77 Cosmic Tower, Bangalore','29ABCDE1234F1Z8','ABCDE1234F','996601',NULL,'cosmic-1792997602281@example.com','9988776655',NULL,'CSM680','Karan Mehra','cosmic-1792997602281@example.com','9988776655','Bangalore','Karnataka',NULL,NULL,'PRO','ANNUAL','1-15','APPROVED',NULL,'Application reviewed and approved.','SuperAdmin','2026-10-26 06:53:25','ab56c8c9-cfaf-4a4a-ac85-060901910390',1,'2026-10-26 06:53:22','2026-10-26 06:53:25',0),('216822cf-c867-44b1-90ca-23f0f8d264aa','Rejected Fleet Corp',NULL,NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,'REJ511','Vijay Kumar','reject-1792997999475@example.com','9988776611','Bangalore','Karnataka',NULL,NULL,'BASIC','MONTHLY',NULL,'REJECTED','Incomplete commercial fleet registration documents provided.',NULL,'SuperAdmin','2026-10-26 06:59:59',NULL,1,'2026-10-26 06:59:59','2026-10-26 06:59:59',0),('23788935-d2b7-4cd8-a46e-7a175154ee79','Rejected Fleet Corp',NULL,NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,'REJ175','Vijay Kumar','reject-1792998117685@example.com','9988776611','Bangalore','Karnataka',NULL,NULL,'BASIC','MONTHLY',NULL,'REJECTED','Incomplete commercial fleet registration documents provided.',NULL,'SuperAdmin','2026-10-26 07:01:57',NULL,1,'2026-10-26 07:01:57','2026-10-26 07:01:57',0),('249b5aca-e830-416a-b7f2-5fee7ff8d6b3','Express Fleet 1793077353503','express-fleet-24','Express Fleet Logistics Pvt Ltd','Express Fleet','77 Anna Salai, Chennai, Tamil Nadu 600002','33AABCE1234F1Z5','AABCE1234F','996601',NULL,'vikram_1793077353503@example.com','9840123456',NULL,'EXP3503','Vikram Singh','vikram_1793077353503@example.com','9840123456','Chennai','Tamil Nadu','600002',NULL,'PRO','MONTHLY','1-15','PENDING',NULL,NULL,NULL,NULL,NULL,1,'2026-10-27 05:02:33','2026-10-27 05:02:33',0),('2835d294-5519-43d1-8b07-b60709dc3989','Express Fleet 1793079236729','express-fleet-25','Express Fleet Logistics Pvt Ltd','Express Fleet','77 Anna Salai, Chennai, Tamil Nadu 600002','33AABCE1234F1Z5','AABCE1234F','996601',NULL,'vikram_1793079236729@example.com','9840123456',NULL,'EXP6729','Vikram Singh','vikram_1793079236729@example.com','9840123456','Chennai','Tamil Nadu','600002',NULL,'PRO','MONTHLY','1-15','PENDING',NULL,NULL,NULL,NULL,NULL,1,'2026-10-27 05:33:57','2026-10-27 05:33:57',0),('2b349378-ac99-484d-a5b1-ff8bf0359fb8','Express Fleet 1793011936321','express-fleet-7','Express Fleet Logistics Pvt Ltd','Express Fleet','77 Anna Salai, Chennai, Tamil Nadu 600002','33AABCE1234F1Z5','AABCE1234F','996601',NULL,'vikram_1793011936321@example.com','9840123456',NULL,'EXP6321','Vikram Singh','vikram_1793011936321@example.com','9840123456','Chennai','Tamil Nadu','600002',NULL,'PRO','MONTHLY','1-15','PENDING',NULL,NULL,NULL,NULL,NULL,1,'2026-10-26 10:52:16','2026-10-26 10:52:16',0),('36fb2a3d-0e01-4ed5-b2f5-159c3239f9d7','Express Fleet 1793013220545','express-fleet-23','Express Fleet Logistics Pvt Ltd','Express Fleet','77 Anna Salai, Chennai, Tamil Nadu 600002','33AABCE1234F1Z5','AABCE1234F','996601',NULL,'vikram_1793013220545@example.com','9840123456',NULL,'EXP0545','Vikram Singh','vikram_1793013220545@example.com','9840123456','Chennai','Tamil Nadu','600002',NULL,'PRO','MONTHLY','1-15','PENDING',NULL,NULL,NULL,NULL,NULL,1,'2026-10-26 11:13:40','2026-10-26 11:13:40',0),('390344c9-3bcc-494a-a3a4-a73bcfbf811b','Express Fleet 1793011743709','express-fleet-4','Express Fleet Logistics Pvt Ltd','Express Fleet','77 Anna Salai, Chennai, Tamil Nadu 600002','33AABCE1234F1Z5','AABCE1234F','996601',NULL,'vikram_1793011743709@example.com','9840123456',NULL,'EXP3709','Vikram Singh','vikram_1793011743709@example.com','9840123456','Chennai','Tamil Nadu','600002',NULL,'PRO','MONTHLY','1-15','PENDING',NULL,NULL,NULL,NULL,NULL,1,'2026-10-26 10:49:03','2026-10-26 10:49:03',0),('3af4beea-d5e8-43cb-997b-d8a38cab45e7','Express Fleet 1793012705745','express-fleet-18','Express Fleet Logistics Pvt Ltd','Express Fleet','77 Anna Salai, Chennai, Tamil Nadu 600002','33AABCE1234F1Z5','AABCE1234F','996601',NULL,'vikram_1793012705745@example.com','9840123456',NULL,'EXP5745','Vikram Singh','vikram_1793012705745@example.com','9840123456','Chennai','Tamil Nadu','600002',NULL,'PRO','MONTHLY','1-15','PENDING',NULL,NULL,NULL,NULL,NULL,1,'2026-10-26 11:05:05','2026-10-26 11:05:05',0),('43e6146c-005b-48fc-a524-f9dda385cbfa','Express Fleet 1793012652771','express-fleet-17','Express Fleet Logistics Pvt Ltd','Express Fleet','77 Anna Salai, Chennai, Tamil Nadu 600002','33AABCE1234F1Z5','AABCE1234F','996601',NULL,'vikram_1793012652771@example.com','9840123456',NULL,'EXP2771','Vikram Singh','vikram_1793012652771@example.com','9840123456','Chennai','Tamil Nadu','600002',NULL,'PRO','MONTHLY','1-15','PENDING',NULL,NULL,NULL,NULL,NULL,1,'2026-10-26 11:04:12','2026-10-26 11:04:12',0),('476c0a33-7cb0-4a61-86d5-d1011e64e4a0','Express Fleet 1793011769019','express-fleet-5','Express Fleet Logistics Pvt Ltd','Express Fleet','77 Anna Salai, Chennai, Tamil Nadu 600002','33AABCE1234F1Z5','AABCE1234F','996601',NULL,'vikram_1793011769019@example.com','9840123456',NULL,'EXP9019','Vikram Singh','vikram_1793011769019@example.com','9840123456','Chennai','Tamil Nadu','600002',NULL,'PRO','MONTHLY','1-15','PENDING',NULL,NULL,NULL,NULL,NULL,1,'2026-10-26 10:49:29','2026-10-26 10:49:29',0),('4e81e131-0e43-4251-a4e4-153b4174ecd6','Express Fleet 1793011689665','express-fleet-3','Express Fleet Logistics Pvt Ltd','Express Fleet','77 Anna Salai, Chennai, Tamil Nadu 600002','33AABCE1234F1Z5','AABCE1234F','996601',NULL,'vikram_1793011689665@example.com','9840123456',NULL,'EXP9665','Vikram Singh','vikram_1793011689665@example.com','9840123456','Chennai','Tamil Nadu','600002',NULL,'PRO','MONTHLY','1-15','PENDING',NULL,NULL,NULL,NULL,NULL,1,'2026-10-26 10:48:09','2026-10-26 10:48:09',0),('55af89e4-d565-4b83-92c9-de15cf7f4352','Cosmic Cabs Logistics',NULL,'Cosmic Cabs Logistics LLP','Cosmic Cabs Logistics','77 Cosmic Tower, Bangalore','29ABCDE1234F1Z8','ABCDE1234F','996601',NULL,'cosmic-1792998352879@example.com','9988776655',NULL,'CSM520','Karan Mehra','cosmic-1792998352879@example.com','9988776655','Bangalore','Karnataka',NULL,NULL,'PRO','ANNUAL','1-15','APPROVED',NULL,'Application reviewed and approved.','SuperAdmin','2026-10-26 07:05:56','b84a1dc8-afdf-433d-afad-2aa2465a8be7',1,'2026-10-26 07:05:52','2026-10-26 07:05:56',0),('55b8cf49-dd8e-49b9-aa09-2c723dcb91f1','Express Fleet 1793012830925','express-fleet-20','Express Fleet Logistics Pvt Ltd','Express Fleet','77 Anna Salai, Chennai, Tamil Nadu 600002','33AABCE1234F1Z5','AABCE1234F','996601',NULL,'vikram_1793012830925@example.com','9840123456',NULL,'EXP0925','Vikram Singh','vikram_1793012830925@example.com','9840123456','Chennai','Tamil Nadu','600002',NULL,'PRO','MONTHLY','1-15','PENDING',NULL,NULL,NULL,NULL,NULL,1,'2026-10-26 11:07:10','2026-10-26 11:07:10',0),('5a9b1cec-e114-46d3-8b13-fd1b7ca02e27','Express Fleet 1793012424601','express-fleet-15','Express Fleet Logistics Pvt Ltd','Express Fleet','77 Anna Salai, Chennai, Tamil Nadu 600002','33AABCE1234F1Z5','AABCE1234F','996601',NULL,'vikram_1793012424601@example.com','9840123456',NULL,'EXP4601','Vikram Singh','vikram_1793012424601@example.com','9840123456','Chennai','Tamil Nadu','600002',NULL,'PRO','MONTHLY','1-15','PENDING',NULL,NULL,NULL,NULL,NULL,1,'2026-10-26 11:00:24','2026-10-26 11:00:24',0),('6883909b-5172-4fcc-917f-3a97e1e9ae9f','Cosmic Cabs Logistics',NULL,'Cosmic Cabs Logistics LLP','Cosmic Cabs Logistics','77 Cosmic Tower, Bangalore','29ABCDE1234F1Z8','ABCDE1234F','996601',NULL,'cosmic-1792997835216@example.com','9988776655',NULL,'CSM103','Karan Mehra','cosmic-1792997835216@example.com','9988776655','Bangalore','Karnataka',NULL,NULL,'PRO','ANNUAL','1-15','APPROVED',NULL,'Application reviewed and approved.','SuperAdmin','2026-10-26 06:57:19','0e5d09bb-da06-459e-a99f-e397522a36f7',1,'2026-10-26 06:57:15','2026-10-26 06:57:19',0),('751d1889-6b7e-4e70-865c-02073ee08ffc','Express Fleet 1793012787569','express-fleet-19','Express Fleet Logistics Pvt Ltd','Express Fleet','77 Anna Salai, Chennai, Tamil Nadu 600002','33AABCE1234F1Z5','AABCE1234F','996601',NULL,'vikram_1793012787569@example.com','9840123456',NULL,'EXP7569','Vikram Singh','vikram_1793012787569@example.com','9840123456','Chennai','Tamil Nadu','600002',NULL,'PRO','MONTHLY','1-15','PENDING',NULL,NULL,NULL,NULL,NULL,1,'2026-10-26 11:06:27','2026-10-26 11:06:27',0),('75a66013-4340-4815-8992-bb2908692377','Express Fleet 1793012472197','express-fleet-16','Express Fleet Logistics Pvt Ltd','Express Fleet','77 Anna Salai, Chennai, Tamil Nadu 600002','33AABCE1234F1Z5','AABCE1234F','996601',NULL,'vikram_1793012472197@example.com','9840123456',NULL,'EXP2197','Vikram Singh','vikram_1793012472197@example.com','9840123456','Chennai','Tamil Nadu','600002',NULL,'PRO','MONTHLY','1-15','PENDING',NULL,NULL,NULL,NULL,NULL,1,'2026-10-26 11:01:12','2026-10-26 11:01:12',0),('79f2122c-f496-42fb-bbf6-58d1551126a0','Express Fleet 1793012369442','express-fleet-14','Express Fleet Logistics Pvt Ltd','Express Fleet','77 Anna Salai, Chennai, Tamil Nadu 600002','33AABCE1234F1Z5','AABCE1234F','996601',NULL,'vikram_1793012369442@example.com','9840123456',NULL,'EXP9442','Vikram Singh','vikram_1793012369442@example.com','9840123456','Chennai','Tamil Nadu','600002',NULL,'PRO','MONTHLY','1-15','PENDING',NULL,NULL,NULL,NULL,NULL,1,'2026-10-26 10:59:29','2026-10-26 10:59:29',0),('8211380a-11d6-4f8b-a16a-39b650fe5566','Express Fleet 1793089343306','express-fleet-27','Express Fleet Logistics Pvt Ltd','Express Fleet','77 Anna Salai, Chennai, Tamil Nadu 600002','33AABCE1234F1Z5','AABCE1234F','996601',NULL,'vikram_1793089343306@example.com','9840123456',NULL,'EXP3306','Vikram Singh','vikram_1793089343306@example.com','9840123456','Chennai','Tamil Nadu','600002',NULL,'PRO','MONTHLY','1-15','PENDING',NULL,NULL,NULL,NULL,NULL,1,'2026-10-27 08:22:23','2026-10-27 08:22:23',0),('8b7d2a9f-490f-46fa-a4dc-e33875ca8f93','Express Fleet 1793011900485','express-fleet-6','Express Fleet Logistics Pvt Ltd','Express Fleet','77 Anna Salai, Chennai, Tamil Nadu 600002','33AABCE1234F1Z5','AABCE1234F','996601',NULL,'vikram_1793011900485@example.com','9840123456',NULL,'EXP0485','Vikram Singh','vikram_1793011900485@example.com','9840123456','Chennai','Tamil Nadu','600002',NULL,'PRO','MONTHLY','1-15','PENDING',NULL,NULL,NULL,NULL,NULL,1,'2026-10-26 10:51:40','2026-10-26 10:51:40',0),('9ccce871-bf9a-4ec9-b060-41fa5804a7bc','murugan',NULL,'Mm','murugan','ndjhqdidwqidwqwq','33AAACA1111A1Z1','AAACA1111A','996609','none','subisha2002.m@gmail.com','9080280818',NULL,'MURU','murugan','subisha2002.m@gmail.com','9080280818','chennai','tamil nadu','900024',NULL,'BASIC','MONTHLY','1-15','APPROVED',NULL,'Application reviewed and approved.','SuperAdmin','2026-10-26 09:41:36','6b01d3e6-6551-40a6-80e1-5c516bdb1101',1,'2026-10-26 09:39:07','2026-10-26 09:41:36',0),('b37078c2-df83-4aca-ac88-4b27e4337f92','Express Fleet 1793012336686','express-fleet-13','Express Fleet Logistics Pvt Ltd','Express Fleet','77 Anna Salai, Chennai, Tamil Nadu 600002','33AABCE1234F1Z5','AABCE1234F','996601',NULL,'vikram_1793012336686@example.com','9840123456',NULL,'EXP6686','Vikram Singh','vikram_1793012336686@example.com','9840123456','Chennai','Tamil Nadu','600002',NULL,'PRO','MONTHLY','1-15','PENDING',NULL,NULL,NULL,NULL,NULL,1,'2026-10-26 10:58:56','2026-10-26 10:58:56',0),('bb41984a-89c1-468b-9ffe-5aba27013bfe','Cosmic Cabs Logistics',NULL,'Cosmic Cabs Logistics LLP','Cosmic Cabs Logistics','77 Cosmic Tower, Bangalore','29ABCDE1234F1Z8','ABCDE1234F','996601',NULL,'cosmic-1792998058419@example.com','9988776655',NULL,'CSM813','Karan Mehra','cosmic-1792998058419@example.com','9988776655','Bangalore','Karnataka',NULL,NULL,'PRO','ANNUAL','1-15','APPROVED',NULL,'Application reviewed and approved.','SuperAdmin','2026-10-26 07:01:05','bc95b9f7-d75f-470c-b7f9-bc733eac8dc3',1,'2026-10-26 07:00:58','2026-10-26 07:01:05',0),('bbda2100-267a-4072-8a3e-6c57423b2dcb','Express Fleet 1793012117984','express-fleet-10','Express Fleet Logistics Pvt Ltd','Express Fleet','77 Anna Salai, Chennai, Tamil Nadu 600002','33AABCE1234F1Z5','AABCE1234F','996601',NULL,'vikram_1793012117984@example.com','9840123456',NULL,'EXP7984','Vikram Singh','vikram_1793012117984@example.com','9840123456','Chennai','Tamil Nadu','600002',NULL,'PRO','MONTHLY','1-15','PENDING',NULL,NULL,NULL,NULL,NULL,1,'2026-10-26 10:55:18','2026-10-26 10:55:18',0),('cc50372f-1e2d-4404-88c8-cc515970498c','Cosmic Cabs Logistics',NULL,'Cosmic Cabs Logistics LLP','Cosmic Cabs Logistics','77 Cosmic Tower, Bangalore','29ABCDE1234F1Z8','ABCDE1234F','996601',NULL,'cosmic-1792997998924@example.com','9988776655',NULL,'CSM943','Karan Mehra','cosmic-1792997998924@example.com','9988776655','Bangalore','Karnataka',NULL,NULL,'PRO','ANNUAL','1-15','APPROVED',NULL,'Application reviewed and approved.','SuperAdmin','2026-10-26 07:00:03','bc102a2e-f2e9-404b-86db-3ff2b1535b64',1,'2026-10-26 06:59:58','2026-10-26 07:00:03',0),('cd895f8b-f2ee-400e-8a80-3acad94e2374','Rejected Fleet Corp',NULL,NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,'REJ900','Vijay Kumar','reject-1792997835903@example.com','9988776611','Bangalore','Karnataka',NULL,NULL,'BASIC','MONTHLY',NULL,'REJECTED','Incomplete commercial fleet registration documents provided.',NULL,'SuperAdmin','2026-10-26 06:57:15',NULL,1,'2026-10-26 06:57:15','2026-10-26 06:57:15',0),('d2eb1314-b21b-4529-8ccf-c867899b5a91','Express Fleet 1793013178335','express-fleet-22','Express Fleet Logistics Pvt Ltd','Express Fleet','77 Anna Salai, Chennai, Tamil Nadu 600002','33AABCE1234F1Z5','AABCE1234F','996601',NULL,'vikram_1793013178335@example.com','9840123456',NULL,'EXP8335','Vikram Singh','vikram_1793013178335@example.com','9840123456','Chennai','Tamil Nadu','600002',NULL,'PRO','MONTHLY','1-15','PENDING',NULL,NULL,NULL,NULL,NULL,1,'2026-10-26 11:12:58','2026-10-26 11:12:58',0),('da1fa4fb-2043-4aaf-ba71-06e8b4751b36','Rejected Fleet Corp',NULL,NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,'REJ442','Vijay Kumar','reject-1792998060638@example.com','9988776611','Bangalore','Karnataka',NULL,NULL,'BASIC','MONTHLY',NULL,'REJECTED','Incomplete commercial fleet registration documents provided.',NULL,'SuperAdmin','2026-10-26 07:01:00',NULL,1,'2026-10-26 07:01:00','2026-10-26 07:01:00',0),('da242dc0-3387-4bca-91df-dae653e62741','Express Fleet 1793012202820','express-fleet-12','Express Fleet Logistics Pvt Ltd','Express Fleet','77 Anna Salai, Chennai, Tamil Nadu 600002','33AABCE1234F1Z5','AABCE1234F','996601',NULL,'vikram_1793012202820@example.com','9840123456',NULL,'EXP2820','Vikram Singh','vikram_1793012202820@example.com','9840123456','Chennai','Tamil Nadu','600002',NULL,'PRO','MONTHLY','1-15','PENDING',NULL,NULL,NULL,NULL,NULL,1,'2026-10-26 10:56:42','2026-10-26 10:56:42',0),('db1749cd-116f-4ede-add0-207b1de3f200','Express Fleet 1793012150094','express-fleet-11','Express Fleet Logistics Pvt Ltd','Express Fleet','77 Anna Salai, Chennai, Tamil Nadu 600002','33AABCE1234F1Z5','AABCE1234F','996601',NULL,'vikram_1793012150094@example.com','9840123456',NULL,'EXP0094','Vikram Singh','vikram_1793012150094@example.com','9840123456','Chennai','Tamil Nadu','600002',NULL,'PRO','MONTHLY','1-15','PENDING',NULL,NULL,NULL,NULL,NULL,1,'2026-10-26 10:55:50','2026-10-26 10:55:50',0),('dc15eda1-a4fb-4c31-9578-2aab4b73db89','Express Fleet 1793011634980','express-fleet-2','Express Fleet Logistics Pvt Ltd','Express Fleet','77 Anna Salai, Chennai, Tamil Nadu 600002','33AABCE1234F1Z5','AABCE1234F','996601',NULL,'vikram_1793011634980@example.com','9840123456',NULL,'EXP4980','Vikram Singh','vikram_1793011634980@example.com','9840123456','Chennai','Tamil Nadu','600002',NULL,'PRO','MONTHLY','1-15','PENDING',NULL,NULL,NULL,NULL,NULL,1,'2026-10-26 10:47:15','2026-10-26 10:47:15',0),('dc5c2122-2c91-477a-92de-3b754ce42aad','Express Fleet 1793011581497','express-fleet','Express Fleet Logistics Pvt Ltd','Express Fleet','77 Anna Salai, Chennai, Tamil Nadu 600002','33AABCE1234F1Z5','AABCE1234F','996601',NULL,'vikram_1793011581497@example.com','9840123456',NULL,'EXP1497','Vikram Singh','vikram_1793011581497@example.com','9840123456','Chennai','Tamil Nadu','600002',NULL,'PRO','MONTHLY','1-15','PENDING',NULL,NULL,NULL,NULL,NULL,1,'2026-10-26 10:46:21','2026-10-26 10:46:21',0),('dcd1b70d-bc0b-4ea7-8651-fb56e7a5329e','Ganthi',NULL,'ganthi','Ganthi',NULL,NULL,'AAACA1111A','996609','ganthi','subipcs@gmail.com','9080280818',NULL,'GAN','ganthi','subipcs@gmail.com','9080280818','chennai','tamil nadu','60032','data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAWgAAAFoCAYAAAB65WHVAAAQAElEQVR4Aex9B6BkVZH2Vzd27n55XpicmAAMDDlIkKCoGH5dXdfsmnbXVVfXnFbXtLqGNbuuOeecEEUFlAwDwzA5z5uXQ+e+6f/qvmkYUBAkvTf05VafVKdOnbp9vlO3Ts/DQOtqWaBlgZYFWhaYlRZoAfSsfCwtpVoWaFmgZQGgBdCtb0HLAi0LzE0LPAK0bgH0I+Aht6bYskDLAnPTAi2AnpvPraV1ywItCzwCLNAC6EfAQ25N8ZFogdacjwQLtAD6SHiKrTm0LNCywBFpgRZAH5GPtTWplgVaFjgSLNAC6CPhKbbmcF8t0OJvWWBOWKAF0HPiMbWUbFmgZYFHogVaAP1IfOqtObcs0LLAnLBAC6DnxGN6aJVsjdayQMsCs8MCLYCeHc+hpUXLAi0LtCzwZxZoAfSfmaRV0bJAywItC8','BASIC','MONTHLY','1-15','APPROVED',NULL,'Application reviewed and approved.','SuperAdmin','2026-10-26 09:45:12','027bb9d5-b665-473f-95ae-ed58e0054811',1,'2026-10-26 09:44:20','2026-10-26 09:45:12',0),('e4c64772-54b9-4406-9407-5af16782ed76','Express Fleet 1793012916924','express-fleet-21','Express Fleet Logistics Pvt Ltd','Express Fleet','77 Anna Salai, Chennai, Tamil Nadu 600002','33AABCE1234F1Z5','AABCE1234F','996601',NULL,'vikram_1793012916924@example.com','9840123456',NULL,'EXP6924','Vikram Singh','vikram_1793012916924@example.com','9840123456','Chennai','Tamil Nadu','600002',NULL,'PRO','MONTHLY','1-15','PENDING',NULL,NULL,NULL,NULL,NULL,1,'2026-10-26 11:08:36','2026-10-26 11:08:36',0),('e88fb9f3-23fd-4159-85d9-b585d4615290','Express Fleet 1793082383447','express-fleet-26','Express Fleet Logistics Pvt Ltd','Express Fleet','77 Anna Salai, Chennai, Tamil Nadu 600002','33AABCE1234F1Z5','AABCE1234F','996601',NULL,'vikram_1793082383447@example.com','9840123456',NULL,'EXP3447','Vikram Singh','vikram_1793082383447@example.com','9840123456','Chennai','Tamil Nadu','600002',NULL,'PRO','MONTHLY','1-15','PENDING',NULL,NULL,NULL,NULL,NULL,1,'2026-10-27 06:26:23','2026-10-27 06:26:23',0),('f32437fb-e46a-4f28-867c-49566989cf24','Rejected Fleet Corp',NULL,NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,'REJ781','Vijay Kumar','reject-1792997602663@example.com','9988776611','Bangalore','Karnataka',NULL,NULL,'BASIC','MONTHLY',NULL,'REJECTED','Incomplete commercial fleet registration documents provided.',NULL,'SuperAdmin','2026-10-26 06:53:22',NULL,1,'2026-10-26 06:53:22','2026-10-26 06:53:22',0),('fce6b829-a086-4729-b083-28b4ee1ed32c','Cosmic Cabs Logistics',NULL,'Cosmic Cabs Logistics LLP','Cosmic Cabs Logistics','77 Cosmic Tower, Bangalore','29ABCDE1234F1Z8','ABCDE1234F','996601',NULL,'cosmic-1792998117247@example.com','9988776655',NULL,'CSM251','Karan Mehra','cosmic-1792998117247@example.com','9988776655','Bangalore','Karnataka',NULL,NULL,'PRO','ANNUAL','1-15','APPROVED',NULL,'Application reviewed and approved.','SuperAdmin','2026-10-26 07:02:01','d36935f0-cabf-4458-b031-c662d48ebb28',1,'2026-10-26 07:01:57','2026-10-26 07:02:01',0);
/*!40000 ALTER TABLE `tenant_registration_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenant_sms_configs`
--

DROP TABLE IF EXISTS `tenant_sms_configs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenant_sms_configs` (
  `configId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `tenantId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `provider` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '2FACTOR',
  `encryptedApiKey` text COLLATE utf8mb4_unicode_ci,
  `apiKeyMasked` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `senderId` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'GRCCAB',
  `templateMappings` json DEFAULT NULL,
  `otpRoute` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OTP1',
  `status` enum('UNCONFIGURED','ACTIVE','INACTIVE','INVALID','TEST_FAILED','VERIFIED','PENDING_SUBSCRIPTION') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'UNCONFIGURED',
  `lastVerifiedAt` datetime DEFAULT NULL,
  `lastVerificationResult` json DEFAULT NULL,
  `isVerified` tinyint(1) NOT NULL DEFAULT '0',
  `isEnabled` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`configId`),
  UNIQUE KEY `tenantId` (`tenantId`),
  UNIQUE KEY `idx_tenant_sms_configs_tenant` (`tenantId`),
  CONSTRAINT `tenant_sms_configs_ibfk_1` FOREIGN KEY (`tenantId`) REFERENCES `tenants` (`tenantId`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_sms_configs`
--

LOCK TABLES `tenant_sms_configs` WRITE;
/*!40000 ALTER TABLE `tenant_sms_configs` DISABLE KEYS */;
INSERT INTO `tenant_sms_configs` VALUES ('524342ec-980a-47fc-b0f3-d912b376caf9','e7b8a1c0-0000-0000-0000-000000000001','2FACTOR','KMMd5hlO4EhR5Iq9:HDCx0QI2d/p0Z65qBsWZKQ==:S5AHRrZQqbb3z3xdr+5qAhJupTpFuepek2TWfvggUCmgAGHp','••••••••••••6042','GRCCAB',NULL,'OTP1','ACTIVE',NULL,NULL,1,1,'2026-10-29 10:15:58','2026-10-29 10:15:58');
/*!40000 ALTER TABLE `tenant_sms_configs` ENABLE KEYS */;
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
  `taxQuota` int NOT NULL DEFAULT '1',
  `isUnlimitedVehicles` tinyint(1) NOT NULL DEFAULT '0',
  `isUnlimitedTrips` tinyint(1) NOT NULL DEFAULT '0',
  `isUnlimitedTaxes` tinyint(1) NOT NULL DEFAULT '0',
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
INSERT INTO `tenant_subscriptions` VALUES ('06127955-ab0e-4efa-af33-9863ee2805d5','bb245216-06d4-44cf-8771-7c2cbdb4caf6','BASIC','TRIALING',15,15,5,1000,0,1000,NULL,NULL,NULL,'2026-10-26 10:53:53','2026-10-26 10:53:53','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('0625f717-ffb9-4fbd-858a-226769285fc6','4d2dcade-0a71-420c-a442-651daf3c1363','BASIC','SUSPENDED',15,15,5,1000,0,1000,NULL,'2026-10-21 11:00:25',NULL,'2026-10-26 11:00:25','2026-10-26 11:00:25','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('0f3c1df0-2d48-41f3-a675-6db7d9f36393','a1a1a1a1-1111-4111-a111-111111111111','BASIC','ACTIVE',15,15,3,1000,0,2000,'2026-10-26 05:35:33','2026-11-25 05:35:33',NULL,'2026-10-26 05:35:33','2026-10-26 05:35:33','MONTHLY',299.00,'INR',NULL,NULL,1,0,0,0),('0f86b993-3765-4113-bb85-06c681030a07','b0205814-a74f-45d1-8d09-0654f387bd74','BASIC','SUSPENDED',15,15,5,1000,0,1000,NULL,'2026-10-21 11:08:37',NULL,'2026-10-26 11:08:37','2026-10-26 11:08:37','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('166e4c02-1a14-4230-a752-99e579d75b19','a2d742c4-5599-482b-8fe4-84700f5b3e8b','BASIC','TRIALING',15,15,5,1000,0,1000,NULL,NULL,NULL,'2026-10-26 11:04:14','2026-10-26 11:04:14','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('16d2d494-a7f5-4713-ab19-f311079fc19e','f5101119-65a7-4959-a682-d45938b161c2','BASIC','ACTIVE',15,15,3,1000,0,1000,'2026-10-27 08:22:23','2026-11-26 08:22:23',NULL,'2026-10-27 08:22:23','2026-10-27 08:22:23','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('17c71ddf-e957-4513-94f6-49c54427c829','b84a1dc8-afdf-433d-afad-2aa2465a8be7','PRO','TRIALING',75,75,20,10000,1,5000,'2026-10-26 07:05:53','2027-10-26 07:05:53',NULL,'2026-10-26 07:05:53','2026-10-26 07:05:53','ANNUAL',3560.00,'INR',NULL,NULL,2,0,0,0),('191cfb39-ff3d-4284-bfb1-4111268470b0','df68e4a7-a776-4b75-b265-908dd6cf572d','BASIC','ACTIVE',15,15,3,1000,0,1000,'2026-10-27 06:26:24','2026-11-27 06:26:24',NULL,'2026-10-27 06:26:24','2026-10-27 06:26:24','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('1e6afb64-7681-4f48-be74-2fb6f1095847','30ff1eb9-f9c0-4125-95b5-3b250fa9beae','BASIC','ACTIVE',15,15,3,1000,0,1000,'2026-10-26 10:53:52','2026-11-25 10:53:52',NULL,'2026-10-26 10:53:52','2026-10-26 10:53:52','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('20581690-9dbe-4c25-9741-765025769d1f','438ad98c-7797-4a23-bc3a-9b7e2a2b1b89','BASIC','TRIALING',15,15,5,1000,0,1000,NULL,NULL,NULL,'2026-10-27 06:26:24','2026-10-27 06:26:24','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('21241fab-f873-4065-a647-a91ba60e0276','b2222222-bbbb-2222-bbbb-222222222222','BASIC','ACTIVE',15,15,3,1000,0,2000,'2026-10-27 09:54:26','2026-11-26 09:54:26',NULL,'2026-10-27 09:54:26','2026-10-27 09:54:26','MONTHLY',299.00,'INR',NULL,NULL,1,0,0,0),('22153ef7-0940-49ee-a182-b91061aa76d1','c0d2223e-ff29-4d73-a6c1-4eec5ed203ba','BASIC','TRIALING',15,15,5,1000,0,1000,NULL,NULL,NULL,'2026-10-26 10:59:30','2026-10-26 10:59:30','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('24a88e81-4f5d-4f76-8514-01bd209c72c0','e7b8a1c0-0000-0000-0000-000000000001','ENTERPRISE','ACTIVE',999999,999999,999999,999999,1,1000,NULL,NULL,NULL,'2026-10-20 09:47:22','2026-10-20 09:47:22','MONTHLY',NULL,'INR',NULL,NULL,1,1,1,1),('24b21da0-f75e-428b-94f2-0b55e0c9237c','27a3e8fd-4b92-4be9-aefc-f0e6983d4e6f','BASIC','SUSPENDED',15,15,5,1000,0,1000,NULL,'2026-10-21 11:12:59',NULL,'2026-10-26 11:12:59','2026-10-26 11:12:59','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('24bb4f20-159c-49df-a43f-18b817ecbae5','9d168cf5-c018-47e1-a55b-f770c8b9f6ae','BASIC','TRIALING',15,15,5,1000,0,1000,NULL,NULL,NULL,'2026-10-26 10:51:41','2026-10-26 10:51:41','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('25ec4f07-d62c-4a8c-a0f4-992ea59d4d6f','947137fb-2d6a-4d64-be86-af111ae6edca','BASIC','ACTIVE',15,15,3,1000,0,1000,'2026-10-27 08:22:24','2026-11-27 08:22:24',NULL,'2026-10-27 08:22:23','2026-10-27 08:22:24','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('2844e459-175d-4043-aa59-3eaa06c916a8','f6c8c79c-7a77-4473-9cf6-9106b7df2ee7','BASIC','TRIALING',15,15,5,1000,0,1000,NULL,NULL,NULL,'2026-10-27 05:02:35','2026-10-27 05:02:35','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('2af34d88-a320-476c-804b-441d855b0a75','b6acd454-82f0-4eec-b6de-cfc048ca1eb6','BASIC','ACTIVE',15,15,3,1000,0,1000,'2026-10-26 11:01:12','2026-11-25 11:01:12',NULL,'2026-10-26 11:01:12','2026-10-26 11:01:12','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('31904c42-59f8-4e41-8e9d-e7aa2b9bd0db','6ce01506-2fc2-4b10-9ea1-bfca2f1cf6d9','BASIC','TRIALING',15,15,5,1000,0,1000,NULL,NULL,NULL,'2026-10-26 11:00:25','2026-10-26 11:00:25','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('32fa8064-59aa-46f7-a365-1ed8e225e00b','e3714a2e-f85a-4848-9cd2-1a5bfce0782a','BASIC','TRIALING',15,15,5,1000,0,1000,NULL,NULL,NULL,'2026-10-26 10:58:57','2026-10-26 10:58:57','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('34a5233d-386b-4f40-88b4-e3e54904b124','400f6d65-2390-4bf3-8c22-b897976d514e','BASIC','ACTIVE',15,15,3,1000,0,1000,'2026-10-26 10:49:04','2026-11-25 10:49:04',NULL,'2026-10-26 10:49:04','2026-10-26 10:49:04','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('392214dc-f5ab-442c-b121-50c5ace2846f','2f3261a0-0ba0-4ce4-a0a6-9168a9aed68a','BASIC','ACTIVE',15,15,3,1000,0,1000,'2026-10-26 10:52:16','2026-11-25 10:52:16',NULL,'2026-10-26 10:52:16','2026-10-26 10:52:16','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('3b277e70-644c-4ab4-a349-deb36faa541d','72cb90df-c8bb-4a68-a14b-97d9066643b5','BASIC','ACTIVE',15,15,3,1000,0,1000,'2026-10-26 11:07:11','2026-11-26 11:07:11',NULL,'2026-10-26 11:07:11','2026-10-26 11:07:11','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('3e02c817-5236-48e4-baf0-73e783890c77','d79536bf-9fbc-4f30-8fb6-8418f8387b4d','BASIC','TRIALING',15,15,5,1000,0,1000,NULL,NULL,NULL,'2026-10-26 11:05:06','2026-10-26 11:05:06','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('3e1bf60f-7c0e-47db-8661-55b0b712b743','7167a639-c5e9-4b87-9e19-b5343a249ff6','BASIC','TRIALING',15,15,5,1000,0,1000,NULL,NULL,NULL,'2026-10-26 10:52:52','2026-10-26 10:52:52','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('3fca0869-3786-4574-965e-970a853f56d9','tenant-test-beta','BASIC','ACTIVE',15,15,3,1000,0,2000,'2026-10-26 05:35:44','2026-11-25 05:35:44',NULL,'2026-10-26 05:35:44','2026-10-26 05:35:44','MONTHLY',299.00,'INR',NULL,NULL,1,0,0,0),('4048905a-c346-44fa-87df-f060b4ede9fc','ec9fb839-a5e6-4025-95d9-5b0ac17ab8df','BASIC','ACTIVE',15,15,3,1000,0,1000,'2026-10-26 10:58:57','2026-11-25 10:58:57',NULL,'2026-10-26 10:58:57','2026-10-26 10:58:57','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('4596fabf-17b0-4692-b41d-dd39a46bdcdc','d93c22fe-4a1c-46a6-a902-83abb963886d','BASIC','ACTIVE',15,15,3,1000,0,1000,'2026-10-27 05:33:57','2026-11-26 05:33:57',NULL,'2026-10-27 05:33:57','2026-10-27 05:33:57','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('46d49094-c75a-4ee6-ad3e-33ac9be74ea7','cfa950ac-ad3e-4869-a88d-db11c2df302b','BASIC','ACTIVE',15,15,3,1000,0,1000,'2026-10-26 10:52:51','2026-11-25 10:52:51',NULL,'2026-10-26 10:52:51','2026-10-26 10:52:51','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('46db23f2-2406-4759-b296-d0310a0dd757','00336a35-b499-4f29-8311-3a9ca67ff43d','BASIC','ACTIVE',15,15,3,1000,0,1000,'2026-10-26 11:13:41','2026-11-26 11:13:41',NULL,'2026-10-26 11:13:41','2026-10-26 11:13:41','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('4b69a89b-8a81-42a8-beef-8f28698c7753','504920e4-fcf4-4cae-8b1c-c38019064726','BASIC','SUSPENDED',15,15,5,1000,0,1000,NULL,'2026-10-22 05:33:58',NULL,'2026-10-27 05:33:58','2026-10-27 05:33:58','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('4e10761a-0f6d-49e2-8b8c-9f534460fd3a','971d5f55-000c-42a5-99d7-847f558030ab','BASIC','TRIALING',15,15,5,1000,0,1000,NULL,NULL,NULL,'2026-10-26 10:59:30','2026-10-26 10:59:30','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('511c3257-9d0d-4457-ad73-829e32901cbd','531837cf-e639-4f92-8025-a6e11b7935bb','BASIC','TRIALING',15,15,5,1000,0,1000,NULL,NULL,NULL,'2026-10-26 10:55:18','2026-10-26 10:55:18','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('523c7cb5-9a8b-4773-bbd5-7eae5a4e2a9b','a784fac0-0d30-4702-9f58-1f8225da5f3c','BASIC','TRIALING',15,15,5,1000,0,1000,NULL,NULL,NULL,'2026-10-26 11:01:13','2026-10-26 11:01:13','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('5286b4b0-6a7d-4467-b518-3e8fc0af168c','8c0e1bbc-bc5d-43b6-b1b7-4579226d1789','BASIC','ACTIVE',15,15,3,1000,0,1000,'2026-10-27 05:33:58','2026-11-27 05:33:58',NULL,'2026-10-27 05:33:57','2026-10-27 05:33:58','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('53aec05c-a51d-4373-b349-17c683362a88','d3740a34-464f-4e2e-b8c9-19605fe92861','BASIC','TRIALING',15,15,5,1000,0,1000,NULL,NULL,NULL,'2026-10-26 11:00:25','2026-10-26 11:00:25','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('5513e58a-9170-44b9-9dcb-8ba7f946579e','88f558db-5b1d-479c-928a-47f1fa5da23d','BASIC','ACTIVE',15,15,3,1000,0,1000,'2026-10-26 11:04:13','2026-11-25 11:04:13',NULL,'2026-10-26 11:04:13','2026-10-26 11:04:13','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('55437ab9-6c5a-42bf-8a2b-cc259eea4f00','199ee529-95fe-499c-b749-aa4130465ab1','BASIC','SUSPENDED',15,15,5,1000,0,1000,NULL,'2026-10-22 05:02:35',NULL,'2026-10-27 05:02:35','2026-10-27 05:02:35','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('60b580e7-9af3-4f2f-bc0c-c6e3c6645bf2','630999b4-e63d-4baf-9b75-2536bc8bb057','BASIC','TRIALING',15,15,5,1000,0,1000,NULL,NULL,NULL,'2026-10-27 08:22:23','2026-10-27 08:22:23','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('6171fda4-3f3d-4ef2-9851-c7c9b8782ff5','ab56c8c9-cfaf-4a4a-ac85-060901910390','PRO','TRIALING',75,75,20,10000,1,5000,'2026-10-26 06:53:22','2027-10-26 06:53:22',NULL,'2026-10-26 06:53:22','2026-10-26 06:53:22','ANNUAL',3560.00,'INR',NULL,NULL,2,0,0,0),('61ddcb04-6e11-4e9c-a6ae-2c281d0f3556','d36935f0-cabf-4458-b031-c662d48ebb28','PRO','TRIALING',75,75,20,10000,1,5000,'2026-10-26 07:01:57','2027-10-26 07:01:57',NULL,'2026-10-26 07:01:57','2026-10-26 07:01:57','ANNUAL',3560.00,'INR',NULL,NULL,2,0,0,0),('668d8a24-d6ca-412b-80fa-36e2f6341dde','59a0185e-a748-43d5-857f-e5033068dba3','BASIC','TRIALING',15,15,5,1000,0,1000,NULL,NULL,NULL,'2026-10-26 10:55:18','2026-10-26 10:55:18','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('66ba2401-66d8-4f8c-9d78-c5d6434849ae','3db3c1ed-028b-45b5-a606-6ef474beddef','BASIC','ACTIVE',15,15,3,1000,0,1000,'2026-10-26 10:55:18','2026-11-25 10:55:18',NULL,'2026-10-26 10:55:18','2026-10-26 10:55:18','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('66d651c6-f3b9-4062-a3be-fa67cff05859','70adcfea-e31d-4d01-b09a-50c20f23d02b','BASIC','TRIALING',15,15,5,1000,0,1000,NULL,NULL,NULL,'2026-10-26 10:56:43','2026-10-26 10:56:43','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('69a9d574-3c5d-4a3f-a250-11bd2c2f6f5d','f9243fc5-fa39-418d-b4f7-416965eb34b9','BASIC','ACTIVE',15,15,3,1000,0,1000,'2026-10-26 10:48:10','2026-11-25 10:48:10',NULL,'2026-10-26 10:48:10','2026-10-26 10:48:10','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('7089ca17-fe15-450f-9921-32d705a10310','fdb07a63-3e5d-4200-85f4-de4301459af2','BASIC','ACTIVE',15,15,3,1000,0,1000,'2026-10-27 06:26:24','2026-11-26 06:26:24',NULL,'2026-10-27 06:26:24','2026-10-27 06:26:24','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('70922f90-ebf7-4dbc-a271-c2306d9fd8c0','e50a37d2-f716-467c-b6c5-ef9656060d3d','BASIC','ACTIVE',15,15,3,1000,0,1000,'2026-10-26 10:46:22','2026-11-25 10:46:22',NULL,'2026-10-26 10:46:22','2026-10-26 10:46:22','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('72008a01-443c-4d37-b2a4-9160140b571c','de9d4370-779d-4bd9-8a8b-241168061f63','BASIC','ACTIVE',15,15,3,1000,0,1000,'2026-10-26 11:05:06','2026-11-25 11:05:06',NULL,'2026-10-26 11:05:06','2026-10-26 11:05:06','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('780cc58c-e7aa-4390-9c2a-e06d162eed37','fa111111-1111-1111-1111-111111111111','PRO','ACTIVE',75,75,20,10000,1,1000,'2026-10-26 07:05:56','2027-10-26 07:05:56',NULL,'2026-10-26 07:05:56','2026-10-26 07:05:56','',NULL,'INR',NULL,NULL,2,0,0,0),('790106f6-505c-4b41-a93e-7791e3f26595','594d4f70-4c89-42a4-88e9-a6d383b7f18f','BASIC','TRIALING',15,15,5,1000,0,1000,NULL,NULL,NULL,'2026-10-26 11:01:12','2026-10-26 11:01:12','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('7f696c94-4637-4058-857f-39f0f0e949af','ee497c22-bd54-46d9-aef0-2fee2092e4d6','BASIC','TRIALING',15,15,5,1000,0,1000,NULL,NULL,NULL,'2026-10-26 10:52:17','2026-10-26 10:52:17','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('85c13c9f-c1eb-495e-b57c-cc274a9612ce','36b1f6d8-6eb5-49d3-a379-216aab1ace46','BASIC','SUSPENDED',15,15,5,1000,0,1000,NULL,'2026-10-21 11:05:06',NULL,'2026-10-26 11:05:06','2026-10-26 11:05:06','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('8d3e9d79-712f-49b7-800b-eb9ec716fa01','6b01d3e6-6551-40a6-80e1-5c516bdb1101','BASIC','TRIALING',15,15,3,1000,0,1000,'2026-10-26 09:41:33','2026-11-26 09:41:33',NULL,'2026-10-26 09:41:33','2026-10-26 09:41:33','MONTHLY',299.00,'INR',NULL,NULL,1,0,0,0),('8eab512f-b0f4-4a32-a379-cedf2b6ef678','416b880c-4a51-4df0-b1d8-cb6f344aea8d','BASIC','TRIALING',15,15,5,1000,0,1000,NULL,NULL,NULL,'2026-10-26 11:07:11','2026-10-26 11:07:11','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('9108c2ec-b34c-4be3-b297-a44d2ad7d3d1','d9f8f4eb-ff1c-4b26-a180-f90800bfd971','BASIC','ACTIVE',15,15,3,1000,0,1000,'2026-10-26 11:12:58','2026-11-25 11:12:58',NULL,'2026-10-26 11:12:58','2026-10-26 11:12:58','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('94d06b35-bf20-4a3c-9a9f-4cf36d78a4ff','60c05b9e-ac6c-47c0-9343-e31b2eba7897','BASIC','ACTIVE',15,15,3,1000,0,1000,'2026-10-26 10:55:50','2026-11-25 10:55:50',NULL,'2026-10-26 10:55:50','2026-10-26 10:55:50','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('9889ed0b-5384-4316-8d9d-396d5fc31055','213c043f-6e61-4870-b9de-5c6fdc2ccff2','BASIC','SUSPENDED',15,15,5,1000,0,1000,NULL,'2026-10-21 11:13:41',NULL,'2026-10-26 11:13:41','2026-10-26 11:13:41','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('9b74393d-145c-4738-b262-70708f605d5f','06df8157-f143-4da2-954c-b4b4a0754a80','BASIC','ACTIVE',15,15,3,1000,0,1000,'2026-10-26 10:56:43','2026-11-25 10:56:43',NULL,'2026-10-26 10:56:43','2026-10-26 10:56:43','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('9d2e244b-e56d-4dab-a22c-95348f9d36e8','0e5d09bb-da06-459e-a99f-e397522a36f7','PRO','TRIALING',75,75,20,10000,1,5000,'2026-10-26 06:57:15','2027-10-26 06:57:15',NULL,'2026-10-26 06:57:15','2026-10-26 06:57:15','ANNUAL',3560.00,'INR',NULL,NULL,2,0,0,0),('9f3bf0b4-587b-4d7b-97cc-8b28d5b9f281','50717437-1869-49e6-b8b5-dbc3453571f0','BASIC','TRIALING',15,15,5,1000,0,1000,NULL,NULL,NULL,'2026-10-26 10:55:50','2026-10-26 10:55:50','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('9f692efa-5339-48f6-ac22-88ff095efc3b','027bb9d5-b665-473f-95ae-ed58e0054811','BASIC','ACTIVE',15,15,3,1000,0,1000,'2026-10-26 09:52:08','2026-11-26 09:52:08',NULL,'2026-10-26 09:45:08','2026-10-26 09:52:08','MONTHLY',299.00,'INR',NULL,NULL,1,0,0,0),('a0433d52-4a9e-44a5-8c67-c4e73db5d9f6','052b6939-2e08-4ee0-a63b-55d5cebb3d46','BASIC','ACTIVE',15,15,3,1000,0,1000,'2026-10-26 11:07:11','2026-11-25 11:07:11',NULL,'2026-10-26 11:07:11','2026-10-26 11:07:11','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('a0db8def-184f-46c5-8a86-601460a53cef','d18b674a-919b-42de-a019-9d73f60c9340','BASIC','SUSPENDED',15,15,5,1000,0,1000,NULL,'2026-10-21 11:01:13',NULL,'2026-10-26 11:01:13','2026-10-26 11:01:13','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('a468b237-f305-4fd7-8d4a-45a49902ccf4','15f77c41-e988-4df2-b6cc-1acfdbabf630','BASIC','SUSPENDED',15,15,5,1000,0,1000,NULL,'2026-10-21 11:06:28',NULL,'2026-10-26 11:06:28','2026-10-26 11:06:28','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('a5635c83-b987-4161-871c-c542d5864da3','bc95b9f7-d75f-470c-b7f9-bc733eac8dc3','PRO','TRIALING',75,75,20,10000,1,5000,'2026-10-26 07:01:00','2027-10-26 07:01:00',NULL,'2026-10-26 07:01:00','2026-10-26 07:01:00','ANNUAL',3560.00,'INR',NULL,NULL,2,0,0,0),('a84d5cb6-2591-449c-abea-9090f469610e','1799e953-9a43-4899-9e1e-e95023c1a93a','BASIC','SUSPENDED',15,15,5,1000,0,1000,NULL,'2026-10-21 11:07:11',NULL,'2026-10-26 11:07:11','2026-10-26 11:07:11','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('aaad9e09-45f3-49c5-b3ae-ba8bb451976f','9555e488-f206-41df-9d36-1cacbdb5ee45','BASIC','TRIALING',15,15,5,1000,0,1000,NULL,NULL,NULL,'2026-10-26 10:58:57','2026-10-26 10:58:57','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('ab37a372-990d-4d89-8421-778dfa72e9b8','b65e2d41-164f-493c-9fd8-c93d635c382f','BASIC','SUSPENDED',15,15,5,1000,0,1000,NULL,'2026-10-21 11:04:14',NULL,'2026-10-26 11:04:14','2026-10-26 11:04:14','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('ac7b0a4f-95a8-45ce-8e40-ccd42ebe65ed','7a79db14-42c3-4bf8-a32d-fc2c71ae6431','BASIC','TRIALING',15,15,5,1000,0,1000,NULL,NULL,NULL,'2026-10-26 10:56:43','2026-10-26 10:56:43','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('ae22cc03-5c44-4bb1-a3ae-dcad3d7825d6','4fbcd6ad-61b0-4ee7-9a10-51879e4aede9','BASIC','TRIALING',15,15,5,1000,0,1000,NULL,NULL,NULL,'2026-10-26 11:06:28','2026-10-26 11:06:28','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('ae420e86-b8f2-4fb7-886a-8eef2a6840a0','e42d1209-e322-477c-b762-a09cc8976625','BASIC','SUSPENDED',15,15,5,1000,0,1000,NULL,'2026-10-22 08:22:24',NULL,'2026-10-27 08:22:24','2026-10-27 08:22:24','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('b1494255-0542-435d-a3aa-9d2bb137bf2a','f76680e7-acf7-4214-a39c-4d4c070f65b1','BASIC','ACTIVE',15,15,3,1000,0,1000,'2026-10-26 11:06:28','2026-11-25 11:06:28',NULL,'2026-10-26 11:06:28','2026-10-26 11:06:28','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('b17fd07b-07c0-4f9a-8294-a605cdf837ab','3b80ee47-fc07-4f1f-8350-54fb5182e4c9','BASIC','ACTIVE',15,15,3,1000,0,1000,'2026-10-27 05:02:34','2026-11-26 05:02:34',NULL,'2026-10-27 05:02:34','2026-10-27 05:02:34','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('b18a696c-f544-49eb-beda-1c1c9b8a6ca7','831f577b-d063-4260-9b05-a567599bec10','BASIC','TRIALING',15,15,5,1000,0,1000,NULL,NULL,NULL,'2026-10-26 11:12:59','2026-10-26 11:12:59','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('bb209076-6322-4e6c-8de9-7fa9bce97cc5','4ef075e3-83c4-488f-b35e-ab6ff11cfd84','BASIC','ACTIVE',15,15,3,1000,0,1000,'2026-10-26 10:51:40','2026-11-25 10:51:40',NULL,'2026-10-26 10:51:40','2026-10-26 10:51:40','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('bcf10de3-62d3-4f27-8f37-e45c7c5301c5','51154808-6063-460c-8d27-520fb7658994','BASIC','TRIALING',15,15,5,1000,0,1000,NULL,NULL,NULL,'2026-10-26 10:55:50','2026-10-26 10:55:50','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('bfcdf272-5981-4e78-b87e-ab9302459896','11b60fbd-1b26-4cf2-837f-0d60f68b7a06','BASIC','ACTIVE',15,15,3,1000,0,1000,'2026-10-26 11:12:59','2026-11-26 11:12:59',NULL,'2026-10-26 11:12:59','2026-10-26 11:12:59','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('c09ef713-862a-4e2d-a25f-df8b02e6f0cf','48a79c2c-150a-4e54-8b52-807f647d6d73','BASIC','ACTIVE',15,15,3,1000,0,1000,'2026-10-26 10:49:29','2026-11-25 10:49:29',NULL,'2026-10-26 10:49:29','2026-10-26 10:49:29','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('c4af246b-5169-4aca-8f99-c3ef54d2a53b','067bf9a4-3ac0-4294-8b29-4a45697fba2f','BASIC','TRIALING',15,15,5,1000,0,1000,NULL,NULL,NULL,'2026-10-26 11:08:37','2026-10-26 11:08:37','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('c6031cb8-e521-4a9c-88d1-7279d58d3ba9','9fdc26c3-64b3-4c6b-8139-a2d33273a542','BASIC','TRIALING',15,15,5,1000,0,1000,NULL,NULL,NULL,'2026-10-27 05:33:58','2026-10-27 05:33:58','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('cb1d9f82-fe46-4ac1-afb9-bb4d3443167a','b411f2f9-4b43-42b5-a8a2-b112f392c6b3','BASIC','SUSPENDED',15,15,5,1000,0,1000,NULL,'2026-10-22 06:26:24',NULL,'2026-10-27 06:26:24','2026-10-27 06:26:24','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('cc266425-bd36-4a3b-ac26-a7052d813e14','1409083b-bc3a-477f-9768-2ff2eef1c877','BASIC','TRIALING',15,15,5,1000,0,1000,NULL,NULL,NULL,'2026-10-26 11:06:28','2026-10-26 11:06:28','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('d2e9a816-e65c-4325-8bb2-cb5bff13c62a','ada467ee-14ca-4f9f-8cfc-56a5c6e93267','BASIC','ACTIVE',15,15,3,1000,0,1000,'2026-10-26 11:00:24','2026-11-25 11:00:24',NULL,'2026-10-26 11:00:24','2026-10-26 11:00:24','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('d3883802-6817-4dea-93a0-42ebf158494c','c2b5a6d2-8565-4d83-a7b7-4b6135acfe2e','BASIC','TRIALING',15,15,5,1000,0,1000,NULL,NULL,NULL,'2026-10-26 11:05:06','2026-10-26 11:05:06','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('d4ba53a2-6046-4e7c-ac67-76476e1968ce','tenant-test-alpha','BASIC','ACTIVE',15,15,3,1000,0,2000,'2026-10-26 05:28:58','2026-11-25 05:28:58',NULL,'2026-10-26 05:28:58','2026-10-26 05:28:58','MONTHLY',299.00,'INR',NULL,NULL,1,0,0,0),('d7a2d562-0e12-4f36-857e-75dcf6212659','aab57fb6-54fd-4a08-9553-c1771dc94612','BASIC','ACTIVE',15,15,3,1000,0,1000,'2026-10-26 11:08:37','2026-11-25 11:08:37',NULL,'2026-10-26 11:08:37','2026-10-26 11:08:37','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('d7bdbf0e-b105-4d35-a576-c1c42c78ab28','0117af5a-ef34-4798-a6c5-d5440c811d0e','BASIC','TRIALING',15,15,5,1000,0,1000,NULL,NULL,NULL,'2026-10-26 11:13:41','2026-10-26 11:13:41','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('db6e8c40-2d7f-4ba3-849c-2ef35c7f0372','b5ceeae1-3869-43ae-a2c8-854a92781158','BASIC','TRIALING',15,15,5,1000,0,1000,NULL,NULL,NULL,'2026-10-26 10:49:29','2026-10-26 10:49:29','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('dd2affa0-9788-44cf-951d-ede0e331faa4','735dca32-4751-4843-b907-5d3cb08c435e','BASIC','ACTIVE',15,15,3,1000,0,1000,'2026-10-26 10:59:29','2026-11-25 10:59:29',NULL,'2026-10-26 10:59:29','2026-10-26 10:59:29','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('e3cc859e-350a-4f08-a5e6-0240a00c2fb6','a1111111-aaaa-1111-aaaa-111111111111','BASIC','ACTIVE',15,15,3,1000,0,2000,'2026-10-27 09:54:26','2026-11-26 09:54:26',NULL,'2026-10-27 09:54:26','2026-10-27 09:54:26','MONTHLY',299.00,'INR',NULL,NULL,1,0,0,0),('ed47cf0f-e649-4f7e-805b-feb9e0d743cf','c6cdfc18-6b09-4fde-b9bf-abbbd54e7367','BASIC','ACTIVE',15,15,3,1000,0,1000,'2026-10-26 10:47:15','2026-11-25 10:47:15',NULL,'2026-10-26 10:47:15','2026-10-26 10:47:15','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('ee73b6c8-8331-4f92-9a92-a4a1f4abd275','84d4cfab-e4aa-48f1-aa7a-f4ed4ad3f2d3','BASIC','ACTIVE',15,15,3,1000,0,1000,'2026-10-27 05:02:35','2026-11-27 05:02:35',NULL,'2026-10-27 05:02:35','2026-10-27 05:02:35','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('f59d420e-f4b9-4a6e-adc7-e9f0a5deb437','bc102a2e-f2e9-404b-86db-3ff2b1535b64','PRO','TRIALING',75,75,20,10000,1,5000,'2026-10-26 06:59:59','2027-10-26 06:59:59',NULL,'2026-10-26 06:59:59','2026-10-26 06:59:59','ANNUAL',3560.00,'INR',NULL,NULL,2,0,0,0),('f89fb089-8f8f-44a0-8530-93486604929f','3e3ac612-ec08-46ad-8e38-634f67878e3a','BASIC','ACTIVE',15,15,3,1000,0,1000,'2026-10-26 11:08:37','2026-11-26 11:08:37',NULL,'2026-10-26 11:08:37','2026-10-26 11:08:37','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('f9bca288-8e8e-427d-8c03-545c2fb2b001','907eb507-feb7-4349-b931-e269dcf8711d','BASIC','TRIALING',15,15,5,1000,0,1000,NULL,NULL,NULL,'2026-10-26 11:04:14','2026-10-26 11:04:14','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0),('fa9ab709-4cd4-4485-b368-f83b7e6503da','76cee6fb-3d8c-430f-a8e4-c1ea14542050','BASIC','ACTIVE',15,15,3,1000,0,1000,'2026-10-26 11:13:40','2026-11-25 11:13:40',NULL,'2026-10-26 11:13:40','2026-10-26 11:13:40','MONTHLY',NULL,'INR',NULL,NULL,1,0,0,0);
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
  `slug` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  UNIQUE KEY `customDomain` (`customDomain`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenants`
--

LOCK TABLES `tenants` WRITE;
/*!40000 ALTER TABLE `tenants` DISABLE KEYS */;
INSERT INTO `tenants` VALUES ('00336a35-b499-4f29-8311-3a9ca67ff43d','Alpha Trial Fleet',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'TRL1199',NULL,'alpha-trial-fleet-19',NULL,'ACTIVE','BASIC','trial_1793013221199@example.com','9840777888',NULL,0,'2026-10-26 11:13:41','2026-10-26 11:13:41'),('0117af5a-ef34-4798-a6c5-d5440c811d0e','Concurrency Test Fleet',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'CON1288',NULL,'concurrency-test-fleet-14',NULL,'TRIALING','BASIC','conc_1793013221288@example.com','9840666555',NULL,0,'2026-10-26 11:13:41','2026-10-26 11:13:41'),('027bb9d5-b665-473f-95ae-ed58e0054811','Ganthi','ganthi','Ganthi',NULL,NULL,'AAACA1111A','996609','ganthi','subipcs@gmail.com','9080280818',NULL,'chennai','tamil nadu','60032','data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAWgAAAFoCAYAAAB65WHVAAAQAElEQVR4Aex9B6BkVZH2Vzd27n55XpicmAAMDDlIkKCoGH5dXdfsmnbXVVfXnFbXtLqGNbuuOeecEEUFlAwDwzA5z5uXQ+e+6f/qvmkYUBAkvTf05VafVKdOnbp9vlO3Ts/DQOtqWaBlgZYFWhaYlRZoAfSsfCwtpVoWaFmgZQGgBdCtb0HLAi0LzE0LPAK0bgH0I+Aht6bYskDLAnPTAi2AnpvPraV1ywItCzwCLNAC6EfAQ25N8ZFogdacjwQLtAD6SHiKrTm0LNCywBFpgRZAH5GPtTWplgVaFjgSLNAC6CPhKbbmcF8t0OJvWWBOWKAF0HPiMbWUbFmgZYFHogVaAP1IfOqtObcs0LLAnLBAC6DnxGN6aJVsjdayQMsCs8MCLYCeHc+hpUXLAi0LtCzwZxZoAfSfmaRV0bJAywItC8','GAN','gan','ganthi',NULL,'ACTIVE','BASIC','subipcs@gmail.com','9080280818','{\"city\": \"chennai\", \"gstin\": null, \"state\": \"tamil nadu\", \"logoUrl\": \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAWgAAAFoCAYAAAB65WHVAAAQAElEQVR4Aex9B6BkVZH2Vzd27n55XpicmAAMDDlIkKCoGH5dXdfsmnbXVVfXnFbXtLqGNbuuOeecEEUFlAwDwzA5z5uXQ+e+6f/qvmkYUBAkvTf05VafVKdOnbp9vlO3Ts/DQOtqWaBlgZYFWhaYlRZoAfSsfCwtpVoWaFmgZQGgBdCtb0HLAi0LzE0LPAK0bgH0I+Aht6bYskDLAnPTAi2AnpvPraV1ywItCzwCLNAC6EfAQ25N8ZFogdacjwQLtAD6SHiKrTm0LNCywBFpgRZAH5GPtTWplgVaFjgSLNAC6CPhKbbmcF8t0OJvWWBOWKAF0HPiMbWUbFmgZYFHogVaAP1IfOqtObcs0LLAnLBAC6DnxGN6aJVsjdayQMsCs8MCLYCeHc+hpUXLAi0LtCzwZxZoAfSfmaRV0bJAywItC8\", \"pinCode\": \"60032\", \"sacCode\": \"996609\", \"website\": \"ganthi\", \"gstNumber\": null, \"legalName\": \"ganthi\", \"panNumber\": \"AAACA1111A\", \"displayName\": \"Ganthi\", \"portalTitle\": \"Ganthi Fleet\", \"primaryColor\": \"#5B3DF5\", \"businessEmail\": \"subipcs@gmail.com\", \"businessPhone\": \"9080280818\", \"secondaryColor\": \"#0d9488\", \"billingFooterText\": null, \"registeredAddress\": null}',0,'2026-10-26 09:45:08','2026-10-29 11:36:36'),('052b6939-2e08-4ee0-a63b-55d5cebb3d46','Direct Fleet 1793012831205','Direct Fleet Private Limited','Direct Fleet','100 Mount Road, Chennai','33AABCD5678F1Z9','AABCD5678F','996609',NULL,'direct_1793012831205@example.com','9840999888',NULL,NULL,NULL,NULL,NULL,'DIR1205',NULL,'direct-fleet-20',NULL,'ACTIVE','BASIC','direct_1793012831205@example.com','9840999888','{\"city\": null, \"gstin\": \"33AABCD5678F1Z9\", \"state\": null, \"logoUrl\": null, \"pinCode\": null, \"sacCode\": \"996609\", \"website\": null, \"gstNumber\": \"33AABCD5678F1Z9\", \"legalName\": \"Direct Fleet Private Limited\", \"panNumber\": \"AABCD5678F\", \"displayName\": \"Direct Fleet\", \"portalTitle\": \"Direct Fleet Mobility Portal\", \"primaryColor\": \"#C04E24\", \"businessEmail\": \"direct_1793012831205@example.com\", \"businessPhone\": \"9840999888\", \"billingFooterText\": null, \"registeredAddress\": \"100 Mount Road, Chennai\"}',0,'2026-10-26 11:07:11','2026-10-26 11:07:11'),('067bf9a4-3ac0-4294-8b29-4a45697fba2f','Concurrency Test Fleet',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'CON7780',NULL,'concurrency-test-fleet-12',NULL,'TRIALING','BASIC','conc_1793012917780@example.com','9840666555',NULL,0,'2026-10-26 11:08:37','2026-10-26 11:08:37'),('06df8157-f143-4da2-954c-b4b4a0754a80','Direct Fleet 1793012203359','Direct Fleet Private Limited','Direct Fleet','100 Mount Road, Chennai','33AABCD5678F1Z9','AABCD5678F','996609',NULL,'direct_1793012203359@example.com','9840999888',NULL,NULL,NULL,NULL,NULL,'DIR3359',NULL,'direct-fleet-12',NULL,'ACTIVE','BASIC','direct_1793012203359@example.com','9840999888','{\"city\": null, \"gstin\": \"33AABCD5678F1Z9\", \"state\": null, \"logoUrl\": null, \"pinCode\": null, \"sacCode\": \"996609\", \"website\": null, \"gstNumber\": \"33AABCD5678F1Z9\", \"legalName\": \"Direct Fleet Private Limited\", \"panNumber\": \"AABCD5678F\", \"displayName\": \"Direct Fleet\", \"portalTitle\": \"Direct Fleet Mobility Portal\", \"primaryColor\": \"#C04E24\", \"businessEmail\": \"direct_1793012203359@example.com\", \"businessPhone\": \"9840999888\", \"billingFooterText\": null, \"registeredAddress\": \"100 Mount Road, Chennai\"}',0,'2026-10-26 10:56:43','2026-10-26 10:56:43'),('098657e4-4bbb-40cf-ac19-6900bd3218b0','Royal Crown 3406','Royal Crown 3406 Pvt Ltd','Royal Crown 3406','55 Beach Road, Chennai, Tamil Nadu','33AAACR9988F1Z2','AAACR9988F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RCT3406',NULL,'royal-crown-3406',NULL,'ACTIVE','PRO','admin_3406@royalcrown.com','9840111222',NULL,0,'2026-10-26 10:56:43','2026-10-26 10:56:43'),('0a7d9342-ba3d-4c64-9a67-32db239487d2','Royal Crown Travels','Royal Crown Travels Secondary LLP','Royal Crown Travels Branch 2','120 OMR Road, Chennai, Tamil Nadu','33BBBCE5544F1Z1','BBBCE5544F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RC22111',NULL,'royal-crown-travels-2',NULL,'ACTIVE','BASIC','admin@royalcrown2.com','9840333444',NULL,0,'2026-10-26 10:46:22','2026-10-26 10:46:22'),('0c3fcb8e-3c0e-41e3-ba7f-564219570b00','Royal Crown Travels','Royal Crown Travels Secondary LLP','Royal Crown Travels Branch 2','120 OMR Road, Chennai, Tamil Nadu','33BBBCE5544F1Z1','BBBCE5544F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RC29914',NULL,'royal-crown-9889-2',NULL,'ACTIVE','BASIC','admin@royalcrown2.com','9840333444',NULL,0,'2026-10-26 10:59:29','2026-10-26 10:59:29'),('0e5d09bb-da06-459e-a99f-e397522a36f7','Cosmic Cabs Logistics','Cosmic Cabs Logistics LLP','Cosmic Cabs Logistics','77 Cosmic Tower, Bangalore','29ABCDE1234F1Z8','ABCDE1234F','996601',NULL,'cosmic-1792997835216@example.com','9988776655',NULL,'Bangalore','Karnataka',NULL,NULL,'CSM103','csm103','cosmic-cabs-logistics',NULL,'ACTIVE','PRO','cosmic-1792997835216@example.com','9988776655','{\"city\": \"Bangalore\", \"gstin\": \"29ABCDE1234F1Z8\", \"state\": \"Karnataka\", \"logoUrl\": null, \"pinCode\": null, \"sacCode\": \"996601\", \"website\": null, \"gstNumber\": \"29ABCDE1234F1Z8\", \"legalName\": \"Cosmic Cabs Logistics LLP\", \"panNumber\": \"ABCDE1234F\", \"displayName\": \"Cosmic Cabs Logistics\", \"portalTitle\": \"Cosmic Cabs Logistics Fleet Portal\", \"primaryColor\": \"#0f1c3f\", \"businessEmail\": \"cosmic-1792997835216@example.com\", \"businessPhone\": \"9988776655\", \"secondaryColor\": \"#0d9488\", \"billingFooterText\": null, \"registeredAddress\": \"77 Cosmic Tower, Bangalore\"}',0,'2026-10-26 06:57:15','2026-10-26 06:57:15'),('0e7dbc91-308b-4c3d-9131-d5befb630edf','Royal Crown Travels','Royal Crown Travels Secondary LLP','Royal Crown Travels Branch 2','120 OMR Road, Chennai, Tamil Nadu','33BBBCE5544F1Z1','BBBCE5544F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RC20570',NULL,'royal-crown-0545-2',NULL,'ACTIVE','BASIC','admin@royalcrown2.com','9840333444',NULL,0,'2026-10-26 10:55:50','2026-10-26 10:55:50'),('11b60fbd-1b26-4cf2-837f-0d60f68b7a06','Alpha Trial Fleet',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'TRL9164',NULL,'alpha-trial-fleet-18',NULL,'ACTIVE','BASIC','trial_1793013179164@example.com','9840777888',NULL,0,'2026-10-26 11:12:59','2026-10-26 11:12:59'),('1409083b-bc3a-477f-9768-2ff2eef1c877','Concurrency Test Fleet',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'CON8677',NULL,'concurrency-test-fleet-10',NULL,'TRIALING','BASIC','conc_1793012788677@example.com','9840666555',NULL,0,'2026-10-26 11:06:28','2026-10-26 11:06:28'),('14e2f24f-cbe8-4f48-b019-4106daa2fefb','Royal Crown Travels','Royal Crown Travels Secondary LLP','Royal Crown Travels Branch 2','120 OMR Road, Chennai, Tamil Nadu','33BBBCE5544F1Z1','BBBCE5544F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RC27630',NULL,'royal-crown-7604-2',NULL,'ACTIVE','BASIC','admin@royalcrown2.com','9840333444',NULL,0,'2026-10-27 05:33:57','2026-10-27 05:33:57'),('15f77c41-e988-4df2-b6cc-1acfdbabf630','Expired Fleet Logistics',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'EXP8735',NULL,'expired-fleet-logistics-5',NULL,'SUSPENDED','BASIC','expired_1793012788735@example.com','9840888999',NULL,0,'2026-10-26 11:06:28','2026-10-26 11:06:28'),('1799e953-9a43-4899-9e1e-e95023c1a93a','Expired Fleet Logistics',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'EXP1661',NULL,'expired-fleet-logistics-6',NULL,'SUSPENDED','BASIC','expired_1793012831661@example.com','9840888999',NULL,0,'2026-10-26 11:07:11','2026-10-26 11:07:11'),('199ee529-95fe-499c-b749-aa4130465ab1','Expired Fleet Logistics',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'EXP5444',NULL,'expired-fleet-logistics-10',NULL,'SUSPENDED','BASIC','expired_1793077355444@example.com','9840888999',NULL,0,'2026-10-27 05:02:35','2026-10-27 05:02:35'),('1aa8ab4d-028a-4852-a371-a25ca532a570','Royal Crown Travels','Royal Crown Travels Secondary LLP','Royal Crown Travels Branch 2','120 OMR Road, Chennai, Tamil Nadu','33BBBCE5544F1Z1','BBBCE5544F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RC28316',NULL,'royal-crown-8289-2',NULL,'ACTIVE','BASIC','admin@royalcrown2.com','9840333444',NULL,0,'2026-10-26 11:06:28','2026-10-26 11:06:28'),('1b7ede17-30cd-49fa-b0ff-91a5fe3830d2','Royal Crown 6294','Royal Crown 6294 Pvt Ltd','Royal Crown 6294','55 Beach Road, Chennai, Tamil Nadu','33AAACR9988F1Z2','AAACR9988F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RCT6294',NULL,'royal-crown-6294',NULL,'ACTIVE','PRO','admin_6294@royalcrown.com','9840111222',NULL,0,'2026-10-26 11:05:06','2026-10-26 11:05:06'),('1df70f4b-625f-45cb-91e9-7e0bcd3fa898','Royal Crown 0907','Royal Crown 0907 Pvt Ltd','Royal Crown 0907','55 Beach Road, Chennai, Tamil Nadu','33AAACR9988F1Z2','AAACR9988F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RCT0907',NULL,'royal-crown-0907',NULL,'ACTIVE','PRO','admin_0907@royalcrown.com','9840111222',NULL,0,'2026-10-26 11:13:40','2026-10-26 11:13:40'),('1e73c343-ccaa-499d-bf59-bb4dbd686f87','Royal Crown Travels','Royal Crown Travels Secondary LLP','Royal Crown Travels Branch 2','120 OMR Road, Chennai, Tamil Nadu','33BBBCE5544F1Z1','BBBCE5544F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RC26953',NULL,'royal-crown-6922-2',NULL,'ACTIVE','BASIC','admin@royalcrown2.com','9840333444',NULL,0,'2026-10-26 10:52:16','2026-10-26 10:52:16'),('20a5b574-6e41-4b82-94d2-04d2d0ba6d63','Royal Crown Travels','Royal Crown Travels Pvt Ltd','Royal Crown Travels','55 Beach Road, Chennai, Tamil Nadu','33AAACR9988F1Z2','AAACR9988F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RCT2093',NULL,'royal-crown-travels',NULL,'ACTIVE','PRO','admin@royalcrown.com','9840111222',NULL,0,'2026-10-26 10:46:22','2026-10-26 10:46:22'),('213c043f-6e61-4870-b9de-5c6fdc2ccff2','Expired Fleet Logistics',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'EXP1350',NULL,'expired-fleet-logistics-9',NULL,'SUSPENDED','BASIC','expired_1793013221350@example.com','9840888999',NULL,0,'2026-10-26 11:13:41','2026-10-26 11:13:41'),('27a3e8fd-4b92-4be9-aefc-f0e6983d4e6f','Expired Fleet Logistics',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'EXP9369',NULL,'expired-fleet-logistics-8',NULL,'SUSPENDED','BASIC','expired_1793013179369@example.com','9840888999',NULL,0,'2026-10-26 11:12:59','2026-10-26 11:12:59'),('2f3261a0-0ba0-4ce4-a0a6-9168a9aed68a','Direct Fleet 1793011936886','Direct Fleet Private Limited','Direct Fleet','100 Mount Road, Chennai','33AABCD5678F1Z9','AABCD5678F','996609',NULL,'direct_1793011936886@example.com','9840999888',NULL,NULL,NULL,NULL,NULL,'DIR6886',NULL,'direct-fleet-7',NULL,'ACTIVE','BASIC','direct_1793011936886@example.com','9840999888','{\"city\": null, \"gstin\": \"33AABCD5678F1Z9\", \"state\": null, \"logoUrl\": null, \"pinCode\": null, \"sacCode\": \"996609\", \"website\": null, \"gstNumber\": \"33AABCD5678F1Z9\", \"legalName\": \"Direct Fleet Private Limited\", \"panNumber\": \"AABCD5678F\", \"displayName\": \"Direct Fleet\", \"portalTitle\": \"Direct Fleet Mobility Portal\", \"primaryColor\": \"#C04E24\", \"businessEmail\": \"direct_1793011936886@example.com\", \"businessPhone\": \"9840999888\", \"billingFooterText\": null, \"registeredAddress\": \"100 Mount Road, Chennai\"}',0,'2026-10-26 10:52:16','2026-10-26 10:52:16'),('30ff1eb9-f9c0-4125-95b5-3b250fa9beae','Direct Fleet 1793012032905','Direct Fleet Private Limited','Direct Fleet','100 Mount Road, Chennai','33AABCD5678F1Z9','AABCD5678F','996609',NULL,'direct_1793012032905@example.com','9840999888',NULL,NULL,NULL,NULL,NULL,'DIR2905',NULL,'direct-fleet-9',NULL,'ACTIVE','BASIC','direct_1793012032905@example.com','9840999888','{\"city\": null, \"gstin\": \"33AABCD5678F1Z9\", \"state\": null, \"logoUrl\": null, \"pinCode\": null, \"sacCode\": \"996609\", \"website\": null, \"gstNumber\": \"33AABCD5678F1Z9\", \"legalName\": \"Direct Fleet Private Limited\", \"panNumber\": \"AABCD5678F\", \"displayName\": \"Direct Fleet\", \"portalTitle\": \"Direct Fleet Mobility Portal\", \"primaryColor\": \"#C04E24\", \"businessEmail\": \"direct_1793012032905@example.com\", \"businessPhone\": \"9840999888\", \"billingFooterText\": null, \"registeredAddress\": \"100 Mount Road, Chennai\"}',0,'2026-10-26 10:53:52','2026-10-26 10:53:52'),('344ee1e5-779f-476c-8067-ee9e827c530d','Royal Crown 6922','Royal Crown 6922 Pvt Ltd','Royal Crown 6922','55 Beach Road, Chennai, Tamil Nadu','33AAACR9988F1Z2','AAACR9988F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RCT6922',NULL,'royal-crown-6922',NULL,'ACTIVE','PRO','admin_6922@royalcrown.com','9840111222',NULL,0,'2026-10-26 10:52:16','2026-10-26 10:52:16'),('36b1f6d8-6eb5-49d3-a379-216aab1ace46','Expired Fleet Logistics',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'EXP6769',NULL,'expired-fleet-logistics-4',NULL,'SUSPENDED','BASIC','expired_1793012706769@example.com','9840888999',NULL,0,'2026-10-26 11:05:06','2026-10-26 11:05:06'),('3b80ee47-fc07-4f1f-8350-54fb5182e4c9','Direct Fleet 1793077354095','Direct Fleet Private Limited','Direct Fleet','100 Mount Road, Chennai','33AABCD5678F1Z9','AABCD5678F','996609',NULL,'direct_1793077354095@example.com','9840999888',NULL,NULL,NULL,NULL,NULL,'DIR4095',NULL,'direct-fleet-24',NULL,'ACTIVE','BASIC','direct_1793077354095@example.com','9840999888','{\"city\": null, \"gstin\": \"33AABCD5678F1Z9\", \"state\": null, \"logoUrl\": null, \"pinCode\": null, \"sacCode\": \"996609\", \"website\": null, \"gstNumber\": \"33AABCD5678F1Z9\", \"legalName\": \"Direct Fleet Private Limited\", \"panNumber\": \"AABCD5678F\", \"displayName\": \"Direct Fleet\", \"portalTitle\": \"Direct Fleet Mobility Portal\", \"primaryColor\": \"#C04E24\", \"businessEmail\": \"direct_1793077354095@example.com\", \"businessPhone\": \"9840999888\", \"billingFooterText\": null, \"registeredAddress\": \"100 Mount Road, Chennai\"}',0,'2026-10-27 05:02:34','2026-10-27 05:02:34'),('3d482f21-8dd3-475d-b81e-c250dfd6efbb','Royal Crown 4363','Royal Crown 4363 Pvt Ltd','Royal Crown 4363','55 Beach Road, Chennai, Tamil Nadu','33AAACR9988F1Z2','AAACR9988F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RCT4363',NULL,'royal-crown-4363',NULL,'ACTIVE','PRO','admin_4363@royalcrown.com','9840111222',NULL,0,'2026-10-27 05:02:34','2026-10-27 05:02:34'),('3db3c1ed-028b-45b5-a606-6ef474beddef','Direct Fleet 1793012118536','Direct Fleet Private Limited','Direct Fleet','100 Mount Road, Chennai','33AABCD5678F1Z9','AABCD5678F','996609',NULL,'direct_1793012118536@example.com','9840999888',NULL,NULL,NULL,NULL,NULL,'DIR8536',NULL,'direct-fleet-10',NULL,'ACTIVE','BASIC','direct_1793012118536@example.com','9840999888','{\"city\": null, \"gstin\": \"33AABCD5678F1Z9\", \"state\": null, \"logoUrl\": null, \"pinCode\": null, \"sacCode\": \"996609\", \"website\": null, \"gstNumber\": \"33AABCD5678F1Z9\", \"legalName\": \"Direct Fleet Private Limited\", \"panNumber\": \"AABCD5678F\", \"displayName\": \"Direct Fleet\", \"portalTitle\": \"Direct Fleet Mobility Portal\", \"primaryColor\": \"#C04E24\", \"businessEmail\": \"direct_1793012118536@example.com\", \"businessPhone\": \"9840999888\", \"billingFooterText\": null, \"registeredAddress\": \"100 Mount Road, Chennai\"}',0,'2026-10-26 10:55:18','2026-10-26 10:55:18'),('3e3ac612-ec08-46ad-8e38-634f67878e3a','Alpha Trial Fleet',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'TRL7693',NULL,'alpha-trial-fleet-17',NULL,'ACTIVE','BASIC','trial_1793012917693@example.com','9840777888',NULL,0,'2026-10-26 11:08:37','2026-10-26 11:08:37'),('400f6d65-2390-4bf3-8c22-b897976d514e','Direct Fleet 1793011744228','Direct Fleet Private Limited','Direct Fleet','100 Mount Road, Chennai','33AABCD5678F1Z9','AABCD5678F','996609',NULL,'direct_1793011744228@example.com','9840999888',NULL,NULL,NULL,NULL,NULL,'DIR4228',NULL,'direct-fleet-4',NULL,'ACTIVE','BASIC','direct_1793011744228@example.com','9840999888','{\"city\": null, \"gstin\": \"33AABCD5678F1Z9\", \"state\": null, \"logoUrl\": null, \"pinCode\": null, \"sacCode\": \"996609\", \"website\": null, \"gstNumber\": \"33AABCD5678F1Z9\", \"legalName\": \"Direct Fleet Private Limited\", \"panNumber\": \"AABCD5678F\", \"displayName\": \"Direct Fleet\", \"portalTitle\": \"Direct Fleet Mobility Portal\", \"primaryColor\": \"#C04E24\", \"businessEmail\": \"direct_1793011744228@example.com\", \"businessPhone\": \"9840999888\", \"billingFooterText\": null, \"registeredAddress\": \"100 Mount Road, Chennai\"}',0,'2026-10-26 10:49:04','2026-10-26 10:49:04'),('40489638-3ae0-4461-8854-d468fe3fa8fd','Royal Crown Travels','Royal Crown Travels Secondary LLP','Royal Crown Travels Branch 2','120 OMR Road, Chennai, Tamil Nadu','33BBBCE5544F1Z1','BBBCE5544F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RC24486',NULL,'royal-crown-4363-2',NULL,'ACTIVE','BASIC','admin@royalcrown2.com','9840333444',NULL,0,'2026-10-27 05:02:34','2026-10-27 05:02:34'),('416b880c-4a51-4df0-b1d8-cb6f344aea8d','Concurrency Test Fleet',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'CON1613',NULL,'concurrency-test-fleet-11',NULL,'TRIALING','BASIC','conc_1793012831613@example.com','9840666555',NULL,0,'2026-10-26 11:07:11','2026-10-26 11:07:11'),('438ad98c-7797-4a23-bc3a-9b7e2a2b1b89','Concurrency Test Fleet',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'CON4755',NULL,'concurrency-test-fleet-17',NULL,'TRIALING','BASIC','conc_1793082384755@example.com','9840666555',NULL,0,'2026-10-27 06:26:24','2026-10-27 06:26:24'),('48a79c2c-150a-4e54-8b52-807f647d6d73','Direct Fleet 1793011769326','Direct Fleet Private Limited','Direct Fleet','100 Mount Road, Chennai','33AABCD5678F1Z9','AABCD5678F','996609',NULL,'direct_1793011769326@example.com','9840999888',NULL,NULL,NULL,NULL,NULL,'DIR9326',NULL,'direct-fleet-5',NULL,'ACTIVE','BASIC','direct_1793011769326@example.com','9840999888','{\"city\": null, \"gstin\": \"33AABCD5678F1Z9\", \"state\": null, \"logoUrl\": null, \"pinCode\": null, \"sacCode\": \"996609\", \"website\": null, \"gstNumber\": \"33AABCD5678F1Z9\", \"legalName\": \"Direct Fleet Private Limited\", \"panNumber\": \"AABCD5678F\", \"displayName\": \"Direct Fleet\", \"portalTitle\": \"Direct Fleet Mobility Portal\", \"primaryColor\": \"#C04E24\", \"businessEmail\": \"direct_1793011769326@example.com\", \"businessPhone\": \"9840999888\", \"billingFooterText\": null, \"registeredAddress\": \"100 Mount Road, Chennai\"}',0,'2026-10-26 10:49:29','2026-10-26 10:49:29'),('499aee4b-5613-4b09-a058-6c95832facac','Royal Crown Travels','Royal Crown Travels Secondary LLP','Royal Crown Travels Branch 2','120 OMR Road, Chennai, Tamil Nadu','33BBBCE5544F1Z1','BBBCE5544F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RC28608',NULL,'royal-crown-8581-2',NULL,'ACTIVE','BASIC','admin@royalcrown2.com','9840333444',NULL,0,'2026-10-26 10:55:18','2026-10-26 10:55:18'),('4d2dcade-0a71-420c-a442-651daf3c1363','Expired Fleet Logistics',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'EXP5404',NULL,'expired-fleet-logistics',NULL,'SUSPENDED','BASIC','expired_1793012425404@example.com','9840888999',NULL,0,'2026-10-26 11:00:25','2026-10-26 11:00:25'),('4ef075e3-83c4-488f-b35e-ab6ff11cfd84','Direct Fleet 1793011900968','Direct Fleet Private Limited','Direct Fleet','100 Mount Road, Chennai','33AABCD5678F1Z9','AABCD5678F','996609',NULL,'direct_1793011900968@example.com','9840999888',NULL,NULL,NULL,NULL,NULL,'DIR0968',NULL,'direct-fleet-6',NULL,'ACTIVE','BASIC','direct_1793011900968@example.com','9840999888','{\"city\": null, \"gstin\": \"33AABCD5678F1Z9\", \"state\": null, \"logoUrl\": null, \"pinCode\": null, \"sacCode\": \"996609\", \"website\": null, \"gstNumber\": \"33AABCD5678F1Z9\", \"legalName\": \"Direct Fleet Private Limited\", \"panNumber\": \"AABCD5678F\", \"displayName\": \"Direct Fleet\", \"portalTitle\": \"Direct Fleet Mobility Portal\", \"primaryColor\": \"#C04E24\", \"businessEmail\": \"direct_1793011900968@example.com\", \"businessPhone\": \"9840999888\", \"billingFooterText\": null, \"registeredAddress\": \"100 Mount Road, Chennai\"}',0,'2026-10-26 10:51:40','2026-10-26 10:51:40'),('4fa09649-9b65-44b3-b2ec-24104936a4c3','Royal Crown 0120','Royal Crown 0120 Pvt Ltd','Royal Crown 0120','55 Beach Road, Chennai, Tamil Nadu','33AAACR9988F1Z2','AAACR9988F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RCT0120',NULL,'royal-crown-0120',NULL,'ACTIVE','PRO','admin_0120@royalcrown.com','9840111222',NULL,0,'2026-10-26 10:48:10','2026-10-26 10:48:10'),('4fbcd6ad-61b0-4ee7-9a10-51879e4aede9','Alpha Trial Fleet',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'TRL8575',NULL,'alpha-trial-fleet-15',NULL,'TRIALING','BASIC','trial_1793012788575@example.com','9840777888',NULL,0,'2026-10-26 11:06:28','2026-10-26 11:06:28'),('504920e4-fcf4-4cae-8b1c-c38019064726','Expired Fleet Logistics',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'EXP8668',NULL,'expired-fleet-logistics-11',NULL,'SUSPENDED','BASIC','expired_1793079238668@example.com','9840888999',NULL,0,'2026-10-27 05:33:58','2026-10-27 05:33:58'),('505d553c-833c-46c5-8424-58cf1d1145fb','Royal Crown 3973','Royal Crown 3973 Pvt Ltd','Royal Crown 3973','55 Beach Road, Chennai, Tamil Nadu','33AAACR9988F1Z2','AAACR9988F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RCT3973',NULL,'royal-crown-3973',NULL,'ACTIVE','PRO','admin_3973@royalcrown.com','9840111222',NULL,0,'2026-10-26 11:04:13','2026-10-26 11:04:13'),('50717437-1869-49e6-b8b5-dbc3453571f0','Alpha Trial Fleet',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'TRL0813',NULL,'alpha-trial-fleet-7',NULL,'TRIALING','BASIC','trial_1793012150813@example.com','9840777888',NULL,0,'2026-10-26 10:55:50','2026-10-26 10:55:50'),('51154808-6063-460c-8d27-520fb7658994','Concurrency Test Fleet',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'CON0874',NULL,'concurrency-test-fleet-2',NULL,'TRIALING','BASIC','conc_1793012150874@example.com','9840666555',NULL,0,'2026-10-26 10:55:50','2026-10-26 10:55:50'),('531837cf-e639-4f92-8025-a6e11b7935bb','Alpha Trial Fleet',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'TRL8837',NULL,'alpha-trial-fleet-6',NULL,'TRIALING','BASIC','trial_1793012118837@example.com','9840777888',NULL,0,'2026-10-26 10:55:18','2026-10-26 10:55:18'),('54159e0a-92dc-42c6-b2a9-ef9c3cac9915','Royal Crown Travels','Royal Crown Travels Secondary LLP','Royal Crown Travels Branch 2','120 OMR Road, Chennai, Tamil Nadu','33BBBCE5544F1Z1','BBBCE5544F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RC21286',NULL,'royal-crown-1260-2',NULL,'ACTIVE','BASIC','admin@royalcrown2.com','9840333444',NULL,0,'2026-10-26 11:07:11','2026-10-26 11:07:11'),('5456eb4d-1c2a-46a8-8a94-28eca00bbcba','Royal Crown Travels','Royal Crown Travels Secondary LLP','Royal Crown Travels Branch 2','120 OMR Road, Chennai, Tamil Nadu','33BBBCE5544F1Z1','BBBCE5544F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RC23998',NULL,'royal-crown-3973-2',NULL,'ACTIVE','BASIC','admin@royalcrown2.com','9840333444',NULL,0,'2026-10-26 11:04:13','2026-10-26 11:04:13'),('54ca161a-3ed6-436e-b360-0e6579f24161','Royal Crown 8289','Royal Crown 8289 Pvt Ltd','Royal Crown 8289','55 Beach Road, Chennai, Tamil Nadu','33AAACR9988F1Z2','AAACR9988F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RCT8289',NULL,'royal-crown-8289',NULL,'ACTIVE','PRO','admin_8289@royalcrown.com','9840111222',NULL,0,'2026-10-26 11:06:28','2026-10-26 11:06:28'),('594d4f70-4c89-42a4-88e9-a6d383b7f18f','Alpha Trial Fleet',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'TRL2931',NULL,'alpha-trial-fleet-12',NULL,'TRIALING','BASIC','trial_1793012472931@example.com','9840777888',NULL,0,'2026-10-26 11:01:12','2026-10-26 11:01:12'),('5956da65-26f8-45b7-837e-14d325ea828f','Royal Crown 3501','Royal Crown 3501 Pvt Ltd','Royal Crown 3501','55 Beach Road, Chennai, Tamil Nadu','33AAACR9988F1Z2','AAACR9988F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RCT3501',NULL,'royal-crown-3501',NULL,'ACTIVE','PRO','admin_3501@royalcrown.com','9840111222',NULL,0,'2026-10-27 08:22:23','2026-10-27 08:22:23'),('59a0185e-a748-43d5-857f-e5033068dba3','Concurrency Test Fleet',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'CON8915',NULL,'concurrency-test-fleet',NULL,'TRIALING','BASIC','conc_1793012118915@example.com','9840666555',NULL,0,'2026-10-26 10:55:18','2026-10-26 10:55:18'),('59df4b42-e707-4c6e-8333-35fa0f5bd0f7','Royal Crown 1015','Royal Crown 1015 Pvt Ltd','Royal Crown 1015','55 Beach Road, Chennai, Tamil Nadu','33AAACR9988F1Z2','AAACR9988F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RCT1015',NULL,'royal-crown-1015',NULL,'ACTIVE','PRO','admin_1015@royalcrown.com','9840111222',NULL,0,'2026-10-26 10:51:41','2026-10-26 10:51:41'),('5bb662fb-e515-48c3-ac74-65e70e4d4418','Royal Crown 4263','Royal Crown 4263 Pvt Ltd','Royal Crown 4263','55 Beach Road, Chennai, Tamil Nadu','33AAACR9988F1Z2','AAACR9988F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RCT4263',NULL,'royal-crown-4263',NULL,'ACTIVE','PRO','admin_4263@royalcrown.com','9840111222',NULL,0,'2026-10-26 10:49:04','2026-10-26 10:49:04'),('60c05b9e-ac6c-47c0-9343-e31b2eba7897','Direct Fleet 1793012150497','Direct Fleet Private Limited','Direct Fleet','100 Mount Road, Chennai','33AABCD5678F1Z9','AABCD5678F','996609',NULL,'direct_1793012150497@example.com','9840999888',NULL,NULL,NULL,NULL,NULL,'DIR0497',NULL,'direct-fleet-11',NULL,'ACTIVE','BASIC','direct_1793012150497@example.com','9840999888','{\"city\": null, \"gstin\": \"33AABCD5678F1Z9\", \"state\": null, \"logoUrl\": null, \"pinCode\": null, \"sacCode\": \"996609\", \"website\": null, \"gstNumber\": \"33AABCD5678F1Z9\", \"legalName\": \"Direct Fleet Private Limited\", \"panNumber\": \"AABCD5678F\", \"displayName\": \"Direct Fleet\", \"portalTitle\": \"Direct Fleet Mobility Portal\", \"primaryColor\": \"#C04E24\", \"businessEmail\": \"direct_1793012150497@example.com\", \"businessPhone\": \"9840999888\", \"billingFooterText\": null, \"registeredAddress\": \"100 Mount Road, Chennai\"}',0,'2026-10-26 10:55:50','2026-10-26 10:55:50'),('630999b4-e63d-4baf-9b75-2536bc8bb057','Concurrency Test Fleet',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'CON3926',NULL,'concurrency-test-fleet-18',NULL,'TRIALING','BASIC','conc_1793089343926@example.com','9840666555',NULL,0,'2026-10-27 08:22:23','2026-10-27 08:22:23'),('6b01d3e6-6551-40a6-80e1-5c516bdb1101','murugan','Mm','murugan','ndjhqdidwqidwqwq','33AAACA1111A1Z1','AAACA1111A','996609','none','subisha2002.m@gmail.com','9080280818',NULL,'chennai','tamil nadu','900024',NULL,'MURU','muru','murugan',NULL,'ACTIVE','BASIC','subisha2002.m@gmail.com','9080280818','{\"city\": \"chennai\", \"gstin\": \"33AAACA1111A1Z1\", \"state\": \"tamil nadu\", \"logoUrl\": null, \"pinCode\": \"900024\", \"sacCode\": \"996609\", \"website\": \"none\", \"gstNumber\": \"33AAACA1111A1Z1\", \"legalName\": \"Mm\", \"panNumber\": \"AAACA1111A\", \"displayName\": \"murugan\", \"portalTitle\": \"murugan Fleet Portal\", \"primaryColor\": \"#0f1c3f\", \"businessEmail\": \"subisha2002.m@gmail.com\", \"businessPhone\": \"9080280818\", \"secondaryColor\": \"#0d9488\", \"billingFooterText\": null, \"registeredAddress\": \"ndjhqdidwqidwqwq\"}',0,'2026-10-26 09:41:33','2026-10-26 09:41:33'),('6b988999-a101-4da6-95a9-2f67bb663022','Royal Crown Travels','Royal Crown Travels Secondary LLP','Royal Crown Travels Branch 2','120 OMR Road, Chennai, Tamil Nadu','33BBBCE5544F1Z1','BBBCE5544F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RC26322',NULL,'royal-crown-6294-2',NULL,'ACTIVE','BASIC','admin@royalcrown2.com','9840333444',NULL,0,'2026-10-26 11:05:06','2026-10-26 11:05:06'),('6ccf8eb7-0af0-482b-a92e-7a66654360a8','Royal Crown 2555','Royal Crown 2555 Pvt Ltd','Royal Crown 2555','55 Beach Road, Chennai, Tamil Nadu','33AAACR9988F1Z2','AAACR9988F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RCT2555',NULL,'royal-crown-2555',NULL,'ACTIVE','PRO','admin_2555@royalcrown.com','9840111222',NULL,0,'2026-10-26 11:01:12','2026-10-26 11:01:12'),('6ce01506-2fc2-4b10-9ea1-bfca2f1cf6d9','Concurrency Test Fleet',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'CON5355',NULL,'concurrency-test-fleet-6',NULL,'TRIALING','BASIC','conc_1793012425355@example.com','9840666555',NULL,0,'2026-10-26 11:00:25','2026-10-26 11:00:25'),('70adcfea-e31d-4d01-b09a-50c20f23d02b','Concurrency Test Fleet',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'CON3757',NULL,'concurrency-test-fleet-3',NULL,'TRIALING','BASIC','conc_1793012203757@example.com','9840666555',NULL,0,'2026-10-26 10:56:43','2026-10-26 10:56:43'),('7167a639-c5e9-4b87-9e19-b5343a249ff6','Alpha Trial Fleet',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'TRL2158',NULL,'alpha-trial-fleet-4',NULL,'TRIALING','BASIC','trial_1793011972158@example.com','9840777888',NULL,0,'2026-10-26 10:52:52','2026-10-26 10:52:52'),('72cb90df-c8bb-4a68-a14b-97d9066643b5','Alpha Trial Fleet',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'TRL1536',NULL,'alpha-trial-fleet-16',NULL,'ACTIVE','BASIC','trial_1793012831536@example.com','9840777888',NULL,0,'2026-10-26 11:07:11','2026-10-26 11:07:11'),('735dca32-4751-4843-b907-5d3cb08c435e','Direct Fleet 1793012369837','Direct Fleet Private Limited','Direct Fleet','100 Mount Road, Chennai','33AABCD5678F1Z9','AABCD5678F','996609',NULL,'direct_1793012369837@example.com','9840999888',NULL,NULL,NULL,NULL,NULL,'DIR9837',NULL,'direct-fleet-14',NULL,'ACTIVE','BASIC','direct_1793012369837@example.com','9840999888','{\"city\": null, \"gstin\": \"33AABCD5678F1Z9\", \"state\": null, \"logoUrl\": null, \"pinCode\": null, \"sacCode\": \"996609\", \"website\": null, \"gstNumber\": \"33AABCD5678F1Z9\", \"legalName\": \"Direct Fleet Private Limited\", \"panNumber\": \"AABCD5678F\", \"displayName\": \"Direct Fleet\", \"portalTitle\": \"Direct Fleet Mobility Portal\", \"primaryColor\": \"#C04E24\", \"businessEmail\": \"direct_1793012369837@example.com\", \"businessPhone\": \"9840999888\", \"billingFooterText\": null, \"registeredAddress\": \"100 Mount Road, Chennai\"}',0,'2026-10-26 10:59:29','2026-10-26 10:59:29'),('76cee6fb-3d8c-430f-a8e4-c1ea14542050','Direct Fleet 1793013220844','Direct Fleet Private Limited','Direct Fleet','100 Mount Road, Chennai','33AABCD5678F1Z9','AABCD5678F','996609',NULL,'direct_1793013220844@example.com','9840999888',NULL,NULL,NULL,NULL,NULL,'DIR0844',NULL,'direct-fleet-23',NULL,'ACTIVE','BASIC','direct_1793013220844@example.com','9840999888','{\"city\": null, \"gstin\": \"33AABCD5678F1Z9\", \"state\": null, \"logoUrl\": null, \"pinCode\": null, \"sacCode\": \"996609\", \"website\": null, \"gstNumber\": \"33AABCD5678F1Z9\", \"legalName\": \"Direct Fleet Private Limited\", \"panNumber\": \"AABCD5678F\", \"displayName\": \"Direct Fleet\", \"portalTitle\": \"Direct Fleet Mobility Portal\", \"primaryColor\": \"#C04E24\", \"businessEmail\": \"direct_1793013220844@example.com\", \"businessPhone\": \"9840999888\", \"billingFooterText\": null, \"registeredAddress\": \"100 Mount Road, Chennai\"}',0,'2026-10-26 11:13:40','2026-10-26 11:13:40'),('7a56819a-e318-4c2f-936f-fe4bc4f2e0da','Royal Crown Travels','Royal Crown Travels Secondary LLP','Royal Crown Travels Branch 2','120 OMR Road, Chennai, Tamil Nadu','33BBBCE5544F1Z1','BBBCE5544F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RC21043',NULL,'royal-crown-1015-2',NULL,'ACTIVE','BASIC','admin@royalcrown2.com','9840333444',NULL,0,'2026-10-26 10:51:41','2026-10-26 10:51:41'),('7a79db14-42c3-4bf8-a32d-fc2c71ae6431','Alpha Trial Fleet',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'TRL3680',NULL,'alpha-trial-fleet-8',NULL,'TRIALING','BASIC','trial_1793012203680@example.com','9840777888',NULL,0,'2026-10-26 10:56:43','2026-10-26 10:56:43'),('7afb9ae4-b340-4c72-b5bf-7158e0255e31','Royal Crown 4348','Royal Crown 4348 Pvt Ltd','Royal Crown 4348','55 Beach Road, Chennai, Tamil Nadu','33AAACR9988F1Z2','AAACR9988F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RCT4348',NULL,'royal-crown-4348',NULL,'ACTIVE','PRO','admin_4348@royalcrown.com','9840111222',NULL,0,'2026-10-27 06:26:24','2026-10-27 06:26:24'),('7d20ff43-937f-4d04-acb3-1047a5dc5cfa','Royal Crown 8879','Royal Crown 8879 Pvt Ltd','Royal Crown 8879','55 Beach Road, Chennai, Tamil Nadu','33AAACR9988F1Z2','AAACR9988F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RCT8879',NULL,'royal-crown-8879',NULL,'ACTIVE','PRO','admin_8879@royalcrown.com','9840111222',NULL,0,'2026-10-26 11:12:58','2026-10-26 11:12:58'),('8196f08d-5b17-4ae6-969b-19ed8cfccd1b','Royal Crown 2948','Royal Crown 2948 Pvt Ltd','Royal Crown 2948','55 Beach Road, Chennai, Tamil Nadu','33AAACR9988F1Z2','AAACR9988F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RCT2948',NULL,'royal-crown-2948',NULL,'ACTIVE','PRO','admin_2948@royalcrown.com','9840111222',NULL,0,'2026-10-26 10:53:52','2026-10-26 10:53:52'),('81cb112c-0be8-4022-937e-ff07299c2633','Royal Crown Travels','Royal Crown Travels Secondary LLP','Royal Crown Travels Branch 2','120 OMR Road, Chennai, Tamil Nadu','33BBBCE5544F1Z1','BBBCE5544F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RC27452',NULL,'royal-crown-7427-2',NULL,'ACTIVE','BASIC','admin@royalcrown2.com','9840333444',NULL,0,'2026-10-26 11:08:37','2026-10-26 11:08:37'),('831f577b-d063-4260-9b05-a567599bec10','Concurrency Test Fleet',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'CON9291',NULL,'concurrency-test-fleet-13',NULL,'TRIALING','BASIC','conc_1793013179291@example.com','9840666555',NULL,0,'2026-10-26 11:12:59','2026-10-26 11:12:59'),('84d4cfab-e4aa-48f1-aa7a-f4ed4ad3f2d3','Alpha Trial Fleet',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'TRL5068',NULL,'alpha-trial-fleet-20',NULL,'ACTIVE','BASIC','trial_1793077355068@example.com','9840777888',NULL,0,'2026-10-27 05:02:35','2026-10-27 05:02:35'),('864028f8-fed4-45e3-bbe0-678164141166','Royal Crown 9359','Royal Crown 9359 Pvt Ltd','Royal Crown 9359','55 Beach Road, Chennai, Tamil Nadu','33AAACR9988F1Z2','AAACR9988F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RCT9359',NULL,'royal-crown-9359',NULL,'ACTIVE','PRO','admin_9359@royalcrown.com','9840111222',NULL,0,'2026-10-26 10:49:29','2026-10-26 10:49:29'),('88f558db-5b1d-479c-928a-47f1fa5da23d','Direct Fleet 1793012653918','Direct Fleet Private Limited','Direct Fleet','100 Mount Road, Chennai','33AABCD5678F1Z9','AABCD5678F','996609',NULL,'direct_1793012653918@example.com','9840999888',NULL,NULL,NULL,NULL,NULL,'DIR3918',NULL,'direct-fleet-17',NULL,'ACTIVE','BASIC','direct_1793012653918@example.com','9840999888','{\"city\": null, \"gstin\": \"33AABCD5678F1Z9\", \"state\": null, \"logoUrl\": null, \"pinCode\": null, \"sacCode\": \"996609\", \"website\": null, \"gstNumber\": \"33AABCD5678F1Z9\", \"legalName\": \"Direct Fleet Private Limited\", \"panNumber\": \"AABCD5678F\", \"displayName\": \"Direct Fleet\", \"portalTitle\": \"Direct Fleet Mobility Portal\", \"primaryColor\": \"#C04E24\", \"businessEmail\": \"direct_1793012653918@example.com\", \"businessPhone\": \"9840999888\", \"billingFooterText\": null, \"registeredAddress\": \"100 Mount Road, Chennai\"}',0,'2026-10-26 11:04:13','2026-10-26 11:04:13'),('8970df63-7733-4fe9-afcc-6ef1bc2b51ad','Royal Crown Travels','Royal Crown Travels Secondary LLP','Royal Crown Travels Branch 2','120 OMR Road, Chennai, Tamil Nadu','33BBBCE5544F1Z1','BBBCE5544F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RC22584',NULL,'royal-crown-2555-2',NULL,'ACTIVE','BASIC','admin@royalcrown2.com','9840333444',NULL,0,'2026-10-26 11:01:12','2026-10-26 11:01:12'),('8c0881af-862e-4450-b622-50d7906fef8c','Royal Crown Travels','Royal Crown Travels Secondary LLP','Royal Crown Travels Branch 2','120 OMR Road, Chennai, Tamil Nadu','33BBBCE5544F1Z1','BBBCE5544F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RC24373',NULL,'royal-crown-4348-2',NULL,'ACTIVE','BASIC','admin@royalcrown2.com','9840333444',NULL,0,'2026-10-27 06:26:24','2026-10-27 06:26:24'),('8c0e1bbc-bc5d-43b6-b1b7-4579226d1789','Alpha Trial Fleet',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'TRL7906',NULL,'alpha-trial-fleet-21',NULL,'ACTIVE','BASIC','trial_1793079237906@example.com','9840777888',NULL,0,'2026-10-27 05:33:57','2026-10-27 05:33:58'),('907eb507-feb7-4349-b931-e269dcf8711d','Alpha Trial Fleet',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'TRL4252',NULL,'alpha-trial-fleet-13',NULL,'TRIALING','BASIC','trial_1793012654252@example.com','9840777888',NULL,0,'2026-10-26 11:04:14','2026-10-26 11:04:14'),('947137fb-2d6a-4d64-be86-af111ae6edca','Alpha Trial Fleet',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'TRL3814',NULL,'alpha-trial-fleet-23',NULL,'ACTIVE','BASIC','trial_1793089343814@example.com','9840777888',NULL,0,'2026-10-27 08:22:23','2026-10-27 08:22:24'),('9552c63f-fc15-462d-b884-068e4fae58a4','Royal Crown Travels','Royal Crown Travels Secondary LLP','Royal Crown Travels Branch 2','120 OMR Road, Chennai, Tamil Nadu','33BBBCE5544F1Z1','BBBCE5544F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RC22975',NULL,'royal-crown-2948-2',NULL,'ACTIVE','BASIC','admin@royalcrown2.com','9840333444',NULL,0,'2026-10-26 10:53:52','2026-10-26 10:53:52'),('9555e488-f206-41df-9d36-1cacbdb5ee45','Alpha Trial Fleet',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'TRL7366',NULL,'alpha-trial-fleet-9',NULL,'TRIALING','BASIC','trial_1793012337366@example.com','9840777888',NULL,0,'2026-10-26 10:58:57','2026-10-26 10:58:57'),('971d5f55-000c-42a5-99d7-847f558030ab','Concurrency Test Fleet',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'CON0243',NULL,'concurrency-test-fleet-5',NULL,'TRIALING','BASIC','conc_1793012370243@example.com','9840666555',NULL,0,'2026-10-26 10:59:30','2026-10-26 10:59:30'),('985f82e2-e183-4631-a895-c8a1f7202dd4','Royal Crown Travels','Royal Crown Travels Secondary LLP','Royal Crown Travels Branch 2','120 OMR Road, Chennai, Tamil Nadu','33BBBCE5544F1Z1','BBBCE5544F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RC24291',NULL,'royal-crown-4263-2',NULL,'ACTIVE','BASIC','admin@royalcrown2.com','9840333444',NULL,0,'2026-10-26 10:49:04','2026-10-26 10:49:04'),('9b1f52d3-976e-4b2b-a48e-344bca239f53','Royal Crown Travels','Royal Crown Travels Secondary LLP','Royal Crown Travels Branch 2','120 OMR Road, Chennai, Tamil Nadu','33BBBCE5544F1Z1','BBBCE5544F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RC20143',NULL,'royal-crown-0120-2',NULL,'ACTIVE','BASIC','admin@royalcrown2.com','9840333444',NULL,0,'2026-10-26 10:48:10','2026-10-26 10:48:10'),('9d168cf5-c018-47e1-a55b-f770c8b9f6ae','Alpha Trial Fleet',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'TRL1277',NULL,'alpha-trial-fleet-2',NULL,'TRIALING','BASIC','trial_1793011901277@example.com','9840777888',NULL,0,'2026-10-26 10:51:41','2026-10-26 10:51:41'),('9df01533-d6cf-4d1b-b143-69d01799202a','Royal Crown 9889','Royal Crown 9889 Pvt Ltd','Royal Crown 9889','55 Beach Road, Chennai, Tamil Nadu','33AAACR9988F1Z2','AAACR9988F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RCT9889',NULL,'royal-crown-9889',NULL,'ACTIVE','PRO','admin_9889@royalcrown.com','9840111222',NULL,0,'2026-10-26 10:59:29','2026-10-26 10:59:29'),('9fdc26c3-64b3-4c6b-8139-a2d33273a542','Concurrency Test Fleet',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'CON8575',NULL,'concurrency-test-fleet-16',NULL,'TRIALING','BASIC','conc_1793079238575@example.com','9840666555',NULL,0,'2026-10-27 05:33:58','2026-10-27 05:33:58'),('a1111111-aaaa-1111-aaaa-111111111111','Alpha Fleet Ltd',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'ALPHA_FLEET',NULL,NULL,NULL,'ACTIVE','PRO','ops@alphafleet.com','9840112233','{\"portalTitle\": \"Alpha Portal\", \"primaryColor\": \"#1A365D\"}',0,'2026-10-27 09:54:25','2026-10-27 09:54:25'),('a1a1a1a1-1111-4111-a111-111111111111','Alpha Fleet Logistics',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'ALPHA',NULL,'alpha-fleet-logistics',NULL,'ACTIVE','PRO','admin@alphafleet.com','9876543210',NULL,0,'2026-10-26 05:34:18','2026-10-26 05:34:18'),('a2d742c4-5599-482b-8fe4-84700f5b3e8b','Concurrency Test Fleet',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'CON4349',NULL,'concurrency-test-fleet-8',NULL,'TRIALING','BASIC','conc_1793012654349@example.com','9840666555',NULL,0,'2026-10-26 11:04:14','2026-10-26 11:04:14'),('a3fa5b1b-f0d8-4e16-8889-471a017ad1bc','Royal Crown 5010','Royal Crown 5010 Pvt Ltd','Royal Crown 5010','55 Beach Road, Chennai, Tamil Nadu','33AAACR9988F1Z2','AAACR9988F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RCT5010',NULL,'royal-crown-5010',NULL,'ACTIVE','PRO','admin_5010@royalcrown.com','9840111222',NULL,0,'2026-10-26 11:00:25','2026-10-26 11:00:25'),('a6c333c9-89d7-4db6-b6f2-a29c7707dd23','Royal Crown Travels','Royal Crown Travels Secondary LLP','Royal Crown Travels Branch 2','120 OMR Road, Chennai, Tamil Nadu','33BBBCE5544F1Z1','BBBCE5544F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RC23529',NULL,'royal-crown-3501-2',NULL,'ACTIVE','BASIC','admin@royalcrown2.com','9840333444',NULL,0,'2026-10-27 08:22:23','2026-10-27 08:22:23'),('a784fac0-0d30-4702-9f58-1f8225da5f3c','Concurrency Test Fleet',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'CON3008',NULL,'concurrency-test-fleet-7',NULL,'TRIALING','BASIC','conc_1793012473008@example.com','9840666555',NULL,0,'2026-10-26 11:01:13','2026-10-26 11:01:13'),('a9d4f43a-f8f4-47fc-b385-cc912b9b71c3','Royal Crown Travels','Royal Crown Travels Secondary LLP','Royal Crown Travels Branch 2','120 OMR Road, Chennai, Tamil Nadu','33BBBCE5544F1Z1','BBBCE5544F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RC29383',NULL,'royal-crown-9359-2',NULL,'ACTIVE','BASIC','admin@royalcrown2.com','9840333444',NULL,0,'2026-10-26 10:49:29','2026-10-26 10:49:29'),('aab57fb6-54fd-4a08-9553-c1771dc94612','Direct Fleet 1793012917361','Direct Fleet Private Limited','Direct Fleet','100 Mount Road, Chennai','33AABCD5678F1Z9','AABCD5678F','996609',NULL,'direct_1793012917361@example.com','9840999888',NULL,NULL,NULL,NULL,NULL,'DIR7361',NULL,'direct-fleet-21',NULL,'ACTIVE','BASIC','direct_1793012917361@example.com','9840999888','{\"city\": null, \"gstin\": \"33AABCD5678F1Z9\", \"state\": null, \"logoUrl\": null, \"pinCode\": null, \"sacCode\": \"996609\", \"website\": null, \"gstNumber\": \"33AABCD5678F1Z9\", \"legalName\": \"Direct Fleet Private Limited\", \"panNumber\": \"AABCD5678F\", \"displayName\": \"Direct Fleet\", \"portalTitle\": \"Direct Fleet Mobility Portal\", \"primaryColor\": \"#C04E24\", \"businessEmail\": \"direct_1793012917361@example.com\", \"businessPhone\": \"9840999888\", \"billingFooterText\": null, \"registeredAddress\": \"100 Mount Road, Chennai\"}',0,'2026-10-26 11:08:37','2026-10-26 11:08:37'),('ab56c8c9-cfaf-4a4a-ac85-060901910390','Cosmic Cabs Logistics','Cosmic Cabs Logistics LLP','Cosmic Cabs Logistics','77 Cosmic Tower, Bangalore','29ABCDE1234F1Z8','ABCDE1234F','996601',NULL,'cosmic-1792997602281@example.com','9988776655',NULL,'Bangalore','Karnataka',NULL,NULL,'CSM680','csm680','cosmic-cabs-logistics-2',NULL,'ACTIVE','PRO','cosmic-1792997602281@example.com','9988776655','{\"city\": \"Bangalore\", \"gstin\": \"29ABCDE1234F1Z8\", \"state\": \"Karnataka\", \"logoUrl\": null, \"pinCode\": null, \"sacCode\": \"996601\", \"website\": null, \"gstNumber\": \"29ABCDE1234F1Z8\", \"legalName\": \"Cosmic Cabs Logistics LLP\", \"panNumber\": \"ABCDE1234F\", \"displayName\": \"Cosmic Cabs Logistics\", \"portalTitle\": \"Cosmic Cabs Logistics Fleet Portal\", \"primaryColor\": \"#0f1c3f\", \"businessEmail\": \"cosmic-1792997602281@example.com\", \"businessPhone\": \"9988776655\", \"secondaryColor\": \"#0d9488\", \"billingFooterText\": null, \"registeredAddress\": \"77 Cosmic Tower, Bangalore\"}',0,'2026-10-26 06:53:22','2026-10-26 06:53:22'),('ada467ee-14ca-4f9f-8cfc-56a5c6e93267','Direct Fleet 1793012424957','Direct Fleet Private Limited','Direct Fleet','100 Mount Road, Chennai','33AABCD5678F1Z9','AABCD5678F','996609',NULL,'direct_1793012424957@example.com','9840999888',NULL,NULL,NULL,NULL,NULL,'DIR4957',NULL,'direct-fleet-15',NULL,'ACTIVE','BASIC','direct_1793012424957@example.com','9840999888','{\"city\": null, \"gstin\": \"33AABCD5678F1Z9\", \"state\": null, \"logoUrl\": null, \"pinCode\": null, \"sacCode\": \"996609\", \"website\": null, \"gstNumber\": \"33AABCD5678F1Z9\", \"legalName\": \"Direct Fleet Private Limited\", \"panNumber\": \"AABCD5678F\", \"displayName\": \"Direct Fleet\", \"portalTitle\": \"Direct Fleet Mobility Portal\", \"primaryColor\": \"#C04E24\", \"businessEmail\": \"direct_1793012424957@example.com\", \"businessPhone\": \"9840999888\", \"billingFooterText\": null, \"registeredAddress\": \"100 Mount Road, Chennai\"}',0,'2026-10-26 11:00:24','2026-10-26 11:00:24'),('b0205814-a74f-45d1-8d09-0654f387bd74','Expired Fleet Logistics',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'EXP7832',NULL,'expired-fleet-logistics-7',NULL,'SUSPENDED','BASIC','expired_1793012917832@example.com','9840888999',NULL,0,'2026-10-26 11:08:37','2026-10-26 11:08:37'),('b0581acf-3c54-4164-9466-89a3ea80d471','Royal Crown 7604','Royal Crown 7604 Pvt Ltd','Royal Crown 7604','55 Beach Road, Chennai, Tamil Nadu','33AAACR9988F1Z2','AAACR9988F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RCT7604',NULL,'royal-crown-7604',NULL,'ACTIVE','PRO','admin_7604@royalcrown.com','9840111222',NULL,0,'2026-10-27 05:33:57','2026-10-27 05:33:57'),('b2222222-bbbb-2222-bbbb-222222222222','Beta Transport Corp',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'BETA_CORP',NULL,NULL,NULL,'ACTIVE','ENTERPRISE','ops@betatransport.com','9840998877','{\"portalTitle\": \"Beta Transport\", \"primaryColor\": \"#C04E24\"}',0,'2026-10-27 09:54:25','2026-10-27 09:54:25'),('b2cc9ed9-00b8-4c66-abc2-47886229aa39','Royal Crown 0545','Royal Crown 0545 Pvt Ltd','Royal Crown 0545','55 Beach Road, Chennai, Tamil Nadu','33AAACR9988F1Z2','AAACR9988F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RCT0545',NULL,'royal-crown-0545',NULL,'ACTIVE','PRO','admin_0545@royalcrown.com','9840111222',NULL,0,'2026-10-26 10:55:50','2026-10-26 10:55:50'),('b411f2f9-4b43-42b5-a8a2-b112f392c6b3','Expired Fleet Logistics',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'EXP4838',NULL,'expired-fleet-logistics-12',NULL,'SUSPENDED','BASIC','expired_1793082384838@example.com','9840888999',NULL,0,'2026-10-27 06:26:24','2026-10-27 06:26:24'),('b5ceeae1-3869-43ae-a2c8-854a92781158','Alpha Trial Fleet',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'TRL9641',NULL,'alpha-trial-fleet',NULL,'TRIALING','BASIC','trial_1793011769641@example.com','9840777888',NULL,0,'2026-10-26 10:49:29','2026-10-26 10:49:29'),('b65e2d41-164f-493c-9fd8-c93d635c382f','Expired Fleet Logistics',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'EXP4401',NULL,'expired-fleet-logistics-3',NULL,'SUSPENDED','BASIC','expired_1793012654401@example.com','9840888999',NULL,0,'2026-10-26 11:04:14','2026-10-26 11:04:14'),('b6acd454-82f0-4eec-b6de-cfc048ca1eb6','Direct Fleet 1793012472502','Direct Fleet Private Limited','Direct Fleet','100 Mount Road, Chennai','33AABCD5678F1Z9','AABCD5678F','996609',NULL,'direct_1793012472502@example.com','9840999888',NULL,NULL,NULL,NULL,NULL,'DIR2502',NULL,'direct-fleet-16',NULL,'ACTIVE','BASIC','direct_1793012472502@example.com','9840999888','{\"city\": null, \"gstin\": \"33AABCD5678F1Z9\", \"state\": null, \"logoUrl\": null, \"pinCode\": null, \"sacCode\": \"996609\", \"website\": null, \"gstNumber\": \"33AABCD5678F1Z9\", \"legalName\": \"Direct Fleet Private Limited\", \"panNumber\": \"AABCD5678F\", \"displayName\": \"Direct Fleet\", \"portalTitle\": \"Direct Fleet Mobility Portal\", \"primaryColor\": \"#C04E24\", \"businessEmail\": \"direct_1793012472502@example.com\", \"businessPhone\": \"9840999888\", \"billingFooterText\": null, \"registeredAddress\": \"100 Mount Road, Chennai\"}',0,'2026-10-26 11:01:12','2026-10-26 11:01:12'),('b828e4e5-1bef-4f42-bbc4-a6c84045a0a6','Royal Crown Travels','Royal Crown Travels Secondary LLP','Royal Crown Travels Branch 2','120 OMR Road, Chennai, Tamil Nadu','33BBBCE5544F1Z1','BBBCE5544F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RC21914',NULL,'royal-crown-1887-2',NULL,'ACTIVE','BASIC','admin@royalcrown2.com','9840333444',NULL,0,'2026-10-26 10:52:51','2026-10-26 10:52:51'),('b84a1dc8-afdf-433d-afad-2aa2465a8be7','Cosmic Cabs Logistics','Cosmic Cabs Logistics LLP','Cosmic Cabs Logistics','77 Cosmic Tower, Bangalore','29ABCDE1234F1Z8','ABCDE1234F','996601',NULL,'cosmic-1792998352879@example.com','9988776655',NULL,'Bangalore','Karnataka',NULL,NULL,'CSM520','csm520','cosmic-cabs-logistics-3',NULL,'ACTIVE','PRO','cosmic-1792998352879@example.com','9988776655','{\"city\": \"Bangalore\", \"gstin\": \"29ABCDE1234F1Z8\", \"state\": \"Karnataka\", \"logoUrl\": null, \"pinCode\": null, \"sacCode\": \"996601\", \"website\": null, \"gstNumber\": \"29ABCDE1234F1Z8\", \"legalName\": \"Cosmic Cabs Logistics LLP\", \"panNumber\": \"ABCDE1234F\", \"displayName\": \"Cosmic Cabs Logistics\", \"portalTitle\": \"Cosmic Cabs Logistics Fleet Portal\", \"primaryColor\": \"#0f1c3f\", \"businessEmail\": \"cosmic-1792998352879@example.com\", \"businessPhone\": \"9988776655\", \"secondaryColor\": \"#0d9488\", \"billingFooterText\": null, \"registeredAddress\": \"77 Cosmic Tower, Bangalore\"}',0,'2026-10-26 07:05:53','2026-10-26 07:05:53'),('b9ad5bb2-0fa2-4097-b5f3-b5c0f224d43f','Royal Crown Travels','Royal Crown Travels Secondary LLP','Royal Crown Travels Branch 2','120 OMR Road, Chennai, Tamil Nadu','33BBBCE5544F1Z1','BBBCE5544F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RC23431',NULL,'royal-crown-3406-2',NULL,'ACTIVE','BASIC','admin@royalcrown2.com','9840333444',NULL,0,'2026-10-26 10:56:43','2026-10-26 10:56:43'),('bb245216-06d4-44cf-8771-7c2cbdb4caf6','Alpha Trial Fleet',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'TRL3201',NULL,'alpha-trial-fleet-5',NULL,'TRIALING','BASIC','trial_1793012033201@example.com','9840777888',NULL,0,'2026-10-26 10:53:53','2026-10-26 10:53:53'),('bc102a2e-f2e9-404b-86db-3ff2b1535b64','Cosmic Cabs Logistics','Cosmic Cabs Logistics LLP','Cosmic Cabs Logistics','77 Cosmic Tower, Bangalore','29ABCDE1234F1Z8','ABCDE1234F','996601',NULL,'cosmic-1792997998924@example.com','9988776655',NULL,'Bangalore','Karnataka',NULL,NULL,'CSM943','csm943','cosmic-cabs-logistics-4',NULL,'ACTIVE','PRO','cosmic-1792997998924@example.com','9988776655','{\"city\": \"Bangalore\", \"gstin\": \"29ABCDE1234F1Z8\", \"state\": \"Karnataka\", \"logoUrl\": null, \"pinCode\": null, \"sacCode\": \"996601\", \"website\": null, \"gstNumber\": \"29ABCDE1234F1Z8\", \"legalName\": \"Cosmic Cabs Logistics LLP\", \"panNumber\": \"ABCDE1234F\", \"displayName\": \"Cosmic Cabs Logistics\", \"portalTitle\": \"Cosmic Cabs Logistics Fleet Portal\", \"primaryColor\": \"#0f1c3f\", \"businessEmail\": \"cosmic-1792997998924@example.com\", \"businessPhone\": \"9988776655\", \"secondaryColor\": \"#0d9488\", \"billingFooterText\": null, \"registeredAddress\": \"77 Cosmic Tower, Bangalore\"}',0,'2026-10-26 06:59:59','2026-10-26 06:59:59'),('bc95b9f7-d75f-470c-b7f9-bc733eac8dc3','Cosmic Cabs Logistics','Cosmic Cabs Logistics LLP','Cosmic Cabs Logistics','77 Cosmic Tower, Bangalore','29ABCDE1234F1Z8','ABCDE1234F','996601',NULL,'cosmic-1792998058419@example.com','9988776655',NULL,'Bangalore','Karnataka',NULL,NULL,'CSM813','csm813','cosmic-cabs-logistics-5',NULL,'ACTIVE','PRO','cosmic-1792998058419@example.com','9988776655','{\"city\": \"Bangalore\", \"gstin\": \"29ABCDE1234F1Z8\", \"state\": \"Karnataka\", \"logoUrl\": null, \"pinCode\": null, \"sacCode\": \"996601\", \"website\": null, \"gstNumber\": \"29ABCDE1234F1Z8\", \"legalName\": \"Cosmic Cabs Logistics LLP\", \"panNumber\": \"ABCDE1234F\", \"displayName\": \"Cosmic Cabs Logistics\", \"portalTitle\": \"Cosmic Cabs Logistics Fleet Portal\", \"primaryColor\": \"#0f1c3f\", \"businessEmail\": \"cosmic-1792998058419@example.com\", \"businessPhone\": \"9988776655\", \"secondaryColor\": \"#0d9488\", \"billingFooterText\": null, \"registeredAddress\": \"77 Cosmic Tower, Bangalore\"}',0,'2026-10-26 07:01:00','2026-10-26 07:01:00'),('bfdfe029-498b-4f3d-96f2-2ad2111c471b','Royal Crown Travels','Royal Crown Travels Secondary LLP','Royal Crown Travels Branch 2','120 OMR Road, Chennai, Tamil Nadu','33BBBCE5544F1Z1','BBBCE5544F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RC27117',NULL,'royal-crown-7088-2',NULL,'ACTIVE','BASIC','admin@royalcrown2.com','9840333444',NULL,0,'2026-10-26 10:58:57','2026-10-26 10:58:57'),('c0d2223e-ff29-4d73-a6c1-4eec5ed203ba','Alpha Trial Fleet',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'TRL0173',NULL,'alpha-trial-fleet-10',NULL,'TRIALING','BASIC','trial_1793012370173@example.com','9840777888',NULL,0,'2026-10-26 10:59:30','2026-10-26 10:59:30'),('c2b5a6d2-8565-4d83-a7b7-4b6135acfe2e','Alpha Trial Fleet',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'TRL6578',NULL,'alpha-trial-fleet-14',NULL,'TRIALING','BASIC','trial_1793012706578@example.com','9840777888',NULL,0,'2026-10-26 11:05:06','2026-10-26 11:05:06'),('c2d1018d-8675-48fb-8fa1-4956ddbd6244','Royal Crown Travels','Royal Crown Travels Secondary LLP','Royal Crown Travels Branch 2','120 OMR Road, Chennai, Tamil Nadu','33BBBCE5544F1Z1','BBBCE5544F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RC20934',NULL,'royal-crown-0907-2',NULL,'ACTIVE','BASIC','admin@royalcrown2.com','9840333444',NULL,0,'2026-10-26 11:13:40','2026-10-26 11:13:40'),('c6cdfc18-6b09-4fde-b9bf-abbbd54e7367','Direct Fleet 1793011635272','Direct Fleet Private Limited','Direct Fleet','100 Mount Road, Chennai','33AABCD5678F1Z9','AABCD5678F','996609',NULL,'direct_1793011635272@example.com','9840999888',NULL,NULL,NULL,NULL,NULL,'DIR5272',NULL,'direct-fleet-2',NULL,'ACTIVE','BASIC','direct_1793011635272@example.com','9840999888','{\"city\": null, \"gstin\": \"33AABCD5678F1Z9\", \"state\": null, \"logoUrl\": null, \"pinCode\": null, \"sacCode\": \"996609\", \"website\": null, \"gstNumber\": \"33AABCD5678F1Z9\", \"legalName\": \"Direct Fleet Private Limited\", \"panNumber\": \"AABCD5678F\", \"displayName\": \"Direct Fleet\", \"portalTitle\": \"Direct Fleet Mobility Portal\", \"primaryColor\": \"#C04E24\", \"businessEmail\": \"direct_1793011635272@example.com\", \"businessPhone\": \"9840999888\", \"billingFooterText\": null, \"registeredAddress\": \"100 Mount Road, Chennai\"}',0,'2026-10-26 10:47:15','2026-10-26 10:47:15'),('c880110a-6511-4f81-aaac-0e5a643f5e72','Royal Crown 1260','Royal Crown 1260 Pvt Ltd','Royal Crown 1260','55 Beach Road, Chennai, Tamil Nadu','33AAACR9988F1Z2','AAACR9988F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RCT1260',NULL,'royal-crown-1260',NULL,'ACTIVE','PRO','admin_1260@royalcrown.com','9840111222',NULL,0,'2026-10-26 11:07:11','2026-10-26 11:07:11'),('c8f8a5c1-23b9-4fc6-82c3-5860538116b3','Royal Crown 7088','Royal Crown 7088 Pvt Ltd','Royal Crown 7088','55 Beach Road, Chennai, Tamil Nadu','33AAACR9988F1Z2','AAACR9988F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RCT7088',NULL,'royal-crown-7088',NULL,'ACTIVE','PRO','admin_7088@royalcrown.com','9840111222',NULL,0,'2026-10-26 10:58:57','2026-10-26 10:58:57'),('cb49558d-d4e5-4020-99b5-5b72a14b2d2f','Royal Crown 8581','Royal Crown 8581 Pvt Ltd','Royal Crown 8581','55 Beach Road, Chennai, Tamil Nadu','33AAACR9988F1Z2','AAACR9988F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RCT8581',NULL,'royal-crown-8581',NULL,'ACTIVE','PRO','admin_8581@royalcrown.com','9840111222',NULL,0,'2026-10-26 10:55:18','2026-10-26 10:55:18'),('cfa950ac-ad3e-4869-a88d-db11c2df302b','Direct Fleet 1793011971856','Direct Fleet Private Limited','Direct Fleet','100 Mount Road, Chennai','33AABCD5678F1Z9','AABCD5678F','996609',NULL,'direct_1793011971856@example.com','9840999888',NULL,NULL,NULL,NULL,NULL,'DIR1856',NULL,'direct-fleet-8',NULL,'ACTIVE','BASIC','direct_1793011971856@example.com','9840999888','{\"city\": null, \"gstin\": \"33AABCD5678F1Z9\", \"state\": null, \"logoUrl\": null, \"pinCode\": null, \"sacCode\": \"996609\", \"website\": null, \"gstNumber\": \"33AABCD5678F1Z9\", \"legalName\": \"Direct Fleet Private Limited\", \"panNumber\": \"AABCD5678F\", \"displayName\": \"Direct Fleet\", \"portalTitle\": \"Direct Fleet Mobility Portal\", \"primaryColor\": \"#C04E24\", \"businessEmail\": \"direct_1793011971856@example.com\", \"businessPhone\": \"9840999888\", \"billingFooterText\": null, \"registeredAddress\": \"100 Mount Road, Chennai\"}',0,'2026-10-26 10:52:51','2026-10-26 10:52:51'),('d18b674a-919b-42de-a019-9d73f60c9340','Expired Fleet Logistics',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'EXP3052',NULL,'expired-fleet-logistics-2',NULL,'SUSPENDED','BASIC','expired_1793012473052@example.com','9840888999',NULL,0,'2026-10-26 11:01:13','2026-10-26 11:01:13'),('d36935f0-cabf-4458-b031-c662d48ebb28','Cosmic Cabs Logistics','Cosmic Cabs Logistics LLP','Cosmic Cabs Logistics','77 Cosmic Tower, Bangalore','29ABCDE1234F1Z8','ABCDE1234F','996601',NULL,'cosmic-1792998117247@example.com','9988776655',NULL,'Bangalore','Karnataka',NULL,NULL,'CSM251','csm251','cosmic-cabs-logistics-6',NULL,'ACTIVE','PRO','cosmic-1792998117247@example.com','9988776655','{\"city\": \"Bangalore\", \"gstin\": \"29ABCDE1234F1Z8\", \"state\": \"Karnataka\", \"logoUrl\": null, \"pinCode\": null, \"sacCode\": \"996601\", \"website\": null, \"gstNumber\": \"29ABCDE1234F1Z8\", \"legalName\": \"Cosmic Cabs Logistics LLP\", \"panNumber\": \"ABCDE1234F\", \"displayName\": \"Cosmic Cabs Logistics\", \"portalTitle\": \"Cosmic Cabs Logistics Fleet Portal\", \"primaryColor\": \"#0f1c3f\", \"businessEmail\": \"cosmic-1792998117247@example.com\", \"businessPhone\": \"9988776655\", \"secondaryColor\": \"#0d9488\", \"billingFooterText\": null, \"registeredAddress\": \"77 Cosmic Tower, Bangalore\"}',0,'2026-10-26 07:01:57','2026-10-26 07:01:57'),('d3740a34-464f-4e2e-b8c9-19605fe92861','Alpha Trial Fleet',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'TRL5272',NULL,'alpha-trial-fleet-11',NULL,'TRIALING','BASIC','trial_1793012425272@example.com','9840777888',NULL,0,'2026-10-26 11:00:25','2026-10-26 11:00:25'),('d79536bf-9fbc-4f30-8fb6-8418f8387b4d','Concurrency Test Fleet',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'CON6703',NULL,'concurrency-test-fleet-9',NULL,'TRIALING','BASIC','conc_1793012706703@example.com','9840666555',NULL,0,'2026-10-26 11:05:06','2026-10-26 11:05:06'),('d93c22fe-4a1c-46a6-a902-83abb963886d','Direct Fleet 1793079237524','Direct Fleet Private Limited','Direct Fleet','100 Mount Road, Chennai','33AABCD5678F1Z9','AABCD5678F','996609',NULL,'direct_1793079237524@example.com','9840999888',NULL,NULL,NULL,NULL,NULL,'DIR7524',NULL,'direct-fleet-25',NULL,'ACTIVE','BASIC','direct_1793079237524@example.com','9840999888','{\"city\": null, \"gstin\": \"33AABCD5678F1Z9\", \"state\": null, \"logoUrl\": null, \"pinCode\": null, \"sacCode\": \"996609\", \"website\": null, \"gstNumber\": \"33AABCD5678F1Z9\", \"legalName\": \"Direct Fleet Private Limited\", \"panNumber\": \"AABCD5678F\", \"displayName\": \"Direct Fleet\", \"portalTitle\": \"Direct Fleet Mobility Portal\", \"primaryColor\": \"#C04E24\", \"businessEmail\": \"direct_1793079237524@example.com\", \"businessPhone\": \"9840999888\", \"billingFooterText\": null, \"registeredAddress\": \"100 Mount Road, Chennai\"}',0,'2026-10-27 05:33:57','2026-10-27 05:33:57'),('d9f8f4eb-ff1c-4b26-a180-f90800bfd971','Direct Fleet 1793013178800','Direct Fleet Private Limited','Direct Fleet','100 Mount Road, Chennai','33AABCD5678F1Z9','AABCD5678F','996609',NULL,'direct_1793013178800@example.com','9840999888',NULL,NULL,NULL,NULL,NULL,'DIR8800',NULL,'direct-fleet-22',NULL,'ACTIVE','BASIC','direct_1793013178800@example.com','9840999888','{\"city\": null, \"gstin\": \"33AABCD5678F1Z9\", \"state\": null, \"logoUrl\": null, \"pinCode\": null, \"sacCode\": \"996609\", \"website\": null, \"gstNumber\": \"33AABCD5678F1Z9\", \"legalName\": \"Direct Fleet Private Limited\", \"panNumber\": \"AABCD5678F\", \"displayName\": \"Direct Fleet\", \"portalTitle\": \"Direct Fleet Mobility Portal\", \"primaryColor\": \"#C04E24\", \"businessEmail\": \"direct_1793013178800@example.com\", \"businessPhone\": \"9840999888\", \"billingFooterText\": null, \"registeredAddress\": \"100 Mount Road, Chennai\"}',0,'2026-10-26 11:12:58','2026-10-26 11:12:58'),('ddd9fa7e-9fe8-4d50-89bd-03dba0814210','Royal Crown 7427','Royal Crown 7427 Pvt Ltd','Royal Crown 7427','55 Beach Road, Chennai, Tamil Nadu','33AAACR9988F1Z2','AAACR9988F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RCT7427',NULL,'royal-crown-7427',NULL,'ACTIVE','PRO','admin_7427@royalcrown.com','9840111222',NULL,0,'2026-10-26 11:08:37','2026-10-26 11:08:37'),('de9d4370-779d-4bd9-8a8b-241168061f63','Direct Fleet 1793012706237','Direct Fleet Private Limited','Direct Fleet','100 Mount Road, Chennai','33AABCD5678F1Z9','AABCD5678F','996609',NULL,'direct_1793012706237@example.com','9840999888',NULL,NULL,NULL,NULL,NULL,'DIR6237',NULL,'direct-fleet-18',NULL,'ACTIVE','BASIC','direct_1793012706237@example.com','9840999888','{\"city\": null, \"gstin\": \"33AABCD5678F1Z9\", \"state\": null, \"logoUrl\": null, \"pinCode\": null, \"sacCode\": \"996609\", \"website\": null, \"gstNumber\": \"33AABCD5678F1Z9\", \"legalName\": \"Direct Fleet Private Limited\", \"panNumber\": \"AABCD5678F\", \"displayName\": \"Direct Fleet\", \"portalTitle\": \"Direct Fleet Mobility Portal\", \"primaryColor\": \"#C04E24\", \"businessEmail\": \"direct_1793012706237@example.com\", \"businessPhone\": \"9840999888\", \"billingFooterText\": null, \"registeredAddress\": \"100 Mount Road, Chennai\"}',0,'2026-10-26 11:05:06','2026-10-26 11:05:06'),('df68e4a7-a776-4b75-b265-908dd6cf572d','Alpha Trial Fleet',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'TRL4639',NULL,'alpha-trial-fleet-22',NULL,'ACTIVE','BASIC','trial_1793082384639@example.com','9840777888',NULL,0,'2026-10-27 06:26:24','2026-10-27 06:26:24'),('e3714a2e-f85a-4848-9cd2-1a5bfce0782a','Concurrency Test Fleet',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'CON7449',NULL,'concurrency-test-fleet-4',NULL,'TRIALING','BASIC','conc_1793012337449@example.com','9840666555',NULL,0,'2026-10-26 10:58:57','2026-10-26 10:58:57'),('e42d1209-e322-477c-b762-a09cc8976625','Expired Fleet Logistics',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'EXP4002',NULL,'expired-fleet-logistics-13',NULL,'SUSPENDED','BASIC','expired_1793089344002@example.com','9840888999',NULL,0,'2026-10-27 08:22:24','2026-10-27 08:22:24'),('e50a37d2-f716-467c-b6c5-ef9656060d3d','Direct Fleet 1793011582026','Direct Fleet Private Limited','Direct Fleet','100 Mount Road, Chennai','33AABCD5678F1Z9','AABCD5678F','996609',NULL,'direct_1793011582026@example.com','9840999888',NULL,NULL,NULL,NULL,NULL,'DIR2026',NULL,'direct-fleet',NULL,'ACTIVE','BASIC','direct_1793011582026@example.com','9840999888','{\"city\": null, \"gstin\": \"33AABCD5678F1Z9\", \"state\": null, \"logoUrl\": null, \"pinCode\": null, \"sacCode\": \"996609\", \"website\": null, \"gstNumber\": \"33AABCD5678F1Z9\", \"legalName\": \"Direct Fleet Private Limited\", \"panNumber\": \"AABCD5678F\", \"displayName\": \"Direct Fleet\", \"portalTitle\": \"Direct Fleet Mobility Portal\", \"primaryColor\": \"#C04E24\", \"businessEmail\": \"direct_1793011582026@example.com\", \"businessPhone\": \"9840999888\", \"billingFooterText\": null, \"registeredAddress\": \"100 Mount Road, Chennai\"}',0,'2026-10-26 10:46:22','2026-10-26 10:46:22'),('e7b8a1c0-0000-0000-0000-000000000001','Grace Cabs Fleet Operations',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'GC','gracecabs','grace-cabs',NULL,'ACTIVE','ENTERPRISE','admin@gracecabs.com',NULL,'{\"portalTitle\": \"Grace Cabs SaaS Platform\", \"primaryColor\": \"#275981\", \"secondaryColor\": \"#1d4260\"}',0,'2026-10-20 09:47:22','2026-10-20 09:47:22'),('ec9fb839-a5e6-4025-95d9-5b0ac17ab8df','Direct Fleet 1793012337034','Direct Fleet Private Limited','Direct Fleet','100 Mount Road, Chennai','33AABCD5678F1Z9','AABCD5678F','996609',NULL,'direct_1793012337034@example.com','9840999888',NULL,NULL,NULL,NULL,NULL,'DIR7034',NULL,'direct-fleet-13',NULL,'ACTIVE','BASIC','direct_1793012337034@example.com','9840999888','{\"city\": null, \"gstin\": \"33AABCD5678F1Z9\", \"state\": null, \"logoUrl\": null, \"pinCode\": null, \"sacCode\": \"996609\", \"website\": null, \"gstNumber\": \"33AABCD5678F1Z9\", \"legalName\": \"Direct Fleet Private Limited\", \"panNumber\": \"AABCD5678F\", \"displayName\": \"Direct Fleet\", \"portalTitle\": \"Direct Fleet Mobility Portal\", \"primaryColor\": \"#C04E24\", \"businessEmail\": \"direct_1793012337034@example.com\", \"businessPhone\": \"9840999888\", \"billingFooterText\": null, \"registeredAddress\": \"100 Mount Road, Chennai\"}',0,'2026-10-26 10:58:57','2026-10-26 10:58:57'),('ee497c22-bd54-46d9-aef0-2fee2092e4d6','Alpha Trial Fleet',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'TRL7189',NULL,'alpha-trial-fleet-3',NULL,'TRIALING','BASIC','trial_1793011937189@example.com','9840777888',NULL,0,'2026-10-26 10:52:17','2026-10-26 10:52:17'),('ef2d6246-e9b8-4fda-ac0c-41a544a1e47b','Royal Crown 1887','Royal Crown 1887 Pvt Ltd','Royal Crown 1887','55 Beach Road, Chennai, Tamil Nadu','33AAACR9988F1Z2','AAACR9988F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RCT1887',NULL,'royal-crown-1887',NULL,'ACTIVE','PRO','admin_1887@royalcrown.com','9840111222',NULL,0,'2026-10-26 10:52:51','2026-10-26 10:52:51'),('f5101119-65a7-4959-a682-d45938b161c2','Direct Fleet 1793089343420','Direct Fleet Private Limited','Direct Fleet','100 Mount Road, Chennai','33AABCD5678F1Z9','AABCD5678F','996609',NULL,'direct_1793089343420@example.com','9840999888',NULL,NULL,NULL,NULL,NULL,'DIR3420',NULL,'direct-fleet-27',NULL,'ACTIVE','BASIC','direct_1793089343420@example.com','9840999888','{\"city\": null, \"gstin\": \"33AABCD5678F1Z9\", \"state\": null, \"logoUrl\": null, \"pinCode\": null, \"sacCode\": \"996609\", \"website\": null, \"gstNumber\": \"33AABCD5678F1Z9\", \"legalName\": \"Direct Fleet Private Limited\", \"panNumber\": \"AABCD5678F\", \"displayName\": \"Direct Fleet\", \"portalTitle\": \"Direct Fleet Mobility Portal\", \"primaryColor\": \"#C04E24\", \"businessEmail\": \"direct_1793089343420@example.com\", \"businessPhone\": \"9840999888\", \"billingFooterText\": null, \"registeredAddress\": \"100 Mount Road, Chennai\"}',0,'2026-10-27 08:22:23','2026-10-27 08:22:23'),('f65a2bf0-b37c-4fb2-a023-7e33a185ee9c','Royal Crown Travels','Royal Crown Travels Secondary LLP','Royal Crown Travels Branch 2','120 OMR Road, Chennai, Tamil Nadu','33BBBCE5544F1Z1','BBBCE5544F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RC28903',NULL,'royal-crown-8879-2',NULL,'ACTIVE','BASIC','admin@royalcrown2.com','9840333444',NULL,0,'2026-10-26 11:12:58','2026-10-26 11:12:58'),('f6c8c79c-7a77-4473-9cf6-9106b7df2ee7','Concurrency Test Fleet',NULL,NULL,NULL,NULL,NULL,'996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'CON5265',NULL,'concurrency-test-fleet-15',NULL,'TRIALING','BASIC','conc_1793077355265@example.com','9840666555',NULL,0,'2026-10-27 05:02:35','2026-10-27 05:02:35'),('f76680e7-acf7-4214-a39c-4d4c070f65b1','Direct Fleet 1793012788215','Direct Fleet Private Limited','Direct Fleet','100 Mount Road, Chennai','33AABCD5678F1Z9','AABCD5678F','996609',NULL,'direct_1793012788215@example.com','9840999888',NULL,NULL,NULL,NULL,NULL,'DIR8215',NULL,'direct-fleet-19',NULL,'ACTIVE','BASIC','direct_1793012788215@example.com','9840999888','{\"city\": null, \"gstin\": \"33AABCD5678F1Z9\", \"state\": null, \"logoUrl\": null, \"pinCode\": null, \"sacCode\": \"996609\", \"website\": null, \"gstNumber\": \"33AABCD5678F1Z9\", \"legalName\": \"Direct Fleet Private Limited\", \"panNumber\": \"AABCD5678F\", \"displayName\": \"Direct Fleet\", \"portalTitle\": \"Direct Fleet Mobility Portal\", \"primaryColor\": \"#C04E24\", \"businessEmail\": \"direct_1793012788215@example.com\", \"businessPhone\": \"9840999888\", \"billingFooterText\": null, \"registeredAddress\": \"100 Mount Road, Chennai\"}',0,'2026-10-26 11:06:28','2026-10-26 11:06:28'),('f9243fc5-fa39-418d-b4f7-416965eb34b9','Direct Fleet 1793011690084','Direct Fleet Private Limited','Direct Fleet','100 Mount Road, Chennai','33AABCD5678F1Z9','AABCD5678F','996609',NULL,'direct_1793011690084@example.com','9840999888',NULL,NULL,NULL,NULL,NULL,'DIR0084',NULL,'direct-fleet-3',NULL,'ACTIVE','BASIC','direct_1793011690084@example.com','9840999888','{\"city\": null, \"gstin\": \"33AABCD5678F1Z9\", \"state\": null, \"logoUrl\": null, \"pinCode\": null, \"sacCode\": \"996609\", \"website\": null, \"gstNumber\": \"33AABCD5678F1Z9\", \"legalName\": \"Direct Fleet Private Limited\", \"panNumber\": \"AABCD5678F\", \"displayName\": \"Direct Fleet\", \"portalTitle\": \"Direct Fleet Mobility Portal\", \"primaryColor\": \"#C04E24\", \"businessEmail\": \"direct_1793011690084@example.com\", \"businessPhone\": \"9840999888\", \"billingFooterText\": null, \"registeredAddress\": \"100 Mount Road, Chennai\"}',0,'2026-10-26 10:48:10','2026-10-26 10:48:10'),('fa111111-1111-1111-1111-111111111111','Apex Fleet Alpha','Apex Fleet Alpha Logistics Private Limited',NULL,'404 Logistics Hub, Bangalore','29ABCDE1234F1Z5','ABCDE1234F','996601',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'APEXA',NULL,'apex-fleet-alpha',NULL,'ACTIVE','PRO','dispatch@apexalpha.in','9876543210',NULL,0,'2026-10-26 06:49:03','2026-10-26 07:06:05'),('fb222222-2222-2222-2222-222222222222','Beacon Fleet Beta','Beacon Fleet Beta Cabs Ltd',NULL,'202 Tech Park, Bangalore','29BCDEF2345G1Z6','BCDEF2345G','996601',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'BEACB',NULL,'beacon-fleet-beta',NULL,'ACTIVE','BASIC','contact@beaconbeta.in','9876543211',NULL,0,'2026-10-26 06:49:03','2026-10-26 06:49:03'),('fdb07a63-3e5d-4200-85f4-de4301459af2','Direct Fleet 1793082384274','Direct Fleet Private Limited','Direct Fleet','100 Mount Road, Chennai','33AABCD5678F1Z9','AABCD5678F','996609',NULL,'direct_1793082384274@example.com','9840999888',NULL,NULL,NULL,NULL,NULL,'DIR4274',NULL,'direct-fleet-26',NULL,'ACTIVE','BASIC','direct_1793082384274@example.com','9840999888','{\"city\": null, \"gstin\": \"33AABCD5678F1Z9\", \"state\": null, \"logoUrl\": null, \"pinCode\": null, \"sacCode\": \"996609\", \"website\": null, \"gstNumber\": \"33AABCD5678F1Z9\", \"legalName\": \"Direct Fleet Private Limited\", \"panNumber\": \"AABCD5678F\", \"displayName\": \"Direct Fleet\", \"portalTitle\": \"Direct Fleet Mobility Portal\", \"primaryColor\": \"#C04E24\", \"businessEmail\": \"direct_1793082384274@example.com\", \"businessPhone\": \"9840999888\", \"billingFooterText\": null, \"registeredAddress\": \"100 Mount Road, Chennai\"}',0,'2026-10-27 06:26:24','2026-10-27 06:26:24'),('fdb11eb4-bf8e-41e9-8c60-88083f7762ad','Royal Crown Travels','Royal Crown Travels Secondary LLP','Royal Crown Travels Branch 2','120 OMR Road, Chennai, Tamil Nadu','33BBBCE5544F1Z1','BBBCE5544F','996609',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RC25036',NULL,'royal-crown-5010-2',NULL,'ACTIVE','BASIC','admin@royalcrown2.com','9840333444',NULL,0,'2026-10-26 11:00:25','2026-10-26 11:00:25'),('tenant-test-alpha','Alpha Mobility Services','Alpha Mobility Services Pvt Ltd','Alpha Cabs','Suite 101, Alpha Towers, Anna Salai, Chennai, TN - 600002','33AAACA1111A1Z1','AAACA1111A','996609','https://alphamobility.co.in','billing@alphamobility.co.in','9876500001','Alpha Mobility Services: 24x7 Enterprise Logistics. Disputes subject to Chennai jurisdiction.','Chennai','Tamil Nadu','600002','data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"160\" height=\"40\"><rect width=\"160\" height=\"40\" fill=\"%230052cc\"/><text x=\"10\" y=\"25\" fill=\"white\" font-weight=\"bold\">ALPHA FLEET</text></svg>','ALPH','alpha','alpha-cabs',NULL,'ACTIVE','PRO','admin@alphamobility.co.in','9876500001',NULL,0,'2026-10-24 10:58:32','2026-10-24 10:58:32'),('tenant-test-beta','Beta Rapid Logistics','Beta Rapid Logistics LLP','Beta Express','Level 4, Beta Tech Hub, Outer Ring Road, Bengaluru, KA - 560103','29BBBCB2222B1Z2','BBBCB2222B','996609','https://betarapid.in','accounts@betarapid.in','9876500002','Beta Rapid Logistics: Fast & Reliable Corporate Dispatch. Disputes subject to Bengaluru jurisdiction.','Bengaluru','Karnataka','560103','data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"160\" height=\"40\"><rect width=\"160\" height=\"40\" fill=\"%23107c41\"/><text x=\"10\" y=\"25\" fill=\"white\" font-weight=\"bold\">BETA FLEET</text></svg>','BETA','beta','beta-express',NULL,'ACTIVE','PRO','admin@betarapid.in','9876500002',NULL,0,'2026-10-24 10:58:32','2026-10-24 10:58:32');
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
/*!40000 ALTER TABLE `vendor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'demodb'
--

--
-- Dumping routines for database 'demodb'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-11 12:03:34
