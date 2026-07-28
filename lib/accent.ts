export const ACCENT_STORAGE_KEY = "accent";
export const ACCENT_SESSION_KEY = "accent-session";
export const ACCENT_CHANGE_EVENT = "accentchange";

export const accents = [
  "cyan",
  "blue",
  "pink",
  "orange",
  "violet",
  "gold",
] as const;

export type Accent = (typeof accents)[number];

export const accentLabels: Record<Accent, string> = {
  cyan: "Cyan",
  blue: "Blue",
  pink: "Pink",
  orange: "Orange",
  violet: "Violet",
  gold: "Gold",
};

export function isAccent(value: string | null): value is Accent {
  return accents.includes(value as Accent);
}

export function pickAccent(exclude?: string | null): Accent {
  const pool = accents.filter((accent) => accent !== exclude);
  const choices = pool.length > 0 ? pool : [...accents];
  return choices[Math.floor(Math.random() * choices.length)]!;
}

export function applyAccent(accent: Accent) {
  document.documentElement.setAttribute("data-accent", accent);
}

export function setPreferredAccent(accent: Accent) {
  applyAccent(accent);
  try {
    sessionStorage.setItem(ACCENT_SESSION_KEY, accent);
    localStorage.setItem(ACCENT_STORAGE_KEY, accent);
  } catch {
    /* ignore quota / private mode */
  }
  window.dispatchEvent(
    new CustomEvent(ACCENT_CHANGE_EVENT, { detail: accent }),
  );
}

export function cycleAccent(current: Accent): Accent {
  const index = accents.indexOf(current);
  return accents[(index + 1) % accents.length]!;
}

/** Inline script: restore saved accent, otherwise pick one before first paint. */
export const accentInitScript = `(function(){try{var a=${JSON.stringify(accents)};var k=${JSON.stringify(ACCENT_STORAGE_KEY)};var sk=${JSON.stringify(ACCENT_SESSION_KEY)};var t=sessionStorage.getItem(sk);if(!t||a.indexOf(t)<0){t=localStorage.getItem(k);if(!t||a.indexOf(t)<0){t=a[Math.floor(Math.random()*a.length)]}sessionStorage.setItem(sk,t);try{localStorage.setItem(k,t)}catch(e){}}document.documentElement.setAttribute("data-accent",t)}catch(e){document.documentElement.setAttribute("data-accent","cyan")}})()`;
