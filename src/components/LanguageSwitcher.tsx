import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const LANGS = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "ta", label: "தமிழ்" },
] as const;

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const current = useMemo(() => {
    const lng = (i18n.resolvedLanguage || i18n.language || "en").toLowerCase();
    if (lng.startsWith("hi")) return "hi";
    if (lng.startsWith("ta")) return "ta";
    return "en";
  }, [i18n.language, i18n.resolvedLanguage]);

  async function setLang(code: "en" | "hi" | "ta") {
    localStorage.setItem("app_lang", code);
    await i18n.changeLanguage(code);
  }

  return (
    <div className="flex items-center gap-2">
      {LANGS.map((l) => (
        <Button
          key={l.code}
          type="button"
          variant={current === l.code ? "default" : "outline"}
          size="sm"
          onClick={() => setLang(l.code)}
          className="gap-2"
        >
          {current === l.code ? <Check className="h-4 w-4" /> : null}
          {l.label}
        </Button>
      ))}
    </div>
  );
}
