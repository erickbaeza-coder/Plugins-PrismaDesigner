#!/usr/bin/env bash
# ─────────────────────────────────────────────
# build.sh — Empaqueta prisma-designer como .plugin
# Uso: ./build.sh [version]
# Ejemplo: ./build.sh 2.1.0
# ─────────────────────────────────────────────
set -e

VERSION=${1:-$(python3 -c "import json; print(json.load(open('version.json'))['version'])")}
PLUGIN_NAME="prisma-designer"
OUTPUT_DIR="releases"
OUTPUT_FILE="${OUTPUT_DIR}/${PLUGIN_NAME}-v${VERSION}.plugin"

echo "📦 Empaquetando ${PLUGIN_NAME} v${VERSION}..."

# Verificar que existe la carpeta fuente
if [ ! -d "./${PLUGIN_NAME}" ]; then
  echo "❌ Error: No se encontró la carpeta ./${PLUGIN_NAME}/"
  echo "   Asegúrate de ejecutar este script desde la raíz del repo."
  exit 1
fi

# Actualizar versión en plugin.json
python3 -c "
import json

with open('${PLUGIN_NAME}/.claude-plugin/plugin.json', 'r') as f:
    data = json.load(f)

data['version'] = '${VERSION}'

with open('${PLUGIN_NAME}/.claude-plugin/plugin.json', 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
print('✅ plugin.json actualizado a v${VERSION}')
"

mkdir -p "$OUTPUT_DIR"

# Empaquetar como .plugin (zip con nombre de carpeta)
zip -r "${OUTPUT_FILE}" "${PLUGIN_NAME}/" \
  --exclude "*.DS_Store" \
  --exclude "*__pycache__*" \
  --exclude "*.pyc"

echo "✅ Plugin generado: ${OUTPUT_FILE}"
echo ""
echo "Próximos pasos:"
echo "  git add -A"
echo "  git commit -m \"release: v${VERSION}\""
echo "  git tag v${VERSION}"
echo "  git push && git push --tags"
echo "  → Crear Release en GitHub y adjuntar ${OUTPUT_FILE}"
