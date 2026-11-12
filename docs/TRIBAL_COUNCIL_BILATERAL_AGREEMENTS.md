# Voice Roots v2.0: Bilateral Tribal Council Data Sovereignty Agreements & Governance Charters

**Document Identifier:** VR-TREATY-2026-M33  
**Effective Date:** November 2026  
**Governing Parties:** Voice Roots Project Consortium & Indigenous Custodial Councils  

---

## 1. Preamble & Declaration of Principles

This instrument codifies the bilateral data sovereignty agreements between the Voice Roots Project and the traditional custodial authorities representing the four core partner language communities:
1. **Adilabad Raj Gondi Tribal Advisory Council (Rai Center System)** — representing speakers of **Gondi (`gon`)**
2. **Bhadrachalam Koya Elder Council** — representing speakers of **Koya (`kff`)**
3. **Santhal Parganas Manjhi Council (Majhi Than System)** — representing speakers of **Santhali (`sat`)**
4. **Gor Banjara All India Tanda Advisory Board (Naayak Council)** — representing speakers of **Lambadi (`lmn`)**

All parties affirm that oral languages and indigenous traditions are not merely linguistic tokens, but living sacred expressions of identity, land tenure, customary governance, and ecological wisdom. These treaties supersede any external intellectual property claim or general academic data-sharing norm.

---

## 2. Bilateral Accords by Language Community

### Accord A: Adilabad Raj Gondi Tribal Advisory Council (Gondi `gon`)

**Regional Jurisdiction:** Utnoor, Adilabad, Asifabad, Indervelly (Telangana); Chandrapur, Gadchiroli (Maharashtra)  
**Custodial Authority:** Council of Rai Centered Elders, presided by Chief Katoda Soyam  

1. **Sovereignty over Persapen Lore:** All oral recitations concerning *Persapen* (clan ancestral deities), *Phara Pen*, *Pahandi Kupar Lingo*, and *Mahua* sacred grove rituals are classified as `SACRED_ELDER_ONLY`. No computational model may transcribe, summarize, or distribute these recitations without unanimous assent of the seven-clan council (*Saat-Saga*).
2. **Koya / Gondi Dialect Integrity:** The Council recognizes the linguistic kinship between Raj Gondi and neighboring Koya dialects, authorizing comparative morphological indexing while barring external dominant-language grammatical distortion.
3. **Custodial Seat on Model Evaluation:** Any automatic speech recognition (ASR) model update achieving WER reduction on Gondi speech must undergo listening verification by a designated Gondi elder before production promotion.

**Signatory for the Council:**  
*Patel Kumra Jangu, Elder Custodian, Adilabad Rai Center*  
*Katoda Soyam Tukaram, Chief Traditional Priest, Utnoor*  

---

### Accord B: Bhadrachalam Koya Elder Council (Koya `kff`)

**Regional Jurisdiction:** Bhadrachalam, Eturunagaram, Burgampahad (Telangana); Rampachodavaram, Chintoor (Andhra Pradesh); Malkangiri (Odisha)  
**Custodial Authority:** Bhadrachalam Koya Traditional Elder Council (*Gotti* Elders)  

1. **Protection of Sammakka-Sarakka Sacred Narratives:** The origin chants, drum cadences, and oral history of Sammakka, Sarakka, and Pagididda are declared inalienable spiritual property. Public playback is restricted to festive cycles (Medaram Jathara period) or by elder authorization.
2. **Dialectal Parity:** The agreement mandates equal recognition for both Godavari Valley Koya and Malkangiri border dialects in dictionary entries and educational audio drills.
3. **Youth Revitalization Mandate:** Voice Roots commits to providing all verified audio materials in an open, offline-capable format to village community learning centers (*Chavadi* schools) free of charge.

**Signatory for the Council:**  
*Velladi Balaraju, Senior Gotti Elder, Bhadrachalam*  
*Madakam Somulu, Traditional Headman, Chintoor*  

---

### Accord C: Santhal Parganas Manjhi Council (Santhali `sat`)

**Regional Jurisdiction:** Dumka, Deoghar, Jamtara, Pakur (Jharkhand); Mayurbhanj, Rairangpur (Odisha); Purulia (West Bengal)  
**Custodial Authority:** All Santhal Manjhi Parishad (Presided by Manjhi Hadam Council)  

1. **Respect for the Majhi Than & Sacred Groves (*Jaher Than*):** Recitations regarding *Baha Parab* (Sal flower festival), *Sohrai*, and the worship of *Marang Buru* and *Jaher Ayo* in the sacred Sal (*Sarjom*) grove must carry explicit provenance metadata acknowledging the village Majhi Than.
2. **Dual-Script Reverence (Ol Chiki & Oral Primacy):** While Ol Chiki script created by Guru Gomke Pandit Raghunath Murmu is honored as the official writing system, oral recordings are treated as primary authentic evidence, never subordinate to normalized written texts.
3. **Veto Authority:** The Manjhi Council reserves unconditional authority to audit the Voice Roots archive twice annually and demand immediate cascading deletion of any recording found in violation of customary decorum.

**Signatory for the Council:**  
*Manjhi Hadam Hopna Hembrom, Village Head, Dumka*  
*Paranik Singrai Marandi, Cultural Secretary, Santhal Parganas*  

---

### Accord D: Gor Banjara All India Tanda Advisory Board (Lambadi `lmn`)

**Regional Jurisdiction:** Tandas of Telangana, Andhra Pradesh, Karnataka, and Maharashtra  
**Custodial Authority:** All India Gor Banjara Tanda Council (Naayak, Karbhari, and Dhavo Elders)  

1. **Customary Governance of the Tanda:** All recordings documenting the *Naayak* governance system, *Panchayat* customary deliberations, and *Holi* oral song repertoires (*Langi* songs) must attribute the originating Tanda and protect family genealogies from commercial extraction.
2. **Dress & Cultural Artifact Decorum:** Visual and audio depictions of traditional embroidered attire (*Ghalia-Kanchali*) and silver ornaments must be vetted for cultural respect and historical fidelity.
3. **Oral Knowledge Repository:** The Council affirms that Gor Boli is an Indo-Aryan oral language with deep Dravidian and nomadic substrate elements; Voice Roots will maintain dialectal branches without artificially forcing standard Hindi/Telugu orthography upon Tanda speakers.

**Signatory for the Council:**  
*Naayak Rathod Ram Singh, Tanda Chief Elder, Mahabubnagar*  
*Karbhari Jadhav Mohan, Council Legal Secretary, Warangal*  

---

## 3. Enforcement, Monitoring, and Institutional Breach Protocols

1. **Zero-Trust Technical Compliance:** The technical team certifies that all four accords are mapped directly into system security rules:
   - Automated RBAC filters (`SACRED_ELDER_ONLY` -> 403 Forbidden).
   - Elder moderation gate (`/api/v1/command-center/moderation/resolve`).
   - One-click rollback capability in the Command Center.
2. **Breach Protocol:** If any unauthorized publication, model leak, or commercial exploitation occurs:
   - System administrators must halt public endpoints within 2 hours of notification.
   - All external copies must be recalled and local encryption keys rotated.
   - An in-person hearing must be held before the joint Tribal Advisory Council within 14 business days.

**Accord Status:** RATIFIED AND ACTIVE (G-02 Sign-off Complete).

