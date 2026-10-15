# Prisma Designer Plugin v3.2 · Cencosud

Plugin para diseñadores UX del equipo Whitelabel de Cencosud. Convierte DS3 JSON en pantallas directamente en Figma, valida calidad de diseño contra las Prisma Design Rules, y ejecuta Quality Gate con scoring de 100 puntos.

## Skills disponibles

| Skill | Trigger | Qué hace |
|---|---|---|
| `/crear-pantallas` | "crear pantallas desde ds3" | Valida diseño + crea pantallas en Figma + reporte Gold Standard |
| `/validar-ds3` | "validar el json" | Validación en 2 niveles: sintáctica + calidad de diseño |
| `/quality-gate` | "revisar calidad", "quality score" | Auditoría de diseño: 6 dimensiones, score /100 |
| `/resolver-componente` | "qué componente uso para..." | Encuentra el componente Prisma correcto en lenguaje natural |
| `/sync-prisma` | "sincronizar librería" | Sincroniza el catálogo de componentes desde Figma |

## Instalación paso a paso (equipo UX)

El plugin trae el MCP incluido. Solo necesitas **Node.js** y, si vas a sincronizar el catálogo, un **token de Figma**.

### Paso 1 — Instalar Node.js (una sola vez)

1. Abre Terminal y ejecuta `node -v`.
2. Si muestra `v18` o superior, ve al Paso 2.
3. Si dice `command not found` o una versión menor, descarga la versión **LTS** desde https://nodejs.org, instálala y vuelve a ejecutar `node -v` para confirmar.

### Paso 2 — Instalar el plugin

1. Descarga `prisma-designer.plugin` desde el Hub UX (catálogo → Prisma Designer → Instalar plugin) o desde [Releases](https://github.com/erickbaeza-coder/Plugins-PrismaDesigner/releases/latest).
2. En Cowork: **Settings → Plugins → Instalar plugin** y selecciona el archivo `.plugin`.
3. Reinicia Cowork.

### Paso 3 — Conectar el MCP de Figma

Verifica que el conector oficial de Figma esté activo en Cowork (Settings → Connectors). Es el que dibuja las pantallas en tu archivo de Figma.

### Paso 4 — Token de Figma (solo si vas a usar `/sync-prisma`)

Si solo creas pantallas, validas y revisas calidad, **sáltate este paso**. Lo necesita quien mantiene el catálogo de componentes.

1. En Figma: avatar → **Settings → Security → Personal access tokens → Generate new token**.
2. Nombre sugerido: `Prisma MCP Cencosud`. Permiso de solo lectura de archivos.
3. Copia el token (empieza con `figd_`). Se muestra una sola vez.
4. En Terminal ejecuta, reemplazando por tu token:

```bash
echo "figd_TU_TOKEN" > ~/.prisma-mcp-token
chmod 600 ~/.prisma-mcp-token
```

5. Reinicia Cowork. No lo compartas ni lo subas a ningún repo.

### Paso 5 — Probar que funciona

En Cowork escribe: `¿qué componente uso para un botón principal?` (`/resolver-componente`). Si responde con un componente Prisma, el MCP está conectado.

Si falla: confirma `node -v` (Paso 1), reinicia Cowork y revisa que el plugin aparezca como instalado.

### Paso 6 — Sincronizar catálogo (opcional, solo mantenedores)

Ejecuta `/sync-prisma`. Refresca el catálogo desde Prisma-Components en Figma. Tras sincronizar, hay que publicar una nueva versión del plugin para que el resto del equipo reciba el catálogo actualizado.

## Design Rules incluidas (v3.0)

El plugin incorpora 7 archivos de reglas de diseño que se aplican automáticamente:

| Rule | Qué define |
|---|---|
| UI Rules | Principios, tokens, grid, tipografía, color, composición, Quality Gate |
| Component Rules | Selección, composición, variants, properties, gap documentation |
| Screen Playbook | Método paso a paso para construir pantallas (12 pasos) |
| Accessibility Rules | Contraste, targets, tipografía, estados, iconografía |
| Motion Rules | Principios de movimiento, candidatos, performance, checklist |
| Gold Standard Prompt | Prompt maestro de 11 fases para generación de pantallas |
| Working Rules (v3.2.2) | Reglas de trabajo: estructura plana, dónde van los tokens, estados, accesibilidad medida, revisión obligatoria y limitaciones conocidas de componentes |

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

v3.2.2 · Octubre 2026 · Whitelabel UX Team · Cencosud
