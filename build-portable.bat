@echo off
echo ============================================
echo  MAPLE AUTO SEARCH TOOL - BUILD PORTABLE
echo ============================================
echo.

echo [1/4] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [2/4] Installing pkg...
call npm install -g pkg
if %errorlevel% neq 0 (
    echo ERROR: Failed to install pkg
    pause
    exit /b 1
)

echo.
echo [3/4] Building executable...
call pkg . --targets node18-win-x64 --output dist/MapleAutoSearch.exe --compress GZip
if %errorlevel% neq 0 (
    echo ERROR: Failed to build executable
    pause
    exit /b 1
)

echo.
echo [4/4] Copying public files...
if not exist "dist\public" mkdir "dist\public"
xcopy /E /I /Y "public" "dist\public"

echo.
echo ============================================
echo  BUILD COMPLETED SUCCESSFULLY!
echo ============================================
echo.
echo Executable file: dist\MapleAutoSearch.exe
echo Copy the entire 'dist' folder to your target computer
echo.
pause
