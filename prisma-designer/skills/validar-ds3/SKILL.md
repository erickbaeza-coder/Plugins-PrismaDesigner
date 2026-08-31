---
name: validar-ds3
description: >
  Valida un DS3 JSON contra el catálogo de Prisma-Components y las Design Rules,
  reportando errores sintácticos y de calidad de diseño antes de crear las pantallas.
  Úsala cuando el diseñador diga "/validar-ds3", "validar el json", "revisar el ds3",
  "chequear el json", "hay errores en el ds3?", "está bien mi json?", "revisar calidad",
  "validar diseño" o cualquier variante que indique querer verificar un DS3 JSON
  antes de usarlo. Requiere que el MCP prisma-mcp esté conectado.
---

## Qué hace esta skill

Corre una validación completa del DS3 JSON en dos niveles:

1. **Nivel 1 — Validación sintáctica**: nombres de componentes, grupos válidos, props existentes (contra catálogo Prisma)
2. **Nivel 2 — Validación de diseño**: estructura, jerarquía, composición, accesibilidad y calidad (contra Design Rules)

### Rules que aplica

Antes de ejecutar, el agente **DEBE leer** estas references:

1. `references/rules/Prisma_Design_System_UI_Rules.md` — Principios, tokens, composición, Quality Gate
2. `references/rules/Prisma_Component_Rules.md` — Reglas de selección y composición
3. `references/rules/Prisma_Accessibility_Rules.md` — Contraste, targets, estados, tipografía
4. `references/rules/Prisma_Screen_Playbook.md` — Método de construcción de pantallas

---

## Flujo de ejecución

### Paso 1 — Recibir el JSON

Si el diseñador no lo pegó, pedirlo:
> "Pegá el DS3 JSON que querés validar."

---

### Paso 2 — Validación sintáctica (Nivel 1)

Llamar `validate_ds3_json` con el JSON recibido.

Esto valida contra el catálogo: nombres de componentes, grupos válidos, props existentes.

---

### Paso 3 — Validación de diseño (Nivel 2)

El agente analiza el DS3 JSON aplicando las Design Rules. Evalúa cada pantalla en 6 dimensiones:

#### A. Estructura (Screen Playbook)

- [ ] ¿Tiene una jerarquía reconocible? (navegación → header → contenido → acción)
- [ ] ¿El orden de componentes sigue la lógica: contexto → contenido principal → acciones → nav persistente?
- [ ] ¿No hay solapamientos lógicos? (ej: dos navbars, dos sticky buttons)
- [ ] ¿La cantidad de componentes es proporcional al objetivo?

#### B. Design System (Component Rules + UI Rules)

- [ ] ¿Se priorizaron componentes Prisma existentes sobre soluciones custom?
- [ ] ¿Las composiciones documentan correctamente el gap? (nombre_intencional, sub-componentes, rol)
- [ ] ¿No hay duplicaciones innecesarias de componentes?
- [ ] ¿Las variantes y properties elegidas son las correctas para el contexto?
- [ ] ¿No se crearon componentes custom cuando existe uno equivalente en Prisma?

#### C. Jerarquía visual (UI Rules)

- [ ] ¿Hay un foco visual claro por pantalla?
- [ ] ¿Existe una acción principal identificable?
- [ ] ¿La pantalla responde a: "¿Dónde estoy? ¿Qué puedo hacer? ¿Qué debería hacer ahora?"?
- [ ] ¿No hay elementos que compitan por atención sin jerarquía clara?

#### D. Accesibilidad (Accessibility Rules)

- [ ] ¿Los componentes elegidos soportan targets táctiles adecuados?
- [ ] ¿No se depende exclusivamente del color para comunicar estados?
- [ ] ¿Los textos de contenido tienen roles claros (título, body, metadata, helper)?
- [ ] ¿Se usan componentes con estados distinguibles (no solo color)?

#### E. Completitud de estados (UI Rules)

- [ ] ¿Se contemplan estados loading/skeleton donde aplique?
- [ ] ¿Se contempla estado empty cuando el contenido puede estar vacío?
- [ ] ¿Se contempla estado error cuando hay interacción o carga de datos?
- [ ] ¿La pantalla funciona con contenido real (textos largos, precios variables)?

#### F. Motion (Motion Rules)

- [ ] ¿Los componentes candidatos a motion están identificados? (navigation, bottom sheets, overlays, loading, buttons)
- [ ] ¿No se saturan animaciones sin propósito?

---

### Paso 4 — Reportar resultados

**Si no hay errores en ningún nivel:**
```
✅ DS3 JSON válido — sintaxis y diseño

Pantallas: [N]
Componentes totales: [N]
Válidos: [N]
Composiciones: [N]

Validación de diseño:
• Estructura: ✅
• Design System: ✅
• Jerarquía: ✅
• Accesibilidad: ✅
• Estados: ✅
• Motion: ✅

Listo para usar con /crear-pantallas
```

**Si hay errores sintácticos (Nivel 1):**
```
❌ Se encontraron [N] errores sintácticos

ERRORES (bloquean la creación):
• [Pantalla] · [Componente]: [mensaje]
  → Sugerencia: [alternativa]

WARNINGS (no bloquean pero revisar):
• [Pantalla] · [Componente]: [mensaje]
```

**Si hay observaciones de diseño (Nivel 2):**
```
📋 Validación de diseño — [N] observaciones

CRÍTICAS (impactan Quality Gate significativamente):
• [Pantalla]: [observación]
  → Regla: [referencia a la rule específica]
  → Sugerencia: [mejora concreta]

MEJORABLES (no bloquean pero mejorarían el score):
• [Pantalla]: [observación]
  → Sugerencia: [mejora]

NOTAS:
• [Observaciones informativas]

Quality Score estimado: [N]/100
```

Para cada error, explicar en lenguaje simple qué está mal, qué rule aplica, y cuál sería la mejora.

---

### Paso 5 — Ofrecer fix

Si hay errores sintácticos, preguntar:
> "¿Querés que corrija automáticamente los componentes con errores? Puedo sugerir el nombre correcto de Prisma para cada uno."

Si el diseñador acepta:
- Para cada componente con error, llamar `resolve_component` con el nombre incorrecto
- Mostrar el componente sugerido
- Proponer el JSON corregido

Si hay observaciones de diseño, preguntar:
> "¿Querés que proponga ajustes al JSON para mejorar la estructura/jerarquía? Puedo sugerir componentes adicionales o reordenar los existentes."

---

### Paso 6 — Ofrecer siguiente paso

Según resultado:
- Sin errores → "¿Listo para crear las pantallas? Usá `/crear-pantallas`"
- Con fixes aplicados → "JSON corregido. ¿Querés que lo valide de nuevo?"
- Con observaciones de diseño → "¿Querés correr `/quality-gate` para un análisis más profundo después de crear?"
