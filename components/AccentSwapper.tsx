"use client";

import { useEffect, useState } from "react";
import {
  ACCENT_CHANGE_EVENT,
  accentLabels,
  accents,
  isAccent,
  setPreferredAccent,
  type Accent,
} from "@/lib/accent";

export function AccentSwapper() {
  const [accent, setAccent] = useState<Accent>("cyan");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-accent");
    if (isAccent(current)) setAccent(current);
    setReady(true);

    function onAccentChange(event: Event) {
      const detail = (event as CustomEvent<Accent>).detail;
      if (isAccent(detail)) setAccent(detail);
    }

    window.addEventListener(ACCENT_CHANGE_EVENT, onAccentChange);
    return () => window.removeEventListener(ACCENT_CHANGE_EVENT, onAccentChange);
  }, []);

  function select(next: Accent) {
    setAccent(next);
    setPreferredAccent(next);
  }

  return (
    <div className="flex items-center gap-3">
      <p className="text-[10px] uppercase tracking-[0.16em] text-faint/80">
        Hue
      </p>
      <div
        className="flex items-center gap-1.5"
        role="group"
        aria-label="Accent colour"
      >
        {accents.map((option) => {
          const active = ready && accent === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => select(option)}
              className={`accent-swatch relative h-3.5 w-3.5 rounded-full transition-transform duration-300 hover:scale-125 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                active ? "scale-110 ring-1 ring-ink/35 ring-offset-2 ring-offset-background" : "opacity-70 hover:opacity-100"
              }`}
              style={{ background: `var(--swatch-${option})` }}
              aria-label={`${accentLabels[option]} accent`}
              aria-pressed={active}
              title={accentLabels[option]}
            />
          );
        })}
      </div>
    </div>
  );
}
