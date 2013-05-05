-- phpMyAdmin SQL Dump
-- version 3.5.2.2
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: May 05, 2013 at 08:45 AM
-- Server version: 5.5.27
-- PHP Version: 5.4.7

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `easy_food`
--

-- --------------------------------------------------------

--
-- Table structure for table `cliente`
--

CREATE TABLE IF NOT EXISTS `cliente` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mesa_numero` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_Cliente_Mesa1_idx` (`mesa_numero`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `empleado`
--

CREATE TABLE IF NOT EXISTS `empleado` (
  `curp` varchar(16) NOT NULL,
  `usuario` varchar(30) NOT NULL,
  `tipo` smallint(6) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `nombre` varchar(140) NOT NULL,
  `password` varchar(128) NOT NULL,
  PRIMARY KEY (`curp`),
  UNIQUE KEY `Curp_UNIQUE` (`curp`),
  UNIQUE KEY `Usuario_UNIQUE` (`usuario`),
  UNIQUE KEY `nombre_UNIQUE` (`nombre`),
  UNIQUE KEY `Correo_UNIQUE` (`correo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `empleado`
--

INSERT INTO `empleado` (`curp`, `usuario`, `tipo`, `correo`, `nombre`, `password`) VALUES
('DIHH931005MX', 'henocdz', 0, 'hdz@rfdz.mx', 'Henoc Dz', '4c9f2b24b98bbe69cdeb1ba1d76194cd');

-- --------------------------------------------------------

--
-- Table structure for table `mesa`
--

CREATE TABLE IF NOT EXISTS `mesa` (
  `numero` int(11) NOT NULL,
  `capacidad` smallint(6) NOT NULL DEFAULT '0',
  `estado` tinyint(1) NOT NULL,
  PRIMARY KEY (`numero`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `mesa`
--

INSERT INTO `mesa` (`numero`, `capacidad`, `estado`) VALUES
(1, 5, 0),
(2, 5, 0),
(3, 5, 0),
(4, 5, 0),
(5, 2, 0),
(6, 0, 0),
(7, 0, 0),
(10, 5, 0),
(13, 0, 0),
(20, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `orden`
--

CREATE TABLE IF NOT EXISTS `orden` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` datetime NOT NULL,
  `cliente_id` int(11) NOT NULL,
  `platillo_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_Orden_Cliente1_idx` (`cliente_id`),
  KEY `fk_Orden_platillo1_idx` (`platillo_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `pago`
--

CREATE TABLE IF NOT EXISTS `pago` (
  `orden_id` int(11) NOT NULL,
  `monto` varchar(45) NOT NULL,
  `fecha` datetime NOT NULL,
  `empleado_curp` varchar(16) NOT NULL,
  PRIMARY KEY (`orden_id`),
  KEY `fk_Pago_Empleado_idx` (`empleado_curp`),
  KEY `fk_Pago_Orden1_idx` (`orden_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `platillo`
--

CREATE TABLE IF NOT EXISTS `platillo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tipo` smallint(6) NOT NULL,
  `nombre` varchar(45) NOT NULL,
  `descripcion` varchar(140) NOT NULL,
  `imagen` varchar(200) NOT NULL,
  `precio` double NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=2 ;

--
-- Dumping data for table `platillo`
--

INSERT INTO `platillo` (`id`, `tipo`, `nombre`, `descripcion`, `imagen`, `precio`) VALUES
(1, 0, 'Chilaquiles Verdes', 'Deliciosos chilaquiles cubiertos con queso', '', 68.9);

-- --------------------------------------------------------

--
-- Table structure for table `platillo_producto`
--

CREATE TABLE IF NOT EXISTS `platillo_producto` (
  `platillo_num` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  PRIMARY KEY (`platillo_num`,`producto_id`),
  KEY `fk_platillo_has_Prodcutos_Prodcutos1_idx` (`producto_id`),
  KEY `fk_platillo_has_Prodcutos_platillo1_idx` (`platillo_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `productos`
--

CREATE TABLE IF NOT EXISTS `productos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `producto_proveedor`
--

CREATE TABLE IF NOT EXISTS `producto_proveedor` (
  `producto_id` int(11) NOT NULL,
  `proveedor_id` int(11) NOT NULL,
  `cantidad` double NOT NULL,
  `fecha` datetime NOT NULL,
  PRIMARY KEY (`producto_id`,`proveedor_id`),
  KEY `fk_Prodcutos_has_Proveedores_Proveedores1_idx` (`proveedor_id`),
  KEY `fk_Prodcutos_has_Proveedores_Prodcutos1_idx` (`producto_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `proveedor`
--

CREATE TABLE IF NOT EXISTS `proveedor` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) NOT NULL,
  `empresa` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cliente`
--
ALTER TABLE `cliente`
  ADD CONSTRAINT `fk_Cliente_Mesa1` FOREIGN KEY (`mesa_numero`) REFERENCES `mesa` (`numero`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `orden`
--
ALTER TABLE `orden`
  ADD CONSTRAINT `fk_Orden_Cliente1` FOREIGN KEY (`cliente_id`) REFERENCES `cliente` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_Orden_platillo1` FOREIGN KEY (`platillo_id`) REFERENCES `platillo` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `pago`
--
ALTER TABLE `pago`
  ADD CONSTRAINT `fk_Pago_Empleado` FOREIGN KEY (`empleado_curp`) REFERENCES `empleado` (`curp`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_Pago_Orden1` FOREIGN KEY (`orden_id`) REFERENCES `orden` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `platillo_producto`
--
ALTER TABLE `platillo_producto`
  ADD CONSTRAINT `fk_platillo_has_Prodcutos_platillo1` FOREIGN KEY (`platillo_num`) REFERENCES `platillo` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_platillo_has_Prodcutos_Prodcutos1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `producto_proveedor`
--
ALTER TABLE `producto_proveedor`
  ADD CONSTRAINT `fk_Prodcutos_has_Proveedores_Prodcutos1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_Prodcutos_has_Proveedores_Proveedores1` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedor` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
