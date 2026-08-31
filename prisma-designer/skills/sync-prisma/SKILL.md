---
name: sync-prisma
description: >
  Sincroniza el catálogo de componentes Prisma leyendo directamente el archivo
  de Figma. Úsala cuando el diseñador diga "/sync-prisma", "sincronizar librería",
  "sync prisma", "actualizar el catálogo", "los componentes no están actualizados"
  o cualquier variante que indique querer refrescar el catálogo de Prisma-Components
  desde Figma. Requiere que el MCP prisma-mcp esté conectado y FIGMA_TOKEN configurado.
---

## Qué hace esta skill

Lee el archivo Prisma-Components en Figma vía REST API y actualiza el catálogo
local del MCP con los keys reales de cada componente. Esto enriquece el JSON
generado por `/crear-pantallas` con los keys exactos de Figma.

## URL oficial de Prisma-Components · Cencosud

```
https://www.figma.com/design/LnYUTRFuwWpI9phwDCSHOx/Prisma-Components
```

Usar esta URL por defecto salvo que el diseñador indique otra explícitamente.

## Flujo de ejecución

### Paso 1 — Obtener la URL

Si el diseñador pegó una URL, usarla directamente.
Si no, usar la URL oficial de Cencosud y confirmar:
> "Voy a sincronizar con Prisma-Components de Cencosud. ¿Continúo?"

### Paso 2 — Sincronizar

Llamar `sync_prisma_library` con la URL.

Mientras sincroniza:
> "Sincronizando con Prisma-Components..."

### Paso 3 — Reportar resultado

```
✅ Sincronización completada

Componentes encontrados: [N]
Última sync: [fecha/hora]

El catálogo está actualizado. Podés usar /crear-pantallas con los keys reales.
```

Si hay error 403 de token:
> "⚠️ Token de Figma inválido. Asegurate de que FIGMA_TOKEN esté configurado como variable de entorno del sistema antes de abrir Cowork. Obtené un token en: Figma → Settings → Security → Personal access tokens."

Si hay error de acceso al archivo:
> "⚠️ Sin acceso al archivo. Verificá que el token tenga permisos de lectura sobre Prisma-Components."
