import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Square,
  Volume2,
  Languages,
  Shield,
  ShieldAlert,
  Save,
  Trash2,
  Copy,
  Check,
  Sparkles,
  Send,
  Loader2,
  AlertTriangle,
  BookOpen,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  VoiceAssistantSessionSummary,
  VoiceAssistantTurn,
  SavedConversationSummary
} from '../types';

interface VoiceAssistantProps {
  apiBaseUrl?: string;
}

const SUPPORTED_CONVERSATION_LANGUAGES = [
  { code: 'te', name: 'Telugu (తెలుగు)', category: 'scheduled', script: 'Telugu' },
  { code: 'hi', name: 'Hindi (हिन्दी)', category: 'scheduled', script: 'Devanagari' },
  { code: 'ta', name: 'Tamil (தமிழ்)', category: 'scheduled', script: 'Tamil' },
  { code: 'kn', name: 'Kannada (ಕನ್ನಡ)', category: 'scheduled', script: 'Kannada' },
  { code: 'gon', name: 'Gondi (గోండీ / 𑵶𑶍𑶕𑶛𑶗)', category: 'indigenous_oral', script: 'Oral / Telugu' },
  { code: 'kff', name: 'Koya (కోయ)', category: 'indigenous_oral', script: 'Oral / Telugu' },
  { code: 'sat', name: 'Santhali (ᱥᱟᱱᱛᱟᱲᱤ)', category: 'indigenous_oral', script: 'Ol Chiki' },
  { code: 'lmn', name: 'Lambadi (లంబాడీ)', category: 'indigenous_oral', script: 'Oral / Devanagari' },
  { code: 'en', name: 'English', category: 'global', script: 'Latin' },
  { code: 'es', name: 'Spanish (Español)', category: 'global', script: 'Latin' },
];

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ apiBaseUrl = '' }) => {
  // Session State
  const [session, setSession] = useState<VoiceAssistantSessionSummary | null>(null);
  const [turns, setTurns] = useState<VoiceAssistantTurn[]>([]);
  const [sourceLang, setSourceLang] = useState<string>('te');
  const [targetLang, setTargetLang] = useState<string>('en');
  const [userName, setUserName] = useState<string>('Community Speaker');

  // Input & Recording State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [textInput, setTextInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedTurnId, setCopiedTurnId] = useState<string | null>(null);

  // Saved Conversations & Modal
  const [savedConversations, setSavedConversations] = useState<SavedConversationSummary[]>([]);
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [saveConsent, setSaveConsent] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showSavedList, setShowSavedList] = useState<boolean>(false);

  // Audio Recording Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const turnsEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll turns to bottom
  useEffect(() => {
    turnsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns, isProcessing]);

  // Load saved conversations on mount
  useEffect(() => {
    fetchSavedConversations();
  }, []);

  const fetchSavedConversations = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/voice-assistant/saved`);
      if (res.ok) {
        const data = await res.json();
        setSavedConversations(data.saved_conversations || []);
      }
    } catch {
      // offline or silent fallback
    }
  };

  // Start Voice Assistant Session
  const startSession = async () => {
    setError(null);
    setIsProcessing(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/voice-assistant/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_language: sourceLang,
          target_language: targetLang,
          user_name: userName,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to start session');
      }

      const summary = await res.json();
      setSession(summary);
      setTurns([]);
    } catch (e: any) {
      setError(e.message || 'Failed to initiate session');
    } finally {
      setIsProcessing(false);
    }
  };

  // End / Close Session
  const endSession = async () => {
    if (!session) return;
    try {
      await fetch(`${apiBaseUrl}/api/v1/voice-assistant/sessions/${session.session_id}`, {
        method: 'DELETE',
      });
    } catch {
      // cleanup locally regardless
    }
    setSession(null);
    setTurns([]);
    setIsRecording(false);
    clearInterval(timerIntervalRef.current);
  };

  // Start Microphone Audio Recording
  const startRecording = async () => {
    setError(null);
    if (!session) {
      setError('Please start a conversation session first.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await submitVoiceTurn(audioBlob);
      };

      recorder.start(250);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingDuration(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (e: any) {
      setError(e.name === 'NotAllowedError' ? 'Microphone permission denied.' : 'Microphone unavailable.');
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerIntervalRef.current);
    }
  };

  // Submit Voice Turn (Audio)
  const submitVoiceTurn = async (audioBlob: Blob) => {
    if (!session) return;
    setIsProcessing(true);
    setError(null);

    const formData = new FormData();
    formData.append('audio', audioBlob, 'turn.webm');
    formData.append('override_source_lang', sourceLang);
    formData.append('override_target_lang', targetLang);

    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/voice-assistant/sessions/${session.session_id}/turn`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Voice turn processing failed');
      }

      const data = await res.json();
      setTurns((prev) => [...prev, data.turn]);
      if (session) {
        setSession({
          ...session,
          turn_count: data.session_summary.turn_count,
        });
      }
    } catch (e: any) {
      setError(e.message || 'Error processing audio turn');
    } finally {
      setIsProcessing(false);
    }
  };

  // Submit Text Turn
  const submitTextTurn = async () => {
    if (!session || !textInput.trim()) return;
    setIsProcessing(true);
    setError(null);
    const textToSend = textInput.trim();
    setTextInput('');

    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/voice-assistant/sessions/${session.session_id}/turn-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSend,
          override_source_lang: sourceLang,
          override_target_lang: targetLang,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Turn processing failed');
      }

      const data = await res.json();
      setTurns((prev) => [...prev, data.turn]);
      if (session) {
        setSession({
          ...session,
          turn_count: data.session_summary.turn_count,
        });
      }
    } catch (e: any) {
      setError(e.message || 'Error processing turn');
    } finally {
      setIsProcessing(false);
    }
  };

  // Speech Synthesis (TTS)
  const speakText = (text: string, langCode: string) => {
    if (!('speechSynthesis' in window)) {
      setError('Text-to-speech synthesis is not supported on this browser.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode === 'te' ? 'te-IN' : langCode === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  // Copy text to clipboard
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTurnId(id);
    setTimeout(() => setCopiedTurnId(null), 2000);
  };

  // Save Conversation (OCAP Consent Required)
  const handleSaveConversation = async () => {
    if (!session || !saveConsent) return;
    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/voice-assistant/sessions/${session.session_id}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consent_confirmed: true,
          user_name: userName,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to save conversation');
      }

      setShowSaveModal(false);
      setSaveConsent(false);
      await fetchSavedConversations();
    } catch (e: any) {
      setError(e.message || 'Failed to save conversation');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Saved Conversation
  const handleDeleteSaved = async (id: number) => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/voice-assistant/saved/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSavedConversations((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (e: any) {
      setError('Failed to delete saved conversation');
    }
  };

  return (
    <div className="voice-assistant-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header & Title */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #235347, #0B2B26)',
            padding: '8px',
            borderRadius: '12px',
            border: '1px solid #8EB69B'
          }}>
            <Sparkles size={24} color="#8EB69B" />
          </div>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#DAF1DE', margin: 0 }}>
              Real-Time Multilingual Voice Assistant
            </h2>
            <p style={{ fontSize: '13px', color: 'rgba(218, 241, 222, 0.72)', margin: '4px 0 0 0' }}>
              Conversational speech companion with phonetic transliteration and Indigenous Elder Guardrails.
            </p>
          </div>
        </div>

        {/* Ephemeral Privacy Banner */}
        <div style={{
          background: 'rgba(11, 43, 38, 0.65)',
          border: '1px solid rgba(142, 182, 155, 0.3)',
          borderRadius: '12px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginTop: '12px',
        }}>
          <Shield size={20} color="#8EB69B" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '12px', color: '#DAF1DE', lineHeight: '1.5' }}>
            <span style={{ fontWeight: '700', color: '#8EB69B' }}>🔒 Ephemeral by Default: </span>
            Voice audio turns are processed locally on the server and discarded from memory immediately.
            Conversations are never written to disk or used for training without affirmative OCAP consent.
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '10px',
          padding: '12px 16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#FCA5A5',
          fontSize: '13px',
        }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Session Controls Card */}
      <div className="glass-card" style={{
        background: 'rgba(11, 43, 38, 0.45)',
        border: '1px solid #235347',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
          {/* Source Language */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#8EB69B', marginBottom: '6px' }}>
              🗣️ You Speak (Source)
            </label>
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              disabled={isRecording || isProcessing}
              style={{
                width: '100%',
                background: '#051F20',
                border: '1px solid #235347',
                borderRadius: '8px',
                padding: '10px 12px',
                color: '#DAF1DE',
                fontSize: '13px',
              }}
            >
              {SUPPORTED_CONVERSATION_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name} {l.category === 'indigenous_oral' ? '🛡️ (Oral)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Target Language */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#8EB69B', marginBottom: '6px' }}>
              🎯 Assistant Translates To
            </label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              disabled={isRecording || isProcessing}
              style={{
                width: '100%',
                background: '#051F20',
                border: '1px solid #235347',
                borderRadius: '8px',
                padding: '10px 12px',
                color: '#DAF1DE',
                fontSize: '13px',
              }}
            >
              {SUPPORTED_CONVERSATION_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Contributor Name */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#8EB69B', marginBottom: '6px' }}>
              👤 Speaker Name
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Your name"
              disabled={!!session}
              style={{
                width: '100%',
                background: '#051F20',
                border: '1px solid #235347',
                borderRadius: '8px',
                padding: '10px 12px',
                color: '#DAF1DE',
                fontSize: '13px',
              }}
            />
          </div>

          {/* Session Action Button */}
          <div>
            {!session ? (
              <button
                onClick={startSession}
                disabled={isProcessing}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #8EB69B, #235347)',
                  color: '#051F20',
                  fontWeight: '700',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Mic size={16} />}
                Start Conversation
              </button>
            ) : (
              <button
                onClick={endSession}
                style={{
                  width: '100%',
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.5)',
                  color: '#FCA5A5',
                  fontWeight: '600',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <Square size={16} />
                End Session
              </button>
            )}
          </div>
        </div>

        {/* Active Session Status Bar */}
        {session && (
          <div style={{
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid rgba(142, 182, 155, 0.15)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            fontSize: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{
                background: 'rgba(34, 197, 94, 0.15)',
                color: '#4ADE80',
                padding: '3px 8px',
                borderRadius: '6px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ADE80' }} />
                Session Active ({session.session_id.slice(0, 10)}...)
              </span>
              <span style={{ color: 'rgba(218, 241, 222, 0.7)' }}>
                Turns: {session.turn_count} / {session.max_turns}
              </span>
            </div>

            {turns.length > 0 && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setShowSaveModal(true)}
                  style={{
                    background: 'rgba(142, 182, 155, 0.15)',
                    border: '1px solid #8EB69B',
                    color: '#DAF1DE',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Save size={12} /> Save History
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Conversation Stream */}
      <div style={{
        background: 'rgba(5, 31, 32, 0.6)',
        border: '1px solid #235347',
        borderRadius: '16px',
        padding: '24px',
        minHeight: '360px',
        maxHeight: '560px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        marginBottom: '20px',
      }}>
        {turns.length === 0 && !isProcessing && (
          <div style={{
            margin: 'auto',
            textAlign: 'center',
            color: 'rgba(218, 241, 222, 0.5)',
            padding: '40px 20px',
          }}>
            <Sparkles size={36} color="#8EB69B" style={{ margin: '0 auto 12px auto', opacity: 0.7 }} />
            <p style={{ fontSize: '15px', fontWeight: '600', color: '#DAF1DE', marginBottom: '6px' }}>
              Your Conversation Stream is Ready
            </p>
            <p style={{ fontSize: '13px', maxWidth: '440px', margin: '0 auto' }}>
              Start a session above and click the microphone or type below.
              Oral heritage languages (Gondi, Koya, Santhali) are protected by Elder Guardrails.
            </p>
          </div>
        )}

        {/* Turn Cards */}
        {turns.map((turn, idx) => (
          <div
            key={turn.turn_id}
            style={{
              background: 'rgba(11, 43, 38, 0.5)',
              border: turn.guardrail_triggered
                ? '1px solid rgba(245, 158, 11, 0.5)'
                : '1px solid rgba(142, 182, 155, 0.25)',
              borderRadius: '14px',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* Turn Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: '#8EB69B',
                  background: 'rgba(142, 182, 155, 0.1)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}>
                  Turn {idx + 1}
                </span>
                <span style={{ fontSize: '11px', color: 'rgba(218, 241, 222, 0.5)' }}>
                  {turn.source_language.toUpperCase()} → {turn.target_language.toUpperCase()}
                </span>
                {turn.latency_ms > 0 && (
                  <span style={{ fontSize: '11px', color: '#8EB69B' }}>
                    ⚡ {turn.latency_ms} ms
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => copyToClipboard(turn.original_transcript, `orig_${turn.turn_id}`)}
                  title="Copy transcript"
                  style={{ background: 'transparent', border: 'none', color: '#8EB69B', cursor: 'pointer' }}
                >
                  {copiedTurnId === `orig_${turn.turn_id}` ? <Check size={14} color="#4ADE80" /> : <Copy size={14} />}
                </button>
                <button
                  onClick={() => speakText(turn.translated_text || turn.original_transcript, turn.target_language)}
                  title="Listen (TTS)"
                  style={{ background: 'transparent', border: 'none', color: '#8EB69B', cursor: 'pointer' }}
                >
                  <Volume2 size={14} />
                </button>
              </div>
            </div>

            {/* User Speech Section */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#8EB69B', marginBottom: '4px' }}>
                Original Speech:
              </div>
              <div style={{ fontSize: '16px', fontWeight: '500', color: '#FFFFFF', lineHeight: '1.4' }}>
                {turn.original_transcript}
              </div>
            </div>

            {/* Pronunciation & Transliteration Helper */}
            {turn.transliteration && turn.transliteration !== turn.original_transcript && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '12px',
              }}>
                <span style={{ color: '#8EB69B', fontWeight: '600', marginRight: '6px' }}>
                  Phonetic:
                </span>
                <span style={{ fontStyle: 'italic', color: '#DAF1DE' }}>
                  {turn.transliteration}
                </span>
              </div>
            )}

            {/* Translated Output / Elder Guardrail Notice */}
            <div style={{
              background: turn.guardrail_triggered ? 'rgba(245, 158, 11, 0.1)' : 'rgba(35, 83, 71, 0.25)',
              borderLeft: turn.guardrail_triggered ? '3px solid #F59E0B' : '3px solid #8EB69B',
              padding: '10px 14px',
              borderRadius: '0 8px 8px 0',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                {turn.guardrail_triggered ? (
                  <ShieldAlert size={14} color="#F59E0B" />
                ) : (
                  <Languages size={14} color="#8EB69B" />
                )}
                <span style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: turn.guardrail_triggered ? '#F59E0B' : '#8EB69B',
                }}>
                  {turn.guardrail_triggered ? 'Indigenous Oral Guardrail Active' : 'Conversational Translation'}
                </span>
              </div>
              <div style={{ fontSize: '14px', color: '#DAF1DE', lineHeight: '1.5' }}>
                {turn.translated_text}
              </div>
            </div>

            {/* Pronunciation Guidance Tips (Accordion / Chips) */}
            {turn.pronunciation_guidance?.syllables_breakdown && turn.pronunciation_guidance.syllables_breakdown.length > 0 && (
              <div style={{ fontSize: '11px', color: 'rgba(218, 241, 222, 0.7)', marginTop: '4px' }}>
                <span style={{ fontWeight: '600', color: '#8EB69B' }}>Syllable Rhythm: </span>
                {turn.pronunciation_guidance.syllables_breakdown.map((s, sIdx) => (
                  <span
                    key={sIdx}
                    style={{
                      display: 'inline-block',
                      background: 'rgba(142, 182, 155, 0.12)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      marginRight: '6px',
                    }}
                  >
                    {s.phonetic_hint} ({s.syllable_count})
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}

        {isProcessing && (
          <div style={{
            background: 'rgba(11, 43, 38, 0.4)',
            padding: '14px 20px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#8EB69B',
            fontSize: '13px',
          }}>
            <Loader2 size={18} className="animate-spin" />
            <span>Processing voice turn with local Whisper & translation guardrails...</span>
          </div>
        )}

        <div ref={turnsEndRef} />
      </div>

      {/* Input Bar (Microphone & Text) */}
      <div className="glass-card" style={{
        background: 'rgba(11, 43, 38, 0.6)',
        border: '1px solid #235347',
        borderRadius: '16px',
        padding: '16px 20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Push-to-Talk Recording Button */}
          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={!session || isProcessing}
              title="Click to Record Audio"
              style={{
                background: !session ? 'rgba(142, 182, 155, 0.2)' : 'linear-gradient(135deg, #EF4444, #B91C1C)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '50%',
                width: '46px',
                height: '46px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: !session || isProcessing ? 'not-allowed' : 'pointer',
                flexShrink: 0,
                boxShadow: isRecording ? '0 0 15px rgba(239, 68, 68, 0.6)' : 'none',
              }}
            >
              <Mic size={20} />
            </button>
          ) : (
            <button
              onClick={stopRecording}
              title="Stop Recording"
              style={{
                background: '#EF4444',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '50%',
                width: '46px',
                height: '46px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                animation: 'pulse 1.5s infinite',
              }}
            >
              <Square size={20} />
            </button>
          )}

          {isRecording ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                color: '#EF4444',
                fontWeight: '700',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }} />
                Recording Voice... ({recordingDuration}s)
              </span>
              <span style={{ fontSize: '12px', color: 'rgba(218, 241, 222, 0.6)' }}>
                Click square button to stop and process
              </span>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitTextTurn()}
                placeholder={session ? "Or type a conversational phrase..." : "Start a session above to begin..."}
                disabled={!session || isProcessing}
                style={{
                  flex: 1,
                  background: '#051F20',
                  border: '1px solid #235347',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  color: '#DAF1DE',
                  fontSize: '13px',
                }}
              />
              <button
                onClick={submitTextTurn}
                disabled={!session || !textInput.trim() || isProcessing}
                style={{
                  background: '#235347',
                  color: '#DAF1DE',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0 16px',
                  cursor: !session || !textInput.trim() ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Send size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Saved Conversations Drawer / History */}
      <div style={{ marginTop: '24px' }}>
        <button
          onClick={() => setShowSavedList(!showSavedList)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#8EB69B',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <BookOpen size={16} />
          {showSavedList ? 'Hide Saved Conversations' : `View Saved Conversations (${savedConversations.length})`}
          {showSavedList ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showSavedList && (
          <div style={{
            marginTop: '12px',
            background: 'rgba(11, 43, 38, 0.45)',
            border: '1px solid #235347',
            borderRadius: '12px',
            padding: '16px',
          }}>
            {savedConversations.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'rgba(218, 241, 222, 0.6)', margin: 0 }}>
                No saved conversations yet. Conversations are ephemeral unless explicitly saved with consent.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {savedConversations.map((conv) => (
                  <div
                    key={conv.id}
                    style={{
                      background: 'rgba(5, 31, 32, 0.5)',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: '700', color: '#DAF1DE', marginRight: '8px' }}>
                        {conv.user_name}
                      </span>
                      <span style={{ color: '#8EB69B', marginRight: '8px' }}>
                        ({conv.source_language.toUpperCase()} → {conv.target_language.toUpperCase()})
                      </span>
                      <span style={{ color: 'rgba(218, 241, 222, 0.5)' }}>
                        {conv.turn_count} turns • {new Date(conv.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteSaved(conv.id)}
                      title="Delete permanently"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#F87171',
                        cursor: 'pointer',
                        padding: '4px',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* OCAP Consent Save Modal */}
      {showSaveModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(5, 31, 32, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px',
        }}>
          <div style={{
            background: '#0B2B26',
            border: '1px solid #8EB69B',
            borderRadius: '16px',
            maxWidth: '480px',
            width: '100%',
            padding: '24px',
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#DAF1DE', marginTop: 0 }}>
              Save Conversation History (OCAP Consent)
            </h3>
            <p style={{ fontSize: '13px', color: 'rgba(218, 241, 222, 0.8)', lineHeight: '1.5' }}>
              Under Indigenous Data Sovereignty protocols (OCAP), conversation transcripts are never saved by default.
              Saving stores this session's transcripts in SQLite attributed to you. You retain full rights to delete it at any time.
            </p>

            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              fontSize: '12px',
              color: '#DAF1DE',
              margin: '16px 0',
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={saveConsent}
                onChange={(e) => setSaveConsent(e.target.checked)}
                style={{ marginTop: '2px' }}
              />
              <span>
                I affirmatively consent to saving this {turns.length}-turn conversation transcript into the local SQLite archive.
              </span>
            </label>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowSaveModal(false)}
                disabled={isSaving}
                style={{
                  background: 'transparent',
                  border: '1px solid #235347',
                  color: '#DAF1DE',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConversation}
                disabled={!saveConsent || isSaving}
                style={{
                  background: !saveConsent ? 'rgba(142, 182, 155, 0.3)' : '#8EB69B',
                  color: '#051F20',
                  fontWeight: '700',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  cursor: !saveConsent || isSaving ? 'not-allowed' : 'pointer',
                }}
              >
                {isSaving ? 'Saving...' : 'Confirm & Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
