# Prisma Designer v3.2.0 — Fix Sync + Error Visibility

**Fecha:** 6 de octubre 2026  
**Plugin:** `prisma-designer-v3.2.0.plugin`

---

## Problemas corregidos

### 1. CONNECTION_CLOSED — MCP nunca conectaba

**Causa raíz:** `.mcp.json` tenía una ruta incorrecta (`/Users/ebaezaroa/Desktop/Cencosud 2026/...`) que no coincidía con la ruta real del sistema.

**Fix:** Corregida la ruta a `/Users/erickbaezaroa/Desktop/Proyectos Claude/...`

Esto bloqueaba el 100% de las funciones del MCP. Ahora conecta correctamente.

---

### 2. Componentes con "Swap Component" amarillo en Figma

**Causa raíz (v3.1):** `importComponentByKeyAsync(key)` recibía keys desactualizadas del catálogo base. El motivo era que `sync_prisma_library` guardaba `prisma-keys.json` en un formato plano sin contexto del component set:
```json
{ "type=plp, state=default": "6db0812c..." }
```
Las keys de distintos component sets podían pisar las mismas propiedades (ej: dos componentes con `"state=default"`).

**Fix v3.2:** `figma-api.js` ahora usa `getComponentSetsWithVariants()` que estructura los datos correctamente:
```json
{
  "wlproductcard": {
    "displayName": "WlProductCard",
    "_default": "6db0812c...",
    "variants": {
      "state=default, type=plp": "6db0812c...",
      "state=skeleton, type=plp": "0d77..."
    }
  }
}
```

Esto elimina las colisiones entre component sets y permite lookups precisos.

---

### 3. Fallos silenciosos (frames amarillos sin diagnóstico)

**Causa raíz:** Cuando un componente no tenía `figmaKey` en el catálogo, el generador emitía un comentario `// ⚠️ Sin figmaKey` que simplemente desaparecía. Cuando `importComponentByKeyAsync` fallaba con una key desactualizada, Figma creaba un "Swap Component" amarillo sin ningún texto.

**Fix v3.2:**

1. **Componente sin key en catálogo** → Crea un frame con borde rojo y texto "⚠️ MISSING: ComponentName — run /sync-prisma"

2. **Key inválida en Figma** → La función `li()` ahora tiene try/catch y crea un frame rojo con "❌ KEY_ERROR: key... — run /sync-prisma"

Ahora los fallos son visibles y diagnosticables directamente en el canvas de Figma.

---

## Mejoras de arquitectura

### Nuevo método `figma-api.js: getComponentSetsWithVariants(fileKey)`

Reemplaza el antiguo `getFileComponents` para el sync. Agrupa variantes por component set, normaliza las propiedades, y guarda el primer variant como `_default`.

### Nuevo método `prisma-catalog.js: updateFromFigmaV2(setsWithVariants)`

Actualización inteligente del catálogo usando el nuevo formato:
- Busca el component set correcto por `figmaSetName` (si está definido) o por fuzzy match del nombre
- Extrae las props del nombre del catálogo y busca el variant exacto
- Fallback a `_default` si no hay match exacto de props
- Agrega al catálogo los component sets nuevos que no existían

### Constructor retrocompatible

El constructor de `PrismaCatalog` detecta automáticamente si `prisma-keys.json` está en el nuevo formato (v3.2) o en el viejo formato plano (v3.1) y los maneja correctamente.

---

## Archivos modificados

- `prisma-designer/.mcp.json` — Fix ruta (causa raíz del CONNECTION_CLOSED)
- `prisma-mcp/src/figma-api.js` — `getComponentSetsWithVariants()`, `normalizeSetName()`, `normalizeVariantProps()`
- `prisma-mcp/src/index.js` — `handleSyncLibrary` reescrito + `li()` con try/catch + placeholder frames visibles
- `prisma-mcp/src/prisma-catalog.js` — `updateFromFigmaV2()`, `_resolveKeyFromSets()`, constructor mejorado, `figmaSetName` en entradas clave
- `version.json` — Bump a v3.2.0
- `releases/RELEASE_NOTES_v3.2.0.md` — este archivo

---

## Acción requerida después de actualizar

1. Reiniciar Cowork (para que el MCP reconnecte con la ruta corregida)
2. Ejecutar `/sync-prisma` con la URL del archivo Prisma-Components
3. Verificar cobertura (debería mostrar % de componentes con key)
4. Probar `/crear-pantallas` — los fallos ahora serán visibles como frames rojos

---

## Compatibilidad

- Retrocompatible con DS3 JSON de versiones anteriores
- `prisma-keys.json` viejo (formato plano) sigue funcionando durante la transición
- Requiere restart de Cowork para que `.mcp.json` tenga efecto
