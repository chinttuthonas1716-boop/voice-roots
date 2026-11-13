"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  MapPin,
  Globe2,
  Users,
  Languages,
  CheckCircle2,
  Search,
  Sparkles,
  ShieldCheck,
  Building2,
  Info,
} from "lucide-react";
import {
  getAllStates,
  getDistrictsByState,
  getSubdistrictsByDistrict,
  getLocalitiesBySubdistrict,
  getAllLanguages,
  getLanguageVarieties,
  getCommunities,
  formatCardMetadata,
  type StateUT,
  type District,
  type Subdistrict,
  type Locality,
  type Language,
  type LanguageVariety,
  type Community,
} from "@/lib/indiaGeoData";

export interface GeoLocationSelection {
  country: string;
  stateId: string;
  stateName: string;
  districtId: string;
  districtName: string;
  subdistrictId: string;
  subdistrictName: string;
  localityId: string;
  localityName: string;
  communityId?: string;
  communityName?: string;
  languageId: string;
  languageName: string;
  languageVarietyId?: string;
  languageVarietyName?: string;
  formattedCardLabel: string;
  provenance: "OFFICIAL" | "CENSUS_DATA" | "FIELD_VERIFIED" | "COMMUNITY_REPORTED";
}

interface LocationLanguageCascadingPickerProps {
  initialLanguage?: string;
  initialState?: string;
  initialDistrict?: string;
  onSelectionChange?: (selection: GeoLocationSelection) => void;
  onLanguageDetectedConfirm?: (confirmedLang: string) => void;
}

export function LocationLanguageCascadingPicker({
  initialLanguage = "Telugu",
  initialState = "in-ap",
  initialDistrict = "in-ap-gun",
  onSelectionChange,
  onLanguageDetectedConfirm,
}: LocationLanguageCascadingPickerProps) {
  // Master lists
  const states = useMemo(() => getAllStates(), []);
  const allLanguages = useMemo(() => getAllLanguages(), []);

  // Selection states
  const [selectedStateId, setSelectedStateId] = useState<string>(initialState);
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>(initialDistrict);
  const [selectedSubdistrictId, setSelectedSubdistrictId] = useState<string>("");
  const [selectedLocalityId, setSelectedLocalityId] = useState<string>("");
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>("");
  const [selectedLanguageId, setSelectedLanguageId] = useState<string>(initialLanguage.toLowerCase());
  const [selectedVarietyId, setSelectedVarietyId] = useState<string>("");
  const [languageSearch, setLanguageSearch] = useState<string>("");

  // Derived lists
  const availableDistricts = useMemo(() => {
    return selectedStateId ? getDistrictsByState(selectedStateId) : [];
  }, [selectedStateId]);

  const availableSubdistricts = useMemo(() => {
    return selectedDistrictId ? getSubdistrictsByDistrict(selectedDistrictId) : [];
  }, [selectedDistrictId]);

  const availableLocalities = useMemo(() => {
    return selectedSubdistrictId ? getLocalitiesBySubdistrict(selectedSubdistrictId) : [];
  }, [selectedSubdistrictId]);

  const availableCommunities = useMemo(() => {
    return getCommunities(selectedStateId, selectedDistrictId);
  }, [selectedStateId, selectedDistrictId]);

  const filteredLanguages = useMemo(() => {
    if (!languageSearch.trim()) return allLanguages;
    const q = languageSearch.toLowerCase().trim();
    return allLanguages.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.nativeName.toLowerCase().includes(q) ||
        l.censusName.toLowerCase().includes(q) ||
        l.languageFamily.toLowerCase().includes(q)
    );
  }, [allLanguages, languageSearch]);

  const availableVarieties = useMemo(() => {
    return selectedLanguageId ? getLanguageVarieties(selectedLanguageId) : [];
  }, [selectedLanguageId]);

  // Active object references
  const currentState = states.find((s) => s.id === selectedStateId);
  const currentDistrict = availableDistricts.find((d) => d.id === selectedDistrictId);
  const currentSubdistrict = availableSubdistricts.find((sd) => sd.id === selectedSubdistrictId);
  const currentLocality = availableLocalities.find((l) => l.id === selectedLocalityId);
  const currentCommunity = availableCommunities.find((c) => c.id === selectedCommunityId);
  const currentLanguage =
    allLanguages.find(
      (l) =>
        l.id.toLowerCase() === selectedLanguageId.toLowerCase() ||
        l.name.toLowerCase() === selectedLanguageId.toLowerCase()
    ) || allLanguages[0];
  const currentVariety = availableVarieties.find((v) => v.id === selectedVarietyId);

  // Auto-select first subdistrict and locality if available when district changes
  useEffect(() => {
    if (availableSubdistricts.length > 0 && !selectedSubdistrictId) {
      setSelectedSubdistrictId(availableSubdistricts[0].id);
    }
  }, [availableSubdistricts, selectedSubdistrictId]);

  useEffect(() => {
    if (availableLocalities.length > 0 && !selectedLocalityId) {
      setSelectedLocalityId(availableLocalities[0].id);
    }
  }, [availableLocalities, selectedLocalityId]);

  // Formatted Card Metadata String
  const formattedCardLabel = useMemo(() => {
    return formatCardMetadata({
      sourceLanguage: currentLanguage?.name || initialLanguage,
      district: currentDistrict?.name,
      state: currentState?.name,
      region: currentLocality ? `${currentLocality.name}, ${currentDistrict?.name}` : undefined,
    });
  }, [currentLanguage, currentDistrict, currentState, currentLocality, initialLanguage]);

  // Notify parent on change
  useEffect(() => {
    if (onSelectionChange && currentLanguage && currentState) {
      onSelectionChange({
        country: "India (IND)",
        stateId: selectedStateId,
        stateName: currentState?.name || "Andhra Pradesh",
        districtId: selectedDistrictId,
        districtName: currentDistrict?.name || "Guntur",
        subdistrictId: selectedSubdistrictId,
        subdistrictName: currentSubdistrict?.name || "Mandal",
        localityId: selectedLocalityId,
        localityName: currentLocality?.name || "Village",
        communityId: selectedCommunityId || undefined,
        communityName: currentCommunity?.name || undefined,
        languageId: currentLanguage.id,
        languageName: currentLanguage.name,
        languageVarietyId: selectedVarietyId || undefined,
        languageVarietyName: currentVariety?.name || undefined,
        formattedCardLabel,
        provenance: currentLocality ? "FIELD_VERIFIED" : "OFFICIAL",
      });
    }
  }, [
    selectedStateId,
    selectedDistrictId,
    selectedSubdistrictId,
    selectedLocalityId,
    selectedCommunityId,
    selectedLanguageId,
    selectedVarietyId,
    formattedCardLabel,
  ]);

  return (
    <div className="space-y-6 rounded-3xl border border-white/10 bg-[#242942]/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
      {/* Header & Source Citations */}
      <div className="border-b border-white/10 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F9B17A]/15 text-[#F9B17A]">
              <Globe2 className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                India Geographic & Linguistic Master Hierarchy
              </h3>
              <p className="text-[11px] text-[#A9AEC5]">
                Official Government of India LGD (Ministry of Panchayati Raj) + Census 2011 Table C-16 Mother Tongue
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-400">
              LGD MoPR Verified
            </span>
            <span className="rounded-full bg-sky-500/10 border border-sky-500/30 px-2.5 py-0.5 text-[10px] font-mono font-bold text-sky-400">
              Census 2011 C-16
            </span>
          </div>
        </div>
      </div>

      {/* Live Card Metadata Preview */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-[#1e2238] to-amber-500/5 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#A9AEC5]">
              Live Story Card Label (Official Canonical Output)
            </div>
            <div className="text-lg sm:text-xl font-black tracking-tight text-[#F9B17A] uppercase font-mono">
              {formattedCardLabel}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#F9B17A] text-[#242942] px-3 py-1 text-xs font-bold font-mono">
              CARD BADGE
            </span>
          </div>
        </div>
      </div>

      {/* Cascading Form Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Country */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#D9D9E2] flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#F9B17A]" /> 1. Country
          </label>
          <div className="flex items-center justify-between min-h-11 rounded-xl border border-white/10 bg-white/5 px-3.5 text-xs text-white">
            <span className="font-semibold">🇮🇳 India (Republic of India)</span>
            <span className="font-mono text-[10px] text-[#A9AEC5]">LGD: IND</span>
          </div>
        </div>

        {/* State / UT */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#D9D9E2] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#F9B17A]" /> 2. State / Union Territory
          </label>
          <select
            value={selectedStateId}
            onChange={(e) => {
              setSelectedStateId(e.target.value);
              setSelectedDistrictId("");
              setSelectedSubdistrictId("");
              setSelectedLocalityId("");
            }}
            className="w-full min-h-11 rounded-xl border border-white/10 bg-[#1e2238] px-3 text-xs text-white outline-none focus:border-[#F9B17A]"
          >
            {states.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name} ({st.type === "UNION_TERRITORY" ? "UT" : "State"} · {st.officialCode})
              </option>
            ))}
          </select>
        </div>

        {/* District */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#D9D9E2] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#F9B17A]" /> 3. District
          </label>
          <select
            value={selectedDistrictId}
            onChange={(e) => {
              setSelectedDistrictId(e.target.value);
              setSelectedSubdistrictId("");
              setSelectedLocalityId("");
            }}
            className="w-full min-h-11 rounded-xl border border-white/10 bg-[#1e2238] px-3 text-xs text-white outline-none focus:border-[#F9B17A]"
          >
            <option value="">Select District</option>
            {availableDistricts.map((dist) => (
              <option key={dist.id} value={dist.id}>
                {dist.name} (Code: {dist.officialCode})
              </option>
            ))}
          </select>
        </div>

        {/* Subdistrict / Mandal / Taluk */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#D9D9E2] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#F9B17A]" /> 4. Mandal / Taluk / Tehsil
          </label>
          <select
            value={selectedSubdistrictId}
            onChange={(e) => {
              setSelectedSubdistrictId(e.target.value);
              setSelectedLocalityId("");
            }}
            className="w-full min-h-11 rounded-xl border border-white/10 bg-[#1e2238] px-3 text-xs text-white outline-none focus:border-[#F9B17A]"
          >
            <option value="">Select Mandal / Taluk</option>
            {availableSubdistricts.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name} ({sub.type} · {sub.officialCode})
              </option>
            ))}
          </select>
        </div>

        {/* Village / Locality */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#D9D9E2] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#F9B17A]" /> 5. Village / Locality
          </label>
          <select
            value={selectedLocalityId}
            onChange={(e) => setSelectedLocalityId(e.target.value)}
            className="w-full min-h-11 rounded-xl border border-white/10 bg-[#1e2238] px-3 text-xs text-white outline-none focus:border-[#F9B17A]"
          >
            <option value="">Select Village / Locality</option>
            {availableLocalities.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name} (LGD: {loc.officialCode})
              </option>
            ))}
          </select>
        </div>

        {/* Community / Clan */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#D9D9E2] flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#F9B17A]" /> 6. Community / Clan
          </label>
          <select
            value={selectedCommunityId}
            onChange={(e) => setSelectedCommunityId(e.target.value)}
            className="w-full min-h-11 rounded-xl border border-white/10 bg-[#1e2238] px-3 text-xs text-white outline-none focus:border-[#F9B17A]"
          >
            <option value="">Select Community / Clan</option>
            {availableCommunities.map((com) => (
              <option key={com.id} value={com.id}>
                {com.name} ({com.nativeName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Language & Variety Section */}
      <div className="pt-4 border-t border-white/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Languages className="w-4 h-4 text-[#F9B17A]" />
              Census 2011 C-16 Language Classification & Mother Tongue
            </h4>
            <p className="text-[11px] text-[#A9AEC5]">
              Select source tongue from 121 official Census languages + verified oral tribal varieties.
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#A9AEC5] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search 120+ languages..."
              value={languageSearch}
              onChange={(e) => setLanguageSearch(e.target.value)}
              className="w-full h-9 rounded-xl border border-white/10 bg-white/5 pl-8 pr-3 text-xs text-white placeholder:text-[#A9AEC5]/50 outline-none focus:border-[#F9B17A]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Language Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#D9D9E2]">
              7. Spoken Language ({filteredLanguages.length} available)
            </label>
            <select
              value={selectedLanguageId}
              onChange={(e) => {
                setSelectedLanguageId(e.target.value);
                setSelectedVarietyId("");
              }}
              className="w-full min-h-11 rounded-xl border border-white/10 bg-[#1e2238] px-3 text-xs text-white outline-none focus:border-[#F9B17A]"
            >
              {filteredLanguages.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name} ({lang.nativeName}) · {lang.officialStatus === "SCHEDULED_8" ? "8th Sched" : "Indigenous"} · {lang.languageFamily}
                </option>
              ))}
            </select>
          </div>

          {/* Variety / Dialect */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#D9D9E2]">
              8. Language Variety / Dialect
            </label>
            <select
              value={selectedVarietyId}
              onChange={(e) => setSelectedVarietyId(e.target.value)}
              className="w-full min-h-11 rounded-xl border border-white/10 bg-[#1e2238] px-3 text-xs text-white outline-none focus:border-[#F9B17A]"
            >
              <option value="">Standard Spoken Variety</option>
              {availableVarieties.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.nativeName})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
