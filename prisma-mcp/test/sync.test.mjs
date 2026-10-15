// Prueba del sync v4 con respuestas simuladas de la API de Figma.
// Reproduce lo medido en APP-Prisma-Components: component_set_id = null, nombres de grupo en
// containing_frame.name y el set real en containing_frame.containingStateGroup.
// Ejecutar: node --test prisma-mcp/test/sync.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, cpSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildLibraryIndex, pickDefaultKey } from '../src/figma-api.js';

const here = dirname(fileURLToPath(import.meta.url));

const sets = [
  { key: 's1', name: 'WlProductCardCart', node_id: '1:1', containing_frame: { name: 'Product Card' } },
  { key: 's2', name: 'WlChip', node_id: '1:2', containing_frame: { name: 'Chips' } },
  { key: 's3', name: 'WlHeader', node_id: '1:3', containing_frame: { name: 'Nav Bar' } }
];
const v = (name, key, setId, setName, frame) => ({
  key, name, component_set_id: null,
  containing_frame: { name: frame, containingStateGroup: { name: setName, nodeId: setId } }
});
const components = [
  v('Type=Skeleton', 'k-skel', '1:1', 'WlProductCardCart', 'Product Card'),
  v('Type=Default', 'k-def', '1:1', 'WlProductCardCart', 'Product Card'),
  v('Type=Swipe_delete', 'k-swipe', '1:1', 'WlProductCardCart', 'Product Card'),
  v('State=Default', 'k-chip-d', '1:2', 'WlChip', 'Chips'),
  v('State=Active', 'k-chip-a', '1:2', 'WlChip', 'Chips'),
  v('Type=Home, State=Default', 'k-h', '1:3', 'WlHeader', 'Nav Bar'),
  { key: 'k-nav', name: 'WlNavBar', containing_frame: { name: 'Nav Bar' }, node_id: '9:9' },
  { key: 'k-junk', name: 'TURN OFF WHEN SAVING OUT', containing_frame: { name: 'x' }, node_id: '9:8' },
  v('Size=Md', 'k-orph', '7:7', 'Datos_content', 'Misc')
];

test('une variantes a sets reales y descarta basura', () => {
  const idx = buildLibraryIndex(components, sets, { library: 'app', fileKey: 'F' });
  assert.deepEqual(Object.keys(idx.sets).sort(),
    ['datos_content'.replace('_', ''), 'wlchip', 'wlheader', 'wlnavbar', 'wlproductcardcart']);
  assert.equal(Object.keys(idx.sets.wlproductcardcart.variants).length, 3);
  assert.equal(idx.stats.linked, 6);
  assert.equal(idx.stats.standalone, 1);
  assert.equal(idx.stats.skipped, 1);
  assert.equal(idx.stats.orphanGroups, 1);
});

test('el default no es Skeleton ni la primera variante', () => {
  const idx = buildLibraryIndex(components, sets, { library: 'app' });
  assert.equal(idx.sets.wlproductcardcart._default, 'k-def');
  assert.equal(pickDefaultKey({ 'type=skeleton': 'a', 'type=error': 'b' }), 'a'); // sin default: no rompe
});

test('catálogo v4: nombres Wl*, estados y librerías', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'prisma-'));
  cpSync(join(here, '../src'), dir, { recursive: true });
  const app = buildLibraryIndex(components, sets, { library: 'app', fileKey: 'A' });
  const web = buildLibraryIndex(
    [v('State=Default', 'w-h', '2:1', 'WlHeader', 'Nav')],
    [{ key: 'ws', name: 'WlHeader', node_id: '2:1', containing_frame: { name: 'Nav' } }],
    { library: 'web', fileKey: 'W' });
  writeFileSync(join(dir, 'prisma-keys.json'), JSON.stringify({
    _meta: { version: 4 },
    libraries: { app: { sets: app.sets }, web: { sets: web.sets } }
  }));
  const { PrismaCatalog } = await import(join(dir, 'prisma-catalog.js') + '?t=' + Date.now());
  const c = new PrismaCatalog();

  assert.deepEqual(c.getLibraries(), ['app', 'web']);
  assert.equal(c.get('WlProductCardCart').figmaKey, 'k-def');
  assert.equal(c.get('WlChip · State=Active').figmaKey, 'k-chip-a');
  assert.equal(c.get('WlChip').figmaKey, 'k-chip-d');
  assert.equal(c.get('WlChip · State=Nope').variantExact, false);
  assert.equal(c.get('WlProductCardTFM'), null);        // no existe → no se adivina
  assert.equal(c.get('WlProductCard'), null);            // parecido a WlProductCardCart → tampoco
  assert.equal(c.exists('WlNavBar'), true);
  assert.equal(c.get('WlHeader').library, 'app');        // app por defecto
  assert.equal(c.get('WlHeader', { library: 'web' }).figmaKey, 'w-h');
  assert.ok(c.get('Nav Bar > Header · Color=White · Type=Home · State=Default')); // alias legacy sigue vivo
  assert.ok(!c.list().some(e => e.legacy));              // legacy no se lista
  assert.ok(c.list('cart').some(e => e.name === 'WlProductCardCart'));
});
