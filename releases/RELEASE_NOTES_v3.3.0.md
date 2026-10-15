# Prisma Designer v3.3.0 — Catálogo real (Fase 1a)

El sync dejaba el catálogo con nombres de grupo (`Product Card`, `Alerts`…) en vez de los componentes reales. Causa: leía `/components` y agrupaba por frame; el vínculo con el set (`component_set_id`) viene vacío en esa respuesta.

## Cambios
- Sync desde `/component_sets` (fuente de verdad) y unión de variantes por `containingStateGroup`: App 1.488/1.504 y Web 913/928 variantes enlazadas; el resto son componentes sueltos y se indexan igual.
- Catálogo regenerado: 304 componentes (App 220, Web 84) con todas sus variantes y etiqueta de librería.
- Nombres `Wl*` resuelven directo (`WlProductCardTFM`, `WlTotalizer`, `WlEmptyStates`, `WlTopBarTitle`…) y los estados con `WlChip · State=Active`.
- Variante por defecto correcta (no Skeleton/Error si existe Default). Variante pedida inexistente: usa la default y avisa.
- Un nombre `Wl*` inexistente falla en validación; no se sustituye por uno parecido.
- `/sync-prisma` sin parámetros sincroniza App y Web; una librería no borra la otra.
- Nuevo `prisma-mcp/scripts/sync-keys.mjs` y pruebas `prisma-mcp/test/sync.test.mjs`.

## Sigue pendiente (Fase 1b)
`validate_ds3_json` que lea `secciones`, textos por capa, frame según `frame`/plataforma, estados, un script por pantalla.
