@echo off
chcp 65001 >nul
title Maple Tool - Setup Browser

echo.
echo ╔════════════════════════════════════════╗
echo ║   🍁 MAPLE AUTO SEARCH TOOL 🍁        ║
echo ║        Browser Setup Script           ║
echo ╚════════════════════════════════════════╝
echo.

echo 📦 Đang cài đặt Chrome cho Puppeteer...
echo.

call npx puppeteer browsers install chrome

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Cài đặt thành công!
    echo.
    echo Bạn có thể chạy tool bằng cách:
    echo   - Double click "start.bat"
    echo   - Hoặc chạy: npm start
    echo.
) else (
    echo.
    echo ❌ Có lỗi xảy ra trong quá trình cài đặt!
    echo.
    echo Vui lòng thử:
    echo   1. Kiểm tra kết nối internet
    echo   2. Chạy Command Prompt/PowerShell với quyền Administrator
    echo   3. Hoặc cài đặt Chrome/Opera thủ công
    echo.
)

pause
