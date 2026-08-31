# Prisma Designer Plugin v3.0 · Cencosud

Plugin para diseñadores UX del equipo Whitelabel de Cencosud. Convierte DS3 JSON en pantallas directamente en Figma, valida calidad de diseño contra las Prisma Design Rules, y ejecuta Quality Gate con scoring de 100 puntos.

## Skills disponibles

| Skill | Trigger | Qué hace |
|---|---|---|
| `/crear-pantallas` | "crear pantallas desde ds3" | Valida diseño + crea pantallas en Figma + reporte Gold Standard |
| `/validar-ds3` | "validar el json" | Validación en 2 niveles: sintáctica + calidad de diseño |
| `/quality-gate` | "revisar calidad", "quality score" | Auditoría de diseño: 6 dimensiones, score /100 |
| `/resolver-componente` | "qué componente uso para..." | Encuentra el componente Prisma correcto en lenguaje natural |
| `/sync-prisma` | "sincronizar librería" | Sincroniza el catálogo de componentes desde Figma |

## Instalación rápida (equipo UX)

### Paso 1 — Instalar el plugin

1. Descarga `prisma-designer-v3.0.0.plugin` desde [Releases](https://github.com/erickbaeza-coder/Plugins-PrismaDesigner/releases/latest)
2. En Cowork: **Settings → Plugins → Instalar plugin**
3. Selecciona el archivo `.plugin` descargado

### Paso 2 — Configurar FIGMA_TOKEN

El plugin necesita un token de Figma para leer Prisma-Components y crear pantallas.

**Obtener el token:**
1. Figma → clic en tu avatar → **Settings → Security**
2. En **Personal access tokens** → **Generate new token**
3. Nombre sugerido: "Prisma MCP Cencosud"
4. Scope: dar acceso de lectura a los archivos del equipo
5. Copiar el token (empieza con `figd_`)

**Configurar en tu Mac:**

Opción A — Script automático (recomendado):
```bash
cd ruta/al/repo/Plugins-PrismaDesigner
./setup.sh
```

Opción B — Manual:
```bash
echo 'export FIGMA_TOKEN="figd_TU_TOKEN"' >> ~/.zshrc
source ~/.zshrc
```

> ⚠️ **Importante:** La variable debe estar configurada **antes de abrir Cowork**. Si Cowork ya estaba abierto, cerrarlo y reabrirlo.

### Paso 3 — Instalar dependencias del MCP

```bash
cd ruta/al/repo/Plugins-PrismaDesigner/prisma-mcp
npm install
```

### Paso 4 — Primera sincronización

En Cowork, ejecutar:
> /sync-prisma

Esto actualiza el catálogo local de componentes Prisma.

## Design Rules incluidas (v3.0)

El plugin incorpora 6 archivos de reglas de diseño que se aplican automáticamente:

| Rule | Qué define |
|---|---|
| UI Rules | Principios, tokens, grid, tipografía, color, composición, Quality Gate |
| Component Rules | Selección, composición, variants, properties, gap documentation |
| Screen Playbook | Método paso a paso para construir pantallas (12 pasos) |
| Accessibility Rules | Contraste, targets, tipografía, estados, iconografía |
| Motion Rules | Principios de movimiento, candidatos, performance, checklist |
| Gold Standard Prompt | Prompt maestro de 11 fases para generación de pantallas |

## Flujo de uso

```
1. Discovery Agéntico → genera DS3 JSON (packets.ds3)
2. /sync-prisma       → actualizar catálogo (primera vez o tras cambios)
3. /validar-ds3       → validar sintaxis + calidad de diseño
4. /crear-pantallas   → crear en Figma + reporte Gold Standard
5. /quality-gate      → auditoría post-creación (score /100)
```

## Archivo Prisma-Components

URL oficial:
```
https://www.figma.com/design/LnYUTRFuwWpI9phwDCSHOx/Prisma-Components
```

## Versión

v3.0.0 · Agosto 2026 · Whitelabel UX Team · Cencosud
