/**
 * Decorative, original night-city scene (mountains, skyline, a glowing road).
 * Purely illustrative — it does not depict any real city layout.
 * Rendered as static SVG with CSS-only animation so it costs no JS.
 */

// Deterministic pseudo-random so server and client markup match.
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

const rand = rng(42);

const stars = Array.from({ length: 70 }, () => ({
  x: Math.round(rand() * 1440),
  y: Math.round(rand() * 420),
  r: +(rand() * 1.4 + 0.4).toFixed(2),
  delay: +(rand() * 4).toFixed(2),
}));

type Building = { x: number; w: number; h: number; dome?: boolean; spire?: boolean };

const buildings: Building[] = [];
for (let x = 120; x < 1340; ) {
  const w = Math.round(28 + rand() * 46);
  const tall = Math.abs(x - 760) < 260;
  const h = Math.round((tall ? 120 : 50) + rand() * (tall ? 170 : 90));
  buildings.push({ x, w, h, dome: rand() > 0.86, spire: tall && rand() > 0.8 });
  x += w + Math.round(2 + rand() * 6);
}

const GROUND = 700;

const windows = buildings.flatMap((b) => {
  const out: { x: number; y: number; warm: boolean }[] = [];
  for (let y = GROUND - b.h + 12; y < GROUND - 10; y += 14) {
    for (let x = b.x + 6; x < b.x + b.w - 6; x += 10) {
      if (rand() > 0.72) out.push({ x, y, warm: rand() > 0.35 });
    }
  }
  return out;
});

export function CityBackdrop({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice" className="h-full w-full">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0b0a26" />
            <stop offset="0.45" stopColor="#14123a" />
            <stop offset="0.68" stopColor="#3a2a6b" />
            <stop offset="0.8" stopColor="#a8566f" />
            <stop offset="0.86" stopColor="#ffb470" stopOpacity="0.9" />
          </linearGradient>
          <radialGradient id="glow" cx="0.68" cy="0.74" r="0.5">
            <stop offset="0" stopColor="#ff7a66" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ff7a66" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1e1b4f" />
            <stop offset="0.5" stopColor="#14123a" />
          </linearGradient>
          <linearGradient id="road" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#3df2c2" stopOpacity="0.9" />
            <stop offset="1" stopColor="#3df2c2" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <style>{`
          .cm-road { stroke-dasharray: 10 26; animation: cm-road 2.8s linear infinite; }
          .cm-road-warm { stroke-dasharray: 6 30; animation: cm-road 3.6s linear infinite reverse; }
          @keyframes cm-road { to { stroke-dashoffset: -72; } }
        `}</style>

        <rect width="1440" height="900" fill="url(#sky)" />
        <rect width="1440" height="900" fill="url(#glow)" />

        {stars.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill="#f7f5f0"
            className="animate-twinkle"
            style={{ animationDelay: `${s.delay}s` }}
          />
        ))}

        {/* Mountain ranges */}
        <path
          d="M0 610 L140 470 L250 540 L390 400 L520 520 L640 430 L760 500 L900 380 L1040 500 L1180 420 L1300 520 L1440 450 L1440 720 L0 720Z"
          fill="#2a2766"
          opacity="0.75"
        />
        <path
          d="M390 400 L420 430 L400 428 L380 445 L360 430Z M900 380 L935 416 L912 412 L890 430 L868 410Z"
          fill="#cfcdf2"
          opacity="0.25"
        />
        <path
          d="M0 650 L180 560 L330 620 L470 545 L610 610 L780 560 L960 620 L1120 550 L1290 620 L1440 580 L1440 720 L0 720Z"
          fill="#1e1b4f"
        />

        {/* Skyline */}
        <g fill="#100e30">
          {buildings.map((b, i) => (
            <g key={i}>
              <rect x={b.x} y={GROUND - b.h} width={b.w} height={b.h} rx="2" />
              {b.dome && <ellipse cx={b.x + b.w / 2} cy={GROUND - b.h} rx={b.w / 2.4} ry={b.w / 3} />}
              {b.spire && <rect x={b.x + b.w / 2 - 1.5} y={GROUND - b.h - 40} width="3" height="40" />}
            </g>
          ))}
        </g>
        <g>
          {windows.map((w, i) => (
            <rect
              key={i}
              x={w.x}
              y={w.y}
              width="4"
              height="5"
              fill={w.warm ? "#ffb470" : "#8af7da"}
              opacity={w.warm ? 0.75 : 0.5}
            />
          ))}
        </g>

        {/* Ground and the glowing road leading into the city */}
        <rect x="0" y={GROUND} width="1440" height={900 - GROUND} fill="url(#ground)" />
        <path d="M560 900 C 640 820, 700 760, 740 702" stroke="#0b0a26" strokeWidth="46" fill="none" />
        <path d="M560 900 C 640 820, 700 760, 740 702" stroke="url(#road)" strokeWidth="2.5" fill="none" className="cm-road" />
        <path d="M1040 900 C 900 820, 820 760, 780 702" stroke="#0b0a26" strokeWidth="34" fill="none" />
        <path d="M1040 900 C 900 820, 820 760, 780 702" stroke="#ff7a66" strokeOpacity="0.7" strokeWidth="2" fill="none" className="cm-road-warm" />
      </svg>
      {/* Fade into page background so content stays readable */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-indigo-950 to-transparent" />
    </div>
  );
}
