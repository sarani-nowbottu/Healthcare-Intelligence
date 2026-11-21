/**
 * Healthcare Policy Analyzer View
 * AI-Powered Healthcare Policy Intelligence & Prediction System
 */

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  FileText,
  Upload,
  BookOpen,
  CheckCircle,
  FileSearch,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function PolicyAnalyzerPage() {
  const [policies, setPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [summary, setSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const [uploadErr, setUploadErr] = useState('');

  useEffect(() => {
    fetchPolicies();
  }, []);

  async function fetchPolicies() {
    try {
      const data = await api.listPolicies();
      setPolicies(data.policies || []);
      if (data.policies && data.policies.length > 0 && !selectedPolicy) {
        setSelectedPolicy(data.policies[0]);
        loadSummary(data.policies[0].document_name);
      }
    } catch (err) {
      console.error('Error fetching policies:', err);
    }
  }

  async function loadSummary(docName) {
    setLoadingSummary(true);
    setSummary('');
    try {
      const res = await api.getPolicySummary(docName);
      setSummary(res.summary);
    } catch (err) {
      setSummary('Failed to retrieve summary for this document.');
    } finally {
      setLoadingSummary(false);
    }
  }

  const handleSelect = (p) => {
    setSelectedPolicy(p);
    loadSummary(p.document_name);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setUploadErr('Please select a valid PDF policy document.');
      return;
    }

    setUploading(true);
    setUploadMsg('');
    setUploadErr('');

    try {
      const res = await api.uploadPolicy(file);
      setUploadMsg(res.message || 'Policy uploaded and indexed successfully!');
      fetchPolicies();
    } catch (err) {
      setUploadErr(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
          Healthcare Policy Analyzer & Document Intelligence
        </h2>
        <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
          Ingest, inspect, chunk, and summarize official government health scheme documents and guidelines.
        </p>
      </div>

      {/* Upload Banner */}
      <div className="hc-card" style={{ marginBottom: '24px', backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Upload size={18} /> Ingest Custom Healthcare Policy Document (PDF)
            </div>
            <div style={{ fontSize: '0.82rem', color: '#15803d', marginTop: '2px' }}>
              Upload state-specific guidelines or ministry notifications to extract chunks and expand the semantic vector store.
            </div>
          </div>
          <div>
            <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer' }}>
              <Upload size={15} /> Select PDF Document
              <input
                type="file"
                accept=".pdf"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          </div>
        </div>
        {uploadMsg && (
          <div style={{ marginTop: '10px', fontSize: '0.82rem', color: '#166534', fontWeight: 600 }}>
            ✓ {uploadMsg}
          </div>
        )}
        {uploadErr && (
          <div style={{ marginTop: '10px', fontSize: '0.82rem', color: '#b91c1c', fontWeight: 600 }}>
            ✕ {uploadErr}
          </div>
        )}
      </div>

      {/* Main Two Column View: Policy List + Details/Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 380px) 1fr', gap: '24px' }}>
        {/* Left Column: Indexed Policies */}
        <div className="hc-card">
          <div className="hc-card-header">
            <div>
              <div className="hc-card-title">
                <BookOpen size={18} color="#0284c7" /> Indexed Policies ({policies.length})
              </div>
              <div className="hc-card-subtitle">Official policy guidelines in vector index</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {policies.map((p, idx) => {
              const isSelected = selectedPolicy?.document_name === p.document_name;
              return (
                <div
                  key={idx}
                  onClick={() => handleSelect(p)}
                  style={{
                    padding: '14px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: isSelected ? '#0284c7' : '#e2e8f0',
                    backgroundColor: isSelected ? '#f0f9ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <FileText size={20} color={isSelected ? '#0284c7' : '#64748b'} style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: isSelected ? '#0284c7' : '#0f172a' }}>
                        {p.document_title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                        {p.total_pages} page(s) &bull; {p.total_chunks} semantic chunks
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: AI Document Summary & Inspection */}
        <div className="hc-card">
          <div className="hc-card-header">
            <div>
              <div className="hc-card-title">
                <Sparkles size={18} color="#7c3aed" /> AI Policy Summary & Core Entitlements
              </div>
              <div className="hc-card-subtitle">
                {selectedPolicy ? selectedPolicy.document_title : 'Select a policy to view analysis'}
              </div>
            </div>
            {selectedPolicy && (
              <span className="badge badge-teal">
                {selectedPolicy.total_chunks} Chunks Indexed
              </span>
            )}
          </div>

          {loadingSummary ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
              Synthesizing structured executive summary...
            </div>
          ) : (
            <div style={{ lineHeight: 1.7, fontSize: '0.92rem', color: '#334155', whiteSpace: 'pre-line' }}>
              {summary || 'Select a policy from the left panel to inspect its structured summary and eligibility provisions.'}
            </div>
          )}

          <div style={{ marginTop: '28px', paddingTop: '18px', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
              RAG Retrieval Pipeline Integration
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
              This document is segmented into semantic text chunks with page tracking. When questions are submitted to the AI Policy Assistant or when ML predictions flag relevant bottlenecks, the vector store retrieves matching passages to ground answers in verified government provisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
