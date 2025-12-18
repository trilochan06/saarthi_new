import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { useTherapyStore } from "@/stores/therapyStore";
import { ArrowLeft, CheckCircle2, Volume2 } from "lucide-react";
import { speak } from "@/lib/speak";

const ChildActivityView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { activityId } = useParams<{ activityId: string }>();

  const { activities, assignments, currentChildId, updateAssignmentStatus } =
    useTherapyStore();

  const activity = activities.find((a) => a.id === activityId);
  const assignment = assignments.find(
    (a) => a.activityId === activityId && a.learnerId === currentChildId
  );

  const [completed, setCompleted] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, [activityId]);

  if (!activity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{t("child.activityMissing")}</p>
          <Button onClick={() => navigate(-1)}>{t("common.back")}</Button>
        </div>
      </div>
    );
  }

  function markCompleted() {
    setCompleted(true);
    if (assignment) {
      updateAssignmentStatus(assignment.id, "completed");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="p-4 border-b bg-card">
        <div className="container mx-auto flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            {t("common.back")}
          </Button>
          <div className="text-right">
            <div className="font-semibold">{activity.name}</div>
            <div className="text-xs text-muted-foreground">
              {t("child.followInstruction")}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="bg-card rounded-2xl p-6 therapy-shadow mb-6 text-center">
          <p className="text-lg font-medium">{activity.instruction}</p>
          <div className="mt-3 flex justify-center">
            <Button variant="outline" onClick={() => speak(activity.instruction)} className="gap-2">
              <Volume2 className="w-4 h-4" />
              {t("voice.speak")}
            </Button>
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            variant="therapy"
            size="lg"
            onClick={markCompleted}
            disabled={completed}
            className="gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            {completed ? t("child.completed") : t("child.markDone")}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ChildActivityView;
