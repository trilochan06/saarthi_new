import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import VoiceDictationButton from "@/components/voice/VoiceDictationButton";
import SpeakButton from "@/components/voice/SpeakButton";
import AiSuggestPanel from "@/components/AiSuggestPanel";

export default function ActivityAuthoring() {
  const { t } = useTranslation();

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  const canSave = useMemo(() => title.trim().length > 2, [title]);

  function onSave() {
    // Hook this into your backend or store later
    alert(
      `${t("activity.saved")}\n\n${t("activity.title")}: ${title}\n${t(
        "activity.description"
      )}: ${desc}`
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">{t("activity.pageTitle")}</h1>
          <p className="mt-1 text-muted-foreground">{t("activity.pageSubtitle")}</p>
        </div>

        <Button onClick={onSave} disabled={!canSave}>
          {t("activity.save")}
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("activity.formTitle")}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Label htmlFor="title">{t("activity.title")}</Label>

                <div className="flex items-center gap-2">
                  <SpeakButton text={t("activity.title")} />
                  <VoiceDictationButton
                    onText={(spoken) =>
                      setTitle((prev) => (prev ? `${prev} ${spoken}` : spoken))
                    }
                  />
                </div>
              </div>

              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("activity.titlePlaceholder")}
                autoComplete="off"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Label htmlFor="desc">{t("activity.description")}</Label>

                <div className="flex items-center gap-2">
                  <SpeakButton text={t("activity.description")} />
                  <VoiceDictationButton
                    onText={(spoken) =>
                      setDesc((prev) => (prev ? `${prev} ${spoken}` : spoken))
                    }
                  />
                </div>
              </div>

              <textarea
                id="desc"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder={t("activity.descriptionPlaceholder")}
                className="min-h-[140px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </CardContent>
        </Card>

        {/* AI Suggestions */}
        <div className="lg:col-span-1">
          <AiSuggestPanel />
        </div>
      </div>
    </div>
  );
}
