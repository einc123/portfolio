"use client";

import { useEffect } from "react";

/**
 * Cloudflare Web Analytics beacon (cookieless).
 * Set NEXT_PUBLIC_CF_BEACON_TOKEN from the Cloudflare dashboard.
 */
export function AnalyticsBeacon() {
  const token = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN?.trim();

  useEffect(() => {
    if (!token) return;

    const existing = document.getElementById("cf-web-analytics");
    if (existing) return;

    const script = document.createElement("script");
    script.id = "cf-web-analytics";
    script.defer = true;
    script.src = "https://static.cloudflareinsights.com/beacon.min.js";
    script.setAttribute("data-cf-beacon", JSON.stringify({ token }));
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [token]);

  return null;
}
