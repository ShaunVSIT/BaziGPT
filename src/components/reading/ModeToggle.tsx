import React from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

type Mode = "solo" | "compatibility";

/** Solo / Compatibility pill toggle. */
export const ModeToggle: React.FC<{
  mode: Mode;
  onModeSwitch: (mode: Mode) => void;
}> = ({ mode, onModeSwitch }) => {
  const { t } = useTranslation();

  const tab = (value: Mode, label: string) => (
    <button
      onClick={() => onModeSwitch(value)}
      className={cn(
        "rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
        mode === value
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="mx-auto mb-4 flex w-fit gap-1 rounded-xl bg-primary/10 p-1">
      {tab("solo", t("soloReading.title"))}
      {tab("compatibility", t("compatibility.title"))}
    </div>
  );
};

export default ModeToggle;
