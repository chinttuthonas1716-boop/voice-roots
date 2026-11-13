import React, { useState, useEffect, useMemo } from 'react';
import {
  Compass,
  GitBranch,
  Network,
  Activity,
  Search,
  MapPin,
  Volume2,
  ShieldCheck,
  Layers,
  Globe,
  Info,
  Sparkles,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface LanguageEntry {
  code: string;
  name: string;
  native: string;
  script: string;
  family: string;
  region: string;
  category: string;
  tested_status: string;
}

interface DialectVariety {
  id: string;
  code?: string;
  name: string;
  region: string;
  dialect_marker?: string;
}

interface Subfamily {
  id: string;
  name: string;
  description: string;
  language_count: number;
  languages: LanguageEntry[];
  varieties?: DialectVariety[];
}

interface MacroFamily {
  id: string;
  name: string;
  description: string;
  total_languages: number;
  subfamilies: Subfamily[];
}

interface DialectItem {
  id: string;
  language_code: string;
  language_name: string;
  variety_name: string;
  latitude: number;
  longitude: number;
  region_name: string;
  states: string[];
  speaking_population: number;
  vitality_tier: string;
  writing_systems: string[];
  cultural_anchor: string;
  phonological_features: string[];
  sample_phrase: string;
}

interface MorphologicalNode {
  id: string;
  type: string;
  label: string;
  family?: string;
  meaning?: string;
  language?: string;
  code?: string;
  ipa?: string;
  pos?: string;
}

interface MorphologicalEdge {
  source: string;
  target: string;
  type: string;
  confidence: number;
  relationship?: string;
  id?: string;
}

interface VitalityLanguage {
  language_code: string;
  language_name: string;
  native_name: string;
  family: string;
  census_speakers: number;
  census_source: string;
  official_classification: string;
  primary_states: string;
  writing_systems: string[];
  preservation_metrics: {
    total_recorded_stories: number;
    total_transcripts_indexed: number;
    archived_audio_hours: number;
    approved_dictionary_entries: number;
    audio_pronunciation_coverage_pct: number;
  };
  community_status: string;
  vitality_assessment: string;
}

interface LanguageExplorerProps {
  apiBaseUrl?: string;
  authToken?: string | null;
}

type ExplorerTab = 'phylogeny' | 'cartography' | 'morphology' | 'vitality';

export const LanguageExplorer: React.FC<LanguageExplorerProps> = ({
  apiBaseUrl = '/api/v1',
}) => {
  const [activeTab, setActiveTab] = useState<ExplorerTab>('phylogeny');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>('family:dravidian');
  const [expandedSubfams, setExpandedSubfams] = useState<Record<string, boolean>>({
    'subfamily:central_dravidian': true,
    'subfamily:south_central_dravidian': true,
  });

  // State data
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [macroFamilies, setMacroFamilies] = useState<MacroFamily[]>([]);
  const [dialects, setDialects] = useState<DialectItem[]>([]);
  const [cartographyLanguages, setCartographyLanguages] = useState<string[]>([]);
  const [selectedCartoLang, setSelectedCartoLang] = useState<string>('all');
  const [morphNodes, setMorphNodes] = useState<MorphologicalNode[]>([]);
  const [morphEdges, setMorphEdges] = useState<MorphologicalEdge[]>([]);
  const [selectedRootId, setSelectedRootId] = useState<string>('all');
  const [vitalityLangs, setVitalityLangs] = useState<VitalityLanguage[]>([]);
  const [antiExtinctionPolicy, setAntiExtinctionPolicy] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    Promise.all([
      fetch(`${apiBaseUrl}/explorer/phylogenetic-tree`).then((r) => r.json()),
      fetch(`${apiBaseUrl}/explorer/dialect-cartography`).then((r) => r.json()),
      fetch(`${apiBaseUrl}/explorer/morphological-graph`).then((r) => r.json()),
      fetch(`${apiBaseUrl}/explorer/vitality-indicators`).then((r) => r.json()),
    ])
      .then(([phyloData, cartoData, morphData, vitData]) => {
        if (!isMounted) return;
        if (phyloData && phyloData.families) {
          setMacroFamilies(phyloData.families);
        }
        if (cartoData && cartoData.dialects) {
          setDialects(cartoData.dialects);
          const langNames = Array.from(new Set(cartoData.dialects.map((d: DialectItem) => d.language_name))) as string[];
          setCartographyLanguages(langNames);
        }
        if (morphData) {
          setMorphNodes(morphData.nodes || []);
          setMorphEdges(morphData.edges || []);
        }
        if (vitData && vitData.languages) {
          setVitalityLangs(vitData.languages);
          setAntiExtinctionPolicy(vitData.anti_extinction_policy || '');
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to load Language Explorer data:', err);
        setError('Failed to fetch linguistic exploration models. Please verify backend status.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [apiBaseUrl]);

  const toggleSubfam = (id: string) => {
    setExpandedSubfams((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const currentFamily = useMemo(() => {
    return macroFamilies.find((f) => f.id === selectedFamilyId) || macroFamilies[0];
  }, [macroFamilies, selectedFamilyId]);

  // Filtered dialects for cartography
  const filteredDialects = useMemo(() => {
    return dialects.filter((d) => {
      const matchesLang = selectedCartoLang === 'all' || d.language_name.toLowerCase() === selectedCartoLang.toLowerCase();
      const matchesSearch =
        searchQuery === '' ||
        d.variety_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.region_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.cultural_anchor.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesLang && matchesSearch;
    });
  }, [dialects, selectedCartoLang, searchQuery]);

  // Filtered roots and cognates
  const protoRoots = useMemo(() => {
    return morphNodes.filter((n) => n.type === 'proto_root');
  }, [morphNodes]);

  const activeEdges = useMemo(() => {
    if (selectedRootId === 'all') return morphEdges;
    return morphEdges.filter((e) => e.source === selectedRootId || e.target === selectedRootId);
  }, [morphEdges, selectedRootId]);

  const activeConnectedNodeIds = useMemo(() => {
    if (selectedRootId === 'all') return new Set(morphNodes.map((n) => n.id));
    const ids = new Set<string>([selectedRootId]);
    activeEdges.forEach((e) => {
      ids.add(e.source);
      ids.add(e.target);
    });
    return ids;
  }, [morphNodes, selectedRootId, activeEdges]);

  return (
    <div
      style={{
        backgroundColor: '#102B20',
        color: '#F5F3E9',
        borderRadius: '16px',
        padding: '28px',
        border: '1px solid rgba(166, 196, 138, 0.25)',
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
          borderBottom: '1px solid rgba(166, 196, 138, 0.2)',
          paddingBottom: '20px',
          marginBottom: '24px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Compass style={{ color: '#A6C48A', width: '28px', height: '28px' }} />
            <h2 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0, color: '#F5F3E9' }}>
              Interactive Language Explorer & Dialect Cartography
            </h2>
          </div>
          <p style={{ margin: '6px 0 0 0', color: 'rgba(245, 243, 233, 0.75)', fontSize: '0.92rem' }}>
            Phylogenetic trees across 44 registered languages, dialect cartography for oral varieties, and Proto-Dravidian cognates.
          </p>
        </div>

        {/* Mode Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#163B2C',
            padding: '4px',
            borderRadius: '12px',
            border: '1px solid rgba(166, 196, 138, 0.3)',
            gap: '4px',
          }}
        >
          <button
            onClick={() => { setActiveTab('phylogeny'); setSearchQuery(''); }}
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
              backgroundColor: activeTab === 'phylogeny' ? '#1F5138' : 'transparent',
              color: activeTab === 'phylogeny' ? '#F5F3E9' : 'rgba(245, 243, 233, 0.65)',
              transition: 'all 0.15s ease',
            }}
          >
            <GitBranch style={{ width: '15px', height: '15px' }} />
            Phylogenetic Trees
          </button>
          <button
            onClick={() => { setActiveTab('cartography'); setSearchQuery(''); }}
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
              backgroundColor: activeTab === 'cartography' ? '#1F5138' : 'transparent',
              color: activeTab === 'cartography' ? '#F5F3E9' : 'rgba(245, 243, 233, 0.65)',
              transition: 'all 0.15s ease',
            }}
          >
            <MapPin style={{ width: '15px', height: '15px' }} />
            Dialect Cartography
          </button>
          <button
            onClick={() => { setActiveTab('morphology'); setSearchQuery(''); }}
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
              backgroundColor: activeTab === 'morphology' ? '#1F5138' : 'transparent',
              color: activeTab === 'morphology' ? '#F5F3E9' : 'rgba(245, 243, 233, 0.65)',
              transition: 'all 0.15s ease',
            }}
          >
            <Network style={{ width: '15px', height: '15px' }} />
            Morphological Graph
          </button>
          <button
            onClick={() => { setActiveTab('vitality'); setSearchQuery(''); }}
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
              backgroundColor: activeTab === 'vitality' ? '#1F5138' : 'transparent',
              color: activeTab === 'vitality' ? '#F5F3E9' : 'rgba(245, 243, 233, 0.65)',
              transition: 'all 0.15s ease',
            }}
          >
            <Activity style={{ width: '15px', height: '15px' }} />
            Vitality Matrix
          </button>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#A6C48A' }}>
          <Sparkles style={{ width: '32px', height: '32px', animation: 'spin 2s linear infinite', marginBottom: '12px' }} />
          <p style={{ fontSize: '1rem', fontWeight: 500 }}>Traversing linguistic trees and geo-spatial dialect cartography...</p>
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
          {/* TAB 1: PHYLOGENETIC FAMILY TREES (44 LANGUAGES)                 */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'phylogeny' && (
            <div>
              {/* Family Selector Tabs */}
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  overflowX: 'auto',
                  paddingBottom: '12px',
                  marginBottom: '20px',
                  borderBottom: '1px solid rgba(166, 196, 138, 0.15)',
                }}
              >
                {macroFamilies.map((fam) => {
                  const isSelected = fam.id === selectedFamilyId;
                  return (
                    <button
                      key={fam.id}
                      onClick={() => setSelectedFamilyId(fam.id)}
                      style={{
                        padding: '10px 18px',
                        borderRadius: '10px',
                        border: isSelected ? '1px solid #A6C48A' : '1px solid rgba(166, 196, 138, 0.2)',
                        backgroundColor: isSelected ? '#163B2C' : 'rgba(22, 59, 44, 0.4)',
                        color: isSelected ? '#F5F3E9' : 'rgba(245, 243, 233, 0.7)',
                        cursor: 'pointer',
                        fontWeight: isSelected ? 700 : 500,
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <Layers style={{ width: '16px', height: '16px', color: isSelected ? '#A6C48A' : 'inherit' }} />
                      {fam.name}
                      <span
                        style={{
                          backgroundColor: isSelected ? '#1F5138' : 'rgba(0,0,0,0.25)',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '0.78rem',
                          color: '#A6C48A',
                        }}
                      >
                        {fam.total_languages}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Family Detail Header */}
              {currentFamily && (
                <div
                  style={{
                    backgroundColor: '#163B2C',
                    padding: '20px',
                    borderRadius: '12px',
                    marginBottom: '24px',
                    borderLeft: '4px solid #A6C48A',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ margin: '0 0 6px 0', fontSize: '1.25rem', color: '#F5F3E9', fontWeight: 700 }}>
                        {currentFamily.name}
                      </h3>
                      <p style={{ margin: 0, color: 'rgba(245, 243, 233, 0.8)', fontSize: '0.9rem', maxWidth: '850px' }}>
                        {currentFamily.description}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#A6C48A' }}>
                        {currentFamily.total_languages}
                      </span>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(245, 243, 233, 0.6)', textTransform: 'uppercase' }}>
                        Languages Registered
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Subfamilies & Member Languages */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {currentFamily?.subfamilies.map((subfam) => {
                  const isExpanded = expandedSubfams[subfam.id] ?? true;
                  return (
                    <div
                      key={subfam.id}
                      style={{
                        backgroundColor: '#11352E',
                        borderRadius: '12px',
                        border: '1px solid rgba(166, 196, 138, 0.2)',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Subfamily Accordion Header */}
                      <button
                        onClick={() => toggleSubfam(subfam.id)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '16px 20px',
                          backgroundColor: '#163B2C',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#F5F3E9',
                          textAlign: 'left',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {isExpanded ? (
                            <ChevronDown style={{ width: '18px', height: '18px', color: '#A6C48A' }} />
                          ) : (
                            <ChevronRight style={{ width: '18px', height: '18px', color: 'rgba(245, 243, 233, 0.6)' }} />
                          )}
                          <div>
                            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#F5F3E9' }}>
                              {subfam.name}
                            </div>
                            <div style={{ fontSize: '0.82rem', color: 'rgba(245, 243, 233, 0.65)', marginTop: '2px' }}>
                              {subfam.description}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span
                            style={{
                              backgroundColor: '#1F5138',
                              color: '#F5F3E9',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                            }}
                          >
                            {subfam.languages.length} languages
                          </span>
                        </div>
                      </button>

                      {/* Subfamily Content (Languages + Regional Dialects) */}
                      {isExpanded && (
                        <div style={{ padding: '20px' }}>
                          {/* Registered Languages Chips */}
                          <div style={{ marginBottom: subfam.varieties && subfam.varieties.length > 0 ? '20px' : '0' }}>
                            <div
                              style={{
                                fontSize: '0.78rem',
                                color: '#A6C48A',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                fontWeight: 700,
                                marginBottom: '10px',
                              }}
                            >
                              Member Languages in Dynamic Registry:
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                              {subfam.languages.map((lang) => (
                                <div
                                  key={lang.code}
                                  style={{
                                    backgroundColor: '#1B4332',
                                    border: '1px solid rgba(166, 196, 138, 0.25)',
                                    borderRadius: '10px',
                                    padding: '12px 14px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                  }}
                                >
                                  <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#F5F3E9' }}>
                                        {lang.name}
                                      </span>
                                      <span
                                        style={{
                                          fontSize: '0.75rem',
                                          color: '#A6C48A',
                                          backgroundColor: '#102B20',
                                          padding: '2px 6px',
                                          borderRadius: '6px',
                                          fontFamily: 'monospace',
                                        }}
                                      >
                                        {lang.code}
                                      </span>
                                    </div>
                                    <div style={{ fontSize: '0.82rem', color: 'rgba(245, 243, 233, 0.7)', marginTop: '3px' }}>
                                      {lang.native ? `${lang.native} • ` : ''}{lang.script} script
                                    </div>
                                  </div>
                                  <span
                                    style={{
                                      fontSize: '0.72rem',
                                      padding: '3px 8px',
                                      borderRadius: '8px',
                                      backgroundColor:
                                        lang.category === 'oral_traditional' || lang.category === 'endangered'
                                          ? 'rgba(212, 175, 55, 0.2)'
                                          : 'rgba(166, 196, 138, 0.15)',
                                      color:
                                        lang.category === 'oral_traditional' || lang.category === 'endangered'
                                          ? '#E9D8A6'
                                          : '#F5F3E9',
                                      border:
                                        lang.category === 'oral_traditional' || lang.category === 'endangered'
                                          ? '1px solid rgba(212, 175, 55, 0.4)'
                                          : '1px solid rgba(166, 196, 138, 0.3)',
                                      textTransform: 'capitalize',
                                    }}
                                  >
                                    {lang.category.replace('_', ' ')}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Regional Varieties / Dialect Distribution */}
                          {subfam.varieties && subfam.varieties.length > 0 && (
                            <div
                              style={{
                                borderTop: '1px solid rgba(166, 196, 138, 0.15)',
                                paddingTop: '16px',
                              }}
                            >
                              <div
                                style={{
                                  fontSize: '0.78rem',
                                  color: '#E9D8A6',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em',
                                  fontWeight: 700,
                                  marginBottom: '10px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                }}
                              >
                                <Sparkles style={{ width: '14px', height: '14px' }} />
                                Documented Regional Dialects & Oral Traditions:
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '10px' }}>
                                {subfam.varieties.map((v) => (
                                  <div
                                    key={v.id}
                                    style={{
                                      backgroundColor: '#163B2C',
                                      border: '1px solid rgba(212, 175, 55, 0.2)',
                                      borderRadius: '8px',
                                      padding: '10px 14px',
                                    }}
                                  >
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#F5F3E9' }}>
                                      {v.name}
                                    </div>
                                    <div style={{ fontSize: '0.78rem', color: '#A6C48A', marginTop: '2px' }}>
                                      📍 {v.region}
                                    </div>
                                    {v.dialect_marker && (
                                      <div style={{ fontSize: '0.78rem', color: 'rgba(245, 243, 233, 0.75)', marginTop: '4px', fontStyle: 'italic' }}>
                                        {v.dialect_marker}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* TAB 2: DIALECT CARTOGRAPHY & GEOGRAPHIC DISTRIBUTION           */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'cartography' && (
            <div>
              {/* Controls Bar */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '12px',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '20px',
                }}
              >
                {/* Language Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.85rem', color: '#A6C48A', fontWeight: 600 }}>Filter Language:</span>
                  <button
                    onClick={() => setSelectedCartoLang('all')}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: selectedCartoLang === 'all' ? '1px solid #A6C48A' : '1px solid rgba(166, 196, 138, 0.2)',
                      backgroundColor: selectedCartoLang === 'all' ? '#1F5138' : '#163B2C',
                      color: '#F5F3E9',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    All Focal Tongues
                  </button>
                  {cartographyLanguages.map((lName) => (
                    <button
                      key={lName}
                      onClick={() => setSelectedCartoLang(lName)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: selectedCartoLang === lName ? '1px solid #A6C48A' : '1px solid rgba(166, 196, 138, 0.2)',
                        backgroundColor: selectedCartoLang === lName ? '#1F5138' : '#163B2C',
                        color: '#F5F3E9',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {lName}
                    </button>
                  ))}
                </div>

                {/* Search Bar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#163B2C',
                    border: '1px solid rgba(166, 196, 138, 0.3)',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    gap: '8px',
                    minWidth: '240px',
                  }}
                >
                  <Search style={{ width: '16px', height: '16px', color: '#A6C48A' }} />
                  <input
                    type="text"
                    placeholder="Search region, center, or variety..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: '#F5F3E9',
                      fontSize: '0.86rem',
                      width: '100%',
                    }}
                  />
                </div>
              </div>

              {/* Dialects Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
                {filteredDialects.map((d) => (
                  <div
                    key={d.id}
                    style={{
                      backgroundColor: '#163B2C',
                      borderRadius: '12px',
                      border: '1px solid rgba(166, 196, 138, 0.25)',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                    }}
                  >
                    <div>
                      {/* Top Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              color: '#A6C48A',
                              backgroundColor: '#102B20',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                            }}
                          >
                            {d.language_name} ({d.language_code})
                          </span>
                          <h4 style={{ margin: '8px 0 2px 0', fontSize: '1.15rem', color: '#F5F3E9', fontWeight: 700 }}>
                            {d.variety_name}
                          </h4>
                        </div>
                        <div
                          style={{
                            fontSize: '0.78rem',
                            padding: '3px 8px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(212, 175, 55, 0.2)',
                            color: '#E9D8A6',
                            border: '1px solid rgba(212, 175, 55, 0.4)',
                            fontWeight: 600,
                          }}
                        >
                          {d.vitality_tier}
                        </div>
                      </div>

                      {/* Region & GPS Coordinates */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#A6C48A', fontSize: '0.84rem', marginBottom: '8px' }}>
                        <MapPin style={{ width: '14px', height: '14px', flexShrink: 0 }} />
                        <span>{d.region_name}</span>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: 'rgba(245, 243, 233, 0.7)', marginBottom: '12px' }}>
                        <strong>Territory:</strong> {d.states.join(', ')} •{' '}
                        <span style={{ fontFamily: 'monospace', color: '#A6C48A' }}>
                          [{d.latitude.toFixed(4)}° N, {d.longitude.toFixed(4)}° E]
                        </span>
                      </div>

                      {/* Demographics & Cultural Anchor */}
                      <div
                        style={{
                          backgroundColor: '#0E2924',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          marginBottom: '12px',
                          border: '1px solid rgba(166, 196, 138, 0.15)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ color: 'rgba(245, 243, 233, 0.6)' }}>Speaking Cohort:</span>
                          <span style={{ fontWeight: 700, color: '#F5F3E9' }}>
                            {d.speaking_population.toLocaleString()} speakers
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ color: 'rgba(245, 243, 233, 0.6)' }}>Cultural Anchor:</span>
                          <span style={{ fontWeight: 600, color: '#E9D8A6', textAlign: 'right' }}>
                            {d.cultural_anchor}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'rgba(245, 243, 233, 0.6)' }}>Writing Systems:</span>
                          <span style={{ color: '#F5F3E9', textAlign: 'right' }}>
                            {d.writing_systems.join(', ')}
                          </span>
                        </div>
                      </div>

                      {/* Phonological Markers */}
                      <div style={{ marginBottom: '14px' }}>
                        <div style={{ fontSize: '0.76rem', color: '#A6C48A', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                          Phonological Signatures:
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: 'rgba(245, 243, 233, 0.85)' }}>
                          {d.phonological_features.map((feat, idx) => (
                            <li key={idx} style={{ marginBottom: '3px' }}>{feat}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Sample Phrase Box */}
                    <div
                      style={{
                        backgroundColor: '#1E4A3F',
                        borderLeft: '3px solid #E9D8A6',
                        padding: '10px 12px',
                        borderRadius: '0 8px 8px 0',
                        fontSize: '0.84rem',
                        color: '#F5F3E9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#E9D8A6', textTransform: 'uppercase', fontWeight: 700 }}>
                          Field Recorded Oral Phrase:
                        </div>
                        <div style={{ fontStyle: 'italic', marginTop: '2px' }}>
                          "{d.sample_phrase}"
                        </div>
                      </div>
                      <Volume2 style={{ width: '18px', height: '18px', color: '#A6C48A', flexShrink: 0, marginLeft: '8px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* TAB 3: MORPHOLOGICAL COGNATE GRAPH                             */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'morphology' && (
            <div>
              {/* Proto-Root Selector Bar */}
              <div
                style={{
                  backgroundColor: '#163B2C',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  border: '1px solid rgba(166, 196, 138, 0.25)',
                }}
              >
                <div style={{ fontSize: '0.82rem', color: '#A6C48A', textTransform: 'uppercase', fontWeight: 700, marginBottom: '10px' }}>
                  Select Proto-Ancestral Root for Morphological Descent:
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setSelectedRootId('all')}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: selectedRootId === 'all' ? '1px solid #A6C48A' : '1px solid rgba(166, 196, 138, 0.2)',
                      backgroundColor: selectedRootId === 'all' ? '#1F5138' : '#102B20',
                      color: '#F5F3E9',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    All Proto-Roots ({protoRoots.length})
                  </button>
                  {protoRoots.map((root) => (
                    <button
                      key={root.id}
                      onClick={() => setSelectedRootId(root.id)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        border: selectedRootId === root.id ? '1px solid #E9D8A6' : '1px solid rgba(166, 196, 138, 0.2)',
                        backgroundColor: selectedRootId === root.id ? '#1F5138' : '#102B20',
                        color: selectedRootId === root.id ? '#E9D8A6' : '#F5F3E9',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {root.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Relationship Types Legend */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '16px',
                  backgroundColor: '#11352E',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  fontSize: '0.82rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#52B788' }} />
                  <strong>ETYMOLOGICAL_ROOT:</strong> Direct Ancestral Derivation
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#48CAE4' }} />
                  <strong>COGNATE_OF:</strong> Sister Oral Dialect Cognate
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#F4A261' }} />
                  <strong>REGIONAL_LOAN_TRANSITION:</strong> Areal Contact Loan
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#B5838D' }} />
                  <strong>SEMANTIC_ECOLOGICAL_PARALLEL:</strong> Shared Botanical Parallel
                </div>
              </div>

              {/* Interactive Morphological Graph Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                {morphNodes
                  .filter((n) => activeConnectedNodeIds.has(n.id))
                  .map((node) => {
                    const isRoot = node.type === 'proto_root';
                    const nodeEdges = activeEdges.filter((e) => e.source === node.id || e.target === node.id);

                    return (
                      <div
                        key={node.id}
                        style={{
                          backgroundColor: isRoot ? '#1B4332' : '#163B2C',
                          border: isRoot ? '2px solid #A6C48A' : '1px solid rgba(166, 196, 138, 0.25)',
                          borderRadius: '12px',
                          padding: '18px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                backgroundColor: isRoot ? '#1F5138' : '#102B20',
                                color: isRoot ? '#E9D8A6' : '#A6C48A',
                              }}
                            >
                              {isRoot ? node.family : `${node.language} (${node.code})`}
                            </span>
                            {node.ipa && (
                              <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#A6C48A' }}>
                                {node.ipa}
                              </span>
                            )}
                          </div>

                          <h4 style={{ margin: '10px 0 4px 0', fontSize: '1.15rem', color: '#F5F3E9', fontWeight: 700 }}>
                            {node.label}
                          </h4>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(245, 243, 233, 0.75)' }}>
                            {node.meaning}
                          </p>
                        </div>

                        {/* Connected Relationships */}
                        <div
                          style={{
                            marginTop: '16px',
                            borderTop: '1px solid rgba(166, 196, 138, 0.15)',
                            paddingTop: '12px',
                          }}
                        >
                          <div style={{ fontSize: '0.72rem', color: '#A6C48A', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                            Linked Morphological Edges ({nodeEdges.length}):
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {nodeEdges.map((e, idx) => {
                              const otherId = e.source === node.id ? e.target : e.source;
                              const otherNode = morphNodes.find((n) => n.id === otherId);
                              const isSource = e.source === node.id;

                              let relColor = '#52B788';
                              if (e.type === 'COGNATE_OF') relColor = '#48CAE4';
                              if (e.type === 'REGIONAL_LOAN_TRANSITION') relColor = '#F4A261';
                              if (e.type === 'SEMANTIC_ECOLOGICAL_PARALLEL') relColor = '#B5838D';

                              return (
                                <div
                                  key={idx}
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '0.78rem',
                                    backgroundColor: 'rgba(0,0,0,0.2)',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    alignItems: 'center',
                                  }}
                                >
                                  <span style={{ color: relColor, fontWeight: 600 }}>
                                    {isSource ? '→ ' : '← '}
                                    {e.type}
                                  </span>
                                  <span style={{ color: '#F5F3E9' }}>
                                    {otherNode ? otherNode.label : otherId}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* TAB 4: OBJECTIVE VITALITY MATRIX & ANTI-EXTINCTION SOVEREIGNTY  */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'vitality' && (
            <div>
              {/* Anti-Extinction Policy Banner */}
              <div
                style={{
                  backgroundColor: '#163B2C',
                  border: '1px solid #A6C48A',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                }}
              >
                <ShieldCheck style={{ width: '28px', height: '28px', color: '#A6C48A', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: '#F5F3E9', fontWeight: 700 }}>
                    Voice Roots Community Vitality Standard (OCAP-Protected)
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(245, 243, 233, 0.85)', lineHeight: 1.5 }}>
                    {antiExtinctionPolicy ||
                      'Voice Roots strictly rejects speculative external "endangerment" or "extinction" classifications. ' +
                      'Living oral traditions are defined by community sovereignty, intergenerational transmission, and elder custodianship. ' +
                      'All vitality indicators are grounded exclusively in 2011 Census baselines and authenticated community digital holdings.'}
                  </p>
                </div>
              </div>

              {/* Vitality Matrix Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
                {vitalityLangs.map((v) => (
                  <div
                    key={v.language_code}
                    style={{
                      backgroundColor: '#163B2C',
                      borderRadius: '12px',
                      border: '1px solid rgba(166, 196, 138, 0.25)',
                      padding: '22px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    }}
                  >
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <span
                          style={{
                            fontSize: '0.74rem',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            backgroundColor: '#102B20',
                            color: '#A6C48A',
                            textTransform: 'uppercase',
                          }}
                        >
                          {v.family}
                        </span>
                        <h3 style={{ margin: '8px 0 2px 0', fontSize: '1.3rem', color: '#F5F3E9', fontWeight: 700 }}>
                          {v.language_name} ({v.native_name})
                        </h3>
                        <div style={{ fontSize: '0.8rem', color: 'rgba(245, 243, 233, 0.65)' }}>
                          ISO: <code style={{ color: '#A6C48A' }}>{v.language_code}</code> • {v.official_classification}
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: '0.76rem',
                          padding: '4px 10px',
                          borderRadius: '10px',
                          backgroundColor: 'rgba(82, 183, 136, 0.2)',
                          color: '#52B788',
                          border: '1px solid rgba(82, 183, 136, 0.4)',
                          fontWeight: 700,
                          textAlign: 'right',
                        }}
                      >
                        {v.community_status}
                      </div>
                    </div>

                    {/* Census Population Baseline */}
                    <div
                      style={{
                        backgroundColor: '#11352E',
                        padding: '14px',
                        borderRadius: '10px',
                        marginBottom: '16px',
                        border: '1px solid rgba(166, 196, 138, 0.15)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: 'rgba(245, 243, 233, 0.6)', textTransform: 'uppercase' }}>
                            Census Baseline ({v.census_source})
                          </div>
                          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F5F3E9', marginTop: '2px' }}>
                            {v.census_speakers.toLocaleString()}
                          </div>
                        </div>
                        <Globe style={{ width: '28px', height: '28px', color: '#A6C48A', opacity: 0.8 }} />
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'rgba(245, 243, 233, 0.75)', marginTop: '8px' }}>
                        <strong>Core States:</strong> {v.primary_states}
                      </div>
                    </div>

                    {/* Community Archive Documentation Telemetry */}
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '0.76rem', color: '#A6C48A', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>
                        Digital Sovereignty & Archive Holding Metrics:
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                        <div style={{ backgroundColor: '#0E2924', padding: '10px', borderRadius: '8px' }}>
                          <div style={{ fontSize: '0.72rem', color: 'rgba(245, 243, 233, 0.6)' }}>Recorded Stories</div>
                          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#F5F3E9' }}>
                            {v.preservation_metrics.total_recorded_stories}
                          </div>
                        </div>
                        <div style={{ backgroundColor: '#0E2924', padding: '10px', borderRadius: '8px' }}>
                          <div style={{ fontSize: '0.72rem', color: 'rgba(245, 243, 233, 0.6)' }}>Indexed Transcripts</div>
                          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#F5F3E9' }}>
                            {v.preservation_metrics.total_transcripts_indexed}
                          </div>
                        </div>
                        <div style={{ backgroundColor: '#0E2924', padding: '10px', borderRadius: '8px' }}>
                          <div style={{ fontSize: '0.72rem', color: 'rgba(245, 243, 233, 0.6)' }}>Archived Audio</div>
                          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#F5F3E9' }}>
                            {v.preservation_metrics.archived_audio_hours} hrs
                          </div>
                        </div>
                        <div style={{ backgroundColor: '#0E2924', padding: '10px', borderRadius: '8px' }}>
                          <div style={{ fontSize: '0.72rem', color: 'rgba(245, 243, 233, 0.6)' }}>Approved Lexicon</div>
                          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#F5F3E9' }}>
                            {v.preservation_metrics.approved_dictionary_entries} words
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Writing Systems & Community Statement */}
                    <div style={{ fontSize: '0.8rem', color: 'rgba(245, 243, 233, 0.7)', borderTop: '1px solid rgba(166, 196, 138, 0.15)', paddingTop: '12px' }}>
                      <div style={{ marginBottom: '4px' }}>
                        <strong>Active Orthographies:</strong> {v.writing_systems.join(', ')}
                      </div>
                      <div style={{ fontStyle: 'italic', color: '#A6C48A' }}>
                        "{v.vitality_assessment}"
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LanguageExplorer;
