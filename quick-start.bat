@echo off
cls
echo.
echo ═══════════════════════════════════════════════════════════════
echo   🍁 MAPLE AUTO SEARCH TOOL - QUICK START
echo ═══════════════════════════════════════════════════════════════
echo.

REM Check if Opera is already running with remote debugging
echo 🔍 Đang kiểm tra Opera...

curl -s http://localhost:9222/json/version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Opera đã bật Remote Debugging!
) else (
    echo ⚠️ Opera chưa bật Remote Debugging. Đang khởi động...
    start "" "C:\Users\My PC\AppData\Local\Programs\Opera\opera.exe" --remote-debugging-port=9222
    timeout /t 3 >nul
    echo ✅ Opera đã khởi động với Remote Debugging!
)

echo.
echo 🚀 Đang khởi động Maple Tool...
echo.

REM Start the Node.js server
cd /d "%~dp0"
start "" cmd /c "npm start"

timeout /t 2 >nul

echo ═══════════════════════════════════════════════════════════════
echo.
echo ✅ Maple Tool đang chạy!
echo.
echo 📌 HƯỚNG DẪN:
echo    1. Mở browser và truy cập: http://localhost:3000
echo    2. Nhập URL và từ khóa
echo    3. Click "Chạy Ngay" hoặc "Hẹn Giờ"
echo.
echo 🎯 LUỒNG HOẠT ĐỘNG:
echo    1. Search → Nhập từ khóa vào ô tìm kiếm
echo    2. Tìm thẻ → Tìm thẻ chứa đúng từ khóa
echo    3. Click Submit → Click nút Submit trong thẻ đó
echo.
echo ═══════════════════════════════════════════════════════════════
echo.

REM Open browser to the tool
start "" http://localhost:3000

pause
