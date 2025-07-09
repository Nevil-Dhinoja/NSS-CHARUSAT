-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 03, 2025 at 03:41 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `nss-charusat`
--

-- --------------------------------------------------------

--
-- Table structure for table `assigned_users`
--

CREATE TABLE `assigned_users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `login_id` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `role_id` int(11) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `assigned_users`
--

INSERT INTO `assigned_users` (`id`, `name`, `login_id`, `password_hash`, `email`, `role_id`, `department_id`) VALUES
(1, 'Dhruv Rupapara', '23ec113', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', '23ec113@charusat.edu.in', 3, 11),
(2, 'Diya Thakkar', '23ec137', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', '23ec137@charusat.edu.in', 3, 11),
(3, 'Arya Kayastha', '23ce055', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', '23ce055@charusat.edu.in', 3, 1),
(4, 'Aarti Jain', '23ce045', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', '23ce045@charusat.edu.in', 3, 1),
(5, 'Dhruvi Mahale', '22cs036', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', '22cs036@charusat.edu.in', 3, 3),
(6, 'Darsh Patel', '22cs051', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', '22cs051@charusat.edu.in', 3, 3),
(7, 'Dhruv Prajapati', '22it126', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', '22it126@charusat.edu.in', 3, 9),
(8, 'Disha Shah', '22it137', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', '22it137@charusat.edu.in', 3, 9),
(9, 'Nemish Sapara', '23AIML061', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', '23AIML061@charusat.edu.in', 3, 5),
(10, 'Kaushal Savaliya', '23AIML063', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', '23AIML063@charusat.edu.in', 3, 5),
(11, 'BHUNGALIYA JASH CHANDUBHAI', '23ME004', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', '23ME004@charusat.edu.in', 3, 4),
(12, 'RATHOD JAYRAJ CHETANKUMAR', '23ME032', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', '23ME032@charusat.edu.in', 3, 4),
(13, 'Azba Vohra', '24CL046', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', '24cl046@charusat.edu.in', 3, 6),
(14, 'Soha Vohra', '24CL047', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', '24cl047@charusat.edu.in', 3, 6),
(15, 'Desai Parin', '23EE006', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', '23ee006@charusat.edu.in', 3, 7),
(16, 'Goyani Yukti', '23EE007', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', '23ee007@charusat.edu.in', 3, 7),
(17, 'Heet Vithalani', 'D24DCE144', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', 'D24DCE144@charusat.edu.in', 3, 1),
(18, 'Cheshta Ginoya', '23DCE034', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', '23DCE034@charusat.edu.in', 3, 1),
(19, 'Manan Monani', '23DCS063', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', '23DCS063@charusat.edu.in', 3, 8),
(20, 'Dhruvin Mangukiya', '23DCS059', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', '23DCS059@charusat.edu.in', 3, 8),
(21, 'Preet Chauhan', '22DIT008', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', '22dit008@charusat.edu.in', 3, 9),
(22, 'Bansi Kanani', '23DIT022', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', '23dit022@charusat.edu.in', 3, 9),
(23, 'PRIYANSHI JARIWALA', '22BPH017', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', '22bph017@charusat.edu.in', 3, 4),
(24, 'DHRUV GHELANI', '22BPH011', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', '22bph011@charusat.edu.in', 3, 4),
(25, 'Dhanshree Ramani', '24BBAB069', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', '24bbab069@charusat.edu.in', 3, 6),
(26, 'Rushiprakash Patel', '24BBAB054', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', '24bbab054@charusat.edu.in', 3, 6),
(27, 'Keshar Patel', '22bsc067', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', '22bsc067@charusat.edu.in', 3, 3),
(28, 'Parv Chittora', '23bsc058', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', '23bsc058@charusat.edu.in', 3, 3),
(29, 'Saloni Patel', '21BPT049', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', '21bpt049@charusat.edu.in', 3, 6),
(30, 'Jay Rohit', '21BPT061', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', '21bpt061@charusat.edu.in', 3, 6),
(31, 'Bansari U Patel', '24MSIT078', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', '24msit078@charusat.edu.in', 3, 7),
(32, 'Lodaliya Utsav V', '23BSIT036', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', '23bsit036@charusat.edu.in', 3, 7),
(33, 'Nancy Patel', '22BSMT014', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', '22bsmt014@charusat.edu.in', 3, 8),
(34, 'Prem Koradiya', '23MSMLT006', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', '23msmlt006@charusat.edu.in', 3, 8),
(35, 'yukta parmar', '21BN012', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', '21bn012@charusat.edu.in', 3, 9),
(36, 'Mayur Maheshwari', '23BN014', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', '23bn014@charusat.edu.in', 3, 9),
(91, 'Dr. Sagar Kumar Patel', 'sagarpatel.ec@charusat.ac.in', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', 'sagarpatel.ec@charusat.ac.in', 2, 11),
(92, 'Prof. Martin K. Parmar', 'martinparmar.ce@charusat.ac.in', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', 'martinparmar.ce@charusat.ac.in', 2, 10),
(93, 'Prof. Pinal Hansora', 'pinalhansora.cse@charusat.ac.in', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', 'pinalhansora.cse@charusat.ac.in', 2, 8),
(94, 'Prof. Rajnik S. Katriya', 'rajnikkatriya.it@charusat.ac.in', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', 'rajnikkatriya.it@charusat.ac.in', 2, 9),
(95, 'Gaurav Kumar', 'gauravkumar.aiml@charusat.ac.in', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', 'gauravkumar.aiml@charusat.ac.in', 2, 5),
(96, 'Satayu Travadi', 'satayutravadi.me@charusat.ac.in', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', 'satayutravadi.me@charusat.ac.in', 2, 4),
(97, 'Prof. Megha Desai', 'meghadesai.cv@charusat.ac.in', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', 'meghadesai.cv@charusat.ac.in', 2, 6),
(98, 'Ankur Patel', 'ankurpatel.ee@charusat.ac.in', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', 'ankurpatel.ee@charusat.ac.in', 2, 7),
(99, 'Prof. Kashyap Patel', 'kashyappatel.dce@charusat.ac.in', '$2b$10$rRwwFa3C8zYqVFcA1ZifmOA5nVB/HBxZW.LfA7vNQAk1vqyzlPD3u', 'kashyappatel.dce@charusat.ac.in', 2, 1),
(100, 'Prof. Gaurang Patel', 'gaurangpatel.dcs@charusat.ac.in', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', 'gaurangpatel.dcs@charusat.ac.in', 2, 3),
(101, 'Prof. Hitesh Makwana', 'hiteshmakwana.dit@charusat.ac.in', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', 'hiteshmakwana.dit@charusat.ac.in', 2, 2),
(102, 'Prof. Hardik Koria', 'hardikkoria.ph@charusat.ac.in', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', 'hardikkoria.ph@charusat.ac.in', 2, 12),
(103, 'Dr. Poonam Amrutia', 'poonamamrutia.mba@charusat.ac.in', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', 'poonamamrutia.mba@charusat.ac.in', 2, 13),
(104, 'Dr. Rajesh V. Savalia', 'rajeshsavalia.maths@charusat.ac.in', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', 'rajeshsavalia.maths@charusat.ac.in', 2, 14),
(105, 'Dr. Shreya Swami', 'shreyaswami.phy@charusat.ac.in', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', 'shreyaswami.phy@charusat.ac.in', 2, 15),
(106, 'Dr. Hardik Pandit', 'hardikpandit.mca@charusat.ac.in', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', 'hardikpandit.mca@charusat.ac.in', 2, 16),
(107, 'Dr. Parth Thakor', 'parththakor.cips@charusat.ac.in', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', 'parththakor.cips@charusat.ac.in', 2, 17),
(108, 'Ms. Hetal Shah', 'hetalshah.nur@charusat.ac.in', '$2b$10$mGg.ACP4pxxOKtH9EU5Bi.tE8xuPAYucL3iOGAwLqha0/LNtbircC', 'hetalshah.nur@charusat.ac.in', 2, 18);

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `institute_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `name`, `institute_id`) VALUES
(1, 'CE', 1),
(2, 'IT', 1),
(3, 'CSE', 1),
(4, 'ME', 2),
(5, 'AIML', 2),
(6, 'CL', 2),
(7, 'EE', 2),
(8, 'CSE', 2),
(9, 'IT', 2),
(10, 'CE', 2),
(11, 'EC', 2),
(12, 'RPCP', 4),
(13, 'BBA', 5),
(14, 'BSc', 3),
(15, 'BPT', 6),
(16, 'M.Sc.(IT)', 7),
(17, 'BSMT', 8),
(18, 'B.Sc. Nursing', 9);

-- --------------------------------------------------------

--
-- Table structure for table `institutes`
--

CREATE TABLE `institutes` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `institutes`
--

INSERT INTO `institutes` (`id`, `name`) VALUES
(1, 'DEPSTAR'),
(2, 'CSPIT'),
(3, 'PDPIAS'),
(4, 'RPCP'),
(5, 'IIIM'),
(6, 'ARIP'),
(7, 'CMPICA'),
(8, 'BDIPS'),
(9, 'MTIN');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `role_name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `role_name`) VALUES
(1, 'Program Coordinator'),
(2, 'Program Officer'),
(3, 'Student Coordinator'),
(4, 'Head Student Coordinator');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `assigned_users`
--
ALTER TABLE `assigned_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `login_id` (`login_id`),
  ADD KEY `role_id` (`role_id`),
  ADD KEY `department_id` (`department_id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `institute_id` (`institute_id`);

--
-- Indexes for table `institutes`
--
ALTER TABLE `institutes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `assigned_users`
--
ALTER TABLE `assigned_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=109;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `institutes`
--
ALTER TABLE `institutes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `assigned_users`
--
ALTER TABLE `assigned_users`
  ADD CONSTRAINT `assigned_users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  ADD CONSTRAINT `assigned_users_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`);

--
-- Constraints for table `departments`
--
ALTER TABLE `departments`
  ADD CONSTRAINT `departments_ibfk_1` FOREIGN KEY (`institute_id`) REFERENCES `institutes` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
