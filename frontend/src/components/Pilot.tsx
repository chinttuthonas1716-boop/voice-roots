// Pilot UI components for Voice Roots
import React, { useState, useEffect } from 'react';
import { apiUrl } from '../App';
import { PilotSubmissionCreate, PilotSubmissionResponse, PilotReviewCreate, PilotMetricResponse } from '../types';
import { CheckCircle2, AlertCircle, ShieldCheck, FileText, Check, X, Loader2, Award, Calculator } from 'lucide-react';

export function Pilot() {
  // ---- Submission Form ----
  const [transcripts, setTranscripts] = useState<any[]>([]);
  const [selectedTranscript, setSelectedTranscript] = useState<number | ''>('');
  const [testerName, setTesterName] = useState('');
  const [consent, setConsent] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchTranscripts = async () => {
    try {
      const res = await fetch(apiUrl('/api/transcripts'));
      if (res.ok) {
        const data = await res.json();
        setTranscripts(data.transcripts || []);
      }
    } catch {
      // offline/fallback
    }
  };

  useEffect(() => {
    fetchTranscripts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitMsg(null);
    setSubmitError(null);
    if (!selectedTranscript || !testerName.trim() || !consent) {
      setSubmitError('Please select a transcript, enter your tester name, and confirm affirmative consent.');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: PilotSubmissionCreate = {
        transcript_id: Number(selectedTranscript),
        tester_name: testerName.trim(),
        consent: true,
        notes: notes.trim() || undefined,
      };
      const res = await fetch(apiUrl('/api/v1/pilot/submissions'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSubmitMsg('Pilot submission recorded successfully in SQLite!');
        setSelectedTranscript('');
        setTesterName('');
        setConsent(false);
        setNotes('');
        fetchSubmissions();
      } else {
        const err = await res.json().catch(() => ({}));
        setSubmitError(err.detail || 'Pilot submission failed');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Network error submitting pilot record');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---- Reviewer Dashboard ----
  const [submissions, setSubmissions] = useState<PilotSubmissionResponse[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewMsg, setReviewMsg] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    setIsLoadingSubmissions(true);
    try {
      const res = await fetch(apiUrl('/api/v1/pilot/submissions'));
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions || []);
      }
    } catch {
      // offline/fallback
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleReview = async (submissionId: number, approval: boolean) => {
    setReviewMsg(null);
    setReviewError(null);
    const payload: PilotReviewCreate = {
      submission_id: submissionId,
      reviewer_name: reviewerName.trim() || 'Community Reviewer',
      approval: approval ? 1 : 0,
      review_notes: approval ? 'Approved under community evaluation' : 'Flagged for further linguistic review',
    };
    try {
      const res = await fetch(apiUrl('/api/v1/pilot/reviews'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setReviewMsg(`Review recorded: ${approval ? 'Approved' : 'Rejected'} submission #${submissionId}`);
        fetchSubmissions();
      } else {
        const err = await res.json().catch(() => ({}));
        setReviewError(err.detail || 'Review submission failed');
      }
    } catch (err: any) {
      setReviewError(err.message || 'Network error saving review');
    }
  };

  const handleWithdraw = async (id: number) => {
    try {
      const res = await fetch(apiUrl(`/api/v1/pilot/submissions/${id}/withdraw`), {
        method: 'PATCH',
      });
      if (res.ok) {
        setReviewMsg(`Submission #${id} withdrawn under OCAP compliance.`);
        fetchSubmissions();
      }
    } catch {
      // offline/fallback
    }
  };

  // ---- Metrics View ----
  const [metrics, setMetrics] = useState<PilotMetricResponse[]>([]);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);

  const fetchMetrics = async () => {
    setIsLoadingMetrics(true);
    try {
      const res = await fetch(apiUrl('/api/v1/pilot/metrics'));
      if (res.ok) {
        const data = await res.json();
        // Backend returns an array directly: [dict(row)...]
        setMetrics(Array.isArray(data) ? data : data.metrics || []);
      }
    } catch {
      // offline/fallback
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  // ---- Live WER / CER Calculator ----
  const [calcRef, setCalcRef] = useState('నండ్రాయి గోండ్వానా పున్నెం');
  const [calcHyp, setCalcHyp] = useState('నండ్రాయి గోండ్వానా పున్నెం');
  const [calcLoading, setCalcLoading] = useState(false);
  const [calcResult, setCalcResult] = useState<{
    reference: string;
    hypothesis: string;
    wer: number;
    wer_percent: number;
    cer: number;
    cer_percent: number;
    chrf: number;
    chrf_percent: number;
    word_edit_distance: number;
    char_edit_distance: number;
    reference_word_count: number;
    hypothesis_word_count: number;
    notice?: string;
  } | null>(null);
  const [calcError, setCalcError] = useState<string | null>(null);

  const handleCalculateMetrics = async (refText = calcRef, hypText = calcHyp) => {
    setCalcError(null);
    setCalcLoading(true);
    try {
      const res = await fetch(apiUrl('/api/v1/evaluation/calculate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: refText, hypothesis: hypText }),
      });
      if (res.ok) {
        const data = await res.json();
        setCalcResult(data);
      } else {
        const err = await res.json().catch(() => ({}));
        setCalcError(err.detail || 'Evaluation metric calculation failed');
      }
    } catch (err: any) {
      setCalcError(err.message || 'Network error reaching evaluation service');
    } finally {
      setCalcLoading(false);
    }
  };

  return (
    <div className="pilot-section" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* ─── Top Overview & Consent Policy Banner ─── */}
      <div className="glass-card" style={{ borderLeft: '4px solid #8EB69B' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <ShieldCheck size={24} color="#8EB69B" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '4px', color: '#DAF1DE' }}>
              Controlled Community Pilot & Linguistic Review
            </h3>
            <p style={{ fontSize: '13px', color: 'rgba(218, 241, 222, 0.72)', lineHeight: '1.6' }}>
              Conduct controlled field evaluations of Whisper speech models and MT outputs on real oral recordings. 
              Under OCAP protocols, tester consent is mandatory, submissions remain withdrawable at any time, 
              and community elders retain review authority over evaluation benchmarks.
            </p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
              <span className="badge badge-green">OCAP Compliant</span>
              <span className="badge badge-teal">Field Benchmarking</span>
              <span className="badge badge-green">Elder Review Authority</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Submission Form ─── */}
      <section className="glass-card">
        <h3 style={{ fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#DAF1DE' }}>
          <FileText size={20} color="#8EB69B" />
          <span>Submit Pilot Evaluation Recording</span>
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '640px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'rgba(218, 241, 222, 0.72)', marginBottom: '6px' }}>
              TARGET MASTER RECORDING *
            </label>
            <select 
              className="select-field" 
              value={selectedTranscript} 
              onChange={e => setSelectedTranscript(Number(e.target.value) || '')} 
              required
            >
              <option value="">Select a saved recording from the archive...</option>
              {transcripts.map(t => (
                <option key={t.id} value={t.id}>
                  #{t.id} - {t.title} ({t.language}{t.dialect ? ` / ${t.dialect}` : ''})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'rgba(218, 241, 222, 0.72)', marginBottom: '6px' }}>
              FIELD TESTER NAME / IDENTIFIER *
            </label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. Elder Somu (Gondi Native Speaker)" 
              value={testerName} 
              onChange={e => setTesterName(e.target.value)} 
              required 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'rgba(218, 241, 222, 0.72)', marginBottom: '6px' }}>
              FIELD OBSERVATIONS & ACOUSTIC NOTES (OPTIONAL)
            </label>
            <textarea 
              className="textarea-field" 
              rows={3} 
              placeholder="Note ambient noise, dialect variants, ceremonial tone, or phoneme clarity..." 
              value={notes} 
              onChange={e => setNotes(e.target.value)} 
            />
          </div>

          {/* OCAP Consent Checkbox */}
          <div style={{ 
            background: 'rgba(142, 182, 155, 0.08)', 
            border: '1px solid #235347', 
            borderRadius: '10px', 
            padding: '12px 14px' 
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', color: '#DAF1DE' }}>
              <input 
                type="checkbox" 
                checked={consent} 
                onChange={e => setConsent(e.target.checked)} 
                style={{ width: '16px', height: '16px', accentColor: '#8EB69B' }} 
              />
              <span>I confirm affirmative speaker consent under OCAP principles for this pilot evaluation record.</span>
            </label>
          </div>

          {submitError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#FCA5A5', fontSize: '13px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <AlertCircle size={16} />
              <span>{submitError}</span>
            </div>
          )}

          {submitMsg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(142, 182, 155, 0.15)', color: '#DAF1DE', fontSize: '13px', border: '1px solid #235347' }}>
              <CheckCircle2 size={16} color="#8EB69B" />
              <span>{submitMsg}</span>
            </div>
          )}

          <div>
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="btn-primary" 
              style={{ minWidth: '180px' }}
            >
              {isSubmitting ? <Loader2 size={16} className="spin-animate" /> : <Check size={16} />}
              <span>{isSubmitting ? 'Recording...' : 'Submit Evaluation'}</span>
            </button>
          </div>
        </form>
      </section>

      {/* ─── Reviewer Dashboard ─── */}
      <section className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', color: '#DAF1DE' }}>
              <ShieldCheck size={20} color="#8EB69B" />
              <span>Pilot Reviewer Dashboard</span>
            </h3>
            <p style={{ fontSize: '13px', color: 'rgba(218, 241, 222, 0.72)' }}>
              Elder community review queue for submitted pilot evaluations.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input 
              type="text" 
              className="input-field" 
              style={{ width: '220px', padding: '8px 12px', fontSize: '13px', minHeight: '38px' }} 
              value={reviewerName} 
              onChange={e => setReviewerName(e.target.value)} 
              placeholder="Reviewer Name (e.g. Elder Somu)" 
            />
          </div>
        </div>

        {reviewError && (
          <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#FCA5A5', fontSize: '13px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <AlertCircle size={16} />
            <span>{reviewError}</span>
          </div>
        )}

        {reviewMsg && (
          <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(142, 182, 155, 0.15)', color: '#DAF1DE', fontSize: '13px', border: '1px solid #235347' }}>
            <CheckCircle2 size={16} color="#8EB69B" />
            <span>{reviewMsg}</span>
          </div>
        )}

        {isLoadingSubmissions ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(218, 241, 222, 0.72)' }}>
            <Loader2 size={18} className="spin-animate" style={{ display: 'inline', marginRight: '8px' }} />
            Loading submissions queue...
          </div>
        ) : submissions.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'rgba(218, 241, 222, 0.5)', fontStyle: 'italic', padding: '16px 0' }}>
            No pilot submissions registered yet. Submit a pilot evaluation above to populate the queue.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--card-border)', textAlign: 'left', color: 'rgba(218, 241, 222, 0.72)' }}>
                  <th style={{ padding: '10px 8px' }}>ID</th>
                  <th style={{ padding: '10px 8px' }}>Transcript</th>
                  <th style={{ padding: '10px 8px' }}>Tester</th>
                  <th style={{ padding: '10px 8px' }}>Consent</th>
                  <th style={{ padding: '10px 8px' }}>Status</th>
                  <th style={{ padding: '10px 8px' }}>Notes</th>
                  <th style={{ padding: '10px 8px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid rgba(35, 83, 71, 0.35)' }}>
                    <td style={{ padding: '10px 8px', color: 'rgba(218, 241, 222, 0.72)' }}>#{s.id}</td>
                    <td style={{ padding: '10px 8px', color: '#8EB69B' }}>Recording #{s.transcript_id}</td>
                    <td style={{ padding: '10px 8px', color: '#DAF1DE', fontWeight: '500' }}>{s.tester_name}</td>
                    <td style={{ padding: '10px 8px' }}>
                      <span className={s.consent ? 'badge badge-green' : 'badge badge-red'}>
                        {s.consent ? '✓ Given' : 'Missing'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <span className={s.withdrawn ? 'badge badge-red' : 'badge badge-teal'}>
                        {s.withdrawn ? 'Withdrawn' : 'Active'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 8px', color: 'rgba(218, 241, 222, 0.72)', maxWidth: '240px' }}>{s.notes || '-'}</td>
                    <td style={{ padding: '10px 8px' }}>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        {s.withdrawn === 0 && (
                          <>
                            <button 
                              type="button" 
                              onClick={() => handleReview(s.id, true)} 
                              className="btn-secondary" 
                              style={{ padding: '4px 10px', fontSize: '11px', minHeight: '28px', color: '#8EB69B', borderColor: '#235347' }}
                              title="Approve pilot record"
                            >
                              <Check size={12} />
                              <span>Approve</span>
                            </button>
                            <button 
                              type="button" 
                              onClick={() => handleReview(s.id, false)} 
                              className="btn-danger" 
                              style={{ padding: '4px 10px', fontSize: '11px', minHeight: '28px' }}
                              title="Reject pilot record"
                            >
                              <X size={12} />
                              <span>Reject</span>
                            </button>
                            <button 
                              type="button" 
                              onClick={() => handleWithdraw(s.id)} 
                              className="btn-secondary" 
                              style={{ padding: '4px 8px', fontSize: '11px', minHeight: '28px' }}
                              title="Withdraw under OCAP sovereignty"
                            >
                              Withdraw
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ─── Metrics View ─── */}
      <section className="glass-card">
        <h3 style={{ fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#DAF1DE' }}>
          <Award size={20} color="#8EB69B" />
          <span>Pilot Evaluation Metrics</span>
        </h3>

        {isLoadingMetrics ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(218, 241, 222, 0.72)' }}>
            <Loader2 size={18} className="spin-animate" style={{ display: 'inline', marginRight: '8px' }} />
            Loading benchmark metrics...
          </div>
        ) : metrics.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'rgba(218, 241, 222, 0.5)', fontStyle: 'italic', padding: '16px 0' }}>
            No evaluation metrics recorded yet. Metrics are populated as models are evaluated against verified community recordings.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--card-border)', textAlign: 'left', color: 'rgba(218, 241, 222, 0.72)' }}>
                  <th style={{ padding: '10px 8px' }}>ID</th>
                  <th style={{ padding: '10px 8px' }}>Language</th>
                  <th style={{ padding: '10px 8px' }}>Model</th>
                  <th style={{ padding: '10px 8px' }}>Sample Size</th>
                  <th style={{ padding: '10px 8px' }}>WER</th>
                  <th style={{ padding: '10px 8px' }}>CER</th>
                  <th style={{ padding: '10px 8px' }}>BLEU</th>
                  <th style={{ padding: '10px 8px' }}>Evaluation Date</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map(m => (
                  <tr key={m.id} style={{ borderBottom: '1px solid rgba(35, 83, 71, 0.35)' }}>
                    <td style={{ padding: '10px 8px', color: 'rgba(218, 241, 222, 0.72)' }}>#{m.id}</td>
                    <td style={{ padding: '10px 8px', color: '#8EB69B', fontWeight: '600' }}>{m.language}</td>
                    <td style={{ padding: '10px 8px', color: '#DAF1DE' }}>{m.model}</td>
                    <td style={{ padding: '10px 8px' }}>{m.sample_size}</td>
                    <td style={{ padding: '10px 8px', color: m.wer !== undefined && m.wer !== null ? '#8EB69B' : 'rgba(218, 241, 222, 0.5)' }}>
                      {m.wer !== undefined && m.wer !== null ? `${(m.wer * 100).toFixed(1)}%` : '-'}
                    </td>
                    <td style={{ padding: '10px 8px', color: m.cer !== undefined && m.cer !== null ? '#8EB69B' : 'rgba(218, 241, 222, 0.5)' }}>
                      {m.cer !== undefined && m.cer !== null ? `${(m.cer * 100).toFixed(1)}%` : '-'}
                    </td>
                    <td style={{ padding: '10px 8px', color: m.bleu !== undefined && m.bleu !== null ? '#8EB69B' : 'rgba(218, 241, 222, 0.5)' }}>
                      {m.bleu !== undefined && m.bleu !== null ? m.bleu.toFixed(2) : '-'}
                    </td>
                    <td style={{ padding: '10px 8px', color: 'rgba(218, 241, 222, 0.72)' }}>{m.evaluation_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ─── Live Linguistic Benchmark Calculator (WER / CER / chrF) ─── */}
      <section className="glass-card" style={{ border: '1px solid #235347' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: '#DAF1DE' }}>
            <Calculator size={20} color="#8EB69B" />
            <span>Live WER & CER Linguistic Benchmark Calculator</span>
          </h3>
          <span className="badge badge-green" style={{ fontSize: '11px' }}>
            Deterministic Levenshtein Metric • 0 Invented Numbers
          </span>
        </div>

        <p style={{ fontSize: '13px', color: 'rgba(218, 241, 222, 0.72)', lineHeight: '1.6', marginBottom: '16px' }}>
          Evaluate model accuracy against ground-truth reference transcripts. Calculates Word Error Rate (WER), Character Error Rate (CER for Indic & agglutinative scripts), and chrF character n-gram F-score without synthetic hallucination.
        </p>

        {/* Preset quick test buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <span style={{ fontSize: '12px', color: '#8EB69B', fontWeight: '600', alignSelf: 'center' }}>Test Presets:</span>
          <button
            type="button"
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '12px' }}
            onClick={() => {
              setCalcRef('నండ్రాయి గోండ్వానా పున్నెం');
              setCalcHyp('నండ్రాయి గోండ్వానా పున్నెం');
              handleCalculateMetrics('నండ్రాయి గోండ్వానా పున్నెం', 'నండ్రాయి గోండ్వానా పున్నెం');
            }}
          >
            Gondi Exact Match (0% WER)
          </button>
          <button
            type="button"
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '12px' }}
            onClick={() => {
              setCalcRef('నండ్రాయి గోండ్వానా పున్నెం');
              setCalcHyp('నండ్రాయి గోండ్వానా సేవా');
              handleCalculateMetrics('నండ్రాయి గోండ్వానా పున్నెం', 'నండ్రాయి గోండ్వానా సేవా');
            }}
          >
            Gondi 1-Word Substitution (33% WER)
          </button>
          <button
            type="button"
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '12px' }}
            onClick={() => {
              setCalcRef('voice roots preserves oral languages');
              setCalcHyp('voice roots preserves oral songs');
              handleCalculateMetrics('voice roots preserves oral languages', 'voice roots preserves oral songs');
            }}
          >
            English Sample (20% WER)
          </button>
        </div>

        {/* Input Fields */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#8EB69B', marginBottom: '6px' }}>
              Reference Text (Ground Truth / Native Speaker Master)
            </label>
            <textarea
              rows={3}
              value={calcRef}
              onChange={(e) => setCalcRef(e.target.value)}
              placeholder="Enter approved reference transcript..."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                background: 'rgba(5, 31, 32, 0.7)',
                border: '1px solid #235347',
                color: '#DAF1DE',
                fontSize: '13px',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#8EB69B', marginBottom: '6px' }}>
              Hypothesis Text (Raw Machine / AI Model Transcription)
            </label>
            <textarea
              rows={3}
              value={calcHyp}
              onChange={(e) => setCalcHyp(e.target.value)}
              placeholder="Enter model generated hypothesis transcript..."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                background: 'rgba(5, 31, 32, 0.7)',
                border: '1px solid #235347',
                color: '#DAF1DE',
                fontSize: '13px',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px' }}>
          <button
            type="button"
            className="btn-primary"
            disabled={calcLoading || !calcRef.trim() || !calcHyp.trim()}
            onClick={() => handleCalculateMetrics()}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 18px', fontSize: '13px' }}
          >
            {calcLoading ? (
              <>
                <Loader2 size={16} className="spin-animate" />
                <span>Computing Levenshtein Metrics...</span>
              </>
            ) : (
              <>
                <Calculator size={16} />
                <span>Calculate Live WER & CER</span>
              </>
            )}
          </button>
        </div>

        {calcError && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', borderRadius: '8px', padding: '10px 14px', color: '#FCA5A5', fontSize: '12px', marginBottom: '14px' }}>
            {calcError}
          </div>
        )}

        {calcResult && (
          <div style={{ background: 'rgba(5, 31, 32, 0.85)', border: '1px solid #235347', borderRadius: '10px', padding: '16px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#DAF1DE', margin: '0 0 12px 0' }}>
              Evaluation Scorecard
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '14px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10B981', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#6EE7B7', fontWeight: '600' }}>Word Error Rate (WER)</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: calcResult.wer === 0 ? '#10B981' : '#F9E79F', marginTop: '4px' }}>
                  {calcResult.wer_percent}%
                </div>
                <div style={{ fontSize: '10px', color: 'rgba(218, 241, 222, 0.65)' }}>Edit Dist: {calcResult.word_edit_distance} words</div>
              </div>

              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10B981', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#6EE7B7', fontWeight: '600' }}>Char Error Rate (CER)</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: calcResult.cer === 0 ? '#10B981' : '#F9E79F', marginTop: '4px' }}>
                  {calcResult.cer_percent}%
                </div>
                <div style={{ fontSize: '10px', color: 'rgba(218, 241, 222, 0.65)' }}>Edit Dist: {calcResult.char_edit_distance} chars</div>
              </div>

              <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3B82F6', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#93C5FD', fontWeight: '600' }}>chrF F-Score</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#93C5FD', marginTop: '4px' }}>
                  {calcResult.chrf_percent}%
                </div>
                <div style={{ fontSize: '10px', color: 'rgba(218, 241, 222, 0.65)' }}>Character n-gram F₂</div>
              </div>

              <div style={{ background: 'rgba(23, 62, 57, 0.5)', border: '1px solid #235347', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#8EB69B', fontWeight: '600' }}>Token Counts</div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#DAF1DE', marginTop: '6px' }}>
                  {calcResult.reference_word_count} ref / {calcResult.hypothesis_word_count} hyp
                </div>
                <div style={{ fontSize: '10px', color: 'rgba(218, 241, 222, 0.65)' }}>Whitespace tokens</div>
              </div>
            </div>

            <p style={{ margin: 0, fontSize: '11px', color: 'rgba(218, 241, 222, 0.7)', fontStyle: 'italic' }}>
              {calcResult.notice}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

