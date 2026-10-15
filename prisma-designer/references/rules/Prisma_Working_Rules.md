# Prisma Working Rules
## Reglas de trabajo del asistente al crear, revisar y reportar pantallas

Estas reglas nacen de una prueba de punta a punta (DS3 → pantallas, estados, tokens, accesibilidad) en app iOS. Complementan las UI Rules y **tienen prioridad cuando la herramienta (MCP) no es fiel al DS3**.

> Alcance verificado: **app iOS, una marca, un flujo**. Web móvil, web desktop y Android no se han probado. Aplicar estas reglas allí como punto de partida y declarar lo no verificado.

---

## 1. Honestidad del resultado

1. **No declarar "pantallas creadas" mientras queden placeholders** de librería, variantes distintas a las pedidas o textos sin aplicar. Primero se revisa (ver §6), después se reporta.
2. **No estimar puntajes sin medir.** Un score del Quality Gate solo se muestra si cada criterio tiene evidencia (captura, medición o dato del JSON). Si no, escribir "sin medir".
3. **No inventar datos.** Precios, nombres, cantidades y textos de ejemplo se marcan como `[ejemplo]` en el reporte. Distinguir siempre dato real de dato de relleno.
4. **Declarar lo no verificado.** Contraste de texto sobre imagen o gradiente, plataformas no probadas y componentes no medidos van como "revisión manual".
5. **Asumir que el generador puede fallar.** El MCP puede elegir variantes equivocadas, ignorar textos o aplicar el tamaño de frame equivocado. Verificar cada pantalla contra el DS3 antes de entregar.

## 2. Estructura plana

> Instancias de componentes directo en el frame de la pantalla. Un contenedor por **grupo**, no por componente. Sin tokens de spacing en contenedores estructurales.

- **Prueba:** profundidad de jerarquía ≤ 2 sobre el frame de la pantalla; ningún frame genérico con un único hijo.
- **Filas:** chips y carruseles en una fila horizontal; cards de grilla a ancho completo, sin padding ni gap extra.
- **Padding doble:** nunca anidar dos contenedores con padding. Si una sección ya tiene padding horizontal, sus componentes no se envuelven de nuevo.
- **Tamaño de frame:** el definido por el DS3 (`frame`). Si el generador usó otro, corregirlo.

### Tabla de márgenes propios (librería de **app**)

Medido el 15-10-2026 leyendo el código de diseño de las instancias reales (archivo Test-Metro, WR-7898) con `get_design_context`.

| Componente | Margen propio (medido) | Contenedor | Estado |
|---|---|---|---|
| `WlTopBarTitle` | Título con 16 px; botón atrás con 8 px. Incluye la barra de estado iPhone (54 px) | No: directo al frame, ancho completo | ✅ Verificado |
| `WlTitleSection` | 16 px horizontal | No | ✅ Verificado |
| `WlStickyButton` | 16 px horizontal y 12 px vertical; incluye indicador de inicio (24 px) | No | ✅ Verificado |
| `WlTotalizer` | 16 px horizontal; esquinas superiores redondeadas e indicador de inicio | No | ✅ Verificado |
| `WlEmptyStates` | 32 px horizontal, 56 px arriba | No | ✅ Verificado |
| `WlProductCardCart` | 16 px en la fila (375 px de ancho); trae además la acción de deslizar (136 px, fuera de los 375) | No: ancho completo, **fuera** de wrappers con padding | ✅ Verificado |
| `WlHeader`, `WlTopBar` | — (usados a 375 px, x=0, en el diseño final) | No | 🟡 Uso verificado; margen interno sin medir |
| `WlLocation` | **Ninguno** | Sí, contenedor con padding 16 px | ✅ Verificado |
| `WlAlert` | Solo padding interno (12 × 8 px); sin margen exterior | Sí, contenedor con padding 16 px | ✅ Verificado |
| `WlBannerPrincipal` | **Ninguno** (imagen con radio 16 px) | Sí, contenedor con padding 16 px | ✅ Verificado |
| `WlButtonQuantitySelector` | **Ninguno** (ancho fijo 343 px) | Sí, contenedor con padding 16 px | ✅ Verificado |
| `WlChip` | — (en fila horizontal, x=16 con gap 8 px) | Fila con padding 16 px | 🟡 Uso verificado |
| `WlProductCardTFM` | — (cards a 187,5 px, grilla a ancho completo) | Sin padding ni gap | 🟡 Uso verificado |

> Notas: (1) Los componentes de barra superior, sticky y totalizador **ya traen** la barra de estado o el indicador de inicio del iPhone; no agregarlos de nuevo. (2) ⚠️ Esta tabla es de la librería de **app**. En **Web Components** hay componentes con los mismos nombres (`WlHeader`, `WlTag`, `WlToggle`…); medir cada uno antes de aplicar la tabla en web.

## 3. Dónde van los tokens

- **Sí:** color de relleno y de texto, estilos de texto y radio de **nodos propios** (los que crea el diseñador).
- **No:** spacing/gap/padding en contenedores estructurales de auto-layout; ahí van valores del layout, no tokens de spacing.
- **No tokenizar** lo que ya viene dentro de una instancia de librería.
- Antes de enlazar un token, comprobar que la clave existe en el **modo de marca activo** y que el color resultante pasa contraste.
- Si falta un token: registrar un *Token Gap* en el reporte, sin inventar un valor.

## 4. Estados: recetas

Crear los estados que pida el DS3, nombrados `P0X-B`, `P0X-C`… y ubicados en una **fila aparte** bajo la pantalla base.

| Estado | Receta |
|---|---|
| Loading | Variante **Skeleton** de cada componente (cards, banner, línea de carrito, totalizador) |
| Vacío | `WlEmptyStates` en tamaño página, con título, bajada y botón editables |
| Error de carga | Alerta de error y/o estado vacío tipo mensaje, con botón de reintento |
| Sin stock | Etiqueta de advertencia, botón alternativo y alerta de advertencia en la ficha |
| Hoja inferior | Fondo oscuro con token de overlay, hoja con radio del sistema y *grabber* |
| Web (hover/foco) | Hover y foco visible por teclado en controles; no hay generación automática |

Si el generador no crea estados, **clonar la pantalla base y editar**, y decirlo en el reporte.

## 5. Accesibilidad manual (hasta que exista auditoría automática)

Después de poblar cada pantalla, medir y reportar:

1. **Contraste texto/fondo** en el modo de marca activo: ≥ 4,5:1 (3:1 en texto grande) sobre fondo sólido. Usar valores calculados, no a ojo.
2. **Tamaños táctiles:** iOS 44 pt · Android 48 dp · Web 24 px mínimo WCAG (44 px recomendado).
3. **Estados distinguibles** sin depender solo del color.
4. **Separar el origen del hallazgo:** *falla de la pantalla* (la corrige el diseñador) vs *hallazgo de la librería* (se reporta al equipo Prisma, p. ej. chips o botones bajo 44 px).
5. **Texto sobre imagen o gradiente:** no se puede medir de forma fiable → "revisión manual".

Casos conocidos en TFM: `WlTag` Color=Pink Solid dio 1,32:1 (usar Green Solid, 7,01:1); el texto "Unit/Information" de `WlProductCardTFM` mide 2,63:1 (usar `neutral-label`, 5,3:1).

## 6. Revisión obligatoria antes de entregar

Por cada pantalla, con captura de pantalla de Figma:

- [ ] Frame con el tamaño del DS3.
- [ ] Cada componente es el del DS3 y su **variante** coincide (no Skeleton/Error por defecto, chip activo en `State=Active`).
- [ ] 100 % de los textos aplicados; sin `Label`, `Swap`, `Title` de librería ni "MISSING".
- [ ] Jerarquía ≤ 2, sin contenedores de un hijo, sin padding doble.
- [ ] Tokens en nodos propios; ninguno en layout estructural.
- [ ] Contraste y tamaños táctiles medidos (§5).
- [ ] Estados pedidos creados (§4).
- [ ] Datos de ejemplo marcados.

No cerrar la tarea con una casilla sin resolver; reportarla como pendiente.

## 7. Limitaciones conocidas de componentes (app)

No son errores del diseñador; documentarlas como *gap* y no forzar una composición.

| Componente | Limitación | Qué hacer |
|---|---|---|
| `WlTopBar` | Sin variante con título; el slot es una instancia (no admite `appendChild`) | Usar `WlTopBarTitle` si existe; si no, restilizar el texto del slot |
| `WlProductCombo` | No admite un tercer ítem | Gap: no forzar; registrar propuesta |
| `WlBottomSheet` | Alto fijo y `_Slot_box` de 343×84 que no se puebla sin detach | Hoja propia; registrar gap (variante Hug / slot swap) |
| `WlProductCardTFM` | `Show Ribbon De Decuento` no oculta ribbon ni precio tachado | Ocultar la capa y declararlo |
| `WlEmptyStates` | CTA sin prop de texto | Editar la capa del label |
| `WlBannerPrincipal` | No incluye la tarjeta blanca con copy | Crear `banner_card` y documentar el gap |
| Cards (`Title`, `Tag`) | Capas de texto con nombre repetido | Asignar textos por propiedad; si es por índice, avisar que es frágil |

## 8. Ejecución en Figma

- **Scripts cortos e idempotentes:** una pantalla por script, reutilizando por nombre. Un error en `use_figma` revierte todo el script.
- **Una operación pesada por llamada** (`swapComponent` sobre frames grandes, importar sets pesados como `WlProductCombo`).
- **Brand mode:** usar la API **asíncrona** de variables; verificar que el modo quedó aplicado.
- **Tokens:** para obtener tokens, buscar por key y con filtro; evitar consultas sin filtro (hasta 80 KB).
- Registrar durante la sesión los fallos del MCP; no esperar al final.

## 9. Plataformas

| Tema | App (iOS / Android) | Web móvil | Web desktop |
|---|---|---|---|
| Librería | App-Prisma-Components | Web Components | Web Components |
| Frame | 375×812 iOS | **390×844** en el archivo "Sesiones WL" (ancho fluido, alto variable) | ≥ 1.440 px con breakpoints |
| Táctil | 44 pt iOS · 48 dp Android | 24 px mín. (44 px ideal) | 24 px mín. |
| Estados extra | — | — | hover, foco visible |
| Accesibilidad extra | Escalado de texto | Zoom/reflujo 200 %, orden de foco | Navegación solo con teclado |

Observado en el archivo "Sesiones WL" (web móvil, 390×844): las pantallas son instancias de una pieza compuesta (`Login`) que usa componentes web como `TextField`, `InputPassword`, `Button` e `Icon Button`, **sin prefijo `Wl`**, llenando el ancho de un contenedor con padding (32 px lateral). Es decir, en web los componentes base **no traen margen exterior**; el padding lo pone el contenedor. Esto es una sola muestra y no sustituye la medición componente por componente.

Los nombres de componente se repiten entre librerías (`WlTag`, `WlHeader`, `WlToggle`). **Confirmar la librería de origen** antes de usar uno.
