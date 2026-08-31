# prisma-designer Plugin

Plugin de Claude para diseñadores UX del equipo Whitelabel Cencosud. Convierte DS3 JSON en pantallas directamente en Figma, valida calidad de diseño contra las **Prisma Design Rules**, y ejecuta **Quality Gate** con scoring de 100 puntos.

## Skills incluidas

| Skill | Descripción |
|---|---|
| `crear-pantallas` | Valida diseño + crea pantallas en Figma vía MCP + reporte Gold Standard |
| `validar-ds3` | Validación en 2 niveles: sintáctica (catálogo) + calidad de diseño (rules) |
| `quality-gate` | Auditoría de diseño en 6 dimensiones con score /100 |
| `resolver-componente` | Encuentra el componente Prisma correcto dado una descripción |
| `sync-prisma` | Sincroniza el catálogo de componentes desde el archivo de Figma |

## Estructura del repo

```
Plugins-PrismaDesigner/
├── .github/
│   └── workflows/
│       └── notify-teams.yml         ← Notifica a Teams en cada release
├── prisma-designer/                 ← Fuente del plugin
│   ├── .claude-plugin/
│   │   └── plugin.json              ← Nombre, versión, descripción
│   ├── .mcp.json                    ← Configuración del MCP server
│   ├── references/
│   │   └── rules/                   ← 6 archivos de Design Rules
│   │       ├── Prisma_Design_System_UI_Rules.md
│   │       ├── Prisma_Component_Rules.md
│   │       ├── Prisma_Screen_Playbook.md
│   │       ├── Prisma_Accessibility_Rules.md
│   │       ├── Prisma_Motion_Rules.md
│   │       └── Prisma_Gold_Standard_Screen_Prompt.md
│   └── skills/
│       ├── crear-pantallas/
│       ├── quality-gate/            ← Nueva en v3.0
│       ├── resolver-componente/
│       ├── sync-prisma/
│       └── validar-ds3/
├── prisma-mcp/                      ← Servidor MCP integrado
│   ├── src/
│   ├── scripts/
│   ├── package.json
│   └── package-lock.json
├── Rules de diseño/                 ← Archivos fuente de las reglas
├── releases/                        ← Archivos .plugin empaquetados
├── version.json                     ← Versión actual
├── build.sh                         ← Script para empaquetar
├── setup.sh                         ← Script de setup para el equipo
└── .gitignore
```

## Instalación para el equipo

### Opción rápida — Script de setup

```bash
git clone https://github.com/erickbaeza-coder/Plugins-PrismaDesigner.git
cd Plugins-PrismaDesigner
./setup.sh
```

El script:
1. Pide tu Figma token
2. Lo configura en `~/.zshrc`
3. Instala dependencias del MCP (`npm install`)
4. Verifica que todo funcione
5. Te indica cómo instalar el `.plugin` en Cowork

### Opción manual

1. Descarga el `.plugin` desde [Releases](https://github.com/erickbaeza-coder/Plugins-PrismaDesigner/releases/latest)
2. En Cowork: **Settings → Plugins → Instalar plugin**
3. Configura `FIGMA_TOKEN`:
   ```bash
   echo 'export FIGMA_TOKEN="figd_TU_TOKEN"' >> ~/.zshrc
   source ~/.zshrc
   ```
4. Cierra y reabre Cowork
5. Ejecuta `/sync-prisma` en tu primera conversación

## Publicar una nueva versión

```bash
# 1. Edita los skills en prisma-designer/skills/
# 2. Empaqueta:
./build.sh 3.1.0

# 3. Commitea y tagea:
git add -A
git commit -m "release: v3.1.0"
git tag v3.1.0
git push && git push --tags

# 4. En GitHub: crea un Release desde el tag
#    - Adjunta releases/prisma-designer-v3.1.0.plugin
#    - GitHub Actions notificará a Teams automáticamente
```

## Configurar Teams (primera vez)

1. En Microsoft Teams, ve al canal de notificaciones
2. `···` → Flujos → **"Incoming Webhook"** → Configurar
3. Copia la URL del webhook
4. En GitHub → repo → **Settings → Secrets → Actions → New repository secret**:
   - Nombre: `TEAMS_WEBHOOK_URL`
   - Valor: la URL del webhook

## Chequeo de versión

```
https://raw.githubusercontent.com/erickbaeza-coder/Plugins-PrismaDesigner/main/version.json
```
