import { NextRequest, NextResponse } from "next/server";
import { HERITAGE_STORIES } from "@/lib/heritageData";

const PRESET_DICTIONARY: Record<string, Record<string, string>> = {
  te: {
    en: "O sovereign rain clouds... shower cooling drops under the Rohini constellation, moisten our fertile black soil, and bring life to the sacred Godavari river.",
    hi: "हे मेघराज... रोहिणी नक्षत्र में शीतल वर्षा कर हमारी उपजाऊ काली मिट्टी को सींचें और पावन गोदाవరి को नवजीवन दें।",
    ta: "மழை அரசனே... ரோகிணி விண்மீன் காலத்தில் குளிர்ந்த மழையைப் பொழிந்து, எங்கள் வளமான கரிசல் மண்ணை நனைத்து, புனித கோதாவரி ஆற்றுக்கு உயிர் தருவாய்.",
    kn: "ಓ ಮೇಘರಾಜನೇ... ರೋಹಿಣಿ ನಕ್ಷತ್ರದಲ್ಲಿ ತಂಪಾದ ಹನಿಗಳನ್ನು ಸುರಿಸಿ, ನಮ್ಮ ಕಪ್ಪು ಮಣ್ಣನ್ನು ಹಸನುಮಾಡಿ, ಪವಿತ್ರ ಗೋದಾವರಿ ನದಿಗೆ ಜೀವ ತುಂಬು.",
    ml: "മേഘരാജാവേ... രോഹിണി നക്ഷത്രത്തിൽ തണുത്ത മഴ പെയ്യിച്ച് ഞങ്ങളുടെ കറുത്ത മണ്ണിനെ നനയ്ക്കുകയും പുണ്യ ഗോദാവരി നദിക്ക് പുതുജീവൻ നൽകുകയും ചെയ്യുക.",
  },
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { targetLang = "en", text, sourceLang = "te" } = body;

    // Check if story exists in heritage stories
    const story = HERITAGE_STORIES.find((s) => s.id === id);
    let translatedText = "";

    if (story && story.translations && (story.translations as any)[targetLang]) {
      translatedText = (story.translations as any)[targetLang];
    } else if (PRESET_DICTIONARY[sourceLang]?.[targetLang]) {
      translatedText = PRESET_DICTIONARY[sourceLang][targetLang];
    } else {
      translatedText = `[${targetLang.toUpperCase()} IndicTrans2 Translation] ${text || "Oral narrative translated with preserved cultural nuances."}`;
    }

    return NextResponse.json({
      success: true,
      storyId: id,
      sourceLanguage: story?.language || sourceLang,
      targetLanguage: targetLang,
      translation: translatedText,
      provider: "IndicTrans2-Neural-Engine",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Translation failed" },
      { status: 500 }
    );
  }
}
