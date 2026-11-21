/**
 * Landing Page View
 * AI-Powered Healthcare Policy Intelligence & Prediction System
 */

import React from 'react';
import {
  ShieldCheck,
  BrainCircuit,
  Activity,
  FileText,
  BarChart3,
  Lightbulb,
  ArrowRight,
  Database,
  CheckCircle2,
  Lock,
  Layers
} from 'lucide-react';

export default function LandingPage({ onNavigate }) {
  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100%' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
        color: '#ffffff',
        padding: '70px 40px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '9999px',
            padding: '6px 16px',
            fontSize: '0.82rem',
            color: '#38bdf8',
            fontWeight: 600,
            marginBottom: '20px'
          }}>
            <ShieldCheck size={16} /> Dual-Subject Capstone: Generative AI & Machine Learning
          </div>

          <h1 style={{
            fontSize: '2.6rem',
            fontWeight: 800,
            lineHeight: 1.25,
            letterSpacing: '-0.02em',
            marginBottom: '20px'
          }}>
            AI-Powered Healthcare Policy Intelligence & Prediction System
          </h1>

          <p style={{
            fontSize: '1.15rem',
            color: '#cbd5e1',
            lineHeight: 1.6,
            marginBottom: '36px',
            maxWidth: '820px',
            margin: '0 auto 36px auto'
          }}>
            An enterprise-grade healthcare intelligence platform uniting empirical district-level healthcare outcome prediction
            with grounded, citation-backed policy intelligence from official government healthcare guidelines.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigate('dashboard')}
              className="btn btn-accent"
              style={{ padding: '12px 26px', fontSize: '1rem', borderRadius: '8px' }}
            >
              Open Executive Dashboard <ArrowRight size={18} />
            </button>
            <button
              onClick={() => onNavigate('predict')}
              className="btn btn-outline"
              style={{
                padding: '12px 24px',
                fontSize: '1rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderColor: 'rgba(255,255,255,0.25)',
                color: '#ffffff'
              }}
            >
              <Activity size={18} /> Explore ML Predictions
            </button>
            <button
              onClick={() => onNavigate('assistant')}
              className="btn btn-outline"
              style={{
                padding: '12px 24px',
                fontSize: '1rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderColor: 'rgba(255,255,255,0.25)',
                color: '#ffffff'
              }}
            >
              <BrainCircuit size={18} /> Ask AI Policy Assistant
            </button>
          </div>
        </div>
      </section>

      {/* Value Proposition Grid */}
      <section style={{ padding: '60px 40px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
            Bridging Healthcare Policy Understanding with Data-Driven Outcome Modeling
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#64748b', marginTop: '6px' }}>
            Tailored for ordinary citizens navigating health schemes and administrators evaluating regional performance.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
          {/* Feature 1 */}
          <div className="hc-card" style={{ borderTop: '4px solid #0284c7' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <BrainCircuit size={24} color="#0284c7" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>
              Core Module 1 & 2: GenAI Policy Assistant & RAG
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, marginBottom: '14px' }}>
              Semantic retrieval engine indexing official guidelines for PM-JAY, Janani Suraksha Yojana (JSY), PMMVY, and National Health Policy 2017. Delivers grounded answers with strict page-level citations.
            </p>
            <button onClick={() => onNavigate('assistant')} className="btn btn-outline btn-sm">
              Try Policy Assistant &rarr;
            </button>
          </div>

          {/* Feature 2 */}
          <div className="hc-card" style={{ borderTop: '4px solid #0d9488' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Activity size={24} color="#0d9488" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>
              Core Module 3: Machine Learning Outcome Prediction
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, marginBottom: '14px' }}>
              Rigorous comparative benchmark comparing Decision Tree, Random Forest, KNN, and Gradient Boosting Regressors across 702 districts from NFHS-5 data. Predicts institutional delivery rates with uncertainty bounds.
            </p>
            <button onClick={() => onNavigate('predict')} className="btn btn-outline btn-sm">
              Run ML Predictions &rarr;
            </button>
          </div>

          {/* Feature 3 */}
          <div className="hc-card" style={{ borderTop: '4px solid #7c3aed' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Lightbulb size={24} color="#7c3aed" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>
              Core Module 5 & 6: Integrated GenAI + ML Explainer
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, marginBottom: '14px' }}>
              The central academic innovation: The ML model predicts outcome rates, isolates key indicator bottlenecks, and Google Gemini synthesizes grounded policy recommendations referencing specific official scheme incentives.
            </p>
            <button onClick={() => onNavigate('recommendations')} className="btn btn-outline btn-sm">
              Generate Recommendations &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* Dataset & Tech Lineage Banner */}
      <section style={{ backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '50px 40px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0284c7' }}>702</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Districts Across India</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>NFHS-5 (MoHFW / IIPS)</div>
            </div>
            <div>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0d9488' }}>4 Models</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Compared Algorithms</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>DT, RF, KNN, Gradient Boosting</div>
            </div>
            <div>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#7c3aed' }}>0.7326</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Gradient Boosting R²</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>MAE 5.0% on Test Set</div>
            </div>
            <div>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a' }}>100%</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Local Deployment</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Zero Cloud Hosting Cost</div>
            </div>
          </div>
        </div>
      </section>

      {/* Resume Skills Matrix Callout */}
      <section style={{ padding: '60px 40px', maxWidth: '1100px', margin: '0 auto' }}>
        <div className="hc-card" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Layers size={22} color="#38bdf8" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
              Full-Stack & AI Engineering Technology Matrix
            </h3>
          </div>
          <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '20px' }}>
            Built strictly in accordance with verified resume technologies:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ background: '#1e293b', padding: '14px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>Frontend</div>
              <div style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 600, marginTop: '4px' }}>React.js + JavaScript + CSS3</div>
            </div>
            <div style={{ background: '#1e293b', padding: '14px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>Backend API</div>
              <div style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 600, marginTop: '4px' }}>Node.js + Express (MVC) + JWT</div>
            </div>
            <div style={{ background: '#1e293b', padding: '14px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>AI / ML Microservice</div>
              <div style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 600, marginTop: '4px' }}>Python Flask + Scikit-Learn + Pandas</div>
            </div>
            <div style={{ background: '#1e293b', padding: '14px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>GenAI & Protocol</div>
              <div style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 600, marginTop: '4px' }}>Google Gemini + RAG + MCP</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
