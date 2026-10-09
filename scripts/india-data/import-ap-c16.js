/**
 * Voice Roots — Andhra Pradesh Census 2011 C-16 Importer
 * Source: PC11_C16-28 (Andhra Pradesh Population by Mother Tongue)
 * https://censusindia.gov.in/nada/index.php/catalog/10193
 *
 * CRITICAL RULE:
 * 2011 Andhra Pradesh geography is historical (predating the 2014 Telangana bifurcation).
 * We maintain historical geography separate from current administrative geography.
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '../../data/india');

// Historical 2011 AP Districts that became Telangana in 2014
const TELANGANA_HISTORICAL_DISTRICTS_2011 = [
  "Adilabad", "Nizamabad", "Karimnagar", "Medak", "Hyderabad",
  "Ranga Reddy", "Mahabubnagar", "Nalgonda", "Warangal", "Khammam"
];

function importAndhraPradeshC16() {
  console.log("🇮🇳 Voice Roots: Processing Andhra Pradesh Census 2011 C-16 (Historical)...");
  
  const crosswalk = {
    sourceDataset: "PC11_C16-28",
    sourceYear: 2011,
    geographyVersion: "CENSUS_2011",
    preBifurcationStateCode: "28",
    reorganizationDate: "2014-06-02",
    telanganaDistrictsCount: TELANGANA_HISTORICAL_DISTRICTS_2011.length,
    telanganaDistricts: TELANGANA_HISTORICAL_DISTRICTS_2011,
    modernStateMapping: {
      andhraPradeshLGD: "in-ap (Code 28)",
      telanganaLGD: "in-tg (Code 36)"
    }
  };

  const crosswalkPath = path.join(DATA_DIR, 'census_2011_ap_crosswalk.json');
  fs.writeFileSync(crosswalkPath, JSON.stringify(crosswalk, null, 2));
  console.log("✅ Written Census 2011 Historical Geography Crosswalk to " + crosswalkPath);

  return crosswalk;
}

if (require.main === module) {
  importAndhraPradeshC16();
}

module.exports = { importAndhraPradeshC16 };
