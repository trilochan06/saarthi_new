import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { useTherapyStore } from "@/stores/therapyStore";
import { LogOut, Star } from "lucide-react";

const activityTypeIcons: Record<string, string> = {
  aac: "🗣️",
  matching: "🧩",
  "visual-schedule": "📋",
  speech: "🎤",
};

const activityColors: Record<string, string> = {
  aac: "bg-therapy-teal-light border-therapy-teal",
  matching: "bg-therapy-coral-light border-therapy-coral",
  "visual-schedule": "bg-therapy-amber-light border-therapy-amber",
  speech: "bg-therapy-lavender-light border-therapy-lavender",
};

const ChildHome = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { logout, currentChildId, learners, assignments, activities } =
    useTherapyStore();

  const learner = learners.find((l) => l.id === currentChildId);

  if (!learner) {
    return (
      <div className="min-h-screen bg-therapy-coral-light flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-foreground mb-4">{t("child.notFound")}</p>
          <Button variant="child" onClick={() => navigate("/login")}>
            {t("common.back")}
          </Button>
        </div>
      </div>
    );
  }

  const myAssignments = assignments.filter((a) => a.learnerId === learner.id);

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-hero)" }}>
      <header className="p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {t("child.welcome", { name: learner.name })}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("child.subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => logout()}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 pb-10">
        <div className="grid md:grid-cols-2 gap-4">
          {myAssignments.map((as) => {
            const activity = activities.find((a) => a.id === as.activityId);
            if (!activity) return null;

            return (
              <div
                key={as.id}
                className={`rounded-2xl border-2 p-5 therapy-shadow cursor-pointer hover:scale-[1.01] transition-transform ${
                  activityColors[activity.type] || "bg-card border-border"
                }`}
                onClick={() => navigate(`/child/activity/${activity.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="text-4xl">
                    {activityTypeIcons[activity.type] || "⭐"}
                  </div>
                  <Star className="w-5 h-5 text-primary" />
                </div>

                <h3 className="mt-3 text-lg font-bold text-foreground">
                  {activity.name}
                </h3>

                <p className="text-sm text-muted-foreground mt-1">
                  {t("child.tapToOpen")}
                </p>
              </div>
            );
          })}

          {myAssignments.length === 0 && (
            <div className="bg-card rounded-2xl p-8 text-center therapy-shadow">
              <p className="text-muted-foreground">{t("child.noActivities")}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ChildHome;
