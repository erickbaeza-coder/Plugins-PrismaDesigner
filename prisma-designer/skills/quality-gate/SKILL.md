---
name: quality-gate
description: >
  Ejecuta el Quality Gate de Prisma sobre pantallas ya creadas o sobre un DS3 JSON,
  evaluando 6 dimensiones con scoring de 100 puntos. Úsala cuando el diseñador diga
  "/quality-gate", "revisar calidad", "quality score", "puntaje de calidad",
  "evaluar pantallas", "auditar diseño", "pasar el quality gate", "score de la pantalla",
  "gold standard", "está bien mi diseño?", "revisar antes de entregar"
  o cualquier variante que indique querer una evaluación de calidad de diseño.
  No requiere MCP — funciona sobre DS3 JSON o sobre screenshots/descripción de pantallas.
---

## Qué hace esta skill

Ejecuta una auditoría de calidad de diseño basada en el **Quality Gate** definido en las
Prisma Design System UI Rules. Evalúa 6 dimensiones, asigna un score sobre 100 puntos,
identifica problemas críticos y genera recomendaciones accionables.

### Rules que aplica

Antes de ejecutar, el agente **DEBE leer** TODAS estas references:

1. `references/rules/Prisma_Design_System_UI_Rules.md` — Quality Gate, principios, auto-revisión
2. `references/rules/Prisma_Screen_Playbook.md` — Método de construcción y checklist
3. `references/rules/Prisma_Component_Rules.md` — Selección y composición de componentes
4. `references/rules/Prisma_Accessibility_Rules.md` — Contraste, targets, estados, tipografía
5. `references/rules/Prisma_Motion_Rules.md` — Movimiento y microinteracciones
6. `references/rules/Prisma_Gold_Standard_Screen_Prompt.md` — Prompt maestro y formato de entrega

El agente debe internalizar todas las reglas antes de evaluar.

---

## Modos de uso

Esta skill acepta tres tipos de input:

1. **DS3 JSON** — evalúa la calidad del diseño antes de crear en Figma
2. **Screenshot de Figma** — evalúa pantallas ya creadas visualmente
3. **Descripción textual** — evalúa una descripción de pantalla cuando no hay JSON ni screenshot

---

## Flujo de ejecución

### Paso 1 — Recibir input

Preguntar al diseñador qué quiere evaluar:

> "¿Qué querés evaluar? Podés pegarme:
> - El DS3 JSON de las pantallas
> - Un screenshot de las pantallas en Figma
> - Una descripción de lo que diseñaste"

---

### Paso 2 — Identificar pantallas

Para cada pantalla identificada, registrar:
- Nombre/ID
- Objetivo aparente
- Cantidad de componentes
- Flujo al que pertenece

---

### Paso 3 — Ejecutar auto-revisión (UI Rules §15)

Para cada pantalla, responder internamente las 15 preguntas de auto-revisión:

1. ¿Puedo entender el objetivo en menos de cinco segundos?
2. ¿Existe un foco visual claro?
3. ¿Hay elementos innecesarios?
4. ¿Puedo eliminar algo sin perder información?
5. ¿Existe un componente Prisma equivalente no utilizado?
6. ¿Se están utilizando tokens?
7. ¿Hay valores hardcoded?
8. ¿La jerarquía tipográfica es evidente?
9. ¿Los espacios comunican relaciones?
10. ¿La pantalla se siente parte del mismo producto?
11. ¿La interfaz funcionaría con contenido real?
12. ¿Qué ocurre si el texto crece?
13. ¿Qué ocurre con estados vacíos, error y loading?
14. ¿La interacción principal es evidente?
15. ¿Existe alguna decisión puramente estética que perjudique UX o performance?

---

### Paso 4 — Evaluar Quality Gate (6 dimensiones)

Aplicar el Quality Gate del UI Rules §16. Cada dimensión tiene criterios específicos y un puntaje máximo.

#### A. Estructura — 20 puntos

| Criterio | Pts | Evaluación |
|---|---|---|
| Objetivo claro | 4 | ¿Se entiende para qué sirve la pantalla? |
| Jerarquía clara | 4 | ¿Hay niveles distinguibles de importancia? |
| Layout estructurado | 4 | ¿Usa Auto Layout / estructura consistente? |
| Alineaciones consistentes | 4 | ¿Los elementos comparten líneas de alineación? |
| Sin solapamientos accidentales | 4 | ¿No hay elementos superpuestos sin intención? |

#### B. Design System — 25 puntos

| Criterio | Pts | Evaluación |
|---|---|---|
| Componentes Prisma utilizados | 5 | ¿Se priorizaron componentes existentes? |
| Tokens utilizados | 5 | ¿Los valores visuales vienen de tokens? |
| Sin estilos locales innecesarios | 5 | ¿No se crearon overrides que tokens resuelven? |
| Variantes correctas | 5 | ¿Se eligió la variante apropiada para el contexto? |
| Properties justificadas | 5 | ¿Las props configuradas tienen sentido? |

#### C. Visual — 20 puntos

| Criterio | Pts | Evaluación |
|---|---|---|
| Tipografía consistente | 4 | ¿Se usan estilos tipográficos Prisma? |
| Color semántico | 4 | ¿El color comunica significado, no solo decoración? |
| Spacing consistente | 4 | ¿Los gaps siguen la escala y comunican relación? |
| Composición equilibrada | 4 | ¿No hay zonas saturadas vs. vacías sin intención? |
| Foco visual claro | 4 | ¿El ojo sabe dónde ir primero? |

#### D. Accesibilidad — 15 puntos

| Criterio | Pts | Evaluación |
|---|---|---|
| Contraste | 3 | ¿Texto/iconos tienen contraste suficiente? |
| Targets táctiles | 3 | ¿Los controles tienen área táctil adecuada? |
| Jerarquía legible | 3 | ¿Se puede leer cómodamente? |
| Estados distinguibles | 3 | ¿Los estados se diferencian sin solo color? |
| Sin dependencia exclusiva de color | 3 | ¿Hay indicadores adicionales a color? |

#### E. UX — 10 puntos

| Criterio | Pts | Evaluación |
|---|---|---|
| Acción principal evidente | 2.5 | ¿Se sabe qué hacer? |
| Información priorizada | 2.5 | ¿Lo importante se ve primero? |
| Estados contemplados | 2.5 | ¿Se diseñaron loading, empty, error? |
| Feedback apropiado | 2.5 | ¿Las acciones tienen respuesta visual? |

#### F. Performance — 10 puntos

| Criterio | Pts | Evaluación |
|---|---|---|
| Assets razonables | 2.5 | ¿No hay imágenes gigantes o innecesarias? |
| Sin efectos innecesarios | 2.5 | ¿No hay blur, sombras o gradientes decorativos? |
| Motion justificado | 2.5 | ¿Las animaciones tienen propósito funcional? |
| Sin complejidad visual sin beneficio | 2.5 | ¿Todo lo visual aporta a la UX? |

---

### Paso 5 — Generar reporte

Entregar el reporte completo por pantalla:

```
## Quality Gate — [Nombre pantalla]

### Score: [N]/100 — [Calificación]

| Dimensión | Score | Max |
|---|---|---|
| A. Estructura | __/20 | 20 |
| B. Design System | __/25 | 25 |
| C. Visual | __/20 | 20 |
| D. Accesibilidad | __/15 | 15 |
| E. UX | __/10 | 10 |
| F. Performance | __/10 | 10 |
| **TOTAL** | **__/100** | **100** |

### Calificación
[Una de: 🏆 Gold Standard (90-100) | ✅ Aprobable con mejoras (80-89) | ⚠️ Requiere revisión (70-79) | ❌ No aprobado (<70)]

### Problemas críticos
[Lista de problemas que impiden aprobación independientemente del score:
tokens hardcoded, solapamientos, componentes Prisma no utilizados cuando existen,
jerarquía confusa, problemas críticos de accesibilidad, acción principal no clara]

### Detalle por dimensión

**Estructura:**
• [Criterio]: [✅|⚠️|❌] — [Observación]

**Design System:**
• [Criterio]: [✅|⚠️|❌] — [Observación]

**Visual:**
• [Criterio]: [✅|⚠️|❌] — [Observación]

**Accesibilidad:**
• [Criterio]: [✅|⚠️|❌] — [Observación]

**UX:**
• [Criterio]: [✅|⚠️|❌] — [Observación]

**Performance:**
• [Criterio]: [✅|⚠️|❌] — [Observación]

### Auto-revisión (15 preguntas)
[Resumen de las respuestas a las 15 preguntas de auto-revisión,
destacando solo las que revelaron problemas]

### Recomendaciones para Gold Standard
[Lista priorizada de mejoras concretas y accionables.
Para cada una, indicar qué dimensión mejora y cuántos puntos estimados sumaría]

### Token Gaps detectados
[Tokens que no existen y se necesitarían, o "Ninguno"]

### Component Gaps detectados
[Componentes que no existen en Prisma y se necesitarían, o "Ninguno"]
```

---

### Paso 6 — Resumen ejecutivo (si hay múltiples pantallas)

Si se evaluaron múltiples pantallas, agregar un resumen:

```
## Resumen del flujo

| Pantalla | Score | Calificación | Críticos |
|---|---|---|---|
| P01 | __/100 | [calificación] | [N] |
| P02 | __/100 | [calificación] | [N] |
| ... | | | |
| **Promedio** | **__/100** | | |

Pantallas Gold Standard: [N]/[total]
Pantallas con críticos: [N]/[total]
```

---

### Paso 7 — Ofrecer siguiente paso

Según resultado:
- **Gold Standard** → "Excelente. Listo para implementar."
- **Aprobable** → "¿Querés que sugiera mejoras específicas para llegar a Gold Standard?"
- **Requiere revisión** → "Te recomiendo corregir los puntos marcados. ¿Querés que proponga ajustes al DS3 JSON?"
- **No aprobado** → "Hay problemas estructurales. Te sugiero revisar [dimensiones más bajas] antes de continuar. ¿Empezamos por [la más crítica]?"

---

## Regla de bloqueo

> **Una pantalla con problemas críticos de tokens, accesibilidad, solapamiento o estructura NO puede aprobarse aunque tenga un score alto.**

Si el score es ≥80 pero hay problemas críticos, reportar:

```
⚠️ Score [N]/100 pero con [N] problema(s) crítico(s)
La pantalla NO se considera aprobada hasta resolver:
• [problema crítico 1]
• [problema crítico 2]
```
