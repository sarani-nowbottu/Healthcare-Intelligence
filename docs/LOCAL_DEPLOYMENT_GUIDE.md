# Local Deployment & Execution Guide
## AI-Powered Healthcare Policy Intelligence & Prediction System

---

### Prerequisites
Before running the application locally, ensure your machine has:
1. **Python 3.10+** (Tested on Python 3.13)
2. **Node.js v18+** (Tested on Node.js v24)
3. **npm** (Installed with Node.js)

---

### Option A: One-Click Startup (Recommended)

#### On Windows:
Double-click `start_all.bat` located in the `healthcare_app/` folder, or open PowerShell/Terminal:
```powershell
cd healthcare_app
.\start_all.bat
```
This automatically launches all three services in separate console windows:
- **Python Flask Microservice**: `http://localhost:5001`
- **Node.js Express MVC Gateway**: `http://localhost:5000`
- **React.js Frontend**: `http://localhost:5173`

#### On Linux / macOS:
```bash
cd healthcare_app
chmod +x start_all.sh
./start_all.sh
```

---

### Option B: Manual Multi-Terminal Startup

If you prefer starting each microservice individually in separate terminals:

#### Terminal 1: Python Flask AI/ML Microservice (Port 5001)
```bash
cd healthcare_app/flask_service
pip install -r requirements.txt
python app.py
```
*Expected Console Output:*
```text
Model training complete!
Best Regressor: Gradient Boosting (R2=0.7326, MAE=5.0%)
Indexed 4 chunks from 4 policies.
Starting Healthcare AI/ML Service on port 5001...
* Running on http://127.0.0.1:5001
```

#### Terminal 2: Node.js Express MVC Gateway (Port 5000)
```bash
cd healthcare_app/backend
npm install
node server.js
```
*Expected Console Output:*
```text
Connected to persistent SQLite database at: .../healthcare_system.db
Seeded demo administrator user: demo@healthcare.org / Demo@12345
Express MVC Backend running at: http://localhost:5000
Flask Microservice URL: http://localhost:5001
```

#### Terminal 3: React.js Frontend (Port 5173)
```bash
cd healthcare_app/frontend
npm install
npm run dev
```
*Expected Console Output:*
```text
  VITE v6.x.x  ready in 200 ms
  ➜  Local:   http://localhost:5173/
```

Now open your web browser and navigate to:
👉 **`http://localhost:5173`**

---

### Pre-Seeded Reviewer Credentials
The SQLite database automatically initializes a demo account for immediate testing:
- **Email**: `demo@healthcare.org`
- **Password**: `Demo@12345`
- **Role**: Healthcare Administrator

*(You can also click the **"Quick Demo Access"** button in the navigation header to log in instantly with 1-click).*

---

### Environment Variables (.env)
Copy `.env.example` to `.env` if you wish to customize port settings or enable live Gemini generation:
```env
PORT=5000
FLASK_SERVICE_URL=http://localhost:5001
FLASK_PORT=5001
JWT_SECRET=healthcare-policy-intelligence-secret-2026
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

*Note: If `GEMINI_API_KEY` is not provided, the system automatically uses its local grounded vector store for verified citations and summaries.*

---

### Running Automated Test Suites

#### 1. Python ML & RAG Automated Tests (Pytest)
```bash
pytest healthcare_app/flask_service/test_service.py -v
```
*Expected: 13 tests passed.*

#### 2. Node.js Backend & SQLite Tests
```bash
cd healthcare_app/backend
node test_backend.js
```
*Expected: All 4 backend integration tests passed.*
