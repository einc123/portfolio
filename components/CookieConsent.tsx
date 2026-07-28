"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  readCookieConsent,
  writeCookieConsent,
  type CookieConsent,
} from "@/lib/cookies";

export function CookieConsentBanner() {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setConsent(readCookieConsent());
    setReady(true);

    function onChange(event: Event) {
      setConsent((event as CustomEvent<CookieConsent | null>).detail);
    }

    window.addEventListener("cookie-consent-change", onChange);
    return () => window.removeEventListener("cookie-consent-change", onChange);
  }, []);

  if (!ready || consent) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[80] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:px-6"
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 border border-line bg-background/95 p-5 shadow-[0_-12px_40px_rgba(10,14,12,0.12)] backdrop-blur-xl sm:flex-row sm:items-end sm:justify-between sm:gap-6 sm:p-6">
        <div className="min-w-0">
          <p
            id="cookie-consent-title"
            className="text-[11px] uppercase tracking-[0.18em] text-faint"
          >
            Cookies &amp; privacy
          </p>
          <p
            id="cookie-consent-desc"
            className="mt-3 text-sm leading-relaxed text-muted"
          >
            This site uses essential browser storage for theme and preferences.
            Privacy-oriented Cloudflare Web Analytics may run without cookies.{" "}
            <Link href="/cookies" className="link-underline text-accent">
              Cookies policy
            </Link>
          </p>
        </div>
        <button
          type="button"
          onClick={() => setConsent(writeCookieConsent())}
          className="inline-flex min-h-11 shrink-0 items-center justify-center bg-accent px-6 text-sm font-medium text-on-accent transition-transform hover:-translate-y-0.5"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
