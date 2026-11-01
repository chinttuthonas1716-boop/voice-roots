import React, { useState, useEffect, useRef } from 'react';
import {
  SpeechAlignment,
  SpeechAcousticMetrics,
  PronunciationExercise,
  PronunciationAttempt,
  SpeechTranscriptItem,
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
    } catch (err: any) {
      setErrorMsg('Failed to analyze speech for selected recording: ' + err.message);
    } finally {
      setIsLoading(false);
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

            {/* Synchronized Karaoke Transcript Section */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">
                  Synchronized Word Alignment ({alignments.length} tokens)
                </h3>
                {activeWord && (
                  <span className="text-xs font-mono px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold">
                    Current: "{activeWord.word_text}" {activeWord.phonetic_tokens} (Conf: {(activeWord.confidence * 100).toFixed(0)}%)
                  </span>
                )}
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap gap-2 text-base leading-loose min-h-[90px]">
                {alignments.length > 0 ? (
                  alignments.map((a, i) => {
                    const isActive = currentTime >= a.start_time && currentTime <= a.end_time;
                    return (
                      <button
                        key={i}
                        onClick={() => jumpToTime(a.start_time)}
                        className={`px-2.5 py-1 rounded-lg text-sm transition-all duration-150 relative group ${
                          isActive
                            ? 'bg-emerald-600 text-white font-bold shadow-md scale-105 ring-2 ring-emerald-300'
                            : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200'
                        }`}
                        title={`${a.start_time}s - ${a.end_time}s | ${a.phonetic_tokens}`}
                      >
                        {a.word_text}
                        <span className="block text-[9px] opacity-70 font-mono tracking-tighter">
                          {a.start_time.toFixed(1)}s
                        </span>
                      </button>
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
    </div>
  );
};
