type Topic = "anxiety" | "sleep" | "stress" | "focus";

function langKey(lang: string) {
  // normalize i18n language like "en", "en-IN", "ta", "ta-IN"
  const l = (lang || "en").toLowerCase();
  if (l.startsWith("ta")) return "ta";
  if (l.startsWith("hi")) return "hi";
  return "en";
}

/**
 * Lightweight, offline "AI-like" suggestions.
 * (No API key required. Safe for demo + offline.)
 */
export function getSuggestions(topic: string, language: string): string[] {
  const t = (topic || "stress") as Topic;
  const lk = langKey(language);

  const data: Record<string, Record<Topic, string[]>> = {
    en: {
      anxiety: [
        "Try a 60-second box-breathing cycle: 4s inhale, 4s hold, 4s exhale, 4s hold.",
        "Name 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste.",
        "Write one worry, then write one small action you can do in 5 minutes.",
        "Reduce caffeine today and drink a glass of water now.",
      ],
      sleep: [
        "Avoid screens 30 minutes before bed; dim lights and keep the room cool.",
        "Do a simple wind-down: stretch 2 minutes + slow breathing 2 minutes.",
        "If you can't sleep in 20 minutes, get up and read something calm.",
        "Set a consistent wake-up time (even on weekends).",
      ],
      stress: [
        "Do a quick body scan: relax jaw, shoulders, hands, then breathe out slowly.",
        "Pick one task only for the next 10 minutes; ignore everything else.",
        "Take a short walk and focus on your footsteps and breathing.",
        "Drink water + do 5 slow breaths to reset your nervous system.",
      ],
      focus: [
        "Try 25/5 Pomodoro: 25 minutes work, 5 minutes break.",
        "Clear distractions: silence notifications for 30 minutes.",
        "Write the single next action in one sentence before starting.",
        "Use a timer and stop when it rings—even if not finished.",
      ],
    },

    hi: {
      anxiety: [
        "1 मिनट बॉक्स-ब्रीदिंग करें: 4 सेकंड अंदर, 4 रोकें, 4 बाहर, 4 रोकें।",
        "5-4-3-2-1 ग्राउंडिंग: 5 चीज़ें देखें, 4 महसूस करें, 3 सुनें, 2 सूंघें, 1 स्वाद।",
        "एक चिंता लिखें और उसके लिए 5 मिनट का छोटा एक्शन लिखें।",
        "आज कैफीन कम करें और अभी एक गिलास पानी पिएँ।",
      ],
      sleep: [
        "सोने से 30 मिनट पहले स्क्रीन बंद करें, लाइट धीमी रखें।",
        "2 मिनट स्ट्रेच + 2 मिनट धीमी सांस वाला विंड-डाउन करें।",
        "20 मिनट में नींद न आए तो उठकर शांत चीज़ पढ़ें।",
        "रोज़ एक ही समय पर उठने की कोशिश करें।",
      ],
      stress: [
        "बॉडी स्कैन: जबड़ा, कंधे, हाथ ढीले करें और धीरे सांस छोड़ें।",
        "अगले 10 मिनट सिर्फ एक ही काम पर ध्यान दें।",
        "थोड़ी देर टहलें और कदमों/सांस पर ध्यान दें।",
        "पानी पिएँ और 5 धीमी सांसें लें।",
      ],
      focus: [
        "25/5 पोमोडोरो ट्राय करें: 25 मिनट काम, 5 मिनट ब्रेक।",
        "नोटिफिकेशन 30 मिनट के लिए साइलेंट करें।",
        "शुरू करने से पहले ‘अगला एक्शन’ एक लाइन में लिखें।",
        "टाइमर लगाएँ और बजते ही रुकें।",
      ],
    },

    ta: {
      anxiety: [
        "1 நிமிடம் Box-breathing: 4 விநாடி உள்ளே, 4 பிடி, 4 வெளியே, 4 பிடி.",
        "5-4-3-2-1 grounding: 5 பார்க்க, 4 உணர, 3 கேட்க, 2 மணம், 1 சுவை.",
        "ஒரு கவலை எழுதுங்கள்; அதற்கான 5 நிமிட சிறு செயலை எழுதுங்கள்.",
        "இன்று காபி/காஃபீன் குறைத்து, இப்போ ஒரு கிளாஸ் தண்ணீர் குடிக்கவும்.",
      ],
      sleep: [
        "தூங்குவதற்கு 30 நிமிடம் முன் ஸ்கிரீன் தவிர்க்கவும்; ஒளியை மங்கலாக்கவும்.",
        "2 நிமிடம் ஸ்ட்ரெட்ச் + 2 நிமிடம் மெதுவான மூச்சு பயிற்சி செய்யவும்.",
        "20 நிமிடம் தூக்கம் வரவில்லை என்றால் எழுந்து அமைதியான வாசிப்பு செய்யவும்.",
        "ஒவ்வொரு நாளும் ஒரே நேரத்தில் எழுந்திருங்கள்.",
      ],
      stress: [
        "Body scan: தாடை, தோள்கள், கைகள் தளர்த்து மெதுவாக மூச்சை வெளியே விடுங்கள்.",
        "அடுத்த 10 நிமிடம் ஒரே பணியை மட்டும் செய்யுங்கள்.",
        "சிறிய நடை; உங்கள் அடிகள் மற்றும் மூச்சில் கவனம் வையுங்கள்.",
        "தண்ணீர் குடித்து 5 மெதுவான மூச்சுகள் எடுத்துக் கொள்ளுங்கள்.",
      ],
      focus: [
        "25/5 Pomodoro: 25 நிமிடம் வேலை, 5 நிமிடம் ஓய்வு.",
        "Notifications-ஐ 30 நிமிடத்திற்கு mute செய்யவும்.",
        "தொடங்குவதற்கு முன் ‘அடுத்த செயல்’ ஒன்றை ஒரு வரியில் எழுதுங்கள்.",
        "Timer வைத்து ஒலித்ததும் நிறுத்துங்கள்.",
      ],
    },
  };

  return data[lk][t] ?? data.en.stress;
}
