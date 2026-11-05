export interface HeritageStory {
  id: string;
  originalAudioId: string;
  title: string;
  language: string;
  dialect?: string;
  duration: string;
  durationSeconds: number;
  type: string;
  community: string;
  location: string;
  culturalContext: string;
  audioUrl: string;
  audioFileName: string;
  audioFileSize: number;
  audioMimeType: string;
  uploadDate: string;
  sourceType: "microphone_recording" | "field_recording";
  originalTranscript: string;
  translations: Record<"en" | "te" | "hi" | "ta" | "kn" | "ml", string>;
  isUserUploaded?: boolean;
}

export const HERITAGE_STORIES: HeritageStory[] = [
  {
    id: "vr-106",
    originalAudioId: "audio-vr-106-telugu",
    title: "Sacred Monsoon Invocation Chants",
    language: "Telugu",
    dialect: "Northern Telangana Folk Tradition",
    duration: "00:13",
    durationSeconds: 14,
    type: "Sacred Chant",
    community: "Godavari Basin River Singers",
    location: "Kaleshwaram, Telangana",
    culturalContext: "Ancient river basin hymn sung by agrarian elders at the onset of the Rohini monsoon nakshatra. The invocation calls for cooling rains across black cotton soil and sacred Godavari waters.",
    audioUrl: "/audio/vr-106-telugu-recording.wav",
    audioFileName: "vr-106-telugu-recording.wav",
    audioFileSize: 599146,
    audioMimeType: "audio/wav",
    uploadDate: "2026-10-01T10:00:00.000Z",
    sourceType: "field_recording",
    originalTranscript: "ఓ మేఘరాజా, రోహిణి కార్తెలో చల్లని చినుకులు కురిపించి, మా నల్లరేగడి నేలను తడిపి, జీవనది గోదావరికి ప్రాణం పోయవయ్యా. పంట పొలాల్లో సిరులు పండించి పశుపక్ష్యాదులను కాపాడాలి.",
    translations: {
      en: "O sovereign rain clouds... shower cooling drops under the Rohini constellation, moisten our fertile black soil, and bring life to the sacred Godavari river. Nourish the harvest and safeguard the cattle and creatures of the land.",
      te: "ఓ మేఘరాజా, రోహిణి కార్తెలో చల్లని చినుకులు కురిపించి, మా నల్లరేగడి నేలను తడిపి, జీవనది గోదావరికి ప్రాణం పోయవయ్యా. పంట పొలాల్లో సిరులు పండించి పశుపక్ష్యాదులను కాపాడాలి.",
      hi: "हे मेघराज, रोहिणी नक्षत्र में शीतल वर्षा कर हमारी उपजाऊ काली मिट्टी को सींचें और पावन गोदावरी को नवजीवन दें। फसलों को समृद्ध करें और सभी जीवों की रक्षा करें।",
      ta: "மழை அரசனே, ரோகிணி விண்மீன் காலத்தில் குளிர்ந்த மழையைப் பொழிந்து, எங்கள் வளமான கரிசல் மண்ணை நனைத்து, புனித கோதாவரி ஆற்றுக்கு உயிர் தருவாய். பயிர்களைச் செழிக்க வைத்து உயிர்களைக் காப்பாயாக.",
      kn: "ಓ ಮೇಘರಾಜನೇ, ರೋಹಿಣಿ ನಕ್ಷತ್ರದಲ್ಲಿ ತಂಪಾದ ಹನಿಗಳನ್ನು ಸುರಿಸಿ, ನಮ್ಮ ಕಪ್ಪು ಮಣ್ಣನ್ನು ಹಸನುಮಾಡಿ, ಪವಿತ್ರ ಗೋದಾವರಿ ನದಿಗೆ ಜೀವ ತುಂಬು. ಬೆಳೆಗಳನ್ನು ಫಲವತ್ತಾಗಿಸಿ ಸಮಸ್ತ ಜೀವರಾಶಿಯನ್ನು ರಕ್ಷಿಸು.",
      ml: "മേഘരാജാവേ, രോഹിണി നಕ್ಷത്രത്തിൽ തണുത്ത മഴ പെയ്യിച്ച് ഞങ്ങളുടെ കറുത്ത മണ്ണിനെ നനയ്ക്കുകയും പുണ്യ ഗോദാവരി നദിക്ക് പുതുജീവൻ നൽകുകയും ചെയ്യുക. വിളവുകൾ വർദ്ധിപ്പിച്ച് എല്ലാ ജീവജാലങ്ങളെയും സംരക്ഷിക്കുക."
    }
  },
  {
    id: "vr-107",
    originalAudioId: "audio-vr-107-gondi",
    title: "Gondi Elder Forest Lore & Creation Legend",
    language: "Gondi",
    dialect: "Southern Gondi (Bastar-Adilabad)",
    duration: "00:10",
    durationSeconds: 11,
    type: "Creation Lore",
    community: "Koya-Pardhan Ghotul Custodians",
    location: "Utnoor Forest Range, Adilabad",
    culturalContext: "Passed orally through generations within the Ghotul learning dormitory. Recounts the primordial emergence of the Koyatur clans from seven celestial sacred hills sheltered by the mahua tree canopy.",
    audioUrl: "/audio/vr-107-gondi-recording.wav",
    audioFileName: "vr-107-gondi-recording.wav",
    audioFileSize: 467228,
    audioMimeType: "audio/wav",
    uploadDate: "2026-10-02T14:30:00.000Z",
    sourceType: "field_recording",
    originalTranscript: "మారా పెన్ బస్తర్ గుట్టల నడుమ పుట్టినోర్. ఏడు కొండల పాలనలో సగా వారసత్వం నిలిచి ఉన్నది. మహువా చెట్టు నీడలో మా పెనోళ్ళు మాకు జీవన మార్గం చూపినారు.",
    translations: {
      en: "Our divine guardian ancestor emerged from amidst the sacred peaks of Bastar. Across seven sacred hills, our clan kinship endures unbroken. Beneath the sheltered canopy of the Mahua tree, our elders revealed the sacred pathway of life.",
      te: "మా పవిత్ర సంరక్షక దైవం బస్తర్ కొండల మధ్య ఆవిర్భవించింది. ఏడు పవిత్ర శిఖరాల నడుమ మా వంశ బంధాలు చెక్కుచెదరకుండా నిలిచాయి. ఇప్ప చెట్టు నీడలో మా పెద్దలు మాకు సత్య జీవన మార్గాన్ని ఉపదేశించారు.",
      hi: "हमारे पवित्र कुलदेवता बस्तर की पावन पहाड़ियों के बीच प्रकट हुए। सात पहाड़ियों के पार हमारा गोत्र संबंध अटूट है। महुआ के वृक्ष की छाया में हमारे बुजुर्गों ने हमें जीवन का मार्ग दिखाया।",
      ta: "எங்கள் புனித குல தெய்வம் பஸ்தார் மலைகளுக்கு நடுவே தோன்றியது. ஏழு புனித குன்றுகளுக்கு அப்பால் எங்கள் உறவுமுறை தொடர்கிறது. மஹுவா மரத்தின் நிழலில் பெரியோர்கள் நல்வாழ்க்கை வழியைக் காட்டினர்.",
      kn: "ನಮ್ಮ ಪವಿತ್ರ ಕುಲದೈವವು ಬಸ್ತಾರ್ ಪರ್ವತಗಳ ನಡುವೆ ಉದ್ಭವಿಸಿತು. ಏಳು ಪವಿತ್ರ ಬೆಟ್ಟಗಳ ನಡುವೆ ನಮ್ಮ ವಂಶ ಪರಂಪರೆ ಅಖಂಡವಾಗಿ ನಿಂತಿದೆ. ಇಪ್ಪೆ ಮರದ ನೆರಳಿನಲ್ಲಿ ಹಿರಿಯರು ನಮಗೆ ಧರ್ಮದ ಹಾದಿಯನ್ನು ತೋರಿದರು.",
      ml: "ഞങ്ങളുടെ വിശുദ്ധ കുലദൈവം ബസ്തർ മലനിരകളിൽ പ്രത്യക്ഷപ്പെട്ടു. ഏഴ് പവിത്ര മലനിരകൾക്കിടയിൽ ഞങ്ങളുടെ വംശബന്ധം തകരാതെ നിലകൊള്ളുന്നു. മഹുവ മരത്തണലിൽ മുതിർന്നവർ ഞങ്ങൾക്ക് ജീവിതപാത കാണിച്ചുതന്നു."
    }
  },
  {
    id: "vr-108",
    originalAudioId: "audio-vr-108-koya",
    title: "Koya Ethnobotanical Herbal Healing Chant",
    language: "Koya",
    dialect: "Papikonda Hill Range Dialect",
    duration: "00:12",
    durationSeconds: 13,
    type: "Healing Incantation",
    community: "Agency Traditional Medicine Gatherers",
    location: "Maredumilli Agency, East Godavari",
    culturalContext: "Sung by tribal herbalists (Vaidyas) at dawn while reverently harvesting wild turmeric root and medicinal forest bark. It requests permission from the forest spirit before extracting medicinal roots.",
    audioUrl: "/audio/vr-108-koya-recording.wav",
    audioFileName: "vr-108-koya-recording.wav",
    audioFileSize: 562360,
    audioMimeType: "audio/wav",
    uploadDate: "2026-10-03T09:15:00.000Z",
    sourceType: "field_recording",
    originalTranscript: "కొండ తల్లి, నీ ఒడిలో మొలిచిన పసరు వేర్లను ఔషధానికై తీసుకుంటున్నాము. అనారోగ్యంతో బాధపడే బిడ్డలకు స్వస్థత చేకూర్చే శక్తిని ఈ వేర్లలో నింపి అనుగ్రహించవమ్మా.",
    translations: {
      en: "O Mother Mountain... we harvest these healing wild roots from your fertile lap solely for the relief of ailment. Imbue these medicinal herbs with restorative vigor to heal our children.",
      te: "ఓ కొండ తల్లీ, వ్యాధుల నివారణకై నీ ఒడిలో పెరిగిన దివ్య మూలికలను కోరుకుంటున్నాము. రోగగ్రస్తులైన మా బిడ్డలకు సంపూర్ణ ఆరోగ్యాన్ని ప్రసాదించే అమృత శక్తిని ఈ ఔషధాలలో నింపవమ్మా.",
      hi: "हे पर्वत माता, हम रोगों के निवारण के लिए आपकी पावन गोद से इन औषधीय जड़ों को ले रहे हैं। बीमार बच्चों को स्वास्थ्य प्रदान करने वाली दिव्य शक्ति इन जड़ी-बूटियों में प्रदान करें।",
      ta: "மலைத் தாயே, நோய்களைத் தீர்க்க உன் மடியில் விளைந்த மூலிகைகளை எடுக்கிறோம். பிணியால் வாடும் மக்களுக்கு நலம் தரும் தெய்வீக ஆற்றலை இந்த மூலிகைகளுக்கு அருளுவாயாக.",
      kn: "ಗಿರಿಮಾತೆಯೇ, ರೋಗಗಳನ್ನು ನಿವಾರಿಸಲು ನಿನ್ನ ಮಡಿಲಲ್ಲಿ ಬೆಳೆದ ಮೂಲಿಕೆಗಳನ್ನು ಪಡೆಯುತ್ತಿದ್ದೇವೆ. ನೋವಿನಿಂದ ಬಳಲುವ ನಮ್ಮ ಜನರಿಗೆ ಆರೋಗ್ಯ ನೀಡುವ ಶಕ್ತಿಯನ್ನು ಈ ಔಷಧಿಯಲ್ಲಿ ಕರುಣಿಸು.",
      ml: "ഗിരിമാതാവേ, രോഗശമനത്തിനായി അങ്ങയുടെ മടിത്തട്ടിൽ വളർന്ന ഔഷധമൂലികകൾ ഞങ്ങൾ സ്വീകരിക്കുന്നു. രോഗികൾക്ക് ആശ്വാസം നൽകുന്ന ദിവ്യശക്തി ഈ മരുന്നുകളിൽ നിറയ്ക്കേണമേ."
    }
  },
  {
    id: "vr-109",
    originalAudioId: "audio-vr-109-tulu",
    title: "Tulu Spirit Paddana Epic Chants",
    language: "Tulu",
    dialect: "Coastal Tulunadu Folk Epic",
    duration: "00:10",
    durationSeconds: 10,
    type: "Oral Epic",
    community: "Paddana Singers & Daiva Custodians",
    location: "Udupi & Mangalore Coastline, Karnataka",
    culturalContext: "Rhythmic epic poem recounting the valorous legend of Koti and Chennaya, twin heroes of Tulunadu who stood for justice, caste equality, and communal harmony in the 16th century.",
    audioUrl: "/audio/vr-109-tulu-recording.wav",
    audioFileName: "vr-109-tulu-recording.wav",
    audioFileSize: 455256,
    audioMimeType: "audio/wav",
    uploadDate: "2026-10-04T16:45:00.000Z",
    sourceType: "field_recording",
    originalTranscript: "ತುಳುನಾಡ ಮಣ್ಣ್‌ಡ್ ಪುಟ್ಟಿನ ವೀರ ಜೋಕುಲು ಕೋಟಿ ಚೆನ್ನಯೆರೆ ಪುದರ್ ಅಮರ. ಅನ್ಯಾಯೊನು ಎದುರಿಸಿ ಧರ್ಮದ ಸತ್ಯೊನು ಕಾತಿನ ಮಹಾ ಪುರುಷೆರೆ ಪಾಡ್ದನೊನು ನಮ ದಿನಾಲ ನೆನೆಪೊಡು.",
    translations: {
      en: "Born on the sacred soil of Tulunadu, the legendary heroic twins Koti and Chennaya remain immortal. Let us continuously chant their heroic Paddana ballad, remembering how they confronted tyranny to uphold truth.",
      te: "తులసీమ పవిత్ర నేలపై జన్మించిన ధీరోదాత్తులు కోటి-చెన్నయ్యల నామం అమరం. అన్యాయాన్ని ఎదిరించి ధర్మాన్ని నిలిపిన ఆ మహనీయుల వీరగాథను మనం సదా స్మరించుకుందాం.",
      hi: "तुलुनाडु की पवित्र धरती पर जन्मे वीर जुड़वां कोटी और चेन्नय्या का नाम अमर है। आइए हम उनके वीरतापूर्ण पाड्डन महाकाव्य का गान करें जिन्होंने अन्याय के विरुद्ध सत्य की रक्षा की।",
      ta: "துளுநாட்டின் புனித மண்ணில் பிறந்த வீர சகோதரர்கள் கோடி மற்றும் சென்னையாவின் பெயர் என்றும் அழியாதது. அநீதியை எதிர்த்து தர்மத்தைக் காத்த அவர்களின் புகழை என்றும் பாடுவோம்.",
      kn: "ತುಳುನಾಡಿನ ಪವಿತ್ರ ನೆಲದಲ್ಲಿ ಜನಿಸಿದ ಅಪ್ರತಿಮ ವೀರರಾದ ಕೋಟಿ-ಚೆನ್ನಯ್ಯರ ಹೆಸರು ಶಾಶ್ವತ. ಅನ್ಯಾಯವನ್ನು ಮೆಟ್ಟಿ ನಿಂತು ಸತ್ಯ ಧರ್ಮವನ್ನು ಎತ್ತಿಹಿಡಿದ ಅವರ ಪಾದ್ದನ ಮಹಾಕಾವ್ಯವನ್ನು ನಿತ್ಯವೂ ಸ್ಮರಿಸೋಣ.",
      ml: "തുളുനാടിന്റെ പുണ്യഭൂമിയിൽ ജനിച്ച ധീര സഹೋದരങ്ങളായ കോട്ടിയുടെയും ചെന്നയ്യയുടെയും നാമം അനശ്വരമാണ്. അനീതിക്കെതിരെ പോരാടി ധർമ്മം കാത്ത അവരുടെ വീരഗാഥ നാം സ്മരിക്കണം."
    }
  },
  {
    id: "vr-110",
    originalAudioId: "audio-vr-110-lambadi",
    title: "Nomadic Caravan Twilight Ballad",
    language: "Lambadi",
    dialect: "Deccan Banjara Tanda Dialect",
    duration: "00:09",
    durationSeconds: 10,
    type: "Folk Ballad",
    community: "Banjara Tanda Heritage Elders",
    location: "Nalgonda - Mahabubnagar Plateau",
    culturalContext: "Sung around campfires during twilight when cattle return from scrub forests. It preserves centuries-old trading migration routes, oral wisdom, and the blessing of ancestral mother goddesses.",
    audioUrl: "/audio/vr-110-lambadi-recording.wav",
    audioFileName: "vr-110-lambadi-recording.wav",
    audioFileSize: 443384,
    audioMimeType: "audio/wav",
    uploadDate: "2026-10-05T18:00:00.000Z",
    sourceType: "field_recording",
    originalTranscript: "తాండా మాంజ సంధ్యా వేళా గొడ్లు గోదా ఘరా ఆవచ్ఛి. హమారో బంజారా సత్ ధర్మ సదా సాచే మారగంపర్ చాలచ్ఛి. ఐ సేవాభాయా ఆశీర్వాద్ హమారే సాథ్ ఛె.",
    translations: {
      en: "At twilight across our Banjara hamlet, the herds return home safely. Our ancestral way of life perseveres along the true path. The sacred blessing of Guru Sevabhaya remains forever with our people.",
      te: "సంధ్యా సమయంలో మా తాండాలో పశువులు క్షేమంగా ఇళ్లకు చేరాయి. మా బంజారా సత్సంప్రదాయం ఎల్లప్పుడూ సత్య మార్గంలోనే నడుస్తుంది. సద్గురు సేవాలాల్ మహారాజ్ దీవెనలు మాపై సదా ఉంటాయి.",
      hi: "संध्या वेला में हमारे टांडा में गौमाता और बछड़े सकुशल घर लौटते हैं। हमारी बंजारा संस्कृति सदा सत्य के पथ पर अग्रसर है। गुरु सेवाभाया का आशीर्वाद सदैव हमारे साथ है।",
      ta: "மாலை நேரத்தில் எங்கள் குடியிருப்புக்கு கால்நடைகள் நலமுடன் திரும்புகின்றன. எங்கள் பாரம்பரிய தர்மம் எப்போதும் உண்மை வழியில் நடக்கிறது. குரு சேவாபாயாவின் அருள் என்றும் எங்களோடு உள்ளது.",
      kn: "ಸಂಜೆ ಹೊತ್ತಿನಲ್ಲಿ ನಮ್ಮ ತಾಂಡಾಕ್ಕೆ ದನಕರುಗಳು ಕ್ಷೇಮವಾಗಿ ಹಿಂದಿರುಗುತ್ತವೆ. ನಮ್ಮ ಬಂಜಾರ ಪರಂಪರೆ ಸದಾ ಸತ್ಯ ಮಾರ್ಗದಲ್ಲೇ ಮುನ್ನಡೆಯುತ್ತದೆ. ಗುರು ಸೇವಾಭಾಯರ ಆಶೀರ್ವಾದ ಸದಾ ನಮ್ಮ ಮೇಲಿದೆ.",
      ml: "സന്ധ്യാസമയത്ത് ഞങ്ങളുടെ താണ്ഡയിലേക്ക് കന്നുകാലികൾ സുരക്ഷിതമായി മടങ്ങിയെത്തുന്നു. ഞങ്ങളുടെ പാരമ്പര്യം എപ്പോഴും സത്യപാതയിലാണ്. ഗുരു സേവാഭായയുടെ അനുഗ്രഹം എപ്പോഴും ഞങ്ങളോടൊപ്പമുണ്ട്."
    }
  }
];
