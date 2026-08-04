"use client";

import { useSyncExternalStore } from "react";

/**
 * JSON-LD for SEO. Same server/hydration-only pattern as InlineScript so
 * React 19 doesn’t warn about client-rendered <script> tags.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const isServerOrHydration = useSyncExternalStore(
    () => () => {},
    () => false,
    () => true,
  );

  if (!isServerOrHydration) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      suppressHydrationWarning
    />
  );
}
