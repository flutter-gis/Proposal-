/**
 * haptics.ts
 *
 * Five vibration patterns for the Wilderness Romance PWA.
 * Each pattern is a VibratePattern that can be passed directly to
 * `navigator.vibrate()`. The patterns are intentionally short and
 * emotive — a tap, a heartbeat, a flourish, a long reveal pulse.
 *
 * On browsers that do not support the Vibration API (iOS Safari, desktop
 * browsers), every call is a no-op, so it is always safe to invoke.
 *
 * Wiring summary (see individual call sites for details):
 *   - tap        — generic UI taps (optional, not currently wired everywhere)
 *   - double     — secondary acknowledgements
 *   - heartbeat  — The Pause countdown ticks (every second while counting)
 *   - flourish   — Celebrate button on the Proposal page
 *   - reveal     — The Pause completion + countdown crossing zero (fires once)
 */

export type HapticPattern = "tap" | "double" | "heartbeat" | "flourish" | "reveal";

const PATTERNS: Record<HapticPattern, number | number[]> = {
  tap: 10,
  double: [10, 40, 20],
  heartbeat: [20, 80, 30, 80, 40],
  flourish: [60, 30, 120],
  reveal: 200,
};

/**
 * Trigger a haptic pattern. Returns true if the vibration was actually
 * issued (i.e. the Vibration API is available and not disabled by the
 * user's prefers-reduced-motion setting), false otherwise.
 */
export function haptic(pattern: HapticPattern): boolean {
  if (typeof window === "undefined") return false;
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") {
    return false;
  }
  // Respect reduced motion — many users who disable motion also dislike
  // tactile buzz; this is a conservative default. Callers can bypass
  // this check by importing `hapticForce` directly.
  const prefersReduced =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return false;

  try {
    return navigator.vibrate(PATTERNS[pattern]);
  } catch {
    return false;
  }
}

/**
 * Force-trigger a haptic pattern, ignoring the prefers-reduced-motion
 * preference. Use this only for moments where the haptic IS the experience
 * (e.g. the proposal reveal itself).
 */
export function hapticForce(pattern: HapticPattern): boolean {
  if (typeof window === "undefined") return false;
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") {
    return false;
  }
  try {
    return navigator.vibrate(PATTERNS[pattern]);
  } catch {
    return false;
  }
}

/**
 * Convenience helpers — the most common call sites can use these
 * directly without specifying the pattern name as a string.
 */
export const haptics = {
  tap: () => haptic("tap"),
  double: () => haptic("double"),
  heartbeat: () => haptic("heartbeat"),
  flourish: () => haptic("flourish"),
  reveal: () => hapticForce("reveal"),
};
