@echo off
cls
echo.
echo ═══════════════════════════════════════════════════════════════
echo   🎭 KHỞI ĐỘNG OPERA VỚI REMOTE DEBUGGING
echo ═══════════════════════════════════════════════════════════════
echo.
echo 🔗 Đang khởi động Opera trên port 9222...
echo.

REM Khởi động Opera với remote debugging
start "" "C:\Users\My PC\AppData\Local\Programs\Opera\opera.exe" --remote-debugging-port=9222

timeout /t 2 >nul

echo ✅ Opera đã khởi động thành công!
echo.
echo 📌 LƯU Ý:
echo    - Opera đang chạy ở chế độ Remote Debugging
echo    - Port: 9222
echo    - VPN vẫn hoạt động bình thường
echo.
echo 🎯 CÁCH DÙNG VỚI MAPLE TOOL:
echo    1. Giữ Opera này mở
echo    2. Khởi động Maple Tool (start.bat)
echo    3. Tool sẽ TỰ ĐỘNG kết nối vào Opera này
echo    4. Chỉ tạo TAB MỚI, không mở browser mới!
echo.
echo 🔍 KIỂM TRA:
echo    Mở browser khác và truy cập:
echo    http://localhost:9222/json/version
echo.
echo ═══════════════════════════════════════════════════════════════
echo.
pause
