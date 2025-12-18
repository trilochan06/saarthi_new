import i18n from "@/i18n";

/**
 * Map i18n language -> BCP-47 locale used by Web Speech API
 */
function getLocale(lang: string) {
  switch (lang) {
    case "ta":
      return "ta-IN";
    case "hi":
      return "hi-IN";
    case "en":
    default:
      return "en-IN";
  }
}

let voicesReadyPromise: Promise<void> | null = null;

function ensureVoicesReady(): Promise<void> {
  if (voicesReadyPromise) return voicesReadyPromise;

  voicesReadyPromise = new Promise((resolve) => {
    const already = window.speechSynthesis?.getVoices?.() ?? [];
    if (already.length > 0) return resolve();

    // voices often load async
    const onVoices = () => {
      resolve();
      window.speechSynthesis.removeEventListener("voiceschanged", onVoices);
    };

    window.speechSynthesis.addEventListener("voiceschanged", onVoices);

    // safety timeout (still resolves)
    setTimeout(() => resolve(), 800);
  });

  return voicesReadyPromise;
}

function pickBestVoice(locale: string): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  // strict match
  let v = voices.find((x) => x.lang?.toLowerCase() === locale.toLowerCase());
  if (v) return v;

  // loose match like "hi" or "ta"
  const short = locale.split("-")[0].toLowerCase();
  v = voices.find((x) => x.lang?.toLowerCase().startsWith(short));
  if (v) return v;

  // fallback any voice
  return voices[0];
}

/**
 * Speak text in currently selected UI language.
 * IMPORTANT: Must be called from a user action (button click) for best browser support.
 */
export async function speak(text: string, opts?: { rate?: number; pitch?: number }) {
  if (!text?.trim()) return;
  if (!("speechSynthesis" in window)) {
    console.warn("SpeechSynthesis not supported in this browser.");
    return;
  }

  const locale = getLocale(i18n.language);

  // Stop any previous speech
  window.speechSynthesis.cancel();

  await ensureVoicesReady();

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = locale;
  utter.rate = opts?.rate ?? 1;
  utter.pitch = opts?.pitch ?? 1;

  const voice = pickBestVoice(locale);
  if (voice) utter.voice = voice;

  window.speechSynthesis.speak(utter);
}

export function stopSpeaking() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}
