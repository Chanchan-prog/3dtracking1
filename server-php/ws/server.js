/**
 * WebSocket server with HTTP broadcast endpoint.
 * - WebSocket: connect to ws://host:8081/ (or wss:// for TLS).
 * - PHP/backend: POST http://host:8081/broadcast with JSON body { type, payload }
 *   to push events to all connected clients.
 */
const http = require('http');
const { WebSocketServer } = require('ws');

const PORT = parseInt(process.env.WS_PORT || '8081', 10);

const server = http.createServer((req, res) => {
  // CORS for broadcast endpoint (PHP from same host)
  const origin = req.headers.origin;
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  // GET /broadcast or GET / → friendly info (avoids "invalid response" in browser)
  if (req.method === 'GET' && (req.url === '/broadcast' || req.url === '/')) {
    const info = {
      service: 'WebSocket broadcast server',
      websocket: 'ws://localhost:' + PORT + '/',
      broadcast: 'POST http://127.0.0.1:' + PORT + '/broadcast with JSON body: { "type": "event_name", "payload": {} }',
      clients: wss.clients.size,
    };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(info, null, 2));
    return;
  }

  if (req.method === 'POST' && req.url === '/broadcast') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      let data = { type: 'event', payload: {} };
      try {
        if (body) data = JSON.parse(body);
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
        return;
      }
      const msg = JSON.stringify({ type: data.type || 'event', payload: data.payload != null ? data.payload : {} });
      wss.clients.forEach((client) => {
        if (client.readyState === 1) client.send(msg);
      });
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin || '*',
      });
      res.end(JSON.stringify({ ok: true, clients: wss.clients.size }));
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

wss.on('connection', (ws, req) => {
  ws.on('message', (data) => {
    try {
      const obj = JSON.parse(data.toString());
      if (obj.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
      }
    } catch (e) {
      // ignore non-JSON
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('WebSocket server listening on port', PORT);
  console.log('  WS: ws://localhost:' + PORT + '/');
  console.log('  Broadcast: POST http://localhost:' + PORT + '/broadcast');
});
