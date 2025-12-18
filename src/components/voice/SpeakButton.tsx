import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Volume2, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { speak, stopSpeaking } from "@/lib/speak";

type Props = {
  text: string;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost" | "secondary" | "therapy" | "soft";
};

export default function SpeakButton({
  text,
  className,
  size = "icon",
  variant = "ghost",
}: Props) {
  const { t } = useTranslation();
  const [speaking, setSpeaking] = useState(false);

  async function onSpeak() {
    try {
      setSpeaking(true);
      await speak(text);
      // We can’t reliably detect “end” across all browsers, so reset quickly
      setTimeout(() => setSpeaking(false), 900);
    } catch (e) {
      console.error(e);
      setSpeaking(false);
    }
  }

  function onStop() {
    stopSpeaking();
    setSpeaking(false);
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={speaking ? onStop : onSpeak}
      title={speaking ? t("voice.stopSpeaking") : t("voice.speak")}
    >
      {speaking ? <Square className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
    </Button>
  );
}
