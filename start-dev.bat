@echo off
echo ===================================================
echo Starting AI Interview Preparation System (Full Stack)
echo ===================================================

:: Start Backend (FastAPI on Port 8000)
echo Starting Backend server on http://localhost:8000 ...
start "PreNova AI - Backend (Port 8000)" cmd /k "cd /d "%~dp0Backend" && "venv\Scripts\python.exe" -m uvicorn app.main:app --reload --port 8000"

:: Wait 2 seconds
timeout /t 2 /nobreak >nul

:: Start Frontend (Vite on Port 5173)
echo Starting Frontend dev server on http://localhost:5173 ...
start "PreNova AI - Frontend (Port 5173)" cmd /k "cd /d "%~dp0Frontend\basic-ai-app" && npm run dev"

echo.
echo Both servers started in separate terminal windows!
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo.
pause
