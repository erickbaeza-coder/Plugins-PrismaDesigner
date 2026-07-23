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

## Flujo de ejecución

### Paso 1 — Recibir la descripción

Si el diseñador no la dio, pedirla:
> "¿Qué tipo de componente estás buscando? Describilo en lenguaje natural."
> Ejemplo: "una card para mostrar un producto con precio y botón de compra"

### Paso 2 — Buscar en el catálogo

Llamar `resolve_component` con la descripción del diseñador.

### Paso 3 — Mostrar resultado

**Si encuentra match con alta confianza (>80%):**
```
✅ Componente encontrado

Nombre: [nombre exacto]
Grupo: [grupo]
Confianza: [N]%

Sintaxis para DS3:
"componente": "[nombre exacto · Props=Valores]"
```

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

### Paso 4 — Listar componentes disponibles (opcional)

Si el diseñador quiere explorar el catálogo completo:
- Llamar `list_prisma_components` con filtro opcional
- Mostrar la lista agrupada por categoría

### Paso 5 — Ofrecer ayuda adicional

Preguntar si quiere:
- Ver las props disponibles para ese componente
- Agregarlo directamente a su DS3 JSON
- Buscar otro componente
