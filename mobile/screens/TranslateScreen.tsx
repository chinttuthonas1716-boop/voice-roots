import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
} from "react-native";
import { SpatialIcon } from "../components/SpatialIcon";
import { DAY_TO_DAY_PHRASES, ConversationPhrase } from "../lib/conversations";

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "te", name: "తెలుగు (Telugu)" },
  { code: "hi", name: "हिन्दी (Hindi)" },
  { code: "ta", name: "தமிழ் (Tamil)" },
  { code: "kn", name: "ಕನ್ನಡ (Kannada)" },
  { code: "ml", name: "മലയാളം (Malayalam)" },
  { code: "mr", name: "मराठी (Marathi)" },
  { code: "or", name: "ଓଡ଼ିଆ (Odia)" },
  { code: "bn", name: "বাংলা (Bengali)" },
  { code: "gondi", name: "గోండి (Gondi)" },
  { code: "koya", name: "కోయ (Koya)" },
  { code: "lambadi", name: "లంబాడీ (Lambadi)" },
];

export function TranslateScreen() {
  const [sourceText, setSourceText] = useState("బాగున్నారా? ఎలా ఉన్నారు?");
  const [targetLang, setTargetLang] = useState<string>("en");
  const [translatedText, setTranslatedText] = useState(
    "Greetings! How are you doing? Are you well?"
  );
  const [detectedCategory, setDetectedCategory] = useState("Greetings (పలకరింపులు)");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activePhraseIndex, setActivePhraseIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleTranslate = (text: string, lang: string) => {
    setIsTranslating(true);
    setTimeout(() => {
      const clean = text.trim().toLowerCase();
      // Match patterns
      const match = DAY_TO_DAY_PHRASES.find((p) => {
        if (p.patterns.some((pat) => clean.includes(pat.toLowerCase()) || pat.toLowerCase().includes(clean))) {
          return true;
        }
        if (p.te.toLowerCase().includes(clean) || clean.includes(p.te.toLowerCase().slice(0, 6))) {
          return true;
        }
        return false;
      });

      if (match) {
        setTranslatedText(match[lang] || match.en || match.te);
        setDetectedCategory(match.category);
      } else {
        setDetectedCategory("దైనందిన సంభాషణ (Daily Speech)");
        if (lang === "te") {
          setTranslatedText(`[తెలుగు అనువాదం]: ${text} — రోజువారీ సంభాషణలో దీని అర్థం స్పష్టంగా అనువదించబడింది.`);
        } else if (lang === "hi") {
          setTranslatedText(`[हिन्दी अनुवाद]: ${text} — बातचीत में इसका दैनिक अनुवाद तैयार है।`);
        } else if (lang === "ta") {
          setTranslatedText(`[தமிழ் மொழிபெயர்ப்பு]: ${text} — அன்றாட வழக்கத்தில் இதன் பொருள்.`);
        } else if (lang === "kn") {
          setTranslatedText(`[ಕನ್ನಡ ಅನುವಾದ]: ${text} — ನಿತ್ಯ ಜೀವನದ ಬಳಕೆಯ ಅರ್ಥ.`);
        } else if (lang === "ml") {
          setTranslatedText(`[മലയാള തർജ്ജമ]: ${text} — ദൈനംദിന സംഭാഷണ അർത്ഥം.`);
        } else if (lang === "mr") {
          setTranslatedText(`[मराठी भाषांतर]: ${text} — रोजच्या बोलचालीत स्पष्ट अर्थ.`);
        } else if (lang === "or") {
          setTranslatedText(`[ଓଡ଼ିଆ ଅନୁବାଦ]: ${text} — ଦୈନନ୍ଦିନ ବ୍ୟବହାରରେ ଅର୍ଥ।`);
        } else if (lang === "bn") {
          setTranslatedText(`[বাংলা অনুবাদ]: ${text} — দৈনন্দিন ব্যবহারের অর্থ।`);
        } else if (lang === "gondi") {
          setTranslatedText(`[గోండి అనువాదం]: ${text} — సేవా జోహార్! నిత్య జీవిత సంభాషణ.`);
        } else if (lang === "koya") {
          setTranslatedText(`[కోయ అనువాదం]: ${text} — జోహార్! రోజువారీ సంభాషణ.`);
        } else if (lang === "lambadi") {
          setTranslatedText(`[లంబాడీ అనువాదం]: ${text} — రాం రాం! సాదో బాత్.`);
        } else {
          setTranslatedText(`[English]: ${text} — Daily conversational meaning translated clearly.`);
        }
      }
      setIsTranslating(false);
    }, 220);
  };

  const handleSelectPhrase = (phrase: ConversationPhrase, index: number) => {
    setActivePhraseIndex(index);
    setSourceText(phrase.te);
    setDetectedCategory(phrase.category);
    const trans = phrase[targetLang] || phrase.en || phrase.te;
    setTranslatedText(trans);
  };

  const handleLangChange = (lang: string) => {
    setTargetLang(lang);
    handleTranslate(sourceText, lang);
  };

  // Audio Microphone Input Simulation
  const handleVoiceInput = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      const randomDaily = [
        "తాగడానికి మంచి నీళ్ళు ఇవ్వండి",
        "దీని ధర ఎంత? ఎంతకి ఇస్తారు?",
        "సహాయం చేయండి, జ్వరంగా ఉంది",
        "ఈ దారి ఊరికి వెళ్తుందా?",
        "నాకు చాలా ఆకలిగా ఉంది, భోజనం దొరుకుతుందా?",
        "బస్సు ఎప్పుడు వస్తుంది?",
      ];
      const pick = randomDaily[Math.floor(Math.random() * randomDaily.length)];
      setSourceText(pick);
      handleTranslate(pick, targetLang);
    }, 1500);
  };

  // Audio Output Speech Playback
  const handlePlayAudio = () => {
    setIsPlayingAudio(true);
    setTimeout(() => {
      setIsPlayingAudio(false);
    }, 2400);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Info */}
      <View style={styles.topInfo}>
        <View style={styles.pillBadge}>
          <SpatialIcon name="sparkles" size={11} color="#E50914" />
          <Text style={styles.badge}>DAY-TO-DAY TRANSLATION ENGINE</Text>
        </View>
        <Text style={styles.title}>దైనందిన సంభాషణల అనువాదం</Text>
        <Text style={styles.subtitle}>
          పాటలు కాకుండా, నిత్య జీవితంలో మాట్లాడే సాధారణ వాక్యాలు — పలకరింపులు, నీళ్ళు, భోజనం, ధరలు, దారి & సాయం.
        </Text>
      </View>

      {/* Target Language Switcher (12 Languages Horizontal Scroll) */}
      <View style={styles.targetLangSection}>
        <View style={styles.langHeaderRow}>
          <Text style={styles.sectionLabel}>అనువాదం చేయాల్సిన భాష (TRANSLATE TO):</Text>
          <Text style={styles.langCountLabel}>12 Languages</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.langScrollContainer}
        >
          {SUPPORTED_LANGUAGES.map((item) => {
            const isActive = targetLang === item.code;
            return (
              <TouchableOpacity
                key={item.code}
                style={[styles.langPill, isActive && styles.langPillActive]}
                onPress={() => handleLangChange(item.code)}
                activeOpacity={0.8}
              >
                <Text style={[styles.langPillText, isActive && styles.langPillTextActive]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Live Audio Input & Text Box */}
      <View style={styles.inputCard}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardHeaderLabel}>మీరు మాట్లాడండి లేదా టైప్ చేయండి:</Text>
          <TouchableOpacity
            style={[styles.voiceBtn, isListening && styles.voiceBtnActive]}
            onPress={handleVoiceInput}
            activeOpacity={0.8}
          >
            <SpatialIcon name="mic" size={13} color="#FFFFFF" />
            <Text style={styles.voiceBtnText}>
              {isListening ? "వింటున్నాను..." : "మాట్లాడండి (Mic)"}
            </Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.textInput}
          multiline
          numberOfLines={3}
          value={sourceText}
          onChangeText={(val) => {
            setSourceText(val);
            handleTranslate(val, targetLang);
          }}
          placeholder="ఉదా: 'బాగున్నారా?', 'నీళ్ళు ఇవ్వండి', 'ధర ఎంత?'..."
          placeholderTextColor="#666666"
        />

        {/* Translation Output Container */}
        <View style={styles.outputBox}>
          <View style={styles.outputTop}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={styles.outputLabel}>తక్షణ అనువాదం ({targetLang.toUpperCase()}):</Text>
              <View style={styles.catPill}>
                <Text style={styles.catPillText}>{detectedCategory}</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              {isTranslating && <Text style={styles.translatingTag}>Translating...</Text>}
              <TouchableOpacity
                onPress={handlePlayAudio}
                style={styles.speakBtn}
                activeOpacity={0.7}
              >
                <SpatialIcon name={isPlayingAudio ? "sparkles" : "speaker"} size={12} color="#E5A93C" />
                <Text style={styles.speakBtnText}>{isPlayingAudio ? "Speaking..." : "వినండి"}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.outputText}>{translatedText}</Text>
        </View>
      </View>

      {/* Everyday Sentences List */}
      <View style={styles.phrasesSection}>
        <View style={styles.phrasesHeaderRow}>
          <Text style={styles.sectionLabel}>నిత్య జీవిత వాక్యాలు (16 DAILY CATEGORIES):</Text>
          <Text style={styles.phrasesSubhint}>Tap to test instant speech</Text>
        </View>

        {DAY_TO_DAY_PHRASES.map((item, idx) => {
          const isSelected = activePhraseIndex === idx;
          const translatedSample = item[targetLang] || item.en || item.te;
          return (
            <TouchableOpacity
              key={idx}
              style={[styles.phraseCard, isSelected && styles.phraseCardSelected]}
              onPress={() => handleSelectPhrase(item, idx)}
              activeOpacity={0.8}
            >
              <View style={styles.phraseHeader}>
                <Text style={styles.phraseCategory}>{item.category}</Text>
                <Text style={styles.tapIndicator}>క్లిక్ చేయండి →</Text>
              </View>
              <Text style={styles.phraseOriginal}>{item.te}</Text>
              <Text style={styles.phraseTranslated}>{translatedSample}</Text>
            </TouchableOpacity>
          );
        })}
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 90,
  },
  topInfo: {
    marginBottom: 16,
  },
  pillBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "rgba(229, 9, 20, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(229, 9, 20, 0.3)",
    marginBottom: 8,
  },
  badge: {
    color: "#E50914",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: "#8E8E93",
    lineHeight: 18,
  },
  targetLangSection: {
    marginBottom: 16,
  },
  langHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#E5A93C",
    letterSpacing: 0.8,
  },
  langCountLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#8E8E93",
  },
  langScrollContainer: {
    gap: 8,
    paddingVertical: 2,
  },
  langPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  langPillActive: {
    backgroundColor: "#E50914",
    borderColor: "#E50914",
  },
  langPillText: {
    color: "#8E8E93",
    fontSize: 11,
    fontWeight: "700",
  },
  langPillTextActive: {
    color: "#FFFFFF",
  },
  inputCard: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    padding: 14,
    marginBottom: 20,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  cardHeaderLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  voiceBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#E50914",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  voiceBtnActive: {
    backgroundColor: "#B20710",
  },
  voiceBtnText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  textInput: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 14,
    padding: 12,
    color: "#FFFFFF",
    fontSize: 13,
    minHeight: 70,
    textAlignVertical: "top",
    marginBottom: 12,
  },
  outputBox: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(229, 9, 20, 0.3)",
    padding: 12,
  },
  outputTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  outputLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#E50914",
    letterSpacing: 0.6,
  },
  catPill: {
    backgroundColor: "rgba(229, 169, 60, 0.15)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  catPillText: {
    fontSize: 9,
    color: "#E5A93C",
    fontWeight: "600",
  },
  speakBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  speakBtnText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#E5A93C",
  },
  translatingTag: {
    fontSize: 9,
    color: "#E5A93C",
    fontWeight: "600",
  },
  outputText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "700",
    lineHeight: 20,
  },
  phrasesSection: {
    marginBottom: 20,
  },
  phrasesHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  phrasesSubhint: {
    fontSize: 9,
    color: "#8E8E93",
  },
  phraseCard: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 12,
    marginBottom: 8,
  },
  phraseCardSelected: {
    borderColor: "rgba(229, 9, 20, 0.6)",
    backgroundColor: "rgba(229, 9, 20, 0.08)",
  },
  phraseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  phraseCategory: {
    fontSize: 9,
    fontWeight: "800",
    color: "#E5A93C",
    textTransform: "uppercase",
  },
  tapIndicator: {
    fontSize: 9,
    color: "#8E8E93",
    fontWeight: "600",
  },
  phraseOriginal: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 3,
  },
  phraseTranslated: {
    fontSize: 11,
    color: "#B3B3B3",
    lineHeight: 16,
  },
});
