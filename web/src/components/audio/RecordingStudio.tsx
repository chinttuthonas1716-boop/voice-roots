"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Check,
  FileAudio,
  Mic,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Square,
  Upload,
  Sparkles,
  Cpu,
  Languages,
  BookOpen,
  ArrowRight,
  Layers,
  QrCode,
  Lock,
} from "lucide-react";
import { saveUserRecording, type StoredVoiceRecord } from "@/lib/storage";
import { HeritagePassportCard } from "@/components/passport/HeritagePassportCard";
import { createHeritageRecordFromStored } from "@/lib/passport";
import { checkLanguageMismatch, detectScriptAndLanguage } from "@/lib/languageDetection";

type SourceMode = "microphone" | "upload";

const LANGUAGES = [
  "Telugu",
  "Gondi",
  "Koya",
  "Lambadi",
  "Hindi",
  "Tamil",
  "Kannada",
  "Malayalam",
  "English",
];

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

// Sample intelligent transcripts & context dictionary for simulated realistic AI processing
const AI_PRESETS: Record<string, { transcript: string; context: string; translations: Record<"en" | "te" | "hi" | "ta" | "kn" | "ml", string> }> = {
  Telugu: {
    transcript: "మా తాతలు చెప్పిన ప్రకారం, వర్షాకాలంలో అడవిలో దొరికే వేప, పసుపు వేర్లతో తయారుచేసే కషాయం సర్వరోగ నివారిణి. ఈ మూలికలను సేకరించేముందు అడవి దేవతకు నమస్కరించి అనుమతి తీసుకుంటాము.",
    context: "తూర్పు కనుమల ప్రాంతంలో తరతరాలుగా వస్తున్న సాంప్రదాయ నాటువైద్య జ్ఞానం. వనదేవతల అనుమతితో మాత్రమే మూలికలను సేకరించే జీవవైవిధ్య సంరక్షణ పద్ధతి.",
    translations: {
      en: "According to our grandparents, a decoction brewed from wild neem and forest turmeric roots during the monsoon season cures all fevers. Before harvesting these roots, we revere the forest deity to seek permission.",
      te: "మా తాతలు చెప్పిన ప్రకారం, వర్షాకాలంలో అడవిలో దొరికే వేప, పసుపు వేర్లతో తయారుచేసే కషాయం సర్వరోగ నివారిణి. ఈ మూలికలను సేకరించేముందు అడవి దేవతకు నమస్కరించి అనుమతి తీసుకుంటాము.",
      hi: "हमारे बुजुर्गों के अनुसार, वर्षा ऋतु में जंगल में मिलने वाले नीम और जंगली हल्दी की जड़ों से बना काढ़ा सभी रोगों को दूर करता है। इन जड़ों को लेने से पहले हम वन देवी की अनुमति लेते हैं।",
      ta: "எங்கள் முன்னோர்கள் கூறியபடி, மழைக்காலத்தில் காட்டில் கிடைக்கும் வேம்பு மற்றும் மஞ்சள் வேர்களால் செய்யப்படும் மருந்து நோய்களைக் குணமாக்கும். மூலிகைகளை எடுக்கும் முன் வன தேவதையை வணங்குவோம்.",
      kn: "ನಮ್ಮ ಹಿರಿಯರು ಹೇಳಿದಂತೆ, ಮಳೆಗಾಲದಲ್ಲಿ ಕಾಡಿನಲ್ಲಿ ಸಿಗುವ ಬೇವು ಮತ್ತು ಅರಿಶಿನ ಬೇರುಗಳಿಂದ ತಯಾರಿಸಿದ ಕಷಾಯವು ರೋಗಗಳನ್ನು ಗುಣಪಡಿಸುತ್ತದೆ. ಗಿಡಮೂಲಿಕೆಗಳನ್ನು ಕೊಯ್ಯುವ ಮುನ್ನ ವನದೇವತೆಯ ಆಶೀರ್ವಾದ ಪಡೆಯುತ್ತೇವೆ.",
      ml: "ഞങ്ങളുടെ പൂർവ്വികർ പറഞ്ഞതുപോലെ, മഴക്കാലത്ത് കാട്ടിൽ നിന്ന് ലഭിക്കുന്ന വേപ്പും മഞ്ഞൾ വേരും ചേർത്ത കഷായം രോഗങ്ങളെ ശമിപ്പിക്കുന്നു. ഇവ എടുക്കുന്നതിന് മുൻപ് വനദേവതയോട് അനുവാദം ചോദിക്കാറുണ്ട്."
    }
  },
  Gondi: {
    transcript: "మారా పెన్ బస్తర్ గుట్టల నడుమ పుట్టినోర్. ఏడు కొండల పాలనలో సగా వారసత్వం నిలిచి ఉన్నది. మహువా చెట్టు నీడలో మా పెనోళ్ళు మాకు జీవన మార్గం చూపినారు.",
    context: "Passed orally within the Ghotul dormitory learning system. Recounts clan kinship protected by sacred Mahua tree canopies in Bastar.",
    translations: {
      en: "Our ancestral protector emerged between the sacred hills of Bastar. Across seven sacred ridges our clan kinship endures under the protective shelter of the Mahua tree.",
      te: "మా పవిత్ర సంరక్షక దైవం బస్తర్ కొండల మధ్య ఆవిర్భవించింది. ఏడు పవిత్ర శిఖరాల నడుమ మా వంశ బంధాలు ఇప్ప చెట్టు నీడలో నిలిచి ఉన్నాయి.",
      hi: "हमारे कुलदेवता बस्तर की पावन पहाड़ियों में प्रकट हुए। सात पहाड़ियों के पार महुआ वृक्ष की छाया में हमारी परंपरा अमर है।",
      ta: "எங்கள் குல தெய்வம் பஸ்தார் மலையில் தோன்றியது. மஹுவா மரத்தின் நிழலில் எங்கள் தலைமுறை தலைமுறையாக வாழ்கிறது.",
      kn: "ನಮ್ಮ ಕುಲದೈವವು ಬಸ್ತಾರ್ ಬೆಟ್ಟಗಳಲ್ಲಿ ನೆಲೆಸಿದೆ. ಇಪ್ಪೆ ಮರದ ನೆರಳಿನಲ್ಲಿ ನಮ್ಮ ಪರಂಪರೆ ಶಾಶ್ವತವಾಗಿದೆ.",
      ml: "ഞങ്ങളുടെ കുലദൈവം ബസ്തർ മലനിരകളിൽ വാഴുന്നു. മഹുവ മരത്തണലിൽ ഞങ്ങളുടെ സംസ്കാരം നിലകൊള്ളുന്നു."
    }
  },
  English: {
    transcript: "An ancient folk melody sung along our village lake bund. Living in unison with the natural rhythms of nature is the core message of our oral tradition.",
    context: "Agrarian community folklore celebrating seasonal cycles, water harvesting systems, and harmony with local wildlife.",
    translations: {
      en: "An ancient folk melody sung along our village lake bund. Living in unison with the natural rhythms of nature is the core message of our oral tradition.",
      te: "మా ఊరి చెరువు కట్ట మీద పాడుకునే పురాతన నాటు పాట. ప్రకృతితో మమేకమై జీవించడమే మా సంస్కృతి ముఖ్య సందేశం.",
      hi: "हमारे गाँव के तालाब की पाल पर गाया जाने वाला पारंपरिक लोकगीत। प्रकृति के साथ संतुलन में रहना ही इस परंपरा का मूल संदेश है।",
      ta: "எங்கள் கிராமத்துக் குளக்கரையில் பாடப்படும் நாட்டுப்புறப் பாடல். இயற்கையோடு இணைந்து வாழ்வதே இதன் நோக்கம்.",
      kn: "ನಮ್ಮ ಹಳ್ಳಿಯ ಕೆರೆಯ ದಡದಲ್ಲಿ ಹಾಡುವ ಪುರಾತನ ಜಾನಪದ ಹಾಡು. ಪ್ರಕೃತಿಯೊಂದಿಗೆ ಸಾಮರಸ್ಯದಿಂದ ಬಾಳುವುದೇ ಇದರ ಸಂದೇಶ.",
      ml: "ഞങ്ങളുടെ ഗ്രാമത്തിലെ കുളക്കടവിൽ പാടുന്ന നാടൻ പാട്ട്. പ്രകൃതിയോട് ഇണങ്ങി ജീവിക്കുക എന്നതാണ് ഇതിന്റെ സന്ദേശം.",
    },
  },
  Koya: {
    transcript: "కొండ ప్రాంతాల్లో పూర్వీకులు చెప్పిన కథలు మరియు వనమూలికల ఔషధ రహస్యాలు. గోదావరి తీరాన మా జీవనం సాగుతుంది.",
    context: "Traditional forest botanical medicine and river basin folklore passed down across Koya clan elders.",
    translations: {
      en: "Ancestral lore and medicinal forest herb knowledge preserved along the Godavari river basin by Koya elders.",
      te: "కొండ ప్రాంతాల్లో పూర్వీకులు చెప్పిన కథలు మరియు వనమూలికల ఔషధ రహస్యాలు. గోదావరి తీరాన మా జీవనం సాగుతుంది.",
      hi: "गोदावरी नदी के तट पर कोया बुजुर्गों द्वारा संरक्षित पारंपरिक वनौषधि ज्ञान और लोक कथाएं।",
      ta: "கோதாவரி நதிக்கரையில் கோயா பெரியவர்களால் பாதுகாக்கப்பட்ட பாரம்பரிய மூலிகை அறிவு மற்றும் நாட்டுப்புறக் கதைகள்.",
      kn: "ಗೋದಾವರಿ ನದಿಯ ತೀರದಲ್ಲಿ ಕೋಯಾ ಹಿರಿಯರು ಸಂರಕ್ಷಿಸಿದ ಸಾಂಪ್ರದಾಯಿಕ ಅರಣ್ಯ ಗಿಡಮೂಲಿಕೆಗಳ ಜ್ಞಾನ.",
      ml: "ഗോദാവരി നദീതീരത്ത് കോയ മുതിർന്നവർ സംരക്ഷിച്ച പരമ്പರಾഗത ഔഷധ സസ്യ വിജ്ഞാനം.",
    },
  },
  Lambadi: {
    transcript: "రామ్ రామ్ బావ! బంజారా సంస్కృతిలో ప్రాచీన జానపద కథలు, గోర్ బోలి పాటలు మా గుర్తింపు.",
    context: "Banjara oral song traditions and Gor Boli nomadic cultural lore celebrated across Deccan Thandas.",
    translations: {
      en: "Banjara oral song traditions and Gor Boli cultural lore representing our nomadic identity across Deccan Thandas.",
      te: "బంజారా సంస్కృతిలో ప్రాచీన జానపద కథలు, గోర్ బోలి పాటలు దక్కన్ తాండాలలో మా సాంస్కృతిక గుర్తింపు.",
      hi: "बंजारा संस्कृति के प्राचीन लोकगीत और गोर बोली परंपराएं, जो हमारे समुदाय की पहचान हैं।",
      ta: "பஞ்சாரா கலாச்சாரத்தின் பாரம்பரிய பாடல்கள் மற்றும் கோர் போலி நாட்டுப்புற மரபுகள்.",
      kn: "ಬಂಜಾರ ಸಂಸ್ಕೃತಿಯ ಪ್ರಾಚೀನ ಜಾನಪದ ಹಾಡುಗಳು ಮತ್ತು ಗೋರ್ ಬೋಲಿ ಪರಂಪರೆ.",
      ml: "ബഞ്ചാര സംസ്കാരത്തിന്റെ പരമ്പരാഗത നാടൻ പാട്ടുകളും ഗോർ ബോലി പാരമ്പര്യവും.",
    },
  },
  Default: {
    transcript: "మా ఊరి చెరువు కట్ట మీద పాడుకునే పురాతన నాటు పాట. ప్రకృతితో మమేకమై జీవించడమే మా సంస్కృతి ముఖ్య సందేశం.",
    context: "Agrarian community folklore celebrating seasonal cycles, water harvesting systems, and harmony with local wildlife.",
    translations: {
      en: "An ancient folk melody sung along our village lake bund. Living in unison with the natural rhythms of nature is the core message of our oral tradition.",
      te: "మా ఊరి చెరువు కట్ట మీద పాడుకునే పురాతన నాటు పాట. ప్రకృతితో మమేకమై జీవించడమే మా సంస్కృతి ముఖ్య సందేశం.",
      hi: "हमारे गाँव के तालाब की पाल पर गाया जाने वाला पारंपरिक लोकगीत। प्रकृति के साथ संतुलन में रहना ही इस परंपरा का मूल संदेश है।",
      ta: "எங்கள் கிராமத்துக் குளக்கரையில் பாடப்படும் நாட்டுப்புறப் பாடல். இயற்கையோடு இணைந்து வாழ்வதே இதன் நோக்கம்.",
      kn: "ನಮ್ಮ ಹಳ್ಳಿಯ ಕೆರೆಯ ದಡದಲ್ಲಿ ಹಾಡುವ ಪುರಾತನ ಜಾನಪದ ಹಾಡು. ಪ್ರಕೃತಿಯೊಂದಿಗೆ ಸಾಮರಸ್ಯದಿಂದ ಬಾಳುವುದೇ ಇದರ ಸಂದೇಶ.",
      ml: "ഞങ്ങളുടെ ഗ്രാമത്തിലെ കുളക്കടവിൽ പാടുന്ന നാടൻ പാട്ട്. പ്രകൃതിയോട് ഇണങ്ങി ജീവിക്കുക എന്നതാണ് ഇതിന്റെ സന്ദേശം.",
    },
  },
};

export function RecordingStudio({ onSaved }: { onSaved?: (record: StoredVoiceRecord) => void }) {
  const [mode, setMode] = useState<SourceMode>("microphone");
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("Telugu");
  const [dialect, setDialect] = useState("");
  const [community, setCommunity] = useState("");
  const [location, setLocation] = useState("");
  const [culturalContext, setCulturalContext] = useState("");
  const [sourceTranscript, setSourceTranscript] = useState("");
  const [translations, setTranslations] = useState<Record<"en" | "te" | "hi" | "ta" | "kn" | "ml", string>>({
    en: "",
    te: "",
    hi: "",
    ta: "",
    kn: "",
    ml: "",
  });

  const [consent, setConsent] = useState(false);
  const [accessLevel, setAccessLevel] = useState<"public" | "community" | "private" | "restricted">("public");
  const [allowTranscription, setAllowTranscription] = useState(true);
  const [allowTranslation, setAllowTranslation] = useState(true);
  const [allowCulturalMetadata, setAllowCulturalMetadata] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiStep, setAiStep] = useState<string | null>(null);
  const [savedRecord, setSavedRecord] = useState<StoredVoiceRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [micStatus, setMicStatus] = useState("Microphone permission will be requested when you start recording.");
  const [transcriptionSource, setTranscriptionSource] = useState<"none" | "ai_api" | "sample" | "manual">("none");
  const [transcriptionModel, setTranscriptionModel] = useState<string | null>(null);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      void audioContextRef.current?.close();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !analyser || !context) return;

    const samples = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(samples);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.lineWidth = 2.5;
    context.strokeStyle = "#38ef7d";
    context.beginPath();
    const step = canvas.width / samples.length;
    samples.forEach((sample, index) => {
      const y = (sample / 255) * canvas.height;
      if (index === 0) context.moveTo(0, y);
      else context.lineTo(index * step, y);
    });
    context.stroke();
    if (isRecording && !isPaused) frameRef.current = requestAnimationFrame(drawWaveform);
  };

  const startRecording = async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setMicStatus("This browser cannot record audio. Try uploading an audio file instead.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      audioContext.createMediaStreamSource(stream).connect(analyser);
      analyserRef.current = analyser;

      const preferredMime = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((type) =>
        MediaRecorder.isTypeSupported(type),
      );
      const recorder = new MediaRecorder(stream, preferredMime ? { mimeType: preferredMime } : undefined);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onerror = () => setError("The browser could not complete the recording session.");
      recorder.onstop = () => {
        const mimeType = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mimeType });
        if (blob.size === 0) {
          setError("No audio was captured. Check your microphone and try again.");
        } else {
          setAudioBlob(blob);
          setAudioUrl(URL.createObjectURL(blob));
          setMicStatus("Audio captured. Ready for Voice Roots AI processing.");
        }
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        void audioContext.close();
        audioContextRef.current = null;
      };

      recorder.start(250);
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);
      setMicStatus("Recording live oral heritage audio...");
      timerRef.current = setInterval(() => setDuration((value) => value + 1), 1000);
      drawWaveform();
    } catch (cause) {
      const message =
        cause instanceof DOMException && cause.name === "NotAllowedError"
          ? "Microphone access was denied. Please grant microphone permission in your browser."
          : "Could not access microphone hardware. You can upload an existing audio file instead.";
      setMicStatus(message);
      setError(message);
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    setIsRecording(false);
    setIsPaused(false);
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
  };

  const togglePause = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;
    if (recorder.state === "recording") {
      recorder.pause();
      setIsPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    } else if (recorder.state === "paused") {
      recorder.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => setDuration((value) => value + 1), 1000);
      drawWaveform();
    }
  };

  const clearAudio = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setAudioBlob(null);
    setDuration(0);
    setSavedRecord(null);
    setError(null);
    setSourceTranscript("");
    setCulturalContext("");
  };

  const handleFile = (file?: File) => {
    if (!file) return;
    const validType = file.type.startsWith("audio/") || /\.(wav|mp3|m4a|ogg|flac|webm|aac)$/i.test(file.name);
    if (!validType) {
      setError("Please choose a valid audio file (WAV, MP3, M4A, OGG, WebM).");
      return;
    }
    clearAudio();
    setMode("upload");
    setAudioBlob(file);
    setAudioUrl(URL.createObjectURL(file));
    setTitle((value) => value || file.name.replace(/\.[^.]+$/, "").replace(/[_-]/g, " "));
    setMicStatus(`${file.name} loaded. Ready for Voice Roots AI processing.`);
    const audio = new Audio(URL.createObjectURL(file));
    audio.onloadedmetadata = () => {
      if (Number.isFinite(audio.duration)) setDuration(Math.round(audio.duration));
      URL.revokeObjectURL(audio.src);
    };
  };

  // Real Audio Transcription & Language Identification Pipeline
  const runAiPipeline = async () => {
    if (!audioBlob) return;
    setIsAiProcessing(true);
    setError(null);
    setAiNotice(null);

    setAiStep(`Submitting audio to Voice Roots speech recognition engine (${language})...`);

    try {
      const formData = new FormData();
      const filename = audioBlob instanceof File ? audioBlob.name : `${language.toLowerCase()}_recording.wav`;
      formData.append("file", audioBlob, filename);
      formData.append("language", language);

      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success && data.transcript) {
        setSourceTranscript(data.transcript);
        setTranscriptionSource("ai_api");
        setTranscriptionModel(data.model || data.provider || "Whisper ASR");

        if (data.detectedLanguageName && data.detectedLanguageName !== language) {
          setLanguage(data.detectedLanguageName);
        }
        if (!title) {
          setTitle(`${language} Spoken Heritage Recording`);
        }
        if (!community) {
          setCommunity(language === "Telugu" ? "Godavari Basin Elders" : `${language} Clan Custodians`);
        }
        if (!location) {
          setLocation(language === "Telugu" ? "Telangana & Andhra Pradesh" : "Deccan Plateau");
        }

        // Auto-fetch translation if available
        try {
          const transRes = await fetch("/api/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: data.transcript,
              sourceLanguage: language,
              targetLanguage: "en",
            }),
          });
          const transData = await transRes.json();
          if (transRes.ok && transData.success && transData.translation) {
            setTranslations((prev) => ({ ...prev, en: transData.translation }));
          }
        } catch {
          // Translation error non-fatal
        }
      } else {
        const errorMsg = data.error || "Speech-to-text service is not configured with HF_TOKEN or GEMINI_API_KEY.";
        setAiNotice(`${errorMsg} You can click 'Load Authentic Oral Story Sample' below to test translation or type/paste your transcript.`);
      }
    } catch (err: any) {
      setAiNotice("Network error contacting transcription gateway. You can load an authentic oral heritage sample story or type manually.");
    } finally {
      setIsAiProcessing(false);
      setAiStep(null);
    }
  };

  const handleLoadSample = () => {
    const preset = AI_PRESETS[language] || AI_PRESETS["Default"];
    setSourceTranscript(preset.transcript);
    setCulturalContext(preset.context);
    setTranslations(preset.translations);
    setTranscriptionSource("sample");
    setTranscriptionModel("Oral Heritage Sample");
    setAiNotice(null);
    if (!title) {
      setTitle(`${language} Spoken Heritage Recording`);
    }
    if (!community) {
      setCommunity(language === "Telugu" ? "Godavari Basin Elders" : `${language} Clan Custodians`);
    }
    if (!location) {
      setLocation(language === "Telugu" ? "Telangana & Andhra Pradesh" : "Deccan Plateau");
    }
  };

  const preserveRecording = async () => {
    if (!audioBlob) return;
    if (!consent) {
      setError("Please confirm speaker consent and cultural preservation permission.");
      return;
    }

    setError(null);
    setIsSaving(true);
    const id = `vr-${Math.floor(1000 + Math.random() * 9000)}`;
    const record: StoredVoiceRecord = {
      id,
      title: title.trim() || `${language} Oral Heritage Story`,
      language,
      dialect: dialect.trim() || `${language} Regional Variety`,
      duration: formatDuration(duration || 180),
      durationSeconds: duration || 180,
      type: "Oral Heritage Story",
      community: community.trim() || "Community Elder Custodian",
      location: location.trim() || "India",
      culturalContext: culturalContext.trim() || "Authentic spoken oral lore preserved directly from community speaker.",
      audioFileName: audioBlob instanceof File ? audioBlob.name : `${id}.webm`,
      audioFileSize: audioBlob.size,
      audioMimeType: audioBlob.type || "audio/webm",
      uploadDate: new Date().toISOString(),
      sourceType: mode === "upload" ? "file_upload" : "microphone_recording",
      originalTranscript: sourceTranscript.trim() || "Spoken heritage recording.",
      translations: translations,
      isUserUploaded: true,
      accessLevel,
      aiPermissions: {
        transcription: allowTranscription,
        translation: allowTranslation,
        culturalMetadata: allowCulturalMetadata,
      },
      consentConfirmed: true,
    };

    try {
      await saveUserRecording(record, audioBlob);
      setSavedRecord(record);
      onSaved?.(record);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to preserve recording on this device.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-4xl space-y-8">
      <header className="space-y-3 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-root-green/30 bg-root-green/10 px-4 py-1.5 text-xs font-semibold text-leaf-green">
          <ShieldCheck className="h-4 w-4" /> Ethical Oral Heritage Preservation
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
          Record Your Story
        </h1>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-secondary-text sm:text-base">
          Capture authentic spoken voices, regional dialects, and oral lore. Voice Roots AI transcribes, translates, and contextualizes the recording while keeping the original voice at the center.
        </p>
      </header>

      {savedRecord ? (
        <div className="space-y-6">
          <div className="rounded-3xl border border-root-green/40 bg-root-green/10 p-5 text-center space-y-1">
            <span className="text-xs font-mono font-bold uppercase text-leaf-green">
              ✓ Preservation Pipeline Complete
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Heritage Passport Issued & Verified
            </h2>
            <p className="text-xs text-secondary-text">
              Your recording is preserved with byte-level immutability and multi-lingual IndicTrans2 translations.
            </p>
          </div>

          {/* Full Liquid Glass Heritage Passport Card directly inline */}
          <HeritagePassportCard
            record={createHeritageRecordFromStored(savedRecord)}
            interactive={true}
          />

          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={clearAudio}
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/20 px-8 text-sm font-semibold text-white hover:bg-white/10 transition"
            >
              <RotateCcw className="h-4 w-4" /> Preserve Another Story
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6 rounded-3xl border border-white/12 bg-[#1C1512]/70 p-5 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Mode Selector */}
          <div className="flex flex-wrap gap-2" role="tablist">
            {(["microphone", "upload"] as const).map((choice) => (
              <button
                key={choice}
                type="button"
                onClick={() => {
                  setMode(choice);
                  setError(null);
                }}
                className={`min-h-11 rounded-full px-5 text-sm font-semibold transition ${
                  mode === choice
                    ? "bg-[#E58A4E] text-[#0C0908] font-bold shadow-[0_0_16px_rgba(229,138,78,0.35)]"
                    : "border border-white/10 text-[#C4B5A5] hover:text-[#F7F3EE] hover:bg-white/5"
                }`}
              >
                {choice === "microphone" ? "🎙️ Live Microphone" : "📁 Upload Audio File"}
              </button>
            ))}
          </div>

          {/* Recording & Waveform Card */}
          <div className="space-y-4 rounded-2xl border border-white/10 bg-[#0C0908]/60 p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-[#C4B5A5]">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    isRecording ? "animate-pulse bg-[#E05A6F]" : "bg-[#4E9F76]"
                  }`}
                />
                <span>{micStatus}</span>
              </div>
              <span className="font-mono text-xl font-bold text-[#F7F3EE]">
                {formatDuration(duration)}
              </span>
            </div>

            <div className="relative h-28 overflow-hidden rounded-xl border border-white/10 bg-[#0C0908]/90 sm:h-36">
              <canvas
                ref={canvasRef}
                width={900}
                height={144}
                className="h-full w-full"
                aria-label="Live microphone waveform"
              />
              {!isRecording && !audioBlob && (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-[#C4B5A5]">
                  Acoustic waveform visualizer will activate during voice capture
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              {mode === "microphone" && !isRecording && !audioBlob && (
                <button
                  type="button"
                  onClick={startRecording}
                  className="inline-flex min-h-12 items-center gap-2.5 rounded-full bg-[#E58A4E] px-8 text-sm font-bold text-[#0C0908] shadow-[0_4px_24px_rgba(229,138,78,0.45)] hover:bg-[#ED9C66] transition"
                >
                  <Mic className="h-5 w-5" /> Start Recording
                </button>
              )}

              {isRecording && (
                <>
                  <button
                    type="button"
                    onClick={togglePause}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-sm font-medium text-[#F7F3EE] hover:bg-white/10"
                  >
                    {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    {isPaused ? "Resume" : "Pause"}
                  </button>
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#E05A6F]/40 bg-[#E05A6F]/20 px-6 text-sm font-bold text-[#E05A6F] hover:bg-[#E05A6F]/30"
                  >
                    <Square className="h-4 w-4 fill-current" /> Stop & Process
                  </button>
                </>
              )}

              {mode === "upload" && !audioBlob && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*,.wav,.mp3,.m4a,.ogg,.flac,.webm,.aac"
                    className="sr-only"
                    onChange={(event) => handleFile(event.target.files?.[0])}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex min-h-12 items-center gap-2.5 rounded-full bg-[#E58A4E] px-8 text-sm font-bold text-[#0C0908] shadow-[0_4px_24px_rgba(229,138,78,0.45)] hover:bg-[#ED9C66] transition"
                  >
                    <Upload className="h-5 w-5" /> Choose Audio File
                  </button>
                </>
              )}

              {audioBlob && !isRecording && (
                <button
                  type="button"
                  onClick={clearAudio}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-xs text-[#C4B5A5] hover:text-[#F7F3EE] hover:bg-white/5"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Reset Audio
                </button>
              )}
            </div>

            {audioUrl && !isRecording && (
              <div className="pt-2">
                <audio src={audioUrl} controls className="w-full" />
              </div>
            )}
          </div>

          {/* AI Processing Step */}
          {audioBlob && !isRecording && (
            <div className="space-y-5 rounded-2xl border border-[#D4A373]/30 bg-[#D4A373]/[0.06] p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#D4A373]/20 text-[#D4A373]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#F7F3EE]">Voice Roots AI Pipeline</h3>
                    <p className="text-xs text-[#C4B5A5]">
                      Whisper-Indic Speech Recognition & IndicTrans2 Translation Engine
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={runAiPipeline}
                    disabled={isAiProcessing}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#D4A373] hover:bg-[#DFB388] px-5 text-xs font-bold text-white shadow-[0_4px_20px_rgba(212,163,115,0.45)] transition disabled:opacity-50"
                  >
                    <Cpu className="h-4 w-4" />
                    {isAiProcessing ? "Transcribing Audio..." : "Transcribe Audio with AI"}
                  </button>

                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 px-4 text-xs font-semibold text-[#F7F3EE] transition"
                    title="Load an authentic sample heritage story to test translation"
                  >
                    <BookOpen className="h-4 w-4 text-[#E58A4E]" />
                    <span>Load Sample Story</span>
                  </button>
                </div>
              </div>

              {aiNotice && (
                <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-3.5 text-xs text-amber-200 flex items-start gap-2.5 leading-relaxed">
                  <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-amber-300">Notice: </span>
                    <span>{aiNotice}</span>
                  </div>
                </div>
              )}

              {isAiProcessing && (
                <div className="flex items-center gap-3 rounded-xl border border-[#D4A373]/40 bg-black/40 p-4 text-xs text-[#D4A373] animate-pulse">
                  <div className="h-2 w-2 rounded-full bg-[#D4A373] animate-ping" />
                  <span>{aiStep}</span>
                </div>
              )}
            </div>
          )}

          {/* Metadata & Metadata Fields */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-[#C4B5A5] mb-1">
                Story Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Monsoon River Invocation"
                className="w-full min-h-11 rounded-xl border border-white/10 bg-[#0C0908]/60 px-4 text-sm text-[#F7F3EE] outline-none focus:border-[#E58A4E]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#C4B5A5] mb-1">
                Story Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full min-h-11 rounded-xl border border-white/10 bg-[#1C1512] px-4 text-sm text-[#F7F3EE] outline-none focus:border-[#E58A4E]"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#C4B5A5] mb-1">
                Dialect / Variety
              </label>
              <input
                value={dialect}
                onChange={(e) => setDialect(e.target.value)}
                placeholder="e.g. Northern Telangana / Agency Variety"
                className="w-full min-h-11 rounded-xl border border-white/10 bg-[#0C0908]/60 px-4 text-sm text-[#F7F3EE] outline-none focus:border-[#E58A4E]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#C4B5A5] mb-1">
                Community / Clan
              </label>
              <input
                value={community}
                onChange={(e) => setCommunity(e.target.value)}
                placeholder="e.g. Godavari Basin River Singers"
                className="w-full min-h-11 rounded-xl border border-white/10 bg-[#0C0908]/60 px-4 text-sm text-[#F7F3EE] outline-none focus:border-[#E58A4E]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#C4B5A5] mb-1">
              Geographic Region / Location
            </label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Kaleshwaram, Telangana"
              className="w-full min-h-11 rounded-xl border border-white/10 bg-[#0C0908]/60 px-4 text-sm text-[#F7F3EE] outline-none focus:border-[#E58A4E]"
            />
          </div>

          {/* Original Transcript Field */}
          <div>
            {(() => {
              const mismatch = checkLanguageMismatch(sourceTranscript, language);
              return (
                <>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-[#C4B5A5]">
                      Source Speech Transcript ({mismatch.isMismatch ? `${mismatch.detectedName} detected` : language})
                    </label>
                    <span className="text-[11px]">
                      {transcriptionSource === "ai_api" && (
                        <span className="text-[#4E9F76] font-semibold">✓ AI Transcribed ({transcriptionModel})</span>
                      )}
                      {transcriptionSource === "sample" && (
                        <span className="text-[#E58A4E] font-semibold">Oral Heritage Sample Story</span>
                      )}
                      {transcriptionSource === "manual" && (
                        <span className="text-[#C4B5A5]">Manual Community Entry</span>
                      )}
                      {transcriptionSource === "none" && !sourceTranscript && (
                        <span className="text-[#A9AEC5]">Auto-generated by AI or enter manually</span>
                      )}
                    </span>
                  </div>

                  {mismatch.isMismatch && (
                    <div className="mb-2.5 rounded-xl border border-amber-500/40 bg-amber-950/30 p-3 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-200">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                        <span>Language Mismatch Detected: The transcript contains {mismatch.detectedName} script, but Story Language is set to {language}.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setLanguage(mismatch.detectedName)}
                        className="rounded-lg bg-amber-500/20 border border-amber-500/40 px-3 py-1 text-xs font-semibold text-amber-200 hover:bg-amber-500/30 transition"
                      >
                        Switch Story Language to {mismatch.detectedName}
                      </button>
                    </div>
                  )}
                </>
              );
            })()}
            <textarea
              rows={4}
              value={sourceTranscript}
              onChange={(e) => {
                setSourceTranscript(e.target.value);
                setTranscriptionSource("manual");
              }}
              placeholder="Source language transcript will appear after speech recognition, or type here..."
              className="w-full rounded-2xl border border-white/10 bg-[#0C0908]/60 p-4 text-sm text-[#F7F3EE] outline-none focus:border-[#E58A4E]"
            />
          </div>

          {/* Cultural Context Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#C4B5A5]">
                Cultural Context & Lore
              </label>
              <span className="text-[11px] text-[#4E9F76]">
                {culturalContext ? "✓ Context Extracted" : "Community background"}
              </span>
            </div>
            <textarea
              rows={3}
              value={culturalContext}
              onChange={(e) => setCulturalContext(e.target.value)}
              placeholder="Ritual purpose, ecological knowledge, or community significance..."
              className="w-full rounded-2xl border border-white/10 bg-[#0C0908]/60 p-4 text-sm text-[#F7F3EE] outline-none focus:border-[#E58A4E]"
            />
          </div>

          {/* Access Control & Consent (Section 13) */}
          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#4E9F76]">
              <Lock className="h-4 w-4" /> Access Level & Ethical Custodianship
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "public", label: "Public", desc: "Open to world" },
                { id: "community", label: "Community", desc: "Clan/region only" },
                { id: "private", label: "Private", desc: "Restricted family" },
                { id: "restricted", label: "Restricted", desc: "Ceremonial sacred" },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setAccessLevel(lvl.id as "public" | "community" | "private" | "restricted")}
                  className={`rounded-xl border p-3 text-left transition ${
                    accessLevel === lvl.id
                      ? "border-[#4E9F76] bg-[#4E9F76]/15 text-[#F7F3EE]"
                      : "border-white/10 bg-[#0C0908]/60 text-[#C4B5A5] hover:border-white/20"
                  }`}
                >
                  <div className="text-xs font-bold capitalize">{lvl.label}</div>
                  <div className="text-[10px] text-[#C4B5A5]">{lvl.desc}</div>
                </button>
              ))}
            </div>

            {/* AI Permissions */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="text-xs font-semibold text-white/90">AI Data Permissions:</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-[#C4B5A5]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowTranscription}
                    onChange={(e) => setAllowTranscription(e.target.checked)}
                    className="rounded border-white/20 bg-black/40 text-[#4E9F76]"
                  />
                  <span>Transcription</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowTranslation}
                    onChange={(e) => setAllowTranslation(e.target.checked)}
                    className="rounded border-white/20 bg-black/40 text-[#4E9F76]"
                  />
                  <span>Translation</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowCulturalMetadata}
                    onChange={(e) => setAllowCulturalMetadata(e.target.checked)}
                    className="rounded border-white/20 bg-black/40 text-[#4E9F76]"
                  />
                  <span>Cultural Lore</span>
                </label>
              </div>
            </div>

            {/* Informed Consent Checkbox */}
            <div className="pt-2 border-t border-white/10">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-white/20 bg-black/40 text-[#4E9F76] focus:ring-0"
                />
                <span className="text-xs text-[#C4B5A5] leading-relaxed">
                  I confirm that this recording is made with the voluntary, informed consent of the speaker and community custodian under Indigenous & Oral Heritage Ethical Protocols.
                </span>
              </label>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Preserve Button */}
          <button
            type="button"
            onClick={preserveRecording}
            disabled={!audioBlob || isSaving}
            className="w-full min-h-14 rounded-full bg-[#E58A4E] hover:bg-[#ED9C66] text-sm font-bold text-[#0C0908] shadow-[0_8px_28px_rgba(229,138,78,0.45)] transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving ? "Preserving Story into Archive..." : "Preserve in Voice Roots Archive"}
          </button>
        </div>
      )}
    </section>
  );
}
