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
**directamente en el canvas de Figma** — sin plugin manual, sin pasos intermedios:

1. Valida el DS3 JSON contra el catálogo Prisma
2. Llama `create_screens_from_ds3` → el MCP genera un script JavaScript
3. Claude ejecuta ese script via `use_figma` → los frames aparecen en Figma
4. Brand mode de la marca se aplica automáticamente a todos los frames

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

### Paso 2 — Validar el JSON

Llamar `validate_ds3_json` con el JSON recibido.

- **Errores** → mostrarlos con sugerencia de fix y detener el flujo
- **Warnings** → mostrarlos y preguntar si continúa igual
- **Todo OK** → continuar

---

### Paso 3 — Generar el script

Llamar `create_screens_from_ds3` con:
- `ds3_json`: el JSON completo como string
- `figma_file_url`: la URL del archivo (si la tenés)

El MCP devuelve un texto que incluye la sección `## 🚀 Script use_figma` con el código JavaScript a ejecutar.

---

### Paso 4 — Ejecutar en Figma

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

### Paso 5 — Confirmar resultado

Con la respuesta de `use_figma`, reportar:

```
✅ Pantallas creadas en Figma

Página    : [nombre de la página]
Pantallas : P01 · P02 · P03 · ... ([N] total)
Brand mode: "[marca]" aplicado ✓

⚠️ Composiciones para armar manualmente:
• [Pantalla]: [NombreComposición]
```

Si no hay composiciones, omitir esa sección.

Ofrecer: "¿Querés que resuelva algún componente específico? Puedo usar `/resolver-componente`."

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
