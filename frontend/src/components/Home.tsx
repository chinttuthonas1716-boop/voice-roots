import { 
  Mic, 
  Globe, 
  Languages, 
  ShieldCheck, 
  Award, 
  Sparkles, 
  CheckCircle2
} from 'lucide-react';

interface HomeProps {
  onNavigate: (tab: 'home' | 'record' | 'languages' | 'search' | 'archive' | 'community' | 'login' | 'translate') => void;
  transcriptCount: number;
  languageCount: number;
  vectorDocCount: number;
}

export function Home({ onNavigate }: HomeProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px', paddingBottom: '32px' }}>
      {/* ─── Hero Section with Cinematic Forest Styling ─── */}
      <section 
        className="hero-forest-bg" 
        style={{ 
          padding: 'clamp(32px, 6vw, 64px) clamp(16px, 4vw, 36px) clamp(24px, 4vw, 44px)',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        <div style={{ maxWidth: '820px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h1 style={{ 
            fontSize: 'clamp(34px, 8vw, 56px)', 
            fontWeight: '800', 
            lineHeight: '1.15', 
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
            Rooting Oral Languages in Text with AI
          </h2>

          <p style={{ 
            fontSize: '15px', 
            lineHeight: '1.6', 
            color: 'rgba(218, 241, 222, 0.82)', 
            marginBottom: '32px',
            maxWidth: '620px',
            margin: '0 auto 32px',
            overflowWrap: 'break-word'
          }}>
            Preserve, explore and share the world's oral languages using AI-powered transcription, translation and community collaboration.
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
              onClick={() => onNavigate('languages')}
              className="btn-secondary"
              style={{ fontSize: '15px', padding: '12px 24px', borderRadius: '30px', background: 'rgba(11, 43, 38, 0.65)', flex: '1 1 180px', maxWidth: '240px' }}
            >
              <span>Explore Languages</span>
            </button>
          </div>

          {/* Metrics Pill Bar (Matching Reference 1. Home Page) */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
            gap: '12px', 
            marginTop: '44px',
            paddingTop: '24px',
            borderTop: '1px solid rgba(35, 83, 71, 0.5)'
          }}>
            <div style={{ background: 'rgba(22, 56, 50, 0.5)', padding: '12px 14px', borderRadius: '14px', border: '1px solid rgba(35, 83, 71, 0.6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#8EB69B', fontSize: '12px', fontWeight: '700' }}>
                <Globe size={14} />
                <span>50+</span>
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(218, 241, 222, 0.7)', marginTop: '4px' }}>Languages</p>
            </div>

            <div style={{ background: 'rgba(22, 56, 50, 0.5)', padding: '12px 14px', borderRadius: '14px', border: '1px solid rgba(35, 83, 71, 0.6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#8EB69B', fontSize: '12px', fontWeight: '700' }}>
                <Mic size={14} />
                <span>1K+</span>
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(218, 241, 222, 0.7)', marginTop: '4px' }}>Recordings</p>
            </div>

            <div style={{ background: 'rgba(22, 56, 50, 0.5)', padding: '12px 14px', borderRadius: '14px', border: '1px solid rgba(35, 83, 71, 0.6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#8EB69B', fontSize: '12px', fontWeight: '700' }}>
                <Award size={14} />
                <span>500+</span>
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(218, 241, 222, 0.7)', marginTop: '4px' }}>Contributors</p>
            </div>

            <div style={{ background: 'rgba(22, 56, 50, 0.5)', padding: '12px 14px', borderRadius: '14px', border: '1px solid rgba(35, 83, 71, 0.6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#8EB69B', fontSize: '12px', fontWeight: '700' }}>
                <Sparkles size={14} />
                <span>AI Powered</span>
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(218, 241, 222, 0.7)', marginTop: '4px' }}>Transcription</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4 Feature Cards (Exactly Matching Reference) ─── */}
      <section>
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
                Convert speech to text using Whisper AI
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
                Support for multiple languages
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
                Organize and discover oral languages
              </p>
            </div>
          </div>

          {/* Card 4: Community */}
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
            onClick={() => onNavigate('community')}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(142, 182, 155, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #235347' }}>
              <Award size={20} color="#8EB69B" />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#DAF1DE', marginBottom: '4px' }}>
                Community
              </h3>
              <p style={{ fontSize: '12px', color: 'rgba(218, 241, 222, 0.7)', lineHeight: '1.4' }}>
                Contribute and preserve together
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Ethical Principles Section ─── */}
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
