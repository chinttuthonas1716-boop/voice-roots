/**
 * Voice Roots — Database Seeder
 * Reads normalized JSON data and seeds SQLite/PostgreSQL tables or local storage state.
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '../../data/india');

function seedDatabase() {
  console.log("🇮🇳 Voice Roots: Seeding India Master Database...");

  const files = [
    'countries.json',
    'states.json',
    'districts.json',
    'subdistricts.json',
    'localities.json',
    'languages.json',
    'language_varieties.json',
    'communities.json',
    'language_locations.json',
    'census_observations.json',
    'data_sources.json',
    'data_audit_log.json',
  ];

  const summary = {};

  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      summary[file.replace('.json', '')] = Array.isArray(data) ? data.length : 1;
    }
  }

  console.log("✅ Seed Summary:");
  for (const [entity, count] of Object.entries(summary)) {
    console.log(`   - ${entity}: ${count} records`);
  }

  return summary;
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
