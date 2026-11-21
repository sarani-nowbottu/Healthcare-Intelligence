/**
 * About Project & Viva Defense Guide View
 * AI-Powered Healthcare Policy Intelligence & Prediction System
 */

import React from 'react';
import {
  Info,
  ShieldCheck,
  BrainCircuit,
  Activity,
  Layers,
  HelpCircle,
  Code,
  Server,
  Database,
  CheckCircle2
} from 'lucide-react';

const VIVA_QUESTIONS = [
  {
    q: "Why did you choose Gradient Boosting Regressor as the production model?",
    a: "Gradient Boosting iteratively fits new decision trees to the negative gradients (pseudo-residuals) of the loss function. In empirical evaluation on 702 districts, it achieved the highest coefficient of determination (R² = 0.7326) and lowest Mean Absolute Error (MAE = 5.00%), outperforming Random Forest (R² = 0.6940), KNN (R² = 0.6521), and single Decision Trees (R² = 0.5834)."
  },
  {
    q: "How did you prevent data leakage in your machine learning pipeline?",
    a: "We intentionally omitted direct proxies of delivery setting (e.g., 'Births attended by skilled health personnel' which had a 0.95 correlation with the target). We also ensured strict 80/20 train-test separation before fitting scalers, and used only prenatal care indicators (e.g. 4+ ANC visits, first trimester checkup, tetanus protection) and socio-demographic infrastructure predictors available prior to childbirth."
  },
  {
    q: "How does the RAG pipeline prevent hallucinations in the Generative AI component?",
    a: "Rather than relying on ungrounded parametric memory, the system uses a local vector index to retrieve the top matching passages from official Ministry guidelines (PM-JAY, JSY, PMMVY, NHP 2017). The prompt enforces strict constraints requiring explicit document and page citations, and explicitly instructs the model to declare if the official texts do not contain the answer."
  },
  {
    q: "How do you connect Machine Learning with Generative AI in this system?",
    a: "This is the primary integration innovation: The ML model evaluates district indicators to predict institutional delivery rates and identifies top indicator bottlenecks (e.g., deficient 4+ ANC visits or low health insurance coverage). These bottlenecks are fed into the RAG vector store to retrieve targeted policy provisions (e.g., JSY cash incentive scales for Low-Performing States). Google Gemini then synthesizes a non-causal explanation and actionable recommendations citing verified official policy provisions."
  },
  {
    q: "Why did you implement local deployment instead of cloud hosting?",
    a: "Local deployment guarantees complete reproducibility on any evaluator's machine without recurring cloud hosting fees or external server dependencies. SQLite provides zero-configuration persistent storage, Scikit-learn runs localized inference in Python Flask, and the React frontend communicates via a local Express MVC gateway."
  }
];

export default function AboutProjectPage() {
  return (
    <div className="page-wrapper" style={{ maxWidth: '1200px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Info size={24} color="#0284c7" />
          About Project & Academic Defense Guide
        </h2>
        <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
          Comprehensive project report, system architecture overview, and viva examination preparation.
        </p>
      </div>

      {/* Project Overview Card */}
      <div className="hc-card" style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <ShieldCheck size={22} color="#0d9488" />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
            AI-Powered Healthcare Policy Intelligence & Prediction System
          </h3>
        </div>
        <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.7, marginBottom: '16px' }}>
          An integrated academic capstone project developed concurrently for two subjects:
          <strong> Generative Artificial Intelligence (GenAI)</strong> and <strong>Machine Learning (ML)</strong>.
          The platform bridges empirical district-level healthcare outcome estimation with grounded, citation-backed policy intelligence from official government healthcare guidelines.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase' }}>Subject 1</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>Generative AI (GenAI)</div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
              RAG Pipeline, Semantic Vector Indexing, Google Gemini API, Grounded Q&A with Document & Page Citations, Multi-turn Chat.
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0d9488', textTransform: 'uppercase' }}>Subject 2</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>Machine Learning (ML)</div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
              NFHS-5 District Dataset (702 districts), Decision Tree, Random Forest, KNN, Gradient Boosting Regressors, Evaluation (MAE, RMSE, R²), Performance Tier Classifiers.
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase' }}>Engineering Core</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>Full-Stack & Local Deploy</div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
              React.js Frontend, Node.js + Express (MVC) Backend, Python Flask Microservice, SQLite Database, JWT Authentication, Model Context Protocol (MCP).
            </div>
          </div>
        </div>
      </div>

      {/* System Architecture Section */}
      <div className="hc-card" style={{ marginBottom: '28px' }}>
        <div className="hc-card-header">
          <div>
            <div className="hc-card-title">
              <Layers size={18} color="#0284c7" /> Architectural Flow & Separation of Concerns
            </div>
            <div className="hc-card-subtitle">Three-tier decoupled microservice architecture</div>
          </div>
        </div>

        <div style={{ background: '#0f172a', color: '#f8fafc', padding: '20px', borderRadius: '8px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82rem', lineHeight: 1.6 }}>
          <div>[Frontend: React.js (Port 5173)]</div>
          <div style={{ color: '#38bdf8' }}> &nbsp; &darr; &nbsp; REST API Requests & JWT Authentication</div>
          <div>[Backend: Node.js + Express MVC (Port 5000)] &larr;&rarr; [Database: SQLite (healthcare_system.db)]</div>
          <div style={{ color: '#38bdf8' }}> &nbsp; &darr; &nbsp; Internal Microservice Communication</div>
          <div>[AI/ML Service: Python + Flask (Port 5001)]</div>
          <div style={{ color: '#34d399' }}> &nbsp; &bull; ML Engine: Scikit-Learn (Gradient Boosting, Random Forest, KNN, Decision Tree)</div>
          <div style={{ color: '#a78bfa' }}> &nbsp; &bull; RAG Engine: PDF Text Processing, Semantic Vector Indexing, Google Gemini API</div>
          <div style={{ color: '#f472b6' }}> &nbsp; &bull; Protocol: Model Context Protocol (MCP) Server for LLM tool integration</div>
        </div>
      </div>

      {/* Academic Viva Defense Q&A Guide */}
      <div className="hc-card">
        <div className="hc-card-header">
          <div>
            <div className="hc-card-title">
              <HelpCircle size={18} color="#7c3aed" /> Academic Viva Examination Preparation Guide
            </div>
            <div className="hc-card-subtitle">
              Key questions and answers for oral evaluation and project defense
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {VIVA_QUESTIONS.map((item, idx) => (
            <div key={idx} style={{ padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ color: '#0284c7' }}>Q{idx + 1}:</span>
                <span>{item.q}</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6, paddingLeft: '24px' }}>
                <strong style={{ color: '#065f46' }}>Answer:</strong> {item.a}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
