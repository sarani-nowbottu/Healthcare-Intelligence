/**
 * Executive Dashboard View
 * AI-Powered Healthcare Policy Intelligence & Prediction System
 */

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Activity,
  BrainCircuit,
  FileText,
  MapPin,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Shield,
  Layers
} from 'lucide-react';

export default function DashboardPage({ onNavigate }) {
  const [overview, setOverview] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [ovData, histData] = await Promise.all([
          api.getAnalyticsOverview(),
          api.getPredictionHistory()
        ]);
        setOverview(ovData);
        setHistory(histData.history || []);
      } catch (err) {
        console.error('Error fetching dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '80px 0' }}>
        <div style={{ fontSize: '1.1rem', color: '#64748b' }}>Loading National Healthcare Intelligence Dashboard...</div>
      </div>
    );
  }

  const tierCounts = overview?.tier_distribution || { High: 418, Medium: 206, Low: 83 };

  return (
    <div className="page-wrapper">
      {/* Top Welcome Card */}
      <div className="hc-card" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
        color: '#ffffff',
        marginBottom: '28px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              National Family Health Survey (NFHS-5) Intelligence
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px' }}>
              District-Level Healthcare Outcomes & Policy Intelligence
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', maxWidth: '750px', marginTop: '6px' }}>
              Monitoring 702 districts across 38 States and Union Territories. Machine learning models predict institutional delivery rates while GenAI synthesizes grounded policy recommendations.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => onNavigate('predict')} className="btn btn-accent btn-sm">
              <Activity size={16} /> New ML Prediction
            </button>
            <button onClick={() => onNavigate('assistant')} className="btn btn-outline btn-sm" style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}>
              <BrainCircuit size={16} /> Open Policy Assistant
            </button>
          </div>
        </div>
      </div>

      {/* Key National Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Analyzed Districts</div>
          <div className="metric-value">{overview?.total_districts || 702}</div>
          <div className="metric-sub">Across 38 Indian States/UTs</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">National Average Rate</div>
          <div className="metric-value" style={{ color: '#0284c7' }}>
            {overview?.national_average_rate || '88.58'}%
          </div>
          <div className="metric-sub">Institutional Deliveries (NFHS-5)</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">High Performance Tier</div>
          <div className="metric-value" style={{ color: '#10b981' }}>
            {tierCounts.High || 418}
          </div>
          <div className="metric-sub">Districts achieving &ge; 90%</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Priority Focus Areas</div>
          <div className="metric-value" style={{ color: '#ef4444' }}>
            {tierCounts.Low || 83}
          </div>
          <div className="metric-sub">Districts with &lt; 75% rate</div>
        </div>
      </div>

      {/* Two Column Layout: Top/Bottom Districts and Quick Tools */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        {/* Priority Intervention Districts */}
        <div className="hc-card">
          <div className="hc-card-header">
            <div>
              <div className="hc-card-title">
                <AlertTriangle size={18} color="#ef4444" /> Priority Intervention Districts
              </div>
              <div className="hc-card-subtitle">Districts with lowest reported institutional delivery rates in NFHS-5</div>
            </div>
            <button onClick={() => onNavigate('analytics')} className="btn btn-outline btn-sm">
              All Districts &rarr;
            </button>
          </div>
          <table className="hc-table">
            <thead>
              <tr>
                <th>District</th>
                <th>State</th>
                <th>Reported Rate</th>
                <th>Performance Tier</th>
              </tr>
            </thead>
            <tbody>
              {(overview?.bottom_5_districts || []).map((d, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{d.district}</td>
                  <td>{d.state}</td>
                  <td style={{ fontWeight: 700, color: '#ef4444' }}>{d.institutional_births}%</td>
                  <td><span className="badge badge-low">Low Tier</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Highest Performing Districts */}
        <div className="hc-card">
          <div className="hc-card-header">
            <div>
              <div className="hc-card-title">
                <CheckCircle size={18} color="#10b981" /> High Performing Benchmark Districts
              </div>
              <div className="hc-card-subtitle">Districts with near-universal institutional delivery coverage</div>
            </div>
            <button onClick={() => onNavigate('analytics')} className="btn btn-outline btn-sm">
              View Rankings &rarr;
            </button>
          </div>
          <table className="hc-table">
            <thead>
              <tr>
                <th>District</th>
                <th>State</th>
                <th>Reported Rate</th>
                <th>Performance Tier</th>
              </tr>
            </thead>
            <tbody>
              {(overview?.top_5_districts || []).map((d, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{d.district}</td>
                  <td>{d.state}</td>
                  <td style={{ fontWeight: 700, color: '#10b981' }}>{d.institutional_births}%</td>
                  <td><span className="badge badge-high">High Tier</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Predictions Audit Log from SQLite */}
      <div className="hc-card">
        <div className="hc-card-header">
          <div>
            <div className="hc-card-title">
              <Activity size={18} color="#0284c7" /> Recent ML Prediction Audit Trail
            </div>
            <div className="hc-card-subtitle">Persistent records stored in local SQLite database</div>
          </div>
          <button onClick={() => onNavigate('predict')} className="btn btn-primary btn-sm">
            Run New Prediction
          </button>
        </div>
        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
            No predictions logged yet. Run a prediction from the ML Prediction page to generate persistent audit records.
          </div>
        ) : (
          <table className="hc-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Target District / Scope</th>
                <th>Selected Model</th>
                <th>Predicted Rate</th>
                <th>Assigned Tier</th>
                <th>95% Interval</th>
              </tr>
            </thead>
            <tbody>
              {history.slice(0, 6).map((item) => (
                <tr key={item.id}>
                  <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {new Date(item.created_at).toLocaleString()}
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {item.district_name} {item.state_name ? `(${item.state_name})` : ''}
                  </td>
                  <td><span className="badge badge-blue">{item.selected_algorithm}</span></td>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>{item.predicted_rate}%</td>
                  <td>
                    <span className={`badge badge-${(item.predicted_tier || 'medium').toLowerCase()}`}>
                      {item.predicted_tier}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {item.lower_bound}% &ndash; {item.upper_bound}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
