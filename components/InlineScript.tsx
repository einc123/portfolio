"use client";

import { useSyncExternalStore } from "react";

/**
 * Inline boot script that runs during HTML parse (before paint).
 *
 * Rendered on the server and during hydration only. After that it returns
 * null so React 19 / Next 16 don’t warn about client-rendered <script> tags.
 * By then the IIFE has already run, so theme/accent/intro boot still works.
 *
 * @see https://nextjs.org/docs/app/guides/preventing-flash-before-hydration
 */
export function InlineScript({ html }: { html: string }) {
  const isServerOrHydration = useSyncExternalStore(
    () => () => {},
    () => false,
    () => true,
  );

  if (!isServerOrHydration) return null;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: html }}
      suppressHydrationWarning
    />
  );
}
