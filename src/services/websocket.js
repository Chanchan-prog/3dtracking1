/**
 * Shared WebSocket client for real-time updates.
 * Connects to ws://host:8081 (or wss://). Supports event types: attendance_update, schedule_update, dashboard_full.
 * Falls back to polling if WS is not available.
 */
const WS_PORT = 8081;
const FALLBACK_POLL_MS = 15000;

let socket = null;
let reconnectTimer = null;
let pollCallback = null;
let subscribers = new Map(); // type -> Set<callback>
let connectionState = 'closed'; // 'closed' | 'connecting' | 'open'
let lastMessage = null;

function getWsUrl() {
  if (typeof window === 'undefined') return null;
  const host = window.location.hostname || 'localhost';
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${host}:${WS_PORT}`;
}

function setState(state) {
  if (connectionState === state) return;
  connectionState = state;
  subscribers.get('*')?.forEach((cb) => { try { cb(state); } catch (e) {} });
}

function notifySubscribers(type, payload) {
  lastMessage = { type, payload };
  subscribers.get(type)?.forEach((cb) => { try { cb(payload); } catch (e) {} });
  subscribers.get('*')?.forEach((cb) => { try { cb({ type, payload }); } catch (e) {} });
}

function connect() {
  const url = getWsUrl();
  if (!url) return;
  if (socket && (socket.readyState === 0 || socket.readyState === 1)) return;
  setState('connecting');
  try {
    socket = new WebSocket(url);
    socket.onopen = () => { setState('open'); };
    socket.onclose = () => {
      setState('closed');
      socket = null;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(connect, 5000);
      if (pollCallback) pollCallback();
    };
    socket.onerror = () => { setState('closed'); };
    socket.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (data && data.type) notifySubscribers(data.type, data.payload != null ? data.payload : {});
      } catch (e) {}
    };
  } catch (e) {
    setState('closed');
    if (pollCallback) pollCallback();
  }
}

function disconnect() {
  if (reconnectTimer) clearTimeout(reconnectTimer);
  reconnectTimer = null;
  if (socket) {
    try { socket.close(); } catch (e) {}
    socket = null;
  }
  setState('closed');
}

/**
 * @param {string} type - Event type: 'attendance_update' | 'schedule_update' | 'dashboard_full' | '*'
 * @param {function} callback - (payload) => {} or for '*' (state) => {}
 * @returns {function} unsubscribe
 */
function subscribe(type, callback) {
  if (!subscribers.has(type)) subscribers.set(type, new Set());
  subscribers.get(type).add(callback);
  return () => subscribers.get(type)?.delete(callback);
}

/**
 * Call when WS is not available so UI can fall back to polling.
 * @param {function} callback
 */
function setPollFallback(callback) {
  pollCallback = callback;
}

function getConnectionState() {
  return connectionState;
}

function getLastMessage() {
  return lastMessage;
}

/**
 * Attempt to connect. Call once when app loads (e.g. from WebSocketProvider).
 * Only connects when host is localhost/127.0.0.1 unless WS_ALWAYS is set.
 */
function init() {
  if (typeof window === 'undefined') return;
  const host = window.location.hostname || 'localhost';
  const allow = host === 'localhost' || host === '127.0.0.1' || host === '::1' || window.WS_ALWAYS;
  if (!allow) return;
  connect();
}

export default {
  init,
  connect,
  disconnect,
  subscribe,
  setPollFallback,
  getConnectionState,
  getLastMessage,
  getWsUrl,
  WS_PORT,
  FALLBACK_POLL_MS,
};
