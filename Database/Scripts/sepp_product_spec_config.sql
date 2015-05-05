-- phpMyAdmin SQL Dump
-- version 4.1.14
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Mar 17, 2015 at 06:20 PM
-- Server version: 5.6.17
-- PHP Version: 5.5.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `sepp2015`
--

-- --------------------------------------------------------

--
-- Table structure for table `sepp_product_spec_config`
--

CREATE TABLE IF NOT EXISTS `sepp_product_spec_config` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `common_specvalue` varchar(100) NOT NULL,
  `specvalue` varchar(500) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=4 ;

--
-- Dumping data for table `sepp_product_spec_config`
--

INSERT INTO `sepp_product_spec_config` (`id`, `common_specvalue`, `specvalue`) VALUES
(1, 'win7', 'windows_7_home_basic'),
(2, 'win7', 'windows_7_professional'),
(3, 'win7', 'windows_7_home_premium');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
