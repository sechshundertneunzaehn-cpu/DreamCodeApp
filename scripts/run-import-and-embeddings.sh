#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
set -a && source .env && set +a

export SUPABASE_URL="$VITE_SUPABASE_URL"
export SUPABASE_SERVICE_KEY="$SUPABASE_SERVICE_ROLE_KEY"
export DENO_INSTALL="$HOME/.deno"
export PATH="$DENO_INSTALL/bin:$PATH"

echo "=== 1/2: SDDb Import ==="
deno run --allow-all scripts/import-sddb.ts

echo ""
echo "=== 2/2: Embeddings (Hintergrund) ==="
nohup deno run --allow-all scripts/generate-embeddings.ts > embeddings.log 2>&1 &
echo "Embeddings laufen im Hintergrund. PID: $!"
echo "Log: $(pwd)/embeddings.log"
echo "Fortschritt: tail -f embeddings.log"
