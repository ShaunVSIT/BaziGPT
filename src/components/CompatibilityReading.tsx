import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { track } from "@vercel/analytics/react";
import { RefreshCw, Share2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHero } from "./brand/PageHero";
import { CosmicLoader } from "./brand/CosmicLoader";
import { Reveal } from "./brand/Reveal";
import { ReadingShell } from "./reading/ReadingShell";
import { ModeToggle } from "./reading/ModeToggle";
import { BirthInputs } from "./reading/BirthInputs";
import { ReadingMarkdown } from "./reading/ReadingMarkdown";
import { ShareMarkdown } from "./reading/ShareMarkdown";
import { ShareDialog } from "./reading/ShareDialog";
import { ShareFab } from "./reading/ShareFab";
import ShareCardBase from "./ShareCardBase";
import { formatDateToYMD, parseDateString } from "@/lib/date";

interface CompatibilityReadingData {
  reading: string;
  shareableSummary: string;
}

interface CompatibilityReadingProps {
  onModeSwitch: (mode: "solo" | "compatibility") => void;
}

function extractCompatShareSections(readingMarkdown: string, shareableSummary?: string) {
  if (!readingMarkdown) return { elemental: "", keyInsights: "", summary: shareableSummary || "" };
  const elementalMatch = readingMarkdown.match(/\*\*Elemental Compatibility\*\*:[\s\S]*?(?=\n\*\*|$)/i);
  const keyInsightsMatch = readingMarkdown.match(/\*\*Key Insights\*\*:[\s\S]*?(?=\n\*\*|$)/i);
  const summaryMatch = readingMarkdown.match(/\*\*Shareable Summary\*\*:[\s\S]*?(?=\n\*\*|$)/i);
  return {
    elemental: elementalMatch ? elementalMatch[0] : "",
    keyInsights: keyInsightsMatch ? keyInsightsMatch[0] : "",
    summary: summaryMatch
      ? summaryMatch[0].replace(/\*\*Shareable Summary\*\*:/i, "").trim()
      : shareableSummary || "",
  };
}

function cleanBullets(markdown: string) {
  return markdown.replace(/^(\s*•\s*)/gm, "");
}

const COMPAT_READING_KEY = "bazi-compat-reading";
const COMPAT_BIRTH_KEY = "bazi-compat-birth";

// Restore from sessionStorage synchronously (or auto-fill person1 from Solo) so
// the first paint already shows the correct view and we avoid a mount-time
// layout shift / CLS for returning visitors.
interface InitialCompatState {
  person1BirthDate: Date | null;
  person1BirthTime: string;
  person2BirthDate: Date | null;
  person2BirthTime: string;
  reading: CompatibilityReadingData | null;
}

function readInitialCompatState(): InitialCompatState {
  const empty: InitialCompatState = {
    person1BirthDate: null,
    person1BirthTime: "",
    person2BirthDate: null,
    person2BirthTime: "",
    reading: null,
  };
  try {
    const state = { ...empty };
    const storedBirth = sessionStorage.getItem(COMPAT_BIRTH_KEY);
    if (storedBirth) {
      const { person1BirthDate: p1d, person1BirthTime: p1t, person2BirthDate: p2d, person2BirthTime: p2t } = JSON.parse(storedBirth);
      if (p1d) state.person1BirthDate = parseDateString(p1d);
      if (p1t) state.person1BirthTime = p1t;
      if (p2d) state.person2BirthDate = parseDateString(p2d);
      if (p2t) state.person2BirthTime = p2t;
    } else {
      const soloBirth = sessionStorage.getItem("bazi-solo-birth");
      if (soloBirth) {
        const { birthDate, birthTime } = JSON.parse(soloBirth);
        if (birthDate) state.person1BirthDate = parseDateString(birthDate);
        if (birthTime) state.person1BirthTime = birthTime;
      }
    }
    const storedReading = sessionStorage.getItem(COMPAT_READING_KEY);
    if (storedReading) state.reading = JSON.parse(storedReading);
    return state;
  } catch {
    return empty;
  }
}

const CompatibilityReading: React.FC<CompatibilityReadingProps> = ({ onModeSwitch }) => {
  const { t, i18n } = useTranslation();
  const [initialState] = useState(readInitialCompatState);
  const [person1BirthDate, setPerson1BirthDate] = useState<Date | null>(initialState.person1BirthDate);
  const [person1BirthTime, setPerson1BirthTime] = useState<string>(initialState.person1BirthTime);
  const [person2BirthDate, setPerson2BirthDate] = useState<Date | null>(initialState.person2BirthDate);
  const [person2BirthTime, setPerson2BirthTime] = useState<string>(initialState.person2BirthTime);
  const [compatibilityReading, setCompatibilityReading] = useState<CompatibilityReadingData | null>(initialState.reading);
  const [compatibilityLoading, setCompatibilityLoading] = useState(false);
  const [compatibilityError, setCompatibilityError] = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  // While the compatibility reading generates, the loader takes over the whole
  // viewport — snap to the top so the celestial loader is what the user sees.
  React.useEffect(() => {
    if (compatibilityLoading) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [compatibilityLoading]);

  React.useEffect(() => {
    if (compatibilityReading) {
      sessionStorage.setItem(COMPAT_READING_KEY, JSON.stringify(compatibilityReading));
    }
  }, [compatibilityReading]);

  React.useEffect(() => {
    sessionStorage.setItem(
      COMPAT_BIRTH_KEY,
      JSON.stringify({
        person1BirthDate: person1BirthDate ? formatDateToYMD(person1BirthDate) : null,
        person1BirthTime,
        person2BirthDate: person2BirthDate ? formatDateToYMD(person2BirthDate) : null,
        person2BirthTime,
      })
    );
  }, [person1BirthDate, person1BirthTime, person2BirthDate, person2BirthTime]);

  const handleSubmit = async () => {
    if (!person1BirthDate || !person2BirthDate) {
      setCompatibilityError("Please select birth dates for both people");
      return;
    }
    setCompatibilityLoading(true);
    setCompatibilityError(null);
    try {
      const response = await fetch("/api/bazi-compatibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          person1BirthDate: formatDateToYMD(person1BirthDate),
          person1BirthTime: person1BirthTime || undefined,
          person2BirthDate: formatDateToYMD(person2BirthDate),
          person2BirthTime: person2BirthTime || undefined,
          language: i18n.language,
        }),
      });
      if (!response.ok) throw new Error("Failed to generate the compatibility reading.");
      const data = await response.json();
      setCompatibilityReading(data);
      track("compatibility_generated", {
        hasPerson1Time: !!person1BirthTime,
        hasPerson2Time: !!person2BirthTime,
      });
    } catch (err) {
      setCompatibilityError(err instanceof Error ? err.message : "An error occurred while generating the compatibility reading.");
      setCompatibilityReading(null);
      track("compatibility_error", { error: err instanceof Error ? err.message : "Unknown error" });
    } finally {
      setCompatibilityLoading(false);
    }
  };

  const handleRestart = () => {
    track("compatibility_restart");
    setPerson1BirthDate(null);
    setPerson1BirthTime("");
    setPerson2BirthDate(null);
    setPerson2BirthTime("");
    setCompatibilityReading(null);
    setCompatibilityError(null);
    sessionStorage.removeItem(COMPAT_READING_KEY);
    sessionStorage.removeItem(COMPAT_BIRTH_KEY);
  };

  const handleShare = async () => {
    if (!shareCardRef.current) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(shareCardRef.current, {
        backgroundColor: "#0b0b0f",
        scale: 2,
      });
      const link = document.createElement("a");
      link.download = "our-compatibility-reading.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      track("compatibility_shared");
    } catch (err) {
      track("compatibility_share_error", { error: err instanceof Error ? err.message : "Unknown error" });
    }
  };

  const sections = compatibilityReading
    ? extractCompatShareSections(compatibilityReading.reading, compatibilityReading.shareableSummary)
    : { elemental: "", keyInsights: "", summary: "" };
  let fallbackText = "";
  if (!sections.elemental && !sections.keyInsights && !sections.summary && compatibilityReading) {
    fallbackText = compatibilityReading.reading.split("\n").filter((l) => l.trim() !== "").slice(0, 5).join("\n");
  }

  return (
    <>
      {compatibilityLoading ? (
        <section className="relative mx-auto flex min-h-[calc(100vh-9rem)] max-w-xl flex-col items-center justify-center py-6 text-center">
          <CosmicLoader label={t("compatibility.loadingCompatibility")} />
        </section>
      ) : !compatibilityReading ? (
        <PageHero
          size="full"
          eyebrow={t("hero.compatEyebrow")}
          title={t("hero.compatTitle")}
          titleSub={t("hero.compatTitleSub")}
          subtitle={t("compatibility.subtitle")}
        >
          <div className="relative mx-auto mt-8 w-full max-w-2xl">
            <div className="animate-glow-pulse absolute -inset-2 rounded-3xl bg-primary/20" />
            <div className="pulse-border relative rounded-2xl border border-primary/25 bg-card/80 p-5 shadow-2xl shadow-primary/10 backdrop-blur-xl">
              <ModeToggle mode="compatibility" onModeSwitch={onModeSwitch} />
              <div className="grid w-full gap-5 text-left md:grid-cols-2">
                <div>
                  <h3 className="mb-2 font-display text-xl font-semibold text-primary">
                    {t("compatibility.person1")}
                  </h3>
                  <BirthInputs
                    idPrefix="p1"
                    date={person1BirthDate}
                    time={person1BirthTime}
                    onDateChange={(d) => {
                      setPerson1BirthDate(d);
                      setCompatibilityError(null);
                    }}
                    onTimeChange={setPerson1BirthTime}
                  />
                </div>
                <div>
                  <h3 className="mb-2 font-display text-xl font-semibold text-primary">
                    {t("compatibility.person2")}
                  </h3>
                  <BirthInputs
                    idPrefix="p2"
                    date={person2BirthDate}
                    time={person2BirthTime}
                    onDateChange={(d) => {
                      setPerson2BirthDate(d);
                      setCompatibilityError(null);
                    }}
                    onTimeChange={setPerson2BirthTime}
                  />
                </div>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={!person1BirthDate || !person2BirthDate || compatibilityLoading}
                className="hover-shine relative mt-4 w-full gap-2 overflow-hidden py-6 text-base font-semibold"
              >
                {t("compatibility.getCompatibility")}
                <Heart className="size-4 animate-pulse fill-current" />
              </Button>
              {compatibilityError && (
                <p className="mt-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {t("compatibility.errorCompatibility")}
                </p>
              )}
            </div>
          </div>
        </PageHero>
      ) : (
        <ReadingShell subtitle={t("compatibility.subtitle")}>
          <ModeToggle mode="compatibility" onModeSwitch={onModeSwitch} />
          <div className="mt-2">
            <Reveal>
              <Card className="mb-5 border-primary/15 bg-card/70 py-0 transition-shadow duration-500 hover:shadow-[0_0_40px_-12px_var(--gold)]">
                <CardContent className="p-4 sm:p-5">
                  <h2 className="mb-2 font-display text-2xl font-semibold text-gold-shimmer">
                    {t("compatibility.title")}
                  </h2>
                  <ReadingMarkdown>{compatibilityReading.reading}</ReadingMarkdown>
                </CardContent>
              </Card>
            </Reveal>

            <div className="flex justify-center">
              <Button
                onClick={() => setShareDialogOpen(true)}
                className="hover-shine relative gap-2 overflow-hidden px-6 py-5 text-base font-semibold transition-transform hover:-translate-y-0.5"
              >
                <Share2 className="size-5" />
                Share Our Reading
              </Button>
            </div>

            <div className="mt-5 text-center">
              <Button variant="outline" onClick={handleRestart} className="gap-2">
                <RefreshCw className="size-4" />
                Start Over
              </Button>
            </div>
          </div>
        </ReadingShell>
      )}

      <ShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        title="Share Your Compatibility Reading"
        description="Share your compatibility reading with friends and family"
        downloadLabel="Download Image"
        onDownload={handleShare}
      >
        <div ref={shareCardRef}>
          <ShareCardBase title="Our Compatibility Reading" qrValue={window.location.href}>
            {sections.elemental && <ShareMarkdown>{cleanBullets(sections.elemental)}</ShareMarkdown>}
            {sections.keyInsights && <ShareMarkdown>{cleanBullets(sections.keyInsights)}</ShareMarkdown>}
            {!sections.elemental && !sections.keyInsights && sections.summary && (
              <p style={{ color: "#f4f1ea", fontWeight: 500, fontSize: 16 }}>{sections.summary}</p>
            )}
            {!sections.elemental && !sections.keyInsights && !sections.summary && fallbackText && (
              <ShareMarkdown>{fallbackText}</ShareMarkdown>
            )}
          </ShareCardBase>
        </div>
      </ShareDialog>

      {compatibilityReading && <ShareFab onClick={() => setShareDialogOpen(true)} />}
    </>
  );
};

export default CompatibilityReading;
