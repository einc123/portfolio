"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  hasSkippedLoadingAnimations,
  setSkippedLoadingAnimations,
} from "@/lib/motionPrefs";
import { getTransitionTitle } from "@/lib/pageLabel";

type Phase =
  | "idle"
  | "fadeOut"
  | "typingLoad"
  | "pause"
  | "deleting"
  | "typingTitle"
  | "hold"
  | "exit"
  | "simpleOut"
  | "simpleIn";

const LOADING_TEXT = "Loading...";
const TYPE_MS = 36;
const DELETE_MS = 20;
const FADE_OUT_MS = 320;
const SIMPLE_OUT_MS = 280;
const SIMPLE_IN_MS = 420;
const PAUSE_MS = 280;
const HOLD_MS = 520;
const EXIT_MS = 720;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const [typed, setTyped] = useState("");
  const [titleText, setTitleText] = useState("");
  const [reducedMotion, setReducedMotion] = useState(false);
  const timers = useRef<number[]>([]);
  const pendingPath = useRef<string | null>(null);
  const active = useRef(false);
  const mountedPath = useRef(pathname);
  const skipTyping = useRef(false);
  const routerRef = useRef(router);
  routerRef.current = router;

  function clearTimers() {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }

  function finish() {
    clearTimers();
    active.current = false;
    pendingPath.current = null;
    skipTyping.current = false;
    document.documentElement.removeAttribute("data-transition");
    document.body.style.overflow = "";
    setTyped("");
    setTitleText("");
    setPhase("idle");
  }

  function goSimpleIn() {
    document.documentElement.dataset.transition = "in";
    setPhase("simpleIn");
  }

  function ensureNavigated() {
    if (!pendingPath.current) return;
    const expected = pendingPath.current.split("#")[0].split("?")[0];
    if (expected !== pathname) {
      routerRef.current.push(pendingPath.current);
    }
  }

  function skipToSimpleFade() {
    if (!active.current) return;
    setSkippedLoadingAnimations();
    skipTyping.current = true;
    clearTimers();
    ensureNavigated();
    document.documentElement.dataset.transition = "busy";
    goSimpleIn();
  }

  function beginTransition(nextPath: string, { skipFadeOut = false } = {}) {
    if (active.current) return;
    if (prefersReducedMotion()) {
      if (!skipFadeOut) routerRef.current.push(nextPath);
      return;
    }
    if (document.documentElement.dataset.intro === "pending") return;

    const pathOnly = nextPath.split("?")[0].split("#")[0];
    const simple = hasSkippedLoadingAnimations();

    clearTimers();
    active.current = true;
    pendingPath.current = nextPath;
    skipTyping.current = simple;
    setTitleText(getTransitionTitle(pathOnly));
    setTyped("");
    document.body.style.overflow = "hidden";

    if (simple) {
      if (skipFadeOut) {
        document.documentElement.dataset.transition = "busy";
        goSimpleIn();
        return;
      }
      document.documentElement.dataset.transition = "out";
      setPhase("simpleOut");
      return;
    }

    if (skipFadeOut) {
      document.documentElement.dataset.transition = "busy";
      setPhase("typingLoad");
      return;
    }

    document.documentElement.dataset.transition = "out";
    setPhase("fadeOut");
  }

  useEffect(() => {
    setReducedMotion(prefersReducedMotion());
  }, []);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target as Element | null;
      const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (href.startsWith("#")) return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) return;

      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      beginTransition(`${url.pathname}${url.search}${url.hash}`);
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    if (mountedPath.current === pathname) return;

    const expected = pendingPath.current?.split("#")[0].split("?")[0];
    const cameFromUs = active.current && expected === pathname;

    mountedPath.current = pathname;

    if (cameFromUs) return;
    if (active.current) return;
    if (document.documentElement.dataset.intro === "pending") return;

    beginTransition(pathname, { skipFadeOut: true });
  }, [pathname]);

  useEffect(() => {
    if (phase !== "fadeOut") return;

    const id = window.setTimeout(() => {
      if (pendingPath.current) routerRef.current.push(pendingPath.current);
      document.documentElement.dataset.transition = "busy";
      if (skipTyping.current) {
        goSimpleIn();
        return;
      }
      setPhase("typingLoad");
    }, FADE_OUT_MS);

    return () => window.clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "simpleOut") return;

    const id = window.setTimeout(() => {
      if (pendingPath.current) routerRef.current.push(pendingPath.current);
      document.documentElement.dataset.transition = "busy";
      goSimpleIn();
    }, SIMPLE_OUT_MS);

    return () => window.clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "simpleIn") return;

    const id = window.setTimeout(() => {
      finish();
    }, SIMPLE_IN_MS);

    return () => window.clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "typingLoad") return;
    if (skipTyping.current) return;

    if (typed.length >= LOADING_TEXT.length) {
      const id = window.setTimeout(() => setPhase("pause"), 80);
      return () => window.clearTimeout(id);
    }

    const id = window.setTimeout(() => {
      setTyped(LOADING_TEXT.slice(0, typed.length + 1));
    }, TYPE_MS);

    return () => window.clearTimeout(id);
  }, [phase, typed]);

  useEffect(() => {
    if (phase !== "pause") return;
    if (skipTyping.current) return;

    const id = window.setTimeout(() => setPhase("deleting"), PAUSE_MS);
    return () => window.clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "deleting") return;
    if (skipTyping.current) return;

    if (typed.length === 0) {
      const id = window.setTimeout(() => setPhase("typingTitle"), 120);
      return () => window.clearTimeout(id);
    }

    const id = window.setTimeout(() => {
      setTyped((value) => value.slice(0, -1));
    }, DELETE_MS);

    return () => window.clearTimeout(id);
  }, [phase, typed]);

  useEffect(() => {
    if (phase !== "typingTitle") return;
    if (skipTyping.current) return;

    if (typed.length >= titleText.length) {
      const id = window.setTimeout(() => setPhase("hold"), 100);
      return () => window.clearTimeout(id);
    }

    const id = window.setTimeout(() => {
      setTyped(titleText.slice(0, typed.length + 1));
    }, TYPE_MS);

    return () => window.clearTimeout(id);
  }, [phase, typed, titleText]);

  useEffect(() => {
    if (phase !== "hold") return;
    if (skipTyping.current) return;

    const id = window.setTimeout(() => setPhase("exit"), HOLD_MS);
    return () => window.clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "exit") return;

    document.documentElement.dataset.transition = "in";
    const id = window.setTimeout(() => {
      finish();
    }, EXIT_MS);

    return () => window.clearTimeout(id);
  }, [phase]);

  useEffect(() => () => clearTimers(), []);

  if (phase === "idle") return null;

  const showTypingUi =
    !skipTyping.current &&
    phase !== "simpleOut" &&
    phase !== "simpleIn" &&
    phase !== "fadeOut" &&
    phase !== "exit";

  const showCursor =
    phase === "typingLoad" ||
    phase === "pause" ||
    phase === "deleting" ||
    phase === "typingTitle" ||
    phase === "hold";

  const showHint =
    !skipTyping.current &&
    !reducedMotion &&
    phase !== "simpleOut" &&
    phase !== "simpleIn" &&
    phase !== "exit";

  return (
    <div
      className={`page-transition ${
        skipTyping.current || phase === "simpleOut" || phase === "simpleIn"
          ? "is-simple"
          : ""
      } ${
        phase === "fadeOut" || phase === "simpleOut" ? "is-entering" : ""
      } ${
        phase === "exit" || phase === "simpleIn" ? "is-exiting" : ""
      }`}
      role="status"
      aria-live="polite"
      aria-label="Loading page"
      onDoubleClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (skipTyping.current || hasSkippedLoadingAnimations()) return;
        if (phase === "simpleOut" || phase === "simpleIn" || phase === "exit") {
          return;
        }
        skipToSimpleFade();
      }}
    >
      {skipTyping.current || phase === "simpleOut" || phase === "simpleIn" ? null : (
        <>
          <div className="page-transition__glow" aria-hidden />
          <div className="page-transition__scan" aria-hidden />
        </>
      )}

      {showTypingUi ? (
        <div className="page-transition__panel">
          <p className="page-transition__meta">euanliv.click — navigate</p>
          <p className="page-transition__brand font-brand" aria-hidden>
            <span className="page-transition__sizer">
              {titleText || LOADING_TEXT}
            </span>
            <span className="page-transition__typed">
              {typed}
              <span
                className={`code-intro__cursor ${showCursor ? "is-on" : ""}`}
              />
            </span>
          </p>
        </div>
      ) : null}

      {showHint ? (
        <p className="page-transition__hint">
          Double click to stop loading animations
        </p>
      ) : null}
    </div>
  );
}
