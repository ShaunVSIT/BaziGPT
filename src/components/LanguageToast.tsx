import React, { useState, useEffect, useRef } from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const languageNames: Record<string, string> = {
  en: "English",
  th: "ไทย",
  zh: "中文",
};

const LanguageToast: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleLanguageChange = (event: Event) => {
      const { language: newLanguage } = (event as CustomEvent).detail;
      setLanguage(languageNames[newLanguage] || newLanguage);
      setOpen(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setOpen(false), 3000);
    };

    window.addEventListener("language-preference-saved", handleLanguageChange);
    return () => {
      window.removeEventListener("language-preference-saved", handleLanguageChange);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 transition-all duration-300",
        open
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      )}
    >
      <div className="flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground shadow-lg">
        <CheckCircle2 className="size-4" />
        Language preference saved: {language} ✨
      </div>
    </div>
  );
};

export default LanguageToast;
