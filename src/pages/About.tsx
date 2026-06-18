import React from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import { Sparkles, Heart, CalendarDays, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/brand/Logo";

const SectionCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Card className="mb-6 border-border/60 bg-card/70">
    <CardContent className="p-6 sm:p-8">{children}</CardContent>
  </Card>
);

const ReadingCard: React.FC<{
  icon: LucideIcon;
  title: string;
  description: string;
  cta: string;
  to: string;
}> = ({ icon: Icon, title, description, cta, to }) => (
  <div className="flex flex-1 flex-col rounded-xl border border-border/60 bg-background/40 p-5 text-center">
    <Icon className="mx-auto mb-3 size-8 text-primary" />
    <h3 className="font-display text-xl font-semibold text-primary">{title}</h3>
    <p className="mt-2 mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">
      {description}
    </p>
    <Button asChild className="font-semibold">
      <RouterLink to={to}>{cta}</RouterLink>
    </Button>
  </div>
);

const About: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t("seo.about.title")}</title>
        <meta name="description" content={t("seo.about.description")} />
        <meta property="og:title" content={t("seo.about.title")} />
        <meta property="og:description" content={t("seo.about.description")} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.bazigpt.io/about" />
        <meta property="og:image" content="https://www.bazigpt.io/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t("seo.about.title")} />
        <meta name="twitter:description" content={t("seo.about.description")} />
        <meta name="twitter:image" content="https://www.bazigpt.io/og-image.png" />
        <link rel="canonical" href="https://www.bazigpt.io/about" />
      </Helmet>

      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <BrandMark size={48} className="mb-3" />
          <h1 className="font-display text-4xl font-bold text-foreground">
            {t("about.title")}
          </h1>
        </div>

        <SectionCard>
          <h2 className="font-display text-2xl font-semibold text-primary">
            {t("about.whatIsBaziGPT")}
          </h2>
          <p className="mt-2 mb-6 leading-relaxed text-foreground/90">
            {t("about.whatIsBaziGPTDescription")}
          </p>
          <h3 className="font-display text-xl font-semibold text-primary">
            {t("about.howItWorks")}
          </h3>
          <p className="mt-2 leading-relaxed text-foreground/90">
            {t("about.howItWorksDescription")}
          </p>
        </SectionCard>

        <SectionCard>
          <h2 className="mb-5 font-display text-2xl font-semibold text-primary">
            {t("about.typesOfReadings")}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <ReadingCard
              icon={Sparkles}
              title={t("about.soloReading")}
              description={t("about.soloReadingDescription")}
              cta={t("about.trySoloReading")}
              to="/"
            />
            <ReadingCard
              icon={Heart}
              title={t("about.compatibilityReading")}
              description={t("about.compatibilityReadingDescription")}
              cta={t("about.tryCompatibilityReading")}
              to="/?mode=compatibility"
            />
            <ReadingCard
              icon={CalendarDays}
              title={t("about.dailyForecast")}
              description={t("about.dailyForecastDescription")}
              cta={t("about.viewDailyForecast")}
              to="/daily"
            />
          </div>
        </SectionCard>

        <SectionCard>
          <h2 className="font-display text-2xl font-semibold text-primary">
            {t("about.whatIsBazi")}
          </h2>
          <p className="mt-2 mb-6 leading-relaxed text-foreground/90">
            {t("about.whatIsBaziDescription")}
          </p>

          <h3 className="font-display text-xl font-semibold text-primary">
            {t("about.fourPillars")}
          </h3>
          <p className="mt-2 mb-6 leading-relaxed text-foreground/90">
            {t("about.fourPillarsDescription")}
          </p>

          <h3 className="font-display text-xl font-semibold text-primary">
            {t("about.fiveElements")}
          </h3>
          <p className="mt-2 mb-6 leading-relaxed text-foreground/90">
            {t("about.fiveElementsDescription")}
          </p>

          <h3 className="font-display text-xl font-semibold text-primary">
            {t("about.modernApplications")}
          </h3>
          <p className="mt-2 leading-relaxed text-foreground/90">
            {t("about.modernApplicationsDescription")}
          </p>
        </SectionCard>
      </div>
    </>
  );
};

export default About;
