import React from "react";

/**
 * Global atmospheric backdrop (Celestial Noir).
 * Fixed, behind all content. Restrained motion: stars are static; only the
 * two glow orbs breathe slowly. Layers, back-to-front:
 *   mesh gradient → starfield → glow orbs → film grain → vignette
 */

// Deterministic starfield — no per-render randomness, no layout cost.
const STARS = Array.from({ length: 64 }, (_, i) => ({
  x: (i * 137.508) % 100,
  y: (i * 49.137) % 100,
  r: i % 7 === 0 ? 1.3 : i % 3 === 0 ? 0.9 : 0.5,
  o: 0.12 + ((i * 13) % 45) / 100,
  gold: i % 5 === 0,
}));

// Inline SVG film grain (feTurbulence) as a tiled data-URI.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export const CelestialBackground: React.FC = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
  >
    {/* Mesh gradient field */}
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `
          radial-gradient(60% 50% at 50% 0%, rgba(201,162,39,0.10), transparent 70%),
          radial-gradient(45% 40% at 85% 15%, rgba(201,162,39,0.07), transparent 70%),
          radial-gradient(50% 45% at 12% 85%, rgba(46,139,123,0.08), transparent 70%),
          radial-gradient(70% 60% at 50% 120%, rgba(46,139,123,0.06), transparent 70%)
        `,
      }}
    />

    {/* Static starfield */}
    <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
      {STARS.map((s, i) => (
        <circle
          key={i}
          cx={`${s.x}%`}
          cy={`${s.y}%`}
          r={s.r}
          fill={s.gold ? "#e6c75c" : "#f4f1ea"}
          opacity={s.o}
        />
      ))}
    </svg>

    {/* Breathing glow orbs */}
    <div className="animate-glow absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary/10 blur-[130px]" />
    <div
      className="animate-glow absolute bottom-[-10%] right-[-8%] h-[400px] w-[400px] rounded-full bg-secondary/10 blur-[130px]"
      style={{ animationDelay: "3s" }}
    />

    {/* Film grain */}
    <div
      className="absolute inset-0 opacity-[0.04] mix-blend-soft-light"
      style={{ backgroundImage: GRAIN, backgroundSize: "160px 160px" }}
    />

    {/* Vignette */}
    <div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(120% 100% at 50% 30%, transparent 55%, rgba(0,0,0,0.55) 100%)",
      }}
    />
  </div>
);

export default CelestialBackground;
