import { site } from "@/lib/data";

export type HostingType = "managed" | "unmanaged";
export type UnmanagedProvider = "verpex" | "spaceship" | "other";

/** Public /hosting page tab option */
export type HostingOption = "euan" | "spaceship" | "verpex";

export function parseHostingOption(
  value: string | null | undefined,
): HostingOption {
  if (value === "spaceship" || value === "verpex") return value;
  return "euan";
}

export function resolveHostingUrl(input: {
  hostingType: HostingType;
  unmanagedProvider?: UnmanagedProvider | null;
  otherUrl?: string | null;
}): string | null {
  if (input.hostingType !== "unmanaged") return null;

  switch (input.unmanagedProvider) {
    case "spaceship":
      return site.spaceshipAffiliate;
    case "verpex":
      return site.verpexAffiliate;
    case "other": {
      const url = input.otherUrl?.trim() || "";
      if (!url) return null;
      if (!/^https?:\/\//i.test(url)) return `https://${url}`;
      return url;
    }
    default:
      return null;
  }
}
