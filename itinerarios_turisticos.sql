-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 10-11-2025 a las 07:39:18
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `itinerarios_turisticos`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_machu_itinerario`
--

CREATE TABLE `detalle_machu_itinerario` (
  `id_itinerario_programa` int(11) NOT NULL,
  `empresa_tren` varchar(100) DEFAULT NULL,
  `horario_tren_ida` time DEFAULT NULL,
  `horario_tren_retor` time DEFAULT NULL,
  `nombre_guia` varchar(100) DEFAULT NULL,
  `ruta` varchar(10) DEFAULT NULL,
  `tiempo_visita` varchar(50) DEFAULT NULL,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_transporte_itinerario`
--

CREATE TABLE `detalle_transporte_itinerario` (
  `id_detalle_transporte` int(11) NOT NULL,
  `id_itinerario_programa` int(11) NOT NULL,
  `id_transporte` int(11) NOT NULL,
  `horario_recojo` time DEFAULT NULL,
  `lugar_recojo` varchar(150) DEFAULT NULL,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estados_presupuesto`
--

CREATE TABLE `estados_presupuesto` (
  `id_estado` int(11) NOT NULL,
  `nombre_estado` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `grupos`
--

CREATE TABLE `grupos` (
  `id_grupo` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `itinerarios`
--

CREATE TABLE `itinerarios` (
  `id_itinerario` int(11) NOT NULL,
  `id_grupo` int(11) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `estado_presupuesto_id` int(11) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `itinerario_cambios`
--

CREATE TABLE `itinerario_cambios` (
  `id_cambio` int(11) NOT NULL,
  `id_itinerario` int(11) NOT NULL,
  `tipo_cambio` enum('itinerario','programa','transporte','machu','turista') NOT NULL,
  `referencia_id` int(11) DEFAULT NULL,
  `detalle` varchar(255) NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`payload`)),
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `itinerario_programas`
--

CREATE TABLE `itinerario_programas` (
  `id_itinerario_programa` int(11) NOT NULL,
  `id_itinerario` int(11) NOT NULL,
  `id_programa` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `hora_inicio` time DEFAULT NULL,
  `hora_fin` time DEFAULT NULL,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `itinerario_turistas`
--

CREATE TABLE `itinerario_turistas` (
  `id_itinerario` int(11) NOT NULL,
  `id_turista` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notificaciones_estado`
--

CREATE TABLE `notificaciones_estado` (
  `id_usuario` int(11) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `itinerario_id` int(11) NOT NULL,
  `referencia_id` int(11) NOT NULL,
  `estado` enum('leida','descartada') NOT NULL,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programas`
--

CREATE TABLE `programas` (
  `id_programa` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `tipo` enum('tour','actividad','machupicchu') NOT NULL,
  `duracion` int(11) DEFAULT NULL,
  `costo` decimal(10,2) NOT NULL,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `transportes`
--

CREATE TABLE `transportes` (
  `id_transporte` int(11) NOT NULL,
  `empresa` varchar(150) NOT NULL,
  `tipo` enum('bus','auto','minivan','avion','tren') NOT NULL,
  `capacidad` int(11) DEFAULT NULL,
  `contacto` varchar(150) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `turistas`
--

CREATE TABLE `turistas` (
  `id_turista` int(11) NOT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `dni` varchar(20) DEFAULT NULL,
  `pasaporte` varchar(20) DEFAULT NULL,
  `nacionalidad` varchar(100) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `genero` enum('M','F','Otro') DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL,
  `nombre_usuario` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('admin','agente','cliente') DEFAULT 'cliente',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `detalle_machu_itinerario`
--
ALTER TABLE `detalle_machu_itinerario`
  ADD PRIMARY KEY (`id_itinerario_programa`);

--
-- Indices de la tabla `detalle_transporte_itinerario`
--
ALTER TABLE `detalle_transporte_itinerario`
  ADD PRIMARY KEY (`id_detalle_transporte`),
  ADD KEY `id_itinerario_programa` (`id_itinerario_programa`),
  ADD KEY `id_transporte` (`id_transporte`);

--
-- Indices de la tabla `estados_presupuesto`
--
ALTER TABLE `estados_presupuesto`
  ADD PRIMARY KEY (`id_estado`),
  ADD UNIQUE KEY `nombre_estado` (`nombre_estado`);

--
-- Indices de la tabla `grupos`
--
ALTER TABLE `grupos`
  ADD PRIMARY KEY (`id_grupo`);

--
-- Indices de la tabla `itinerarios`
--
ALTER TABLE `itinerarios`
  ADD PRIMARY KEY (`id_itinerario`),
  ADD KEY `id_grupo` (`id_grupo`),
  ADD KEY `estado_presupuesto_id` (`estado_presupuesto_id`);

--
-- Indices de la tabla `itinerario_cambios`
--
ALTER TABLE `itinerario_cambios`
  ADD PRIMARY KEY (`id_cambio`),
  ADD KEY `id_itinerario` (`id_itinerario`),
  ADD KEY `tipo_cambio` (`tipo_cambio`),
  ADD KEY `created_at` (`created_at`);

--
-- Indices de la tabla `itinerario_programas`
--
ALTER TABLE `itinerario_programas`
  ADD PRIMARY KEY (`id_itinerario_programa`),
  ADD KEY `id_itinerario` (`id_itinerario`),
  ADD KEY `id_programa` (`id_programa`);

--
-- Indices de la tabla `itinerario_turistas`
--
ALTER TABLE `itinerario_turistas`
  ADD PRIMARY KEY (`id_itinerario`,`id_turista`),
  ADD KEY `id_turista` (`id_turista`);

--
-- Indices de la tabla `notificaciones_estado`
--
ALTER TABLE `notificaciones_estado`
  ADD PRIMARY KEY (`id_usuario`,`tipo`,`itinerario_id`,`referencia_id`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `itinerario_id` (`itinerario_id`),
  ADD KEY `tipo` (`tipo`);

--
-- Indices de la tabla `programas`
--
ALTER TABLE `programas`
  ADD PRIMARY KEY (`id_programa`);

--
-- Indices de la tabla `transportes`
--
ALTER TABLE `transportes`
  ADD PRIMARY KEY (`id_transporte`);

--
-- Indices de la tabla `turistas`
--
ALTER TABLE `turistas`
  ADD PRIMARY KEY (`id_turista`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `detalle_transporte_itinerario`
--
ALTER TABLE `detalle_transporte_itinerario`
  MODIFY `id_detalle_transporte` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `estados_presupuesto`
--
ALTER TABLE `estados_presupuesto`
  MODIFY `id_estado` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `grupos`
--
ALTER TABLE `grupos`
  MODIFY `id_grupo` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `itinerarios`
--
ALTER TABLE `itinerarios`
  MODIFY `id_itinerario` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `itinerario_cambios`
--
ALTER TABLE `itinerario_cambios`
  MODIFY `id_cambio` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `itinerario_programas`
--
ALTER TABLE `itinerario_programas`
  MODIFY `id_itinerario_programa` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `programas`
--
ALTER TABLE `programas`
  MODIFY `id_programa` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `transportes`
--
ALTER TABLE `transportes`
  MODIFY `id_transporte` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `turistas`
--
ALTER TABLE `turistas`
  MODIFY `id_turista` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `detalle_machu_itinerario`
--
ALTER TABLE `detalle_machu_itinerario`
  ADD CONSTRAINT `detalle_machu_itinerario_ibfk_1` FOREIGN KEY (`id_itinerario_programa`) REFERENCES `itinerario_programas` (`id_itinerario_programa`);

--
-- Filtros para la tabla `detalle_transporte_itinerario`
--
ALTER TABLE `detalle_transporte_itinerario`
  ADD CONSTRAINT `detalle_transporte_itinerario_ibfk_1` FOREIGN KEY (`id_itinerario_programa`) REFERENCES `itinerario_programas` (`id_itinerario_programa`),
  ADD CONSTRAINT `detalle_transporte_itinerario_ibfk_2` FOREIGN KEY (`id_transporte`) REFERENCES `transportes` (`id_transporte`);

--
-- Filtros para la tabla `itinerarios`
--
ALTER TABLE `itinerarios`
  ADD CONSTRAINT `itinerarios_ibfk_1` FOREIGN KEY (`id_grupo`) REFERENCES `grupos` (`id_grupo`),
  ADD CONSTRAINT `itinerarios_ibfk_2` FOREIGN KEY (`estado_presupuesto_id`) REFERENCES `estados_presupuesto` (`id_estado`);

--
-- Filtros para la tabla `itinerario_programas`
--
ALTER TABLE `itinerario_programas`
  ADD CONSTRAINT `itinerario_programas_ibfk_1` FOREIGN KEY (`id_itinerario`) REFERENCES `itinerarios` (`id_itinerario`),
  ADD CONSTRAINT `itinerario_programas_ibfk_2` FOREIGN KEY (`id_programa`) REFERENCES `programas` (`id_programa`);

--
-- Filtros para la tabla `itinerario_turistas`
--
ALTER TABLE `itinerario_turistas`
  ADD CONSTRAINT `itinerario_turistas_ibfk_1` FOREIGN KEY (`id_itinerario`) REFERENCES `itinerarios` (`id_itinerario`),
  ADD CONSTRAINT `itinerario_turistas_ibfk_2` FOREIGN KEY (`id_turista`) REFERENCES `turistas` (`id_turista`);

--
-- Filtros para la tabla `turistas`
--
ALTER TABLE `turistas`
  ADD CONSTRAINT `turistas_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
