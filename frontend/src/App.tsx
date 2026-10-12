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
  ShieldCheck
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
  status: string;
  created_at: string;
  updated_at: string;
}

interface ApiHealth {
  status: string;
  app: string;
  version: string;
  database: string;
  database_status: string;
}

const DEFAULT_LANGUAGES: Language[] = [
  { code: 'gondi', name: 'Gondi', native: 'గోండీ', category: 'Indigenous / Tribal' },
  { code: 'koya', name: 'Koya', native: 'కోయ', category: 'Indigenous / Tribal' },
  { code: 'sat', name: 'Santhali', native: 'ᱥᱟᱱᱛᱟᱲᱤ', category: 'Scheduled' },
  { code: 'lam', name: 'Lambadi', native: 'లంబాడీ', category: 'Indigenous / Tribal' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', category: 'Scheduled' },
  { code: 'hi', name: 'Hindi', native: 'హిन्दी', category: 'Scheduled' },
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

  // Active / Latest Result State
  const [activeResult, setActiveResult] = useState<Transcript | null>(null);
  const [activeResultText, setActiveResultText] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

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
      // Fallback direct localhost check if proxy is not yet ready
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
      const data = await res.json();
      setTranscripts(data.transcripts || []);
    } catch {
      try {
        const direct = await fetch('http://127.0.0.1:8000/api/transcripts');
        const data = await direct.json();
        setTranscripts(data.transcripts || []);
      } catch {
        // Ignored in offline preview mode
      }
    } finally {
      setIsLoadingArchive(false);
    }
  };

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

    // Submit explicit affirmative consent fields (string and boolean compatible)
    formData.append('consent', 'true');
    formData.append('consent_given', 'true');
    formData.append('consentSpeaker', 'true');

    const endpoint = health ? '/api/upload' : 'http://127.0.0.1:8000/api/upload';
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
          const data = JSON.parse(xhr.responseText);
          setSubmitSuccess('Oral audio master saved safely to SQLite and storage with affirmative speaker consent verified!');
          setActiveResult(data);
          setActiveResultText(data.transcript_text);
          
          // Clear inputs and reset consent
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

  // Update Transcript Text
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
      if (!res.ok) throw new Error('Update failed');
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

      {/* ─── Mission & Phase 1 Scope Card ─── */}
      <div className="glass-card" style={{ marginBottom: '28px', borderLeft: '4px solid #F59E0B' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <Info size={22} color="#F59E0B" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>
              Phase 1 Milestone Foundation
            </h2>
            <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: '1.6' }}>
              Voice Roots preserves unwritten, tribal, and regional oral tongues. The speaker's audio recording 
              is preserved permanently as the immutable master. In this initial milestone, live audio capture, 
              local file upload, language tagging, and SQLite transcript persistence are fully operational.
            </p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
              <span className="badge badge-teal">Immutable Audio Master</span>
              <span className="badge badge-amber">SQLite Persistence Active</span>
              <span className="badge badge-teal">Phase 4: Real Speech Engine Pending</span>
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
                  Select a master audio file (.wav, .mp3, .m4a, .ogg)
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
                  I confirm that this recording is made with the voluntary, informed consent of the speaker and community custodian under Indigenous Data Sovereignty (OCAP) protocols. The audio master will be stored permanently in immutable storage, and AI processing is strictly limited to phonetic transcription and language preservation.
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

        {/* ─── Right Column: Active Transcription Inspection ─── */}
        <section className="glass-card">
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Languages size={20} color="#F59E0B" />
            <span>Transcription Workspace</span>
          </h3>

          {activeResult ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#F8FAFC' }}>
                    {activeResult.title}
                  </h4>
                  <span className="badge badge-amber">{activeResult.status}</span>
                </div>
                <p style={{ fontSize: '13px', color: '#94A3B8' }}>
                  Language: <strong style={{ color: '#F8FAFC' }}>{activeResult.language}</strong> 
                  {activeResult.dialect && ` • Dialect: ${activeResult.dialect}`}
                </p>
              </div>

              {/* Master Audio Stream */}
              <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '12px', padding: '12px' }}>
                <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>Master Audio Playback:</p>
                <audio controls src={activeResult.audio_url} style={{ width: '100%', height: '36px' }} />
              </div>

              {/* Honest Notice Badge */}
              <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(20, 184, 166, 0.1)', border: '1px solid rgba(20, 184, 166, 0.25)', fontSize: '13px', color: '#5EEAD4' }}>
                <strong>Speech Engine Status:</strong> Real AI acoustic recognition model will be connected in Phase 4. You can edit community transcripts below.
              </div>

              {/* Editable Transcript Text */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#94A3B8', marginBottom: '6px' }}>
                  Transcript / Community Phonetic Notes:
                </label>
                <textarea
                  className="textarea-field"
                  rows={5}
                  value={activeResultText}
                  onChange={(e) => setActiveResultText(e.target.value)}
                />
              </div>

              <button
                type="button"
                onClick={handleSaveActiveEdit}
                disabled={isSavingEdit}
                className="btn-secondary"
              >
                <Check size={16} />
                <span>{isSavingEdit ? 'Saving Changes...' : 'Save Transcript Corrections'}</span>
              </button>
            </div>
          ) : (
            <div style={{ padding: '48px 16px', textAlign: 'center', color: '#64748B' }}>
              <Volume2 size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <p style={{ fontSize: '15px', fontWeight: '600', color: '#94A3B8', marginBottom: '4px' }}>
                No active recording selected
              </p>
              <p style={{ fontSize: '13px' }}>
                Record live audio or choose a file on the left to review its transcription.
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {transcripts.map((t) => (
              <div 
                key={t.id} 
                style={{ 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid var(--card-border)', 
                  borderRadius: '12px', 
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
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

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge badge-amber">{t.status}</span>
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

                {/* Inline Editing or Display */}
                {editingId === t.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                        style={{ minHeight: '38px', padding: '6px 14px', fontSize: '13px' }}
                      >
                        <Check size={14} />
                        <span>Save</span>
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setEditingId(null)} 
                        className="btn-secondary" 
                        style={{ minHeight: '38px', padding: '6px 14px', fontSize: '13px' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <p style={{ fontSize: '13px', color: '#E2E8F0', fontStyle: 'italic', flex: 1, lineHeight: '1.5' }}>
                      "{t.transcript_text}"
                    </p>
                    <button
                      type="button"
                      onClick={() => { setEditingId(t.id); setEditText(t.transcript_text); }}
                      className="btn-secondary"
                      style={{ padding: '6px 12px', minHeight: '32px', fontSize: '12px' }}
                      title="Edit transcript text"
                    >
                      <Edit3 size={13} />
                      <span>Edit</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── Footer ─── */}
      <footer style={{ marginTop: '40px', padding: '20px 0', borderTop: '1px solid var(--card-border)', textAlign: 'center', fontSize: '13px', color: '#64748B' }}>
        Voice Roots • Rooting Oral Languages in Text with AI • Phase 1 Milestone Foundation
      </footer>
    </div>
  );
}

export default App;
