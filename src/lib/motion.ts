import type { Transition, Variants } from "motion/react";

/** Shared motion language — keep in sync with --dur-* tokens in globals.css. */
export const ease = [0.22, 1, 0.36, 1] as const;

export const spring: Transition = { type: "spring", stiffness: 260, damping: 26 };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

export const stagger = (staggerChildren = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren, delayChildren } },
});
