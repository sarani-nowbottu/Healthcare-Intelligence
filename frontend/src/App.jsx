/**
 * Root Application Component
 * AI-Powered Healthcare Policy Intelligence & Prediction System
 */

import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Page Views
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PolicyAnalyzerPage from './pages/PolicyAnalyzerPage';
import AIAssistantPage from './pages/AIAssistantPage';
import MLPredictionPage from './pages/MLPredictionPage';
import RegionalAnalyticsPage from './pages/RegionalAnalyticsPage';
import AIRecommendationsPage from './pages/AIRecommendationsPage';
import DatasetInfoPage from './pages/DatasetInfoPage';
import ModelPerformancePage from './pages/ModelPerformancePage';
import AboutProjectPage from './pages/AboutProjectPage';

const PAGE_TITLES = {
  landing: { title: 'AI-Powered Healthcare Policy Intelligence & Prediction System', subtitle: 'Dual-Subject Academic Platform: Generative AI & Machine Learning' },
  dashboard: { title: 'Executive Healthcare Intelligence Dashboard', subtitle: 'National Overview across 702 Districts (NFHS-5)' },
  assistant: { title: 'AI Healthcare Policy Assistant', subtitle: 'Retrieval-Augmented Generation (RAG) Grounded in Official Guidelines' },
  policies: { title: 'Healthcare Policy Document Analyzer', subtitle: 'Ingestion, Text Extraction, and Chunk Indexing' },
  predict: { title: 'District Healthcare Outcome Prediction', subtitle: 'Machine Learning Estimation of Institutional Delivery Rates' },
  analytics: { title: 'Regional Healthcare Analytics', subtitle: 'State and District Level Indicators Comparison' },
  recommendations: { title: 'AI Healthcare Policy Recommendations', subtitle: 'Evidence-Based Strategic Action Engine' },
  dataset: { title: 'National Dataset Lineage & Methodology', subtitle: 'NFHS-5 (MoHFW / IIPS) 702 Districts Profile' },
  performance: { title: 'Machine Learning Model Benchmarking', subtitle: 'Comparative Evaluation of 4 Algorithms' },
  about: { title: 'About Project & Academic Defense Guide', subtitle: 'System Architecture, Viva Q&A, and Methodology' },
  login: { title: 'Sign In to Platform', subtitle: 'Access predictions, audit logs, and policy tools' },
  register: { title: 'Register Account', subtitle: 'Join as Citizen, Researcher, or Administrator' }
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={setCurrentPage} />;
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentPage} />;
      case 'assistant':
        return <AIAssistantPage onNavigate={setCurrentPage} />;
      case 'policies':
        return <PolicyAnalyzerPage onNavigate={setCurrentPage} />;
      case 'predict':
        return <MLPredictionPage onNavigate={setCurrentPage} />;
      case 'analytics':
        return <RegionalAnalyticsPage onNavigate={setCurrentPage} />;
      case 'recommendations':
        return <AIRecommendationsPage onNavigate={setCurrentPage} />;
      case 'dataset':
        return <DatasetInfoPage onNavigate={setCurrentPage} />;
      case 'performance':
        return <ModelPerformancePage onNavigate={setCurrentPage} />;
      case 'about':
        return <AboutProjectPage onNavigate={setCurrentPage} />;
      case 'login':
        return <LoginPage onNavigate={setCurrentPage} />;
      case 'register':
        return <RegisterPage onNavigate={setCurrentPage} />;
      default:
        return <DashboardPage onNavigate={setCurrentPage} />;
    }
  };

  const currentMeta = PAGE_TITLES[currentPage] || PAGE_TITLES.dashboard;

  return (
    <AuthProvider>
      <div className="app-container">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
        <div className="main-content">
          <Navbar
            title={currentMeta.title}
            subtitle={currentMeta.subtitle}
            onNavigate={setCurrentPage}
          />
          <main style={{ flex: 1, overflowY: 'auto' }}>
            {renderPage()}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
