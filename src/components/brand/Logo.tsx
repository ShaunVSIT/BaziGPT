import React from "react";
import { cn } from "@/lib/utils";

/**
 * BaziGPT brand mark — the calligraphic 八 ("Ba") in Celestial Noir gold.
 * Vector, inherits currentColor via the gold gradient. Crisp at any size.
 */
export const BrandMark: React.FC<{ size?: number; className?: string }> = ({
  size = 32,
  className,
}) => {
  // Unique gradient id per instance — duplicate ids (esp. inside a hidden
  // `md:hidden` nav logo) break `url(#id)` paint-server references.
  const goldId = `bm-gold-${React.useId()}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={goldId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e6c75c" />
          <stop offset="100%" stopColor="#c9a227" />
        </linearGradient>
      </defs>
      <rect x="8" y="8" width="496" height="496" rx="120" fill="#0b0b0f" />
      <rect
        x="26"
        y="26"
        width="460"
        height="460"
        rx="104"
        fill="none"
        stroke={`url(#${goldId})`}
        strokeWidth="8"
        opacity="0.55"
      />
      <g transform="translate(360 138)" fill="#2e8b7b">
        <path d="M0 -30 C4 -9 9 -4 30 0 C9 4 4 9 0 30 C-4 9 -9 4 -30 0 C-9 -4 -4 -9 0 -30 Z" />
      </g>
      <g fill={`url(#${goldId})`}>
        <path d="M250 168 C246 196 232 250 196 308 C182 330 166 350 146 366 C140 370 134 366 138 358 C170 300 198 244 220 184 C224 172 232 162 242 160 C249 159 252 162 250 168 Z" />
        <path d="M262 166 C268 196 286 252 320 306 C334 328 352 348 372 362 C382 369 380 380 368 378 C338 372 312 352 292 322 C268 286 252 236 244 184 C242 170 248 158 258 159 C261 159 261 162 262 166 Z" />
      </g>
    </svg>
  );
};

/** Full lockup: mark + serif wordmark. */
export const Logo: React.FC<{ className?: string; markSize?: number }> = ({
  className,
  markSize = 30,
}) => (
  <span className={cn("flex items-center gap-2.5", className)}>
    <BrandMark size={markSize} />
    <span className="font-display text-xl font-bold leading-none tracking-tight text-foreground">
      BaziGPT
    </span>
  </span>
);

export default Logo;
