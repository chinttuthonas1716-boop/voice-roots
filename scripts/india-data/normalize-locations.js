/**
 * Voice Roots — Location Normalization Engine
 * Validates LGD (Ministry of Panchayati Raj) administrative hierarchy.
 * Ensures: Country -> State (28 States + 8 UTs) -> District -> Subdistrict -> Locality
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '../../data/india');

function normalizeLocations() {
  console.log("🇮🇳 Voice Roots: Normalizing Administrative Geography...");

  const states = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'states.json'), 'utf8'));
  const districts = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'districts.json'), 'utf8'));
  const subdistricts = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'subdistricts.json'), 'utf8'));
  const localities = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'localities.json'), 'utf8'));

  if (states.length !== 36) {
    throw new Error(`Expected exactly 36 States & UTs (28 States + 8 UTs), found: ${states.length}`);
  }

  // Verify all districts have valid state references
  const stateIds = new Set(states.map(s => s.id));
  for (const d of districts) {
    if (!stateIds.has(d.stateId)) {
      throw new Error(`District ${d.name} (${d.id}) references missing stateId: ${d.stateId}`);
    }
  }

  // Verify all subdistricts have valid district references
  const districtIds = new Set(districts.map(d => d.id));
  for (const sd of subdistricts) {
    if (!districtIds.has(sd.districtId)) {
      throw new Error(`Subdistrict ${sd.name} (${sd.id}) references missing districtId: ${sd.districtId}`);
    }
  }

  // Verify all localities have valid subdistrict references
  const subdistrictIds = new Set(subdistricts.map(sd => sd.id));
  for (const loc of localities) {
    if (!subdistrictIds.has(loc.subdistrictId)) {
      throw new Error(`Locality ${loc.name} (${loc.id}) references missing subdistrictId: ${loc.subdistrictId}`);
    }
  }

  console.log(`✅ Normalized Geography:`);
  console.log(`   - States / UTs: ${states.length} (28 States + 8 UTs)`);
  console.log(`   - Districts: ${districts.length}`);
  console.log(`   - Subdistricts: ${subdistricts.length}`);
  console.log(`   - Localities: ${localities.length}`);

  return {
    statesCount: states.length,
    districtsCount: districts.length,
    subdistrictsCount: subdistricts.length,
    localitiesCount: localities.length,
  };
}

if (require.main === module) {
  normalizeLocations();
}

module.exports = { normalizeLocations };
