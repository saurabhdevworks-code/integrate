@echo off
title Integration Platform Launcher
echo ========================================================
echo Launching Integration Platform Backend and Frontend...
echo ========================================================
start "Integration Platform - Backend" cmd /k "%~dp0run-backend.bat"
ping 127.0.0.1 -n 3 >nul
start "Integration Platform - Frontend" cmd /k "%~dp0run-frontend.bat"
echo.
echo ========================================================
echo Both services launched in separate windows!
echo - Frontend Dashboard: http://localhost:5173
echo - Backend API:        http://localhost:8080
echo - Swagger Docs:       http://localhost:8080/swagger-ui.html
echo ========================================================
echo.
pause
