import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Grid3X3, Puzzle, ListOrdered, Mic } from "lucide-react";

const activityTypes = [
  {
    id: "aac",
    icon: Grid3X3,
    color: "bg-therapy-teal",
    lightColor: "bg-therapy-teal-light",
    textColor: "text-therapy-teal",
  },
  {
    id: "matching",
    icon: Puzzle,
    color: "bg-therapy-coral",
    lightColor: "bg-therapy-coral-light",
    textColor: "text-therapy-coral",
  },
  {
    id: "visual-schedule",
    icon: ListOrdered,
    color: "bg-therapy-amber",
    lightColor: "bg-therapy-amber-light",
    textColor: "text-therapy-amber",
  },
  {
    id: "speech",
    icon: Mic,
    color: "bg-therapy-lavender",
    lightColor: "bg-therapy-lavender-light",
    textColor: "text-therapy-lavender",
  },
] as const;

const CreateActivitySelect = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border p-4">
        <div className="container mx-auto flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            {t("common.back")}
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {t("createSelect.title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("createSelect.subtitle")}
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid md:grid-cols-2 gap-6">
          {activityTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Card
                key={type.id}
                className="therapy-shadow hover:scale-[1.01] transition-transform cursor-pointer"
                onClick={() => navigate(`/therapist/create/${type.id}`)}
              >
                <CardHeader className="flex flex-row items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl ${type.lightColor} flex items-center justify-center`}
                  >
                    <Icon className={`w-6 h-6 ${type.textColor}`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {t(`activityTypes.${type.id}.name`)}
                    </CardTitle>
                    <CardDescription>
                      {t(`activityTypes.${type.id}.desc`)}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="therapy">
                    {t("createSelect.open")}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default CreateActivitySelect;
