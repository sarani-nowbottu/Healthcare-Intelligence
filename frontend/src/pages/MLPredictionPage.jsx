/**
 * Machine Learning Outcome Prediction View
 * AI-Powered Healthcare Policy Intelligence & Prediction System
 */

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Activity,
  Sliders,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  RefreshCw,
  Cpu,
  Layers,
  BookOpen
} from 'lucide-react';

const FEATURE_DESCRIPTIONS = {
  anc_first_trimester: 'Mothers who had an antenatal checkup in 1st trimester (%)',
  anc_4_visits: 'Mothers who had at least 4 antenatal care visits (%)',
  tetanus_protected: 'Mothers whose last birth was protected against neonatal tetanus (%)',
  ifa_100_days: 'Mothers who consumed iron folic acid for 100+ days (%)',
  mcp_card: 'Registered pregnancies with MCP card received (%)',
  women_literate: 'Women who are literate (%)',
  women_schooling_10yrs: 'Women with 10+ years of schooling (%)',
  early_marriage: 'Women age 20-24 years married before age 18 (%)',
  electricity: 'Population living in households with electricity (%)',
  sanitation: 'Population using an improved sanitation facility (%)',
  clean_fuel: 'Households using clean fuel for cooking (%)',
  drinking_water: 'Population with improved drinking water source (%)',
  health_insurance: 'Households covered under health insurance/financing (%)',
  immunization_full: 'Children age 12-23 months fully vaccinated (%)',
  birth_registration: 'Children under 5 with registered birth (%)'
};

export default function MLPredictionPage() {
  const [districtsData, setDistrictsData] = useState(null);
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [districtProfile, setDistrictProfile] = useState(null);
  const [features, setFeatures] = useState({});
  const [selectedModel, setSelectedModel] = useState('Gradient Boosting');
  const [predictionResult, setPredictionResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDistricts() {
      try {
        const res = await api.getDistricts();
        setDistrictsData(res);
        const states = Object.keys(res.grouped_by_state || {});
        if (states.length > 0) {
          const firstState = states.includes('Bihar') ? 'Bihar' : states[0];
          setSelectedState(firstState);
          const dists = res.grouped_by_state[firstState] || [];
          if (dists.length > 0) {
            const firstDist = dists.includes('Patna') ? 'Patna' : dists[0];
            setSelectedDistrict(firstDist);
            loadDistrict(firstDist, firstState);
          }
        }
      } catch (err) {
        setError('Failed to load district database: ' + err.message);
      } finally {
        setLoadingDistricts(false);
      }
    }
    fetchDistricts();
  }, []);

  async function loadDistrict(distName, stName) {
    try {
      const prof = await api.getDistrictProfile(distName, stName);
      setDistrictProfile(prof);
      const initialVals = {};
      Object.keys(prof.indicators).forEach((k) => {
        initialVals[k] = prof.indicators[k].value;
      });
      setFeatures(initialVals);
      setPredictionResult(null);
    } catch (err) {
      console.error('Error loading district profile:', err);
    }
  }

  const handleStateChange = (e) => {
    const st = e.target.value;
    setSelectedState(st);
    const dists = districtsData?.grouped_by_state[st] || [];
    if (dists.length > 0) {
      setSelectedDistrict(dists[0]);
      loadDistrict(dists[0], st);
    }
  };

  const handleDistrictChange = (e) => {
    const dist = e.target.value;
    setSelectedDistrict(dist);
    loadDistrict(dist, selectedState);
  };

  const handleSliderChange = (key, val) => {
    setFeatures((prev) => ({
      ...prev,
      [key]: parseFloat(val)
    }));
  };

  const handlePredict = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        district_name: selectedDistrict,
        state_name: selectedState,
        features: features,
        selected_model: selectedModel
      };
      const res = await api.predict(payload);
      setPredictionResult(res);
    } catch (err) {
      setError('Prediction calculation failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const statesList = Object.keys(districtsData?.grouped_by_state || {}).sort();
  const districtList = (districtsData?.grouped_by_state[selectedState] || []).sort();

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Activity size={24} color="#0d9488" />
          District-Level Healthcare Outcome Prediction
        </h2>
        <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
          Estimate district institutional delivery rates using verified machine learning models trained on NFHS-5 data.
        </p>
      </div>

      {error && (
        <div style={{ padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#b91c1c', marginBottom: '20px', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      {/* District Selector & Model Algorithm Config */}
      <div className="hc-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">1. Select State / UT (38 Available)</label>
            <select
              className="form-select"
              value={selectedState}
              onChange={handleStateChange}
              disabled={loadingDistricts}
            >
              {statesList.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">2. Select District (702 Available)</label>
            <select
              className="form-select"
              value={selectedDistrict}
              onChange={handleDistrictChange}
              disabled={loadingDistricts}
            >
              {districtList.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">3. Select ML Algorithm</label>
            <select
              className="form-select"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              <option value="Gradient Boosting">Gradient Boosting Regressor (Recommended - R²: 0.73)</option>
              <option value="Random Forest">Random Forest Regressor (R²: 0.69)</option>
              <option value="K-Nearest Neighbors">K-Nearest Neighbors Regressor (R²: 0.65)</option>
              <option value="Decision Tree">Decision Tree Regressor (R²: 0.58)</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={handlePredict}
              disabled={loading}
              className="btn btn-accent"
              style={{ width: '100%', height: '42px', fontSize: '0.95rem' }}
            >
              {loading ? 'Computing Model Output...' : 'Run ML Prediction'}
            </button>
          </div>
        </div>

        {districtProfile && (
          <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: '#64748b' }}>Historical NFHS-5 Measured Rate:</span>{' '}
              <strong style={{ color: '#0f172a' }}>{districtProfile.actual_institutional_births}%</strong>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Survey Tier:</span>{' '}
              <span className={`badge badge-${districtProfile.actual_tier.toLowerCase()}`}>
                {districtProfile.actual_tier} Tier
              </span>
            </div>
            <div style={{ color: '#0284c7', fontSize: '0.78rem' }}>
              ✓ Features pre-populated with verified survey measurements
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Indicator Sliders on Left, Prediction Output on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 420px) 1fr', gap: '24px' }}>
        {/* Left Column: Feature Controls */}
        <div className="hc-card">
          <div className="hc-card-header">
            <div>
              <div className="hc-card-title">
                <Sliders size={18} color="#0284c7" /> Healthcare Indicator Features
              </div>
              <div className="hc-card-subtitle">Adjust values to simulate policy interventions</div>
            </div>
            <button
              onClick={() => districtProfile && loadDistrict(selectedDistrict, selectedState)}
              title="Reset to survey data"
              className="btn btn-outline btn-sm"
              style={{ padding: '4px 8px' }}
            >
              <RefreshCw size={13} /> Reset
            </button>
          </div>

          <div style={{ maxHeight: '680px', overflowY: 'auto', paddingRight: '6px' }}>
            {Object.keys(FEATURE_DESCRIPTIONS).map((key) => {
              const val = features[key] !== undefined ? features[key] : 50;
              return (
                <div key={key} className="slider-container">
                  <div className="slider-header">
                    <span style={{ fontWeight: 600, color: '#334155' }}>
                      {FEATURE_DESCRIPTIONS[key]}
                    </span>
                    <strong style={{ color: '#0284c7' }}>{val}%</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.5"
                    className="slider-input"
                    value={val}
                    onChange={(e) => handleSliderChange(key, e.target.value)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Prediction Output, Comparisons, and Explanations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {predictionResult ? (
            <>
              {/* Primary Prediction Result Card */}
              <div className="hc-card" style={{ borderLeft: '6px solid #0d9488' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      ML Model Output &bull; {predictionResult.prediction.selected_algorithm}
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
                      {predictionResult.prediction.predicted_institutional_delivery_rate}%
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      Estimated Institutional Delivery Rate for{' '}
                      <strong>{selectedDistrict}, {selectedState}</strong>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ marginBottom: '6px' }}>
                      <span className={`badge badge-${predictionResult.prediction.predicted_performance_tier.toLowerCase()}`} style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                        {predictionResult.prediction.predicted_performance_tier} Performance Tier
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      95% Interval: {predictionResult.prediction.prediction_interval.lower_bound_95}% &ndash; {predictionResult.prediction.prediction_interval.upper_bound_95}%
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      Model RMSE Uncertainty: &plusmn;{predictionResult.prediction.prediction_interval.rmse_uncertainty}%
                    </div>
                  </div>
                </div>

                {/* Factor Contribution Highlights */}
                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#065f46', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Top Positive Drivers
                    </div>
                    {predictionResult.prediction.top_positive_drivers.map((d, i) => (
                      <div key={i} style={{ fontSize: '0.82rem', color: '#334155', marginBottom: '4px' }}>
                        &bull; {d.display_name}: <strong>{d.input_value}%</strong> (+{d.relative_gap}% vs natl mean)
                      </div>
                    ))}
                  </div>

                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Key Indicator Bottlenecks
                    </div>
                    {predictionResult.prediction.key_bottlenecks.map((b, i) => (
                      <div key={i} style={{ fontSize: '0.82rem', color: '#334155', marginBottom: '4px' }}>
                        &bull; {b.display_name}: <strong>{b.input_value}%</strong> ({b.relative_gap}% below natl mean)
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Multi-Model Comparison Table */}
              <div className="hc-card">
                <div className="hc-card-header">
                  <div>
                    <div className="hc-card-title">
                      <Cpu size={18} color="#0284c7" /> Cross-Algorithm Comparison
                    </div>
                    <div className="hc-card-subtitle">Side-by-side estimates across all 4 machine learning algorithms</div>
                  </div>
                </div>
                <table className="hc-table">
                  <thead>
                    <tr>
                      <th>Algorithm</th>
                      <th>Predicted Rate</th>
                      <th>Expected Error (MAE)</th>
                      <th>R² Benchmark</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(predictionResult.prediction.multi_model_comparison).map(([name, val]) => (
                      <tr key={name} style={{ backgroundColor: name === selectedModel ? '#f0f9ff' : 'transparent' }}>
                        <td style={{ fontWeight: 600 }}>{name}</td>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>{val}%</td>
                        <td>{name === 'Gradient Boosting' ? '5.00%' : (name === 'Random Forest' ? '5.26%' : (name === 'K-Nearest Neighbors' ? '5.37%' : '5.94%'))}</td>
                        <td>{name === 'Gradient Boosting' ? '0.7326' : (name === 'Random Forest' ? '0.6940' : (name === 'K-Nearest Neighbors' ? '0.6521' : '0.5834'))}</td>
                        <td>
                          {name === 'Gradient Boosting' ? (
                            <span className="badge badge-teal">Selected Best</span>
                          ) : (
                            <span className="badge badge-blue">Evaluated</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Integrated GenAI Policy Explanation & Citations */}
              <div className="hc-card">
                <div className="hc-card-header">
                  <div>
                    <div className="hc-card-title">
                      <BookOpen size={18} color="#7c3aed" /> Integrated GenAI Policy Explanation
                    </div>
                    <div className="hc-card-subtitle">Grounded synthesis connecting empirical indicators to official healthcare schemes</div>
                  </div>
                  <span className="badge badge-teal">RAG Grounded</span>
                </div>

                <div style={{ lineHeight: 1.7, fontSize: '0.92rem', color: '#334155', whiteSpace: 'pre-line' }}>
                  {predictionResult.policy_explanation}
                </div>

                {predictionResult.citations && predictionResult.citations.length > 0 && (
                  <div className="citations-box" style={{ marginTop: '16px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Referenced Official Policy Citations
                    </div>
                    {predictionResult.citations.map((c, i) => (
                      <div key={i} style={{ marginBottom: '6px' }}>
                        <span className="citation-tag">{c.document_title} (Page {c.page_number})</span>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>"{c.snippet}"</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="hc-card" style={{ textAlign: 'center', padding: '80px 20px', color: '#64748b' }}>
              <Activity size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                Ready to Compute Machine Learning Prediction
              </h3>
              <p style={{ maxWidth: '440px', margin: '0 auto', fontSize: '0.88rem' }}>
                Select a district or adjust indicator sliders on the left, then click <strong>"Run ML Prediction"</strong> to view real-time estimates, uncertainty intervals, algorithm comparisons, and grounded policy explanations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
