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

Reportar lo que el sync **realmente** trajo; no decir "catálogo actualizado" sin comprobarlo.

```
✅ Sincronización completada

Archivo / librería: [nombre] · [App | Web]
Component sets leídos: [N]
Variantes indexadas: [N]
Última sync: [fecha/hora]

⚠️ Alcance real:
• "N con key" significa que la key existe en prisma-keys.json, NO que el generador la use.
  El generador resuelve por el catálogo base (nombres propios por grupo); un componente nuevo
  o con nombre `Wl*` puede no resolverse aunque tenga key.
• Solo se sincroniza UNA librería por llamada. Si el DS3 usa componentes de otra (marca o web),
  ejecutar el sync también con ese archivo — pero el catálogo hoy no etiqueta la plataforma:
  nombres repetidos (WlTag, WlHeader, WlToggle) pueden resolverse a la librería equivocada.
• Solo se guardan variantes de componentes PUBLICADOS en la librería.
```

Tras sincronizar, verificar con 2–3 componentes del DS3 (`resolve_component` con su nombre `Wl*`) que el catálogo los reconoce. Si no, avisar que el catálogo no cubre los nombres reales y que el flujo necesitará corrección manual de variantes.

Si hay error 403 de token:
> "⚠️ Token de Figma inválido o ausente. Guardalo en el archivo `~/.prisma-mcp-token` (solo el token, `chmod 600`) y reiniciá Cowork. Cowork se abre desde el Dock y **no lee `~/.zshrc`**, por eso la variable de entorno puede no llegar. Obtené un token en: Figma → Settings → Security → Personal access tokens (permiso de lectura de archivos)."

Si hay error de acceso al archivo:
> "⚠️ Sin acceso al archivo. Verificá que el token tenga permisos de lectura sobre Prisma-Components."

> El token solo hace falta para `/sync-prisma`. Un diseñador que solo crea pantallas no lo necesita: el catálogo viene incluido en el plugin.
