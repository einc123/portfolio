export const SKIP_LOADING_KEY = "portfolio-skip-loading";

export function hasSkippedLoadingAnimations(): boolean {
  try {
    return localStorage.getItem(SKIP_LOADING_KEY) === "1";
  } catch {
    return false;
  }
}

export function setSkippedLoadingAnimations() {
  try {
    localStorage.setItem(SKIP_LOADING_KEY, "1");
  } catch {
    /* ignore */
  }
}
