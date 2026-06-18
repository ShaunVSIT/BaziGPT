import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { ChevronDown, ChevronUp, Share2, Loader2 } from "lucide-react";
import {
  fetchDailyForecast,
  fetchPersonalForecast,
  type DailyBaziForecast,
  type PersonalForecastResponse,
} from "../services/dailyBaziApi";
import SEOAnalytics from "./SEOAnalytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PageHero } from "./brand/PageHero";
import { ReadingMarkdown } from "./reading/ReadingMarkdown";
import { ShareMarkdown } from "./reading/ShareMarkdown";
import { ShareDialog } from "./reading/ShareDialog";
import ShareCardBase from "./ShareCardBase";

function formatPersonalForecast(text: string) {
  return text.replace(/\s*•\s*/g, "\n• ");
}

const PERSONAL_FORECAST_KEY = "bazi-personal-forecast-session";

function Daily() {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [forecast, setForecast] = useState<DailyBaziForecast | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);

  const [showPersonalForecast, setShowPersonalForecast] = useState(false);
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [personalForecast, setPersonalForecast] = useState<PersonalForecastResponse | null>(() => {
    const today = new Date().toISOString().split("T")[0];
    const sessionSaved = sessionStorage.getItem(PERSONAL_FORECAST_KEY);
    if (sessionSaved) {
      try {
        const parsed = JSON.parse(sessionSaved);
        if (parsed.date === today) return parsed;
      } catch {}
    }
    const localSaved = localStorage.getItem("bazi-personal-forecast");
    if (localSaved) {
      try {
        const parsed = JSON.parse(localSaved);
        if (parsed.date === today) return parsed;
      } catch {}
    }
    return null;
  });
  const [personalLoading, setPersonalLoading] = useState(false);
  const [personalError, setPersonalError] = useState<string | null>(null);

  const today = new Date();
  const formattedDate = format(today, "MMMM d, yyyy");

  const fetchDailyForecastData = async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDailyForecast(i18n.language);
      setForecast(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while fetching the daily forecast.");
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    fetchDailyForecastData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  useEffect(() => {
    if (personalForecast && birthDate) {
      setPersonalForecast(null);
      sessionStorage.removeItem(PERSONAL_FORECAST_KEY);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  useEffect(() => {
    if (birthDate) localStorage.setItem("bazi-birth-date", birthDate);
  }, [birthDate]);

  useEffect(() => {
    if (birthTime) localStorage.setItem("bazi-birth-time", birthTime);
    else localStorage.removeItem("bazi-birth-time");
  }, [birthTime]);

  useEffect(() => {
    if (personalForecast) {
      const withDate = { ...personalForecast, date: new Date().toISOString().split("T")[0] };
      sessionStorage.setItem(PERSONAL_FORECAST_KEY, JSON.stringify(withDate));
      localStorage.setItem("bazi-personal-forecast", JSON.stringify(withDate));
    } else {
      sessionStorage.removeItem(PERSONAL_FORECAST_KEY);
    }
  }, [personalForecast]);

  useEffect(() => {
    if (personalForecast && birthDate) setShowPersonalForecast(true);
  }, [personalForecast, birthDate]);

  useEffect(() => {
    let filled = false;
    const soloBirth = sessionStorage.getItem("bazi-solo-birth");
    if (soloBirth) {
      const { birthDate: soloDate, birthTime: soloTime } = JSON.parse(soloBirth);
      if (soloDate) {
        setBirthDate(soloDate.split("T")[0]);
        filled = true;
      }
      if (soloTime) setBirthTime(soloTime);
    }
    if (!filled) {
      const localDate = localStorage.getItem("bazi-birth-date");
      if (localDate) setBirthDate(localDate);
      const localTime = localStorage.getItem("bazi-birth-time");
      if (localTime) setBirthTime(localTime);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleShareDownload = async () => {
    if (!shareCardRef.current) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(shareCardRef.current, {
        backgroundColor: "#0b0b0f",
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = `daily-bazi-forecast-${formattedDate}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (err) {
      console.error("Error generating share image:", err);
    }
  };

  const handlePersonalForecastSubmit = async () => {
    if (!birthDate) {
      setPersonalError(t("daily.pleaseEnterBirthDate"));
      return;
    }
    setPersonalLoading(true);
    setPersonalError(null);
    try {
      const data = await fetchPersonalForecast(birthDate, birthTime || undefined, i18n.language);
      setPersonalForecast(data);
    } catch (err) {
      setPersonalError(err instanceof Error ? err.message : t("daily.errorFetchingPersonalForecast"));
    } finally {
      setPersonalLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t("seo.daily.title")} - {formattedDate} | BaziGPT</title>
        <meta name="description" content={t("seo.daily.description")} />
        <meta name="keywords" content={t("seo.daily.keywords")} />
        <meta property="og:title" content={`${t("seo.daily.title")} - ${formattedDate} | BaziGPT`} />
        <meta property="og:description" content={t("seo.daily.description")} />
        <meta property="og:url" content="https://www.bazigpt.io/daily" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://www.bazigpt.io/og-image.png" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content={`${t("seo.daily.title")} - ${formattedDate} | BaziGPT`} />
        <meta property="twitter:description" content={t("seo.daily.description")} />
        <meta property="twitter:image" content="https://www.bazigpt.io/og-image.png" />
        <link rel="canonical" href="https://www.bazigpt.io/daily" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: t("seo.daily.title"),
            description: t("seo.daily.description"),
            url: "https://www.bazigpt.io/daily",
            datePublished: formattedDate,
            dateModified: formattedDate,
            publisher: { "@type": "Organization", name: "BaziGPT" },
          })}
        </script>
      </Helmet>

      <SEOAnalytics
        pageTitle={`${t("seo.daily.title")} - ${formattedDate} | BaziGPT`}
        pageDescription={t("seo.daily.description")}
        keywords={t("seo.daily.keywords").split(", ")}
      />

      <div className="mx-auto max-w-2xl">
        <PageHero
          size="compact"
          eyebrow="Today's Cosmic Energy"
          title={t("daily.title")}
          subtitle={formattedDate}
        />

        <div className="rounded-2xl border border-primary/20 bg-primary/[0.07] p-5 sm:p-7">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="size-12 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div>
              <h2 className="font-display text-xl font-semibold text-destructive">
                {t("daily.errorLoadingForecast")}
              </h2>
              <p className="mt-1 text-destructive">{error}</p>
            </div>
          ) : forecast ? (
            <>
              <h2 className="mb-3 text-base font-semibold text-primary sm:text-lg">
                {t("daily.todaysEnergy")}
              </h2>
              <Badge
                variant="outline"
                className="mb-3 border-primary text-primary"
              >
                {forecast.baziPillar}
              </Badge>

              <ReadingMarkdown className="mb-3 text-sm sm:text-base">
                {forecast.forecast}
              </ReadingMarkdown>

              {/* Personal forecast */}
              <div className="mt-4 border-t border-primary/20 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowPersonalForecast((v) => !v)}
                  className="w-full justify-between border-primary py-5 text-primary hover:bg-primary/10 hover:text-primary"
                >
                  {t("daily.howDoesTodayAffectMe")}
                  {showPersonalForecast ? (
                    <ChevronUp className="size-5" />
                  ) : (
                    <ChevronDown className="size-5" />
                  )}
                </Button>

                {showPersonalForecast && (
                  <div className="mt-3">
                    {!personalForecast ? (
                      <>
                        <p className="mb-3 text-sm text-muted-foreground">
                          {t("daily.enterBirthDetails")}
                          {birthDate && (
                            <span className="font-medium text-primary">
                              {" "}
                              {t("daily.yourDetailsSaved")}
                            </span>
                          )}
                        </p>
                        <div className="mb-3 flex flex-col gap-3 sm:flex-row">
                          <div className="flex-1 space-y-1.5">
                            <Label htmlFor="daily-date">{t("daily.birthDateLabel")}</Label>
                            <Input
                              id="daily-date"
                              type="date"
                              value={birthDate}
                              max={new Date().toISOString().split("T")[0]}
                              onChange={(e) => setBirthDate(e.target.value)}
                            />
                          </div>
                          <div className="flex-1 space-y-1.5">
                            <Label htmlFor="daily-time">{t("daily.birthTimeLabel")}</Label>
                            <Input
                              id="daily-time"
                              type="time"
                              value={birthTime}
                              onChange={(e) => setBirthTime(e.target.value)}
                            />
                          </div>
                        </div>
                        {personalError && (
                          <p className="mb-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            {personalError}
                          </p>
                        )}
                        <Button
                          onClick={handlePersonalForecastSubmit}
                          disabled={personalLoading}
                          className="w-full py-5 font-semibold"
                        >
                          {personalLoading && <Loader2 className="mr-1 size-4 animate-spin" />}
                          {t("daily.getPersonalDailyForecast")}
                        </Button>
                      </>
                    ) : (
                      <div className="rounded-xl border border-primary/20 bg-primary/[0.05] p-4">
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-display text-lg font-semibold text-primary">
                              {t("daily.yourPersonalForecast")}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Birth: {new Date(birthDate).toLocaleDateString()}
                              {birthTime && ` at ${birthTime}`}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setPersonalForecast(null);
                              setPersonalError(null);
                            }}
                          >
                            {t("daily.newReading")}
                          </Button>
                        </div>
                        <Badge variant="outline" className="mb-2 border-primary text-primary">
                          {personalForecast.todayPillar}
                        </Badge>
                        <p className="whitespace-pre-line leading-relaxed text-foreground/90">
                          {personalForecast.personalForecast}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {personalForecast && (
                <div className="mt-5 flex justify-center">
                  <Button
                    onClick={() => setShareDialogOpen(true)}
                    className="gap-2 px-6 py-5 text-base font-semibold"
                  >
                    <Share2 className="size-5" />
                    {t("daily.sharePersonalForecast")}
                  </Button>
                </div>
              )}

              {/* Full reading CTA */}
              <div className="mt-5 flex flex-col items-center gap-2 border-t border-primary/20 pt-5 text-center">
                <p className="font-medium text-muted-foreground sm:text-lg">
                  {t("daily.wantCompleteBaziAnalysis")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("daily.getFullBaziReading")}
                </p>
                <Button asChild className="mt-1 min-w-50 py-5 text-base font-semibold">
                  <a href="/">{t("daily.getFullBaziReadingButton")}</a>
                </Button>
              </div>
            </>
          ) : (
            <div>
              <h2 className="font-display text-xl font-semibold text-primary">
                {t("daily.dailyForecastComingSoon")}
              </h2>
              <p className="mt-1">{t("daily.dailyForecastSetup")}</p>
            </div>
          )}
        </div>
      </div>

      {personalForecast && (
        <ShareDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          title={t("daily.sharePersonalForecastTitle")}
          downloadLabel={t("daily.saveForecast")}
          onDownload={handleShareDownload}
        >
          <div ref={shareCardRef}>
            <ShareCardBase title={t("daily.myPersonalDailyForecast")} qrValue={window.location.href}>
              <p style={{ color: "#c9a227", fontWeight: 700, fontSize: 18, marginBottom: 12 }}>
                {formattedDate}
              </p>
              {personalForecast.todayPillar && (
                <div
                  style={{
                    display: "inline-block",
                    border: "1px solid #c9a227",
                    color: "#c9a227",
                    borderRadius: 999,
                    padding: "2px 12px",
                    fontSize: 13,
                    marginBottom: 12,
                  }}
                >
                  {personalForecast.todayPillar}
                </div>
              )}
              <ShareMarkdown>
                {formatPersonalForecast(personalForecast.personalForecast)}
              </ShareMarkdown>
            </ShareCardBase>
          </div>
        </ShareDialog>
      )}
    </>
  );
}

export default Daily;
