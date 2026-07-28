"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/data";
import {
  hasSkippedLoadingAnimations,
  setSkippedLoadingAnimations,
  SKIP_LOADING_KEY,
} from "@/lib/motionPrefs";

type Phase =
  | "boot"
  | "typingName"
  | "pause"
  | "deleting"
  | "typingBrand"
  | "hold"
  | "exit"
  | "done";

const BOOT_LINES = [
  "> init portfolio.tsx",
  "> compile experience",
  "> render brand",
] as const;

const NAME_TEXT = site.introBrand;
const NAME_LINES = NAME_TEXT.split("\n");
const BRAND_TEXT = site.brand;

const TYPE_MS = 38;
const DELETE_MS = 22;
const BOOT_LINE_MS = 280;
const PAUSE_MS = 520;
const HOLD_MS = 900;
const EXIT_MS = 900;
const INTRO_PLAYED_KEY = "portfolio-intro-played";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function clearIntroPending() {
  document.documentElement.dataset.intro = "done";
  document.body.style.overflow = "";
}

function markIntroPlayed() {
  try {
    sessionStorage.setItem(INTRO_PLAYED_KEY, "1");
  } catch {
    /* ignore */
  }
}

function hasPlayedIntroThisSession() {
  try {
    return sessionStorage.getItem(INTRO_PLAYED_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Start boot intro when the inline script marked pending, or as a fallback when
 * the script never ran (attribute unset) and we have not played it this tab yet.
 * If the script set "done" (other route / skipped / already played), do not start.
 */
function shouldStartIntro() {
  const intro = document.documentElement.dataset.intro;
  if (intro === "pending") return true;
  if (intro === "done") return false;
  return !hasPlayedIntroThisSession();
}

export function CodeIntro() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [phase, setPhase] = useState<Phase>("done");
  const [bootCount, setBootCount] = useState(0);
  const [typed, setTyped] = useState("");
  const timers = useRef<number[]>([]);
  const startedRef = useRef(false);

  function clearTimers() {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }

  useEffect(() => {
    clearTimers();
    startedRef.current = false;

    if (!isHome || prefersReducedMotion() || hasSkippedLoadingAnimations()) {
      clearIntroPending();
      setPhase("done");
      setBootCount(0);
      setTyped("");
      return;
    }

    if (!shouldStartIntro()) {
      clearIntroPending();
      setPhase("done");
      return;
    }

    document.documentElement.dataset.intro = "pending";
    document.body.style.overflow = "hidden";
    startedRef.current = true;
    setBootCount(0);
    setTyped("");
    setPhase("boot");

    // Safety: never leave the page stuck behind the pending overlay.
    const safetyId = window.setTimeout(() => {
      if (document.documentElement.dataset.intro === "pending") {
        markIntroPlayed();
        clearIntroPending();
        setPhase("done");
      }
    }, 12000);
    timers.current.push(safetyId);

    return () => {
      clearTimers();
      // Strict Mode remount: keep pending so the intro can restart.
      // If we never successfully started, clear so content is not stuck.
      if (!startedRef.current) {
        clearIntroPending();
      } else {
        document.body.style.overflow = "";
      }
    };
  }, [isHome]);

  useEffect(() => {
    if (phase !== "boot") return;

    if (bootCount >= BOOT_LINES.length) {
      const id = window.setTimeout(() => setPhase("typingName"), 180);
      return () => window.clearTimeout(id);
    }

    const id = window.setTimeout(
      () => setBootCount((count) => count + 1),
      BOOT_LINE_MS,
    );
    return () => window.clearTimeout(id);
  }, [phase, bootCount]);

  useEffect(() => {
    if (phase !== "typingName") return;

    if (typed.length >= NAME_TEXT.length) {
      const id = window.setTimeout(() => setPhase("pause"), 80);
      return () => window.clearTimeout(id);
    }

    const id = window.setTimeout(() => {
      setTyped(NAME_TEXT.slice(0, typed.length + 1));
    }, TYPE_MS);
    return () => window.clearTimeout(id);
  }, [phase, typed]);

  useEffect(() => {
    if (phase !== "pause") return;

    const id = window.setTimeout(() => setPhase("deleting"), PAUSE_MS);
    return () => window.clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "deleting") return;

    if (typed.length === 0) {
      const id = window.setTimeout(() => setPhase("typingBrand"), 160);
      return () => window.clearTimeout(id);
    }

    const id = window.setTimeout(() => {
      setTyped((value) => value.slice(0, -1));
    }, DELETE_MS);
    return () => window.clearTimeout(id);
  }, [phase, typed]);

  useEffect(() => {
    if (phase !== "typingBrand") return;

    if (typed.length >= BRAND_TEXT.length) {
      const id = window.setTimeout(() => setPhase("hold"), 120);
      return () => window.clearTimeout(id);
    }

    const id = window.setTimeout(() => {
      setTyped(BRAND_TEXT.slice(0, typed.length + 1));
    }, TYPE_MS);
    return () => window.clearTimeout(id);
  }, [phase, typed]);

  useEffect(() => {
    if (phase !== "hold") return;

    const id = window.setTimeout(() => setPhase("exit"), HOLD_MS);
    return () => window.clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "exit") return;

    const id = window.setTimeout(() => {
      markIntroPlayed();
      clearIntroPending();
      setPhase("done");
    }, EXIT_MS);
    return () => window.clearTimeout(id);
  }, [phase]);

  if (phase === "done") return null;

  const showCursor =
    phase === "typingName" ||
    phase === "pause" ||
    phase === "deleting" ||
    phase === "typingBrand" ||
    phase === "hold";

  function skipIntro() {
    if (phase === "exit" || phase === "done") return;
    setSkippedLoadingAnimations();
    markIntroPlayed();
    clearTimers();
    setPhase("exit");
  }

  return (
    <div
      className={`code-intro ${phase === "exit" ? "is-exiting" : ""}`}
      role="status"
      aria-live="polite"
      aria-label="Loading portfolio"
      onDoubleClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        skipIntro();
      }}
    >
      <div className="code-intro__glow" aria-hidden />
      <div className="code-intro__scan" aria-hidden />

      <div className="code-intro__panel">
        <p className="code-intro__meta">euanliv.click — boot</p>

        <ul className="code-intro__boot" aria-hidden>
          {BOOT_LINES.slice(0, bootCount).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>

        <p className="code-intro__brand font-brand" aria-hidden>
          <span className="code-intro__brand-sizer">
            {NAME_LINES.map((line) => (
              <span key={line} className="code-intro__brand-line">
                {line}
              </span>
            ))}
          </span>
          <span className="code-intro__brand-typed">
            {typed}
            <span
              className={`code-intro__cursor ${showCursor ? "is-on" : ""}`}
            />
          </span>
        </p>
      </div>

      {phase !== "exit" ? (
        <p className="page-transition__hint">
          Double click to stop loading animations
        </p>
      ) : null}
    </div>
  );
}

/** Inline script: mark intro pending on homepage hard loads before paint. */
export const introInitScript = `(function(){try{var reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;var skipped=localStorage.getItem(${JSON.stringify(SKIP_LOADING_KEY)})==="1";var home=location.pathname==="/";var played=false;try{played=sessionStorage.getItem(${JSON.stringify(INTRO_PLAYED_KEY)})==="1"}catch(e){}document.documentElement.dataset.intro=(!reduced&&!skipped&&home&&!played)?"pending":"done"}catch(e){document.documentElement.dataset.intro="done"}})()`;
