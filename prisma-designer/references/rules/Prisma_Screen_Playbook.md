# Prisma Screen Playbook
## Método para construir pantallas de aplicación desde cero
**Versión:** 1.0  
**Uso:** Agentes IA / Diseñadores / Product Designers

---

# 1. Objetivo

Este playbook define el proceso que debe seguir un agente cuando recibe una solicitud para crear una pantalla.

El agente debe construir la pantalla como un sistema de decisiones, no como una colección de elementos.

---

# 2. Paso 0 — Entender antes de diseñar

Antes de crear cualquier frame, responder:

- ¿Qué pantalla se está construyendo?
- ¿Cuál es su objetivo?
- ¿Quién la utiliza?
- ¿En qué momento del journey aparece?
- ¿Cuál es la acción principal?
- ¿Cuál es la información imprescindible?
- ¿Qué información es secundaria?
- ¿Qué puede esperar el usuario?
- ¿Qué estados existen?

Si estas respuestas no están claras, no iniciar el diseño visual.

---

# 3. Paso 1 — Definir la jerarquía

Crear una jerarquía de contenido:

### Nivel 1 — Propósito
Lo que el usuario necesita comprender primero.

### Nivel 2 — Acción
Lo que puede hacer.

### Nivel 3 — Información
Lo que necesita para decidir.

### Nivel 4 — Metadata
Información secundaria.

### Nivel 5 — Decoración
Solo si aporta valor.

La decoración nunca debe competir con el propósito.

---

# 4. Paso 2 — Construir el esqueleto

Antes de aplicar colores, imágenes o detalles:

1. Crear viewport.
2. Definir Safe Area.
3. Definir estructura superior.
4. Definir contenido principal.
5. Definir acción principal.
6. Definir navegación persistente cuando aplique.
7. Establecer Auto Layout.
8. Definir spacing.

### Regla

> Primero wireframe estructural. Después diseño visual.

---

# 5. Paso 3 — Crear el ritmo espacial

Utilizar tokens de spacing Prisma.

El agente debe determinar:

- Margin exterior.
- Padding de containers.
- Gap entre elementos.
- Gap entre grupos.
- Separación entre secciones.
- Espacio antes/después de acciones.

### Relación semántica

Elementos relacionados → gap menor.  
Elementos diferentes → gap mayor.  
Cambio de sección → separación claramente perceptible.

---

# 6. Paso 4 — Seleccionar componentes

Para cada elemento:

1. Buscar componente Prisma.
2. Buscar variante.
3. Buscar property.
4. Buscar slot.
5. Buscar estado.
6. Confirmar tamaño.
7. Instanciar.

### Si no existe

El agente debe declarar:

**COMPONENT GAP**

y explicar:

- Qué necesita.
- Por qué los componentes existentes no sirven.
- Qué patrón propone.
- Qué tokens utilizaría.

No debe crear silenciosamente una solución independiente.

---

# 7. Paso 5 — Aplicar tipografía

La tipografía se aplica después de la estructura.

Definir:

- Display / Heading cuando corresponda.
- Title.
- Body.
- Label.
- Metadata.
- Helper/Error.

Validar:

- Tamaño.
- Peso.
- Line height.
- Color.
- Longitud.
- Wrapping.

### Regla

No reducir tipografía únicamente para evitar wrapping.

Primero revisar layout y contenido.

---

# 8. Paso 6 — Aplicar color

Aplicar colores semánticos después de validar jerarquía.

Orden:

1. Background.
2. Surface.
3. Content.
4. Border.
5. Action.
6. Semantic.
7. Brand/promotional.

El color no debe utilizarse para corregir una jerarquía estructural deficiente.

---

# 9. Paso 7 — Imagen y gráficos

Las imágenes deben tener propósito.

Antes de añadir una imagen preguntar:

- ¿Ayuda a comprender?
- ¿Ayuda a decidir?
- ¿Representa producto/contenido?
- ¿Aporta identidad de marca?

### Gráficos

Para charts o visualizaciones:

- Mostrar primero la información relevante.
- Reducir decoración.
- Utilizar etiquetas comprensibles.
- Mantener contraste.
- No depender exclusivamente del color.
- Utilizar el tipo de gráfico adecuado para la relación de datos.

---

# 10. Paso 8 — Acciones

Toda pantalla debe tener claramente definida su acción principal cuando exista.

### Acción primaria

Debe ser:

- visible,
- comprensible,
- accesible,
- consistente con el contexto.

Las acciones secundarias nunca deben competir visualmente con la principal.

---

# 11. Paso 9 — Estados

El agente debe determinar qué estados son necesarios.

Como mínimo evaluar:

- Loading.
- Empty.
- Error.
- Success.
- Disabled.
- Selected.
- Offline, cuando aplique.

No diseñar únicamente el happy path.

---

# 12. Paso 10 — Responsive / contenido real

Validar:

- Textos largos.
- Nombres de productos extensos.
- Precios diferentes.
- Imágenes faltantes.
- Contenido vacío.
- Traducciones.
- Dynamic Type.
- Diferentes tamaños de dispositivo.

Una pantalla no debe depender de textos artificialmente cortos.

---

# 13. Paso 11 — Motion

Solo agregar motion después de resolver layout y UX.

Para cada animación definir:

- Trigger.
- Elemento.
- Acción.
- Duración.
- Easing.
- Propósito.

Evitar motion decorativo.

---

# 14. Paso 12 — Quality Gate

Antes de entregar:

### Layout
- [ ] No hay solapamientos.
- [ ] Auto Layout correctamente configurado.
- [ ] Spacing basado en tokens.
- [ ] Alineaciones consistentes.

### Componentes
- [ ] Se utilizaron componentes Prisma.
- [ ] Variantes correctas.
- [ ] Properties correctas.
- [ ] No hay duplicaciones innecesarias.

### Tokens
- [ ] Color.
- [ ] Typography.
- [ ] Spacing.
- [ ] Radius.
- [ ] Border.
- [ ] Elevation.
- [ ] Motion.

### UX
- [ ] Objetivo claro.
- [ ] Foco claro.
- [ ] Acción principal clara.
- [ ] Estados contemplados.

### Accesibilidad
- [ ] Contraste.
- [ ] Targets.
- [ ] Legibilidad.
- [ ] Estados.
- [ ] No dependencia exclusiva del color.

---

# 15. Auto-crítica obligatoria

El agente debe realizar una segunda lectura de la pantalla.

Preguntas:

1. ¿Qué elemento eliminaría si tuviera que simplificarla?
2. ¿Qué elemento tiene demasiado peso?
3. ¿Qué elemento debería tener mayor prioridad?
4. ¿Hay un componente Prisma que podría reemplazar una solución custom?
5. ¿Existe un token que no estoy usando?
6. ¿El usuario entiende qué hacer?
7. ¿La pantalla funcionaría con contenido real?
8. ¿La pantalla sigue siendo clara con Dynamic Type?
9. ¿Hay algo que parece diseñado solo porque "se veía bonito"?
10. ¿Se siente inequívocamente Prisma?

---

# 16. Entrega

El agente debe entregar:

### Pantalla
Diseño final.

### Rationale
Breve explicación de las decisiones principales.

### Component Map
Lista de componentes Prisma utilizados.

### Token Map
Lista de categorías de tokens utilizadas.

### States
Estados diseñados o pendientes.

### Quality Score
Score y problemas encontrados.

---

# 17. Regla de oro

> **No diseñes para llenar una pantalla. Diseña para ayudar al usuario a completar un objetivo.**

La pantalla correcta no es la que tiene más componentes.

Es la que comunica mejor con la menor complejidad necesaria.
