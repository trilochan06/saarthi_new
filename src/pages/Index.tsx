import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTherapyStore } from "@/stores/therapyStore";
import { useTranslation } from "react-i18next";

const Index = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, userRole } = useTherapyStore();

  useEffect(() => {
    if (isAuthenticated) {
      if (userRole === "therapist") navigate("/therapist/dashboard");
      else if (userRole === "child") navigate("/child/home");
    } else {
      navigate("/login");
    }
  }, [isAuthenticated, userRole, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-pulse-soft">
        <p className="text-muted-foreground">{t("common.loading")}</p>
      </div>
    </div>
  );
};

export default Index;
