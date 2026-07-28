"use client";

import { useEffect, useState } from "react";
import {
  clearCookieConsent,
  readCookieConsent,
  type CookieConsent,
} from "@/lib/cookies";

/** Footer / policy helper to reopen the consent banner. */
export function ManageCookiesButton({
  className = "",
}: {
  className?: string;
}) {
  const [consent, setConsent] = useState<CookieConsent | null>(null);

  useEffect(() => {
    setConsent(readCookieConsent());

    function onChange(event: Event) {
      setConsent((event as CustomEvent<CookieConsent | null>).detail);
    }

    window.addEventListener("cookie-consent-change", onChange);
    return () => window.removeEventListener("cookie-consent-change", onChange);
  }, []);

  if (!consent) return null;

  return (
    <button
      type="button"
      onClick={() => clearCookieConsent()}
      className={className}
    >
      Manage cookies
    </button>
  );
}
