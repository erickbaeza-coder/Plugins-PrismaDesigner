---
name: crear-pantallas
description: >
  Skill principal del flujo DS3 → Figma. Úsala cuando el diseñador diga
  "/crear-pantallas", "crear pantallas desde ds3", "build screens",
  "quiero crear las pantallas", "pegar el json del ds3", "generar pantallas",
  "armar las pantallas en figma", "ejecutar el script en figma",
  "generar el script de figma" o cualquier variante que indique querer
  convertir un DS3 JSON en pantallas reales directamente en Figma.
  Requiere que el MCP prisma-mcp y el MCP de Figma estén conectados.
---

## Qué hace esta skill

Toma el DS3 JSON (output del proceso de Discovery Agéntico) y crea las pantallas
**directamente en el canvas de Figma** — sin plugin manual, sin pasos intermedios.

A partir de v3.0, esta skill incorpora las **Prisma Design Rules** en todo el flujo:
valida calidad de diseño (no solo sintaxis), aplica el Gold Standard Screen Prompt,
y entrega un reporte de Quality Gate con cada creación.

### Rules que aplica

Antes de ejecutar, el agente **DEBE leer** estas references:

1. `references/rules/Prisma_Gold_Standard_Screen_Prompt.md` — Prompt maestro de 11 fases
2. `references/rules/Prisma_Screen_Playbook.md` — Método paso a paso para construir pantallas
3. `references/rules/Prisma_Component_Rules.md` — Reglas de selección y composición de componentes
4. `references/rules/Prisma_Design_System_UI_Rules.md` — Constitución general del sistema

El agente debe internalizar estas reglas y aplicarlas durante todo el flujo.

---

## Flujo de ejecución

### Paso 1 — Recibir inputs

Pedirle al diseñador dos cosas:

**A. El DS3 JSON** — puede venir de dos fuentes:
- `packets.ds3` del `design_state.json`
- La sección "JSON Prisma Builder" del `output_ds3.md`

**B. La URL del archivo de Figma** donde crear las pantallas.
(ej: `https://www.figma.com/file/XXXX/Mi-Archivo`)

Si el diseñador no tiene la URL, pedirla antes de continuar — se necesita el `fileKey` para ejecutar el script.

---

### Paso 2 — Validar el JSON (sintáctica)

Llamar `validate_ds3_json` con el JSON recibido.

- **Errores** → mostrarlos con sugerencia de fix y detener el flujo
- **Warnings** → mostrarlos y preguntar si continúa igual
- **Todo OK** → continuar

---

### Paso 3 — Validación de diseño (Design Rules)

Antes de generar el script, el agente debe evaluar el DS3 JSON contra las Design Rules.

#### 3a. Validación estructural (Screen Playbook)

Para cada pantalla del JSON, verificar:

- **Jerarquía completa**: ¿Tiene navegación → header/título → contenido → acción principal?
- **Orden lógico**: ¿Los componentes siguen el orden recomendado (contexto → contenido → acciones → nav persistente)?
- **Foco claro**: ¿Hay una acción principal identificable?
- **No saturación**: ¿La cantidad de componentes es razonable para el objetivo?

#### 3b. Validación de componentes (Component Rules)

- ¿Se priorizaron componentes existentes sobre soluciones custom?
- ¿Las composiciones documentan correctamente el gap?
- ¿Hay duplicaciones innecesarias de componentes?

#### 3c. Validación de completitud (UI Rules)

- ¿Se contemplan estados relevantes (loading, empty, error)?
- ¿La pantalla responde a "¿Dónde estoy? ¿Qué puedo hacer? ¿Qué debería hacer ahora?"?

#### Resultado de la validación de diseño

**Si hay problemas críticos:**
```
⚠️ Revisión de diseño — [N] observaciones

CRÍTICOS (recomiendo corregir antes de crear):
• [Pantalla]: [observación]
  → Sugerencia: [mejora]

MEJORABLES:
• [Pantalla]: [observación]

¿Querés corregir el JSON antes de continuar, o crear igual y ajustar en Figma?
```

**Si todo está bien:**
```
✅ Validación de diseño OK — estructura, jerarquía y componentes alineados con Prisma Rules
```

---

### Paso 4 — Generar el script

Llamar `create_screens_from_ds3` con:
- `ds3_json`: el JSON completo como string
- `figma_file_url`: la URL del archivo (si la tenés)

El MCP devuelve un texto que incluye la sección `## 🚀 Script use_figma` con el código JavaScript a ejecutar.

---

### Paso 5 — Ejecutar en Figma

Extraer el bloque JavaScript del resultado y ejecutarlo via `use_figma`:

- **fileKey**: la parte entre `/file/` o `/design/` y la siguiente barra en la URL
- **description**: "Crear pantallas DS3 · [proyecto] · [marca]"
- **code**: el script JavaScript completo del bloque de código

El script hace todo automáticamente:
- Crea o reutiliza una página con nombre `[proyecto] · [marca]`
- Importa los componentes reales de Prisma-Components
- Aplica textos del DS3 a cada componente
- Aplica el brand mode de la marca a todos los frames
- Las composiciones quedan como `// TODO [composición]` para armar manualmente

---

### Paso 6 — Reporte de entrega (Gold Standard)

Con la respuesta de `use_figma`, entregar el reporte completo siguiendo el formato del Gold Standard Screen Prompt:

```
✅ Pantallas creadas en Figma

Página    : [nombre de la página]
Pantallas : P01 · P02 · P03 · ... ([N] total)
Brand mode: "[marca]" aplicado ✓

---

### Screen Objective
[Objetivo general del flujo]

### Structure
[Resumen de la estructura de cada pantalla]

### Primary Action
[Acción principal por pantalla]

### Components
[Lista de componentes Prisma utilizados]

### Tokens
[Categorías de tokens aplicadas: color, typography, spacing, radius, etc.]

### States
[Estados diseñados vs. pendientes de diseñar]

### Accessibility
[Observaciones de accesibilidad basadas en las Prisma Accessibility Rules]

### Motion
[Recomendaciones de motion basadas en las Prisma Motion Rules]

### Token Gaps
[Tokens faltantes detectados, o "Ninguno"]

### Component Gaps
[Componentes no existentes en Prisma, o "Ninguno"]

### Quality Score
[Score estimado sobre 100 basado en el Quality Gate de UI Rules]
• Estructura: __/20
• Design System: __/25
• Visual: __/20
• Accesibilidad: __/15
• UX: __/10
• Performance: __/10

### Critical Issues
[Problemas que impiden Gold Standard, o "Ninguno"]

### Recommendations
[Mejoras sugeridas para alcanzar Gold Standard]
```

Si hay composiciones pendientes, agregar:
```
⚠️ Composiciones para armar manualmente:
• [Pantalla]: [NombreComposición]
```

Ofrecer: "¿Querés que corra `/quality-gate` para un análisis más profundo, o que resuelva algún componente con `/resolver-componente`?"

---

## Manejo de errores frecuentes

| Error | Qué hacer |
|---|---|
| JSON inválido (sintaxis) | Pedir al designer que verifique el formato y vuelva a pegar |
| Errores de grupo inválido en validación | Mostrar los componentes problemáticos y el nombre correcto del catálogo |
| Script falla con error de `figmaKey` | El componente puede haberse movido — ejecutar `/sync-prisma` para actualizar |
| Componente no encontrado en catálogo | Llamar `resolve_component` con el nombre para sugerir alternativa |
| `FIGMA_TOKEN` no configurado | Indicar que falta configuración y referir a guía de instalación |
| Error `setCurrentPageAsync` | MCP desactualizado — pedir reiniciar el servidor desde Settings → Developer → MCP |

---

## Contexto técnico

**El MCP escribe directamente al canvas de Figma** — no se necesita el plugin Prisma Builder ni Figma Make para los componentes del sistema de diseño. Este es el cambio central respecto al flujo anterior.

**Composiciones** son patrones DS3 para componentes que no existen en Prisma (ej: EventCard, MetadataRows). El script genera un `// TODO [composición]` con los sub-componentes descritos. El diseñador los arma manualmente en Figma.

**Brand mode** se aplica automáticamente desde el campo `marca` del JSON, aplicando colores, tipografía y tokens de la marca correcta a todos los frames via Figma Variable Modes.

**Página destino**: el script crea o reutiliza una página con nombre `[proyecto] · [marca]`. Si ya existe, los frames se agregan en esa misma página.
