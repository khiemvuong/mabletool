@echo off
cls
echo.
echo ═══════════════════════════════════════════════════════════════
echo   🧪 KHỞI ĐỘNG TEST PAGE
echo ═══════════════════════════════════════════════════════════════
echo.

cd /d "%~dp0"
echo 🚀 Đang khởi động Test Page trên port 3001...
echo.

node server.js
