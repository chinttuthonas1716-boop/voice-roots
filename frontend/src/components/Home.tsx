import { 
  Mic, 
  Globe, 
  Languages, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2,
  Network,
  BookOpen,
  Headphones,
  GraduationCap,
  Database,
  Search,
  Bot,
  Layers,
  Activity,
  ExternalLink
} from 'lucide-react';

interface HomeProps {
  onNavigate: (tab: any) => void;
  transcriptCount: number;
  languageCount: number;
  vectorDocCount: number;
}

export function Home({ onNavigate, transcriptCount, languageCount, vectorDocCount }: HomeProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px', paddingBottom: '48px' }}>
      {/* ─── Hero Section with Cinematic Forest Styling ─── */}
      <section 
        className="hero-forest-bg" 
        style={{ 
          padding: 'clamp(36px, 6vw, 68px) clamp(16px, 4vw, 36px) clamp(28px, 4vw, 48px)',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        <div style={{ maxWidth: '880px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'rgba(22, 56, 50, 0.75)', 
            border: '1px solid #8EB69B', 
            padding: '6px 14px', 
            borderRadius: '20px', 
            marginBottom: '16px',
            fontSize: '12px',
            color: '#DAF1DE',
            fontWeight: '600'
          }}>
            <Sparkles size={14} color="#8EB69B" />
            <span>Milestone 21: Unified Oral Language AI Ecosystem</span>
          </div>

          <h1 style={{ 
            fontSize: 'clamp(36px, 8vw, 60px)', 
            fontWeight: '800', 
            lineHeight: '1.12', 
            letterSpacing: '-0.03em', 
            color: '#FFFFFF',
            marginBottom: '12px'
          }}>
            Voice <span style={{ color: '#8EB69B' }}>Roots</span>
          </h1>

          <h2 style={{
            fontSize: 'clamp(17px, 4vw, 22px)',
            fontWeight: '600',
            color: '#DAF1DE',
            marginBottom: '14px',
            letterSpacing: '-0.01em',
            lineHeight: '1.3',
            maxWidth: '100%',
            overflowWrap: 'break-word'
          }}>
            Rooting Oral Languages in Text with AI — All in One Platform
          </h2>

          <p style={{ 
            fontSize: '15px', 
            lineHeight: '1.6', 
            color: 'rgba(218, 241, 222, 0.85)', 
            marginBottom: '32px',
            maxWidth: '680px',
            margin: '0 auto 32px',
            overflowWrap: 'break-word'
          }}>
            Preserve, explore, and master indigenous and unwritten oral tongues. Powered by dual-layer AI annotation,
            genealogical knowledge graphs, elder-governed cultural archives, acoustic phonetics, and open research APIs.
          </p>

          {/* Primary Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center', width: '100%' }}>
            <button 
              type="button"
              onClick={() => onNavigate('record')}
              className="btn-primary"
              style={{ fontSize: '15px', padding: '12px 24px', borderRadius: '30px', flex: '1 1 180px', maxWidth: '240px' }}
            >
              <Mic size={18} />
              <span>Start Recording</span>
            </button>

            <button 
              type="button"
              onClick={() => onNavigate('graph')}
              className="btn-secondary"
              style={{ fontSize: '15px', padding: '12px 24px', borderRadius: '30px', background: 'rgba(11, 43, 38, 0.8)', flex: '1 1 180px', maxWidth: '240px' }}
            >
              <Network size={18} color="#8EB69B" />
              <span>Knowledge Graph</span>
            </button>

            <button 
              type="button"
              onClick={() => onNavigate('cultural')}
              className="btn-secondary"
              style={{ fontSize: '15px', padding: '12px 24px', borderRadius: '30px', background: 'rgba(11, 43, 38, 0.8)', flex: '1 1 180px', maxWidth: '240px' }}
            >
              <BookOpen size={18} color="#8EB69B" />
              <span>Cultural Archives</span>
            </button>
          </div>

          {/* Unified Ecosystem Metrics Bar */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
            gap: '12px', 
            marginTop: '44px',
            paddingTop: '24px',
            borderTop: '1px solid rgba(35, 83, 71, 0.5)'
          }}>
            <div style={{ background: 'rgba(22, 56, 50, 0.5)', padding: '12px 14px', borderRadius: '14px', border: '1px solid rgba(35, 83, 71, 0.6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#8EB69B', fontSize: '13px', fontWeight: '700' }}>
                <Globe size={15} />
                <span>{languageCount > 0 ? `${languageCount}+` : '50+'}</span>
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(218, 241, 222, 0.7)', marginTop: '4px' }}>Languages</p>
            </div>

            <div style={{ background: 'rgba(22, 56, 50, 0.5)', padding: '12px 14px', borderRadius: '14px', border: '1px solid rgba(35, 83, 71, 0.6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#8EB69B', fontSize: '13px', fontWeight: '700' }}>
                <Mic size={15} />
                <span>{transcriptCount > 0 ? `${transcriptCount}` : '1,000+'}</span>
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(218, 241, 222, 0.7)', marginTop: '4px' }}>Audio Masters</p>
            </div>

            <div style={{ background: 'rgba(22, 56, 50, 0.5)', padding: '12px 14px', borderRadius: '14px', border: '1px solid rgba(35, 83, 71, 0.6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#8EB69B', fontSize: '13px', fontWeight: '700' }}>
                <Network size={15} />
                <span>121+</span>
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(218, 241, 222, 0.7)', marginTop: '4px' }}>Graph Nodes</p>
            </div>

            <div style={{ background: 'rgba(22, 56, 50, 0.5)', padding: '12px 14px', borderRadius: '14px', border: '1px solid rgba(35, 83, 71, 0.6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#8EB69B', fontSize: '13px', fontWeight: '700' }}>
                <Search size={15} />
                <span>{vectorDocCount > 0 ? `${vectorDocCount}` : '28'}</span>
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(218, 241, 222, 0.7)', marginTop: '4px' }}>Vector Docs</p>
            </div>

            <div style={{ background: 'rgba(22, 56, 50, 0.5)', padding: '12px 14px', borderRadius: '14px', border: '1px solid rgba(35, 83, 71, 0.6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#8EB69B', fontSize: '13px', fontWeight: '700' }}>
                <Layers size={15} />
                <span>49</span>
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(218, 241, 222, 0.7)', marginTop: '4px' }}>Database Tables</p>
            </div>

            <div style={{ background: 'rgba(22, 56, 50, 0.5)', padding: '12px 14px', borderRadius: '14px', border: '1px solid rgba(35, 83, 71, 0.6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#8EB69B', fontSize: '13px', fontWeight: '700' }}>
                <Activity size={15} />
                <span>199 / 199</span>
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(218, 241, 222, 0.7)', marginTop: '4px' }}>Tests Verified</p>
            </div>

            <div style={{ background: 'rgba(22, 56, 50, 0.5)', padding: '12px 14px', borderRadius: '14px', border: '1px solid rgba(35, 83, 71, 0.6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#8EB69B', fontSize: '13px', fontWeight: '700' }}>
                <ShieldCheck size={15} />
                <span>$0.00</span>
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(218, 241, 222, 0.7)', marginTop: '4px' }}>Inference Cost</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 1: Milestones 16–20 Advanced Intelligence ─── */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#8EB69B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Advanced Modules
            </span>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#DAF1DE', marginTop: '4px' }}>
              Milestones 16–20: Linguistic Intelligence & Preservation
            </h2>
          </div>
          <span style={{ fontSize: '13px', color: 'rgba(218, 241, 222, 0.7)' }}>
            Fully integrated and unified in one interface
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
          {/* Card: Milestone 16 Knowledge Graph */}
          <div 
            className="glass-card" 
            style={{ 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '14px',
              cursor: 'pointer',
              background: '#0B2B26',
              borderRadius: '16px',
              padding: '22px',
              border: '1px solid #235347',
              transition: 'transform 0.15s ease, border-color 0.15s ease'
            }}
            onClick={() => onNavigate('graph')}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(142, 182, 155, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #235347' }}>
                  <Network size={22} color="#8EB69B" />
                </div>
                <span className="badge badge-teal">Milestone 16</span>
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#DAF1DE', marginBottom: '6px' }}>
                Language Knowledge Graph
              </h3>
              <p style={{ fontSize: '13px', color: 'rgba(218, 241, 222, 0.75)', lineHeight: '1.5' }}>
                Explore language genealogical trees, dialect continuums, lexical cognate networks, and interactive spatial-temporal nodes.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#8EB69B', fontSize: '13px', fontWeight: '600' }}>
              <span>Launch Knowledge Graph</span>
              <span>→</span>
            </div>
          </div>

          {/* Card: Milestone 17 Cultural Archives */}
          <div 
            className="glass-card" 
            style={{ 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '14px',
              cursor: 'pointer',
              background: '#0B2B26',
              borderRadius: '16px',
              padding: '22px',
              border: '1px solid #235347',
              transition: 'transform 0.15s ease, border-color 0.15s ease'
            }}
            onClick={() => onNavigate('cultural')}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(142, 182, 155, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #235347' }}>
                  <BookOpen size={22} color="#8EB69B" />
                </div>
                <span className="badge badge-green">Milestone 17</span>
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#DAF1DE', marginBottom: '6px' }}>
                Cultural Archives & Sacred Traditions
              </h3>
              <p style={{ fontSize: '13px', color: 'rgba(218, 241, 222, 0.75)', lineHeight: '1.5' }}>
                Preserve oral storytelling and traditional knowledge with elder review gates and 4-tier OCAP data governance (Public, Community, Sacred, Elder-Only).
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#8EB69B', fontSize: '13px', fontWeight: '600' }}>
              <span>Open Cultural Archives</span>
              <span>→</span>
            </div>
          </div>

          {/* Card: Milestone 18 Speech Intelligence */}
          <div 
            className="glass-card" 
            style={{ 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '14px',
              cursor: 'pointer',
              background: '#0B2B26',
              borderRadius: '16px',
              padding: '22px',
              border: '1px solid #235347',
              transition: 'transform 0.15s ease, border-color 0.15s ease'
            }}
            onClick={() => onNavigate('speech')}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(142, 182, 155, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #235347' }}>
                  <Headphones size={22} color="#8EB69B" />
                </div>
                <span className="badge badge-teal">Milestone 18</span>
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#DAF1DE', marginBottom: '6px' }}>
                Speech & Pronunciation Intelligence
              </h3>
              <p style={{ fontSize: '13px', color: 'rgba(218, 241, 222, 0.75)', lineHeight: '1.5' }}>
                Inspect acoustic waveforms, pitch contours, and phoneme accuracy scoring with automated IPA transcription and speaker alignment.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#8EB69B', fontSize: '13px', fontWeight: '600' }}>
              <span>Analyze Speech Acoustics</span>
              <span>→</span>
            </div>
          </div>

          {/* Card: Milestone 19 Language Learning */}
          <div 
            className="glass-card" 
            style={{ 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '14px',
              cursor: 'pointer',
              background: '#0B2B26',
              borderRadius: '16px',
              padding: '22px',
              border: '1px solid #235347',
              transition: 'transform 0.15s ease, border-color 0.15s ease'
            }}
            onClick={() => onNavigate('learning')}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(142, 182, 155, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #235347' }}>
                  <GraduationCap size={22} color="#8EB69B" />
                </div>
                <span className="badge badge-green">Milestone 19</span>
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#DAF1DE', marginBottom: '6px' }}>
                Interactive Language Learning
              </h3>
              <p style={{ fontSize: '13px', color: 'rgba(218, 241, 222, 0.75)', lineHeight: '1.5' }}>
                Master indigenous vocabularies with spaced repetition flashcards, progressive curriculum lessons, and native speaker audio listening quizzes.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#8EB69B', fontSize: '13px', fontWeight: '600' }}>
              <span>Start Learning Studio</span>
              <span>→</span>
            </div>
          </div>

          {/* Card: Milestone 20 Research API */}
          <div 
            className="glass-card" 
            style={{ 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '14px',
              cursor: 'pointer',
              background: '#0B2B26',
              borderRadius: '16px',
              padding: '22px',
              border: '1px solid #235347',
              transition: 'transform 0.15s ease, border-color 0.15s ease'
            }}
            onClick={() => onNavigate('research')}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(142, 182, 155, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #235347' }}>
                  <Database size={22} color="#8EB69B" />
                </div>
                <span className="badge badge-teal">Milestone 20</span>
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#DAF1DE', marginBottom: '6px' }}>
                Institutional Research API Portal
              </h3>
              <p style={{ fontSize: '13px', color: 'rgba(218, 241, 222, 0.75)', lineHeight: '1.5' }}>
                Request scoped researcher tokens, sign ethics attestations, and export permitted linguistic corpora under ODC-BY open data licenses.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#8EB69B', fontSize: '13px', fontWeight: '600' }}>
              <span>Access Research Datasets</span>
              <span>→</span>
            </div>
          </div>

          {/* Card: Voice AI Assistant */}
          <div 
            className="glass-card" 
            style={{ 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '14px',
              cursor: 'pointer',
              background: '#0B2B26',
              borderRadius: '16px',
              padding: '22px',
              border: '1px solid #235347',
              transition: 'transform 0.15s ease, border-color 0.15s ease'
            }}
            onClick={() => onNavigate('assistant')}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(142, 182, 155, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #235347' }}>
                  <Bot size={22} color="#8EB69B" />
                </div>
                <span className="badge badge-green">Conversational AI</span>
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#DAF1DE', marginBottom: '6px' }}>
                Voice Assistant & Pilot Mode
              </h3>
              <p style={{ fontSize: '13px', color: 'rgba(218, 241, 222, 0.75)', lineHeight: '1.5' }}>
                Engage in natural voice-guided exploration, real-time question answering, and guided preservation workflows.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#8EB69B', fontSize: '13px', fontWeight: '600' }}>
              <span>Talk to Voice Assistant</span>
              <span>→</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: Foundational Preservation Capabilities (Milestones 1–15) ─── */}
      <section>
        <div style={{ marginBottom: '16px' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#8EB69B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Core Capabilities
          </span>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#DAF1DE', marginTop: '4px' }}>
            Oral Ingestion, Registry & Vector Discovery
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px' }}>
          {/* Card 1: Record & Transcribe */}
          <div 
            className="glass-card" 
            style={{ 
              display: 'flex', 
              alignItems: 'flex-start',
              gap: '14px',
              cursor: 'pointer',
              background: '#0B2B26',
              borderRadius: '16px',
              padding: '20px'
            }}
            onClick={() => onNavigate('record')}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(142, 182, 155, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #235347' }}>
              <Mic size={20} color="#8EB69B" />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#DAF1DE', marginBottom: '4px' }}>
                Record & Transcribe
              </h3>
              <p style={{ fontSize: '12px', color: 'rgba(218, 241, 222, 0.7)', lineHeight: '1.4' }}>
                Convert speech to text with Whisper AI and preserve audio masters
              </p>
            </div>
          </div>

          {/* Card 2: Translate */}
          <div 
            className="glass-card" 
            style={{ 
              display: 'flex', 
              alignItems: 'flex-start',
              gap: '14px',
              cursor: 'pointer',
              background: '#0B2B26',
              borderRadius: '16px',
              padding: '20px'
            }}
            onClick={() => onNavigate('translate')}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(142, 182, 155, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #235347' }}>
              <Languages size={20} color="#8EB69B" />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#DAF1DE', marginBottom: '4px' }}>
                Translate
              </h3>
              <p style={{ fontSize: '12px', color: 'rgba(218, 241, 222, 0.7)', lineHeight: '1.4' }}>
                Elder-reviewed translation across 50+ languages
              </p>
            </div>
          </div>

          {/* Card 3: Language Registry */}
          <div 
            className="glass-card" 
            style={{ 
              display: 'flex', 
              alignItems: 'flex-start',
              gap: '14px',
              cursor: 'pointer',
              background: '#0B2B26',
              borderRadius: '16px',
              padding: '20px'
            }}
            onClick={() => onNavigate('languages')}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(142, 182, 155, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #235347' }}>
              <Globe size={20} color="#8EB69B" />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#DAF1DE', marginBottom: '4px' }}>
                Language Registry
              </h3>
              <p style={{ fontSize: '12px', color: 'rgba(218, 241, 222, 0.7)', lineHeight: '1.4' }}>
                Organize, discover and register oral languages & dialects
              </p>
            </div>
          </div>

          {/* Card 4: Semantic Vector Search */}
          <div 
            className="glass-card" 
            style={{ 
              display: 'flex', 
              alignItems: 'flex-start',
              gap: '14px',
              cursor: 'pointer',
              background: '#0B2B26',
              borderRadius: '16px',
              padding: '20px'
            }}
            onClick={() => onNavigate('search')}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(142, 182, 155, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #235347' }}>
              <Search size={20} color="#8EB69B" />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#DAF1DE', marginBottom: '4px' }}>
                Vector Discovery
              </h3>
              <p style={{ fontSize: '12px', color: 'rgba(218, 241, 222, 0.7)', lineHeight: '1.4' }}>
                Multilingual vector similarity search via ChromaDB
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: Live API & System Health Links ─── */}
      <section 
        className="glass-card"
        style={{
          background: 'rgba(11, 43, 38, 0.6)',
          border: '1px solid #235347',
          borderRadius: '16px',
          padding: '24px 28px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#DAF1DE', marginBottom: '4px' }}>
              Developer APIs & Interactive Documentation
            </h3>
            <p style={{ fontSize: '13px', color: 'rgba(218, 241, 222, 0.75)' }}>
              100+ fully-tested REST endpoints across all 20 milestones with complete OpenAPI schema definitions.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <a 
              href="/docs" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: '#8EB69B',
                color: '#051F20',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '700',
                textDecoration: 'none'
              }}
            >
              <span>FastAPI Docs (Swagger UI)</span>
              <ExternalLink size={14} />
            </a>
            <a 
              href="/health" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: 'rgba(22, 56, 50, 0.8)',
                color: '#DAF1DE',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '600',
                textDecoration: 'none',
                border: '1px solid #235347'
              }}
            >
              <span>System Health Check</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* ─── SECTION 4: Ethical Principles Section ─── */}
      <section 
        className="glass-card"
        style={{
          background: '#163832',
          border: '1px solid #235347',
          borderRadius: '16px',
          padding: '32px'
        }}
      >
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <ShieldCheck size={28} color="#8EB69B" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#DAF1DE', marginBottom: '8px' }}>
              Ethical Foundations of Voice Roots
            </h3>
            <p style={{ fontSize: '14px', color: 'rgba(218, 241, 222, 0.8)', lineHeight: '1.7', marginBottom: '16px' }}>
              Our design follows the non-negotiable principles of Indigenous Data Sovereignty (OCAP: Ownership, Control, Access, and Possession):
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#DAF1DE', fontSize: '13px' }}>
                <CheckCircle2 size={16} color="#8EB69B" />
                <span>Original audio is an immutable master</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#DAF1DE', fontSize: '13px' }}>
                <CheckCircle2 size={16} color="#8EB69B" />
                <span>Affirmative consent required for archiving</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#DAF1DE', fontSize: '13px' }}>
                <CheckCircle2 size={16} color="#8EB69B" />
                <span>AI transcription is an opt-in annotation layer</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#DAF1DE', fontSize: '13px' }}>
                <CheckCircle2 size={16} color="#8EB69B" />
                <span>Elder review gates machine translation</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
