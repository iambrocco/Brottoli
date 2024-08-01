-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 01, 2024 at 02:33 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `brottoli`
--
CREATE DATABASE IF NOT EXISTS `brottoli` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `brottoli`;

-- --------------------------------------------------------

--
-- Table structure for table `guilds`
--

CREATE TABLE `guilds` (
  `guildId` text NOT NULL,
  `joinLeaveEnabled` tinyint(1) NOT NULL,
  `customConfig` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;



-- --------------------------------------------------------

--
-- Table structure for table `join_leave`
--

CREATE TABLE `join_leave` (
  `joinChannelId` mediumtext NOT NULL,
  `leaveChannelId` mediumtext NOT NULL,
  `guildId` mediumtext NOT NULL,
  `joinMessage` longtext NOT NULL,
  `leaveMessage` longtext NOT NULL,
  `enabled` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `meetchat`
--

CREATE TABLE `meetchat` (
  `connectionState` text NOT NULL,
  `channelOneId` text NOT NULL,
  `channelTwoId` text NOT NULL,
  `channelOneGuildId` longtext NOT NULL,
  `channelTwoGuildId` longtext NOT NULL,
  `connectedOn` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reaction_roles`
--

CREATE TABLE `reaction_roles` (
  `roleId` longtext NOT NULL,
  `channelId` longtext NOT NULL,
  `emoji` text NOT NULL,
  `messageId` longtext NOT NULL,
  `guildId` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `warns`
--

CREATE TABLE `warns` (
  `userId` bigint(20) NOT NULL,
  `guildId` bigint(20) NOT NULL,
  `warnCount` int(11) NOT NULL,
  `reason` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `guilds`
--
ALTER TABLE `guilds`
  ADD UNIQUE KEY `guildId` (`guildId`) USING HASH;

--
-- Indexes for table `join_leave`
--
ALTER TABLE `join_leave`
  ADD PRIMARY KEY (`enabled`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
