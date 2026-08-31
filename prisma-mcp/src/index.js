#!/usr/bin/env node
// ============================================================
// Prisma MCP Server v1.0
// Whitelabel UX Team · Cencosud · 2026
// ============================================================
// Conecta Claude con el catálogo de Prisma-Components y la
// Figma REST API para crear pantallas desde DS3 JSON o prompts.
// ============================================================

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { FigmaAPI } from './figma-api.js';
import { PrismaCatalog } from './prisma-catalog.js';
import { ComponentResolver } from './component-resolver.js';
import { DS3Builder } from './ds3-builder.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKENS = JSON.parse(readFileSync(join(__dirname, 'prisma-tokens.json'), 'utf8'));

// ── Init ──────────────────────────────────────────────────────
const figmaToken = process.env.FIGMA_TOKEN;
if (!figmaToken) {
  process.stderr.write('⚠️  FIGMA_TOKEN no configurado. Las herramientas de Figma no funcionarán.\n');
}

const figmaApi  = new FigmaAPI(figmaToken);
const catalog   = new PrismaCatalog();
const resolver  = new ComponentResolver(catalog);
const builder   = new DS3Builder(resolver, catalog);

// ── Server ────────────────────────────────────────────────────
const server = new Server(
  { name: 'prisma-mcp', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

// ── Tool definitions ──────────────────────────────────────────
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'sync_prisma_library',
      description:
        'Escanea el archivo Prisma-Components en Figma y enriquece el catálogo local con los component keys reales. ' +
        'Ejecutar una vez antes de crear pantallas para maximizar el match de componentes.',
      inputSchema: {
        type: 'object',
        properties: {
          file_url: {
            type: 'string',
            description: 'URL del archivo Prisma-Components en Figma (ej: https://www.figma.com/file/XXXX/Prisma-Components)'
          }
        },
        required: ['file_url']
      }
    },
    {
      name: 'create_screens_from_ds3',
      description:
        'Toma el JSON completo de packets.ds3 generado por el paso DS3 del proceso agéntico y produce:\n' +
        '1. Script use_figma listo para ejecutar — crea las pantallas DIRECTAMENTE en Figma usando importComponentByKeyAsync, auto-layout y spacing tokens\n' +
        '2. JSON enriquecido como fallback para Prisma Builder (plugin Figma)\n' +
        '3. Specs para componentes locales nuevos (los que no existen en Prisma)\n' +
        '4. Resumen de cobertura y warnings\n\n' +
        'FLUJO PRINCIPAL: DS3 JSON → MCP genera script → Claude ejecuta use_figma → pantallas en Figma.\n' +
        'Usar cuando tenés el DS3 JSON completo y querés crear las pantallas directamente en Figma.',
      inputSchema: {
        type: 'object',
        properties: {
          ds3_json: {
            type: 'string',
            description: 'JSON completo de packets.ds3 (el que genera DS3 en design_state.json)'
          },
          figma_file_url: {
            type: 'string',
            description: 'URL del archivo de trabajo en Figma donde crear las pantallas'
          }
        },
        required: ['ds3_json']
      }
    },
    {
      name: 'create_screens_from_prompts',
      description:
        'Toma prompts de texto (como los que genera DS3 para Figma Make) y los convierte en pantallas. ' +
        'Para cada prompt: infiere los componentes Prisma correctos, construye el JSON, y genera la spec. ' +
        'Usar cuando tenés los prompts del output_ds3.md pero no el JSON.',
      inputSchema: {
        type: 'object',
        properties: {
          prompts: {
            type: 'array',
            description: 'Array de pantallas con su prompt',
            items: {
              type: 'object',
              properties: {
                id:     { type: 'string', description: 'ID de pantalla (ej: P01)' },
                nombre: { type: 'string', description: 'Nombre de la pantalla' },
                prompt: { type: 'string', description: 'Prompt de Figma Make de esa pantalla' }
              },
              required: ['nombre', 'prompt']
            }
          },
          marca: {
            type: 'string',
            description: 'Nombre de la marca (Jumbo, Disco, Metro, The Fresh Market, Prezunic)',
            enum: ['Jumbo', 'Disco', 'Metro', 'The Fresh Market', 'Prezunic', 'Vea', 'Gbarbosa']
          },
          plataforma: {
            type: 'string',
            description: 'Plataforma objetivo',
            enum: ['iOS', 'Android', 'web mobile', 'web desktop']
          },
          figma_file_url: {
            type: 'string',
            description: 'URL del archivo de trabajo en Figma'
          }
        },
        required: ['prompts']
      }
    },
    {
      name: 'list_prisma_components',
      description:
        'Lista todos los componentes disponibles en el catálogo de Prisma-Components. ' +
        'Útil para saber qué existe antes de diseñar. Soporta filtro por texto o grupo.',
      inputSchema: {
        type: 'object',
        properties: {
          filter: {
            type: 'string',
            description: 'Filtro por nombre (ej: "Button", "banner", "card")'
          },
          group: {
            type: 'string',
            description: 'Filtrar por grupo de Figma (ej: "Nav Bar", "Buttons", "Banners Cards")'
          }
        }
      }
    },
    {
      name: 'resolve_component',
      description:
        'Encuentra el componente Prisma que mejor coincide con una descripción en lenguaje natural. ' +
        'Retorna: nombre exacto del componente, todas sus props válidas, y alternativas. ' +
        'Si no existe, propone una composición con componentes existentes.',
      inputSchema: {
        type: 'object',
        properties: {
          description: {
            type: 'string',
            description: 'Descripción del componente en español o inglés (ej: "botón primario grande", "header con título y flecha atrás", "tarjeta de producto con precio")'
          }
        },
        required: ['description']
      }
    },
    {
      name: 'create_local_component_spec',
      description:
        'Genera la especificación completa para un componente nuevo que NO existe en Prisma. Produce:\n' +
        '1. Composición DS3 con sub-componentes existentes de Prisma\n' +
        '2. Prompt listo para Figma Make\n' +
        '3. Instrucciones para crearlo como componente local en el archivo de trabajo',
      inputSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Nombre intencional del componente (ej: "EventCard", "RewardBanner", "MembershipGate")'
          },
          description: {
            type: 'string',
            description: 'Descripción detallada: qué hace, estructura visual, elementos que contiene'
          },
          platform: {
            type: 'string',
            enum: ['iOS', 'Android', 'web mobile', 'web desktop'],
            description: 'Plataforma objetivo'
          },
          brand: {
            type: 'string',
            description: 'Marca para la que se crea el componente'
          }
        },
        required: ['name', 'description']
      }
    },
    {
      name: 'get_figma_file_info',
      description: 'Obtiene información de un archivo Figma: nombre, páginas disponibles, cantidad de componentes locales.',
      inputSchema: {
        type: 'object',
        properties: {
          file_url: {
            type: 'string',
            description: 'URL del archivo Figma'
          }
        },
        required: ['file_url']
      }
    },
    {
      name: 'validate_ds3_json',
      description:
        'Valida un DS3 JSON contra el catálogo de Prisma y reporta:\n' +
        '• Componentes válidos vs inválidos\n' +
        '• Props incorrectas o inexistentes\n' +
        '• Componentes que generarán placeholders\n' +
        '• Sugerencias de corrección para cada error',
      inputSchema: {
        type: 'object',
        properties: {
          ds3_json: {
            type: 'string',
            description: 'JSON de packets.ds3 a validar'
          }
        },
        required: ['ds3_json']
      }
    }
  ]
}));

// ── Tool handlers ─────────────────────────────────────────────
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'sync_prisma_library':         return await handleSyncLibrary(args);
      case 'create_screens_from_ds3':     return await handleCreateScreensFromDS3(args);
      case 'create_screens_from_prompts': return await handleCreateScreensFromPrompts(args);
      case 'list_prisma_components':      return await handleListComponents(args);
      case 'resolve_component':           return await handleResolveComponent(args);
      case 'create_local_component_spec': return await handleCreateLocalComponentSpec(args);
      case 'get_figma_file_info':         return await handleGetFigmaFileInfo(args);
      case 'validate_ds3_json':           return await handleValidateDS3Json(args);
      default:
        throw new Error(`Tool desconocida: ${name}`);
    }
  } catch (err) {
    return {
      content: [{ type: 'text', text: `❌ Error: ${err.message}` }],
      isError: true
    };
  }
});

// ── Handlers ──────────────────────────────────────────────────

async function handleSyncLibrary({ file_url }) {
  const fileKey = extractFileKey(file_url);
  if (!fileKey) throw new Error('URL de Figma inválida. Formato esperado: https://www.figma.com/file/XXXX/...');

  const components = await figmaApi.getFileComponents(fileKey);
  const count = catalog.updateFromFigma(components);

  const groups = catalog.getGroups();

  return {
    content: [{
      type: 'text',
      text: [
        `✅ Sync completado`,
        ``,
        `• Componentes encontrados en Figma: ${components.length}`,
        `• Nuevos componentes en catálogo: ${count}`,
        `• Grupos disponibles: ${groups.join(', ')}`,
        ``,
        `El catálogo ahora tiene datos reales de component keys de Figma.`,
        `Podés usar create_screens_from_ds3 o create_screens_from_prompts.`
      ].join('\n')
    }]
  };
}

// ── Figma Script Generator v3.1 ──────────────────────────────
// Genera el código JavaScript que Claude ejecuta via use_figma
// para crear pantallas directamente en Figma.
//
// v3.1 — Mejoras de fidelidad:
//   • Agrupación por secciones con Auto Layout independiente
//   • Grids 2-col para product cards y contenido en cuadrícula
//   • sectionSpacing entre secciones, itemSpacing dentro
//   • Scroll horizontal para chips/filtros/categorías
//   • Soporte para composiciones (sub-componentes en un frame)
//   • Sticky/fixed elements (nav bottom, sticky buttons)
//   • Padding inteligente: full-width vs padded por tipo
// ──────────────────────────────────────────────────────────────

function generateFigmaScript(ds3Data) {
  const S = TOKENS.screen;
  const SP = TOKENS.spacing;
  const FRAME_W = S.width;              // 390
  const FRAME_H = S.height;             // 844
  const GAP = 60;                       // espacio entre frames en canvas
  const SECTION_GAP = S.sectionSpacing; // 24 — entre secciones
  const ITEM_GAP = S.itemSpacing;       // 12 — dentro de secciones
  const PAD_H = S.paddingHorizontal;    // 16

  const pantallas = ds3Data.pantallas || [];
  const varNames  = pantallas.map((_, i) => `s${String(i + 1).padStart(2, '0')}`);

  const L = [];  // lines

  const pageName = `${ds3Data.proyecto || 'DS3'} · ${ds3Data.marca || 'Brand'}`;

  L.push(`// ═══════════════════════════════════════════════════════════════`);
  L.push(`// Auto-generado por Prisma MCP v3.1 — create_screens_from_ds3`);
  L.push(`// Proyecto : ${ds3Data.proyecto || '—'}`);
  L.push(`// Marca    : ${ds3Data.marca    || '—'}`);
  L.push(`// Generado : ${new Date().toISOString().split('T')[0]}`);
  L.push(`// ═══════════════════════════════════════════════════════════════`);
  L.push(``);
  L.push(`// ── Crear / encontrar página destino ─────────────────────────`);
  L.push(`const PAGE_NAME = ${JSON.stringify(pageName)};`);
  L.push(`let targetPage = figma.root.children.find(p => p.name === PAGE_NAME);`);
  L.push(`if (!targetPage) { targetPage = figma.createPage(); targetPage.name = PAGE_NAME; }`);
  L.push(`await figma.setCurrentPageAsync(targetPage);`);
  L.push(``);
  L.push(`const T = {`);
  L.push(`  padH: ${PAD_H},`);
  L.push(`  itemGap: ${ITEM_GAP},`);
  L.push(`  sectionGap: ${SECTION_GAP},`);
  L.push(`  padB: ${S.paddingBottom},`);
  L.push(`  gridGap: ${SP.l || 8}`);
  L.push(`};`);
  L.push(`const W = ${FRAME_W}, H = ${FRAME_H}, GAP = ${GAP};`);
  L.push(``);
  L.push(`// ── Helpers ──────────────────────────────────────────────────`);
  L.push(`async function li(key) {`);
  L.push(`  const c = await figma.importComponentByKeyAsync(key);`);
  L.push(`  return c.createInstance();`);
  L.push(`}`);
  L.push(``);
  L.push(`function makeFrame(name, x) {`);
  L.push(`  const f = figma.createFrame();`);
  L.push(`  f.name = name; f.resize(W, H); f.x = x; f.y = 0;`);
  L.push(`  f.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];`);
  L.push(`  f.layoutMode = 'VERTICAL';`);
  L.push(`  f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED';`);
  L.push(`  f.itemSpacing = T.sectionGap;`);
  L.push(`  f.paddingTop = 0; f.paddingBottom = T.padB;`);
  L.push(`  f.paddingLeft = 0; f.paddingRight = 0;`);
  L.push(`  f.clipsContent = true;`);
  L.push(`  figma.currentPage.appendChild(f);`);
  L.push(`  return f;`);
  L.push(`}`);
  L.push(``);
  L.push(`// Crea un frame de sección dentro de la pantalla`);
  L.push(`function makeSection(parent, name, opts) {`);
  L.push(`  const s = figma.createFrame();`);
  L.push(`  s.name = name;`);
  L.push(`  s.layoutMode = opts.direction || 'VERTICAL';`);
  L.push(`  s.primaryAxisSizingMode = 'AUTO';`);
  L.push(`  s.counterAxisSizingMode = 'FIXED';`);
  L.push(`  s.itemSpacing = opts.gap ?? T.itemGap;`);
  L.push(`  s.paddingLeft = opts.padH ?? 0; s.paddingRight = opts.padH ?? 0;`);
  L.push(`  s.paddingTop = opts.padV ?? 0; s.paddingBottom = opts.padV ?? 0;`);
  L.push(`  s.fills = [];`);
  L.push(`  parent.appendChild(s);`);
  L.push(`  s.layoutSizingHorizontal = 'FILL';`);
  L.push(`  return s;`);
  L.push(`}`);
  L.push(``);
  L.push(`// Crea una fila de grid (2 columnas con gap)`);
  L.push(`function makeGridRow(parent) {`);
  L.push(`  const row = figma.createFrame();`);
  L.push(`  row.name = '_grid_row';`);
  L.push(`  row.layoutMode = 'HORIZONTAL';`);
  L.push(`  row.primaryAxisSizingMode = 'FIXED';`);
  L.push(`  row.counterAxisSizingMode = 'AUTO';`);
  L.push(`  row.itemSpacing = T.gridGap;`);
  L.push(`  row.fills = [];`);
  L.push(`  parent.appendChild(row);`);
  L.push(`  row.layoutSizingHorizontal = 'FILL';`);
  L.push(`  return row;`);
  L.push(`}`);
  L.push(``);
  L.push(`// Scroll horizontal container`);
  L.push(`function makeScrollH(parent, name) {`);
  L.push(`  const sc = figma.createFrame();`);
  L.push(`  sc.name = name || '_scroll_h';`);
  L.push(`  sc.layoutMode = 'HORIZONTAL';`);
  L.push(`  sc.primaryAxisSizingMode = 'AUTO';`);
  L.push(`  sc.counterAxisSizingMode = 'AUTO';`);
  L.push(`  sc.itemSpacing = T.gridGap;`);
  L.push(`  sc.paddingLeft = T.padH; sc.paddingRight = T.padH;`);
  L.push(`  sc.fills = [];`);
  L.push(`  sc.clipsContent = true;`);
  L.push(`  parent.appendChild(sc);`);
  L.push(`  sc.layoutSizingHorizontal = 'FILL';`);
  L.push(`  return sc;`);
  L.push(`}`);
  L.push(``);
  L.push(`// Wrapper con padding horizontal`);
  L.push(`function wrapPad(frame) {`);
  L.push(`  const w = figma.createFrame();`);
  L.push(`  w.layoutMode = 'VERTICAL';`);
  L.push(`  w.primaryAxisSizingMode = 'AUTO';`);
  L.push(`  w.counterAxisSizingMode = 'FIXED';`);
  L.push(`  w.paddingLeft = T.padH; w.paddingRight = T.padH;`);
  L.push(`  w.paddingTop = 0; w.paddingBottom = 0;`);
  L.push(`  w.itemSpacing = 0; w.fills = [];`);
  L.push(`  frame.appendChild(w);`);
  L.push(`  w.layoutSizingHorizontal = 'FILL';`);
  L.push(`  return w;`);
  L.push(`}`);
  L.push(``);
  L.push(`// Agrega un componente al frame según su layoutType`);
  L.push(`async function addComp(frame, key, type) {`);
  L.push(`  const inst = await li(key);`);
  L.push(`  if (type === 'padded') {`);
  L.push(`    const wrap = wrapPad(frame);`);
  L.push(`    wrap.appendChild(inst);`);
  L.push(`    inst.layoutSizingHorizontal = 'FILL';`);
  L.push(`  } else if (type === 'center') {`);
  L.push(`    frame.appendChild(inst);`);
  L.push(`    inst.layoutAlign = 'CENTER';`);
  L.push(`  } else if (type === 'inline') {`);
  L.push(`    const wrap = wrapPad(frame);`);
  L.push(`    wrap.counterAxisSizingMode = 'AUTO';`);
  L.push(`    wrap.appendChild(inst);`);
  L.push(`  } else {`);
  L.push(`    frame.appendChild(inst);`);
  L.push(`    inst.layoutSizingHorizontal = 'FILL';`);
  L.push(`  }`);
  L.push(`  return inst;`);
  L.push(`}`);
  L.push(``);
  L.push(`// Agrega un componente a una celda de grid (fill horizontal)`);
  L.push(`async function addGridCell(row, key) {`);
  L.push(`  const inst = await li(key);`);
  L.push(`  row.appendChild(inst);`);
  L.push(`  inst.layoutSizingHorizontal = 'FILL';`);
  L.push(`  return inst;`);
  L.push(`}`);
  L.push(``);
  L.push(`// Aplica contenido de texto a una instancia`);
  L.push(`async function setText(inst, text, cfg) {`);
  L.push(`  if (!text || !cfg) return;`);
  L.push(`  try {`);
  L.push(`    if (cfg.type === 'prop') {`);
  L.push(`      inst.setProperties({ [cfg.key]: text });`);
  L.push(`    } else if (cfg.type === 'node') {`);
  L.push(`      const nodes = inst.findAll(n => n.type === 'TEXT' && n.name === cfg.name);`);
  L.push(`      const target = nodes[cfg.index ?? 0];`);
  L.push(`      if (target) { await figma.loadFontAsync(target.fontName); target.characters = text; }`);
  L.push(`    }`);
  L.push(`  } catch(e) { console.warn('setText error:', inst.name, e.message); }`);
  L.push(`}`);
  L.push(``);
  L.push(`// ── Pantallas ────────────────────────────────────────────────`);

  let missingKeys = [];

  for (let i = 0; i < pantallas.length; i++) {
    const screen   = pantallas[i];
    const varName  = varNames[i];
    const offsetX  = i * (FRAME_W + GAP);
    const screenId = screen.id     || `screen_${String(i + 1).padStart(2, '0')}`;
    const nombre   = screen.nombre || screenId;

    L.push(``);
    L.push(`// ── ${screenId} · ${nombre} ${'─'.repeat(Math.max(0, 46 - screenId.length - nombre.length))}`);
    L.push(`const ${varName} = makeFrame('${screenId} · ${nombre}', ${offsetX});`);

    // ── Determinar secciones ──────────────────────────────────
    // Si el DS3 tiene secciones explícitas, usarlas.
    // Si no, agrupar por el campo "seccion" de cada componente.
    // Si tampoco hay "seccion", auto-detectar por tipo de componente.
    const secciones = _buildSections(screen);

    let sectionIdx = 0;
    for (const section of secciones) {
      sectionIdx++;
      const secVar = `${varName}_sec${sectionIdx}`;
      const secName = section.nombre || `section_${sectionIdx}`;
      const layout = section.layout || 'stack';

      if (layout === 'grid-2col') {
        // ── Grid 2 columnas ──────────────────────────────────
        L.push(``);
        L.push(`// Section: ${secName} (grid 2-col)`);
        L.push(`const ${secVar} = makeSection(${varName}, '${secName}', { padH: T.padH, gap: T.gridGap });`);

        const comps = section.componentes || [];
        for (let c = 0; c < comps.length; c += 2) {
          const rowVar = `${secVar}_r${Math.floor(c / 2)}`;
          L.push(`const ${rowVar} = makeGridRow(${secVar});`);

          // Cell 1
          _emitComponent(L, comps[c], rowVar, missingKeys, screenId, true);
          // Cell 2 (if exists)
          if (c + 1 < comps.length) {
            _emitComponent(L, comps[c + 1], rowVar, missingKeys, screenId, true);
          }
        }

      } else if (layout === 'scroll-h') {
        // ── Scroll horizontal ────────────────────────────────
        L.push(``);
        L.push(`// Section: ${secName} (scroll horizontal)`);
        L.push(`const ${secVar} = makeScrollH(${varName}, '${secName}');`);

        for (const comp of (section.componentes || [])) {
          _emitComponent(L, comp, secVar, missingKeys, screenId, false);
        }

      } else if (layout === 'sticky-bottom') {
        // ── Sticky bottom ────────────────────────────────────
        // Se agrega al final con spacer para empujar al fondo
        L.push(``);
        L.push(`// Section: ${secName} (sticky bottom)`);
        L.push(`// Spacer para empujar el sticky al fondo`);
        L.push(`{ const _sp = figma.createFrame(); _sp.name = '_spacer'; _sp.layoutMode = 'VERTICAL';`);
        L.push(`  _sp.primaryAxisSizingMode = 'FIXED'; _sp.counterAxisSizingMode = 'FIXED';`);
        L.push(`  _sp.resize(1, 1); _sp.fills = []; ${varName}.appendChild(_sp);`);
        L.push(`  _sp.layoutSizingHorizontal = 'FILL'; _sp.layoutGrow = 1; }`);
        L.push(`const ${secVar} = makeSection(${varName}, '${secName}', { gap: ${SP.s || 4} });`);

        for (const comp of (section.componentes || [])) {
          _emitComponent(L, comp, secVar, missingKeys, screenId, false);
        }

      } else {
        // ── Stack vertical (default) ─────────────────────────
        // Para secciones con un solo componente full-width (header, nav),
        // no creamos wrapper extra — va directo al frame.
        const comps = section.componentes || [];
        const isSingleFullWidth = comps.length === 1 && !section.padded;

        if (isSingleFullWidth) {
          L.push(``);
          L.push(`// Section: ${secName} (single)`);
          _emitComponent(L, comps[0], varName, missingKeys, screenId, false);
        } else {
          const padOpt = section.padded ? 'T.padH' : '0';
          L.push(``);
          L.push(`// Section: ${secName}`);
          L.push(`const ${secVar} = makeSection(${varName}, '${secName}', { padH: ${padOpt}, gap: T.itemGap });`);

          for (const comp of comps) {
            _emitComponent(L, comp, secVar, missingKeys, screenId, false);
          }
        }
      }
    }
  }

  // ── Brand mode ────────────────────────────────────────────────
  const BRAND_MODE_VAR_KEY = '547b5471cbd40f24ea2fc90355ef9e9c7f952645';
  const marca = ds3Data.marca || '';
  L.push(``);
  L.push(`// ── Brand mode: ${marca} ─────────────────────────────────────`);
  L.push(`try {`);
  L.push(`  const _bv = await figma.variables.importVariableByKeyAsync('${BRAND_MODE_VAR_KEY}');`);
  L.push(`  const _bc = figma.variables.getVariableCollectionById(_bv.variableCollectionId);`);
  L.push(`  const _bm = _bc.modes.find(m => m.name === ${JSON.stringify(marca)});`);
  L.push(`  if (_bm) { for (const _f of [${varNames.join(', ')}]) { _f.setExplicitVariableModeForCollection(_bc, _bm.modeId); } }`);
  L.push(`} catch(e) { console.warn('Brand mode error:', e.message); }`);

  L.push(``);
  L.push(`// ── Finalizar ────────────────────────────────────────────────`);
  L.push(`figma.viewport.scrollAndZoomIntoView([${varNames.join(', ')}]);`);
  L.push(`return { created: [${varNames.map(v => `${v}.name`).join(', ')}] };`);

  return { script: L.join('\n'), missingKeys };
}

// ── Helper: emitir componente como línea de script ───────────
function _emitComponent(L, comp, parentVar, missingKeys, screenId, isGridCell) {
  const rol = comp.nombre_intencional || comp.rol || comp.nombre || '';

  // Composiciones → crear sub-frame con sus componentes
  if (comp.tipo === 'composicion') {
    const subComps = comp.composicion || [];
    if (subComps.length === 0) {
      L.push(`// TODO [composición sin sub-componentes]: ${rol}`);
      return;
    }

    L.push(`{ // Composición: ${rol}`);
    L.push(`  const _cf = figma.createFrame();`);
    L.push(`  _cf.name = ${JSON.stringify(rol || 'Composicion')};`);
    L.push(`  _cf.layoutMode = 'VERTICAL';`);
    L.push(`  _cf.primaryAxisSizingMode = 'AUTO'; _cf.counterAxisSizingMode = 'FIXED';`);
    L.push(`  _cf.itemSpacing = ${TOKENS.spacing.s || 4}; _cf.fills = [];`);
    L.push(`  ${parentVar}.appendChild(_cf);`);
    L.push(`  _cf.layoutSizingHorizontal = 'FILL';`);

    for (const sub of subComps) {
      const subName = sub.componente || sub.component || '';
      if (!subName) continue;
      const entry = catalog.get(subName);
      if (!entry || !entry.figmaKey) {
        missingKeys.push(`${screenId}: "${subName}" (en composición ${rol})`);
        L.push(`  // ⚠️ Sin figmaKey: "${subName}"`);
        continue;
      }
      L.push(`  { const _si = await li('${entry.figmaKey}'); _cf.appendChild(_si); _si.layoutSizingHorizontal = 'FILL'; }`);
    }
    L.push(`}`);
    return;
  }

  const compName = comp.componente;
  if (!compName) {
    L.push(`// TODO [sin nombre]: ${JSON.stringify(comp).substring(0, 80)}`);
    return;
  }

  const entry = catalog.get(compName);
  if (!entry || !entry.figmaKey) {
    missingKeys.push(`${screenId}: "${compName}"`);
    L.push(`// ⚠️ Sin figmaKey en catálogo: "${compName}" — agregar manualmente`);
    return;
  }

  const contenido = comp.contenido || '';
  const hasText = contenido && entry.textConfig;

  if (isGridCell) {
    // Grid cell: usar addGridCell
    if (hasText) {
      L.push(`{ const _i = await addGridCell(${parentVar}, '${entry.figmaKey}'); await setText(_i, ${JSON.stringify(contenido)}, ${JSON.stringify(entry.textConfig)}); } // ${rol}`);
    } else {
      L.push(`await addGridCell(${parentVar}, '${entry.figmaKey}'); // ${rol}`);
    }
  } else {
    // Normal: usar addComp
    if (hasText) {
      L.push(`{ const _i = await addComp(${parentVar}, '${entry.figmaKey}', '${entry.layoutType}'); await setText(_i, ${JSON.stringify(contenido)}, ${JSON.stringify(entry.textConfig)}); } // ${rol}`);
    } else {
      L.push(`await addComp(${parentVar}, '${entry.figmaKey}', '${entry.layoutType}'); // ${rol}`);
    }
  }
}

// ── Helper: construir secciones desde pantalla ───────────────
// Soporta 3 modos:
//   1. pantalla.secciones → array explícito (DS3 v2)
//   2. componentes con campo "seccion" → agrupar
//   3. auto-detección por nombre/tipo de componente
function _buildSections(screen) {
  // Modo 1: secciones explícitas
  if (Array.isArray(screen.secciones) && screen.secciones.length > 0) {
    return screen.secciones;
  }

  const componentes = screen.componentes || [];
  if (componentes.length === 0) return [];

  // Modo 2: agrupar por campo "seccion"
  const hasSeccionField = componentes.some(c => c.seccion);
  if (hasSeccionField) {
    const groups = [];
    let current = null;
    for (const comp of componentes) {
      const secId = comp.seccion || '_default';
      if (!current || current._id !== secId) {
        current = {
          _id: secId,
          nombre: secId,
          layout: comp.layout_seccion || 'stack',
          padded: comp.padded_seccion !== false,
          componentes: []
        };
        groups.push(current);
      }
      current.componentes.push(comp);
    }
    return groups;
  }

  // Modo 3: auto-detección inteligente
  return _autoDetectSections(componentes);
}

// ── Auto-detección de secciones por tipo de componente ───────
// Heurísticas basadas en nombres comunes de Prisma-Components
function _autoDetectSections(componentes) {
  const sections = [];
  let currentSection = null;

  // Patrones para detectar tipo de sección
  const HEADER_PATTERNS = /^(TopBar|NavBar|Navigation|StatusBar|Header|SearchBar)/i;
  const STICKY_PATTERNS = /^(BottomBar|TabBar|StickyButton|BottomSheet|FloatingAction|NavigationBar)/i;
  const CHIP_PATTERNS   = /^(Chip|Tag|Filter|CategoryPill|SegmentedControl|TabButton)/i;
  const CARD_PATTERNS   = /^(ProductCard|Card_product|Promo_card|ItemCard|CategoryCard)/i;
  const TITLE_PATTERNS  = /^(TitleSection|SectionHeader|Title_section|Subtitle)/i;

  function pushSection(nombre, layout, padded, comps) {
    if (comps.length > 0) {
      sections.push({ nombre, layout, padded, componentes: [...comps] });
    }
  }

  let headerComps = [];
  let bodyComps = [];
  let stickyComps = [];
  let inHeader = true;

  // Primer paso: separar header, body, sticky
  for (const comp of componentes) {
    const name = comp.componente || comp.nombre_intencional || '';

    if (STICKY_PATTERNS.test(name)) {
      stickyComps.push(comp);
      continue;
    }

    if (inHeader && HEADER_PATTERNS.test(name)) {
      headerComps.push(comp);
      continue;
    }

    // Al encontrar el primer componente no-header, salimos de header
    inHeader = false;
    bodyComps.push(comp);
  }

  // Emitir header (cada componente como su propia sección full-width)
  for (const comp of headerComps) {
    pushSection('header', 'stack', false, [comp]);
  }

  // Segundo paso: agrupar body en secciones por tipo
  let cardBuffer = [];
  let chipBuffer = [];

  function flushCards() {
    if (cardBuffer.length > 0) {
      pushSection('product_grid', 'grid-2col', true, cardBuffer);
      cardBuffer = [];
    }
  }

  function flushChips() {
    if (chipBuffer.length > 0) {
      pushSection('quick_filters', 'scroll-h', false, chipBuffer);
      chipBuffer = [];
    }
  }

  let generalBuffer = [];
  function flushGeneral() {
    if (generalBuffer.length > 0) {
      pushSection('content', 'stack', true, generalBuffer);
      generalBuffer = [];
    }
  }

  for (const comp of bodyComps) {
    const name = comp.componente || comp.nombre_intencional || '';

    if (CARD_PATTERNS.test(name)) {
      flushChips();
      flushGeneral();
      cardBuffer.push(comp);
      continue;
    }

    if (CHIP_PATTERNS.test(name)) {
      flushCards();
      flushGeneral();
      chipBuffer.push(comp);
      continue;
    }

    if (TITLE_PATTERNS.test(name)) {
      // Titles break card/chip runs but start a new general section
      flushCards();
      flushChips();
      flushGeneral();
      generalBuffer.push(comp);
      continue;
    }

    // Default: general content
    flushCards();
    flushChips();
    generalBuffer.push(comp);
  }

  flushCards();
  flushChips();
  flushGeneral();

  // Emitir sticky bottom
  if (stickyComps.length > 0) {
    pushSection('sticky_bottom', 'sticky-bottom', false, stickyComps);
  }

  return sections;
}

async function handleCreateScreensFromDS3({ ds3_json, figma_file_url }) {
  let ds3Data;
  try {
    ds3Data = JSON.parse(ds3_json);
  } catch {
    throw new Error('JSON inválido. Verificá que pegaste el packets.ds3 completo.');
  }

  const result = builder.buildFromDS3(ds3Data);
  const { script: figmaScript, missingKeys } = generateFigmaScript(ds3Data);
  const lines = [];

  lines.push(`# 🎨 DS3 → Figma — Procesamiento completado`);
  lines.push(``);
  lines.push(`**Proyecto:** ${ds3Data.proyecto || '—'}`);
  lines.push(`**Marca:** ${ds3Data.marca || '—'} · **Dirección:** ${ds3Data.direccion || '—'}`);
  lines.push(`**Pantallas:** ${result.screens.length} · **Componentes:** ${result.totalComponents} (${result.resolved} resueltos, ${result.placeholders} placeholders)`);
  lines.push(``);

  // ── Script use_figma — FLUJO PRINCIPAL ────────────────────────
  lines.push(`## 🚀 Script use_figma — Creación directa en Figma`);
  lines.push(``);
  if (figma_file_url) {
    lines.push(`**Archivo destino:** ${figma_file_url}`);
    lines.push(``);
  }
  lines.push(`Ejecutar via \`use_figma\` para crear las ${result.screens.length} pantalla(s) directamente:`);
  lines.push(``);
  lines.push(`\`\`\`javascript`);
  lines.push(figmaScript);
  lines.push(`\`\`\``);
  lines.push(``);
  if (missingKeys.length > 0) {
    lines.push(`> ⚠️ **${missingKeys.length} componente(s) sin figmaKey** — quedan como comentarios TODO en el script:`);
    missingKeys.forEach(k => lines.push(`> • ${k}`));
    lines.push(``);
  }
  lines.push(`---`);
  lines.push(``);

  // Coverage table
  lines.push(`## Cobertura por pantalla`);
  lines.push(``);
  lines.push(`| Pantalla | Componentes | Resueltos | Locales | Fidelidad |`);
  lines.push(`|---|---|---|---|---|`);
  for (const s of result.screens) {
    const fid = s.local > 0 ? '🟡 Aproximada' : '✅ Fiel';
    lines.push(`| ${s.id} · ${s.nombre} | ${s.total} | ${s.resolved} | ${s.local} | ${fid} |`);
  }
  lines.push(``);

  // New components
  if (result.newComponents.length > 0) {
    lines.push(`## ⚠️ Componentes nuevos (crear en Figma)`);
    lines.push(``);
    for (const nc of result.newComponents) {
      lines.push(`### ${nc.name}`);
      lines.push(`${nc.description}`);
      lines.push(``);
      lines.push(`**Composición DS3:**`);
      lines.push(`\`\`\`json`);
      lines.push(JSON.stringify(nc.composicion, null, 2));
      lines.push(`\`\`\``);
      lines.push(``);
      lines.push(`**Prompt Figma Make:**`);
      lines.push(`\`\`\``);
      lines.push(nc.figmaMakePrompt);
      lines.push(`\`\`\``);
      lines.push(``);
    }
  }

  // Warnings
  if (result.warnings.length > 0) {
    lines.push(`## Warnings`);
    lines.push(``);
    result.warnings.forEach(w => lines.push(`• ${w}`));
    lines.push(``);
  }

  // Enhanced JSON (fallback para Prisma Builder)
  lines.push(`## Fallback — JSON para Prisma Builder`);
  lines.push(``);
  lines.push(`Si preferís usar el plugin, pegá este JSON en Prisma Builder${figma_file_url ? ` → ${figma_file_url}` : ''}:`);
  lines.push(``);
  lines.push(`\`\`\`json`);
  lines.push(JSON.stringify(result.enhancedJson, null, 2));
  lines.push(`\`\`\``);

  return { content: [{ type: 'text', text: lines.join('\n') }] };
}

async function handleCreateScreensFromPrompts({ prompts, marca, plataforma, figma_file_url }) {
  const lines = [];
  lines.push(`# 🔄 Prompts → DS3 JSON`);
  lines.push(``);
  lines.push(`Procesando ${prompts.length} pantalla(s)...`);
  lines.push(``);

  // Inferir componentes de cada prompt
  const pantallas = prompts.map((p, i) => {
    const componentes = resolver.inferFromPrompt(p.prompt || p.descripcion || p.nombre);
    return {
      id: p.id || `P${String(i + 1).padStart(2, '0')}`,
      nombre: p.nombre,
      descripcion: (p.prompt || '').substring(0, 120),
      layout: {
        direction: 'vertical', gap: 0,
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        clipContent: true, primaryAxisSizing: 'auto', counterAxisSizing: 'fixed',
        width: 390, backgroundColor: '#FFFFFF'
      },
      componentes
    };
  });

  const ds3Data = {
    version: '2.0',
    proyecto: 'Generado desde prompts',
    marca: marca || 'Jumbo',
    plataforma: plataforma || 'iOS',
    flujo: 'Desde prompts DS3',
    direccion: 'B',
    pantallas
  };

  // Mostrar el JSON generado
  lines.push(`## DS3 JSON inferido`);
  lines.push(``);
  lines.push(`\`\`\`json`);
  lines.push(JSON.stringify(ds3Data, null, 2));
  lines.push(`\`\`\``);
  lines.push(``);
  lines.push(`---`);
  lines.push(``);

  // Procesar igual que create_screens_from_ds3
  const result = builder.buildFromDS3(ds3Data);

  lines.push(`## Resultado: ${result.screens.length} pantalla(s) procesada(s)`);
  lines.push(`• Componentes resueltos: ${result.resolved}/${result.totalComponents}`);
  lines.push(`• Componentes locales nuevos: ${result.newComponents.length}`);
  lines.push(``);

  if (result.newComponents.length > 0) {
    lines.push(`## Componentes nuevos a crear`);
    for (const nc of result.newComponents) {
      lines.push(`\n**${nc.name}** — ${nc.description}`);
      lines.push(`\`\`\`\n${nc.figmaMakePrompt}\n\`\`\``);
    }
    lines.push(``);
  }

  lines.push(`## JSON para Prisma Builder`);
  lines.push(`\`\`\`json`);
  lines.push(JSON.stringify(result.enhancedJson, null, 2));
  lines.push(`\`\`\``);

  return { content: [{ type: 'text', text: lines.join('\n') }] };
}

async function handleListComponents({ filter, group }) {
  const components = catalog.list(filter, group);
  const groups = catalog.getGroups();

  if (components.length === 0) {
    return {
      content: [{
        type: 'text',
        text: `No hay componentes${filter ? ` para "${filter}"` : ''}.\n\nGrupos disponibles: ${groups.join(', ')}`
      }]
    };
  }

  const grouped = groupBy(components, c => c.group);
  const lines = [`## Componentes Prisma (${components.length})\n`];

  for (const [g, comps] of Object.entries(grouped)) {
    lines.push(`**${g}**`);
    comps.forEach(c => lines.push(`  • \`${c.name}\``));
    lines.push('');
  }

  return { content: [{ type: 'text', text: lines.join('\n') }] };
}

async function handleResolveComponent({ description }) {
  const matches = resolver.findByDescription(description);

  if (matches.length === 0) {
    const spec = resolver.createLocalComponentSpec(description, description, 'iOS', 'Jumbo');
    return {
      content: [{
        type: 'text',
        text: [
          `No encontré un componente Prisma exacto para: "${description}"`,
          ``,
          `**Recomendación:** Crear como componente local con esta composición:`,
          `\`\`\`json`,
          JSON.stringify(spec.composicion, null, 2),
          `\`\`\``,
          ``,
          `O usá \`create_local_component_spec\` para una spec completa con prompt de Figma Make.`
        ].join('\n')
      }]
    };
  }

  const best = matches[0];
  const alts = matches.slice(1, 3);

  return {
    content: [{
      type: 'text',
      text: [
        `**✅ Mejor match:** \`${best.name}\``,
        `Grupo: ${best.group} · Confianza: ${best.score}%`,
        ``,
        alts.length > 0
          ? `**Alternativas:**\n${alts.map(a => `• \`${a.name}\` (${a.score}%)`).join('\n')}`
          : '',
        ``,
        `**Uso en DS3 JSON:**`,
        `\`\`\`json`,
        JSON.stringify({
          orden: 1,
          componente: best.name,
          rol: description,
          sizing: { horizontal: 'fill', vertical: 'hug' }
        }, null, 2),
        `\`\`\``
      ].filter(Boolean).join('\n')
    }]
  };
}

async function handleCreateLocalComponentSpec({ name, description, platform, brand }) {
  const spec = resolver.createLocalComponentSpec(name, description, platform || 'iOS', brand || 'Jumbo');

  return {
    content: [{
      type: 'text',
      text: [
        `## ⚠️ Spec: ${name}`,
        ``,
        `*No existe en Prisma-Components — crear como componente local*`,
        ``,
        `### Composición DS3`,
        `\`\`\`json`,
        JSON.stringify(spec.composicion, null, 2),
        `\`\`\``,
        ``,
        `### Prompt para Figma Make`,
        `\`\`\``,
        spec.figmaMakePrompt,
        `\`\`\``,
        ``,
        `### Instrucciones`,
        `1. En Figma Make, pegá el prompt de arriba`,
        `2. Nombrá el componente exactamente \`${name}\``,
        `3. Guardalo como componente local (no publicar en Prisma-Components aún)`,
        `4. Una vez aprobado, publicarlo en la librería`
      ].join('\n')
    }]
  };
}

async function handleGetFigmaFileInfo({ file_url }) {
  const fileKey = extractFileKey(file_url);
  if (!fileKey) throw new Error('URL de Figma inválida.');

  const info = await figmaApi.getFileInfo(fileKey);

  return {
    content: [{
      type: 'text',
      text: [
        `**Archivo:** ${info.name}`,
        `**Páginas:** ${info.pages.join(', ')}`,
        `**Última modificación:** ${info.lastModified}`,
        `**Versión:** ${info.version}`,
        `**Componentes locales:** ${info.componentCount}`
      ].join('\n')
    }]
  };
}

async function handleValidateDS3Json({ ds3_json }) {
  let ds3Data;
  try {
    ds3Data = JSON.parse(ds3_json);
  } catch {
    throw new Error('JSON inválido. No es un JSON parseable.');
  }

  const validation = builder.validate(ds3Data);
  const lines = [];

  lines.push(`# Validación DS3 JSON`);
  lines.push(``);
  lines.push(`**Pantallas:** ${validation.screens} · **Componentes total:** ${validation.totalComponents}`);
  lines.push(`**Válidos:** ✅ ${validation.valid} · **Warnings:** 🟡 ${validation.warnings.length} · **Errores:** ❌ ${validation.errors.length}`);
  lines.push(``);

  if (validation.errors.length > 0) {
    lines.push(`## ❌ Errores`);
    validation.errors.forEach(e => {
      lines.push(`- **${e.screen} · ${e.component}**: ${e.message}`);
      if (e.suggestion) lines.push(`  → Sugerencia: \`${e.suggestion}\``);
    });
    lines.push(``);
  }

  if (validation.warnings.length > 0) {
    lines.push(`## 🟡 Warnings`);
    validation.warnings.forEach(w => lines.push(`- ${w}`));
    lines.push(``);
  }

  if (validation.errors.length === 0 && validation.warnings.length === 0) {
    lines.push(`✅ JSON válido — listo para usar con Prisma Builder`);
  }

  return { content: [{ type: 'text', text: lines.join('\n') }] };
}

// ── Utils ─────────────────────────────────────────────────────

function extractFileKey(url) {
  const match = url?.match(/figma\.com\/(file|design)\/([a-zA-Z0-9]+)/);
  return match ? match[2] : null;
}

function groupBy(arr, fn) {
  return arr.reduce((acc, item) => {
    const key = fn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

// ── Start ─────────────────────────────────────────────────────
const transport = new StdioServerTransport();
await server.connect(transport);
process.stderr.write('✅ Prisma MCP Server iniciado\n');
