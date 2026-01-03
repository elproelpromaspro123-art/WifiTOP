#!/bin/bash

cd "$(dirname "$0")/../.."

echo "🧹 Limpiando archivos innecesarios..."

rm -f DEPLOYMENT.md
rm -f FINAL_STEPS.md
rm -f PROJECT_SUMMARY.md
rm -f PUSH_TO_GITHUB.sh
rm -f QUICKSTART.md
rm -f README_PRODUCTION.md
rm -f SETUP.md
rm -f WINDOWS_SETUP.md
rm -f DEPLOY.ps1
rm -f PUSH.cmd
rm -f .gitconfig

echo ""
echo "🔧 Configurando Git..."

git config user.email "dev@wifitop.com"
git config user.name "WifiTOP Dev"

echo ""
echo "📝 Agregando archivos..."

git add .

echo ""
echo "💾 Removiendo archivos de documentacion..."

git rm --cached DEPLOYMENT.md 2>/dev/null || true
git rm --cached FINAL_STEPS.md 2>/dev/null || true
git rm --cached PROJECT_SUMMARY.md 2>/dev/null || true
git rm --cached PUSH_TO_GITHUB.sh 2>/dev/null || true
git rm --cached QUICKSTART.md 2>/dev/null || true
git rm --cached README_PRODUCTION.md 2>/dev/null || true
git rm --cached SETUP.md 2>/dev/null || true
git rm --cached WINDOWS_SETUP.md 2>/dev/null || true
git rm --cached DEPLOY.ps1 2>/dev/null || true
git rm --cached PUSH.cmd 2>/dev/null || true
git rm --cached .gitconfig 2>/dev/null || true

echo ""
echo "📦 Creando commit..."

git commit -m "feat: WifiTOP v1.0 - Speedtest Premium UI

- Rating visual 1-10 con emojis animados
- Casos de uso dinamicos
- Ranking global top 1000
- Animaciones suaves
- Dark-white theme
- 100% responsive
- PostgreSQL integrado
- SEO optimizado
- TypeScript
- Ready para Vercel"

echo ""
echo "🚀 Haciendo push a GitHub..."

git push origin main

echo ""
echo "✅ Completado!"
echo ""
echo "🔗 Repositorio: https://github.com/elproelpromaspro123-art/WifiTOP"
