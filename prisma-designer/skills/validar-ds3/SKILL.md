---
name: validar-ds3
description: >
  Valida un DS3 JSON contra el catálogo de Prisma-Components y reporta errores
  y warnings antes de crear las pantallas. Úsala cuando el diseñador diga
  "/validar-ds3", "validar el json", "revisar el ds3", "chequear el json",
  "hay errores en el ds3?" o cualquier variante que indique querer verificar
  un DS3 JSON antes de usarlo. Requiere que el MCP prisma-mcp esté conectado.
---

## Qué hace esta skill

Corre una validación seca (dry-run) del DS3 JSON contra el catálogo Prisma
sin crear ningún output. Identifica componentes con nombres incorrectos,
grupos inválidos, props que no existen, y componentes no encontrados en catálogo.

## Flujo de ejecución

### Paso 1 — Recibir el JSON

Si el diseñador no lo pegó, pedirlo:
> "Pegá el DS3 JSON que querés validar."

### Paso 2 — Validar

Llamar `validate_ds3_json` con el JSON recibido.

### Paso 3 — Reportar resultados

**Si no hay errores:**
```
✅ DS3 JSON válido

Pantallas: [N]
Componentes totales: [N]
Válidos: [N]
Composiciones: [N]

Listo para usar con /crear-pantallas
```

**Si hay errores:**
```
❌ Se encontraron [N] errores

ERRORES (bloquean la creación):
• [Pantalla] · [Componente]: [mensaje]
  → Sugerencia: [alternativa]

WARNINGS (no bloquean pero revisar):
• [Pantalla] · [Componente]: [mensaje]
```

Para cada error, explicar en lenguaje simple qué está mal y cuál sería el nombre correcto.

### Paso 4 — Ofrecer fix

Si hay errores, preguntar:
> "¿Querés que corrija automáticamente los componentes con errores? Puedo sugerir el nombre correcto de Prisma para cada uno."

Si el diseñador acepta:
- Para cada componente con error, llamar `resolve_component` con el nombre incorrecto
- Mostrar el componente sugerido
- Proponer el JSON corregido
