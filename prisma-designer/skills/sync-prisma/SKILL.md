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

Lee las librerías Prisma en Figma vía REST API (App y Web) y actualiza el catálogo local del MCP con los **component sets reales** (`WlHeader`, `WlChip`, `WlProductCardCart`…) y **todas sus variantes**. Los nombres `Wl*` del DS3 resuelven directo, incluidos estados (`WlChip · State=Active`).

## Librerías oficiales · Cencosud

| Librería | Archivo |
|---|---|
| App | `https://www.figma.com/design/LnYUTRFuwWpI9phwDCSHOx/APP-Prisma-Components` |
| Web | `https://www.figma.com/design/V4JC6ZQiNFEechja7p3W3A/Web-Components` |

## Flujo de ejecución

### Paso 1 — Qué sincronizar

Por defecto, **las dos librerías** (llamar `sync_prisma_library` sin parámetros). Si el diseñador pegó una URL concreta, pasarla en `file_url` (y `library: "app" | "web"` si no es una de las oficiales). Sincronizar una librería no borra la otra.

### Paso 2 — Sincronizar

> "Sincronizando App y Web de Prisma..."

### Paso 3 — Reportar resultado

Reportar lo que el sync **realmente** trajo, copiando las cifras de la respuesta de la herramienta:

```
✅ Sincronización completada

App · [N] componentes ([N] variantes; [N] enlazadas a su set, [N] sueltos)
Web · [N] componentes ([N] variantes; [N] enlazadas a su set, [N] sueltos)
Última sync: [fecha/hora]
```

Verificar con 2–3 nombres `Wl*` del DS3 que el catálogo los reconoce (`validate_ds3_json` o `resolve_component`).

Notas de alcance:
• Si un nombre `Wl*` no existe en el catálogo, **falla** (no se sustituye por uno parecido): hay que corregir el DS3 o sincronizar de nuevo.
• Nombres repetidos entre librerías (`WlTag`, `WlHeader`, `WlToggle`): sin indicación se usa **App**.
• Solo se indexan componentes **publicados** en la librería.
• El catálogo sincronizado vive en tu instalación; para que el resto del equipo lo reciba hay que publicar una nueva versión del plugin (mantenedores: `node prisma-mcp/scripts/sync-keys.mjs`).

Si hay error 403 de token:
> "⚠️ Token de Figma inválido o ausente. Guardalo en el archivo `~/.prisma-mcp-token` (solo el token, `chmod 600`) y reiniciá Cowork. Cowork se abre desde el Dock y **no lee `~/.zshrc`**, por eso la variable de entorno puede no llegar. Obtené un token en: Figma → Settings → Security → Personal access tokens (permiso de lectura de archivos)."

Si hay error de acceso al archivo:
> "⚠️ Sin acceso al archivo. Verificá que el token tenga permisos de lectura sobre Prisma-Components."

> El token solo hace falta para `/sync-prisma`. Un diseñador que solo crea pantallas no lo necesita: el catálogo viene incluido en el plugin.
