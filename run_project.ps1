# PreNovaAi - AI Interview Preparation System Launcher
# This script starts the backend databases (MongoDB, Redis), FastAPI backend server, and Vite React frontend app.

Clear-Host
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   Starting PreNovaAi - AI Interview Preparation System   " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$rootPath = $PSScriptRoot
if (-not $rootPath) { $rootPath = Get-Location }
$backendPath = Join-Path $rootPath "Backend"
$frontendPath = Join-Path $rootPath "Frontend\basic-ai-app"

# 1. Attempt to start MongoDB and Redis via Docker Compose
Write-Host "`n[1/3] Checking & Starting Database Services (MongoDB & Redis)..." -ForegroundColor Yellow
if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
    Write-Host "Found docker-compose. Verifying/Starting containers..." -ForegroundColor Gray
    Push-Location $backendPath
    docker-compose up -d mongodb redis
    Pop-Location
    Write-Host "Database containers are up and running!" -ForegroundColor Green
} else {
    Write-Host "Docker-compose command not found. Please ensure MongoDB (port 27017) and Redis (port 6379) are running locally on your system." -ForegroundColor DarkYellow
}

# 2. Start the Backend API Server in a new window
Write-Host "`n[2/3] Launching Backend API Server (FastAPI)..." -ForegroundColor Yellow
if (Test-Path "$backendPath\venv") {
    $backendCmd = "cd '$backendPath'; .\venv\Scripts\Activate.ps1; python run.py"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd
    Write-Host "Backend Server started in a new PowerShell window (http://localhost:8000)." -ForegroundColor Green
} else {
    Write-Host "Backend virtual environment (venv) not found at '$backendPath\venv'! Starting without virtualenv activation..." -ForegroundColor Red
    $backendCmd = "cd '$backendPath'; python run.py"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd
}

# 3. Start the Frontend App in a new window
Write-Host "`n[3/3] Launching Frontend React Application (Vite)..." -ForegroundColor Yellow
if (Test-Path "$frontendPath\package.json") {
    $frontendCmd = "cd '$frontendPath'; npm run dev"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd
    Write-Host "Frontend App starting in a new PowerShell window (http://localhost:5173)." -ForegroundColor Green
} else {
    Write-Host "Error: Frontend package.json not found in '$frontendPath'!" -ForegroundColor Red
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host " PreNovaAi is launching! Keep the new terminal windows open." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
