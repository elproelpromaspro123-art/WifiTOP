#!/usr/bin/env pwsh

# WifiTOP - Push to GitHub Script
# Este script limpia archivos innecesarios y hace push a GitHub

Set-Location $PSScriptRoot

Write-Host "🧹 Limpiando archivos innecesarios..." -ForegroundColor Yellow

$filesToRemove = @(
    "DEPLOYMENT.md",
    "FINAL_STEPS.md",
    "PROJECT_SUMMARY.md",
    "PUSH_TO_GITHUB.sh",
    "QUICKSTART.md",
    "README_PRODUCTION.md",
    "SETUP.md",
    "WINDOWS_SETUP.md",
    "DEPLOY.ps1",
    "PUSH.cmd",
    ".gitconfig"
)

foreach ($file in $filesToRemove) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✓ Eliminado: $file" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "🔧 Configurando Git..." -ForegroundColor Yellow

git config user.email "dev@wifitop.com"
git config user.name "WifiTOP Dev"

Write-Host ""
Write-Host "📝 Agregando archivos..." -ForegroundColor Yellow

git add .

Write-Host ""
Write-Host "💾 Removiendo archivos de documentacion de git..." -ForegroundColor Yellow

foreach ($file in $filesToRemove) {
    git rm --cached $file 2>$null
}

Write-Host ""
Write-Host "📦 Creando commit..." -ForegroundColor Yellow

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

Write-Host ""
Write-Host "🚀 Haciendo push a GitHub..." -ForegroundColor Yellow
Write-Host ""

git push origin main

Write-Host ""
Write-Host "✅ Completado!" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 Repositorio: https://github.com/elproelpromaspro123-art/WifiTOP" -ForegroundColor Cyan
Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor Cyan
Write-Host "1. Ir a https://vercel.com" -ForegroundColor White
Write-Host "2. Importar repositorio" -ForegroundColor White
Write-Host "3. Deploy!" -ForegroundColor White
Write-Host ""
