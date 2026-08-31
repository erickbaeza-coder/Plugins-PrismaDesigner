# Prisma MCP Server

MCP que conecta Claude con el design system **Prisma-Components** de Cencosud. Permite trabajar pantallas desde DS3 directamente en Claude y exportarlas a Figma.

## Requisitos

- Node.js v18 o superior → [nodejs.org](https://nodejs.org)
- Claude Cowork instalado
- Figma Personal Access Token *(solo para sync de librería)*

## Instalación

### 1. Clonar el repo

```bash
git clone https://github.com/TU-ORG/prisma-mcp.git
cd prisma-mcp
npm install
```

### 2. Obtener tu Figma Token *(opcional — solo para /sync-prisma)*

Figma → foto de perfil → **Settings** → **Security** → **Personal access tokens** → crear token con permisos de lectura.

### 3. Registrar en Claude Cowork

Abrí `~/.claude/mcp_settings.json` y agregá:

```json
{
  "mcpServers": {
    "prisma-mcp": {
      "command": "node",
      "args": ["/ruta/donde/clonaste/prisma-mcp/src/index.js"],
      "env": {
        "FIGMA_TOKEN": "figd_TU_TOKEN_AQUI"
      }
    }
  }
}
```

**¿No sabés tu ruta?** Corré esto en Terminal:
```bash
find ~ -name "index.js" -path "*/prisma-mcp/*" 2>/dev/null
```

### 4. Reiniciar Cowork

Cerrá y volvé a abrir Cowork para que cargue el MCP.

### 5. Verificar

Escribí en el chat de Cowork:
> "Usá el Prisma MCP y listá los componentes del grupo Buttons"

Si responde con la lista de botones, está funcionando.

---

## Plugin de skills

El archivo `prisma-designer.plugin` incluye 4 slash commands listos para instalar en Cowork:

| Skill | Qué hace |
|---|---|
| `/crear-pantallas` | DS3 JSON o prompts → JSON para Prisma Builder + prompts para Figma Make |
| `/sync-prisma` | Sincroniza el catálogo desde el archivo Prisma-Components en Figma |
| `/validar-ds3` | Valida un DS3 JSON antes de construir |
| `/resolver-componente` | Encuentra el componente Prisma correcto en lenguaje natural |

Para instalar: abrí Cowork → arrastrá el archivo `.plugin` o usá Settings → Plugins → Install.

---

## Flujo de uso

```
1. Ejecutar DS3 en el proceso agéntico → genera packets.ds3

2. En Cowork:
   → /validar-ds3 [pegar JSON]        # verificar antes de crear
   → /crear-pantallas [pegar JSON]    # genera los dos outputs

3. En Figma:
   → Pegar enriched JSON en Prisma Builder → Build Screens
   → Pegar prompts en Figma Make → crear componentes locales
```

---

## Herramientas disponibles

| Tool | Qué hace |
|---|---|
| `sync_prisma_library` | Lee Prisma-Components en Figma y actualiza el catálogo |
| `create_screens_from_ds3` | Procesa DS3 JSON → spec enriquecida + prompts Figma Make |
| `create_screens_from_prompts` | Infiere componentes Prisma desde prompts de texto |
| `validate_ds3_json` | Valida DS3 JSON contra el catálogo Prisma |
| `list_prisma_components` | Lista componentes disponibles con filtro opcional |
| `resolve_component` | Encuentra el componente Prisma más cercano a una descripción |
| `create_local_component_spec` | Genera spec + prompt Figma Make para componentes nuevos |
| `get_figma_file_info` | Info de un archivo Figma (páginas, componentes, fecha) |

---

## Para el owner del design system

El catálogo base está en `src/prisma-catalog.js`. Cuando haya componentes nuevos en Prisma-Components:

1. Configurar `FIGMA_TOKEN` con acceso al archivo Prisma-Components
2. Ejecutar `/sync-prisma [URL del archivo]` en Cowork
3. Actualizar `src/prisma-catalog.js` con los nuevos componentes
4. `git commit` + `git push` → el equipo hace `git pull`

---

## Estructura

```
prisma-mcp/
├── src/
│   ├── index.js              ← servidor MCP + 8 herramientas
│   ├── prisma-catalog.js     ← catálogo de componentes Prisma
│   ├── component-resolver.js ← matching por keywords
│   ├── ds3-builder.js        ← transformador DS3 → Figma spec
│   └── figma-api.js          ← cliente REST de Figma
├── docs/
│   └── guia.html             ← guía interactiva de instalación
├── package.json
├── .gitignore
└── README.md
```

---

**v1.0 · Julio 2026 · Whitelabel UX Team · Cencosud**
