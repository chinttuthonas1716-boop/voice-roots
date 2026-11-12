import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  BookOpen,
  Volume2,
  CheckCircle2,
  Clock,
  Plus,
  X,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { AuthUser, DictionaryEntry, DictionaryOverview, DictionaryLanguageMeta } from '../../types';

interface DictionaryBrowserProps {
  apiBaseUrl?: string;
  authToken?: string | null;
  currentUser?: AuthUser | null;
}

export const DictionaryBrowser: React.FC<DictionaryBrowserProps> = ({
  apiBaseUrl = '',
  authToken = null,
  currentUser = null,
}) => {
  // --- States ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedDialect, setSelectedDialect] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyApproved, setOnlyApproved] = useState<boolean>(false);

  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [overview, setOverview] = useState<DictionaryOverview | null>(null);
  const [supportedLanguages, setSupportedLanguages] = useState<DictionaryLanguageMeta[]>([]);

  // Selected word for deep inspection modal
  const [selectedWord, setSelectedWord] = useState<DictionaryEntry | null>(null);

  // Proposal modal
  const [isProposeModalOpen, setIsProposeModalOpen] = useState<boolean>(false);
  const [proposalForm, setProposalForm] = useState({
    word: '',
    language_code: 'gon',
    dialect: '',
    native_script: '',
    script_name: '',
    ipa: '',
    part_of_speech: 'noun',
    meaning_en: '',
    translation_te: '',
    translation_hi: '',
    cultural_context: '',
    contributor_name: currentUser?.full_name || currentUser?.username || 'Community Contributor',
  });
  const [isSubmittingProposal, setIsSubmittingProposal] = useState<boolean>(false);
  const [proposalSuccess, setProposalSuccess] = useState<string | null>(null);
  const [proposalError, setProposalError] = useState<string | null>(null);

  // Audio playing simulation / playback
  const [activePlayingId, setActivePlayingId] = useState<number | null>(null);

  const isElderOrAdmin = useMemo(() => {
    if (!currentUser) return false;
    const r = (currentUser.role || '').toLowerCase();
    return r === 'elder' || r === 'admin' || r === 'reviewer';
  }, [currentUser]);

  // --- Fetch overview and language metadata on mount ---
  useEffect(() => {
    fetchOverview();
    fetchLanguages();
  }, [apiBaseUrl]);

  // --- Search whenever filters change (with debounce) ---
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDictionary();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedLanguage, selectedDialect, selectedCategory, onlyApproved, apiBaseUrl]);

  const fetchOverview = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/dictionary/overview`);
      if (res.ok) {
        const data = await res.json();
        setOverview(data);
      }
    } catch (err) {
      console.error('Failed to fetch dictionary overview:', err);
    }
  };

  const fetchLanguages = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/dictionary/languages`);
      if (res.ok) {
        const data = await res.json();
        setSupportedLanguages(data.languages || []);
      }
    } catch (err) {
      console.error('Failed to fetch supported dictionary languages:', err);
    }
  };

  const fetchDictionary = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (selectedLanguage !== 'all') params.set('language_code', selectedLanguage);
      if (selectedDialect !== 'all') params.set('dialect', selectedDialect);
      if (selectedCategory !== 'all') params.set('category', selectedCategory);
      if (onlyApproved) params.set('only_approved', 'true');
      params.set('limit', '60');

      const res = await fetch(`${apiBaseUrl}/api/v1/dictionary/search?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setEntries(data.results || []);
      setTotalCount(data.total || 0);
    } catch (err) {
      console.error('Error searching dictionary:', err);
      setError('Unable to load dictionary records. Please verify server connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWordDetails = async (wordId: number) => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/dictionary/words/${wordId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedWord(data);
      }
    } catch (err) {
      console.error('Error fetching word details:', err);
    }
  };

  const handlePlayAudio = (entry: DictionaryEntry) => {
    if (activePlayingId === entry.id) {
      setActivePlayingId(null);
      return;
    }

    setActivePlayingId(entry.id);

    // Try HTML5 speech synthesis if no direct audio file exists
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(entry.word);
      utterance.rate = 0.85;
      utterance.onend = () => setActivePlayingId(null);
      utterance.onerror = () => setActivePlayingId(null);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setActivePlayingId(null), 1200);
    }
  };

  const handleApproveEntry = async (wordId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const res = await fetch(`${apiBaseUrl}/api/v1/dictionary/words/${wordId}/approve`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          approved_by: currentUser?.full_name || currentUser?.username || 'Community Elder',
          notes: 'Approved via Community Command Center',
        }),
      });

      if (res.ok) {
        // Refresh local entry and list
        setEntries((prev) =>
          prev.map((item) =>
            item.id === wordId
              ? {
                  ...item,
                  is_elder_approved: true,
                  status: 'approved',
                  approved_by: currentUser?.full_name || 'Community Elder',
                }
              : item
          )
        );
        if (selectedWord && selectedWord.id === wordId) {
          setSelectedWord({
            ...selectedWord,
            is_elder_approved: true,
            status: 'approved',
            approved_by: currentUser?.full_name || 'Community Elder',
          });
        }
        fetchOverview();
      }
    } catch (err) {
      console.error('Failed to approve entry:', err);
    }
  };

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalForm.word.trim()) {
      setProposalError('Headword is required.');
      return;
    }

    setIsSubmittingProposal(true);
    setProposalError(null);
    setProposalSuccess(null);

    try {
      const payload: Record<string, any> = {
        word: proposalForm.word.trim(),
        language_code: proposalForm.language_code,
        dialect: proposalForm.dialect.trim() || undefined,
        native_script: proposalForm.native_script.trim() || undefined,
        script_name: proposalForm.script_name.trim() || undefined,
        ipa: proposalForm.ipa.trim() || undefined,
        part_of_speech: proposalForm.part_of_speech,
        meanings: proposalForm.meaning_en.trim() ? [proposalForm.meaning_en.trim()] : [],
        translations: {
          en: proposalForm.meaning_en.trim(),
          ...(proposalForm.translation_te.trim() ? { te: proposalForm.translation_te.trim() } : {}),
          ...(proposalForm.translation_hi.trim() ? { hi: proposalForm.translation_hi.trim() } : {}),
        },
        cultural_context: proposalForm.cultural_context.trim() || undefined,
        contributor_name: proposalForm.contributor_name.trim() || 'Community Contributor',
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch(`${apiBaseUrl}/api/v1/dictionary/propose`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.detail || 'Submission failed');
      }

      setProposalSuccess('Word proposal submitted successfully! It is now pending community elder review.');
      setProposalForm({
        word: '',
        language_code: 'gon',
        dialect: '',
        native_script: '',
        script_name: '',
        ipa: '',
        part_of_speech: 'noun',
        meaning_en: '',
        translation_te: '',
        translation_hi: '',
        cultural_context: '',
        contributor_name: currentUser?.full_name || currentUser?.username || 'Community Contributor',
      });
      fetchDictionary();
      fetchOverview();
      setTimeout(() => {
        setIsProposeModalOpen(false);
        setProposalSuccess(null);
      }, 1600);
    } catch (err: any) {
      console.error('Error submitting proposal:', err);
      setProposalError(err.message || 'Failed to submit proposal.');
    } finally {
      setIsSubmittingProposal(false);
    }
  };

  // Dialects available for the currently selected language
  const currentLanguageMeta = useMemo(() => {
    return supportedLanguages.find((l) => l.code === selectedLanguage);
  }, [supportedLanguages, selectedLanguage]);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* ─── Header & Telemetry Ribbon ─── */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(11, 43, 38, 0.95), rgba(22, 56, 50, 0.95))',
          borderRadius: '16px',
          padding: '2rem',
          border: '1px solid #235347',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(142, 182, 155, 0.15)', border: '1px solid #8EB69B', padding: '0.25rem 0.75rem', borderRadius: '9999px', color: '#DAF1DE', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              <BookOpen size={14} color="#8EB69B" />
              <span>Module 2 · Multilingual Lexicon Intelligence</span>
            </div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#DAF1DE', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
              Multilingual Indigenous Dictionary
            </h1>
            <p style={{ color: 'rgba(218, 241, 222, 0.75)', maxWidth: '720px', margin: 0, fontSize: '0.95rem', lineHeight: 1.6 }}>
              Preserving <strong>Gondi</strong>, <strong>Koya</strong>, <strong>Santhali</strong>, and <strong>Lambadi</strong> oral vocabularies with authentic orthography (Ol Chiki, Masaram/Telugu, Devanagari), acoustic IPA phonetics, cross-dialectal shifts, and elder provenance.
            </p>
          </div>

          <button
            onClick={() => setIsProposeModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#8EB69B',
              color: '#0B2B26',
              fontWeight: 700,
              fontSize: '0.9rem',
              padding: '0.75rem 1.25rem',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(142, 182, 155, 0.25)',
              transition: 'all 0.2s ease',
            }}
          >
            <Plus size={18} />
            <span>Propose New Word</span>
          </button>
        </div>

        {/* Telemetry Metrics */}
        {overview && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              marginTop: '1.75rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid rgba(142, 182, 155, 0.15)',
            }}
          >
            <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid rgba(142, 182, 155, 0.1)' }}>
              <div style={{ color: 'rgba(218, 241, 222, 0.6)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Total Lexicon</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#DAF1DE', marginTop: '0.2rem' }}>{overview.total_words} words</div>
            </div>
            <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid rgba(142, 182, 155, 0.1)' }}>
              <div style={{ color: 'rgba(218, 241, 222, 0.6)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Elder Verified</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#8EB69B', marginTop: '0.2rem' }}>{overview.approved_words} ({overview.approval_rate_pct}%)</div>
            </div>
            <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid rgba(142, 182, 155, 0.1)' }}>
              <div style={{ color: 'rgba(218, 241, 222, 0.6)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Acoustic Audio Snippets</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#DAF1DE', marginTop: '0.2rem' }}>{overview.words_with_audio} ({overview.audio_coverage_pct}%)</div>
            </div>
            <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid rgba(142, 182, 155, 0.1)' }}>
              <div style={{ color: 'rgba(218, 241, 222, 0.6)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Dialects Cataloged</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#DAF1DE', marginTop: '0.2rem' }}>{overview.dialects_represented} regional varieties</div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Search & Faceted Filter Controls ─── */}
      <div
        style={{
          background: 'rgba(11, 43, 38, 0.75)',
          backdropFilter: 'blur(12px)',
          borderRadius: '14px',
          padding: '1.25rem',
          border: '1px solid #235347',
          marginBottom: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={18} color="#8EB69B" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search words by English, Hindi, Telugu, Roman, or native scripts (Ol Chiki, Telugu, Devanagari)..."
            style={{
              width: '100%',
              padding: '0.85rem 2.75rem 0.85rem 2.75rem',
              borderRadius: '10px',
              border: '1px solid #235347',
              background: 'rgba(2, 20, 16, 0.6)',
              color: '#DAF1DE',
              fontSize: '0.95rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: 'rgba(218, 241, 222, 0.6)',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Facet Buttons & Dropdowns */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', justifyContent: 'space-between' }}>
          {/* Language Selector Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'rgba(218, 241, 222, 0.6)', marginRight: '0.25rem', fontWeight: 600 }}>Language:</span>
            {[
              { code: 'all', label: 'All Tongues' },
              { code: 'gon', label: 'Gondi (gon)' },
              { code: 'kff', label: 'Koya (kff)' },
              { code: 'sat', label: 'Santhali (sat)' },
              { code: 'lmn', label: 'Lambadi (lmn)' },
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setSelectedLanguage(lang.code);
                  setSelectedDialect('all');
                }}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: selectedLanguage === lang.code ? 700 : 500,
                  border: selectedLanguage === lang.code ? '1px solid #8EB69B' : '1px solid rgba(142, 182, 155, 0.2)',
                  background: selectedLanguage === lang.code ? 'rgba(142, 182, 155, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                  color: selectedLanguage === lang.code ? '#DAF1DE' : 'rgba(218, 241, 222, 0.7)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {/* Secondary Filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center' }}>
            {/* Dialect Filter */}
            {currentLanguageMeta && currentLanguageMeta.dialects && currentLanguageMeta.dialects.length > 0 && (
              <select
                value={selectedDialect}
                onChange={(e) => setSelectedDialect(e.target.value)}
                style={{
                  padding: '0.45rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #235347',
                  background: 'rgba(2, 20, 16, 0.6)',
                  color: '#DAF1DE',
                  fontSize: '0.8rem',
                  outline: 'none',
                }}
              >
                <option value="all">All Regional Dialects</option>
                {currentLanguageMeta.dialects.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            )}

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '0.45rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #235347',
                background: 'rgba(2, 20, 16, 0.6)',
                color: '#DAF1DE',
                fontSize: '0.8rem',
                outline: 'none',
              }}
            >
              <option value="all">All Categories</option>
              <option value="noun">Noun</option>
              <option value="verb">Verb</option>
              <option value="adjective">Adjective</option>
              <option value="cultural_term">Cultural Term</option>
              <option value="sacred_term">Sacred Term</option>
            </select>

            {/* Elder Approved Only Toggle */}
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
                fontSize: '0.8rem',
                color: onlyApproved ? '#8EB69B' : 'rgba(218, 241, 222, 0.7)',
                fontWeight: onlyApproved ? 700 : 500,
                userSelect: 'none',
              }}
            >
              <input
                type="checkbox"
                checked={onlyApproved}
                onChange={(e) => setOnlyApproved(e.target.checked)}
                style={{ accentColor: '#8EB69B', cursor: 'pointer' }}
              />
              <ShieldCheck size={14} color={onlyApproved ? '#8EB69B' : 'currentColor'} />
              <span>Elder Verified Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* ─── Results Header & Status ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0 0.5rem' }}>
        <div style={{ fontSize: '0.85rem', color: 'rgba(218, 241, 222, 0.7)' }}>
          {isLoading ? (
            <span>Searching indigenous lexicon...</span>
          ) : (
            <span>
              Showing <strong>{entries.length}</strong> of <strong>{totalCount}</strong> vocabulary records
            </span>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '10px', padding: '1rem', color: '#fca5a5', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* ─── Entries Grid ─── */}
      {entries.length === 0 && !isLoading ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem 1.5rem',
            background: 'rgba(11, 43, 38, 0.4)',
            borderRadius: '16px',
            border: '1px dashed #235347',
          }}
        >
          <HelpCircle size={40} color="#8EB69B" style={{ opacity: 0.6, marginBottom: '0.75rem' }} />
          <h3 style={{ color: '#DAF1DE', margin: '0 0 0.5rem 0' }}>No lexical matches found</h3>
          <p style={{ color: 'rgba(218, 241, 222, 0.6)', maxWidth: '420px', margin: '0 auto 1.5rem auto', fontSize: '0.9rem' }}>
            Try adjusting your search terms, removing filters, or propose this term for inclusion into the dictionary.
          </p>
          <button
            onClick={() => setIsProposeModalOpen(true)}
            style={{
              padding: '0.6rem 1.25rem',
              background: '#8EB69B',
              color: '#0B2B26',
              fontWeight: 700,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Propose &ldquo;{searchQuery}&rdquo; as New Word
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {entries.map((entry) => (
            <div
              key={entry.id}
              onClick={() => fetchWordDetails(entry.id)}
              style={{
                background: 'rgba(11, 43, 38, 0.7)',
                borderRadius: '14px',
                border: '1px solid #235347',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#8EB69B';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#235347';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div>
                {/* Top badges: Language, Category, Audio button */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background:
                          entry.language_code === 'gon'
                            ? 'rgba(56, 189, 248, 0.2)'
                            : entry.language_code === 'kff'
                            ? 'rgba(168, 85, 247, 0.2)'
                            : entry.language_code === 'sat'
                            ? 'rgba(234, 179, 8, 0.2)'
                            : 'rgba(244, 63, 94, 0.2)',
                        color:
                          entry.language_code === 'gon'
                            ? '#38bdf8'
                            : entry.language_code === 'kff'
                            ? '#a855f7'
                            : entry.language_code === 'sat'
                            ? '#eab308'
                            : '#f43f5e',
                      }}
                    >
                      {entry.language_code} · {entry.dialect || 'Standard'}
                    </span>
                    <span
                      style={{
                        padding: '0.2rem 0.45rem',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        background: 'rgba(142, 182, 155, 0.15)',
                        color: '#DAF1DE',
                        fontWeight: 500,
                      }}
                    >
                      {entry.part_of_speech.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Audio Pronunciation Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayAudio(entry);
                    }}
                    title="Play acoustic pronunciation"
                    style={{
                      background: activePlayingId === entry.id ? '#8EB69B' : 'rgba(142, 182, 155, 0.15)',
                      color: activePlayingId === entry.id ? '#0B2B26' : '#8EB69B',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.35rem 0.6rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Volume2 size={14} />
                    <span>{activePlayingId === entry.id ? 'Playing...' : 'Pronounce'}</span>
                  </button>
                </div>

                {/* Headword & Native Script */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#DAF1DE', margin: 0 }}>
                    {entry.word}
                  </h2>
                  {entry.native_script && (
                    <span style={{ fontSize: '1.15rem', color: '#8EB69B', fontWeight: 600 }}>
                      {entry.native_script}
                    </span>
                  )}
                </div>

                {/* IPA Phonetic Tag */}
                {entry.ipa && (
                  <div style={{ display: 'inline-block', fontFamily: 'monospace', fontSize: '0.85rem', color: 'rgba(218, 241, 222, 0.8)', background: 'rgba(0, 0, 0, 0.25)', padding: '0.15rem 0.5rem', borderRadius: '4px', marginBottom: '0.85rem' }}>
                    {entry.ipa}
                  </div>
                )}

                {/* Meanings */}
                <div style={{ marginBottom: '0.75rem' }}>
                  {entry.meanings && entry.meanings.length > 0 && (
                    <p style={{ margin: '0 0 0.4rem 0', color: '#DAF1DE', fontSize: '0.9rem', lineHeight: 1.4 }}>
                      {entry.meanings[0]}
                    </p>
                  )}
                  {/* Multilingual Translation Chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {entry.translations?.te && (
                      <span style={{ fontSize: '0.75rem', color: 'rgba(218, 241, 222, 0.75)', background: 'rgba(0,0,0,0.2)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                        TE: {entry.translations.te}
                      </span>
                    )}
                    {entry.translations?.hi && (
                      <span style={{ fontSize: '0.75rem', color: 'rgba(218, 241, 222, 0.75)', background: 'rgba(0,0,0,0.2)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                        HI: {entry.translations.hi}
                      </span>
                    )}
                  </div>
                </div>

                {/* Cross-Dialectal Variations Chips */}
                {entry.dialect_variations && Object.keys(entry.dialect_variations).length > 0 && (
                  <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '0.5rem 0.65rem', borderRadius: '8px', marginBottom: '0.75rem', border: '1px solid rgba(142, 182, 155, 0.1)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(218, 241, 222, 0.5)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.25rem' }}>
                      Dialectal Shifts
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {Object.entries(entry.dialect_variations).map(([dialectName, term]) => (
                        <span key={dialectName} style={{ fontSize: '0.72rem', color: '#DAF1DE', background: 'rgba(142, 182, 155, 0.12)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                          <span style={{ opacity: 0.65 }}>{dialectName}:</span> <strong>{term}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer: Approval Badge & Provenance */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid rgba(142, 182, 155, 0.15)',
                  marginTop: '0.5rem',
                  fontSize: '0.75rem',
                }}
              >
                {entry.is_elder_approved ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#8EB69B', fontWeight: 600 }}>
                    <CheckCircle2 size={13} />
                    <span>Elder Verified</span>
                  </div>
                ) : (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#fbbf24', fontWeight: 600 }}>
                    <Clock size={13} />
                    <span>Pending Elder Review</span>
                  </div>
                )}

                {/* Elder 1-Click Approve Button */}
                {!entry.is_elder_approved && isElderOrAdmin && (
                  <button
                    onClick={(e) => handleApproveEntry(entry.id, e)}
                    style={{
                      background: 'rgba(142, 182, 155, 0.2)',
                      border: '1px solid #8EB69B',
                      color: '#DAF1DE',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    Approve Entry
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Word Inspection Detail Modal ─── */}
      {selectedWord && (
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
          onClick={() => setSelectedWord(null)}
        >
          <div
            style={{
              background: '#0B2B26',
              border: '1px solid #235347',
              borderRadius: '16px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              color: '#DAF1DE',
              boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#8EB69B' }}>
                  {selectedWord.language_code.toUpperCase()} · {selectedWord.dialect || 'Regional Oral Variety'}
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.85rem', marginTop: '0.25rem' }}>
                  <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#DAF1DE', margin: 0 }}>
                    {selectedWord.word}
                  </h1>
                  {selectedWord.native_script && (
                    <span style={{ fontSize: '1.6rem', color: '#8EB69B' }}>
                      {selectedWord.native_script}
                    </span>
                  )}
                </div>
                {selectedWord.ipa && (
                  <span style={{ fontFamily: 'monospace', fontSize: '0.95rem', color: 'rgba(218, 241, 222, 0.75)', marginTop: '0.25rem', display: 'inline-block' }}>
                    IPA: {selectedWord.ipa}
                  </span>
                )}
              </div>

              <button
                onClick={() => setSelectedWord(null)}
                style={{ background: 'transparent', border: 'none', color: '#DAF1DE', cursor: 'pointer', padding: '0.25rem' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Meanings */}
            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem', border: '1px solid rgba(142, 182, 155, 0.15)' }}>
              <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#8EB69B', margin: '0 0 0.5rem 0' }}>
                Meanings & Translations
              </h3>
              {selectedWord.meanings?.map((m, idx) => (
                <p key={idx} style={{ margin: '0 0 0.4rem 0', fontSize: '0.95rem', lineHeight: 1.5 }}>
                  • {m}
                </p>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem', marginTop: '0.75rem' }}>
                {selectedWord.translations?.en && (
                  <div style={{ fontSize: '0.85rem' }}><strong style={{ color: '#8EB69B' }}>English:</strong> {selectedWord.translations.en}</div>
                )}
                {selectedWord.translations?.te && (
                  <div style={{ fontSize: '0.85rem' }}><strong style={{ color: '#8EB69B' }}>Telugu:</strong> {selectedWord.translations.te}</div>
                )}
                {selectedWord.translations?.hi && (
                  <div style={{ fontSize: '0.85rem' }}><strong style={{ color: '#8EB69B' }}>Hindi:</strong> {selectedWord.translations.hi}</div>
                )}
              </div>
            </div>

            {/* Etymology */}
            {selectedWord.etymology && (
              <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#8EB69B', margin: '0 0 0.4rem 0' }}>
                  Linguistic Etymology & Roots
                </h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(218, 241, 222, 0.85)', lineHeight: 1.5 }}>
                  {selectedWord.etymology}
                </p>
              </div>
            )}

            {/* Cultural Context */}
            {selectedWord.cultural_context && (
              <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#8EB69B', margin: '0 0 0.4rem 0' }}>
                  Cultural & Sacred Context
                </h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(218, 241, 222, 0.85)', lineHeight: 1.5 }}>
                  {selectedWord.cultural_context}
                </p>
              </div>
            )}

            {/* Dialect Comparisons */}
            {selectedWord.dialect_variations && Object.keys(selectedWord.dialect_variations).length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#8EB69B', margin: '0 0 0.5rem 0' }}>
                  Cross-Dialectal Variations
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                  {Object.entries(selectedWord.dialect_variations).map(([d, t]) => (
                    <div key={d} style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(142, 182, 155, 0.1)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'rgba(218, 241, 222, 0.6)' }}>{d}:</span>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#DAF1DE' }}>{t}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Provenance & Audit Trail */}
            <div style={{ padding: '0.85rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', fontSize: '0.8rem', color: 'rgba(218, 241, 222, 0.7)', border: '1px solid rgba(142, 182, 155, 0.1)', marginTop: '1.5rem' }}>
              <div><strong style={{ color: '#8EB69B' }}>Provenance:</strong> {selectedWord.provenance || 'Preserved in community archives'}</div>
              {selectedWord.approved_by && (
                <div style={{ marginTop: '0.25rem' }}>
                  <strong style={{ color: '#8EB69B' }}>Elder Approval:</strong> Verified by {selectedWord.approved_by} on {selectedWord.approved_at?.split('T')[0]}
                </div>
              )}
            </div>

            {/* Related Words */}
            {selectedWord.related_words && selectedWord.related_words.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#8EB69B', margin: '0 0 0.5rem 0' }}>
                  Related Terms in {selectedWord.language_code.toUpperCase()}
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {selectedWord.related_words.map((rw) => (
                    <button
                      key={rw.id}
                      onClick={() => fetchWordDetails(rw.id)}
                      style={{
                        padding: '0.35rem 0.65rem',
                        borderRadius: '6px',
                        border: '1px solid #235347',
                        background: 'rgba(22, 56, 50, 0.6)',
                        color: '#DAF1DE',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                      }}
                    >
                      <strong>{rw.word}</strong> {rw.native_script && `(${rw.native_script})`}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Community Word Proposal Modal ─── */}
      {isProposeModalOpen && (
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
          onClick={() => setIsProposeModalOpen(false)}
        >
          <div
            style={{
              background: '#0B2B26',
              border: '1px solid #235347',
              borderRadius: '16px',
              maxWidth: '620px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              color: '#DAF1DE',
              boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#DAF1DE', margin: '0 0 0.25rem 0' }}>
                  Propose Lexical Term
                </h2>
                <p style={{ color: 'rgba(218, 241, 222, 0.7)', fontSize: '0.85rem', margin: 0 }}>
                  Contributions will be submitted to the community elder review council.
                </p>
              </div>
              <button
                onClick={() => setIsProposeModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#DAF1DE', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {proposalSuccess && (
              <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22c55e', borderRadius: '8px', padding: '0.75rem', color: '#86efac', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {proposalSuccess}
              </div>
            )}
            {proposalError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '8px', padding: '0.75rem', color: '#fca5a5', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {proposalError}
              </div>
            )}

            <form onSubmit={handleSubmitProposal} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#8EB69B', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Headword (Roman / Standard) *
                  </label>
                  <input
                    type="text"
                    required
                    value={proposalForm.word}
                    onChange={(e) => setProposalForm({ ...proposalForm, word: e.target.value })}
                    placeholder="e.g., selaar, persapen"
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #235347', background: 'rgba(0,0,0,0.3)', color: '#DAF1DE', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#8EB69B', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Target Indigenous Tongue *
                  </label>
                  <select
                    value={proposalForm.language_code}
                    onChange={(e) => setProposalForm({ ...proposalForm, language_code: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #235347', background: 'rgba(0,0,0,0.3)', color: '#DAF1DE', outline: 'none', boxSizing: 'border-box' }}
                  >
                    <option value="gon">Gondi (gon)</option>
                    <option value="kff">Koya (kff)</option>
                    <option value="sat">Santhali (sat)</option>
                    <option value="lmn">Lambadi (lmn)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#8EB69B', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Native Script Form (Optional)
                  </label>
                  <input
                    type="text"
                    value={proposalForm.native_script}
                    onChange={(e) => setProposalForm({ ...proposalForm, native_script: e.target.value })}
                    placeholder="e.g. ᱫᱷᱚᱨᱚᱢ, పెర్సాపేన్, तांडा"
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #235347', background: 'rgba(0,0,0,0.3)', color: '#DAF1DE', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#8EB69B', fontWeight: 600, marginBottom: '0.35rem' }}>
                    IPA Phonetics (Auto-generated if empty)
                  </label>
                  <input
                    type="text"
                    value={proposalForm.ipa}
                    onChange={(e) => setProposalForm({ ...proposalForm, ipa: e.target.value })}
                    placeholder="e.g. /peːɾsaːpeːn/"
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #235347', background: 'rgba(0,0,0,0.3)', color: '#DAF1DE', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#8EB69B', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Regional Dialect
                  </label>
                  <input
                    type="text"
                    value={proposalForm.dialect}
                    onChange={(e) => setProposalForm({ ...proposalForm, dialect: e.target.value })}
                    placeholder="e.g., Adilabad Southern, Godavari Valley"
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #235347', background: 'rgba(0,0,0,0.3)', color: '#DAF1DE', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#8EB69B', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Part of Speech
                  </label>
                  <select
                    value={proposalForm.part_of_speech}
                    onChange={(e) => setProposalForm({ ...proposalForm, part_of_speech: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #235347', background: 'rgba(0,0,0,0.3)', color: '#DAF1DE', outline: 'none', boxSizing: 'border-box' }}
                  >
                    <option value="noun">Noun</option>
                    <option value="verb">Verb</option>
                    <option value="adjective">Adjective</option>
                    <option value="cultural_term">Cultural Term</option>
                    <option value="sacred_term">Sacred Term</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#8EB69B', fontWeight: 600, marginBottom: '0.35rem' }}>
                  English Meaning & Definition *
                </label>
                <input
                  type="text"
                  required
                  value={proposalForm.meaning_en}
                  onChange={(e) => setProposalForm({ ...proposalForm, meaning_en: e.target.value })}
                  placeholder="Primary definition in English"
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #235347', background: 'rgba(0,0,0,0.3)', color: '#DAF1DE', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#8EB69B', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Telugu Translation (Optional)
                  </label>
                  <input
                    type="text"
                    value={proposalForm.translation_te}
                    onChange={(e) => setProposalForm({ ...proposalForm, translation_te: e.target.value })}
                    placeholder="తెలుగు అర్థం"
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #235347', background: 'rgba(0,0,0,0.3)', color: '#DAF1DE', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#8EB69B', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Hindi Translation (Optional)
                  </label>
                  <input
                    type="text"
                    value={proposalForm.translation_hi}
                    onChange={(e) => setProposalForm({ ...proposalForm, translation_hi: e.target.value })}
                    placeholder="हिंदी अर्थ"
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #235347', background: 'rgba(0,0,0,0.3)', color: '#DAF1DE', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#8EB69B', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Cultural Context / Taboo / Usage Notes
                </label>
                <textarea
                  rows={2}
                  value={proposalForm.cultural_context}
                  onChange={(e) => setProposalForm({ ...proposalForm, cultural_context: e.target.value })}
                  placeholder="How this word is used in traditional celebrations, clan rituals, or daily life..."
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #235347', background: 'rgba(0,0,0,0.3)', color: '#DAF1DE', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#8EB69B', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Contributor / Provenance
                </label>
                <input
                  type="text"
                  value={proposalForm.contributor_name}
                  onChange={(e) => setProposalForm({ ...proposalForm, contributor_name: e.target.value })}
                  placeholder="Your Name or Village / Clan Attribution"
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #235347', background: 'rgba(0,0,0,0.3)', color: '#DAF1DE', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsProposeModalOpen(false)}
                  style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: '1px solid #235347', background: 'transparent', color: '#DAF1DE', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProposal}
                  style={{ padding: '0.65rem 1.5rem', borderRadius: '8px', border: 'none', background: '#8EB69B', color: '#0B2B26', fontWeight: 700, cursor: 'pointer', opacity: isSubmittingProposal ? 0.6 : 1 }}
                >
                  {isSubmittingProposal ? 'Submitting...' : 'Submit Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default DictionaryBrowser;
