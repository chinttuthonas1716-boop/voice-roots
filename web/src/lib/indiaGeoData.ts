/**
 * Voice Roots — India Master Geographic & Oral Language Service
 * 
 * Sources:
 * - Local Government Directory (LGD), Ministry of Panchayati Raj
 * - Census of India 2011: Table C-16 Population by Mother Tongue & Language Atlas
 */

import countriesData from "../../../data/india/countries.json";
import statesData from "../../../data/india/states.json";
import districtsData from "../../../data/india/districts.json";
import subdistrictsData from "../../../data/india/subdistricts.json";
import localitiesData from "../../../data/india/localities.json";
import languagesData from "../../../data/india/languages.json";
import varietiesData from "../../../data/india/language_varieties.json";
import communitiesData from "../../../data/india/communities.json";
import languageLocationsData from "../../../data/india/language_locations.json";
import dataSourcesData from "../../../data/india/data_sources.json";

import motherTonguesData from "../../../data/india/mother_tongues.json";

export interface Country {
  id: string;
  name: string;
  officialName: string;
  iso2: string;
  iso3: string;
  capital: string;
  sourceId: string;
}

export interface StateUT {
  id: string;
  countryId: string;
  name: string;
  officialCode: string;
  type: "STATE" | "UNION_TERRITORY";
  capital: string;
}

export interface District {
  id: string;
  stateId: string;
  name: string;
  officialCode: string;
}

export interface Subdistrict {
  id: string;
  districtId: string;
  name: string;
  officialCode: string;
  type: "MANDAL" | "TALUK" | "TEHSIL" | "BLOCK" | "SUBDIVISION" | "OTHER";
}

export interface Locality {
  id: string;
  countryId: string;
  stateId: string;
  districtId: string;
  subdistrictId: string;
  name: string;
  officialCode: string;
  type: "VILLAGE" | "HAMLET" | "TOWN" | "CITY" | "LOCALITY" | "OTHER";
  latitude: number;
  longitude: number;
  sourceId: string;
  sourceYear: number;
  languageVerificationStatus: "OFFICIAL" | "FIELD_VERIFIED" | "COMMUNITY_REPORTED" | "UNVERIFIED";
}

export interface Language {
  id: string;
  name: string;
  nativeName: string;
  iso639_1: string | null;
  iso639_3: string;
  languageFamily: string;
  languageGroup: string;
  censusCode: string;
  censusName: string;
  officialStatus: "SCHEDULED_8" | "NON_SCHEDULED" | "NON_SCHEDULED_CENSUS_SUBGROUP" | "RESIDUAL" | string;
  description: string;
  sourceId: string;
  isScheduled?: boolean;
  population_2011?: number;
  male_population_2011?: number;
  female_population_2011?: number;
  rural_population_2011?: number;
  urban_population_2011?: number;
  hasRecording?: boolean;
  recordingStatus?: "RECORDING_AVAILABLE" | "REFERENCE_CATALOGUE_ONLY" | string;
  sourceName?: string;
  sourceDataset?: string;
  sourceYear?: number;
  sourceReference?: string;
  verificationStatus?: string;
}

export interface MotherTongue {
  mother_tongue_id: string;
  language_census_code: string;
  parent_language_name: string;
  census_code: string;
  name: string;
  is_residual_category: boolean;
  population_2011: number;
  male_population_2011: number;
  female_population_2011: number;
  rural_population_2011: number;
  urban_population_2011: number;
  source_name: string;
  source_dataset: string;
  source_year: number;
  verification_status: string;
}

export interface LanguageVariety {
  id: string;
  languageId: string;
  name: string;
  nativeName: string;
  censusName: string;
  description: string;
  censusCode?: string;
  parentLanguage?: string;
  population_2011?: number;
  hasRecording?: boolean;
}

export interface Community {
  id: string;
  name: string;
  nativeName: string;
  stateId: string;
  districtId: string;
  description: string;
}

export interface LanguageLocation {
  id: string;
  languageId: string;
  countryId: string;
  stateId: string;
  districtId: string;
  subdistrictId: string;
  localityId: string;
  communityId: string | null;
  status: "OFFICIAL" | "CENSUS_REPORTED" | "COMMUNITY_REPORTED" | "FIELD_VERIFIED" | "AI_SUGGESTED" | "UNVERIFIED";
  sourceId: string;
  sourceYear: number;
}

export interface AudioTrack {
  id: string;
  storyId: string;
  type: "ORIGINAL" | "TRANSLATED";
  languageId: string;
  languageName: string;
  languageCode: string;
  sourceLanguageId?: string;
  targetLanguageId?: string;
  audioUrl: string;
  duration?: string;
  provider?: string;
  status: "GENERATING" | "READY" | "FAILED";
  immutable?: boolean;
  createdAt: string;
}

// ----------------------------------------------------
// QUERY & RETRIEVAL FUNCTIONS
// ----------------------------------------------------

export function getAllCountries(): Country[] {
  return countriesData as Country[];
}

export function getAllStates(): StateUT[] {
  return statesData as StateUT[];
}

export function getStateById(id: string): StateUT | undefined {
  return (statesData as StateUT[]).find(
    (s) => s.id.toLowerCase() === id.toLowerCase() || s.name.toLowerCase() === id.toLowerCase()
  );
}

export function getDistrictsByState(stateId: string): District[] {
  return (districtsData as District[]).filter(
    (d) => d.stateId.toLowerCase() === stateId.toLowerCase()
  );
}

export function getDistrictById(id: string): District | undefined {
  return (districtsData as District[]).find(
    (d) => d.id.toLowerCase() === id.toLowerCase() || d.name.toLowerCase() === id.toLowerCase()
  );
}

export function getSubdistrictsByDistrict(districtId: string): Subdistrict[] {
  return (subdistrictsData as Subdistrict[]).filter(
    (sub) => sub.districtId.toLowerCase() === districtId.toLowerCase()
  );
}

export function getLocalitiesBySubdistrict(subdistrictId: string): Locality[] {
  return (localitiesData as Locality[]).filter(
    (loc) => loc.subdistrictId.toLowerCase() === subdistrictId.toLowerCase()
  );
}

export function getAllLanguages(): Language[] {
  return languagesData as Language[];
}

export function getAllMotherTongues(): MotherTongue[] {
  return motherTonguesData as MotherTongue[];
}

export function getMotherTonguesByLanguage(langIdentifier: string): MotherTongue[] {
  if (!langIdentifier) return [];
  const normalized = langIdentifier.toLowerCase().trim();
  const lang = getLanguageById(normalized);
  const censusCode = lang?.censusCode;
  const langName = lang?.name.toLowerCase() || normalized;

  return (motherTonguesData as MotherTongue[]).filter((mt) => {
    if (censusCode && mt.language_census_code === censusCode) return true;
    return mt.parent_language_name.toLowerCase() === langName;
  });
}

export function getScheduledLanguages(): Language[] {
  return (languagesData as Language[]).filter((l) => l.isScheduled || l.officialStatus === "SCHEDULED_8");
}

export function getNonScheduledLanguages(): Language[] {
  return (languagesData as Language[]).filter((l) => !l.isScheduled && l.officialStatus !== "SCHEDULED_8");
}

export function getLanguagesWithRecordings(): Language[] {
  return (languagesData as Language[]).filter((l) => l.hasRecording);
}

export function getLanguageById(id: string): Language | undefined {
  if (!id) return undefined;
  const normalized = id.toLowerCase().trim();
  return (languagesData as Language[]).find(
    (lang) =>
      lang.id.toLowerCase() === normalized ||
      lang.name.toLowerCase() === normalized ||
      lang.iso639_3.toLowerCase() === normalized ||
      lang.censusCode === normalized ||
      (lang.iso639_1 && lang.iso639_1.toLowerCase() === normalized)
  );
}

export function getLanguageVarieties(languageId: string): LanguageVariety[] {
  return (varietiesData as LanguageVariety[]).filter(
    (v) => v.languageId.toLowerCase() === languageId.toLowerCase()
  );
}

export function getCommunities(stateId?: string, districtId?: string): Community[] {
  let list = communitiesData as Community[];
  if (stateId) {
    list = list.filter((c) => c.stateId.toLowerCase() === stateId.toLowerCase());
  }
  if (districtId) {
    list = list.filter((c) => c.districtId.toLowerCase() === districtId.toLowerCase());
  }
  return list;
}

export function searchLanguages(query: string): Language[] {
  if (!query || !query.trim()) return getAllLanguages();
  const q = query.toLowerCase().trim();
  return (languagesData as Language[]).filter(
    (lang) =>
      lang.name.toLowerCase().includes(q) ||
      lang.nativeName.toLowerCase().includes(q) ||
      lang.censusName.toLowerCase().includes(q) ||
      lang.iso639_3.toLowerCase().includes(q) ||
      lang.languageFamily.toLowerCase().includes(q)
  );
}

export function searchLocations(query: string): Array<{
  type: "state" | "district" | "subdistrict" | "locality";
  name: string;
  hierarchy: string;
  id: string;
}> {
  if (!query || query.trim().length < 2) return [];
  const q = query.toLowerCase().trim();
  const results: Array<{
    type: "state" | "district" | "subdistrict" | "locality";
    name: string;
    hierarchy: string;
    id: string;
  }> = [];

  // 1. States
  for (const s of statesData as StateUT[]) {
    if (s.name.toLowerCase().includes(q)) {
      results.push({ type: "state", name: s.name, hierarchy: `India`, id: s.id });
    }
  }

  // 2. Districts
  for (const d of districtsData as District[]) {
    if (d.name.toLowerCase().includes(q)) {
      const state = getStateById(d.stateId);
      results.push({ type: "district", name: d.name, hierarchy: `${state?.name || d.stateId}, India`, id: d.id });
    }
  }

  // 3. Localities
  for (const loc of localitiesData as Locality[]) {
    if (loc.name.toLowerCase().includes(q)) {
      const state = getStateById(loc.stateId);
      const dist = getDistrictById(loc.districtId);
      results.push({
        type: "locality",
        name: loc.name,
        hierarchy: `${dist?.name || loc.districtId}, ${state?.name || loc.stateId}, India`,
        id: loc.id
      });
    }
  }

  return results.slice(0, 15);
}

/**
 * Format dynamic UPPERCASE card metadata string:
 * LANGUAGE · LOCATION, COUNTRY
 * e.g. "TELUGU · TELANGANA, INDIA"
 * e.g. "GONDI · ADILABAD, TELANGANA, INDIA"
 * e.g. "KONDA · MAREDUMILLI AGENCY, EAST GODAVARI, INDIA"
 * e.g. "TULU · UDUPI & MANGALORE COASTLINE, KARNATAKA, INDIA"
 */
export function formatCardMetadata(story: {
  language?: string;
  sourceLanguage?: string;
  location?: string;
  region?: string;
  state?: string;
  district?: string;
  country?: string;
}): string {
  const lang = (story.sourceLanguage || story.language || "Oral Heritage").toUpperCase();
  
  let loc = story.region || story.location || "";
  if (!loc) {
    if (story.district && story.state) {
      loc = `${story.district}, ${story.state}`;
    } else if (story.state) {
      loc = story.state;
    } else {
      loc = "Deccan Region";
    }
  }

  // Ensure "India" is attached if not present
  const locUpper = loc.toUpperCase();
  const hasIndia = locUpper.includes("INDIA");
  const finalLoc = hasIndia ? locUpper : `${locUpper}, INDIA`;

  return `${lang} · ${finalLoc}`;
}
