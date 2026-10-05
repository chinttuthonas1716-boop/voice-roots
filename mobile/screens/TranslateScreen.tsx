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

interface PhraseItem {
  category: string;
  dialect: string;
  original: string;
  telugu: string;
  english: string;
  hindi: string;
}

const DAILY_PHRASES: PhraseItem[] = [
  {
    category: "Elder Greetings (మర్యాదపూర్వక నమస్కారం)",
    dialect: "Gondi (Bastar)",
    original: "सेवा जोहार! नीवा रोन सुखी मंता?",
    telugu: "సేవ జోహార్! మీ ఇంట్లో అందరూ క్షేమంగా ఉన్నారా?",
    english: "Greetings of respect! Is everyone in your household blessed and well?",
    hindi: "सादर प्रणाम! क्या आपके घर में सब कुशल-मंगल हैं?",
  },
  {
    category: "Farming & Weather (వ్యవసాయం & వర్షం)",
    dialect: "Telugu (Agency Tribal)",
    original: "ఈ ఏడాది తొలకరి వానలు ఎప్పుడు వస్తాయో? ఆకాశంలో మబ్బులు కమ్ముకుంటున్నాయి.",
    telugu: "ఈ ఏడాది తొలకరి వానలు ఎప్పుడు వస్తాయో? ఆకాశంలో మబ్బులు కమ్ముకుంటున్నాయి.",
    english: "When will the first monsoon showers arrive this season? The storm clouds are beginning to gather.",
    hindi: "इस साल पहली मानसूनी बारिश कब आएगी? आसमान में बादल घिरने लगे हैं।",
  },
  {
    category: "Forest Medicine (అడవి మూలికా వైద్యం)",
    dialect: "Koya (Godavari Valley)",
    original: "ఈ ఆకు రసాన్ని వేడి నీటిలో కలిపి తాగితే పాత జ్వరాలు తగ్గుతాయి.",
    telugu: "ఈ ఆకు రసాన్ని వేడి నీటిలో కలిపి తాగితే పాత జ్వరాలు తగ్గుతాయి.",
    english: "If you blend the juice of this forest leaf with warm water, recurring fevers will subside.",
    hindi: "यदि इस जंगली पत्ते के रस को गुनगुने पानी में मिलाकर पिएं, तो पुराना बुखार ठीक हो जाता है।",
  },
  {
    category: "Living Root Bridges (సజీవ వేరు వంతెన)",
    dialect: "Khasi (Sohra Valley)",
    original: "Ki thied dieng ki donkam por ban san bad ban long jingkieng ba skhem.",
    telugu: "చెట్ల వేర్లు కొండ వాగులపై దృఢమైన సజీవ వంతెనగా మారడానికి ఓపిక మరియు సమయం అవసరం.",
    english: "The tree roots require patience and time to grow into an unyielding, living bridge across the gorge.",
    hindi: "पेड़ों की जड़ों को घाटी के पार एक अटूट जीवित पुल बनने के लिए समय और धैर्य की आवश्यकता होती है।",
  },
];

export function TranslateScreen() {
  const [sourceText, setSourceText] = useState("सेवा जोहार! नीवा रोन सुखी मंता?");
  const [targetLang, setTargetLang] = useState<"te" | "en" | "hi">("te");
  const [translatedText, setTranslatedText] = useState(
    "సేవ జోహార్! మీ ఇంట్లో అందరూ క్షేమంగా ఉన్నారా?"
  );
  const [isTranslating, setIsTranslating] = useState(false);
  const [activePhraseIndex, setActivePhraseIndex] = useState(0);

  const handleTranslate = (text: string, lang: "te" | "en" | "hi") => {
    setIsTranslating(true);
    setTimeout(() => {
      // Find match in phrase bank or translate
      const match = DAILY_PHRASES.find(
        (p) => p.original.toLowerCase().includes(text.slice(0, 10).toLowerCase())
      );
      if (match) {
        setTranslatedText(
          lang === "te" ? match.telugu : lang === "en" ? match.english : match.hindi
        );
      } else {
        if (lang === "te") {
          setTranslatedText(`[తెలుగు అనువాదం]: ${text} - పూర్వీకుల మౌఖిక జ్ఞానం అనువదించబడింది.`);
        } else if (lang === "hi") {
          setTranslatedText(`[हिन्दी अनुवाद]: ${text} - पूर्वजों का मौखिक ज्ञान अनुवादित किया गया।`);
        } else {
          setTranslatedText(`[English Translation]: ${text} - Ancestral wisdom translated.`);
        }
      }
      setIsTranslating(false);
    }, 350);
  };

  const handleSelectPhrase = (phrase: PhraseItem, index: number) => {
    setActivePhraseIndex(index);
    setSourceText(phrase.original);
    setTranslatedText(
      targetLang === "te" ? phrase.telugu : targetLang === "en" ? phrase.english : phrase.hindi
    );
  };

  const handleLangChange = (lang: "te" | "en" | "hi") => {
    setTargetLang(lang);
    handleTranslate(sourceText, lang);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Info */}
      <View style={styles.topInfo}>
        <View style={styles.pillBadge}>
          <SpatialIcon name="sparkles" size={11} color="#E50914" />
          <Text style={styles.badge}>DAY-TO-DAY TRANSLATION (రోజూవారీ అనువాదం)</Text>
        </View>
        <Text style={styles.title}>Day-to-Day Oral Translator</Text>
        <Text style={styles.sub}>
          Real-time translation between 24 tribal dialects and Telugu, English & Hindi.
        </Text>
      </View>

      {/* Target Language Switcher */}
      <View style={styles.targetLangSection}>
        <Text style={styles.sectionLabel}>TRANSLATE TO (అనువాద భాష):</Text>
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

      {/* Input Box */}
      <View style={styles.card}>
        <View style={styles.boxHeader}>
          <Text style={styles.boxHeaderTitle}>ORAL DIALECT INPUT (మాట్లాడిన లేదా టైప్ చేసిన వాక్యం):</Text>
          <TouchableOpacity
            onPress={() => {
              setSourceText("ఈ ఏడాది తొలకరి వానలు ఎప్పుడు వస్తాయో?");
              handleTranslate("ఈ ఏడాది తొలకరి వానలు ఎప్పుడు వస్తాయో?", targetLang);
            }}
            style={styles.micBtn}
          >
            <SpatialIcon name="mic" size={13} color="#FFFFFF" />
            <Text style={styles.micBtnText}>Voice Input</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.inputArea}
          value={sourceText}
          onChangeText={(val) => {
            setSourceText(val);
            handleTranslate(val, targetLang);
          }}
          placeholder="Enter or paste oral dialect text..."
          placeholderTextColor="#666666"
          multiline
        />
      </View>

      {/* Translated Result Box */}
      <View style={[styles.card, styles.resultCard]}>
        <View style={styles.boxHeader}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <SpatialIcon name="globe" size={13} color="#E5A93C" />
            <Text style={[styles.boxHeaderTitle, { color: "#E5A93C" }]}>
              {targetLang === "te"
                ? "తెలుగు అనువాదం (TELUGU TRANSLATION)"
                : targetLang === "en"
                ? "ENGLISH TRANSLATION"
                : "HINDI TRANSLATION"}
            </Text>
          </View>
          <Text style={styles.modelTag}>IndicTrans2</Text>
        </View>

        {isTranslating ? (
          <Text style={styles.translatingNotice}>Translating with AI...</Text>
        ) : (
          <Text style={styles.resultText}>{translatedText}</Text>
        )}
      </View>

      {/* Everyday Conversational Phrase Bank */}
      <View style={styles.phraseBankSection}>
        <Text style={styles.sectionLabel}>COMMON DAY-TO-DAY CONVERSATIONS (నిత్య జీవిత సంభాషణలు):</Text>

        {DAILY_PHRASES.map((phrase, idx) => {
          const isSelected = activePhraseIndex === idx;
          return (
            <TouchableOpacity
              key={idx}
              style={[styles.phraseCard, isSelected && styles.phraseCardSelected]}
              onPress={() => handleSelectPhrase(phrase, idx)}
              activeOpacity={0.8}
            >
              <View style={styles.phraseTopRow}>
                <Text style={styles.phraseCategory}>{phrase.category}</Text>
                <Text style={styles.phraseDialect}>{phrase.dialect}</Text>
              </View>

              <Text style={styles.phraseOriginal}>{phrase.original}</Text>
              <Text style={styles.phraseTranslation}>
                "{targetLang === "te" ? phrase.telugu : targetLang === "en" ? phrase.english : phrase.hindi}"
              </Text>
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
  targetLangSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    color: "#8E8E93",
    marginBottom: 8,
    letterSpacing: 0.5,
    fontWeight: "700",
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
  card: {
    backgroundColor: "rgba(26, 26, 26, 0.85)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 14,
  },
  resultCard: {
    borderColor: "rgba(229, 169, 60, 0.35)",
  },
  boxHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  boxHeaderTitle: {
    fontSize: 9,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    color: "#8E8E93",
    fontWeight: "700",
  },
  micBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E50914",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  micBtnText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  inputArea: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 18,
    minHeight: 50,
  },
  resultText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  translatingNotice: {
    color: "#E50914",
    fontSize: 12,
    fontStyle: "italic",
  },
  modelTag: {
    fontSize: 9,
    color: "#E5A93C",
    fontFamily: "monospace",
  },
  phraseBankSection: {
    marginTop: 6,
  },
  phraseCard: {
    backgroundColor: "rgba(28, 28, 28, 0.7)",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  phraseCardSelected: {
    borderColor: "rgba(229, 9, 20, 0.5)",
    backgroundColor: "rgba(35, 25, 25, 0.8)",
  },
  phraseTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  phraseCategory: {
    fontSize: 10,
    color: "#E5A93C",
    fontWeight: "700",
  },
  phraseDialect: {
    fontSize: 10,
    color: "#8E8E93",
    fontFamily: "monospace",
  },
  phraseOriginal: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  phraseTranslation: {
    fontSize: 11,
    color: "#AAAAAA",
    lineHeight: 16,
  },
});
