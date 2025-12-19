import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTherapyStore } from "@/stores/therapyStore";
import { useTranslation } from "react-i18next";

/**
 * Index.tsx
 * ----------
 * This is the REAL app entry point.
 * It decides where the user goes:
 * - Therapist → Therapist Dashboard
 * - Child → Child Home
 * - Not logged in → Login
 *
 * IMPORTANT:
 * ❌ Do NOT put Color Matching navigation here
 * Color Matching must open ONLY via user action (button click).
 */

const Index = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, userRole } = useTherapyStore();

  useEffect(() => {
    // Not logged in → Login
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Logged in → Role based routing
    if (userRole === "therapist") {
      navigate("/therapist/dashboard");
    } else if (userRole === "child") {
      navigate("/child/home");
    }
  }, [isAuthenticated, userRole, navigate]);

  // Loading screen while redirecting
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-pulse-soft">
        <p className="text-muted-foreground">
          {t("common.loading")}
        </p>
      </div>
    </div>
  );
};

export default Index;
