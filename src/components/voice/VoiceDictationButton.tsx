import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  onText: (text: string) => void;
  className?: string;
};

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

export default function VoiceDictationButton({ onText, className }: Props) {
  const { i18n, t } = useTranslation();
  const [listening, setListening] = useState(false);
  const recRef = useRef<any>(null);

  const supported = useMemo(() => {
    const w = window as any;
    return !!(w.SpeechRecognition || w.webkitSpeechRecognition);
  }, []);

  useEffect(() => {
    if (!supported) return;

    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    const rec = new SR();

    rec.lang = getLocale(i18n.language);
    rec.interimResults = false;
    rec.continuous = false;

    rec.onresult = (event: any) => {
      const text = event.results?.[0]?.[0]?.transcript ?? "";
      if (text.trim()) onText(text.trim());
    };

    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);

    recRef.current = rec;
  }, [supported, i18n.language, onText]);

  function start() {
    if (!recRef.current) return;
    setListening(true);
    recRef.current.lang = getLocale(i18n.language);
    recRef.current.start();
  }

  function stop() {
    if (!recRef.current) return;
    recRef.current.stop();
    setListening(false);
  }

  if (!supported) {
    return (
      <Button type="button" variant="outline" size="icon" disabled title="Speech recognition not supported">
        <Mic className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={className}
      onClick={listening ? stop : start}
      title={listening ? t("voice.stop") : t("voice.start")}
    >
      {listening ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
    </Button>
  );
}
