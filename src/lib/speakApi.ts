import { ttsViaApi } from "@/lib/i18nApi";

function langToLocale(lang: string): "en-IN" | "hi-IN" | "ta-IN" {
  const l = lang.toLowerCase();
  if (l === "hindi" || l === "hi") return "hi-IN";
  if (l === "tamil" || l === "ta") return "ta-IN";
  return "en-IN";
}

let currentAudio: HTMLAudioElement | null = null;

export async function speakUsingGoogle(text: string, preferredLanguage: string) {
  const locale = langToLocale(preferredLanguage);

  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  const audioBytes = await ttsViaApi(text, locale);
  const blob = new Blob([audioBytes], { type: "audio/mpeg" });
  const url = URL.createObjectURL(blob);

  const audio = new Audio(url);
  currentAudio = audio;

  audio.onended = () => {
    URL.revokeObjectURL(url);
    if (currentAudio === audio) currentAudio = null;
  };

  await audio.play();
}
