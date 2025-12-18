import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSuggestions } from "@/lib/aiAssist";

export default function AiSuggestPanel() {
  const { t, i18n } = useTranslation();
  const [topic, setTopic] = useState<string>("anxiety");

  const suggestions = useMemo(() => {
    return getSuggestions(topic, i18n.language);
  }, [topic, i18n.language]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("ai.title")}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button variant={topic === "anxiety" ? "default" : "outline"} size="sm" onClick={() => setTopic("anxiety")}>
            {t("ai.topics.anxiety")}
          </Button>
          <Button variant={topic === "sleep" ? "default" : "outline"} size="sm" onClick={() => setTopic("sleep")}>
            {t("ai.topics.sleep")}
          </Button>
          <Button variant={topic === "stress" ? "default" : "outline"} size="sm" onClick={() => setTopic("stress")}>
            {t("ai.topics.stress")}
          </Button>
          <Button variant={topic === "focus" ? "default" : "outline"} size="sm" onClick={() => setTopic("focus")}>
            {t("ai.topics.focus")}
          </Button>
        </div>

        <ul className="list-disc pl-5 space-y-2 text-sm">
          {suggestions.map((s, idx) => (
            <li key={idx}>{s}</li>
          ))}
        </ul>

        <p className="text-xs text-muted-foreground">{t("ai.note")}</p>
      </CardContent>
    </Card>
  );
}
