import React from 'react';
import { WebSocketContext } from '../../context/WebSocketContext.jsx';

function ThreeDBuildingIndex() {
  const wsContext = React.useContext(WebSocketContext);
  const wsSubscribe = wsContext ? wsContext.subscribe : () => () => {};
  const resolveServerRoot = () => {
    if (typeof window === 'undefined') return '';
    const origin = window.location.origin || '';
    const href = window.location.href || '';
    if (!origin || origin === 'null' || href.startsWith('file:')) return 'http://localhost/server-php';
    try {
      const apiBase = window.API_BASE || '../server-php/index.php/api';
      let base = new URL(apiBase, href).href;
      base = base.replace(/\/?index\.php\/api\/?$/i, '').replace(/\/?api\/?$/, '').replace(/\/$/, '');
      if (base.startsWith('http')) return base;
      return origin + (base.startsWith('/') ? base : '/' + base);
    } catch (e) {
      return origin + '/server-php';
    }
  };
  const serverRoot = resolveServerRoot();
  const modelBase = serverRoot ? (serverRoot + '/3dbuilding/') : '';
  const defaultModel = modelBase ? (modelBase + 'building2withroom.glb') : '';
  const building2Model = modelBase ? (modelBase + 'building2.glb') : '';
  const building2WithRoomModel = modelBase ? (modelBase + 'building2withroom.glb') : '';
  const fallbackModel = (typeof window !== 'undefined' && window.location.origin && window.location.origin !== 'null' ? window.location.origin : 'http://localhost') + '/server-php/3dbuilding/building2withroom.glb';
  const buildingOptions = [
    { value: 'MW', label: 'MW', src: defaultModel || building2WithRoomModel },
    { value: 'building2', label: 'building2', src: building2Model },
    { value: 'building2withroom', label: 'building2 (with rooms)', src: building2WithRoomModel },
    { value: 'shs', label: 'SHS', src: building2WithRoomModel },
    { value: 'custom', label: 'Custom URL', src: null },
  ];
  const toAbsoluteModelUrl = (url) => {
    if (!url || typeof url !== 'string') return fallbackModel;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (typeof window === 'undefined') return url;
    try {
      return new URL(url, window.location.href).href;
    } catch (e) {
      return url;
    }
  };
  const initialModelSrc = toAbsoluteModelUrl(building2WithRoomModel || building2Model || fallbackModel);
  const [selectedBuilding, setSelectedBuilding] = React.useState('building2withroom');
  const [modelSrc, setModelSrc] = React.useState(initialModelSrc);
  const [status, setStatus] = React.useState('loading');
  const [message, setMessage] = React.useState('');
  const [modelViewerReady, setModelViewerReady] = React.useState(false);
  const [customUrl, setCustomUrl] = React.useState('');
  const viewerRef = React.useRef(null);
  const viewerContainerRef = React.useRef(null);
  const [yawOffset, setYawOffset] = React.useState(0);
  const [modelScale, setModelScale] = React.useState(1);
  const [autoRotate, setAutoRotate] = React.useState(true);
  const [fullscreen, setFullscreen] = React.useState(false);
  const [floorView, setFloorView] = React.useState(false);
  const [recentLogs, setRecentLogs] = React.useState([]);
  const [presentInBuilding, setPresentInBuilding] = React.useState([]);
  const defaultZoomFactor = 0.18;
  const viewOrbits = React.useMemo(() => ({
    front: '0deg 82deg auto',
    back: '180deg 82deg auto',
    left: '90deg 82deg auto',
    right: '-90deg 82deg auto',
    top: '0deg 0deg auto'
  }), []);
  const applyView = React.useCallback((key, zoomFactor = defaultZoomFactor) => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const orbit = viewOrbits[key] || viewOrbits.front;
    viewer.cameraTarget = '0m 0m 0m';
    viewer.cameraOrbit = orbit;
    const zoomIn = () => {
      if (typeof viewer.getCameraOrbit !== 'function') {
        if (typeof viewer.jumpCameraToGoal === 'function') viewer.jumpCameraToGoal();
        return;
      }
      const current = viewer.getCameraOrbit();
      if (!current || !current.radius) return;
      const radius = Math.max(current.radius * zoomFactor, 0.1);
      viewer.cameraOrbit = `${current.theta}rad ${current.phi}rad ${radius}m`;
      if (typeof viewer.jumpCameraToGoal === 'function') viewer.jumpCameraToGoal();
    };
    requestAnimationFrame(zoomIn);
  }, [viewOrbits, defaultZoomFactor]);

  const rotateModel = (delta) => {
    setYawOffset(prev => {
      const next = (prev + delta) % 360;
      return next < 0 ? next + 360 : next;
    });
  };

  const clampScale = (value) => Math.min(100, Math.max(0.1, value));
  const adjustScale = (delta) => {
    setModelScale(prev => clampScale(Number((prev + delta).toFixed(2))));
  };

  const toggleFullscreen = () => {
    const el = viewerContainerRef.current;
    if (!el) return;
    if (!fullscreen) {
      if (el.requestFullscreen) el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
    setFullscreen(!fullscreen);
  };

  React.useEffect(() => {
    const onFullscreenChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
    };
  }, []);

  const apiGet = (typeof window !== 'undefined' && window.apiGet) ? window.apiGet : null;

  const fetchRecentLogs = React.useCallback(() => {
    if (!apiGet) return;
    apiGet('dashboard/full').then((data) => {
      const list = (data && data.recent_attendance) ? data.recent_attendance : [];
      setRecentLogs(Array.isArray(list) ? list.slice(0, 10) : []);
    }).catch(() => setRecentLogs([]));
  }, [apiGet]);

  const fetchPresentInBuilding = React.useCallback(() => {
    if (!apiGet) return;
    apiGet('present-in-building').then((list) => {
      setPresentInBuilding(Array.isArray(list) ? list : []);
    }).catch(() => setPresentInBuilding([]));
  }, [apiGet]);

  React.useEffect(() => {
    if (!apiGet) { setRecentLogs([]); return; }
    fetchRecentLogs();
  }, [apiGet, fetchRecentLogs]);

  const showHotspots = modelSrc && (modelSrc.includes('building2') || modelSrc.includes('building2withroom'));
  React.useEffect(() => {
    if (!showHotspots) {
      setPresentInBuilding([]);
      return;
    }
    if (!apiGet) return;
    fetchPresentInBuilding();
  }, [showHotspots, apiGet, fetchPresentInBuilding]);

  // Real-time: refetch recent logs and present-in-building on attendance/schedule updates
  React.useEffect(() => {
    const unsubAtt = wsSubscribe('attendance_update', () => { fetchRecentLogs(); fetchPresentInBuilding(); });
    const unsubSched = wsSubscribe('schedule_update', () => { fetchRecentLogs(); fetchPresentInBuilding(); });
    return () => { unsubAtt?.(); unsubSched?.(); };
  }, [wsSubscribe, fetchRecentLogs, fetchPresentInBuilding]);

  const getStatusFromFlag = (flagInId) => {
    const id = Number(flagInId);
    if (id === 2) return 'present';
    if (id === 5) return 'late';
    return 'absent';
  };

  React.useEffect(() => {
    if (typeof customElements === 'undefined') return;
    if (customElements.get('model-viewer')) {
      setModelViewerReady(true);
      return;
    }
    customElements.whenDefined('model-viewer').then(() => setModelViewerReady(true)).catch(() => setModelViewerReady(true));
  }, []);

  React.useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !modelSrc) return;
    setStatus('loading');
    setMessage('');
    const handleLoad = () => {
      setStatus('ready');
      setMessage('');
      applyView('front');
    };
    const handleError = (e) => {
      setStatus('error');
      setMessage('Failed to load the model. Try "Fallback" or paste a direct .glb URL in Custom URL.');
    };
    viewer.addEventListener('load', handleLoad);
    viewer.addEventListener('error', handleError);
    return () => {
      viewer.removeEventListener('load', handleLoad);
      viewer.removeEventListener('error', handleError);
    };
  }, [modelSrc, applyView]);

  React.useEffect(() => {
    if (selectedBuilding === 'custom') return;
    setStatus('loading');
    setMessage('');
    if (selectedBuilding === 'MW') {
      setModelSrc(defaultModel || building2WithRoomModel);
    } else if (selectedBuilding === 'building2') {
      setModelSrc(building2Model);
    } else if (selectedBuilding === 'building2withroom' || selectedBuilding === 'shs') {
      setModelSrc(building2WithRoomModel);
    }
  }, [selectedBuilding, defaultModel, building2Model, building2WithRoomModel]);

  const applyCustomModel = () => {
    const next = customUrl.trim();
    if (!next) return;
    setSelectedBuilding('custom');
    setStatus('loading');
    setMessage('');
    setModelSrc(next);
  };

  const selectBuilding = (value) => {
    setSelectedBuilding(value);
    if (value === 'MW') setModelSrc(defaultModel);
    else if (value === 'building2') setModelSrc(building2Model);
    else if (value === 'building2withroom' || value === 'shs') setModelSrc(building2WithRoomModel);
  };

  const useDefaultModel = () => selectBuilding('MW');
  const useFallbackModel = () => {
    setModelSrc(fallbackModel);
    setStatus('fallback');
    setMessage('');
  };

  const buttonStyle = (variant = 'secondary') => ({
    padding: '6px 12px',
    borderRadius: 8,
    border: variant === 'primary' ? 'none' : '1px solid #d1d5db',
    background: variant === 'primary' ? '#22c55e' : '#ffffff',
    color: variant === 'primary' ? '#fff' : '#374151',
    fontSize: 12,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    cursor: 'pointer',
    fontWeight: variant === 'primary' ? 600 : 400,
  });

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          background: '#ffffff',
          borderRadius: 12,
          boxShadow: '0 12px 30px rgba(15,23,42,0.08)',
          padding: 20,
          border: '1px solid #e5e7eb',
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 22 }}>3D Building Viewer</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>
            Explore the campus building and view attendance status at a glance.
          </p>
        </div>

        {message && (
          <div
            style={{
              marginBottom: 12,
              padding: '8px 12px',
              borderRadius: 8,
              background: status === 'error' ? '#fef2f2' : '#fffbeb',
              border: `1px solid ${status === 'error' ? '#fecaca' : '#fde68a'}`,
              color: status === 'error' ? '#b91c1c' : '#92400e',
              fontSize: 12,
            }}
          >
            {message}
          </div>
        )}

        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 0', minWidth: 280 }}>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
                marginBottom: 10,
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginRight: 4 }}>Building</span>
              <select
                value={selectedBuilding}
                onChange={(e) => selectBuilding(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 8,
                  border: '1px solid #d1d5db',
                  fontSize: 12,
                  background: '#fff',
                  minWidth: 120,
                }}
              >
                {buildingOptions.filter((o) => o.value !== 'custom').map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
                <option value="custom">Custom URL</option>
              </select>
              {selectedBuilding === 'custom' && (
                <>
                  <input
                    placeholder="Paste model URL"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    style={{
                      width: 200,
                      padding: '6px 10px',
                      borderRadius: 8,
                      border: '1px solid #d1d5db',
                      fontSize: 12,
                    }}
                  />
                  <button type="button" onClick={applyCustomModel} style={buttonStyle('primary')}>Load</button>
                </>
              )}
              <button type="button" onClick={() => adjustScale(-0.5)} style={buttonStyle()}>−</button>
              <span style={{ fontSize: 12, color: '#6b7280' }}>{modelScale}x</span>
              <button type="button" onClick={() => adjustScale(0.5)} style={buttonStyle()}>+</button>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, cursor: 'pointer' }}>
                <input type="checkbox" checked={autoRotate} onChange={(e) => setAutoRotate(e.target.checked)} />
                Auto-rotate
              </label>
              <button type="button" onClick={toggleFullscreen} style={buttonStyle()}>
                <span className="bi bi-fullscreen" />
              </button>
            </div>

            <div
              ref={viewerContainerRef}
              style={{
                position: 'relative',
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                overflow: 'hidden',
                background: '#0f1116',
                minHeight: 380,
              }}
            >
              {status === 'loading' && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(15,17,22,0.9)',
                    zIndex: 2,
                    borderRadius: 12,
                  }}
                >
                  <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Loading model...</div>
                </div>
              )}
              {modelViewerReady && modelSrc ? (
                <model-viewer
                  key={modelSrc}
                  ref={viewerRef}
                  src={toAbsoluteModelUrl(modelSrc)}
                  alt="3D Building"
                  camera-controls
                  camera-orbit="0deg 75deg auto"
                  camera-target="0m 0m 0m"
                  field-of-view="30deg"
                  orientation={`0deg ${yawOffset}deg 0deg`}
                  scale={`${modelScale} ${modelScale} ${modelScale}`}
                  auto-rotate={autoRotate}
                  shadow-intensity="1"
                  exposure="1"
                  loading="eager"
                  style={{ width: '100%', height: '65vh', minHeight: 380, background: '#111', display: 'block' }}
                >
                  {showHotspots && presentInBuilding.map((p, i) => {
                    const pos = `${p.position_x}m ${p.position_y}m ${p.position_z}m`;
                    const name = [p.first_name, p.last_name].filter(Boolean).join(' ');
                    const label = name ? `${name} — ${p.room_name} (${p.floor_name})` : `${p.room_name} (${p.floor_name})`;
                    return (
                      <button
                        key={`${p.user_id}-${p.room_id}-${i}`}
                        slot="hotspot"
                        data-position={pos}
                        data-normal="0m 1m 0m"
                        title={label}
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          border: '2px solid #22c55e',
                          background: 'rgba(34, 197, 94, 0.9)',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          padding: 0,
                          fontSize: 20,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        }}
                      >
                        <span className="bi bi-person-fill" aria-hidden />
                      </button>
                    );
                  })}
                </model-viewer>
              ) : (
                <div style={{ color: '#9ca3af', padding: 40, textAlign: 'center', minHeight: 380 }}>
                  {!modelViewerReady ? 'Loading 3D viewer…' : 'Loading model…'}
                </div>
              )}
            </div>

            <div
              style={{
                marginTop: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                padding: '12px 20px',
                background: '#f8fafc',
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                width: '100%',
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Floor View</span>
              <button
                type="button"
                role="switch"
                aria-checked={floorView}
                onClick={() => setFloorView((v) => !v)}
                style={{
                  width: 48,
                  height: 26,
                  borderRadius: 13,
                  border: '1px solid #d1d5db',
                  background: floorView ? '#22c55e' : '#e5e7eb',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 0.2s',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: 2,
                    left: floorView ? 24 : 2,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#fff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    transition: 'left 0.2s',
                  }}
                />
              </button>
            </div>
          </div>

          <div
            style={{
              width: 280,
              flexShrink: 0,
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              padding: 16,
              boxShadow: '0 4px 12px rgba(15,23,42,0.06)',
              alignSelf: 'flex-start',
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: '#111827' }}>Legend</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#374151' }}>Present</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#eab308', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#374151' }}>Late</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#374151' }}>Absent</span>
              </div>
            </div>

            <div style={{ fontWeight: 600, fontSize: 14, marginTop: 20, marginBottom: 10, color: '#111827' }}>Recent Logs</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentLogs.length === 0 ? (
                <div style={{ fontSize: 12, color: '#9ca3af' }}>No recent activity</div>
              ) : (
                recentLogs.map((log, idx) => {
                  const statusType = getStatusFromFlag(log.flag_in_id);
                  const color = statusType === 'present' ? '#22c55e' : statusType === 'late' ? '#eab308' : '#ef4444';
                  const name = [log.first_name, log.last_name].filter(Boolean).join(' ');
                  const displayName = name || '—';
                  return (
                    <div key={log.attendance_id || idx} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: '#e5e7eb',
                          flexShrink: 0,
                          border: `2px solid ${color}`,
                        }}
                      />
                      <span style={{ fontSize: 13, color: '#374151' }}>{displayName}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThreeDBuildingIndex;
