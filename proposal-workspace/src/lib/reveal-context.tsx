"use client";

/**
 * reveal-context.tsx
 *
 * Context that exposes the engagement reveal's phase and visibility state
 * to descendants. This replaces the fragile DOM-polling pattern in
 * MusicPlayer (which queried `.fixed.inset-0.z-\\[300\\]` with setTimeout)
 * and the hardcoded 8-second delay in InstallPrompt.
 *
 * Consumers:
 *   - MusicPlayer: waits until `revealed === true` (reveal finished) to show
 *   - InstallPrompt: waits until `revealed === true` + additional delay
 *   - Any future component that needs to know the reveal state
 *
 * The EngagementReveal3D component calls `setPhase()` and `setVisible()`
 * as the user progresses through the reveal flow.
 */

import {
  createContext, useContext, useState,
  type ReactNode,
} from "react";

export type RevealPhase = "intro" | "box" | "opening" | "reveal" | "done";

interface RevealContextValue {
  /** Current phase of the reveal flow. */
  phase: RevealPhase;
  /** Whether the 3D overlay is still visible (false after "done" fades out). */
  visible: boolean;
  /** True once the reveal is complete and the site beneath is accessible. */
  revealed: boolean;
  /** Called by EngagementReveal3D to update the phase. */
  setPhase: (phase: RevealPhase) => void;
  /** Called by EngagementReveal3D to hide the overlay. */
  setVisible: (visible: boolean) => void;
}

const RevealContext = createContext<RevealContextValue | null>(null);

export function RevealProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<RevealPhase>("intro");
  const [visible, setVisible] = useState(true);

  // `revealed` is true when the overlay is no longer blocking the site.
  // This happens when visible===false OR when phase==="done" (fading out).
  const revealed = !visible || phase === "done";

  const value: RevealContextValue = {
    phase,
    visible,
    revealed,
    setPhase,
    setVisible,
  };

  return (
    <RevealContext.Provider value={value}>
      {children}
    </RevealContext.Provider>
  );
}

export function useReveal(): RevealContextValue {
  const ctx = useContext(RevealContext);
  if (!ctx) {
    throw new Error("useReveal must be used inside <RevealProvider>");
  }
  return ctx;
}
