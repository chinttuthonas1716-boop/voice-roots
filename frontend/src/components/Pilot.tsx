// Voice Roots: Milestone 8 Contributor Portal & Human Verification System
import React, { useState, useEffect, useRef } from 'react';
import { apiUrl } from '../App';
import {
  ContributionSubmission,
  VerificationStatus,
  ReviewerRole,
  ReviewerUncertainty,
  VerificationHistoryResponse,
  PilotSubmissionResponse,
  PilotMetricResponse,
} from '../types';
import {
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  FileText,
  Check,
  X,
  Loader2,
  Award,
  Calculator,
  Mic,
  Square,
  Upload,
  Eye,
  EyeOff,
  History,
  Globe,
  RefreshCw,
  Edit3,
} from 'lucide-react';

export function Pilot() {
  // Top-level View Switcher: Contributor Portal vs Human Verification vs Evaluation Metrics
  const [activeSubTab, setActiveSubTab] = useState<'portal' | 'verification' | 'metrics'>('portal');

  // Shared Languages from backend
  const [languages, setLanguages] = useState<any[]>([]);

  useEffect(() => {
    fetch(apiUrl('/api/languages'))
      .then(r => r.json())
      .then(d => setLanguages(d.languages || []))
      .catch(() => {});
  }, []);

  // ════════════════════════════════════════════════════════════════════════════
  // 1. CONTRIBUTOR PORTAL STATE
  // ════════════════════════════════════════════════════════════════════════════
  const [storyTitle, setStoryTitle] = useState('');
  const [storyLang, setStoryLang] = useState('Gondi');
  const [storyDialect, setStoryDialect] = useState('');
  const [storyContext, setStoryContext] = useState('');
  const [contributorName, setContributorName] = useState('');
  const [contributorRole, setContributorRole] = useState('speaker');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Multi-tier Explicit Consent (OCAP protocols)
  const [consentPrivateStorage, setConsentPrivateStorage] = useState(true);
  const [consentCommunityAccess, setConsentCommunityAccess] = useState(true);
  const [consentPublicPublication, setConsentPublicPublication] = useState(false);
  const [consentAiTraining, setConsentAiTraining] = useState(false);

  // Audio Upload / Recording State
  const [inputMode, setInputMode] = useState<'upload' | 'record'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);

  const [isSubmittingStory, setIsSubmittingStory] = useState(false);
  const [portalMessage, setPortalMessage] = useState<string | null>(null);
  const [portalError, setPortalError] = useState<string | null>(null);

  // Contributor's Submissions List
  const [mySubmissions, setMySubmissions] = useState<ContributionSubmission[]>([]);
  const [isLoadingMySubmissions, setIsLoadingMySubmissions] = useState(false);

  // Draft Editing Modal / Inline State
  const [editingDraft, setEditingDraft] = useState<ContributionSubmission | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDialect, setDraftDialect] = useState('');
  const [draftNotes, setDraftNotes] = useState('');
  const [draftTranscript, setDraftTranscript] = useState('');
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const fetchMySubmissions = async () => {
    setIsLoadingMySubmissions(true);
    try {
      const res = await fetch(apiUrl('/api/v1/contributions/my-submissions?limit=50'));
      if (res.ok) {
        const data = await res.json();
        setMySubmissions(data.submissions || []);
      }
    } catch {
      // offline fallback
    } finally {
      setIsLoadingMySubmissions(false);
    }
  };

  useEffect(() => {
    fetchMySubmissions();
  }, []);

  // Audio Recording Handlers
  const startRecording = async () => {
    setPortalError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setRecordedAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setPreviewAudioUrl(url);
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err: any) {
      setPortalError('Microphone access denied or unavailable: ' + (err.message || 'Check permissions.'));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewAudioUrl(url);
    }
  };

  // Submit Oral Story or Draft
  const handleStorySubmit = async (asDraft: boolean) => {
    setPortalMessage(null);
    setPortalError(null);

    if (!storyTitle.trim()) {
      setPortalError('Please provide a title for the recording.');
      return;
    }
    if (!consentPrivateStorage) {
      setPortalError('Mandatory storage consent is required before saving the recording.');
      return;
    }

    const audioPayload = inputMode === 'upload' ? selectedFile : recordedAudioBlob;
    if (!audioPayload) {
      setPortalError('Please upload an audio file or record oral speech first.');
      return;
    }

    setIsSubmittingStory(true);
    try {
      const formData = new FormData();
      if (inputMode === 'upload' && selectedFile) {
        formData.append('file', selectedFile);
      } else if (recordedAudioBlob) {
        formData.append('file', recordedAudioBlob, 'story_recording.wav');
      }

      formData.append('title', storyTitle.trim());
      formData.append('language', storyLang);
      if (storyDialect.trim()) formData.append('dialect', storyDialect.trim());
      if (storyContext.trim()) formData.append('contextual_notes', storyContext.trim());

      formData.append('contributor_name', isAnonymous ? 'Anonymous Contributor' : (contributorName.trim() || 'Community Contributor'));
      formData.append('contributor_role', contributorRole);
      formData.append('is_anonymous', isAnonymous ? 'true' : 'false');

      // Multi-tier consent
      formData.append('consent_private_storage', consentPrivateStorage ? 'true' : 'false');
      formData.append('consent_community_access', consentCommunityAccess ? 'true' : 'false');
      formData.append('consent_public_publication', consentPublicPublication ? 'true' : 'false');
      formData.append('consent_ai_training', consentAiTraining ? 'true' : 'false');

      formData.append('is_draft', asDraft ? 'true' : 'false');

      const res = await fetch(apiUrl('/api/upload'), {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setPortalMessage(
          asDraft
            ? `Draft saved successfully! (ID #${data.id}). You can refine it under 'My Submissions'.`
            : `Oral story submitted for community review! (ID #${data.id}, Status: ${data.verification_status}).`
        );
        // Reset form
        setStoryTitle('');
        setStoryDialect('');
        setStoryContext('');
        setSelectedFile(null);
        setRecordedAudioBlob(null);
        setPreviewAudioUrl(null);
        fetchMySubmissions();
        fetchQueue();
      } else {
        const err = await res.json().catch(() => ({}));
        setPortalError(err.detail || 'Story submission failed.');
      }
    } catch (err: any) {
      setPortalError('Network error uploading recording: ' + err.message);
    } finally {
      setIsSubmittingStory(false);
    }
  };

  // Withdraw Submission (OCAP Sovereignty)
  const handleWithdrawSubmission = async (id: number) => {
    if (!window.confirm('Are you sure you want to withdraw this submission under OCAP protocols? It will be removed from review.')) {
      return;
    }
    try {
      const res = await fetch(apiUrl(`/api/v1/contributions/${id}/withdraw`), {
        method: 'POST',
      });
      if (res.ok) {
        setPortalMessage(`Submission #${id} withdrawn successfully under OCAP data sovereignty.`);
        fetchMySubmissions();
        fetchQueue();
      } else {
        const err = await res.json().catch(() => ({}));
        setPortalError(err.detail || 'Withdrawal failed.');
      }
    } catch (err: any) {
      setPortalError('Network error: ' + err.message);
    }
  };

  // Save / Submit Draft Edit
  const handleSaveDraftChanges = async (submitNow: boolean) => {
    if (!editingDraft) return;
    setIsSavingDraft(true);
    try {
      const res = await fetch(apiUrl(`/api/v1/contributions/${editingDraft.id}/draft`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: draftTitle.trim() || undefined,
          dialect: draftDialect.trim() || undefined,
          contextual_notes: draftNotes.trim() || undefined,
          transcript_text: draftTranscript.trim() || undefined,
          submit: submitNow,
        }),
      });
      if (res.ok) {
        setPortalMessage(
          submitNow
            ? `Draft #${editingDraft.id} submitted for community verification!`
            : `Draft #${editingDraft.id} updated successfully.`
        );
        setEditingDraft(null);
        fetchMySubmissions();
        fetchQueue();
      } else {
        const err = await res.json().catch(() => ({}));
        setPortalError(err.detail || 'Updating draft failed.');
      }
    } catch (err: any) {
      setPortalError('Network error: ' + err.message);
    } finally {
      setIsSavingDraft(false);
    }
  };

  // ════════════════════════════════════════════════════════════════════════════
  // 2. HUMAN TRANSCRIPT VERIFICATION STATE
  // ════════════════════════════════════════════════════════════════════════════
  const [reviewerNameInput, setReviewerNameInput] = useState('Elder Somu');
  const [reviewerRoleInput, setReviewerRoleInput] = useState<ReviewerRole>('community_elder');
  const [queueFilterLanguage, setQueueFilterLanguage] = useState('');
  const [queueFilterStatus, setQueueFilterStatus] = useState('');

  const [verificationQueue, setVerificationQueue] = useState<ContributionSubmission[]>([]);
  const [isLoadingQueue, setIsLoadingQueue] = useState(false);
  const [queueMessage, setQueueMessage] = useState<string | null>(null);
  const [queueError, setQueueError] = useState<string | null>(null);

  // Active Item being verified
  const [activeReviewItem, setActiveReviewItem] = useState<ContributionSubmission | null>(null);
  const [editedTranscriptText, setEditedTranscriptText] = useState('');
  const [reviewerUncertainty, setReviewerUncertainty] = useState<ReviewerUncertainty>('low');
  const [reviewNotesInput, setReviewNotesInput] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Audit History Modal
  const [historyTargetId, setHistoryTargetId] = useState<number | null>(null);
  const [auditHistory, setAuditHistory] = useState<VerificationHistoryResponse | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const fetchQueue = async () => {
    setIsLoadingQueue(true);
    setQueueError(null);
    try {
      let url = `/api/v1/verification/queue?reviewer_role=${reviewerRoleInput}&limit=50`;
      if (queueFilterLanguage) url += `&language=${encodeURIComponent(queueFilterLanguage)}`;
      if (queueFilterStatus) url += `&status=${encodeURIComponent(queueFilterStatus)}`;

      const res = await fetch(apiUrl(url));
      if (res.ok) {
        const data = await res.json();
        setVerificationQueue(data.queue || []);
      } else {
        const err = await res.json().catch(() => ({}));
        setQueueError(err.detail || 'Could not load verification queue.');
      }
    } catch (err: any) {
      setQueueError('Network error: ' + err.message);
    } finally {
      setIsLoadingQueue(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'verification') {
      fetchQueue();
    }
  }, [activeSubTab, reviewerRoleInput, queueFilterLanguage, queueFilterStatus]);

  // Claim Item for Review
  const handleClaimItem = async (transcriptId: number) => {
    setQueueError(null);
    setQueueMessage(null);
    try {
      const res = await fetch(
        apiUrl(
          `/api/v1/verification/${transcriptId}/claim?reviewer_name=${encodeURIComponent(
            reviewerNameInput.trim() || 'Reviewer'
          )}&reviewer_role=${reviewerRoleInput}`
        ),
        { method: 'POST' }
      );
      if (res.ok) {
        const item = await res.json();
        setQueueMessage(`Claimed item #${transcriptId} for verification.`);
        setActiveReviewItem(item);
        setEditedTranscriptText(item.transcript_text || item.machine_transcript_text || '');
        setReviewerUncertainty(item.reviewer_uncertainty || 'low');
        setReviewNotesInput(item.review_notes || '');
        fetchQueue();
      } else {
        const err = await res.json().catch(() => ({}));
        setQueueError(err.detail || 'Could not claim item.');
      }
    } catch (err: any) {
      setQueueError('Network error: ' + err.message);
    }
  };

  // Submit Review Decision (Verify / Changes Requested / Corrected / Reject)
  const handleReviewDecision = async (decision: 'verified' | 'changes_requested' | 'corrected' | 'withdrawn_or_rejected') => {
    if (!activeReviewItem) return;
    setIsSubmittingReview(true);
    setQueueError(null);
    setQueueMessage(null);

    try {
      const payload = {
        reviewer_name: reviewerNameInput.trim() || 'Reviewer',
        reviewer_role: reviewerRoleInput,
        decision,
        corrected_transcript: editedTranscriptText.trim(),
        reviewer_uncertainty: reviewerUncertainty,
        review_notes: reviewNotesInput.trim() || undefined,
      };

      const res = await fetch(apiUrl(`/api/v1/verification/${activeReviewItem.id}/review`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const updated = await res.json();
        setQueueMessage(`Verification decision recorded: '${decision}' for recording #${updated.id}.`);
        setActiveReviewItem(null);
        fetchQueue();
        fetchMySubmissions();
      } else {
        const err = await res.json().catch(() => ({}));
        setQueueError(err.detail || 'Failed to submit review decision.');
      }
    } catch (err: any) {
      setQueueError('Network error: ' + err.message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Publish to Public Corpus (Enforces OCAP Consent & Role Authorization)
  const handlePublishVerified = async (transcriptId: number) => {
    setQueueError(null);
    setQueueMessage(null);
    try {
      const res = await fetch(
        apiUrl(`/api/v1/verification/${transcriptId}/publish?publisher_role=${reviewerRoleInput}`),
        { method: 'POST' }
      );
      if (res.ok) {
        setQueueMessage(`Recording #${transcriptId} published to public community corpus!`);
        fetchQueue();
        fetchMySubmissions();
        if (activeReviewItem?.id === transcriptId) {
          setActiveReviewItem(null);
        }
      } else {
        const err = await res.json().catch(() => ({}));
        setQueueError(err.detail || 'Publishing failed: Ensure item is verified and public consent was granted.');
      }
    } catch (err: any) {
      setQueueError('Network error: ' + err.message);
    }
  };

  // View Audit History
  const handleOpenHistory = async (transcriptId: number) => {
    setHistoryTargetId(transcriptId);
    setIsLoadingHistory(true);
    try {
      const res = await fetch(apiUrl(`/api/v1/verification/${transcriptId}/history`));
      if (res.ok) {
        const data = await res.json();
        setAuditHistory(data);
      }
    } catch {
      // offline fallback
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Helper for Status Badge styling
  const renderStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'draft':
        return <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: '#DAF1DE', border: '1px solid rgba(255,255,255,0.2)' }}>Draft</span>;
      case 'submitted':
        return <span className="badge badge-teal">Submitted</span>;
      case 'awaiting_review':
        return <span className="badge" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#FDE047', border: '1px solid rgba(234, 179, 8, 0.4)' }}>Awaiting Review</span>;
      case 'under_review':
        return <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.18)', color: '#E9D5FF', border: '1px solid rgba(168, 85, 247, 0.4)' }}>Under Review</span>;
      case 'changes_requested':
        return <span className="badge" style={{ background: 'rgba(249, 115, 22, 0.18)', color: '#FDBA74', border: '1px solid rgba(249, 115, 22, 0.4)' }}>Changes Requested</span>;
      case 'corrected':
        return <span className="badge badge-teal">Community Corrected</span>;
      case 'verified':
        return <span className="badge badge-green">✓ Human Verified</span>;
      case 'published':
        return <span className="badge" style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#86EFAC', border: '1px solid #22C55E', fontWeight: '700' }}>★ Published</span>;
      case 'withdrawn_or_rejected':
        return <span className="badge badge-red">Withdrawn / Rejected</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  // ════════════════════════════════════════════════════════════════════════════
  // 3. PILOT METRICS & BENCHMARK STATE (PRESERVED)
  // ════════════════════════════════════════════════════════════════════════════
  const [pilotSubmissions, setPilotSubmissions] = useState<PilotSubmissionResponse[]>([]);
  const [pilotMetrics, setPilotMetrics] = useState<PilotMetricResponse[]>([]);
  const [calcRef, setCalcRef] = useState('నండ్రాయి గోండ్వానా పున్నెం');
  const [calcHyp, setCalcHyp] = useState('నండ్రాయి గోండ్వానా పున్నెం');
  const [calcLoading, setCalcLoading] = useState(false);
  const [calcResult, setCalcResult] = useState<any>(null);

  const fetchPilotData = async () => {
    try {
      const [resSub, resMet] = await Promise.all([
        fetch(apiUrl('/api/v1/pilot/submissions')),
        fetch(apiUrl('/api/v1/pilot/metrics')),
      ]);
      if (resSub.ok) {
        const d = await resSub.json();
        setPilotSubmissions(d.submissions || []);
      }
      if (resMet.ok) {
        const d = await resMet.json();
        setPilotMetrics(Array.isArray(d) ? d : d.metrics || []);
      }
    } catch {}
  };

  useEffect(() => {
    if (activeSubTab === 'metrics') {
      fetchPilotData();
    }
  }, [activeSubTab]);

  const handleCalculateMetrics = async (refText = calcRef, hypText = calcHyp) => {
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
      }
    } catch {}
    finally {
      setCalcLoading(false);
    }
  };

  return (
    <div className="pilot-section" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* ─── Top Level Navigation Tabs ─── */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-green)', paddingBottom: '14px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setActiveSubTab('portal')}
          className={activeSubTab === 'portal' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 18px', fontSize: '14px', minHeight: '38px' }}
        >
          <Mic size={16} />
          <span>Contributor Portal & Drafts</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('verification')}
          className={activeSubTab === 'verification' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 18px', fontSize: '14px', minHeight: '38px' }}
        >
          <ShieldCheck size={16} />
          <span>Human Verification Queue</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('metrics')}
          className={activeSubTab === 'metrics' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 18px', fontSize: '14px', minHeight: '38px' }}
        >
          <Calculator size={16} />
          <span>Evaluation Benchmarks (WER/CER)</span>
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          VIEW 1: CONTRIBUTOR PORTAL
          ════════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'portal' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Banner: OCAP Consent Protocol */}
          <div className="glass-card" style={{ borderLeft: '4px solid #8EB69B' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <ShieldCheck size={24} color="#8EB69B" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '4px', color: '#DAF1DE' }}>
                  Community Contributor Portal (OCAP Sovereign Archival)
                </h3>
                <p style={{ fontSize: '13px', color: 'rgba(218, 241, 222, 0.75)', lineHeight: '1.6' }}>
                  Submit oral stories, historical chants, and dialectal lore. Your voice master is cryptographically preserved unchanged. 
                  Choose multi-tier consent levels, save drafts anytime, or withdraw your records at will under Indigenous Data Sovereignty protocols.
                </p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                  <span className="badge badge-green">4-Tier Granular Consent</span>
                  <span className="badge badge-teal">Anonymous Attribution Option</span>
                  <span className="badge badge-green">Right to Withdraw (OCAP)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Oral Story Submission Form */}
          <section className="glass-card">
            <h3 style={{ fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px', color: '#DAF1DE' }}>
              <FileText size={20} color="#8EB69B" />
              <span>Submit Oral Speech Recording</span>
            </h3>

            {portalError && (
              <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#FCA5A5', fontSize: '13px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <AlertCircle size={16} />
                <span>{portalError}</span>
              </div>
            )}

            {portalMessage && (
              <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(142, 182, 155, 0.15)', color: '#DAF1DE', fontSize: '13px', border: '1px solid #235347' }}>
                <CheckCircle2 size={16} color="#8EB69B" />
                <span>{portalMessage}</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#8EB69B', marginBottom: '6px' }}>
                  STORY TITLE / DESCRIPTION *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Adilabad Persa Pen Harvest Song"
                  value={storyTitle}
                  onChange={e => setStoryTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#8EB69B', marginBottom: '6px' }}>
                  VERIFIED LANGUAGE REGISTRY *
                </label>
                <select
                  className="select-field"
                  value={storyLang}
                  onChange={e => setStoryLang(e.target.value)}
                >
                  {languages.map(l => (
                    <option key={l.code || l.name} value={l.name}>
                      {l.name} {l.category ? `(${l.category})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#8EB69B', marginBottom: '6px' }}>
                  LOCAL DIALECT / REGIONAL VARIANT (OPTIONAL)
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Northern Adilabad Vernacular"
                  value={storyDialect}
                  onChange={e => setStoryDialect(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#8EB69B', marginBottom: '6px' }}>
                  CONTRIBUTOR NAME & ROLE
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Your name or Elder identifier"
                    value={contributorName}
                    disabled={isAnonymous}
                    onChange={e => setContributorName(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <select
                    className="select-field"
                    value={contributorRole}
                    onChange={e => setContributorRole(e.target.value)}
                    style={{ width: '130px' }}
                  >
                    <option value="speaker">Speaker</option>
                    <option value="elder">Elder</option>
                    <option value="storyteller">Storyteller</option>
                    <option value="linguist">Linguist</option>
                    <option value="recorder">Field Worker</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Anonymous attribution toggle */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#DAF1DE' }}>
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={e => setIsAnonymous(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#8EB69B' }}
                />
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isAnonymous ? <EyeOff size={15} color="#8EB69B" /> : <Eye size={15} color="#8EB69B" />}
                  <strong>Preserve Anonymity:</strong> List public record as 'Anonymous Contributor'
                </span>
              </label>
            </div>

            {/* Contextual Notes */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#8EB69B', marginBottom: '6px' }}>
                CONTEXTUAL NOTES & CULTURAL BACKGROUND (OPTIONAL)
              </label>
              <textarea
                className="textarea-field"
                rows={2}
                placeholder="Where was this spoken? Any seasonal context, ceremonial meaning, or clan traditions?"
                value={storyContext}
                onChange={e => setStoryContext(e.target.value)}
              />
            </div>

            {/* Audio Source Input Mode Switcher */}
            <div style={{ background: 'rgba(5, 31, 32, 0.6)', border: '1px solid #235347', borderRadius: '12px', padding: '16px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
                <button
                  type="button"
                  onClick={() => setInputMode('upload')}
                  className={inputMode === 'upload' ? 'btn-primary' : 'btn-secondary'}
                  style={{ padding: '6px 14px', fontSize: '12px', minHeight: '34px' }}
                >
                  <Upload size={14} />
                  <span>Upload Audio File</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('record')}
                  className={inputMode === 'record' ? 'btn-primary' : 'btn-secondary'}
                  style={{ padding: '6px 14px', fontSize: '12px', minHeight: '34px' }}
                >
                  <Mic size={14} />
                  <span>Record from Microphone</span>
                </button>
              </div>

              {inputMode === 'upload' ? (
                <div>
                  <input
                    type="file"
                    accept="audio/wav,audio/mp3,audio/m4a,audio/ogg,audio/flac,audio/webm"
                    onChange={handleFileChange}
                    style={{ fontSize: '13px', color: '#DAF1DE' }}
                  />
                  <p style={{ fontSize: '11px', color: 'rgba(218, 241, 222, 0.6)', marginTop: '6px' }}>
                    Supported audio masters: WAV, MP3, FLAC, M4A, OGG, WebM (up to 25 MB).
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="btn-primary"
                      style={{ padding: '8px 18px', fontSize: '13px' }}
                    >
                      <Mic size={16} />
                      <span>Start Oral Recording</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="btn-danger"
                      style={{ padding: '8px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Square size={16} />
                      <span>Stop Recording ({recordingSeconds}s)</span>
                    </button>
                  )}
                  {isRecording && (
                    <span style={{ fontSize: '12px', color: '#EF4444', animation: 'pulse 1.5s infinite' }}>
                      ● Recording active... Speak clearly into the microphone
                    </span>
                  )}
                </div>
              )}

              {/* Audio Preview */}
              {previewAudioUrl && (
                <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '12px', color: '#8EB69B', fontWeight: '600' }}>Master Preview:</span>
                  <audio controls src={previewAudioUrl} style={{ height: '36px', maxWidth: '340px' }} />
                </div>
              )}
            </div>

            {/* Multi-Tier Explicit Consent Checkbox Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#8EB69B', letterSpacing: '0.05em' }}>
                OCAP MULTI-TIER EXPLICIT CONSENT AGREEMENT
              </span>

              <div style={{ background: 'rgba(142, 182, 155, 0.08)', border: '1px solid #235347', borderRadius: '10px', padding: '12px 14px' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '13px', color: '#DAF1DE' }}>
                  <input
                    type="checkbox"
                    checked={consentPrivateStorage}
                    onChange={e => setConsentPrivateStorage(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#8EB69B', marginTop: '2px' }}
                  />
                  <div>
                    <strong>1. Private Storage Consent (Mandatory):</strong> I consent to storing this master audio recording safely within the Voice Roots private cultural archive.
                  </div>
                </label>
              </div>

              <div style={{ background: 'rgba(142, 182, 155, 0.08)', border: '1px solid #235347', borderRadius: '10px', padding: '12px 14px' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '13px', color: '#DAF1DE' }}>
                  <input
                    type="checkbox"
                    checked={consentCommunityAccess}
                    onChange={e => setConsentCommunityAccess(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#8EB69B', marginTop: '2px' }}
                  />
                  <div>
                    <strong>2. Community Access & Elder Verification:</strong> I authorize community elders and native-speaker linguists to listen to the audio and verify/correct transcriptions.
                  </div>
                </label>
              </div>

              <div style={{ background: 'rgba(142, 182, 155, 0.08)', border: '1px solid #235347', borderRadius: '10px', padding: '12px 14px' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '13px', color: '#DAF1DE' }}>
                  <input
                    type="checkbox"
                    checked={consentPublicPublication}
                    onChange={e => setConsentPublicPublication(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#8EB69B', marginTop: '2px' }}
                  />
                  <div>
                    <strong>3. Public Cultural Corpus Publication (Opt-in):</strong> Once verified by elders, publish this recording and transcript to the open searchable cultural corpus.
                  </div>
                </label>
              </div>

              <div style={{ background: 'rgba(142, 182, 155, 0.08)', border: '1px solid #235347', borderRadius: '10px', padding: '12px 14px' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '13px', color: '#DAF1DE' }}>
                  <input
                    type="checkbox"
                    checked={consentAiTraining}
                    onChange={e => setConsentAiTraining(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#8EB69B', marginTop: '2px' }}
                  />
                  <div>
                    <strong>4. AI Acoustic & Translation Fine-tuning (Opt-in):</strong> Permit using this recording to fine-tune open-source speech models strictly for preserving this tongue.
                  </div>
                </label>
              </div>
            </div>

            {/* Actions: Save as Draft vs Submit for Verification */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                type="button"
                disabled={isSubmittingStory}
                onClick={() => handleStorySubmit(true)}
                className="btn-secondary"
                style={{ minWidth: '160px' }}
              >
                {isSubmittingStory ? <Loader2 size={16} className="spin-animate" /> : <Edit3 size={16} />}
                <span>Save as Draft</span>
              </button>

              <button
                type="button"
                disabled={isSubmittingStory}
                onClick={() => handleStorySubmit(false)}
                className="btn-primary"
                style={{ minWidth: '220px' }}
              >
                {isSubmittingStory ? <Loader2 size={16} className="spin-animate" /> : <Check size={16} />}
                <span>Submit for Human Verification</span>
              </button>
            </div>
          </section>

          {/* ─── My Submissions & Draft Manager ─── */}
          <section className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#DAF1DE' }}>
                  My Submissions & Draft Status Tracker
                </h3>
                <p style={{ fontSize: '13px', color: 'rgba(218, 241, 222, 0.72)' }}>
                  Monitor progress across 9 verification lifecycle states or withdraw data under OCAP protocols.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchMySubmissions}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                <RefreshCw size={14} />
                <span>Refresh</span>
              </button>
            </div>

            {isLoadingMySubmissions ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(218, 241, 222, 0.72)' }}>
                <Loader2 size={18} className="spin-animate" style={{ display: 'inline', marginRight: '8px' }} />
                Loading submissions...
              </div>
            ) : mySubmissions.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'rgba(218, 241, 222, 0.5)', fontStyle: 'italic', padding: '16px 0' }}>
                No oral recordings submitted yet. Submit an oral story above to view progress.
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--card-border)', textAlign: 'left', color: 'rgba(218, 241, 222, 0.72)' }}>
                      <th style={{ padding: '10px 8px' }}>ID</th>
                      <th style={{ padding: '10px 8px' }}>Title & Language</th>
                      <th style={{ padding: '10px 8px' }}>Contributor</th>
                      <th style={{ padding: '10px 8px' }}>Status</th>
                      <th style={{ padding: '10px 8px' }}>Public Consent</th>
                      <th style={{ padding: '10px 8px' }}>Verifier</th>
                      <th style={{ padding: '10px 8px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mySubmissions.map(s => (
                      <tr key={s.id} style={{ borderBottom: '1px solid rgba(35, 83, 71, 0.35)' }}>
                        <td style={{ padding: '10px 8px', color: 'rgba(218, 241, 222, 0.72)' }}>#{s.id}</td>
                        <td style={{ padding: '10px 8px' }}>
                          <span style={{ fontWeight: '600', color: '#DAF1DE', display: 'block' }}>{s.title}</span>
                          <span style={{ fontSize: '11px', color: '#8EB69B' }}>
                            {s.language} {s.dialect ? `• ${s.dialect}` : ''}
                          </span>
                        </td>
                        <td style={{ padding: '10px 8px', color: 'rgba(218, 241, 222, 0.85)' }}>
                          {s.is_anonymous ? 'Anonymous Contributor' : s.contributor_name}
                        </td>
                        <td style={{ padding: '10px 8px' }}>
                          {renderStatusBadge(s.verification_status)}
                        </td>
                        <td style={{ padding: '10px 8px' }}>
                          <span className={s.consent_public_publication ? 'badge badge-green' : 'badge badge-teal'}>
                            {s.consent_public_publication ? 'Opted-In' : 'Private'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 8px', color: '#8EB69B' }}>
                          {s.verified_by || 'Awaiting'}
                        </td>
                        <td style={{ padding: '10px 8px' }}>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            {s.verification_status === 'draft' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingDraft(s);
                                  setDraftTitle(s.title);
                                  setDraftDialect(s.dialect || '');
                                  setDraftNotes(s.contextual_notes || '');
                                  setDraftTranscript(s.transcript_text || '');
                                }}
                                className="btn-secondary"
                                style={{ padding: '4px 8px', fontSize: '11px', minHeight: '26px' }}
                              >
                                Edit Draft
                              </button>
                            )}

                            {s.verification_status !== 'withdrawn_or_rejected' && (
                              <button
                                type="button"
                                onClick={() => handleWithdrawSubmission(s.id)}
                                className="btn-danger"
                                style={{ padding: '4px 8px', fontSize: '11px', minHeight: '26px' }}
                                title="Withdraw under OCAP Data Sovereignty"
                              >
                                Withdraw
                              </button>
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

          {/* Draft Editing Modal */}
          {editingDraft && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(5, 31, 32, 0.85)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              zIndex: 999,
            }}>
              <div className="glass-card" style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#DAF1DE' }}>
                    Edit Draft #{editingDraft.id}: {editingDraft.title}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setEditingDraft(null)}
                    style={{ background: 'transparent', border: 'none', color: '#DAF1DE', cursor: 'pointer' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '18px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#8EB69B', marginBottom: '4px' }}>
                      TITLE
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={draftTitle}
                      onChange={e => setDraftTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#8EB69B', marginBottom: '4px' }}>
                      DIALECT VARIANT
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={draftDialect}
                      onChange={e => setDraftDialect(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#8EB69B', marginBottom: '4px' }}>
                      CONTEXTUAL / CULTURAL NOTES
                    </label>
                    <textarea
                      className="textarea-field"
                      rows={2}
                      value={draftNotes}
                      onChange={e => setDraftNotes(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#8EB69B', marginBottom: '4px' }}>
                      DRAFT TRANSCRIPT (OPTIONAL FIELD NOTES)
                    </label>
                    <textarea
                      className="textarea-field"
                      rows={3}
                      value={draftTranscript}
                      onChange={e => setDraftTranscript(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setEditingDraft(null)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={isSavingDraft}
                    onClick={() => handleSaveDraftChanges(false)}
                    className="btn-secondary"
                  >
                    Save Draft
                  </button>

                  <button
                    type="button"
                    disabled={isSavingDraft}
                    onClick={() => handleSaveDraftChanges(true)}
                    className="btn-primary"
                  >
                    Submit to Review Queue
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          VIEW 2: HUMAN TRANSCRIPT VERIFICATION
          ════════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'verification' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Reviewer Role Bar */}
          <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#DAF1DE', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} color="#8EB69B" />
                <span>Human Transcript Verification Queue</span>
              </h3>
              <p style={{ fontSize: '13px', color: 'rgba(218, 241, 222, 0.72)' }}>
                Compare audio against AI generated baselines. Correct errors, mark acoustic uncertainty, and record verified elder attestations.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#8EB69B', display: 'block', fontWeight: '600', marginBottom: '2px' }}>
                  REVIEWER NAME
                </label>
                <input
                  type="text"
                  className="input-field"
                  style={{ width: '160px', padding: '6px 10px', fontSize: '12px', minHeight: '32px' }}
                  value={reviewerNameInput}
                  onChange={e => setReviewerNameInput(e.target.value)}
                  placeholder="Reviewer Name"
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#8EB69B', display: 'block', fontWeight: '600', marginBottom: '2px' }}>
                  AUTHORIZATION ROLE
                </label>
                <select
                  className="select-field"
                  style={{ width: '190px', padding: '6px 10px', fontSize: '12px', minHeight: '32px' }}
                  value={reviewerRoleInput}
                  onChange={e => setReviewerRoleInput(e.target.value as ReviewerRole)}
                >
                  <option value="community_elder">Community Elder</option>
                  <option value="native_speaker_reviewer">Native Speaker Reviewer</option>
                  <option value="linguist">Linguist Specialist</option>
                  <option value="moderator">Corpus Moderator</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>
          </div>

          {queueError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#FCA5A5', fontSize: '13px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <AlertCircle size={16} />
              <span>{queueError}</span>
            </div>
          )}

          {queueMessage && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(142, 182, 155, 0.15)', color: '#DAF1DE', fontSize: '13px', border: '1px solid #235347' }}>
              <CheckCircle2 size={16} color="#8EB69B" />
              <span>{queueMessage}</span>
            </div>
          )}

          {/* Active Review Workspace */}
          {activeReviewItem ? (
            <div className="glass-card" style={{ border: '2px solid #8EB69B' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span className="badge badge-teal" style={{ marginBottom: '6px', display: 'inline-block' }}>
                    Active Review: Item #{activeReviewItem.id}
                  </span>
                  <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#DAF1DE' }}>
                    {activeReviewItem.title}
                  </h4>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#8EB69B' }}>
                    Language: {activeReviewItem.language} {activeReviewItem.dialect ? `• Dialect: ${activeReviewItem.dialect}` : ''} • Contributor: {activeReviewItem.contributor_name}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveReviewItem(null)}
                  className="btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '11px', minHeight: '30px' }}
                >
                  Close Review Workspace
                </button>
              </div>

              {/* Master Audio Stream */}
              <div style={{ background: 'rgba(5, 31, 32, 0.8)', border: '1px solid #235347', borderRadius: '10px', padding: '14px', marginBottom: '18px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#8EB69B', display: 'block', marginBottom: '8px' }}>
                  🔊 ORIGINAL MASTER AUDIO (IMMUTABLE SINGLE SOURCE OF TRUTH)
                </span>
                <audio
                  controls
                  src={apiUrl(`/api/v1/audio/${activeReviewItem.id}/stream`)}
                  style={{ width: '100%', height: '40px' }}
                />
              </div>

              {/* Comparison: AI Generated vs Human Verified */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '18px' }}>
                {/* AI Machine Baseline */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '14px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(218, 241, 222, 0.7)', display: 'block', marginBottom: '6px' }}>
                    🤖 RAW AI MACHINE TRANSCRIPT (READ-ONLY BASELINE)
                  </span>
                  <p style={{ fontSize: '13px', color: '#DAF1DE', lineHeight: '1.6', margin: 0, fontStyle: activeReviewItem.machine_transcript_text ? 'normal' : 'italic' }}>
                    {activeReviewItem.machine_transcript_text || activeReviewItem.transcript_text || 'No AI transcript generated yet.'}
                  </p>
                </div>

                {/* Human Verified Transcript Editor */}
                <div style={{ background: 'rgba(142, 182, 155, 0.06)', border: '1px solid #235347', borderRadius: '10px', padding: '14px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#8EB69B', display: 'block', marginBottom: '6px' }}>
                    ✍️ HUMAN VERIFIED TRANSCRIPT (ACTIVE CORRECTION LAYER)
                  </span>
                  <textarea
                    className="textarea-field"
                    rows={4}
                    value={editedTranscriptText}
                    onChange={e => setEditedTranscriptText(e.target.value)}
                    placeholder="Type elder-approved words, dialectal corrections, and phonemes here..."
                  />
                </div>
              </div>

              {/* Uncertainty Marking & Notes */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#8EB69B', marginBottom: '4px' }}>
                    REVIEWER UNCERTAINTY MARKER *
                  </label>
                  <select
                    className="select-field"
                    value={reviewerUncertainty}
                    onChange={e => setReviewerUncertainty(e.target.value as ReviewerUncertainty)}
                  >
                    <option value="low">Low (Clear Audio / High Confidence)</option>
                    <option value="medium">Medium (Minor Ambiguity)</option>
                    <option value="high">High (Acoustic Noise / Obscure Term)</option>
                    <option value="unclear_audio">Unclear Audio (Muffled / Distortion)</option>
                    <option value="unknown_dialect">Unknown Dialect (Uncataloged Vernacular)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#8EB69B', marginBottom: '4px' }}>
                    REVIEWER NOTES / LINGUISTIC CONTEXT
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Verified with village elder. Corrected suffix from -en to -em."
                    value={reviewNotesInput}
                    onChange={e => setReviewNotesInput(e.target.value)}
                  />
                </div>
              </div>

              {/* Review Actions */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  type="button"
                  disabled={isSubmittingReview}
                  onClick={() => handleReviewDecision('verified')}
                  className="btn-primary"
                  style={{ minWidth: '160px' }}
                >
                  {isSubmittingReview ? <Loader2 size={15} className="spin-animate" /> : <Check size={15} />}
                  <span>Approve & Verify</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmittingReview}
                  onClick={() => handleReviewDecision('corrected')}
                  className="btn-secondary"
                  style={{ color: '#8EB69B', borderColor: '#235347' }}
                >
                  Save Correction
                </button>

                <button
                  type="button"
                  disabled={isSubmittingReview}
                  onClick={() => handleReviewDecision('changes_requested')}
                  className="btn-secondary"
                >
                  Request Changes
                </button>

                <button
                  type="button"
                  disabled={isSubmittingReview}
                  onClick={() => handleReviewDecision('withdrawn_or_rejected')}
                  className="btn-danger"
                  style={{ minHeight: '38px', padding: '6px 14px' }}
                >
                  Reject / Inaudible
                </button>

                {activeReviewItem.verification_status === 'verified' && (
                  <button
                    type="button"
                    onClick={() => handlePublishVerified(activeReviewItem.id)}
                    className="btn-primary"
                    style={{ background: '#22C55E', color: '#051F20', marginLeft: 'auto' }}
                    title="Publish to public corpus (enforces contributor consent)"
                  >
                    <Globe size={15} />
                    <span>Publish to Public Corpus</span>
                  </button>
                )}
              </div>
            </div>
          ) : null}

          {/* Queue Filter Bar */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: '#8EB69B', fontWeight: '600' }}>Filter Queue:</span>
            <select
              className="select-field"
              style={{ width: '160px', padding: '6px 10px', fontSize: '12px', minHeight: '32px' }}
              value={queueFilterStatus}
              onChange={e => setQueueFilterStatus(e.target.value)}
            >
              <option value="">All Verification States</option>
              <option value="submitted">Submitted</option>
              <option value="awaiting_review">Awaiting Review</option>
              <option value="under_review">Under Review</option>
              <option value="changes_requested">Changes Requested</option>
              <option value="corrected">Corrected</option>
            </select>

            <select
              className="select-field"
              style={{ width: '160px', padding: '6px 10px', fontSize: '12px', minHeight: '32px' }}
              value={queueFilterLanguage}
              onChange={e => setQueueFilterLanguage(e.target.value)}
            >
              <option value="">All Languages</option>
              {languages.map(l => (
                <option key={l.code || l.name} value={l.name}>
                  {l.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={fetchQueue}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '12px', minHeight: '32px' }}
            >
              <RefreshCw size={13} />
              <span>Refresh Queue</span>
            </button>
          </div>

          {/* Verification Queue Table */}
          <section className="glass-card">
            {isLoadingQueue ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(218, 241, 222, 0.72)' }}>
                <Loader2 size={18} className="spin-animate" style={{ display: 'inline', marginRight: '8px' }} />
                Loading review queue...
              </div>
            ) : verificationQueue.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'rgba(218, 241, 222, 0.5)', fontStyle: 'italic', padding: '16px 0' }}>
                No recordings currently pending verification for role '{reviewerRoleInput}'.
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--card-border)', textAlign: 'left', color: 'rgba(218, 241, 222, 0.72)' }}>
                      <th style={{ padding: '10px 8px' }}>ID</th>
                      <th style={{ padding: '10px 8px' }}>Title & Language</th>
                      <th style={{ padding: '10px 8px' }}>Contributor</th>
                      <th style={{ padding: '10px 8px' }}>State</th>
                      <th style={{ padding: '10px 8px' }}>Uncertainty</th>
                      <th style={{ padding: '10px 8px' }}>Attribution</th>
                      <th style={{ padding: '10px 8px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verificationQueue.map(item => (
                      <tr key={item.id} style={{ borderBottom: '1px solid rgba(35, 83, 71, 0.35)' }}>
                        <td style={{ padding: '10px 8px', color: 'rgba(218, 241, 222, 0.72)' }}>#{item.id}</td>
                        <td style={{ padding: '10px 8px' }}>
                          <span style={{ fontWeight: '600', color: '#DAF1DE', display: 'block' }}>{item.title}</span>
                          <span style={{ fontSize: '11px', color: '#8EB69B' }}>
                            {item.language} {item.dialect ? `• ${item.dialect}` : ''}
                          </span>
                        </td>
                        <td style={{ padding: '10px 8px', color: 'rgba(218, 241, 222, 0.85)' }}>
                          {item.is_anonymous ? 'Anonymous Contributor' : item.contributor_name}
                        </td>
                        <td style={{ padding: '10px 8px' }}>
                          {renderStatusBadge(item.verification_status)}
                        </td>
                        <td style={{ padding: '10px 8px', color: '#8EB69B' }}>
                          {item.reviewer_uncertainty || '-'}
                        </td>
                        <td style={{ padding: '10px 8px' }}>
                          <span className={item.consent_public_publication ? 'badge badge-green' : 'badge badge-teal'}>
                            {item.consent_public_publication ? 'Public Opt-in' : 'Community'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 8px' }}>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleClaimItem(item.id)}
                              className="btn-primary"
                              style={{ padding: '4px 10px', fontSize: '11px', minHeight: '26px' }}
                            >
                              Claim & Review
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenHistory(item.id)}
                              className="btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '11px', minHeight: '26px' }}
                              title="View Revision History"
                            >
                              <History size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Audit History Modal */}
          {historyTargetId && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(5, 31, 32, 0.85)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              zIndex: 999,
            }}>
              <div className="glass-card" style={{ maxWidth: '640px', width: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#DAF1DE', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <History size={18} color="#8EB69B" />
                    <span>Audit & Revision Trail: Record #{historyTargetId}</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setHistoryTargetId(null);
                      setAuditHistory(null);
                    }}
                    style={{ background: 'transparent', border: 'none', color: '#DAF1DE', cursor: 'pointer' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {isLoadingHistory ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(218, 241, 222, 0.72)' }}>
                    <Loader2 size={18} className="spin-animate" style={{ display: 'inline', marginRight: '8px' }} />
                    Loading revision history...
                  </div>
                ) : auditHistory ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ background: 'rgba(5, 31, 32, 0.7)', padding: '12px', borderRadius: '8px', border: '1px solid #235347' }}>
                      <span style={{ fontSize: '11px', color: '#8EB69B', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                        RAW MACHINE TRANSCRIPT BASELINE:
                      </span>
                      <p style={{ margin: 0, fontSize: '13px', color: '#DAF1DE' }}>
                        {auditHistory.machine_transcript_text || 'No AI baseline.'}
                      </p>
                    </div>

                    <div style={{ background: 'rgba(142, 182, 155, 0.08)', padding: '12px', borderRadius: '8px', border: '1px solid #235347' }}>
                      <span style={{ fontSize: '11px', color: '#8EB69B', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                        CURRENT ACTIVE VERIFIED TEXT:
                      </span>
                      <p style={{ margin: 0, fontSize: '13px', color: '#DAF1DE' }}>
                        {auditHistory.current_transcript_text}
                      </p>
                    </div>

                    <div>
                      <span style={{ fontSize: '12px', color: '#8EB69B', fontWeight: '700', display: 'block', marginBottom: '8px' }}>
                        REVISION HISTORY LOG ({auditHistory.revisions.length} entries):
                      </span>
                      {auditHistory.revisions.length === 0 ? (
                        <p style={{ fontSize: '12px', color: 'rgba(218, 241, 222, 0.5)', fontStyle: 'italic' }}>
                          No text corrections recorded yet. Verified directly against oral master.
                        </p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {auditHistory.revisions.map(r => (
                            <div key={r.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#8EB69B', marginBottom: '4px' }}>
                                <span>Revision #{r.id} by {r.contributor_name} ({r.contributor_role})</span>
                                <span>{r.created_at.slice(0, 10)}</span>
                              </div>
                              <p style={{ margin: '4px 0', fontSize: '13px', color: '#DAF1DE' }}>
                                <strong>Suggested Text:</strong> "{r.suggested_text}"
                              </p>
                              {r.review_notes && (
                                <p style={{ margin: 0, fontSize: '11px', color: 'rgba(218, 241, 222, 0.7)' }}>
                                  Notes: {r.review_notes}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          VIEW 3: PILOT BENCHMARKS & METRICS (PRESERVED)
          ════════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'metrics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Pilot Field Submissions */}
          <section className="glass-card">
            <h3 style={{ fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#DAF1DE' }}>
              <FileText size={20} color="#8EB69B" />
              <span>Pilot Field Submissions</span>
            </h3>

            {pilotSubmissions.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'rgba(218, 241, 222, 0.5)', fontStyle: 'italic', padding: '16px 0' }}>
                No pilot evaluations recorded yet.
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--card-border)', textAlign: 'left', color: 'rgba(218, 241, 222, 0.72)' }}>
                      <th style={{ padding: '8px' }}>ID</th>
                      <th style={{ padding: '8px' }}>Recording</th>
                      <th style={{ padding: '8px' }}>Tester</th>
                      <th style={{ padding: '8px' }}>Consent</th>
                      <th style={{ padding: '8px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pilotSubmissions.map(s => (
                      <tr key={s.id} style={{ borderBottom: '1px solid rgba(35, 83, 71, 0.35)' }}>
                        <td style={{ padding: '8px', color: 'rgba(218, 241, 222, 0.72)' }}>#{s.id}</td>
                        <td style={{ padding: '8px', color: '#8EB69B' }}>Recording #{s.transcript_id}</td>
                        <td style={{ padding: '8px', color: '#DAF1DE' }}>{s.tester_name}</td>
                        <td style={{ padding: '8px' }}>
                          <span className={s.consent ? 'badge badge-green' : 'badge badge-red'}>
                            {s.consent ? '✓ Given' : 'No'}
                          </span>
                        </td>
                        <td style={{ padding: '8px' }}>
                          <span className={s.withdrawn ? 'badge badge-red' : 'badge badge-teal'}>
                            {s.withdrawn ? 'Withdrawn' : 'Active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Metrics Table */}
          <section className="glass-card">
            <h3 style={{ fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#DAF1DE' }}>
              <Award size={20} color="#8EB69B" />
              <span>Pilot Evaluation Metrics</span>
            </h3>

            {pilotMetrics.length === 0 ? (
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
                    {pilotMetrics.map(m => (
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

          {/* Live Linguistic Benchmark Calculator */}
          <section className="glass-card" style={{ border: '1px solid #235347' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: '#DAF1DE' }}>
                <Calculator size={20} color="#8EB69B" />
                <span>Deterministic WER & CER Benchmark Calculator</span>
              </h3>
              <span className="badge badge-green" style={{ fontSize: '11px' }}>
                Deterministic Levenshtein Metric • 0 Hallucinations
              </span>
            </div>

            {/* Presets */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <span style={{ fontSize: '12px', color: '#8EB69B', fontWeight: '600', alignSelf: 'center' }}>Presets:</span>
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

            {/* Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#8EB69B', marginBottom: '6px' }}>
                  Reference Text (Ground Truth Approved by Elders)
                </label>
                <textarea
                  rows={3}
                  className="textarea-field"
                  value={calcRef}
                  onChange={e => setCalcRef(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#8EB69B', marginBottom: '6px' }}>
                  Hypothesis Text (Raw AI Model Transcription)
                </label>
                <textarea
                  rows={3}
                  className="textarea-field"
                  value={calcHyp}
                  onChange={e => setCalcHyp(e.target.value)}
                />
              </div>
            </div>

            <button
              type="button"
              disabled={calcLoading}
              onClick={() => handleCalculateMetrics()}
              className="btn-primary"
              style={{ minWidth: '180px', marginBottom: '16px' }}
            >
              {calcLoading ? <Loader2 size={16} className="spin-animate" /> : <Calculator size={16} />}
              <span>Calculate Error Rates</span>
            </button>

            {/* Results display */}
            {calcResult && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', background: 'rgba(5, 31, 32, 0.7)', padding: '16px', borderRadius: '12px', border: '1px solid #235347' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#8EB69B', fontWeight: '700', display: 'block' }}>WORD ERROR RATE (WER)</span>
                  <span style={{ fontSize: '20px', fontWeight: '800', color: calcResult.wer === 0 ? '#22C55E' : '#DAF1DE' }}>
                    {calcResult.wer_percent.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#8EB69B', fontWeight: '700', display: 'block' }}>CHARACTER ERROR RATE (CER)</span>
                  <span style={{ fontSize: '20px', fontWeight: '800', color: calcResult.cer === 0 ? '#22C55E' : '#DAF1DE' }}>
                    {calcResult.cer_percent.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#8EB69B', fontWeight: '700', display: 'block' }}>CHRF F-SCORE</span>
                  <span style={{ fontSize: '20px', fontWeight: '800', color: '#8EB69B' }}>
                    {calcResult.chrf_percent.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
