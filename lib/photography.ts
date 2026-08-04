export const photographyPage = {
  eyebrow: "Photography",
  title: "Light, place, and altitude.",
  intro:
    "Freelance stills and licensed drone photography for clients who need considered images of architecture, locations, events, property, and landscape. Based in Dunfermline, available across Scotland subject to travel costs and location.",
  ground: {
    title: "Still photography",
    body: "Basic photography sessions on a Fujifilm X-M5 — clean, deliberate frames of buildings, streets, venues, and moments. Suited to clients who want honest location photography without a full studio production.",
  },
  aerial: {
    title: "Drone photography",
    body: "Basic aerial photography as a licensed drone operator with public liability insurance. Elevated views of property, venues, landscape, and site context when the ground can’t tell the whole story — subject to weather, airspace, and suitability of the location.",
  },
  gear: [
    {
      name: "Fujifilm X-M5",
      role: "Camera",
      detail:
        "APS-C stills camera for location and client photography — colour, detail, and a compact kit built for real-world shoots.",
    },
    {
      name: "DJI Mini 3",
      role: "Aerial",
      detail:
        "Licensed DJI Mini 3 flights with public liability insurance for controlled, compliant aerial photography.",
    },
  ],
  notes: [
    "Travel and location costs apply outside the local area.",
    "Drone flights depend on weather, airspace rules, and site suitability.",
    "Sessions are basic photography and aerial coverage — not a full production studio or film crew.",
  ],
  cta: {
    eyebrow: "Book a shoot",
    title: "Tell me the place and the light you need.",
    body: "Still photography, licensed drone work, or both — I’ll check location, travel, and whether aerial is possible before anything is booked.",
  },
} as const;

export const photographyImages = [
  {
    src: "/photography/DSCF0048.JPG",
    alt: "The Balmoral Hotel, Edinburgh — architectural street photograph",
  },
  {
    src: "/photography/DSCF0055.JPG",
    alt: "Edinburgh street and architecture — photograph by Euan Livingstone",
  },
  {
    src: "/photography/DSCF0057.JPG",
    alt: "Urban architecture detail — photograph by Euan Livingstone",
  },
  {
    src: "/photography/DSCF0060.JPG",
    alt: "The Balmoral Hotel and street scene, Edinburgh",
  },
  {
    src: "/photography/DSCF0065.JPG",
    alt: "City architecture under open sky — photograph by Euan Livingstone",
  },
  {
    src: "/photography/DSCF0068.JPG",
    alt: "Street-level architectural photograph by Euan Livingstone",
  },
  {
    src: "/photography/DSCF0077.JPG",
    alt: "Location photograph by Euan Livingstone",
  },
] as const;
