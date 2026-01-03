@echo off
cd /d "%~dp0"
git config --local user.email "dev@wifitop.com"
git config --local user.name "WifiTOP Dev"
git add .
git commit -m "feat: WifiTOP v1.0 - Speedtest Premium con UI impactante" --allow-empty
git push origin main
echo.
echo WifiTOP subido a GitHub exitosamente!
echo URL: https://github.com/elproelpromaspro123-art/WifiTOP
pause
