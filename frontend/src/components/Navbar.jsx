/**
 * Navbar Header Component
 * AI-Powered Healthcare Policy Intelligence & Prediction System
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Sparkles, CheckCircle, UserCheck } from 'lucide-react';

export default function Navbar({ title, subtitle, onNavigate }) {
  const { user, demoLogin } = useAuth();
  const [backendOnline, setBackendOnline] = useState(true);

  return (
    <header style={{
      height: '70px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 36px',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
            {subtitle}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Academic Dual Subject Tag */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '5px 12px',
          borderRadius: '20px',
          backgroundColor: '#f1f5f9',
          border: '1px solid #cbd5e1',
          fontSize: '0.78rem',
          fontWeight: 600,
          color: '#334155'
        }}>
          <Sparkles size={14} color="#0284c7" />
          <span>GenAI + ML Integrated</span>
        </div>

        {/* Local Deployment Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '5px 10px',
          borderRadius: '20px',
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: '#065f46'
        }}>
          <CheckCircle size={14} color="#10b981" />
          <span>Local Deployment</span>
        </div>

        {/* Demo Login Shortcut if not authenticated */}
        {!user && (
          <button
            onClick={async () => {
              await demoLogin();
              onNavigate('dashboard');
            }}
            className="btn btn-outline btn-sm"
            style={{ fontSize: '0.78rem', borderColor: '#0284c7', color: '#0284c7' }}
          >
            <UserCheck size={14} /> Quick Demo Access
          </button>
        )}
      </div>
    </header>
  );
}
