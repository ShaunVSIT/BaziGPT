import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Loader2, Globe, Sparkles } from "lucide-react";
import { FamousPerson } from "@/types/famous";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { zodiacFromYear } from "@/lib/zodiac";

const fallbackImg = "/default-portrait.png";

function formatBirthday(dateStr?: string, timeStr?: string, atLabel = "at") {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  let formatted = date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  if (timeStr) formatted += ` ${atLabel} ${timeStr}`;
  return formatted;
}

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zm0 3.68a6.16 6.16 0 100 12.32 6.16 6.16 0 000-12.32zm0 10.16a4 4 0 110-8 4 4 0 010 8zm6.4-10.4a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z" />
  </svg>
);
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64c.3 0 .59.05.86.13V9.4a6.33 6.33 0 00-1-.08A6.34 6.34 0 005 20.1a6.34 6.34 0 0010.86-4.43V8.69a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.04-.12z" />
  </svg>
);

interface SocialLink {
  href: string;
  label: string;
  icon: React.FC<{ className?: string }>;
}

const FamousPersonPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [person, setPerson] = useState<FamousPerson | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/famous/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((data) => {
        if (!data || !data.name) setNotFound(true);
        else setPerson(data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 to-secondary/5 p-10 text-center">
          <Loader2 className="mb-4 size-12 animate-spin text-primary" />
          <p className="font-display text-lg font-semibold text-primary">
            {t("famousPerson.loadingTitle")}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("famousPerson.loadingSubtitle")}
          </p>
        </div>
      </div>
    );
  }

  if (notFound || !person) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <p className="font-display text-2xl text-foreground">{t("famousPerson.notFound")}</p>
        <Button variant="outline" onClick={() => navigate("/famous")} className="gap-2">
          <ArrowLeft className="size-4" />
          {t("famousPerson.backToFamous")}
        </Button>
      </div>
    );
  }

  const img = imgError ? fallbackImg : person.image_url || fallbackImg;
  const year = person.birth_date ? new Date(person.birth_date).getFullYear() : NaN;
  const animal = !Number.isNaN(year) ? zodiacFromYear(year) : null;
  const readingText = person.reading || person.bazi_reading || person.gpt_summary;

  const socials: SocialLink[] = [];
  if (person.twitter_handle)
    socials.push({ href: `https://x.com/${person.twitter_handle.replace(/^@/, "")}`, label: "X", icon: XIcon });
  if (person.instagram_handle)
    socials.push({ href: `https://instagram.com/${person.instagram_handle.replace(/^@/, "")}`, label: "Instagram", icon: InstagramIcon });
  if (person.tiktok_handle)
    socials.push({ href: `https://tiktok.com/@${person.tiktok_handle.replace(/^@/, "")}`, label: "TikTok", icon: TikTokIcon });
  if (person.website)
    socials.push({ href: person.website, label: "Website", icon: Globe });

  return (
    <>
      <Helmet>
        <title>{`Bazi Chart of ${person.name} - BaziGPT`}</title>
        <meta name="description" content={person.bio ? person.bio.slice(0, 160) : "Explore the BaZi chart and Chinese astrology reading for this famous person on BaziGPT."} />
        <meta property="og:title" content={`Bazi Chart of ${person.name} - BaziGPT`} />
        <meta property="og:description" content={person.bio ? person.bio.slice(0, 160) : "Explore the BaZi chart and Chinese astrology reading for this famous person on BaziGPT."} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={`https://www.bazigpt.io/famous/${person.slug || ""}`} />
        <meta property="og:image" content={person.image_url || "https://www.bazigpt.io/default-portrait.png"} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Bazi Chart of ${person.name} - BaziGPT`} />
        <meta name="twitter:image" content={person.image_url || "https://www.bazigpt.io/default-portrait.png"} />
        <link rel="canonical" href={`https://www.bazigpt.io/famous/${person.slug || ""}`} />
      </Helmet>

      <div className="mx-auto max-w-3xl">
        {/* Photo-driven hero — full-bleed to the top edge on mobile, a
            contained rounded card from sm up. */}
        <section className="relative -mx-4 -mt-6 overflow-hidden sm:mx-0 sm:mt-0 sm:rounded-3xl sm:border sm:border-border/60">
          {/* Their photo IS the hero — bleeds edge to edge and up to the top.
              A blurred copy sits behind to fill any letterboxing on wider
              viewports where the portrait can't cover the full width. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 scale-125 bg-cover bg-center opacity-50 blur-2xl"
            style={{ backgroundImage: `url(${img})` }}
          />
          <img
            src={img}
            alt={person.name}
            onError={() => setImgError(true)}
            className="absolute inset-0 size-full object-cover object-top sm:object-contain"
          />
          {/* Scrim: keep the face bright up top, darken toward the bottom so
              the text is legible and the photo melts into the page. */}
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian from-30% via-obsidian/60 via-65% to-transparent" />

          {/* Floating back button over the photo */}
          <button
            onClick={() => navigate("/famous")}
            aria-label={t("famousPerson.backToFamous")}
            className="absolute left-4 top-4 z-10 flex size-9 items-center justify-center rounded-full border border-border/60 bg-background/40 text-muted-foreground backdrop-blur-sm transition-colors hover:border-primary/50 hover:text-foreground sm:left-5 sm:top-5"
          >
            <ArrowLeft className="size-4" />
          </button>

          {/* Content pinned to the bottom of the photo. min-h sets the hero
              height; pt clears the sticky header for tall portraits. */}
          <div className="relative flex min-h-[68vh] flex-col items-center justify-end px-6 pb-8 pt-24 text-center sm:min-h-[30rem]">
            <h1
              className="animate-rise font-display text-4xl font-bold leading-tight sm:text-5xl"
              style={{ animationDelay: "0.05s" }}
            >
              <span className="text-gold-gradient">{person.name}</span>
            </h1>

            <div
              className="animate-rise mt-3 flex flex-wrap items-center justify-center gap-2"
              style={{ animationDelay: "0.1s" }}
            >
              {person.category && (
                <Badge className="bg-primary/90 capitalize text-primary-foreground">
                  {person.category}
                </Badge>
              )}
              {animal && (
                <Badge variant="outline" className="border-primary/40 text-primary">
                  {animal.emoji} {t("zodiac.yearOfThe", { animal: t(`zodiac.animals.${animal.key}`) })}
                </Badge>
              )}
            </div>

            {person.birth_date && (
              <p
                className="animate-rise mt-3 text-sm text-muted-foreground"
                style={{ animationDelay: "0.15s" }}
              >
                <span className="font-semibold text-foreground/80">{t("famousPerson.born")}</span>{" "}
                {formatBirthday(person.birth_date, person.birth_time, t("famousPerson.at"))}
              </p>
            )}

            {socials.length > 0 && (
              <div
                className="animate-rise mt-4 flex gap-2"
                style={{ animationDelay: "0.2s" }}
              >
                {socials.map(({ href, label, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex size-10 items-center justify-center rounded-full border border-primary/20 bg-background/40 text-muted-foreground backdrop-blur-sm transition-colors hover:border-primary/50 hover:text-primary"
                  >
                    <Icon className="size-4" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>

        {person.bio && (
          <p className="mt-6 text-center text-base leading-relaxed text-muted-foreground">
            {person.bio}
          </p>
        )}

        {/* Reading */}
        {readingText && (
          <Card className="mt-6 border-border/60 bg-card/70">
            <CardContent className="p-6 sm:p-8">
              <h2 className="mb-3 flex items-center gap-2 font-display text-2xl font-semibold text-primary">
                <Sparkles className="size-5" />
                {t("famousPerson.baziReading")}
              </h2>
              <div className="space-y-3 leading-relaxed text-foreground/90">
                {String(readingText)
                  .split(/\n\s*\n|(?<=\.)\s+(?=[A-Z])/g)
                  .map((para, idx) => (
                    <p key={idx}>{para.trim()}</p>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-6 flex flex-col items-center gap-3">
          {person.marketing_blurb && (
            <Button asChild variant="outline" className="w-full max-w-sm gap-2 font-semibold">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `${person.marketing_blurb}\n\nReading by @bazigpt\nbazigpt.io`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <XIcon className="size-4" />
                {t("famousPerson.tweetReading")}
              </a>
            </Button>
          )}
          <Button asChild className="w-full max-w-sm gap-2 font-semibold">
            <a href="/">
              <Sparkles className="size-4" />
              {t("famousPerson.getYourReading")}
            </a>
          </Button>
        </div>
      </div>
    </>
  );
};

export default FamousPersonPage;
