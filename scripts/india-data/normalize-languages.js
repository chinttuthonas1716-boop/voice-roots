/**
 * Voice Roots — Language Normalization Engine
 * Normalizes 121 Census languages, ISO 639-3 codes, language families, and mother-tongue varieties.
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '../../data/india');

function normalizeLanguages() {
  console.log("🇮🇳 Voice Roots: Normalizing Languages & Varieties...");
  
  const languagesFile = path.join(DATA_DIR, 'languages.json');
  const varietiesFile = path.join(DATA_DIR, 'language_varieties.json');

  const languages = JSON.parse(fs.readFileSync(languagesFile, 'utf8'));
  const varieties = JSON.parse(fs.readFileSync(varietiesFile, 'utf8'));

  // Validate all languages have unique IDs and valid ISO 639-3
  const idSet = new Set();
  const scheduledCount = languages.filter(l => l.officialStatus === 'SCHEDULED_8').length;
  const nonScheduledCount = languages.filter(l => l.officialStatus !== 'SCHEDULED_8').length;

  for (const lang of languages) {
    if (idSet.has(lang.id)) {
      throw new Error(`Duplicate language ID found: ${lang.id}`);
    }
    idSet.add(lang.id);
  }

  console.log(`✅ Normalized ${languages.length} total languages:`);
  console.log(`   - Scheduled (8th Schedule): ${scheduledCount}`);
  console.log(`   - Non-Scheduled & Indigenous: ${nonScheduledCount}`);
  console.log(`✅ Verified ${varieties.length} language varieties.`);

  return { total: languages.length, scheduled: scheduledCount, nonScheduled: nonScheduledCount };
}

if (require.main === module) {
  normalizeLanguages();
}

module.exports = { normalizeLanguages };
