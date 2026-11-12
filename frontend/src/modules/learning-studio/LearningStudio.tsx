import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Sparkles,
  Volume2,
  RotateCw,
  CheckCircle2,
  XCircle,
  Activity,
  Mic,
  Headphones,
  Puzzle,
  RefreshCw,
  Sliders,
  ChevronRight,
  Info,
} from 'lucide-react';

interface SrsCard {
  card_id: string;
  learner_id: string;
  language: string;
  variety?: string;
  front_prompt: string;
  front_audio_url?: string;
  back_meaning: string;
  back_ipa?: string;
  cultural_context?: string;
  repetition_number: number;
  ease_factor: number;
  interval_days: number;
  leitner_box: number;
  due_date: string;
  last_reviewed_at?: string;
}

interface SentenceDrill {
  drill_id: string;
  language: string;
  title: string;
  cultural_context: string;
  target_sentence: string;
  target_audio_url?: string;
  scrambled_tokens: string[];
  syntax_pattern: string;
  translation_english: string;
}

interface ListeningQuizOption {
  id: string;
  text: string;
  is_correct?: boolean;
}

interface ListeningQuiz {
  quiz_id: string;
  language: string;
  title: string;
  audio_prompt_url: string;
  audio_duration_seconds: number;
  question_text: string;
  options: ListeningQuizOption[];
  cultural_note: string;
}

interface LearnerAnalytics {
  total_cards_enrolled: number;
  cards_mastered: number;
  total_reviews_completed: number;
  retention_rate_pct: number;
  average_recall_grade: number;
  leitner_box_distribution: {
    box_1_daily: number;
    box_2_semiweekly: number;
    box_3_weekly: number;
    box_4_biweekly: number;
    box_5_mastered: number;
  };
  oral_proficiency_tier: string;
}

interface LearningStudioProps {
  apiBaseUrl?: string;
  learnerId?: string;
}

type StudioTab = 'srs' | 'formants' | 'quizzes' | 'drills' | 'analytics';

export const LearningStudio: React.FC<LearningStudioProps> = ({
  apiBaseUrl = '/api/v1',
  learnerId = 'active_clan_learner',
}) => {
  const [activeTab, setActiveTab] = useState<StudioTab>('srs');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // SRS State
  const [srsCards, setSrsCards] = useState<SrsCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);

  // Formant Lab State
  const [formantLanguage, setFormantLanguage] = useState<string>('Gondi');
  const [formantPhoneme, setFormantPhoneme] = useState<string>('Open Low-Central Vowel /a/');
  const [studentF0, setStudentF0] = useState<number>(135);
  const [studentF1, setStudentF1] = useState<number>(730);
  const [studentF2, setStudentF2] = useState<number>(1280);
  const [formantResult, setFormantResult] = useState<any>(null);
  const [isEvaluatingFormants, setIsEvaluatingFormants] = useState<boolean>(false);

  // Drills State
  const [drills, setDrills] = useState<SentenceDrill[]>([]);
  const [activeDrillIndex, setActiveDrillIndex] = useState<number>(0);
  const [assembledTokens, setAssembledTokens] = useState<string[]>([]);
  const [drillFeedback, setDrillFeedback] = useState<any>(null);

  // Quizzes State
  const [quizzes, setQuizzes] = useState<ListeningQuiz[]>([]);
  const [activeQuizIndex, setActiveQuizIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<any>(null);

  // Analytics & Offline State
  const [analytics, setAnalytics] = useState<LearnerAnalytics | null>(null);
  const [offlineQueue, setOfflineQueue] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('voice_roots_offline_learning');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [syncStatusMessage, setSyncStatusMessage] = useState<string | null>(null);

  // Initial Data Fetch
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    Promise.all([
      fetch(`${apiBaseUrl}/learning/srs/queue?learner_id=${learnerId}&include_future=true`).then((r) => r.json()),
      fetch(`${apiBaseUrl}/learning/drills`).then((r) => r.json()),
      fetch(`${apiBaseUrl}/learning/quizzes`).then((r) => r.json()),
      fetch(`${apiBaseUrl}/learning/analytics/${learnerId}`).then((r) => r.json()),
    ])
      .then(([srsData, drillData, quizData, analyticsData]) => {
        if (!isMounted) return;
        if (srsData && srsData.cards) {
          setSrsCards(srsData.cards);
        }
        if (Array.isArray(drillData)) {
          setDrills(drillData);
          if (drillData.length > 0) {
            setAssembledTokens([]);
          }
        }
        if (Array.isArray(quizData)) {
          setQuizzes(quizData);
        }
        if (analyticsData && analyticsData.status === 'success') {
          setAnalytics(analyticsData);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to load Learning Studio data:', err);
        setError('Failed to fetch pedagogical learning resources. Please verify backend service.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [apiBaseUrl, learnerId]);

  // Handle SRS Review Grade (0-5)
  const handleSrsReview = async (grade: number) => {
    if (!srsCards[currentCardIndex]) return;
    const card = srsCards[currentCardIndex];

    try {
      const res = await fetch(`${apiBaseUrl}/learning/srs/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          card_id: card.card_id,
          learner_id: learnerId,
          grade,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setReviewMessage(
          `Review logged (Grade: ${grade})! Leitner Box: ${data.updated_leitner_box} • Next Review: ${data.updated_interval_days} day(s)`
        );
        // Refresh analytics
        fetch(`${apiBaseUrl}/learning/analytics/${learnerId}`)
          .then((r) => r.json())
          .then((a) => { if (a && a.status === 'success') setAnalytics(a); });

        // Advance to next card
        setTimeout(() => {
          setIsFlipped(false);
          setReviewMessage(null);
          if (currentCardIndex + 1 < srsCards.length) {
            setCurrentCardIndex((prev) => prev + 1);
          } else {
            setCurrentCardIndex(0);
          }
        }, 1200);
      }
    } catch {
      // Offline fallback: save event locally
      const event = {
        type: 'srs_review',
        payload: { card_id: card.card_id, grade },
        timestamp: new Date().toISOString(),
      };
      const updated = [...offlineQueue, event];
      setOfflineQueue(updated);
      try {
        localStorage.setItem('voice_roots_offline_learning', JSON.stringify(updated));
      } catch {}
      setReviewMessage(`Offline: Review cached locally (Grade: ${grade}). Will sync upon reconnect.`);
      setTimeout(() => {
        setIsFlipped(false);
        setReviewMessage(null);
        if (currentCardIndex + 1 < srsCards.length) {
          setCurrentCardIndex((prev) => prev + 1);
        } else {
          setCurrentCardIndex(0);
        }
      }, 1200);
    }
  };

  // Evaluate Formants
  const handleEvaluateFormants = async () => {
    setIsEvaluatingFormants(true);
    setFormantResult(null);

    try {
      const res = await fetch(`${apiBaseUrl}/learning/formants/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneme_or_word: formantPhoneme,
          student_f0: studentF0,
          student_f1: studentF1,
          student_f2: studentF2,
          language: formantLanguage,
        }),
      });
      const data = await res.json();
      setFormantResult(data);
    } catch (err) {
      console.error('Failed to evaluate formants:', err);
    } finally {
      setIsEvaluatingFormants(false);
    }
  };

  // Sentence Drill Tokens
  const handleAddToken = (token: string) => {
    setAssembledTokens((prev) => [...prev, token]);
  };

  const handleRemoveToken = (index: number) => {
    setAssembledTokens((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitDrill = async () => {
    const drill = drills[activeDrillIndex];
    if (!drill) return;

    try {
      const res = await fetch(`${apiBaseUrl}/learning/drills/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learner_id: learnerId,
          drill_id: drill.drill_id,
          assembled_tokens: assembledTokens,
        }),
      });
      const data = await res.json();
      setDrillFeedback(data);
    } catch {
      // Offline fallback
      const isCorrect = assembledTokens.join(' ') === drill.target_sentence;
      setDrillFeedback({
        is_correct: isCorrect,
        assembled_sentence: assembledTokens.join(' '),
        expected_sentence: drill.target_sentence,
        syntax_pattern: drill.syntax_pattern,
        cultural_context: drill.cultural_context,
        translation_english: drill.translation_english,
      });
    }
  };

  // Listening Quiz Submit
  const handleSubmitQuiz = async () => {
    const quiz = quizzes[activeQuizIndex];
    if (!quiz || !selectedOptionId) return;

    try {
      const res = await fetch(`${apiBaseUrl}/learning/quizzes/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learner_id: learnerId,
          quiz_id: quiz.quiz_id,
          selected_option_id: selectedOptionId,
        }),
      });
      const data = await res.json();
      setQuizFeedback(data);
    } catch {
      const chosen = quiz.options.find((o) => o.id === selectedOptionId);
      setQuizFeedback({
        is_correct: Boolean(chosen?.is_correct),
        cultural_note: quiz.cultural_note,
      });
    }
  };

  // Batch Sync Offline Progress
  const handleSyncOffline = async () => {
    if (offlineQueue.length === 0) {
      setSyncStatusMessage('No offline events queued for synchronization.');
      setTimeout(() => setSyncStatusMessage(null), 2500);
      return;
    }

    try {
      const res = await fetch(`${apiBaseUrl}/learning/offline-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learner_id: learnerId,
          events: offlineQueue,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setOfflineQueue([]);
        localStorage.removeItem('voice_roots_offline_learning');
        setSyncStatusMessage(`Successfully synced ${data.total_events_received} offline actions!`);
        // Refresh analytics
        fetch(`${apiBaseUrl}/learning/analytics/${learnerId}`)
          .then((r) => r.json())
          .then((a) => { if (a && a.status === 'success') setAnalytics(a); });
      }
    } catch (err) {
      console.error('Offline sync failed:', err);
      setSyncStatusMessage('Sync failed. Please check network connectivity.');
    }
    setTimeout(() => setSyncStatusMessage(null), 3500);
  };

  const currentCard = srsCards[currentCardIndex];
  const currentDrill = drills[activeDrillIndex];
  const currentQuiz = quizzes[activeQuizIndex];

  return (
    <div
      style={{
        backgroundColor: '#0B2B26',
        color: '#DAF1DE',
        borderRadius: '16px',
        padding: '28px',
        border: '1px solid rgba(142, 182, 155, 0.25)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* ─── Top Header Banner ─── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          borderBottom: '1px solid rgba(142, 182, 155, 0.2)',
          paddingBottom: '20px',
          marginBottom: '24px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <GraduationCap style={{ color: '#8EB69B', width: '28px', height: '28px' }} />
            <h2 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0, color: '#DAF1DE' }}>
              Advanced Oral Learning Studio & Formant Lab
            </h2>
          </div>
          <p style={{ margin: '6px 0 0 0', color: 'rgba(218, 241, 222, 0.75)', fontSize: '0.92rem' }}>
            SuperMemo SM-2 spaced repetition, acoustic formant analysis, Dravidian SOV syntax drills, and offline sync.
          </p>
        </div>

        {/* Studio Modes Navigation */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#163832',
            padding: '4px',
            borderRadius: '12px',
            border: '1px solid rgba(142, 182, 155, 0.3)',
            gap: '4px',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => setActiveTab('srs')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.86rem',
              fontWeight: 600,
              backgroundColor: activeTab === 'srs' ? '#235347' : 'transparent',
              color: activeTab === 'srs' ? '#DAF1DE' : 'rgba(218, 241, 222, 0.65)',
            }}
          >
            <RotateCw style={{ width: '15px', height: '15px' }} />
            SRS Flashcards
          </button>
          <button
            onClick={() => setActiveTab('formants')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.86rem',
              fontWeight: 600,
              backgroundColor: activeTab === 'formants' ? '#235347' : 'transparent',
              color: activeTab === 'formants' ? '#DAF1DE' : 'rgba(218, 241, 222, 0.65)',
            }}
          >
            <Mic style={{ width: '15px', height: '15px' }} />
            Formant Lab
          </button>
          <button
            onClick={() => setActiveTab('quizzes')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.86rem',
              fontWeight: 600,
              backgroundColor: activeTab === 'quizzes' ? '#235347' : 'transparent',
              color: activeTab === 'quizzes' ? '#DAF1DE' : 'rgba(218, 241, 222, 0.65)',
            }}
          >
            <Headphones style={{ width: '15px', height: '15px' }} />
            Listening Quizzes
          </button>
          <button
            onClick={() => setActiveTab('drills')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.86rem',
              fontWeight: 600,
              backgroundColor: activeTab === 'drills' ? '#235347' : 'transparent',
              color: activeTab === 'drills' ? '#DAF1DE' : 'rgba(218, 241, 222, 0.65)',
            }}
          >
            <Puzzle style={{ width: '15px', height: '15px' }} />
            Syntax Drills
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.86rem',
              fontWeight: 600,
              backgroundColor: activeTab === 'analytics' ? '#235347' : 'transparent',
              color: activeTab === 'analytics' ? '#DAF1DE' : 'rgba(218, 241, 222, 0.65)',
            }}
          >
            <Activity style={{ width: '15px', height: '15px' }} />
            Analytics & Sync
          </button>
        </div>
      </div>

      {/* Sync Status Banner */}
      {syncStatusMessage && (
        <div
          style={{
            backgroundColor: '#163832',
            border: '1px solid #8EB69B',
            borderRadius: '8px',
            padding: '10px 16px',
            marginBottom: '16px',
            fontSize: '0.88rem',
            color: '#DAF1DE',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <RefreshCw style={{ width: '16px', height: '16px', color: '#8EB69B' }} />
          <span>{syncStatusMessage}</span>
        </div>
      )}

      {/* Loading & Error States */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8EB69B' }}>
          <Sparkles style={{ width: '32px', height: '32px', animation: 'spin 2s linear infinite', marginBottom: '12px' }} />
          <p style={{ fontSize: '1rem', fontWeight: 500 }}>Initializing Spaced Repetition decks and acoustic formant lab...</p>
        </div>
      )}

      {error && (
        <div
          style={{
            backgroundColor: 'rgba(224, 122, 95, 0.15)',
            border: '1px solid #E07A5F',
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '20px',
            color: '#FFB4A2',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <Info style={{ width: '20px', height: '20px', flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* TAB 1: SPACED REPETITION FLASHCARDS (SUPERMEMO SM-2)           */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'srs' && currentCard && (
            <div style={{ maxWidth: '680px', margin: '0 auto' }}>
              {/* Card Meta Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: '#163832',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      color: '#8EB69B',
                    }}
                  >
                    {currentCard.language} • {currentCard.variety || 'Traditional'}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(218, 241, 222, 0.6)' }}>
                    Card {currentCardIndex + 1} of {srsCards.length}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#E9D8A6', fontWeight: 600 }}>
                    Leitner Box {currentCard.leitner_box}/5
                  </span>
                  <div style={{ display: 'flex', gap: '3px' }}>
                    {[1, 2, 3, 4, 5].map((b) => (
                      <span
                        key={b}
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '2px',
                          backgroundColor: b <= currentCard.leitner_box ? '#52B788' : 'rgba(255,255,255,0.15)',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Interactive Flip Card */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                style={{
                  backgroundColor: '#163832',
                  border: '2px solid rgba(142, 182, 155, 0.35)',
                  borderRadius: '16px',
                  minHeight: '280px',
                  padding: '36px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  textAlign: 'center',
                  position: 'relative',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  transition: 'all 0.2s ease',
                }}
              >
                {!isFlipped ? (
                  <div>
                    <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#DAF1DE', marginBottom: '12px' }}>
                      {currentCard.front_prompt}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#8EB69B', fontSize: '0.9rem' }}>
                      <Volume2 style={{ width: '18px', height: '18px' }} />
                      <span>Click to flip & reveal meaning</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#E9D8A6', marginBottom: '8px' }}>
                      {currentCard.back_meaning}
                    </div>
                    {currentCard.back_ipa && (
                      <div style={{ fontFamily: 'monospace', fontSize: '1.05rem', color: '#8EB69B', marginBottom: '14px' }}>
                        {currentCard.back_ipa}
                      </div>
                    )}
                    {currentCard.cultural_context && (
                      <div
                        style={{
                          fontSize: '0.85rem',
                          color: 'rgba(218, 241, 222, 0.85)',
                          maxWidth: '480px',
                          lineHeight: 1.5,
                          backgroundColor: 'rgba(0,0,0,0.2)',
                          padding: '10px 14px',
                          borderRadius: '8px',
                        }}
                      >
                        <strong>Cultural Provenance:</strong> {currentCard.cultural_context}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Review Feedback Message */}
              {reviewMessage && (
                <div
                  style={{
                    backgroundColor: '#1B4332',
                    border: '1px solid #52B788',
                    color: '#DAF1DE',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    marginTop: '12px',
                    fontSize: '0.86rem',
                  }}
                >
                  {reviewMessage}
                </div>
              )}

              {/* SuperMemo Recall Rating Buttons (0 to 5) */}
              {isFlipped && (
                <div style={{ marginTop: '20px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#8EB69B', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px', textAlign: 'center' }}>
                    Rate Your Oral Recall (SuperMemo SM-2 Interval Calculation):
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
                    <button
                      onClick={() => handleSrsReview(0)}
                      style={{
                        padding: '10px 4px',
                        borderRadius: '8px',
                        border: '1px solid #E07A5F',
                        backgroundColor: '#2A1810',
                        color: '#FFB4A2',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      0<br /><span style={{ fontSize: '0.68rem', fontWeight: 400 }}>Blackout</span>
                    </button>
                    <button
                      onClick={() => handleSrsReview(1)}
                      style={{
                        padding: '10px 4px',
                        borderRadius: '8px',
                        border: '1px solid #E07A5F',
                        backgroundColor: '#2A1810',
                        color: '#FFB4A2',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      1<br /><span style={{ fontSize: '0.68rem', fontWeight: 400 }}>Failed</span>
                    </button>
                    <button
                      onClick={() => handleSrsReview(2)}
                      style={{
                        padding: '10px 4px',
                        borderRadius: '8px',
                        border: '1px solid #F4A261',
                        backgroundColor: '#2A2010',
                        color: '#F4A261',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      2<br /><span style={{ fontSize: '0.68rem', fontWeight: 400 }}>Difficult</span>
                    </button>
                    <button
                      onClick={() => handleSrsReview(3)}
                      style={{
                        padding: '10px 4px',
                        borderRadius: '8px',
                        border: '1px solid #8EB69B',
                        backgroundColor: '#163832',
                        color: '#DAF1DE',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      3<br /><span style={{ fontSize: '0.68rem', fontWeight: 400 }}>Passed</span>
                    </button>
                    <button
                      onClick={() => handleSrsReview(4)}
                      style={{
                        padding: '10px 4px',
                        borderRadius: '8px',
                        border: '1px solid #52B788',
                        backgroundColor: '#1B4332',
                        color: '#DAF1DE',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      4<br /><span style={{ fontSize: '0.68rem', fontWeight: 400 }}>Good</span>
                    </button>
                    <button
                      onClick={() => handleSrsReview(5)}
                      style={{
                        padding: '10px 4px',
                        borderRadius: '8px',
                        border: '1px solid #52B788',
                        backgroundColor: '#235347',
                        color: '#E9D8A6',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      5<br /><span style={{ fontSize: '0.68rem', fontWeight: 400 }}>Perfect</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* TAB 2: PRONUNCIATION LAB & FORMANT MATCHING                    */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'formants' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
              {/* Formant Inputs Panel */}
              <div
                style={{
                  backgroundColor: '#163832',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid rgba(142, 182, 155, 0.25)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Sliders style={{ width: '20px', height: '20px', color: '#8EB69B' }} />
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#DAF1DE', fontWeight: 700 }}>
                    Acoustic Articulatory Controls
                  </h3>
                </div>

                {/* Language & Target Phoneme */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#8EB69B', marginBottom: '4px' }}>
                    Language & Target Phoneme:
                  </label>
                  <select
                    value={formantPhoneme}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormantPhoneme(val);
                      if (val.includes('Koya')) setFormantLanguage('Koya');
                      else if (val.includes('Santhali')) setFormantLanguage('Santhali');
                      else setFormantLanguage('Gondi');
                    }}
                    style={{
                      width: '100%',
                      backgroundColor: '#0B2B26',
                      border: '1px solid rgba(142, 182, 155, 0.3)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#DAF1DE',
                      fontSize: '0.88rem',
                    }}
                  >
                    <option value="Open Low-Central Vowel /a/">Gondi: Open Low-Central Vowel /a/</option>
                    <option value="Retroflex Lateral Flap /ɭ/">Gondi: Retroflex Lateral Flap /ɭ/</option>
                    <option value="Close-Mid Front Long Vowel /eː/">Koya: Close-Mid Front Long Vowel /eː/</option>
                    <option value="Glottal Stop /ʔ/">Santhali: Ol Chiki Glottal Stop /ʔ/</option>
                  </select>
                </div>

                {/* Formant Sliders */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '2px' }}>
                    <span>Pitch Fundamental (F₀):</span>
                    <strong style={{ color: '#8EB69B' }}>{studentF0} Hz</strong>
                  </div>
                  <input
                    type="range"
                    min="80"
                    max="280"
                    value={studentF0}
                    onChange={(e) => setStudentF0(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '2px' }}>
                    <span>Vowel Aperture / Height (F₁):</span>
                    <strong style={{ color: '#8EB69B' }}>{studentF1} Hz</strong>
                  </div>
                  <input
                    type="range"
                    min="250"
                    max="1100"
                    value={studentF1}
                    onChange={(e) => setStudentF1(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '2px' }}>
                    <span>Tongue Backness / Frontness (F₂):</span>
                    <strong style={{ color: '#8EB69B' }}>{studentF2} Hz</strong>
                  </div>
                  <input
                    type="range"
                    min="700"
                    max="2600"
                    value={studentF2}
                    onChange={(e) => setStudentF2(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>

                <button
                  onClick={handleEvaluateFormants}
                  disabled={isEvaluatingFormants}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#235347',
                    color: '#DAF1DE',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <Activity style={{ width: '16px', height: '16px' }} />
                  {isEvaluatingFormants ? 'Evaluating...' : 'Evaluate Formant Alignment'}
                </button>
              </div>

              {/* Formant Results Panel */}
              <div
                style={{
                  backgroundColor: '#163832',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid rgba(142, 182, 155, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <h3 style={{ margin: '0 0 14px 0', fontSize: '1.2rem', color: '#DAF1DE', fontWeight: 700 }}>
                    Elder Acoustic Benchmark Comparison
                  </h3>

                  {formantResult ? (
                    <div>
                      {/* Match Score Gauge */}
                      <div
                        style={{
                          backgroundColor: '#0E2924',
                          padding: '16px',
                          borderRadius: '10px',
                          marginBottom: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.78rem', color: 'rgba(218, 241, 222, 0.65)', textTransform: 'uppercase' }}>
                            Acoustic Match Score
                          </div>
                          <div style={{ fontSize: '2rem', fontWeight: 800, color: formantResult.is_verified_mastery ? '#52B788' : '#F4A261' }}>
                            {formantResult.acoustic_match_percentage}%
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            padding: '4px 10px',
                            borderRadius: '8px',
                            backgroundColor: formantResult.is_verified_mastery ? 'rgba(82, 183, 136, 0.2)' : 'rgba(244, 162, 97, 0.2)',
                            color: formantResult.is_verified_mastery ? '#52B788' : '#F4A261',
                          }}
                        >
                          {formantResult.is_verified_mastery ? 'Mastery Verified' : 'Practice Recommended'}
                        </div>
                      </div>

                      {/* Reference vs Measured Formants */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px', fontSize: '0.8rem' }}>
                        <div style={{ backgroundColor: '#1B4332', padding: '8px', borderRadius: '6px' }}>
                          <span style={{ color: 'rgba(218, 241, 222, 0.6)' }}>F₀ Pitch:</span><br />
                          <strong>{formantResult.measured_formants.f0_pitch_hz}</strong> / {formantResult.reference_formants.f0_pitch_hz} Hz
                        </div>
                        <div style={{ backgroundColor: '#1B4332', padding: '8px', borderRadius: '6px' }}>
                          <span style={{ color: 'rgba(218, 241, 222, 0.6)' }}>F₁ Aperture:</span><br />
                          <strong>{formantResult.measured_formants.f1_aperture_hz}</strong> / {formantResult.reference_formants.f1_aperture_hz} Hz
                        </div>
                        <div style={{ backgroundColor: '#1B4332', padding: '8px', borderRadius: '6px' }}>
                          <span style={{ color: 'rgba(218, 241, 222, 0.6)' }}>F₂ Backness:</span><br />
                          <strong>{formantResult.measured_formants.f2_frontness_hz}</strong> / {formantResult.reference_formants.f2_frontness_hz} Hz
                        </div>
                      </div>

                      {/* Articulatory Guidance */}
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '0.76rem', color: '#8EB69B', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
                          Articulatory Guide:
                        </div>
                        <div style={{ fontSize: '0.84rem', color: '#DAF1DE', fontStyle: 'italic' }}>
                          "{formantResult.articulatory_guide}"
                        </div>
                      </div>

                      {/* Diagnostic Tips */}
                      <div>
                        <div style={{ fontSize: '0.76rem', color: '#8EB69B', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
                          Diagnostic Feedback:
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.82rem', color: 'rgba(218, 241, 222, 0.85)' }}>
                          {formantResult.diagnostic_feedback.map((tip: string, idx: number) => (
                            <li key={idx} style={{ marginBottom: '3px' }}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px 10px', color: 'rgba(218, 241, 222, 0.5)' }}>
                      Adjust the acoustic sliders on the left and click "Evaluate Formant Alignment" to compare with elder recordings.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* TAB 3: AUDIO-FIRST LISTENING COMPREHENSION QUIZZES             */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'quizzes' && currentQuiz && (
            <div style={{ maxWidth: '680px', margin: '0 auto' }}>
              <div
                style={{
                  backgroundColor: '#163832',
                  padding: '24px',
                  borderRadius: '16px',
                  border: '1px solid rgba(142, 182, 155, 0.25)',
                }}
              >
                {/* Meta */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ fontSize: '0.78rem', backgroundColor: '#0B2B26', color: '#8EB69B', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                    {currentQuiz.language} Oral Quiz
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(218, 241, 222, 0.6)' }}>
                    Quiz {activeQuizIndex + 1} of {quizzes.length}
                  </span>
                </div>

                <h3 style={{ margin: '0 0 12px 0', fontSize: '1.25rem', color: '#DAF1DE', fontWeight: 700 }}>
                  {currentQuiz.title}
                </h3>

                {/* Audio Prompt Player */}
                <div
                  style={{
                    backgroundColor: '#1B4332',
                    padding: '16px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '18px',
                  }}
                >
                  <button
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#52B788',
                      border: 'none',
                      color: '#0B2B26',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <Volume2 style={{ width: '20px', height: '20px' }} />
                  </button>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#DAF1DE' }}>
                      Native Elder Oral Utterance ({currentQuiz.audio_duration_seconds}s)
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(218, 241, 222, 0.65)' }}>
                      Listen carefully to the oral cadence and phrasing.
                    </div>
                  </div>
                </div>

                {/* Question */}
                <p style={{ fontSize: '0.94rem', color: '#DAF1DE', lineHeight: 1.5, marginBottom: '16px' }}>
                  {currentQuiz.question_text}
                </p>

                {/* Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                  {currentQuiz.options.map((opt) => {
                    const isSelected = selectedOptionId === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setSelectedOptionId(opt.id)}
                        style={{
                          padding: '12px 16px',
                          borderRadius: '8px',
                          border: isSelected ? '1px solid #52B788' : '1px solid rgba(142, 182, 155, 0.25)',
                          backgroundColor: isSelected ? '#1B4332' : '#0E2924',
                          color: '#DAF1DE',
                          textAlign: 'left',
                          fontSize: '0.88rem',
                          cursor: 'pointer',
                        }}
                      >
                        {opt.text}
                      </button>
                    );
                  })}
                </div>

                {/* Submit & Next */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={!selectedOptionId}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: selectedOptionId ? '#235347' : 'rgba(255,255,255,0.1)',
                      color: '#DAF1DE',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      cursor: selectedOptionId ? 'pointer' : 'not-allowed',
                    }}
                  >
                    Submit Answer
                  </button>

                  {quizzes.length > 1 && (
                    <button
                      onClick={() => {
                        setSelectedOptionId(null);
                        setQuizFeedback(null);
                        setActiveQuizIndex((prev) => (prev + 1) % quizzes.length);
                      }}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid rgba(142, 182, 155, 0.3)',
                        backgroundColor: 'transparent',
                        color: '#DAF1DE',
                        fontSize: '0.84rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      Next Quiz <ChevronRight style={{ width: '16px', height: '16px' }} />
                    </button>
                  )}
                </div>

                {/* Quiz Feedback */}
                {quizFeedback && (
                  <div
                    style={{
                      marginTop: '16px',
                      padding: '14px',
                      borderRadius: '8px',
                      backgroundColor: quizFeedback.is_correct ? 'rgba(82, 183, 136, 0.15)' : 'rgba(224, 122, 95, 0.15)',
                      border: quizFeedback.is_correct ? '1px solid #52B788' : '1px solid #E07A5F',
                      color: '#DAF1DE',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontWeight: 700 }}>
                      {quizFeedback.is_correct ? (
                        <>
                          <CheckCircle2 style={{ width: '18px', height: '18px', color: '#52B788' }} />
                          <span style={{ color: '#52B788' }}>Correct Comprehension!</span>
                        </>
                      ) : (
                        <>
                          <XCircle style={{ width: '18px', height: '18px', color: '#E07A5F' }} />
                          <span style={{ color: '#E07A5F' }}>Review Elder Context</span>
                        </>
                      )}
                    </div>
                    <div style={{ fontSize: '0.84rem', lineHeight: 1.4 }}>
                      {quizFeedback.cultural_note}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* TAB 4: SENTENCE CONSTRUCTION DRILLS (DRAVIDIAN / MUNDA SOV)   */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'drills' && currentDrill && (
            <div style={{ maxWidth: '680px', margin: '0 auto' }}>
              <div
                style={{
                  backgroundColor: '#163832',
                  padding: '24px',
                  borderRadius: '16px',
                  border: '1px solid rgba(142, 182, 155, 0.25)',
                }}
              >
                {/* Meta */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ fontSize: '0.78rem', backgroundColor: '#0B2B26', color: '#8EB69B', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                    {currentDrill.language} Syntax Drill
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(218, 241, 222, 0.6)' }}>
                    Drill {activeDrillIndex + 1} of {drills.length}
                  </span>
                </div>

                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.25rem', color: '#DAF1DE', fontWeight: 700 }}>
                  {currentDrill.title}
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#8EB69B', marginBottom: '16px' }}>
                  Pattern: {currentDrill.syntax_pattern}
                </div>

                {/* English Meaning Target */}
                <div
                  style={{
                    backgroundColor: '#1B4332',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '18px',
                    fontSize: '0.9rem',
                    color: '#DAF1DE',
                  }}
                >
                  <strong>Target Meaning:</strong> "{currentDrill.translation_english}"
                </div>

                {/* Student Assembly Drop Area */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.78rem', color: '#8EB69B', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                    Assembled Oral Sentence (Click to remove token):
                  </div>
                  <div
                    style={{
                      minHeight: '60px',
                      backgroundColor: '#0E2924',
                      border: '2px dashed rgba(142, 182, 155, 0.35)',
                      borderRadius: '8px',
                      padding: '10px',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                      alignItems: 'center',
                    }}
                  >
                    {assembledTokens.length === 0 ? (
                      <span style={{ color: 'rgba(218, 241, 222, 0.4)', fontSize: '0.84rem' }}>
                        Click word tokens below in correct order...
                      </span>
                    ) : (
                      assembledTokens.map((tok, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleRemoveToken(idx)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            backgroundColor: '#235347',
                            border: '1px solid #52B788',
                            color: '#DAF1DE',
                            fontSize: '0.88rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          {tok} ✕
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Scrambled Word Bank */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '0.78rem', color: '#8EB69B', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                    Scrambled Word Bank:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {currentDrill.scrambled_tokens.map((tok, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAddToken(tok)}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '8px',
                          backgroundColor: '#1B4332',
                          border: '1px solid rgba(142, 182, 155, 0.3)',
                          color: '#DAF1DE',
                          fontSize: '0.88rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        + {tok}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={handleSubmitDrill}
                      disabled={assembledTokens.length === 0}
                      style={{
                        padding: '10px 18px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: assembledTokens.length > 0 ? '#235347' : 'rgba(255,255,255,0.1)',
                        color: '#DAF1DE',
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        cursor: assembledTokens.length > 0 ? 'pointer' : 'not-allowed',
                      }}
                    >
                      Check Sentence Syntax
                    </button>
                    <button
                      onClick={() => setAssembledTokens([])}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid rgba(142, 182, 155, 0.3)',
                        backgroundColor: 'transparent',
                        color: '#DAF1DE',
                        fontSize: '0.84rem',
                        cursor: 'pointer',
                      }}
                    >
                      Reset
                    </button>
                  </div>

                  {drills.length > 1 && (
                    <button
                      onClick={() => {
                        setAssembledTokens([]);
                        setDrillFeedback(null);
                        setActiveDrillIndex((prev) => (prev + 1) % drills.length);
                      }}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid rgba(142, 182, 155, 0.3)',
                        backgroundColor: 'transparent',
                        color: '#DAF1DE',
                        fontSize: '0.84rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      Next Drill <ChevronRight style={{ width: '16px', height: '16px' }} />
                    </button>
                  )}
                </div>

                {/* Drill Feedback */}
                {drillFeedback && (
                  <div
                    style={{
                      marginTop: '16px',
                      padding: '14px',
                      borderRadius: '8px',
                      backgroundColor: drillFeedback.is_correct ? 'rgba(82, 183, 136, 0.15)' : 'rgba(224, 122, 95, 0.15)',
                      border: drillFeedback.is_correct ? '1px solid #52B788' : '1px solid #E07A5F',
                      color: '#DAF1DE',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontWeight: 700 }}>
                      {drillFeedback.is_correct ? (
                        <>
                          <CheckCircle2 style={{ width: '18px', height: '18px', color: '#52B788' }} />
                          <span style={{ color: '#52B788' }}>Authentic Indigenous Syntax Verified!</span>
                        </>
                      ) : (
                        <>
                          <XCircle style={{ width: '18px', height: '18px', color: '#E07A5F' }} />
                          <span style={{ color: '#E07A5F' }}>Syntax Misalignment</span>
                        </>
                      )}
                    </div>
                    <div style={{ fontSize: '0.84rem', lineHeight: 1.4 }}>
                      <strong>Target:</strong> {drillFeedback.expected_sentence}<br />
                      <strong>Cultural Note:</strong> {drillFeedback.cultural_context}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* TAB 5: LEARNER ANALYTICS & OFFLINE PROGRESS SYNC               */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'analytics' && analytics && (
            <div>
              {/* Top Overview Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ backgroundColor: '#163832', padding: '18px', borderRadius: '12px', border: '1px solid rgba(142, 182, 155, 0.25)' }}>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(218, 241, 222, 0.65)', textTransform: 'uppercase' }}>
                    Oral Retention Rate
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#52B788', marginTop: '4px' }}>
                    {analytics.retention_rate_pct}%
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#8EB69B', marginTop: '4px' }}>
                    {analytics.total_reviews_completed} reviews completed
                  </div>
                </div>

                <div style={{ backgroundColor: '#163832', padding: '18px', borderRadius: '12px', border: '1px solid rgba(142, 182, 155, 0.25)' }}>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(218, 241, 222, 0.65)', textTransform: 'uppercase' }}>
                    Vocabulary Enrolled
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#DAF1DE', marginTop: '4px' }}>
                    {analytics.total_cards_enrolled}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#E9D8A6', marginTop: '4px' }}>
                    {analytics.cards_mastered} mastered in Box 5
                  </div>
                </div>

                <div style={{ backgroundColor: '#163832', padding: '18px', borderRadius: '12px', border: '1px solid rgba(142, 182, 155, 0.25)' }}>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(218, 241, 222, 0.65)', textTransform: 'uppercase' }}>
                    Average Recall Score
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#DAF1DE', marginTop: '4px' }}>
                    {analytics.average_recall_grade} / 5
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#8EB69B', marginTop: '4px' }}>
                    Tier: {analytics.oral_proficiency_tier}
                  </div>
                </div>

                {/* Offline Actions Sync Card */}
                <div style={{ backgroundColor: '#163832', padding: '18px', borderRadius: '12px', border: '1px solid rgba(142, 182, 155, 0.25)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(218, 241, 222, 0.65)', textTransform: 'uppercase' }}>
                      Offline Queue Sync
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#DAF1DE', marginTop: '4px' }}>
                      {offlineQueue.length} Pending Actions
                    </div>
                  </div>
                  <button
                    onClick={handleSyncOffline}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#235347',
                      color: '#DAF1DE',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      marginTop: '8px',
                    }}
                  >
                    <RefreshCw style={{ width: '14px', height: '14px' }} />
                    Sync Progress Now
                  </button>
                </div>
              </div>

              {/* Leitner Box Distribution */}
              <div
                style={{
                  backgroundColor: '#163832',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid rgba(142, 182, 155, 0.25)',
                }}
              >
                <div style={{ fontSize: '0.82rem', color: '#8EB69B', textTransform: 'uppercase', fontWeight: 700, marginBottom: '14px' }}>
                  Leitner Spaced Repetition Distribution (Card Mastery Progress):
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                  <div style={{ backgroundColor: '#0E2924', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.74rem', color: 'rgba(218, 241, 222, 0.6)' }}>Box 1 (Daily)</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#DAF1DE', marginTop: '2px' }}>
                      {analytics.leitner_box_distribution.box_1_daily}
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#0E2924', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.74rem', color: 'rgba(218, 241, 222, 0.6)' }}>Box 2 (3 Days)</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#DAF1DE', marginTop: '2px' }}>
                      {analytics.leitner_box_distribution.box_2_semiweekly}
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#0E2924', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.74rem', color: 'rgba(218, 241, 222, 0.6)' }}>Box 3 (Weekly)</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#DAF1DE', marginTop: '2px' }}>
                      {analytics.leitner_box_distribution.box_3_weekly}
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#0E2924', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.74rem', color: 'rgba(218, 241, 222, 0.6)' }}>Box 4 (Biweekly)</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#DAF1DE', marginTop: '2px' }}>
                      {analytics.leitner_box_distribution.box_4_biweekly}
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#0E2924', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.74rem', color: '#52B788' }}>Box 5 (Mastered)</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#52B788', marginTop: '2px' }}>
                      {analytics.leitner_box_distribution.box_5_mastered}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LearningStudio;
