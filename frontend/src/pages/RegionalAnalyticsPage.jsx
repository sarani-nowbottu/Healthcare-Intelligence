/**
 * Regional Healthcare Analytics View
 * AI-Powered Healthcare Policy Intelligence & Prediction System
 */

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  BarChart3,
  Search,
  Filter,
  MapPin,
  TrendingUp,
  TrendingDown,
  Layers
} from 'lucide-react';

export default function RegionalAnalyticsPage() {
  const [overview, setOverview] = useState(null);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTier, setFilterTier] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const [ovData, regData] = await Promise.all([
          api.getAnalyticsOverview(),
          api.getRegionalData()
        ]);
        setOverview(ovData);
        setRegions(regData.regions || []);
      } catch (err) {
        console.error('Error fetching regional analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '80px 0' }}>
        <div style={{ fontSize: '1.1rem', color: '#64748b' }}>Aggregating Regional Analytics from 702 Districts...</div>
      </div>
    );
  }

  // Filter state records
  const filteredStates = (regions || []).filter((r) => {
    const matchesSearch = r.state.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (filterTier === 'HIGH') return r.institutional_births >= 90.0;
    if (filterTier === 'MEDIUM') return r.institutional_births >= 75.0 && r.institutional_births < 90.0;
    if (filterTier === 'LOW') return r.institutional_births < 75.0;
    return true;
  });

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BarChart3 size={24} color="#0284c7" />
          Regional Healthcare Analytics & Comparative Indicators
        </h2>
        <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
          Empirical comparison across all 38 Indian States and Union Territories from the authentic NFHS-5 survey.
        </p>
      </div>

      {/* National Overview KPI Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">National Average</div>
          <div className="metric-value">{overview?.national_average_rate}%</div>
          <div className="metric-sub">Mean Institutional Delivery Rate</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Median District Rate</div>
          <div className="metric-value" style={{ color: '#0d9488' }}>
            {overview?.national_median_rate}%
          </div>
          <div className="metric-sub">50th Percentile Benchmark</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Highest District</div>
          <div className="metric-value" style={{ color: '#10b981' }}>
            {overview?.max_rate}%
          </div>
          <div className="metric-sub">Near universal coverage</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Lowest District</div>
          <div className="metric-value" style={{ color: '#ef4444' }}>
            {overview?.min_rate}%
          </div>
          <div className="metric-sub">Priority intervention required</div>
        </div>
      </div>

      {/* State Rankings & Multi-Indicator Analysis */}
      <div className="hc-card">
        <div className="hc-card-header" style={{ flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div className="hc-card-title">
              <MapPin size={18} color="#0284c7" /> State & Union Territory Healthcare Aggregates
            </div>
            <div className="hc-card-subtitle">
              Aggregated across all 702 districts with key maternal, child, and infrastructure indicators
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search state..."
                className="form-control"
                style={{ paddingLeft: '32px', height: '36px', fontSize: '0.82rem', width: '180px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '11px' }} />
            </div>

            <select
              className="form-select"
              style={{ height: '36px', fontSize: '0.82rem', width: '160px' }}
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
            >
              <option value="ALL">All Tiers (38 States)</option>
              <option value="HIGH">High Tier (&ge;90%)</option>
              <option value="MEDIUM">Medium Tier (75-89%)</option>
              <option value="LOW">Low Tier (&lt;75%)</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="hc-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>State / Union Territory</th>
                <th>Institutional Births (%)</th>
                <th>Performance Tier</th>
                <th>4+ ANC Visits (%)</th>
                <th>Clean Fuel (%)</th>
                <th>Improved Sanitation (%)</th>
                <th>Full Immunization (%)</th>
                <th>Insurance Coverage (%)</th>
              </tr>
            </thead>
            <tbody>
              {filteredStates
                .sort((a, b) => b.institutional_births - a.institutional_births)
                .map((r, idx) => {
                  let tierClass = 'high';
                  let tierLabel = 'High Tier';
                  if (r.institutional_births < 75.0) {
                    tierClass = 'low';
                    tierLabel = 'Low Tier';
                  } else if (r.institutional_births < 90.0) {
                    tierClass = 'medium';
                    tierLabel = 'Medium Tier';
                  }

                  return (
                    <tr key={r.state}>
                      <td style={{ fontWeight: 700, color: '#64748b' }}>#{idx + 1}</td>
                      <td style={{ fontWeight: 600 }}>{r.state}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ fontSize: '0.95rem' }}>{r.institutional_births}%</strong>
                          <div style={{
                            width: '60px',
                            height: '6px',
                            backgroundColor: '#e2e8f0',
                            borderRadius: '3px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${Math.min(100, r.institutional_births)}%`,
                              height: '100%',
                              backgroundColor: tierClass === 'high' ? '#10b981' : (tierClass === 'medium' ? '#f59e0b' : '#ef4444')
                            }} />
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${tierClass}`}>{tierLabel}</span>
                      </td>
                      <td>{r.anc_4_visits}%</td>
                      <td>{r.clean_fuel}%</td>
                      <td>{r.sanitation}%</td>
                      <td>{r.immunization_full}%</td>
                      <td>{r.health_insurance}%</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
