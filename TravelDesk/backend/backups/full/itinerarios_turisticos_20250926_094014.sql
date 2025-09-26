-- MySQL dump 10.13  Distrib 9.2.0, for Win64 (x86_64)
--
-- Host: localhost    Database: itinerarios_turisticos
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

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
-- Current Database: `itinerarios_turisticos`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `itinerarios_turisticos` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;

USE `itinerarios_turisticos`;

--
-- Table structure for table `detalle_machu_itinerario`
--

DROP TABLE IF EXISTS `detalle_machu_itinerario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_machu_itinerario` (
  `id_itinerario_programa` int(11) NOT NULL,
  `empresa_tren` varchar(100) DEFAULT NULL,
  `horario_tren_ida` time DEFAULT NULL,
  `horario_tren_retor` time DEFAULT NULL,
  `nombre_guia` varchar(100) DEFAULT NULL,
  `ruta` varchar(10) DEFAULT NULL,
  `tiempo_visita` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_itinerario_programa`),
  CONSTRAINT `detalle_machu_itinerario_ibfk_1` FOREIGN KEY (`id_itinerario_programa`) REFERENCES `itinerario_programas` (`id_itinerario_programa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_machu_itinerario`
--

LOCK TABLES `detalle_machu_itinerario` WRITE;
/*!40000 ALTER TABLE `detalle_machu_itinerario` DISABLE KEYS */;
/*!40000 ALTER TABLE `detalle_machu_itinerario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_transporte_itinerario`
--

DROP TABLE IF EXISTS `detalle_transporte_itinerario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_transporte_itinerario` (
  `id_detalle_transporte` int(11) NOT NULL AUTO_INCREMENT,
  `id_itinerario_programa` int(11) NOT NULL,
  `id_transporte` int(11) NOT NULL,
  `horario_recojo` time DEFAULT NULL,
  `lugar_recojo` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`id_detalle_transporte`),
  KEY `id_itinerario_programa` (`id_itinerario_programa`),
  KEY `id_transporte` (`id_transporte`),
  CONSTRAINT `detalle_transporte_itinerario_ibfk_1` FOREIGN KEY (`id_itinerario_programa`) REFERENCES `itinerario_programas` (`id_itinerario_programa`),
  CONSTRAINT `detalle_transporte_itinerario_ibfk_2` FOREIGN KEY (`id_transporte`) REFERENCES `transportes` (`id_transporte`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_transporte_itinerario`
--

LOCK TABLES `detalle_transporte_itinerario` WRITE;
/*!40000 ALTER TABLE `detalle_transporte_itinerario` DISABLE KEYS */;
/*!40000 ALTER TABLE `detalle_transporte_itinerario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estados_presupuesto`
--

DROP TABLE IF EXISTS `estados_presupuesto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estados_presupuesto` (
  `id_estado` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_estado` varchar(50) NOT NULL,
  PRIMARY KEY (`id_estado`),
  UNIQUE KEY `nombre_estado` (`nombre_estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estados_presupuesto`
--

LOCK TABLES `estados_presupuesto` WRITE;
/*!40000 ALTER TABLE `estados_presupuesto` DISABLE KEYS */;
/*!40000 ALTER TABLE `estados_presupuesto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grupos`
--

DROP TABLE IF EXISTS `grupos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grupos` (
  `id_grupo` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  PRIMARY KEY (`id_grupo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grupos`
--

LOCK TABLES `grupos` WRITE;
/*!40000 ALTER TABLE `grupos` DISABLE KEYS */;
/*!40000 ALTER TABLE `grupos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `itinerario_programas`
--

DROP TABLE IF EXISTS `itinerario_programas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `itinerario_programas` (
  `id_itinerario_programa` int(11) NOT NULL AUTO_INCREMENT,
  `id_itinerario` int(11) NOT NULL,
  `id_programa` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `hora_inicio` time DEFAULT NULL,
  `hora_fin` time DEFAULT NULL,
  PRIMARY KEY (`id_itinerario_programa`),
  KEY `id_itinerario` (`id_itinerario`),
  KEY `id_programa` (`id_programa`),
  CONSTRAINT `itinerario_programas_ibfk_1` FOREIGN KEY (`id_itinerario`) REFERENCES `itinerarios` (`id_itinerario`),
  CONSTRAINT `itinerario_programas_ibfk_2` FOREIGN KEY (`id_programa`) REFERENCES `programas` (`id_programa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `itinerario_programas`
--

LOCK TABLES `itinerario_programas` WRITE;
/*!40000 ALTER TABLE `itinerario_programas` DISABLE KEYS */;
/*!40000 ALTER TABLE `itinerario_programas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `itinerario_turistas`
--

DROP TABLE IF EXISTS `itinerario_turistas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `itinerario_turistas` (
  `id_itinerario` int(11) NOT NULL,
  `id_turista` int(11) NOT NULL,
  PRIMARY KEY (`id_itinerario`,`id_turista`),
  KEY `id_turista` (`id_turista`),
  CONSTRAINT `itinerario_turistas_ibfk_1` FOREIGN KEY (`id_itinerario`) REFERENCES `itinerarios` (`id_itinerario`),
  CONSTRAINT `itinerario_turistas_ibfk_2` FOREIGN KEY (`id_turista`) REFERENCES `turistas` (`id_turista`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `itinerario_turistas`
--

LOCK TABLES `itinerario_turistas` WRITE;
/*!40000 ALTER TABLE `itinerario_turistas` DISABLE KEYS */;
/*!40000 ALTER TABLE `itinerario_turistas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `itinerarios`
--

DROP TABLE IF EXISTS `itinerarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `itinerarios` (
  `id_itinerario` int(11) NOT NULL AUTO_INCREMENT,
  `id_grupo` int(11) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `estado_presupuesto_id` int(11) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_itinerario`),
  KEY `id_grupo` (`id_grupo`),
  KEY `estado_presupuesto_id` (`estado_presupuesto_id`),
  CONSTRAINT `itinerarios_ibfk_1` FOREIGN KEY (`id_grupo`) REFERENCES `grupos` (`id_grupo`),
  CONSTRAINT `itinerarios_ibfk_2` FOREIGN KEY (`estado_presupuesto_id`) REFERENCES `estados_presupuesto` (`id_estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `itinerarios`
--

LOCK TABLES `itinerarios` WRITE;
/*!40000 ALTER TABLE `itinerarios` DISABLE KEYS */;
/*!40000 ALTER TABLE `itinerarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `programas`
--

DROP TABLE IF EXISTS `programas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `programas` (
  `id_programa` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `tipo` enum('tour','actividad','machupicchu') NOT NULL,
  `duracion` int(11) DEFAULT NULL,
  `costo` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_programa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `programas`
--

LOCK TABLES `programas` WRITE;
/*!40000 ALTER TABLE `programas` DISABLE KEYS */;
/*!40000 ALTER TABLE `programas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transportes`
--

DROP TABLE IF EXISTS `transportes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transportes` (
  `id_transporte` int(11) NOT NULL AUTO_INCREMENT,
  `empresa` varchar(150) NOT NULL,
  `tipo` enum('bus','auto','minivan','avion','tren') NOT NULL,
  `capacidad` int(11) DEFAULT NULL,
  `contacto` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`id_transporte`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transportes`
--

LOCK TABLES `transportes` WRITE;
/*!40000 ALTER TABLE `transportes` DISABLE KEYS */;
/*!40000 ALTER TABLE `transportes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `turistas`
--

DROP TABLE IF EXISTS `turistas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `turistas` (
  `id_turista` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) DEFAULT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `dni` varchar(20) DEFAULT NULL,
  `pasaporte` varchar(20) DEFAULT NULL,
  `nacionalidad` varchar(100) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `genero` enum('M','F','Otro') DEFAULT NULL,
  PRIMARY KEY (`id_turista`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `turistas_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `turistas`
--

LOCK TABLES `turistas` WRITE;
/*!40000 ALTER TABLE `turistas` DISABLE KEYS */;
/*!40000 ALTER TABLE `turistas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_usuario` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('admin','agente','cliente') DEFAULT 'cliente',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-26  9:40:15
