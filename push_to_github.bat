@echo off
title Push Derma Assist to GitHub
echo ===================================================
echo   Pushing Derma Assist to GitHub...
echo ===================================================
cd /d "%~dp0"
"C:\Users\HP\AppData\Local\MinGit\cmd\git.exe" push -u origin main
echo.
echo ===================================================
echo   Done! Check your repository on GitHub.
echo ===================================================
pause
