import React from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { track } from "@vercel/analytics/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: Language[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "th", name: "Thai", nativeName: "ไทย", flag: "🇹🇭" },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
];

interface LanguageSwitcherProps {
  onLanguageChange?: () => void;
  fullWidth?: boolean;
  /**
   * "dropdown" (default) is the header popover. "inline" renders the languages
   * as a flat list of buttons — use this inside a modal Sheet/Dialog, where a
   * portaled Radix dropdown can't receive pointer events.
   */
  variant?: "dropdown" | "inline";
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  onLanguageChange,
  fullWidth,
  variant = "dropdown",
}) => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    track("language_changed", { language: languageCode });

    window.dispatchEvent(
      new CustomEvent("language-preference-saved", {
        detail: { language: languageCode },
      })
    );

    onLanguageChange?.();
  };

  // i18n.language can be a regional code (e.g. "en-US"); match on the base tag.
  const activeCode = i18n.language?.split("-")[0];
  const currentLanguage =
    languages.find((lang) => lang.code === activeCode) || languages[0];

  if (variant === "inline") {
    return (
      <div className="flex flex-col gap-1">
        {languages.map((language) => {
          const active = language.code === activeCode;
          return (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span className="text-base leading-none">{language.flag}</span>
              <span className="flex flex-col">
                <span className="text-sm font-semibold">{language.nativeName}</span>
                <span className="text-xs text-muted-foreground">{language.name}</span>
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "gap-2 text-muted-foreground hover:text-foreground",
            fullWidth && "w-full justify-start"
          )}
        >
          <Globe className="size-4" />
          <span className="text-base leading-none">{currentLanguage.flag}</span>
          <span className="text-sm">{currentLanguage.nativeName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={cn(
              "gap-3",
              language.code === activeCode && "text-primary"
            )}
          >
            <span className="text-base leading-none">{language.flag}</span>
            <span className="flex flex-col">
              <span className="text-sm font-semibold">
                {language.nativeName}
              </span>
              <span className="text-xs text-muted-foreground">
                {language.name}
              </span>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
