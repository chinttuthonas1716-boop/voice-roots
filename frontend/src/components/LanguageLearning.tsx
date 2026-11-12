import React, { useState, useEffect } from 'react';
import {
  LearningCollection,
  LearningModule,
  LearnerProgressRecord,
} from '../types';

interface LanguageLearningProps {
  onBack?: () => void;
}

export const LanguageLearning: React.FC<LanguageLearningProps> = () => {
  const [collections, setCollections] = useState<LearningCollection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<LearningCollection | null>(null);
  const [activeModule, setActiveModule] = useState<LearningModule | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  
  // Quiz state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [quizResult, setQuizResult] = useState<{
    is_correct: boolean;
    correct_answer: string;
    cultural_note?: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Learner Progress state
  const learnerId = 'session_learner_01';
  const [progressSummary, setProgressSummary] = useState<{
    total_modules_attempted: number;
    completed_count: number;
    mastered_count: number;
    average_score: number;
    records: LearnerProgressRecord[];
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchCollections();
    fetchProgress();
  }, []);

  const fetchCollections = async () => {
    setIsLoading(true);
    try {
      const resp = await fetch('/api/v1/learning/collections');
      if (resp.ok) {
        const data = await resp.json();
        const list = data.collections || [];
        setCollections(list);
        if (list.length > 0) {
          handleSelectCollection(list[0].collection_id);
        }
      }
    } catch (e: any) {
      setErrorMsg('Failed to load learning collections: ' + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCollection = async (collectionId: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    setQuizResult(null);
    setSelectedOption(null);
    try {
      const resp = await fetch(`/api/v1/learning/collections/${collectionId}`);
      if (resp.ok) {
        const fullCol: LearningCollection = await resp.json();
        setSelectedCollection(fullCol);
        if (fullCol.modules && fullCol.modules.length > 0) {
          setActiveModule(fullCol.modules[0]);
        } else {
          setActiveModule(null);
        }
      }
    } catch (e: any) {
      setErrorMsg('Failed to load collection details: ' + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const resp = await fetch(`/api/v1/learning/progress/${learnerId}`);
      if (resp.ok) {
        const data = await resp.json();
        setProgressSummary(data);
      }
    } catch (e: any) {
      console.error('Failed to fetch progress', e);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!activeModule || !selectedOption) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const resp = await fetch('/api/v1/learning/practice/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learner_id: learnerId,
          module_id: activeModule.module_id,
          selected_answer: selectedOption,
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        setQuizResult({
          is_correct: data.is_correct,
          correct_answer: data.correct_answer,
          cultural_note: data.cultural_note,
        });
        if (data.is_correct) {
          setStatusMsg('Splendid! Correct answer verified.');
        } else {
          setStatusMsg('Review cultural context and try again.');
        }
        fetchProgress();
      } else {
        setErrorMsg('Answer evaluation failed.');
      }
    } catch (e: any) {
      setErrorMsg('Network error submitting quiz: ' + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextModule = () => {
    if (!selectedCollection || !selectedCollection.modules || !activeModule) return;
    const currentIndex = selectedCollection.modules.findIndex(
      (m) => m.module_id === activeModule.module_id
    );
    if (currentIndex !== -1 && currentIndex + 1 < selectedCollection.modules.length) {
      setActiveModule(selectedCollection.modules[currentIndex + 1]);
      setSelectedOption(null);
      setQuizResult(null);
      setStatusMsg(null);
    }
  };

  const filteredCollections = selectedLanguage === 'All'
    ? collections
    : collections.filter((c) => c.language.toLowerCase() === selectedLanguage.toLowerCase());

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-stone-900 to-emerald-950 text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/30 border border-amber-400/40 rounded-full text-xs font-semibold text-amber-200 mb-3 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            Milestone 19 • Language Learning & Interactive Practice
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Indigenous Language Learning & Pedagogy
          </h1>
          <p className="mt-3 text-amber-100 text-base leading-relaxed">
            Learn Gondi, Koya, Santhali, and Lambadi through community-approved vocabulary modules,
            listening comprehension drills, and cultural context annotations. Strictly gated by affirmative educational consent.
          </p>
        </div>
      </div>

      {statusMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between">
          <span>{statusMsg}</span>
          <button onClick={() => setStatusMsg(null)} className="text-emerald-600 font-bold hover:underline">Dismiss</button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-rose-600 font-bold hover:underline">Dismiss</button>
        </div>
      )}

      {/* Top Telemetry / Progress Bar */}
      {progressSummary && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="text-amber-600">🏆</span> Learner Mastery Dashboard
              </h2>
              <div className="text-xs text-slate-500 mt-0.5">Session ID: {learnerId}</div>
            </div>

            <div className="flex items-center gap-6 text-xs">
              <div className="text-center">
                <div className="text-slate-500">Attempted</div>
                <div className="text-lg font-black text-slate-800">{progressSummary.total_modules_attempted}</div>
              </div>
              <div className="text-center">
                <div className="text-slate-500">Completed</div>
                <div className="text-lg font-black text-emerald-600">{progressSummary.completed_count}</div>
              </div>
              <div className="text-center">
                <div className="text-slate-500">Mastered</div>
                <div className="text-lg font-black text-amber-600">{progressSummary.mastered_count}</div>
              </div>
              <div className="text-center">
                <div className="text-slate-500">Avg Accuracy</div>
                <div className="text-lg font-black text-teal-600">{progressSummary.average_score}%</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Collections Catalog & Active Interactive Lesson */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Collections Catalog & Filter */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-slate-900">Learning Tracks</h2>
              <span className="text-xs text-slate-500">{filteredCollections.length} tracks</span>
            </div>

            {/* Language filter pills */}
            <div className="flex flex-wrap gap-1.5">
              {['All', 'Gondi', 'Koya', 'Santhali', 'Lambadi'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                    selectedLanguage === lang
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* Collections list */}
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {filteredCollections.map((col) => (
                <button
                  key={col.collection_id}
                  onClick={() => handleSelectCollection(col.collection_id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs ${
                    selectedCollection?.collection_id === col.collection_id
                      ? 'border-amber-500 bg-amber-50/60 shadow-xs font-semibold text-amber-950'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm truncate">{col.title}</span>
                    <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] text-slate-600 uppercase font-mono">
                      {col.proficiency_level}
                    </span>
                  </div>
                  <p className="text-slate-500 line-clamp-2">{col.description}</p>
                  <div className="mt-2 text-[11px] text-amber-800 font-semibold flex items-center justify-between">
                    <span>{col.language} {col.variety ? `(${col.variety})` : ''}</span>
                    <span>{col.module_count || col.modules?.length || 0} lessons</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Active Interactive Practice Module */}
        <div className="lg:col-span-2 space-y-6">
          {isLoading && (
            <div className="p-4 bg-slate-50 rounded-xl text-slate-500 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              Loading pedagogical content...
            </div>
          )}

          {selectedCollection && activeModule ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-6">
              {/* Module Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="inline-block text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded uppercase tracking-wider mb-1">
                    {activeModule.module_type.replace('_', ' ')} • Lesson {activeModule.order_index} of {selectedCollection.modules?.length || 1}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">{activeModule.title}</h3>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full font-bold border border-emerald-200">
                    ✓ OCAP Educational Consent Verified
                  </span>
                </div>
              </div>

              {/* Prompt Card */}
              <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-4 text-center">
                <div className="text-xs font-mono text-amber-400 uppercase tracking-widest">
                  Target Expression
                </div>
                {activeModule.prompt_native_script && (
                  <div className="text-3xl sm:text-4xl font-black text-amber-200 font-serif">
                    {activeModule.prompt_native_script}
                  </div>
                )}
                <div className="text-2xl sm:text-3xl font-extrabold text-white">
                  "{activeModule.prompt_latin}"
                </div>
                <div className="text-xs text-slate-300 max-w-md mx-auto italic">
                  Select the accurate cultural meaning and application:
                </div>
              </div>

              {/* Multiple Choice Options */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 block">
                  Select the correct answer:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeModule.options.map((opt, idx) => {
                    const isSelected = selectedOption === opt;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedOption(opt)}
                        disabled={quizResult !== null}
                        className={`p-4 rounded-xl border text-left text-sm font-semibold transition-all ${
                          isSelected
                            ? 'border-amber-600 bg-amber-50 text-amber-950 ring-2 ring-amber-400'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${
                            isSelected ? 'border-amber-600 bg-amber-600 text-white font-bold' : 'border-slate-300 text-slate-500'
                          }`}>
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{opt}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
                {!quizResult ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!selectedOption || isSubmitting}
                    className="px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-sm transition-transform active:scale-95"
                  >
                    {isSubmitting ? 'Verifying...' : 'Check Answer'}
                  </button>
                ) : (
                  <div className="flex items-center gap-3 w-full justify-between">
                    <button
                      onClick={() => {
                        setQuizResult(null);
                        setSelectedOption(null);
                      }}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={handleNextModule}
                      className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs shadow-sm"
                    >
                      Next Lesson →
                    </button>
                  </div>
                )}
              </div>

              {/* Feedback and Cultural Context Note */}
              {quizResult && (
                <div className={`p-5 rounded-xl border space-y-2 ${
                  quizResult.is_correct
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-rose-50 border-rose-300 text-rose-900'
                }`}>
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {quizResult.is_correct ? '✓ Correct Answer!' : '✗ Not quite correct.'}
                    <span className="font-normal text-xs">
                      (Target: <strong>{quizResult.correct_answer}</strong>)
                    </span>
                  </div>
                  {quizResult.cultural_note && (
                    <div className="text-xs leading-relaxed pt-2 border-t border-emerald-200/60 text-slate-700">
                      <span className="font-bold text-amber-900">Cultural Lore Context: </span>
                      {quizResult.cultural_note}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-500">
              Select a learning collection from the left to start interactive exercises.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
