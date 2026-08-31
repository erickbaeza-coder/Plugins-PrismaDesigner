#!/usr/bin/env node
// ============================================================
// Prisma MCP — Auto Sync Script
// Whitelabel UX Team · Cencosud · 2026
//
// Uso: node scripts/sync-and-push.js
// Cron: LaunchAgent com.cencosud.prisma-sync.plist (semanal)
//
// Qué hace:
//   1. Consulta Figma API → detecta si Prisma-Components cambió
//   2. Si hay cambios → actualiza prisma-keys.json con los nuevos figmaKeys
//   3. Git commit + push al repo del equipo
//   4. Envía email a NOTIFY_EMAIL con resumen de cambios
// ============================================================

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createTransport } from 'nodemailer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, '..');
const SRC       = join(ROOT, 'src');

// ── CONFIG ────────────────────────────────────────────────────
// Editá estas variables o pasalas como env vars en el LaunchAgent

const FIGMA_TOKEN             = process.env.FIGMA_TOKEN || '';
const FIGMA_COMPONENTS_FILEKEY = process.env.FIGMA_COMPONENTS_FILEKEY || 'LnYUTRFuwWpI9phwDCSHOx';
const NOTIFY_EMAIL            = process.env.NOTIFY_EMAIL || 'erick.baeza@cencosud.cl';

// Config SMTP — completar con tu servidor Cencosud o usar Gmail
const SMTP_CONFIG = {
  host:   process.env.SMTP_HOST || 'smtp.gmail.com',
  port:   parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',   // tu email que envía (ej: prisma.sync@gmail.com)
    pass: process.env.SMTP_PASS || ''    // app password de Gmail o contraseña SMTP
  }
};

const FROM_EMAIL = process.env.SMTP_FROM || SMTP_CONFIG.auth.user;

// ── PATHS ─────────────────────────────────────────────────────
const KEYS_FILE  = join(SRC, 'prisma-keys.json');
const STATE_FILE = join(__dirname, '.sync-state.json');

// ── HELPERS ───────────────────────────────────────────────────

function log(msg) {
  const ts = new Date().toISOString().slice(0, 19).replace('T', ' ');
  console.log(`[${ts}] ${msg}`);
}

function normStr(s) {
  return (s || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

async function figmaGet(path) {
  const res = await fetch(`https://api.figma.com/v1${path}`, {
    headers: { 'X-Figma-Token': FIGMA_TOKEN }
  });
  if (!res.ok) throw new Error(`Figma API ${res.status}: ${await res.text()}`);
  return res.json();
}

function loadState() {
  if (!existsSync(STATE_FILE)) return { lastModified: null, lastSyncDate: null };
  return JSON.parse(readFileSync(STATE_FILE, 'utf8'));
}

function saveState(state) {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function loadCurrentKeys() {
  if (!existsSync(KEYS_FILE)) return {};
  return JSON.parse(readFileSync(KEYS_FILE, 'utf8'));
}

function git(cmd) {
  return execSync(cmd, { cwd: ROOT, encoding: 'utf8' }).trim();
}

async function sendEmail(subject, html) {
  if (!SMTP_CONFIG.auth.user || !SMTP_CONFIG.auth.pass) {
    log('⚠️  Email no configurado — revisar SMTP_USER y SMTP_PASS en el LaunchAgent');
    // Fallback: notificación macOS
    try {
      execSync(`osascript -e 'display notification "${subject}" with title "Prisma MCP Sync"'`);
    } catch {}
    return;
  }

  const transporter = createTransport(SMTP_CONFIG);
  await transporter.sendMail({
    from:    `"Prisma MCP Sync" <${FROM_EMAIL}>`,
    to:      NOTIFY_EMAIL,
    subject,
    html
  });
  log(`📧 Email enviado a ${NOTIFY_EMAIL}`);
}

// ── MAIN ──────────────────────────────────────────────────────

async function main() {
  log('🔄 Iniciando sync de Prisma-Components...');

  if (!FIGMA_TOKEN) {
    log('❌ FIGMA_TOKEN no configurado. Abortando.');
    process.exit(1);
  }

  // 1. Consultar info del archivo Figma
  const fileData = await figmaGet(`/files/${FIGMA_COMPONENTS_FILEKEY}?depth=1`);
  const figmaLastModified = fileData.lastModified;
  const figmaVersion      = fileData.version;

  log(`📦 Figma file: ${fileData.name}`);
  log(`   Última modificación en Figma: ${figmaLastModified}`);

  // 2. Comparar con estado guardado
  const state = loadState();
  if (state.lastModified === figmaLastModified) {
    log('✅ Sin cambios en Prisma-Components. No hay nada que sincronizar.');
    process.exit(0);
  }

  log(`🆕 Se detectaron cambios (version anterior: ${state.lastModified || 'ninguna'})`);

  // 3. Obtener todos los componentes del archivo
  log('📥 Descargando componentes de Figma...');
  const compData   = await figmaGet(`/files/${FIGMA_COMPONENTS_FILEKEY}/components`);
  const components = (compData.meta?.components || []);
  log(`   ${components.length} componentes encontrados`);

  // 4. Construir el nuevo mapa de keys
  const oldKeys = loadCurrentKeys();
  const newKeys = {};

  for (const comp of components) {
    if (comp.key && comp.name) {
      newKeys[normStr(comp.name)] = comp.key;
    }
  }

  // 5. Calcular diff
  const added   = Object.keys(newKeys).filter(k => !oldKeys[k]);
  const removed = Object.keys(oldKeys).filter(k => !newKeys[k]);
  const changed = Object.keys(newKeys).filter(k => oldKeys[k] && oldKeys[k] !== newKeys[k]);

  log(`   +${added.length} nuevos  ~${changed.length} cambiados  -${removed.length} removidos`);

  // 6. Guardar prisma-keys.json
  writeFileSync(KEYS_FILE, JSON.stringify(newKeys, null, 2));
  log(`💾 prisma-keys.json actualizado (${Object.keys(newKeys).length} keys)`);

  // 7. Actualizar estado
  saveState({ lastModified: figmaLastModified, version: figmaVersion, lastSyncDate: new Date().toISOString() });

  // 8. Git commit + push
  try {
    git('git add src/prisma-keys.json scripts/.sync-state.json');
    const dateStr = new Date().toISOString().slice(0, 10);
    git(`git commit -m "chore: sync Prisma-Components ${dateStr} (+${added.length} ~${changed.length} -${removed.length})"`);
    git('git push origin main');
    log('🚀 Push a GitHub exitoso');
  } catch (err) {
    log(`⚠️  Git error: ${err.message}`);
    await sendEmail(
      '⚠️ Prisma Sync — Error en git push',
      `<p>Se sincronizó el catálogo pero el push a GitHub falló:</p><pre>${err.message}</pre>`
    );
    process.exit(1);
  }

  // 9. Enviar email con resumen
  const totalChanges = added.length + changed.length + removed.length;

  const addedList   = added.slice(0, 20).map(k => `<li>✅ ${k}</li>`).join('');
  const changedList = changed.slice(0, 20).map(k => `<li>🔄 ${k}</li>`).join('');
  const removedList = removed.slice(0, 10).map(k => `<li>❌ ${k}</li>`).join('');

  const html = `
  <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
    <div style="background:#2563EB;color:white;padding:24px;border-radius:8px 8px 0 0">
      <h2 style="margin:0">🎨 Prisma-Components actualizado</h2>
      <p style="margin:8px 0 0;opacity:.85">Sync automático · ${new Date().toLocaleDateString('es-CL')}</p>
    </div>
    <div style="background:#F8FAFC;padding:24px;border:1px solid #E2E8F0;border-top:none;border-radius:0 0 8px 8px">
      <p style="color:#334155"><strong>${totalChanges} cambios detectados</strong> en el archivo Figma de Prisma-Components.</p>
      <p style="color:#64748B;font-size:14px">El catálogo fue actualizado automáticamente y pusheado al repo del equipo.</p>

      ${added.length > 0 ? `
      <h3 style="color:#16A34A;font-size:14px">Componentes nuevos (${added.length})</h3>
      <ul style="font-size:13px;color:#334155;line-height:1.8">${addedList}${added.length > 20 ? `<li>...y ${added.length - 20} más</li>` : ''}</ul>
      ` : ''}

      ${changed.length > 0 ? `
      <h3 style="color:#D97706;font-size:14px">Keys actualizados (${changed.length})</h3>
      <ul style="font-size:13px;color:#334155;line-height:1.8">${changedList}${changed.length > 20 ? `<li>...y ${changed.length - 20} más</li>` : ''}</ul>
      ` : ''}

      ${removed.length > 0 ? `
      <h3 style="color:#DC2626;font-size:14px">Componentes removidos (${removed.length})</h3>
      <ul style="font-size:13px;color:#334155;line-height:1.8">${removedList}${removed.length > 10 ? `<li>...y ${removed.length - 10} más</li>` : ''}</ul>
      ` : ''}

      <div style="margin-top:20px;padding:16px;background:#EFF6FF;border:1px solid #BFDBFE;border-radius:6px">
        <p style="margin:0;font-size:13px;color:#1E40AF">
          <strong>¿Qué sigue?</strong><br>
          El equipo ya tiene la versión actualizada vía <code>git pull</code> + reinicio del MCP.<br>
          Revisá los componentes nuevos para ver si hay alguno que deba agregarse al catálogo DS3.
        </p>
      </div>

      <p style="font-size:12px;color:#94A3B8;margin-top:24px">
        Prisma MCP Auto-Sync · Whitelabel UX Team · Cencosud<br>
        Repo: <a href="https://github.com/erickbaeza-coder/PRISMA-MCP">github.com/erickbaeza-coder/PRISMA-MCP</a>
      </p>
    </div>
  </div>`;

  await sendEmail(
    `🎨 Prisma-Components actualizado — ${totalChanges} cambios (+${added.length} ~${changed.length} -${removed.length})`,
    html
  );

  log(`✅ Sync completado. ${totalChanges} cambios procesados.`);
}

main().catch(err => {
  log(`❌ Error fatal: ${err.message}`);
  process.exit(1);
});
