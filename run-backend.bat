@echo off
title Integration Platform - Backend (Spring Boot)
echo ========================================================
echo Starting Integration Platform Backend on port 8080...
echo ========================================================
cd /d "%~dp0backend"
"C:\Tools\apache-maven-3.9.16\bin\mvn.cmd" spring-boot:run -Dspring-boot.run.profiles=local
pause
