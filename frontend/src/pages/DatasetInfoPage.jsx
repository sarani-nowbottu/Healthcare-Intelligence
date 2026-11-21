/**
 * Dataset Information & Data Lineage View
 * AI-Powered Healthcare Policy Intelligence & Prediction System
 */

import React from 'react';
import {
  Database,
  ExternalLink,
  ShieldCheck,
  Table,
  CheckCircle,
  FileCheck,
  AlertTriangle
} from 'lucide-react';

const CANONICAL_FEATURES = [
  { key: 'anc_first_trimester', name: 'Antenatal Checkup in 1st Trimester (%)', cat: 'Maternal Healthcare', target: '80.0%', desc: 'Percentage of mothers who had their first prenatal checkup in the first 3 months.' },
  { key: 'anc_4_visits', name: 'At Least 4 ANC Visits (%)', cat: 'Maternal Healthcare', target: '75.0%', desc: 'WHO and MoHFW guideline of minimum 4 comprehensive antenatal consultations.' },
  { key: 'tetanus_protected', name: 'Neonatal Tetanus Protection (%)', cat: 'Maternal Healthcare', target: '95.0%', desc: 'Mothers whose last birth was protected against neonatal tetanus through TT injections.' },
  { key: 'ifa_100_days', name: 'IFA Consumption for 100+ Days (%)', cat: 'Maternal Healthcare', target: '60.0%', desc: 'Mothers who consumed Iron Folic Acid tablets for 100 or more days during pregnancy.' },
  { key: 'mcp_card', name: 'Mother & Child Protection (MCP) Card (%)', cat: 'Maternal Healthcare', target: '98.0%', desc: 'Registered pregnancies for which the mother received an official MCP card.' },
  { key: 'women_literate', name: 'Women Literacy Rate (%)', cat: 'Socioeconomic Profile', target: '85.0%', desc: 'Women age 15-49 years who are literate.' },
  { key: 'women_schooling_10yrs', name: 'Women with 10+ Years Schooling (%)', cat: 'Socioeconomic Profile', target: '60.0%', desc: 'Educational attainment milestone strongly associated with health literacy.' },
  { key: 'early_marriage', name: 'Underage Marriage (<18 years) (%)', cat: 'Socioeconomic Profile', target: '<10.0%', desc: 'Women age 20-24 married before legal age of 18 (risk factor; lower is better).' },
  { key: 'electricity', name: 'Household Electricity Access (%)', cat: 'Infrastructure', target: '99.0%', desc: 'Population living in households with electricity connection.' },
  { key: 'sanitation', name: 'Improved Sanitation Facility Access (%)', cat: 'Infrastructure', target: '90.0%', desc: 'Population living in households using an improved, non-shared toilet.' },
  { key: 'clean_fuel', name: 'Clean Fuel for Cooking (%)', cat: 'Infrastructure', target: '80.0%', desc: 'Households using LPG/natural gas/biogas/electricity instead of biomass.' },
  { key: 'drinking_water', name: 'Improved Drinking Water Source (%)', cat: 'Infrastructure', target: '95.0%', desc: 'Piped water, protected wells, or tube wells.' },
  { key: 'health_insurance', name: 'Health Insurance Coverage (%)', cat: 'Financial Protection', target: '60.0%', desc: 'Households with any usual member covered under health insurance/PM-JAY.' },
  { key: 'immunization_full', name: 'Full Child Immunization (12-23 mos) (%)', cat: 'Child Health', target: '90.0%', desc: 'Children receiving BCG, measles, 3 doses of polio, and 3 doses of DPT/Penta.' },
  { key: 'birth_registration', name: 'Birth Registration with Civil Authority (%)', cat: 'Governance', target: '95.0%', desc: 'Children under age 5 whose birth was registered with government authority.' }
];

export default function DatasetInfoPage() {
  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Database size={24} color="#0284c7" />
          Official Dataset Description & Lineage
        </h2>
        <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
          Documentation of the authentic empirical healthcare survey utilized for machine learning training and evaluation.
        </p>
      </div>

      {/* Dataset Overview Banner */}
      <div className="hc-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Survey Title</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
              National Family Health Survey (NFHS-5)
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
              Collection Period: 2019 &ndash; 2021 (Phase 1 & 2)
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Publishing Authority</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
              Ministry of Health and Family Welfare (MoHFW)
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
              Nodal Agency: International Institute for Population Sciences (IIPS)
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Observations & Scope</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0284c7', marginTop: '4px' }}>
              702 Districts &bull; 38 States/UTs
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
              All 28 States and 8 Union Territories
            </div>
          </div>
        </div>
      </div>

      {/* Target Variable Definition */}
      <div className="hc-card" style={{ marginBottom: '24px', borderLeft: '6px solid #0d9488' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0d9488', textTransform: 'uppercase', marginBottom: '4px' }}>
          Primary Machine Learning Target Variable
        </div>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
          Institutional Births / Deliveries Rate (%) &bull; Indicator #42
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, marginTop: '8px' }}>
          Defined as the percentage of births in the 5 years preceding the survey that took place in a medical institution (either public health facility such as PHC/CHC/District Hospital or accredited private facility). Institutional childbirth is a vital proxy for maternal safety, skilled obstetric care, and reduction of preventable maternal and neonatal mortality.
        </p>
      </div>

      {/* Feature Dictionary Table */}
      <div className="hc-card" style={{ marginBottom: '24px' }}>
        <div className="hc-card-header">
          <div>
            <div className="hc-card-title">
              <Table size={18} color="#0284c7" /> Canonical Feature Dictionary (15 Indicators)
            </div>
            <div className="hc-card-subtitle">
              Carefully chosen maternal care, socioeconomic, and infrastructure predictors
            </div>
          </div>
          <span className="badge badge-teal">Leakage-Free Feature Set</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="hc-table">
            <thead>
              <tr>
                <th>Feature Name</th>
                <th>Domain Category</th>
                <th>Description</th>
                <th>Target Benchmark</th>
              </tr>
            </thead>
            <tbody>
              {CANONICAL_FEATURES.map((f) => (
                <tr key={f.key}>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{f.name}</td>
                  <td><span className="badge badge-blue">{f.cat}</span></td>
                  <td style={{ fontSize: '0.82rem', color: '#475569' }}>{f.desc}</td>
                  <td style={{ fontWeight: 700, color: '#0d9488' }}>{f.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preprocessing & Data Leakage Prevention Protocol */}
      <div className="hc-card">
        <div className="hc-card-header">
          <div>
            <div className="hc-card-title">
              <ShieldCheck size={18} color="#10b981" /> Preprocessing & Data Integrity Protocol
            </div>
            <div className="hc-card-subtitle">
              Methodology preventing data leakage and ensuring academic reproducibility
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              1. Collinearity & Leakage Prevention
            </h4>
            <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.6 }}>
              Direct proxies of delivery setting (e.g., <em>Births attended by skilled health personnel</em> with 0.95 correlation) were intentionally excluded. Features are strictly restricted to prenatal maternal care, household sanitation, and socioeconomic indicators.
            </p>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              2. Hierarchical Imputation Strategy
            </h4>
            <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.6 }}>
              Missing observations are first imputed using State-level medians to preserve regional geographic distribution. Any remaining unmeasured features receive the National median.
            </p>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              3. Reproducible Train-Test Partitioning
            </h4>
            <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.6 }}>
              An 80/20 train-test split with fixed random seed (42) guarantees identical benchmark evaluation. Feature scaling via <code>StandardScaler</code> is fitted exclusively on training data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
