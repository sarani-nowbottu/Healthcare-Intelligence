#!/bin/bash
# AI-Powered Healthcare Policy Intelligence & Prediction System
# Local Deployment Startup Script

echo "========================================================================="
echo "  AI-Powered Healthcare Policy Intelligence & Prediction System"
echo "  Dual Capstone: Generative AI (GenAI) & Machine Learning (ML)"
echo "========================================================================="
echo ""

# 1. Start Flask Service
echo "[1/3] Starting Python Flask AI/ML & RAG Microservice (Port 5001)..."
(cd flask_service && python3 app.py) &
FLASK_PID=$!

# 2. Start Express Backend
echo "[2/3] Starting Node.js Express MVC Backend (Port 5000)..."
(cd backend && node server.js) &
EXPRESS_PID=$!

# 3. Start React Frontend
echo "[3/3] Starting React.js Frontend (Port 5173)..."
(cd frontend && npm run dev) &
FRONTEND_PID=$!

echo ""
echo "========================================================================="
echo "  All 3 services running!"
echo "  - Frontend:  http://localhost:5173"
echo "  - Backend:   http://localhost:5000"
echo "  - Flask ML:  http://localhost:5001"
echo ""
echo "  Press Ctrl+C to terminate all services."
echo "========================================================================="

trap "kill $FLASK_PID $EXPRESS_PID $FRONTEND_PID; exit" INT
wait
