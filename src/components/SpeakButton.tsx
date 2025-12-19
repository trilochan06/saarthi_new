import { useState } from "react";
import { speakText } from "@/lib/speak";

type SpeakButtonProps = {
  text: string;
  lang?: string;
  label?: string;
  className?: string;
};

export default function SpeakButton({
  text,
  lang = "en",
  label = "🔊 Speak",
  className = "",
}: SpeakButtonProps) {
  const [speaking, setSpeaking] = useState(false);

  async function onSpeak() {
    if (!text || speaking) return;

    try {
      setSpeaking(true);
      await speakText(text, lang);
    } finally {
      setSpeaking(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onSpeak}
      disabled={!text || speaking}
      className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
        speaking
          ? "cursor-not-allowed bg-muted text-muted-foreground"
          : "bg-background hover:shadow-sm"
      } ${className}`}
    >
      {speaking ? "🔊 Speaking..." : label}
    </button>
  );
}
