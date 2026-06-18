import React from "react";
import { BrandMark } from "./Logo";
import { cn } from "@/lib/utils";

/**
 * Shared hero composition (Celestial Noir): glowing mark → eyebrow → oversized
 * gold-gradient serif title → subtitle → children, with staggered entrance.
 * `size="full"` centers in the viewport (oracle landings); `compact` is a tall
 * page header.
 */
export const PageHero: React.FC<{
  eyebrow?: string;
  title: React.ReactNode;
  titleSub?: string;
  subtitle?: React.ReactNode;
  showMark?: boolean;
  size?: "full" | "compact";
  children?: React.ReactNode;
  className?: string;
}> = ({
  eyebrow,
  title,
  titleSub,
  subtitle,
  showMark = true,
  size = "compact",
  children,
  className,
}) => (
  <section
    className={cn(
      "relative mx-auto flex max-w-2xl flex-col items-center text-center",
      size === "full"
        ? "min-h-[calc(100vh-9rem)] justify-center py-6"
        : "py-10 sm:py-14",
      className
    )}
  >
    {showMark && (
      <div className="animate-rise-blur relative mb-6">
        <div className="animate-glow-pulse absolute left-1/2 top-1/2 size-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/30" />
        <div className="animate-float relative">
          <BrandMark size={64} />
        </div>
      </div>
    )}

    {eyebrow && (
      <p
        className="animate-rise-blur mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-primary"
        style={{ animationDelay: "0.05s" }}
      >
        {eyebrow}
      </p>
    )}

    <h1
      className="animate-rise-blur font-display text-5xl font-bold leading-[1.05] sm:text-6xl"
      style={{ animationDelay: "0.1s" }}
    >
      <span className="text-gold-shimmer">{title}</span>
      {titleSub && (
        <span className="mt-1 block text-2xl font-normal text-foreground/70 sm:text-3xl">
          {titleSub}
        </span>
      )}
    </h1>

    {subtitle && (
      <p
        className="animate-rise-blur mt-5 max-w-xl text-base text-muted-foreground sm:text-lg"
        style={{ animationDelay: "0.15s" }}
      >
        {subtitle}
      </p>
    )}

    {children && (
      <div
        className="animate-rise-blur w-full"
        style={{ animationDelay: "0.2s" }}
      >
        {children}
      </div>
    )}
  </section>
);

export default PageHero;
