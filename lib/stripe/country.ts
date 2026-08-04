/** Map common country names to ISO 3166-1 alpha-2 for Stripe. */
const NAME_TO_ISO: Record<string, string> = {
  "united kingdom": "GB",
  uk: "GB",
  "great britain": "GB",
  england: "GB",
  scotland: "GB",
  wales: "GB",
  "northern ireland": "GB",
  "united states": "US",
  "united states of america": "US",
  usa: "US",
  "u.s.a.": "US",
  "u.s.": "US",
  ireland: "IE",
  "republic of ireland": "IE",
  france: "FR",
  germany: "DE",
  spain: "ES",
  italy: "IT",
  netherlands: "NL",
  belgium: "BE",
  portugal: "PT",
  australia: "AU",
  canada: "CA",
  "new zealand": "NZ",
};

export function toStripeCountryCode(country: string): string {
  const trimmed = country.trim();
  if (/^[A-Za-z]{2}$/.test(trimmed)) return trimmed.toUpperCase();
  return NAME_TO_ISO[trimmed.toLowerCase()] ?? trimmed.slice(0, 2).toUpperCase();
}
