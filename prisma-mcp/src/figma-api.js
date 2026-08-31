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

  /** Todos los componentes publicados de un archivo */
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

/** Extrae el grupo (primer nivel de la jerarquía de frames) */
function extractGroup(frameName) {
  if (!frameName) return 'Other';
  // Nombres de frame suelen ser "Grupo / Componente" o "Grupo"
  const parts = frameName.split(/[/\\]/);
  return parts[0].trim();
}
