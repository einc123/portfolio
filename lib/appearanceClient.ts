"use client";

import { isAccent, setPreferredAccent, type Accent } from "@/lib/accent";
import { isTheme, setPreferredTheme, type Theme } from "@/lib/theme";

export type AppearancePrefs = {
  preferredTheme?: string | null;
  preferredAccent?: string | null;
};

/** Apply account-stored appearance onto the current browser. */
export function applyAccountAppearance(prefs: AppearancePrefs) {
  if (isTheme(prefs.preferredTheme ?? null)) {
    setPreferredTheme(prefs.preferredTheme as Theme);
  }
  if (isAccent(prefs.preferredAccent ?? null)) {
    setPreferredAccent(prefs.preferredAccent as Accent);
  }
}

export function readLocalAppearance(): {
  theme: Theme | null;
  accent: Accent | null;
} {
  try {
    const themeRaw = localStorage.getItem("theme");
    const accentRaw = localStorage.getItem("accent");
    return {
      theme: isTheme(themeRaw) ? themeRaw : null,
      accent: isAccent(accentRaw) ? accentRaw : null,
    };
  } catch {
    return { theme: null, accent: null };
  }
}
