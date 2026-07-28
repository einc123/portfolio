import { site } from "@/lib/data";

/** Shared SEO copy used across metadata and structured data. */
export const seo = {
  titleDefault: `${site.name} — ${site.title}`,
  titleTemplate: `%s — ${site.brand}`,
  description:
    "Web designer and developer in Dunfermline, Scotland. Euan Livingstone MBCS builds fast, accessible websites — from brand and UI design in Figma through to production-ready development and SEO.",
  keywords: [
    "Euan Livingstone",
    "web designer Dunfermline",
    "web developer Dunfermline",
    "web designer Fife",
    "web developer Scotland",
    "MBCS",
    "portfolio",
    "Figma",
    "Next.js",
    "UI UX design",
    "brand design",
    "SEO",
    "Edinburgh Napier",
  ],
  ogDescription:
    "Crafting clear, production-ready websites with six years of design and development practice — based in Dunfermline, Scotland.",
  local: {
    title: "Web designer & developer in Dunfermline — Euan Livingstone MBCS",
    description:
      "Freelance web designer and developer based in Dunfermline, Fife. Local sites for Scout groups, clubs and charities — plus remote work for UK clients. Book a chat with Euan Livingstone MBCS.",
    ogDescription:
      "Independent web design and development from Dunfermline — clear sites for local organisations and remote UK projects.",
  },
} as const;

export type BreadcrumbItem = {
  name: string;
  path: string;
};

export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${site.url}/#person`,
    name: site.name,
    url: site.url,
    email: site.email,
    jobTitle: site.title,
    description: seo.description,
    image: `${site.url}/android-chrome-512x512.png`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Dunfermline",
      addressRegion: "Scotland",
      addressCountry: "GB",
    },
    alumniOf: [
      {
        "@type": "CollegeOrUniversity",
        name: "Edinburgh Napier University",
      },
      {
        "@type": "CollegeOrUniversity",
        name: "Edinburgh College",
      },
    ],
    memberOf: {
      "@type": "Organization",
      name: "BCS, The Chartered Institute for IT",
    },
    sameAs: [site.linkedin],
    knowsAbout: [
      "Web design",
      "Web development",
      "UI/UX design",
      "Brand design",
      "Search engine optimisation",
      "Next.js",
      "React",
      "Figma",
    ],
  };
}

/**
 * Freelance professional offering — person-led, not a shopfront LocalBusiness.
 * Useful for local “web designer Dunfermline” style queries.
 */
export function professionalServiceJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${site.url}/#service`,
    name: `${site.name} — Web Design & Development`,
    url: site.url,
    description: seo.local.description,
    image: `${site.url}/android-chrome-512x512.png`,
    email: site.email,
    provider: {
      "@type": "Person",
      "@id": `${site.url}/#person`,
      name: site.name,
      url: site.url,
    },
    founder: {
      "@type": "Person",
      "@id": `${site.url}/#person`,
      name: site.name,
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Dunfermline",
      addressRegion: "Fife",
      addressCountry: "GB",
    },
    areaServed: [
      {
        "@type": "City",
        name: "Dunfermline",
      },
      {
        "@type": "AdministrativeArea",
        name: "Fife",
      },
      {
        "@type": "Country",
        name: "United Kingdom",
      },
    ],
    serviceType: [
      "Web design",
      "Web development",
      "Brand design",
      "UI/UX design",
      "Search engine optimisation",
    ],
    knowsLanguage: ["en-GB"],
    sameAs: [site.linkedin],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    name: `${site.name} Portfolio`,
    url: site.url,
    description: seo.description,
    inLanguage: "en-GB",
    author: {
      "@type": "Person",
      "@id": `${site.url}/#person`,
      name: site.name,
    },
    publisher: {
      "@type": "Person",
      "@id": `${site.url}/#person`,
      name: site.name,
    },
  };
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.path.startsWith("http")
        ? item.path
        : `${site.url}${item.path === "/" ? "" : item.path}`,
    })),
  };
}

export function caseStudyJsonLd(input: {
  title: string;
  description: string;
  path: string;
  datePublished?: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: input.title,
    description: input.description,
    url: `${site.url}${input.path}`,
    image: input.image
      ? input.image.startsWith("http")
        ? input.image
        : `${site.url}${input.image}`
      : undefined,
    datePublished: input.datePublished,
    inLanguage: "en-GB",
    author: {
      "@type": "Person",
      "@id": `${site.url}/#person`,
      name: site.name,
    },
    creator: {
      "@type": "Person",
      "@id": `${site.url}/#person`,
      name: site.name,
    },
    about: {
      "@type": "ProfessionalService",
      "@id": `${site.url}/#service`,
    },
  };
}
