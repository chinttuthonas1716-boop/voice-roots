import React, { useState, useEffect } from 'react';
import {
  ResearchApiKey,
  ResearchCorpusManifest,
} from '../types';

interface ResearchPortalProps {
  onBack?: () => void;
}

export const ResearchPortal: React.FC<ResearchPortalProps> = () => {
  const [manifest, setManifest] = useState<ResearchCorpusManifest | null>(null);
  const [apiKeys, setApiKeys] = useState<ResearchApiKey[]>([]);
  const [activeToken, setActiveToken] = useState<string>('vr_res_ciil_indigenous_linguistics_2026_auth');
  const [exportLanguage, setExportLanguage] = useState<string>('All');
  
  // Registration form
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [newlyIssuedKey, setNewlyIssuedKey] = useState<{ raw_api_key: string; key_id: string } | null>(null);

  // Export preview state
  const [exportedData, setExportedData] = useState<any | null>(null);
  const [exportType, setExportType] = useState<'corpus' | 'lexicon'>('corpus');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchManifest();
    fetchKeys();
  }, []);

  const fetchManifest = async () => {
    try {
      const resp = await fetch('/api/v1/research/manifest');
      if (resp.ok) {
        const data = await resp.json();
        setManifest(data);
      }
    } catch (e: any) {
      console.error('Failed to fetch manifest', e);
    }
  };

  const fetchKeys = async () => {
    try {
      const resp = await fetch('/api/v1/research/keys');
      if (resp.ok) {
        const data = await resp.json();
        setApiKeys(data.keys || []);
      }
    } catch (e: any) {
      console.error('Failed to fetch research keys', e);
    }
  };

  const handleRegisterKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || !contactEmail.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const resp = await fetch('/api/v1/research/keys/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_name: orgName.trim(),
          contact_email: contactEmail.trim(),
          scopes: ['read:registry', 'read:vocabulary', 'read:transcripts', 'read:metadata', 'export:corpus'],
          rate_limit_per_minute: 120,
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        setNewlyIssuedKey({
          raw_api_key: data.raw_api_key,
          key_id: data.key_id,
        });
        setActiveToken(data.raw_api_key);
        setStatusMsg('Institutional API credential generated! Copy and store token securely.');
        fetchKeys();
        setOrgName('');
        setContactEmail('');
      } else {
        setErrorMsg('Failed to register research key.');
      }
    } catch (err: any) {
      setErrorMsg('Network error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCorpus = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setExportedData(null);
    setExportType('corpus');
    try {
      const langParam = exportLanguage !== 'All' ? `?language=${encodeURIComponent(exportLanguage)}` : '';
      const resp = await fetch(`/api/v1/research/corpus/export${langParam}`, {
        headers: { 'X-Research-Token': activeToken },
      });

      if (resp.ok) {
        const data = await resp.json();
        setExportedData(data);
        setStatusMsg(`Successfully retrieved ${data.count} corpus records cleared for research.`);
      } else {
        const err = await resp.json();
        setErrorMsg(`Export denied (Status ${resp.status}): ${err.detail || 'Unauthorized'}`);
      }
    } catch (e: any) {
      setErrorMsg('Export failed: ' + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportLexicon = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setExportedData(null);
    setExportType('lexicon');
    try {
      const langParam = exportLanguage !== 'All' ? `?language=${encodeURIComponent(exportLanguage)}` : '';
      const resp = await fetch(`/api/v1/research/lexicon/export${langParam}`, {
        headers: { 'X-Research-Token': activeToken },
      });

      if (resp.ok) {
        const data = await resp.json();
        setExportedData(data);
        setStatusMsg(`Successfully retrieved ${data.count} computational lexicon entries.`);
      } else {
        const err = await resp.json();
        setErrorMsg(`Lexicon export denied (Status ${resp.status}): ${err.detail || 'Unauthorized'}`);
      }
    } catch (e: any) {
      setErrorMsg('Lexicon export failed: ' + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadJson = () => {
    if (!exportedData) return;
    const blob = new Blob([JSON.stringify(exportedData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voice_roots_${exportType}_export_${exportLanguage.toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/30 border border-blue-400/40 rounded-full text-xs font-semibold text-blue-200 mb-3 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            Milestone 20 • Institutional Research API & Interoperability
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Linguistic Research & Corpus Interoperability
          </h1>
          <p className="mt-3 text-blue-100 text-base leading-relaxed">
            Standardized, token-scoped access for universities, linguistic researchers, and heritage archives.
            Fully compliant with OCAP Indigenous Data Sovereignty boundaries.
          </p>
        </div>
      </div>

      {statusMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between">
          <span>{statusMsg}</span>
          <button onClick={() => setStatusMsg(null)} className="text-emerald-600 font-bold hover:underline">Dismiss</button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-rose-600 font-bold hover:underline">Dismiss</button>
        </div>
      )}

      {/* Manifest Overview Metrics */}
      {manifest && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
            <div>
              <span className="text-xs font-mono font-bold text-blue-600 uppercase">
                Corpus Release {manifest.corpus_version}
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">Academic Release Manifest</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold border border-emerald-300">
                ✓ OCAP Sovereignty Certified
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-mono font-semibold">
                {manifest.license}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-slate-500">Total Languages</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{manifest.total_languages}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-slate-500">Documented Transcripts</div>
              <div className="text-2xl font-black text-blue-700 mt-1">{manifest.total_transcripts}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-slate-500">Total Audio Hours</div>
              <div className="text-2xl font-black text-indigo-700 mt-1">{manifest.total_audio_hours} hrs</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-slate-500">Accredited Partners</div>
              <div className="text-2xl font-black text-slate-800 mt-1">{apiKeys.length}</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Token & Export Controls vs Data Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Token Configuration & Key Management */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
            <h2 className="text-base font-bold text-slate-900">Research Authorization</h2>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 block">Active API Bearer Token:</label>
              <input
                type="text"
                value={activeToken}
                onChange={(e) => setActiveToken(e.target.value)}
                placeholder="Enter vr_res_..."
                className="w-full font-mono text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500"
              />
              <div className="text-[11px] text-slate-500">
                Default: Central Institute of Indian Languages (CIIL) pre-authenticated token.
              </div>
            </div>

            {/* Quick preset selector */}
            <div className="pt-2 border-t border-slate-100 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Preset Tokens:</span>
              <div className="space-y-1 text-xs">
                <button
                  onClick={() => setActiveToken('vr_res_ciil_indigenous_linguistics_2026_auth')}
                  className="w-full text-left p-1.5 rounded hover:bg-slate-100 text-slate-700 truncate"
                >
                  🏛 CIIL (All Scopes)
                </button>
                <button
                  onClick={() => setActiveToken('vr_res_osmania_telangana_languages_2026_auth')}
                  className="w-full text-left p-1.5 rounded hover:bg-slate-100 text-slate-700 truncate"
                >
                  🏛 Osmania University
                </button>
                <button
                  onClick={() => setActiveToken('vr_res_tcrti_tribal_cultural_heritage_2026_auth')}
                  className="w-full text-left p-1.5 rounded hover:bg-slate-100 text-slate-700 truncate"
                >
                  🏛 TCRTI Tribal Research
                </button>
              </div>
            </div>

            {/* Issue New Key Toggle */}
            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowRegisterForm(!showRegisterForm)}
                className="text-xs font-bold text-blue-600 hover:text-blue-800"
              >
                {showRegisterForm ? '— Hide Credential Form' : '+ Register New Institution'}
              </button>

              {showRegisterForm && (
                <form onSubmit={handleRegisterKey} className="mt-3 space-y-3 pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Institution Name:</label>
                    <input
                      type="text"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="e.g., Deccan College Linguistics"
                      required
                      className="w-full p-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Academic Email:</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="dept@university.edu"
                      required
                      className="w-full p-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
                  >
                    Generate Token
                  </button>
                </form>
              )}
            </div>

            {/* Newly Issued Key Alert */}
            {newlyIssuedKey && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-xs space-y-1.5 text-amber-950">
                <div className="font-bold">⚠️ Store Token Immediately:</div>
                <div className="p-2 bg-white rounded font-mono text-[11px] break-all border border-amber-200 select-all">
                  {newlyIssuedKey.raw_api_key}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (2 cols): Export Operations & Payload Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Standardized Interoperability Exports</h2>
                <div className="text-xs text-slate-500 mt-0.5">
                  Datasets formatted for computational morphology, CoNLL-U annotation, and acoustic modeling.
                </div>
              </div>

              {/* Language filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Language:</span>
                <select
                  value={exportLanguage}
                  onChange={(e) => setExportLanguage(e.target.value)}
                  className="text-xs p-1.5 border border-slate-200 rounded-lg bg-slate-50 font-medium"
                >
                  <option value="All">All Languages</option>
                  <option value="Gondi">Gondi</option>
                  <option value="Koya">Koya</option>
                  <option value="Santhali">Santhali</option>
                  <option value="Lambadi">Lambadi</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleExportCorpus}
                disabled={isLoading}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-transform active:scale-95"
              >
                <span>📦</span> Export Research Corpus (JSON)
              </button>
              <button
                onClick={handleExportLexicon}
                disabled={isLoading}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-transform active:scale-95"
              >
                <span>📖</span> Export Computational Lexicon (IPA)
              </button>
              {exportedData && (
                <button
                  onClick={downloadJson}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 ml-auto"
                >
                  <span>⬇️</span> Download JSON File
                </button>
              )}
            </div>

            {/* Data Preview */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                <span>Payload Inspector {exportedData ? `(${exportedData.count} items)` : ''}</span>
                {exportedData && <span className="font-mono text-slate-400">format: json</span>}
              </div>

              <div className="bg-slate-950 text-slate-200 rounded-xl p-4 font-mono text-xs max-h-96 overflow-y-auto">
                {exportedData ? (
                  <pre>{JSON.stringify(exportedData, null, 2)}</pre>
                ) : (
                  <div className="text-slate-500 italic py-10 text-center">
                    Select "Export Research Corpus" or "Export Computational Lexicon" above to preview data.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
