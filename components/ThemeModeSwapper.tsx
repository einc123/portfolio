"use client";

import { useEffect, useState } from "react";
import {
  THEME_CHANGE_EVENT,
  THEME_STORAGE_KEY,
  resolveTheme,
  setPreferredTheme,
  type Theme,
} from "@/lib/theme";

const modes: { id: Theme; label: string }[] = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
];

export function ThemeModeSwapper() {
  const [theme, setTheme] = useState<Theme>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    setTheme(resolveTheme(stored));
    setReady(true);

    function onThemeChange(event: Event) {
      const detail = (event as CustomEvent<Theme>).detail;
      if (detail === "light" || detail === "dark") setTheme(detail);
    }

    window.addEventListener(THEME_CHANGE_EVENT, onThemeChange);
    return () => window.removeEventListener(THEME_CHANGE_EVENT, onThemeChange);
  }, []);

  return (
    <div className="flex items-center gap-3">
      <p className="text-[10px] uppercase tracking-[0.16em] text-faint/80">
        Mode
      </p>
      <div
        className="flex items-center gap-1"
        role="group"
        aria-label="Colour mode"
      >
        {modes.map((mode) => {
          const active = ready && theme === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => setPreferredTheme(mode.id)}
              className={`min-h-8 px-2.5 text-[11px] uppercase tracking-[0.12em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                active
                  ? "bg-ink text-background"
                  : "border border-line text-faint hover:border-accent/40 hover:text-ink"
              }`}
              aria-pressed={active}
              title={mode.label}
            >
              {mode.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
