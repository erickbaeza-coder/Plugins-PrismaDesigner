#!/usr/bin/env node
// ============================================================
// Prisma Sync Dashboard — Local Web App
// Whitelabel UX Team · Cencosud · 2026
//
// Uso: node scripts/dashboard.js
//      npm run dashboard
//
// Qué hace:
//   · Corre un servidor local en http://localhost:7842
//   · Detecta cuando hay internet y corre el sync automáticamente
//   · Notificaciones nativas de macOS cuando hay cambios en Prisma
//   · Dashboard web para ver estado, logs y configuración
// ============================================================

import { readFileSync, writeFileSync, existsSync, appendFileSync } from 'fs';
import { execSync, exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import http from 'http';
import { execFile } from 'child_process';

const __dirname  = dirname(fileURLToPath(import.meta.url));
const ROOT       = join(__dirname, '..');
const SRC        = join(ROOT, 'src');
const CONFIG_FILE = join(__dirname, 'sync.config.json');
const STATE_FILE  = join(__dirname, '.sync-state.json');
const KEYS_FILE   = join(SRC, 'prisma-keys.json');
const LOG_FILE    = join(__dirname, '.sync-log.json');
const PORT        = 7842;

// ── CONFIG ────────────────────────────────────────────────────

function loadConfig() {
  const defaults = {
    figmaToken:          '',
    figmaComponentsKey:  'LnYUTRFuwWpI9phwDCSHOx',
    autoSync:            true,
    requireConfirmation: true,  // pedir confirmación antes de sincronizar
    checkIntervalMin:    5,     // cada cuántos minutos chequea conectividad
    minHoursBetweenSync: 1      // no sincronizar más seguido que esto
  };
  if (!existsSync(CONFIG_FILE)) {
    writeFileSync(CONFIG_FILE, JSON.stringify(defaults, null, 2));
    return defaults;
  }
  return { ...defaults, ...JSON.parse(readFileSync(CONFIG_FILE, 'utf8')) };
}

function saveConfig(cfg) {
  writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2));
}

// ── STATE ─────────────────────────────────────────────────────

function loadState() {
  if (!existsSync(STATE_FILE)) return { lastModified: null, lastSyncDate: null };
  return JSON.parse(readFileSync(STATE_FILE, 'utf8'));
}

function saveState(s) {
  writeFileSync(STATE_FILE, JSON.stringify(s, null, 2));
}

// ── LOG ───────────────────────────────────────────────────────

function loadLog() {
  if (!existsSync(LOG_FILE)) return [];
  try { return JSON.parse(readFileSync(LOG_FILE, 'utf8')); } catch { return []; }
}

function addLog(entry) {
  const logs = loadLog();
  logs.unshift({ ts: new Date().toISOString(), ...entry });
  writeFileSync(LOG_FILE, JSON.stringify(logs.slice(0, 50), null, 2)); // mantener últimos 50
}

// ── FIGMA ─────────────────────────────────────────────────────

async function figmaGet(path, token) {
  const res = await fetch(`https://api.figma.com/v1${path}`, {
    headers: { 'X-Figma-Token': token }
  });
  if (!res.ok) throw new Error(`Figma API ${res.status}`);
  return res.json();
}

function normStr(s) {
  return (s || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

// ── GIT ───────────────────────────────────────────────────────

function git(cmd) {
  return execSync(cmd, { cwd: ROOT, encoding: 'utf8' }).trim();
}

// ── macOS NOTIFICATION ────────────────────────────────────────

function notify(title, msg) {
  try {
    execSync(`osascript -e 'display notification "${msg.replace(/"/g, '\\"')}" with title "${title.replace(/"/g, '\\"')}"'`);
  } catch {}
}

// ── CONNECTIVITY CHECK ────────────────────────────────────────

async function hasInternet() {
  try {
    const res = await fetch('https://api.figma.com', { method: 'HEAD', signal: AbortSignal.timeout(3000) });
    return res.ok || res.status < 500;
  } catch {
    return false;
  }
}

// ── SYNC LOGIC ────────────────────────────────────────────────

let isSyncing = false;
const sseClients = new Set();

function broadcast(data) {
  const msg = `data: ${JSON.stringify(data)}\n\n`;
  for (const res of sseClients) {
    try { res.write(msg); } catch {}
  }
}

async function runSync(manual = false) {
  if (isSyncing) return { status: 'already_running' };
  const cfg   = loadConfig();
  const state = loadState();

  if (!cfg.figmaToken) {
    return { status: 'error', message: 'Figma Token no configurado. Configuralo en el dashboard.' };
  }

  // Respetar intervalo mínimo (excepto sync manual)
  if (!manual && state.lastSyncDate) {
    const hoursSince = (Date.now() - new Date(state.lastSyncDate).getTime()) / 3600000;
    if (hoursSince < cfg.minHoursBetweenSync) {
      return { status: 'skipped', message: `Sync reciente (hace ${hoursSince.toFixed(1)}h)` };
    }
  }

  isSyncing = true;
  broadcast({ type: 'sync_start' });

  try {
    // 1. Obtener info del archivo Figma
    const fileData       = await figmaGet(`/files/${cfg.figmaComponentsKey}?depth=1`, cfg.figmaToken);
    const figmaLastMod   = fileData.lastModified;

    if (!manual && state.lastModified === figmaLastMod) {
      isSyncing = false;
      broadcast({ type: 'sync_done', changed: false });
      return { status: 'no_changes' };
    }

    // 2. Obtener componentes
    const compData   = await figmaGet(`/files/${cfg.figmaComponentsKey}/components`, cfg.figmaToken);
    const components = compData.meta?.components || [];

    // 3. Calcular diff
    const oldKeys = existsSync(KEYS_FILE) ? JSON.parse(readFileSync(KEYS_FILE, 'utf8')) : {};
    const newKeys = {};
    for (const c of components) {
      if (c.key && c.name) newKeys[normStr(c.name)] = c.key;
    }

    const added   = Object.keys(newKeys).filter(k => !oldKeys[k]);
    const removed = Object.keys(oldKeys).filter(k => !newKeys[k]);
    const changed = Object.keys(newKeys).filter(k => oldKeys[k] && oldKeys[k] !== newKeys[k]);
    const total   = added.length + changed.length + removed.length;

    // 4. Guardar keys + estado
    writeFileSync(KEYS_FILE, JSON.stringify(newKeys, null, 2));
    saveState({ lastModified: figmaLastMod, version: fileData.version, lastSyncDate: new Date().toISOString() });

    // 5. Git commit + push (si hay cambios reales)
    let pushed = false;
    if (total > 0 || manual) {
      try {
        git('git add src/prisma-keys.json scripts/.sync-state.json');
        const date = new Date().toISOString().slice(0, 10);
        git(`git commit -m "chore: sync Prisma-Components ${date} (+${added.length} ~${changed.length} -${removed.length})" --allow-empty`);
        git('git push origin main');
        pushed = true;
      } catch (err) {
        console.error('Git error:', err.message);
      }
    }

    // 6. Log + notificación
    const entry = { manual, total, added: added.length, changed: changed.length, removed: removed.length, pushed };
    addLog(entry);

    if (total > 0) {
      notify('🎨 Prisma-Components actualizado', `${total} cambios detectados (+${added.length} ~${changed.length} -${removed.length})`);
      broadcast({ type: 'sync_done', changed: true, ...entry });
    } else {
      broadcast({ type: 'sync_done', changed: false });
    }

    isSyncing = false;
    return { status: 'ok', ...entry };

  } catch (err) {
    isSyncing = false;
    addLog({ error: err.message });
    broadcast({ type: 'sync_error', message: err.message });
    return { status: 'error', message: err.message };
  }
}

// ── CONFIRMACIÓN NATIVA macOS ─────────────────────────────────

function askUserConfirmation() {
  return new Promise((resolve) => {
    const script = `display dialog "¿Sincronizar Prisma-Components ahora?\\n\\nSe detectó conexión a internet." buttons {"Cancelar", "Sincronizar"} default button "Sincronizar" with title "Prisma Sync" with icon note`;
    exec(`osascript -e '${script}'`, (err, stdout) => {
      resolve(!err && stdout.includes('Sincronizar'));
    });
  });
}

// ── AUTO-SYNC LOOP ────────────────────────────────────────────

let wasOnline = false;

async function checkLoop() {
  const cfg    = loadConfig();
  const online = await hasInternet();

  if (online && !wasOnline) {
    // Recién se conectó a internet
    broadcast({ type: 'online' });
    if (cfg.autoSync) {
      setTimeout(async () => {
        if (cfg.requireConfirmation !== false) {
          broadcast({ type: 'sync_confirm_pending' });
          const approved = await askUserConfirmation();
          if (!approved) {
            broadcast({ type: 'sync_confirm_denied' });
            return;
          }
        }
        runSync(false);
      }, 2000);
    }
  }

  if (!online && wasOnline) {
    broadcast({ type: 'offline' });
  }

  wasOnline = online;
  broadcast({ type: 'heartbeat', online, isSyncing, ts: new Date().toISOString() });

  const intervalMs = (loadConfig().checkIntervalMin || 5) * 60 * 1000;
  setTimeout(checkLoop, intervalMs);
}

// ── HTTP SERVER ───────────────────────────────────────────────

const HTML = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Prisma Sync Dashboard</title>
<style>
  :root {
    --brand: #2563EB; --brand-light: #EFF6FF; --brand-border: #BFDBFE;
    --success: #16A34A; --success-light: #F0FDF4; --success-border: #BBF7D0;
    --warning: #D97706; --warning-light: #FFFBEB;
    --danger: #DC2626; --danger-light: #FEF2F2;
    --neutral-50: #F8FAFC; --neutral-100: #F1F5F9; --neutral-200: #E2E8F0;
    --neutral-500: #64748B; --neutral-600: #475569; --neutral-700: #334155; --neutral-900: #0F172A;
    --radius: 10px; --shadow: 0 1px 3px rgba(0,0,0,.08);
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: var(--neutral-50); color: var(--neutral-700); font-size: 14px; }

  .topbar { background: white; border-bottom: 1px solid var(--neutral-200); padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 10; }
  .topbar-left { display: flex; align-items: center; gap: 12px; }
  .logo { font-weight: 800; font-size: 16px; color: var(--neutral-900); letter-spacing: -.3px; }
  .logo span { color: var(--brand); }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--neutral-200); transition: background .3s; }
  .dot.online { background: var(--success); box-shadow: 0 0 0 3px rgba(22,163,74,.15); }
  .dot.offline { background: var(--danger); }
  .conn-label { font-size: 12px; color: var(--neutral-500); }

  .container { max-width: 800px; margin: 0 auto; padding: 24px; display: flex; flex-direction: column; gap: 16px; }

  .card { background: white; border: 1px solid var(--neutral-200); border-radius: var(--radius); padding: 20px; box-shadow: var(--shadow); }
  .card-title { font-size: 13px; font-weight: 700; color: var(--neutral-900); margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }

  .status-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
  .stat { background: var(--neutral-50); border: 1px solid var(--neutral-200); border-radius: 8px; padding: 14px; }
  .stat-label { font-size: 11px; font-weight: 600; color: var(--neutral-500); text-transform: uppercase; letter-spacing: .4px; margin-bottom: 6px; }
  .stat-value { font-size: 15px; font-weight: 700; color: var(--neutral-900); }
  .stat-sub { font-size: 11px; color: var(--neutral-500); margin-top: 2px; }

  .sync-btn { display: flex; align-items: center; justify-content: center; gap: 8px; background: var(--brand); color: white; border: none; border-radius: 8px; padding: 10px 20px; font-size: 13px; font-weight: 600; cursor: pointer; transition: opacity .15s; width: 100%; margin-top: 16px; }
  .sync-btn:hover { opacity: .9; }
  .sync-btn:disabled { opacity: .5; cursor: not-allowed; }
  .sync-btn.spinning .icon { animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--neutral-100); }
  .toggle-row:last-child { border: none; }
  .toggle-label { font-size: 13px; color: var(--neutral-700); }
  .toggle-sub { font-size: 11px; color: var(--neutral-500); margin-top: 2px; }
  .toggle { position: relative; width: 36px; height: 20px; }
  .toggle input { opacity: 0; width: 0; height: 0; }
  .slider { position: absolute; inset: 0; background: var(--neutral-200); border-radius: 20px; cursor: pointer; transition: .2s; }
  .slider:before { content: ''; position: absolute; width: 14px; height: 14px; left: 3px; top: 3px; background: white; border-radius: 50%; transition: .2s; }
  input:checked + .slider { background: var(--brand); }
  input:checked + .slider:before { transform: translateX(16px); }

  input[type=text], input[type=password], input[type=number], select {
    width: 100%; border: 1px solid var(--neutral-200); border-radius: 6px; padding: 8px 12px;
    font-size: 13px; color: var(--neutral-900); background: white; outline: none;
    transition: border-color .15s;
  }
  input:focus, select:focus { border-color: var(--brand); box-shadow: 0 0 0 3px rgba(37,99,235,.1); }
  .field { margin-bottom: 12px; }
  .field label { display: block; font-size: 12px; font-weight: 600; color: var(--neutral-600); margin-bottom: 4px; }
  .save-btn { background: var(--neutral-900); color: white; border: none; border-radius: 6px; padding: 8px 16px; font-size: 12px; font-weight: 600; cursor: pointer; margin-top: 4px; }
  .save-btn:hover { opacity: .85; }

  .log-list { display: flex; flex-direction: column; gap: 8px; max-height: 300px; overflow-y: auto; }
  .log-item { padding: 10px 12px; border-radius: 6px; font-size: 12px; }
  .log-item.ok { background: var(--success-light); border: 1px solid var(--success-border); }
  .log-item.error { background: var(--danger-light); border: 1px solid #FECACA; }
  .log-item.no-change { background: var(--neutral-50); border: 1px solid var(--neutral-200); }
  .log-ts { font-size: 10px; color: var(--neutral-500); margin-bottom: 3px; }
  .log-msg { color: var(--neutral-700); font-weight: 500; }

  .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
  .badge-new { background: var(--success-light); color: #065F46; border: 1px solid var(--success-border); }
  .badge-changed { background: var(--warning-light); color: #78350F; border: 1px solid #FDE68A; }
  .badge-removed { background: var(--danger-light); color: #991B1B; border: 1px solid #FECACA; }

  .toast { position: fixed; bottom: 24px; right: 24px; background: var(--neutral-900); color: white; padding: 12px 18px; border-radius: 8px; font-size: 13px; font-weight: 500; transform: translateY(80px); opacity: 0; transition: all .25s; pointer-events: none; z-index: 100; }
  .toast.show { transform: translateY(0); opacity: 1; }
  .toast.success { background: var(--success); }
  .toast.error { background: var(--danger); }

  .pulse { animation: pulse 2s ease-in-out infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
</style>
</head>
<body>

<div class="topbar">
  <div class="topbar-left">
    <div class="dot" id="connDot"></div>
    <div>
      <div class="logo">Prisma <span>Sync</span></div>
      <div class="conn-label" id="connLabel">Verificando conexión...</div>
    </div>
  </div>
  <div style="font-size:11px;color:var(--neutral-500)">localhost:7842 · WL UX Team</div>
</div>

<div class="container">

  <!-- Status -->
  <div class="card">
    <div class="card-title">📊 Estado del sistema</div>
    <div class="status-grid">
      <div class="stat">
        <div class="stat-label">Último sync</div>
        <div class="stat-value" id="lastSync">—</div>
        <div class="stat-sub" id="lastSyncSub"></div>
      </div>
      <div class="stat">
        <div class="stat-label">Componentes</div>
        <div class="stat-value" id="compCount">—</div>
        <div class="stat-sub">en catálogo Prisma</div>
      </div>
      <div class="stat">
        <div class="stat-label">Auto-sync</div>
        <div class="stat-value" id="autoSyncStatus">—</div>
        <div class="stat-sub">al conectar internet</div>
      </div>
    </div>
    <button class="sync-btn" id="syncBtn" onclick="triggerSync()">
      <span class="icon">⟳</span> Sincronizar ahora
    </button>
  </div>

  <!-- Log -->
  <div class="card">
    <div class="card-title">📋 Historial de syncs</div>
    <div class="log-list" id="logList">
      <div style="color:var(--neutral-500);font-size:13px;text-align:center;padding:20px">Cargando historial...</div>
    </div>
  </div>

  <!-- Config -->
  <div class="card">
    <div class="card-title">⚙️ Configuración</div>

    <div class="toggle-row">
      <div>
        <div class="toggle-label">Auto-sync al conectar internet</div>
        <div class="toggle-sub">Sincroniza automáticamente cuando detecta conexión</div>
      </div>
      <label class="toggle">
        <input type="checkbox" id="autoSyncToggle" onchange="saveToggle()">
        <span class="slider"></span>
      </label>
    </div>

    <div class="toggle-row">
      <div>
        <div class="toggle-label">Pedir confirmación antes de sincronizar</div>
        <div class="toggle-sub">Muestra un diálogo macOS para aprobar cada sync automático</div>
      </div>
      <label class="toggle">
        <input type="checkbox" id="confirmToggle" onchange="saveToggle()">
        <span class="slider"></span>
      </label>
    </div>

    <div class="toggle-row">
      <div>
        <div class="toggle-label">Notificaciones macOS</div>
        <div class="toggle-sub">Alerta cuando hay cambios en Prisma-Components</div>
      </div>
      <label class="toggle">
        <input type="checkbox" id="notifToggle" onchange="requestNotifPermission()" checked>
        <span class="slider"></span>
      </label>
    </div>

    <div style="margin-top:16px;">
      <div class="field">
        <label>Figma Personal Access Token</label>
        <input type="password" id="figmaToken" placeholder="figd_..." autocomplete="off">
      </div>
      <div class="field">
        <label>Figma File Key (Prisma-Components)</label>
        <input type="text" id="figmaKey" placeholder="LnYUTRFuwWpI9phwDCSHOx">
      </div>
      <div class="field">
        <label>Intervalo de chequeo de conexión (minutos)</label>
        <input type="number" id="checkInterval" min="1" max="60" value="5" style="width:100px">
      </div>
      <button class="save-btn" onclick="saveConfig()">Guardar configuración</button>
    </div>
  </div>

</div>

<div class="toast" id="toast"></div>

<script>
  let config = {};
  let logs   = [];

  // ── Init ─────────────────────────────────────────────────────
  async function init() {
    await loadConfig();
    await loadLogs();
    await loadStatus();
    connectSSE();
    if (Notification.permission === 'default') Notification.requestPermission();
  }

  async function loadConfig() {
    const r = await fetch('/api/config');
    config = await r.json();
    document.getElementById('figmaToken').value   = config.figmaToken || '';
    document.getElementById('figmaKey').value     = config.figmaComponentsKey || '';
    document.getElementById('checkInterval').value = config.checkIntervalMin || 5;
    document.getElementById('autoSyncToggle').checked  = config.autoSync !== false;
    document.getElementById('confirmToggle').checked   = config.requireConfirmation !== false;
    document.getElementById('autoSyncStatus').textContent = config.autoSync !== false ? 'Activo' : 'Inactivo';
  }

  async function loadLogs() {
    const r = await fetch('/api/logs');
    logs = await r.json();
    renderLogs();
  }

  async function loadStatus() {
    const r = await fetch('/api/status');
    const s = await r.json();
    if (s.lastSyncDate) {
      const d = new Date(s.lastSyncDate);
      document.getElementById('lastSync').textContent = d.toLocaleDateString('es-CL');
      document.getElementById('lastSyncSub').textContent = d.toLocaleTimeString('es-CL', {hour:'2-digit',minute:'2-digit'});
    }
    if (s.compCount != null) document.getElementById('compCount').textContent = s.compCount;
  }

  // ── SSE ──────────────────────────────────────────────────────
  let sseRetryDelay = 1000;

  function connectSSE() {
    const es = new EventSource('/api/events');

    es.onopen = () => {
      sseRetryDelay = 1000; // reset al reconectar
      loadLogs();
      loadStatus();
    };

    es.onmessage = e => {
      const data = JSON.parse(e.data);
      if (data.type === 'heartbeat') {
        setOnline(data.online);
        if (data.isSyncing) setLoading(true);
      }
      if (data.type === 'online')   setOnline(true);
      if (data.type === 'offline')  setOnline(false);
      if (data.type === 'sync_confirm_pending') showToast('⏳ Esperando tu confirmación...', '');
      if (data.type === 'sync_confirm_denied')  showToast('Sync cancelado', '');
      if (data.type === 'sync_start') setLoading(true);
      if (data.type === 'sync_done') {
        setLoading(false);
        loadLogs();
        loadStatus();
        if (data.changed) showNotification(data);
      }
      if (data.type === 'sync_error') {
        setLoading(false);
        showToast('Error: ' + data.message, 'error');
      }
    };

    es.onerror = () => {
      es.close();
      setTimeout(() => {
        sseRetryDelay = Math.min(sseRetryDelay * 2, 30000); // máx 30s
        connectSSE();
      }, sseRetryDelay);
    };
  }

  // ── UI ───────────────────────────────────────────────────────
  function setOnline(online) {
    const dot   = document.getElementById('connDot');
    const label = document.getElementById('connLabel');
    dot.className   = 'dot ' + (online ? 'online' : 'offline');
    label.textContent = online ? 'Conectado a internet' : 'Sin conexión';
  }

  function setLoading(loading) {
    const btn = document.getElementById('syncBtn');
    btn.disabled = loading;
    btn.className = 'sync-btn' + (loading ? ' spinning' : '');
    btn.innerHTML = loading
      ? '<span class="icon pulse">⟳</span> Sincronizando...'
      : '<span class="icon">⟳</span> Sincronizar ahora';
  }

  function renderLogs() {
    const el = document.getElementById('logList');
    if (!logs.length) {
      el.innerHTML = '<div style="color:var(--neutral-500);font-size:13px;text-align:center;padding:20px">Sin syncs todavía</div>';
      return;
    }
    el.innerHTML = logs.map(l => {
      const ts   = new Date(l.ts).toLocaleString('es-CL');
      const cls  = l.error ? 'error' : (l.total > 0 ? 'ok' : 'no-change');
      let msg = '';
      if (l.error) msg = '❌ ' + l.error;
      else if (l.total > 0) {
        msg = \`✅ \${l.total} cambios detectados\`;
        if (l.added)   msg += \` <span class="badge badge-new">+\${l.added} nuevos</span>\`;
        if (l.changed) msg += \` <span class="badge badge-changed">~\${l.changed} keys</span>\`;
        if (l.removed) msg += \` <span class="badge badge-removed">-\${l.removed}</span>\`;
        if (l.pushed) msg += ' · pusheado a GitHub';
      } else {
        msg = l.manual ? '✓ Sin cambios (sync manual)' : '✓ Sin cambios';
      }
      return \`<div class="log-item \${cls}"><div class="log-ts">\${ts}\${l.manual ? ' · manual' : ' · auto'}</div><div class="log-msg">\${msg}</div></div>\`;
    }).join('');
  }

  function showNotification({ added, changed, removed, total }) {
    const title = '🎨 Prisma-Components actualizado';
    const body  = \`\${total} cambios: +\${added} nuevos · ~\${changed} keys · -\${removed} removidos\`;
    showToast(body, 'success');
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '' });
    }
  }

  function showToast(msg, type = '') {
    const t = document.getElementById('toast');
    t.textContent  = msg;
    t.className    = 'toast ' + type + ' show';
    setTimeout(() => t.className = 'toast ' + type, 3500);
  }

  // ── Actions ──────────────────────────────────────────────────
  async function triggerSync() {
    setLoading(true);
    const r    = await fetch('/api/sync', { method: 'POST' });
    const data = await r.json();
    if (data.status === 'error') {
      setLoading(false);
      showToast(data.message, 'error');
    }
  }

  async function saveConfig() {
    const cfg = {
      figmaToken:          document.getElementById('figmaToken').value.trim(),
      figmaComponentsKey:  document.getElementById('figmaKey').value.trim(),
      checkIntervalMin:    parseInt(document.getElementById('checkInterval').value) || 5,
      autoSync:            document.getElementById('autoSyncToggle').checked
    };
    await fetch('/api/config', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(cfg) });
    config = cfg;
    showToast('Configuración guardada ✓', 'success');
  }

  function saveToggle() {
    const autoSync = document.getElementById('autoSyncToggle').checked;
    const confirm  = document.getElementById('confirmToggle').checked;
    document.getElementById('autoSyncStatus').textContent = autoSync ? 'Activo' : 'Inactivo';
    config.autoSync            = autoSync;
    config.requireConfirmation = confirm;
    fetch('/api/config', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(config) });
  }

  function requestNotifPermission() {
    if (Notification.permission !== 'granted') Notification.requestPermission();
  }

  init();
</script>
</body>
</html>`;

const server = http.createServer(async (req, res) => {
  const url = req.url;

  // SSE
  if (url === '/api/events') {
    res.writeHead(200, {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    res.write('data: {"type":"connected"}\n\n');
    sseClients.add(res);
    req.on('close', () => sseClients.delete(res));
    return;
  }

  // GET /api/config
  if (url === '/api/config' && req.method === 'GET') {
    const cfg = loadConfig();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    // Devolver token enmascarado en la UI (pero completo para el script)
    return res.end(JSON.stringify(cfg));
  }

  // POST /api/config
  if (url === '/api/config' && req.method === 'POST') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => {
      try {
        const cfg = { ...loadConfig(), ...JSON.parse(body) };
        saveConfig(cfg);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch {
        res.writeHead(400); res.end('{}');
      }
    });
    return;
  }

  // POST /api/sync
  if (url === '/api/sync' && req.method === 'POST') {
    runSync(true); // async, no await — SSE updates la UI
    res.writeHead(202, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'started' }));
  }

  // GET /api/logs
  if (url === '/api/logs') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(loadLog()));
  }

  // GET /api/status
  if (url === '/api/status') {
    const state = loadState();
    const compCount = existsSync(KEYS_FILE) ? Object.keys(JSON.parse(readFileSync(KEYS_FILE, 'utf8'))).length : null;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ...state, compCount }));
  }

  // Dashboard HTML
  if (url === '/' || url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(HTML);
  }

  res.writeHead(404); res.end('Not found');
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n🎨 Prisma Sync Dashboard corriendo en http://localhost:${PORT}\n`);
  // Abrir browser automáticamente
  exec(`open http://localhost:${PORT}`);
  // Iniciar loop de conectividad
  checkLoop();
});
