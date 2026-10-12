import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  Square, 
  Upload, 
  Trash2, 
  Edit3, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  Languages, 
  Volume2, 
  FileAudio, 
  RefreshCw, 
  Info,
  ShieldCheck,
  Cpu,
  RotateCcw,
  Sparkles,
  Loader2,
  ExternalLink
} from 'lucide-react';

interface Language {
  code: string;
  name: string;
  native: string;
  category: string;
}

interface Transcript {
  id: number;
  uuid_id: string;
  title: string;
  audio_filename: string;
  audio_url: string;
  language: string;
  dialect: string | null;
  transcript_text: string;
  machine_transcript_text?: string | null;
  transcription_status?: 'not_requested' | 'queued' | 'processing' | 'completed' | 'not_configured' | 'failed' | string;
  transcription_error?: string | null;
  transcription_provider?: string | null;
  transcription_model?: string | null;
  transcription_consent_at?: string | null;
  transcribed_at?: string | null;
  transcription_consent_version?: string | null;
  status: string;
  duration_seconds?: number;
  audio_sha256?: string;
  file_size_bytes?: number;
  consent_at?: string | null;
  consent_version?: string | null;
  created_at: string;
  updated_at: string;
}

interface ApiHealth {
  status: string;
  app: string;
  version: string;
  database: string;
  database_status: string;
  storage_path?: string;
}

const DEFAULT_LANGUAGES: Language[] = [
  { code: 'gondi', name: 'Gondi', native: 'గోండీ', category: 'Indigenous / Tribal' },
  { code: 'koya', name: 'Koya', native: 'కోయ', category: 'Indigenous / Tribal' },
  { code: 'sat', name: 'Santhali', native: 'ᱥᱟᱱᱛᱟᱲᱤ', category: 'Scheduled' },
  { code: 'lam', name: 'Lambadi', native: 'లంబాడీ', category: 'Indigenous / Tribal' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', category: 'Scheduled' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', category: 'Scheduled' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', category: 'Scheduled' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', category: 'Scheduled' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', category: 'Scheduled' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', category: 'Scheduled' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', category: 'Scheduled' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', category: 'Scheduled' },
  { code: 'en', name: 'English', native: 'English', category: 'Official' },
];

export function App() {
  // Backend Connection State
  const [health, setHealth] = useState<ApiHealth | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);

  // Form State
  const [mode, setMode] = useState<'record' | 'upload'>('record');
  const [title, setTitle] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('Gondi');
  const [dialect, setDialect] = useState('');
  const [hasConsent, setHasConsent] = useState(false);
  const [wantsTranscriptionConsent, setWantsTranscriptionConsent] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileAudioUrl, setFileAudioUrl] = useState<string | null>(null);

  // Processing & Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Active / Workspace Result State
  const [activeResult, setActiveResult] = useState<Transcript | null>(null);
  const [activeResultText, setActiveResultText] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [transcribingId, setTranscribingId] = useState<number | null>(null);
  const [transcribeActionError, setTranscribeActionError] = useState<string | null>(null);

  // Transcripts Archive List
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [isLoadingArchive, setIsLoadingArchive] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  // Check Backend Health
  const checkHealth = async () => {
    try {
      const res = await fetch('/health');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ApiHealth = await res.json();
      setHealth(data);
      setHealthError(null);
    } catch {
      try {
        const direct = await fetch('http://127.0.0.1:8000/health');
        if (!direct.ok) throw new Error(`HTTP ${direct.status}`);
        const data: ApiHealth = await direct.json();
        setHealth(data);
        setHealthError(null);
      } catch (err: any) {
        setHealth(null);
        setHealthError(err.message || 'Cannot reach FastAPI backend');
      }
    }
  };

  // Fetch Transcripts from SQLite
  const fetchTranscripts = async () => {
    setIsLoadingArchive(true);
    try {
      const res = await fetch('/api/transcripts');
      if (res.ok) {
        const data = await res.json();
        setTranscripts(data.transcripts || []);
      }
    } catch {
      try {
        const direct = await fetch('http://127.0.0.1:8000/api/transcripts');
        if (direct.ok) {
          const data = await direct.json();
          setTranscripts(data.transcripts || []);
        }
      } catch {
        // Ignored in offline preview mode
      }
    } finally {
      setIsLoadingArchive(false);
    }
  };

  // Poll single transcript status until completion or failure
  const pollTranscript = async (id: number) => {
    try {
      const res = await fetch(`/api/transcripts/${id}`);
      if (!res.ok) return;
      const updated: Transcript = await res.json();

      // Update active result if it matches
      setActiveResult((current) => {
        if (current && current.id === id) {
          // If machine transcript completed and user hasn't edited yet, sync editable text
          if (
            updated.transcription_status === 'completed' &&
            (!current.transcript_text || current.status !== 'Community Edited')
          ) {
            setActiveResultText(updated.transcript_text || updated.machine_transcript_text || '');
          }
          return updated;
        }
        return current;
      });

      // Update archive list
      setTranscripts((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
    } catch {
      // Ignore transient polling fetch error
    }
  };

  // Polling loop for any active transcription jobs in 'queued' or 'processing'
  useEffect(() => {
    const activeIsPending =
      activeResult &&
      (activeResult.transcription_status === 'queued' || activeResult.transcription_status === 'processing');

    const hasPendingInList = transcripts.some(
      (t) => t.transcription_status === 'queued' || t.transcription_status === 'processing'
    );

    if (!activeIsPending && !hasPendingInList) return;

    const interval = setInterval(() => {
      if (activeResult && (activeResult.transcription_status === 'queued' || activeResult.transcription_status === 'processing')) {
        pollTranscript(activeResult.id);
      }
      transcripts
        .filter((t) => t.transcription_status === 'queued' || t.transcription_status === 'processing')
        .forEach((t) => {
          if (t.id !== activeResult?.id) {
            pollTranscript(t.id);
          }
        });
    }, 2000);

    return () => clearInterval(interval);
  }, [activeResult?.id, activeResult?.transcription_status, transcripts]);

  useEffect(() => {
    checkHealth();
    fetchTranscripts();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  // Recording Controls
  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setRecordedBlob(audioBlob);
        setRecordedAudioUrl(URL.createObjectURL(audioBlob));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setSubmitError(null);

      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      setSubmitError('Microphone access denied or unavailable: ' + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileAudioUrl(URL.createObjectURL(file));
      setSubmitError(null);
    }
  };

  // Submit Recording to FastAPI Backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);
    setTranscribeActionError(null);

    const audioToUpload = mode === 'record' ? recordedBlob : selectedFile;
    if (!audioToUpload) {
      setSubmitError('Please record audio or select an audio file first.');
      return;
    }

    if (!title.trim()) {
      setSubmitError('Please provide a descriptive title for this recording.');
      return;
    }

    if (!hasConsent) {
      setSubmitError('Speaker consent is strictly mandatory under Indigenous Ethical Protocols before archiving any audio.');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    const formData = new FormData();
    const fileName = mode === 'record' ? 'recording.wav' : (selectedFile?.name || 'audio.wav');
    formData.append('file', audioToUpload, fileName);
    formData.append('title', title.trim());
    formData.append('language', selectedLanguage);
    formData.append('dialect', dialect.trim());

    // Submit affirmative archive consent fields (string and boolean compatible)
    formData.append('consent', 'true');
    formData.append('consent_given', 'true');
    formData.append('consentSpeaker', 'true');

    // Separate opt-in consent for automated AI speech transcription
    if (wantsTranscriptionConsent) {
      formData.append('transcription_consent', 'true');
    }

    const endpoint = '/api/upload';
    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
      }
    };

    xhr.onload = () => {
      setIsSubmitting(false);
      setUploadProgress(null);

      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data: Transcript = JSON.parse(xhr.responseText);
          const noticeMsg = data.transcription_status === 'queued'
            ? 'Oral audio master preserved safely! AI transcription queued in background.'
            : 'Oral audio master preserved safely in immutable storage (AI transcription not requested).';
          setSubmitSuccess(noticeMsg);
          setActiveResult(data);
          setActiveResultText(data.transcript_text || '');
          
          // Clear inputs and reset recording state
          setTitle('');
          setDialect('');
          setHasConsent(false);
          setRecordedBlob(null);
          setRecordedAudioUrl(null);
          setSelectedFile(null);
          setFileAudioUrl(null);

          // Refresh archive
          fetchTranscripts();
        } catch {
          setSubmitSuccess('Audio master uploaded successfully!');
        }
      } else {
        let errorMsg = `Upload failed with status HTTP ${xhr.status}`;
        try {
          const errData = JSON.parse(xhr.responseText);
          if (errData.detail) {
            errorMsg = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
          } else if (errData.error) {
            errorMsg = errData.error;
          }
        } catch {
          // fallback to default error message
        }
        setSubmitError(errorMsg);
      }
    };

    xhr.onerror = () => {
      setIsSubmitting(false);
      setUploadProgress(null);
      setSubmitError('Network error connecting to backend API at ' + endpoint);
    };

    xhr.open('POST', endpoint);
    xhr.send(formData);
  };

  // Trigger On-Demand AI Transcription via POST /api/transcripts/{id}/transcribe
  const handleTriggerTranscription = async (id: number) => {
    setTranscribingId(id);
    setTranscribeActionError(null);
    try {
      const res = await fetch(`/api/transcripts/${id}/transcribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcription_consent: true }),
      });

      if (!res.ok) {
        let errorText = `HTTP ${res.status}`;
        try {
          const errJson = await res.json();
          if (errJson.detail) errorText = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
          else if (errJson.error) errorText = errJson.error;
        } catch {
          // fallback
        }
        throw new Error(errorText);
      }

      const data = await res.json();

      // Update activeResult if active
      if (activeResult?.id === id) {
        setActiveResult((prev) => prev ? {
          ...prev,
          transcription_status: data.transcription_status || 'queued',
          transcription_error: null,
        } : null);
      }

      // Update in transcripts archive list
      setTranscripts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, transcription_status: data.transcription_status || 'queued', transcription_error: null } : t))
      );

      // Trigger immediate poll
      pollTranscript(id);
    } catch (err: any) {
      const msg = err.message || 'Failed to trigger transcription.';
      setTranscribeActionError(msg);
      if (activeResult?.id === id) {
        setActiveResult((prev) => prev ? {
          ...prev,
          transcription_status: 'failed',
          transcription_error: msg,
        } : null);
      }
    } finally {
      setTranscribingId(null);
    }
  };

  // Update Transcript Text (Community Corrections) via PUT /api/transcripts/{id}
  const handleSaveActiveEdit = async () => {
    if (!activeResult) return;
    setIsSavingEdit(true);
    try {
      const endpoint = `/api/transcripts/${activeResult.id}`;
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript_text: activeResultText }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setActiveResult({ ...activeResult, transcript_text: activeResultText, status: 'Community Edited' });
      fetchTranscripts();
    } catch (err: any) {
      alert('Failed to save edit: ' + err.message);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Delete Transcript from SQLite
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this recording and transcript?')) return;
    try {
      const res = await fetch(`/api/transcripts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      if (activeResult?.id === id) {
        setActiveResult(null);
      }
      fetchTranscripts();
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  };

  // Save Inline Edit in Archive
  const handleSaveArchiveEdit = async (id: number) => {
    try {
      const res = await fetch(`/api/transcripts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript_text: editText }),
      });
      if (!res.ok) throw new Error('Update failed');
      setEditingId(null);
      fetchTranscripts();
    } catch (err: any) {
      alert('Update failed: ' + err.message);
    }
  };

  // Select transcript for detailed workspace inspection
  const handleSelectActiveTranscript = (t: Transcript) => {
    setActiveResult(t);
    setActiveResultText(t.transcript_text || '');
    setTranscribeActionError(null);
    window.scrollTo({ top: 320, behavior: 'smooth' });
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="container">
      {/* ─── Top Navigation & Live Telemetry ─── */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '42px', 
            height: '42px', 
            borderRadius: '12px', 
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)'
          }}>
            <Volume2 size={24} color="#080A12" />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.02em', color: '#F8FAFC' }}>
              Voice Roots
            </h1>
            <p style={{ fontSize: '13px', color: '#94A3B8' }}>
              Rooting Oral Languages in Text with AI
            </p>
          </div>
        </div>

        {/* Backend Status Telemetry */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {health ? (
            <div className="badge badge-green" title={`FastAPI running with ${health.database} database`}>
              <CheckCircle2 size={14} />
              <span>FastAPI Backend: Online (SQLite Connected)</span>
            </div>
          ) : (
            <div className="badge badge-red" title={healthError || 'Connecting...'}>
              <AlertCircle size={14} />
              <span>FastAPI Backend: {healthError ? 'Offline (Run uvicorn)' : 'Connecting...'}</span>
            </div>
          )}

          <button 
            type="button" 
            onClick={() => { checkHealth(); fetchTranscripts(); }} 
            className="btn-secondary" 
            style={{ padding: '6px 12px', minHeight: '34px', fontSize: '12px' }}
            title="Refresh connection"
          >
            <RefreshCw size={13} />
            <span>Sync</span>
          </button>
        </div>
      </header>

      {/* ─── Mission & Protocol Notice Card ─── */}
      <div className="glass-card" style={{ marginBottom: '28px', borderLeft: '4px solid #F59E0B' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <Info size={22} color="#F59E0B" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>
              Ethical Language Preservation & Speech AI
            </h2>
            <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: '1.6' }}>
              Voice Roots roots unwritten oral, tribal, and regional tongues into searchable text.
              Under Indigenous Data Sovereignty (OCAP) protocols, the original speaker's audio recording is preserved permanently as the immutable master. 
              Automated AI transcription is processed with explicit consent and stored as an annotation layer that never overwrites the master voice.
            </p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
              <span className="badge badge-teal">Immutable Audio Master</span>
              <span className="badge badge-amber">Consent-Gated AI Engine</span>
              <span className="badge badge-green">SQLite Storage Active</span>
              <span className="badge badge-teal">Dual Annotation Separation</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '36px' }}>
        {/* ─── Left Column: Record / Upload Studio ─── */}
        <section className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileAudio size={20} color="#F59E0B" />
              <span>Capture Oral Audio</span>
            </h3>

            {/* Mode Switcher */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '3px' }}>
              <button
                type="button"
                onClick={() => setMode('record')}
                style={{
                  background: mode === 'record' ? '#F59E0B' : 'transparent',
                  color: mode === 'record' ? '#080A12' : '#94A3B8',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 14px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Microphone
              </button>
              <button
                type="button"
                onClick={() => setMode('upload')}
                style={{
                  background: mode === 'upload' ? '#F59E0B' : 'transparent',
                  color: mode === 'upload' ? '#080A12' : '#94A3B8',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 14px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Upload File
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Title Input */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#94A3B8', marginBottom: '6px' }}>
                Recording Title *
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Ancestral Mahua Harvest Legend"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Language Selection */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#94A3B8', marginBottom: '6px' }}>
                  Oral Language *
                </label>
                <select
                  className="select-field"
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                >
                  {DEFAULT_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.name}>
                      {lang.name} ({lang.native})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#94A3B8', marginBottom: '6px' }}>
                  Dialect / Variety
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Adilabad Southern"
                  value={dialect}
                  onChange={(e) => setDialect(e.target.value)}
                />
              </div>
            </div>

            {/* Mode-Specific Audio Input Area */}
            {mode === 'record' ? (
              <div style={{ 
                background: 'rgba(0,0,0,0.3)', 
                border: '1px dashed var(--card-border)', 
                borderRadius: '12px', 
                padding: '24px', 
                textAlign: 'center' 
              }}>
                <div style={{ marginBottom: '16px' }}>
                  {isRecording ? (
                    <div style={{ color: '#EF4444', fontWeight: '700', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#EF4444', display: 'inline-block', animation: 'pulse 1s infinite' }} />
                      Recording: {formatSeconds(recordingTime)}
                    </div>
                  ) : (
                    <p style={{ fontSize: '14px', color: '#94A3B8' }}>
                      {recordedBlob ? 'Audio captured! Click play below or re-record.' : 'Click to start recording your microphone.'}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="btn-primary"
                      style={{ background: '#EF4444', color: '#FFFFFF' }}
                    >
                      <Mic size={18} />
                      <span>{recordedBlob ? 'Record Again' : 'Start Recording'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="btn-primary"
                      style={{ background: '#F59E0B', color: '#080A12' }}
                    >
                      <Square size={18} />
                      <span>Stop Recording</span>
                    </button>
                  )}
                </div>

                {recordedAudioUrl && !isRecording && (
                  <div style={{ marginTop: '16px' }}>
                    <audio controls src={recordedAudioUrl} style={{ width: '100%', height: '40px' }} />
                  </div>
                )}
              </div>
            ) : (
              <div style={{ 
                background: 'rgba(0,0,0,0.3)', 
                border: '1px dashed var(--card-border)', 
                borderRadius: '12px', 
                padding: '24px', 
                textAlign: 'center' 
              }}>
                <Upload size={32} color="#F59E0B" style={{ margin: '0 auto 12px' }} />
                <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '12px' }}>
                  Select a master audio file (.wav, .mp3, .m4a, .ogg, .flac)
                </p>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  id="audio-file-input"
                />
                <label htmlFor="audio-file-input" className="btn-secondary" style={{ cursor: 'pointer' }}>
                  Browse Audio File
                </label>

                {selectedFile && (
                  <div style={{ marginTop: '14px', textAlign: 'left' }}>
                    <p style={{ fontSize: '13px', color: '#F8FAFC', fontWeight: '600' }}>
                      ✓ {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </p>
                    {fileAudioUrl && (
                      <audio controls src={fileAudioUrl} style={{ width: '100%', height: '40px', marginTop: '8px' }} />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Affirmative Speaker Consent (Mandatory under Indigenous Ethical Protocols / OCAP) */}
            <div 
              style={{ 
                background: hasConsent ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255, 255, 255, 0.03)', 
                border: hasConsent ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--card-border)', 
                borderRadius: '12px', 
                padding: '16px', 
                display: 'flex', 
                gap: '12px', 
                alignItems: 'flex-start',
                transition: 'all 0.2s ease'
              }}
            >
              <input
                type="checkbox"
                id="speaker-consent-checkbox"
                checked={hasConsent}
                onChange={(e) => {
                  setHasConsent(e.target.checked);
                  if (e.target.checked) setSubmitError(null);
                }}
                style={{
                  width: '18px',
                  height: '18px',
                  marginTop: '2px',
                  accentColor: '#F59E0B',
                  cursor: 'pointer'
                }}
                required
              />
              <label 
                htmlFor="speaker-consent-checkbox" 
                style={{ fontSize: '13px', lineHeight: '1.5', color: '#F8FAFC', cursor: 'pointer', flex: 1 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                  <ShieldCheck size={16} color="#F59E0B" />
                  <strong style={{ color: '#F59E0B' }}>
                    Affirmative Speaker Consent (Mandatory)
                  </strong>
                </div>
                <span style={{ color: '#94A3B8' }}>
                  I confirm that this recording is made with voluntary, informed consent under Indigenous Data Sovereignty (OCAP). The audio master will be stored permanently in immutable storage.
                </span>
              </label>
            </div>

            {/* AI Speech Transcription Consent (Distinct Opt-in) */}
            <div 
              style={{ 
                background: wantsTranscriptionConsent ? 'rgba(20, 184, 166, 0.08)' : 'rgba(255, 255, 255, 0.03)', 
                border: wantsTranscriptionConsent ? '1px solid rgba(20, 184, 166, 0.35)' : '1px solid var(--card-border)', 
                borderRadius: '12px', 
                padding: '14px', 
                display: 'flex', 
                gap: '12px', 
                alignItems: 'flex-start',
                transition: 'all 0.2s ease'
              }}
            >
              <input
                type="checkbox"
                id="transcription-consent-checkbox"
                checked={wantsTranscriptionConsent}
                onChange={(e) => setWantsTranscriptionConsent(e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  marginTop: '2px',
                  accentColor: '#14B8A6',
                  cursor: 'pointer'
                }}
              />
              <label 
                htmlFor="transcription-consent-checkbox" 
                style={{ fontSize: '13px', lineHeight: '1.5', color: '#F8FAFC', cursor: 'pointer', flex: 1 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                  <Sparkles size={16} color="#14B8A6" />
                  <strong style={{ color: '#5EEAD4' }}>
                    Queue AI Speech Transcription (Opt-in Consent)
                  </strong>
                </div>
                <span style={{ color: '#94A3B8', fontSize: '12px' }}>
                  Request automated phonetic speech-to-text recognition upon upload. AI hypotheses are stored as an annotation layer without modifying the original audio.
                </span>
              </label>
            </div>

            {/* Live Upload Progress Indicator */}
            {uploadProgress !== null && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94A3B8' }}>
                  <span>Uploading & Preserving Master...</span>
                  <span style={{ color: '#F59E0B', fontWeight: '600' }}>{uploadProgress}%</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '6px', height: '6px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      background: 'linear-gradient(90deg, #F59E0B, #10B981)', 
                      height: '100%', 
                      width: `${uploadProgress}%`, 
                      transition: 'width 0.15s ease' 
                    }} 
                  />
                </div>
              </div>
            )}

            {/* Feedback Banners */}
            {submitError && (
              <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#FCA5A5', fontSize: '13px' }}>
                {submitError}
              </div>
            )}

            {submitSuccess && (
              <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#86EFAC', fontSize: '13px' }}>
                {submitSuccess}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting || !hasConsent || (!recordedBlob && !selectedFile) || !title.trim()}
              style={{ width: '100%' }}
            >
              {isSubmitting 
                ? (uploadProgress !== null ? `Uploading Master (${uploadProgress}%)...` : 'Saving Audio Master...') 
                : 'Save & Ingest Recording'}
            </button>
          </form>
        </section>

        {/* ─── Right Column: Active Transcription Workspace ─── */}
        <section className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Languages size={20} color="#F59E0B" />
              <span>Transcription Workspace</span>
            </h3>

            {activeResult && (
              <span className="badge badge-amber">{activeResult.status}</span>
            )}
          </div>

          {activeResult ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#F8FAFC', marginBottom: '4px' }}>
                  {activeResult.title}
                </h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '12px', color: '#94A3B8' }}>
                  <span>Language: <strong style={{ color: '#F8FAFC' }}>{activeResult.language}</strong></span>
                  {activeResult.dialect && <span>• Dialect: <strong style={{ color: '#F8FAFC' }}>{activeResult.dialect}</strong></span>}
                  {activeResult.audio_sha256 && (
                    <span title={`SHA-256: ${activeResult.audio_sha256}`}>
                      • SHA-256: <code style={{ color: '#F59E0B' }}>{activeResult.audio_sha256.substring(0, 8)}…</code>
                    </span>
                  )}
                  {activeResult.file_size_bytes && (
                    <span>• ({(activeResult.file_size_bytes / 1024).toFixed(1)} KB)</span>
                  )}
                </div>
              </div>

              {/* Master Audio Stream */}
              <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '12px', padding: '12px' }}>
                <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>
                  Master Audio Playback (Lossless Immutable Master):
                </p>
                <audio controls src={activeResult.audio_url} style={{ width: '100%', height: '36px' }} />
              </div>

              {/* ─── AI Speech Recognition Status Card ─── */}
              <div style={{ 
                background: 'rgba(255,255,255,0.03)', 
                border: '1px solid var(--card-border)', 
                borderRadius: '12px', 
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Cpu size={16} color="#14B8A6" />
                    <strong style={{ fontSize: '13px', color: '#F8FAFC' }}>AI Speech Engine Pipeline:</strong>
                  </div>

                  {/* Status Badge */}
                  {activeResult.transcription_status === 'completed' && (
                    <span className="badge badge-green">
                      <CheckCircle2 size={13} />
                      <span>Completed</span>
                    </span>
                  )}
                  {activeResult.transcription_status === 'queued' && (
                    <span className="badge badge-amber pulse-animate">
                      <Loader2 size={13} className="spin-animate" />
                      <span>Queued in Background...</span>
                    </span>
                  )}
                  {activeResult.transcription_status === 'processing' && (
                    <span className="badge badge-teal pulse-animate">
                      <Loader2 size={13} className="spin-animate" />
                      <span>Processing Audio Waveform...</span>
                    </span>
                  )}
                  {activeResult.transcription_status === 'failed' && (
                    <span className="badge badge-red">
                      <AlertCircle size={13} />
                      <span>Failed</span>
                    </span>
                  )}
                  {activeResult.transcription_status === 'not_configured' && (
                    <span className="badge badge-amber">
                      <AlertCircle size={13} />
                      <span>Provider Disabled</span>
                    </span>
                  )}
                  {(!activeResult.transcription_status || activeResult.transcription_status === 'not_requested') && (
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: '#94A3B8' }}>
                      <Info size={13} />
                      <span>Not Requested</span>
                    </span>
                  )}
                </div>

                {/* Model Metadata if present */}
                {(activeResult.transcription_provider || activeResult.transcription_model) && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '12px' }}>
                    {activeResult.transcription_provider && (
                      <span className="badge badge-teal">Provider: {activeResult.transcription_provider}</span>
                    )}
                    {activeResult.transcription_model && (
                      <span className="badge badge-teal">Model: {activeResult.transcription_model}</span>
                    )}
                    {activeResult.transcribed_at && (
                      <span style={{ color: '#94A3B8', fontSize: '11px', alignSelf: 'center' }}>
                        Transcribed at: {new Date(activeResult.transcribed_at).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                )}

                {/* Error Banner & Actionable Retry */}
                {activeResult.transcription_status === 'failed' && (
                  <div style={{ 
                    padding: '10px 12px', 
                    borderRadius: '8px', 
                    background: 'rgba(239, 68, 68, 0.12)', 
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#FCA5A5',
                    fontSize: '13px'
                  }}>
                    <p style={{ marginBottom: '6px' }}>
                      <strong>Error:</strong> {activeResult.transcription_error || 'Speech engine failed to transcribe audio.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleTriggerTranscription(activeResult.id)}
                      disabled={transcribingId === activeResult.id}
                      className="btn-danger"
                      style={{ fontSize: '12px', padding: '6px 12px' }}
                    >
                      <RotateCcw size={13} />
                      <span>{transcribingId === activeResult.id ? 'Retrying...' : 'Retry AI Transcription'}</span>
                    </button>
                  </div>
                )}

                {/* Provider Not Configured Notice */}
                {activeResult.transcription_status === 'not_configured' && (
                  <div style={{ 
                    padding: '10px 12px', 
                    borderRadius: '8px', 
                    background: 'rgba(245, 158, 11, 0.1)', 
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    color: '#FCD34D',
                    fontSize: '13px'
                  }}>
                    <p style={{ marginBottom: '6px' }}>
                      <strong>Notice:</strong> {activeResult.transcription_error || 'The backend transcription provider is currently disabled. Configure VOICE_ROOTS_TRANSCRIPTION_PROVIDER (e.g. whisper-local or openai) in the backend to enable automated processing.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleTriggerTranscription(activeResult.id)}
                      disabled={transcribingId === activeResult.id}
                      className="btn-secondary"
                      style={{ fontSize: '12px', padding: '6px 12px', minHeight: '32px' }}
                    >
                      <RotateCcw size={13} />
                      <span>{transcribingId === activeResult.id ? 'Checking Provider...' : 'Retry / Recheck Provider'}</span>
                    </button>
                  </div>
                )}

                {/* Not Requested Action */}
                {(!activeResult.transcription_status || activeResult.transcription_status === 'not_requested') && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <p style={{ fontSize: '12px', color: '#94A3B8' }}>
                      Audio was archived without automated AI transcription consent.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleTriggerTranscription(activeResult.id)}
                      disabled={transcribingId === activeResult.id}
                      className="btn-primary"
                      style={{ fontSize: '12px', padding: '6px 14px', minHeight: '34px' }}
                    >
                      <Sparkles size={13} />
                      <span>{transcribingId === activeResult.id ? 'Queuing...' : 'Transcribe with AI'}</span>
                    </button>
                  </div>
                )}

                {/* Live Polling Notice */}
                {(activeResult.transcription_status === 'queued' || activeResult.transcription_status === 'processing') && (
                  <p style={{ fontSize: '12px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Loader2 size={12} className="spin-animate" />
                    <span>Synchronizing genuine status from FastAPI every 2 seconds...</span>
                  </p>
                )}

                {transcribeActionError && (
                  <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#FCA5A5', fontSize: '12px' }}>
                    {transcribeActionError}
                  </div>
                )}
              </div>

              {/* ─── Box 1: Original AI Speech Output (Immutable Annotation) ─── */}
              <div style={{ 
                background: 'rgba(20, 184, 166, 0.04)', 
                border: '1px solid rgba(20, 184, 166, 0.25)', 
                borderRadius: '12px', 
                padding: '16px' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: '#5EEAD4', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Cpu size={15} color="#5EEAD4" />
                    <span>Original AI Machine Output (Immutable Annotation)</span>
                  </label>
                  <span className="badge badge-teal" style={{ fontSize: '11px', padding: '2px 8px' }}>
                    Read-Only
                  </span>
                </div>

                {activeResult.machine_transcript_text ? (
                  <div style={{ 
                    background: 'rgba(0,0,0,0.3)', 
                    borderRadius: '8px', 
                    padding: '12px', 
                    fontSize: '14px', 
                    lineHeight: '1.6', 
                    color: '#F8FAFC',
                    fontStyle: 'italic',
                    borderLeft: '3px solid #14B8A6'
                  }}>
                    "{activeResult.machine_transcript_text}"
                  </div>
                ) : (
                  <div style={{ 
                    background: 'rgba(0,0,0,0.2)', 
                    borderRadius: '8px', 
                    padding: '12px', 
                    fontSize: '13px', 
                    color: '#94A3B8'
                  }}>
                    {activeResult.transcription_status === 'queued' || activeResult.transcription_status === 'processing'
                      ? 'Waiting for AI speech recognition model to complete transcription...'
                      : 'No machine transcript generated for this recording yet.'}
                  </div>
                )}
                <p style={{ fontSize: '11px', color: '#64748B', marginTop: '6px' }}>
                  Preserved as an immutable annotation layer under OCAP protocols. Edits never overwrite this output.
                </p>
              </div>

              {/* ─── Box 2: Community Corrected Transcript (Editable) ─── */}
              <div style={{ 
                background: 'rgba(245, 158, 11, 0.04)', 
                border: '1px solid rgba(245, 158, 11, 0.25)', 
                borderRadius: '12px', 
                padding: '16px' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: '#FCD34D', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Edit3 size={15} color="#FCD34D" />
                    <span>Community Transcript & Corrections (Editable)</span>
                  </label>
                  {activeResult.status === 'Community Edited' && (
                    <span className="badge badge-amber" style={{ fontSize: '11px', padding: '2px 8px' }}>
                      Community Edited
                    </span>
                  )}
                </div>

                <textarea
                  className="textarea-field"
                  rows={4}
                  placeholder="Enter phonetic notes, dialectal annotations, or corrected wording..."
                  value={activeResultText}
                  onChange={(e) => setActiveResultText(e.target.value)}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', flexWrap: 'wrap', gap: '8px' }}>
                  <p style={{ fontSize: '11px', color: '#64748B' }}>
                    Saved separately without modifying the immutable audio master or original AI output.
                  </p>

                  <button
                    type="button"
                    onClick={handleSaveActiveEdit}
                    disabled={isSavingEdit}
                    className="btn-primary"
                    style={{ minHeight: '38px', padding: '6px 16px', fontSize: '13px' }}
                  >
                    <Check size={15} />
                    <span>{isSavingEdit ? 'Saving...' : 'Save Transcript Corrections'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '48px 16px', textAlign: 'center', color: '#64748B' }}>
              <Volume2 size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <p style={{ fontSize: '15px', fontWeight: '600', color: '#94A3B8', marginBottom: '4px' }}>
                No active recording selected
              </p>
              <p style={{ fontSize: '13px', maxWidth: '340px', margin: '0 auto' }}>
                Record live audio or upload a file on the left, or select an existing recording from the archive below to inspect its AI speech output.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* ─── Bottom Section: SQLite Saved Transcripts Archive ─── */}
      <section className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>
              Language Archive & Saved Transcripts
            </h3>
            <p style={{ fontSize: '13px', color: '#94A3B8' }}>
              Permanently persisted in SQLite database (<code style={{ color: '#F59E0B' }}>voice_roots.db</code>)
            </p>
          </div>

          <button 
            type="button" 
            onClick={fetchTranscripts} 
            className="btn-secondary"
            style={{ fontSize: '13px', padding: '8px 14px' }}
          >
            <RefreshCw size={14} />
            <span>Refresh Archive</span>
          </button>
        </div>

        {isLoadingArchive ? (
          <p style={{ padding: '24px', textAlign: 'center', color: '#94A3B8' }}>Loading saved transcripts from SQLite...</p>
        ) : transcripts.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: '#64748B' }}>
            <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '4px' }}>Archive is currently empty.</p>
            <p style={{ fontSize: '13px' }}>Use the capture studio above to save the first recording into SQLite.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {transcripts.map((t) => (
              <div 
                key={t.id} 
                style={{ 
                  background: activeResult?.id === t.id ? 'rgba(245, 158, 11, 0.05)' : 'rgba(255,255,255,0.03)', 
                  border: activeResult?.id === t.id ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--card-border)', 
                  borderRadius: '12px', 
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#F8FAFC' }}>
                      {t.title}
                    </h4>
                    <p style={{ fontSize: '12px', color: '#94A3B8' }}>
                      <strong style={{ color: '#F59E0B' }}>{t.language}</strong>
                      {t.dialect && ` (${t.dialect})`} • Saved: {new Date(t.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {/* Status Badges */}
                    <span className="badge badge-amber">{t.status}</span>
                    
                    {t.transcription_status === 'completed' && (
                      <span className="badge badge-green" title={t.transcription_model || 'Completed'}>
                        <CheckCircle2 size={12} />
                        <span>AI Transcribed</span>
                      </span>
                    )}
                    {(t.transcription_status === 'queued' || t.transcription_status === 'processing') && (
                      <span className="badge badge-teal pulse-animate">
                        <Loader2 size={12} className="spin-animate" />
                        <span>Transcribing...</span>
                      </span>
                    )}
                    {t.transcription_status === 'failed' && (
                      <span className="badge badge-red" title={t.transcription_error || 'Failed'}>
                        <AlertCircle size={12} />
                        <span>AI Failed</span>
                      </span>
                    )}
                    {t.transcription_status === 'not_configured' && (
                      <span className="badge badge-amber" title={t.transcription_error || 'Not Configured'}>
                        <Info size={12} />
                        <span>Provider Disabled</span>
                      </span>
                    )}

                    {/* On-Demand Transcribe / Retry button */}
                    {t.transcription_status !== 'completed' && t.transcription_status !== 'queued' && t.transcription_status !== 'processing' && (
                      <button
                        type="button"
                        onClick={() => handleTriggerTranscription(t.id)}
                        disabled={transcribingId === t.id}
                        className="btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '12px', minHeight: '30px' }}
                        title="Run AI Speech Transcription"
                      >
                        <Sparkles size={12} />
                        <span>{transcribingId === t.id ? 'Queuing...' : (t.transcription_status === 'failed' ? 'Retry AI' : 'Transcribe')}</span>
                      </button>
                    )}

                    {/* Open in Workspace */}
                    <button
                      type="button"
                      onClick={() => handleSelectActiveTranscript(t)}
                      className="btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '12px', minHeight: '30px' }}
                      title="Inspect in Workspace above"
                    >
                      <ExternalLink size={12} />
                      <span>Inspect</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(t.id)}
                      className="btn-danger"
                      title="Delete recording"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                {/* Audio Master Player */}
                <audio controls src={t.audio_url} style={{ width: '100%', height: '36px' }} />

                {/* Separate Machine vs Community Transcripts Display */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                  {t.machine_transcript_text && (
                    <div style={{ 
                      background: 'rgba(20, 184, 166, 0.05)', 
                      borderLeft: '3px solid #14B8A6',
                      borderRadius: '6px', 
                      padding: '8px 12px',
                      color: '#E2E8F0',
                      fontSize: '13px'
                    }}>
                      <span style={{ fontSize: '11px', color: '#5EEAD4', fontWeight: '600', display: 'block', marginBottom: '2px' }}>
                        Original AI Machine Output:
                      </span>
                      "{t.machine_transcript_text}"
                    </div>
                  )}

                  {/* Inline Editing or Display for Community Transcript */}
                  {editingId === t.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                      <textarea
                        className="textarea-field"
                        rows={3}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          type="button" 
                          onClick={() => handleSaveArchiveEdit(t.id)} 
                          className="btn-primary" 
                          style={{ minHeight: '34px', padding: '6px 14px', fontSize: '12px' }}
                        >
                          <Check size={14} />
                          <span>Save Correction</span>
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setEditingId(null)} 
                          className="btn-secondary" 
                          style={{ minHeight: '34px', padding: '6px 14px', fontSize: '12px' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start', 
                      gap: '12px',
                      background: 'rgba(255,255,255,0.02)',
                      borderRadius: '6px',
                      padding: '8px 12px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '11px', color: '#FCD34D', fontWeight: '600', display: 'block', marginBottom: '2px' }}>
                          Community Corrected Transcript:
                        </span>
                        <p style={{ color: '#E2E8F0', fontStyle: 'italic', lineHeight: '1.5' }}>
                          "{t.transcript_text || '(No community text recorded yet)'}"
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setEditingId(t.id); setEditText(t.transcript_text || ''); }}
                        className="btn-secondary"
                        style={{ padding: '4px 10px', minHeight: '30px', fontSize: '12px' }}
                        title="Edit transcript text"
                      >
                        <Edit3 size={12} />
                        <span>Edit</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── Footer ─── */}
      <footer style={{ marginTop: '40px', padding: '20px 0', borderTop: '1px solid var(--card-border)', textAlign: 'center', fontSize: '13px', color: '#64748B' }}>
        Voice Roots • Rooting Oral Languages in Text with AI • Indigenous Data Sovereignty (OCAP) Compliant
      </footer>
    </div>
  );
}

export default App;
