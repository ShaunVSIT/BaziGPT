import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { FamousPerson } from "@/types/famous";
import { Badge } from "@/components/ui/badge";
import { zodiacFromYear } from "@/lib/zodiac";

const fallbackImg = "/default-portrait.png";

const FamousPersonCard: React.FC<{ person: FamousPerson }> = ({ person }) => {
  const { t } = useTranslation();
  const year = person.birth_date ? new Date(person.birth_date).getFullYear() : NaN;
  const animal = !Number.isNaN(year) ? zodiacFromYear(year) : null;

  return (
    <Link
      to={`/famous/${person.slug}`}
      className="group relative flex h-80 flex-col justify-end overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10"
    >
      {/* Photo */}
      <img
        src={person.image_url || fallbackImg}
        alt={person.name}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
        onError={(e) => {
          (e.target as HTMLImageElement).src = fallbackImg;
        }}
      />

      {/* Scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/70 to-transparent" />

      {/* Category + zodiac chips */}
      <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
        {person.category && (
          <Badge className="bg-primary/90 text-primary-foreground capitalize backdrop-blur-sm">
            {person.category}
          </Badge>
        )}
        {animal && (
          <Badge
            variant="outline"
            className="border-primary/40 bg-background/40 text-foreground backdrop-blur-sm"
          >
            {animal.emoji} {animal.en}
          </Badge>
        )}
      </div>

      {/* Name + CTA */}
      <div className="relative z-10 p-4">
        <h3 className="font-display text-2xl font-bold leading-tight text-foreground drop-shadow">
          {person.name}
        </h3>
        {person.bio && (
          <p className="mt-1 line-clamp-2 text-sm text-foreground/70">{person.bio}</p>
        )}
        <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary transition-transform group-hover:translate-x-1">
          {t("famous.viewChart")}
          <ArrowRight className="size-4" />
        </span>
      </div>
    </Link>
  );
};

export default FamousPersonCard;
