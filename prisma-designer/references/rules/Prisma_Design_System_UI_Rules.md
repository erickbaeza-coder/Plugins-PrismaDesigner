# Prisma Design System UI Rules
## Constitución de Diseño para agentes IA y equipos de producto
**Versión:** 1.0  
**Estado:** Normativo  
**Idioma:** Español

---

## 1. Propósito

Este documento define las reglas obligatorias que cualquier agente, diseñador o contribuyente debe seguir al crear interfaces para aplicaciones basadas en Prisma.

Prisma no debe interpretarse como una colección de componentes aislados. Es un sistema que define una forma consistente de construir experiencias digitales.

### Regla principal

> **Antes de diseñar elementos, diseña la estructura. Antes de inventar valores, busca el token. Antes de crear un componente, busca uno existente. Antes de finalizar, valida.**

---

## 2. Principios innegociables

1. **Contenido antes que decoración.**
2. **Jerarquía antes que estilo.**
3. **Estructura antes que componentes.**
4. **Tokens antes que valores hardcoded.**
5. **Componentes Prisma antes que elementos independientes.**
6. **Consistencia antes que creatividad arbitraria.**
7. **Accesibilidad desde el inicio, no como corrección posterior.**
8. **Una pantalla debe tener un objetivo principal claramente identificable.**
9. **El espacio vacío es una herramienta de jerarquía, no espacio desperdiciado.**
10. **No se considera terminada una pantalla que no pase el Quality Gate.**

---

## 3. Comportamiento obligatorio del agente

Antes de generar una pantalla, el agente debe:

1. Identificar el objetivo principal.
2. Identificar el usuario y contexto.
3. Determinar la acción o decisión principal.
4. Identificar los componentes Prisma disponibles.
5. Identificar tokens aplicables.
6. Definir la estructura de la pantalla.
7. Establecer la jerarquía visual.
8. Construir el layout.
9. Aplicar componentes y tokens.
10. Validar accesibilidad, consistencia y performance.
11. Ejecutar una auto-revisión crítica.
12. Corregir problemas antes de entregar.

### Prohibiciones

El agente NO debe:

- Inventar colores.
- Inventar tamaños tipográficos.
- Inventar spacing cuando existe un token equivalente.
- Crear componentes nuevos si existe uno reutilizable.
- Duplicar componentes con pequeñas diferencias innecesarias.
- Utilizar estilos locales para reemplazar tokens.
- Superponer elementos accidentalmente.
- Resolver problemas de layout mediante posiciones absolutas cuando Auto Layout puede resolverlos.
- Saturar una pantalla para llenar espacio.
- Utilizar color como único mecanismo de comunicación.
- Introducir animaciones sin propósito funcional.

---

## 4. Tokens

Todos los valores visuales deben provenir del sistema de tokens Prisma o de sus fundaciones autorizadas.

### Deben utilizar tokens

- Color.
- Tipografía.
- Tamaño de texto.
- Line height.
- Spacing.
- Padding.
- Gap.
- Border radius.
- Border/stroke.
- Elevation, cuando exista.
- Opacity.
- Motion/duration, cuando exista.
- Breakpoints o dimensiones estructurales, cuando estén definidas.

### Regla de resolución

Si el agente necesita un valor que no existe:

1. Buscar un token semánticamente equivalente.
2. Buscar un token de la misma categoría con intención similar.
3. Verificar si existe un componente/patrón que resuelva la necesidad.
4. Si realmente no existe, marcarlo como **TOKEN GAP**.
5. No crear silenciosamente un valor hardcoded.

---

## 5. Grid y estructura espacial

Prisma debe utilizar una estructura espacial consistente.

### Reglas

- Utilizar la escala espacial definida por Prisma.
- Priorizar múltiplos de la escala base del sistema.
- Mantener márgenes laterales consistentes.
- Utilizar Auto Layout para relaciones espaciales.
- Evitar offsets manuales como solución permanente.
- Mantener alineaciones compartidas entre secciones relacionadas.
- Agrupar contenido que pertenece a la misma unidad semántica.

### Ritmo vertical

El spacing debe comunicar jerarquía.

**Menor distancia = mayor relación.**  
**Mayor distancia = mayor separación conceptual.**

No utilizar el mismo gap entre todos los elementos de una pantalla.

---

## 6. Jerarquía tipográfica

La tipografía debe comunicar claramente qué debe leer primero, segundo y tercero.

### Reglas

- Máximo un título principal por pantalla.
- Utilizar estilos tipográficos Prisma.
- No crear tamaños arbitrarios.
- Diferenciar título, sección, cuerpo, metadata y acciones.
- Evitar utilizar bold como única forma de crear jerarquía.
- Mantener line-height adecuado para lectura.
- Evitar párrafos excesivamente largos en móvil.
- No sacrificar legibilidad para mostrar más contenido.

### Principio

> Si todos los elementos parecen importantes, ninguno parece importante.

---

## 7. Color

El color debe utilizarse con intención semántica.

### Prioridad

1. Color de superficie/background.
2. Color de contenido principal.
3. Color de contenido secundario.
4. Color de acción.
5. Color semántico: success, warning, error, info.
6. Color de marca o promoción cuando corresponda.

### Reglas

- Utilizar variables/tokens.
- No utilizar colores de marca como decoración indiscriminada.
- No usar color como único indicador de estado.
- Mantener contraste suficiente.
- Evitar demasiados colores competitivos en una misma pantalla.

---

## 8. Composición de pantalla

Toda pantalla debe tener una estructura reconocible.

### Orden recomendado

1. Contexto / navegación.
2. Header o título.
3. Contexto secundario cuando sea necesario.
4. Contenido principal.
5. Acción principal.
6. Acciones secundarias.
7. Navegación persistente, si corresponde.

No todas las pantallas necesitan todos los niveles.

### Regla de foco

La pantalla debe responder rápidamente:

> **¿Dónde estoy? ¿Qué puedo hacer? ¿Qué debería hacer ahora?**

---

## 9. Componentes

Antes de crear un elemento nuevo:

1. Buscar componente Prisma.
2. Revisar variantes.
3. Revisar properties.
4. Revisar slots.
5. Revisar estados.
6. Revisar tamaños.
7. Revisar documentación.
8. Reutilizar el componente si satisface el caso.

Un componente existente no debe duplicarse solo por una diferencia visual menor.

---

## 10. Estados

Los componentes interactivos deben considerar, cuando aplique:

- Default.
- Pressed.
- Focused.
- Disabled.
- Loading.
- Selected.
- Error.
- Success.
- Empty.
- Skeleton.
- Offline o estados de conectividad cuando corresponda.

El agente debe diseñar estados relevantes al contexto, no generar estados innecesarios.

---

## 11. Accesibilidad

La accesibilidad es una condición de diseño.

Validar:

- Contraste.
- Tamaño táctil.
- Legibilidad.
- Jerarquía.
- No depender únicamente del color.
- Estados distinguibles.
- Textos comprensibles.
- Focus/keyboard cuando aplique.
- Dynamic Type / escalamiento tipográfico cuando aplique.
- Compatibilidad con tecnologías asistivas.

La implementación final debe alinearse con WCAG y las convenciones de plataforma correspondientes.

---

## 12. iOS

Cuando la pantalla sea para iOS:

- Respetar Safe Areas.
- Considerar Dynamic Island/notch.
- Utilizar patrones de navegación propios de iOS cuando correspondan.
- Mantener targets táctiles cómodos.
- Considerar Dynamic Type.
- Evitar colocar contenido crítico en zonas de interferencia del sistema.
- Mantener comportamiento consistente con gestos y navegación del sistema.

---

## 13. Performance

La interfaz debe ser visualmente rica sin ser innecesariamente pesada.

Evitar:

- Animaciones permanentes.
- Blur excesivo.
- Sombras innecesarias.
- Gradientes decorativos sin propósito.
- Imágenes gigantes.
- Múltiples efectos simultáneos.
- Elementos que requieran rendering costoso sin beneficio UX.

Priorizar:

- Componentes reutilizables.
- Assets optimizados.
- Animaciones breves y funcionales.
- Jerarquía visual simple.

---

## 14. Microinteracciones

Una microinteracción debe responder al menos una de estas preguntas:

- ¿Confirma una acción?
- ¿Explica un cambio?
- ¿Ayuda a orientarse?
- ¿Indica estado?
- ¿Reduce incertidumbre?
- ¿Mejora la percepción de continuidad?

Si la respuesta es no, probablemente no sea necesaria.

---

## 15. Auto-revisión del agente

Antes de entregar una pantalla, el agente debe preguntarse:

- ¿Puedo entender el objetivo en menos de cinco segundos?
- ¿Existe un foco visual claro?
- ¿Hay elementos innecesarios?
- ¿Puedo eliminar algo sin perder información?
- ¿Existe un componente Prisma equivalente?
- ¿Estoy utilizando tokens?
- ¿Hay valores hardcoded?
- ¿La jerarquía tipográfica es evidente?
- ¿Los espacios comunican relaciones?
- ¿La pantalla se siente parte del mismo producto?
- ¿La interfaz funcionaría con contenido real?
- ¿Qué ocurre si el texto crece?
- ¿Qué ocurre con estados vacíos, error y loading?
- ¿La interacción principal es evidente?
- ¿Existe alguna decisión puramente estética que perjudique UX o performance?

---

# 16. Quality Gate

Una pantalla no puede considerarse finalizada hasta completar esta validación.

### A. Estructura — 20 puntos
- [ ] Objetivo claro.
- [ ] Jerarquía clara.
- [ ] Layout estructurado.
- [ ] Alineaciones consistentes.
- [ ] No existen solapamientos accidentales.

### B. Design System — 25 puntos
- [ ] Componentes Prisma utilizados.
- [ ] Tokens utilizados.
- [ ] No existen estilos locales innecesarios.
- [ ] Variantes correctamente configuradas.
- [ ] Properties justificadas.

### C. Visual — 20 puntos
- [ ] Tipografía consistente.
- [ ] Color semántico.
- [ ] Spacing consistente.
- [ ] Composición equilibrada.
- [ ] Foco visual claro.

### D. Accesibilidad — 15 puntos
- [ ] Contraste.
- [ ] Targets táctiles.
- [ ] Jerarquía legible.
- [ ] Estados distinguibles.
- [ ] No depende únicamente del color.

### E. UX — 10 puntos
- [ ] Acción principal evidente.
- [ ] Información priorizada.
- [ ] Estados contemplados.
- [ ] Feedback apropiado.

### F. Performance — 10 puntos
- [ ] Assets razonables.
- [ ] Sin efectos innecesarios.
- [ ] Motion justificado.
- [ ] No existe complejidad visual sin beneficio.

### Resultado

**90–100:** Gold Standard  
**80–89:** Aprobable con mejoras  
**70–79:** Requiere revisión  
**<70:** No aprobado

### Regla adicional

Una pantalla con problemas críticos de tokens, accesibilidad, solapamiento o estructura **no puede aprobarse aunque tenga un score alto**.

---

# 17. Entrega del agente

Cada pantalla debe acompañarse de:

### Design Summary
- Objetivo.
- Usuario/contexto.
- Acción principal.
- Componentes utilizados.

### Token Validation
- Tokens utilizados.
- Posibles gaps.
- Valores hardcoded encontrados.

### Accessibility Review
- Hallazgos.
- Riesgos.
- Correcciones.

### Quality Score
- Score total.
- Warnings.
- Errores críticos.
- Recomendaciones.

---

## Regla final

> **Prisma no busca que una pantalla simplemente se vea bien. Busca que esté estructurada, sea comprensible, accesible, consistente, implementable y perteneciente al mismo sistema.**
