---
name: resolver-componente
description: >
  Encuentra el componente Prisma correcto dado una descripción en lenguaje natural.
  Úsala cuando el diseñador diga "/resolver-componente", "qué componente uso para...",
  "cómo se llama el componente de...", "buscar componente", "existe un componente para...",
  "cuál es el nombre exacto de..." o cualquier variante que indique querer encontrar
  un componente específico del sistema de diseño Prisma. Requiere prisma-mcp conectado.
---

## Qué hace esta skill

Recibe una descripción en lenguaje natural y devuelve el nombre exacto del
componente Prisma que mejor coincide, con su sintaxis correcta lista para
usar en un DS3 JSON.

### Rules que aplica

Antes de ejecutar, el agente **DEBE leer**:

1. `references/rules/Prisma_Component_Rules.md` — Orden de decisión, properties, variants, gap documentation
2. `references/rules/Prisma_Working_Rules.md` — Tabla de márgenes propios y limitaciones conocidas de componentes

El agente debe seguir el orden de decisión de Component Rules:
componente existente → variante → property → slot → composición → nuevo componente (solo si hay gap real).

## Flujo de ejecución

### Paso 1 — Recibir la descripción

Si el diseñador no la dio, pedirla:
> "¿Qué tipo de componente estás buscando? Describilo en lenguaje natural."
> Ejemplo: "una card para mostrar un producto con precio y botón de compra"

### Paso 2 — Buscar en el catálogo

Llamar `resolve_component` con la descripción del diseñador.

> ⚠️ **La búsqueda por texto libre es poco precisa** (en una prueba, 4 de 16 consultas dieron el componente correcto: confunde chips con carruseles, alertas con títulos, top bar con título con uno sin título). Por eso:
> - **Mostrar siempre hasta 3 candidatos** con la razón de cada uno, no solo el primero.
> - **Contrastar con el nombre real de la librería** (`Wl*`, p. ej. `WlTopBarTitle`, `WlChip`, `WlAlert`) antes de afirmar que es el correcto; si el resultado no tiene prefijo `Wl*`, avisar que viene del catálogo propio.
> - Si dudas, **confirmar en Figma** (`search_design_system`) y decirlo.
> - Cuando el diseñador nombre un componente exacto, buscar por ese nombre, no por descripción.

### Paso 3 — Mostrar resultado

**Si encuentra match con alta confianza (>80%):**
```
✅ Componente encontrado

Nombre: [nombre exacto]
Grupo / librería: [grupo] · [App | Web]
Confianza: [N]%

Ficha:
• Variantes y props: [Type, State, Size… booleanas, texto, swap]  ← si el MCP no las devuelve, escribir "no indexadas"
• Margen propio: [Sí | No | No verificado]  → ¿necesita contenedor? [No: directo al frame | Sí: mínimo 16 px]
• Ancho esperado: [375 | variable | no verificado]
• Limitaciones conocidas: [ver Working Rules §7, o "ninguna conocida"]

Sintaxis para DS3:
"componente": "[nombre exacto · Props=Valores]"
```
Margen y ancho salen de la tabla de `Prisma_Working_Rules.md` §2 (librería de **app**). En web, decir "no verificado".

**Si encuentra match con confianza media (50-80%):**
```
🔍 Posible match encontrado

[nombre] — [N]% de coincidencia

¿Es esto lo que buscás? Si no, describilo con más detalle.
```

**Si no encuentra match:**
```
❌ No encontré un componente que coincida exactamente.

Las opciones más cercanas son:
• [nombre 1] — [descripción]
• [nombre 2] — [descripción]

Si ninguna sirve, puedo generar una composición usando /crear-pantallas
con tipo "composicion" + un prompt de Figma Make para crearlo desde cero.
```

**Si el componente no existe (gap real):** no proponer una composición con piezas inadecuadas. Declarar el gap según Component Rules §6: necesidad, alternativas evaluadas (y por qué no sirven), tokens requeridos y solución provisional. Ejemplos ya documentados: combo con 3 ítems, bottom sheet con contenido propio, banner con tarjeta de copy.

### Paso 4 — Listar componentes disponibles (opcional)

Si el diseñador quiere explorar el catálogo completo:
- Llamar `list_prisma_components` con filtro opcional
- Mostrar la lista agrupada por categoría

### Paso 5 — Ofrecer ayuda adicional

Preguntar si quiere:
- Ver las props disponibles para ese componente
- Agregarlo directamente a su DS3 JSON
- Buscar otro componente
