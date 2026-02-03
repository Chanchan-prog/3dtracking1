import React from 'react';

const WebSocketContext = React.createContext({
  connected: false,
  subscribe: () => () => {},
  setPollFallback: () => {},
  fallbackPollMs: 15000,
  getConnectionState: () => 'closed',
  lastEvent: null,
  init: () => {},
});

const noopWs = {
  init: () => {},
  getConnectionState: () => 'closed',
  getLastMessage: () => null,
  subscribe: () => () => {},
  setPollFallback: () => {},
  FALLBACK_POLL_MS: 15000,
};

function WebSocketProvider({ children }) {
  const [wsModule, setWsModule] = React.useState(null);
  const [connected, setConnected] = React.useState(false);
  const [lastEvent, setLastEvent] = React.useState(null);

  React.useEffect(() => {
    import('../services/websocket.js').then((m) => {
      const ws = m.default;
      setWsModule(ws);
      ws.init();
      setConnected(ws.getConnectionState() === 'open');
      setLastEvent(ws.getLastMessage());
    }).catch(() => {
      setWsModule(noopWs);
    });
  }, []);

  React.useEffect(() => {
    if (!wsModule || wsModule === noopWs) return;
    const unsub = wsModule.subscribe('*', (arg) => {
      if (typeof arg === 'string') setConnected(arg === 'open');
      else if (arg && typeof arg === 'object' && arg.payload !== undefined) setLastEvent(arg);
    });
    return () => { unsub?.(); };
  }, [wsModule]);

  const subscribe = React.useCallback((type, callback) => {
    if (!wsModule) return () => {};
    return wsModule.subscribe(type, callback);
  }, [wsModule]);

  const setPollFallback = React.useCallback((cb) => {
    if (wsModule && wsModule.setPollFallback) wsModule.setPollFallback(cb);
  }, [wsModule]);

  const value = React.useMemo(() => ({
    connected,
    subscribe,
    setPollFallback,
    fallbackPollMs: (wsModule && wsModule.FALLBACK_POLL_MS) || 15000,
    lastEvent,
    init: wsModule ? wsModule.init : () => {},
    getConnectionState: wsModule ? wsModule.getConnectionState : () => 'closed',
  }), [connected, subscribe, setPollFallback, lastEvent, wsModule]);

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export { WebSocketContext, WebSocketProvider };
