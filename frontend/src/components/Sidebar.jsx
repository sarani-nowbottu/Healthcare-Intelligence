/**
 * Sidebar Navigation Component
 * AI-Powered Healthcare Policy Intelligence & Prediction System
 */

import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  BrainCircuit,
  FileText,
  Activity,
  BarChart3,
  Lightbulb,
  Cpu,
  Database,
  Info,
  LogIn,
  LogOut,
  ShieldCheck,
  Home
} from 'lucide-react';

export default function Sidebar({ currentPage, onNavigate }) {
  const { user, logout, demoLogin } = useAuth();

  const navItems = [
    { id: 'landing', label: 'Home / Overview', icon: Home },
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'assistant', label: 'AI Policy Assistant (RAG)', icon: BrainCircuit, badge: 'GenAI' },
    { id: 'policies', label: 'Policy Analyzer', icon: FileText },
    { id: 'predict', label: 'ML Outcome Prediction', icon: Activity, badge: 'ML' },
    { id: 'analytics', label: 'Regional Analytics', icon: BarChart3 },
    { id: 'recommendations', label: 'AI Recommendations', icon: Lightbulb, badge: 'Integrated' },
    { id: 'performance', label: 'Model Benchmarks', icon: Cpu, badge: 'ML' },
    { id: 'dataset', label: 'Dataset Information', icon: Database },
    { id: 'about', label: 'About & Academic Report', icon: Info }
  ];

  return (
    <aside style={{
      width: '280px',
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid #1e293b',
      minHeight: '100vh',
      flexShrink: 0
    }}>
      {/* Brand Header */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            backgroundColor: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Healthcare Intelligence
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              Dual GenAI + ML Platform
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 12px 8px 12px' }}>
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                marginBottom: '4px',
                borderRadius: '8px',
                backgroundColor: isActive ? '#1e293b' : 'transparent',
                color: isActive ? '#38bdf8' : '#cbd5e1',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '0.88rem',
                fontWeight: isActive ? 600 : 500,
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = '#172554';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Icon size={18} color={isActive ? '#38bdf8' : '#94a3b8'} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  fontSize: '0.65rem',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: item.badge === 'GenAI' ? '#0369a1' : (item.badge === 'ML' ? '#047857' : '#7c3aed'),
                  color: '#ffffff',
                  fontWeight: 700
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div style={{ padding: '16px', borderTop: '1px solid #1e293b', backgroundColor: '#090d16' }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc' }}>{user.name}</div>
              <div style={{ fontSize: '0.72rem', color: '#38bdf8', textTransform: 'capitalize' }}>{user.role}</div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              style={{
                background: 'transparent',
                border: '1px solid #334155',
                color: '#ef4444',
                padding: '6px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => onNavigate('login')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '8px',
                borderRadius: '6px',
                backgroundColor: '#1e293b',
                color: '#ffffff',
                border: '1px solid #334155',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <LogIn size={15} /> Sign In
            </button>
            <button
              onClick={async () => {
                await demoLogin();
                onNavigate('dashboard');
              }}
              style={{
                width: '100%',
                padding: '7px',
                borderRadius: '6px',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Quick Demo Login
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
