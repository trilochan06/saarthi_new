import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import SpeakButton from "@/components/SpeakButton";


export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const canSubmit = useMemo(
    () => email.trim().length > 3 && password.trim().length >= 3,
    [email, password]
  );

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Demo login — replace with real auth later
    navigate("/therapist/dashboard");
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">
            {t("login.title")}
          </CardTitle>
          <CardDescription>
            {t("login.subtitle")}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="email">
                  {t("login.email")}
                </Label>
                <SpeakButton text={t("login.email")} />
              </div>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("login.email")}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">
                  {t("login.password")}
                </Label>
                <SpeakButton text={t("login.password")} />
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("login.password")}
                autoComplete="current-password"
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              disabled={!canSubmit}
            >
              {t("login.button")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
