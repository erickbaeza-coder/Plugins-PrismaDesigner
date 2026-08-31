// ============================================================
// DS3 Builder — Transforma DS3 JSON en specs listas para Figma
// ============================================================

// Grupos prohibidos (no existen en Figma)
const INVALID_GROUPS = ['atoms', 'molecules', 'organisms', 'headers', 'cards', 'nav'];

// Props inválidas conocidas
const INVALID_PROPS = {
  'TopBar': ['Type=Back'],
  'Banner_principal': ['Size=Xl'],
  'Promo_card': ['State=Brand'],
};

export class DS3Builder {
  constructor(resolver, catalog) {
    this.resolver = resolver;
    this.catalog = catalog;
  }

  /** Transforma DS3 JSON → resultado enriquecido */
  buildFromDS3(ds3Data) {
    const pantallas = this._extractPantallas(ds3Data);
    const screens = [];
    const newComponents = [];
    const warnings = [];
    let totalComponents = 0;
    let resolved = 0;
    let placeholders = 0;

    for (const pantalla of pantallas) {
      const componentes = pantalla.componentes || [];
      let pantallaResolved = 0;
      let pantallaLocal = 0;
      const enhancedComponents = [];

      for (const comp of componentes) {
        totalComponents++;

        // Composición
        if (comp.tipo === 'composicion') {
          pantallaLocal++;
          const spec = this._processComposition(comp, newComponents);
          enhancedComponents.push(spec);
          // Composiciones son "aproximadas" — no exactas
          warnings.push(`🔧 Componente nuevo: "${comp.nombre_intencional}" — crear con Figma Make`);
          continue;
        }

        // Componente normal
        const compName = comp.componente || comp.component || '';
        if (!compName) continue;

        // Validar
        const validationIssue = this._validateComponentName(compName);
        if (validationIssue) {
          warnings.push(`⚠️ ${pantalla.id || ''} · ${compName}: ${validationIssue}`);
        }

        // Verificar existencia en catálogo
        if (this.catalog.exists(compName)) {
          pantallaResolved++;
          resolved++;
        } else {
          placeholders++;
          warnings.push(`❓ No encontrado en catálogo: ${compName}`);
        }

        enhancedComponents.push({ ...comp });
      }

      screens.push({
        id: pantalla.id || `P${String(screens.length + 1).padStart(2, '0')}`,
        nombre: pantalla.nombre || pantalla.name || 'Pantalla',
        total: componentes.length,
        resolved: pantallaResolved,
        local: pantallaLocal
      });

      pantalla.componentes = enhancedComponents;
    }

    // JSON enriquecido — listo para Prisma Builder
    const enhancedJson = {
      ...ds3Data,
      version: '2.0',
      pantallas
    };

    return {
      screens,
      totalComponents,
      resolved,
      placeholders,
      newComponents: this._dedupeNewComponents(newComponents),
      warnings,
      enhancedJson
    };
  }

  /** Valida el DS3 JSON y reporta errores sin transformar */
  validate(ds3Data) {
    const pantallas = this._extractPantallas(ds3Data);
    const errors = [];
    const warnings = [];
    let totalComponents = 0;
    let valid = 0;

    for (const pantalla of pantallas) {
      const pantallaId = pantalla.id || pantalla.nombre || '?';

      for (const comp of (pantalla.componentes || [])) {
        if (comp.tipo === 'composicion') {
          totalComponents++;
          valid++;
          // Validar sub-componentes
          for (const sub of (comp.composicion || [])) {
            totalComponents++;
            if (this.catalog.exists(sub.componente)) {
              valid++;
            } else {
              errors.push({
                screen: pantallaId,
                component: sub.componente || '?',
                message: 'Sub-componente no encontrado en catálogo Prisma',
                suggestion: this._suggestAlternative(sub.componente)
              });
            }
          }
          continue;
        }

        totalComponents++;
        const compName = comp.componente || comp.component || '';
        if (!compName) {
          errors.push({ screen: pantallaId, component: '(sin nombre)', message: 'Componente sin nombre', suggestion: null });
          continue;
        }

        // Check grupo inválido
        const groupCheck = this._checkInvalidGroup(compName);
        if (groupCheck) {
          errors.push({ screen: pantallaId, component: compName, message: groupCheck, suggestion: this._suggestAlternative(compName) });
          continue;
        }

        // Check props inválidas
        const propCheck = this._validateComponentName(compName);
        if (propCheck) {
          warnings.push(`${pantallaId} · ${compName}: ${propCheck}`);
        }

        if (this.catalog.exists(compName)) {
          valid++;
        } else {
          errors.push({
            screen: pantallaId,
            component: compName,
            message: 'Componente no encontrado en catálogo Prisma',
            suggestion: this._suggestAlternative(compName)
          });
        }
      }
    }

    return {
      screens: pantallas.length,
      totalComponents,
      valid,
      errors,
      warnings
    };
  }

  // ── Private helpers ─────────────────────────────────────────

  _extractPantallas(ds3Data) {
    if (Array.isArray(ds3Data.pantallas)) return ds3Data.pantallas;
    if (Array.isArray(ds3Data.screens)) return ds3Data.screens;
    if (Array.isArray(ds3Data.direcciones)) return ds3Data.direcciones[0]?.pantallas || [];
    return [];
  }

  _processComposition(comp, newComponents) {
    const name = comp.nombre_intencional || 'ComponenteNuevo';
    const desc = comp.rol || comp.contenido || 'Componente nuevo';

    // Registrar para output
    const existing = newComponents.find(nc => nc.name === name);
    if (!existing) {
      const spec = this.resolver.createLocalComponentSpec(name, desc);
      newComponents.push({
        name,
        description: desc,
        composicion: spec.composicion,
        figmaMakePrompt: spec.figmaMakePrompt
      });
    }

    return { ...comp };
  }

  _validateComponentName(name) {
    // Check grupos inválidos
    const groupIssue = this._checkInvalidGroup(name);
    if (groupIssue) return groupIssue;

    // Check props inválidas conocidas
    for (const [compKey, invalidProps] of Object.entries(INVALID_PROPS)) {
      if (name.includes(compKey)) {
        const found = invalidProps.find(p => name.includes(p));
        if (found) return `Prop inválida: "${found}" no existe en ${compKey}`;
      }
    }

    return null;
  }

  _checkInvalidGroup(name) {
    if (!name.includes('>')) return null;
    const group = name.split('>')[0].trim().toLowerCase();
    if (INVALID_GROUPS.includes(group)) {
      return `Grupo "${group}" no existe en Figma. Usar el grupo real de Prisma-Components`;
    }
    return null;
  }

  _suggestAlternative(name) {
    const matches = this.resolver.findByDescription(name);
    return matches[0]?.name || null;
  }

  _dedupeNewComponents(list) {
    const seen = new Set();
    return list.filter(nc => {
      if (seen.has(nc.name)) return false;
      seen.add(nc.name);
      return true;
    });
  }
}
