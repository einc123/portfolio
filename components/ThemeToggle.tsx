"use client";

import { openThemeWelcome } from "@/lib/theme";

export function ThemeToggle({
  className = "",
  inverted = false,
  compact = false,
}: {
  className?: string;
  inverted?: boolean;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => openThemeWelcome()}
      className={`group inline-flex items-center justify-center gap-2 text-[12px] uppercase tracking-[0.14em] transition-[color,min-height] duration-300 sm:justify-start sm:text-[13px] ${
        compact ? "min-h-9" : "min-h-11 min-w-11 sm:min-w-0"
      } ${inverted ? "text-white" : "text-ink"} ${className}`}
      aria-label="Open theme settings"
      title="Theme"
    >
      <span className="hidden transition-opacity group-hover:opacity-70 sm:inline">
        Theme
      </span>
      <span className={`relative ${compact ? "h-4 w-4" : "h-5 w-5 sm:h-4 sm:w-4"}`} aria-hidden>
        <svg
          viewBox="0 0 16 16"
          fill="none"
          className={compact ? "h-4 w-4" : "h-5 w-5 sm:h-4 sm:w-4"}
        >
          <path
            d="M9.2 2.4c.7-.7 1.9-.7 2.6 0l1.8 1.8c.7.7.7 1.9 0 2.6L7.4 13H3v-4.4L9.2 2.4Z"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinejoin="round"
          />
          <path
            d="M8.1 3.5 12.5 7.9"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
          <path
            d="M3.2 12.8c1.1-.15 2.05.15 2.7.9"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
        </svg>
      </span>
    </button>
  );
}
