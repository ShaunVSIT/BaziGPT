import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { track } from "@vercel/analytics/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  description: string;
}

const languages: Language[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸", description: "Get your Bazi reading in English" },
  { code: "th", name: "Thai", nativeName: "ไทย", flag: "🇹🇭", description: "รับการอ่านบาซี่ในภาษาไทย" },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳", description: "获取中文八字解读" },
];

const LanguageWelcomeModal: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [step, setStep] = useState<"language" | "disclaimer">("language");

  useEffect(() => {
    const hasLanguagePreference = localStorage.getItem("i18nextLng");
    const hasSeenWelcome = localStorage.getItem("bazigpt_language_welcome_seen");
    const hasSeenDisclaimer = localStorage.getItem("bazigpt_disclaimer_seen");

    if (!hasLanguagePreference || !hasSeenWelcome || !hasSeenDisclaimer) {
      setTimeout(() => {
        setOpen(true);
        const browserLang = navigator.language.split("-")[0];
        const supportedLang = languages.find((lang) => lang.code === browserLang);
        setSelectedLanguage(supportedLang?.code || i18n.language || "en");
        if (hasLanguagePreference && hasSeenWelcome && !hasSeenDisclaimer) {
          setStep("disclaimer");
        }
      }, 500);
    }
  }, [i18n.language]);

  const handleLanguageContinue = () => {
    if (selectedLanguage) {
      i18n.changeLanguage(selectedLanguage);
      track("language_welcome_selected", { language: selectedLanguage });
    }
    localStorage.setItem("bazigpt_language_welcome_seen", "true");
    setStep("disclaimer");
  };

  const handleDisclaimerAccept = () => {
    localStorage.setItem("bazigpt_disclaimer_seen", "true");
    track("disclaimer_accepted");
    setOpen(false);
    window.dispatchEvent(new CustomEvent("onboarding-completed"));
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="max-w-md border-primary/30 bg-card [&>button]:hidden"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-center font-display text-2xl">
            {step === "language"
              ? "Welcome to BaziGPT"
              : `⚠️ ${t("home.disclaimer.title")}`}
          </DialogTitle>
          <DialogDescription className="text-center">
            {step === "language"
              ? "Choose your preferred language"
              : t("onboarding.disclaimerSubtitle", "Please read and accept our terms to continue")}
          </DialogDescription>
        </DialogHeader>

        {step === "language" ? (
          <div className="space-y-2">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => setSelectedLanguage(language.code)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all",
                  selectedLanguage === language.code
                    ? "border-primary bg-primary/10"
                    : "border-border hover:bg-muted"
                )}
              >
                <span className="text-3xl leading-none">{language.flag}</span>
                <span className="flex flex-col">
                  <span className="font-semibold text-foreground">
                    {language.nativeName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {language.description}
                  </span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="py-2 text-justify text-sm leading-relaxed text-foreground/90">
            {t("home.disclaimer.content")}
          </p>
        )}

        <DialogFooter className="sm:justify-center">
          {step === "language" ? (
            <Button
              onClick={handleLanguageContinue}
              disabled={!selectedLanguage}
              className="min-w-40 font-semibold"
            >
              Continue
            </Button>
          ) : (
            <Button onClick={handleDisclaimerAccept} className="min-w-40 font-semibold">
              {t("home.disclaimer.accept")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LanguageWelcomeModal;
