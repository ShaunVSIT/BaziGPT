import React, { useEffect, useState } from "react";
import { BrandMark } from "./Logo";

/**
 * Over-the-top "consulting the cosmos" loader for the wait while an AI reading
 * generates. A pulsing brand core inside concentric counter-rotating orbit
 * rings, with planets orbiting and a sonar pulse — plus cycling oracle phrases.
 */

const PHRASES = [
  "Aligning the Four Pillars…",
  "Consulting the celestial stems…",
  "Reading the heavenly branches…",
  "Mapping your elemental balance…",
  "Tracing destiny through the stars…",
  "Decoding the hour of your birth…",
];

// Orbiting bodies: radius (px), duration (s), size, color, start offset.
const BODIES = [
  { orbit: 56, dur: 6, size: 8, color: "var(--gold)" },
  { orbit: 56, dur: 6, size: 5, color: "var(--gold-soft)", offset: 140 },
  { orbit: 84, dur: 9, size: 6, color: "var(--jade)", offset: 70 },
  { orbit: 84, dur: 9, size: 4, color: "var(--gold)", offset: 230 },
  { orbit: 112, dur: 13, size: 7, color: "var(--gold-soft)", offset: 30 },
  { orbit: 112, dur: 13, size: 3, color: "var(--jade)", offset: 200 },
];

export const CosmicLoader: React.FC<{ label?: string }> = ({ label }) => {
  const [phrase, setPhrase] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setPhrase((p) => (p + 1) % PHRASES.length), 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-12">
      {/* Orbit system */}
      <div className="relative grid size-64 place-items-center">
        {/* Sonar pulse rings */}
        <span className="animate-pulse-ring absolute size-40 rounded-full border border-primary/40" />
        <span
          className="animate-pulse-ring absolute size-40 rounded-full border border-secondary/40"
          style={{ animationDelay: "1.2s" }}
        />

        {/* Backing glow */}
        <div className="animate-glow-pulse absolute size-44 rounded-full bg-primary/20" />

        {/* Orbit rings */}
        <div className="animate-spin-slower absolute size-28 rounded-full border border-dashed border-primary/30" />
        <div className="animate-spin-reverse absolute size-44 rounded-full border border-secondary/25" />
        <div className="animate-spin-slow absolute size-60 rounded-full border border-primary/15" />

        {/* Orbiting bodies (each parented to a centered point) */}
        {BODIES.map((b, i) => (
          <span
            key={i}
            className="animate-orbit absolute grid place-items-center"
            style={
              {
                "--orbit": `${b.orbit}px`,
                "--orbit-dur": `${b.dur}s`,
                animationDelay: `${-(b.offset ?? 0) / 60}s`,
              } as React.CSSProperties
            }
          >
            <span
              className="block rounded-full"
              style={{
                width: b.size,
                height: b.size,
                background: b.color,
                boxShadow: `0 0 10px 2px ${b.color}`,
              }}
            />
          </span>
        ))}

        {/* Pulsing brand core */}
        <div className="animate-float relative">
          <div className="animate-glow-pulse absolute inset-0 -m-3 rounded-full bg-primary/40" />
          <BrandMark size={64} className="relative drop-shadow-[0_0_12px_rgba(201,162,39,0.6)]" />
        </div>
      </div>

      {/* Cycling oracle phrase */}
      <div className="text-center">
        <p
          key={phrase}
          className="animate-rise-blur font-display text-xl font-semibold text-gold-shimmer sm:text-2xl"
        >
          {PHRASES[phrase]}
        </p>
        {label && (
          <p className="mt-2 text-sm tracking-wide text-muted-foreground">{label}</p>
        )}
        {/* progress shimmer bar */}
        <div className="mx-auto mt-5 h-1 w-48 overflow-hidden rounded-full bg-primary/10">
          <div
            className="h-full w-1/2 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, transparent, var(--gold), var(--gold-soft), transparent)",
              animation: "gold-shimmer 1.6s linear infinite",
              backgroundSize: "200% 100%",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CosmicLoader;
