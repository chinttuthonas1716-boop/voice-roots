import React, { useState, useEffect } from 'react';
import {
  WifiOff,
  CloudUpload,
  RefreshCw,
  Trash2,
  HardDrive,
  CheckCircle2,
  X,
  Info,
  Loader2
} from 'lucide-react';
import {
  OfflineRecordingItem,
  listOfflineRecordings,
  deleteOfflineRecording,
  clearAllOfflineData,
  syncSingleRecording,
  syncAllPendingRecordings,
  getStorageQuotaEstimate
} from '../utils/offlineStore';

interface OfflineManagerProps {
  apiBaseUrl?: string;
  onSyncCompleted?: () => void;
}

export const OfflineManager: React.FC<OfflineManagerProps> = ({
  apiBaseUrl = '',
  onSyncCompleted
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [pendingItems, setPendingItems] = useState<OfflineRecordingItem[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [quota, setQuota] = useState<{ usageBytes: number; quotaBytes: number; usagePercent: number }>({
    usageBytes: 0,
    quotaBytes: 0,
    usagePercent: 0,
  });

  // Track online / offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync when connection is restored
      triggerAutoSync();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    refreshPendingItems();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const refreshPendingItems = async () => {
    const items = await listOfflineRecordings();
    setPendingItems(items);
    const q = await getStorageQuotaEstimate();
    setQuota(q);
  };

  const triggerAutoSync = async () => {
    const items = await listOfflineRecordings();
    const unsynced = items.filter((i) => i.sync_status === 'local' || i.sync_status === 'failed');
    if (unsynced.length > 0) {
      await handleSyncAll();
    }
  };

  const handleSyncAll = async () => {
    if (isSyncing || !isOnline) return;
    setIsSyncing(true);
    try {
      await syncAllPendingRecordings(apiBaseUrl);
      await refreshPendingItems();
      if (onSyncCompleted) onSyncCompleted();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncSingle = async (item: OfflineRecordingItem) => {
    if (isSyncing || !isOnline) return;
    setIsSyncing(true);
    try {
      await syncSingleRecording(item, apiBaseUrl);
      await refreshPendingItems();
      if (onSyncCompleted) onSyncCompleted();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDelete = async (client_uuid: string) => {
    await deleteOfflineRecording(client_uuid);
    await refreshPendingItems();
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to delete all offline recordings? This cannot be undone.')) {
      await clearAllOfflineData();
      await refreshPendingItems();
    }
  };

  const unsyncedCount = pendingItems.filter((i) => i.sync_status !== 'synced').length;

  return (
    <>
      {/* Offline Status Banner */}
      {!isOnline && (
        <div style={{
          background: 'linear-gradient(90deg, #92400E, #78350F)',
          color: '#FEF3C7',
          padding: '10px 16px',
          fontSize: '13px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          position: 'sticky',
          top: 0,
          zIndex: 900,
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
        }}>
          <WifiOff size={16} />
          <span>
            <strong>Offline Mode:</strong> You are disconnected from the network.
            New recordings are securely preserved in your browser's local storage and will sync once reconnected.
          </span>
          {unsyncedCount > 0 && (
            <button
              onClick={() => setShowModal(true)}
              style={{
                background: '#FEF3C7',
                color: '#78350F',
                border: 'none',
                borderRadius: '6px',
                padding: '2px 8px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              View Queue ({unsyncedCount})
            </button>
          )}
        </div>
      )}

      {/* Floating Offline Queue Button (if items exist) */}
      {unsyncedCount > 0 && isOnline && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 800,
        }}>
          <button
            onClick={() => setShowModal(true)}
            style={{
              background: 'linear-gradient(135deg, #235347, #0B2B26)',
              border: '1px solid #8EB69B',
              color: '#DAF1DE',
              borderRadius: '24px',
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(5, 31, 32, 0.7)',
            }}
          >
            <CloudUpload size={16} color="#8EB69B" />
            <span>{unsyncedCount} Offline Item{unsyncedCount > 1 ? 's' : ''} Ready to Sync</span>
          </button>
        </div>
      )}

      {/* Offline Queue Modal */}
      {showModal && (
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
          zIndex: 1000,
          padding: '16px',
        }}>
          <div style={{
            background: '#0B2B26',
            border: '1px solid #235347',
            borderRadius: '20px',
            maxWidth: '620px',
            width: '100%',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(142, 182, 155, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CloudUpload size={20} color="#8EB69B" />
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#DAF1DE', margin: 0 }}>
                  Offline Storage & Synchronization
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#8EB69B', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Storage Meter & Disclaimer */}
            <div style={{ padding: '16px 24px', background: 'rgba(5, 31, 32, 0.4)', borderBottom: '1px solid rgba(142, 182, 155, 0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#8EB69B', marginBottom: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HardDrive size={14} /> Browser Storage Usage:
                </span>
                <span>
                  {(quota.usageBytes / (1024 * 1024)).toFixed(1)} MB / {(quota.quotaBytes / (1024 * 1024)).toFixed(0)} MB ({quota.usagePercent}%)
                </span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(100, Math.max(1, quota.usagePercent))}%`,
                  background: quota.usagePercent > 80 ? '#EF4444' : '#8EB69B',
                }} />
              </div>

              <div style={{ fontSize: '11px', color: 'rgba(218, 241, 222, 0.7)', marginTop: '10px', lineHeight: '1.4' }}>
                <Info size={12} style={{ display: 'inline', marginRight: '4px' }} />
                Offline recording preserves raw audio on your device. Transcription and translation require connecting to the Voice Roots server.
              </div>
            </div>

            {/* Items List */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pendingItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: 'rgba(218, 241, 222, 0.5)' }}>
                  <CheckCircle2 size={32} color="#8EB69B" style={{ margin: '0 auto 8px auto' }} />
                  <p style={{ fontSize: '14px', margin: 0 }}>No pending offline recordings</p>
                  <p style={{ fontSize: '12px', margin: '4px 0 0 0' }}>All recordings are synchronized with the Voice Roots server.</p>
                </div>
              ) : (
                pendingItems.map((item) => (
                  <div
                    key={item.client_uuid}
                    style={{
                      background: 'rgba(11, 43, 38, 0.5)',
                      border: '1px solid rgba(142, 182, 155, 0.2)',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#DAF1DE', marginBottom: '2px' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '11px', color: '#8EB69B' }}>
                        Language: {item.language.toUpperCase()} • Size: {(item.file_size_bytes / 1024).toFixed(0)} KB • Recorded: {new Date(item.created_at).toLocaleTimeString()}
                      </div>
                      {item.error_message && (
                        <div style={{ fontSize: '11px', color: '#FCA5A5', marginTop: '4px' }}>
                          ⚠️ Error: {item.error_message}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {item.sync_status === 'synced' ? (
                        <span style={{ fontSize: '11px', color: '#4ADE80', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                          <CheckCircle2 size={14} /> Synced
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSyncSingle(item)}
                          disabled={!isOnline || isSyncing}
                          title="Upload now"
                          style={{
                            background: 'rgba(142, 182, 155, 0.2)',
                            border: '1px solid #8EB69B',
                            color: '#DAF1DE',
                            borderRadius: '6px',
                            padding: '4px 10px',
                            fontSize: '11px',
                            cursor: !isOnline || isSyncing ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {isSyncing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                          Sync
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(item.client_uuid)}
                        title="Delete local file"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#F87171',
                          cursor: 'pointer',
                          padding: '4px',
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer Actions */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid rgba(142, 182, 155, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(5, 31, 32, 0.5)',
            }}>
              <button
                onClick={handleClearAll}
                disabled={pendingItems.length === 0}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#F87171',
                  fontSize: '12px',
                  cursor: pendingItems.length === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                Clear Local Storage
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    background: 'transparent',
                    border: '1px solid #235347',
                    color: '#DAF1DE',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
                <button
                  onClick={handleSyncAll}
                  disabled={!isOnline || unsyncedCount === 0 || isSyncing}
                  style={{
                    background: !isOnline || unsyncedCount === 0 ? 'rgba(142, 182, 155, 0.3)' : '#8EB69B',
                    color: '#051F20',
                    fontWeight: '700',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    cursor: !isOnline || unsyncedCount === 0 || isSyncing ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {isSyncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  Sync All ({unsyncedCount})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
