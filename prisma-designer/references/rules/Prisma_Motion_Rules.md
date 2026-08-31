# Prisma Motion Rules
## Reglas de movimiento y microinteracciones

## 1. Principio

Motion debe comunicar, no decorar.

Cada animación debe tener una razón funcional.

## 2. Usos prioritarios

1. Feedback de acción.
2. Transición de estado.
3. Entrada/salida de contenido.
4. Orientación espacial.
5. Continuidad entre contextos.

## 3. Evitar

- Animaciones permanentes.
- Loops sin propósito.
- Parallax innecesario.
- Bounce excesivo.
- Múltiples elementos animándose simultáneamente.
- Animaciones que retrasen una acción.

## 4. Componentes candidatos

Priorizar motion en:

- Navigation.
- Bottom sheets.
- Overlays.
- Toasts/snackbars.
- Loading.
- Skeleton.
- Buttons.
- Toggles.
- Selection controls.
- Carousels.
- Expand/collapse.
- Page transitions.

## 5. Performance

Preferir transform y opacity cuando sea posible.

Evitar animar propiedades costosas innecesariamente.

## 6. Accesibilidad

Respetar preferencias de reducción de movimiento cuando la plataforma lo permita.

## 7. Checklist

- [ ] Trigger claro.
- [ ] Propósito claro.
- [ ] Duración apropiada.
- [ ] No bloquea interacción.
- [ ] No distrae.
- [ ] No afecta performance.
- [ ] Tiene alternativa comprensible sin motion.
