import React from "react";
import { useTranslation } from "react-i18next";
import { Separator } from "@/components/ui/separator";
import { Reveal } from "./brand/Reveal";
import { BrandMark } from "./brand/Logo";

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

interface SocialLinkProps {
  href: string;
  label: string;
  children: React.ReactNode;
}

const SocialLink: React.FC<SocialLinkProps> = ({ href, label, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="hover-shine relative flex size-11 items-center justify-center overflow-hidden rounded-full border border-primary/15 bg-primary/[0.06] text-muted-foreground transition-all duration-300 hover:-translate-y-1 hover:scale-110 hover:border-primary/50 hover:bg-primary/15 hover:text-primary hover:shadow-[0_0_22px_-4px_rgba(201,162,39,0.7)]"
  >
    {children}
  </a>
);

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="relative z-10 mt-auto overflow-hidden border-t border-primary/10 bg-gradient-to-br from-card/95 via-background/90 to-primary/[0.07] px-4 py-8 sm:px-6">
      {/* Glowing gold hairline along the top edge */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      {/* Soft breathing glow rising from the corner */}
      <div className="animate-glow-pulse pointer-events-none absolute -bottom-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-primary/10" />

      <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-5 md:flex-row md:items-start">
        {/* Social */}
        <Reveal className="flex-1 text-center">
          <p className="text-gold-shimmer text-base font-bold">
            📅 {t("footer.dailyForecasts")}
          </p>
          <p className="mt-1 mb-3 text-xs text-muted-foreground">
            {t("footer.followForInsights")}
          </p>
          <div className="flex justify-center gap-3">
            <SocialLink href="https://www.facebook.com/profile.php?id=61579213033328" label="Facebook">
              <FacebookIcon className="size-5" />
            </SocialLink>
            <SocialLink href="https://x.com/bazigpt" label="X">
              <XIcon className="size-5" />
            </SocialLink>
            <SocialLink href="https://t.me/bazigpt_everyday" label="Telegram">
              <TelegramIcon className="size-5" />
            </SocialLink>
          </div>
        </Reveal>

        <Separator orientation="vertical" className="hidden h-20 bg-primary/15 md:block" />
        <Separator className="w-full bg-primary/15 md:hidden" />

        {/* Legal */}
        <Reveal delay={100} className="flex-1 text-center">
          <p className="text-gold-shimmer mb-3 text-base font-bold">
            {t("footer.legal")}
          </p>
          <div className="flex justify-center gap-3">
            <a
              href="/privacy"
              className="hover-shine relative overflow-hidden rounded-lg border-2 border-primary/70 px-4 py-1.5 text-sm font-semibold text-primary transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_22px_-4px_rgba(201,162,39,0.7)]"
            >
              {t("footer.privacy")}
            </a>
            <a
              href="/terms"
              className="hover-shine relative overflow-hidden rounded-lg border-2 border-primary/70 px-4 py-1.5 text-sm font-semibold text-primary transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_22px_-4px_rgba(201,162,39,0.7)]"
            >
              {t("footer.terms")}
            </a>
          </div>
        </Reveal>

        <Separator orientation="vertical" className="hidden h-20 bg-primary/15 md:block" />
        <Separator className="w-full bg-primary/15 md:hidden" />

        {/* Developer */}
        <Reveal delay={200} className="flex-1 text-center">
          <p className="text-gold-shimmer text-base font-bold">
            {t("footer.developer")}
          </p>
          <p className="mt-1 mb-3 text-xs text-muted-foreground">
            {t("footer.builtBy")}
          </p>
          <div className="flex justify-center gap-3">
            <SocialLink href="https://twitter.com/0xBarnum" label="Developer on X">
              <XIcon className="size-5" />
            </SocialLink>
            <SocialLink href="https://t.me/ZeroXBarnum" label="Developer on Telegram">
              <TelegramIcon className="size-5" />
            </SocialLink>
          </div>
        </Reveal>
      </div>

      {/* Brand sign-off */}
      <div className="relative mx-auto mt-7 flex w-full max-w-5xl flex-col items-center gap-2 border-t border-primary/10 pt-5">
        <div className="animate-float">
          <BrandMark size={30} />
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}{" "}
          <span className="font-display font-semibold text-primary">BaziGPT</span>
          {" · "}
          {t("footer.tagline", "Ancient wisdom, modern clarity")}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
