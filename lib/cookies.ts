export const COOKIE_CONSENT_KEY = "cookie-consent";

export type CookieConsent = {
  acknowledged: true;
  updatedAt: string;
};

export function isCookieConsent(value: unknown): value is CookieConsent {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return record.acknowledged === true && typeof record.updatedAt === "string";
}

export function readCookieConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isCookieConsent(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeCookieConsent(): CookieConsent {
  const consent: CookieConsent = {
    acknowledged: true,
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
  } catch {
    /* ignore quota / private mode */
  }

  window.dispatchEvent(
    new CustomEvent("cookie-consent-change", { detail: consent }),
  );

  return consent;
}

export function clearCookieConsent() {
  try {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent("cookie-consent-change", { detail: null }));
}
