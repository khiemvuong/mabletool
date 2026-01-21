@echo off
chcp 65001 >nul
cls
echo.
echo ===============================================================
echo   KHOI DONG OPERA VOI REMOTE DEBUGGING
echo ===============================================================
echo.
echo Dang khoi dong Opera tren port 9222...
echo.

REM Khoi dong Opera voi remote debugging
start "" "C:\Users\My PC\AppData\Local\Programs\Opera\opera.exe" --remote-debugging-port=9222

timeout /t 2 >nul

echo Opera da khoi dong thanh cong!
echo.
echo LUU Y:
echo    - Opera dang chay o che do Remote Debugging
echo    - Port: 9222
echo    - VPN van hoat dong binh thuong
echo.
echo CACH DUNG VOI MAPLE TOOL:
echo    1. Giu Opera nay mo
echo    2. Khoi dong Maple Tool (start.bat)
echo    3. Tool se TU DONG ket noi vao Opera nay
echo    4. Chi tao TAB MOI, khong mo browser moi!
echo.
echo KIEM TRA:
echo    Mo browser khac va truy cap:
echo    http://localhost:9222/json/version
echo.
echo ===============================================================
echo.
pause
