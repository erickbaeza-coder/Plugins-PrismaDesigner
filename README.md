# prisma-designer Plugin

Plugin de Claude para diseñadores UX del equipo Whitelabel Cencosud. Convierte DS3 JSON en pantallas directamente en Figma usando el catálogo de **Prisma-Components** — sin plugins intermedios.

## Skills incluidas

| Skill | Descripción |
|---|---|
| `crear-pantallas` | Convierte un DS3 JSON en pantallas reales en Figma vía MCP |
| `resolver-componente` | Encuentra el componente Prisma correcto dado una descripción |
| `sync-prisma` | Sincroniza el catálogo de componentes desde el archivo de Figma |
| `validar-ds3` | Valida un DS3 JSON antes de crear las pantallas |

## Estructura del repo

```
Plugins-PrismaDesigner/
├── .github/
│   └── workflows/
│       └── notify-teams.yml    ← Notifica a Teams en cada release
├── prisma-designer/            ← Fuente del plugin
│   ├── .claude-plugin/
│   │   └── plugin.json         ← Nombre, versión, descripción
│   ├── .mcp.json               ← Configuración del MCP server
│   └── skills/
│       ├── crear-pantallas/
│       ├── resolver-componente/
│       ├── sync-prisma/
│       └── validar-ds3/
├── releases/                   ← Archivos .plugin empaquetados
├── version.json                ← Versión actual (consultado para chequeo de updates)
├── build.sh                    ← Script para empaquetar
└── .gitignore
```

## Publicar una nueva versión

```bash
# 1. Edita los skills en prisma-designer/skills/
# 2. Empaqueta:
./build.sh 2.1.0

# 3. Commitea y tagea:
git add -A
git commit -m "release: v2.1.0"
git tag v2.1.0
git push && git push --tags

# 4. En GitHub: crea un Release desde el tag v2.1.0
#    - Adjunta releases/prisma-designer-v2.1.0.plugin
#    - Escribe el changelog en la descripción del release
#    - Publica → GitHub Actions enviará la notificación a Teams ✅
```

## Configurar Teams (primera vez)

1. En Microsoft Teams, ve al canal donde quieres recibir notificaciones.
2. `···` → Flujos → Busca **"Incoming Webhook"** → Configurar.
3. Copia la URL del webhook.
4. En GitHub → repo → **Settings → Secrets and variables → Actions → New repository secret**:
   - Nombre: `TEAMS_WEBHOOK_URL`
   - Valor: la URL copiada del paso 3.

## Configurar el MCP server (prisma-mcp)

El plugin requiere el servidor MCP local de Prisma. El `.mcp.json` dentro del plugin apunta a:

```
/Users/ebaezaroa/Desktop/Cencosud 2026/Discovery Agentico/Prisma MCP/src/index.js
```

Si el MCP está en otra ruta en tu máquina, actualiza `.mcp.json` antes de empaquetar:

```json
{
  "mcpServers": {
    "prisma-mcp": {
      "command": "node",
      "args": ["/TU_RUTA/Prisma MCP/src/index.js"],
      "env": {
        "FIGMA_TOKEN": "${FIGMA_TOKEN}"
      }
    }
  }
}
```

## Instalar el plugin en Claude

1. Descarga el `.plugin` desde la sección **Releases** de este repo.
2. En Claude Desktop: **Configuración → Plugins → Instalar plugin**.
3. Selecciona el archivo `.plugin` descargado.
4. Configura la variable `FIGMA_TOKEN` con tu token de Figma.

## Chequeo automático de versión

Para que el plugin notifique al equipo cuando hay una versión más reciente, agrega en la skill correspondiente una llamada a:

```
https://raw.githubusercontent.com/erickbaeza-coder/Plugins-PrismaDesigner/main/version.json
```

(Reemplaza `erickbaeza-coder/Plugins-PrismaDesigner` con el nombre real del repo.)
