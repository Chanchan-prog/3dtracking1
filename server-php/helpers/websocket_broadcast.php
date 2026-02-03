<?php
// server-php/helpers/websocket_broadcast.php
// Notify WebSocket clients (optional; fails silently if WS server is not running).

function notify_ws_broadcast($type, $payload = []) {
    static $url = null;
    if ($url === null) {
        $sec = [];
        if (file_exists(__DIR__ . '/../config/security.php')) {
            $sec = require __DIR__ . '/../config/security.php';
        }
        $url = isset($sec['ws_broadcast_url']) ? trim((string)$sec['ws_broadcast_url']) : '';
    }
    if ($url === '') return;
    $body = json_encode(['type' => $type, 'payload' => $payload]);
    $ctx = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/json\r\nContent-Length: " . strlen($body) . "\r\n",
            'content' => $body,
            'timeout' => 2.0,
            'ignore_errors' => true,
        ],
    ]);
    @file_get_contents($url, false, $ctx);
}
