# Guía de conexión: Prisma MCP + Figma MCP

Para usar el plugin **Prisma Designer** necesitas conectar dos MCPs en Claude Desktop. Sin ellos, los comandos del plugin no funcionan.

---

## Requisitos previos

- Claude Desktop instalado
- Plugin `prisma-designer` instalado (descárgalo desde el canal de Teams 🎨 Plugin - Prisma Designer)
- Token de Figma (ver cómo obtenerlo abajo)

---

## 1. Obtener tu token de Figma

1. Ve a [figma.com](https://figma.com) → tu avatar (esquina superior derecha) → **Settings**
2. Sección **Personal access tokens** → **Generate new token**
3. Ponle nombre (ej. `claude-prisma`) → clic en **Generate**
4. **Copia el token** — solo se muestra una vez

---

## 2. Conectar el MCP de Figma

1. En Claude Desktop → **Configuración** → **Conectores** (o **MCP**)
2. Busca **Figma** en la lista de conectores disponibles
3. Haz clic en **Conectar**
4. Cuando te pida el token, pega el que copiaste en el paso anterior
5. Verifica que aparezca como ✅ Conectado

---

## 3. Conectar Prisma MCP

El `prisma-mcp` se instala automáticamente junto con el plugin. Pero necesita apuntar al archivo correcto en tu máquina.

### Verificar que está activo

1. En Claude Desktop → **Configuración** → **Plugins**
2. Busca `prisma-designer` → debe aparecer como activo
3. En la misma pantalla, revisa si `prisma-mcp` aparece en la sección de MCPs

### Si no aparece o da error

El MCP necesita apuntar al archivo `index.js` del servidor local. Verifica que existe en tu máquina:

```
/Users/TU_USUARIO/Desktop/Cencosud 2026/Discovery Agentico/Prisma MCP/src/index.js
```

Si el archivo está en otra ruta, contacta a quien mantenga el plugin para actualizar el `.mcp.json`.

### Agregar el FIGMA_TOKEN al MCP

El prisma-mcp necesita el token de Figma como variable de entorno. En Claude Desktop:

1. **Configuración** → **Plugins** → `prisma-designer` → **Editar configuración**
2. En el campo `FIGMA_TOKEN`, pega tu token de Figma
3. Guarda los cambios y reinicia Claude Desktop

---

## 4. Verificar que todo está conectado

Abre una conversación en Claude y escribe:

```
/sync-prisma
```

Si responde con la lista de componentes Prisma disponibles → todo está conectado correctamente ✅

Si da error → revisa que el `FIGMA_TOKEN` esté configurado y que el archivo `index.js` del MCP exista en tu máquina.

---

## Resumen de comandos disponibles

| Comando | Qué hace |
|---|---|
| `/sync-prisma` | Sincroniza el catálogo de componentes desde Figma |
| `/resolver-componente` | Encuentra el componente Prisma para una descripción |
| `/validar-ds3` | Valida un DS3 JSON antes de crear pantallas |
| `/crear-pantallas` | Crea las pantallas en Figma desde un DS3 JSON |

---

## ¿Problemas?

Escribe en el canal 🎨 Plugin - Prisma Designer en Teams o contacta a Erick Baeza.
