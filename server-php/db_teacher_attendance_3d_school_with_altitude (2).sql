-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 03, 2026 at 11:35 PM
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
-- Database: `db_teacher_attendance_3d_school_with_altitude`
--

-- --------------------------------------------------------

--
-- Table structure for table `tbl_archives`
--

CREATE TABLE `tbl_archives` (
  `archive_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `table_name` varchar(100) NOT NULL,
  `record_id` int(11) NOT NULL,
  `archived_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`archived_data`)),
  `archived_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_attendance_audit`
--

CREATE TABLE `tbl_attendance_audit` (
  `audit_id` int(11) NOT NULL,
  `attendance_id` int(11) NOT NULL,
  `modified_by` int(11) NOT NULL,
  `old_flag_in` int(11) DEFAULT NULL,
  `new_flag_in` int(11) DEFAULT NULL,
  `old_flag_out` int(11) DEFAULT NULL,
  `new_flag_out` int(11) DEFAULT NULL,
  `change_time` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_attendance_records`
--

CREATE TABLE `tbl_attendance_records` (
  `attendance_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `schedule_id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `floor_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `time_in` datetime DEFAULT NULL,
  `altitude_in` decimal(8,3) DEFAULT NULL,
  `flag_in_id` int(11) NOT NULL DEFAULT 1,
  `time_check` datetime DEFAULT NULL,
  `altitude_check` decimal(8,3) DEFAULT NULL,
  `flag_check_id` int(11) NOT NULL DEFAULT 1,
  `time_out` datetime DEFAULT NULL,
  `altitude_out` decimal(8,3) DEFAULT NULL,
  `flag_out_id` int(11) DEFAULT 1,
  `recorded_by` int(11) DEFAULT NULL,
  `record_source` enum('student','secretary','system','admin') NOT NULL DEFAULT 'system'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_attendance_records`
--

INSERT INTO `tbl_attendance_records` (`attendance_id`, `user_id`, `schedule_id`, `room_id`, `floor_id`, `date`, `time_in`, `altitude_in`, `flag_in_id`, `time_check`, `altitude_check`, `flag_check_id`, `time_out`, `altitude_out`, `flag_out_id`, `recorded_by`, `record_source`) VALUES
(83, 6, 20, 5, 3, '2026-01-15', NULL, NULL, 3, NULL, NULL, 3, NULL, NULL, 3, NULL, 'system'),
(84, 6, 21, 7, 4, '2026-01-16', NULL, NULL, 3, NULL, NULL, 3, NULL, NULL, 3, NULL, 'system'),
(85, 6, 24, 7, 4, '2026-01-16', NULL, NULL, 3, NULL, NULL, 3, NULL, NULL, 3, NULL, 'system'),
(86, 6, 20, 5, 3, '2026-02-05', NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, 1, NULL, 'system'),
(87, 6, 21, 7, 4, '2026-01-30', NULL, NULL, 3, NULL, NULL, 3, NULL, NULL, 3, NULL, 'system'),
(88, 6, 24, 7, 4, '2026-01-30', NULL, NULL, 3, NULL, NULL, 3, NULL, NULL, 3, NULL, 'system'),
(89, 6, 25, 5, 3, '2026-01-30', NULL, NULL, 3, NULL, NULL, 3, NULL, NULL, 3, NULL, 'system'),
(90, 6, 26, 7, 4, '2026-02-05', NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, 1, NULL, 'system'),
(91, 6, 27, 5, 3, '2026-01-30', NULL, NULL, 3, NULL, NULL, 3, NULL, NULL, 3, NULL, 'system'),
(92, 6, 28, 5, 3, '2026-02-02', NULL, NULL, 3, NULL, NULL, 3, NULL, NULL, 3, NULL, 'system'),
(93, 6, 29, 5, 3, '2026-02-04', NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, 1, NULL, 'system'),
(94, 6, 21, 7, 4, '2026-02-06', NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, 1, NULL, 'system'),
(95, 6, 24, 7, 4, '2026-02-06', NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, 1, NULL, 'system'),
(96, 6, 25, 5, 3, '2026-02-06', NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, 1, NULL, 'system'),
(97, 6, 27, 5, 3, '2026-02-06', NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, 1, NULL, 'system'),
(98, 6, 28, 5, 3, '2026-02-09', NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, 1, NULL, 'system'),
(99, 6, 30, 6, 3, '2026-02-09', NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, 1, NULL, 'system'),
(100, 6, 31, 6, 3, '2026-02-10', NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, 1, NULL, 'system'),
(101, 6, 32, 5, 3, '2026-02-09', NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, 1, NULL, 'system'),
(102, 6, 33, 5, 3, '2026-02-10', NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, 1, NULL, 'system'),
(103, 6, 34, 6, 3, '2026-02-04', NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, 1, NULL, 'system'),
(104, 6, 35, 6, 3, '2026-02-05', NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, 1, NULL, 'system'),
(105, 12, 20, 5, 3, '2026-02-05', NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, 1, NULL, 'system'),
(106, 12, 21, 7, 4, '2026-02-06', NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, 1, NULL, 'system'),
(107, 12, 24, 7, 4, '2026-02-06', NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, 1, NULL, 'system'),
(108, 12, 25, 5, 3, '2026-02-06', NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, 1, NULL, 'system'),
(109, 12, 26, 7, 4, '2026-02-05', NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, 1, NULL, 'system'),
(110, 12, 27, 5, 3, '2026-02-06', NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, 1, NULL, 'system'),
(111, 12, 28, 5, 3, '2026-02-09', NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, 1, NULL, 'system'),
(112, 12, 29, 5, 3, '2026-02-04', NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, 1, NULL, 'system'),
(113, 12, 30, 6, 3, '2026-02-09', NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, 1, NULL, 'system'),
(114, 12, 31, 6, 3, '2026-02-10', NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, 1, NULL, 'system'),
(115, 12, 32, 5, 3, '2026-02-09', NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, 1, NULL, 'system'),
(116, 12, 33, 5, 3, '2026-02-10', NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, 1, NULL, 'system'),
(117, 12, 34, 6, 3, '2026-02-04', NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, 1, NULL, 'system'),
(118, 12, 35, 6, 3, '2026-02-05', NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, 1, NULL, 'system'),
(119, 12, 28, 5, 3, '2026-02-02', NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, 1, NULL, 'system'),
(120, 12, 30, 6, 3, '2026-02-02', NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, 1, NULL, 'system'),
(121, 12, 31, 6, 3, '2026-02-03', NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, 1, NULL, 'system'),
(122, 12, 32, 5, 3, '2026-02-02', NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, 1, NULL, 'system'),
(123, 12, 33, 5, 3, '2026-02-03', NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, 1, NULL, 'system');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_buildings`
--

CREATE TABLE `tbl_buildings` (
  `building_id` int(11) NOT NULL,
  `building_name` varchar(100) NOT NULL,
  `location_description` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_buildings`
--

INSERT INTO `tbl_buildings` (`building_id`, `building_name`, `location_description`) VALUES
(3, 'MS', 'MS building katong naay lab sa first floor and naay ground floor'),
(4, 'Balay nako', 'Macanhan Phase1'),
(5, 'house chanchan', '123');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_campuses`
--

CREATE TABLE `tbl_campuses` (
  `campus_id` int(11) NOT NULL,
  `campus_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_class_schedules`
--

CREATE TABLE `tbl_class_schedules` (
  `schedule_id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `offering_id` int(11) NOT NULL,
  `day_of_week` enum('monday','tuesday','wednesday','thursday','friday','saturday','sunday') NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_class_schedules`
--

INSERT INTO `tbl_class_schedules` (`schedule_id`, `room_id`, `offering_id`, `day_of_week`, `start_time`, `end_time`) VALUES
(20, 5, 1, 'thursday', '17:40:00', '18:40:00'),
(21, 7, 1, 'friday', '22:30:00', '23:30:00'),
(24, 7, 1, 'friday', '23:25:00', '23:59:00'),
(25, 5, 1, 'friday', '22:30:00', '23:30:00'),
(26, 7, 1, 'thursday', '02:32:00', '04:32:00'),
(27, 5, 1, 'friday', '17:40:00', '18:40:00'),
(28, 5, 1, 'monday', '17:40:00', '18:40:00'),
(29, 5, 1, 'wednesday', '17:40:00', '18:40:00'),
(30, 6, 1, 'monday', '08:00:00', '09:30:00'),
(31, 6, 1, 'tuesday', '08:00:00', '09:30:00'),
(32, 5, 1, 'monday', '08:00:00', '09:30:00'),
(33, 5, 1, 'tuesday', '08:00:00', '09:30:00'),
(34, 6, 1, 'wednesday', '10:00:00', '11:30:00'),
(35, 6, 1, 'thursday', '10:00:00', '11:30:00');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_departments`
--

CREATE TABLE `tbl_departments` (
  `dept_id` int(11) NOT NULL,
  `dean_id` int(11) NOT NULL,
  `dept_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_departments`
--

INSERT INTO `tbl_departments` (`dept_id`, `dean_id`, `dept_name`) VALUES
(1, 3, 'sample_department\r\n');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_flag_types`
--

CREATE TABLE `tbl_flag_types` (
  `flag_id` int(11) NOT NULL,
  `flag_name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_flag_types`
--

INSERT INTO `tbl_flag_types` (`flag_id`, `flag_name`) VALUES
(1, 'NA'),
(2, 'present'),
(3, 'absent'),
(4, 'excuse'),
(5, 'late');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_floors`
--

CREATE TABLE `tbl_floors` (
  `floor_id` int(11) NOT NULL,
  `building_id` int(11) NOT NULL,
  `floor_name` varchar(11) NOT NULL,
  `baseline_altitude` decimal(7,3) DEFAULT NULL,
  `floor_meter_vertical` decimal(6,3) DEFAULT NULL,
  `qr_token` varchar(120) NOT NULL,
  `qr_token_active` tinyint(1) NOT NULL DEFAULT 1,
  `calibrated_by` int(11) DEFAULT NULL,
  `calibrated_at` datetime DEFAULT NULL,
  `calibration_notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_floors`
--

INSERT INTO `tbl_floors` (`floor_id`, `building_id`, `floor_name`, `baseline_altitude`, `floor_meter_vertical`, `qr_token`, `qr_token_active`, `calibrated_by`, `calibrated_at`, `calibration_notes`) VALUES
(3, 3, '1-MS', 23.000, 5.000, 'd355e968e2e726bd829fa9e709275076', 1, NULL, '2026-01-08 17:33:15', NULL),
(4, 4, '1st-floor-b', 82.200, 1.000, '', 1, NULL, '2026-01-09 22:21:41', NULL),
(5, 4, '2nd-floor-b', 83.200, 1.000, '', 1, NULL, '2026-01-09 22:22:01', NULL),
(6, 4, '2', 3.000, 3.000, '', 1, NULL, NULL, NULL),
(7, 4, 'chanix', 92.600, 100.000, '454920c4ae0f5248037859647183cc72', 1, NULL, NULL, NULL),
(8, 4, 'chanixs', 92.100, 0.000, '5b1bfdb2e857f47ee8ece858d45ef868', 0, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_hk_assignments`
--

CREATE TABLE `tbl_hk_assignments` (
  `assignment_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `room_id` int(11) DEFAULT NULL,
  `hours_assigned` int(11) NOT NULL DEFAULT 0,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_leave_requests`
--

CREATE TABLE `tbl_leave_requests` (
  `leave_id` int(11) NOT NULL,
  `approved_by` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `status_id` int(11) NOT NULL,
  `leave_type_id` int(11) NOT NULL,
  `date_from` date NOT NULL,
  `date_to` date NOT NULL,
  `reason` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_leave_type`
--

CREATE TABLE `tbl_leave_type` (
  `leave_type_id` int(11) NOT NULL,
  `name_type` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_notifications`
--

CREATE TABLE `tbl_notifications` (
  `notif_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `status_id` int(11) NOT NULL,
  `type` enum('info','warning','alert') NOT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_penalties`
--

CREATE TABLE `tbl_penalties` (
  `sanction_id` int(11) NOT NULL,
  `issued_by` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type_id` int(11) NOT NULL,
  `status_id` int(11) NOT NULL,
  `reason` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_penalties_type`
--

CREATE TABLE `tbl_penalties_type` (
  `type_id` int(11) NOT NULL,
  `type_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_programs`
--

CREATE TABLE `tbl_programs` (
  `program_id` int(11) NOT NULL,
  `head_id` int(11) NOT NULL,
  `dept_id` int(11) NOT NULL,
  `program_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_programs`
--

INSERT INTO `tbl_programs` (`program_id`, `head_id`, `dept_id`, `program_name`) VALUES
(1, 4, 1, 'BSIT');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_reports`
--

CREATE TABLE `tbl_reports` (
  `report_id` int(11) NOT NULL,
  `generated_by` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_roles`
--

CREATE TABLE `tbl_roles` (
  `role_id` int(11) NOT NULL,
  `role_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_roles`
--

INSERT INTO `tbl_roles` (`role_id`, `role_name`) VALUES
(1, 'admin'),
(2, 'dean'),
(3, 'program_head'),
(4, 'secretary'),
(5, 'teacher');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_rooms`
--

CREATE TABLE `tbl_rooms` (
  `room_id` int(11) NOT NULL,
  `building_id` int(11) NOT NULL,
  `floor_id` int(11) NOT NULL,
  `room_name` varchar(100) NOT NULL,
  `qr_token` varchar(128) DEFAULT NULL,
  `qr_token_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_rooms`
--

INSERT INTO `tbl_rooms` (`room_id`, `building_id`, `floor_id`, `room_name`, `qr_token`, `qr_token_active`) VALUES
(5, 3, 3, 'Lab-1', NULL, 0),
(6, 3, 3, 'eqw', '8d9107872f8cc93afd8bdb9abdcbb675', 0),
(7, 4, 4, 'room1', 'f291181766ad988b3ec1b762b7d10429', 1),
(8, 4, 5, 'room2', '5986ebb60efe94874144356015b5fc74', 1);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_scholarship_types`
--

CREATE TABLE `tbl_scholarship_types` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `hours_required` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_scholarship_types`
--

INSERT INTO `tbl_scholarship_types` (`id`, `name`, `hours_required`) VALUES
(1, 'HK', 90),
(2, 'HK-city', 25),
(3, 'Other', 70);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_sections`
--

CREATE TABLE `tbl_sections` (
  `section_id` int(11) NOT NULL,
  `program_id` int(11) NOT NULL,
  `year_id` int(11) NOT NULL,
  `section_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_sections`
--

INSERT INTO `tbl_sections` (`section_id`, `program_id`, `year_id`, `section_name`) VALUES
(1, 1, 1, 'BSITE1-01');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_semesters`
--

CREATE TABLE `tbl_semesters` (
  `semester_id` int(11) NOT NULL,
  `session_id` int(11) NOT NULL,
  `term` enum('1st sem','2nd sem') NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_semesters`
--

INSERT INTO `tbl_semesters` (`semester_id`, `session_id`, `term`, `start_date`, `end_date`) VALUES
(1, 1, '2nd sem', '2025-11-17', '2026-03-24'),
(2, 1, '2nd sem', '2026-02-02', '2026-05-03');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_sessions`
--

CREATE TABLE `tbl_sessions` (
  `session_id` int(11) NOT NULL,
  `session_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_sessions`
--

INSERT INTO `tbl_sessions` (`session_id`, `session_name`) VALUES
(1, '2025-2026');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_status`
--

CREATE TABLE `tbl_status` (
  `status_id` int(11) NOT NULL,
  `status_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_student_info`
--

CREATE TABLE `tbl_student_info` (
  `student_id` int(11) NOT NULL,
  `scholarship_type_id` int(11) DEFAULT NULL,
  `hours_required` int(11) NOT NULL DEFAULT 0,
  `hours_rendered` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_subject`
--

CREATE TABLE `tbl_subject` (
  `subject_id` int(11) NOT NULL,
  `program_id` int(11) NOT NULL,
  `subject_code` varchar(50) NOT NULL,
  `subject_name` varchar(100) NOT NULL,
  `units` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_subject`
--

INSERT INTO `tbl_subject` (`subject_id`, `program_id`, `subject_code`, `subject_name`, `units`) VALUES
(1, 1, 'ITE202', 'SAMPLE_NAME (PROGRAMMING1)', 7);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_subjects`
--

CREATE TABLE `tbl_subjects` (
  `id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_subject_offerings`
--

CREATE TABLE `tbl_subject_offerings` (
  `offering_id` int(11) NOT NULL,
  `semester_id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_subject_offerings`
--

INSERT INTO `tbl_subject_offerings` (`offering_id`, `semester_id`, `section_id`, `subject_id`, `user_id`) VALUES
(1, 1, 1, 1, 12);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_substitutions`
--

CREATE TABLE `tbl_substitutions` (
  `substitution_id` int(11) NOT NULL,
  `schedule_id` int(11) NOT NULL,
  `substitute_user_id` int(11) NOT NULL,
  `absent_user_id` int(11) NOT NULL,
  `status_id` int(11) NOT NULL,
  `date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_system_logs`
--

CREATE TABLE `tbl_system_logs` (
  `log_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `action` varchar(255) NOT NULL,
  `timestamp` datetime NOT NULL,
  `ip_address` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_users`
--

CREATE TABLE `tbl_users` (
  `user_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `id_number` varchar(10) NOT NULL,
  `email` varchar(255) NOT NULL,
  `image` longblob NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `contact_no` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_users`
--

INSERT INTO `tbl_users` (`user_id`, `role_id`, `status`, `first_name`, `last_name`, `id_number`, `email`, `image`, `password_hash`, `contact_no`) VALUES
(1, 1, 1, 'admin1', 'admin1', '', 'admin@phinmaed.com', '', '$2b$10$3MQDDA7NQz6xvtw9VYAWpupiWnmnUNls6KUdE9rWOS4UPzW9Vdrlm', '0923123'),
(2, 1, 1, 'admin2', 'admin2', '', 'admin2@phinmaed.com', '', '$2b$10$fpUfawvNeq/CIdD8WqGL2ucRjC2/zFb6HZJRape.VA4zJstQqCUlS', '09321312'),
(3, 2, 1, 'dean1', 'dean1', '', 'dean1@phinmaed.com', '', '$2b$10$dG6kDm/sbYi3wvso2KL9g.VR.Bl4IiOM.oZl968iSVgs1PB164h82', '1231'),
(4, 3, 1, 'program_head1', 'program_head1', '', 'program_head1@phinmaed.com', '', '$2b$10$jhFeuNenup.E0OqXuUX1XOIuNou1WMYRwijAfcTBkd78JaKg91qpa', '1234'),
(5, 4, 1, 'secretary1', 'secretary1', '', 'secretary1@phinmaed.com', '', '$2b$10$v/oBIomjz9g6fbRSzsCPXe1HlfcJ2namx/IRkTzQ.keU/ha/FIqrq', '1234'),
(6, 5, 1, 'teacher1', 'teacher1', '', 'teacher1@phinmaed.com', '', '$2b$10$8fAsjYE5/S929lJQK0mj4.zFelMQ1Xw1pVSn/dXeGJDQt60afT5lu', '1234'),
(7, 1, 1, 'dsa', 'dsa', '', 'sad@das', '', '$2b$10$0c8C58AnWA1.P77XNO4x7OlgsSo1H85Qc9HNdo.VZ7RF/f/QfQrMy', 'sd'),
(8, 1, 1, 'dsad', 'asda', '', 'adm21@gmail.com', '', '$2b$10$yB3zZRiBI8ocoUk4KL81/ufzSysqCPe52sReh2JjIaIVL1OCCGcL6', 'dasd'),
(9, 1, 1, 'try1', 'try1', '', 'try1@dsa', '', '$2b$10$fbPRiTvY.wV88kIpL7LGzefBJ9PQL3Zmob8JfPSulXIj6wGiaZzGW', 'try1'),
(10, 1, 1, 'try2', 'try2', '', 'try2@dsad', '', '$2b$10$yAMFHIfYy3KvVV5Z0bpshu1d1lhvLVrS1eQtWwAu1x9JAVXPoVcVe', 'try2'),
(11, 1, 1, 'try3', 'try3', '', 'try3@dasda', '', '$2b$10$j5J7TTYyFxR48fU.WiaPIe9.TLL4PCt3XdyLDdkwe1fezYQMRPHL2', 'try3'),
(12, 5, 1, 'sandy', 'panong', '', 'sandy@gmail.com', '', '$2y$10$XLAPm6uv/ccvEqyOa/bTZ.AMCFbbfbMW2CQv5N/flKGPwEZihAW3G', '123231');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_year_level`
--

CREATE TABLE `tbl_year_level` (
  `year_id` int(11) NOT NULL,
  `level` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_year_level`
--

INSERT INTO `tbl_year_level` (`year_id`, `level`) VALUES
(1, '1st year');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_year_levels`
--

CREATE TABLE `tbl_year_levels` (
  `id` int(11) NOT NULL,
  `name` varchar(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `tbl_archives`
--
ALTER TABLE `tbl_archives`
  ADD PRIMARY KEY (`archive_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `tbl_attendance_audit`
--
ALTER TABLE `tbl_attendance_audit`
  ADD PRIMARY KEY (`audit_id`),
  ADD KEY `attendance_id` (`attendance_id`),
  ADD KEY `modified_by` (`modified_by`);

--
-- Indexes for table `tbl_attendance_records`
--
ALTER TABLE `tbl_attendance_records`
  ADD PRIMARY KEY (`attendance_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `schedule_id` (`schedule_id`),
  ADD KEY `flag_in_id` (`flag_in_id`),
  ADD KEY `flag_check_id` (`flag_check_id`),
  ADD KEY `flag_out_id` (`flag_out_id`),
  ADD KEY `room_id` (`room_id`),
  ADD KEY `floor_id` (`floor_id`),
  ADD KEY `recorded_by` (`recorded_by`);

--
-- Indexes for table `tbl_buildings`
--
ALTER TABLE `tbl_buildings`
  ADD PRIMARY KEY (`building_id`);

--
-- Indexes for table `tbl_campuses`
--
ALTER TABLE `tbl_campuses`
  ADD PRIMARY KEY (`campus_id`);

--
-- Indexes for table `tbl_class_schedules`
--
ALTER TABLE `tbl_class_schedules`
  ADD PRIMARY KEY (`schedule_id`),
  ADD KEY `room_id` (`room_id`),
  ADD KEY `offering_id` (`offering_id`);

--
-- Indexes for table `tbl_departments`
--
ALTER TABLE `tbl_departments`
  ADD PRIMARY KEY (`dept_id`),
  ADD KEY `dean_id` (`dean_id`);

--
-- Indexes for table `tbl_flag_types`
--
ALTER TABLE `tbl_flag_types`
  ADD PRIMARY KEY (`flag_id`);

--
-- Indexes for table `tbl_floors`
--
ALTER TABLE `tbl_floors`
  ADD PRIMARY KEY (`floor_id`),
  ADD KEY `building_id` (`building_id`),
  ADD KEY `calibrated_by` (`calibrated_by`);

--
-- Indexes for table `tbl_hk_assignments`
--
ALTER TABLE `tbl_hk_assignments`
  ADD PRIMARY KEY (`assignment_id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `teacher_id` (`teacher_id`),
  ADD KEY `room_id` (`room_id`);

--
-- Indexes for table `tbl_leave_requests`
--
ALTER TABLE `tbl_leave_requests`
  ADD PRIMARY KEY (`leave_id`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `teacher_id` (`teacher_id`),
  ADD KEY `status_id` (`status_id`),
  ADD KEY `leave_type_id` (`leave_type_id`);

--
-- Indexes for table `tbl_leave_type`
--
ALTER TABLE `tbl_leave_type`
  ADD PRIMARY KEY (`leave_type_id`);

--
-- Indexes for table `tbl_notifications`
--
ALTER TABLE `tbl_notifications`
  ADD PRIMARY KEY (`notif_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `status_id` (`status_id`);

--
-- Indexes for table `tbl_penalties`
--
ALTER TABLE `tbl_penalties`
  ADD PRIMARY KEY (`sanction_id`),
  ADD KEY `issued_by` (`issued_by`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `type_id` (`type_id`),
  ADD KEY `status_id` (`status_id`);

--
-- Indexes for table `tbl_penalties_type`
--
ALTER TABLE `tbl_penalties_type`
  ADD PRIMARY KEY (`type_id`);

--
-- Indexes for table `tbl_programs`
--
ALTER TABLE `tbl_programs`
  ADD PRIMARY KEY (`program_id`),
  ADD KEY `dept_id` (`dept_id`),
  ADD KEY `head_id` (`head_id`);

--
-- Indexes for table `tbl_reports`
--
ALTER TABLE `tbl_reports`
  ADD PRIMARY KEY (`report_id`),
  ADD KEY `generated_by` (`generated_by`);

--
-- Indexes for table `tbl_roles`
--
ALTER TABLE `tbl_roles`
  ADD PRIMARY KEY (`role_id`);

--
-- Indexes for table `tbl_rooms`
--
ALTER TABLE `tbl_rooms`
  ADD PRIMARY KEY (`room_id`),
  ADD KEY `building_id` (`building_id`),
  ADD KEY `floor_id` (`floor_id`);

--
-- Indexes for table `tbl_scholarship_types`
--
ALTER TABLE `tbl_scholarship_types`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_sections`
--
ALTER TABLE `tbl_sections`
  ADD PRIMARY KEY (`section_id`),
  ADD KEY `program_id` (`program_id`),
  ADD KEY `year_id` (`year_id`);

--
-- Indexes for table `tbl_semesters`
--
ALTER TABLE `tbl_semesters`
  ADD PRIMARY KEY (`semester_id`),
  ADD KEY `session_id` (`session_id`);

--
-- Indexes for table `tbl_sessions`
--
ALTER TABLE `tbl_sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- Indexes for table `tbl_status`
--
ALTER TABLE `tbl_status`
  ADD PRIMARY KEY (`status_id`);

--
-- Indexes for table `tbl_student_info`
--
ALTER TABLE `tbl_student_info`
  ADD PRIMARY KEY (`student_id`),
  ADD KEY `scholarship_type_id` (`scholarship_type_id`);

--
-- Indexes for table `tbl_subject`
--
ALTER TABLE `tbl_subject`
  ADD PRIMARY KEY (`subject_id`),
  ADD KEY `program_id` (`program_id`);

--
-- Indexes for table `tbl_subjects`
--
ALTER TABLE `tbl_subjects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `tbl_subject_offerings`
--
ALTER TABLE `tbl_subject_offerings`
  ADD PRIMARY KEY (`offering_id`),
  ADD KEY `semester_id` (`semester_id`),
  ADD KEY `section_id` (`section_id`),
  ADD KEY `subject_id` (`subject_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `tbl_substitutions`
--
ALTER TABLE `tbl_substitutions`
  ADD PRIMARY KEY (`substitution_id`),
  ADD KEY `schedule_id` (`schedule_id`),
  ADD KEY `substitute_user_id` (`substitute_user_id`),
  ADD KEY `absent_user_id` (`absent_user_id`),
  ADD KEY `status_id` (`status_id`);

--
-- Indexes for table `tbl_system_logs`
--
ALTER TABLE `tbl_system_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `tbl_users`
--
ALTER TABLE `tbl_users`
  ADD PRIMARY KEY (`user_id`),
  ADD KEY `role_id` (`role_id`);

--
-- Indexes for table `tbl_year_level`
--
ALTER TABLE `tbl_year_level`
  ADD PRIMARY KEY (`year_id`);

--
-- Indexes for table `tbl_year_levels`
--
ALTER TABLE `tbl_year_levels`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `tbl_archives`
--
ALTER TABLE `tbl_archives`
  MODIFY `archive_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_attendance_audit`
--
ALTER TABLE `tbl_attendance_audit`
  MODIFY `audit_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_attendance_records`
--
ALTER TABLE `tbl_attendance_records`
  MODIFY `attendance_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=124;

--
-- AUTO_INCREMENT for table `tbl_buildings`
--
ALTER TABLE `tbl_buildings`
  MODIFY `building_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `tbl_campuses`
--
ALTER TABLE `tbl_campuses`
  MODIFY `campus_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_class_schedules`
--
ALTER TABLE `tbl_class_schedules`
  MODIFY `schedule_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `tbl_departments`
--
ALTER TABLE `tbl_departments`
  MODIFY `dept_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tbl_flag_types`
--
ALTER TABLE `tbl_flag_types`
  MODIFY `flag_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `tbl_floors`
--
ALTER TABLE `tbl_floors`
  MODIFY `floor_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `tbl_hk_assignments`
--
ALTER TABLE `tbl_hk_assignments`
  MODIFY `assignment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_leave_requests`
--
ALTER TABLE `tbl_leave_requests`
  MODIFY `leave_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_leave_type`
--
ALTER TABLE `tbl_leave_type`
  MODIFY `leave_type_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_notifications`
--
ALTER TABLE `tbl_notifications`
  MODIFY `notif_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_penalties`
--
ALTER TABLE `tbl_penalties`
  MODIFY `sanction_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_penalties_type`
--
ALTER TABLE `tbl_penalties_type`
  MODIFY `type_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_programs`
--
ALTER TABLE `tbl_programs`
  MODIFY `program_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tbl_reports`
--
ALTER TABLE `tbl_reports`
  MODIFY `report_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_roles`
--
ALTER TABLE `tbl_roles`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `tbl_rooms`
--
ALTER TABLE `tbl_rooms`
  MODIFY `room_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `tbl_scholarship_types`
--
ALTER TABLE `tbl_scholarship_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tbl_sections`
--
ALTER TABLE `tbl_sections`
  MODIFY `section_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tbl_semesters`
--
ALTER TABLE `tbl_semesters`
  MODIFY `semester_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tbl_sessions`
--
ALTER TABLE `tbl_sessions`
  MODIFY `session_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tbl_status`
--
ALTER TABLE `tbl_status`
  MODIFY `status_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_subject`
--
ALTER TABLE `tbl_subject`
  MODIFY `subject_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tbl_subjects`
--
ALTER TABLE `tbl_subjects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_subject_offerings`
--
ALTER TABLE `tbl_subject_offerings`
  MODIFY `offering_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tbl_substitutions`
--
ALTER TABLE `tbl_substitutions`
  MODIFY `substitution_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tbl_system_logs`
--
ALTER TABLE `tbl_system_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_users`
--
ALTER TABLE `tbl_users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `tbl_year_level`
--
ALTER TABLE `tbl_year_level`
  MODIFY `year_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tbl_year_levels`
--
ALTER TABLE `tbl_year_levels`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `tbl_archives`
--
ALTER TABLE `tbl_archives`
  ADD CONSTRAINT `tbl_archives_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`user_id`);

--
-- Constraints for table `tbl_attendance_audit`
--
ALTER TABLE `tbl_attendance_audit`
  ADD CONSTRAINT `tbl_attendance_audit_ibfk_1` FOREIGN KEY (`attendance_id`) REFERENCES `tbl_attendance_records` (`attendance_id`),
  ADD CONSTRAINT `tbl_attendance_audit_ibfk_2` FOREIGN KEY (`modified_by`) REFERENCES `tbl_users` (`user_id`);

--
-- Constraints for table `tbl_attendance_records`
--
ALTER TABLE `tbl_attendance_records`
  ADD CONSTRAINT `tbl_attendance_records_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`user_id`),
  ADD CONSTRAINT `tbl_attendance_records_ibfk_2` FOREIGN KEY (`schedule_id`) REFERENCES `tbl_class_schedules` (`schedule_id`),
  ADD CONSTRAINT `tbl_attendance_records_ibfk_3` FOREIGN KEY (`room_id`) REFERENCES `tbl_rooms` (`room_id`),
  ADD CONSTRAINT `tbl_attendance_records_ibfk_4` FOREIGN KEY (`flag_in_id`) REFERENCES `tbl_flag_types` (`flag_id`),
  ADD CONSTRAINT `tbl_attendance_records_ibfk_5` FOREIGN KEY (`flag_check_id`) REFERENCES `tbl_flag_types` (`flag_id`),
  ADD CONSTRAINT `tbl_attendance_records_ibfk_6` FOREIGN KEY (`flag_out_id`) REFERENCES `tbl_flag_types` (`flag_id`),
  ADD CONSTRAINT `tbl_attendance_records_ibfk_7` FOREIGN KEY (`floor_id`) REFERENCES `tbl_floors` (`floor_id`),
  ADD CONSTRAINT `tbl_attendance_records_ibfk_8` FOREIGN KEY (`recorded_by`) REFERENCES `tbl_users` (`user_id`);

--
-- Constraints for table `tbl_class_schedules`
--
ALTER TABLE `tbl_class_schedules`
  ADD CONSTRAINT `tbl_class_schedules_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `tbl_rooms` (`room_id`),
  ADD CONSTRAINT `tbl_class_schedules_ibfk_2` FOREIGN KEY (`offering_id`) REFERENCES `tbl_subject_offerings` (`offering_id`);

--
-- Constraints for table `tbl_departments`
--
ALTER TABLE `tbl_departments`
  ADD CONSTRAINT `tbl_departments_ibfk_1` FOREIGN KEY (`dean_id`) REFERENCES `tbl_users` (`user_id`);

--
-- Constraints for table `tbl_floors`
--
ALTER TABLE `tbl_floors`
  ADD CONSTRAINT `tbl_floors_ibfk_1` FOREIGN KEY (`calibrated_by`) REFERENCES `tbl_users` (`user_id`),
  ADD CONSTRAINT `tbl_floors_ibfk_2` FOREIGN KEY (`building_id`) REFERENCES `tbl_buildings` (`building_id`);

--
-- Constraints for table `tbl_hk_assignments`
--
ALTER TABLE `tbl_hk_assignments`
  ADD CONSTRAINT `tbl_hk_assignments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `tbl_users` (`user_id`),
  ADD CONSTRAINT `tbl_hk_assignments_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `tbl_users` (`user_id`),
  ADD CONSTRAINT `tbl_hk_assignments_ibfk_3` FOREIGN KEY (`room_id`) REFERENCES `tbl_rooms` (`room_id`);

--
-- Constraints for table `tbl_leave_requests`
--
ALTER TABLE `tbl_leave_requests`
  ADD CONSTRAINT `tbl_leave_requests_ibfk_1` FOREIGN KEY (`approved_by`) REFERENCES `tbl_users` (`user_id`),
  ADD CONSTRAINT `tbl_leave_requests_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `tbl_users` (`user_id`),
  ADD CONSTRAINT `tbl_leave_requests_ibfk_3` FOREIGN KEY (`status_id`) REFERENCES `tbl_status` (`status_id`),
  ADD CONSTRAINT `tbl_leave_requests_ibfk_4` FOREIGN KEY (`leave_type_id`) REFERENCES `tbl_leave_type` (`leave_type_id`);

--
-- Constraints for table `tbl_notifications`
--
ALTER TABLE `tbl_notifications`
  ADD CONSTRAINT `tbl_notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`user_id`),
  ADD CONSTRAINT `tbl_notifications_ibfk_2` FOREIGN KEY (`status_id`) REFERENCES `tbl_status` (`status_id`);

--
-- Constraints for table `tbl_penalties`
--
ALTER TABLE `tbl_penalties`
  ADD CONSTRAINT `tbl_penalties_ibfk_1` FOREIGN KEY (`issued_by`) REFERENCES `tbl_users` (`user_id`),
  ADD CONSTRAINT `tbl_penalties_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`user_id`),
  ADD CONSTRAINT `tbl_penalties_ibfk_3` FOREIGN KEY (`type_id`) REFERENCES `tbl_penalties_type` (`type_id`),
  ADD CONSTRAINT `tbl_penalties_ibfk_4` FOREIGN KEY (`status_id`) REFERENCES `tbl_status` (`status_id`);

--
-- Constraints for table `tbl_programs`
--
ALTER TABLE `tbl_programs`
  ADD CONSTRAINT `tbl_programs_ibfk_1` FOREIGN KEY (`dept_id`) REFERENCES `tbl_departments` (`dept_id`),
  ADD CONSTRAINT `tbl_programs_ibfk_2` FOREIGN KEY (`head_id`) REFERENCES `tbl_users` (`user_id`);

--
-- Constraints for table `tbl_reports`
--
ALTER TABLE `tbl_reports`
  ADD CONSTRAINT `tbl_reports_ibfk_1` FOREIGN KEY (`generated_by`) REFERENCES `tbl_users` (`user_id`);

--
-- Constraints for table `tbl_rooms`
--
ALTER TABLE `tbl_rooms`
  ADD CONSTRAINT `tbl_rooms_ibfk_1` FOREIGN KEY (`building_id`) REFERENCES `tbl_buildings` (`building_id`),
  ADD CONSTRAINT `tbl_rooms_ibfk_2` FOREIGN KEY (`floor_id`) REFERENCES `tbl_floors` (`floor_id`);

--
-- Constraints for table `tbl_sections`
--
ALTER TABLE `tbl_sections`
  ADD CONSTRAINT `tbl_sections_ibfk_1` FOREIGN KEY (`program_id`) REFERENCES `tbl_programs` (`program_id`),
  ADD CONSTRAINT `tbl_sections_ibfk_2` FOREIGN KEY (`year_id`) REFERENCES `tbl_year_level` (`year_id`);

--
-- Constraints for table `tbl_semesters`
--
ALTER TABLE `tbl_semesters`
  ADD CONSTRAINT `tbl_semesters_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `tbl_sessions` (`session_id`);

--
-- Constraints for table `tbl_student_info`
--
ALTER TABLE `tbl_student_info`
  ADD CONSTRAINT `tbl_student_info_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `tbl_users` (`user_id`),
  ADD CONSTRAINT `tbl_student_info_ibfk_2` FOREIGN KEY (`scholarship_type_id`) REFERENCES `tbl_scholarship_types` (`id`);

--
-- Constraints for table `tbl_subject`
--
ALTER TABLE `tbl_subject`
  ADD CONSTRAINT `tbl_subject_ibfk_1` FOREIGN KEY (`program_id`) REFERENCES `tbl_programs` (`program_id`);

--
-- Constraints for table `tbl_subject_offerings`
--
ALTER TABLE `tbl_subject_offerings`
  ADD CONSTRAINT `tbl_subject_offerings_ibfk_1` FOREIGN KEY (`semester_id`) REFERENCES `tbl_semesters` (`semester_id`),
  ADD CONSTRAINT `tbl_subject_offerings_ibfk_2` FOREIGN KEY (`section_id`) REFERENCES `tbl_sections` (`section_id`),
  ADD CONSTRAINT `tbl_subject_offerings_ibfk_3` FOREIGN KEY (`subject_id`) REFERENCES `tbl_subject` (`subject_id`),
  ADD CONSTRAINT `tbl_subject_offerings_ibfk_4` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`user_id`);

--
-- Constraints for table `tbl_substitutions`
--
ALTER TABLE `tbl_substitutions`
  ADD CONSTRAINT `tbl_substitutions_ibfk_1` FOREIGN KEY (`schedule_id`) REFERENCES `tbl_class_schedules` (`schedule_id`),
  ADD CONSTRAINT `tbl_substitutions_ibfk_2` FOREIGN KEY (`substitute_user_id`) REFERENCES `tbl_users` (`user_id`),
  ADD CONSTRAINT `tbl_substitutions_ibfk_3` FOREIGN KEY (`absent_user_id`) REFERENCES `tbl_users` (`user_id`),
  ADD CONSTRAINT `tbl_substitutions_ibfk_4` FOREIGN KEY (`status_id`) REFERENCES `tbl_status` (`status_id`);

--
-- Constraints for table `tbl_system_logs`
--
ALTER TABLE `tbl_system_logs`
  ADD CONSTRAINT `tbl_system_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`user_id`);

--
-- Constraints for table `tbl_users`
--
ALTER TABLE `tbl_users`
  ADD CONSTRAINT `tbl_users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `tbl_roles` (`role_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
