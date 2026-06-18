import React from "react";
import { useTranslation } from "react-i18next";
import { User, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "solo" | "compatibility";

/**
 * Larger-than-life Solo / Compatibility switch: a spring-sliding gold indicator
 * that glides between two slots with a glow trail, icon swap, and scale pop.
 */
export const ModeToggle: React.FC<{
  mode: Mode;
  onModeSwitch: (mode: Mode) => void;
}> = ({ mode, onModeSwitch }) => {
  const { t } = useTranslation();
  const isSolo = mode === "solo";

  const tabs: { value: Mode; label: string; Icon: typeof User }[] = [
    { value: "solo", label: t("soloReading.title"), Icon: User },
    { value: "compatibility", label: t("compatibility.title"), Icon: Heart },
  ];

  return (
    <div className="relative mx-auto mb-5 grid w-full max-w-md grid-cols-2 gap-1.5 rounded-2xl border border-primary/20 bg-obsidian/50 p-1.5 backdrop-blur-sm">
      {/* Sliding glow indicator (spring easing) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-1.5 left-1.5 rounded-xl bg-gradient-to-br from-gold-soft to-primary shadow-[0_0_28px_-2px_var(--gold)] transition-transform duration-500 [transition-timing-function:cubic-bezier(0.34,1.6,0.5,1)]"
        style={{
          width: "calc(50% - 0.375rem)",
          transform: isSolo ? "translateX(0)" : "translateX(100%)",
        }}
      />

      {tabs.map(({ value, label, Icon }) => {
        const active = mode === value;
        return (
          <button
            key={value}
            onClick={() => onModeSwitch(value)}
            aria-label={label}
            className={cn(
              "relative z-10 flex min-w-0 items-center justify-center gap-2 rounded-xl px-2 py-2.5 text-center text-sm font-semibold leading-tight transition-colors duration-300 sm:px-3",
              active
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon
              className={cn(
                "size-5 shrink-0 transition-transform duration-300 sm:size-4",
                active ? "scale-110" : "scale-100",
                value === "compatibility" && active && "fill-current"
              )}
            />
            <span className="hidden min-w-0 sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ModeToggle;
