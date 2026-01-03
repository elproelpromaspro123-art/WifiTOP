@echo off
REM Script para hacer push a GitHub limpiamente

cd /d "%~dp0"

REM Eliminar archivos innecesarios
echo Eliminando archivos de documentacion...
del /q DEPLOYMENT.md 2>nul
del /q FINAL_STEPS.md 2>nul
del /q PROJECT_SUMMARY.md 2>nul
del /q PUSH_TO_GITHUB.sh 2>nul
del /q QUICKSTART.md 2>nul
del /q README_PRODUCTION.md 2>nul
del /q SETUP.md 2>nul
del /q WINDOWS_SETUP.md 2>nul
del /q DEPLOY.ps1 2>nul
del /q PUSH.cmd 2>nul
del /q .gitconfig 2>nul

REM Git commands
echo.
echo Configurando Git...
git config user.email "dev@wifitop.com"
git config user.name "WifiTOP Dev"

echo Agregando cambios...
git add .

echo Removiendo archivos de documentacion...
git rm --cached DEPLOYMENT.md 2>nul
git rm --cached FINAL_STEPS.md 2>nul
git rm --cached PROJECT_SUMMARY.md 2>nul
git rm --cached PUSH_TO_GITHUB.sh 2>nul
git rm --cached QUICKSTART.md 2>nul
git rm --cached README_PRODUCTION.md 2>nul
git rm --cached SETUP.md 2>nul
git rm --cached WINDOWS_SETUP.md 2>nul
git rm --cached DEPLOY.ps1 2>nul
git rm --cached PUSH.cmd 2>nul
git rm --cached .gitconfig 2>nul

echo Creando commit...
git commit -m "feat: WifiTOP v1.0 - Speedtest Premium con UI impactante

- Rating visual 1-10 con emojis animados
- Casos de uso dinamicos por velocidad
- Ranking global con top 1000
- Animaciones suaves con Framer Motion
- Dark-white theme con bordes luminosos
- 100%% responsive design
- PostgreSQL integrado
- SEO optimizado
- TypeScript completo
- Ready para Vercel" 2>nul

echo.
echo Haciendo push a GitHub...
git push origin main 2>nul

if %errorlevel% equ 0 (
    echo.
    echo ✅ Push completado exitosamente!
    echo URL: https://github.com/elproelpromaspro123-art/WifiTOP
    echo.
) else (
    echo.
    echo ⚠️ Hubo un error en el push
    echo Verifica tu conexion a internet
    echo.
)

pause
