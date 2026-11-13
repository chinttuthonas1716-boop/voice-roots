import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  BookOpen,
  Volume2,
  ShieldCheck,
  ShieldAlert,
  Send,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  X,
  Compass,
  Mic,
} from 'lucide-react';
import {
  AuthUser,
  GroundedAssistantResponse,
  CitationPillData,
  AssistantSuggestion,
  AssistantRagStats,
} from '../../types';
import { VoiceAssistant } from '../../components/VoiceAssistant';

interface GroundedAssistantProps {
  apiBaseUrl?: string;
  authToken?: string | null;
  currentUser?: AuthUser | null;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  ragResponse?: GroundedAssistantResponse;
}

export const GroundedAssistant: React.FC<GroundedAssistantProps> = ({
  apiBaseUrl = '',
  authToken = null,
  currentUser = null,
}) => {
  // --- View Mode: Grounded RAG vs Live Conversational Turns ---
  const [activeMode, setActiveMode] = useState<'rag' | 'voice_turn'>('rag');

  // --- RAG Chat State ---
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome_1',
      sender: 'assistant',
      text: 'Greetings. I am the **Voice Roots Grounded AI Assistant**.\n\nAll my answers are retrieved strictly from community-verified recordings, oral histories, and elder-approved multilingual dictionaries for **Gondi**, **Koya**, **Santhali**, and **Lambadi**.\n\nEvery response includes **clickable citation pills** referencing original master recordings, with a strict epistemic guardrail separating verified community testimony from AI hypotheses.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Suggestions & Telemetry
  const [suggestions, setSuggestions] = useState<AssistantSuggestion[]>([]);
  const [ragStats, setRagStats] = useState<AssistantRagStats | null>(null);

  // Citation Inspector Modal
  const [selectedCitation, setSelectedCitation] = useState<CitationPillData | null>(null);

  // Audio Playback simulation / speech synthesis
  const [activeSpeakingId, setActiveSpeakingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Fetch suggestions and telemetry on mount
  useEffect(() => {
    fetchSuggestions();
    fetchStats();
  }, [apiBaseUrl]);

  const fetchSuggestions = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/assistant/suggestions`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (e) {
      console.error('Failed to load assistant suggestions:', e);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/assistant/rag-stats`);
      if (res.ok) {
        const data = await res.json();
        setRagStats(data);
      }
    } catch (e) {
      console.error('Failed to load RAG telemetry:', e);
    }
  };

  const handleSendQuery = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q || isLoading) return;

    setInputQuery('');
    setError(null);

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const res = await fetch(`${apiBaseUrl}/api/v1/assistant/query`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query: q,
          filter_language: languageFilter !== 'all' ? languageFilter : undefined,
          max_citations: 5,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Query processing failed.`);
      }

      const ragData: GroundedAssistantResponse = await res.json();

      const assistantMsg: ChatMessage = {
        id: `asst_${Date.now()}`,
        sender: 'assistant',
        text: ragData.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ragResponse: ragData,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('RAG query error:', err);
      setError(err.message || 'Unable to retrieve answer from verified archives.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeakText = (text: string, id: string) => {
    if (activeSpeakingId === id) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setActiveSpeakingId(null);
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Strip markdown bold / links
      const plain = text.replace(/[*#_`\[\]]/g, '');
      const utterance = new SpeechSynthesisUtterance(plain);
      utterance.rate = 0.9;
      utterance.onend = () => setActiveSpeakingId(null);
      utterance.onerror = () => setActiveSpeakingId(null);
      setActiveSpeakingId(id);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* ─── Mode Switcher Header ─── */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(16, 43, 32, 0.95), rgba(22, 59, 44, 0.95))',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          border: '1px solid #1F5138',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(166, 196, 138, 0.15)', border: '1px solid #A6C48A', padding: '0.25rem 0.75rem', borderRadius: '9999px', color: '#F5F3E9', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              <Sparkles size={14} color="#A6C48A" />
              <span>Module 3 · Grounded Linguistic Intelligence & Archive RAG</span>
            </div>
            <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#F5F3E9', margin: '0 0 0.4rem 0', letterSpacing: '-0.02em' }}>
              Voice Roots AI Assistant
            </h1>
            <p style={{ color: 'rgba(245, 243, 233, 0.75)', maxWidth: '720px', margin: 0, fontSize: '0.92rem', lineHeight: 1.5 }}>
              Answers are retrieved offline over verified community recordings and elder-approved lexicons with clickable citation pills and strict epistemic demarcation ($0.00 cloud API spend).
            </p>
          </div>

          {/* Mode Toggle Buttons */}
          <div style={{ display: 'inline-flex', background: 'rgba(0,0,0,0.3)', padding: '0.35rem', borderRadius: '12px', border: '1px solid #1F5138' }}>
            <button
              onClick={() => setActiveMode('rag')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.6rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: activeMode === 'rag' ? '#A6C48A' : 'transparent',
                color: activeMode === 'rag' ? '#102B20' : 'rgba(245, 243, 233, 0.75)',
                fontWeight: activeMode === 'rag' ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <BookOpen size={15} />
              <span>Archive RAG (Grounded Q&A)</span>
            </button>
            <button
              onClick={() => setActiveMode('voice_turn')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.6rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: activeMode === 'voice_turn' ? '#A6C48A' : 'transparent',
                color: activeMode === 'voice_turn' ? '#102B20' : 'rgba(245, 243, 233, 0.75)',
                fontWeight: activeMode === 'voice_turn' ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Mic size={15} />
              <span>Live Voice & Translation</span>
            </button>
          </div>
        </div>

        {/* Telemetry Bar (RAG Mode) */}
        {activeMode === 'rag' && ragStats && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '0.75rem',
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid rgba(166, 196, 138, 0.15)',
            }}
          >
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(166, 196, 138, 0.1)' }}>
              <div style={{ fontSize: '0.7rem', color: 'rgba(245, 243, 233, 0.6)', textTransform: 'uppercase', fontWeight: 600 }}>Vector Index Records</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#F5F3E9' }}>{ragStats.total_vector_records} vectors</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(166, 196, 138, 0.1)' }}>
              <div style={{ fontSize: '0.7rem', color: 'rgba(245, 243, 233, 0.6)', textTransform: 'uppercase', fontWeight: 600 }}>Cloud API Spend</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#A6C48A' }}>{ragStats.cloud_spend} (Offline)</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(166, 196, 138, 0.1)' }}>
              <div style={{ fontSize: '0.7rem', color: 'rgba(245, 243, 233, 0.6)', textTransform: 'uppercase', fontWeight: 600 }}>Verified Lexicon Terms</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#F5F3E9' }}>{ragStats.database_counts.approved_dictionary_entries} entries</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(166, 196, 138, 0.1)' }}>
              <div style={{ fontSize: '0.7rem', color: 'rgba(245, 243, 233, 0.6)', textTransform: 'uppercase', fontWeight: 600 }}>Oral Histories & Lore</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#F5F3E9' }}>{ragStats.database_counts.approved_cultural_stories} stories</div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Mode 2: Live Conversational Voice Turns ─── */}
      {activeMode === 'voice_turn' && (
        <div>
          <VoiceAssistant apiBaseUrl={apiBaseUrl} />
        </div>
      )}

      {/* ─── Mode 1: Grounded Archive RAG Assistant ─── */}
      {activeMode === 'rag' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Curated Suggestion Chips */}
          {suggestions.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#A6C48A', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <Compass size={13} />
                <span>Explore:</span>
              </span>
              {suggestions.slice(0, 4).map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendQuery(s.query)}
                  style={{
                    background: 'rgba(16, 43, 32, 0.7)',
                    border: '1px solid #1F5138',
                    color: '#F5F3E9',
                    borderRadius: '20px',
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#A6C48A')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1F5138')}
                >
                  <span style={{ color: '#A6C48A', fontWeight: 700 }}>{s.language}:</span>
                  <span>{s.query.length > 55 ? `${s.query.substring(0, 52)}...` : s.query}</span>
                </button>
              ))}
            </div>
          )}

          {/* Chat Messages Container */}
          <div
            style={{
              background: 'rgba(16, 43, 32, 0.6)',
              backdropFilter: 'blur(10px)',
              border: '1px solid #1F5138',
              borderRadius: '16px',
              padding: '1.5rem',
              minHeight: '440px',
              maxHeight: '620px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  gap: '0.4rem',
                }}
              >
                {/* Sender badge & timestamp */}
                <div style={{ fontSize: '0.72rem', color: 'rgba(245, 243, 233, 0.55)', display: 'flex', gap: '0.5rem' }}>
                  <span>{msg.sender === 'user' ? (currentUser?.full_name || 'You') : 'Voice Roots AI Assistant'}</span>
                  <span>·</span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Message Bubble */}
                <div
                  style={{
                    maxWidth: '85%',
                    background:
                      msg.sender === 'user'
                        ? 'linear-gradient(135deg, #163B2C, #1F5138)'
                        : 'rgba(2, 20, 16, 0.85)',
                    border: msg.sender === 'user' ? '1px solid #A6C48A' : '1px solid #1F5138',
                    borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    padding: '1.2rem',
                    color: '#F5F3E9',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                  }}
                >
                  {/* Message Body */}
                  <div style={{ fontSize: '0.92rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {msg.text}
                  </div>

                  {/* Grounded RAG Metadata: Citations & Epistemic Guardrail */}
                  {msg.ragResponse && (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(166, 196, 138, 0.15)' }}>
                      {/* Epistemic Demarcation Box */}
                      <div
                        style={{
                          background:
                            msg.ragResponse.epistemic_status === 'VERIFIED_ARCHIVE_GROUNDED'
                              ? 'rgba(34, 197, 94, 0.1)'
                              : msg.ragResponse.epistemic_status === 'PARTIALLY_GROUNDED'
                              ? 'rgba(234, 179, 8, 0.1)'
                              : 'rgba(239, 68, 68, 0.1)',
                          border:
                            msg.ragResponse.epistemic_status === 'VERIFIED_ARCHIVE_GROUNDED'
                              ? '1px solid rgba(34, 197, 94, 0.3)'
                              : msg.ragResponse.epistemic_status === 'PARTIALLY_GROUNDED'
                              ? '1px solid rgba(234, 179, 8, 0.3)'
                              : '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '8px',
                          padding: '0.75rem',
                          marginBottom: '0.85rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                          {msg.ragResponse.epistemic_status === 'VERIFIED_ARCHIVE_GROUNDED' ? (
                            <ShieldCheck size={16} color="#4ade80" />
                          ) : msg.ragResponse.epistemic_status === 'PARTIALLY_GROUNDED' ? (
                            <Compass size={16} color="#facc15" />
                          ) : (
                            <ShieldAlert size={16} color="#f87171" />
                          )}
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              color:
                                msg.ragResponse.epistemic_status === 'VERIFIED_ARCHIVE_GROUNDED'
                                  ? '#4ade80'
                                  : msg.ragResponse.epistemic_status === 'PARTIALLY_GROUNDED'
                                  ? '#facc15'
                                  : '#f87171',
                            }}
                          >
                            Epistemic Status: {msg.ragResponse.epistemic_status.replace(/_/g, ' ')}
                          </span>
                        </div>

                        {/* Verified Knowledge vs AI Hypothesis Breakdown */}
                        {msg.ragResponse.verified_knowledge?.length > 0 && (
                          <div style={{ fontSize: '0.8rem', color: '#F5F3E9', marginBottom: '0.4rem' }}>
                            <strong style={{ color: '#A6C48A' }}>Verified Community Lore: </strong>
                            {msg.ragResponse.verified_knowledge.map((vk, i) => (
                              <div key={i} style={{ marginTop: '0.2rem', paddingLeft: '0.5rem' }}>
                                • {vk}
                              </div>
                            ))}
                          </div>
                        )}

                        {msg.ragResponse.ai_hypothesis?.length > 0 && (
                          <div style={{ fontSize: '0.78rem', color: 'rgba(245, 243, 233, 0.8)' }}>
                            <strong style={{ color: '#facc15' }}>AI Linguistic Hypothesis: </strong>
                            {msg.ragResponse.ai_hypothesis.map((ah, i) => (
                              <div key={i} style={{ marginTop: '0.2rem', paddingLeft: '0.5rem' }}>
                                ~ {ah}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Clickable Citation Pills */}
                      {msg.ragResponse.citations && msg.ragResponse.citations.length > 0 && (
                        <div>
                          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: '#A6C48A', marginBottom: '0.4rem' }}>
                            Attested Source Citations (Click to Inspect):
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                            {msg.ragResponse.citations.map((cite) => (
                              <button
                                key={cite.citation_id}
                                onClick={() => setSelectedCitation(cite)}
                                style={{
                                  background: 'rgba(166, 196, 138, 0.15)',
                                  border: '1px solid #A6C48A',
                                  color: '#F5F3E9',
                                  borderRadius: '6px',
                                  padding: '0.25rem 0.55rem',
                                  fontSize: '0.72rem',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  transition: 'all 0.15s ease',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = '#A6C48A', e.currentTarget.style.color = '#102B20')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(166, 196, 138, 0.15)', e.currentTarget.style.color = '#F5F3E9')}
                              >
                                <strong style={{ color: 'inherit' }}>[{cite.citation_id}]</strong>
                                <span>{cite.title}</span>
                                <ExternalLink size={10} />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bubble Action Bar: Copy & Speak */}
                  {msg.sender === 'assistant' && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleCopyText(msg.text, msg.id)}
                        title="Copy answer"
                        style={{ background: 'transparent', border: 'none', color: '#A6C48A', cursor: 'pointer', padding: '0.2rem' }}
                      >
                        {copiedId === msg.id ? <Check size={14} color="#4ade80" /> : <Copy size={14} />}
                      </button>
                      <button
                        onClick={() => handleSpeakText(msg.text, msg.id)}
                        title="Read aloud (TTS)"
                        style={{ background: 'transparent', border: 'none', color: activeSpeakingId === msg.id ? '#4ade80' : '#A6C48A', cursor: 'pointer', padding: '0.2rem' }}
                      >
                        <Volume2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#A6C48A', fontSize: '0.85rem' }}>
                <Loader2 size={16} className="animate-spin" />
                <span>Searching ChromaDB vector store & verified community archives...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Error Banner */}
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '8px', padding: '0.75rem', color: '#fca5a5', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          {/* ─── Query Input & Filter Toolbar ─── */}
          <div
            style={{
              background: 'rgba(16, 43, 32, 0.85)',
              border: '1px solid #1F5138',
              borderRadius: '14px',
              padding: '0.75rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendQuery();
                  }
                }}
                placeholder="Ask about Gondi Persapen, Koya Koitur, Santhal Sarjom, Lambadi Tanda, rituals, or vocabulary..."
                style={{
                  flex: 1,
                  background: 'rgba(2, 20, 16, 0.7)',
                  border: '1px solid #1F5138',
                  borderRadius: '10px',
                  padding: '0.85rem 1rem',
                  color: '#F5F3E9',
                  fontSize: '0.92rem',
                  outline: 'none',
                }}
              />

              <button
                onClick={() => handleSendQuery()}
                disabled={isLoading || !inputQuery.trim()}
                style={{
                  background: '#A6C48A',
                  color: '#102B20',
                  fontWeight: 700,
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.85rem 1.4rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  opacity: isLoading || !inputQuery.trim() ? 0.5 : 1,
                }}
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                <span>Ask</span>
              </button>
            </div>

            {/* Language Filter Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: 'rgba(245, 243, 233, 0.6)', fontWeight: 600 }}>Filter Language:</span>
              {[
                { code: 'all', label: 'All Tongues' },
                { code: 'Gondi', label: 'Gondi' },
                { code: 'Koya', label: 'Koya' },
                { code: 'Santhali', label: 'Santhali' },
                { code: 'Lambadi', label: 'Lambadi' },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguageFilter(lang.code)}
                  style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: languageFilter === lang.code ? 700 : 500,
                    border: languageFilter === lang.code ? '1px solid #A6C48A' : '1px solid rgba(166, 196, 138, 0.2)',
                    background: languageFilter === lang.code ? 'rgba(166, 196, 138, 0.2)' : 'transparent',
                    color: languageFilter === lang.code ? '#F5F3E9' : 'rgba(245, 243, 233, 0.65)',
                    cursor: 'pointer',
                  }}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Source Citation Detail Modal ─── */}
      {selectedCitation && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setSelectedCitation(null)}
        >
          <div
            style={{
              background: '#102B20',
              border: '1px solid #1F5138',
              borderRadius: '16px',
              maxWidth: '620px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              color: '#F5F3E9',
              boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#A6C48A', textTransform: 'uppercase' }}>
                  Citation [{selectedCitation.citation_id}] · {selectedCitation.source_type.replace('_', ' ')}
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F5F3E9', margin: '0.25rem 0 0 0' }}>
                  {selectedCitation.title}
                </h2>
                <div style={{ fontSize: '0.85rem', color: 'rgba(245, 243, 233, 0.75)', marginTop: '0.25rem' }}>
                  Language: <strong>{selectedCitation.language}</strong> {selectedCitation.dialect && `(${selectedCitation.dialect})`}
                </div>
              </div>
              <button
                onClick={() => setSelectedCitation(null)}
                style={{ background: 'transparent', border: 'none', color: '#F5F3E9', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Archive Excerpt */}
            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(166, 196, 138, 0.15)', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#A6C48A', fontWeight: 700, marginBottom: '0.4rem' }}>
                Attested Archive Excerpt
              </div>
              <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.6, color: '#F5F3E9' }}>
                {selectedCitation.excerpt}
              </p>
            </div>

            {/* Provenance & Custodianship */}
            <div style={{ fontSize: '0.82rem', color: 'rgba(245, 243, 233, 0.8)', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.25rem' }}>
              <div>
                <strong style={{ color: '#A6C48A' }}>Attribution:</strong> {selectedCitation.attribution}
              </div>
              <div>
                <strong style={{ color: '#A6C48A' }}>Access Classification:</strong> {selectedCitation.access_classification}
              </div>
              <div>
                <strong style={{ color: '#A6C48A' }}>Sovereignty:</strong> Consented community archive (OCAP compliant).
              </div>
            </div>

            {/* Audio Playback reference */}
            {selectedCitation.audio_url && (
              <div style={{ background: 'rgba(166, 196, 138, 0.1)', padding: '0.75rem', borderRadius: '8px', border: '1px solid #A6C48A', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.82rem', color: '#F5F3E9' }}>Oral Recording Snippet Available</span>
                <button
                  onClick={() => handleSpeakText(selectedCitation.excerpt, selectedCitation.citation_id)}
                  style={{
                    background: '#A6C48A',
                    color: '#102B20',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <Volume2 size={13} />
                  <span>Listen</span>
                </button>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedCitation(null)}
                style={{ padding: '0.55rem 1.25rem', borderRadius: '8px', border: '1px solid #1F5138', background: 'transparent', color: '#F5F3E9', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroundedAssistant;
