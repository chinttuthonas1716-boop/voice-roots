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
  // ─────────────────────────────────────────────────────────────────────────
  // 1. GREETINGS & INTRODUCTIONS (1-10)
  // ─────────────────────────────────────────────────────────────────────────
  {
    patterns: ["నమస్కారం", "బాగున్నారా", "ఎలా ఉన్నారు", "హలో", "hello", "hi", "how are you", "greetings", "namaste", "vanakkam", "namaskara", "seva johar"],
    te: "నమస్కారం! మీరు బాగున్నారా? ఎలా ఉన్నారు?",
    en: "Greetings! How are you doing? Are you well?",
    hi: "नमस्ते! आप कैसे हैं? क्या सब कुशल-मंगल है?",
    ta: "வணக்கம்! நீங்கள் எப்படி இருக்கிறீர்கள்? நலமா?",
    kn: "ನಮಸ್ಕಾರ! ನೀವು ಹೇಗಿದ್ದೀರಿ? ಕ್ಷೇಮವೇ?",
    ml: "നമസ്കാരം! സുഖമാണോ? എങ്ങനെയുണ്ട്?",
    gondi: "సేవా జోహార్! బాతూన్ ఆందీ?",
    koya: "నమస్కారం! మీరు బాగున్నారా?",
    lambadi: "రామ్ రామ్! కైకర్ ఆచో?",
    category: "Greetings and introductions",
    transliteration: {
      te: "Namaskāram! Mīru bāgunnārā? Elā unnāru?",
      hi: "Namaste! Aap kaise hain?",
    },
    pronunciationGuidance: "Polite initial greeting. Long 'ā' in 'bāgunnārā'.",
  },
  {
    patterns: ["మీ పేరు ఏమిటి", "మీ పేరేంటి", "నీ పేరేంటి", "what is your name", "your name", "whats your name", "naam kya hai"],
    te: "మీ పేరు ఏమిటి? తెలుసుకోవచ్చా?",
    en: "What is your name? May I know your name?",
    hi: "आपका नाम क्या है? कृपया अपना नाम बताएं।",
    ta: "உங்கள் பெயர் என்ன? தெரிந்து கொள்ளலாமா?",
    kn: "ನಿಮ್ಮ ಹೆಸರೇನು? ತಿಳಿಯಬಹುದೇ?",
    ml: "നിങ്ങളുടെ പേരെന്താണ്?",
    gondi: "మీ నావో బాతూ?",
    koya: "మీ పెదెర్ ఏంది?",
    lambadi: "తార్ నామ్ కై చ?",
    category: "Greetings and introductions",
    transliteration: {
      te: "Mī pēru ēmiṭi? Telusukovacchā?",
      hi: "Aapka naam kya hai?",
    },
    pronunciationGuidance: "Clear retroflex 'ṭi' in 'ēmiṭi'.",
  },
  {
    patterns: ["నా పేరు", "my name is", "mera naam"],
    te: "నా పేరు రాజేష్. మిమ్మల్ని కలవడం చాలా సంతోషంగా ఉంది.",
    en: "My name is Rajesh. Pleased to meet you.",
    hi: "मेरा नाम राजेश है। आपसे मिलकर खुशी हुई।",
    ta: "என் பெயர் ராஜேஷ். உங்களை சந்தித்ததில் மகிழ்ச்சி.",
    kn: "ನನ್ನ ಹೆಸರು ರಾಜೇಶ್. ನಿಮ್ಮನ್ನು ಭೇಟಿಯಾಗಿದ್ದಕ್ಕೆ ಸಂತೋಷ.",
    ml: "എന്റെ പേര് രാജേഷ്. നിങ്ങളെ കണ്ടതിൽ സന്തോഷം.",
    gondi: "నా నావో రాజేష్ ఆందూ.",
    koya: "నా పెదెర్ రాజేష్.",
    lambadi: "మార్ నామ్ రాజేష్ ఛ.",
    category: "Greetings and introductions",
    transliteration: {
      te: "Nā pēru Rājēsh. Mimmalni kalavaḍam chālā santōṣaṅgā undi.",
      hi: "Mera naam Rajesh hai.",
    },
    pronunciationGuidance: "Gentle emphasis on 'santōṣaṅgā'.",
  },
  {
    patterns: ["శుభోదయం", "గుడ్ మార్నింగ్", "good morning", "shubh prabhat"],
    te: "శుభోదయం! ఈ రోజు మీకు అంతా మంచి జరగాలి.",
    en: "Good morning! Wishing you a wonderful day ahead.",
    hi: "शुभ प्रभात! आपका आज का दिन मंगलमय हो।",
    ta: "காலை வணக்கம்! இந்நாள் உங்களுக்கு இனிய நாளாக அமையட்டும்.",
    kn: "ಶುಭೋದಯ! ಇಂದಿನ ದಿನ ನಿಮಗೆ ಶುಭವಾಗಲಿ.",
    ml: "സുപ്രഭാതം! ഈ ദിവസം നിങ്ങൾക്ക് ശുഭകരമാകട്ടെ.",
    gondi: "సేవా పొద్దూ! నిమ్మ కుశాల్ మంతీరా.",
    koya: "పొద్దున నమస్కారం!",
    lambadi: "సవేరో రామ్ రామ్!",
    category: "Greetings and introductions",
    transliteration: {
      te: "Śubhōdayaṁ! Ī rōju mīku antā manchi jaragāli.",
      hi: "Shubh prabhat!",
    },
    pronunciationGuidance: "Soft aspirated 'bha' in 'Śubhōdayaṁ'.",
  },
  {
    patterns: ["శుభసాయంత్రం", "good evening", "shubh sandhya"],
    te: "శుభసాయంత్రం! ఈ రోజు పనులన్నీ పూర్తయ్యాయా?",
    en: "Good evening! Did all your work go well today?",
    hi: "शुभ संध्या! क्या आज के सारे काम पूरे हो गए?",
    ta: "மாலை வணக்கம்! இன்றைய வேலைகள் அனைத்தும் முடிந்ததா?",
    kn: "ಶುಭ ಸಂಜೆ! ಇಂದಿನ ಕೆಲಸಗಳೆಲ್ಲ ಮುಗಿದವೇ?",
    ml: "ശുഭസായാഹ്നം! ഇന്നത്തെ ജോലികൾ എല്ലാം കഴിഞ്ഞോ?",
    category: "Greetings and introductions",
    transliteration: {
      te: "Śubhasāyantraṁ! Ī rōju panulannī pūrtayyāyā?",
      hi: "Shubh sandhya!",
    },
    pronunciationGuidance: "Elongated 'sāyantraṁ' (evening).",
  },
  {
    patterns: ["శుభరాత్రి", "గుడ్ నైట్", "good night", "shubh ratri"],
    te: "శుభరాత్రి! హాయిగా నిద్రపోండి.",
    en: "Good night! Sleep well and take rest.",
    hi: "शुभ रात्रि! आराम से सोइए।",
    ta: "இனிய இரவு! நன்றாக உறங்குங்கள்.",
    kn: "ಶುಭ ರಾತ್ರಿ! ಆರಾಮವಾಗಿ ಮಲಗಿ.",
    ml: "ശുഭരാത്രി! സുഖമായി ഉറങ്ങുക.",
    category: "Greetings and introductions",
    transliteration: {
      te: "Śubharātri! Hāyigā nidrapōṇḍi.",
      hi: "Shubh ratri!",
    },
    pronunciationGuidance: "Soft dental 'tri'.",
  },
  {
    patterns: ["స్వాగతం", "welcome", "you are welcome", "swagatam", "aapka swagat hai"],
    te: "స్వాగతం సుస్వాగతం! దయచేసి లోపలికి రండి.",
    en: "Welcome! Please step inside and make yourself at home.",
    hi: "स्वागत है! कृपया अंदर आइए।",
    ta: "நல்வரவு! தயவுசெய்து உள்ளே வாருங்கள்.",
    kn: "ಸ್ವಾಗತ! ದಯವಿಟ್ಟು ಒಳಗೆ ಬನ್ನಿ.",
    ml: "സ്വാഗതം! ദയവായി ഉള്ളിലേക്ക് വരൂ.",
    gondi: "వాత్ నూర్ జోహార్!",
    koya: "లోపలికి రండి!",
    lambadi: "ఆవో జీ ఆవో!",
    category: "Greetings and introductions",
    transliteration: {
      te: "Svāgataṁ susvāgataṁ! Dayachēsi lōpaliki raṇḍi.",
      hi: "Swagatam! Kripya andar aaiye.",
    },
    pronunciationGuidance: "Hospitable elongation on 'Svāgataṁ'.",
  },
  {
    patterns: ["మీది ఏ ఊరు", "ఎక్కడి వారు", "where are you from", "which place", "kahan se ho"],
    te: "మీది ఏ ఊరు? మీరు ఎక్కడి నుంచి వచ్చారు?",
    en: "Where are you from? Which town or village do you belong to?",
    hi: "आप कहाँ के रहने वाले हैं? आप कहाँ से आए हैं?",
    ta: "உங்கள் சொந்த ஊர் எது? எங்கிருந்து வருகிறீர்கள்?",
    kn: "ನಿಮ್ಮ ಊರು ಯಾವುದು? ಎಲ್ಲಿಂದ ಬಂದಿದ್ದೀರಿ?",
    ml: "നാട് എവിടെയാണ്? എവിടെ നിന്നാണ് വരുന്നത്?",
    gondi: "మీ నారో బేగే? బేగెతాల్ వాత్తీర్?",
    koya: "మీ నాడ్ ఏంది? బెగె నించి వచ్చితీ?",
    lambadi: "తార్ గావ్ కై చ? కతర్ ఆయో చ?",
    category: "Greetings and introductions",
    transliteration: {
      te: "Mīdi ē ūru? Mīru ekkaḍi ninchi vachchāru?",
      hi: "Aap kahan ke rehne wale hain?",
    },
    pronunciationGuidance: "Long vowel 'ū' in 'ūru'.",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2. EVERYDAY QUESTIONS & ANSWERS (11-18)
  // ─────────────────────────────────────────────────────────────────────────
  {
    patterns: ["ఎక్కడికి వెళ్తున్నారు", "ఎక్కడికి", "where are you going", "where to", "going where", "kahan ja rahe ho"],
    te: "మీరు ఇప్పుడు ఎక్కడికి వెళ్తున్నారు? ఏదైనా పనా?",
    en: "Where are you going right now? Do you have some work?",
    hi: "आप अभी कहाँ जा रहे हैं? क्या कोई काम है?",
    ta: "நீங்கள் இப்போது எங்கு செல்கிறீர்கள்? ஏதாவது வேலையா?",
    kn: "ನೀವು ಈಗ ಎಲ್ಲಿಗೆ ಹೋಗುತ್ತಿದ್ದೀರಿ? ಏನಾದರೂ ಕೆಲಸವಿದೆಯೇ?",
    ml: "നിങ്ങൾ ഇപ്പോൾ എങ്ങോട്ടാണ് പോകുന്നത്? എന്തെങ്കിലും കാര്യമുണ്ടോ?",
    gondi: "బేగె హందాతీర్ నిమ్మ?",
    koya: "బెగె తగ దేకీతి?",
    lambadi: "కై జా రో చ?",
    category: "Everyday questions and answers",
    transliteration: {
      te: "Mīru ippuḍu ekkaḍiki veḷtunnāru? Ēdainā panā?",
      hi: "Aap abhi kahan ja rahe hain?",
    },
    pronunciationGuidance: "Double 'kk' in 'ekkaḍiki'. Retroflex 'ḷ' in 'veḷtunnāru'.",
  },
  {
    patterns: ["సహాయం కావాలి", "సహాయం చేయగలరా", "can you help", "help me", "need help", "madad chahiye", "madad kar sakte ho"],
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
  {
    patterns: ["ఏమైంది", "ఏం జరిగింది", "what happened", "kya hua", "whats wrong"],
    te: "ఏమైంది? అంతా క్షేమమేనా?",
    en: "What happened? Is everything all right?",
    hi: "क्या हुआ? सब ठीक तो है ना?",
    ta: "என்ன நடந்தது? எல்லாம் நலமா?",
    kn: "ಏನಾಯಿತು? ಎಲ್ಲವೂ ಸರಿಯಾಗಿದೆಯೇ?",
    ml: "എന്താണ് സംഭവിച്ചത്? എല്ലാം ശരിയല്ലേ?",
    gondi: "బాతూ జరిగిస్?",
    koya: "ఏంది ఆయితి?",
    lambadi: "కై వేగో?",
    category: "Everyday questions and answers",
    transliteration: {
      te: "Ēmaindi? Antā kṣēmamēnā?",
      hi: "Kya hua? Sab theek hai na?",
    },
    pronunciationGuidance: "Curious, empathetic rising inflection.",
  },
  {
    patterns: ["ఇది ఏమిటి", "ఇదేంటి", "what is this", "yeh kya hai", "whats this"],
    te: "ఇది ఏమిటి? దీనిని ఎలా ఉపయోగిస్తారు?",
    en: "What is this? How is it used?",
    hi: "यह क्या है? इसका उपयोग कैसे किया जाता है?",
    ta: "இது என்ன? இதை எப்படி பயன்படுத்துவது?",
    kn: "ಇದು ಏನು? ಇದನ್ನು ಹೇಗೆ ಬಳಸುತ್ತಾರೆ?",
    ml: "ഇത് എന്താണ്? ഇതെങ്ങനെയാണ് ഉപയോഗിക്കുന്നത്?",
    gondi: "ఇద్ బాతూ ఆందూ?",
    koya: "ఇది ఏంది?",
    lambadi: "ఈ కై చ?",
    category: "Everyday questions and answers",
    transliteration: {
      te: "Idi ēmiṭi? Dīnini elā upayōgistāru?",
      hi: "Yeh kya hai?",
    },
    pronunciationGuidance: "Short front vowel 'i' in 'idi'.",
  },
  {
    patterns: ["ఎప్పుడు వస్తారు", "ఎప్పుడు", "when will you come", "kab aaoge", "when coming"],
    te: "మీరు ఎప్పుడు వస్తారు? సమయం చెప్పగలరా?",
    en: "When will you come? Could you tell the time?",
    hi: "आप कब आएँगे? क्या समय बता सकते हैं?",
    ta: "நீங்கள் எப்போது வருவீர்கள்? நேரம் சொல்ல முடியுமா?",
    kn: "ನೀವು ಯಾವಾಗ ಬರುತ್ತೀರಿ? ಸಮಯ ತಿಳಿಸಬಹುದೇ?",
    ml: "നിങ്ങൾ എപ്പോഴാണ് വരുന്നത്?",
    category: "Everyday questions and answers",
    transliteration: {
      te: "Mīru eppuḍu vastāru? Samayaṁ cheppagalarā?",
      hi: "Aap kab aayenge?",
    },
    pronunciationGuidance: "Double 'pp' in 'eppuḍu'.",
  },
  {
    patterns: ["నాకు అర్థమైంది", "అర్థమైంది", "i understand", "i got it", "samajh gaya"],
    te: "అవును, నాకు పూర్తిగా అర్థమైంది.",
    en: "Yes, I understand completely.",
    hi: "हाँ, मुझे पूरी तरह समझ आ गया।",
    ta: "ஆம், எனக்கு நன்றாக புரிந்தது.",
    kn: "ಹೌದು, ನನಗೆ ಸಂಪೂರ್ಣವಾಗಿ ಅರ್ಥವಾಯಿತು.",
    ml: "അതെ, എനിക്ക് പൂർണ്ണമായി മനസ്സിലായി.",
    category: "Everyday questions and answers",
    transliteration: {
      te: "Avunu, nāku pūrtigā arthamaindi.",
      hi: "Haan, mujhe samajh aa gaya.",
    },
    pronunciationGuidance: "Crisp dental 'tha' in 'arthamaindi'.",
  },
  {
    patterns: ["నాకు అర్థం కాలేదు", "అర్థం కాలేదు", "i do not understand", "i dont understand", "samajh nahi aaya"],
    te: "క్షమించండి, నాకు అర్థం కాలేదు. మళ్ళీ చెప్పగలరా?",
    en: "I am sorry, I do not understand. Could you repeat please?",
    hi: "माफ़ कीजिए, मुझे समझ नहीं आया। क्या फिर से कह सकते हैं?",
    ta: "மன்னிக்கவும், எனக்கு புரியவில்லை. மீண்டும் சொல்ல முடியுமா?",
    kn: "ಕ್ಷಮಿಸಿ, ನನಗೆ ಅರ್ಥವಾಗಲಿಲ್ಲ. ಪುನಃ ಹೇಳುವಿರಾ?",
    ml: "ക്ഷമിക്കണം, എനിക്ക് മനസ്സിലായില്ല. വീണ്ടും പറയാമോ?",
    category: "Everyday questions and answers",
    transliteration: {
      te: "Kṣaminchaṇḍi, nāku arthaṁ kālēdu. Maḷḷī cheppagalarā?",
      hi: "Maaf kijiye, samajh nahi aaya.",
    },
    pronunciationGuidance: "Polite apology prefix 'Kṣaminchaṇḍi'.",
  },
  {
    patterns: ["నెమ్మదిగా మాట్లాడండి", "speak slowly", "dheere bolo", "slowly please"],
    te: "దయచేసి కొంచెం నెమ్మదిగా మాట్లాడగలరా?",
    en: "Could you please speak a little more slowly?",
    hi: "कृपया थोड़ा धीरे बोलेंगे?",
    ta: "தயவுசெய்து கொஞ்சம் மெதுவாக பேசுங்கள்.",
    kn: "ದಯವಿಟ್ಟು ಸ್ವಲ್ಪ ನಿಧಾನವಾಗಿ ಮಾತನಾಡಿ.",
    ml: "ദയവായി കുറച്ചു പതുക്കെ സംസാരിക്കാമോ?",
    category: "Everyday questions and answers",
    transliteration: {
      te: "Dayachēsi koñcham nemmadigā māṭlāḍagalarā?",
      hi: "Kripya thoda dheere boliye.",
    },
    pronunciationGuidance: "Gentle 'nemmadigā' (slowly/calmly).",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3. COLLEGE & CLASSROOM (19-24)
  // ─────────────────────────────────────────────────────────────────────────
  {
    patterns: ["కాలేజ్", "క్లాస్", "లైబ్రరీ", "college", "classroom", "lecture", "professor", "assignment"],
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
  {
    patterns: ["లైబ్రరీ ఎక్కడ ఉంది", "పుస్తకాలు", "library", "where is library", "books"],
    te: "కళాశాల లైబ్రరీ ఎక్కడ ఉంది? పుస్తకాలు ఎలా తీసుకోవాలి?",
    en: "Where is the college library? How can I borrow books?",
    hi: "कॉलेज की लाइब्रेरी कहाँ है? किताबें कैसे ली जा सकती हैं?",
    ta: "கல்லூரி நூலகம் எங்குள்ளது? புத்தகங்களை எப்படி எடுப்பது?",
    kn: "ಕಾಲೇಜು ಗ್ರಂಥಾಲಯ ಎಲ್ಲಿದೆ? ಪುಸ್ತಕಗಳನ್ನು ಹೇಗೆ ಪಡೆಯುವುದು?",
    ml: "കോളേജ് ലൈബ്രറി എവിടെയാണ്? പുസ്തകങ്ങൾ എങ്ങനെ എടുക്കാം?",
    category: "College and classroom",
    transliteration: {
      te: "Kaḷāśāla library ekkaḍa undi? Pustakālu elā tīsukōvāli?",
      hi: "Library kahan hai?",
    },
    pronunciationGuidance: "Formal compound 'Kaḷāśāla' for college.",
  },
  {
    patterns: ["పరీక్షలు ఎప్పుడు", "ఎగ్జామ్స్", "exams", "examination", "pariksha kab hai"],
    te: "సెమిస్టర్ పరీక్షలు ఎప్పుడు ప్రారంభమవుతాయి?",
    en: "When do the semester examinations commence?",
    hi: "सेमेस्टर की परीक्षाएं कब से शुरू हो रही हैं?",
    ta: "செமஸ்டர் தேர்வுகள் எப்போது தொடங்குகின்றன?",
    kn: "ಸೆಮಿಸ್ಟರ್ ಪರೀಕ್ಷೆಗಳು ಯಾವಾಗ ಆರಂಭವಾಗುತ್ತವೆ?",
    ml: "സെമസ്റ്റർ പരീക്ഷകൾ എപ്പോഴാണ് തുടങ്ങുന്നത്?",
    category: "College and classroom",
    transliteration: {
      te: "Semester parīkṣalu eppuḍu prārambhamavutāyi?",
      hi: "Pariksha kab shuru hogi?",
    },
    pronunciationGuidance: "Aspirated 'kṣa' in 'parīkṣalu'.",
  },
  {
    patterns: ["నోట్స్ ఇస్తారా", "నోట్స్ కావాలి", "notes please", "can i get notes"],
    te: "నిన్నటి లెక్చర్ నోట్స్ నాకిస్తారా? నేను రాలేకపోయాను.",
    en: "Could you share yesterday's lecture notes? I could not attend.",
    hi: "क्या कल के लेक्चर के नोट्स मिल सकते हैं? मैं नहीं आ सका था।",
    ta: "நேற்றைய விரிவுரை குறிப்புகளைத் தருவீர்களா? என்னால் வர முடியவில்லை.",
    kn: "ನಿನ್ನೆಯ ಲೆಕ್ಚರ್ ನೋಟ್ಸ್ ಕೊಡುವಿರಾ? ನನಗೆ ಬರಲಾಗಲಿಲ್ಲ.",
    ml: "ഇന്നലത്തെ ലെക്ചർ നോട്ട്സ് തരാമോ?",
    category: "College and classroom",
    transliteration: {
      te: "Ninnaṭi lecture notes nākistārā? Nēnu rālēkapōyānu.",
      hi: "Notes de sakte ho?",
    },
    pronunciationGuidance: "Polite student peer exchange.",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4. SHOPPING & MONEY (25-30)
  // ─────────────────────────────────────────────────────────────────────────
  {
    patterns: ["ధర ఎంత", "ఖరీదు ఎంత", "ఎంత", "how much", "price", "cost", "what is the price", "kitne ka hai", "daam kitna hai"],
    te: "దీని ధర ఎంత? కొంచెం తగ్గించి ఇస్తే నేను తప్పకుండా తీసుకుంటాను.",
    en: "How much does this cost? If you discount it a bit, I will surely take it.",
    hi: "इसकी कीमत क्या है? थोड़ा कम करेंगे तो मैं ज़रूर ले लूँगा।",
    ta: "இதன் விலை என்ன? கொஞ்சம் குறைத்தால் நான் நிச்சயம் வாங்குகிறேன்.",
    kn: "ಇದರ ಬೆಲೆ ಎಷ್ಟು? ಸ್ವಲ್ಪ ಕಡಿಮೆ ಮಾಡಿದರೆ ನಾನು ಖಂಡಿತ ತೆಗೆದುಕೊಳ್ಳುತ್ತೇನೆ.",
    ml: "ഇതിന് എത്ര രൂപയാണ്? അല്പം കുറച്ചാൽ ഞാൻ തീർച്ചയായും വാങ്ങാം.",
    gondi: "దీన మూల్ బాతూ?",
    koya: "దీని వెల ఏంది?",
    lambadi: "ఏర్ దామ్ కై చ?",
    category: "Shopping and money",
    transliteration: {
      te: "Dīni dhara enta? Koñcham taggin̄chi istē nēnu tappakuṇḍā tīsukunṭānu.",
      hi: "Iski keemat kya hai?",
    },
    pronunciationGuidance: "Gentle bargaining cadence common in regional markets.",
  },
  {
    patterns: ["యూపీఐ", "ఫోన్‌పే", "గూగుల్‌పే", "upi", "phonepe", "gpay", "online payment", "scan"],
    te: "ఇక్కడ యూపీఐ లేదా గూగుల్‌పే స్కాన్ పనిచేస్తుందా? నగదు లేదు.",
    en: "Does UPI or Google Pay scan work here? I do not have cash.",
    hi: "क्या यहाँ यूपीआई या गूगल पे स्कैन चलेगा? मेरे पास नकद नहीं है।",
    ta: "இங்கு கூகுள் பே அல்லது யுபிஐ ஸ்கேன் வேலை செய்யுமா? ரொக்கம் இல்லை.",
    kn: "ಇಲ್ಲಿ ಯುಪಿಐ ಅಥವಾ ಗೂಗಲ್ ಪೇ ಸ್ಕ್ಯಾನ್ ಆಗುತ್ತದೆಯೇ? ನಗದು ಇಲ್ಲ.",
    ml: "ഇവിടെ ഗൂഗിൾ പേ സ്കാൻ സ്വീകരിക്കുമോ? കയ്യിൽ പണമില്ല.",
    category: "Shopping and money",
    transliteration: {
      te: "Ikkaḍa UPI lēdā Google Pay scan panichēstundā? Nagadu lēdu.",
      hi: "Kya UPI chalega? Cash nahi hai.",
    },
    pronunciationGuidance: "Universal modern retail inquiry.",
  },
  {
    patterns: ["చిల్లర ఉందా", "చిల్లర", "change", "do you have change", "chutta hai kya"],
    te: "ఐదు వందల నోటుకు చిల్లర ఉందా?",
    en: "Do you have change for a five hundred rupee note?",
    hi: "क्या पांच सौ के नोट का छुट्टा मिलेगा?",
    ta: "ஐந்நூறு ரூபாய்க்கு சில்லறை உள்ளதா?",
    kn: "ಐನೂರು ರೂಪಾಯಿಗೆ ಚಿಲ್ಲರೆ ಇದೆಯೇ?",
    ml: "അഞ്ഞൂറ് രൂപയ്ക്ക് ചില്ലറയുണ്ടോ?",
    category: "Shopping and money",
    transliteration: {
      te: "Aidu vandala nōṭuku chillara undā?",
      hi: "Paanch sau ka chutta hai kya?",
    },
    pronunciationGuidance: "Retroflex 'll' in 'chillara' (small loose change).",
  },
  {
    patterns: ["బిల్లు ఇవ్వండి", "రశీదు", "bill please", "receipt", "bill do"],
    te: "దయచేసి కొనుగోలు రశీదు లేదా బిల్లు ఇవ్వండి.",
    en: "Please provide the purchase receipt or bill.",
    hi: "कृपया खरीद की रसीद या बिल दे दीजिए।",
    ta: "தயவுசெய்து ரசீது கொடுங்கள்.",
    kn: "ದಯವಿಟ್ಟು ರಶೀದಿ ಅಥವಾ ಬಿಲ್ ಕೊಡಿ.",
    ml: "ദയവായി ബില്ലോ രസീതോ തരൂ.",
    category: "Shopping and money",
    transliteration: {
      te: "Dayachēsi konugōlu raśīdu lēdā bill ivvaṇḍi.",
      hi: "Bill de dijiye.",
    },
    pronunciationGuidance: "Firm polite tone.",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 5. FOOD & RESTAURANTS (31-37)
  // ─────────────────────────────────────────────────────────────────────────
  {
    patterns: ["మంచి నీళ్ళు", "నీరు", "water", "drinking water", "peene ka paani", "paani"],
    te: "దయచేసి తాగడానికి మంచి నీళ్ళు ఇవ్వండి.",
    en: "Please give me clean drinking water.",
    hi: "कृपया पीने के लिए साफ़ पानी दीजिए।",
    ta: "தயவுசெய்து குடிப்பதற்கு தண்ணீர் கொடுங்கள்.",
    kn: "ದಯವಿಟ್ಟು ಕುಡಿಯಲು ನೀರು ಕೊಡಿ.",
    ml: "ദയവായി കുടിക്കാൻ വെള്ളം തരൂ.",
    gondi: "ఏర్ తావాలె తస్సీమ్.",
    koya: "ఏర్ ఈమండి.",
    lambadi: "పాణి దే జీ.",
    category: "Food and restaurants",
    transliteration: {
      te: "Dayachēsi tāgaḍāniki manchi nīḷḷu ivvaṇḍi.",
      hi: "Paani dijiye.",
    },
    pronunciationGuidance: "Retroflex 'ḷḷ' in 'nīḷḷu'.",
  },
  {
    patterns: ["టీ", "కాఫీ", "tea", "coffee", "chai", "filter coffee"],
    te: "దయచేసి రెండు కప్పుల వేడి టీ మరియు ఫిల్టర్ కాఫీ ఇవ్వండి.",
    en: "Please bring two cups of hot tea and a filter coffee.",
    hi: "कृपया दो कप गर्म चाय और एक फ़िल्टर कॉफ़ी ले आइए।",
    ta: "தயவுசெய்து இரண்டு சூடான டீ மற்றும் ஃபில்டர் காபி கொடுங்கள்.",
    kn: "ದಯವಿಟ್ಟು ಎರಡು ಬಿಸಿ ಚಹಾ ಮತ್ತು ಫಿಲ್ಟರ್ ಕಾಫಿ ಕೊಡಿ.",
    ml: "ദയവായി രണ്ട് കപ്പ് ചായയും ഫിൽട്ടർ കോഫിയും തരൂ.",
    category: "Food and restaurants",
    transliteration: {
      te: "Dayachēsi reṇḍu kappula vēḍi tea mariyu filter coffee ivvaṇḍi.",
      hi: "Do cup garam chai dijiye.",
    },
    pronunciationGuidance: "Double 'dd' in 'reṇḍu'.",
  },
  {
    patterns: ["ఆకలిగా ఉంది", "ఆకలి", "hungry", "i am hungry", "bhookh lagi hai"],
    te: "నాకు చాలా ఆకలిగా ఉంది. భోజనం సిద్ధంగా ఉందా?",
    en: "I am very hungry. Is the food ready?",
    hi: "मुझे बहुत भूख लगी है। क्या खाना तैयार है?",
    ta: "எனக்கு மிகவும் பசிக்கிறது. உணவு தயாராக உள்ளதா?",
    kn: "ನನಗೆ ತುಂಬಾ ಹಸಿವಾಗಿದೆ. ಊಟ ಸಿದ್ಧವಿದೆಯೇ?",
    ml: "എനിക്ക് വളരെ വിശക്കുന്നു. ഭക്ഷണം തയ്യാറായോ?",
    gondi: "నాకూ కరు కీసి ఆందూ.",
    koya: "నాకు ఆకలిగా ఉంది.",
    lambadi: "మనే భూఖ్ లాగి చ.",
    category: "Food and restaurants",
    transliteration: {
      te: "Nāku chālā ākaligā undi. Bhōjanaṁ siddhaṅgā undā?",
      hi: "Mujhe bhookh lagi hai.",
    },
    pronunciationGuidance: "Elongated 'ā' in 'ākaligā'.",
  },
  {
    patterns: ["కారం తక్కువ", "less spicy", "not spicy", "mirch kam"],
    te: "కారం కొంచెం తక్కువగా ఉండాలి, దయచేసి గమనించండి.",
    en: "Please keep the spice level mild, kindly note.",
    hi: "मिर्च थोड़ी कम रखिएगा, कृपया ध्यान दें।",
    ta: "காரம் குறைவாக இருக்கட்டும், கவனியுங்கள்.",
    kn: "ಖಾರ ಸ್ವಲ್ಪ ಕಡಿಮೆಯಿರಲಿ.",
    ml: "എരിവ് കുറവായിരിക്കണം.",
    category: "Food and restaurants",
    transliteration: {
      te: "Kāram koñcham takkuvagā uṇḍāli, dayachēsi gamanin̄chaṇḍi.",
      hi: "Mirch kam rakhiye.",
    },
    pronunciationGuidance: "Soft nasal in 'koñcham'.",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 6. TRAVEL & DIRECTIONS (38-44)
  // ─────────────────────────────────────────────────────────────────────────
  {
    patterns: ["దారి ఎక్కడ", "బస్సు", "స్టేషన్", "road", "way to", "bus stop", "directions", "how to reach", "raasta kahan hai", "bus stand"],
    te: "ఇక్కడి నుంచి ప్రధాన బస్టాండ్‌కు వెళ్ళడానికి సరైన దారి ఏది?",
    en: "Which is the correct way to reach the main bus station from here?",
    hi: "यहाँ से मुख्य बस स्टैंड जाने का सही रास्ता कौन सा है?",
    ta: "இங்கிருந்து முக்கிய பேருந்து நிலையத்திற்குச் செல்லும் சரியான வழி எது?",
    kn: "ಇಲ್ಲಿಂದ ಮುಖ್ಯ ಬಸ್ ನಿಲ್ದಾಣಕ್ಕೆ ಹೋಗುವ ಸರಿಯಾದ ದಾರಿ ಯಾವುದು?",
    ml: "ഇവിടെ നിന്ന് പ്രധാന ബസ് സ്റ്റാൻഡിലേക്ക് പോകുന്ന ശരിയായ വഴി ഏതാണ്?",
    gondi: "బస్ స్టేషన్ బేగె మంతా?",
    koya: "బస్ స్టేషన్ బెగె ఉంది?",
    lambadi: "బస్ అడ్డా కతర్ చ?",
    category: "Travel and directions",
    transliteration: {
      te: "Ikkaḍi ninchi pradhāna bus stand-ku veḷlaḍāniki saraina dāri ēdi?",
      hi: "Bus stand ka raasta kaun sa hai?",
    },
    pronunciationGuidance: "Elongated 'dāri' (path/road). Soft dental 'd'.",
  },
  {
    patterns: ["రైల్వే స్టేషన్", "railway station", "train", "station"],
    te: "రైల్వే స్టేషన్ ఎంత దూరంలో ఉంది? ఆటో దొరుకుతుందా?",
    en: "How far is the railway station? Can I get an auto-rickshaw?",
    hi: "रेलवे स्टेशन कितनी दूर है? क्या ऑटो मिल जाएगा?",
    ta: "ரயில் நிலையம் எவ்வளவு தூரத்தில் உள்ளது? ஆட்டோ கிடைக்குமா?",
    kn: "ರೈಲ್ವೆ ಸ್ಟೇಷನ್ ಎಷ್ಟು ದೂರದಲ್ಲಿದೆ? ಆಟೋ ಸಿಗುತ್ತದೆಯೇ?",
    ml: "റെയിൽവേ സ്റ്റേഷൻ എത്ര ദൂരെയാണ്?",
    category: "Travel and directions",
    transliteration: {
      te: "Railway station enta dūramlō undi? Auto dorukutundā?",
      hi: "Railway station kitni door hai?",
    },
    pronunciationGuidance: "Clear conversational phrasing.",
  },
  {
    patterns: ["కుడివైపు", "ఎడమవైపు", "turn right", "turn left", "right turn", "left turn", "right", "left"],
    te: "సిగ్నల్ దాటిన తర్వాత కుడివైపు తిరగండి, ఎదురుగా ఉంటుంది.",
    en: "Turn right after crossing the traffic signal, it is right ahead.",
    hi: "ट्रैफिक सिग्नल पार करने के बाद दाहिनी तरफ मुड़ें, सामने ही है।",
    ta: "சிக்னலைத் தாண்டியதும் வலதுபுறம் திரும்புங்கள், எதிரே இருக்கும்.",
    kn: "ಸಿಗ್ನಲ್ ದಾಟಿದ ನಂತರ ಬಲಕ್ಕೆ ತಿರುಗಿ, ಎದುರೇ ಇರುತ್ತದೆ.",
    ml: "സിഗ്നൽ കഴിഞ്ഞ ശേഷം വലത്തോട്ട് തിരിയുക.",
    category: "Travel and directions",
    transliteration: {
      te: "Signal dāṭina tarvāta kuḍivaipu tiragaṇḍi, edurugā uṇṭundi.",
      hi: "Right turn le lijiye.",
    },
    pronunciationGuidance: "'kuḍi' is right, 'eḍama' is left.",
  },
  {
    patterns: ["నేరుగా వెళ్ళండి", "go straight", "straight", "seedhe jao"],
    te: "ముందుకు నేరుగా వెళ్ళండి, ఎక్కడా తిరగకండి.",
    en: "Go straight ahead, do not take any turns.",
    hi: "सीधे आगे जाइए, कहीं मुड़ना नहीं है।",
    ta: "நேராகச் செல்லுங்கள், எங்கும் திரும்ப வேண்டாம்.",
    kn: "ನೇರವಾಗಿ ಮುಂದೆ ಹೋಗಿ, ಎಲ್ಲಿಯೂ ತಿರುಗಬೇಡಿ.",
    ml: "നേരെ മുന്നോട്ട് പോകൂ.",
    category: "Travel and directions",
    transliteration: {
      te: "Munduku nērugā veḷlaṇḍi, ekkaḍā tiragakaṇḍi.",
      hi: "Seedhe aage badhiye.",
    },
    pronunciationGuidance: "Elongated 'nērugā' (directly/straight).",
  },
  {
    patterns: ["ఇక్కడ ఆపండి", "ఆపండి", "stop here", "stop", "roko"],
    te: "దయచేసి ఇక్కడే ఆపండి, నేను దిగిపోతాను.",
    en: "Please stop right here, I will get down.",
    hi: "कृपया यहीं रोक दीजिए, मैं उतर जाऊँगा।",
    ta: "தயவுசெய்து இங்கேயே நிறுத்துங்கள், நான் இறங்கிக் கொள்கிறேன்.",
    kn: "ದಯವಿಟ್ಟು ಇಲ್ಲಿಯೇ ನಿಲ್ಲಿಸಿ, ನಾನು ಇಳಿಯುತ್ತೇನೆ.",
    ml: "ദയവായി ഇവിടെ നിർത്തൂ.",
    category: "Travel and directions",
    transliteration: {
      te: "Dayachēsi ikkaḍē āpaṇḍi, nēnu digipōtānu.",
      hi: "Yahin rok dijiye.",
    },
    pronunciationGuidance: "Clear imperative 'āpaṇḍi'.",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 7. FAMILY & FRIENDS (45-50)
  // ─────────────────────────────────────────────────────────────────────────
  {
    patterns: ["ఇంట్లో అందరూ", "కుటుంబం", "పిల్లలు", "family", "parents", "children", "how is family", "ghar mein sab kaise hain"],
    te: "మీ ఇంట్లో అందరూ ఎలా ఉన్నారు? పిల్లల ఆరోగ్యం బాగుందా?",
    en: "How is everyone at home? Are the children in good health?",
    hi: "आपके घर में सब लोग कैसे हैं? क्या बच्चों की तबीयत ठीक है?",
    ta: "உங்கள் வீட்டில் அனைவரும் எப்படி இருக்கிறார்கள்? குழந்தைகளின் உடல்நலம் நன்றாக உள்ளதா?",
    kn: "ನಿಮ್ಮ ಮನೆಯಲ್ಲಿ ಎಲ್ಲರೂ ಹೇಗಿದ್ದಾರೆ? ಮಕ್ಕಳ ಆರೋಗ್ಯ ಚೆನ್ನಾಗಿದೆಯೇ?",
    ml: "നിങ്ങളുടെ വീട്ടിൽ എല്ലാവർക്കും സുഖമാണോ? കുട്ടികൾക്ക് സുഖമാണോ?",
    category: "Family and friends",
    transliteration: {
      te: "Mī iṇṭlō andarū elā unnāru? Pillala ārōgyaṁ bāgundā?",
      hi: "Aapke ghar mein sab log kaise hain?",
    },
    pronunciationGuidance: "Respectful inquiry about domestic well-being.",
  },
  {
    patterns: ["మా ఇంటికి రండి", "ఇంటికి రండి", "come home", "visit us", "ghar aao"],
    te: "ఈ ఆదివారం తప్పకుండా మా ఇంటికి భోజనానికి రండి.",
    en: "Please do come over to our house for lunch this Sunday.",
    hi: "इस रविवार को ज़रूर हमारे घर खाने पर आइएगा।",
    ta: "இந்த ஞாயிற்றுக்கிழமை நிச்சயம் எங்கள் வீட்டிற்கு உணவருந்த வாருங்கள்.",
    kn: "ಈ ಭಾನುವಾರ ಖಂಡಿತ ನಮ್ಮ ಮನೆಗೆ ಊಟಕ್ಕೆ ಬನ್ನಿ.",
    ml: "ഈ ഞായറാഴ്ച തീർച്ചയായും ഞങ്ങളുടെ വീട്ടിലേക്ക് വരൂ.",
    category: "Family and friends",
    transliteration: {
      te: "Ī ādivāraṁ tappakuṇḍā mā iṇṭiki bhōjanāniki raṇḍi.",
      hi: "Ghar zaroor aana.",
    },
    pronunciationGuidance: "Warm hospitable invitation tone.",
  },
  {
    patterns: ["జాగ్రత్త", "జాగ్రత్తగా ఉండండి", "take care", "dhyan rakhna"],
    te: "మీ ఆరోగ్యం జాగ్రత్త! మళ్ళీ కలుద్దాం.",
    en: "Take care of your health! Let us meet again soon.",
    hi: "अपनी सेहत का ध्यान रखिएगा! फिर मिलेंगे।",
    ta: "உடம்பை பார்த்துக் கொள்ளுங்கள்! மீண்டும் சந்திப்போம்.",
    kn: "ಆರೋಗ್ಯ ನೋಡಿಕೊಳ್ಳಿ! ಮತ್ತೆ ಸಿಗೋಣ.",
    ml: "ശ്രദ്ധിക്കണേ! വീണ്ടും കാണാം.",
    category: "Family and friends",
    transliteration: {
      te: "Mī ārōgyaṁ jāgratta! Maḷḷī kaluddāṁ.",
      hi: "Apna dhyan rakhna.",
    },
    pronunciationGuidance: "Double 'tt' in 'jāgratta'.",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 8. HEALTHCARE & EMERGENCIES (51-56)
  // ─────────────────────────────────────────────────────────────────────────
  {
    patterns: ["జ్వరం", "డాక్టర్", "ఆసుపత్రి", "మందులు", "hospital", "doctor", "medicine", "clinic", "emergency", "fever", "bukhar", "tabiyat kharab"],
    te: "నాకు ఒంట్లో బాగోలేదు, తీవ్రమైన జ్వరంగా ఉంది. దగ్గర్లో ఆసుపత్రి లేదా డాక్టర్ ఎక్కడ ఉన్నారు?",
    en: "I am feeling unwell with a high fever. Where is the nearest hospital or doctor?",
    hi: "मेरी तबीयत ठीक नहीं है, मुझे तेज़ बुखार है। पास में अस्पताल या डॉक्टर कहाँ हैं?",
    ta: "எனக்கு உடல்நிலை சரியில்லை, கடுமையான காய்ச்சலாக உள்ளது. அருகில் மருத்துவமனை எங்குள்ளது?",
    kn: "ನನ್ನ ಆರೋಗ್ಯ ಸರಿಯಿಲ್ಲ, ತೀವ್ರ ಜ್ವರವಿದೆ. ಹತ್ತಿರದಲ್ಲಿ ಆಸ್ಪತ್ರೆ ಅಥವಾ ವೈದ್ಯರು ಎಲ್ಲಿದ್ದಾರೆ?",
    ml: "എനിക്ക് സുഖമില്ല, കടുത്ത പനിയാണ്. അടുത്ത് എവിടെയാണ് ആശുപത്രിയോ ഡോക്ടറോ ഉള്ളത്?",
    gondi: "నాకూ వెర్ వాత్తా, డాక్టర్ బేగె మంతూర్?",
    koya: "నాకు జ్వరం ఉంది, డాక్టర్ బెగె ఉన్నాడు?",
    lambadi: "మనే తాప్ ఆయో చ, దవాఖానా కతర్ చ?",
    category: "Healthcare and emergencies",
    transliteration: {
      te: "Nāku oṇṭlō bāgōlēdu, tīvramaina jvaraṅgā undi. Daggarlō āsupatri lēdā doctor ekkaḍa unnāru?",
      hi: "Doctor kahan hain?",
    },
    pronunciationGuidance: "Urgent cadence. 'Āsupatri' is the widely used loan word for hospital.",
  },
  {
    patterns: ["అంబులెన్స్", "ambulance", "emergency call", "108"],
    te: "వెంటనే అంబులెన్స్‌ని పిలవండి! అత్యవసర వైద్య సహాయం కావాలి.",
    en: "Call an ambulance immediately! Urgent medical assistance is required.",
    hi: "तुरंत एम्बुलेंस बुलाइए! आपातकालीन चिकित्सा सहायता चाहिए।",
    ta: "உடனே ஆம்புலன்ஸை அழையுங்கள்! அவசர மருத்துவ உதவி தேவை.",
    kn: "ತಕ್ಷಣ ಆಂಬ್ಯುಲೆನ್ಸ್‌ಗೆ ಕರೆ ಮಾಡಿ! ತುರ್ತು ವೈದ್ಯಕೀಯ ನೆರವು ಬೇಕು.",
    ml: "ഉടൻ തന്നെ ആംബുലൻസ് വിളിക്കൂ!",
    category: "Healthcare and emergencies",
    transliteration: {
      te: "Veṇṭanē ambulance-ni pilavaṇḍi! Atyavasara vaidya sahāyaṁ kāvāli.",
      hi: "Ambulance bulao!",
    },
    pronunciationGuidance: "High emergency urgency.",
  },
  {
    patterns: ["కడుపు నొప్పి", "తలనొప్పి", "stomach pain", "headache", "pet dard", "sir dard"],
    te: "నాకు భరించలేని తలనొప్పి మరియు కడుపు నొప్పిగా ఉంది.",
    en: "I have unbearable headache and severe stomach pain.",
    hi: "मुझे असहनीय सिरदर्द और पेट में दर्द हो रहा है।",
    ta: "எனக்கு கடுமையான தலைவலியும் வயிற்றுவலியும் உள்ளது.",
    kn: "ನನಗೆ ತೀವ್ರ ತಲೆನೋವು ಮತ್ತು ಹೊಟ್ಟೆನೋವು ಇದೆ.",
    ml: "എനിക്ക് കടുത്ത തലവേദനയും വയറുവേദനയുമുണ്ട്.",
    category: "Healthcare and emergencies",
    transliteration: {
      te: "Nāku bharin̄chalēni talanoppi mariyu kaḍupu noppigā undi.",
      hi: "Sir dard aur pet dard hai.",
    },
    pronunciationGuidance: "'talanoppi' (head pain), 'kaḍupu noppi' (stomach pain).",
  },
  {
    patterns: ["మెడికల్ షాప్", "మందుల షాప్", "medical shop", "pharmacy", "chemist", "dawai"],
    te: "దగ్గర్లో మందుల షాప్ ఎక్కడ ఉంది? ఈ ప్రిస్క్రిప్షన్ మందులు తీసుకోవాలి.",
    en: "Where is the nearest medical shop? I need to buy these prescription medicines.",
    hi: "पास में मेडिकल शॉप कहाँ है? मुझे ये दवाइयाँ खरीदनी हैं।",
    ta: "அருகில் மருந்தகம் எங்குள்ளது?",
    kn: "ಹತ್ತಿರದಲ್ಲಿ ಮೆಡಿಕಲ್ ಶಾಪ್ ಎಲ್ಲಿದೆ?",
    ml: "അടുത്ത് മെഡിക്കൽ ഷോപ്പ് എവിടെയാണ്?",
    category: "Healthcare and emergencies",
    transliteration: {
      te: "Daggarlō mandula shop ekkaḍa undi? Ī prescription mandulu tīsukōvāli.",
      hi: "Medical store kahan hai?",
    },
    pronunciationGuidance: "Practical emergency errand phrase.",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 9. WORK & INTERVIEWS (57-60)
  // ─────────────────────────────────────────────────────────────────────────
  {
    patterns: ["ఉద్యోగం", "ఇంటర్వ్యూ", "పని", "job", "work", "interview", "office", "salary", "naukri", "kaam"],
    te: "నేను ఈ ఉద్యోగ అవకాశానికి దరఖాస్తు చేసుకోవాలనుకుంటున్నాను. అర్హతలు ఏమిటి?",
    en: "I would like to apply for this job opportunity. What are the required qualifications?",
    hi: "मैं इस नौकरी के अवसर के लिए आवेदन करना चाहता हूँ। आवश्यक योग्यताएँ क्या हैं?",
    ta: "நான் இந்த வேலை வாய்ப்பிற்கு விண்ணப்பிக்க விரும்புகிறேன். தகுதிகள் என்ன?",
    kn: "ನಾನು ಈ ಉದ್ಯೋಗಾವಕಾಶಕ್ಕೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ಬಯಸುತ್ತೇನೆ. ಅರ್ಹತೆಗಳೇನು?",
    ml: "ഈ ജോലി അവസരത്തിലേക്ക് അപേക്ഷിക്കാൻ ഞാൻ ആഗ്രഹിക്കുന്നു. യോഗ്യതകൾ എന്തൊക്കെയാണ്?",
    category: "Work and interviews",
    transliteration: {
      te: "Nēnu ī udyōga avakāśāniki darakhāstu chēsukōvālanukuṇṭunnānu. Arhatalu ēmiṭi?",
      hi: "Main is naukri ke liye apply karna chahta hoon.",
    },
    pronunciationGuidance: "Formal professional tone: 'darakhāstu' (application).",
  },
  {
    patterns: ["పని వేళలు", "ఆఫీస్ సమయం", "working hours", "timing", "office time"],
    te: "కార్యాలయ పని వేళలు ఉదయం తొమ్మిది నుంచి సాయంత్రం ఆరు వరకు ఉంటాయి.",
    en: "Office working hours are from 9:00 AM to 6:00 PM.",
    hi: "कार्यालय का समय सुबह 9:00 बजे से शाम 6:00 बजे तक है।",
    ta: "அலுவலக வேலை நேரம் காலை 9 மணி முதல் மாலை 6 மணி வரை.",
    kn: "ಕಚೇರಿಯ ಕೆಲಸದ ಸಮಯ ಬೆಳಿಗ್ಗೆ 9 ರಿಂದ ಸಂಜೆ 6 ರವರೆಗೆ.",
    ml: "ഓഫീസ് സമയം രാവിലെ 9 മുതൽ വൈകുന്നേരം 6 വരെയാണ്.",
    category: "Work and interviews",
    transliteration: {
      te: "Kāryālaya pani vēḷalu udayaṁ tommidi ninchi sāyantraṁ āru varaku uṇṭāyi.",
      hi: "Office timing 9 se 6 hai.",
    },
    pronunciationGuidance: "Professional procedural tone.",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 10. COMMON CONVERSATIONS & COURTESY (61-68)
  // ─────────────────────────────────────────────────────────────────────────
  {
    patterns: ["ధన్యవాదాలు", "థాంక్స్", "చాలా థాంక్స్", "thank you", "thanks", "thank you very much", "dhanyavaad", "shukriya"],
    te: "చాలా ధన్యవాదాలు! మీ సహాయాన్ని ఎప్పటికీ మర్చిపోలేను.",
    en: "Thank you very much! I deeply appreciate your kind help.",
    hi: "बहुत-बहुत धन्यवाद! आपकी मदद के लिए मैं आभारी हूँ।",
    ta: "மிக்க நன்றி! உங்கள் உதவிக்கு என் மனமார்ந்த நன்றிகள்.",
    kn: "ತುಂಬಾ ಧನ್ಯವಾದಗಳು! ನಿಮ್ಮ ಸಹಾಯಕ್ಕೆ ಕೃತಜ್ಞತೆಗಳು.",
    ml: "വളരെ നന്ദി! നിങ്ങളുടെ സഹായത്തിന് നന്ദി.",
    gondi: "వలే జోహార్! నిమ్మ కీస సహాయం చొక్కట్.",
    koya: "చాలా మేలు!",
    lambadi: "బహూత్ ధన్వాద్ జీ!",
    category: "Common Telugu-English-Hindi conversations",
    transliteration: {
      te: "Chālā dhanyavādālu! Mī sahāyānni eppaṭikī marchipōlēnu.",
      hi: "Bahut bahut dhanyavaad!",
    },
    pronunciationGuidance: "Heartfelt gratitude with retroflex 'ḷ' in 'dhanyavādālu'.",
  },
  {
    patterns: ["క్షమించండి", "సారీ", "sorry", "excuse me", "maaf kijiye", "pardon"],
    te: "నన్ను క్షమించండి, నేను మిమ్మల్ని ఇబ్బంది పెట్టాలనుకోలేదు.",
    en: "Excuse me / I am sorry, I did not mean to inconvenience you.",
    hi: "मुझे माफ़ कीजिए, मैं आपको परेशान नहीं करना चाहता था।",
    ta: "மன்னிக்கவும், உங்களுக்கு சிரமம் தர விரும்பவில்லை.",
    kn: "ನನ್ನನ್ನು ಕ್ಷಮಿಸಿ, ನಿಮಗೆ ತೊಂದರೆ ಕೊಡಲು ಬಯಸಲಿಲ್ಲ.",
    ml: "എനിക്ക് മാപ്പ് തരൂ, ബുദ്ധിമുട്ടിക്കാൻ ഉദ്ദേശിച്ചില്ല.",
    category: "Common Telugu-English-Hindi conversations",
    transliteration: {
      te: "Nannu kṣaminchaṇḍi, nēnu mimmalni ibbandi peṭṭālanukōlēdu.",
      hi: "Maaf kijiye.",
    },
    pronunciationGuidance: "Gentle polite apology.",
  },
  {
    patterns: ["పర్వాలేదు", "నో ప్రాబ్లం", "no problem", "it is okay", "koi baat nahi"],
    te: "పర్వాలేదండి, ఏమీ అనుకోకండి. అంతా బాగానే ఉంది.",
    en: "No problem at all, please do not worry. Everything is fine.",
    hi: "कोई बात नहीं जी, चिंता मत कीजिए। सब ठीक है।",
    ta: "பரவாயில்லை, கவலைப்பட வேண்டாம். எல்லாம் சரியாக உள்ளது.",
    kn: "ಪರವಾಗಿಲ್ಲ, ಚಿಂತಿಸಬೇಡಿ. ಎಲ್ಲವೂ ಸರಿಯಾಗಿದೆ.",
    ml: "സാരമില്ല, വിഷമിക്കേണ്ട. എല്ലാം ശരിയാണ്.",
    category: "Common Telugu-English-Hindi conversations",
    transliteration: {
      te: "Paravālēdaṇḍi, ēmī anukōkaṇḍi. Antā bāgānē undi.",
      hi: "Koi baat nahi.",
    },
    pronunciationGuidance: "Reassuring everyday phrase.",
  },
  {
    patterns: ["చలో", "సరే", "ఓకే", "ఓకే థాంక్స్", "let's go", "all right", "okay thanks", "theek hai", "chalo", "bye"],
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
  
  // Normalize query: remove extra spaces and punctuation
  const clean = query.trim().toLowerCase();
  const stripped = clean.replace(/[?.!,;:'"()]/g, "").trim();

  // 1. Direct exact pattern match
  const exactMatch = DAY_TO_DAY_PHRASES.find((p) =>
    p.patterns.some((pattern) => {
      const pNorm = pattern.toLowerCase().trim();
      return clean === pNorm || stripped === pNorm;
    })
  );
  if (exactMatch) return exactMatch;

  // 2. Substring or phrase containment match (minimum 4 characters to prevent false positives)
  const patternMatch = DAY_TO_DAY_PHRASES.find((p) =>
    p.patterns.some((pattern) => {
      const pNorm = pattern.toLowerCase().trim();
      if (pNorm.length >= 4) {
        return clean.includes(pNorm) || (stripped.length >= 5 && pNorm.includes(stripped));
      }
      return false;
    })
  );
  if (patternMatch) return patternMatch;

  // 2. Direct text containment check on the source language
  const directMatch = DAY_TO_DAY_PHRASES.find((p) => {
    const val = (p as any)[sourceLang];
    if (val && typeof val === "string") {
      const valNorm = val.toLowerCase().replace(/[?.!,;:'"()]/g, "").trim();
      if (valNorm === stripped || valNorm.includes(stripped) || stripped.includes(valNorm)) {
        return true;
      }
    }
    return false;
  });
  if (directMatch) return directMatch;

  // 3. Multilingual fallback search across English, Telugu, Hindi
  return DAY_TO_DAY_PHRASES.find((p) => {
    const enNorm = p.en.toLowerCase().replace(/[?.!,;:'"()]/g, "").trim();
    const teNorm = p.te.toLowerCase().replace(/[?.!,;:'"()]/g, "").trim();
    const hiNorm = p.hi.toLowerCase().replace(/[?.!,;:'"()]/g, "").trim();
    return (
      enNorm.includes(stripped) ||
      stripped.includes(enNorm) ||
      teNorm.includes(stripped) ||
      hiNorm.includes(stripped)
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
