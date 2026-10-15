# Prisma Designer v3.2.2 — Fase 0: reglas y skills (sin cambios en el MCP)

Basado en `prisma-designer_fallas_y_mejoras_generales.pdf` y `mcp_prisma_issues_WR-7898.md`.
Solo cambian skills y reglas; el servidor MCP no se modifica. Los límites del MCP quedan **documentados** en las skills hasta la Fase 1.

## Nuevo
- `references/rules/Prisma_Working_Rules.md`: honestidad del resultado, estructura plana, tabla de márgenes (app), dónde van los tokens, recetas de estados, accesibilidad medida, revisión obligatoria, limitaciones conocidas de componentes, ejecución en Figma y plataformas.

## Cambios por skill
- **crear-pantallas**: el script pasa a ser "primer borrador"; limitaciones conocidas del generador; **Paso 5b de revisión obligatoria** con captura; no declarar "creadas" con placeholders; quita el Quality Score estimado; reporte con datos de ejemplo y accesibilidad medida; aviso de que `validate_ds3_json` no lee `secciones`.
- **validar-ds3**: límites del validador (secciones, catálogo vs `Wl*`, variantes, `textOverrides`); revisa `estados` y `frame`; quita el score estimado.
- **quality-gate**: medir con evidencia; "sin medir" no puntúa; separa falla de pantalla vs hallazgo de librería; layout estructural no exige tokens; estructura plana y estados explícitos; accesibilidad con valores.
- **resolver-componente**: 3 candidatos con razón; contraste con nombre `Wl*`; ficha con variantes, margen, ancho y limitaciones; gaps declarados, sin composiciones forzadas.
- **sync-prisma**: reporte de alcance real ("con key" ≠ usado por el generador), una librería por llamada, guía de token vía `~/.prisma-mcp-token`.

## No incluido (siguientes fases)
Catálogo con nombres reales, variantes y plataformas; textos por capa; frame por plataforma; estados; `audit_screens`; scripts por pantalla. Ver `plan-mejora-prisma-designer.md`.
