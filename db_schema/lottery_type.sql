-- phpMyAdmin SQL Dump
-- version 4.7.4
-- https://www.phpmyadmin.net/
--
-- 主機: 127.0.0.1
-- 產生時間： 2018-01-04 07:14:50
-- 伺服器版本: 10.1.28-MariaDB
-- PHP 版本： 7.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 資料庫： `lottery`
--

-- --------------------------------------------------------

--
-- 資料表結構 `lottery_type`
--

CREATE TABLE `lottery_type` (
  `id` int(11) NOT NULL COMMENT '彩票編號',
  `type` varchar(15) NOT NULL COMMENT '彩票代碼',
  `name` varchar(20) NOT NULL COMMENT '彩票名稱',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
  `update_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改時間'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- 資料表的匯出資料 `lottery_type`
--

INSERT INTO `lottery_type` (`id`, `type`, `name`, `created_at`, `update_at`) VALUES
(1, 'pypk10', '金字塔PK拾', '2017-12-19 11:03:15', '2017-12-29 13:45:43'),
(2, 'pyssc', '金字塔時時彩', '2017-12-29 13:47:18', '2017-12-29 13:47:18'),
(3, 'py11x5', '金字塔十一選五', '2017-12-29 13:47:18', '2017-12-29 13:47:18');

--
-- 已匯出資料表的索引
--

--
-- 資料表索引 `lottery_type`
--
ALTER TABLE `lottery_type`
  ADD PRIMARY KEY (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
