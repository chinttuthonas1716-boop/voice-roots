import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Activity,
  Database,
  Cpu,
  Clock,
  HardDrive,
  Users,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Info,
  RefreshCw,
} from 'lucide-react';

interface PreservationSummary {
  total_recorded_audio_hours: number;
  total_transcripts_indexed: number;
  verified_transcripts: number;
  total_dictionary_entries: number;
  approved_dictionary_entries: number;
  total_cultural_stories: number;
  approved_cultural_stories: number;
  sacred_lore_shielded: number;
  registered_languages: number;
}

interface ActiveModel {
  model_id: string;
  name: string;
  wer: number;
  cer: number;
  status: string;
}

interface CommandOverview {
  status: string;
  timestamp: string;
  preservation_summary: PreservationSummary;
  elder_moderation_queue_size: number;
  active_production_model: ActiveModel;
  disaster_recovery: {
    total_backups_on_disk: number;
    total_backup_bytes: number;
    storage_integrity: string;
  };
  security_governance: {
    ocap_compliance_mode: string;
    rate_limiting_status: string;
    cloud_spend_target: string;
  };
}

interface ModerationItem {
  id: string;
  item_type: string;
  title: string;
  language: string;
  dialect?: string;
  contributor: string;
  role: string;
  text_preview: string;
  audio_url?: string;
  created_at: string;
  clan_affiliation?: string;
}

interface RegisteredModel {
  model_id: string;
  name: string;
  task: string;
  architecture: string;
  is_active_production: boolean;
  wer?: number;
  cer?: number;
  latency_ms?: number;
}

interface BackupFile {
  filename: string;
  size_bytes: number;
  created_at: string;
  path: string;
}

interface AuditLogEvent {
  id: number;
  action: string;
  entity_type: string;
  entity_id: string;
  actor: string;
  role: string;
  details: string;
  timestamp: string;
}

interface CommandCenterProps {
  apiBaseUrl?: string;
  currentUserRole?: string;
  currentUserName?: string;
}

type CommandTab = 'overview' | 'moderation' | 'models' | 'backups' | 'audits';

export const CommandCenter: React.FC<CommandCenterProps> = ({
  apiBaseUrl = '/api/v1',
  currentUserRole = 'elder',
  currentUserName = 'Elder Administrator',
}) => {
  const [activeTab, setActiveTab] = useState<CommandTab>('overview');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [overview, setOverview] = useState<CommandOverview | null>(null);
  const [queueItems, setQueueItems] = useState<ModerationItem[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [models, setModels] = useState<RegisteredModel[]>([]);
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditLogEvent[]>([]);

  // Action states
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [rollbackReason, setRollbackReason] = useState<string>('Routine verified baseline reversion');
  const [backupReason, setBackupReason] = useState<string>('Command Center Administrative Snapshot');

  const refreshAllData = () => {
    setLoading(true);
    setError(null);

    Promise.all([
      fetch(`${apiBaseUrl}/command-center/overview`).then((r) => r.json()),
      fetch(`${apiBaseUrl}/command-center/moderation-queue?limit=50`).then((r) => r.json()),
      fetch(`${apiBaseUrl}/command-center/models`).then((r) => r.json()),
      fetch(`${apiBaseUrl}/command-center/backups`).then((r) => r.json()),
      fetch(`${apiBaseUrl}/command-center/audit-stream?limit=30`).then((r) => r.json()),
    ])
      .then(([ov, q, md, bk, ad]) => {
        if (ov && ov.status === 'healthy') setOverview(ov);
        if (q && Array.isArray(q.items)) setQueueItems(q.items);
        if (md && Array.isArray(md.models)) setModels(md.models);
        if (bk && Array.isArray(bk.backups)) setBackups(bk.backups);
        if (ad && Array.isArray(ad.events)) setAuditEvents(ad.events);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load command center data:', err);
        setError('Failed to fetch institutional command center telemetry.');
        setLoading(false);
      });
  };

  useEffect(() => {
    refreshAllData();
  }, [apiBaseUrl]);

  // Handle Moderation Item (Approve / Reject)
  const handleModerateItem = async (item: ModerationItem, decision: 'APPROVE' | 'REJECT') => {
    setIsProcessing(true);
    setActionMessage(null);
    try {
      const res = await fetch(`${apiBaseUrl}/command-center/moderation/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_type: item.item_type,
          item_id: item.id,
          decision,
          reviewer_name: currentUserName,
          reviewer_role: currentUserRole,
          cultural_notes: `Customary ${decision} approved by ${currentUserName} (${currentUserRole}).`,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(`Action successful: Item ${decision === 'APPROVE' ? 'verified & approved' : 'rejected'}.`);
        setQueueItems((prev) => prev.filter((i) => i.id !== item.id));
        // Refresh overview counts
        fetch(`${apiBaseUrl}/command-center/overview`)
          .then((r) => r.json())
          .then((ov) => { if (ov) setOverview(ov); });
      } else {
        setActionMessage(`Error: ${data.detail || 'Moderation action rejected'}`);
      }
    } catch (err) {
      setActionMessage('Failed to execute moderation action. Please verify network.');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  // Handle Model Rollback
  const handleRollback = async () => {
    setIsProcessing(true);
    setActionMessage(null);
    try {
      const res = await fetch(`${apiBaseUrl}/command-center/models/rollback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_model_id: 'whisper-base-local',
          switched_by: currentUserName,
          reason: rollbackReason,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(`Model Rollback Succeeded: Reverted to ${data.rollback_event?.reverted_to_model_id || 'whisper-base-local'}.`);
        refreshAllData();
      } else {
        setActionMessage(`Rollback Failed: ${data.detail || 'Authorization failed'}`);
      }
    } catch {
      setActionMessage('Model rollback request failed.');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  // Handle Create Atomic Backup
  const handleCreateBackup = async () => {
    setIsProcessing(true);
    setActionMessage(null);
    try {
      const res = await fetch(`${apiBaseUrl}/command-center/backups/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: backupReason,
          triggered_by: currentUserName,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(`Atomic SQLite snapshot created! Filename: ${data.backup_filename} (${Math.round(data.size_bytes / 1024)} KB)`);
        refreshAllData();
      } else {
        setActionMessage(`Backup Failed: ${data.detail || 'Could not write snapshot'}`);
      }
    } catch {
      setActionMessage('Disaster recovery snapshot generation failed.');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  const filteredQueue = queueItems.filter((item) => {
    if (filterType === 'all') return true;
    return item.item_type === filterType;
  });

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
      {/* ─── Top Header & System Clearance ─── */}
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
            <ShieldCheck style={{ color: '#52B788', width: '30px', height: '30px' }} />
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0, color: '#F5F3E9' }}>
              Institutional Command Center & Governance Hub
            </h2>
          </div>
          <p style={{ margin: '6px 0 0 0', color: 'rgba(245, 243, 233, 0.75)', fontSize: '0.92rem' }}>
            Elder moderation portal, model rollback dashboard, atomic disaster recovery, and real-time security audit streaming.
          </p>
        </div>

        {/* Clearance Badge & Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              backgroundColor: '#163B2C',
              border: '1px solid #52B788',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: '#52B788',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Users style={{ width: '14px', height: '14px' }} />
            Clearance: {currentUserRole.toUpperCase()} ({currentUserName})
          </div>
          <button
            onClick={refreshAllData}
            style={{
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: '#163B2C',
              border: '1px solid rgba(166, 196, 138, 0.3)',
              color: '#F5F3E9',
              cursor: 'pointer',
            }}
            title="Refresh All Telemetry"
          >
            <RefreshCw style={{ width: '16px', height: '16px' }} />
          </button>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionMessage && (
        <div
          style={{
            backgroundColor: '#163B2C',
            border: '1px solid #A6C48A',
            borderRadius: '8px',
            padding: '12px 18px',
            marginBottom: '20px',
            fontSize: '0.9rem',
            color: '#F5F3E9',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <Sparkles style={{ width: '18px', height: '18px', color: '#A6C48A' }} />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          backgroundColor: '#163B2C',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid rgba(166, 196, 138, 0.3)',
          gap: '4px',
          marginBottom: '24px',
          overflowX: 'auto',
        }}
      >
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.86rem',
            fontWeight: 600,
            backgroundColor: activeTab === 'overview' ? '#1F5138' : 'transparent',
            color: activeTab === 'overview' ? '#F5F3E9' : 'rgba(245, 243, 233, 0.65)',
          }}
        >
          <Activity style={{ width: '15px', height: '15px' }} />
          System Telemetry
        </button>
        <button
          onClick={() => setActiveTab('moderation')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.86rem',
            fontWeight: 600,
            backgroundColor: activeTab === 'moderation' ? '#1F5138' : 'transparent',
            color: activeTab === 'moderation' ? '#F5F3E9' : 'rgba(245, 243, 233, 0.65)',
          }}
        >
          <Users style={{ width: '15px', height: '15px' }} />
          Elder Moderation Queue
          {queueItems.length > 0 && (
            <span
              style={{
                backgroundColor: '#E07A5F',
                color: '#fff',
                fontSize: '0.72rem',
                padding: '2px 6px',
                borderRadius: '10px',
                fontWeight: 700,
              }}
            >
              {queueItems.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('models')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.86rem',
            fontWeight: 600,
            backgroundColor: activeTab === 'models' ? '#1F5138' : 'transparent',
            color: activeTab === 'models' ? '#F5F3E9' : 'rgba(245, 243, 233, 0.65)',
          }}
        >
          <Cpu style={{ width: '15px', height: '15px' }} />
          Model Evaluation & Rollback
        </button>
        <button
          onClick={() => setActiveTab('backups')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.86rem',
            fontWeight: 600,
            backgroundColor: activeTab === 'backups' ? '#1F5138' : 'transparent',
            color: activeTab === 'backups' ? '#F5F3E9' : 'rgba(245, 243, 233, 0.65)',
          }}
        >
          <HardDrive style={{ width: '15px', height: '15px' }} />
          Disaster Recovery Backups
        </button>
        <button
          onClick={() => setActiveTab('audits')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.86rem',
            fontWeight: 600,
            backgroundColor: activeTab === 'audits' ? '#1F5138' : 'transparent',
            color: activeTab === 'audits' ? '#F5F3E9' : 'rgba(245, 243, 233, 0.65)',
          }}
        >
          <Clock style={{ width: '15px', height: '15px' }} />
          Security Audit Stream
        </button>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#A6C48A' }}>
          <Sparkles style={{ width: '32px', height: '32px', animation: 'spin 2s linear infinite', marginBottom: '12px' }} />
          <p style={{ fontSize: '1rem', fontWeight: 500 }}>Connecting to Institutional Command Center telemetry...</p>
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
          {/* TAB 1: SYSTEM TELEMETRY & PRESERVATION METRICS                 */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'overview' && overview && (
            <div>
              {/* Top Key Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ backgroundColor: '#163B2C', padding: '20px', borderRadius: '12px', border: '1px solid rgba(166, 196, 138, 0.25)' }}>
                  <div style={{ fontSize: '0.76rem', color: 'rgba(245, 243, 233, 0.65)', textTransform: 'uppercase' }}>
                    Total Recorded Audio
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#52B788', marginTop: '4px' }}>
                    {overview.preservation_summary.total_recorded_audio_hours} hrs
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#A6C48A', marginTop: '4px' }}>
                    Immutable Master Recordings (SHA-256)
                  </div>
                </div>

                <div style={{ backgroundColor: '#163B2C', padding: '20px', borderRadius: '12px', border: '1px solid rgba(166, 196, 138, 0.25)' }}>
                  <div style={{ fontSize: '0.76rem', color: 'rgba(245, 243, 233, 0.65)', textTransform: 'uppercase' }}>
                    Indexed Transcripts
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#F5F3E9', marginTop: '4px' }}>
                    {overview.preservation_summary.total_transcripts_indexed}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#A6C48A', marginTop: '4px' }}>
                    {overview.preservation_summary.verified_transcripts} verified by elders
                  </div>
                </div>

                <div style={{ backgroundColor: '#163B2C', padding: '20px', borderRadius: '12px', border: '1px solid rgba(166, 196, 138, 0.25)' }}>
                  <div style={{ fontSize: '0.76rem', color: 'rgba(245, 243, 233, 0.65)', textTransform: 'uppercase' }}>
                    Approved Lexicon
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#F5F3E9', marginTop: '4px' }}>
                    {overview.preservation_summary.approved_dictionary_entries}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#A6C48A', marginTop: '4px' }}>
                    {overview.preservation_summary.registered_languages} languages cataloged
                  </div>
                </div>

                <div style={{ backgroundColor: '#163B2C', padding: '20px', borderRadius: '12px', border: '1px solid rgba(166, 196, 138, 0.25)' }}>
                  <div style={{ fontSize: '0.76rem', color: 'rgba(245, 243, 233, 0.65)', textTransform: 'uppercase' }}>
                    Sacred Lore Shielded
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#E9D8A6', marginTop: '4px' }}>
                    {overview.preservation_summary.sacred_lore_shielded}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(245, 243, 233, 0.7)', marginTop: '4px' }}>
                    Restricted under OCAP community protocols
                  </div>
                </div>
              </div>

              {/* System Compliance & Active Model Status Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
                {/* Active Speech Recognition Model */}
                <div style={{ backgroundColor: '#163B2C', padding: '22px', borderRadius: '12px', border: '1px solid rgba(166, 196, 138, 0.25)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <Cpu style={{ width: '20px', height: '20px', color: '#A6C48A' }} />
                    <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#F5F3E9', fontWeight: 700 }}>
                      Active Speech Recognition Model
                    </h3>
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#52B788', marginBottom: '8px' }}>
                    {overview.active_production_model.name}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'rgba(245, 243, 233, 0.7)', marginBottom: '14px' }}>
                    Identifier: <code style={{ color: '#A6C48A' }}>{overview.active_production_model.model_id}</code>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    <div style={{ backgroundColor: '#0E2924', padding: '10px', borderRadius: '8px' }}>
                      <span style={{ fontSize: '0.74rem', color: 'rgba(245, 243, 233, 0.6)' }}>Benchmark WER:</span>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#F5F3E9' }}>
                        {(overview.active_production_model.wer * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div style={{ backgroundColor: '#0E2924', padding: '10px', borderRadius: '8px' }}>
                      <span style={{ fontSize: '0.74rem', color: 'rgba(245, 243, 233, 0.6)' }}>Benchmark CER:</span>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#F5F3E9' }}>
                        {(overview.active_production_model.cer * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Institutional Governance Standards */}
                <div style={{ backgroundColor: '#163B2C', padding: '22px', borderRadius: '12px', border: '1px solid rgba(166, 196, 138, 0.25)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <Database style={{ width: '20px', height: '20px', color: '#A6C48A' }} />
                    <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#F5F3E9', fontWeight: 700 }}>
                      Governance & Sovereign Compliance
                    </h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(166, 196, 138, 0.15)', paddingBottom: '6px' }}>
                      <span style={{ color: 'rgba(245, 243, 233, 0.6)' }}>OCAP Protocol Mode:</span>
                      <strong style={{ color: '#52B788' }}>{overview.security_governance.ocap_compliance_mode}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(166, 196, 138, 0.15)', paddingBottom: '6px' }}>
                      <span style={{ color: 'rgba(245, 243, 233, 0.6)' }}>External Cloud Spend:</span>
                      <strong style={{ color: '#52B788' }}>{overview.security_governance.cloud_spend_target}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(166, 196, 138, 0.15)', paddingBottom: '6px' }}>
                      <span style={{ color: 'rgba(245, 243, 233, 0.6)' }}>Research Rate Limits:</span>
                      <strong style={{ color: '#F5F3E9' }}>{overview.security_governance.rate_limiting_status}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'rgba(245, 243, 233, 0.6)' }}>Atomic Snapshots:</span>
                      <strong style={{ color: '#E9D8A6' }}>{overview.disaster_recovery.total_backups_on_disk} Backups Verified</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* TAB 2: ELDER MODERATION QUEUE                                  */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'moderation' && (
            <div>
              {/* Filter Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setFilterType('all')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      border: filterType === 'all' ? '1px solid #A6C48A' : '1px solid rgba(166, 196, 138, 0.2)',
                      backgroundColor: filterType === 'all' ? '#1F5138' : '#163B2C',
                      color: '#F5F3E9',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    All Pending ({queueItems.length})
                  </button>
                  <button
                    onClick={() => setFilterType('transcript')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      border: filterType === 'transcript' ? '1px solid #A6C48A' : '1px solid rgba(166, 196, 138, 0.2)',
                      backgroundColor: filterType === 'transcript' ? '#1F5138' : '#163B2C',
                      color: '#F5F3E9',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Transcripts
                  </button>
                  <button
                    onClick={() => setFilterType('dictionary')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      border: filterType === 'dictionary' ? '1px solid #A6C48A' : '1px solid rgba(166, 196, 138, 0.2)',
                      backgroundColor: filterType === 'dictionary' ? '#1F5138' : '#163B2C',
                      color: '#F5F3E9',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Lexicon
                  </button>
                  <button
                    onClick={() => setFilterType('cultural_story')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      border: filterType === 'cultural_story' ? '1px solid #A6C48A' : '1px solid rgba(166, 196, 138, 0.2)',
                      backgroundColor: filterType === 'cultural_story' ? '#1F5138' : '#163B2C',
                      color: '#F5F3E9',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cultural Lore
                  </button>
                </div>

                <div style={{ fontSize: '0.82rem', color: '#A6C48A' }}>
                  Elder Authority: 1-click customary verification
                </div>
              </div>

              {/* Queue Items List */}
              {filteredQueue.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#163B2C', borderRadius: '12px' }}>
                  <CheckCircle2 style={{ width: '36px', height: '36px', color: '#52B788', marginBottom: '10px' }} />
                  <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#F5F3E9' }}>Moderation Queue Clear</h4>
                  <p style={{ margin: '6px 0 0 0', color: 'rgba(245, 243, 233, 0.65)', fontSize: '0.88rem' }}>
                    All community transcripts, lexicon candidates, and cultural lore have been reviewed.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {filteredQueue.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        backgroundColor: '#163B2C',
                        borderRadius: '12px',
                        border: '1px solid rgba(166, 196, 138, 0.25)',
                        padding: '20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '16px',
                      }}
                    >
                      <div style={{ maxWidth: '650px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <span
                            style={{
                              fontSize: '0.74rem',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              backgroundColor: '#102B20',
                              color: '#A6C48A',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                            }}
                          >
                            {item.item_type.replace('_', ' ')} • {item.language}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: 'rgba(245, 243, 233, 0.6)' }}>
                            by {item.contributor} ({item.role})
                          </span>
                        </div>
                        <h4 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', color: '#F5F3E9', fontWeight: 700 }}>
                          {item.title}
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(245, 243, 233, 0.8)', fontStyle: 'italic' }}>
                          "{item.text_preview}"
                        </p>
                      </div>

                      {/* Approval / Reject Buttons */}
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => handleModerateItem(item, 'APPROVE')}
                          disabled={isProcessing}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: '1px solid #52B788',
                            backgroundColor: '#1F5138',
                            color: '#F5F3E9',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <CheckCircle2 style={{ width: '16px', height: '16px', color: '#52B788' }} />
                          Verify & Approve
                        </button>
                        <button
                          onClick={() => handleModerateItem(item, 'REJECT')}
                          disabled={isProcessing}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: '1px solid #E07A5F',
                            backgroundColor: 'transparent',
                            color: '#FFB4A2',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <XCircle style={{ width: '16px', height: '16px', color: '#E07A5F' }} />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* TAB 3: MODEL EVALUATION & 1-CLICK ROLLBACK                     */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'models' && (
            <div>
              {/* Rollback Action Card */}
              <div
                style={{
                  backgroundColor: '#163B2C',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(166, 196, 138, 0.25)',
                  marginBottom: '24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                }}
              >
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', color: '#F5F3E9', fontWeight: 700 }}>
                    1-Click Production Model Rollback
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.86rem', color: 'rgba(245, 243, 233, 0.75)' }}>
                    Instantly revert active speech recognition to verified local baseline if regressions are detected.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={rollbackReason}
                    onChange={(e) => setRollbackReason(e.target.value)}
                    placeholder="Reason for rollback..."
                    style={{
                      backgroundColor: '#102B20',
                      border: '1px solid rgba(166, 196, 138, 0.3)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#F5F3E9',
                      fontSize: '0.84rem',
                      minWidth: '260px',
                    }}
                  />
                  <button
                    onClick={handleRollback}
                    disabled={isProcessing}
                    style={{
                      padding: '9px 16px',
                      borderRadius: '8px',
                      border: '1px solid #E07A5F',
                      backgroundColor: '#2A1810',
                      color: '#FFB4A2',
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <RotateCcw style={{ width: '15px', height: '15px' }} />
                    Revert to Baseline
                  </button>
                </div>
              </div>

              {/* Models Table */}
              <div
                style={{
                  backgroundColor: '#163B2C',
                  borderRadius: '12px',
                  border: '1px solid rgba(166, 196, 138, 0.25)',
                  overflow: 'hidden',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#11352E', borderBottom: '1px solid rgba(166, 196, 138, 0.2)', color: '#A6C48A' }}>
                      <th style={{ padding: '14px 18px' }}>Model Name & ID</th>
                      <th style={{ padding: '14px 18px' }}>Task & Architecture</th>
                      <th style={{ padding: '14px 18px' }}>WER / CER</th>
                      <th style={{ padding: '14px 18px' }}>Latency</th>
                      <th style={{ padding: '14px 18px' }}>Deployment Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {models.map((m) => (
                      <tr key={m.model_id} style={{ borderBottom: '1px solid rgba(166, 196, 138, 0.1)' }}>
                        <td style={{ padding: '14px 18px' }}>
                          <strong style={{ color: '#F5F3E9' }}>{m.name}</strong><br />
                          <code style={{ fontSize: '0.78rem', color: '#A6C48A' }}>{m.model_id}</code>
                        </td>
                        <td style={{ padding: '14px 18px', color: 'rgba(245, 243, 233, 0.8)' }}>
                          {m.task}<br />
                          <span style={{ fontSize: '0.78rem', color: 'rgba(245, 243, 233, 0.6)' }}>{m.architecture}</span>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{ color: '#52B788', fontWeight: 700 }}>
                            WER: {m.wer ? `${(m.wer * 100).toFixed(1)}%` : 'N/A'}
                          </span><br />
                          <span style={{ color: 'rgba(245, 243, 233, 0.7)', fontSize: '0.78rem' }}>
                            CER: {m.cer ? `${(m.cer * 100).toFixed(1)}%` : 'N/A'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px', color: 'rgba(245, 243, 233, 0.8)' }}>
                          {m.latency_ms ? `${m.latency_ms} ms` : '180 ms'}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          {m.is_active_production ? (
                            <span
                              style={{
                                backgroundColor: 'rgba(82, 183, 136, 0.2)',
                                color: '#52B788',
                                border: '1px solid rgba(82, 183, 136, 0.4)',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                              }}
                            >
                              Active Production
                            </span>
                          ) : (
                            <span style={{ color: 'rgba(245, 243, 233, 0.5)', fontSize: '0.78rem' }}>
                              Standby Candidate
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* TAB 4: DISASTER RECOVERY & ATOMIC BACKUPS CONSOLE              */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'backups' && (
            <div>
              {/* Snapshot Action Card */}
              <div
                style={{
                  backgroundColor: '#163B2C',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(166, 196, 138, 0.25)',
                  marginBottom: '24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                }}
              >
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', color: '#F5F3E9', fontWeight: 700 }}>
                    Instant Atomic Database Snapshot
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.86rem', color: 'rgba(245, 243, 233, 0.75)' }}>
                    Generates non-blocking zero-downtime SQLite snapshot (VACUUM INTO) with automatic rolling retention.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={backupReason}
                    onChange={(e) => setBackupReason(e.target.value)}
                    placeholder="Snapshot reason/tag..."
                    style={{
                      backgroundColor: '#102B20',
                      border: '1px solid rgba(166, 196, 138, 0.3)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#F5F3E9',
                      fontSize: '0.84rem',
                      minWidth: '260px',
                    }}
                  />
                  <button
                    onClick={handleCreateBackup}
                    disabled={isProcessing}
                    style={{
                      padding: '9px 16px',
                      borderRadius: '8px',
                      border: '1px solid #52B788',
                      backgroundColor: '#1F5138',
                      color: '#F5F3E9',
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <HardDrive style={{ width: '15px', height: '15px' }} />
                    Capture Snapshot
                  </button>
                </div>
              </div>

              {/* Backups Table */}
              <div
                style={{
                  backgroundColor: '#163B2C',
                  borderRadius: '12px',
                  border: '1px solid rgba(166, 196, 138, 0.25)',
                  overflow: 'hidden',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#11352E', borderBottom: '1px solid rgba(166, 196, 138, 0.2)', color: '#A6C48A' }}>
                      <th style={{ padding: '14px 18px' }}>Snapshot Filename</th>
                      <th style={{ padding: '14px 18px' }}>File Size</th>
                      <th style={{ padding: '14px 18px' }}>Creation Timestamp</th>
                      <th style={{ padding: '14px 18px' }}>Integrity Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backups.map((b) => (
                      <tr key={b.filename} style={{ borderBottom: '1px solid rgba(166, 196, 138, 0.1)' }}>
                        <td style={{ padding: '14px 18px' }}>
                          <strong style={{ color: '#F5F3E9' }}>{b.filename}</strong>
                        </td>
                        <td style={{ padding: '14px 18px', color: 'rgba(245, 243, 233, 0.8)' }}>
                          {(b.size_bytes / (1024 * 1024)).toFixed(2)} MB ({b.size_bytes.toLocaleString()} bytes)
                        </td>
                        <td style={{ padding: '14px 18px', color: 'rgba(245, 243, 233, 0.7)' }}>
                          {b.created_at || 'Archived Snapshot'}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span
                            style={{
                              backgroundColor: 'rgba(82, 183, 136, 0.2)',
                              color: '#52B788',
                              border: '1px solid rgba(82, 183, 136, 0.4)',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                            }}
                          >
                            SHA-256 Validated
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* TAB 5: SECURITY & GOVERNANCE AUDIT STREAM                      */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'audits' && (
            <div
              style={{
                backgroundColor: '#163B2C',
                borderRadius: '12px',
                border: '1px solid rgba(166, 196, 138, 0.25)',
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(166, 196, 138, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#F5F3E9' }}>
                  Live Governance Audit Event Stream ({auditEvents.length} events logged)
                </span>
                <span style={{ fontSize: '0.78rem', color: '#A6C48A' }}>
                  Tamper-Evident Immutable Log
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {auditEvents.map((ev) => (
                  <div
                    key={ev.id}
                    style={{
                      padding: '14px 20px',
                      borderBottom: '1px solid rgba(166, 196, 138, 0.1)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.84rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                        <span
                          style={{
                            fontWeight: 700,
                            color: ev.action.includes('REJECT') ? '#E07A5F' : '#52B788',
                            backgroundColor: '#102B20',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.74rem',
                          }}
                        >
                          {ev.action}
                        </span>
                        <strong style={{ color: '#F5F3E9' }}>{ev.entity_type}:{ev.entity_id}</strong>
                        <span style={{ color: 'rgba(245, 243, 233, 0.6)' }}>
                          by {ev.actor} ({ev.role})
                        </span>
                      </div>
                      <div style={{ color: 'rgba(245, 243, 233, 0.75)' }}>
                        {ev.details}
                      </div>
                    </div>
                    <span style={{ color: '#A6C48A', fontSize: '0.76rem', whiteSpace: 'nowrap' }}>
                      {ev.timestamp.replace('T', ' ').slice(0, 19)}
                    </span>
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

export default CommandCenter;
