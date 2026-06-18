import React from "react";

/**
 * Living atmospheric backdrop (Celestial Noir — maximalist).
 * Fixed, behind all content. Layers, back-to-front:
 *   drifting aurora → twinkling starfield → shooting stars →
 *   rising cosmic dust → breathing glow orbs → film grain → vignette
 */

// Deterministic starfield — no per-render randomness, no layout cost.
const STARS = Array.from({ length: 90 }, (_, i) => ({
  x: (i * 137.508) % 100,
  y: (i * 49.137) % 100,
  r: i % 7 === 0 ? 1.4 : i % 3 === 0 ? 0.95 : 0.55,
  gold: i % 5 === 0,
  // staggered twinkle so the whole sky shimmers out of phase
  delay: ((i * 53) % 40) / 10, // 0–4s
  dur: 3 + ((i * 17) % 30) / 10, // 3–6s
}));

// A few shooting stars, each on its own track + cadence. They streak
// down-and-right, so start them upper-left with room to travel.
const SHOOTERS = [
  { top: "8%", left: "8%", delay: "0s", dur: "8s" },
  { top: "22%", left: "36%", delay: "3.5s", dur: "11s" },
  { top: "4%", left: "58%", delay: "6.2s", dur: "9s" },
];

// Rising dust motes — soft, slow, drifting upward.
const DUST = Array.from({ length: 18 }, (_, i) => ({
  left: `${(i * 61.8) % 100}%`,
  size: i % 4 === 0 ? 3 : 2,
  delay: `${(i * 0.9) % 12}s`,
  dur: `${10 + ((i * 7) % 8)}s`,
  gold: i % 3 === 0,
}));

// Inline SVG film grain (feTurbulence) as a tiled data-URI.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export const CelestialBackground: React.FC = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
  >
    {/* Drifting aurora field — two counter-moving gradient sheets */}
    <div
      className="animate-aurora absolute inset-[-20%]"
      style={{
        backgroundImage: `
          radial-gradient(40% 35% at 30% 25%, rgba(201,162,39,0.16), transparent 70%),
          radial-gradient(45% 40% at 80% 20%, rgba(230,199,92,0.10), transparent 70%),
          radial-gradient(50% 45% at 20% 80%, rgba(46,139,123,0.14), transparent 70%)
        `,
      }}
    />
    <div
      className="animate-aurora-slow absolute inset-[-20%]"
      style={{
        backgroundImage: `
          radial-gradient(50% 45% at 70% 75%, rgba(46,139,123,0.10), transparent 70%),
          radial-gradient(40% 35% at 50% 50%, rgba(201,162,39,0.08), transparent 70%)
        `,
      }}
    />

    {/* Twinkling starfield */}
    <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
      {STARS.map((s, i) => (
        <circle
          key={i}
          className="animate-twinkle"
          cx={`${s.x}%`}
          cy={`${s.y}%`}
          r={s.r}
          fill={s.gold ? "#e6c75c" : "#f4f1ea"}
          style={{ animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s` }}
        />
      ))}
    </svg>

    {/* Shooting stars */}
    {SHOOTERS.map((s, i) => (
      <span
        key={i}
        className="animate-shoot absolute h-px w-24 rounded-full"
        style={{
          top: s.top,
          left: s.left,
          animationDelay: s.delay,
          animationDuration: s.dur,
          background:
            "linear-gradient(90deg, rgba(255,244,207,0) 0%, rgba(255,244,207,0.9) 70%, #fff 100%)",
          boxShadow: "0 0 8px 1px rgba(255,244,207,0.6)",
        }}
      />
    ))}

    {/* Rising cosmic dust */}
    {DUST.map((d, i) => (
      <span
        key={i}
        className="animate-dust absolute bottom-[-10px] rounded-full"
        style={{
          left: d.left,
          width: d.size,
          height: d.size,
          animationDelay: d.delay,
          animationDuration: d.dur,
          background: d.gold ? "#e6c75c" : "#f4f1ea",
          boxShadow: d.gold
            ? "0 0 6px 1px rgba(230,199,92,0.7)"
            : "0 0 5px 1px rgba(244,241,234,0.5)",
        }}
      />
    ))}

    {/* Breathing glow orbs */}
    <div className="animate-glow-pulse absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary/15" />
    <div
      className="animate-glow-pulse absolute bottom-[-10%] right-[-8%] h-[420px] w-[420px] rounded-full bg-secondary/15"
      style={{ animationDelay: "2.2s" }}
    />
    <div
      className="animate-glow-pulse absolute left-[-6%] top-1/3 h-[360px] w-[360px] rounded-full bg-primary/10"
      style={{ animationDelay: "3.6s" }}
    />

    {/* Film grain. No mix-blend-* here: a viewport-sized blend layer forces a
        full-screen re-composite every frame. Plain alpha at this opacity is
        visually indistinguishable and far cheaper. */}
    <div
      className="absolute inset-0 opacity-[0.04]"
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
