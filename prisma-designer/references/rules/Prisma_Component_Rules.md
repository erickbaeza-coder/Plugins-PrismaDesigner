# Prisma Component Rules
## Reglas para selección, composición y creación de componentes

## 1. Principio

Los componentes son unidades de comportamiento y no solamente piezas visuales.

Antes de crear un componente nuevo, el agente debe buscar una solución existente en Prisma.

## 2. Orden de decisión

1. Componente existente.
2. Variante existente.
3. Property existente.
4. Slot existente.
5. Composición de componentes existentes.
6. Nuevo componente, solo si existe un gap real.

## 3. Properties

Las properties deben representar diferencias reales de comportamiento, contenido o configuración.

Evitar properties que solamente resuelvan una diferencia visual puntual.

## 4. Variants

Una variante debe existir cuando cambia una dimensión significativa del componente.

Evitar combinaciones redundantes.

## 5. Instancias

Las pantallas deben utilizar instancias de componentes cuando exista el componente correspondiente.

No convertir instancias en diseños independientes sin justificación.

## 6. Component Gap

Si no existe solución adecuada, documentar:

- necesidad,
- contexto,
- alternativas evaluadas,
- motivo del gap,
- propuesta,
- tokens requeridos,
- impacto en Flutter/iOS.

## 7. Quality Gate

Validar que cada componente:

- use tokens,
- tenga naming consistente,
- tenga estados relevantes,
- tenga properties justificadas,
- sea implementable,
- no duplique funcionalidad existente.
