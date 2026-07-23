# Prisma Designer Plugin · Cencosud

Plugin para diseñadores UX del equipo Whitelabel de Cencosud. Convierte el output del Discovery Agéntico (DS3 JSON o prompts) en pantallas listas para Figma usando el sistema de diseño Prisma-Components.

## Skills disponibles

| Skill | Trigger | Qué hace |
|---|---|---|
| `/crear-pantallas` | "crear pantallas desde ds3" | Flujo completo: valida → resuelve → entrega JSON para Prisma Builder + prompts para Figma Make |
| `/sync-prisma` | "sincronizar librería" | Sincroniza el catálogo de componentes desde Figma |
| `/validar-ds3` | "validar el json" | Valida un DS3 JSON antes de crear pantallas |
| `/resolver-componente` | "qué componente uso para..." | Encuentra el componente Prisma correcto en lenguaje natural |

## Requisitos

### 1. Instalar dependencias del MCP

```bash
cd "/Users/ebaezaroa/Desktop/Cencosud 2026/Discovery Agentico/Prisma MCP"
npm install
```

### 2. Configurar FIGMA_TOKEN (obligatorio para /sync-prisma)

El MCP necesita un Personal Access Token de Figma para leer Prisma-Components.

**Paso 1 — Obtener el token:**
1. Ir a Figma → clic en tu avatar → **Settings**
2. Ir a la sección **Security**
3. En **Personal access tokens** → **Generate new token**
4. Darle un nombre (ej. "Prisma MCP Cencosud") y copiar el token (empieza con `figd_`)

**Paso 2 — Configurar en el sistema:**

```bash
# Agregar en ~/.zshrc o ~/.bash_profile
export FIGMA_TOKEN="figd_TU_TOKEN_AQUI"

# Aplicar sin reiniciar terminal
source ~/.zshrc
```

> ⚠️ **Importante:** La variable debe estar configurada en el sistema **antes de abrir Cowork**. No se puede configurar desde la UI del plugin — debe estar en las variables de entorno del SO.

### 3. Archivo Prisma-Components de Cencosud

URL oficial del archivo:
```
https://www.figma.com/design/LnYUTRFuwWpI9phwDCSHOx/Prisma-Components
```

Correr `/sync-prisma` una vez antes de empezar a usar el plugin para actualizar el catálogo local.

## Flujo de uso

```
1. Ejecutar Discovery Agéntico → DS3 genera packets.ds3
2. /sync-prisma               → actualizar catálogo (primera vez o tras agregar componentes)
3. /crear-pantallas           → pegar JSON → entrega enriched_prisma.json
4. Prisma Builder en Figma    → pegar JSON → Build Screens
5. Figma Make (opcional)      → prompts para componentes nuevos
```

## Componentes nuevos (Playground)

Los siguientes componentes fueron creados para WL Groceries Brasil y están en el Playground de Prisma-Components:

| Componente | Uso |
|---|---|
| `Social Login > Social_Login · Type=Apple · State=Default` | Auth con Apple ID |
| `Social Login > Social_Login · Type=Google · State=Default` | Auth con Google |
| `Inputs > OTP_Input · Digits=6 · State=Default` | Verificación SMS |

Correr `/sync-prisma` para que el catálogo los reconozca.

## Versión

v1.1 · Julio 2026 · Whitelabel UX Team · Cencosud
