-- ==============================================================================
-- Voice Roots — India Language & Location Master Relational Schema (PostgreSQL/SQLite)
-- Authoritative Data Sources:
-- 1. Local Government Directory (LGD), Ministry of Panchayati Raj, Govt of India
-- 2. Census of India 2011 Table C-16: Population by Mother Tongue & Language Atlas
-- ==============================================================================

-- 1. DATA SOURCES & AUDIT LOG
CREATE TABLE IF NOT EXISTS data_sources (
    id VARCHAR(64) PRIMARY KEY,
    organization VARCHAR(255) NOT NULL,
    dataset_name VARCHAR(255) NOT NULL,
    dataset_version VARCHAR(64),
    source_url TEXT,
    source_year INTEGER NOT NULL,
    retrieved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    license VARCHAR(128),
    notes TEXT
);

CREATE TABLE IF NOT EXISTS data_audit_log (
    id VARCHAR(64) PRIMARY KEY,
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    action VARCHAR(32) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'MERGE', 'VERIFY', 'REJECT')),
    old_value JSONB,
    new_value JSONB,
    changed_by VARCHAR(128) NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. GEOGRAPHIC ADMINISTRATIVE HIERARCHY
CREATE TABLE IF NOT EXISTS countries (
    id VARCHAR(16) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    official_name VARCHAR(255),
    iso2 VARCHAR(2) NOT NULL UNIQUE,
    iso3 VARCHAR(3) NOT NULL UNIQUE,
    capital VARCHAR(128),
    source_id VARCHAR(64) REFERENCES data_sources(id)
);

CREATE TABLE IF NOT EXISTS states (
    id VARCHAR(32) PRIMARY KEY,
    country_id VARCHAR(16) NOT NULL REFERENCES countries(id),
    name VARCHAR(128) NOT NULL,
    official_code VARCHAR(16) NOT NULL,
    type VARCHAR(32) NOT NULL CHECK (type IN ('STATE', 'UNION_TERRITORY')),
    capital VARCHAR(128),
    source_id VARCHAR(64) REFERENCES data_sources(id)
);
CREATE INDEX IF NOT EXISTS idx_states_country_id ON states(country_id);

CREATE TABLE IF NOT EXISTS districts (
    id VARCHAR(32) PRIMARY KEY,
    state_id VARCHAR(32) NOT NULL REFERENCES states(id),
    name VARCHAR(128) NOT NULL,
    official_code VARCHAR(16) NOT NULL,
    source_id VARCHAR(64) REFERENCES data_sources(id)
);
CREATE INDEX IF NOT EXISTS idx_districts_state_id ON districts(state_id);

CREATE TABLE IF NOT EXISTS subdistricts (
    id VARCHAR(32) PRIMARY KEY,
    district_id VARCHAR(32) NOT NULL REFERENCES districts(id),
    name VARCHAR(128) NOT NULL,
    official_code VARCHAR(16) NOT NULL,
    type VARCHAR(32) NOT NULL CHECK (type IN ('MANDAL', 'TALUK', 'TEHSIL', 'BLOCK', 'SUBDIVISION', 'OTHER')),
    source_id VARCHAR(64) REFERENCES data_sources(id)
);
CREATE INDEX IF NOT EXISTS idx_subdistricts_district_id ON subdistricts(district_id);

CREATE TABLE IF NOT EXISTS localities (
    id VARCHAR(64) PRIMARY KEY,
    country_id VARCHAR(16) NOT NULL REFERENCES countries(id),
    state_id VARCHAR(32) NOT NULL REFERENCES states(id),
    district_id VARCHAR(32) NOT NULL REFERENCES districts(id),
    subdistrict_id VARCHAR(32) NOT NULL REFERENCES subdistricts(id),
    name VARCHAR(128) NOT NULL,
    official_code VARCHAR(32) NOT NULL,
    type VARCHAR(32) NOT NULL CHECK (type IN ('VILLAGE', 'HAMLET', 'TOWN', 'CITY', 'LOCALITY', 'OTHER')),
    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6),
    source_id VARCHAR(64) REFERENCES data_sources(id),
    source_year INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_localities_district_id ON localities(district_id);
CREATE INDEX IF NOT EXISTS idx_localities_subdistrict_id ON localities(subdistrict_id);

-- 3. LINGUISTIC & COMMUNITY MASTER
CREATE TABLE IF NOT EXISTS languages (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    native_name VARCHAR(128) NOT NULL,
    iso639_1 VARCHAR(8),
    iso639_3 VARCHAR(8) NOT NULL,
    language_family VARCHAR(128) NOT NULL,
    language_group VARCHAR(128),
    census_code VARCHAR(32),
    census_name VARCHAR(128),
    description TEXT,
    source_id VARCHAR(64) REFERENCES data_sources(id),
    source_year INTEGER NOT NULL,
    status VARCHAR(32) NOT NULL CHECK (status IN ('OFFICIAL', 'COMMUNITY_ADDED', 'PENDING_REVIEW'))
);
CREATE INDEX IF NOT EXISTS idx_languages_name ON languages(name);
CREATE INDEX IF NOT EXISTS idx_languages_iso639_3 ON languages(iso639_3);

CREATE TABLE IF NOT EXISTS language_varieties (
    id VARCHAR(64) PRIMARY KEY,
    language_id VARCHAR(64) NOT NULL REFERENCES languages(id),
    name VARCHAR(128) NOT NULL,
    native_name VARCHAR(128),
    census_name VARCHAR(128),
    census_code VARCHAR(32),
    description TEXT,
    source_id VARCHAR(64) REFERENCES data_sources(id),
    source_year INTEGER,
    status VARCHAR(32)
);
CREATE INDEX IF NOT EXISTS idx_varieties_language_id ON language_varieties(language_id);

CREATE TABLE IF NOT EXISTS dialects (
    id VARCHAR(64) PRIMARY KEY,
    language_id VARCHAR(64) NOT NULL REFERENCES languages(id),
    name VARCHAR(128) NOT NULL,
    native_name VARCHAR(128),
    region VARCHAR(128),
    description TEXT,
    verification_status VARCHAR(32) NOT NULL
);

CREATE TABLE IF NOT EXISTS communities (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    native_name VARCHAR(128),
    description TEXT,
    country_id VARCHAR(16) REFERENCES countries(id),
    state_id VARCHAR(32) REFERENCES states(id),
    district_id VARCHAR(32) REFERENCES districts(id),
    locality_id VARCHAR(64) REFERENCES localities(id),
    verification_status VARCHAR(32) NOT NULL,
    source_id VARCHAR(64) REFERENCES data_sources(id)
);

CREATE TABLE IF NOT EXISTS language_locations (
    id VARCHAR(64) PRIMARY KEY,
    language_id VARCHAR(64) NOT NULL REFERENCES languages(id),
    country_id VARCHAR(16) REFERENCES countries(id),
    state_id VARCHAR(32) REFERENCES states(id),
    district_id VARCHAR(32) REFERENCES districts(id),
    subdistrict_id VARCHAR(32) REFERENCES subdistricts(id),
    locality_id VARCHAR(64) REFERENCES localities(id),
    community_id VARCHAR(64) REFERENCES communities(id),
    status VARCHAR(32) NOT NULL CHECK (status IN ('OFFICIAL', 'CENSUS_REPORTED', 'COMMUNITY_REPORTED', 'FIELD_VERIFIED', 'AI_SUGGESTED', 'UNVERIFIED')),
    source_id VARCHAR(64) REFERENCES data_sources(id),
    source_year INTEGER,
    source_reference TEXT,
    verification_status VARCHAR(32)
);
CREATE INDEX IF NOT EXISTS idx_lang_loc_language_id ON language_locations(language_id);
CREATE INDEX IF NOT EXISTS idx_lang_loc_locality_id ON language_locations(locality_id);

-- 4. CENSUS DEMOGRAPHIC OBSERVATIONS (Kept separate from canonical identities)
CREATE TABLE IF NOT EXISTS census_language_observations (
    id VARCHAR(64) PRIMARY KEY,
    language_id VARCHAR(64) REFERENCES languages(id),
    census_language_code VARCHAR(32),
    mother_tongue_name VARCHAR(128) NOT NULL,
    state_code VARCHAR(16),
    district_code VARCHAR(16),
    subdistrict_code VARCHAR(16),
    town_code VARCHAR(16),
    area_name VARCHAR(128) NOT NULL,
    area_type VARCHAR(32),
    total_persons BIGINT,
    total_male BIGINT,
    total_female BIGINT,
    rural_persons BIGINT,
    rural_male BIGINT,
    rural_female BIGINT,
    urban_persons BIGINT,
    urban_male BIGINT,
    urban_female BIGINT,
    census_year INTEGER NOT NULL,
    source_id VARCHAR(64) REFERENCES data_sources(id)
);

-- 5. VOICE ROOTS APPLICATION ENTITIES
CREATE TABLE IF NOT EXISTS stories (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    country_id VARCHAR(16) REFERENCES countries(id),
    state_id VARCHAR(32) REFERENCES states(id),
    district_id VARCHAR(32) REFERENCES districts(id),
    subdistrict_id VARCHAR(32) REFERENCES subdistricts(id),
    locality_id VARCHAR(64) REFERENCES localities(id),
    community_id VARCHAR(64) REFERENCES communities(id),
    source_language_id VARCHAR(64) NOT NULL REFERENCES languages(id), -- NEVER CHANGED BY TRANSLATION
    language_variety_id VARCHAR(64) REFERENCES language_varieties(id),
    dialect_id VARCHAR(64) REFERENCES dialects(id),
    original_audio_id VARCHAR(64),
    verification_status VARCHAR(32) DEFAULT 'COMMUNITY_REPORTED',
    access_level VARCHAR(32) DEFAULT 'public',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_stories_source_lang ON stories(source_language_id);
CREATE INDEX IF NOT EXISTS idx_stories_state_id ON stories(state_id);
CREATE INDEX IF NOT EXISTS idx_stories_district_id ON stories(district_id);
CREATE INDEX IF NOT EXISTS idx_stories_locality_id ON stories(locality_id);

CREATE TABLE IF NOT EXISTS audio_tracks (
    id VARCHAR(64) PRIMARY KEY,
    story_id VARCHAR(64) NOT NULL REFERENCES stories(id),
    type VARCHAR(32) NOT NULL CHECK (type IN ('ORIGINAL', 'TRANSLATED')),
    language_id VARCHAR(64) NOT NULL REFERENCES languages(id),
    source_language_id VARCHAR(64) REFERENCES languages(id),
    target_language_id VARCHAR(64) REFERENCES languages(id),
    audio_url TEXT NOT NULL,
    duration VARCHAR(32),
    provider VARCHAR(64),
    voice_id VARCHAR(64),
    status VARCHAR(32) NOT NULL CHECK (status IN ('GENERATING', 'READY', 'FAILED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS translations (
    id VARCHAR(64) PRIMARY KEY,
    story_id VARCHAR(64) NOT NULL REFERENCES stories(id),
    source_language_id VARCHAR(64) NOT NULL REFERENCES languages(id),
    target_language_id VARCHAR(64) NOT NULL REFERENCES languages(id),
    translated_text TEXT NOT NULL,
    status VARCHAR(32) DEFAULT 'VERIFIED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS translation_audio (
    id VARCHAR(64) PRIMARY KEY,
    translation_id VARCHAR(64) NOT NULL REFERENCES translations(id),
    story_id VARCHAR(64) NOT NULL REFERENCES stories(id),
    source_language_id VARCHAR(64) NOT NULL REFERENCES languages(id),
    target_language_id VARCHAR(64) NOT NULL REFERENCES languages(id),
    audio_url TEXT NOT NULL,
    tts_provider VARCHAR(64) NOT NULL,
    voice_id VARCHAR(64),
    status VARCHAR(32) DEFAULT 'READY',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
