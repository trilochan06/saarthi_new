import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Volume2 } from "lucide-react";
import { speak } from "@/lib/speak";

export default function AudioTestButton() {
  const { t, i18n } = useTranslation();

  const onTest = () => {
    // Speaks in currently selected language (en/hi/ta)
    // Uses the fixed speak() you pasted earlier
    speak(t("app.tagline"));
  };

  return (
    <Button variant="outline" onClick={onTest} className="gap-2">
      <Volume2 className="w-4 h-4" />
      {t("audio.test")} ({i18n.language.toUpperCase()})
    </Button>
  );
}
