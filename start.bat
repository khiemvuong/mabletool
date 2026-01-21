@echo off
title Maple Auto Search Tool
color 0A

echo.
echo ╔════════════════════════════════════════╗
echo ║   🍁 MAPLE AUTO SEARCH TOOL 🍁        ║
echo ╚════════════════════════════════════════╝
echo.
echo Starting server...
echo.

node server.js

if %errorlevel% neq 0 (
    echo.
    echo ❌ ERROR: Failed to start server
    echo.
    echo Please make sure:
    echo   1. Node.js is installed
    echo   2. Run 'npm install' first
    echo.
    pause
)
