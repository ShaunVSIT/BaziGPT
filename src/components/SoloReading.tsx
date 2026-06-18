import React, { useState, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { track } from "@vercel/analytics/react";
import {
  ChevronDown,
  RefreshCw,
  Share2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BrandMark } from "./brand/Logo";
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
import { cn } from "@/lib/utils";

interface BaziReading {
  reading: string;
  shareableSummary: string;
}

interface SoloReadingProps {
  onModeSwitch: (mode: "solo" | "compatibility") => void;
}

// Helper to extract Four Pillars and Core Self from the reading markdown
function extractShareCardSections(readingMarkdown: string) {
  if (!readingMarkdown) return { fourPillars: "", keyInsights: "", coreSelf: "" };
  const fourPillarsMatch = readingMarkdown.match(/#+\s*Four Pillars[\s\S]*?(?:\n- .+)+/i);
  let fourPillars = fourPillarsMatch ? fourPillarsMatch[0] : "";
  const keyInsightsMatch = readingMarkdown.match(/#+\s*Key Insights[\s\S]*?(?=\n#+\s|$)/i);
  const keyInsights = keyInsightsMatch ? keyInsightsMatch[0] : "";
  const coreSelfMatch = readingMarkdown.match(/#+\s*Core Self[\s\S]*?(?=\n#+\s|$)/i);
  const coreSelf = coreSelfMatch ? coreSelfMatch[0] : "";
  if (!fourPillars) fourPillars = readingMarkdown.split("\n").slice(0, 6).join("\n");
  return { fourPillars, keyInsights: keyInsights || coreSelf, coreSelf };
}

function getFollowupsKey(birthDate: Date | null, birthTime: string) {
  if (!birthDate) return "bazi-solo-followups";
  const dateStr = formatDateToYMD(
    birthDate instanceof Date ? birthDate : new Date(birthDate)
  );
  return `bazi-solo-followups-${dateStr}-${birthTime || "no-time"}`;
}

const SOLO_READING_KEY = "bazi-solo-reading";
const SOLO_FOLLOWUPS_KEY = "bazi-solo-followups";

const SoloReading: React.FC<SoloReadingProps> = ({ onModeSwitch }) => {
  const { t, i18n } = useTranslation();
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [birthTime, setBirthTime] = useState<string>("");
  const [reading, setReading] = useState<BaziReading | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [followUpAnswer, setFollowUpAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMainReadingExpanded, setIsMainReadingExpanded] = useState(true);
  const [cachedAnswers, setCachedAnswers] = useState<Record<string, string>>({});
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  // On mount, restore birthDate/time, then reading and follow-ups
  React.useEffect(() => {
    const storedBirth = sessionStorage.getItem("bazi-solo-birth");
    let parsedDate: Date | null = null;
    let restoredTime = "";
    if (storedBirth) {
      const parsed = JSON.parse(storedBirth);
      parsedDate = parseDateString(parsed.birthDate);
      restoredTime = parsed.birthTime || "";
      setBirthDate(parsedDate);
      setBirthTime(restoredTime);
    }
    const storedReading = sessionStorage.getItem(SOLO_READING_KEY);
    if (storedReading) setReading(JSON.parse(storedReading));
    if (parsedDate) {
      const followupsKey = getFollowupsKey(parsedDate, restoredTime);
      const storedFollowups = sessionStorage.getItem(followupsKey);
      if (storedFollowups) setCachedAnswers(JSON.parse(storedFollowups));
    }
  }, []);

  React.useEffect(() => {
    if (reading) sessionStorage.setItem(SOLO_READING_KEY, JSON.stringify(reading));
  }, [reading]);

  React.useEffect(() => {
    if (birthDate instanceof Date && !isNaN(birthDate.getTime())) {
      const dateStr = formatDateToYMD(birthDate);
      sessionStorage.setItem("bazi-solo-birth", JSON.stringify({ birthDate: dateStr, birthTime }));
    }
  }, [birthDate, birthTime]);

  React.useEffect(() => {
    if (birthDate instanceof Date && !isNaN(birthDate.getTime())) {
      const followupsKey = getFollowupsKey(birthDate, birthTime);
      if (Object.keys(cachedAnswers).length > 0) {
        sessionStorage.setItem(followupsKey, JSON.stringify(cachedAnswers));
      } else {
        sessionStorage.removeItem(followupsKey);
      }
    }
  }, [cachedAnswers, birthDate, birthTime]);

  // Clear reading when language changes (if we have birth data)
  React.useEffect(() => {
    if (reading && birthDate && birthTime !== undefined) {
      setReading(null);
      setCachedAnswers({});
      sessionStorage.removeItem(SOLO_READING_KEY);
      const followupsKey = getFollowupsKey(birthDate, birthTime);
      sessionStorage.removeItem(followupsKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  const handleSubmit = async () => {
    if (!birthDate) {
      setError("Please select a birth date first");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const dateStr = formatDateToYMD(birthDate);
      const response = await fetch("/api/bazi-reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDate: dateStr,
          birthTime: birthTime || undefined,
          language: i18n.language,
        }),
      });
      if (!response.ok) throw new Error("Failed to generate your reading.");
      const baziReading = await response.json();
      setReading(baziReading);
      setCachedAnswers({});
      sessionStorage.setItem("bazi-solo-birth", JSON.stringify({ birthDate: dateStr, birthTime }));
      sessionStorage.removeItem(getFollowupsKey(birthDate, birthTime));
      track("reading_generated", { hasTime: !!birthTime });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while generating your reading.");
      setReading(null);
      track("reading_error", { error: err instanceof Error ? err.message : "Unknown error" });
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionClick = async (question: string) => {
    if (!birthDate) return;
    setSelectedQuestion(question);
    setError(null);
    setIsMainReadingExpanded(false);

    if (cachedAnswers[question]) {
      setFollowUpAnswer(cachedAnswers[question]);
      track("followup_cached", { question });
      return;
    }

    setFollowUpLoading(true);
    try {
      const response = await fetch("/api/bazi-followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthDate, question, language: i18n.language }),
      });
      if (!response.ok) throw new Error("Failed to generate the answer.");
      const data = await response.json();
      setFollowUpAnswer(data.content);
      setCachedAnswers((prev) => ({ ...prev, [question]: data.content }));
      track("followup_generated", { question });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while generating the answer.");
      setFollowUpAnswer(null);
      track("followup_error", { question, error: err instanceof Error ? err.message : "Unknown error" });
    } finally {
      setFollowUpLoading(false);
    }
  };

  const handleRestart = () => {
    track("reading_restart");
    setBirthDate(null);
    setBirthTime("");
    setReading(null);
    setSelectedQuestion(null);
    setFollowUpAnswer(null);
    setError(null);
    setIsMainReadingExpanded(true);
    setCachedAnswers({});
    sessionStorage.removeItem(SOLO_READING_KEY);
    sessionStorage.removeItem("bazi-solo-birth");
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith(SOLO_FOLLOWUPS_KEY)) sessionStorage.removeItem(key);
    });
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
      link.download = "my-bazi-reading.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      track("reading_shared");
    } catch (err) {
      track("share_error", { error: err instanceof Error ? err.message : "Unknown error" });
    }
  };

  const shareableSummary =
    reading?.shareableSummary ||
    "A balanced individual with natural leadership qualities, combining wisdom with adaptability.";

  const followUpQuestions = [
    t("soloReading.followUpCareer"),
    t("soloReading.followUpHealth"),
    t("soloReading.followUpRelationships"),
    t("soloReading.followUpFinances"),
    t("soloReading.followUpEducation"),
    t("soloReading.followUpTravel"),
  ];

  const sections = reading
    ? extractShareCardSections(reading.reading)
    : { fourPillars: "", keyInsights: "", coreSelf: "" };

  return (
    <>
      <Helmet>
        <title>BaziGPT - Your Personal Bazi Reading</title>
        <meta name="description" content="Get your personalized Bazi reading based on your birth date and time. Discover insights about your personality, career, relationships, and life path." />
        <meta property="og:title" content="BaziGPT - Your Personal Bazi Reading" />
        <meta property="og:description" content="Get your personalized Bazi reading based on your birth date and time." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.bazigpt.io" />
        <meta property="og:image" content="https://www.bazigpt.io/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="BaziGPT - Your Personal Bazi Reading" />
        <meta name="twitter:description" content="Get your personalized Bazi reading based on your birth date and time." />
        <meta name="twitter:image" content="https://www.bazigpt.io/og-image.png" />
      </Helmet>

      {loading ? (
        <section className="relative mx-auto flex min-h-[calc(100vh-9rem)] max-w-xl flex-col items-center justify-center py-6 text-center">
          <CosmicLoader label={t("soloReading.loadingReading")} />
        </section>
      ) : !reading ? (
        <section className="relative mx-auto flex min-h-[calc(100vh-9rem)] max-w-xl flex-col items-center justify-center py-6 text-center">
          {/* Glowing, floating brand mark */}
          <div className="animate-rise-blur relative mb-6">
            <div className="animate-glow-pulse absolute left-1/2 top-1/2 size-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/30" />
            <div className="animate-float relative">
              <BrandMark size={72} />
            </div>
          </div>

          <p
            className="animate-rise-blur mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-primary"
            style={{ animationDelay: "0.05s" }}
          >
            AI-Powered BaZi · Four Pillars
          </p>

          <h1
            className="animate-rise-blur font-display text-5xl font-bold leading-[1.05] sm:text-6xl"
            style={{ animationDelay: "0.1s" }}
          >
            <span className="text-gold-shimmer">Unlock Your Destiny</span>
            <span className="mt-1 block text-2xl font-normal text-foreground/70 sm:text-3xl">
              written in the stars
            </span>
          </h1>

          <p
            className="animate-rise-blur mt-5 max-w-md text-base text-muted-foreground sm:text-lg"
            style={{ animationDelay: "0.15s" }}
          >
            {t("soloReading.subtitle")}
          </p>

          {/* The "portal" — input wrapped in atmosphere + rotating gold border */}
          <div
            className="animate-rise-blur relative mt-8 w-full max-w-md"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="animate-glow-pulse absolute -inset-2 rounded-3xl bg-primary/20" />
            <div className="pulse-border relative rounded-2xl border border-primary/25 bg-card/80 p-5 shadow-2xl shadow-primary/10 backdrop-blur-xl">
              <ModeToggle mode="solo" onModeSwitch={onModeSwitch} />
              <BirthInputs
                date={birthDate}
                time={birthTime}
                onDateChange={(d) => {
                  setBirthDate(d);
                  setError(null);
                }}
                onTimeChange={setBirthTime}
              />
              <Button
                onClick={handleSubmit}
                disabled={!birthDate || loading}
                className="hover-shine relative mt-4 w-full gap-2 overflow-hidden py-6 text-base font-semibold"
              >
                {t("soloReading.getReading")}
                <Sparkles className="size-4 animate-pulse" />
              </Button>
              {error && (
                <p className="mt-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {t("soloReading.errorReading")}
                </p>
              )}
            </div>
          </div>

          <p
            className="animate-rise-blur mt-6 text-sm text-muted-foreground"
            style={{ animationDelay: "0.25s" }}
          >
            ✦ Free · No signup · Instant
          </p>
        </section>
      ) : (
        <ReadingShell subtitle={t("soloReading.subtitle")}>
          <ModeToggle mode="solo" onModeSwitch={onModeSwitch} />
          <div className="mt-2">
            {/* Main reading */}
            <Reveal>
              <Card className="mb-5 border-primary/15 bg-card/70 py-0 transition-shadow duration-500 hover:shadow-[0_0_40px_-12px_var(--gold)]">
                <CardContent className="p-4 sm:p-5">
                  <div className="mb-2 flex items-start justify-between">
                    <h2 className="font-display text-2xl font-semibold text-gold-shimmer">
                      {t("soloReading.title")}
                    </h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsMainReadingExpanded((v) => !v)}
                      className="text-primary"
                      aria-label="toggle reading"
                    >
                      <ChevronDown
                        className={cn(
                          "size-5 transition-transform duration-300",
                          isMainReadingExpanded && "rotate-180"
                        )}
                      />
                    </Button>
                  </div>
                  {isMainReadingExpanded && (
                    <div className="animate-expand">
                      <ReadingMarkdown>{reading.reading}</ReadingMarkdown>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Reveal>

            <p className="mb-4 text-center text-sm text-muted-foreground">
              Birth: {birthDate ? new Date(birthDate).toLocaleDateString() : ""}
              {birthTime && ` at ${birthTime}`}
            </p>

            {/* Follow-up questions */}
            <Reveal delay={80}>
              <Card className="mb-5 border-border/60 bg-card/70 py-0">
                <CardContent className="p-4 sm:p-5">
                  <h3 className="font-display text-xl font-semibold text-primary">
                    {t("soloReading.followUpTitle")}
                  </h3>
                  <p className="mt-1 mb-4 text-sm text-muted-foreground">
                    {t("soloReading.followUpSubtitle")}
                  </p>
                  <div className="mb-2 flex flex-wrap gap-2">
                    {followUpQuestions.map((question, i) => (
                      <Button
                        key={question}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuestionClick(question)}
                        disabled={followUpLoading}
                        style={{ animationDelay: `${i * 60}ms` }}
                        className={cn(
                          "hover-shine relative gap-1.5 overflow-hidden transition-transform hover:-translate-y-0.5",
                          selectedQuestion === question &&
                            "border-primary text-primary"
                        )}
                      >
                        {question}
                        {cachedAnswers[question] && (
                          <CheckCircle2 className="size-3.5 text-secondary" />
                        )}
                      </Button>
                    ))}
                  </div>

                  {followUpLoading && <CosmicLoader />}

                  {followUpAnswer && !followUpLoading && (
                    <div className="animate-rise-blur mt-3 rounded-xl border border-primary/15 bg-primary/[0.05] p-4">
                      <h4 className="mb-2 font-display text-lg font-semibold text-gold-shimmer">
                        {selectedQuestion}
                      </h4>
                      <ReadingMarkdown>{followUpAnswer}</ReadingMarkdown>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Reveal>

            <Reveal delay={120} className="flex justify-center">
              <Button
                onClick={() => setShareDialogOpen(true)}
                className="hover-shine relative gap-2 overflow-hidden px-6 py-5 text-base font-semibold transition-transform hover:-translate-y-0.5"
              >
                <Share2 className="size-5" />
                {t("soloReading.shareReading")}
              </Button>
            </Reveal>

            <div className="mt-5 text-center">
              <Button variant="outline" onClick={handleRestart} className="group gap-2">
                <RefreshCw className="size-4 transition-transform duration-500 group-hover:rotate-180" />
                Start Over
              </Button>
            </div>
          </div>
        </ReadingShell>
      )}

      {/* Share dialog */}
      <ShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        title={t("soloReading.shareReading")}
        downloadLabel={t("soloReading.downloadImage")}
        onDownload={handleShare}
      >
        <div ref={shareCardRef}>
          <ShareCardBase title={t("soloReading.title")} qrValue={window.location.href}>
            {sections.fourPillars && <ShareMarkdown>{sections.fourPillars}</ShareMarkdown>}
            {sections.keyInsights && <ShareMarkdown>{sections.keyInsights}</ShareMarkdown>}
            <p style={{ color: "#c9a227", fontWeight: 600, lineHeight: 1.6, textAlign: "left", marginTop: 8 }}>
              {shareableSummary}
            </p>
          </ShareCardBase>
        </div>
      </ShareDialog>

      {reading && <ShareFab onClick={() => setShareDialogOpen(true)} />}
    </>
  );
};

export default SoloReading;
