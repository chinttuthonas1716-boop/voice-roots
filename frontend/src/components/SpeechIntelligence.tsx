import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  AlertTriangle,
  Users,
  Edit3,
  X,
  Info,
  ShieldCheck,
  Filter,
  CheckCircle2
} from 'lucide-react';
import {
  SpeechAlignment,
  SpeechAcousticMetrics,
  PronunciationExercise,
  PronunciationAttempt,
  SpeechTranscriptItem,
  DialectClassification,
  SpeakerTurn,
  NoiseReductionResult,
} from '../types';

interface SpeechIntelligenceProps {
  onBack?: () => void;
}

export const SpeechIntelligence: React.FC<SpeechIntelligenceProps> = () => {
  const [transcripts, setTranscripts] = useState<SpeechTranscriptItem[]>([]);
  const [selectedTranscript, setSelectedTranscript] = useState<SpeechTranscriptItem | null>(null);
  const [acousticMetrics, setAcousticMetrics] = useState<SpeechAcousticMetrics | null>(null);
  const [alignments, setAlignments] = useState<SpeechAlignment[]>([]);
  const [waveformPeaks, setWaveformPeaks] = useState<number[]>([]);
  
  // v2.0 Advanced Speech Intelligence State
  const [dialectInfo, setDialectInfo] = useState<DialectClassification | null>(null);
  const [speakerTurns, setSpeakerTurns] = useState<SpeakerTurn[]>([]);
  const [noiseReduction, setNoiseReduction] = useState<NoiseReductionResult | null>(null);
  const [isNoiseFiltered, setIsNoiseFiltered] = useState<boolean>(false);
  const [filterOnlyUncertain, setFilterOnlyUncertain] = useState<boolean>(false);
  const [isApplyingNoiseFilter, setIsApplyingNoiseFilter] = useState<boolean>(false);
  const [showDialectDetails, setShowDialectDetails] = useState<boolean>(false);

  // Correction Modal State
  const [correctionModalWord, setCorrectionModalWord] = useState<SpeechAlignment | null>(null);
  const [suggestedWordText, setSuggestedWordText] = useState<string>('');
  const [suggestedWordIpa, setSuggestedWordIpa] = useState<string>('');
  const [correctionDialectNote, setCorrectionDialectNote] = useState<string>('');
  const [isSubmittingCorrection, setIsSubmittingCorrection] = useState<boolean>(false);

  // Audio playback state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [loopA, setLoopA] = useState<number | null>(null);
  const [loopB, setLoopB] = useState<number | null>(null);
  const [isLooping, setIsLooping] = useState(false);

  // Pronunciation practice state
  const [exercises, setExercises] = useState<PronunciationExercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<PronunciationExercise | null>(null);
  const [filterLanguage, setFilterLanguage] = useState<string>('All');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimerRef = useRef<any>(null);
  const [practiceAttempt, setPracticeAttempt] = useState<PronunciationAttempt | null>(null);
  const [elderNotes, setElderNotes] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    fetchTranscripts();
    fetchExercises();
  }, []);

  const fetchTranscripts = async () => {
    try {
      const resp = await fetch('/api/transcripts');
      if (resp.ok) {
        const data = await resp.json();
        const list: SpeechTranscriptItem[] = Array.isArray(data) ? data : data.transcripts || [];
        setTranscripts(list);
        if (list.length > 0) {
          handleSelectTranscript(list[0]);
        }
      }
    } catch (e: any) {
      console.error('Failed to fetch transcripts', e);
    }
  };

  const fetchExercises = async () => {
    try {
      const resp = await fetch('/api/v1/speech/pronunciation/exercises');
      if (resp.ok) {
        const data = await resp.json();
        const items = data.exercises || [];
        setExercises(items);
        if (items.length > 0) {
          setSelectedExercise(items[0]);
        }
      }
    } catch (e: any) {
      console.error('Failed to fetch pronunciation exercises', e);
    }
  };

  const handleSelectTranscript = async (t: SpeechTranscriptItem) => {
    setSelectedTranscript(t);
    setIsLoading(true);
    setErrorMsg(null);
    setCurrentTime(0);
    setIsPlaying(false);
    setLoopA(null);
    setLoopB(null);
    setDialectInfo(null);
    setSpeakerTurns([]);
    setNoiseReduction(null);
    setIsNoiseFiltered(false);

    try {
      // Analyze & fetch metrics and alignments
      const anResp = await fetch(`/api/v1/speech/analyze/${t.id}`, { method: 'POST' });
      if (anResp.ok) {
        const anData = await anResp.json();
        setAcousticMetrics(anData.acoustic_metrics);
        setAlignments(anData.alignments || []);
      }

      // Fetch waveform
      const wfResp = await fetch(`/api/v1/speech/waveform/${t.id}`);
      if (wfResp.ok) {
        const wfData = await wfResp.json();
        setWaveformPeaks(wfData.waveform_peaks || []);
      }

      // Fetch Dialect Identification
      try {
        const dResp = await fetch('/api/v1/speech/dialect-id', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript_id: t.id, language: t.language }),
        });
        if (dResp.ok) {
          const dData = await dResp.json();
          setDialectInfo(dData.dialect_classification || null);
        }
      } catch (err) {
        console.warn('Dialect id fetch fallback', err);
      }

      // Fetch Speaker Diarization
      try {
        const sResp = await fetch(`/api/v1/speech/diarization/${t.id}`);
        if (sResp.ok) {
          const sData = await sResp.json();
          setSpeakerTurns(sData.speaker_turns || []);
        }
      } catch (err) {
        console.warn('Diarization fetch fallback', err);
      }
    } catch (err: any) {
      setErrorMsg('Failed to analyze speech for selected recording: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleNoiseReduction = async () => {
    if (!selectedTranscript) return;
    if (isNoiseFiltered) {
      setIsNoiseFiltered(false);
      setStatusMsg('Switched back to original uncompressed 48kHz master audio.');
      return;
    }

    setIsApplyingNoiseFilter(true);
    try {
      const resp = await fetch(`/api/v1/speech/noise-reduction/${selectedTranscript.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filter_strength: 0.6 }),
      });
      if (resp.ok) {
        const data = await resp.json();
        setNoiseReduction(data.noise_reduction || null);
        setIsNoiseFiltered(true);
        setStatusMsg(`✨ Noise reduction filter active (+${data.noise_reduction?.snr_improvement_db || 5.2} dB SNR). Master audio preserved.`);
      } else {
        setErrorMsg('Noise reduction processing failed.');
      }
    } catch (err: any) {
      setErrorMsg('Noise reduction error: ' + err.message);
    } finally {
      setIsApplyingNoiseFilter(false);
    }
  };

  const handleOpenCorrection = (word: SpeechAlignment) => {
    setCorrectionModalWord(word);
    setSuggestedWordText(word.word_text);
    setSuggestedWordIpa(word.phonetic_tokens || '');
    setCorrectionDialectNote(dialectInfo?.detected_dialect || 'Adilabad Southern');
  };

  const handleSubmitWordCorrection = async () => {
    if (!correctionModalWord || !selectedTranscript) return;
    setIsSubmittingCorrection(true);
    try {
      const resp = await fetch('/api/v1/speech/corrections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript_id: selectedTranscript.id,
          word_index: correctionModalWord.word_index,
          previous_text: correctionModalWord.word_text,
          suggested_text: suggestedWordText,
          suggested_ipa: suggestedWordIpa,
          dialect_note: correctionDialectNote,
          contributor_name: 'Community Elder / Contributor',
          rationale: 'Phonetic IPA & dialect token verification',
        }),
      });
      if (resp.ok) {
        setStatusMsg(`Correction for "${correctionModalWord.word_text}" submitted to community elder review queue!`);
        setCorrectionModalWord(null);
      } else {
        setErrorMsg('Failed to submit word correction.');
      }
    } catch (err: any) {
      setErrorMsg('Network error: ' + err.message);
    } finally {
      setIsSubmittingCorrection(false);
    }
  };

  // Audio controls
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch((e) => console.error(e));
    }
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const t = audioRef.current.currentTime;
    setCurrentTime(t);

    // Handle A-B Looping
    if (isLooping && loopA !== null && loopB !== null && loopB > loopA) {
      if (t >= loopB) {
        audioRef.current.currentTime = loopA;
      }
    }
  };

  const jumpToTime = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = seconds;
    setCurrentTime(seconds);
    if (!isPlaying) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  // Recording simulation for pronunciation practice
  const startRecording = () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    setPracticeAttempt(null);
    recordingTimerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopRecordingAndEvaluate = async () => {
    setIsRecording(false);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    if (!selectedExercise) return;

    setIsLoading(true);
    try {
      const resp = await fetch('/api/v1/speech/pronunciation/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exercise_id: selectedExercise.exercise_id,
          learner_id: 'learner_current_session',
          duration_seconds: Math.max(1.5, recordingSeconds),
        }),
      });
      if (resp.ok) {
        const attempt = await resp.json();
        setPracticeAttempt(attempt);
        setStatusMsg('Attempt analyzed by acoustic phoneme model. Marked PENDING_REVIEW for native elder verification.');
      } else {
        setErrorMsg('Pronunciation evaluation failed.');
      }
    } catch (e: any) {
      setErrorMsg('Network error submitting attempt: ' + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const submitElderReview = async (verdict: 'VERIFIED' | 'RETRY_SUGGESTED') => {
    if (!practiceAttempt) return;
    setIsSubmittingReview(true);
    try {
      const resp = await fetch(`/api/v1/speech/pronunciation/attempts/${practiceAttempt.id}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: verdict,
          elder_review_notes: elderNotes || 'Pronunciation verified with authentic dialectal cadence.',
          reviewed_by: 'Community Elder Reviewer',
        }),
      });
      if (resp.ok) {
        const updated = await resp.json();
        setPracticeAttempt(updated);
        setStatusMsg(`Attempt status updated to: ${verdict}`);
      }
    } catch (e: any) {
      setErrorMsg('Failed to submit elder review: ' + e.message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const filteredExercises = filterLanguage === 'All'
    ? exercises
    : exercises.filter((ex) => ex.language.toLowerCase() === filterLanguage.toLowerCase());

  const activeWord = alignments.find(
    (al) => currentTime >= al.start_time && currentTime <= al.end_time
  );

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-cyan-900 text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/30 border border-emerald-400/40 rounded-full text-xs font-semibold text-emerald-200 mb-3 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Milestone 18 • Advanced Speech & Pronunciation Intelligence
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Acoustic Phonetics & Word-Level Alignment
          </h1>
          <p className="mt-3 text-emerald-100 text-base leading-relaxed">
            Preserving indigenous oral cadence through offline waveform telemetry, synchronized word timestamps,
            phonetic minimal-pair drills, and human elder verification gates.
          </p>
        </div>
      </div>

      {statusMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between">
          <span>{statusMsg}</span>
          <button onClick={() => setStatusMsg(null)} className="text-emerald-600 font-bold hover:underline">Dismiss</button>
        </div>
      )}

      {isLoading && (
        <div className="p-3 bg-teal-50 border border-teal-200 text-teal-800 rounded-xl text-xs flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping"></span>
          Processing acoustic alignment telemetry...
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-rose-600 font-bold hover:underline">Dismiss</button>
        </div>
      )}

      {/* Main Grid: Speech Aligner & Audio Player */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recording Selector & Acoustic Telemetry */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
              </svg>
              Select Master Recording
            </h2>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {transcripts.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleSelectTranscript(t)}
                  className={`w-full text-left p-3 rounded-lg border transition-all text-sm ${
                    selectedTranscript?.id === t.id
                      ? 'border-emerald-500 bg-emerald-50/70 shadow-sm font-semibold text-emerald-950'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="truncate">{t.title || `Recording #${t.id}`}</span>
                    <span className="text-xs px-2 py-0.5 bg-slate-100 rounded text-slate-600 uppercase">
                      {t.language}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex gap-3">
                    <span>⏱ {t.duration_seconds ? t.duration_seconds.toFixed(1) + 's' : 'Audio'}</span>
                    <span>Status: {t.status}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Acoustic Telemetry Card */}
          {acousticMetrics && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Acoustic Cadence Metrics
              </h2>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-slate-500">Speaking Rate</div>
                  <div className="text-lg font-bold text-emerald-700 mt-1">
                    {acousticMetrics.speaking_rate_wpm} <span className="text-xs font-normal text-slate-500">WPM</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-slate-500">Articulation Rate</div>
                  <div className="text-lg font-bold text-teal-700 mt-1">
                    {acousticMetrics.articulation_rate} <span className="text-xs font-normal text-slate-500">syll/s</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-slate-500">Total Silence</div>
                  <div className="text-lg font-bold text-slate-700 mt-1">
                    {acousticMetrics.total_silence_seconds}s
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-slate-500">Acoustic Pauses</div>
                  <div className="text-lg font-bold text-slate-700 mt-1">
                    {acousticMetrics.pause_count} <span className="text-xs font-normal text-slate-500">({acousticMetrics.average_pause_duration}s avg)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (2 cols): Waveform & Synchronized Karaoke Player */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {selectedTranscript?.title || 'Synchronized Speech Aligner'}
                </h2>
                <div className="text-xs text-slate-500 mt-1">
                  Language: <span className="font-semibold text-slate-700">{selectedTranscript?.language}</span> •
                  Duration: <span className="font-semibold text-slate-700">{selectedTranscript?.duration_seconds?.toFixed(1) || '0.0'}s</span>
                </div>
              </div>

              {/* Speed Controls */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
                {[0.5, 0.75, 1.0, 1.25].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => handleRateChange(rate)}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      playbackRate === rate ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>

            {/* Dialect Classification & Markers Card (v2.0 Module 1) */}
            {dialectInfo && (
              <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 border border-emerald-200/80 rounded-xl space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                      Detected Dialect:
                    </span>
                    <span className="text-sm font-black text-emerald-800 bg-white px-2.5 py-0.5 rounded-md border border-emerald-300 shadow-2xs">
                      {dialectInfo.detected_dialect}
                    </span>
                    <span className="text-xs font-mono text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded font-bold">
                      {(dialectInfo.confidence * 100).toFixed(0)}% confidence
                    </span>
                  </div>

                  <button
                    onClick={() => setShowDialectDetails(!showDialectDetails)}
                    className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Info className="w-3.5 h-3.5" />
                    {showDialectDetails ? 'Hide Dialect Profile' : 'View Dialect Profile'}
                  </button>
                </div>

                {showDialectDetails && (
                  <div className="pt-2 border-t border-emerald-200/60 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-emerald-900">
                    <div>
                      <span className="font-bold text-slate-700">Regional Distribution: </span>
                      <span>{dialectInfo.regional_distribution}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">Vitality Status: </span>
                      <span>{dialectInfo.vitality_status}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-bold text-slate-700">Phonological Markers: </span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {dialectInfo.phonological_markers.map((marker, mIdx) => (
                          <span
                            key={mIdx}
                            className="bg-white/90 border border-emerald-300/80 px-2 py-0.5 rounded-md text-[11px] text-emerald-950 font-medium"
                          >
                            ✓ {marker}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Speaker Diarization Segmentation (v2.0 Module 1) */}
            {speakerTurns.length > 0 && (
              <div className="space-y-1.5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    Speaker Diarization ({speakerTurns.length} conversational turns)
                  </span>
                  <span className="text-[11px] font-normal text-slate-500">
                    Click any segment to seek
                  </span>
                </div>

                <div className="flex h-7 rounded-lg overflow-hidden border border-slate-300 gap-0.5 bg-slate-200 p-0.5">
                  {speakerTurns.map((turn, tIdx) => {
                    const totalDur = selectedTranscript?.duration_seconds || 1;
                    const widthPct = Math.max(8, ((turn.duration / totalDur) * 100));
                    const isCurrent = currentTime >= turn.start_time && currentTime <= turn.end_time;
                    const isElder = turn.speaker_label.toLowerCase().includes('elder') || turn.speaker_label.toLowerCase().includes('storyteller');

                    return (
                      <button
                        key={tIdx}
                        onClick={() => jumpToTime(turn.start_time)}
                        className={`h-full text-[10px] font-bold px-1.5 flex items-center justify-center transition-all truncate rounded ${
                          isElder
                            ? isCurrent
                              ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300'
                              : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'
                            : isCurrent
                            ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300'
                            : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-900'
                        }`}
                        style={{ width: `${widthPct}%` }}
                        title={`${turn.speaker_label}: ${turn.start_time}s - ${turn.end_time}s ("${turn.text_preview}...")`}
                      >
                        {turn.speaker_id} ({turn.speaker_label.split(' ')[0]})
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Hidden Audio Element */}
            {selectedTranscript?.audio_url && (
              <audio
                ref={audioRef}
                src={selectedTranscript.audio_url}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
              />
            )}

            {/* Waveform Visualization Canvas / SVG */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-500 font-mono">
                <span>{currentTime.toFixed(2)}s</span>
                <span>{selectedTranscript?.duration_seconds ? selectedTranscript.duration_seconds.toFixed(2) + 's' : '0.00s'}</span>
              </div>
              <div
                className="h-24 bg-slate-950 rounded-xl p-3 flex items-end gap-0.5 relative overflow-hidden cursor-pointer select-none"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                  const dur = selectedTranscript?.duration_seconds || 5;
                  jumpToTime(fraction * dur);
                }}
              >
                {/* Visualizer bars */}
                {waveformPeaks.length > 0 ? (
                  waveformPeaks.map((peak, idx) => {
                    const dur = selectedTranscript?.duration_seconds || 5;
                    const barTime = (idx / waveformPeaks.length) * dur;
                    const isPassed = currentTime >= barTime;
                    const heightPercent = Math.max(12, Math.min(100, peak * 100));

                    return (
                      <div
                        key={idx}
                        className={`flex-1 rounded-t-sm transition-colors ${
                          isPassed ? 'bg-emerald-400' : 'bg-slate-700 hover:bg-slate-500'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    );
                  })
                ) : (
                  <div className="w-full text-center text-xs text-slate-500 self-center">
                    Waveform peaks computing...
                  </div>
                )}

                {/* Scrubber indicator */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-rose-500 pointer-events-none shadow-sm"
                  style={{
                    left: `${((currentTime / (selectedTranscript?.duration_seconds || 1)) * 100).toFixed(1)}%`,
                  }}
                />
              </div>
            </div>

            {/* Transport & A-B Loop Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm flex items-center gap-2 shadow-sm transition-transform active:scale-95"
                >
                  {isPlaying ? (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                      Pause
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      Play
                    </>
                  )}
                </button>

                <button
                  onClick={() => jumpToTime(0)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-xs"
                >
                  Reset
                </button>

                {/* Noise Reduction Toggle Button (v2.0 Module 1) */}
                <button
                  onClick={handleToggleNoiseReduction}
                  disabled={isApplyingNoiseFilter}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                    isNoiseFiltered
                      ? 'bg-cyan-50 border-cyan-400 text-cyan-900 shadow-2xs font-bold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                  title="Apply high-pass spectral filter to attenuate sub-bass field microphone rumble"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                  {isNoiseFiltered ? 'Denoised Master Active' : 'Filter Rumble (Noise Reduction)'}
                  {noiseReduction && (
                    <span className="text-[10px] bg-cyan-200/60 px-1.5 py-0.2 rounded font-mono font-bold">
                      +{noiseReduction.snr_improvement_db}dB
                    </span>
                  )}
                </button>
              </div>

              {/* A-B Looping controls for pedagogical drill */}
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-slate-600">A-B Drill:</span>
                <button
                  onClick={() => setLoopA(currentTime)}
                  className={`px-2.5 py-1 rounded border font-medium ${
                    loopA !== null ? 'bg-amber-100 border-amber-300 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  Set [A] {loopA !== null ? `(${loopA.toFixed(1)}s)` : ''}
                </button>
                <button
                  onClick={() => setLoopB(currentTime)}
                  className={`px-2.5 py-1 rounded border font-medium ${
                    loopB !== null ? 'bg-amber-100 border-amber-300 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  Set [B] {loopB !== null ? `(${loopB.toFixed(1)}s)` : ''}
                </button>
                {loopA !== null && loopB !== null && (
                  <button
                    onClick={() => setIsLooping(!isLooping)}
                    className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                      isLooping ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isLooping ? 'Looping Active' : 'Start Loop'}
                  </button>
                )}
                {(loopA !== null || loopB !== null) && (
                  <button
                    onClick={() => {
                      setLoopA(null);
                      setLoopB(null);
                      setIsLooping(false);
                    }}
                    className="text-xs text-rose-500 hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Synchronized Karaoke Transcript Section (v2.0 Module 1) */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-800">
                    Synchronized Word Alignment ({alignments.length} tokens)
                  </h3>
                  {activeWord && (
                    <span className="text-xs font-mono px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold">
                      Current: "{activeWord.word_text}" {activeWord.phonetic_tokens} (Conf: {(activeWord.confidence * 100).toFixed(0)}%)
                    </span>
                  )}
                </div>

                {/* Filter Uncertain Words Toggle (v2.0 Module 1) */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFilterOnlyUncertain(!filterOnlyUncertain)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                      filterOnlyUncertain
                        ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-2xs'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    <Filter className="w-3 h-3" />
                    {filterOnlyUncertain
                      ? 'Showing Uncertain Only (<80% conf)'
                      : `Filter Uncertain (${alignments.filter((a) => a.confidence < 0.80 || a.is_uncertain).length})`}
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap gap-2.5 text-base leading-loose min-h-[100px]">
                {alignments.length > 0 ? (
                  alignments
                    .filter((a) => !filterOnlyUncertain || a.confidence < 0.80 || a.is_uncertain)
                    .map((a, i) => {
                      const isActive = currentTime >= a.start_time && currentTime <= a.end_time;
                      const isUncertain = a.confidence < 0.80 || a.is_uncertain;

                      return (
                        <div
                          key={i}
                          className={`rounded-xl px-3 py-2 text-sm transition-all duration-150 relative group flex flex-col items-center justify-between min-w-[70px] ${
                            isActive
                              ? 'bg-emerald-600 text-white font-bold shadow-md scale-105 ring-2 ring-emerald-300'
                              : isUncertain
                              ? 'bg-amber-50/90 text-amber-950 border-2 border-amber-300 hover:border-amber-400'
                              : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-1 w-full justify-between">
                            <button
                              onClick={() => jumpToTime(a.start_time)}
                              className="font-bold text-left hover:underline flex-1 truncate"
                              title={`Jump to ${a.start_time}s`}
                            >
                              {a.word_text}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenCorrection(a);
                              }}
                              className={`p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                                isActive ? 'text-white hover:bg-emerald-700' : 'text-slate-500 hover:text-emerald-700'
                              }`}
                              title="Propose Word or IPA Correction"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Phonetic IPA representation (v2.0 Module 1) */}
                          <span
                            className={`text-[10px] font-mono tracking-tight mt-0.5 ${
                              isActive ? 'text-emerald-100' : isUncertain ? 'text-amber-800 font-semibold' : 'text-teal-700'
                            }`}
                          >
                            {a.phonetic_tokens || `/${a.word_text}/`}
                          </span>

                          <div className="flex items-center justify-between w-full mt-1 pt-1 border-t border-slate-200/50 text-[9px] font-mono">
                            <span className={isActive ? 'text-emerald-200' : 'text-slate-500'}>
                              {a.start_time.toFixed(1)}s
                            </span>
                            <span
                              className={`px-1 py-0.2 rounded font-bold ${
                                isUncertain
                                  ? 'bg-amber-200 text-amber-900 flex items-center gap-0.5'
                                  : isActive
                                  ? 'bg-emerald-700 text-white'
                                  : 'text-slate-500'
                              }`}
                            >
                              {isUncertain && <AlertTriangle className="w-2.5 h-2.5 text-amber-700 inline" />}
                              {(a.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="text-slate-400 text-sm italic">
                    No word alignment timestamps available for this audio file.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Minimal Pairs & Pronunciation Practice */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-block text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md mb-1">
              OCAP Certified Practice Hub
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              Phonemic Contrast & Minimal Pairs Practice
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Master critical phonological distinctions in Gondi, Koya, Santhali, and Lambadi. All scores are reviewed by native elders.
            </p>
          </div>

          {/* Language filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Language:</span>
            {['All', 'Gondi', 'Koya', 'Santhali', 'Lambadi'].map((lang) => (
              <button
                key={lang}
                onClick={() => setFilterLanguage(lang)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterLanguage === lang
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Exercises Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredExercises.map((ex) => (
            <div
              key={ex.exercise_id}
              onClick={() => setSelectedExercise(ex)}
              className={`p-5 rounded-xl border text-left cursor-pointer transition-all ${
                selectedExercise?.exercise_id === ex.exercise_id
                  ? 'border-teal-600 bg-teal-50/40 shadow-sm ring-1 ring-teal-500'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 rounded uppercase">
                  {ex.language} • {ex.difficulty_level}
                </span>
                <span className="text-xs font-mono text-teal-700 font-semibold">{ex.phonetic_target_ipa}</span>
              </div>
              <div className="text-xl font-black text-slate-900 flex items-baseline gap-2">
                <span>{ex.target_text}</span>
                {ex.target_native_script && (
                  <span className="text-sm font-normal text-slate-500 font-serif">({ex.target_native_script})</span>
                )}
              </div>
              {ex.minimal_pair_with && (
                <div className="text-xs text-slate-600 mt-2">
                  <span className="font-semibold text-rose-700">Contrast:</span> vs {ex.minimal_pair_with}
                  {ex.minimal_pair_ipa && <span className="font-mono text-slate-500 ml-1">({ex.minimal_pair_ipa})</span>}
                </div>
              )}
              {ex.distinction_note && (
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">{ex.distinction_note}</p>
              )}
            </div>
          ))}
        </div>

        {/* Selected Exercise Practice Panel */}
        {selectedExercise && (
          <div className="mt-8 bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap justify-between items-start gap-4">
              <div>
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                  Active Exercise • {selectedExercise.language} ({selectedExercise.variety || 'Native dialect'})
                </span>
                <h3 className="text-2xl font-extrabold mt-1 text-white">
                  Target: "{selectedExercise.target_text}" {selectedExercise.phonetic_target_ipa}
                </h3>
                {selectedExercise.distinction_note && (
                  <p className="text-slate-300 text-sm mt-2 max-w-2xl">{selectedExercise.distinction_note}</p>
                )}
              </div>

              {/* Record Button */}
              <div className="flex items-center gap-3">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-lg transition-transform active:scale-95"
                  >
                    <span className="w-3 h-3 rounded-full bg-white animate-ping"></span>
                    Record Pronunciation
                  </button>
                ) : (
                  <button
                    onClick={stopRecordingAndEvaluate}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-sm flex items-center gap-2 shadow-lg animate-pulse"
                  >
                    <span className="w-3 h-3 rounded bg-slate-950"></span>
                    Stop & Analyze ({recordingSeconds}s)
                  </button>
                )}
              </div>
            </div>

            {/* Evaluation Result & Elder Review Gate */}
            {practiceAttempt && (
              <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-6 space-y-5">
                <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-700 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-white">Acoustic Score:</span>
                    <span className="text-2xl font-black text-teal-400">
                      {(practiceAttempt.acoustic_score * 100).toFixed(0)}%
                    </span>
                    <span className="text-xs text-slate-400">
                      (Phoneme Accuracy: {(practiceAttempt.phoneme_accuracy * 100).toFixed(0)}%)
                    </span>
                  </div>

                  {/* Status badge */}
                  <div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        practiceAttempt.status === 'VERIFIED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : practiceAttempt.status === 'RETRY_SUGGESTED'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      }`}
                    >
                      Gate: {practiceAttempt.status}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-lg border border-slate-800">
                  <span className="font-bold text-amber-400">OCAP Governance Note:</span> Automated acoustic similarity is strictly provisional. Indigenous phonetic cadence and vowel duration are verified by authorized native speaker elders before certification.
                </div>

                {/* Elder Review Panel */}
                <div className="space-y-3 pt-2">
                  <label className="text-xs font-bold text-slate-300 block">
                    Elder Review Feedback & Cadence Notes:
                  </label>
                  <input
                    type="text"
                    value={elderNotes}
                    onChange={(e) => setElderNotes(e.target.value)}
                    placeholder="Enter phonetic feedback or tone remarks (e.g., 'Good velar aspiration; practice open vowel duration')."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => submitElderReview('VERIFIED')}
                      disabled={isSubmittingReview}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      Verify Pronunciation
                    </button>
                    <button
                      onClick={() => submitElderReview('RETRY_SUGGESTED')}
                      disabled={isSubmittingReview}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-lg transition-colors"
                    >
                      Suggest Retake
                    </button>
                    {practiceAttempt.reviewed_by && (
                      <span className="text-xs text-slate-400 ml-auto">
                        Reviewed by {practiceAttempt.reviewed_by} at {practiceAttempt.reviewed_at?.slice(0, 10)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Word & Phonetic Correction Modal (v2.0 Module 1) */}
      {correctionModalWord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-700 text-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-base text-white">Propose Word Correction</h3>
              </div>
              <button
                onClick={() => setCorrectionModalWord(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-1 bg-slate-950/50 p-3 rounded-lg border border-slate-800">
              <div>
                <span className="text-slate-500">Original Spoken Token: </span>
                <span className="font-bold text-amber-300 text-sm">"{correctionModalWord.word_text}"</span>
              </div>
              <div>
                <span className="text-slate-500">Time Interval: </span>
                <span className="font-mono text-slate-300">
                  {correctionModalWord.start_time.toFixed(2)}s - {correctionModalWord.end_time.toFixed(2)}s
                </span>
                <span className="ml-2 text-slate-500">Confidence: </span>
                <span className="font-mono text-amber-400">{(correctionModalWord.confidence * 100).toFixed(0)}%</span>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Corrected Spelling / Vernacular Text:</label>
                <input
                  type="text"
                  value={suggestedWordText}
                  onChange={(e) => setSuggestedWordText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. kōr, pēn, māṭi"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Phonetic IPA Representation:</label>
                <input
                  type="text"
                  value={suggestedWordIpa}
                  onChange={(e) => setSuggestedWordIpa(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  placeholder="/køːr/, /ʈ, ɖ/ retroflex markers"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Dialect / Variety Note:</label>
                <input
                  type="text"
                  value={correctionDialectNote}
                  onChange={(e) => setCorrectionDialectNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. Adilabad Southern dialect variant"
                />
              </div>

              <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-[11px] text-emerald-200 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>OCAP Guardrail:</strong> Your proposed correction will be queued for Native Elder Review. The master audio recording remains untouched.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                onClick={() => setCorrectionModalWord(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitWordCorrection}
                disabled={isSubmittingCorrection || !suggestedWordText.trim()}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isSubmittingCorrection ? 'Submitting...' : 'Submit to Elder Queue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
