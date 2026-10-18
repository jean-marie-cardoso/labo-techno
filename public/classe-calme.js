/* Classe calme : alertes, consignes, minuteur et correction, sans données d'élève. */
(() => {
  'use strict';
  if (window.__laboClasseCalmeLoaded) return;
  window.__laboClasseCalmeLoaded = true;

  const RELAY_WS = 'wss://classe-calme-relay.cardosojm.workers.dev/live';
  const MAX_LIFETIME = 35000;
  const MAX_TIMER_LIFETIME = 180 * 60000;
  const DEFAULT_MESSAGE = 'MOINS DE BRUIT, MERCI.';
  const scriptBase = new URL('.', document.currentScript.src);
  const CORRECTION_VERSION = '20261018-1';
  let socket = null;
  let retryTimer = null;
  let expiryTimer = null;
  let retryCount = 0;
  let suspended = false;
  let expiresAt = 0;
  let currentState = null;
  let lastStateAt = 0;
  let host = null;
  let signal = null;
  let text = null;
  let timerBadge = null;
  let timerLabel = null;
  let timerValue = null;
  let correctionReleased = false;
  let correctionVersion = 0;
  let correctionViewer = null;
  let correctionModule = null;

  function setCorrection(released) {
    const id = activityId();
    released = released && /^(?:[345]\/\d{2}|bonus\/[345]-\d{2})$/.test(id);
    if (released === correctionReleased) return;
    correctionReleased = released;
    const version = ++correctionVersion;
    if (!released) {
      correctionViewer?.destroy();
      correctionViewer = null;
      return;
    }
    const url = new URL('correction-viewer.js', scriptBase);
    url.searchParams.set('v', CORRECTION_VERSION);
    correctionModule ??= import(url.href).catch(error => { correctionModule = null; throw error; });
    correctionModule.then(module => {
      if (!correctionReleased || version !== correctionVersion) return;
      const relay = new URL(RELAY_WS.replace(/^ws/, 'http'));
      const endpoint = new URL('/correction', relay);
      const channel = relay.searchParams.get('channel');
      if (channel && /^test-[a-z0-9-]{8,70}$/.test(channel)) endpoint.searchParams.set('channel', channel);
      endpoint.searchParams.set('activity', id);
      correctionViewer = module.createCorrectionViewer({ endpoint: endpoint.href });
    }).catch(() => {
      // Une prochaine information du professeur relancera le chargement.
      if (version === correctionVersion) correctionReleased = false;
    });
  }

  function activityId() {
    // Seulement le chemin de l'activité : aucune donnée du formulaire, de l'URL ou de l'élève.
    const guide = document.querySelector('meta[name="classe-calme-activity"]')?.content;
    if (/^(projets|exposes)\/[345]$/.test(guide || '')) return guide;
    const marker = '/labo-techno/';
    const pathname = location.pathname;
    const start = pathname.indexOf(marker);
    if (start < 0) return 'autre';
    const path = pathname.slice(start + marker.length).replace(/(?:^|\/)index\.html$/, '').replace(/^\/+|\/+$/g, '');
    if (!path) return 'accueil';
    const legacy = path.match(/^([345])e-(\d{2})\.html$/);
    if (legacy) return `${legacy[1]}/${legacy[2]}`;
    const id = path.replace(/\.html$/, '');
    return id.length <= 64 && /^[a-z0-9][a-z0-9-]*(?:\/[a-z0-9][a-z0-9-]*){0,2}$/.test(id) ? id : 'autre';
  }

  function makeSignal() {
    if (host) return;
    host = document.createElement('div');
    host.id = 'labo-classe-calme';
    host.style.cssText = 'all:initial!important;position:fixed!important;inset:0!important;z-index:2147483647!important;pointer-events:none!important;display:none!important;';
    host.setAttribute('aria-hidden', 'true');
    const root = host.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>
      :host{color-scheme:light}
      *{box-sizing:border-box}
      .signal{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:clamp(24px,6vw,100px);font-family:Arial,Helvetica,sans-serif;text-align:center;color:#fff;background:#b81220}
      .message{margin:0;max-width:18ch;font-size:clamp(32px,8vw,112px);font-weight:900;line-height:1.08;overflow-wrap:anywhere;text-wrap:balance;text-shadow:0 2px 8px #59030a}
      .border{background:transparent;box-shadow:inset 0 0 0 clamp(12px,2.3vw,36px) #d91a2b}
      .border .message{position:absolute;top:clamp(12px,2.3vw,36px);left:50%;transform:translateX(-50%);padding:10px 22px;border-radius:0 0 16px 16px;background:#b81220;font-size:clamp(20px,3vw,42px);max-width:90%;width:max-content}
      .notice{inset:20px 20px auto;padding:clamp(20px,4vw,48px);border:3px solid #b9e8d5;border-radius:20px;background:#08664b;box-shadow:0 8px 32px #002a2738}
      .notice .message{max-width:32ch;font-size:clamp(28px,5vw,64px);text-shadow:none}
      .timer{position:absolute;right:max(16px,env(safe-area-inset-right));bottom:max(16px,env(safe-area-inset-bottom));display:flex;align-items:center;gap:12px;max-width:calc(100% - 32px);padding:12px 18px;border:1px solid #cbd5e1;border-radius:16px;background:#fff;color:#142335;box-shadow:0 4px 20px #14233529;font-family:Arial,Helvetica,sans-serif}
      .timer-label{font-size:13px;font-weight:700;line-height:1.2}
      .timer-value{font-size:clamp(25px,4vw,36px);line-height:1;font-weight:800;font-variant-numeric:tabular-nums;white-space:nowrap}
      .timer.finished{background:#fff2ec;border-color:#efbaa2;color:#8b2907}
      .signal[hidden],.timer[hidden]{display:none}
      .pulse{animation:classe-calme-pulse 2.8s ease-in-out infinite}
      @keyframes classe-calme-pulse{0%,100%{opacity:1}50%{opacity:.82}}
      @media(prefers-reduced-motion:reduce){.pulse{animation:none}}
    </style><div class="signal" role="alert" aria-live="assertive" aria-atomic="true" hidden><p class="message"></p></div><div class="timer" role="timer" aria-live="off" aria-atomic="true" hidden><span class="timer-label"></span><span class="timer-value"></span></div>`;
    signal = root.querySelector('.signal');
    text = root.querySelector('.message');
    timerBadge = root.querySelector('.timer');
    timerLabel = root.querySelector('.timer-label');
    timerValue = root.querySelector('.timer-value');
    placeSignal();
  }

  function placeSignal() {
    if (!host) return;
    const parent = document.fullscreenElement || document.body || document.documentElement;
    if (host.parentNode !== parent) parent.appendChild(host);
  }

  function hideSignal() {
    clearTimeout(expiryTimer);
    expiryTimer = null;
    expiresAt = 0;
    currentState = null;
    setCorrection(false);
    if (host) {
      host.style.setProperty('display', 'none', 'important');
      if (host.getAttribute('aria-hidden') !== 'true') host.setAttribute('aria-hidden', 'true');
    }
  }

  function renderSignal() {
    clearTimeout(expiryTimer);
    expiryTimer = null;
    const now = performance.now();
    if (!currentState || expiresAt <= now) {
      hideSignal();
      return;
    }
    const alarm = currentState.alarm;
    const notice = currentState.notice?.expiresAt > now ? currentState.notice : null;
    const timer = currentState.timer;
    const correction = currentState.correction;
    setCorrection(correction);
    if (!alarm && !notice && !timer && !correction) {
      hideSignal();
      return;
    }
    if (!alarm && !notice && !timer) {
      if (host) {
        host.style.setProperty('display', 'none', 'important');
        host.setAttribute('aria-hidden', 'true');
      }
      expiryTimer = setTimeout(renderSignal, Math.max(0, expiresAt - now));
      return;
    }
    makeSignal();
    placeSignal();
    signal.hidden = !alarm && !notice;
    const className = alarm ? `signal${currentState.mode === 'border' ? ' border' : ''}${currentState.pulse ? ' pulse' : ''}` : 'signal notice';
    if (signal.className !== className) signal.className = className;
    const role = alarm ? 'alert' : 'status';
    const live = alarm ? 'assertive' : 'polite';
    if (signal.getAttribute('role') !== role) signal.setAttribute('role', role);
    if (signal.getAttribute('aria-live') !== live) signal.setAttribute('aria-live', live);
    const message = alarm ? currentState.message : notice?.text || '';
    if (text.textContent !== message) text.textContent = message;
    timerBadge.hidden = !timer;
    if (timer) {
      const remaining = timer.state === 'running' ? Math.max(0, timer.expiresAt - now) : timer.remainingMs;
      const finished = timer.state === 'finished' || (timer.state === 'running' && remaining === 0);
      const label = finished ? 'Temps écoulé' : timer.state === 'paused' ? 'En pause' : 'Temps restant';
      const seconds = Math.ceil(remaining / 1000);
      const value = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
      timerBadge.classList.toggle('finished', finished);
      if (timerLabel.textContent !== label) timerLabel.textContent = label;
      if (timerValue.textContent !== value) timerValue.textContent = value;
    }
    if (host.getAttribute('aria-hidden') !== 'false') {
      host.style.setProperty('display', 'block', 'important');
      host.setAttribute('aria-hidden', 'false');
    }
    let nextDeadline = notice ? Math.min(expiresAt, notice.expiresAt) : expiresAt;
    if (timer?.state === 'running' && timer.expiresAt > now) nextDeadline = Math.min(nextDeadline, now + 250, timer.expiresAt);
    expiryTimer = setTimeout(renderSignal, Math.max(0, nextDeadline - now));
  }

  function receiveState(event) {
    if (typeof event.data !== 'string' || event.data.length > 4096) return;
    let state;
    try { state = JSON.parse(event.data); } catch (_) { return; }
    if (!state || state.type !== 'state' || state.v !== 1 ||
        typeof state.active !== 'boolean' || typeof state.alarm !== 'boolean') return;
    lastStateAt = performance.now();
    retryCount = 0;
    if (!state.active) {
      hideSignal();
      return;
    }
    if (typeof state.remainingMs !== 'number' || !Number.isFinite(state.remainingMs) ||
        (state.mode !== 'cover' && state.mode !== 'border') ||
        typeof state.pulse !== 'boolean' || (state.message !== undefined && typeof state.message !== 'string')) return;
    if (state.remainingMs <= 0) {
      hideSignal();
      return;
    }
    const lifetime = Math.min(MAX_LIFETIME, state.remainingMs);
    const now = performance.now();
    const validNotice = state.notice && typeof state.notice.text === 'string' && state.notice.text.trim() &&
      typeof state.notice.remainingMs === 'number' && Number.isFinite(state.notice.remainingMs) && state.notice.remainingMs > 0;
    const validTimer = state.timer && ['running', 'paused', 'finished'].includes(state.timer.state) &&
      typeof state.timer.remainingMs === 'number' && Number.isFinite(state.timer.remainingMs) &&
      state.timer.remainingMs >= 0 && state.timer.remainingMs <= MAX_TIMER_LIFETIME &&
      (state.timer.state !== 'finished' || state.timer.remainingMs === 0);
    currentState = {
      alarm: state.alarm,
      mode: state.mode,
      pulse: state.pulse,
      message: (state.message || DEFAULT_MESSAGE).trim().slice(0, 120) || DEFAULT_MESSAGE,
      notice: validNotice ? { text: state.notice.text.trim().slice(0, 180), expiresAt: now + Math.min(lifetime, state.notice.remainingMs) } : null,
      timer: validTimer ? { state: state.timer.state, remainingMs: state.timer.remainingMs, expiresAt: now + state.timer.remainingMs } : null,
      correction: state.correction === true
    };
    expiresAt = now + lifetime;
    renderSignal();
  }

  function closeSocket() {
    const oldSocket = socket;
    socket = null;
    if (!oldSocket) return;
    oldSocket.onopen = oldSocket.onmessage = oldSocket.onerror = oldSocket.onclose = null;
    try { oldSocket.close(); } catch (_) { /* L'activité reste autonome. */ }
  }

  function retry() {
    if (suspended || retryTimer !== null || navigator.onLine === false) return;
    const base = Math.min(30000, 1000 * 2 ** Math.min(retryCount++, 5));
    const delay = Math.min(30000, base * (.8 + Math.random() * .4));
    retryTimer = setTimeout(() => {
      retryTimer = null;
      connect();
    }, delay);
  }

  function connectionLost(currentSocket) {
    if (socket !== currentSocket) return;
    hideSignal();
    closeSocket();
    retry();
  }

  function connect() {
    if (suspended || socket || typeof WebSocket === 'undefined' || navigator.onLine === false) return;
    clearTimeout(retryTimer);
    retryTimer = null;
    try {
      const url = new URL(RELAY_WS);
      url.searchParams.set('activity', activityId());
      const currentSocket = new WebSocket(url.href);
      socket = currentSocket;
      currentSocket.onmessage = event => {
        if (socket === currentSocket) receiveState(event);
      };
      currentSocket.onerror = () => connectionLost(currentSocket);
      currentSocket.onclose = () => connectionLost(currentSocket);
    } catch (_) {
      hideSignal();
      retry();
    }
  }

  function restart() {
    if (suspended) return;
    clearTimeout(retryTimer);
    retryTimer = null;
    hideSignal();
    closeSocket();
    connect();
  }

  window.addEventListener('pagehide', () => {
    suspended = true;
    clearTimeout(retryTimer);
    retryTimer = null;
    hideSignal();
    closeSocket();
  });
  window.addEventListener('pageshow', () => {
    suspended = false;
    connect();
  });
  window.addEventListener('offline', () => {
    clearTimeout(retryTimer);
    retryTimer = null;
    hideSignal();
    closeSocket();
  });
  window.addEventListener('online', restart);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible' || suspended) return;
    if (expiresAt && performance.now() >= expiresAt) hideSignal();
    if (!socket || socket.readyState > 1 || !lastStateAt || performance.now() - lastStateAt > 15000) restart();
  });
  document.addEventListener('fullscreenchange', placeSignal);
  connect();
})();
