#!/bin/bash
# DreamCodeApp: Push to GitHub + Deploy to Vercel
set -e

cd "$(dirname "$0")"

echo "=== Git Push ==="
git push origin master

echo ""
echo "=== Vercel Deploy ==="
curl -s -X POST "https://api.vercel.com/v1/integrations/deploy/prj_cjcr9U5fF0VxkiC3jtCb1eWkK2Yk/OK7c6Hi9je" | python3 -c "import sys,json; d=json.load(sys.stdin); print('Job ID:', d.get('job',{}).get('id','?')); print('Status:', d.get('job',{}).get('state','?'))" 2>/dev/null || echo "Deploy getriggert"

echo ""
echo "=== Fertig ==="
echo "Live: https://dreamcodeapp.vercel.app"
