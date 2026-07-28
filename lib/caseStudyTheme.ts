import type { Project } from "@/lib/data";

/** Approximate page backgrounds for contrast checks. */
const LIGHT_BG = "#f4f6f5";
const DARK_BG = "#0c100e";
const MIN_TEXT_RATIO = 4.5;

function hexToRgb(hex: string) {
  const value = hex.replace("#", "").trim();
  const full =
    value.length === 3
      ? value
          .split("")
          .map((char) => char + char)
          .join("")
      : value;
  return {
    r: Number.parseInt(full.slice(0, 2), 16),
    g: Number.parseInt(full.slice(2, 4), 16),
    b: Number.parseInt(full.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number) {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return (
    "#" +
    [clamp(r), clamp(g), clamp(b)]
      .map((n) => n.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

function relativeLuminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const channel = (value: number) => {
    const s = value / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(foreground: string, background: string) {
  const l1 = relativeLuminance(foreground);
  const l2 = relativeLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function contrastInk(hex: string) {
  return relativeLuminance(hex) > 0.42 ? "#0A0E0C" : "#FFFFFF";
}

function mixToward(hex: string, target: string, amount: number) {
  const from = hexToRgb(hex);
  const to = hexToRgb(target);
  return rgbToHex(
    from.r + (to.r - from.r) * amount,
    from.g + (to.g - from.g) * amount,
    from.b + (to.b - from.b) * amount,
  );
}

/**
 * Nudge a brand colour toward black/white until it is readable on the given
 * page background, keeping the original hue as much as possible.
 */
export function ensureReadable(
  hex: string,
  background: string,
  minRatio = MIN_TEXT_RATIO,
) {
  if (contrastRatio(hex, background) >= minRatio) return hex.toUpperCase();

  const bgLum = relativeLuminance(background);
  const target = bgLum > 0.5 ? "#000000" : "#FFFFFF";
  let best = hex;
  let bestRatio = contrastRatio(hex, background);

  for (let step = 1; step <= 24; step += 1) {
    const candidate = mixToward(hex, target, step / 24);
    const ratio = contrastRatio(candidate, background);
    if (ratio > bestRatio) {
      best = candidate;
      bestRatio = ratio;
    }
    if (ratio >= minRatio) return candidate;
  }

  return best;
}

function isNearNeutral(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max - min < 18;
}

function isUsableBrandSwatch(hex: string) {
  const lum = relativeLuminance(hex);
  // Skip pure white/near-white and pure black-ish neutrals for accents —
  // they either vanish or look like body text.
  if (lum > 0.92 || lum < 0.04) return false;
  if (isNearNeutral(hex) && (lum > 0.75 || lum < 0.12)) return false;
  return true;
}

type ThemeVariant = {
  primary: string;
  secondary: string;
  accents: string[];
  onPrimary: string;
};

function buildVariant(colours: string[], background: string): ThemeVariant {
  const source = colours.filter(isUsableBrandSwatch);
  const pool = source.length ? source : colours;

  const accents = pool.map((hex) => ensureReadable(hex, background));
  // Prefer the first strong chromatic colour as primary after adjustment
  const primary = accents[0] ?? ensureReadable("#0F5C4C", background);
  const secondary = accents[1] ?? primary;

  return {
    primary,
    secondary,
    accents: accents.length ? accents : [primary],
    onPrimary: contrastInk(primary),
  };
}

export function getCaseStudyTheme(project: Project) {
  const hexes = project.colours.map((colour) => colour.hex);
  const light = buildVariant(hexes, LIGHT_BG);
  const dark = buildVariant(hexes, DARK_BG);

  return {
    /** Readable on the light site background */
    ...light,
    light,
    dark,
  };
}

/** CSS custom properties for light + dark case-study theming. */
export function getCaseStudyCssVars(project: Project) {
  const theme = getCaseStudyTheme(project);
  const vars: Record<string, string> = {
    "--case-primary": theme.light.primary,
    "--case-secondary": theme.light.secondary,
    "--case-on-primary": theme.light.onPrimary,
    "--case-primary-d": theme.dark.primary,
    "--case-secondary-d": theme.dark.secondary,
    "--case-on-primary-d": theme.dark.onPrimary,
  };

  const max = Math.max(theme.light.accents.length, theme.dark.accents.length, 6);
  for (let i = 0; i < max; i += 1) {
    vars[`--case-a${i}`] =
      theme.light.accents[i % theme.light.accents.length] ?? theme.light.primary;
    vars[`--case-a${i}-d`] =
      theme.dark.accents[i % theme.dark.accents.length] ?? theme.dark.primary;
  }

  return vars;
}

export function accentVar(index: number) {
  return `var(--case-a${index % 6})`;
}

export function getHighlightTerms(project: Project) {
  const extras = project.highlights ?? [];
  const titleBits = project.title
    .split(/[\s/&]+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 2);

  const terms = [project.title, ...titleBits, ...extras].filter(Boolean);
  const seen = new Set<string>();

  return terms
    .filter((term) => {
      const key = term.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => b.length - a.length);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function splitHighlightedText(text: string, terms: string[]) {
  if (!terms.length) return [{ text, highlight: false as const }];

  const pattern = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "gi");
  const parts = text.split(pattern);

  return parts.filter(Boolean).map((part) => {
    const highlight = terms.some(
      (term) => term.toLowerCase() === part.toLowerCase(),
    );
    return { text: part, highlight };
  });
}

/** Label colour for palette swatches — readable on the page, not the swatch. */
export function swatchLabelColour(hex: string, theme: "light" | "dark" = "light") {
  const bg = theme === "dark" ? DARK_BG : LIGHT_BG;
  if (contrastRatio(hex, bg) >= MIN_TEXT_RATIO) return hex.toUpperCase();
  return undefined;
}
