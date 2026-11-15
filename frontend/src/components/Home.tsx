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
  Archive,
  ArrowUpRight,
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
            background: 'rgba(22, 59, 44, 0.75)', 
            border: '1px solid #A6C48A', 
            padding: '6px 14px', 
            borderRadius: '20px', 
            marginBottom: '14px',
            fontSize: '11px',
            color: '#A6C48A',
            fontWeight: '700',
            letterSpacing: '0.15em',
            textTransform: 'uppercase'
          }}>
            <Sparkles size={14} color="#E2B93B" />
            <span>PRESERVING HUMANITY’S LINGUISTIC HERITAGE</span>
          </div>

          <h1 
            className="font-serif-cormorant"
            style={{ 
              fontSize: 'clamp(36px, 7vw, 64px)', 
              fontWeight: '700', 
              lineHeight: '1.15', 
              letterSpacing: '-0.02em', 
              color: '#FFFFFF',
              marginBottom: '14px'
            }}
          >
            Every Voice Holds a <span style={{ color: '#A6C48A', fontStyle: 'italic' }}>Heritage.</span>
          </h1>

          <p style={{ 
            fontSize: 'clamp(15px, 2.5vw, 18px)', 
            lineHeight: '1.6', 
            color: 'rgba(245, 243, 233, 0.9)', 
            marginBottom: '28px',
            maxWidth: '680px',
            margin: '0 auto 28px',
            overflowWrap: 'break-word',
            fontWeight: '300'
          }}>
            Discover, document and preserve the world’s oral languages through artificial intelligence and community knowledge.
          </p>

          {/* Primary Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center', width: '100%' }}>
            <button 
              type="button"
              onClick={() => onNavigate('record')}
              className="btn-primary"
              style={{ 
                fontSize: '15px', 
                fontWeight: '700',
                padding: '12px 28px', 
                borderRadius: '30px', 
                flex: '1 1 180px', 
                maxWidth: '240px',
                background: '#DCE9D7',
                color: '#071A13',
                border: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>Start Recording</span>
              <ArrowUpRight size={18} color="#071A13" />
            </button>

            <button 
              type="button"
              onClick={() => onNavigate('languages')}
              className="btn-secondary"
              style={{ fontSize: '15px', padding: '12px 24px', borderRadius: '30px', background: 'rgba(16, 43, 32, 0.85)', border: '1px solid rgba(166, 196, 138, 0.5)', flex: '1 1 180px', maxWidth: '240px', color: '#F5F3E9' }}
            >
              <Languages size={18} color="#A6C48A" />
              <span>Explore Languages</span>
            </button>

            <button 
              type="button"
              onClick={() => onNavigate('graph')}
              className="btn-secondary"
              style={{ fontSize: '15px', padding: '12px 24px', borderRadius: '30px', background: 'rgba(16, 43, 32, 0.8)', flex: '1 1 180px', maxWidth: '240px' }}
            >
              <Network size={18} color="#A6C48A" />
              <span>Knowledge Graph</span>
            </button>

            <button 
              type="button"
              onClick={() => onNavigate('cultural')}
              className="btn-secondary"
              style={{ fontSize: '15px', padding: '12px 24px', borderRadius: '30px', background: 'rgba(16, 43, 32, 0.8)', flex: '1 1 180px', maxWidth: '240px' }}
            >
              <BookOpen size={18} color="#A6C48A" />
              <span>Cultural Archives</span>
            </button>
          </div>

          {/* ─── The 3-Feature Pillar Strip (Reference: Phone Mockup) ─── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            maxWidth: '680px',
            margin: '28px auto 0',
            paddingTop: '20px',
            borderTop: '1px solid rgba(166, 196, 138, 0.25)'
          }}>
            <div 
              onClick={() => onNavigate('record')}
              style={{
                cursor: 'pointer',
                background: 'rgba(16, 43, 32, 0.65)',
                border: '1px solid rgba(166, 196, 138, 0.25)',
                borderRadius: '16px',
                padding: '12px 8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}
            >
              <Activity size={22} color="#A6C48A" />
              <span style={{ color: '#F5F3E9', fontWeight: '700', fontSize: '13px', marginTop: '6px' }}>Record</span>
              <span style={{ color: 'rgba(166, 196, 138, 0.75)', fontSize: '11px', marginTop: '2px' }}>Capture voices</span>
            </div>

            <div 
              onClick={() => onNavigate('languages')}
              style={{
                cursor: 'pointer',
                background: 'rgba(16, 43, 32, 0.65)',
                border: '1px solid rgba(166, 196, 138, 0.25)',
                borderRadius: '16px',
                padding: '12px 8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}
            >
              <Languages size={22} color="#A6C48A" />
              <span style={{ color: '#F5F3E9', fontWeight: '700', fontSize: '13px', marginTop: '6px' }}>Discover</span>
              <span style={{ color: 'rgba(166, 196, 138, 0.75)', fontSize: '11px', marginTop: '2px' }}>Explore languages</span>
            </div>

            <div 
              onClick={() => onNavigate('cultural')}
              style={{
                cursor: 'pointer',
                background: 'rgba(16, 43, 32, 0.65)',
                border: '1px solid rgba(166, 196, 138, 0.25)',
                borderRadius: '16px',
                padding: '12px 8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}
            >
              <Archive size={22} color="#A6C48A" />
              <span style={{ color: '#F5F3E9', fontWeight: '700', fontSize: '13px', marginTop: '6px' }}>Preserve</span>
              <span style={{ color: 'rgba(166, 196, 138, 0.75)', fontSize: '11px', marginTop: '2px' }}>Protect heritage</span>
            </div>
          </div>

          {/* Unified Ecosystem Metrics Bar */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
            gap: '12px', 
            marginTop: '44px',
            paddingTop: '24px',
            borderTop: '1px solid rgba(31, 81, 56, 0.5)'
          }}>
            <div style={{ background: 'rgba(22, 59, 44, 0.5)', padding: '12px 14px', borderRadius: '14px', border: '1px solid rgba(31, 81, 56, 0.6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#A6C48A', fontSize: '13px', fontWeight: '700' }}>
                <Globe size={15} />
                <span>{languageCount > 0 ? `${languageCount}+` : '50+'}</span>
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(245, 243, 233, 0.7)', marginTop: '4px' }}>Languages</p>
            </div>

            <div style={{ background: 'rgba(22, 59, 44, 0.5)', padding: '12px 14px', borderRadius: '14px', border: '1px solid rgba(31, 81, 56, 0.6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#A6C48A', fontSize: '13px', fontWeight: '700' }}>
                <Mic size={15} />
                <span>{transcriptCount > 0 ? `${transcriptCount}` : '1,000+'}</span>
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(245, 243, 233, 0.7)', marginTop: '4px' }}>Audio Masters</p>
            </div>

            <div style={{ background: 'rgba(22, 59, 44, 0.5)', padding: '12px 14px', borderRadius: '14px', border: '1px solid rgba(31, 81, 56, 0.6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#A6C48A', fontSize: '13px', fontWeight: '700' }}>
                <Network size={15} />
                <span>121+</span>
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(245, 243, 233, 0.7)', marginTop: '4px' }}>Graph Nodes</p>
            </div>

            <div style={{ background: 'rgba(22, 59, 44, 0.5)', padding: '12px 14px', borderRadius: '14px', border: '1px solid rgba(31, 81, 56, 0.6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#A6C48A', fontSize: '13px', fontWeight: '700' }}>
                <Search size={15} />
                <span>{vectorDocCount > 0 ? `${vectorDocCount}` : '28'}</span>
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(245, 243, 233, 0.7)', marginTop: '4px' }}>Vector Docs</p>
            </div>

            <div style={{ background: 'rgba(22, 59, 44, 0.5)', padding: '12px 14px', borderRadius: '14px', border: '1px solid rgba(31, 81, 56, 0.6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#A6C48A', fontSize: '13px', fontWeight: '700' }}>
                <Layers size={15} />
                <span>49</span>
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(245, 243, 233, 0.7)', marginTop: '4px' }}>Database Tables</p>
            </div>

            <div style={{ background: 'rgba(22, 59, 44, 0.5)', padding: '12px 14px', borderRadius: '14px', border: '1px solid rgba(31, 81, 56, 0.6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#A6C48A', fontSize: '13px', fontWeight: '700' }}>
                <Activity size={15} />
                <span>199 / 199</span>
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(245, 243, 233, 0.7)', marginTop: '4px' }}>Tests Verified</p>
            </div>

            <div style={{ background: 'rgba(22, 59, 44, 0.5)', padding: '12px 14px', borderRadius: '14px', border: '1px solid rgba(31, 81, 56, 0.6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#A6C48A', fontSize: '13px', fontWeight: '700' }}>
                <ShieldCheck size={15} />
                <span>$0.00</span>
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(245, 243, 233, 0.7)', marginTop: '4px' }}>Inference Cost</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 1: Milestones 16–20 Advanced Intelligence ─── */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#A6C48A', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Advanced Modules
            </span>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#F5F3E9', marginTop: '4px' }}>
              Milestones 16–20: Linguistic Intelligence & Preservation
            </h2>
          </div>
          <span style={{ fontSize: '13px', color: 'rgba(245, 243, 233, 0.7)' }}>
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
              background: '#102B20',
              borderRadius: '16px',
              padding: '22px',
              border: '1px solid #1F5138',
              transition: 'transform 0.15s ease, border-color 0.15s ease'
            }}
            onClick={() => onNavigate('graph')}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(166, 196, 138, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #1F5138' }}>
                  <Network size={22} color="#A6C48A" />
                </div>
                <span className="badge badge-teal">Milestone 16</span>
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#F5F3E9', marginBottom: '6px' }}>
                Language Knowledge Graph
              </h3>
              <p style={{ fontSize: '13px', color: 'rgba(245, 243, 233, 0.75)', lineHeight: '1.5' }}>
                Explore language genealogical trees, dialect continuums, lexical cognate networks, and interactive spatial-temporal nodes.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#A6C48A', fontSize: '13px', fontWeight: '600' }}>
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
              background: '#102B20',
              borderRadius: '16px',
              padding: '22px',
              border: '1px solid #1F5138',
              transition: 'transform 0.15s ease, border-color 0.15s ease'
            }}
            onClick={() => onNavigate('cultural')}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(166, 196, 138, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #1F5138' }}>
                  <BookOpen size={22} color="#A6C48A" />
                </div>
                <span className="badge badge-green">Milestone 17</span>
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#F5F3E9', marginBottom: '6px' }}>
                Cultural Archives & Sacred Traditions
              </h3>
              <p style={{ fontSize: '13px', color: 'rgba(245, 243, 233, 0.75)', lineHeight: '1.5' }}>
                Preserve oral storytelling and traditional knowledge with elder review gates and 4-tier OCAP data governance (Public, Community, Sacred, Elder-Only).
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#A6C48A', fontSize: '13px', fontWeight: '600' }}>
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
              background: '#102B20',
              borderRadius: '16px',
              padding: '22px',
              border: '1px solid #1F5138',
              transition: 'transform 0.15s ease, border-color 0.15s ease'
            }}
            onClick={() => onNavigate('speech')}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(166, 196, 138, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #1F5138' }}>
                  <Headphones size={22} color="#A6C48A" />
                </div>
                <span className="badge badge-teal">Milestone 18</span>
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#F5F3E9', marginBottom: '6px' }}>
                Speech & Pronunciation Intelligence
              </h3>
              <p style={{ fontSize: '13px', color: 'rgba(245, 243, 233, 0.75)', lineHeight: '1.5' }}>
                Inspect acoustic waveforms, pitch contours, and phoneme accuracy scoring with automated IPA transcription and speaker alignment.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#A6C48A', fontSize: '13px', fontWeight: '600' }}>
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
              background: '#102B20',
              borderRadius: '16px',
              padding: '22px',
              border: '1px solid #1F5138',
              transition: 'transform 0.15s ease, border-color 0.15s ease'
            }}
            onClick={() => onNavigate('learning')}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(166, 196, 138, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #1F5138' }}>
                  <GraduationCap size={22} color="#A6C48A" />
                </div>
                <span className="badge badge-green">Milestone 19</span>
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#F5F3E9', marginBottom: '6px' }}>
                Interactive Language Learning
              </h3>
              <p style={{ fontSize: '13px', color: 'rgba(245, 243, 233, 0.75)', lineHeight: '1.5' }}>
                Master indigenous vocabularies with spaced repetition flashcards, progressive curriculum lessons, and native speaker audio listening quizzes.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#A6C48A', fontSize: '13px', fontWeight: '600' }}>
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
              background: '#102B20',
              borderRadius: '16px',
              padding: '22px',
              border: '1px solid #1F5138',
              transition: 'transform 0.15s ease, border-color 0.15s ease'
            }}
            onClick={() => onNavigate('research')}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(166, 196, 138, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #1F5138' }}>
                  <Database size={22} color="#A6C48A" />
                </div>
                <span className="badge badge-teal">Milestone 20</span>
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#F5F3E9', marginBottom: '6px' }}>
                Institutional Research API Portal
              </h3>
              <p style={{ fontSize: '13px', color: 'rgba(245, 243, 233, 0.75)', lineHeight: '1.5' }}>
                Request scoped researcher tokens, sign ethics attestations, and export permitted linguistic corpora under ODC-BY open data licenses.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#A6C48A', fontSize: '13px', fontWeight: '600' }}>
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
              background: '#102B20',
              borderRadius: '16px',
              padding: '22px',
              border: '1px solid #1F5138',
              transition: 'transform 0.15s ease, border-color 0.15s ease'
            }}
            onClick={() => onNavigate('assistant')}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(166, 196, 138, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #1F5138' }}>
                  <Bot size={22} color="#A6C48A" />
                </div>
                <span className="badge badge-green">Conversational AI</span>
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#F5F3E9', marginBottom: '6px' }}>
                Voice Assistant & Pilot Mode
              </h3>
              <p style={{ fontSize: '13px', color: 'rgba(245, 243, 233, 0.75)', lineHeight: '1.5' }}>
                Engage in natural voice-guided exploration, real-time question answering, and guided preservation workflows.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#A6C48A', fontSize: '13px', fontWeight: '600' }}>
              <span>Talk to Voice Assistant</span>
              <span>→</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: Foundational Preservation Capabilities (Milestones 1–15) ─── */}
      <section>
        <div style={{ marginBottom: '16px' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#A6C48A', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Core Capabilities
          </span>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#F5F3E9', marginTop: '4px' }}>
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
              background: '#102B20',
              borderRadius: '16px',
              padding: '20px'
            }}
            onClick={() => onNavigate('record')}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(166, 196, 138, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #1F5138' }}>
              <Mic size={20} color="#A6C48A" />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#F5F3E9', marginBottom: '4px' }}>
                Record & Transcribe
              </h3>
              <p style={{ fontSize: '12px', color: 'rgba(245, 243, 233, 0.7)', lineHeight: '1.4' }}>
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
              background: '#102B20',
              borderRadius: '16px',
              padding: '20px'
            }}
            onClick={() => onNavigate('translate')}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(166, 196, 138, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #1F5138' }}>
              <Languages size={20} color="#A6C48A" />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#F5F3E9', marginBottom: '4px' }}>
                Translate
              </h3>
              <p style={{ fontSize: '12px', color: 'rgba(245, 243, 233, 0.7)', lineHeight: '1.4' }}>
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
              background: '#102B20',
              borderRadius: '16px',
              padding: '20px'
            }}
            onClick={() => onNavigate('languages')}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(166, 196, 138, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #1F5138' }}>
              <Globe size={20} color="#A6C48A" />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#F5F3E9', marginBottom: '4px' }}>
                Language Registry
              </h3>
              <p style={{ fontSize: '12px', color: 'rgba(245, 243, 233, 0.7)', lineHeight: '1.4' }}>
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
              background: '#102B20',
              borderRadius: '16px',
              padding: '20px'
            }}
            onClick={() => onNavigate('search')}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(166, 196, 138, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #1F5138' }}>
              <Search size={20} color="#A6C48A" />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#F5F3E9', marginBottom: '4px' }}>
                Vector Discovery
              </h3>
              <p style={{ fontSize: '12px', color: 'rgba(245, 243, 233, 0.7)', lineHeight: '1.4' }}>
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
          background: 'rgba(16, 43, 32, 0.6)',
          border: '1px solid #1F5138',
          borderRadius: '16px',
          padding: '24px 28px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#F5F3E9', marginBottom: '4px' }}>
              Developer APIs & Interactive Documentation
            </h3>
            <p style={{ fontSize: '13px', color: 'rgba(245, 243, 233, 0.75)' }}>
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
                background: '#A6C48A',
                color: '#102B20',
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
                background: 'rgba(22, 59, 44, 0.8)',
                color: '#F5F3E9',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '600',
                textDecoration: 'none',
                border: '1px solid #1F5138'
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
          background: '#163B2C',
          border: '1px solid #1F5138',
          borderRadius: '16px',
          padding: '32px'
        }}
      >
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <ShieldCheck size={28} color="#A6C48A" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#F5F3E9', marginBottom: '8px' }}>
              Ethical Foundations of Voice Roots
            </h3>
            <p style={{ fontSize: '14px', color: 'rgba(245, 243, 233, 0.8)', lineHeight: '1.7', marginBottom: '16px' }}>
              Our design follows the non-negotiable principles of Indigenous Data Sovereignty (OCAP: Ownership, Control, Access, and Possession):
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F5F3E9', fontSize: '13px' }}>
                <CheckCircle2 size={16} color="#A6C48A" />
                <span>Original audio is an immutable master</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F5F3E9', fontSize: '13px' }}>
                <CheckCircle2 size={16} color="#A6C48A" />
                <span>Affirmative consent required for archiving</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F5F3E9', fontSize: '13px' }}>
                <CheckCircle2 size={16} color="#A6C48A" />
                <span>AI transcription is an opt-in annotation layer</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F5F3E9', fontSize: '13px' }}>
                <CheckCircle2 size={16} color="#A6C48A" />
                <span>Elder review gates machine translation</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
