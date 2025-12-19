import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useTherapyStore } from "@/stores/therapyStore";
import { ArrowLeft, Volume2 } from "lucide-react";
import { translateViaApi } from "@/lib/i18nApi";
import { speakUsingGoogle } from "@/lib/speakApi";

type Card = { id: string; english: string };

export default function ChildActivityView() {
  const navigate = useNavigate();
  const { activityId } = useParams<{ activityId: string }>();

  const { activities, learners, currentChildId } = useTherapyStore();
  const activity = activities.find((a) => a.id === activityId);
  const learner = learners.find((l) => l.id === currentChildId);

  const preferredLang = learner?.preferredLanguage ?? "english"; // english/hindi/tamil

  const targetLang = useMemo<"en" | "hi" | "ta">(() => {
    const l = preferredLang.toLowerCase();
    if (l === "hindi") return "hi";
    if (l === "tamil") return "ta";
    return "en";
  }, [preferredLang]);

  // Example AAC items (english base)
  const cards: Card[] = useMemo(
    () => [
      { id: "water", english: "Water" },
      { id: "food", english: "Food" },
      { id: "help", english: "Help" },
      { id: "bathroom", english: "Bathroom" }
    ],
    []
  );

  const [translated, setTranslated] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;

    async function run() {
      // If english, keep as-is without API call
      if (targetLang === "en") {
        const map: Record<string, string> = {};
        cards.forEach((c) => (map[c.id] = c.english));
        if (!cancelled) setTranslated(map);
        return;
      }

      const map: Record<string, string> = {};
      for (const c of cards) {
        try {
          const tr = await translateViaApi(c.english, targetLang);
          map[c.id] = tr;
        } catch {
          map[c.id] = c.english; // fallback
        }
      }

      if (!cancelled) setTranslated(map);
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [cards, targetLang]);

  if (!activity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Activity not found</p>
          <Button onClick={() => navigate(-1)}>Back</Button>
        </div>
      </div>
    );
  }

  const instructionEnglish = "Tap on the pictures to communicate your needs";
  const instructionText = translated["instruction"] ?? instructionEnglish;

  async function speakCard(id: string) {
    const txt = translated[id] ?? cards.find((c) => c.id === id)?.english ?? "";
    await speakUsingGoogle(txt, preferredLang);
  }

  return (
    <div className="min-h-screen bg-therapy-teal-light">
      <header className="bg-card/90 backdrop-blur-sm border-b border-border p-4">
        <div className="container mx-auto flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <Button
            variant="outline"
            onClick={() => speakUsingGoogle(instructionEnglish, preferredLang)}
            className="gap-2"
          >
            <Volume2 className="w-4 h-4" />
            Speak
          </Button>
        </div>
      </header>

      <main className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-card rounded-2xl p-6 mb-8 therapy-shadow">
            <p className="text-xl font-medium text-foreground text-center">
              {instructionEnglish}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {cards.map((c) => (
              <button
                key={c.id}
                onClick={() => speakCard(c.id)}
                className="bg-card rounded-2xl p-6 therapy-shadow hover:scale-105 transition-transform active:scale-95"
              >
                <div className="aspect-square rounded-xl bg-therapy-amber-light mb-4 flex items-center justify-center text-5xl">
                  📷
                </div>

                <p className="text-lg font-bold text-foreground text-center">
                  {translated[c.id] ?? c.english}
                </p>

                <p className="mt-2 text-sm text-therapy-teal text-center flex items-center justify-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  Tap to speak
                </p>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
