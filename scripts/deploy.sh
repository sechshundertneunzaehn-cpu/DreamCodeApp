#!/bin/bash
# Quick deploy: git push + vercel production
set -e
cd "$(dirname "$0")/.."
git push 2>&1
vercel --prod --yes 2>&1 | tail -3
echo "Deployed!"
