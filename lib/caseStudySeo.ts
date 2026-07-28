import { projects, site } from "@/lib/data";

/** Per–case-study meta + on-page headline — unique for search, not a formula. */
export const caseStudySeo: Record<
  string,
  { title: string; description: string; headline: string }
> = {
  consultadhd: {
    title: "ConsultADHD website & brand — calm ADHD assessment UX",
    description:
      "How I designed and built ConsultADHD.com: a trustworthy UK private ADHD assessment site with accessible UI, clear patient journeys and brand work in Figma, Illustrator and Photoshop.",
    headline:
      "A clinical service that still feels human — teal brand, patient stories and a path from discovery to pre-assessment.",
  },
  scoutcamp: {
    title: "ScoutCamp platform design — camp ops for 800+ people",
    description:
      "Product design and development for ScoutCamp: QR attendance, registrations and camp operations, proven at a Dunfermline District Scout camp of over 800 people.",
    headline:
      "Spreadsheets don’t scale on camp week. One operations platform for registrations, attendance and leader workflows.",
  },
  scoutingsite: {
    title: "ScoutingSite — website builder for Scout groups UK",
    description:
      "Case study for ScoutingSite.org.uk: a drag-and-drop Scout website platform with group email, domains, GDPR-ready pages and OSM waiting-list tools for UK volunteers.",
    headline:
      "Built by volunteers, for volunteers — websites, email and trustee-friendly tools without a generic CMS fight.",
  },
  kasc: {
    title: "Kinross After School Club brand & website",
    description:
      "Brand identity and website for Kinross After School Club (KASC.scot): wraparound childcare, enrolment and Care Inspectorate transparency for Kinross families.",
    headline:
      "Playful colour with serious trust signals — enrolment, policies and charity credentials parents can scan fast.",
  },
  "fife-cycle-speedway": {
    title: "Fife Cycle Speedway club website — Dunfermline track",
    description:
      "Web design for Fife Cycle Speedway: riders, results, live scores and joining info for Scotland’s grassroots cycle speedway club in Dunfermline.",
    headline:
      "Race-day energy online — team data, news and live scores from Broomhead Parks in one place.",
  },
  "coasters-and-crafters": {
    title: "Coasters & Crafters / Atlas — Minecraft creator platform",
    description:
      "Next.js product UI for Coasters & Crafters (evolving into Atlas): a dark, high-visibility home for Minecraft creators, parks and communities.",
    headline:
      "Creator directories and community discovery with an app-like cyan-on-dark interface ready for the Atlas chapter.",
  },
  "dunfermline-scouts": {
    title: "Dunfermline District Scouts website & ScoutCamp origin",
    description:
      "District Scout site for Dunfermline families and volunteers — and the original 800+ person camp that seeded the ScoutCamp management platform.",
    headline:
      "A clearer district gateway for Fife Scouting, plus the camp that proved large-scale operations software.",
  },
  "nine-acres": {
    title: "Nine Acres Memorial Campsite website — Fife",
    description:
      "Respectful web design for Nine Acres Memorial Campsite: facilities, directions and booking for Scout groups camping in the heart of Fife.",
    headline:
      "Practical camp planning with a tone that honours the memorial setting — green, calm and bookable.",
  },
  "2nd-fife-scouts": {
    title: "2nd Fife Scouts group website — Dunfermline",
    description:
      "Group website for 2nd Fife (Dunfermline) Scouts: sections from Squirrels to Network, Nine Acres links and volunteering paths for local families.",
    headline:
      "One digital base for a Dunfermline Scout group — sections, volunteering and campsite connections.",
  },
  "3rd-fife-scouts": {
    title: "3rd Fife Scouts website — Royal British Legion Dunfermline",
    description:
      "Clean group site for 3rd Fife (Royal British Legion) Scouts in Dunfermline: programmes, volunteering and joining within the district network.",
    headline:
      "Bright, parent-friendly pages for Beavers through Network — easy to scan, easy to join.",
  },
  euanliv: {
    title: "Euan Livingstone portfolio — Next.js personal site case study",
    description:
      "How I designed and built euanliv.click: a Next.js portfolio with motion, accent theming, case studies, charity pages and Google Calendar booking.",
    headline:
      "A living product demo — minimalist craft, system theming and case studies on the site that sells the work.",
  },
  "community-barter": {
    title: "Community Barter brand & platform — Edinburgh & Lothians",
    description:
      "Brand and web experience for Community Barter: a skills-sharing network across Edinburgh and the Lothians where neighbours exchange favours without cash.",
    headline:
      "Neighbourly, not marketplace — black-and-white identity for local skills exchange.",
  },
};

export function getCaseStudySeo(slug: string) {
  const project = projects.find((item) => item.slug === slug);
  const custom = caseStudySeo[slug];

  if (custom) return custom;

  return {
    title: project ? `${project.title} case study` : "Case study",
    description: project
      ? `${project.summary} Design and development by ${site.name} MBCS.`
      : `Web design case study by ${site.name}.`,
    headline: project?.summary ?? "",
  };
}

/** Projects with a strong Dunfermline / Fife footprint for the local landing. */
export const localProjectSlugs = [
  "consultadhd",
  "scoutcamp",
  "dunfermline-scouts",
  "fife-cycle-speedway",
  "nine-acres",
  "2nd-fife-scouts",
  "3rd-fife-scouts",
  "kasc",
] as const;

/** Charity / community organisations highlighted on the charity page. */
export const charityProjectSlugs = [
  "fife-cycle-speedway",
  "kasc",
  "dunfermline-scouts",
  "2nd-fife-scouts",
  "3rd-fife-scouts",
  "nine-acres",
] as const;
