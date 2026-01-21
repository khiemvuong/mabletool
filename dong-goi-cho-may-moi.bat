@echo off
chcp 65001 >nul
title Maple Tool - Đóng gói cho máy mới

echo.
echo ╔════════════════════════════════════════╗
echo ║   🍁 MAPLE AUTO SEARCH TOOL 🍁        ║
echo ║      Đóng gói cho máy mới             ║
echo ╚════════════════════════════════════════╝
echo.

set PKG_DIR=maple-tool-package
set ZIP_NAME=maple-tool-for-new-pc.zip

echo 📦 Đang chuẩn bị đóng gói...
echo.

REM Xóa thư mục cũ nếu tồn tại
if exist "%PKG_DIR%" (
    echo 🗑️  Xóa thư mục package cũ...
    rmdir /s /q "%PKG_DIR%"
)

REM Tạo thư mục package
echo 📁 Tạo thư mục package...
mkdir "%PKG_DIR%"
mkdir "%PKG_DIR%\public"

REM Copy files chính
echo 📄 Copy files chính...
copy server.js "%PKG_DIR%\" >nul
copy automation.js "%PKG_DIR%\" >nul
copy package.json "%PKG_DIR%\" >nul
copy package-lock.json "%PKG_DIR%\" >nul

REM Copy public folder
echo 📁 Copy public folder...
copy public\*.* "%PKG_DIR%\public\" >nul

REM Copy files setup
echo 📄 Copy files hướng dẫn...
copy start.bat "%PKG_DIR%\" >nul
copy setup-browser.bat "%PKG_DIR%\" >nul
copy README.md "%PKG_DIR%\" >nul
copy SETUP-GUIDE.md "%PKG_DIR%\" >nul
copy QUICK-GUIDE.txt "%PKG_DIR%\" >nul
copy CHO-MAY-MOI.txt "%PKG_DIR%\" >nul

if exist CHANGELOG.md copy CHANGELOG.md "%PKG_DIR%\" >nul
if exist .gitignore copy .gitignore "%PKG_DIR%\" >nul

echo.
echo ✅ Đã copy xong tất cả files!
echo.
echo 📦 Thư mục package: %PKG_DIR%\
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 🎯 CÁCH CHUYỂN SANG MÁY MỚI:
echo.
echo 1. Copy toàn bộ thư mục "%PKG_DIR%" sang máy mới
echo.
echo 2. Trên máy mới, mở Command Prompt trong thư mục đó
echo.
echo 3. Chạy các lệnh sau:
echo    ^> npm install
echo    ^> npm run setup     (nếu không có Chrome/Edge/Opera)
echo    ^> npm start
echo.
echo 4. Mở browser: http://localhost:3000
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

REM Hỏi có muốn tạo file ZIP không
echo 💡 Bạn có muốn tạo file ZIP để dễ copy không?
choice /C YN /M "Nhấn Y để tạo ZIP, N để bỏ qua"

if errorlevel 2 goto :skip_zip
if errorlevel 1 goto :create_zip

:create_zip
echo.
echo 🗜️  Đang tạo file ZIP...
echo.

REM Kiểm tra xem có PowerShell không
where powershell >nul 2>&1
if %errorlevel% equ 0 (
    powershell -command "Compress-Archive -Path '%PKG_DIR%' -DestinationPath '%ZIP_NAME%' -Force"
    if exist "%ZIP_NAME%" (
        echo.
        echo ✅ Đã tạo file ZIP: %ZIP_NAME%
        echo.
        echo 📦 Bạn có thể gửi file này sang máy mới!
    ) else (
        echo.
        echo ❌ Không thể tạo file ZIP
        echo 💡 Bạn có thể copy thư mục "%PKG_DIR%" sang máy mới
    )
) else (
    echo.
    echo ❌ Không tìm thấy PowerShell để tạo ZIP
    echo 💡 Bạn có thể:
    echo    - Copy thư mục "%PKG_DIR%" sang máy mới
    echo    - Hoặc dùng WinRAR/7-Zip để nén thành file ZIP
)
goto :end

:skip_zip
echo.
echo 📁 Bỏ qua tạo ZIP
echo 💡 Bạn có thể copy thư mục "%PKG_DIR%" sang máy mới
goto :end

:end
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 🎉 HOÀN TẤT!
echo.
echo 📖 Đọc file CHO-MAY-MOI.txt để biết hướng dẫn chi tiết
echo.
pause
