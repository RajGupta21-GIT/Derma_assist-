@echo off
title Derma Assist - Exhibition Launcher
color 0B

echo ============================================================
echo           DERMA ASSIST - CLINICAL DERMATOLOGY AI
echo         Group Project Exhibition Edition Launcher
echo ============================================================
echo.

:: Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not added to PATH.
    pause
    exit /b 1
)

:: Check if Node is available
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not added to PATH.
    pause
    exit /b 1
)

echo [1/3] Starting FastAPI Backend (Port 8000)...
start "Derma Assist - Backend Server" cmd /k "color 0A && echo Starting Backend... && python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/3] Starting React Vite Frontend (Port 5173)...
start "Derma Assist - Frontend Server" cmd /k "color 0E && echo Starting Frontend... && cd frontend && npm run dev"

echo [3/3] Waiting for servers to initialize...
timeout /t 3 >nul

echo.
echo Launching Derma Assist Web Application in your default browser...
start http://localhost:5173

echo.
echo ============================================================
echo  Derma Assist is now running!
echo  - Frontend: http://localhost:5173
echo  - Backend API: http://127.0.0.1:8000
echo  - API Docs:    http://127.0.0.1:8000/docs
echo ============================================================
echo Press any key to exit this launcher window (servers will continue running).
pause >nul
