import React from "react";
import { useTranslation } from "react-i18next";
import { CalendarDays, Clock, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDateToYMD, parseYMDLocal } from "@/lib/date";
import { zodiacFromYear, shichenFromTime } from "@/lib/zodiac";
import { cn } from "@/lib/utils";

/** A small gold reveal chip that fades in once a value is entered. */
const Reveal: React.FC<{ emoji: string; children: React.ReactNode }> = ({
  emoji,
  children,
}) => (
  <span className="animate-rise mt-2 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
    <span className="text-sm leading-none">{emoji}</span>
    {children}
    <Sparkles className="size-3 text-gold-soft" />
  </span>
);

const fieldIcon =
  "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-primary/70";
const fieldInput = cn(
  "h-11 pl-10 transition-shadow",
  "focus-visible:shadow-[0_0_22px_-6px_var(--gold)]",
  // make the native picker indicator visible on the dark theme
  "[&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:invert"
);

/**
 * Birth date + time inputs with instant, client-side reveals — the zodiac
 * animal for the year and the BaZi double-hour for the time — so the reading
 * feels like it's already begun. Native inputs keep it light + mobile-friendly.
 */
export const BirthInputs: React.FC<{
  date: Date | null;
  time: string;
  onDateChange: (d: Date | null) => void;
  onTimeChange: (t: string) => void;
  idPrefix?: string;
}> = ({ date, time, onDateChange, onTimeChange, idPrefix = "birth" }) => {
  const { t } = useTranslation();
  const dateValue = date ? formatDateToYMD(date) : "";
  const yearAnimal = date ? zodiacFromYear(date.getFullYear()) : null;
  const hourAnimal = shichenFromTime(time);

  return (
    <div className="space-y-3 text-left">
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-date`}>{t("soloReading.birthDateLabel")}</Label>
        <div className="relative">
          <CalendarDays className={fieldIcon} />
          <Input
            id={`${idPrefix}-date`}
            type="date"
            value={dateValue}
            max={formatDateToYMD(new Date())}
            onChange={(e) => onDateChange(parseYMDLocal(e.target.value))}
            className={fieldInput}
          />
        </div>
        {yearAnimal && (
          <div>
            <Reveal key={yearAnimal.key} emoji={yearAnimal.emoji}>
              {t("zodiac.yearOfThe", { animal: t(`zodiac.animals.${yearAnimal.key}`) })}
            </Reveal>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-time`}>{t("soloReading.birthTimeLabel")}</Label>
        <div className="relative">
          <Clock className={fieldIcon} />
          <Input
            id={`${idPrefix}-time`}
            type="time"
            value={time}
            onChange={(e) => onTimeChange(e.target.value)}
            className={fieldInput}
          />
        </div>
        {hourAnimal && (
          <div>
            <Reveal key={hourAnimal.key} emoji={hourAnimal.emoji}>
              {t("zodiac.hour", { animal: t(`zodiac.animals.${hourAnimal.key}`) })}
            </Reveal>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">{t("soloReading.birthTimeTip")}</p>
    </div>
  );
};

export default BirthInputs;
