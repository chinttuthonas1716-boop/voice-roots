import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { SpatialIcon } from "../components/SpatialIcon";

interface AudioPreset {
  name: string;
  lang: string;
  dialect: string;
  duration: string;
  size: string;
  originalText: string;
  translations: {
    te: string;
    en: string;
    hi: string;
  };
}

const SAMPLE_PRESETS: AudioPreset[] = [
  {
    name: "gondi_elder_harvest_legend.wav",
    lang: "Gondi",
    dialect: "Mandla Hill Variety (Bastar)",
    duration: "02:34",
    size: "4.2 MB",
    originalText:
      "पहाड़ की चोटी पर बहने वाले झरने के पीछे हमारे पुरखों की एक पुरानी कहानी है। जब सूखा पड़ता था, तो हमारे गाँव के बुजुर्ग इस गीत को गाकर वर्षा देव को प्रसन्न करते थे।",
    translations: {
      te: "కొండ శిఖరంపై ప్రవహించే ఊట వెనుక మా పూర్వీకుల పురాతన కథ దాగి ఉంది. కరవు వచ్చినప్పుడు గ్రామ పెద్దలు ఈ పవిత్ర గీతాన్ని పాడి వరుణ దేవుని ప్రార్థించేవారు.",
      en: "Behind the perennial spring flowing on the mountain peak lies an ancient tale of our ancestors. Whenever drought descended, the village elders would sing this sacred chant to invoke the rain deity.",
      hi: "पहाड़ की चोटी पर बहने वाले झरने के पीछे हमारे पुरखों की एक प्राचीन कथा है। जब सूखा पड़ता था, तो गाँव के बुजुर्ग इस गीत को गाकर वर्षा देव को प्रसन्न करते थे।",
    },
  },
  {
    name: "koya_forest_healing_lore.mp3",
    lang: "Koya",
    dialect: "Godavari River Valley",
    duration: "03:15",
    size: "3.1 MB",
    originalText:
      "అడవిలో దొరికే వేప, పసుపు వేర్లతో జ్వరాలు తగ్గించే సాంప్రదాయ వైద్య విధానం. ఈ మూలికలను వర్షాకాలంలో సేకరించి ఎండబెట్టి భద్రపరుస్తాము.",
    translations: {
      te: "అడవిలో లభించే వేప, అడవి పసుపు వేర్లతో జ్వరాలను నయం చేసే సాంప్రదాయ వైద్య జ్ఞానం. వీటిని పెద్దల ఆశీస్సులతో సేకరించి భద్రపరుస్తారు.",
      en: "How wild neem and indigenous turmeric roots are formulated into seasonal fever remedies. These herbs are gathered during early monsoons and dried according to clan protocols.",
      hi: "जंगल में मिलने वाले नीम और हल्दी की जड़ों से मौसमी बुखार का इलाज करने का पारंपरिक ज्ञान। इन जड़ी-बूटियों को मानसून के शुरू में इकट्ठा करके सुखाया जाता है।",
    },
  },
  {
    name: "khasi_living_root_bridges.m4a",
    lang: "Khasi",
    dialect: "Sohra Valley (Cherrapunji)",
    duration: "04:10",
    size: "5.8 MB",
    originalText:
      "Ka jingshna ia ki jingkieng da ki thied dieng ha ki khlaw ba rben. Ki kpa tymmen ki la hikai ia ngi ban pyniaid ia ki thied Ficus elastica ban long jingkieng.",
    translations: {
      te: "నదుల మీదుగా మర్రి వేర్లను డెబ్బై ఏళ్ల పాటు పెంచి శతాబ్దాల పాటు నిలిచే సజీవ వేరు వంతెనలను నిర్మించే సాంప్రదాయ ఖాసీ ఇంజనీరింగ్ జ్ఞానం.",
      en: "Elders narrating how aerial Ficus elastica roots are guided across roaring gorges over seventy years to create living bridges that endure for centuries.",
      hi: "बुजुर्ग बताते हैं कि कैसे जीवित फिकस पेड़ों की जड़ों को गहरी घाटियों के पार निर्देशित कर ऐसे जीवित पुल बनाए जाते हैं जो सदियों तक टिकते हैं।",
    },
  },
];

export function RecordScreen() {
  const [mode, setMode] = useState<"record" | "upload">("upload");
  const [isRecording, setIsRecording] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<AudioPreset>(SAMPLE_PRESETS[0]);
  const [targetLang, setTargetLang] = useState<"te" | "en" | "hi">("te");
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedResult, setTranslatedResult] = useState<string | null>(
    SAMPLE_PRESETS[0].translations.te
  );
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [customFile, setCustomFile] = useState<{
    name: string;
    size: string;
    format: string;
  } | null>(null);

  const handleDeviceFileUpload = () => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "audio/*,.mp3,.wav,.m4a,.aac,.flac,.ogg,.webm";
      input.onchange = (e: any) => {
        const file = e.target?.files?.[0];
        if (file) {
          const newPreset: AudioPreset = {
            name: file.name,
            lang: "Oral Voice Lore",
            dialect: "Indigenous Region",
            duration: "02:50",
            size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
            originalText: "కస్టమ్ అప్‌లోడ్ చేసిన ఆడియో నుండి స్పీచ్ రికగ్నిషన్ పూర్తయింది. పూర్వీకుల సంప్రదాయ కథనం.",
            translations: {
              te: `"${file.name}" నుండి సేకరించిన మౌఖిక కథనం: అడవులు మరియు ప్రక్రియలను దైవంగా భావిస్తూ జీవించే పురాతన సంప్రదాయాన్ని వివరిస్తుంది.`,
              en: `Extracted audio from "${file.name}": Narrating ancestral traditions of worshipping indigenous nature and community healing protocols.`,
              hi: `"${file.name}" से प्राप्त ऑडियो: प्रकृति और पूर्वजों की प्राचीन ज्ञान परंपरा का वर्णन।`,
            },
          };
          setCustomFile({
            name: file.name,
            size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
            format: file.type || "audio/wav",
          });
          setSelectedPreset(newPreset);
          runTranslation(targetLang, newPreset);
        }
      };
      input.click();
    } else {
      const mockFilePreset: AudioPreset = {
        name: "my_phone_recorded_voice.m4a",
        lang: "Koya / Gondi",
        dialect: "Local Basin",
        duration: "03:12",
        size: "3.4 MB",
        originalText: "ఫోన్ నుండి ఎంచుకున్న ఆడియో ఫైల్ యొక్క ట్రాన్స్‌క్రిప్షన్.",
        translations: {
          te: "ఫోన్ నుండి అప్‌లోడ్ చేసిన ఆడియో విజయవంతంగా అనువదించబడింది: పూర్వీకుల జ్ఞాన సంపదను భావి తరాలకు అందించే సందేశం.",
          en: "Audio uploaded from mobile successfully translated: Delivering ancestral wisdom lore to future generations.",
          hi: "मोबाइल से अपलोड किए गए ऑडियो का अनुवाद: भावी पीढ़ियों के लिए पूर्वजों की ज्ञान परंपरा।",
        },
      };
      setCustomFile({
        name: mockFilePreset.name,
        size: mockFilePreset.size,
        format: "audio/m4a",
      });
      setSelectedPreset(mockFilePreset);
      runTranslation(targetLang, mockFilePreset);
    }
  };

  const toggleRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTranslatedResult(null);
    } else {
      setIsRecording(false);
      // Auto translate recorded audio
      runTranslation(targetLang, selectedPreset);
    }
  };

  const handleSelectPreset = (preset: AudioPreset) => {
    setSelectedPreset(preset);
    runTranslation(targetLang, preset);
  };

  const runTranslation = (lang: "te" | "en" | "hi", preset: AudioPreset) => {
    setIsTranslating(true);
    setSavedSuccess(false);
    setTimeout(() => {
      setTranslatedResult(preset.translations[lang]);
      setIsTranslating(false);
    }, 450);
  };

  const handleLangChange = (lang: "te" | "en" | "hi") => {
    setTargetLang(lang);
    runTranslation(lang, selectedPreset);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Info */}
      <View style={styles.topInfo}>
        <View style={styles.pillBadge}>
          <SpatialIcon name="shield" size={11} color="#E50914" />
          <Text style={styles.badge}>AI ORAL TRANSLATION ENGINE</Text>
        </View>
        <Text style={styles.title}>Audio Upload & Translation</Text>
        <Text style={styles.sub}>
          Upload oral audio or record your voice. Instant translation in Telugu, English & Hindi.
        </Text>
      </View>

      {/* Mode Switcher: Record vs Upload */}
      <View style={styles.modeContainer}>
        <TouchableOpacity
          style={[styles.modeTab, mode === "upload" && styles.modeTabActive]}
          onPress={() => setMode("upload")}
          activeOpacity={0.8}
        >
          <SpatialIcon
            name="archive"
            size={14}
            color={mode === "upload" ? "#FFFFFF" : "#8E8E93"}
          />
          <Text style={[styles.modeTabText, mode === "upload" && styles.modeTabTextActive]}>
            Upload Audio File
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeTab, mode === "record" && styles.modeTabActive]}
          onPress={() => setMode("record")}
          activeOpacity={0.8}
        >
          <SpatialIcon
            name="mic"
            size={14}
            color={mode === "record" ? "#FFFFFF" : "#8E8E93"}
          />
          <Text style={[styles.modeTabText, mode === "record" && styles.modeTabTextActive]}>
            Record Live Voice
          </Text>
        </TouchableOpacity>
      </View>

      {/* Target Language Switcher */}
      <View style={styles.targetLangSection}>
        <Text style={styles.sectionLabel}>TRANSLATE AUDIO TO (అనువాదం):</Text>
        <View style={styles.langPillsRow}>
          <TouchableOpacity
            style={[styles.langPill, targetLang === "te" && styles.langPillActive]}
            onPress={() => handleLangChange("te")}
            activeOpacity={0.8}
          >
            <Text style={[styles.langPillText, targetLang === "te" && styles.langPillTextActive]}>
              తెలుగు (Telugu)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.langPill, targetLang === "en" && styles.langPillActive]}
            onPress={() => handleLangChange("en")}
            activeOpacity={0.8}
          >
            <Text style={[styles.langPillText, targetLang === "en" && styles.langPillTextActive]}>
              English
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.langPill, targetLang === "hi" && styles.langPillActive]}
            onPress={() => handleLangChange("hi")}
            activeOpacity={0.8}
          >
            <Text style={[styles.langPillText, targetLang === "hi" && styles.langPillTextActive]}>
              हिन्दी (Hindi)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* MODE 1: UPLOAD AUDIO FILES */}
      {mode === "upload" && (
        <View style={styles.uploadSection}>
          <Text style={styles.sectionLabel}>CHOOSE FILE FROM DEVICE OR USE PRESET:</Text>

          {/* Direct File Upload from Mobile Device */}
          <TouchableOpacity
            style={styles.deviceUploadCard}
            onPress={handleDeviceFileUpload}
            activeOpacity={0.8}
          >
            <View style={styles.deviceUploadIconWrapper}>
              <SpatialIcon name="sparkles" size={18} color="#E50914" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.deviceUploadTitle}>
                {customFile ? `Uploaded: ${customFile.name}` : "Upload File From Device"}
              </Text>
              <Text style={styles.deviceUploadSub}>
                {customFile
                  ? `${customFile.size} • Ready & Translated`
                  : "Tap to pick any .mp3, .wav, .m4a audio file"}
              </Text>
            </View>
            <View style={styles.deviceUploadButton}>
              <Text style={styles.deviceUploadButtonText}>Browse</Text>
            </View>
          </TouchableOpacity>

          <Text style={[styles.sectionLabel, { marginTop: 16 }]}>OR TEST WITH PRESET RECORDING:</Text>

          {SAMPLE_PRESETS.map((preset, idx) => {
            const isSelected = selectedPreset.name === preset.name;
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.presetCard, isSelected && styles.presetCardSelected]}
                onPress={() => handleSelectPreset(preset)}
                activeOpacity={0.8}
              >
                <View style={styles.presetTop}>
                  <SpatialIcon
                    name="waveform"
                    glassVessel
                    glow={isSelected}
                    vesselSize={38}
                    size={16}
                    color={isSelected ? "#E50914" : "#FFFFFF"}
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.presetName, isSelected && { color: "#FFFFFF" }]}>
                      {preset.name}
                    </Text>
                    <Text style={styles.presetMeta}>
                      {preset.lang} • {preset.duration} • {preset.size}
                    </Text>
                  </View>
                  <View style={[styles.checkCircle, isSelected && styles.checkCircleActive]}>
                    <Text style={{ color: "#FFFFFF", fontSize: 10, fontWeight: "bold" }}>
                      {isSelected ? "✓" : ""}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* MODE 2: LIVE VOICE RECORDING */}
      {mode === "record" && (
        <View style={styles.visualizerGlassBox}>
          <View style={styles.specularShine} />

          <Text style={styles.timer}>{isRecording ? "00:02:41" : "00:00:00"}</Text>

          <View style={styles.waveformContainer}>
            {[30, 60, 90, 45, 80, 100, 60, 40, 75, 95, 50, 85, 30, 65, 45].map((h, i) => (
              <View
                key={i}
                style={[
                  styles.waveBar,
                  { height: isRecording ? `${h}%` : "15%" },
                  isRecording && styles.activeWave,
                ]}
              />
            ))}
          </View>

          <TouchableOpacity
            onPress={toggleRecord}
            style={[styles.bigRecordButton, isRecording && styles.recordingActiveBtn]}
            activeOpacity={0.85}
          >
            {isRecording ? (
              <View style={{ width: 24, height: 24, backgroundColor: "#FFFFFF", borderRadius: 4 }} />
            ) : (
              <SpatialIcon name="mic" size={32} color="#FFFFFF" />
            )}
          </TouchableOpacity>

          <Text style={styles.recordInstruction}>
            {isRecording ? "Tap Stop to Finish & Translate" : "Tap to Record Voice for Translation"}
          </Text>
        </View>
      )}

      {/* TRANSLATION OUTPUT RESULT CARD */}
      <View style={styles.translationGlassCard}>
        <View style={styles.specularShine} />

        <View style={styles.resultHeader}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <SpatialIcon name="sparkles" size={14} color="#E50914" />
            <Text style={styles.resultTitle}>
              TRANSLATION ({targetLang === "te" ? "తెలుగు" : targetLang === "en" ? "ENGLISH" : "HINDI"})
            </Text>
          </View>
          <Text style={styles.modelTag}>IndicTrans2 AI</Text>
        </View>

        {isTranslating ? (
          <View style={styles.loadingBox}>
            <Text style={styles.loadingText}>Translating audio speech with AI...</Text>
          </View>
        ) : (
          <>
            {/* Original Spoken Text */}
            <View style={styles.speechBox}>
              <Text style={styles.boxLabel}>ORIGINAL SPOKEN SPEECH ({selectedPreset.lang}):</Text>
              <Text style={styles.originalSpeechText}>{selectedPreset.originalText}</Text>
            </View>

            {/* Translated Output */}
            <View style={styles.translatedBox}>
              <Text style={[styles.boxLabel, { color: "#E5A93C" }]}>
                TRANSLATED SPEECH ({targetLang === "te" ? "తెలుగు అనువాదం" : targetLang.toUpperCase()}):
              </Text>
              <Text style={styles.translatedSpeechText}>{translatedResult}</Text>
            </View>

            {/* Action Bar: Listen & Save */}
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.listenBtn}
                onPress={() => alert(`Playing audio in ${selectedPreset.lang}`)}
                activeOpacity={0.8}
              >
                <SpatialIcon name="play" size={12} color="#FFFFFF" />
                <Text style={styles.listenBtnText}>Listen Audio</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveBtn, savedSuccess && styles.saveBtnSuccess]}
                onPress={() => setSavedSuccess(true)}
                activeOpacity={0.8}
              >
                <SpatialIcon name="shield" size={12} color="#FFFFFF" />
                <Text style={styles.saveBtnText}>
                  {savedSuccess ? "Saved in Archive ✓" : "Save to Archive"}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#141414",
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 110, // clearance for floating glass tab bar
  },
  topInfo: {
    marginBottom: 14,
  },
  pillBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 99,
    marginBottom: 8,
  },
  badge: {
    color: "#E50914",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    fontFamily: "monospace",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  sub: {
    fontSize: 12,
    color: "#AAAAAA",
    marginTop: 4,
    lineHeight: 16,
  },
  modeContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 99,
    padding: 3,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  modeTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 99,
  },
  modeTabActive: {
    backgroundColor: "#E50914",
  },
  modeTabText: {
    color: "#8E8E93",
    fontSize: 11,
    fontWeight: "600",
  },
  modeTabTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  targetLangSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    color: "#8E8E93",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  langPillsRow: {
    flexDirection: "row",
    gap: 8,
  },
  langPill: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  langPillActive: {
    backgroundColor: "rgba(229, 9, 20, 0.2)",
    borderColor: "#E50914",
  },
  langPillText: {
    fontSize: 11,
    color: "#8E8E93",
    fontWeight: "600",
  },
  langPillTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  uploadSection: {
    marginBottom: 16,
  },
  presetCard: {
    backgroundColor: "rgba(28, 28, 28, 0.75)",
    borderRadius: 18,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  presetCardSelected: {
    borderColor: "rgba(229, 9, 20, 0.6)",
    backgroundColor: "rgba(35, 25, 25, 0.85)",
  },
  presetTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  presetName: {
    fontSize: 12,
    fontWeight: "700",
    color: "#E5E5E5",
  },
  presetMeta: {
    fontSize: 10,
    color: "#8E8E93",
    marginTop: 2,
    fontFamily: "monospace",
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  checkCircleActive: {
    backgroundColor: "#E50914",
    borderColor: "#E50914",
  },
  visualizerGlassBox: {
    backgroundColor: "rgba(32, 32, 32, 0.72)",
    borderRadius: 24,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
    marginBottom: 16,
  },
  specularShine: {
    position: "absolute",
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  timer: {
    fontSize: 28,
    fontWeight: "800",
    fontFamily: "monospace",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  waveformContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    height: 48,
    width: "100%",
    marginBottom: 18,
  },
  waveBar: {
    width: 5,
    borderRadius: 2.5,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  activeWave: {
    backgroundColor: "#E50914",
  },
  bigRecordButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#E50914",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#E50914",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.65,
    shadowRadius: 16,
    elevation: 8,
  },
  recordingActiveBtn: {
    backgroundColor: "#B81D24",
    transform: [{ scale: 1.05 }],
  },
  recordInstruction: {
    fontSize: 11,
    color: "#AAAAAA",
    marginTop: 10,
  },
  translationGlassCard: {
    backgroundColor: "rgba(26, 26, 26, 0.85)",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(229, 9, 20, 0.35)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.7,
    shadowRadius: 16,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#E50914",
    letterSpacing: 0.5,
  },
  modelTag: {
    fontSize: 10,
    color: "#E5A93C",
    fontFamily: "monospace",
  },
  loadingBox: {
    paddingVertical: 30,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 12,
    color: "#AAAAAA",
  },
  speechBox: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  boxLabel: {
    fontSize: 9,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    color: "#8E8E93",
    marginBottom: 4,
    fontWeight: "700",
  },
  originalSpeechText: {
    fontSize: 12,
    color: "#E5E5E5",
    lineHeight: 18,
  },
  translatedBox: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 12,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(229, 169, 60, 0.25)",
  },
  translatedSpeechText: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "600",
    lineHeight: 20,
  },
  cardActions: {
    flexDirection: "row",
    gap: 10,
  },
  listenBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  listenBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  saveBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#E50914",
    paddingVertical: 10,
    borderRadius: 12,
  },
  saveBtnSuccess: {
    backgroundColor: "#2E7D32",
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  deviceUploadCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(229, 9, 20, 0.08)",
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "rgba(229, 9, 20, 0.4)",
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
  },
  deviceUploadIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(229, 9, 20, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  deviceUploadTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 2,
  },
  deviceUploadSub: {
    color: "#8E8E93",
    fontSize: 10,
  },
  deviceUploadButton: {
    backgroundColor: "#E50914",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  deviceUploadButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
});
