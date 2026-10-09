// Comprehensive Day-to-Day Conversational Corpus & Multilingual Knowledgebase
// Supporting 10 Core Practical Categories with Dialogue Turns, Transliterations & Pronunciation Guidance

export interface DialogueTurn {
  speaker: string; // e.g. "Speaker 1" / "Speaker 2", "Student" / "Professor", "Buyer" / "Shopkeeper"
  text: {
    te: string;
    en: string;
    hi: string;
    ta?: string;
    kn?: string;
    ml?: string;
    [lang: string]: string | undefined;
  };
  transliteration: {
    te?: string;
    hi?: string;
    en?: string;
    [lang: string]: string | undefined;
  };
  pronunciationGuidance: string;
}

export interface ConversationDialogue {
  id: string;
  category: string;
  title: string;
  situation: string;
  turns: DialogueTurn[];
}

export interface ConversationPhrase {
  patterns: string[];
  te: string;
  en: string;
  hi: string;
  ta?: string;
  kn?: string;
  ml?: string;
  mr?: string;
  or?: string;
  bn?: string;
  gondi?: string;
  koya?: string;
  lambadi?: string;
  category: string;
  transliteration?: {
    te?: string;
    hi?: string;
    en?: string;
  };
  pronunciationGuidance?: string;
  [key: string]: any;
}

export const CONVERSATION_CATEGORIES = [
  "Greetings and introductions",
  "Everyday questions and answers",
  "College and classroom",
  "Shopping and money",
  "Food and restaurants",
  "Travel and directions",
  "Family and friends",
  "Healthcare and emergencies",
  "Work and interviews",
  "Common Telugu-English-Hindi conversations",
] as const;

export type ConversationCategoryType = (typeof CONVERSATION_CATEGORIES)[number];

// ─────────────────────────────────────────────────────────────────────────────
// 10 COMPLETE STRUCTURED DIALOGUES WITH SPEAKER LABELS & GUIDANCE
// ─────────────────────────────────────────────────────────────────────────────

export const STRUCTURED_DIALOGUES: ConversationDialogue[] = [
  // 1. Greetings and introductions
  {
    id: "greetings-01",
    category: "Greetings and introductions",
    title: "Meeting a New Colleague or Neighbor",
    situation: "Introducing yourself politely and asking about well-being in daily life.",
    turns: [
      {
        speaker: "Speaker 1",
        text: {
          te: "నమస్కారం అండి! నా పేరు రాజేష్. మిమ్మల్ని కలవడం చాలా సంతోషంగా ఉంది.",
          en: "Hello! My name is Rajesh. It is a pleasure to meet you.",
          hi: "नमस्ते! मेरा नाम राजेश है। आपसे मिलकर बहुत खुशी हुई।",
          ta: "வணக்கம்! என் பெயர் ராஜேஷ். உங்களை சந்தித்ததில் மிக்க மகிழ்ச்சி.",
          kn: "ನಮಸ್ಕಾರ! ನನ್ನ ಹೆಸರು ರಾಜೇಶ್. ನಿಮ್ಮನ್ನು ಭೇಟಿಯಾಗಿದ್ದಕ್ಕೆ ತುಂಬಾ ಸಂತೋಷವಾಯಿತು.",
          ml: "നമസ്കാരം! എന്റെ പേര് രാജേഷ്. നിങ്ങളെ കണ്ടതിൽ വളരെ സന്തോഷം.",
        },
        transliteration: {
          te: "Namaskāram andi! Nā pēru Rājēsh. Mimmalni kalavaḍam chālā santōṣangā undi.",
          hi: "Namaste! Mera naam Rajesh hai. Aapse milkar bahut khushi hui.",
          en: "Hello! My name is Rajesh. Nice to meet you.",
        },
        pronunciationGuidance: "Stress gently on 'Nan-di' in Namaskāram andi. Keep 'chālā' long on the first vowel.",
      },
      {
        speaker: "Speaker 2",
        text: {
          te: "నమస్తే రాజేష్ గారు! నా పేరు సురేష్. మీరు ఎలా ఉన్నారు? ఇక్కడ ఎంతకాలంగా ఉంటున్నారు?",
          en: "Namaste Rajesh garu! My name is Suresh. How are you? How long have you been living here?",
          hi: "नमस्ते राजेश जी! मेरा नाम सुरेश है। आप कैसे हैं? आप यहाँ कितने समय से रह रहे हैं?",
          ta: "வணக்கம் ராஜேஷ் அவர்களே! என் பெயர் சுரேஷ். எப்படி இருக்கிறீர்கள்? இங்கு எவ்வளவு காலமாக வசிக்கிறீர்கள்?",
          kn: "ನಮಸ್ತೆ ರಾಜೇಶ್ ಅವರೇ! ನನ್ನ ಹೆಸರು ಸುರೇಶ್. ನೀವು ಹೇಗಿದ್ದೀರಿ? ಇಲ್ಲಿ ಎಷ್ಟು ಸಮಯದಿಂದ ಇದ್ದೀರಿ?",
          ml: "നമസ്തേ രാജേഷ് സർ! എന്റെ പേര് സുരേഷ്. സുഖമാണോ? ഇവിടെ എത്ര നാളായി താമസിക്കുന്നു?",
        },
        transliteration: {
          te: "Namastē Rājēsh gāru! Nā pēru Surēsh. Mīru elā unnāru? Ikkada entakālangā uṇṭunnāru?",
          hi: "Namaste Rajesh ji! Mera naam Suresh hai. Aap kaise hain? Aap yahan kitne samay se rah rahe hain?",
          en: "Hello Rajesh! My name is Suresh. How are you? How long have you lived here?",
        },
        pronunciationGuidance: "Honorific suffix 'gāru' has a soft dental 'g' and elongated 'ā'.",
      },
    ],
  },

  // 2. Everyday questions and answers
  {
    id: "everyday-qa-01",
    category: "Everyday questions and answers",
    title: "Asking Daily Logistics & Time",
    situation: "Asking about current time, schedules, and daily routines.",
    turns: [
      {
        speaker: "Speaker 1",
        text: {
          te: "క్షమించండి, ఇప్పుడు సమయం ఎంత అవుతోంది? నా గడియారం ఆగిపోయింది.",
          en: "Excuse me, what time is it right now? My watch has stopped.",
          hi: "माफ़ कीजिए, अभी कितना समय हुआ है? मेरी घड़ी रुक गई है।",
          ta: "மன்னிக்கவும், இப்போது மணி என்ன? என் கடிகாரம் நின்றுவிட்டது.",
          kn: "ಕ್ಷಮಿಸಿ, ಈಗ ಸಮಯ ಎಷ್ಟು? ನನ್ನ ಗಡಿಯಾರ ನಿಂತುಹೋಗಿದೆ.",
          ml: "ക്ഷമിക്കണം, ഇപ്പോൾ സമയം എത്രയായി? എന്റെ വാച്ച് നിന്നുപോയി.",
        },
        transliteration: {
          te: "Kṣaminchaṇḍi, ippuḍu samayam enta avutōndi? Nā gaḍiyāram āgipōyindi.",
          hi: "Maaf kijiye, abhi kitna samay hua hai? Meri ghadi ruk gayi hai.",
          en: "Excuse me, what time is it? My watch stopped.",
        },
        pronunciationGuidance: "Soft dental 'kṣa'. Elongate 'āgi-' in āgipōyindi.",
      },
      {
        speaker: "Speaker 2",
        text: {
          te: "ఇప్పుడు సాయంత్రం సరిగ్గా ఐదున్నర అయ్యింది. ఇంకా సమయం ఉంది, కంగారు పడకండి.",
          en: "It is exactly five-thirty in the evening now. There is still time, please do not worry.",
          hi: "अभी शाम के ठीक साढ़े पांच बजे हैं। अभी समय है, चिंता मत कीजिए।",
          ta: "இப்போது மாலை சரியாக ஐந்து முப்பது ஆகிறது. இன்னும் நேரம் இருக்கிறது, பதற்றப்படாதீர்கள்.",
          kn: "ಈಗ ಸಂಜೆ ಸರಿಯಾಗಿ ಐದೂವರೆ ಆಗಿದೆ. ಇನ್ನೂ ಸಮಯವಿದೆ, ಆತಂಕಪಡಬೇಡಿ.",
          ml: "ഇപ്പോൾ വൈകുന്നേരം കൃത്യം അഞ്ചരയായി. ഇനിയും സമയമുണ്ട്, വിഷമിക്കേണ്ട.",
        },
        transliteration: {
          te: "Ippuḍu sāyantram sariggā aidunnara ayyindi. Inkā samayam undi, kaṅgāru paḍakaṇḍi.",
          hi: "Abhi shaam ke theek saadhe paanch baje hain. Abhi samay hai, chinta mat kijiye.",
          en: "It is exactly 5:30 PM. There is still time, don't worry.",
        },
        pronunciationGuidance: "Clear retroflex 'ḍ' in 'paḍakaṇḍi' signifying polite reassurance.",
      },
    ],
  },

  // 3. College and classroom
  {
    id: "college-01",
    category: "College and classroom",
    title: "Discussing College Assignments & Class Timetable",
    situation: "Two students talking outside the lecture hall about assignments and professor notes.",
    turns: [
      {
        speaker: "Speaker 1",
        text: {
          te: "రేపటి కంప్యూటర్ సైన్స్ అసైన్‌మెంట్ పూర్తి చేశావా? ఆ ప్రాజెక్ట్ చాలా కష్టంగా ఉంది.",
          en: "Did you complete tomorrow's computer science assignment? That project is quite tough.",
          hi: "क्या तुमने कल का कंप्यूटर साइंस असाइनमेंट पूरा कर लिया? वह प्रोजेक्ट काफी कठिन है।",
          ta: "நாளைய கணினி அறிவியல் ஒப்படைப்பை முடித்துவிட்டீர்களா? அந்த திட்டம் மிகவும் கடினமாக உள்ளது.",
          kn: "ನಾಳಿನ ಕಂಪ್ಯೂಟರ್ ಸೈನ್ಸ್ ಅಸೈನ್‌ಮೆಂಟ್ ಮುಗಿಸಿದಿರಾ? ಆ ಪ್ರಾಜೆಕ್ಟ್ ತುಂಬಾ ಕಷ್ಟವಾಗಿದೆ.",
          ml: "നാളത്തെ കമ്പ്യൂട്ടർ സയൻസ് അസൈൻമെന്റ് പൂർത്തിയാക്കിയോ? ആ പ്രോജക്റ്റ് വളരെ ബുദ്ധിമുട്ടാണ്.",
        },
        transliteration: {
          te: "Rēpaṭi computer science assignment pūrti chēśāvā? Ā project chālā kaṣṭaṅgā undi.",
          hi: "Kya tumne kal ka computer science assignment poora kar liya? Vah project kaafi kathin hai.",
          en: "Did you finish tomorrow's CS assignment? It's really tough.",
        },
        pronunciationGuidance: "Hard 'ṣṭa' conjunct in 'kaṣṭaṅgā'. Friendly informal tone between peers.",
      },
      {
        speaker: "Speaker 2",
        text: {
          te: "సగం మాత్రమే అయ్యింది. లైబ్రరీలో కూర్చుని కలిసి పూర్తి చేద్దామా? ప్రొఫెసర్ గారి నోట్స్ నా దగ్గర ఉన్నాయి.",
          en: "I have only finished half of it. Shall we sit in the library and complete it together? I have the professor's notes with me.",
          hi: "केवल आधा ही हुआ है। क्या हम लाइब्रेरी में बैठकर इसे साथ मिलकर पूरा करें? प्रोफेसर के नोट्स मेरे पास हैं।",
          ta: "பாதி மட்டுமே முடிந்துள்ளது. நூலகத்தில் அமர்ந்து ஒன்றாக முடிக்கலாமா? பேராசிரியரின் குறிப்புகள் என்னிடம் உள்ளன.",
          kn: "ಅರ್ಧ ಮಾತ್ರ ಮುಗಿದಿದೆ. ಲೈಬ್ರರಿಯಲ್ಲಿ ಕುಳಿತು ಒಟ್ಟಿಗೆ ಮುಗಿಸೋಣವೇ? ಪ್ರೊಫೆಸರ್ ನೋಟ್ಸ್ ನನ್ನ ಬಳಿ ಇದೆ.",
          ml: "പകുതി മാത്രമേ കഴിഞ്ഞുള്ളൂ. ലൈബ്രറിയിലിരുന്ന് ഒരുമിച്ച് പൂർത്തിയാക്കിയാലോ? പ്രൊഫസറുടെ കുറിപ്പുകൾ എന്റെ കൈയിലുണ്ട്.",
        },
        transliteration: {
          te: "Sagaṁ mātramē ayyindi. Library-lō kūrchuni kalisi pūrti chēddāmā? Professor gāri notes nā daggara unnāyi.",
          hi: "Keval aadha hi hua hai. Kya hum library mein baithkar ise saath poora karein? Professor ke notes mere paas hain.",
          en: "Only half done. Shall we sit in the library together? I have the professor's notes.",
        },
        pronunciationGuidance: "Double 'dd' in 'chēddāmā' indicates collaborative proposal ('shall we do').",
      },
    ],
  },

  // 4. Shopping and money
  {
    id: "shopping-01",
    category: "Shopping and money",
    title: "Market Bargaining and UPI Payment",
    situation: "Buyer inquiring about price of organic produce and paying via digital UPI.",
    turns: [
      {
        speaker: "Speaker 1 (Buyer)",
        text: {
          te: "ఈ తాజా పండ్ల బుట్ట ధర ఎంత? కొంచెం తగ్గించి ఇస్తే రెండు కిలోలు తీసుకుంటాను.",
          en: "How much is this basket of fresh fruits? If you reduce the price a little, I will take two kilograms.",
          hi: "इस ताज़े फलों की टोकरी का दाम क्या है? थोड़ा कम करेंगे तो मैं दो किलो ले लूँगा।",
          ta: "இந்த புதிய பழங்களின் கூடை விலை என்ன? கொஞ்சம் குறைத்தால் இரண்டு கிலோ வாங்குகிறேன்.",
          kn: "ಈ ತಾಜಾ ಹಣ್ಣಿನ ಬುಟ್ಟಿಯ ಬೆಲೆ ಎಷ್ಟು? ಸ್ವಲ್ಪ ಕಡಿಮೆ ಮಾಡಿದರೆ ಎರಡು ಕಿಲೋ ತೆಗೆದುಕೊಳ್ಳುತ್ತೇನೆ.",
          ml: "ഈ പുതിയ പഴക്കൂടയ്ക്ക് എത്രയാണ് വില? അല്പം കുറച്ചാൽ രണ്ട് കിലോ വാങ്ങാം.",
        },
        transliteration: {
          te: "Ī tājā paṇḍla buṭṭa dhara enta? Koñcham taggin̄chi istē reṇḍu kilōlu tīsukunṭānu.",
          hi: "Is taaze phalon ki tokri ka daam kya hai? Thoda kam karenge toh main do kilo le loonga.",
          en: "What is the price of these fruits? Give a small discount and I will take 2 kgs.",
        },
        pronunciationGuidance: "Soft nasal in 'koñcham'. Stress the retroflex 'ṇḍ' in 'paṇḍla'.",
      },
      {
        speaker: "Speaker 2 (Shopkeeper)",
        text: {
          te: "సరేనండి, మీకు కిలో నూట యాభైకి ఇస్తాను. నగదు ఇస్తారా లేక ఫోన్‌పే / గూగుల్‌పే స్కాన్ చేస్తారా?",
          en: "Alright, I will give it to you for one hundred and fifty per kilo. Will you pay cash or scan PhonePe / Google Pay?",
          hi: "ठीक है, आपको एक सौ पचास रुपये प्रति किलो दे दूंगा। नकद देंगे या फोनपे / गूगल पे स्कैन करेंगे?",
          ta: "சரி, உங்களுக்கு கிலோ நூற்று ஐம்பது ரூபாய்க்கு தருகிறேன். ரொக்கம் தருகிறீர்களா அல்லது கூகுள் பே ஸ்கேன் செய்கிறீர்களா?",
          kn: "ಸರಿ, ನಿಮಗೆ ಕಿಲೋಗೆ ನೂರೈವತ್ತು ರೂಪಾಯಿಗೆ ಕೊಡುತ್ತೇನೆ. ನಗದು ಕೊಡುತ್ತೀರಾ ಅಥವಾ ಯುಪಿಐ ಸ್ಕ್ಯಾನ್ ಮಾಡುತ್ತೀರಾ?",
          ml: "ശരി, നിങ്ങൾക്ക് കിലോയ്ക്ക് നൂറ്റമ്പത് രൂപയ്ക്ക് തരാം. പണമായി തരുമോ അതോ ഗൂഗിൾ പേ സ്കാൻ ചെയ്യുമോ?",
        },
        transliteration: {
          te: "Sarēnaṇḍi, mīku kilō nūṭa yābhaiki istānu. Nagadu istārā lēka PhonePe / Google Pay scan chēstārā?",
          hi: "Theek hai, aapko ek sau pachaas rupaye prati kilo de doonga. Cash denge ya UPI scan karenge?",
          en: "Alright, 150 per kg for you. Paying cash or scanning PhonePe / Google Pay?",
        },
        pronunciationGuidance: "Familiar modern retail terms blended naturally with Telugu phrasing.",
      },
    ],
  },

  // 5. Food and restaurants
  {
    id: "food-01",
    category: "Food and restaurants",
    title: "Ordering South Indian Meals & Special Preferences",
    situation: "Ordering traditional food at a local restaurant with dietary preference for less spice.",
    turns: [
      {
        speaker: "Speaker 1 (Customer)",
        text: {
          te: "దయచేసి మాకు రెండు నెయ్యి కారం దోశలు మరియు ఫిల్టర్ కాఫీ ఇవ్వండి. కారం కొంచెం తక్కువగా ఉండాలి.",
          en: "Please bring us two ghee karam dosas and a filter coffee. Please keep the spice level mild.",
          hi: "कृपया हमारे लिए दो घी करम डोसा और फ़िल्टर कॉफ़ी ले आइए। मिर्च थोड़ी कम रखिएगा।",
          ta: "தயவுசெய்து எங்களுக்கு இரண்டு நெய் கார தோசைகளும் ஒரு ஃபில்டர் காபியும் கொடுங்கள். காரம் குறைவாக இருக்கட்டும்.",
          kn: "ದಯವಿಟ್ಟು ನಮಗೆ ಎರಡು ತುಪ್ಪದ ಖಾರದ ದೋಸೆ ಮತ್ತು ಫಿಲ್ಟರ್ ಕಾಫಿ ಕೊಡಿ. ಖಾರ ಸ್ವಲ್ಪ ಕಡಿಮೆಯಿರಲಿ.",
          ml: "ദയവായി ഞങ്ങൾക്ക് രണ്ട് നെയ്യ് കാരം ദോശയും ഫിൽട്ടർ കോഫിയും തരൂ. എരിവ് കുറവായിരിക്കണം.",
        },
        transliteration: {
          te: "Dayachēsi māku reṇḍu neyyi kāram dōśalu mariyu filter coffee ivvaṇḍi. Kāram koñcham takkuvagā uṇḍāli.",
          hi: "Kripya hamare liye do ghee karam dosa aur filter coffee le aaiye. Mirch thodi kam rakhiyega.",
          en: "Please get two ghee karam dosas and filter coffee. Make it less spicy.",
        },
        pronunciationGuidance: "Polite imperative suffix 'ivvaṇḍi' with double 'vv'. Soft palatal 'ś' in dōśalu.",
      },
      {
        speaker: "Speaker 2 (Waiter)",
        text: {
          te: "తప్పకుండా అండి! పది నిమిషాల్లో వేడివేడిగా వడ్డిస్తాము. తాగడానికి మంచి నీళ్ళు తెమ్మంటారా?",
          en: "Certainly! We will serve it piping hot in ten minutes. Shall I bring drinking water for you?",
          hi: "बिल्कुल जी! दस मिनट में गरमा-गरम परोस देंगे। क्या पीने के लिए पानी लाऊँ?",
          ta: "நிச்சயமாக! பத்து நிமிடங்களில் சூடாகக் கொண்டு வருகிறேன். குடிக்கத் தண்ணீர் கொண்டு வரட்டுமா?",
          kn: "ಖಂಡಿತವಾಗಿಯೂ! ಹತ್ತು ನಿಮಿಷದಲ್ಲಿ ಬಿಸಿಬಿಸಿಯಾಗಿ ಬಡಿಸುತ್ತೇವೆ. ಕುಡಿಯಲು ನೀರು ತರಲೇ?",
          ml: "തീർച്ചയായും! പത്ത് മിനിറ്റിൽ ചൂടോടെ എത്തിക്കാം. കുടിക്കാൻ വെള്ളം കൊണ്ടുവരട്ടെയോ?",
        },
        transliteration: {
          te: "Tappakuṇḍā aṇḍi! Padi nimiṣāllō vēḍivēḍigā vaḍḍistāmu. Tāgaḍāniki manchi nīḷḷu temmaṇṭārā?",
          hi: "Bilkul ji! Das minute mein garma-garam paros denge. Kya peene ke liye paani laaoon?",
          en: "Certainly! Hot in 10 minutes. Should I bring drinking water?",
        },
        pronunciationGuidance: "Reduplicated adjective 'vēḍivēḍigā' (piping hot). Soft retroflex 'ḷḷ' in 'nīḷḷu'.",
      },
    ],
  },

  // 6. Travel and directions
  {
    id: "travel-01",
    category: "Travel and directions",
    title: "Asking for Bus Station & Way to Main Junction",
    situation: "Traveler asking a local pedestrian for directions to the railway station or bus stop.",
    turns: [
      {
        speaker: "Speaker 1",
        text: {
          te: "అన్నా నమస్కారం, ఇక్కడి నుంచి ఆర్టీసీ బస్టాండ్ లేదా రైల్వే స్టేషన్‌కు ఎలా వెళ్ళాలి?",
          en: "Hello brother, how do I get to the RTC bus station or railway station from here?",
          hi: "भैया नमस्ते, यहाँ से बस स्टैंड या रेलवे स्टेशन कैसे जा सकते हैं?",
          ta: "அண்ணா வணக்கம், இங்கிருந்து பேருந்து நிலையம் அல்லது ரயில் நிலையத்திற்கு எப்படி செல்வது?",
          kn: "ಅಣ್ಣಾ ನಮಸ್ಕಾರ, ಇಲ್ಲಿಂದ ಬಸ್ ನಿಲ್ದಾಣ ಅಥವಾ ರೈಲ್ವೆ ಸ್ಟೇಷನ್‌ಗೆ ಹೇಗೆ ಹೋಗಬೇಕು?",
          ml: "ചേട്ടാ നമസ്കാരം, ഇവിടെ നിന്ന് ബസ് സ്റ്റാൻഡിലേക്കോ റെയിൽവേ സ്റ്റേഷനിലേക്കോ എങ്ങനെ പോകണം?",
        },
        transliteration: {
          te: "Annā namaskāram, ikkaḍi ninchi RTC bus stand lēdā railway station-ku elā veḷḷāli?",
          hi: "Bhaiya namaste, yahan se bus stand ya railway station kaise ja sakte hain?",
          en: "Excuse me brother, how to reach RTC bus stand or railway station from here?",
        },
        pronunciationGuidance: "Friendly vocative 'Annā' (elder brother) creates immediate polite rapport.",
      },
      {
        speaker: "Speaker 2",
        text: {
          te: "ముందుకు నేరుగా వెళ్లి, సిగ్నల్ దగ్గర కుడివైపు తిరగండి. అక్కడ నుండి ఐదు నిమిషాలు నడిస్తే బస్టాండ్ ఎదురుగానే ఉంటుంది.",
          en: "Go straight ahead and turn right at the traffic signal. If you walk for five minutes from there, the bus stand will be right in front.",
          hi: "सीधे आगे बढ़िए और ट्रैफिक सिग्नल से दाहिनी तरफ मुड़ जाइए। वहाँ से पाँच मिनट पैदल चलेंगे तो बस स्टैंड ठीक सामने होगा।",
          ta: "நேராகச் சென்று, சிக்னல் அருகில் வலதுபுறம் திரும்புங்கள். அங்கிருந்து ஐந்து நிமிடங்கள் நடந்தால் பேருந்து நிலையம் எதிரே இருக்கும்.",
          kn: "ನೇರವಾಗಿ ಮುಂದೆ ಹೋಗಿ, ಸಿಗ್ನಲ್ ಬಳಿ ಬಲಕ್ಕೆ ತಿರುಗಿ. ಅಲ್ಲಿಂದ ಐದು ನಿಮಿಷ ನಡೆದರೆ ಬಸ್ ನಿಲ್ದಾಣ ಎದುರೇ ಇರುತ್ತದೆ.",
          ml: "നേരെ മുന്നോട്ട് പോയി സിഗ്നലിനടുത്ത് വലത്തോട്ട് തിരിയുക. അവിടെ നിന്ന് അഞ്ച് മിനിറ്റ് നടന്നാൽ ബസ് സ്റ്റാൻഡ് മുന്നിൽ തന്നെ കാണാം.",
        },
        transliteration: {
          te: "Munduku nērugā veḷli, signal daggara kuḍivaipu tiragaṇḍi. Akkaḍa nuṇḍi aidu nimiṣālu naḍistē bus stand edurugānē uṇṭundi.",
          hi: "Seedhe aage badhiye aur signal se right mudiye. Wahan se 5 minute walk karenge toh bus stand theek saamne hoga.",
          en: "Go straight, turn right at signal. Walk 5 mins and bus stand is right ahead.",
        },
        pronunciationGuidance: "Distinguish 'kuḍi' (right side) from 'eḍama' (left side).",
      },
    ],
  },

  // 7. Family and friends
  {
    id: "family-01",
    category: "Family and friends",
    title: "Catching up with a Childhood Friend",
    situation: "Two long-time family friends discussing parents, children, and village visits.",
    turns: [
      {
        speaker: "Speaker 1",
        text: {
          te: "ఎంత కాలం అయ్యింది నిన్ను చూసి! ఇంట్లో అమ్మానాన్న అందరూ క్షేమమేనా? పిల్లల చదువులు ఎలా సాగుతున్నాయి?",
          en: "It has been so long since I saw you! Are your parents and everyone at home doing well? How are the children's studies going?",
          hi: "कितने दिनों बाद तुमसे मिले! घर में माता-पिता और सब लोग कुशल-मंगल हैं ना? बच्चों की पढ़ाई कैसी चल रही है?",
          ta: "உன்னைப் பார்த்து எவ்வளவு காலம் ஆகிவிட்டது! வீட்டில் பெற்றோர் அனைவரும் நலமா? குழந்தைகளின் படிப்பு எப்படி போகிறது?",
          kn: "ನಿನ್ನನ್ನು ನೋಡಿ ಎಷ್ಟು ದಿನವಾಯಿತು! ಮನೆಯಲ್ಲಿ ಅಪ್ಪ-ಅಮ್ಮ ಎಲ್ಲರೂ ಕ್ಷೇಮವೇ? ಮಕ್ಕಳ ಓದು ಹೇಗೆ ಸಾಗುತ್ತಿದೆ?",
          ml: "നിന്നെ കണ്ടിട്ട് എത്ര നാളായി! വീട്ടിൽ അച്ഛനും അമ്മയും എല്ലാവരും സുഖമായിരിക്കുന്നോ? മക്കളുടെ പഠിത്തം എങ്ങനെ പോകുന്നു?",
        },
        transliteration: {
          te: "Enta kālam ayyindi ninnu chūsi! Iṇṭlō ammānānna andarū kṣēmamēnā? Pillala chaduvulu elā sāgutunnāyi?",
          hi: "Kitne dino baad tumse mile! Ghar mein mata-pita sab theek hain na? Bachon ki padhai kaisi chal rahi hai?",
          en: "So long since we met! How are your parents? How are the kids' studies?",
        },
        pronunciationGuidance: "Warm affectionate inflection. Dual conjunct 'mmānā' in 'ammānānna'.",
      },
      {
        speaker: "Speaker 2",
        text: {
          te: "అందరూ బాగున్నారు. వచ్చే పండుగకు మన సొంత ఊరికి వెళ్తున్నాము. నువ్వు కూడా తప్పకుండా రావాలి!",
          en: "Everyone is doing well. We are visiting our hometown for the upcoming festival. You must definitely come too!",
          hi: "सब कुशल हैं। आने वाले त्योहार पर हम अपने पैतृक गाँव जा रहे हैं। तुम्हें भी ज़रूर आना चाहिए!",
          ta: "அனைவரும் நலமாக உள்ளனர். அடுத்த திருவிழாவிற்கு எங்கள் சொந்த ஊருக்குச் செல்கிறோம். நீங்களும் நிச்சயம் வர வேண்டும்!",
          kn: "ಎಲ್ಲರೂ ಚೆನ್ನಾಗಿದ್ದಾರೆ. ಮುಂದಿನ ಹಬ್ಬಕ್ಕೆ ನಮ್ಮ ಸ್ವಂತ ಊರಿಗೆ ಹೋಗುತ್ತಿದ್ದೇವೆ. ನೀನೂ ಖಂಡಿತ ಬರಬೇಕು!",
          ml: "എല്ലാവരും സുഖമായിരിക്കുന്നു. അടുത്ത ഉത്സവത്തിന് ഞങ്ങൾ സ്വന്തം നാട്ടിലേക്ക് പോകുന്നുണ്ട്. നീയും തീർച്ചയായും വരണം!",
        },
        transliteration: {
          te: "Andarū bāgunnāru. Vachchē paṇḍugaku mana sonta ūriki veḷtunnāmu. Nuvvu kūḍā tappakuṇḍā rāvāli!",
          hi: "Sab theek hain. Aane wale festival par hum apne gaon ja rahe hain. Tum bhi zaroor aana!",
          en: "Everyone is good. We are going to our village for the festival. You must join too!",
        },
        pronunciationGuidance: "Stress on 'tappakuṇḍā' conveys genuine, heartfelt invitation.",
      },
    ],
  },

  // 8. Healthcare and emergencies
  {
    id: "health-01",
    category: "Healthcare and emergencies",
    title: "Consulting a Doctor about Fever & Medicine",
    situation: "Patient explaining symptoms of seasonal fever and asking for prescription dosage.",
    turns: [
      {
        speaker: "Speaker 1 (Patient)",
        text: {
          te: "డాక్టర్ గారూ, గత రెండు రోజులుగా నాకు తీవ్రమైన జ్వరం మరియు ఒళ్ళు నొప్పులు ఉన్నాయి. తలనొప్పి కూడా తగ్గడం లేదు.",
          en: "Doctor, I have had a severe fever and body aches for the past two days. Even the headache is not subsiding.",
          hi: "डॉक्टर साहब, पिछले दो दिनों से मुझे तेज़ बुखार और बदन दर्द है। सिरदर्द भी कम नहीं हो रहा है।",
          ta: "மருத்துவரே, கடந்த இரண்டு நாட்களாக எனக்கு கடுமையான காய்ச்சலும் உடல் வலியும் உள்ளது. தலைவலியும் குறையவில்லை.",
          kn: "ಡಾಕ್ಟರೇ, ಕಳೆದ ಎರಡು ದಿನಗಳಿಂದ ನನಗೆ ತೀವ್ರ ಜ್ವರ ಮತ್ತು ಮೈಕೈ ನೋವು ಇದೆ. ತಲೆನೋವು ಕೂಡ ಕಡಿಮೆಯಾಗುತ್ತಿಲ್ಲ.",
          ml: "ഡോക്ടർ, കഴിഞ്ഞ രണ്ട് ദിവസമായി എനിക്ക് കടുത്ത പനിയും ശരീരവേദനയുമുണ്ട്. തലവേദനയും മാറുന്നില്ല.",
        },
        transliteration: {
          te: "Doctor gārū, gata reṇḍu rōjulugā nāku tīvramaina jvaraṁ mariyu oḷḷu noppulu unnāyi. Talanoppi kūḍā taggaḍaṁ lēdu.",
          hi: "Doctor sahab, pichle do dino se mujhe tez bukhar aur badan dard hai. Sirdard bhi theek nahi ho raha.",
          en: "Doctor, I've had high fever and body ache for 2 days. The headache isn't stopping.",
        },
        pronunciationGuidance: "Clear medical vocabulary: 'tīvramaina' (severe), 'jvaraṁ' (fever), 'noppulu' (aches).",
      },
      {
        speaker: "Speaker 2 (Doctor)",
        text: {
          te: "కంగారు పడకండి. ఇది సాధారణ వాతావరణ మార్పుల జ్వరం. ఈ మాత్రలు ఉదయం మరియు రాత్రి భోజనం తర్వాత వేసుకోండి. పుష్కలంగా నీరు తాగండి.",
          en: "Do not worry. This is a common viral fever due to seasonal change. Take these tablets in the morning and night after food. Drink plenty of water.",
          hi: "चिंता मत कीजिए। यह मौसमी बदलाव का सामान्य वायरल बुखार है। ये दवाइयाँ सुबह और रात को खाने के बाद लीजिए। खूब पानी पीजिए।",
          ta: "பயப்பட வேண்டாம். இது பருவகால மாற்றத்தால் வந்த சாதாரண காய்ச்சல். இந்த மாத்திரைகளை காலை மற்றும் இரவு உணவுக்குப் பின் உட்கொள்ளுங்கள். நிறைய தண்ணீர் குடியுங்கள்.",
          kn: "ಹೆದರಬೇಡಿ. ಇದು ಹವಾಮಾನ ಬದಲಾವಣೆಯ ಸಾಮಾನ್ಯ ಜ್ವರ. ಈ ಮಾತ್ರೆಗಳನ್ನು ಬೆಳಿಗ್ಗೆ ಮತ್ತು ರಾತ್ರಿ ಊಟದ ನಂತರ ತೆಗೆದುಕೊಳ್ಳಿ. ಸಾಕಷ್ಟು ನೀರು ಕುಡಿಯಿರಿ.",
          ml: "വിഷമിക്കേണ്ട. കാലാവസ്ഥാ വ്യതിയാനം മൂലമുള്ള സാധാരണ പനിയാണിത്. ഈ ഗുളികകൾ രാവിലെയും രാത്രിയും ഭക്ഷണത്തിന് ശേഷം കഴിക്കുക. ധാരാളം വെള്ളം കുടിക്കുക.",
        },
        transliteration: {
          te: "Kaṅgāru paḍakaṇḍi. Idi sādhāraṇa vātāvaraṇa mār覚ula jvaraṁ. Ī mātralu udayaṁ mariyu rātri bhōjanaṁ tarvāta vēsukōṇḍi. Puṣkalaṅgā nīru tāgaṇḍi.",
          hi: "Chinta mat kijiye. Yeh viral bukhar hai. Yeh tablets subah-shaam khane ke baad lein. Paani khoob piyein.",
          en: "Don't worry, it's seasonal fever. Take these tablets morning & night after meals. Stay hydrated.",
        },
        pronunciationGuidance: "Reassuring medical tone. 'Puṣkalaṅgā' means in generous / plentiful abundance.",
      },
    ],
  },

  // 9. Work and interviews
  {
    id: "work-01",
    category: "Work and interviews",
    title: "Job Interview & Career Background",
    situation: "Candidate introducing technical experience and passion during a job interview.",
    turns: [
      {
        speaker: "Speaker 1 (Interviewer)",
        text: {
          te: "మీ మునుపటి అనుభవం గురించి మరియు మా ప్రాజెక్ట్‌లో మీరు ఎలా సహకరించగలరో క్లుప్తంగా చెప్పండి.",
          en: "Please tell us briefly about your prior experience and how you can contribute to our project.",
          hi: "कृपया अपने पिछले अनुभव के बारे में और आप हमारे प्रोजेक्ट में कैसे योगदान दे सकते हैं, संक्षेप में बताएं।",
          ta: "உங்கள் முந்தைய அனுபவம் மற்றும் எங்கள் திட்டத்தில் நீங்கள் எவ்வாறு பங்களிக்க முடியும் என்பதைப் பற்றி சுருக்கமாகக் கூறுங்கள்.",
          kn: "ನಿಮ್ಮ ಹಿಂದಿನ ಅನುಭವ ಮತ್ತು ನಮ್ಮ ಯೋಜನೆಯಲ್ಲಿ ನೀವು ಹೇಗೆ ಕೊಡುಗೆ ನೀಡಬಹುದು ಎಂಬುದನ್ನು ಸಂಕ್ಷಿಪ್ತವಾಗಿ ತಿಳಿಸಿ.",
          ml: "നിങ്ങളുടെ മുൻ പരിചയത്തെക്കുറിച്ചും ഞങ്ങളുടെ പ്രോജക്റ്റിൽ എങ്ങനെ സംഭാവന നൽകാൻ കഴിയുമെന്നതിനെക്കുറിച്ചും ചുരുക്കമായി പറയുക.",
        },
        transliteration: {
          te: "Mī munupaṭi anubhavaṁ gurinchi mariyu mā project-lō mīru elā sahakarin̄chagalarō kḷuptaṅgā cheppaṇḍi.",
          hi: "Kripya apne pichle anubhav ke baare mein aur aap project mein kaise contribute kar sakte hain batayein.",
          en: "Tell us briefly about your past experience and how you can contribute to our project.",
        },
        pronunciationGuidance: "Professional register: 'anubhavaṁ' (experience), 'kḷuptaṅgā' (succinctly).",
      },
      {
        speaker: "Speaker 2 (Candidate)",
        text: {
          te: "నాకు సాఫ్ట్‌వేర్ అభివృద్ధిలో మూడు సంవత్సరాల అనుభవం ఉంది. బృందంతో కలిసి సమస్యలను వేగంగా పరిష్కరించడంలో నేను నైపుణ్యం కలిగి ఉన్నాను.",
          en: "I have three years of experience in software development. I specialize in solving problems rapidly in collaboration with the team.",
          hi: "मुझे सॉफ़्टवेयर विकास में तीन वर्षों का अनुभव है। मैं टीम के साथ मिलकर समस्याओं को तेज़ी से हल करने में कुशल हूँ।",
          ta: "எனக்கு மென்பொருள் மேம்பாட்டில் மூன்று வருட அனுபவம் உள்ளது. குழுவுடன் இணைந்து சிக்கல்களை விரைவாகத் தீர்ப்பதில் எனக்குத் திறன் உண்டு.",
          kn: "ನನಗೆ ಸಾಫ್ಟ್‌ವೇರ್ ಅಭಿವೃದ್ಧಿಯಲ್ಲಿ ಮೂರು ವರ್ಷಗಳ ಅನುಭವವಿದೆ. ತಂಡದೊಂದಿಗೆ ಕೆಲಸ ಮಾಡಿ ಸಮಸ್ಯೆಗಳನ್ನು ತ್ವರಿತವಾಗಿ ಪರಿಹರಿಸುವಲ್ಲಿ ನಾನು ನಿಪುಣನು.",
          ml: "എനിക്ക് സോഫ്റ്റ്‌വെയർ വികസനത്തിൽ മൂന്ന് വർഷത്തെ പരിചയമുണ്ട്. ടീമിനൊപ്പം ചേർന്ന് പ്രശ്നങ്ങൾ വേഗത്തിൽ പരിഹരിക്കാൻ എനിക്ക് സാധിക്കും.",
        },
        transliteration: {
          te: "Nāku software abhivr̥ddhilō mūḍu saṁvatsarāla anubhavaṁ undi. Br̥ndaṁtō kalisi samasyalanu vēgaṅgā pariṣkarin̄chaḍaṁlō nēnu naipuṇyaṁ kaligi unnānu.",
          hi: "Mujhe software development mein 3 saal ka anubhav hai. Main team ke saath problems solve karne mein skilled hoon.",
          en: "I have 3 years of software engineering experience. I excel at fast problem solving with teams.",
        },
        pronunciationGuidance: "Confident articulation: 'naipuṇyaṁ' (expertise / proficiency).",
      },
    ],
  },

  // 10. Common Telugu-English-Hindi conversations
  {
    id: "te-en-hi-01",
    category: "Common Telugu-English-Hindi conversations",
    title: "Trilingual Daily Exchange (Metro, Office & Tea Stall)",
    situation: "Everyday multilingual blending heard across Hyderabad, Bangalore, and Indian cities.",
    turns: [
      {
        speaker: "Speaker 1 (Telugu / English blend)",
        text: {
          te: "హాయ్ రమేష్! ఆఫీస్ మీటింగ్ అయిపోయిందా? లెట్స్ గో ఫర్ టీ!",
          en: "Hi Ramesh! Is the office meeting finished? Let's go for tea!",
          hi: "हाय रमेश! क्या ऑफिस की मीटिंग खत्म हो गई? चलो चाय पीने चलते हैं!",
          ta: "ஹாய் ரமேஷ்! அலுவலக மீட்டிங் முடிந்துவிட்டதா? டீ குடிக்கப் போகலாம்!",
          kn: "ಹಾಯ್ ರಮೇಶ್! ಆಫೀಸ್ ಮೀಟಿಂಗ್ ಮುಗಿಯಿತೇ? ಚಹಾ ಕುಡಿಯಲು ಹೋಗೋಣ!",
          ml: "ഹായ് രമേഷ്! ഓഫീസ് മീറ്റിംഗ് കഴിഞ്ഞോ? ചായ കുടിക്കാൻ പോകാം!",
        },
        transliteration: {
          te: "Hi Ramesh! Office meeting ayipōyindā? Let's go for tea!",
          hi: "Hi Ramesh! Kya office meeting khatam ho gayi? Chalo chai peene chalte hain!",
          en: "Hi Ramesh! Is the meeting over? Let's go for tea!",
        },
        pronunciationGuidance: "Colloquial urban conversational style blending Telugu verbs with English phrases.",
      },
      {
        speaker: "Speaker 2 (Hindi / Telugu blend)",
        text: {
          te: "హా, ఇప్పుడే అయిపోయింది భాయ్! బస్ దో మినిట్ ఆగండి, నా లాప్‌టాప్ బ్యాగ్‌లో పెట్టేసి వస్తాను.",
          en: "Yes, it just ended bro! Just wait two minutes, I will put my laptop in my bag and come.",
          hi: "हाँ, बस अभी खत्म हुई भाई! बस दो मिनट रुको, मैं अपना लैपटॉप बैग में रखकर आता हूँ।",
          ta: "ஆம், இப்போதுதான் முடிந்தது நண்பா! இரண்டு நிமிடம் காத்திருங்கள், மடிக்கணினியை பையில் வைத்துவிட்டு வருகிறேன்.",
          kn: "ಹೌದು, ಈಗಷ್ಟೇ ಮುಗಿಯಿತು ಬ್ರೋ! ಎರಡು ನಿಮಿಷ ಕಾಯಿರಿ, ಲ್ಯಾಪ್‌ಟಾಪ್ ಬ್ಯಾಗ್‌ನಲ್ಲಿ ಇಟ್ಟು ಬರುತ್ತೇನೆ.",
          ml: "അതെ, ഇപ്പോൾ കഴിഞ്ഞതേയുള്ളൂ ബ്രോ! രണ്ട് മിനിറ്റ് നിൽക്കൂ, ലാപ്ടോപ്പ് ബാഗിൽ വെച്ച് വരാം.",
        },
        transliteration: {
          te: "Hā, ippuḍē ayipōyindi bhāi! Bas do minute āgaṇḍi, nā laptop bag-lō peṭṭēsi vastānu.",
          hi: "Haan, abhi khatam hui bhai! Bas do minute ruko, laptop bag mein rakhkar aata hoon.",
          en: "Yes, just finished bro! Give me 2 minutes to pack my laptop and I'm ready.",
        },
        pronunciationGuidance: "Natural trilingual code-switching ('Bas do minute' + 'peṭṭēsi vastānu').",
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPREHENSIVE PHRASES LIST FOR INSTANT SEARCH & LOOKUP
// ─────────────────────────────────────────────────────────────────────────────

export const DAY_TO_DAY_PHRASES: ConversationPhrase[] = [
  // 1. GREETINGS & INTRODUCTIONS
  {
    patterns: [
      "నమస్కారం",
      "బాగున్నారా",
      "ఎలా ఉన్నారు",
      "హలో",
      "hello",
      "hi",
      "how are you",
      "greetings",
      "namaste",
      "vanakkam",
      "namaskara",
    ],
    te: "నమస్కారం! మీరు బాగున్నారా? ఎలా ఉన్నారు?",
    en: "Greetings! How are you doing? Are you well?",
    hi: "नमस्ते! आप कैसे हैं? क्या सब कुशल-मंगल है?",
    ta: "வணக்கம்! நீங்கள் எப்படி இருக்கிறீர்கள்? நலமா?",
    kn: "ನಮಸ್ಕಾರ! ನೀವು ಹೇಗಿದ್ದೀರಿ? ಕ್ಷೇಮವೇ?",
    ml: "നമസ്കാരം! സുഖമാണോ? എങ്ങനെയുണ്ട്?",
    category: "Greetings and introductions",
    transliteration: {
      te: "Namaskāram! Mīru bāgunnārā? Elā unnāru?",
      hi: "Namaste! Aap kaise hain?",
    },
    pronunciationGuidance: "Polite initial greeting. Long 'ā' in 'bāgunnārā'.",
  },
  {
    patterns: [
      "మీ పేరు ఏమిటి",
      "మీ పేరేంటి",
      "నీ పేరేంటి",
      "what is your name",
      "your name",
      "నా పేరు",
      "my name is",
    ],
    te: "మీ పేరు ఏమిటి? నా పేరు తెలుసుకోవాలనుకుంటున్నాను.",
    en: "What is your name? May I know your name?",
    hi: "आपका नाम क्या है? कृपया अपना नाम बताएं।",
    ta: "உங்கள் பெயர் என்ன? தெரிந்து கொள்ளலாமா?",
    kn: "ನಿಮ್ಮ ಹೆಸರೇನು? ತಿಳಿಯಬಹುದೇ?",
    ml: "നിങ്ങളുടെ പേരെന്താണ്? എനിക്ക് അറിയാമോ?",
    category: "Greetings and introductions",
    transliteration: {
      te: "Mī pēru ēmiṭi? Nā pēru telusukōvālanukuṇṭunnānu.",
      hi: "Aapka naam kya hai? Kripya apna naam batayein.",
    },
    pronunciationGuidance: "Clear retroflex 'ṭi' in 'ēmiṭi'.",
  },

  // 2. EVERYDAY QUESTIONS & ANSWERS
  {
    patterns: [
      "ఎక్కడికి వెళ్తున్నారు",
      "ఎక్కడికి",
      "where are you going",
      "where to",
      "going where",
    ],
    te: "మీరు ఇప్పుడు ఎక్కడికి వెళ్తున్నారు? ఏదైనా పనా?",
    en: "Where are you going right now? Do you have some work?",
    hi: "आप अभी कहाँ जा रहे हैं? क्या कोई काम है?",
    ta: "நீங்கள் இப்போது எங்கு செல்கிறீர்கள்? ஏதாவது வேலையா?",
    kn: "ನೀವು ಈಗ ಎಲ್ಲಿಗೆ ಹೋಗುತ್ತಿದ್ದೀರಿ? ಏನಾದರೂ ಕೆಲಸವಿದೆಯೇ?",
    ml: "നിങ്ങൾ ഇപ്പോൾ എങ്ങോട്ടാണ് പോകുന്നത്? എന്തെങ്കിലും കാര്യമുണ്ടോ?",
    category: "Everyday questions and answers",
    transliteration: {
      te: "Mīru ippuḍu ekkaḍiki veḷtunnāru? Ēdainā panā?",
      hi: "Aap abhi kahan ja rahe hain? Kya koi kaam hai?",
    },
    pronunciationGuidance: "Double 'kk' in 'ekkaḍiki'. Retroflex 'ḷ' in 'veḷtunnāru'.",
  },
  {
    patterns: [
      "సహాయం కావాలి",
      "సహాయం చేయగలరా",
      "can you help",
      "help me",
      "need help",
    ],
    te: "దయచేసి నాకు కొంచెం సహాయం చేయగలరా? ఇది అత్యవసరం.",
    en: "Could you please help me? This is urgent.",
    hi: "क्या आप कृपया मेरी थोड़ी मदद कर सकते हैं? यह ज़रूरी है।",
    ta: "தயவுசெய்து எனக்கு கொஞ்சம் உதவ முடியுமா? இது அவசரம்.",
    kn: "ದಯವಿಟ್ಟು ನನಗೆ ಸ್ವಲ್ಪ ಸಹಾಯ ಮಾಡುವಿರಾ? ಇದು ತುರ್ತು.",
    ml: "ദയവായി എന്നെ അല്പം സഹായിക്കാമോ? ഇത് അത്യാവശ്യമാണ്.",
    category: "Everyday questions and answers",
    transliteration: {
      te: "Dayachēsi nāku koñcham sahāyaṁ chēyagalarā? Idi atyavasaraṁ.",
      hi: "Kya aap kripya meri thodi madad kar sakte hain?",
    },
    pronunciationGuidance: "Polite request inflection with upward intonation.",
  },

  // 3. COLLEGE & CLASSROOM
  {
    patterns: [
      "కాలేజ్",
      "క్లాస్",
      "లైబ్రరీ",
      "college",
      "classroom",
      "lecture",
      "professor",
      "assignment",
    ],
    te: "రేపటి క్లాస్ ఎన్ని గంటలకు ప్రారంభం అవుతుంది? టైమ్‌టేబుల్ మారిందా?",
    en: "What time does tomorrow's class start? Has the timetable changed?",
    hi: "कल की क्लास कितने बजे शुरू होगी? क्या समय सारिणी बदल गई है?",
    ta: "நாளைய வகுப்பு எத்தனை மணிக்குத் தொடங்குகிறது? நேர அட்டவணை மாறியுள்ளதா?",
    kn: "ನಾಳಿನ ತರಗತಿ ಎಷ್ಟು ಗಂಟೆಗೆ ಪ್ರಾರಂಭವಾಗುತ್ತದೆ? ವೇಳಾಪಟ್ಟಿ ಬದಲಾಗಿದೆಯೇ?",
    ml: "നാളത്തെ ക്ലാസ് എത്ര മണിക്കാണ് ആരംഭിക്കുന്നത്? ടൈംടേബിൾ മാറിയോ?",
    category: "College and classroom",
    transliteration: {
      te: "Rēpaṭi class enni gaṇṭalaku prārambhaṁ avutundi? Timetable mārindā?",
      hi: "Kal ki class kitne baje shuru hogi?",
    },
    pronunciationGuidance: "Clear English loan words ('class', 'timetable') naturally embedded.",
  },

  // 4. SHOPPING & MONEY
  {
    patterns: [
      "ధర ఎంత",
      "ఖరీదు ఎంత",
      "ఎంత",
      "how much",
      "price",
      "cost",
      "what is the price",
    ],
    te: "దీని ధర ఎంత? కొంచెం తగ్గించి ఇస్తే నేను తప్పకుండా తీసుకుంటాను.",
    en: "How much does this cost? If you discount it a bit, I will surely take it.",
    hi: "इसकी कीमत क्या है? थोड़ा कम करेंगे तो मैं ज़रूर ले लूँगा।",
    ta: "இதன் விலை என்ன? கொஞ்சம் குறைத்தால் நான் நிச்சயம் வாங்குகிறேன்.",
    kn: "ಇದರ ಬೆಲೆ ಎಷ್ಟು? ಸ್ವಲ್ಪ ಕಡಿಮೆ ಮಾಡಿದರೆ ನಾನು ಖಂಡಿತ ತೆಗೆದುಕೊಳ್ಳುತ್ತೇನೆ.",
    ml: "ഇതിന് എത്ര രൂപയാണ്? അല്പം കുറച്ചാൽ ഞാൻ തീർച്ചയായും വാങ്ങാം.",
    category: "Shopping and money",
    transliteration: {
      te: "Dīni dhara enta? Koñcham taggin̄chi istē nēnu tappakuṇḍā tīsukunṭānu.",
      hi: "Iski keemat kya hai? Thoda kam karenge toh main le loonga.",
    },
    pronunciationGuidance: "Gentle bargaining cadence common in regional markets.",
  },

  // 5. FOOD & RESTAURANTS
  {
    patterns: [
      "మంచి నీళ్ళు",
      "ఆహారం",
      "భోజనం",
      "water",
      "food",
      "drinking water",
      "meal",
      "hotel",
      "restaurant",
    ],
    te: "దయచేసి తాగడానికి మంచి నీళ్ళు మరియు తాజా భోజనం దొరుకుతుందా?",
    en: "Could I please get clean drinking water and a fresh meal?",
    hi: "कृपया क्या मुझे पीने का साफ़ पानी और ताज़ा खाना मिल सकता है?",
    ta: "தயவுசெய்து குடிப்பதற்கு நல்ல தண்ணீரும் புதிய உணவும் கிடைக்குமா?",
    kn: "ದಯವಿಟ್ಟು ಕುಡಿಯಲು ಒಳ್ಳೆಯ ನೀರು ಮತ್ತು ತಾಜಾ ಊಟ ಸಿಗುತ್ತದೆಯೇ?",
    ml: "ദയവായി കുടിക്കാൻ ശുദ്ധജലവും പുതിയ ഭക്ഷണവും ലഭിക്കുമോ?",
    category: "Food and restaurants",
    transliteration: {
      te: "Dayachēsi tāgaḍāniki manchi nīḷḷu mariyu tājā bhōjanaṁ dorukutundā?",
      hi: "Kripya peene ka saaf paani aur taaza khana mil sakta hai?",
    },
    pronunciationGuidance: "Retroflex 'ḷḷ' in 'nīḷḷu'. Aspirated 'bhō' in 'bhōjanaṁ'.",
  },

  // 6. TRAVEL & DIRECTIONS
  {
    patterns: [
      "దారి ఎక్కడ",
      "బస్సు",
      "స్టేషన్",
      "road",
      "way to",
      "bus stop",
      "directions",
      "how to reach",
    ],
    te: "ఇక్కడి నుంచి ప్రధాన బస్టాండ్‌కు వెళ్ళడానికి సరైన దారి ఏది?",
    en: "Which is the correct way to reach the main bus station from here?",
    hi: "यहाँ से मुख्य बस स्टैंड जाने का सही रास्ता कौन सा है?",
    ta: "இங்கிருந்து முக்கிய பேருந்து நிலையத்திற்குச் செல்லும் சரியான வழி எது?",
    kn: "ಇಲ್ಲಿಂದ ಮುಖ್ಯ ಬಸ್ ನಿಲ್ದಾಣಕ್ಕೆ ಹೋಗುವ ಸರಿಯಾದ ದಾರಿ ಯಾವುದು?",
    ml: "ഇവിടെ നിന്ന് പ്രധാന ബസ് സ്റ്റാൻഡിലേക്ക് പോകുന്ന ശരിയായ വഴി ഏതാണ്?",
    category: "Travel and directions",
    transliteration: {
      te: "Ikkaḍi ninchi pradhāna bus stand-ku veḷlaḍāniki saraina dāri ēdi?",
      hi: "Yahan se mukhya bus stand jaane ka sahi raasta kaun sa hai?",
    },
    pronunciationGuidance: "Elongated 'dāri' (path/road). Soft dental 'd'.",
  },

  // 7. FAMILY & FRIENDS
  {
    patterns: [
      "ఇంట్లో అందరూ",
      "కుటుంబం",
      "పిల్లలు",
      "family",
      "parents",
      "children",
      "how is family",
    ],
    te: "మీ ఇంట్లో అందరూ ఎలా ఉన్నారు? పిల్లల ఆరోగ్యం బాగుందా?",
    en: "How is everyone at home? Are the children in good health?",
    hi: "आपके घर में सब लोग कैसे हैं? क्या बच्चों की तबीयत ठीक है?",
    ta: "உங்கள் வீட்டில் அனைவரும் எப்படி இருக்கிறார்கள்? குழந்தைகளின் உடல்நலம் நன்றாக உள்ளதா?",
    kn: "ನಿಮ್ಮ ಮನೆಯಲ್ಲಿ ಎಲ್ಲರೂ ಹೇಗಿದ್ದಾರೆ? ಮಕ್ಕಳ ಆರೋಗ್ಯ ಚೆನ್ನಾಗಿದೆಯೇ?",
    ml: "നിങ്ങളുടെ വീട്ടിൽ എല്ലാവർക്കും സുഖമാണോ? കുട്ടികൾക്ക് സുഖമാണോ?",
    category: "Family and friends",
    transliteration: {
      te: "Mī iṇṭlō andarū elā unnāru? Pillala ārōgyaṁ bāgundā?",
      hi: "Aapke ghar mein sab log kaise hain? Bachon ki sehat theek hai?",
    },
    pronunciationGuidance: "Respectful inquiry about domestic well-being.",
  },

  // 8. HEALTHCARE & EMERGENCIES
  {
    patterns: [
      "జ్వరం",
      "డాక్టర్",
      "ఆసుపత్రి",
      "మందులు",
      "hospital",
      "doctor",
      "medicine",
      "clinic",
      "emergency",
      "fever",
    ],
    te: "నాకు ఒంట్లో బాగోలేదు, తీవ్రమైన జ్వరంగా ఉంది. దగ్గర్లో ఆసుపత్రి లేదా డాక్టర్ ఎక్కడ ఉన్నారు?",
    en: "I am feeling unwell with a high fever. Where is the nearest hospital or doctor?",
    hi: "मेरी तबीयत ठीक नहीं है, मुझे तेज़ बुखार है। पास में अस्पताल या डॉक्टर कहाँ हैं?",
    ta: "எனக்கு உடல்நிலை சரியில்லை, கடுமையான காய்ச்சலாக உள்ளது. அருகில் மருத்துவமனை எங்குள்ளது?",
    kn: "ನನ್ನ ಆರೋಗ್ಯ ಸರಿಯಿಲ್ಲ, ತೀವ್ರ ಜ್ವರವಿದೆ. ಹತ್ತಿರದಲ್ಲಿ ಆಸ್ಪತ್ರೆ ಅಥವಾ ವೈದ್ಯರು ಎಲ್ಲಿದ್ದಾರೆ?",
    ml: "എനിക്ക് സുഖമില്ല, കടുത്ത പനിയാണ്. അടുത്ത് എവിടെയാണ് ആശുപത്രിയോ ഡോക്ടറോ ഉള്ളത്?",
    category: "Healthcare and emergencies",
    transliteration: {
      te: "Nāku oṇṭlō bāgōlēdu, tīvramaina jvaraṅgā undi. Daggarlō āsupatri lēdā doctor ekkaḍa unnāru?",
      hi: "Meri tabiyat theek nahi hai, tez bukhar hai. Paas mein doctor kahan hain?",
    },
    pronunciationGuidance: "Urgent cadence. 'Āsupatri' is the widely used loan word for hospital.",
  },

  // 9. WORK & INTERVIEWS
  {
    patterns: [
      "ఉద్యోగం",
      "ఇంటర్వ్యూ",
      "పని",
      "job",
      "work",
      "interview",
      "office",
      "salary",
    ],
    te: "నేను ఈ ఉద్యోగ అవకాశానికి దరఖాస్తు చేసుకోవాలనుకుంటున్నాను. అర్హతలు ఏమిటి?",
    en: "I would like to apply for this job opportunity. What are the required qualifications?",
    hi: "मैं इस नौकरी के अवसर के लिए आवेदन करना चाहता हूँ। आवश्यक योग्यताएँ क्या हैं?",
    ta: "நான் இந்த வேலை வாய்ப்பிற்கு விண்ணப்பிக்க விரும்புகிறேன். தகுதிகள் என்ன?",
    kn: "ನಾನು ಈ ಉದ್ಯೋಗಾವಕಾಶಕ್ಕೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ಬಯಸುತ್ತೇನೆ. ಅರ್ಹತೆಗಳೇನು?",
    ml: "ഈ ജോലി അവസരത്തിലേക്ക് അപേക്ഷിക്കാൻ ഞാൻ ആഗ്രഹിക്കുന്നു. യോഗ്യതകൾ എന്തൊക്കെയാണ്?",
    category: "Work and interviews",
    transliteration: {
      te: "Nēnu ī udyōga avakāśāniki darakhāstu chēsukōvālanukuṇṭunnānu. Arhatalu ēmiṭi?",
      hi: "Main is naukri ke liye apply karna chahta hoon. Qualifications kya hain?",
    },
    pronunciationGuidance: "Formal professional tone: 'darakhāstu' (application).",
  },

  // 10. COMMON TELUGU-ENGLISH-HINDI CONVERSATIONS
  {
    patterns: [
      "చలో",
      "సరే",
      "ఓకే",
      "ఓకే థాంక్స్",
      "let's go",
      "all right",
      "okay thanks",
      "theek hai",
      "chalo",
    ],
    te: "సరే అండి, చాలా ధన్యవాదాలు! రేపు ఉదయం మళ్ళీ కలుద్దాం.",
    en: "All right, thank you very much! Let us meet again tomorrow morning.",
    hi: "ठीक है जी, बहुत-बहुत धन्यवाद! कल सुबह फिर मिलते हैं।",
    ta: "சரி, மிக்க நன்றி! நாளை காலை மீண்டும் சந்திப்போம்.",
    kn: "ಸರಿ, ತುಂಬಾ ಧನ್ಯವಾದಗಳು! ನಾಳೆ ಬೆಳಿಗ್ಗೆ ಮತ್ತೆ ಸಿಗೋಣ.",
    ml: "ശരി, വളരെ നന്ദി! നാളെ രാവിലെ വീണ്ടും കാണാം.",
    category: "Common Telugu-English-Hindi conversations",
    transliteration: {
      te: "Sarē aṇḍi, chālā dhanyavādālu! Rēpu udayaṁ maḷḷī kaluddāṁ.",
      hi: "Theek hai ji, bahut dhanyavaad! Kal subah milte hain.",
    },
    pronunciationGuidance: "Friendly sign-off combining 'Sarē aṇḍi' with formal 'dhanyavādālu'.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH & LOOKUP HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

export function findMatchingPhrase(
  query: string,
  sourceLang: string = "te"
): ConversationPhrase | undefined {
  if (!query || !query.trim()) return undefined;
  const clean = query.trim().toLowerCase();

  // 1. Direct pattern match
  const patternMatch = DAY_TO_DAY_PHRASES.find((p) =>
    p.patterns.some((pattern) => clean.includes(pattern.toLowerCase()) || pattern.toLowerCase().includes(clean))
  );
  if (patternMatch) return patternMatch;

  // 2. Text containment check across source languages
  return DAY_TO_DAY_PHRASES.find((p) => {
    const val = (p as any)[sourceLang];
    if (val && (val.toLowerCase().includes(clean) || clean.includes(val.toLowerCase()))) {
      return true;
    }
    return (
      p.te.toLowerCase().includes(clean) ||
      p.en.toLowerCase().includes(clean) ||
      p.hi.toLowerCase().includes(clean)
    );
  });
}

export function getPhrasesByCategory(category: string): ConversationPhrase[] {
  return DAY_TO_DAY_PHRASES.filter(
    (p) => p.category.toLowerCase() === category.toLowerCase()
  );
}

export function getDialoguesByCategory(category: string): ConversationDialogue[] {
  return STRUCTURED_DIALOGUES.filter(
    (d) => d.category.toLowerCase() === category.toLowerCase()
  );
}
