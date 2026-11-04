@echo off
title Integration Platform - Frontend (Vite)
echo ========================================================
echo Starting Integration Platform Frontend on port 5173...
echo ========================================================
cd /d "%~dp0frontend"
npm.cmd run dev
pause
