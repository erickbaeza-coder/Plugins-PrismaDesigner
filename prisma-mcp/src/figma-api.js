// ============================================================
// Figma REST API Client
// Docs: https://www.figma.com/developers/api
// ============================================================

const FIGMA_BASE = 'https://api.figma.com/v1';

export class FigmaAPI {
  constructor(token) {
    this.token = token;
  }

  /** GET genérico a la Figma API */
  async get(path) {
    if (!this.token) throw new Error('FIGMA_TOKEN no configurado. Agregalo en las variables de entorno del MCP.');

    const res = await fetch(`${FIGMA_BASE}${path}`, {
      headers: { 'X-Figma-Token': this.token }
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Figma API error ${res.status}: ${body || res.statusText}`);
    }

    return res.json();
  }

  /** Información básica de un archivo */
  async getFileInfo(fileKey) {
    const data = await this.get(`/files/${fileKey}?depth=1`);
    return {
      name: data.name,
      lastModified: data.lastModified,
      version: data.version,
      pages: (data.document?.children || []).map(p => p.name),
      componentCount: Object.keys(data.components || {}).length
    };
  }

  /** Todos los componentes publicados de un archivo (variants individuales) */
  async getFileComponents(fileKey) {
    const data = await this.get(`/files/${fileKey}/components`);
    const meta = data.meta || {};
    const components = meta.components || [];

    return components.map(c => ({
      key: c.key,
      name: c.name,
      description: c.description || '',
      group: extractGroup(c.containing_frame?.name || c.name),
      containingFrame: c.containing_frame?.name || '',
      componentSetId: c.component_set_id || null
    }));
  }

  /**
   * v4: índice de una librería. Fuente de verdad = /component_sets (nombres reales Wl*).
   * Las variantes (/components) se unen a su set por containing_frame.containingStateGroup.nodeId,
   * porque component_set_id viene vacío en esa respuesta.
   * Devuelve { library, fileKey, sets, stats }. Ver buildLibraryIndex().
   */
  async getLibraryIndex(fileKey, library = 'app') {
    const [cData, sData] = await Promise.all([
      this.get(`/files/${fileKey}/components`),
      this.get(`/files/${fileKey}/component_sets`)
    ]);
    return buildLibraryIndex(
      cData.meta?.components || [],
      sData.meta?.component_sets || [],
      { library, fileKey }
    );
  }

  /** Compat: mapa de sets de una librería (formato v3.2). */
  async getComponentSetsWithVariants(fileKey, library = 'app') {
    return (await this.getLibraryIndex(fileKey, library)).sets;
  }

  /** Componente específico por key */
  async getComponent(componentKey) {
    return this.get(`/components/${componentKey}`);
  }

  /** Variables de un archivo (brand tokens) */
  async getVariables(fileKey) {
    try {
      const data = await this.get(`/files/${fileKey}/variables/local`);
      return data.meta || {};
    } catch {
      return {}; // Variables API puede no estar disponible en todos los planes
    }
  }
}

// Variantes que NO deben ser el "default" de un set (se piden explícitamente).
const NON_DEFAULT_TOKENS = ['skeleton', 'error', 'disabled', 'loading', 'swipe', 'pressed', 'hover', 'focus', 'empty'];

/** Puntaje de una variante como candidata a default (mayor = mejor). */
export function defaultScore(propsStr) {
  const parts = (propsStr || '').toLowerCase().split(',').map(p => p.trim());
  let score = 0;
  for (const p of parts) {
    const value = p.split('=').pop();
    if (value === 'default') score += 10;
    if (NON_DEFAULT_TOKENS.some(t => value.includes(t))) score -= 10;
  }
  return score;
}

/** Elige la key de la variante "default" de un set (no la primera que llegue de la API). */
export function pickDefaultKey(variants) {
  let best = null;
  let bestScore = -Infinity;
  for (const [props, key] of Object.entries(variants)) {
    const s = defaultScore(props);
    if (s > bestScore) { best = key; bestScore = s; }
  }
  return best;
}

/**
 * Construye el índice de una librería a partir de las respuestas de la API.
 * Pura (sin red) para poder probarla.
 *
 * sets: {
 *   "wlproductcardcart": {
 *     displayName: "WlProductCardCart", library, fileKey, setKey, setNodeId, group,
 *     variants: { "type=default": "<key>", ... }, _default: "<key>", standalone?: true
 *   }
 * }
 */
export function buildLibraryIndex(components, componentSets, { library = 'app', fileKey = '' } = {}) {
  const sets = {};
  const byNode = new Map();
  const stats = { sets: 0, variants: 0, linked: 0, standalone: 0, orphanGroups: 0, duplicateNames: 0, skipped: 0 };

  const uniqueKey = (display, nodeId) => {
    const base = normalizeSetName(display);
    if (!sets[base]) return base;
    stats.duplicateNames++;
    return `${base}~${(nodeId || '').replace(/[^0-9a-z]/gi, '')}`;
  };

  for (const s of componentSets) {
    const k = uniqueKey(s.name, s.node_id);
    sets[k] = {
      displayName: s.name,
      library,
      fileKey,
      setKey: s.key,
      setNodeId: s.node_id,
      group: s.containing_frame?.name || 'Other',
      variants: {}
    };
    byNode.set(s.node_id, k);
  }

  for (const c of components) {
    const stateGroup = c.containing_frame?.containingStateGroup;
    const groupNode = stateGroup?.nodeId;
    const props = normalizeVariantProps(c.name);
    stats.variants++;

    if (groupNode && byNode.has(groupNode)) {
      sets[byNode.get(groupNode)].variants[props] = c.key;
      stats.linked++;
      continue;
    }

    if (groupNode && stateGroup?.name) {
      // Set no publicado como component_set: agrupar por el nombre del state group.
      let k = byNode.get(`orphan:${groupNode}`);
      if (!k) {
        k = uniqueKey(stateGroup.name, groupNode);
        sets[k] = {
          displayName: stateGroup.name, library, fileKey, setKey: null, setNodeId: groupNode,
          group: c.containing_frame?.name || 'Other', variants: {}, orphan: true
        };
        byNode.set(`orphan:${groupNode}`, k);
        stats.orphanGroups++;
      }
      sets[k].variants[props] = c.key;
      continue;
    }

    // Componente suelto (sin variantes): set de una sola variante.
    const name = c.name || '';
    if (/^[._]/.test(name) || /^[A-Z0-9 ]{8,}$/.test(name)) { stats.skipped++; stats.variants--; continue; }
    const k = uniqueKey(name, c.node_id);
    sets[k] = {
      displayName: name, library, fileKey, setKey: null, setNodeId: c.node_id || null,
      group: c.containing_frame?.name || 'Other', variants: { default: c.key }, standalone: true
    };
    stats.standalone++;
  }

  for (const set of Object.values(sets)) {
    set._default = pickDefaultKey(set.variants);
  }
  // Sets sin ninguna variante no sirven para resolver nada
  for (const [k, set] of Object.entries(sets)) {
    if (!set._default) delete sets[k];
  }
  stats.sets = Object.keys(sets).length;
  return { library, fileKey, sets, stats };
}

/** Arma el contenido de prisma-keys.json (v4) a partir de { id: { fileKey, name, syncedAt, sets } }. */
export function buildKeysFile(libraries) {
  const meta = {
    version: 4,
    syncedAt: new Date().toISOString(),
    libraries: Object.fromEntries(Object.entries(libraries).map(([id, l]) => [id, {
      fileKey: l.fileKey, name: l.name, syncedAt: l.syncedAt,
      sets: Object.keys(l.sets).length,
      variants: Object.values(l.sets).reduce((n, s) => n + Object.keys(s.variants).length, 0)
    }]))
  };
  return { _meta: meta, libraries };
}

/** Extrae el grupo (primer nivel de la jerarquía de frames) */
function extractGroup(frameName) {
  if (!frameName) return 'Other';
  const parts = frameName.split(/[/\\]/);
  return parts[0].trim();
}

/**
 * Normaliza el nombre de un component set para lookup.
 * "WlProductCard" → "wlproductcard"
 * "Product Card" → "productcard"
 */
export function normalizeSetName(name) {
  return (name || '').toLowerCase().replace(/[\s_\-]/g, '');
}

/**
 * Normaliza las propiedades de un variant para lookup.
 * "Type=PLP, State=Default" → "type=plp, state=default"
 * Ordena las propiedades para que el orden no importe.
 */
export function normalizeVariantProps(propsStr) {
  if (!propsStr) return '';
  return propsStr
    .toLowerCase()
    .split(',')
    .map(p => p.trim())
    .sort()
    .join(', ');
}
