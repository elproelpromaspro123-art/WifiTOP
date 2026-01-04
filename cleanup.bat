@echo off
REM Script para eliminar archivos innecesarios
REM Ejecutar desde raíz del proyecto

cd /d "%~dp0"

echo.
echo 🧹 Eliminando documentación...
del /Q OPTIMIZATION.md 2>nul && echo ✓ OPTIMIZATION.md
del /Q RESUMEN_CAMBIOS.md 2>nul && echo ✓ RESUMEN_CAMBIOS.md
del /Q ARCHITECTURE.md 2>nul && echo ✓ ARCHITECTURE.md
del /Q CLEANUP_INSTRUCTIONS.md 2>nul && echo ✓ CLEANUP_INSTRUCTIONS.md
del /Q QUICK_START.md 2>nul && echo ✓ QUICK_START.md
del /Q DEPLOY.md 2>nul && echo ✓ DEPLOY.md
del /Q cleanup.py 2>nul && echo ✓ cleanup.py
del /Q cleanup_auto.ps1 2>nul && echo ✓ cleanup_auto.ps1

echo.
echo 🗑️ Eliminando speedtest redundantes...
del /Q lib\speedtest.ts 2>nul && echo ✓ lib/speedtest.ts
del /Q lib\speedtest-improved.ts 2>nul && echo ✓ lib/speedtest-improved.ts
del /Q lib\speedtest-fixed.ts 2>nul && echo ✓ lib/speedtest-fixed.ts

echo.
echo 🗑️ Eliminando APIs innecesarias...
rmdir /S /Q app\api\upload-test 2>nul && echo ✓ app/api/upload-test/
rmdir /S /Q app\api\test-speedtest 2>nul && echo ✓ app/api/test-speedtest/
rmdir /S /Q app\api\speedtest-proxy 2>nul && echo ✓ app/api/speedtest-proxy/

echo.
echo 🗑️ Eliminando vercel.json...
del /Q vercel.json 2>nul && echo ✓ vercel.json

echo.
echo ✅ Limpieza completada!
pause
