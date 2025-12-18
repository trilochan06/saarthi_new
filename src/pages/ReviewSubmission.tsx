import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useTherapyStore } from "@/stores/therapyStore";
import { ArrowLeft, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ReviewSubmission = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { activityId, childId } = useParams<{ activityId: string; childId: string }>();

  const { learners, activities } = useTherapyStore();
  const learner = learners.find((l) => l.id === childId);
  const activity = activities.find((a) => a.id === activityId);

  const [rating, setRating] = useState<number>(4);
  const [notes, setNotes] = useState("");

  if (!learner || !activity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{t("review.notFound")}</p>
          <Button onClick={() => navigate(-1)}>{t("common.back")}</Button>
        </div>
      </div>
    );
  }

  function submit() {
    toast({
      title: t("review.saved"),
      description: `${learner.name} • ${activity.name}`,
    });
    navigate("/therapist/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="p-4 border-b bg-card">
        <div className="container mx-auto flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            {t("common.back")}
          </Button>
          <h1 className="text-xl font-bold">{t("review.title")}</h1>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-3xl">
        <Card className="therapy-shadow">
          <CardHeader>
            <CardTitle className="text-lg">
              {learner.name} • {activity.name}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div>
              <p className="text-sm text-muted-foreground mb-2">{t("review.rating")}</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    className={`p-2 rounded-lg border ${
                      rating >= n ? "bg-therapy-amber-light border-therapy-amber" : "bg-card border-border"
                    }`}
                  >
                    <Star className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">{t("review.notes")}</p>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("review.notesPlaceholder")}
              />
            </div>

            <Button variant="therapy" className="w-full" onClick={submit}>
              {t("common.save")}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ReviewSubmission;
