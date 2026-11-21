/**
 * AI Healthcare Recommendations View
 * AI-Powered Healthcare Policy Intelligence & Prediction System
 */

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Lightbulb,
  Sparkles,
  ShieldAlert,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function AIRecommendationsPage() {
  const [districtsData, setDistrictsData] = useState(null);
  const [selectedState, setSelectedState] = useState('Bihar');
  const [selectedDistrict, setSelectedDistrict] = useState('Gaya');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function init() {
      try {
        const res = await api.getDistricts();
        setDistrictsData(res);
        generate('Gaya', 'Bihar');
      } catch (err) {
        console.error('Error fetching districts:', err);
      }
    }
    init();
  }, []);

  async function generate(distName, stName) {
    setLoading(true);
    setError('');
    try {
      const res = await api.generateRecommendations({
        district_name: distName || selectedDistrict,
        state_name: stName || selectedState
      });
      setResult(res);
    } catch (err) {
      setError('Failed to generate recommendations: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  const statesList = Object.keys(districtsData?.grouped_by_state || {}).sort();
  const districtList = (districtsData?.grouped_by_state[selectedState] || []).sort();

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Lightbulb size={24} color="#7c3aed" />
          AI Healthcare Policy Recommendations & Strategic Action Engine
        </h2>
        <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
          Synthesizes ML outcome predictions, feature bottlenecks, and retrieved official guidelines into grounded policy recommendations.
        </p>
      </div>

      {/* District Selector Header */}
      <div className="hc-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Select State / UT</label>
            <select
              className="form-select"
              value={selectedState}
              onChange={(e) => {
                const st = e.target.value;
                setSelectedState(st);
                const dists = districtsData?.grouped_by_state[st] || [];
                if (dists.length > 0) setSelectedDistrict(dists[0]);
              }}
            >
              {statesList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Select Target District</label>
            <select
              className="form-select"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
            >
              {districtList.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <button
            onClick={() => generate(selectedDistrict, selectedState)}
            disabled={loading}
            className="btn btn-accent"
            style={{ height: '42px' }}
          >
            {loading ? 'Synthesizing Recommendations...' : 'Generate Recommendations'} <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#b91c1c', marginBottom: '20px', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      {/* Main Results View */}
      {result && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
          {/* Executive ML Context Banner */}
          <div className="hc-card" style={{ borderLeft: '6px solid #7c3aed' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Target Region Profile
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                  {result.district_info ? `${result.district_info.district}, ${result.district_info.state}` : selectedDistrict}
                </h3>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                  ML Predicted Institutional Delivery: <strong>{result.prediction.predicted_institutional_delivery_rate}%</strong> &bull; Assigned Tier: <strong>{result.prediction.predicted_performance_tier}</strong>
                </div>
              </div>

              <div>
                <span className={`badge badge-${result.prediction.predicted_performance_tier.toLowerCase()}`} style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                  {result.prediction.predicted_performance_tier} Performance Tier
                </span>
              </div>
            </div>
          </div>

          {/* Full Grounded AI Policy Recommendations */}
          <div className="hc-card">
            <div className="hc-card-header">
              <div>
                <div className="hc-card-title">
                  <Sparkles size={18} color="#7c3aed" /> Synthesized Policy & Operational Strategy Brief
                </div>
                <div className="hc-card-subtitle">
                  Evidence-based areas for health administrators and frontline health workers
                </div>
              </div>
              <span className="badge badge-teal">Grounded Output</span>
            </div>

            <div style={{ lineHeight: 1.8, fontSize: '0.94rem', color: '#334155', whiteSpace: 'pre-line' }}>
              {result.recommendations}
            </div>

            {/* Citations Box */}
            {result.citations && result.citations.length > 0 && (
              <div className="citations-box" style={{ marginTop: '24px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BookOpen size={13} /> Official Policy Guidelines Cited
                </div>
                {result.citations.map((c, i) => (
                  <div key={i} style={{ marginBottom: '8px' }}>
                    <span className="citation-tag">{c.document_title} (Page {c.page_number})</span>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>"{c.snippet}"</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ethical Guardrail Notice */}
          <div style={{
            padding: '16px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            fontSize: '0.82rem',
            color: '#64748b'
          }}>
            <ShieldAlert size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Academic & Healthcare Disclaimer:</strong> Recommendations are generated by synthesizing empirical correlations from the National Family Health Survey (NFHS-5) with official Ministry of Health & Family Welfare guidelines. These suggestions highlight strategic areas for administrative review and do not constitute legal or statutory eligibility determinations.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
