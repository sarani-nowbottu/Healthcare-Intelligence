# Academic Viva Examination & Defense Guide
## AI-Powered Healthcare Policy Intelligence & Prediction System
### Dual Submission: Generative Artificial Intelligence (GenAI) & Machine Learning (ML)

---

### Section 1: Machine Learning Viva Questions & Answers

#### Q1: What is the primary machine learning problem you formulated?
**Answer:**
We formulated a **District-Level Healthcare Outcome Prediction** problem using authentic empirical survey data from India's **National Family Health Survey (NFHS-5)** across **702 districts**. Specifically, we predict the **Institutional Delivery Rate (%)** (the proportion of births occurring in medical institutions). In addition, we formulated a regional performance tier classification problem categorizing districts into **High ($\ge 90\%$)**, **Medium ($75\% - 89.9\%$)**, and **Low ($< 75\%$)** tiers.

#### Q2: Which machine learning algorithms did you implement and compare?
**Answer:**
We implemented and benchmarked four core supervised learning algorithms using Scikit-Learn:
1. **Decision Tree Regressor** (`max_depth=6`, `min_samples_leaf=3`)
2. **Random Forest Regressor** (Ensemble of $120$ bootstrap bagged trees)
3. **K-Nearest Neighbors (KNN) Regressor** ($k=5$ with inverse Euclidean distance weighting)
4. **Gradient Boosting Regressor** ($120$ boosting stages, learning rate $\eta = 0.08$, `max_depth=4`, subsample $= 0.9$)

#### Q3: Which model performed best and what were the exact evaluation metrics?
**Answer:**
**Gradient Boosting Regressor** demonstrated the strongest empirical performance on the held-out 20% test set (142 districts):
- **Coefficient of Determination ($R^2$)**: **0.7326** (explaining over 73% of the variance in district delivery rates).
- **Mean Absolute Error (MAE)**: **5.00%** (predictions deviate on average by only 5 percentage points from official survey measurements).
- **Mean Squared Error (MSE)**: **66.187**
- **Root Mean Squared Error (RMSE)**: **8.136%**

For comparison:
- Random Forest: $R^2 = 0.6940$, $\text{MAE} = 5.256\%$
- KNN: $R^2 = 0.6521$, $\text{MAE} = 5.369\%$
- Decision Tree: $R^2 = 0.5834$, $\text{MAE} = 5.944\%$

#### Q4: How did you prevent data leakage during preprocessing and feature selection?
**Answer:**
1. **Omission of Tautological Proxies**: Features like `Births attended by skilled health personnel (%)` (0.95 correlation) and `Home births conducted by skilled personnel (%)` were strictly excluded because they represent direct downstream proxies of the delivery event rather than predictive antecedents.
2. **Temporal & Causal Ordering**: We restricted inputs strictly to prenatal care (e.g. 4+ ANC visits, first trimester checkup, tetanus protection) and socioeconomic infrastructure indicators that exist prior to delivery.
3. **Strict Split Before Scaling**: The 80/20 train-test split was executed before fitting the `StandardScaler` to prevent distribution leakage.
4. **No Regional Identifiers in Feature Matrix**: State and district names were excluded from input features so models learn statistical indicator associations rather than memorizing geographical names.

#### Q5: How did you handle missing data?
**Answer:**
Missing observations in NFHS-5 district tables accounted for less than $0.3\%$ of values. We applied a **hierarchical median imputation**:
- First, missing values were imputed using the median of that specific State to preserve regional socioeconomic geographic homogeneity.
- Any remaining unmeasured features were filled using the National median.

---

### Section 2: Generative AI & RAG Viva Questions & Answers

#### Q6: How does your Retrieval-Augmented Generation (RAG) pipeline work?
**Answer:**
Our RAG pipeline consists of four distinct stages:
1. **Document Ingestion**: Extracts text page-by-page from official policy PDFs (PM-JAY, JSY, PMMVY, National Health Policy 2017) using `pypdf`.
2. **Semantic Chunking**: Decomposes text into 500-word passages with 100-word sliding overlap, annotating each chunk with source metadata: `filename`, `document_title`, and `page_number`.
3. **Vector Indexing & Retrieval**: Constructs a TF-IDF unigram/bigram vector space with sublinear term frequency. When a query is submitted, cosine similarity scores determine the top-$k$ most relevant passages.
4. **Grounded Generation**: Injects retrieved passages into Google Gemini with strict prompt constraints requiring explicit `[Document Name, Page X]` citations and non-hallucination guardrails.

#### Q7: How does RAG mitigate LLM hallucinations?
**Answer:**
Standard LLMs hallucinate because they rely on ungrounded statistical word predictions across massive parametric memory. In our RAG architecture:
- Gemini is provided with explicit, retrieved excerpts from authoritative Ministry documents.
- Prompt constraints mandate that answers be synthesized **exclusively** from the provided text.
- If the retrieved context lacks sufficient details, the system explicitly declares that the official texts do not contain that information rather than fabricating answers.
- Every claim is accompanied by clickable or verified document title and page number citations.

#### Q8: How did you integrate Machine Learning with Generative AI?
**Answer:**
This is our primary capstone innovation:
1. The user selects a district (e.g. Gaya, Bihar) or inputs custom indicators.
2. The Scikit-learn **Gradient Boosting model** predicts the institutional delivery rate and assigns a performance tier.
3. The system compares local indicator values against national benchmarks to isolate **critical bottlenecks** (e.g., deficient 4+ ANC visits or low insurance penetration).
4. The **RAG vector store** automatically retrieves official policy guidelines directly addressing the identified bottlenecks (e.g. Janani Suraksha Yojana cash incentive scales for Low-Performing States).
5. **Google Gemini** receives the ML prediction metrics, feature contributions, and retrieved policy context to synthesize an integrated, objective explanation and 3 evidence-based policy recommendations.

---

### Section 3: Full-Stack & System Architecture Viva Questions

#### Q9: What is the architectural role of each tier?
**Answer:**
- **React.js Frontend (Port 5173)**: Provides the user interface, interactive dashboards, indicator sliders, and cross-model comparison tables.
- **Node.js + Express MVC Backend (Port 5000)**: Serves as the central gateway. Enforces JWT authentication, manages persistent SQLite storage, logs user prediction audit trails, and proxies requests to Flask.
- **Python Flask Microservice (Port 5001)**: Houses the machine learning models (`.joblib`), vector indexing store, Google GenAI SDK, and Model Context Protocol (MCP) server.

#### Q10: Why did you choose SQLite for local storage?
**Answer:**
SQLite is a zero-configuration, serverless, self-contained relational database stored in a single persistent file (`healthcare_system.db`). It eliminates external daemon dependencies (like MySQL or MongoDB servers) ensuring the application starts immediately on any laptop while preserving complete ACID transaction guarantees, relational foreign keys, and structured query capabilities.

#### Q11: What is Model Context Protocol (MCP) and how did you use it?
**Answer:**
MCP is an open standard protocol enabling AI models and developer environments to securely discover and invoke specialized external tools. We created a dedicated MCP server in `healthcare_app/mcp_server/healthcare_mcp.py` exposing four core tools:
1. `search_policy_documents`: Semantic search across policy guidelines.
2. `predict_institutional_delivery`: ML outcome prediction for any district.
3. `get_district_indicators`: Retrieval of official NFHS-5 indicator profiles.
4. `get_model_benchmark_report`: Comparative academic evaluation metrics.
