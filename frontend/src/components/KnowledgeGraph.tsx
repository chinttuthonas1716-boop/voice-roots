import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Network,
  Search,
  Layers,
  CheckCircle2,
  Clock,
  Plus,
  X,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Compass,
  ArrowRight,
  Check
} from 'lucide-react';
import {
  KGNode,
  KGOverviewResponse,
  KGSubgraphResponse,
  KGNodeDetailResponse,
  KGEntityType,
  AuthUser,
} from '../types';

export interface KnowledgeGraphProps {
  apiUrl: (path: string) => string;
  adminKey?: string;
  currentUser?: AuthUser | null;
}

const ENTITY_COLORS: Record<string, { bg: string; border: string; text: string; fill: string }> = {
  language: { bg: 'rgba(142, 182, 155, 0.15)', border: '#8EB69B', text: '#DAF1DE', fill: '#8EB69B' },
  variety: { bg: 'rgba(45, 212, 191, 0.15)', border: '#2DD4BF', text: '#99F6E4', fill: '#2DD4BF' },
  script: { bg: 'rgba(167, 139, 250, 0.15)', border: '#A78BFA', text: '#DDD6FE', fill: '#A78BFA' },
  vocabulary: { bg: 'rgba(245, 158, 11, 0.15)', border: '#F59E0B', text: '#FDE68A', fill: '#F59E0B' },
  phrase: { bg: 'rgba(132, 204, 22, 0.15)', border: '#84CC16', text: '#D9F99D', fill: '#84CC16' },
  story: { bg: 'rgba(251, 113, 133, 0.15)', border: '#FB7185', text: '#FECDD3', fill: '#FB7185' },
  transcript: { bg: 'rgba(56, 189, 248, 0.15)', border: '#38BDF8', text: '#BAE6FD', fill: '#38BDF8' },
  translation: { bg: 'rgba(96, 165, 250, 0.15)', border: '#60A5FA', text: '#BFDBFE', fill: '#60A5FA' },
  resource: { bg: 'rgba(192, 132, 252, 0.15)', border: '#C084FC', text: '#E9D5FF', fill: '#C084FC' },
  dataset: { bg: 'rgba(45, 212, 191, 0.15)', border: '#2DD4BF', text: '#CCFBF1', fill: '#2DD4BF' },
};

export function KnowledgeGraph({ apiUrl, adminKey, currentUser }: KnowledgeGraphProps) {
  // View mode: 'visual' or 'tree'
  const [viewMode, setViewMode] = useState<'visual' | 'tree'>('visual');

  // Overview Telemetry
  const [overview, setOverview] = useState<KGOverviewResponse | null>(null);

  // Subgraph visualization data
  const [subgraph, setSubgraph] = useState<KGSubgraphResponse>({ nodes: [], edges: [], total_nodes: 0, total_edges: 0 });
  const [isLoadingGraph, setIsLoadingGraph] = useState(false);
  const [centerNodeId, setCenterNodeId] = useState<string | null>('lang:gon');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedEntityType, setSelectedEntityType] = useState<string>('all');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<KGNode[]>([]);

  // Selected Node Details Drawer
  const [activeNodeId, setActiveNodeId] = useState<string | null>('lang:gon');
  const [nodeDetails, setNodeDetails] = useState<KGNodeDetailResponse | null>(null);

  // Propose New Node Modal State
  const [isProposeModalOpen, setIsProposeModalOpen] = useState(false);
  const [proposeType, setProposeType] = useState<KGEntityType>('vocabulary');
  const [proposeName, setProposeName] = useState('');
  const [proposeNative, setProposeNative] = useState('');
  const [proposeLang, setProposeLang] = useState('gon');
  const [proposeScript, setProposeScript] = useState('Telugu');
  const [proposeSummary, setProposeSummary] = useState('');
  const [proposeMeaning, setProposeMeaning] = useState('');
  const [proposeTranslit, setProposeTranslit] = useState('');
  const [proposeContext, setProposeContext] = useState('');
  const [proposeSourceRef, setProposeSourceRef] = useState('');
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);
  const [proposalSuccess, setProposalSuccess] = useState<string | null>(null);
  const [proposalError, setProposalError] = useState<string | null>(null);

  // Tree View State
  const [expandedLanguages, setExpandedLanguages] = useState<Record<string, boolean>>({ gon: true, kff: true });

  // Visual Graph Canvas Pan / Zoom State
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Fetch High-Level Overview
  const fetchOverview = async () => {
    try {
      const res = await fetch(apiUrl('/api/v1/knowledge-graph/overview'));
      if (res.ok) {
        const data = await res.json();
        setOverview(data);
      }
    } catch (e) {
      console.error('Failed to fetch KG overview:', e);
    }
  };

  // Fetch Subgraph for visual display
  const fetchSubgraph = async (centerId?: string | null, lang?: string, type?: string) => {
    setIsLoadingGraph(true);
    try {
      const params = new URLSearchParams();
      if (centerId) params.set('center_node_id', centerId);
      if (lang && lang !== 'all') params.set('language', lang);
      if (type && type !== 'all') params.set('entity_types', type);
      params.set('max_nodes', '70');

      const res = await fetch(apiUrl(`/api/v1/knowledge-graph/graph?${params.toString()}`));
      if (res.ok) {
        const data: KGSubgraphResponse = await res.json();
        setSubgraph(data);
      }
    } catch (e) {
      console.error('Failed to fetch subgraph:', e);
    } finally {
      setIsLoadingGraph(false);
    }
  };

  // Fetch Node Details
  const fetchNodeDetails = async (nodeId: string) => {
    try {
      const headers: Record<string, string> = {};
      if (adminKey) {
        headers['X-Admin-Key'] = adminKey;
        headers['Authorization'] = `Bearer ${adminKey}`;
      }
      const res = await fetch(apiUrl(`/api/v1/knowledge-graph/nodes/${encodeURIComponent(nodeId)}`), { headers });
      if (res.ok) {
        const data: KGNodeDetailResponse = await res.json();
        setNodeDetails(data);
      }
    } catch (e) {
      console.error('Failed to fetch node details:', e);
    }
  };

  // Handle Search Query with Indic FTS
  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(apiUrl(`/api/v1/knowledge-graph/search?q=${encodeURIComponent(query)}&limit=15`));
        if (res.ok) {
          const data: KGNode[] = await res.json();
          setSearchResults(data);
        }
      } catch (e) {
        console.error('Search failed:', e);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Initial Data Load
  useEffect(() => {
    fetchOverview();
    fetchSubgraph(centerNodeId, selectedLanguage, selectedEntityType);
    if (activeNodeId) {
      fetchNodeDetails(activeNodeId);
    }
  }, []);

  // When active node changes, load its details
  const handleSelectNode = (nodeId: string) => {
    setActiveNodeId(nodeId);
    setCenterNodeId(nodeId);
    fetchNodeDetails(nodeId);
  };

  // Filter changes
  const handleFilterChange = (lang: string, type: string) => {
    setSelectedLanguage(lang);
    setSelectedEntityType(type);
    fetchSubgraph(centerNodeId, lang, type);
  };

  // Reset View Pan & Zoom
  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Mouse pan handlers for SVG canvas
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDraggingCanvas(true);
    dragStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingCanvas) return;
    setPanOffset({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDraggingCanvas(false);
  };

  // 2D Layout computation for SVG Visual Force Graph
  const graphLayout = useMemo(() => {
    const width = 860;
    const height = 540;
    const centerX = width / 2;
    const centerY = height / 2;

    const nodes = subgraph.nodes;
    const edges = subgraph.edges;

    if (nodes.length === 0) {
      return { positions: new Map<string, { x: number; y: number }>(), width, height };
    }

    const positions = new Map<string, { x: number; y: number }>();

    // 1. Position Center Node (if present)
    const centerNode = nodes.find(n => n.node_id === centerNodeId) || nodes[0];
    if (centerNode) {
      positions.set(centerNode.node_id, { x: centerX, y: centerY });
    }

    // 2. Partition other nodes into concentric orbital tiers by entity type
    const tier1: KGNode[] = []; // Direct varieties / scripts
    const tier2: KGNode[] = []; // Vocabulary & Stories
    const tier3: KGNode[] = []; // Other languages / resources

    nodes.forEach(n => {
      if (n.node_id === centerNode?.node_id) return;
      if (n.entity_type === 'variety' || n.entity_type === 'script') {
        tier1.push(n);
      } else if (n.entity_type === 'vocabulary' || n.entity_type === 'story') {
        tier2.push(n);
      } else {
        tier3.push(n);
      }
    });

    const distributeTier = (tierNodes: KGNode[], radius: number, offsetAngle = 0) => {
      const count = tierNodes.length;
      if (count === 0) return;
      const angleStep = (2 * Math.PI) / count;
      tierNodes.forEach((node, i) => {
        const angle = offsetAngle + i * angleStep;
        positions.set(node.node_id, {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        });
      });
    };

    distributeTier(tier1, 140, 0.2);
    distributeTier(tier2, 220, 0.4);
    distributeTier(tier3, 290, 0.6);

    return { positions, width, height, edges, nodes };
  }, [subgraph, centerNodeId]);

  // Handle Propose Node Submission
  const handleProposeNode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposeName.trim()) {
      setProposalError('Name is required.');
      return;
    }
    setIsSubmittingProposal(true);
    setProposalError(null);
    setProposalSuccess(null);

    try {
      const payload: Record<string, any> = {
        entity_type: proposeType,
        name: proposeName.trim(),
        native_name: proposeNative.trim() || undefined,
        primary_language: proposeLang,
        script: proposeScript,
        summary: proposeSummary.trim() || undefined,
        source_reference: proposeSourceRef.trim() || 'Community Field Documentation',
        source_organization: 'Indigenous Linguistic Working Group',
      };

      if (proposeType === 'vocabulary') {
        payload.vocabulary_details = {
          original_word: proposeNative.trim() || proposeName.trim(),
          meaning: proposeMeaning.trim() || proposeSummary.trim(),
          transliteration: proposeTranslit.trim() || undefined,
          cultural_context: proposeContext.trim() || undefined,
        };
      }

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (adminKey) {
        headers['X-Admin-Key'] = adminKey;
        headers['Authorization'] = `Bearer ${adminKey}`;
      }

      const res = await fetch(apiUrl('/api/v1/knowledge-graph/nodes'), {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to propose node.');
      }

      const created = await res.json();
      setProposalSuccess(`Node '${created.name}' successfully proposed under ${created.verification_status} status!`);

      // Reset form
      setProposeName('');
      setProposeNative('');
      setProposeSummary('');
      setProposeMeaning('');
      setProposeTranslit('');
      setProposeContext('');

      // Refresh overview and graph
      fetchOverview();
      fetchSubgraph(created.node_id, selectedLanguage, selectedEntityType);
      handleSelectNode(created.node_id);
    } catch (err: any) {
      setProposalError(err.message || 'Submission failed.');
    } finally {
      setIsSubmittingProposal(false);
    }
  };

  // Handle Admin Verification
  const handleVerifyNode = async (nodeId: string) => {
    if (!adminKey) return;
    try {
      const res = await fetch(apiUrl(`/api/v1/knowledge-graph/nodes/${encodeURIComponent(nodeId)}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': adminKey,
          'Authorization': `Bearer ${adminKey}`,
        },
        body: JSON.stringify({ verification_status: 'VERIFIED' }),
      });
      if (res.ok) {
        fetchNodeDetails(nodeId);
        fetchOverview();
        fetchSubgraph(centerNodeId, selectedLanguage, selectedEntityType);
      }
    } catch (e) {
      console.error('Failed to verify node:', e);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '48px', color: '#DAF1DE' }}>
      {/* ─── Header & Metrics Overview Bar ─── */}
      <section
        style={{
          background: 'linear-gradient(135deg, rgba(11, 43, 38, 0.95), rgba(5, 31, 32, 0.95))',
          border: '1px solid rgba(142, 182, 155, 0.25)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{ background: 'rgba(142, 182, 155, 0.2)', padding: '8px', borderRadius: '10px', color: '#8EB69B' }}>
                <Network size={24} />
              </div>
              <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#FFFFFF', margin: 0, letterSpacing: '-0.02em' }}>
                Language Knowledge Graph
              </h1>
              <span
                style={{
                  background: 'rgba(142, 182, 155, 0.15)',
                  border: '1px solid rgba(142, 182, 155, 0.4)',
                  color: '#8EB69B',
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                Milestone 16
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '14px', color: 'rgba(218, 241, 222, 0.75)', maxWidth: '640px' }}>
              Explore structured semantic relationships between indigenous languages, regional varieties, scripts, and community-verified oral vocabulary.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {currentUser && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(142, 182, 155, 0.15)',
                  border: '1px solid #8EB69B',
                  borderRadius: '8px',
                  padding: '7px 12px',
                  fontSize: '12px',
                  color: '#DAF1DE',
                  fontWeight: '600'
                }}
              >
                <CheckCircle2 size={14} color="#8EB69B" />
                <span>
                  <strong style={{ color: '#8EB69B', textTransform: 'uppercase' }}>{currentUser.role}</strong>: {currentUser.full_name || currentUser.username}
                </span>
              </div>
            )}
            <button
              onClick={() => setIsProposeModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#8EB69B',
                color: '#051F20',
                border: 'none',
                padding: '9px 16px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Plus size={16} /> Propose Knowledge Node
            </button>
            <button
              onClick={() => { fetchOverview(); fetchSubgraph(centerNodeId, selectedLanguage, selectedEntityType); }}
              title="Refresh Graph Data"
              style={{
                background: 'rgba(218, 241, 222, 0.08)',
                border: '1px solid rgba(142, 182, 155, 0.2)',
                color: '#DAF1DE',
                padding: '9px 12px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={16} className={isLoadingGraph ? 'spin' : ''} />
            </button>
          </div>
        </div>

        {/* Telemetry Stat Pills */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
          <div style={{ background: 'rgba(5, 31, 32, 0.6)', border: '1px solid rgba(142, 182, 155, 0.15)', borderRadius: '10px', padding: '12px 16px' }}>
            <span style={{ fontSize: '11px', color: 'rgba(218, 241, 222, 0.6)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Nodes</span>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#DAF1DE', marginTop: '2px' }}>
              {overview?.total_nodes ?? '—'}
            </div>
          </div>
          <div style={{ background: 'rgba(5, 31, 32, 0.6)', border: '1px solid rgba(142, 182, 155, 0.15)', borderRadius: '10px', padding: '12px 16px' }}>
            <span style={{ fontSize: '11px', color: 'rgba(218, 241, 222, 0.6)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Semantic Edges</span>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#8EB69B', marginTop: '2px' }}>
              {overview?.total_relationships ?? '—'}
            </div>
          </div>
          <div style={{ background: 'rgba(5, 31, 32, 0.6)', border: '1px solid rgba(142, 182, 155, 0.15)', borderRadius: '10px', padding: '12px 16px' }}>
            <span style={{ fontSize: '11px', color: 'rgba(218, 241, 222, 0.6)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Languages</span>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#2DD4BF', marginTop: '2px' }}>
              {overview?.languages_represented ?? '—'}
            </div>
          </div>
          <div style={{ background: 'rgba(5, 31, 32, 0.6)', border: '1px solid rgba(142, 182, 155, 0.15)', borderRadius: '10px', padding: '12px 16px' }}>
            <span style={{ fontSize: '11px', color: 'rgba(218, 241, 222, 0.6)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Verified Ratio</span>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#34D399', marginTop: '2px' }}>
              {overview ? `${Math.round(overview.verified_ratio * 100)}%` : '—'}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Search & Controls Toolbar ─── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Indic Unicode Search Box */}
        <div style={{ position: 'relative', flex: '1', minWidth: '260px', maxWidth: '440px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'rgba(218, 241, 222, 0.5)' }} />
          <input
            type="text"
            placeholder="Search language, script, or Indic vocabulary (e.g. Gondi, పెన్, baha)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(11, 43, 38, 0.7)',
              border: '1px solid rgba(142, 182, 155, 0.3)',
              borderRadius: '8px',
              padding: '9px 14px 9px 36px',
              color: '#FFFFFF',
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: '10px', top: '10px', background: 'transparent', border: 'none', color: '#8EB69B', cursor: 'pointer' }}
            >
              <X size={14} />
            </button>
          )}

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '42px',
                left: 0,
                right: 0,
                background: '#0B2B26',
                border: '1px solid #8EB69B',
                borderRadius: '8px',
                zIndex: 40,
                maxHeight: '280px',
                overflowY: 'auto',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
              }}
            >
              {searchResults.map((n) => (
                <div
                  key={n.node_id}
                  onClick={() => {
                    handleSelectNode(n.node_id);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  style={{
                    padding: '10px 14px',
                    borderBottom: '1px solid rgba(142, 182, 155, 0.1)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'background 0.12s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(142, 182, 155, 0.15)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '13px', color: '#DAF1DE' }}>{n.name}</div>
                    {n.native_name && <div style={{ fontSize: '11px', color: 'rgba(218, 241, 222, 0.65)' }}>{n.native_name}</div>}
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: ENTITY_COLORS[n.entity_type]?.bg || 'rgba(255, 255, 255, 0.1)',
                      color: ENTITY_COLORS[n.entity_type]?.border || '#FFFFFF',
                      fontWeight: '700'
                    }}
                  >
                    {n.entity_type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filters and View Switcher */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Language filter */}
          <select
            value={selectedLanguage}
            onChange={(e) => handleFilterChange(e.target.value, selectedEntityType)}
            style={{
              background: 'rgba(11, 43, 38, 0.7)',
              border: '1px solid rgba(142, 182, 155, 0.3)',
              borderRadius: '8px',
              padding: '8px 12px',
              color: '#DAF1DE',
              fontSize: '12px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Languages</option>
            <option value="gon">Gondi (gon)</option>
            <option value="kff">Koya (kff)</option>
            <option value="sat">Santhali (sat)</option>
            <option value="lmn">Lambadi (lmn)</option>
            <option value="te">Telugu (te)</option>
            <option value="hi">Hindi (hi)</option>
          </select>

          {/* Entity Type filter */}
          <select
            value={selectedEntityType}
            onChange={(e) => handleFilterChange(selectedLanguage, e.target.value)}
            style={{
              background: 'rgba(11, 43, 38, 0.7)',
              border: '1px solid rgba(142, 182, 155, 0.3)',
              borderRadius: '8px',
              padding: '8px 12px',
              color: '#DAF1DE',
              fontSize: '12px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Entity Types</option>
            <option value="language">Languages</option>
            <option value="variety">Varieties / Dialects</option>
            <option value="script">Scripts</option>
            <option value="vocabulary">Vocabulary</option>
            <option value="story">Oral Stories</option>
          </select>

          {/* Dual Mode Switcher: Visual Graph vs Accessible Tree */}
          <div style={{ display: 'flex', background: 'rgba(11, 43, 38, 0.8)', border: '1px solid rgba(142, 182, 155, 0.3)', borderRadius: '8px', padding: '2px' }}>
            <button
              type="button"
              onClick={() => setViewMode('visual')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'visual' ? '#8EB69B' : 'transparent',
                color: viewMode === 'visual' ? '#051F20' : '#DAF1DE',
                fontWeight: viewMode === 'visual' ? '700' : '500',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              <Network size={14} /> Visual Graph
            </button>
            <button
              type="button"
              onClick={() => setViewMode('tree')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'tree' ? '#8EB69B' : 'transparent',
                color: viewMode === 'tree' ? '#051F20' : '#DAF1DE',
                fontWeight: viewMode === 'tree' ? '700' : '500',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              <Layers size={14} /> Accessible Tree
            </button>
          </div>
        </div>
      </div>

      {/* ─── Main Content Area: Graph Canvas / Tree View + Details Drawer ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(320px, 380px)', gap: '16px', alignItems: 'start' }}>
        {/* Left Panel: Visual Force Graph OR Accessible Tree View */}
        <div
          style={{
            background: 'rgba(11, 43, 38, 0.75)',
            border: '1px solid rgba(142, 182, 155, 0.25)',
            borderRadius: '14px',
            overflow: 'hidden',
            position: 'relative',
            minHeight: '560px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {viewMode === 'visual' ? (
            /* ─── Visual Force Graph (SVG) ─── */
            <div style={{ position: 'relative', width: '100%', height: '560px', overflow: 'hidden' }}>
              {/* Zoom & Navigation Controls */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  zIndex: 10,
                  background: 'rgba(5, 31, 32, 0.85)',
                  border: '1px solid rgba(142, 182, 155, 0.25)',
                  borderRadius: '8px',
                  padding: '4px'
                }}
              >
                <button
                  type="button"
                  title="Zoom In"
                  onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 2.5))}
                  style={{ background: 'transparent', border: 'none', color: '#DAF1DE', padding: '6px', cursor: 'pointer' }}
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  type="button"
                  title="Zoom Out"
                  onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.5))}
                  style={{ background: 'transparent', border: 'none', color: '#DAF1DE', padding: '6px', cursor: 'pointer' }}
                >
                  <ZoomOut size={16} />
                </button>
                <button
                  type="button"
                  title="Reset View"
                  onClick={handleResetZoom}
                  style={{ background: 'transparent', border: 'none', color: '#8EB69B', padding: '6px', cursor: 'pointer' }}
                >
                  <Maximize2 size={16} />
                </button>
              </div>

              {/* Legend */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  zIndex: 10,
                  background: 'rgba(5, 31, 32, 0.85)',
                  border: '1px solid rgba(142, 182, 155, 0.25)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  display: 'flex',
                  gap: '12px',
                  flexWrap: 'wrap',
                  fontSize: '11px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8EB69B' }} /> Language
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2DD4BF' }} /> Variety
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#A78BFA' }} /> Script
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} /> Vocabulary
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FB7185' }} /> Story
                </div>
              </div>

              {/* Interactive SVG Canvas */}
              <svg
                ref={svgRef}
                width="100%"
                height="100%"
                viewBox={`0 0 ${graphLayout.width} ${graphLayout.height}`}
                style={{ cursor: isDraggingCanvas ? 'grabbing' : 'grab', userSelect: 'none' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              >
                <defs>
                  {/* Arrow marker for directional relationship edges */}
                  <marker
                    id="arrowhead"
                    markerWidth="8"
                    markerHeight="6"
                    refX="18"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 8 3, 0 6" fill="rgba(142, 182, 155, 0.6)" />
                  </marker>
                </defs>

                <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}>
                  {/* Semantic Edges */}
                  {graphLayout.edges?.map((edge) => {
                    const sourcePos = graphLayout.positions.get(edge.source_id);
                    const targetPos = graphLayout.positions.get(edge.target_id);
                    if (!sourcePos || !targetPos) return null;

                    const isHighlighted = edge.source_id === activeNodeId || edge.target_id === activeNodeId;

                    return (
                      <g key={edge.id}>
                        <line
                          x1={sourcePos.x}
                          y1={sourcePos.y}
                          x2={targetPos.x}
                          y2={targetPos.y}
                          stroke={isHighlighted ? '#8EB69B' : 'rgba(142, 182, 155, 0.25)'}
                          strokeWidth={isHighlighted ? 2 : 1}
                          strokeDasharray={edge.relationship_type.includes('TRANSLAT') ? '4 2' : undefined}
                          markerEnd="url(#arrowhead)"
                        />
                      </g>
                    );
                  })}

                  {/* Nodes */}
                  {graphLayout.nodes?.map((node) => {
                    const pos = graphLayout.positions.get(node.node_id);
                    if (!pos) return null;

                    const isSelected = node.node_id === activeNodeId;
                    const isCenter = node.node_id === centerNodeId;
                    const colorScheme = ENTITY_COLORS[node.entity_type] || ENTITY_COLORS.language;
                    const radius = isCenter ? 26 : isSelected ? 22 : 18;

                    return (
                      <g
                        key={node.node_id}
                        transform={`translate(${pos.x}, ${pos.y})`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectNode(node.node_id);
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        {/* Glow effect for selected node */}
                        {isSelected && (
                          <circle
                            r={radius + 6}
                            fill="none"
                            stroke="#DAF1DE"
                            strokeWidth="2"
                            strokeDasharray="3 3"
                            opacity="0.8"
                          />
                        )}

                        <circle
                          r={radius}
                          fill={colorScheme.fill}
                          stroke="#051F20"
                          strokeWidth="2"
                          opacity={isSelected ? 1 : 0.85}
                        />

                        {/* Node Label Text */}
                        <text
                          y={radius + 14}
                          textAnchor="middle"
                          fill="#FFFFFF"
                          fontSize="11px"
                          fontWeight={isSelected ? '700' : '500'}
                          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
                        >
                          {node.name.length > 18 ? `${node.name.slice(0, 16)}…` : node.name}
                        </text>

                        {/* Native Script Subtext */}
                        {node.native_name && node.native_name !== node.name && (
                          <text
                            y={radius + 26}
                            textAnchor="middle"
                            fill="#8EB69B"
                            fontSize="9px"
                            fontWeight="500"
                            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
                          >
                            {node.native_name.length > 20 ? `${node.native_name.slice(0, 18)}…` : node.native_name}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>
          ) : (
            /* ─── Accessible Tree Hierarchy View ─── */
            <div
              role="tree"
              aria-label="Language Knowledge Graph Hierarchy"
              style={{ padding: '20px', overflowY: 'auto', maxHeight: '560px' }}
            >
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#8EB69B', marginBottom: '14px' }}>
                Linguistic Hierarchy & Ontology
              </h3>

              {subgraph.nodes
                .filter((n) => n.entity_type === 'language')
                .map((langNode) => {
                  const langCode = langNode.primary_language || langNode.node_id.replace('lang:', '');
                  const isExpanded = !!expandedLanguages[langCode];

                  // Connected varieties
                  const varieties = subgraph.nodes.filter(
                    (v) => v.entity_type === 'variety' && v.primary_language === langCode
                  );
                  // Connected vocabulary
                  const vocabularies = subgraph.nodes.filter(
                    (w) => w.entity_type === 'vocabulary' && w.primary_language === langCode
                  );

                  return (
                    <div
                      key={langNode.node_id}
                      role="treeitem"
                      aria-expanded={isExpanded}
                      style={{ marginBottom: '12px', borderLeft: '2px solid rgba(142, 182, 155, 0.3)', paddingLeft: '12px' }}
                    >
                      <div
                        onClick={() => {
                          setExpandedLanguages((prev) => ({ ...prev, [langCode]: !prev[langCode] }));
                          handleSelectNode(langNode.node_id);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          padding: '6px 0',
                          color: activeNodeId === langNode.node_id ? '#8EB69B' : '#DAF1DE',
                          fontWeight: '700',
                          fontSize: '14px'
                        }}
                      >
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        <span>{langNode.name}</span>
                        {langNode.native_name && (
                          <span style={{ fontSize: '12px', color: 'rgba(218, 241, 222, 0.65)' }}>
                            ({langNode.native_name})
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: '10px',
                            background: 'rgba(142, 182, 155, 0.2)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            color: '#8EB69B'
                          }}
                        >
                          {langCode}
                        </span>
                      </div>

                      {isExpanded && (
                        <div style={{ marginLeft: '16px', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                          {/* Varieties */}
                          {varieties.length > 0 && (
                            <div>
                              <div style={{ fontSize: '11px', color: '#2DD4BF', textTransform: 'uppercase', fontWeight: '700' }}>
                                Dialects & Regional Varieties ({varieties.length})
                              </div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                                {varieties.map((v) => (
                                  <button
                                    key={v.node_id}
                                    onClick={() => handleSelectNode(v.node_id)}
                                    style={{
                                      background: activeNodeId === v.node_id ? 'rgba(45, 212, 191, 0.3)' : 'rgba(45, 212, 191, 0.1)',
                                      border: '1px solid rgba(45, 212, 191, 0.3)',
                                      borderRadius: '6px',
                                      padding: '4px 8px',
                                      fontSize: '12px',
                                      color: '#99F6E4',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    {v.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Vocabulary */}
                          {vocabularies.length > 0 && (
                            <div>
                              <div style={{ fontSize: '11px', color: '#F59E0B', textTransform: 'uppercase', fontWeight: '700' }}>
                                Documented Vocabulary ({vocabularies.length})
                              </div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                                {vocabularies.map((w) => (
                                  <button
                                    key={w.node_id}
                                    onClick={() => handleSelectNode(w.node_id)}
                                    style={{
                                      background: activeNodeId === w.node_id ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.1)',
                                      border: '1px solid rgba(245, 158, 11, 0.3)',
                                      borderRadius: '6px',
                                      padding: '4px 8px',
                                      fontSize: '12px',
                                      color: '#FDE68A',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    {w.name}
                                  </button>
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
          )}
        </div>

        {/* Right Panel: Selected Entity Details & Provenance Drawer */}
        <div
          style={{
            background: 'rgba(11, 43, 38, 0.85)',
            border: '1px solid rgba(142, 182, 155, 0.3)',
            borderRadius: '14px',
            padding: '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            maxHeight: '560px',
            overflowY: 'auto'
          }}
        >
          {nodeDetails?.node ? (
            <>
              {/* Entity Header */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      fontWeight: '800',
                      letterSpacing: '0.06em',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      background: ENTITY_COLORS[nodeDetails.node.entity_type]?.bg || 'rgba(142, 182, 155, 0.15)',
                      color: ENTITY_COLORS[nodeDetails.node.entity_type]?.border || '#8EB69B'
                    }}
                  >
                    {nodeDetails.node.entity_type}
                  </span>

                  {/* Verification Status Badge */}
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontWeight: '700',
                      color: nodeDetails.node.verification_status === 'VERIFIED' ? '#34D399' : '#FBBF24'
                    }}
                  >
                    {nodeDetails.node.verification_status === 'VERIFIED' ? (
                      <CheckCircle2 size={13} />
                    ) : (
                      <Clock size={13} />
                    )}
                    {nodeDetails.node.verification_status}
                  </span>
                </div>

                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#FFFFFF', margin: '0 0 4px 0' }}>
                  {nodeDetails.node.name}
                </h2>
                {nodeDetails.node.native_name && (
                  <div style={{ fontSize: '15px', color: '#8EB69B', fontWeight: '600', marginBottom: '8px' }}>
                    {nodeDetails.node.native_name}
                  </div>
                )}
                {nodeDetails.node.summary && (
                  <p style={{ margin: 0, fontSize: '13px', color: 'rgba(218, 241, 222, 0.85)', lineHeight: '1.4' }}>
                    {nodeDetails.node.summary}
                  </p>
                )}
              </div>

              {/* Vocabulary Specific Details */}
              {nodeDetails.vocabulary_details && (
                <div
                  style={{
                    background: 'rgba(5, 31, 32, 0.7)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    borderRadius: '10px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ fontSize: '11px', color: '#F59E0B', textTransform: 'uppercase', fontWeight: '800' }}>
                    Linguistic & Cultural Annotation
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'rgba(218, 241, 222, 0.6)' }}>Meaning / English Gloss:</span>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF' }}>
                      {nodeDetails.vocabulary_details.meaning}
                    </div>
                  </div>
                  {nodeDetails.vocabulary_details.transliteration && (
                    <div>
                      <span style={{ fontSize: '11px', color: 'rgba(218, 241, 222, 0.6)' }}>Transliteration:</span>
                      <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#99F6E4' }}>
                        {nodeDetails.vocabulary_details.transliteration}
                      </div>
                    </div>
                  )}
                  {nodeDetails.vocabulary_details.cultural_context && (
                    <div>
                      <span style={{ fontSize: '11px', color: 'rgba(218, 241, 222, 0.6)' }}>Cultural Context:</span>
                      <div style={{ fontSize: '12px', color: '#DAF1DE', fontStyle: 'italic' }}>
                        "{nodeDetails.vocabulary_details.cultural_context}"
                      </div>
                    </div>
                  )}
                  {nodeDetails.vocabulary_details.audio_url && (
                    <div style={{ marginTop: '4px' }}>
                      <audio controls src={apiUrl(nodeDetails.vocabulary_details.audio_url)} style={{ width: '100%', height: '32px' }} />
                    </div>
                  )}
                </div>
              )}

              {/* Language Specific Metadata */}
              {nodeDetails.node.entity_type === 'language' && nodeDetails.node.metadata && (
                <div
                  style={{
                    background: 'rgba(5, 31, 32, 0.7)',
                    border: '1px solid rgba(142, 182, 155, 0.2)',
                    borderRadius: '10px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    fontSize: '12px'
                  }}
                >
                  <div>
                    <span style={{ color: 'rgba(218, 241, 222, 0.6)' }}>Family: </span>
                    <strong style={{ color: '#DAF1DE' }}>{nodeDetails.node.metadata.family || 'Dravidian'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'rgba(218, 241, 222, 0.6)' }}>Region: </span>
                    <span style={{ color: '#DAF1DE' }}>{nodeDetails.node.metadata.region || 'Central India'}</span>
                  </div>
                  {nodeDetails.node.metadata.known_limitations && (
                    <div style={{ marginTop: '4px', padding: '6px 8px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)', color: '#FDE68A', fontSize: '11px' }}>
                      ⚠️ {nodeDetails.node.metadata.known_limitations}
                    </div>
                  )}
                </div>
              )}

              {/* Connected Semantic Links */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#8EB69B', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Compass size={14} /> Connected Knowledge ({nodeDetails.outgoing_relationships.length + nodeDetails.incoming_relationships.length})
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {nodeDetails.outgoing_relationships.map((rel) => (
                    <div
                      key={rel.id}
                      onClick={() => handleSelectNode(rel.target_id)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: 'rgba(5, 31, 32, 0.5)',
                        border: '1px solid rgba(142, 182, 155, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ArrowRight size={12} color="#8EB69B" />
                        <span style={{ color: '#FFFFFF', fontWeight: '600' }}>{rel.target_name || rel.target_id}</span>
                      </div>
                      <span style={{ fontSize: '10px', color: 'rgba(218, 241, 222, 0.5)', textTransform: 'lowercase' }}>
                        {rel.relationship_type.replace(/_/g, ' ')}
                      </span>
                    </div>
                  ))}

                  {nodeDetails.incoming_relationships.map((rel) => (
                    <div
                      key={rel.id}
                      onClick={() => handleSelectNode(rel.source_id)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: 'rgba(5, 31, 32, 0.5)',
                        border: '1px solid rgba(142, 182, 155, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ChevronRight size={12} color="#A78BFA" />
                        <span style={{ color: '#FFFFFF', fontWeight: '600' }}>{rel.source_name || rel.source_id}</span>
                      </div>
                      <span style={{ fontSize: '10px', color: 'rgba(218, 241, 222, 0.5)', textTransform: 'lowercase' }}>
                        {rel.relationship_type.replace(/_/g, ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Provenance & Citation Metadata */}
              <div
                style={{
                  marginTop: 'auto',
                  paddingTop: '12px',
                  borderTop: '1px solid rgba(142, 182, 155, 0.2)',
                  fontSize: '11px',
                  color: 'rgba(218, 241, 222, 0.65)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div>
                  <strong>Source: </strong>
                  {nodeDetails.node.source_reference || 'Census of India C-16'}
                </div>
                {nodeDetails.node.source_organization && (
                  <div>
                    <strong>Custodian: </strong>
                    {nodeDetails.node.source_organization}
                  </div>
                )}
                {nodeDetails.node.dataset_version && (
                  <div>
                    <strong>Dataset Version: </strong>
                    {nodeDetails.node.dataset_version}
                  </div>
                )}

                {/* Admin Verify Action */}
                {adminKey && nodeDetails.node.verification_status !== 'VERIFIED' && (
                  <button
                    onClick={() => handleVerifyNode(nodeDetails.node.node_id)}
                    style={{
                      marginTop: '8px',
                      background: '#10B981',
                      color: '#051F20',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <Check size={14} /> Verify Knowledge Node (Admin)
                  </button>
                )}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 16px', color: 'rgba(218, 241, 222, 0.5)' }}>
              <Compass size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
              <div>Select any node on the graph to view complete provenance and linguistic details.</div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Propose Knowledge Node Modal ─── */}
      {isProposeModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px'
          }}
        >
          <div
            style={{
              background: '#0B2B26',
              border: '1px solid #8EB69B',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 16px 48px rgba(0, 0, 0, 0.7)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={20} color="#8EB69B" />
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#FFFFFF' }}>
                  Propose Knowledge Node
                </h3>
              </div>
              <button
                onClick={() => setIsProposeModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#DAF1DE', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'rgba(218, 241, 222, 0.75)' }}>
              Contributions are submitted under Community Governance. Public contributions enter as <strong>PROPOSED</strong> for accredited elder review.
            </p>

            {proposalSuccess && (
              <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(52, 211, 153, 0.15)', border: '1px solid #34D399', color: '#34D399', fontSize: '13px', marginBottom: '14px' }}>
                {proposalSuccess}
              </div>
            )}

            {proposalError && (
              <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #EF4444', color: '#F87171', fontSize: '13px', marginBottom: '14px' }}>
                {proposalError}
              </div>
            )}

            <form onSubmit={handleProposeNode} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#8EB69B', display: 'block', marginBottom: '4px' }}>
                  Entity Type
                </label>
                <select
                  value={proposeType}
                  onChange={(e) => setProposeType(e.target.value as KGEntityType)}
                  style={{ width: '100%', background: '#051F20', border: '1px solid rgba(142, 182, 155, 0.3)', borderRadius: '6px', padding: '8px', color: '#FFFFFF' }}
                >
                  <option value="vocabulary">Vocabulary Word</option>
                  <option value="variety">Dialect / Variety</option>
                  <option value="script">Script</option>
                  <option value="story">Oral Story</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#8EB69B', display: 'block', marginBottom: '4px' }}>
                    Title / Word (English / Latin) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. marra"
                    value={proposeName}
                    onChange={(e) => setProposeName(e.target.value)}
                    style={{ width: '100%', background: '#051F20', border: '1px solid rgba(142, 182, 155, 0.3)', borderRadius: '6px', padding: '8px', color: '#FFFFFF', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#8EB69B', display: 'block', marginBottom: '4px' }}>
                    Native Script Form
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. మర్ర / मर्रा"
                    value={proposeNative}
                    onChange={(e) => setProposeNative(e.target.value)}
                    style={{ width: '100%', background: '#051F20', border: '1px solid rgba(142, 182, 155, 0.3)', borderRadius: '6px', padding: '8px', color: '#FFFFFF', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#8EB69B', display: 'block', marginBottom: '4px' }}>
                    Primary Language
                  </label>
                  <select
                    value={proposeLang}
                    onChange={(e) => setProposeLang(e.target.value)}
                    style={{ width: '100%', background: '#051F20', border: '1px solid rgba(142, 182, 155, 0.3)', borderRadius: '6px', padding: '8px', color: '#FFFFFF' }}
                  >
                    <option value="gon">Gondi (gon)</option>
                    <option value="kff">Koya (kff)</option>
                    <option value="sat">Santhali (sat)</option>
                    <option value="lmn">Lambadi (lmn)</option>
                    <option value="te">Telugu (te)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#8EB69B', display: 'block', marginBottom: '4px' }}>
                    Script Orthography
                  </label>
                  <input
                    type="text"
                    placeholder="Telugu / Devanagari / Ol Chiki"
                    value={proposeScript}
                    onChange={(e) => setProposeScript(e.target.value)}
                    style={{ width: '100%', background: '#051F20', border: '1px solid rgba(142, 182, 155, 0.3)', borderRadius: '6px', padding: '8px', color: '#FFFFFF', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {proposeType === 'vocabulary' && (
                <>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#8EB69B', display: 'block', marginBottom: '4px' }}>
                      English Meaning / Gloss *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tree / Forest sacred timber"
                      value={proposeMeaning}
                      onChange={(e) => setProposeMeaning(e.target.value)}
                      style={{ width: '100%', background: '#051F20', border: '1px solid rgba(142, 182, 155, 0.3)', borderRadius: '6px', padding: '8px', color: '#FFFFFF', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#8EB69B', display: 'block', marginBottom: '4px' }}>
                      Cultural Context / Traditional Usage
                    </label>
                    <textarea
                      placeholder="Explain traditional sacred significance or village oral context..."
                      value={proposeContext}
                      onChange={(e) => setProposeContext(e.target.value)}
                      rows={2}
                      style={{ width: '100%', background: '#051F20', border: '1px solid rgba(142, 182, 155, 0.3)', borderRadius: '6px', padding: '8px', color: '#FFFFFF', boxSizing: 'border-box' }}
                    />
                  </div>
                </>
              )}

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#8EB69B', display: 'block', marginBottom: '4px' }}>
                  Source Reference / Citation
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gondi Ethnobotanical Lexicon (2024)"
                  value={proposeSourceRef}
                  onChange={(e) => setProposeSourceRef(e.target.value)}
                  style={{ width: '100%', background: '#051F20', border: '1px solid rgba(142, 182, 155, 0.3)', borderRadius: '6px', padding: '8px', color: '#FFFFFF', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsProposeModalOpen(false)}
                  style={{ background: 'transparent', border: '1px solid rgba(142, 182, 155, 0.3)', color: '#DAF1DE', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProposal}
                  style={{
                    background: '#8EB69B',
                    color: '#051F20',
                    border: 'none',
                    padding: '8px 18px',
                    borderRadius: '6px',
                    fontWeight: '700',
                    cursor: isSubmittingProposal ? 'not-allowed' : 'pointer'
                  }}
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
}

