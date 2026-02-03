<?php
// server-php/api/main.php

// No need to include db/helpers again, index.php does it.
global $mysqli;

// make JWT class available from vendor
use Firebase\JWT\JWT;

$request_method = $_SERVER['REQUEST_METHOD'];
$input = get_input();

// The router in index.php has already identified the endpoint root.
// We can use the full path to distinguish between similar endpoints if needed.
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$parts = explode('/', $path);
$api_prefix_key = array_search('api', $parts);
$endpoint = $parts[$api_prefix_key + 1] ?? null;
$param1 = $parts[$api_prefix_key + 2] ?? null;
$param2 = $parts[$api_prefix_key + 3] ?? null;


switch ($endpoint) {
    case 'login':
        if ($request_method === 'POST') {
            try {
                $email = $input['email'] ?? null;
                $password = $input['password'] ?? null;
                if (!$email || !$password) {
                    json_response(['error' => 'Missing email or password'], 400);
                }

                $stmt = $mysqli->prepare("SELECT user_id, role_id, first_name, last_name, email, password_hash FROM tbl_users WHERE email = ? LIMIT 1");
                $stmt->bind_param("s", $email);
                $stmt->execute();
                $result = $stmt->get_result();
                $user = $result->fetch_assoc();

                if (!$user || !password_verify($password, $user['password_hash'])) {
                    json_response(['error' => 'Invalid email or password'], 401);
                }

                $sec = [];
                if (file_exists(__DIR__ . '/../config/security.php')) $sec = require __DIR__ . '/../config/security.php';
                $secret_key = $sec['jwt_secret'] ?? 'your-secret-key';
                $payload = [
                    'user_id' => $user['user_id'],
                    'email' => $user['email'],
                    'role_id' => $user['role_id'],
                    'iat' => time(),
                    'exp' => time() + (60 * 60 * 2) // 2 hours
                ];
                $token = JWT::encode($payload, $secret_key, 'HS256');

                json_response([
                    'token' => $token,
                    'user' => [
                        'user_id' => $user['user_id'],
                        'first_name' => $user['first_name'],
                        'last_name' => $user['last_name'],
                        'email' => $user['email'],
                        'role_id' => $user['role_id'],
                    ]
                ]);
            } catch (Throwable $e) {
                // Catch any error (including from JWT encode) and return a proper JSON response
                json_response(['error' => 'An internal server error occurred during login.', 'details' => $e->getMessage()], 500);
            }
        }
        break;

    case 'users':
        if ($request_method === 'GET') {
            // Include image/avatar column so clients can render user images when available
            $result = $mysqli->query("SELECT u.user_id, u.first_name, u.last_name, u.email, u.contact_no, u.image AS avatar, r.role_name, u.status FROM tbl_users u JOIN tbl_roles r ON u.role_id = r.role_id ORDER BY u.user_id DESC");
            json_response($result->fetch_all(MYSQLI_ASSOC));
        } elseif ($request_method === 'POST') {
            $password_hash = password_hash($input['password'], PASSWORD_BCRYPT);
            $stmt = $mysqli->prepare("INSERT INTO tbl_users (role_id, first_name, last_name, email, password_hash, contact_no) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("isssss", $input['role_id'], $input['first_name'], $input['last_name'], $input['email'], $password_hash, $input['contact_no']);
            $stmt->execute();
            json_response(['user_id' => $stmt->insert_id] + $input, 201);
        }
        break;

    case 'roles':
        if ($request_method === 'GET') {
            $result = $mysqli->query("SELECT role_id, role_name FROM tbl_roles ORDER BY role_id");
            json_response($result->fetch_all(MYSQLI_ASSOC));
        }
        break;
    
    case 'teachers':
         if ($request_method === 'GET') {
            $result = $mysqli->query("SELECT user_id, first_name, last_name FROM tbl_users WHERE role_id = 5 AND status = 1 ORDER BY last_name, first_name");
            json_response($result->fetch_all(MYSQLI_ASSOC));
        }
        break;

    case 'deans':
         if ($request_method === 'GET') {
            $result = $mysqli->query("SELECT user_id, first_name, last_name FROM tbl_users WHERE role_id = 2 AND status = 1 ORDER BY last_name, first_name");
            json_response($result->fetch_all(MYSQLI_ASSOC));
        }
        break;

    case 'sessions':
        if ($request_method === 'GET') {
            $result = $mysqli->query("SELECT session_id, session_name FROM tbl_sessions ORDER BY session_id");
            json_response($result->fetch_all(MYSQLI_ASSOC));
        }
        break;

    case 'offerings':
        if ($request_method === 'GET') {
            $result = $mysqli->query("SELECT so.offering_id, s.subject_code, s.subject_name, sec.section_name FROM tbl_subject_offerings so JOIN tbl_subject s ON so.subject_id = s.subject_id JOIN tbl_sections sec ON so.section_id = sec.section_id ORDER BY s.subject_code, sec.section_name");
            json_response($result->fetch_all(MYSQLI_ASSOC));
        }
        break;

    case 'class-schedules':
        $normalize_time_simple = function($value) {
            if ($value === null) return null;
            $value = trim((string)$value);
            if ($value === '') return null;
            if (preg_match('/^\d{1,2}:\d{2}:\d{2}$/', $value)) return $value;
            if (preg_match('/^\d{1,2}:\d{2}$/', $value)) return $value . ':00';
            $ts = strtotime($value);
            if ($ts === false) return $value;
            return date('H:i:s', $ts);
        };
        $delete_schedule = function($scheduleId) use ($mysqli) {
            $checkExisting = $mysqli->prepare("SELECT schedule_id FROM tbl_class_schedules WHERE schedule_id = ? LIMIT 1");
            if (!$checkExisting) json_response(['error' => 'prepare_failed', 'message' => $mysqli->error], 500);
            $checkExisting->bind_param("i", $scheduleId);
            $checkExisting->execute();
            $existingRow = $checkExisting->get_result()->fetch_assoc();
            if (!$existingRow) {
                json_response(['error' => 'schedule_not_found', 'message' => 'Schedule not found.'], 404);
            }

            $attCheck = $mysqli->prepare("SELECT attendance_id FROM tbl_attendance_records WHERE schedule_id = ? LIMIT 1");
            if ($attCheck) {
                $attCheck->bind_param("i", $scheduleId);
                $attCheck->execute();
                if ($attCheck->get_result()->fetch_assoc()) {
                    json_response(['error' => 'schedule_in_use', 'message' => 'Schedule has attendance records. Delete attendance records first.'], 409);
                }
            }

            $subCheck = $mysqli->prepare("SELECT substitution_id FROM tbl_substitutions WHERE schedule_id = ? LIMIT 1");
            if ($subCheck) {
                $subCheck->bind_param("i", $scheduleId);
                $subCheck->execute();
                if ($subCheck->get_result()->fetch_assoc()) {
                    json_response(['error' => 'schedule_in_use', 'message' => 'Schedule has substitutions. Delete substitutions first.'], 409);
                }
            }

            $stmt = $mysqli->prepare("DELETE FROM tbl_class_schedules WHERE schedule_id = ?");
            if (!$stmt) json_response(['error' => 'prepare_failed', 'message' => $mysqli->error], 500);
            $stmt->bind_param("i", $scheduleId);
            if (!$stmt->execute()) {
                json_response(['error' => 'delete_failed', 'message' => $stmt->error], 500);
            }
            if ($stmt->affected_rows === 0) {
                json_response(['error' => 'schedule_not_found', 'message' => 'Schedule not found.'], 404);
            }
            if (file_exists(__DIR__ . '/../helpers/websocket_broadcast.php')) {
                require_once __DIR__ . '/../helpers/websocket_broadcast.php';
                notify_ws_broadcast('schedule_update', ['action' => 'deleted', 'schedule_id' => $scheduleId]);
            }
            json_response(['deleted' => true, 'schedule_id' => $scheduleId]);
        };
        $update_schedule = function($scheduleId) use ($mysqli, $input, $normalize_time_simple) {
            $checkExisting = $mysqli->prepare("SELECT schedule_id FROM tbl_class_schedules WHERE schedule_id = ? LIMIT 1");
            if (!$checkExisting) json_response(['error' => 'prepare_failed', 'message' => $mysqli->error], 500);
            $checkExisting->bind_param("i", $scheduleId);
            $checkExisting->execute();
            $existingRow = $checkExisting->get_result()->fetch_assoc();
            if (!$existingRow) {
                json_response(['error' => 'schedule_not_found', 'message' => 'Schedule not found.'], 404);
            }

            $roomId = isset($input['room_id']) ? (int)$input['room_id'] : null;
            $offeringId = isset($input['offering_id']) ? (int)$input['offering_id'] : null;
            $dayOfWeek = isset($input['day_of_week']) ? strtolower(trim((string)$input['day_of_week'])) : null;
            $startTime = $normalize_time_simple($input['start_time'] ?? null);
            $endTime = $normalize_time_simple($input['end_time'] ?? null);
            if (!$roomId || !$offeringId || !$dayOfWeek || !$startTime || !$endTime) {
                json_response(['error' => 'missing_fields', 'message' => 'room_id, offering_id, day_of_week, start_time, end_time are required.'], 400);
            }

            $dup = $mysqli->prepare("SELECT schedule_id FROM tbl_class_schedules WHERE room_id = ? AND offering_id = ? AND day_of_week = ? AND start_time = ? AND end_time = ? AND schedule_id <> ? LIMIT 1");
            if (!$dup) json_response(['error' => 'prepare_failed', 'message' => $mysqli->error], 500);
            $dup->bind_param("iisssi", $roomId, $offeringId, $dayOfWeek, $startTime, $endTime, $scheduleId);
            $dup->execute();
            if ($dup->get_result()->fetch_assoc()) {
                json_response(['error' => 'duplicate_schedule', 'message' => 'Schedule already exists.'], 409);
            }

            $stmt = $mysqli->prepare("UPDATE tbl_class_schedules SET room_id = ?, offering_id = ?, day_of_week = ?, start_time = ?, end_time = ? WHERE schedule_id = ?");
            if (!$stmt) json_response(['error' => 'prepare_failed', 'message' => $mysqli->error], 500);
            $stmt->bind_param("iisssi", $roomId, $offeringId, $dayOfWeek, $startTime, $endTime, $scheduleId);
            if (!$stmt->execute()) {
                json_response(['error' => 'update_failed', 'message' => $stmt->error], 500);
            }
            if (file_exists(__DIR__ . '/../helpers/websocket_broadcast.php')) {
                require_once __DIR__ . '/../helpers/websocket_broadcast.php';
                notify_ws_broadcast('schedule_update', ['action' => 'updated', 'schedule_id' => $scheduleId]);
            }
            json_response(['schedule_id' => $scheduleId, 'room_id' => $roomId, 'offering_id' => $offeringId, 'day_of_week' => $dayOfWeek, 'start_time' => $startTime, 'end_time' => $endTime]);
        };

        if ($request_method === 'GET') {
            $result = $mysqli->query("SELECT cs.schedule_id, cs.room_id, cs.offering_id, cs.day_of_week, cs.start_time, cs.end_time, r.room_name, s.subject_code, s.subject_name, sec.section_name, u.first_name AS teacher_first_name, u.last_name AS teacher_last_name FROM tbl_class_schedules cs JOIN tbl_rooms r ON cs.room_id = r.room_id JOIN tbl_subject_offerings so ON cs.offering_id = so.offering_id JOIN tbl_subject s ON so.subject_id = s.subject_id JOIN tbl_sections sec ON so.section_id = sec.section_id LEFT JOIN tbl_users u ON so.user_id = u.user_id ORDER BY cs.day_of_week, cs.start_time");
            json_response($result->fetch_all(MYSQLI_ASSOC));
        } elseif ($request_method === 'PUT' && is_numeric($param1)) {
            $update_schedule((int)$param1);
        } elseif ($request_method === 'POST' && is_numeric($param1) && $param2 === 'update') {
            $update_schedule((int)$param1);
        } elseif ($request_method === 'DELETE' && is_numeric($param1)) {
            $delete_schedule((int)$param1);
        } elseif ($request_method === 'POST' && is_numeric($param1) && $param2 === 'delete') {
            $delete_schedule((int)$param1);
        } elseif ($request_method === 'POST') {
            // Bulk spreadsheet import: expect JSON with rows array
            if (isset($input['rows']) && is_array($input['rows'])) {
                $rows = $input['rows'];
                $errors = [];
                $already_exist = [];
                $inserted = 0;
                $skipped = 0;

                $rooms_result = $mysqli->query("SELECT room_id, room_name FROM tbl_rooms");
                if (!$rooms_result) json_response(['error' => 'Failed to load rooms', 'details' => $mysqli->error], 500);
                $roomById = [];
                $roomByName = [];
                foreach ($rooms_result->fetch_all(MYSQLI_ASSOC) as $room) {
                    $roomById[(string)$room['room_id']] = $room;
                    $roomByName[strtolower(trim($room['room_name']))] = $room;
                }
                $find_room_in_text = function($text) use ($roomByName) {
                    $haystack = strtolower((string)$text);
                    if ($haystack === '') return null;
                    foreach ($roomByName as $name => $room) {
                        if ($name !== '' && strpos($haystack, $name) !== false) return $room;
                    }
                    return null;
                };

                $offerings_result = $mysqli->query("SELECT so.offering_id, so.user_id, s.subject_code, s.subject_name, sec.section_name FROM tbl_subject_offerings so JOIN tbl_subject s ON so.subject_id = s.subject_id JOIN tbl_sections sec ON so.section_id = sec.section_id");
                if (!$offerings_result) json_response(['error' => 'Failed to load subject offerings', 'details' => $mysqli->error], 500);
                $offeringById = [];
                $offeringByCodeSection = [];
                $offeringByNameSection = [];
                foreach ($offerings_result->fetch_all(MYSQLI_ASSOC) as $offering) {
                    $offeringById[(string)$offering['offering_id']] = $offering;
                    $codeKey = strtolower(trim($offering['subject_code'])) . '|' . strtolower(trim($offering['section_name']));
                    $nameKey = strtolower(trim($offering['subject_name'])) . '|' . strtolower(trim($offering['section_name']));
                    $offeringByCodeSection[$codeKey] = $offering;
                    $offeringByNameSection[$nameKey] = $offering;
                }

                $existing_result = $mysqli->query("SELECT room_id, offering_id, day_of_week, start_time, end_time FROM tbl_class_schedules");
                $existing = [];
                if ($existing_result) {
                    foreach ($existing_result->fetch_all(MYSQLI_ASSOC) as $row) {
                        $key = $row['room_id'] . '|' . $row['offering_id'] . '|' . $row['day_of_week'] . '|' . $row['start_time'] . '|' . $row['end_time'];
                        $existing[$key] = true;
                    }
                }

                $existing_instructor_room = $mysqli->query("SELECT cs.room_id, cs.day_of_week, cs.start_time, cs.end_time, so.user_id FROM tbl_class_schedules cs JOIN tbl_subject_offerings so ON cs.offering_id = so.offering_id WHERE so.user_id IS NOT NULL AND so.user_id != 0");
                $existingByInstructorRoomDay = [];
                if ($existing_instructor_room) {
                    foreach ($existing_instructor_room->fetch_all(MYSQLI_ASSOC) as $row) {
                        $existingByInstructorRoomDay[] = $row;
                    }
                }
                $times_overlap = function($s1, $e1, $s2, $e2) {
                    return $s1 < $e2 && $e1 > $s2;
                };
                $pendingInstructorRoomDay = [];

                $normalize_header = function($value) {
                    $k = strtolower(trim((string)$value));
                    $k = preg_replace('/[^a-z0-9]+/', '_', $k);
                    return trim($k, '_');
                };
                $normalize_lookup = function($value) {
                    $k = strtolower(trim((string)$value));
                    $k = preg_replace('/\s+/', ' ', $k);
                    return $k;
                };

                $users_result = $mysqli->query("SELECT user_id, first_name, last_name FROM tbl_users");
                if (!$users_result) json_response(['error' => 'Failed to load users', 'details' => $mysqli->error], 500);
                $userById = [];
                $userByFullName = [];
                foreach ($users_result->fetch_all(MYSQLI_ASSOC) as $u) {
                    $userById[(string)$u['user_id']] = $u;
                    $fn = trim((string)($u['first_name'] ?? ''));
                    $ln = trim((string)($u['last_name'] ?? ''));
                    $full = $fn . ' ' . $ln;
                    if ($full !== '') $userByFullName[$normalize_lookup($full)] = $u;
                    if ($ln . ', ' . $fn !== ', ') $userByFullName[$normalize_lookup($ln . ', ' . $fn)] = $u;
                }
                $update_offering_teacher = $mysqli->prepare("UPDATE tbl_subject_offerings SET user_id = ? WHERE offering_id = ?");
                if (!$update_offering_teacher) json_response(['error' => 'Failed to prepare update offering teacher', 'details' => $mysqli->error], 500);

                $get_value = function($normalized, $keys) use ($normalize_header) {
                    foreach ($keys as $key) {
                        $nk = $normalize_header($key);
                        if (array_key_exists($nk, $normalized)) {
                            $val = $normalized[$nk];
                            if ($val !== null && $val !== '') return $val;
                        }
                    }
                    return null;
                };
                $normalize_day = function($value) {
                    if ($value === null || $value === '') return null;
                    $raw = strtolower(trim((string)$value));
                    if ($raw === '') return null;
                    if (is_numeric($raw)) {
                        $num = (int)$raw;
                        $map = [0 => 'sunday', 1 => 'monday', 2 => 'tuesday', 3 => 'wednesday', 4 => 'thursday', 5 => 'friday', 6 => 'saturday', 7 => 'sunday'];
                        return $map[$num] ?? null;
                    }
                    $aliases = [
                        'mon' => 'monday', 'monday' => 'monday',
                        'tue' => 'tuesday', 'tues' => 'tuesday', 'tuesday' => 'tuesday',
                        'wed' => 'wednesday', 'wednesday' => 'wednesday',
                        'thu' => 'thursday', 'thur' => 'thursday', 'thurs' => 'thursday', 'thursday' => 'thursday',
                        'fri' => 'friday', 'friday' => 'friday',
                        'sat' => 'saturday', 'saturday' => 'saturday',
                        'sun' => 'sunday', 'sunday' => 'sunday'
                    ];
                    $raw = preg_replace('/[^a-z]/', '', $raw);
                    return $aliases[$raw] ?? null;
                };
                $normalize_time = function($value) {
                    if ($value === null || $value === '') return null;
                    if (is_numeric($value)) {
                        $num = (float)$value;
                        if ($num >= 0 && $num < 1) {
                            $seconds = (int)round($num * 86400);
                            return gmdate('H:i:s', $seconds);
                        }
                    }
                    $ts = strtotime((string)$value);
                    if ($ts === false) return null;
                    return date('H:i:s', $ts);
                };
                $extract_days = function($text) {
                    $text = strtolower(trim((string)$text));
                    if ($text === '') return [];
                    $days = [];
                    $aliases = [
                        'monday' => 'monday', 'mon' => 'monday',
                        'tuesday' => 'tuesday', 'tue' => 'tuesday', 'tues' => 'tuesday',
                        'wednesday' => 'wednesday', 'wed' => 'wednesday',
                        'thursday' => 'thursday', 'thu' => 'thursday', 'thur' => 'thursday', 'thurs' => 'thursday',
                        'friday' => 'friday', 'fri' => 'friday',
                        'saturday' => 'saturday', 'sat' => 'saturday',
                        'sunday' => 'sunday', 'sun' => 'sunday'
                    ];
                    foreach ($aliases as $pattern => $day) {
                        if (preg_match('/\b' . $pattern . '\b/', $text)) $days[$day] = true;
                    }
                    if (preg_match_all('/\b(mwf|mw|tth|th|sa|su)\b/i', $text, $matches)) {
                        foreach ($matches[1] as $token) {
                            $token = strtolower($token);
                            if ($token === 'mwf') { $days['monday'] = true; $days['wednesday'] = true; $days['friday'] = true; }
                            elseif ($token === 'mw') { $days['monday'] = true; $days['wednesday'] = true; }
                            elseif ($token === 'tth') { $days['tuesday'] = true; $days['thursday'] = true; }
                            elseif ($token === 'th') { $days['thursday'] = true; }
                            elseif ($token === 'sa') { $days['saturday'] = true; }
                            elseif ($token === 'su') { $days['sunday'] = true; }
                        }
                    }
                    $tokens = preg_split('/\s+/', preg_replace('/[^a-z]/', ' ', $text));
                    foreach ($tokens as $token) {
                        if ($token === 'm') $days['monday'] = true;
                        elseif ($token === 't') $days['tuesday'] = true;
                        elseif ($token === 'w') $days['wednesday'] = true;
                        elseif ($token === 'th') $days['thursday'] = true;
                        elseif ($token === 'f') $days['friday'] = true;
                        elseif ($token === 'sa') $days['saturday'] = true;
                        elseif ($token === 'su') $days['sunday'] = true;
                    }
                    return array_values(array_keys($days));
                };
                $extract_time_ranges = function($text) use ($normalize_time) {
                    $ranges = [];
                    $text = (string)$text;
                    if (preg_match_all('/(\d{1,2}(?:\:\d{2})?\s*(?:am|pm)?)\s*(?:-|–|to)\s*(\d{1,2}(?:\:\d{2})?\s*(?:am|pm)?)/i', $text, $matches, PREG_SET_ORDER)) {
                        foreach ($matches as $match) {
                            $start = $normalize_time($match[1]);
                            $end = $normalize_time($match[2]);
                            if ($start && $end) $ranges[] = ['start_time' => $start, 'end_time' => $end];
                        }
                    }
                    return $ranges;
                };
                $parse_schedule = function($text, $fallbackDay = null) use ($extract_days, $extract_time_ranges) {
                    $text = trim((string)$text);
                    if ($text === '') return [];
                    $segments = preg_split('/[;\n]+/', $text);
                    $globalDays = $extract_days($text);
                    $globalRanges = $extract_time_ranges($text);
                    $entries = [];
                    foreach ($segments as $segment) {
                        $segment = trim($segment);
                        if ($segment === '') continue;
                        $days = $extract_days($segment);
                        if (!$days) $days = $globalDays;
                        if (!$days && $fallbackDay) $days = [$fallbackDay];
                        $ranges = $extract_time_ranges($segment);
                        if (!$ranges) $ranges = $globalRanges;
                        if (!$days || !$ranges) continue;
                        if (count($ranges) === 1) {
                            foreach ($days as $day) $entries[] = ['day' => $day, 'start_time' => $ranges[0]['start_time'], 'end_time' => $ranges[0]['end_time']];
                        } elseif (count($ranges) === count($days)) {
                            for ($i = 0; $i < count($days); $i++) {
                                $entries[] = ['day' => $days[$i], 'start_time' => $ranges[$i]['start_time'], 'end_time' => $ranges[$i]['end_time']];
                            }
                        } else {
                            foreach ($days as $day) $entries[] = ['day' => $day, 'start_time' => $ranges[0]['start_time'], 'end_time' => $ranges[0]['end_time']];
                        }
                    }
                    return $entries;
                };

                $stmt = $mysqli->prepare("INSERT INTO tbl_class_schedules (room_id, offering_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?, ?)");
                if (!$stmt) json_response(['error' => 'Failed to prepare schedule insert', 'details' => $mysqli->error], 500);

                foreach ($rows as $idx => $row) {
                    $rowNumber = $idx + 2; // header row assumed
                    if (!is_array($row)) {
                        $errors[] = ['row' => $rowNumber, 'message' => 'Row is not a valid object'];
                        continue;
                    }
                    $rowSeen = [];
                    $normalized = [];
                    foreach ($row as $key => $value) {
                        $nk = $normalize_header($key);
                        if ($nk !== '') $normalized[$nk] = $value;
                    }

                    $roomIdVal = $get_value($normalized, ['room_id', 'roomid']);
                    $roomNameVal = $get_value($normalized, ['room_name', 'room', 'room_no', 'room_number']);
                    $campusVal = $get_value($normalized, ['campus']);
                    $scheduleRaw = $get_value($normalized, ['schedule', 'class_schedule', 'schedule_time', 'time']);
                    $room = null;
                    if ($roomIdVal !== null && $roomIdVal !== '') {
                        if (is_numeric($roomIdVal)) {
                            $room = $roomById[(string)(int)$roomIdVal] ?? null;
                        } else {
                            $room = $roomByName[$normalize_lookup($roomIdVal)] ?? null;
                        }
                    }
                    if (!$room && $roomNameVal !== null && $roomNameVal !== '') {
                        $room = $roomByName[$normalize_lookup($roomNameVal)] ?? null;
                        if (!$room && is_numeric($roomNameVal)) {
                            $room = $roomById[(string)(int)$roomNameVal] ?? null;
                        }
                    }
                    if (!$room && $campusVal !== null && $campusVal !== '') {
                        $room = $roomByName[$normalize_lookup($campusVal)] ?? null;
                        if (!$room && is_numeric($campusVal)) {
                            $room = $roomById[(string)(int)$campusVal] ?? null;
                        }
                    }
                    if (!$room && $scheduleRaw) {
                        $room = $find_room_in_text($scheduleRaw);
                    }
                    if (!$room) {
                        $errors[] = ['row' => $rowNumber, 'message' => 'Room not found'];
                        continue;
                    }

                    $offeringIdVal = $get_value($normalized, ['offering_id', 'offeringid', 'offering']);
                    $subjectCode = $get_value($normalized, ['subject_code', 'subjectcode', 'subject', 'code']);
                    $subjectName = $get_value($normalized, ['subject_name', 'subjectname']);
                    $sectionName = $get_value($normalized, ['section_name', 'section', 'sectionname']);
                    if (!$sectionName) {
                        $combo = $get_value($normalized, ['subject_section', 'subject/section', 'subject_offering']);
                        if ($combo) {
                            $parts = preg_split('/\s*[-\/|]+\s*/', trim((string)$combo));
                            if (count($parts) >= 2) {
                                if (!$subjectCode) $subjectCode = $parts[0];
                                if (!$sectionName) $sectionName = $parts[1];
                            }
                        }
                    }

                    $offering = null;
                    if ($offeringIdVal !== null && $offeringIdVal !== '') {
                        if (is_numeric($offeringIdVal)) {
                            $offering = $offeringById[(string)(int)$offeringIdVal] ?? null;
                        }
                    }
                    if (!$offering && $subjectCode && $sectionName) {
                        $key = strtolower(trim((string)$subjectCode)) . '|' . strtolower(trim((string)$sectionName));
                        $offering = $offeringByCodeSection[$key] ?? null;
                    }
                    if (!$offering && $subjectName && $sectionName) {
                        $key = strtolower(trim((string)$subjectName)) . '|' . strtolower(trim((string)$sectionName));
                        $offering = $offeringByNameSection[$key] ?? null;
                    }
                    if (!$offering) {
                        $errors[] = ['row' => $rowNumber, 'message' => 'Subject offering not found'];
                        continue;
                    }

                    $teacherNameVal = $get_value($normalized, ['teacher', 'teacher_name', 'final_faculty', 'faculty', 'instructor', 'instructor_name']);
                    if ($teacherNameVal !== null && trim((string)$teacherNameVal) !== '') {
                        $teacherKey = $normalize_lookup($teacherNameVal);
                        $matchedUser = $userByFullName[$teacherKey] ?? null;
                        if ($matchedUser) {
                            $update_offering_teacher->bind_param("ii", $matchedUser['user_id'], $offering['offering_id']);
                            if ($update_offering_teacher->execute()) {
                                $offering['user_id'] = $matchedUser['user_id'];
                            }
                        } else {
                            $errors[] = ['row' => $rowNumber, 'message' => "Faculty instructor '" . trim((string)$teacherNameVal) . "' not found; schedule imported with existing offering faculty instructor."];
                        }
                    }

                    $dayRaw = $get_value($normalized, ['day_of_week', 'day', 'weekday', 'dow']);
                    $explicitDay = $normalize_day($dayRaw);

                    $scheduleEntries = [];
                    if ($scheduleRaw) {
                        $scheduleEntries = $parse_schedule($scheduleRaw, $explicitDay);
                    }
                    if (!$scheduleEntries) {
                        $startRaw = $get_value($normalized, ['start_time', 'start', 'time_start', 'from', 'time_in']);
                        $endRaw = $get_value($normalized, ['end_time', 'end', 'time_end', 'to', 'time_out']);
                        $startTime = $normalize_time($startRaw);
                        $endTime = $normalize_time($endRaw);
                        if (!$explicitDay || !$startTime || !$endTime) {
                            $errors[] = ['row' => $rowNumber, 'message' => 'Schedule/day/time not found'];
                            continue;
                        }
                        $scheduleEntries[] = ['day' => $explicitDay, 'start_time' => $startTime, 'end_time' => $endTime];
                    }

                    foreach ($scheduleEntries as $entry) {
                        $day = $entry['day'] ?? null;
                        $startTime = $entry['start_time'] ?? null;
                        $endTime = $entry['end_time'] ?? null;
                        if (!$day || !$startTime || !$endTime) {
                            $errors[] = ['row' => $rowNumber, 'message' => 'Invalid schedule time in row'];
                            continue;
                        }
                        $key = $room['room_id'] . '|' . $offering['offering_id'] . '|' . $day . '|' . $startTime . '|' . $endTime;
                        if (isset($rowSeen[$key])) {
                            $skipped++;
                            continue;
                        }
                        $rowSeen[$key] = true;
                        if (isset($existing[$key])) {
                            $skipped++;
                            $already_exist[] = ['row' => $rowNumber, 'message' => 'Already exists', 'room' => $room['room_name'], 'offering' => ($offering['subject_code'] ?? '') . ' / ' . ($offering['section_name'] ?? ''), 'day' => $day, 'time' => $startTime . ' - ' . $endTime];
                            continue;
                        }

                        $instructorId = (isset($offering['user_id']) && $offering['user_id'] !== '' && $offering['user_id'] !== null) ? (int)$offering['user_id'] : null;
                        $overlapMessage = null;
                        if ($instructorId) {
                            foreach ($existingByInstructorRoomDay as $ex) {
                                if ((int)$ex['user_id'] === $instructorId && (int)$ex['room_id'] === (int)$room['room_id'] && $ex['day_of_week'] === $day && $times_overlap($startTime, $endTime, $ex['start_time'], $ex['end_time'])) {
                                    $overlapMessage = 'Overlapping schedule: same faculty instructor, same room, same time.';
                                    break;
                                }
                            }
                            if (!$overlapMessage) {
                                foreach ($pendingInstructorRoomDay as $p) {
                                    if ($p['user_id'] === $instructorId && $p['room_id'] === (int)$room['room_id'] && $p['day_of_week'] === $day && $times_overlap($startTime, $endTime, $p['start_time'], $p['end_time'])) {
                                        $overlapMessage = 'Overlapping schedule: same faculty instructor, same room, same time.';
                                        break;
                                    }
                                }
                            }
                        }
                        if ($overlapMessage) {
                            $errors[] = ['row' => $rowNumber, 'message' => $overlapMessage];
                            continue;
                        }

                        $stmt->bind_param("iisss", $room['room_id'], $offering['offering_id'], $day, $startTime, $endTime);
                        if (!$stmt->execute()) {
                            $errors[] = ['row' => $rowNumber, 'message' => 'Insert failed: ' . $stmt->error];
                            continue;
                        }
                        $existing[$key] = true;
                        if ($instructorId) {
                            $pendingInstructorRoomDay[] = ['user_id' => $instructorId, 'room_id' => (int)$room['room_id'], 'day_of_week' => $day, 'start_time' => $startTime, 'end_time' => $endTime];
                        }
                        $inserted++;
                    }
                }

                // Attempt to generate attendance for the upcoming week immediately.
                try {
                    $GLOBALS['SKIP_ATTENDANCE_ROUTING'] = true;
                    require_once __DIR__ . '/attendance.php';
                    if (function_exists('generateAttendanceWeek')) {
                        try { $genResult = generateAttendanceWeek(null, null); } catch (Exception $e) { /* ignore generation errors */ }
                    }
                } catch (Throwable $e) {
                    // ignore any errors from inclusion/generation to avoid breaking the primary API call
                }

                if ($inserted > 0 && file_exists(__DIR__ . '/../helpers/websocket_broadcast.php')) {
                    require_once __DIR__ . '/../helpers/websocket_broadcast.php';
                    notify_ws_broadcast('schedule_update', ['action' => 'bulk_import', 'inserted' => $inserted]);
                }
                json_response([
                    'inserted' => $inserted,
                    'skipped' => $skipped,
                    'already_exist' => $already_exist,
                    'total_rows' => count($rows),
                    'errors' => $errors
                ]);
            }

            $roomId = isset($input['room_id']) ? (int)$input['room_id'] : null;
            $offeringId = isset($input['offering_id']) ? (int)$input['offering_id'] : null;
            $dayOfWeek = isset($input['day_of_week']) ? strtolower(trim((string)$input['day_of_week'])) : null;
            $startTime = $normalize_time_simple($input['start_time'] ?? null);
            $endTime = $normalize_time_simple($input['end_time'] ?? null);

            $check = $mysqli->prepare("SELECT schedule_id FROM tbl_class_schedules WHERE room_id = ? AND offering_id = ? AND day_of_week = ? AND start_time = ? AND end_time = ? LIMIT 1");
            $check->bind_param("iisss", $roomId, $offeringId, $dayOfWeek, $startTime, $endTime);
            $check->execute();
            $exists = $check->get_result()->fetch_assoc();
            if ($exists) {
                json_response(['error' => 'duplicate_schedule', 'message' => 'Schedule already exists.'], 409);
            }

            $stmt = $mysqli->prepare("INSERT INTO tbl_class_schedules (room_id, offering_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?, ?)");
            $stmt->bind_param("iisss", $roomId, $offeringId, $dayOfWeek, $startTime, $endTime);
            $stmt->execute();
            // Attempt to generate attendance for the upcoming week immediately.
            // We include attendance.php but prevent its routing from auto-responding by setting the guard.
            try {
                $GLOBALS['SKIP_ATTENDANCE_ROUTING'] = true;
                require_once __DIR__ . '/attendance.php';
                if (function_exists('generateAttendanceWeek')) {
                    // Generate for the default window (next 7 days)
                    try { $genResult = generateAttendanceWeek(null, null); } catch (Exception $e) { /* ignore generation errors */ }
                }
            } catch (Throwable $e) {
                // ignore any errors from inclusion/generation to avoid breaking the primary API call
            }

            if (file_exists(__DIR__ . '/../helpers/websocket_broadcast.php')) {
                require_once __DIR__ . '/../helpers/websocket_broadcast.php';
                notify_ws_broadcast('schedule_update', ['action' => 'created', 'schedule_id' => $stmt->insert_id]);
            }
            json_response(['schedule_id' => $stmt->insert_id] + $input, 201);
        }
        break;

    case 'departments':
        if ($request_method === 'GET') {
            $result = $mysqli->query("SELECT dept_id, dean_id, dept_name FROM tbl_departments ORDER BY dept_name");
            json_response($result->fetch_all(MYSQLI_ASSOC));
        } elseif ($request_method === 'POST') {
            // Validate dean_id when creating a department
            $deanIdProvided = isset($input['dean_id']) && $input['dean_id'] !== '' && $input['dean_id'] !== null;
            if (!$deanIdProvided) {
                // The database schema requires dean_id to be provided (NOT NULL + FK). Return a clear error.
                json_response(['error' => 'missing_dean_id', 'message' => 'dean_id is required and must reference an existing user'], 400);
            }
            $deanId = (int)$input['dean_id'];
            // Check user exists
            $u = $mysqli->prepare("SELECT user_id FROM tbl_users WHERE user_id = ? LIMIT 1");
            $u->bind_param("i", $deanId);
            $u->execute();
            $urow = $u->get_result()->fetch_assoc();
            if (!$urow) {
                json_response(['error' => 'invalid_dean_id', 'message' => 'Selected dean user does not exist'], 400);
            }
            $stmt = $mysqli->prepare("INSERT INTO tbl_departments (dept_name, dean_id) VALUES (?, ?)");
            $stmt->bind_param("si", $input['dept_name'], $deanId);
            if (!$stmt) {
                json_response(['error' => 'prepare_failed', 'sql_error' => $mysqli->error], 500);
            }
            if (!$stmt->execute()) {
                // Provide friendly error for FK issues or other DB errors
                json_response(['error' => 'db_insert_failed', 'message' => $stmt->error], 500);
            }
            json_response(['dept_id' => $stmt->insert_id] + $input, 201);
        }
        break;
        
    case 'programs':
        if ($request_method === 'GET') {
            $result = $mysqli->query("SELECT p.program_id, p.head_id, p.dept_id, p.program_name, d.dept_name FROM tbl_programs p JOIN tbl_departments d ON p.dept_id = d.dept_id ORDER BY d.dept_name, p.program_name");
            json_response($result->fetch_all(MYSQLI_ASSOC));
        } elseif ($request_method === 'POST') {
            // Validate required foreign keys to avoid DB FK errors
            if (!isset($input['dept_id']) || $input['dept_id'] === '' || !is_numeric($input['dept_id'])) {
                json_response(['error' => 'missing_dept_id', 'message' => 'dept_id is required and must reference an existing department'], 400);
            }
            if (!isset($input['head_id']) || $input['head_id'] === '' || !is_numeric($input['head_id'])) {
                json_response(['error' => 'missing_head_id', 'message' => 'head_id is required and must reference an existing user'], 400);
            }
            $deptId = (int)$input['dept_id'];
            $headId = (int)$input['head_id'];

            // Check department exists
            $dstmt = $mysqli->prepare("SELECT dept_id FROM tbl_departments WHERE dept_id = ? LIMIT 1");
            $dstmt->bind_param("i", $deptId);
            $dstmt->execute();
            $drow = $dstmt->get_result()->fetch_assoc();
            if (!$drow) {
                json_response(['error' => 'invalid_dept_id', 'message' => 'Selected department does not exist'], 400);
            }

            // Check head user exists
            $ustmt = $mysqli->prepare("SELECT user_id FROM tbl_users WHERE user_id = ? LIMIT 1");
            $ustmt->bind_param("i", $headId);
            $ustmt->execute();
            $urow = $ustmt->get_result()->fetch_assoc();
            if (!$urow) {
                json_response(['error' => 'invalid_head_id', 'message' => 'Selected head user does not exist'], 400);
            }

            $stmt = $mysqli->prepare("INSERT INTO tbl_programs (program_name, dept_id, head_id) VALUES (?, ?, ?)");
            if (!$stmt) {
                json_response(['error' => 'prepare_failed', 'sql_error' => $mysqli->error], 500);
            }
            $stmt->bind_param("sii", $input['program_name'], $deptId, $headId);
            if (!$stmt->execute()) {
                json_response(['error' => 'db_insert_failed', 'message' => $stmt->error], 500);
            }
            json_response(['program_id' => $stmt->insert_id] + $input, 201);
        }
        break;

    case 'sections':
        if ($request_method === 'GET') {
            $result = $mysqli->query("SELECT sec.section_id, sec.program_id, sec.section_name, p.program_name FROM tbl_sections sec JOIN tbl_programs p ON sec.program_id = p.program_id ORDER BY p.program_name, sec.section_name");
            json_response($result->fetch_all(MYSQLI_ASSOC));
        } elseif ($request_method === 'POST') {
            // Validate program_id and year_id
            if (!isset($input['program_id']) || $input['program_id'] === '' || !is_numeric($input['program_id'])) {
                json_response(['error' => 'missing_program_id', 'message' => 'program_id is required and must reference an existing program'], 400);
            }
            if (!isset($input['year_id']) || $input['year_id'] === '' || !is_numeric($input['year_id'])) {
                json_response(['error' => 'missing_year_id', 'message' => 'year_id is required and must reference an existing year level'], 400);
            }
            $programId = (int)$input['program_id'];
            $yearId = (int)$input['year_id'];

            // Check program exists
            $pstmt = $mysqli->prepare("SELECT program_id FROM tbl_programs WHERE program_id = ? LIMIT 1");
            $pstmt->bind_param("i", $programId);
            $pstmt->execute();
            $prow = $pstmt->get_result()->fetch_assoc();
            if (!$prow) json_response(['error' => 'invalid_program_id', 'message' => 'Selected program does not exist'], 400);

            // Check year level exists
            $ystmt = $mysqli->prepare("SELECT year_id FROM tbl_year_level WHERE year_id = ? LIMIT 1");
            $ystmt->bind_param("i", $yearId);
            $ystmt->execute();
            $yrow = $ystmt->get_result()->fetch_assoc();
            if (!$yrow) json_response(['error' => 'invalid_year_id', 'message' => 'Selected year level does not exist'], 400);

            $stmt = $mysqli->prepare("INSERT INTO tbl_sections (program_id, year_id, section_name) VALUES (?, ?, ?)");
            if (!$stmt) json_response(['error' => 'prepare_failed', 'sql_error' => $mysqli->error], 500);
            $stmt->bind_param("iis", $programId, $yearId, $input['section_name']);
            if (!$stmt->execute()) json_response(['error' => 'db_insert_failed', 'message' => $stmt->error], 500);
            json_response(['section_id' => $stmt->insert_id] + $input, 201);
        }
        break;

    case 'semesters':
        if ($request_method === 'GET') {
            $result = $mysqli->query("SELECT semester_id, session_id, term, DATE_FORMAT(start_date, '%Y-%m-%d') AS start_date, DATE_FORMAT(end_date, '%Y-%m-%d') AS end_date FROM tbl_semesters ORDER BY start_date DESC");
            json_response($result->fetch_all(MYSQLI_ASSOC));
        } elseif ($request_method === 'POST') {
            // Validate required fields
            if (!isset($input['session_id']) || $input['session_id'] === '' || !is_numeric($input['session_id'])) {
                json_response(['error' => 'missing_session_id', 'message' => 'session_id is required and must reference an existing session'], 400);
            }
            if (!isset($input['term']) || $input['term'] === '') {
                json_response(['error' => 'missing_term', 'message' => 'term is required'], 400);
            }
            $sessionId = (int)$input['session_id'];

            // Check session exists
            $sstmt = $mysqli->prepare("SELECT session_id FROM tbl_sessions WHERE session_id = ? LIMIT 1");
            $sstmt->bind_param("i", $sessionId);
            $sstmt->execute();
            $srow = $sstmt->get_result()->fetch_assoc();
            if (!$srow) {
                json_response(['error' => 'invalid_session_id', 'message' => 'Selected session does not exist'], 400);
            }

            $stmt = $mysqli->prepare("INSERT INTO tbl_semesters (session_id, term, start_date, end_date) VALUES (?, ?, ?, ?)");
            if (!$stmt) json_response(['error' => 'prepare_failed', 'sql_error' => $mysqli->error], 500);
            $stmt->bind_param("isss", $sessionId, $input['term'], $input['start_date'], $input['end_date']);
            if (!$stmt->execute()) json_response(['error' => 'db_insert_failed', 'message' => $stmt->error], 500);
            json_response(['semester_id' => $stmt->insert_id] + $input, 201);
        }
        break;

    case 'subjects':
        if ($request_method === 'GET') {
            $result = $mysqli->query("SELECT subject_id, program_id, subject_code, subject_name FROM tbl_subject ORDER BY subject_code");
            json_response($result->fetch_all(MYSQLI_ASSOC));
        } elseif ($request_method === 'POST') {
            $stmt = $mysqli->prepare("INSERT INTO tbl_subject (program_id, subject_code, subject_name) VALUES (?, ?, ?)");
            $stmt->bind_param("iss", $input['program_id'], $input['subject_code'], $input['subject_name']);
            $stmt->execute();
            json_response(['subject_id' => $stmt->insert_id] + $input, 201);
        }
        break;

    case 'subject-offerings':
        if ($request_method === 'GET') {
            $result = $mysqli->query("SELECT so.offering_id, so.semester_id, so.section_id, so.subject_id, so.user_id, s.subject_code, s.subject_name, sec.section_name, sem.term, u.first_name AS teacher_first_name, u.last_name AS teacher_last_name FROM tbl_subject_offerings so JOIN tbl_subject s ON so.subject_id = s.subject_id JOIN tbl_sections sec ON so.section_id = sec.section_id JOIN tbl_semesters sem ON so.semester_id = sem.semester_id LEFT JOIN tbl_users u ON so.user_id = u.user_id ORDER BY sem.start_date DESC, s.subject_code");
            json_response($result->fetch_all(MYSQLI_ASSOC));
        } elseif ($request_method === 'PUT' && is_numeric($param1)) {
            $offeringId = (int)$param1;
            $userId = isset($input['user_id']) ? (int)$input['user_id'] : null;
            $stmt = $mysqli->prepare("UPDATE tbl_subject_offerings SET user_id = ? WHERE offering_id = ?");
            if (!$stmt) json_response(['error' => 'prepare_failed', 'message' => $mysqli->error], 500);
            $stmt->bind_param("ii", $userId, $offeringId);
            if (!$stmt->execute()) json_response(['error' => 'update_failed', 'message' => $stmt->error], 500);
            json_response(['offering_id' => $offeringId, 'user_id' => $userId]);
        } elseif ($request_method === 'POST') {
            $stmt = $mysqli->prepare("INSERT INTO tbl_subject_offerings (semester_id, section_id, subject_id, user_id) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("iiii", $input['semester_id'], $input['section_id'], $input['subject_id'], $input['user_id']);
            $stmt->execute();
            json_response(['offering_id' => $stmt->insert_id] + $input, 201);
        }
        break;

    case 'year-levels':
        if ($request_method === 'GET') {
            $result = $mysqli->query("SELECT year_id, level FROM tbl_year_level ORDER BY year_id");
            json_response($result->fetch_all(MYSQLI_ASSOC));
        }
        break;

    case 'substitutions':
        $scheduleId = isset($_GET['schedule_id']) ? (int)$_GET['schedule_id'] : null;
        if ($request_method === 'GET' && $scheduleId) {
            $stmt = $mysqli->prepare("SELECT sub.substitution_id, sub.schedule_id, sub.substitute_user_id, sub.absent_user_id, sub.status_id, sub.date, u1.first_name AS sub_first_name, u1.last_name AS sub_last_name FROM tbl_substitutions sub LEFT JOIN tbl_users u1 ON sub.substitute_user_id = u1.user_id WHERE sub.schedule_id = ? ORDER BY sub.date DESC");
            if (!$stmt) json_response(['error' => 'prepare_failed'], 500);
            $stmt->bind_param("i", $scheduleId);
            $stmt->execute();
            $result = $stmt->get_result();
            json_response($result->fetch_all(MYSQLI_ASSOC));
        } elseif ($request_method === 'POST') {
            $schedId = isset($input['schedule_id']) ? (int)$input['schedule_id'] : null;
            $subUserId = isset($input['substitute_user_id']) ? (int)$input['substitute_user_id'] : null;
            $absentUserId = isset($input['absent_user_id']) ? (int)$input['absent_user_id'] : null;
            $date = isset($input['date']) ? trim((string)$input['date']) : null;
            if (!$schedId || !$subUserId || !$absentUserId || !$date) {
                json_response(['error' => 'missing_fields', 'message' => 'schedule_id, substitute_user_id, absent_user_id, date required.'], 400);
            }
            $statusId = 1;
            $check = $mysqli->prepare("SELECT substitution_id FROM tbl_substitutions WHERE schedule_id = ? AND date = ? LIMIT 1");
            $check->bind_param("is", $schedId, $date);
            $check->execute();
            $existing = $check->get_result()->fetch_assoc();
            $substitutionId = null;
            if ($existing) {
                $up = $mysqli->prepare("UPDATE tbl_substitutions SET substitute_user_id = ?, absent_user_id = ?, status_id = ? WHERE substitution_id = ?");
                $up->bind_param("iiii", $subUserId, $absentUserId, $statusId, $existing['substitution_id']);
                $up->execute();
                $substitutionId = (int)$existing['substitution_id'];
            } else {
                $ins = $mysqli->prepare("INSERT INTO tbl_substitutions (schedule_id, substitute_user_id, absent_user_id, status_id, date) VALUES (?, ?, ?, ?, ?)");
                $ins->bind_param("iiiis", $schedId, $subUserId, $absentUserId, $statusId, $date);
                $ins->execute();
                $substitutionId = (int)$mysqli->insert_id;
            }
            $roomFloor = $mysqli->query("SELECT cs.room_id, r.floor_id FROM tbl_class_schedules cs JOIN tbl_rooms r ON cs.room_id = r.room_id WHERE cs.schedule_id = " . (int)$schedId . " LIMIT 1");
            if ($roomFloor && ($rf = $roomFloor->fetch_assoc())) {
                $roomId = (int)$rf['room_id'];
                $floorId = (int)$rf['floor_id'];
                $insAtt = $mysqli->prepare("INSERT INTO tbl_attendance_records (user_id, schedule_id, room_id, floor_id, date, flag_in_id, flag_check_id, flag_out_id) SELECT ?, ?, ?, ?, ?, 1, 1, 1 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM tbl_attendance_records WHERE user_id = ? AND schedule_id = ? AND date = ?)");
                if ($insAtt) {
                    $insAtt->bind_param("iiiisiis", $subUserId, $schedId, $roomId, $floorId, $date, $subUserId, $schedId, $date);
                    $insAtt->execute();
                }
            }
            json_response(['substitution_id' => $substitutionId, 'schedule_id' => $schedId, 'date' => $date], $existing ? 200 : 201);
        } elseif ($request_method === 'DELETE' && is_numeric($param1)) {
            $subId = (int)$param1;
            $subRow = $mysqli->query("SELECT substitute_user_id, schedule_id, date FROM tbl_substitutions WHERE substitution_id = " . $subId . " LIMIT 1");
            $sr = ($subRow && $subRow->num_rows) ? $subRow->fetch_assoc() : null;
            $del = $mysqli->prepare("DELETE FROM tbl_substitutions WHERE substitution_id = ?");
            $del->bind_param("i", $subId);
            $del->execute();
            if ($sr) {
                $delAtt = $mysqli->prepare("DELETE FROM tbl_attendance_records WHERE user_id = ? AND schedule_id = ? AND date = ?");
                if ($delAtt) {
                    $delAtt->bind_param("iis", $sr['substitute_user_id'], $sr['schedule_id'], $sr['date']);
                    $delAtt->execute();
                }
            }
            json_response(['deleted' => true, 'substitution_id' => $subId]);
        } else {
            json_response(['error' => 'Invalid request'], 400);
        }
        break;

    case 'present-in-building':
        if ($request_method !== 'GET') {
            json_response(['error' => 'Method not allowed'], 405);
        }
        $today = date('Y-m-d');
        $sql = "SELECT ar.attendance_id, ar.user_id, ar.room_id, ar.floor_id,
                u.first_name, u.last_name, r.room_name, f.floor_name
                FROM tbl_attendance_records ar
                JOIN tbl_users u ON ar.user_id = u.user_id
                JOIN tbl_rooms r ON ar.room_id = r.room_id
                LEFT JOIN tbl_floors f ON ar.floor_id = f.floor_id
                WHERE ar.date = ? AND (ar.flag_in_id = 2 OR ar.flag_in_id = 5 OR ar.flag_check_id = 2 OR ar.flag_check_id = 5)
                ORDER BY f.floor_id, r.room_id, u.last_name";
        $stmt = $mysqli->prepare($sql);
        if (!$stmt) json_response(['error' => 'prepare_failed', 'details' => $mysqli->error], 500);
        $stmt->bind_param('s', $today);
        $stmt->execute();
        $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $out = [];
        foreach ($rows as $row) {
            $floorId = (int)($row['floor_id'] ?? 1);
            $roomId = (int)($row['room_id'] ?? 1);
            $y = ($floorId - 1) * 3.5;
            $roomIndex = $roomId - 1;
            if ($roomIndex < 0) $roomIndex = 0;
            $x = ($roomIndex % 5) * 2.5 - 5.0;
            $z = (int)($roomIndex / 5) * 2.5 - 2.5;
            $out[] = [
                'user_id' => (int)$row['user_id'],
                'first_name' => $row['first_name'] ?? '',
                'last_name' => $row['last_name'] ?? '',
                'room_id' => (int)$row['room_id'],
                'room_name' => $row['room_name'] ?? '',
                'floor_id' => $floorId,
                'floor_name' => $row['floor_name'] ?? '',
                'position_x' => round($x, 2),
                'position_y' => round($y, 2),
                'position_z' => round($z, 2),
            ];
        }
        json_response($out);
        break;

    default:
        // This case should ideally not be reached if the main index.php router is correct
        json_response(['error' => 'Endpoint not found in main API file.'], 404);
        break;
}

