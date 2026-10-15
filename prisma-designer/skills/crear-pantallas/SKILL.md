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
5. `references/rules/Prisma_Working_Rules.md` — **Reglas de trabajo**: estructura plana, dónde van los tokens, estados, accesibilidad, revisión obligatoria y limitaciones conocidas. Si chocan con otra regla, estas prevalecen cuando el MCP no es fiel al DS3.

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

> ⚠️ **Límite conocido de `validate_ds3_json`:** solo recorre `pantalla.componentes`; **no lee `secciones`**.
> Con un DS3 que usa `secciones` puede responder "0 componentes / JSON válido" aunque tenga errores.
> Si el resumen dice 0 componentes, **no lo tomes como válido**: validar manualmente cada componente de cada sección
> (nombre, variante, props) con `resolve_component` / `list_prisma_components`.
> Además, los nombres reales de la librería (`Wl*`) pueden no existir en el catálogo: si falla casi todo, es un problema del catálogo, no del DS3 (ver `/sync-prisma`).

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

**El script es un primer borrador, no el resultado final.** Intenta:
- Crear o reutilizar una página con nombre `[proyecto] · [marca]`
- Importar componentes de Prisma-Components (con la variante por defecto del catálogo)
- Aplicar el texto de `contenido` cuando el componente tiene `textConfig`
- Aplicar el brand mode de la marca

**Limitaciones conocidas del generador** (verificar en el Paso 5b, no asumir que funcionó):
- Puede elegir una variante equivocada (header o combo en Skeleton, alerta en Error, chip siempre Default).
- **No aplica `textOverrides`**; solo `contenido`. Los textos pueden quedar en placeholder.
- Usa un frame fijo 390×844 e ignora `frame` y la plataforma del DS3.
- No genera estados ni imágenes.
- Dos secciones `padded` anidadas producen padding doble.
- Un script con varias pantallas puede superar el tiempo de `use_figma`; un error revierte todo. Si el script es largo, **partirlo por pantalla** y ejecutar una por llamada, reutilizando elementos por nombre.
- El modo de marca puede no aplicarse (API síncrona): verificarlo.
- Composiciones y gaps pueden no generarse o quedar como `// TODO`.

---

### Paso 5b — Revisión obligatoria (no saltar)

Tras ejecutar, **revisar cada pantalla antes de reportar**, con captura de pantalla de Figma por pantalla:

1. Seguir la lista de `Prisma_Working_Rules.md` §6 (tamaño de frame, variante correcta, textos aplicados, jerarquía ≤ 2, tokens, contraste, estados).
2. Corregir lo que el generador dejó mal (variantes, textos, frame, padding doble, contenedores de un hijo) con scripts cortos e idempotentes.
3. Crear los **estados** que pida el DS3 con las recetas de §4 (`P0X-B`, `P0X-C`…, en una fila aparte).
4. Medir **accesibilidad** (§5): contraste, tamaños táctiles según plataforma. Separar hallazgos de la pantalla vs hallazgos de la librería.
5. Anotar qué es dato real y qué es ejemplo.

**Regla de cierre:** no escribir "Pantallas creadas" mientras queden placeholders de librería, variantes erróneas o textos sin aplicar. Reportar el estado real:

```
Estado: ✅ Revisadas | 🟡 Con pendientes | ❌ Requiere rehacer
Pendientes: [lista exacta]
```

---

### Paso 6 — Reporte de entrega (Gold Standard)

Con la respuesta de `use_figma`, entregar el reporte completo siguiendo el formato del Gold Standard Screen Prompt:

```
[Usar solo si el Paso 5b quedó sin pendientes; si no, "🟡 Pantallas creadas con pendientes"]
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
[Estados creados vs. pendientes, con el nombre de cada frame]

### Accessibility
[Contraste y tamaños táctiles MEDIDOS (con valores). Separar: "Falla de la pantalla" vs "Hallazgo de librería (para equipo Prisma)". Texto sobre imagen/gradiente: "revisión manual".]

### Datos de ejemplo
[Lista de textos, precios o cantidades que son de relleno]

### Motion
[Recomendaciones de motion basadas en las Prisma Motion Rules]

### Token Gaps
[Tokens faltantes detectados, o "Ninguno"]

### Component Gaps
[Componentes no existentes en Prisma, o "Ninguno"]

### Quality Score
No estimar. Mostrar el puntaje solo si cada criterio tiene evidencia medida; de lo contrario escribir
"Sin medir — ejecutar `/quality-gate` con las capturas" y listar los criterios que sí se midieron
(estructura, contraste, tamaños táctiles).

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

## DS3 JSON Schema v2 — Secciones y Layouts

A partir de v3.1, el DS3 JSON soporta **secciones** para agrupar componentes con layouts diferenciados.
Si el JSON no tiene secciones explícitas, el generador las detecta automáticamente por tipo de componente.

### Formato con secciones explícitas (recomendado)

```json
{
  "pantallas": [{
    "id": "P01",
    "nombre": "PLP Principal",
    "secciones": [
      {
        "nombre": "header",
        "layout": "stack",
        "componentes": [
          { "componente": "TopBar", "rol": "navegación" }
        ]
      },
      {
        "nombre": "filtros",
        "layout": "scroll-h",
        "componentes": [
          { "componente": "Chip", "contenido": "Ofertas" },
          { "componente": "Chip", "contenido": "Frescos" }
        ]
      },
      {
        "nombre": "productos",
        "layout": "grid-2col",
        "padded": true,
        "componentes": [
          { "componente": "ProductCard", "contenido": "Producto 1" },
          { "componente": "ProductCard", "contenido": "Producto 2" },
          { "componente": "ProductCard", "contenido": "Producto 3" },
          { "componente": "ProductCard", "contenido": "Producto 4" }
        ]
      },
      {
        "nombre": "accion_sticky",
        "layout": "sticky-bottom",
        "componentes": [
          { "componente": "BottomBar", "rol": "navegación persistente" }
        ]
      }
    ]
  }]
}
```

### Layouts disponibles

| Layout | Qué genera en Figma |
|---|---|
| `stack` | Auto Layout vertical (default) — componentes apilados |
| `grid-2col` | Grid de 2 columnas con Auto Layout horizontal por fila |
| `scroll-h` | Contenedor horizontal con clip — para chips, filtros, categorías |
| `sticky-bottom` | Empuja al fondo con spacer + layoutGrow — para nav bars, CTAs |

### Formato con campo "seccion" por componente (alternativa)

Si no usás `secciones` explícitas, podés agregar `seccion` y `layout_seccion` a cada componente:

```json
{
  "componente": "ProductCard",
  "seccion": "productos",
  "layout_seccion": "grid-2col"
}
```

### Auto-detección (sin cambios al JSON)

Si el JSON no tiene ni `secciones` ni campo `seccion`, el generador detecta automáticamente:
- **TopBar, NavBar, SearchBar** → header (full-width, sin padding)
- **Chip, Filter, CategoryPill** → scroll horizontal
- **ProductCard, Card_product** → grid 2 columnas
- **BottomBar, TabBar, StickyButton** → sticky bottom
- **Todo lo demás** → stack vertical con padding

---

## Contexto técnico

**El MCP escribe directamente al canvas de Figma** — no se necesita el plugin Prisma Builder ni Figma Make para los componentes del sistema de diseño. Este es el cambio central respecto al flujo anterior.

**Composiciones** se crean como sub-frames con Auto Layout con los sub-componentes de Prisma, pero **no sustituyen a un componente de librería**: si existe un gap real, documentarlo (Component Rules §6) en vez de forzar una composición.

**Brand mode** se intenta aplicar desde el campo `marca` del JSON vía Figma Variable Modes. Verificar que quedó aplicado; si falla, reaplicarlo con la API asíncrona de variables.

**Página destino**: el script crea o reutiliza una página con nombre `[proyecto] · [marca]`. Si ya existe, los frames se agregan en esa misma página.

**Spacing tokens aplicados:**
- `sectionSpacing (24px)`: entre secciones dentro del frame principal
- `itemSpacing (12px)`: entre componentes dentro de una sección
- `gridGap (8px)`: entre celdas de un grid 2-col
- `paddingHorizontal (16px)`: padding lateral de secciones con contenido padded
