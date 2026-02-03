// filepath: e:\Altitude\3D-School-Attendance\src\config.js

// We set this to NULL so that api.js uses its smart relative fallback.
// This allows the app to work on localhost AND via the public link.
window.API_BASE = null;

// If you really want to keep it, use a relative path like this:
// window.API_BASE = '../server-php/index.php/api';

// WebSocket: by default the app connects to ws://host:8081 only on localhost.
// To enable WebSocket on other hosts (e.g. dev tunnel), set: window.WS_ALWAYS = true;