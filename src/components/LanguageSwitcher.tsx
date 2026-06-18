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
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  onLanguageChange,
  fullWidth,
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

  const currentLanguage =
    languages.find((lang) => lang.code === i18n.language) || languages[0];

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
              language.code === i18n.language && "text-primary"
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
