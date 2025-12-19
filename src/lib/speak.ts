const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Speak text using backend TTS API
 * Safe, promise-based, no crashes
 */
export async function speakText(
  text: string,
  lang: string = "en"
): Promise<void> {
  if (!text) return;

  const res = await fetch(`${API_URL}/i18n/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, lang }),
  });

  if (!res.ok) {
    console.error("TTS failed:", await res.text());
    return;
  }

  const blob = await res.blob();
  const audioUrl = URL.createObjectURL(blob);

  const audio = new Audio(audioUrl);
  audio.play();

  audio.onended = () => {
    URL.revokeObjectURL(audioUrl);
  };
}
