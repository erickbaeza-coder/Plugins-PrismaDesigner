#!/usr/bin/env bash
# ─────────────────────────────────────────────
# setup.sh — Configuración inicial de Prisma Designer Plugin
# Uso: ./setup.sh
# ─────────────────────────────────────────────
set -e

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║   Prisma Designer Plugin · Setup v3.0       ║"
echo "║   Whitelabel UX Team · Cencosud             ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# ─── Paso 1: Verificar FIGMA_TOKEN ───
echo "🔑 Paso 1/4 — Configurar FIGMA_TOKEN"
echo ""

if [ -n "$FIGMA_TOKEN" ]; then
  echo "✅ FIGMA_TOKEN ya está configurado (${FIGMA_TOKEN:0:10}...)"
  read -p "¿Querés reemplazarlo? (s/N): " REPLACE
  if [ "$REPLACE" != "s" ] && [ "$REPLACE" != "S" ]; then
    echo "   Manteniendo token actual."
  else
    read -p "Pegá tu nuevo Figma token (figd_...): " NEW_TOKEN
    # Eliminar token anterior del .zshrc
    sed -i '' '/export FIGMA_TOKEN/d' ~/.zshrc 2>/dev/null || true
    echo "export FIGMA_TOKEN=\"$NEW_TOKEN\"" >> ~/.zshrc
    export FIGMA_TOKEN="$NEW_TOKEN"
    echo "✅ Token actualizado."
  fi
else
  echo "No se encontró FIGMA_TOKEN."
  echo ""
  echo "Para obtener uno:"
  echo "  1. Figma → Settings → Security → Personal access tokens"
  echo "  2. Generate new token → Nombre: 'Prisma MCP Cencosud'"
  echo "  3. Copiar el token (empieza con figd_)"
  echo ""
  read -p "Pegá tu Figma token (figd_...): " NEW_TOKEN

  if [ -z "$NEW_TOKEN" ]; then
    echo "❌ No se proporcionó token. Podés configurarlo después:"
    echo "   echo 'export FIGMA_TOKEN=\"figd_TU_TOKEN\"' >> ~/.zshrc"
  else
    echo "export FIGMA_TOKEN=\"$NEW_TOKEN\"" >> ~/.zshrc
    export FIGMA_TOKEN="$NEW_TOKEN"
    echo "✅ Token configurado en ~/.zshrc"
  fi
fi

echo ""

# ─── Paso 2: Instalar dependencias del MCP ───
echo "📦 Paso 2/4 — Instalar dependencias del MCP"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MCP_DIR="$SCRIPT_DIR/prisma-mcp"

if [ -d "$MCP_DIR" ]; then
  cd "$MCP_DIR"
  npm install --silent 2>/dev/null
  echo "✅ Dependencias instaladas"
else
  echo "⚠️  No se encontró prisma-mcp/ en el repo. Verificá la estructura."
fi

echo ""

# ─── Paso 3: Verificar que el MCP arranca ───
echo "🔌 Paso 3/4 — Verificar MCP server"

if [ -f "$MCP_DIR/src/index.js" ]; then
  OUTPUT=$(cd "$MCP_DIR" && timeout 3 node src/index.js 2>&1 || true)
  if echo "$OUTPUT" | grep -q "iniciado"; then
    echo "✅ Prisma MCP server funciona correctamente"
  else
    echo "⚠️  El MCP no arrancó como se esperaba:"
    echo "   $OUTPUT"
  fi
else
  echo "⚠️  No se encontró src/index.js"
fi

echo ""

# ─── Paso 4: Instrucciones finales ───
echo "📋 Paso 4/4 — Instalar el plugin en Cowork"
echo ""

PLUGIN_FILE=$(ls -t "$SCRIPT_DIR/releases/"*.plugin 2>/dev/null | head -1)

if [ -n "$PLUGIN_FILE" ]; then
  echo "Archivo del plugin: $PLUGIN_FILE"
  echo ""
  echo "Para instalar:"
  echo "  1. Abrí Cowork (cerralo primero si ya estaba abierto)"
  echo "  2. Settings → Plugins → Instalar plugin"
  echo "  3. Seleccioná: $(basename "$PLUGIN_FILE")"
  echo "  4. En tu primera conversación, ejecutá: /sync-prisma"
else
  echo "No se encontró archivo .plugin en releases/"
  echo "Generalo con: ./build.sh 3.0.0"
fi

echo ""
echo "═══════════════════════════════════════════════"
echo "  Setup completo. ¡Listo para diseñar!"
echo "═══════════════════════════════════════════════"
echo ""
