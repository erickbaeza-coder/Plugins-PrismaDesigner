// Regenera prisma-mcp/src/prisma-keys.json (v4) desde Figma, para publicarlo con el plugin.
// Uso (mantenedores):  node prisma-mcp/scripts/sync-keys.mjs
// Token: variable FIGMA_TOKEN o archivo ~/.prisma-mcp-token (solo lectura de archivos).
import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FigmaAPI, buildKeysFile } from '../src/figma-api.js';

const LIBRARIES = [
  { id: 'app', fileKey: 'LnYUTRFuwWpI9phwDCSHOx', name: 'APP-Prisma-Components' },
  { id: 'web', fileKey: 'V4JC6ZQiNFEechja7p3W3A', name: 'Web Components' }
];

let token = process.env.FIGMA_TOKEN;
if (!token) {
  try { token = readFileSync(join(homedir(), '.prisma-mcp-token'), 'utf8').trim(); } catch { /* sin archivo */ }
}
if (!token) { console.error('Falta FIGMA_TOKEN o ~/.prisma-mcp-token'); process.exit(1); }

const api = new FigmaAPI(token);
const libraries = {};
for (const lib of LIBRARIES) {
  const idx = await api.getLibraryIndex(lib.fileKey, lib.id);
  libraries[lib.id] = { fileKey: lib.fileKey, name: lib.name, syncedAt: new Date().toISOString(), sets: idx.sets };
  const s = idx.stats;
  console.log(`${lib.id} · ${lib.name}: ${s.sets} componentes, ${s.variants} variantes ` +
    `(${s.linked} enlazadas, ${s.standalone} sueltos, ${s.orphanGroups} grupos sin set, ${s.duplicateNames} nombres repetidos, ${s.skipped} descartados)`);
}

const out = join(dirname(fileURLToPath(import.meta.url)), '../src/prisma-keys.json');
writeFileSync(out, JSON.stringify(buildKeysFile(libraries)));
console.log('Escrito', out);
