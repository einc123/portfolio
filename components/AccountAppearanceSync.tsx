"use client";

import { useEffect, useRef } from "react";
import {
  getMyAppearancePreferences,
  saveAppearancePreferences,
} from "@/app/client/actions";
import { applyAccountAppearance, readLocalAppearance } from "@/lib/appearanceClient";
import { ACCENT_CHANGE_EVENT, type Accent } from "@/lib/accent";
import { THEME_CHANGE_EVENT, type Theme } from "@/lib/theme";

/**
 * While signed in: restore account theme/accent once, then persist local changes.
 */
export function AccountAppearanceSync() {
  const ready = useRef(false);
  const signedIn = useRef(false);
  const skipNextSave = useRef(0);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const prefs = await getMyAppearancePreferences();
      if (cancelled) return;

      if (!prefs.ok) {
        signedIn.current = false;
        ready.current = true;
        return;
      }

      signedIn.current = true;

      const hasAccountPrefs = Boolean(
        prefs.preferredTheme || prefs.preferredAccent,
      );

      if (hasAccountPrefs) {
        skipNextSave.current = 2;
        applyAccountAppearance({
          preferredTheme: prefs.preferredTheme,
          preferredAccent: prefs.preferredAccent,
        });
      } else {
        const local = readLocalAppearance();
        if (local.theme || local.accent) {
          void saveAppearancePreferences({
            theme: local.theme,
            accent: local.accent,
          });
        }
      }

      ready.current = true;
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function persist() {
      if (!ready.current || !signedIn.current) return;
      if (skipNextSave.current > 0) {
        skipNextSave.current -= 1;
        return;
      }
      const local = readLocalAppearance();
      void saveAppearancePreferences({
        theme: local.theme,
        accent: local.accent,
      });
    }

    function onTheme(event: Event) {
      const detail = (event as CustomEvent<Theme>).detail;
      if (detail === "light" || detail === "dark") persist();
    }

    function onAccent(event: Event) {
      const detail = (event as CustomEvent<Accent>).detail;
      if (typeof detail === "string") persist();
    }

    window.addEventListener(THEME_CHANGE_EVENT, onTheme);
    window.addEventListener(ACCENT_CHANGE_EVENT, onAccent);
    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, onTheme);
      window.removeEventListener(ACCENT_CHANGE_EVENT, onAccent);
    };
  }, []);

  return null;
}
