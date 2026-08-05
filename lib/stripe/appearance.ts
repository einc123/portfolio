import type { Appearance } from "@stripe/stripe-js";
import { THEME_CHANGE_EVENT, type Theme } from "@/lib/theme";

function cssVar(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

function currentTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
}

/**
 * Stripe Payment Element appearance matched to the site theme.
 * `fontFamily: inherit` does not work inside Stripe’s iframe — use an explicit stack.
 */
export function buildStripeAppearance(): Appearance {
  const dark = currentTheme() === "dark";
  const accent = cssVar("--accent", dark ? "#5fbfa8" : "#0f5c4c");
  const ink = cssVar("--ink", dark ? "#eef3f0" : "#0a0e0c");
  const muted = cssVar("--muted", dark ? "#9aa59e" : "#5c675f");
  const faint = cssVar("--faint", dark ? "#6f7a73" : "#8a948c");
  const line = dark ? "rgba(238, 243, 240, 0.16)" : "rgba(18, 22, 20, 0.14)";
  // Opaque panels — translucent --surface looks wrong inside the iframe.
  const panel = dark ? "#141a17" : "#ffffff";
  const field = dark ? "#0c100e" : "#ffffff";
  const page = cssVar("--background", dark ? "#0c100e" : "#f4f6f5");

  return {
    theme: dark ? "night" : "stripe",
    labels: "above",
    variables: {
      colorPrimary: accent,
      colorBackground: panel,
      colorText: ink,
      colorTextSecondary: muted,
      colorTextPlaceholder: faint,
      colorDanger: "#dc2626",
      colorIcon: muted,
      colorIconHover: ink,
      fontFamily:
        'Outfit, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
      fontSizeBase: "15px",
      fontWeightNormal: "400",
      fontWeightMedium: "500",
      fontWeightBold: "600",
      borderRadius: "0px",
      spacingUnit: "4px",
      focusBoxShadow: "none",
      focusOutline: `1.5px solid ${accent}`,
      tabIconSelectedColor: accent,
      gridRowSpacing: "16px",
      gridColumnSpacing: "12px",
    },
    rules: {
      ".Label": {
        fontSize: "11px",
        fontWeight: "500",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: faint,
        marginBottom: "8px",
      },
      ".Input": {
        backgroundColor: field,
        border: `1px solid ${line}`,
        boxShadow: "none",
        color: ink,
        padding: "12px 14px",
        lineHeight: "1.4",
        transition: "border-color 120ms ease",
      },
      ".Input:hover": {
        borderColor: accent,
      },
      ".Input:focus": {
        border: `1px solid ${accent}`,
        boxShadow: "none",
        outline: "none",
      },
      ".Input--invalid": {
        borderColor: "#dc2626",
        color: ink,
      },
      ".Error": {
        fontSize: "13px",
        color: "#dc2626",
        marginTop: "6px",
      },
      ".Tab": {
        backgroundColor: page,
        border: `1px solid ${line}`,
        boxShadow: "none",
        color: muted,
        padding: "12px 14px",
      },
      ".Tab:hover": {
        backgroundColor: field,
        color: ink,
      },
      ".Tab--selected, .Tab--selected:hover": {
        backgroundColor: field,
        borderColor: accent,
        color: ink,
        boxShadow: "none",
      },
      ".TabIcon": {
        color: muted,
      },
      ".TabIcon--selected": {
        color: accent,
      },
      ".Block": {
        backgroundColor: panel,
        border: `1px solid ${line}`,
        boxShadow: "none",
        padding: "14px",
      },
      ".CheckboxInput": {
        backgroundColor: field,
        borderColor: line,
      },
      ".CheckboxInput--checked": {
        backgroundColor: accent,
        borderColor: accent,
      },
      ".CodeInput": {
        backgroundColor: field,
        border: `1px solid ${line}`,
        color: ink,
      },
      ".PickerItem": {
        backgroundColor: field,
        border: `1px solid ${line}`,
        color: ink,
      },
      ".PickerItem--selected": {
        borderColor: accent,
      },
    },
  };
}

/** Subscribe to site theme changes so Stripe Elements can remount. */
export function subscribeThemeChange(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => onChange();
  window.addEventListener(THEME_CHANGE_EVENT, handler);
  const observer = new MutationObserver(handler);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme", "data-accent"],
  });
  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, handler);
    observer.disconnect();
  };
}
