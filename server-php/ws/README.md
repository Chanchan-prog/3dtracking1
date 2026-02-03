# WebSocket server (real-time updates)

This Node.js server provides:

- **WebSocket** on `ws://localhost:8081/` for the frontend to receive real-time events.
- **HTTP broadcast** at `POST http://127.0.0.1:8081/broadcast` for the PHP backend to push events to all connected clients.

## Run

```bash
cd server-php/ws
npm install
npm start
```

Or from project root:

```bash
cd server-php/ws && npm install && npm start
```

## Events

The backend sends:

- `attendance_update` – after check-in / mid-check / check-out.
- `schedule_update` – after schedule create, update, delete, or bulk import.

The frontend (Dashboard, 3D Building) subscribes to these and refetches data when they occur. If the WebSocket server is not running, the app falls back to polling.

## Port

Default port is **8081**. Override with:

```bash
WS_PORT=9090 npm start
```

Set the same in PHP config (`config/security.php` → `ws_broadcast_url`) if you use a different port.
