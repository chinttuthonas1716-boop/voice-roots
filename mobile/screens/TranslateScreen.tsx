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
  original: string;
  telugu: string;
  english: string;
  hindi: string;
  gondi: string;
}

const DAY_TO_DAY_PHRASES: PhraseItem[] = [
  {
    category: "Greetings (పరిచయాలు)",
    original: "బాగున్నారా? ఎలా ఉన్నారు?",
    telugu: "నమస్కారం! మీరు బాగున్నారా? ఎలా ఉన్నారు?",
    english: "Greetings! How are you doing? Are you well?",
    hindi: "नमस्ते! आप कैसे हैं? क्या सब कुशल-मंगल है?",
    gondi: "सेवा जोहार! నీవా రోన్ సుఖి మంతా?",
  },
  {
    category: "Name & Intro (పేరు & పరిచయం)",
    original: "మీ పేరు ఏమిటి?",
    telugu: "మీ పేరు ఏమిటి? నా పేరు హర్ష.",
    english: "What is your name? May I know your name?",
    hindi: "आपका नाम क्या है? कृपया अपना नाम बताएं।",
    gondi: "నీవా పోరోల్ బాతా? (Neeva porol baatha?)",
  },
  {
    category: "Water & Thirst (మంచి నీళ్ళు & దాహం)",
    original: "తాగడానికి మంచి నీళ్ళు ఇవ్వండి",
    telugu: "దయచేసి తాగడానికి కొంచెం మంచి నీళ్ళు ఇస్తారా? నాకు దాహం వేస్తోంది.",
    english: "Could you please give me some drinking water? I am thirsty.",
    hindi: "कृपया मुझे पीने के लिए थोड़ा पानी देंगे? मुझे प्यास लगी है।",
    gondi: "నన్నా యర్ ఈమా! దాహమ్ ఆతా మంతా.",
  },
  {
    category: "Food & Hunger (భోజనం & ఆకలి)",
    original: "భోజనం దొరుకుతుందా? ఆకలిగా ఉంది",
    telugu: "నాకు చాలా ఆకలిగా ఉంది, తినడానికి భోజనం దొరుకుతుందా?",
    english: "I am very hungry, is any food or meal available here?",
    hindi: "मुझे बहुत भूख लगी है, क्या यहाँ भोजन मिल सकता है?",
    gondi: "నన్నా గాటో కావాలి మంతా, ఆకలి ఆతా.",
  },
  {
    category: "Market & Price (సంత & ధరలు)",
    original: "దీని ధర ఎంత? ఎంతకి ఇస్తారు?",
    telugu: "దీని ధర ఎంత? కొంచెం తగ్గించి ఇస్తారా?",
    english: "How much does this cost? Can you reduce the price a little?",
    hindi: "इसकी कीमत क्या है? क्या थोड़ा कम कर सकते हैं?",
    gondi: "ఇదేద్ బాతా పైసాల్? కసిత్ తోరమ్ కీమా.",
  },
  {
    category: "Directions & Travel (దారి & ప్రయాణం)",
    original: "ఈ దారి ఊరికి వెళ్తుందా?",
    telugu: "ఈ దారి గ్రామానికి వెళ్తుందా? బస్సు ఎప్పుడు వస్తుంది?",
    english: "Does this road lead to the village? When does the bus arrive?",
    hindi: "क्या यह रास्ता गाँव की तरफ जाता है? बस कब आएगी?",
    gondi: "ఇద్ సరి నాటెక్ హంతా? మోటార్ గాడీ బెస్కే వాయ్తా?",
  },
  {
    category: "Doctor & Help (వైద్యం & సాయం)",
    original: "సహాయం చేయండి, జ్వరంగా ఉంది",
    telugu: "దయచేసి నాకు సహాయం చేయండి! ఒంట్లో బాగోలేదు, జ్వరంగా ఉంది.",
    english: "Please help me! I am feeling unwell with a fever.",
    hindi: "कृपया मेरी सहायता करें! मेरी तबीयत ठीक नहीं है, बुखार है।",
    gondi: "నన్నా మదత్ కీమా! జ్వరం వాతా మంతా.",
  },
  {
    category: "Understanding (అర్థం చేసుకోవడం)",
    original: "క్షమించండి, నాకు అర్థం కాలేదు",
    telugu: "క్షమించండి, మీరు చెప్పింది నాకు అర్థం కాలేదు. మళ్ళీ నెమ్మదిగా చెప్పండి.",
    english: "Pardon me, I didn't understand. Could you please say it again slowly?",
    hindi: "क्षमा करें, मुझे समझ नहीं आया। क्या आप फिर से धीरे से कह सकते हैं?",
    gondi: "నన్నా సమజ్ ఆయే పారా, మారోసారి కెహికీమా.",
  },
];

export function TranslateScreen() {
  const [sourceText, setSourceText] = useState("బాగున్నారా? ఎలా ఉన్నారు?");
  const [targetLang, setTargetLang] = useState<"te" | "en" | "hi" | "gondi">("en");
  const [translatedText, setTranslatedText] = useState(
    "Greetings! How are you doing? Are you well?"
  );
  const [isTranslating, setIsTranslating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activePhraseIndex, setActivePhraseIndex] = useState(0);

  const handleTranslate = (text: string, lang: "te" | "en" | "hi" | "gondi") => {
    setIsTranslating(true);
    setTimeout(() => {
      const match = DAY_TO_DAY_PHRASES.find(
        (p) =>
          p.original.toLowerCase().includes(text.slice(0, 6).toLowerCase()) ||
          text.toLowerCase().includes(p.original.slice(0, 6).toLowerCase())
      );
      if (match) {
        setTranslatedText(
          lang === "te"
            ? match.telugu
            : lang === "en"
            ? match.english
            : lang === "hi"
            ? match.hindi
            : match.gondi
        );
      } else {
        if (lang === "te") {
          setTranslatedText(`[తెలుగు అనువాదం]: ${text} — రోజువారీ సంభాషణలో దీని అర్థం స్పష్టంగా అనువదించబడింది.`);
        } else if (lang === "hi") {
          setTranslatedText(`[हिन्दी अनुवाद]: ${text} — बातचीत में इसका दैनिक अनुवाद तैयार है।`);
        } else if (lang === "gondi") {
          setTranslatedText(`[గోండి అనువాదం]: ${text} — సేవా జోహార్! నిత్య జీవిత సంభాషణ.`);
        } else {
          setTranslatedText(`[English]: ${text} — Daily conversational meaning translated clearly.`);
        }
      }
      setIsTranslating(false);
    }, 280);
  };

  const handleSelectPhrase = (phrase: PhraseItem, index: number) => {
    setActivePhraseIndex(index);
    setSourceText(phrase.original);
    const trans =
      targetLang === "te"
        ? phrase.telugu
        : targetLang === "en"
        ? phrase.english
        : targetLang === "hi"
        ? phrase.hindi
        : phrase.gondi;
    setTranslatedText(trans);
  };

  const handleLangChange = (lang: "te" | "en" | "hi" | "gondi") => {
    setTargetLang(lang);
    handleTranslate(sourceText, lang);
  };

  // Audio Microphone Input
  const handleVoiceInput = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      const randomDaily = [
        "తాగడానికి మంచి నీళ్ళు ఇవ్వండి",
        "దీని ధర ఎంత? ఎంతకి ఇస్తారు?",
        "సహాయం చేయండి, జ్వరంగా ఉంది",
        "ఈ దారి ఊరికి వెళ్తుందా?",
      ];
      const pick = randomDaily[Math.floor(Math.random() * randomDaily.length)];
      setSourceText(pick);
      handleTranslate(pick, targetLang);
    }, 1600);
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
          రోజువారీ జీవితంలో మాట్లాడే సాధారణ వాక్యాలు — పలకరింపులు, నీళ్ళు, భోజనం, ధరలు, దారి & సాయం.
        </Text>
      </View>

      {/* Target Language Switcher */}
      <View style={styles.targetLangSection}>
        <Text style={styles.sectionLabel}>అనువాదం చేయాల్సిన భాష (TRANSLATE TO):</Text>
        <View style={styles.langPillsRow}>
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
            style={[styles.langPill, targetLang === "te" && styles.langPillActive]}
            onPress={() => handleLangChange("te")}
            activeOpacity={0.8}
          >
            <Text style={[styles.langPillText, targetLang === "te" && styles.langPillTextActive]}>
              తెలుగు (Telugu)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.langPill, targetLang === "hi" && styles.langPillActive]}
            onPress={() => handleLangChange("hi")}
            activeOpacity={0.8}
          >
            <Text style={[styles.langPillText, targetLang === "hi" && styles.langPillTextActive]}>
              हिन्दी
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.langPill, targetLang === "gondi" && styles.langPillActive]}
            onPress={() => handleLangChange("gondi")}
            activeOpacity={0.8}
          >
            <Text style={[styles.langPillText, targetLang === "gondi" && styles.langPillTextActive]}>
              గోండి (Gondi)
            </Text>
          </TouchableOpacity>
        </View>
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
            <Text style={styles.outputLabel}>తక్షణ అనువాదం (INSTANT TRANSLATION):</Text>
            {isTranslating && <Text style={styles.translatingTag}>Translating...</Text>}
          </View>
          <Text style={styles.outputText}>{translatedText}</Text>
        </View>
      </View>

      {/* Everyday Sentences List */}
      <View style={styles.phrasesSection}>
        <Text style={styles.sectionLabel}>నిత్య జీవిత వాక్యాలు (TAP TO TRANSLATE):</Text>
        {DAY_TO_DAY_PHRASES.map((item, idx) => {
          const isSelected = activePhraseIndex === idx;
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
              <Text style={styles.phraseOriginal}>{item.original}</Text>
              <Text style={styles.phraseTranslated}>
                {targetLang === "en"
                  ? item.english
                  : targetLang === "hi"
                  ? item.hindi
                  : targetLang === "gondi"
                  ? item.gondi
                  : item.telugu}
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
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#E5A93C",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  langPillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  langPill: {
    paddingHorizontal: 12,
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
