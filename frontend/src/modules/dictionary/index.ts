// Voice Roots v2.0 Module 2: Multilingual Dictionary
// Priority 2: Gondi, Koya, Santhali, Lambadi search, alternate spellings, IPA pronunciation, dialect variants.

export interface DictionaryEntry {
  id: string | number;
  word: string;
  language: string;
  dialect?: string;
  ipa?: string;
  audioUrl?: string;
  meanings: string[];
  translations: Record<string, string>;
  alternateSpellings?: string[];
  dialectVariations?: Record<string, string>;
  isElderApproved: boolean;
  provenance: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DictionarySearchFilter {
  query: string;
  language?: string;
  dialect?: string;
  onlyApproved?: boolean;
}
