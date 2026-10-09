"use client";

import { useState, useEffect } from "react";
import {
  Mic,
  Volume2,
  Copy,
  Check,
  Sparkles,
  ArrowRightLeft,
  Coffee,
  Navigation,
  HeartPulse,
  ShoppingBag,
  Users,
  Languages,
  BookOpen,
  ChevronDown,
  Globe,
  Trees,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { AIAssistant } from "@/components/ai/AIAssistant";

interface SourceLanguage {
  code: string;
  name: string;
  native: string;
  speechCode: string;
  category: "indigenous" | "regional" | "standard";
  placeholder: string;
}

const SOURCE_LANGS: SourceLanguage[] = [
  {
    code: "te",
    name: "Telugu",
    native: "తెలుగు",
    speechCode: "te-IN",
    category: "regional",
    placeholder: "ఉదాహరణ: 'బాగున్నారా?', 'మంచి నీళ్ళు ఇవ్వండి', 'దీని ధర ఎంత?'...",
  },
  {
    code: "gondi",
    name: "Gondi",
    native: "గోండీ (Gondi)",
    speechCode: "te-IN",
    category: "indigenous",
    placeholder: "ఉదాహరణ: 'సేవా జోహార్', 'బాబో బాటో', 'ఏర్ మాయుం'...",
  },
  {
    code: "koya",
    name: "Koya",
    native: "కోయ (Koya)",
    speechCode: "te-IN",
    category: "indigenous",
    placeholder: "ఉదాహరణ: 'ఈ మూలిక వేరు జ్వరానికి మంచిది'...",
  },
  {
    code: "hi",
    name: "Hindi",
    native: "हिन्दी",
    speechCode: "hi-IN",
    category: "regional",
    placeholder: "उदाहरण: 'आप कैसे हैं?', 'मुझे पानी चाहिए', 'इसका दाम क्या है?'...",
  },
  {
    code: "ta",
    name: "Tamil",
    native: "தமிழ்",
    speechCode: "ta-IN",
    category: "regional",
    placeholder: "உதாரணம்: 'எப்படி இருக்கிறீர்கள்?', 'குடிநீர் கிடைக்குமா?'...",
  },
  {
    code: "kn",
    name: "Kannada",
    native: "ಕನ್ನಡ",
    speechCode: "kn-IN",
    category: "regional",
    placeholder: "ಉದಾಹರಣೆ: 'ನೀವು ಹೇಗಿದ್ದೀರಾ?', 'ದಯವಿಟ್ಟು ನೀರು ಕೊಡಿ'...",
  },
  {
    code: "ml",
    name: "Malayalam",
    native: "മലയാളം",
    speechCode: "ml-IN",
    category: "regional",
    placeholder: "ഉദാഹരണം: 'സുഖമാണോ?', 'കുടിവെള്ളം ലഭിക്കുമോ?'...",
  },
  {
    code: "mr",
    name: "Marathi",
    native: "मराठी",
    speechCode: "mr-IN",
    category: "regional",
    placeholder: "उदाहरण: 'तुम्ही कसे आहात?', 'मला पाणी हवे आहे'...",
  },
  {
    code: "or",
    name: "Odia",
    native: "ଓଡ଼ିଆ",
    speechCode: "or-IN",
    category: "regional",
    placeholder: "ଉଦାହରଣ: 'ଆପଣ କେମିତି ଅଛନ୍ତି?', 'ଏହାର ମୂଲ୍ୟ କେତେ?'...",
  },
  {
    code: "bn",
    name: "Bengali",
    native: "বাংলা",
    speechCode: "bn-IN",
    category: "regional",
    placeholder: "উদাহরণ: 'আপনি কেমন আছেন?', 'একটু জল দেবেন?'...",
  },
  {
    code: "sat",
    name: "Santhali",
    native: "ᱥᱟᱱᱛᱟᱲᱤ",
    speechCode: "hi-IN",
    category: "indigenous",
    placeholder: "ᱡᱚᱦᱟᱨ (Johar), ᱪᱮᱫ ᱞᱮᱠᱟ ᱢᱮᱱᱟᱜ ᱵᱤᱱᱟ?...",
  },
  {
    code: "lam",
    name: "Lambadi / Banjara",
    native: "లంబాడీ (Banjara)",
    speechCode: "te-IN",
    category: "indigenous",
    placeholder: "ఉదాహరణ: 'రామ్ రామ్ బాపూ', 'తాండా సగా'...",
  },
  {
    code: "en",
    name: "English",
    native: "English",
    speechCode: "en-US",
    category: "standard",
    placeholder: "e.g., 'Hello, how are you?', 'Could I get water?', 'What is the price?'...",
  },
];

const TARGET_LANGS = [
  { code: "en", name: "English", label: "English", speechCode: "en-US" },
  { code: "te", name: "Telugu", label: "తెలుగు", speechCode: "te-IN" },
  { code: "hi", name: "Hindi", label: "हिन्दी", speechCode: "hi-IN" },
  { code: "ta", name: "Tamil", label: "தமிழ்", speechCode: "ta-IN" },
  { code: "kn", name: "Kannada", label: "ಕನ್ನಡ", speechCode: "kn-IN" },
  { code: "ml", name: "Malayalam", label: "മലയാളം", speechCode: "ml-IN" },
  { code: "mr", name: "Marathi", label: "मराठी", speechCode: "mr-IN" },
  { code: "bn", name: "Bengali", label: "বাংলা", speechCode: "bn-IN" },
] as const;

interface DayPhrase {
  category: string;
  te: string;
  en: string;
  hi: string;
  ta: string;
  kn: string;
  ml: string;
  mr?: string;
  bn?: string;
  gondi?: string;
  koya?: string;
  sat?: string;
  lam?: string;
}

const DAILY_PHRASES: DayPhrase[] = [
  {
    category: "Greetings (మర్యాదపూర్వక పలకరింపులు)",
    te: "నమస్కారం, మీరు బాగున్నారా?",
    en: "Hello, how are you doing?",
    hi: "नमस्ते, आप कैसे हैं?",
    ta: "வணக்கம், நீங்கள் எப்படி இருக்கிறீர்கள்?",
    kn: "ನಮಸ್ಕಾರ, ನೀವು ಹೇಗಿದ್ದೀರಾ?",
    ml: "നമസ്കാരം, സുഖമാണോ?",
    mr: "नमस्कार, तुम्ही कसे आहात?",
    bn: "নমস্কার, আপনি কেমন আছেন?",
    gondi: "సేవా జోహార్, బాబో బాటో?",
    koya: "జోహార్, అందరూ సుఖంగా ఉన్నారా?",
    sat: "ᱡᱚᱦᱟᱨ, ᱪᱮᱫ ᱞᱮᱠᱟ ᱢᱮᱱᱟᱜ ᱵᱤᱱᱟ?",
    lam: "రామ్ రామ్ బావ, కైసో చే?",
  },
  {
    category: "Food & Water (ఆహారం & త్రాగునీరు)",
    te: "దయచేసి మంచి నీళ్ళు లేదా తాజా భోజనం దొరుకుతుందా?",
    en: "Could I please get some drinking water or a fresh meal?",
    hi: "कृपया क्या मुझे पीने का पानी या भोजन मिल सकता है?",
    ta: "தயவுசெய்து குடிநீர் அல்லது உணவு கிடைக்குமா?",
    kn: "ದಯವಿಟ್ಟು ಕುಡಿಯುವ ನೀರು ಅಥವಾ ಊಟ ಸಿಗುತ್ತದೆಯೇ?",
    ml: "കുടിവെള്ളമോ ഭക്ഷണമോ ലഭിക്കുമോ?",
    mr: "कृपया पिण्याचे पाणी किंवा जेवण मिळू शकेल का?",
    bn: "দয়া করে একটু খাবার জল বা খাবার পাওয়া যাবে?",
    gondi: "ఏర్ మాయుం ఆహార్ దొరుకుతుందా?",
    koya: "ఈ రాత్రికి తాజా అంబలి లేదా నీరు ఇవ్వండి.",
    sat: "ᱫᱟᱜ ᱟᱨ ᱡᱚᱢᱟᱜ ᱧᱟᱢᱚᱜ-ᱟ?",
    lam: "పాణి ఓర్ రోటీ మళ్సే కా?",
  },
  {
    category: "Directions & Travel (దారి & ప్రయాణం)",
    te: "మా ఊరి చెరువు వైపు వెళ్ళడానికి సరైన దారి ఎక్కడ?",
    en: "Which is the correct way towards our village lake?",
    hi: "गाँव के तालाब की ओर जाने का सही रास्ता कौन सा है?",
    ta: "கிராமத்துக் குளம் செல்லும் வழி எது?",
    kn: "ಹಳ್ಳಿಯ ಕೆರೆಯ ಕಡೆಗೆ ಹೋಗುವ ದಾರಿ ಯಾವುದು?",
    ml: "ഗ്രാമത്തിലെ കുളത്തിലേക്കുള്ള വഴി ഏതാണ്?",
    mr: "गावातील तलावाकडे जाणारा योग्य रस्ता कोणता आहे?",
    bn: "গ্রামের পুকুরের দিকে যাওয়ার সঠিক রাস্তা কোনটি?",
    gondi: "సగా దారో బాబో గుట్ట వైపు?",
    koya: "ఏటి ఒడ్డున ఉన్న చెట్టు దారిన నడవండి.",
    sat: "ᱟᱹᱛᱩ ᱯᱩᱠᱷᱨᱤ ᱥᱮᱫ ᱥᱮᱱᱚᱜ ᱦᱚᱨ ᱚᱠᱟ ᱴᱟᱜ?",
    lam: "గోరార్ వాటె కిదర్ ఛే?",
  },
  {
    category: "Market & Trade (సంత & కొనుగోలు)",
    te: "ఈ అడవి పసుపు మరియు తాజా తేనె ధర ఎంత?",
    en: "What is the price of this wild turmeric and fresh forest honey?",
    hi: "इस जंगली हल्दी और शुद्ध शहद का क्या मूल्य है?",
    ta: "இந்த காட்டு மஞ்சள் மற்றும் சுத்தமான தேனின் விலை என்ன?",
    kn: "ಈ ಕಾಡು ಅರಿಶಿನ ಮತ್ತು ಜೇನುತುಪ್ಪದ ಬೆಲೆ ಎಷ್ಟು?",
    ml: "ഈ കാട്ടു മഞ്ഞളിനും തേനിനും എത്രയാണ് വില?",
    mr: "या रानटी हळदीचा आणि ताज्या मधाचा भाव काय आहे?",
    bn: "এই বুনো হলুদ এবং তাজা মধুর দাম কত?",
    gondi: "ఏర్ తేనె మూలిక బాట్ మూల్యం?",
    koya: "కొండ తేనె బుట్ట వెల ఎంత చెబుతున్నారు?",
    sat: "ᱱᱚᱣᱟ ᱵᱤᱨ ᱥᱟᱥᱟᱝ ᱟᱨ ᱧᱮᱞᱮ ᱨᱟᱥᱟ ᱨᱮᱱᱟᱜ ᱫᱟᱢ ᱛᱤᱱᱟᱹᱜ?",
    lam: "ఈ హళదీ నే మహుడార్ దామ్ కిత్తో?",
  },
  {
    category: "Health & Healing (ఆరోగ్యం & నాటువైద్యం)",
    te: "వర్షాకాలపు జ్వరానికి ఈ మూలికా వేరు కషాయం త్రాగండి.",
    en: "Drink this herbal root decoction for monsoon seasonal fever.",
    hi: "बरसाती बुखार के लिए यह जड़ी-बूटी का काढ़ा पिएं।",
    ta: "மழைக்கால காய்ச்சலுக்கு இந்த மூலிகைக் குடிநீரைக் குடியுங்கள்.",
    kn: "ಮಳೆಗಾಲದ ಜ್ವರಕ್ಕೆ ಈ ಗಿಡಮೂಲಿಕೆಯ ಕಷಾಯವನ್ನು ಕುಡಿಯಿರಿ.",
    ml: "മഴക്കാലത്തെ പനിക്ക് ഈ ഔഷധ കഷായം കുടിക്കുക.",
    mr: "पावसाळी तापासाठी हा वनौषधी मुळांचा काढा प्या.",
    bn: "বর্ষার জ্বরের জন্য এই ভেষজ শিকড়ের ক্বাথ খান।",
    gondi: "మారంగ్ జ్వరం కాపాడే పెనోళ్ళ మూలిక.",
    koya: "ఈ మూలిక వేరుతో జ్వరం వెంటనే తగ్గుతుంది.",
    sat: "ᱡᱟᱹᱯᱩᱫ ᱨᱩᱣᱟᱹ ᱞᱟᱹᱜᱤᱫ ᱱᱚᱣᱟ ᱨᱟᱱ ᱨᱮᱦᱮᱫ ᱧᱩᱭ ᱢᱮ.",
    lam: "తాప ఆయే తో ఈ జడీ బూటీ పివో.",
  },
  {
    category: "Elders & Wisdom (పెద్దల ఆశీర్వాదం)",
    te: "మా పూర్వీకుల సాంప్రదాయాలను గౌరవిస్తూ ముందుకు సాగాలి.",
    en: "We must progress while revering the traditions of our ancestors.",
    hi: "हमें अपने पूर्वजों की परंपराओं का सम्मान करते हुए आगे बढ़ना चाहिए।",
    ta: "முன்னோர்களின் பாரம்பரியத்தை மதித்து நாம் முன்னேற வேண்டும்.",
    kn: "ಹಿರಿಯರ ಪರಂಪರೆಯನ್ನು ಗೌರವಿಸುತ್ತಾ ನಾವು ಸಾಗಬೇಕು.",
    ml: "പൂർവ്വികരുടെ പാരമ്പര്യത്തെ മാനിച്ച് മുന്നോട്ട് പോകണം.",
    mr: "आपल्या पूर्वजांच्या परंपरांचा आदर करत पुढे गेले पाहिजे.",
    bn: "পূর্বপুরুষদের ঐতিহ্যকে সম্মান জানিয়ে এগিয়ে যেতে হবে।",
    gondi: "పెనోళ్ళ సగా వారసత్వం ఎల్లప్పుడూ నిలవాలి.",
    koya: "పెద్దల మాట చల్లని నీడ లాంటిది.",
    sat: "ᱦᱟᱯᱲᱟᱢ ᱠᱚᱣᱟᱜ ᱟᱹᱨᱤᱪᱟᱹᱞᱤ ᱢᱟᱱᱟᱣ ᱠᱟᱛᱮ ᱞᱟᱦᱟᱜ ᱦᱩᱭᱩᱜ-ᱟ.",
    lam: "మోటేరార్ బోల్ ఆఖే తాండా రో నూర్ ఛే.",
  },
];

export default function DayToDayTranslationPage() {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState("te");
  const [targetLang, setTargetLang] = useState<string>("en");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isSourceDropdownOpen, setIsSourceDropdownOpen] = useState(false);

  const activeSourceObj =
    SOURCE_LANGS.find((l) => l.code === sourceLang) || SOURCE_LANGS[0];
  const activeTargetObj =
    TARGET_LANGS.find((l) => l.code === targetLang) || TARGET_LANGS[0];

  // Perform translation
  const performTranslation = async (textToTranslate: string, target: string, source: string) => {
    if (!textToTranslate.trim()) {
      setTranslatedText("");
      return;
    }

    setIsTranslating(true);

    // 1. Instant check in offline everyday phrases
    const clean = textToTranslate.trim().toLowerCase();
    const match = DAILY_PHRASES.find((p) => {
      const srcVal = (p as any)[source];
      if (srcVal && srcVal.toLowerCase().includes(clean)) return true;
      return (
        p.te.toLowerCase().includes(clean) ||
        p.en.toLowerCase().includes(clean) ||
        p.hi.toLowerCase().includes(clean)
      );
    });

    if (match) {
      const result = (match as any)[target] || match.en;
      setTranslatedText(result);
      setIsTranslating(false);
      return;
    }

    // 2. Fetch from active translate API
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToTranslate,
          sourceLanguage: source,
          targetLanguage: target,
        }),
      });
      const data = await res.json();
      if (data.translation) {
        setTranslatedText(data.translation);
      } else {
        setTranslatedText(`[${target.toUpperCase()}]: ${textToTranslate}`);
      }
    } catch (e) {
      setTranslatedText(`Translated: ${textToTranslate}`);
    } finally {
      setIsTranslating(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputText.trim()) {
        performTranslation(inputText, targetLang, sourceLang);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [inputText, targetLang, sourceLang]);

  // Swap Source and Target Languages
  const handleSwapLanguages = () => {
    const newTarget = sourceLang;
    const newSource = targetLang;
    const newTargetMatch = TARGET_LANGS.find((l) => l.code === newTarget);
    const newSourceMatch = SOURCE_LANGS.find((l) => l.code === newSource);

    if (newSourceMatch) {
      setSourceLang(newSource);
    }
    if (newTargetMatch) {
      setTargetLang(newTarget);
    }

    // Swap texts if translated text exists
    if (translatedText) {
      setInputText(translatedText);
      setTranslatedText("");
    }
  };

  // Voice Speech Recognition
  const handleSpeechInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please type your phrase.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = activeSourceObj.speechCode || "te-IN";
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        performTranslation(transcript, targetLang, sourceLang);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  // Text-To-Speech pronunciation
  const handleSpeakOutput = () => {
    if (!translatedText || typeof window === "undefined") return;

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(translatedText);
      utterance.lang = activeTargetObj.speechCode || "en-US";
      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopy = () => {
    if (translatedText) {
      navigator.clipboard.writeText(translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const selectQuickPhrase = (phrase: DayPhrase) => {
    const phraseInSource = (phrase as any)[sourceLang] || phrase.te || phrase.en;
    setInputText(phraseInSource);
    const trans = (phrase as any)[targetLang] || phrase.en;
    setTranslatedText(trans);
  };

  return (
    <div className="min-h-screen bg-[#0C0908] pb-28 text-[#F7F3EE]">
      <Navbar />

      <main className="mx-auto max-w-5xl space-y-8 px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8">
        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#4E9F76]/30 bg-[#4E9F76]/10 px-3.5 py-1 text-xs font-semibold text-[#4E9F76]">
            <Languages className="h-4 w-4" /> Everyday Conversational Intelligence · 13 Source Languages
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#F7F3EE] sm:text-5xl">
            Day-to-Day Conversational Translator
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-[#C4B5A5] sm:text-base">
            Translate spoken dialogue, market exchanges, medical roots, and regional phrases instantly across 13 source languages including indigenous tribal tongues (Gondi, Koya, Santhali, Lambadi).
          </p>
        </header>

        {/* Translation Studio Workspace */}
        <section className="space-y-6 rounded-3xl border border-white/12 bg-[#1C1512]/70 p-5 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Dual Source & Target Selector Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
            {/* SOURCE LANGUAGE SELECTION */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <span className="text-xs font-semibold text-[#C4B5A5]">Source Language:</span>

              {/* Primary Source Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { code: "te", name: "Telugu" },
                  { code: "gondi", name: "Gondi" },
                  { code: "koya", name: "Koya" },
                  { code: "hi", name: "Hindi" },
                  { code: "ta", name: "Tamil" },
                  { code: "kn", name: "Kannada" },
                ].map((s) => (
                  <button
                    key={s.code}
                    type="button"
                    onClick={() => setSourceLang(s.code)}
                    className={`min-h-8 rounded-full px-3 text-xs font-semibold transition ${
                      sourceLang === s.code
                        ? "bg-[#4E9F76] text-[#0C0908] font-bold shadow-[0_0_16px_rgba(78,159,118,0.35)]"
                        : "border border-white/10 text-[#C4B5A5] hover:text-[#F7F3EE] hover:bg-white/5"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}

                {/* Source Language Dropdown with all 13 languages */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsSourceDropdownOpen(!isSourceDropdownOpen)}
                    className="inline-flex min-h-8 items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 text-xs font-semibold text-[#F7F3EE] hover:bg-white/10 transition"
                  >
                    <span>
                      {SOURCE_LANGS.slice(6).some((l) => l.code === sourceLang)
                        ? activeSourceObj.name
                        : "+ More"}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-[#C4B5A5]" />
                  </button>

                  {isSourceDropdownOpen && (
                    <div className="absolute left-0 top-full z-30 mt-2 w-64 rounded-2xl border border-white/15 bg-[#1C1512] p-2 shadow-2xl backdrop-blur-2xl">
                      <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[#C4B5A5]">
                        Select from 13 Spoken Languages
                      </div>
                      <div className="max-h-64 overflow-y-auto space-y-1 pt-1">
                        {SOURCE_LANGS.map((lang) => (
                          <button
                            key={lang.code}
                            type="button"
                            onClick={() => {
                              setSourceLang(lang.code);
                              setIsSourceDropdownOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition ${
                              sourceLang === lang.code
                                ? "bg-[#4E9F76] text-[#0C0908] font-bold"
                                : "text-[#C4B5A5] hover:bg-white/5 hover:text-[#F7F3EE]"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span>{lang.native}</span>
                              <span className="text-[10px] opacity-70">({lang.name})</span>
                            </span>
                            {lang.category === "indigenous" && (
                              <span className="rounded bg-[#E58A4E]/20 px-1.5 py-0.5 text-[9px] font-bold text-[#E58A4E]">
                                Tribal
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SWAP BUTTON */}
            <button
              type="button"
              onClick={handleSwapLanguages}
              title="Swap Source and Target Languages"
              className="grid h-8 w-8 place-items-center rounded-full border border-white/15 bg-white/5 text-[#4E9F76] hover:bg-[#4E9F76] hover:text-[#0C0908] transition hover:scale-105"
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
            </button>

            {/* TARGET LANGUAGE SELECTION */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <span className="text-xs font-semibold text-[#C4B5A5]">Translate To:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {TARGET_LANGS.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setTargetLang(lang.code)}
                    className={`min-h-8 rounded-full px-3 text-xs font-semibold transition ${
                      targetLang === lang.code
                        ? "bg-[#4E9F76] text-[#0C0908] shadow-[0_0_16px_rgba(78,159,118,0.35)] font-bold"
                        : "border border-white/10 text-[#C4B5A5] hover:text-[#F7F3EE] hover:bg-white/5"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Languages Indicator Banner */}
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0C0908]/60 px-3.5 py-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#F7F3EE]">Input:</span>
              <span className="rounded-lg bg-[#4E9F76]/20 px-2 py-0.5 font-bold text-[#4E9F76]">
                {activeSourceObj.native} ({activeSourceObj.name})
              </span>
              {activeSourceObj.category === "indigenous" && (
                <span className="inline-flex items-center gap-1 rounded bg-[#E58A4E]/20 px-2 py-0.5 text-[10px] font-bold text-[#E58A4E]">
                  <Trees className="h-3 w-3" /> Indigenous Spoken Tradition
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#C4B5A5]">Translating to:</span>
              <span className="rounded-lg bg-[#4E9F76]/20 px-2 py-0.5 font-bold text-[#4E9F76]">
                {activeTargetObj.label} ({activeTargetObj.name})
              </span>
            </div>
          </div>

          {/* Dual Textboxes */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Input Side */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#C4B5A5]">
                <span className="font-semibold text-[#F7F3EE]">
                  Speak or type in {activeSourceObj.name}:
                </span>
                <span className="text-[#4E9F76]">Real-time Recognition</span>
              </div>

              <div className="relative">
                <textarea
                  rows={5}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={activeSourceObj.placeholder}
                  className="w-full resize-none rounded-2xl border border-white/10 bg-[#0C0908]/60 p-4 text-sm leading-relaxed text-[#F7F3EE] outline-none placeholder:text-[#C4B5A5]/40 focus:border-[#4E9F76]"
                />

                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSpeechInput}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                      isListening
                        ? "bg-red-500 text-white animate-pulse shadow-[0_0_16px_rgba(239,68,68,0.4)]"
                        : "border border-white/15 bg-white/10 text-[#F7F3EE] hover:bg-white/20"
                    }`}
                  >
                    <Mic className={`h-3.5 w-3.5 ${isListening ? "animate-bounce" : ""}`} />
                    <span>{isListening ? "Listening..." : "Speak"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Translation Output Side */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#C4B5A5]">
                <span className="font-semibold text-[#F7F3EE]">
                  Instant Translation into {activeTargetObj.name} (IndicTrans2):
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSpeakOutput}
                    disabled={!translatedText}
                    className="inline-flex items-center gap-1 text-xs text-[#C4B5A5] hover:text-[#4E9F76] transition disabled:opacity-30"
                  >
                    <Volume2
                      className={`h-3.5 w-3.5 ${
                        isPlayingAudio ? "text-[#4E9F76] animate-pulse" : ""
                      }`}
                    />
                    <span>{isPlayingAudio ? "Speaking..." : "Pronounce"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopy}
                    disabled={!translatedText}
                    className="inline-flex items-center gap-1 text-xs text-[#C4B5A5] hover:text-[#F7F3EE] transition disabled:opacity-30"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-[#4E9F76]" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              <div className="relative flex min-h-[148px] items-start rounded-2xl border border-white/10 bg-[#0C0908]/70 p-4">
                {isTranslating ? (
                  <div className="flex items-center gap-2 text-xs text-[#4E9F76]">
                    <Sparkles className="h-4 w-4 animate-spin text-[#4E9F76]" />
                    <span>Synthesizing translation...</span>
                  </div>
                ) : (
                  <p className="text-base font-semibold leading-relaxed text-[#F7F3EE]">
                    {translatedText || "Translation will appear here instantly as you type or speak."}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Quick Day-to-Day Categories Matrix */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#F7F3EE] flex items-center gap-2">
              <Coffee className="h-5 w-5 text-[#4E9F76]" />
              <span>Everyday Dialogue Samples across 13 Spoken Tongues (Click to Translate):</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {DAILY_PHRASES.map((phrase, idx) => {
              const currentDisplayPhrase =
                (phrase as any)[sourceLang] || phrase.te || phrase.en;

              return (
                <div
                  key={idx}
                  onClick={() => selectQuickPhrase(phrase)}
                  className="group cursor-pointer space-y-3 rounded-2xl border border-white/10 bg-[#1C1512]/60 p-5 transition hover:-translate-y-0.5 hover:border-[#4E9F76]/40 hover:bg-[#1C1512]/85 backdrop-blur-xl"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="rounded-md border border-[#4E9F76]/30 bg-[#4E9F76]/15 px-2.5 py-0.5 font-bold text-[#4E9F76]">
                      {phrase.category}
                    </span>
                    <span className="text-[#4E9F76] font-semibold opacity-80 group-hover:opacity-100">
                      Translate in {activeTargetObj.name} →
                    </span>
                  </div>

                  <p className="text-sm font-bold text-[#F7F3EE] group-hover:text-[#4E9F76] transition">
                    {currentDisplayPhrase}
                  </p>

                  <div className="space-y-1 rounded-xl border border-white/5 bg-[#0C0908]/60 p-3 text-xs text-[#C4B5A5]">
                    <div>
                      <span className="font-semibold text-[#F7F3EE] mr-1.5">English:</span>
                      <span>{phrase.en}</span>
                    </div>
                    {phrase.hi && (
                      <div>
                        <span className="font-semibold text-[#4E9F76] mr-1.5">Hindi:</span>
                        <span>{phrase.hi}</span>
                      </div>
                    )}
                    {phrase.gondi && (
                      <div>
                        <span className="font-semibold text-[#E58A4E] mr-1.5">Gondi:</span>
                        <span>{phrase.gondi}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <AIAssistant />
    </div>
  );
}
