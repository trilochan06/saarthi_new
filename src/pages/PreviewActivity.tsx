import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { useTherapyStore } from "@/stores/therapyStore";
import { ArrowLeft, Volume2 } from "lucide-react";
import { speak } from "@/lib/speak";

const PreviewActivity = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { activityId } = useParams<{ activityId: string }>();
  const { activities } = useTherapyStore();

  const activity = activities.find((a) => a.id === activityId);

  if (!activity) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{t("preview.notFound")}</p>
          <Button variant="therapy" onClick={() => navigate(-1)}>
            {t("common.back")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-therapy-teal-light">
      <header className="bg-card/90 backdrop-blur-sm border-b border-border p-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          {t("preview.exit")}
        </Button>
      </header>

      <main className="p-8">
        <div className="max-w-4xl mx-auto">
          {/* Instruction */}
          <div className="bg-card rounded-2xl p-6 mb-8 therapy-shadow">
            <p className="text-xl font-medium text-foreground text-center">
              {activity.instruction}
            </p>
          </div>

          {/* AAC */}
          {activity.type === "aac" && activity.aacItems && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {activity.aacItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-card rounded-2xl p-6 therapy-shadow hover:scale-105 transition-transform active:scale-95 cursor-pointer"
                  onClick={() => speak(item.label)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="aspect-square rounded-xl bg-therapy-amber-light mb-4 flex items-center justify-center text-5xl">
                    📷
                  </div>
                  <p className="text-lg font-bold text-foreground text-center">
                    {item.label}
                  </p>

                  {/* NOT a nested <button> */}
                  <div className="w-full mt-2 flex justify-center">
                    <div className="inline-flex items-center gap-2 text-sm text-primary">
                      <Volume2 className="w-5 h-5" />
                      {t("preview.tapToSpeak")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Matching */}
          {activity.type === "matching" && activity.matchingOptions && (
            <div className="space-y-4">
              {activity.matchingOptions.map((option) => (
                <div
                  key={option.id}
                  className="w-full bg-card rounded-2xl p-6 therapy-shadow hover:border-primary border-2 border-transparent transition-all text-left"
                >
                  <p className="text-xl font-medium text-foreground">
                    {option.text}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Visual Schedule */}
          {activity.type === "visual-schedule" && activity.visualSteps && (
            <div className="space-y-4">
              {activity.visualSteps
                .sort((a, b) => a.order - b.order)
                .map((step, index) => (
                  <div
                    key={step.id}
                    className="flex items-center gap-6 bg-card rounded-2xl p-6 therapy-shadow"
                  >
                    <span className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                      {index + 1}
                    </span>
                    <div className="w-20 h-20 rounded-xl bg-therapy-amber-light flex items-center justify-center text-4xl">
                      📷
                    </div>
                    <p className="text-xl font-medium text-foreground flex-1">
                      {step.label}
                    </p>
                  </div>
                ))}
            </div>
          )}

          {/* Speech Prompt */}
          {activity.type === "speech" && activity.speechPrompt && (
            <div className="text-center">
              {activity.speechPrompt.imageUrl && (
                <div className="w-48 h-48 mx-auto rounded-2xl bg-therapy-amber-light mb-6 flex items-center justify-center text-7xl">
                  📷
                </div>
              )}
              <div className="bg-card rounded-2xl p-8 therapy-shadow">
                <p className="text-2xl font-medium text-foreground mb-6">
                  {activity.speechPrompt.promptText}
                </p>
                <Button
                  variant="therapy"
                  size="xl"
                  onClick={() => speak(activity.speechPrompt!.promptText)}
                  className="gap-2"
                >
                  <Volume2 className="w-6 h-6" />
                  {t("preview.listen")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PreviewActivity;
