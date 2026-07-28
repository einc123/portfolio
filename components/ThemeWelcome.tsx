"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  accentLabels,
  accents,
  applyAccent,
  isAccent,
  setPreferredAccent,
  type Accent,
} from "@/lib/accent";
import {
  OPEN_THEME_WELCOME_EVENT,
  THEME_STORAGE_KEY,
  applyTheme,
  getSystemTheme,
  hasThemePreference,
  isTheme,
  setPreferredTheme,
  type Theme,
} from "@/lib/theme";

type Stage = "hidden" | "enter" | "idle" | "picking" | "exit";
type Variant = "first" | "revisit";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isIntroDone() {
  return document.documentElement.dataset.intro !== "pending";
}

function readCurrentAccent(): Accent {
  const current = document.documentElement.getAttribute("data-accent");
  return isAccent(current) ? current : "cyan";
}

function readCurrentTheme(): Theme {
  const attr = document.documentElement.getAttribute("data-theme");
  if (isTheme(attr)) return attr;
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (isTheme(stored)) return stored;
  } catch {
    /* ignore */
  }
  return getSystemTheme();
}

const COPY = {
  first: {
    eyebrow: "First things first",
    title: (
      <>
        How do you like to <em>browse</em>?
      </>
    ),
    body: "Pick a brightness and a hue. You can change either anytime from the menu.",
    confirm: "Continue",
  },
  revisit: {
    eyebrow: "Theme studio",
    title: (
      <>
        Tweak the <em>look</em>
      </>
    ),
    body: "Adjust brightness and hue whenever you like — changes preview live as you choose.",
    confirm: "Done",
  },
} as const;

export function ThemeWelcome() {
  const titleId = useId();
  const lightRef = useRef<HTMLButtonElement>(null);
  const timers = useRef<number[]>([]);
  const snapshot = useRef<{ theme: Theme; accent: Accent } | null>(null);
  const [stage, setStage] = useState<Stage>("hidden");
  const [variant, setVariant] = useState<Variant>("first");
  const [theme, setTheme] = useState<Theme>("light");
  const [accent, setAccent] = useState<Accent>("cyan");

  function clearTimers() {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }

  function beginOpen(nextVariant: Variant) {
    clearTimers();
    const nextTheme = readCurrentTheme();
    const nextAccent = readCurrentAccent();
    snapshot.current = { theme: nextTheme, accent: nextAccent };
    setVariant(nextVariant);
    setTheme(nextTheme);
    setAccent(nextAccent);
    setStage(prefersReducedMotion() ? "idle" : "enter");
    timers.current.push(
      window.setTimeout(
        () => setStage("idle"),
        prefersReducedMotion() ? 0 : 700,
      ),
    );
  }

  function dismiss(restore = false) {
    if (restore && snapshot.current) {
      applyTheme(snapshot.current.theme);
      applyAccent(snapshot.current.accent);
      setTheme(snapshot.current.theme);
      setAccent(snapshot.current.accent);
    }

    clearTimers();
    setStage("exit");
    const exitMs = prefersReducedMotion() ? 120 : 780;
    timers.current.push(
      window.setTimeout(() => {
        document.body.style.overflow = "";
        snapshot.current = null;
        setStage("hidden");
      }, exitMs),
    );
  }

  useEffect(() => {
    function onOpenRequest() {
      if (stage !== "hidden" && stage !== "exit") return;
      beginOpen("revisit");
    }

    window.addEventListener(OPEN_THEME_WELCOME_EVENT, onOpenRequest);
    return () =>
      window.removeEventListener(OPEN_THEME_WELCOME_EVENT, onOpenRequest);
  }, [stage]);

  useEffect(() => {
    if (hasThemePreference()) return;

    let enterTimer = 0;

    function openFirst() {
      beginOpen("first");
    }

    if (isIntroDone()) {
      enterTimer = window.setTimeout(openFirst, 420);
    } else {
      const observer = new MutationObserver(() => {
        if (isIntroDone()) {
          observer.disconnect();
          enterTimer = window.setTimeout(openFirst, 420);
        }
      });
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-intro"],
      });
      return () => {
        observer.disconnect();
        window.clearTimeout(enterTimer);
      };
    }

    return () => window.clearTimeout(enterTimer);
  }, []);

  useEffect(() => {
    if (stage !== "idle" && stage !== "enter") return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => lightRef.current?.focus(), 80);

    return () => {
      document.body.style.overflow = previous || "";
      window.clearTimeout(focusTimer);
    };
  }, [stage]);

  useEffect(() => {
    if (stage === "hidden" || stage === "exit") return;
    applyTheme(theme);
  }, [theme, stage]);

  useEffect(() => {
    if (stage === "hidden" || stage === "exit") return;
    applyAccent(accent);
  }, [accent, stage]);

  useEffect(() => {
    if (stage !== "idle" && stage !== "enter") return;
    if (variant !== "revisit") return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") dismiss(true);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [stage, variant, theme, accent]);

  useEffect(() => () => clearTimers(), []);

  function finish(nextTheme: Theme = theme, nextAccent: Accent = accent) {
    if (stage !== "idle") return;

    setTheme(nextTheme);
    setAccent(nextAccent);
    setStage("picking");
    setPreferredTheme(nextTheme);
    setPreferredAccent(nextAccent);
    snapshot.current = null;

    clearTimers();
    const exitDelay = prefersReducedMotion() ? 80 : 280;
    const exitMs = prefersReducedMotion() ? 120 : 780;

    timers.current.push(
      window.setTimeout(() => setStage("exit"), exitDelay),
      window.setTimeout(() => {
        document.body.style.overflow = "";
        setStage("hidden");
      }, exitDelay + exitMs),
    );
  }

  const canInteract = stage === "idle" || stage === "enter";
  const copy = COPY[variant];

  if (stage === "hidden") return null;

  return (
    <div
      className={`theme-welcome ${stage === "enter" ? "is-enter" : ""} ${
        stage === "exit" ? "is-exit" : ""
      } ${stage === "picking" ? "is-picking" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="theme-welcome__backdrop" aria-hidden />
      <div className="theme-welcome__glow theme-welcome__glow--a" aria-hidden />
      <div className="theme-welcome__glow theme-welcome__glow--b" aria-hidden />

      <div className="theme-welcome__panel">
        <p className="theme-welcome__eyebrow">{copy.eyebrow}</p>
        <h2 id={titleId} className="theme-welcome__title">
          {copy.title}
        </h2>
        <p className="theme-welcome__copy">{copy.body}</p>

        <p className="theme-welcome__section-label">Brightness</p>
        <div className="theme-welcome__choices" data-preview={theme}>
          <button
            ref={lightRef}
            type="button"
            className={`theme-welcome__choice theme-welcome__choice--light ${
              theme === "light" ? "is-selected" : ""
            }`}
            onClick={() => canInteract && setTheme("light")}
            onMouseEnter={() => stage === "idle" && setTheme("light")}
            onFocus={() => stage === "idle" && setTheme("light")}
            disabled={!canInteract}
            aria-pressed={theme === "light"}
          >
            <span className="theme-welcome__swatch" aria-hidden>
              <span className="theme-welcome__sun" />
            </span>
            <span className="theme-welcome__choice-label">Light</span>
            <span className="theme-welcome__choice-hint">Soft paper &amp; ink</span>
          </button>

          <button
            type="button"
            className={`theme-welcome__choice theme-welcome__choice--dark ${
              theme === "dark" ? "is-selected" : ""
            }`}
            onClick={() => canInteract && setTheme("dark")}
            onMouseEnter={() => stage === "idle" && setTheme("dark")}
            onFocus={() => stage === "idle" && setTheme("dark")}
            disabled={!canInteract}
            aria-pressed={theme === "dark"}
          >
            <span className="theme-welcome__swatch" aria-hidden>
              <span className="theme-welcome__moon" />
            </span>
            <span className="theme-welcome__choice-label">Dark</span>
            <span className="theme-welcome__choice-hint">Deep ink &amp; glow</span>
          </button>
        </div>

        <p className="theme-welcome__section-label">Hue</p>
        <div
          className="theme-welcome__hues"
          role="group"
          aria-label="Accent colour"
        >
          {accents.map((option) => {
            const active = accent === option;
            return (
              <button
                key={option}
                type="button"
                className={`theme-welcome__hue ${active ? "is-selected" : ""}`}
                style={{ background: `var(--swatch-${option})` }}
                onClick={() => canInteract && setAccent(option)}
                onMouseEnter={() => stage === "idle" && setAccent(option)}
                onFocus={() => stage === "idle" && setAccent(option)}
                disabled={!canInteract}
                aria-label={accentLabels[option]}
                aria-pressed={active}
                title={accentLabels[option]}
              />
            );
          })}
        </div>
        <p className="theme-welcome__hue-label">{accentLabels[accent]}</p>

        <div className="theme-welcome__actions">
          <button
            type="button"
            className="theme-welcome__continue"
            onClick={() => finish()}
            disabled={stage !== "idle"}
          >
            {copy.confirm}
          </button>
          <button
            type="button"
            className="theme-welcome__system"
            onClick={() => finish(getSystemTheme())}
            disabled={stage !== "idle"}
          >
            Use system brightness
          </button>
          {variant === "revisit" ? (
            <button
              type="button"
              className="theme-welcome__system"
              onClick={() => dismiss(true)}
              disabled={stage !== "idle"}
            >
              Cancel
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
