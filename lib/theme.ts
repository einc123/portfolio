export const THEME_STORAGE_KEY = "theme";
export const THEME_CHANGE_EVENT = "themechange";
export const OPEN_THEME_WELCOME_EVENT = "openthemewelcome";

export type Theme = "light" | "dark";

export function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark";
}

export function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function resolveTheme(stored: string | null): Theme {
  return isTheme(stored) ? stored : getSystemTheme();
}

export function hasThemePreference(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return isTheme(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return true;
  }
}

export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

export function setPreferredTheme(theme: Theme) {
  applyTheme(theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* ignore quota / private mode */
  }
  window.dispatchEvent(
    new CustomEvent(THEME_CHANGE_EVENT, { detail: theme }),
  );
}

export function openThemeWelcome() {
  window.dispatchEvent(new Event(OPEN_THEME_WELCOME_EVENT));
}

/** Inline script: apply stored/system theme before first paint. */
export const themeInitScript = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var t=localStorage.getItem(k);if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;
