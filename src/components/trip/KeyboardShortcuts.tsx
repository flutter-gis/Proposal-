"use client";

/**
 * KeyboardShortcuts.tsx — G-14 (simplified per audit Design Rec A)
 *
 * No visible help button in the UI — shortcuts are an easter egg for
 * power users. Press "?" anywhere to open the help overlay.
 *
 * Core shortcuts (kept):
 *   - Arrow Left/Right or PageUp/PageDown: navigate pages
 *   - Escape: close dialog/overlay
 *   - ?: open this help
 *
 * Removed per audit:
 *   - Number keys 1-5 (page jumps) — too much cognitive overhead
 *   - Tab / Shift+Tab listing — standard browser behavior, no need to document
 *   - Visible help button — shortcuts are an easter egg, not a feature
 */

import { useEffect, useState, useCallback } from "react";
import { Keyboard, X } from "lucide-react";

const SHORTCUTS = [
  { keys: ["←", "PageUp"], action: "Previous page" },
  { keys: ["→", "PageDown"], action: "Next page" },
  { keys: ["Esc"], action: "Close dialog / overlay" },
  { keys: ["?"], action: "Show this help" },
];

export default function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      // "?" opens help
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }

      // Escape closes help
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    },
    [open]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-rust-bark/80 backdrop-blur-sm anim-fade-in-up"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
    >
      <div
        className="leather-card parchment-texture rounded-3xl p-6 md:p-8 max-w-sm mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl font-bold text-on-light flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </h2>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close help"
            className="p-1 rounded-lg hover:bg-rust-bark/10 text-on-light/60 hover:text-on-light transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <ul className="space-y-2.5">
          {SHORTCUTS.map((s, i) => (
            <li key={i} className="flex items-center justify-between gap-4">
              <span className="text-sm text-on-light/80">{s.action}</span>
              <div className="flex gap-1 flex-shrink-0">
                {s.keys.map((k) => (
                  <kbd
                    key={k}
                    className="inline-flex items-center justify-center min-w-[2rem] h-7 px-2 rounded-md bg-rust-bark/10 border border-rust-bark/20 text-xs font-mono font-semibold text-on-light"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
