/** Editable defaults on the admin “Send contract” form. */
export const DEFAULT_CONTRACT_PARTICULARS = {
  scope: [
    "Website design and build for the Client’s organisation, including the agreed pages, responsive layout, and basic SEO setup as discussed.",
    "",
    "Out of scope unless agreed in writing: copywriting, photography, ongoing marketing, and third-party app integrations beyond those listed.",
  ].join("\n"),
  fees: [
    "Total Fee: £0",
    "Deposit: £0 non-refundable (due on signing / to secure the slot)",
    "Final balance: due on completion / before go-live",
  ].join("\n"),
  timeline: [
    "Design: 2 weeks",
    "Build: 3 weeks",
    "Launch target: to be confirmed",
    "Dependent on timely Client feedback and materials.",
  ].join("\n"),
  notes: "None.",
} as const;

export const PHOTOGRAPHY_PARTICULARS = {
  scope: [
    "Photography coverage for the Client as agreed (hours, locations, and shot list).",
    "Edited digital gallery / delivery as agreed.",
    "Out of scope unless agreed: second shooter, printing, albums, drone, or video.",
  ].join("\n"),
  fees: [
    "Total Fee: £0",
    "Deposit: £0 non-refundable (due on signing / to secure the date)",
    "Final balance: due before / on the shoot date as agreed",
  ].join("\n"),
  timeline: [
    "Shoot date: to be confirmed",
    "Edited delivery: within 21 days of the shoot (unless otherwise agreed)",
  ].join("\n"),
  notes: "None.",
} as const;

export const DRONE_PHOTOGRAPHY_PARTICULARS = {
  scope: [
    "Drone photography / aerial stills (and/or short aerial clips if agreed) for the Client.",
    "CAA-compliant operation within permitted weather and airspace.",
    "Edited digital delivery as agreed.",
    "Out of scope unless agreed: manned photography, full video production, night flights, or flights in restricted zones requiring special permission.",
  ].join("\n"),
  fees: [
    "Total Fee: £0",
    "Deposit: £0 non-refundable (due on signing / to secure the date)",
    "Final balance: due before / on the flight date as agreed",
  ].join("\n"),
  timeline: [
    "Flight date: to be confirmed (weather dependent)",
    "Edited delivery: within 14 days of a successful flight (unless otherwise agreed)",
  ].join("\n"),
  notes: "None.",
} as const;

export const BAGPIPES_PARTICULARS = {
  scope: "Wedding",
  fees: "£0",
  notes: "None.",
} as const;

export function particularsForTemplateSlug(slug: string | null | undefined) {
  switch (slug) {
    case "photography":
      return PHOTOGRAPHY_PARTICULARS;
    case "drone-photography":
      return DRONE_PHOTOGRAPHY_PARTICULARS;
    case "bagpipes":
      return {
        scope: BAGPIPES_PARTICULARS.scope,
        fees: BAGPIPES_PARTICULARS.fees,
        timeline: "",
        notes: BAGPIPES_PARTICULARS.notes,
      };
    default:
      return DEFAULT_CONTRACT_PARTICULARS;
  }
}

export function isBagpipesTemplateSlug(slug: string | null | undefined) {
  return slug === "bagpipes";
}

export type ContractParticularField = "scope" | "fees" | "timeline" | "notes";

/** Which particulars placeholders appear in a template body (client-safe). */
export function getParticularsFieldsUsed(
  html: string,
): ContractParticularField[] {
  const fields: ContractParticularField[] = [];
  if (html.includes("{{scope}}")) fields.push("scope");
  if (html.includes("{{fees}}")) fields.push("fees");
  if (html.includes("{{timeline}}")) fields.push("timeline");
  if (html.includes("{{notes}}")) fields.push("notes");
  return fields;
}
