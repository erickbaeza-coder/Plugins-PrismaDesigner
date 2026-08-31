# Flujo completo DS3 → Figma

## Diagrama (flujo directo — desde v2.0)

```
DS3 JSON
    ↓
validate_ds3_json      → reporta errores/warnings
    ↓
create_screens_from_ds3 → genera script JavaScript
    ↓
use_figma (Claude ejecuta el script)
    ↓
Figma canvas — frames creados directamente
  • Componentes Prisma reales (importComponentByKeyAsync)
  • Auto-layout + spacing tokens
  • Textos aplicados (setText)
  • Brand mode de la marca aplicado automáticamente
  • Composiciones → // TODO para armar manualmente
```

## ¿Qué son las composiciones?

Componentes que no existen en Prisma-Components (EventCard, MetadataRows, etc.).
El script las marca como `// TODO [composición]` en el frame.
El designer las arma manualmente en Figma apilando los sub-componentes descritos.

## Schema DS3 JSON v1.6+ (campos que usa el MCP)

```json
{
  "version": "1.6",
  "proyecto": "Nombre del proyecto",
  "marca": "The Fresh Market",
  "plataforma": "iOS",
  "flujo": "Nombre del flujo",
  "direccion": "B",
  "pantallas": [
    {
      "id": "P01",
      "nombre": "Nombre pantalla",
      "componentes": [
        {
          "orden": 1,
          "componente": "Nav Bar > Header · Color=White · Type=Home · State=Default",
          "rol": "navegacion-superior",
          "contenido": ""
        },
        {
          "orden": 2,
          "tipo": "composicion",
          "nombre_intencional": "EventCard",
          "rol": "card-evento-featured",
          "contenido": "Título del evento",
          "composicion": [
            {
              "componente": "Banners Cards > Banner_principal · Size=Md · Skeleton=False",
              "rol": "imagen-evento"
            },
            {
              "componente": "Tags > Tag · Color=Green · Size=Sm",
              "rol": "badge-tipo",
              "contenido": "Solo para miembros"
            }
          ]
        }
      ]
    }
  ]
}
```

## Grupos válidos en Prisma-Components (catálogo actual)

| Grupo | Ejemplo |
|---|---|
| Nav Bar | `Nav Bar > Header · Color=White · Type=Home · State=Default` |
| Top bar | `Top bar > TopBar_title · Type=Default` |
| Top bar | `Top bar > TopBar · State=Default · Type=Icon action_no title` |
| Buttons | `Buttons > Button-Primary · Size=Lg · State=Default` |
| Banners Cards | `Banners Cards > Banner_principal · Size=Lg · Skeleton=False` |
| Banners Cards | `Banners Cards > Banner_principal · Size=Md · Skeleton=True` |
| Title_section | `Title_section > Title_section · Skeleton=No · CTA=Yes` |
| Tags | `Tags > Tag · Color=Green` |
| Empty States | `Empty States > Empty state · Type=Empty` |
| Sticky Button | `Sticky Button > Sticky-button · Type=Horizontal` |
| Information Card | `Information Card > InformationCard · State=Brand · Skeleton=False` |
| Location | `Location > location · Type=Brand` |

Para la lista completa, ejecutar `/sync-prisma` o consultar el catálogo en `prisma-catalog.js`.
