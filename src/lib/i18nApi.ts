const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * TEXT TO SPEECH
 * Returns an audio Blob (mp3/wav depending on backend)
 */
export async function ttsViaApi(text: string, lang: string) {
  const res = await fetch(`${API_URL}/i18n/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, lang }),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`TTS failed: ${res.status} ${msg}`);
  }

  return await res.blob();
}

/**
 * TRANSLATE
 * Returns translated string
 */
export async function translateViaApi(text: string, lang: string) {
  const res = await fetch(`${API_URL}/i18n/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, lang }),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`Translate failed: ${res.status} ${msg}`);
  }

  const data = (await res.json()) as { translated?: string; text?: string };
  // support multiple possible backend response shapes
  return data.translated ?? data.text ?? text;
}
