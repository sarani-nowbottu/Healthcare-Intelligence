/**
 * AI Healthcare Assistant View (RAG-Powered)
 * AI-Powered Healthcare Policy Intelligence & Prediction System
 */

import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import {
  BrainCircuit,
  Send,
  BookOpen,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  ChevronRight,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

const SUGGESTED_QUERIES = [
  "What is PM-JAY and what is the maximum coverage per family?",
  "What is the cash assistance under Janani Suraksha Yojana in Low Performing States?",
  "What are the installment tranches and eligibility under PMMVY?",
  "What are the institutional delivery targets under National Health Policy 2017?",
  "Who is eligible for PM-JAY senior citizen coverage?",
  "Compare the benefits of PM-JAY and JSY for pregnant mothers."
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: (
        "Hello! I am your AI Healthcare Policy Intelligence Assistant. " +
        "You can ask me questions about major Indian government healthcare policies, including Ayushman Bharat PM-JAY, " +
        "Janani Suraksha Yojana (JSY), Pradhan Mantri Matru Vandana Yojana (PMMVY), and the National Health Policy 2017.\n\n" +
        "All answers are grounded in official guidelines and accompanied by verified document and page citations."
      ),
      citations: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => 'sess_' + Math.random().toString(36).substring(2, 9));
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (queryText) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg = {
      id: 'user_' + Date.now(),
      role: 'user',
      text: textToSend,
      citations: []
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const historyContext = messages.map(m => ({ role: m.role, content: m.text }));
      const res = await api.queryAI(textToSend, sessionId, historyContext);

      const aiMsg = {
        id: 'ai_' + Date.now(),
        role: 'assistant',
        text: res.answer,
        citations: res.citations || [],
        confidence: res.confidence,
        source: res.source
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          role: 'assistant',
          text: `An error occurred while retrieving policy guidelines: ${err.message}. Please verify the Python Flask microservice is running.`,
          citations: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ maxWidth: '1200px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BrainCircuit size={24} color="#0284c7" />
          AI Healthcare Policy Assistant (RAG Pipeline)
        </h2>
        <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
          Ask questions in natural English. Answers are strictly synthesized from retrieved official government policy passages.
        </p>
      </div>

      {/* Suggested Query Pills */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
          Recommended Policy Questions
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {SUGGESTED_QUERIES.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="btn btn-outline btn-sm"
              style={{
                fontSize: '0.8rem',
                backgroundColor: '#ffffff',
                borderColor: '#e2e8f0',
                color: '#334155'
              }}
            >
              <HelpCircle size={13} color="#0284c7" />
              <span>{q}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Container */}
      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div key={m.id} className={`chat-bubble ${isUser ? 'chat-user' : 'chat-assistant'}`}>
                <div style={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                  {m.text}
                </div>

                {/* Grounded Document Citations */}
                {m.citations && m.citations.length > 0 && (
                  <div className="citations-box">
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <BookOpen size={12} /> Verified Source Citations ({m.citations.length})
                    </div>
                    {m.citations.map((c, i) => (
                      <div key={i} style={{ marginBottom: '6px', paddingBottom: '6px', borderBottom: i < m.citations.length - 1 ? '1px dashed #e2e8f0' : 'none' }}>
                        <span className="citation-tag">
                          {c.document_title} (Page {c.page_number})
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#475569', fontStyle: 'italic' }}>
                          "{c.snippet}"
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="chat-bubble chat-assistant" style={{ fontStyle: 'italic', color: '#64748b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="#0284c7" />
                <span>Searching policy vector store and generating grounded answer...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="chat-input-row"
        >
          <input
            type="text"
            className="form-control"
            placeholder="Type your healthcare policy question (e.g., 'What are the benefits under PM-JAY for rural families?')..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn btn-primary"
            style={{ padding: '0 24px' }}
          >
            <Send size={16} /> Send
          </button>
        </form>
      </div>

      {/* RAG Academic Methodology Notice */}
      <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#64748b' }}>
        <ShieldCheck size={16} color="#0d9488" />
        <span>
          <strong>Academic GenAI Grounding:</strong> The system extracts text directly from indexed Ministry guidelines. Hallucination guardrails prevent fabricated scheme benefits.
        </span>
      </div>
    </div>
  );
}
