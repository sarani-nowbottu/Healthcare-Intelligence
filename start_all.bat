@echo off
title AI-Powered Healthcare Policy Intelligence & Prediction System
echo =========================================================================
echo   AI-Powered Healthcare Policy Intelligence & Prediction System
echo   Dual Capstone: Generative AI (GenAI) & Machine Learning (ML)
echo =========================================================================
echo.

REM 1. Start Python Flask AI/ML Microservice on Port 5001
echo [1/3] Starting Python Flask AI/ML & RAG Microservice (Port 5001)...
start "Flask AI/ML Microservice (Port 5001)" cmd /k "cd flask_service && python app.py"

REM 2. Start Node.js Express MVC Backend on Port 5000
echo [2/3] Starting Node.js Express MVC Backend (Port 5000)...
start "Express MVC Backend (Port 5000)" cmd /k "cd backend && node server.js"

REM 3. Start React Frontend on Port 5173
echo [3/3] Starting React.js Frontend (Port 5173)...
start "React.js Frontend (Port 5173)" cmd /k "cd frontend && npm run dev"

echo.
echo =========================================================================
echo   All 3 services launched successfully!
echo   - Frontend:  http://localhost:5173
echo   - Backend:   http://localhost:5000
echo   - Flask ML:  http://localhost:5001
echo.
echo   Demo Login:  demo@healthcare.org / Demo@12345
echo =========================================================================
echo.
