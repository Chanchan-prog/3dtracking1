<?php
// server-php/config/database.php
// Singleton connection; use 127.0.0.1 to avoid Windows "Only one usage of each socket address" with localhost.

$db_user = 'root';
$db_pass = '';
$db_name = 'db_teacher_attendance_3d_school_with_altitude';

if (!isset($GLOBALS['mysqli']) || !($GLOBALS['mysqli'] instanceof mysqli)) {
    $mysqli = null;
    $lastError = 'Unknown connection error';
    $hosts = ['127.0.0.1', 'localhost'];
    foreach ($hosts as $db_host) {
        try {
            $mysqli = @new mysqli($db_host, $db_user, $db_pass, $db_name);
            if ($mysqli && !$mysqli->connect_error) {
                $GLOBALS['mysqli'] = $mysqli;
                break;
            }
            if ($mysqli) {
                $lastError = $mysqli->connect_error;
                $mysqli->close();
            }
            $mysqli = null;
        } catch (mysqli_sql_exception $e) {
            $lastError = $e->getMessage();
            $mysqli = null;
            continue;
        }
    }
    if (!isset($GLOBALS['mysqli']) || !($GLOBALS['mysqli'] instanceof mysqli)) {
        $msg = $lastError;
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Database connection failed', 'message' => $msg]);
        exit;
    }
}

$mysqli = $GLOBALS['mysqli'];

date_default_timezone_set('Asia/Manila');
