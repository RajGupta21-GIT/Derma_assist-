# Derma Assist - PowerShell 1-Click Exhibition Launcher
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "          DERMA ASSIST - CLINICAL DERMATOLOGY AI            " -ForegroundColor Cyan
Write-Host "        Group Project Exhibition Edition Launcher           " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Start Backend in new process
Write-Host "`n[1/3] Starting FastAPI Backend (Port 8000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"

# 2. Start Frontend in new process
Write-Host "[2/3] Starting React Vite Frontend (Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location frontend; npm run dev"

# 3. Wait and launch browser
Write-Host "[3/3] Waiting for servers to initialize..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

Write-Host "`nLaunching Derma Assist in your default browser..." -ForegroundColor Green
Start-Process "http://localhost:5173"

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host " Derma Assist is now live!" -ForegroundColor Green
Write-Host " - Frontend UI:  http://localhost:5173" -ForegroundColor White
Write-Host " - Backend API:  http://127.0.0.1:8000" -ForegroundColor White
Write-Host " - API Docs:     http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Cyan
