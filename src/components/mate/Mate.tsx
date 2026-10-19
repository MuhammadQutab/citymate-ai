"use client";

import { AnimatePresence, motion } from "motion/react";

export type MateState = "idle" | "listening" | "thinking" | "found" | "unsure" | "resting";

type Props = {
  state?: MateState;
  /** "full" = standing explorer for heroes; "bust" = compact head for chat. */
  variant?: "full" | "bust";
  className?: string;
};

const SKIN = "#efbf9a";
const INK = "#14123a";

const mouths: Record<MateState, { d: string; fill?: string }> = {
  idle: { d: "M90 118 Q100 127 110 118" },
  listening: { d: "M95 118 Q100 126 105 118 Q100 120 95 118Z", fill: INK },
  thinking: { d: "M93 121 Q100 118 108 120" },
  found: { d: "M86 115 Q100 134 114 115Z", fill: INK },
  unsure: { d: "M89 121 Q94 117 100 121 Q106 125 111 120" },
  resting: { d: "M94 119 Q100 123 106 119" },
};

const headTilt: Record<MateState, number> = {
  idle: 0,
  listening: -6,
  thinking: 5,
  found: -3,
  unsure: 9,
  resting: -4,
};

const fillBox = { transformBox: "fill-box", transformOrigin: "center" } as const;

export function Mate({ state = "idle", variant = "full", className = "" }: Props) {
  const full = variant === "full";
  const eyesClosed = state === "resting";
  const pupilY = state === "thinking" ? -3 : 0;

  return (
    <motion.svg
      viewBox={full ? "0 0 200 270" : "40 30 120 130"}
      className={className}
      role="img"
      aria-label={`Mate, your CityMate companion (${state})`}
      animate={{ y: state === "resting" ? [0, 2, 0] : [0, -5, 0] }}
      transition={{ duration: state === "resting" ? 4 : 3.2, repeat: Infinity, ease: "easeInOut" }}
    >
      {full && (
        <g>
          {/* ground shadow */}
          <ellipse cx="100" cy="262" rx="46" ry="6" fill="#000" opacity="0.25" />
          {/* legs */}
          <rect x="74" y="222" width="20" height="36" rx="9" fill="#1e1b4f" />
          <rect x="106" y="222" width="20" height="36" rx="9" fill="#1e1b4f" />
          <path d="M70 254 h28 a4 4 0 0 1 0 8 h-28 a4 4 0 0 1 0 -8Z" fill="#3df2c2" />
          <path d="M102 254 h28 a4 4 0 0 1 0 8 h-28 a4 4 0 0 1 0 -8Z" fill="#3df2c2" />
          {/* backpack peeking out */}
          <rect x="52" y="152" width="96" height="66" rx="18" fill="#2a2766" />
          {/* jacket */}
          <path d="M60 150 Q100 138 140 150 L150 226 Q100 238 50 226Z" fill="#3a3685" />
          <path d="M100 146 L100 230" stroke="#3df2c2" strokeWidth="2.5" strokeLinecap="round" />
          {/* straps */}
          <path d="M72 150 L80 224 M128 150 L120 224" stroke="#ff7a66" strokeWidth="5" strokeLinecap="round" />
          {/* chest pin badge */}
          <path d="M118 176c0 5-6 10-6 10s-6-5-6-10a6 6 0 0 1 12 0Z" fill="#ff7a66" />
          <circle cx="112" cy="175.5" r="2.2" fill={INK} />
          {/* left arm */}
          <path d="M62 158 Q44 186 52 212" stroke="#3a3685" strokeWidth="15" strokeLinecap="round" fill="none" />
          <circle cx="52" cy="214" r="8" fill={SKIN} />
          {/* right arm — waves when Mate finds something */}
          <motion.g
            style={{ transformOrigin: "138px 158px" }}
            animate={{ rotate: state === "found" ? [-150, -120, -150] : 0 }}
            transition={state === "found" ? { duration: 0.7, repeat: Infinity, ease: "easeInOut" } : { duration: 0.4 }}
          >
            <path d="M138 158 Q156 186 148 212" stroke="#3a3685" strokeWidth="15" strokeLinecap="round" fill="none" />
            <circle cx="148" cy="214" r="8" fill={SKIN} />
          </motion.g>
        </g>
      )}

      {/* scarf */}
      <path d="M64 136 Q100 154 136 136 L138 148 Q100 166 62 148Z" fill="#ff7a66" />
      {full && <path d="M118 150 L128 186 L116 184 L110 154Z" fill="#f2604b" />}

      {/* head group tilts with state */}
      <motion.g style={fillBox} animate={{ rotate: headTilt[state] }} transition={{ type: "spring", stiffness: 160, damping: 14 }}>
        <circle cx="56" cy="102" r="8" fill={SKIN} />
        <circle cx="144" cy="102" r="8" fill={SKIN} />
        <circle cx="100" cy="98" r="44" fill={SKIN} />
        {/* hair */}
        <path d="M58 92 Q60 70 82 66 L70 96Z M142 92 Q140 72 122 66 L132 96Z" fill="#2b1f3a" />
        {/* explorer cap */}
        <path d="M56 84 C56 44 144 44 144 84 Q100 74 56 84Z" fill="#3df2c2" />
        <path d="M56 84 Q100 74 144 84 L144 90 Q100 80 56 90Z" fill="#1e1b4f" />
        <path d="M128 82 Q162 78 172 90 Q150 96 126 90Z" fill="#1fd6a8" />
        <path d="M106 54c0 6-6 11-6 11s-6-5-6-11a6 6 0 0 1 12 0Z" fill="#ff7a66" />
        <circle cx="100" cy="53.5" r="2.2" fill={INK} />

        {/* brows */}
        <motion.path
          d={state === "unsure" ? "M76 88 Q84 84 92 88 M108 86 Q116 84 124 90" : "M77 88 Q84 84 91 88 M109 88 Q116 84 123 88"}
          stroke={INK}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          animate={{ y: state === "listening" || state === "found" ? -3 : 0 }}
        />

        {/* eyes */}
        {eyesClosed ? (
          <path d="M78 101 Q84 106 90 101 M110 101 Q116 106 122 101" stroke={INK} strokeWidth="2.5" strokeLinecap="round" fill="none" />
        ) : (
          <motion.g
            style={fillBox}
            animate={{ scaleY: [1, 1, 0.1, 1] }}
            transition={{ duration: 0.25, times: [0, 0.4, 0.6, 1], repeat: Infinity, repeatDelay: 3.6 }}
          >
            <motion.g animate={{ y: pupilY }}>
              <ellipse cx="84" cy="101" rx="5.5" ry={state === "listening" ? 7.5 : 7} fill={INK} />
              <ellipse cx="116" cy="101" rx="5.5" ry={state === "listening" ? 7.5 : 7} fill={INK} />
              <circle cx="86" cy="98" r="1.8" fill="#fff" />
              <circle cx="118" cy="98" r="1.8" fill="#fff" />
            </motion.g>
          </motion.g>
        )}

        <circle cx="74" cy="114" r="6" fill="#ff7a66" opacity="0.4" />
        <circle cx="126" cy="114" r="6" fill="#ff7a66" opacity="0.4" />

        <motion.path
          key={state}
          d={mouths[state].d}
          fill={mouths[state].fill ?? "none"}
          stroke={INK}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      </motion.g>

      {/* state accents */}
      <AnimatePresence>
        {state === "listening" && (
          <motion.g key="listen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {[0, 1].map((i) => (
              <motion.path
                key={i}
                d={`M${158 + i * 8} ${88 - i * 4} Q${166 + i * 10} 102 ${158 + i * 8} ${116 + i * 4}`}
                stroke="#3df2c2"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </motion.g>
        )}
        {state === "thinking" && (
          <motion.g key="think" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {[0, 1, 2].map((i) => (
              <motion.circle
                key={i}
                cx={140 + i * 10}
                cy={44 - i * 6}
                r={3 + i}
                fill="#3df2c2"
                animate={{ opacity: [0.25, 1, 0.25] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }}
              />
            ))}
          </motion.g>
        )}
        {state === "found" && (
          <motion.path
            key="found"
            d="M160 40 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4Z"
            fill="#ffb470"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0.8, 1.1, 0.8], opacity: 1, rotate: [0, 20, 0] }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 1.4, repeat: Infinity }}
            style={fillBox}
          />
        )}
        {state === "unsure" && (
          <motion.text
            key="unsure"
            x="152"
            y="58"
            fontSize="26"
            fontWeight="700"
            fill="#ff7a66"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            ?
          </motion.text>
        )}
        {state === "resting" && (
          <motion.text
            key="rest"
            x="148"
            y="56"
            fontSize="18"
            fontWeight="700"
            fill="#a9a6d6"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0], y: [0, -10, -16] }}
            transition={{ duration: 2.6, repeat: Infinity }}
          >
            z
          </motion.text>
        )}
      </AnimatePresence>
    </motion.svg>
  );
}
