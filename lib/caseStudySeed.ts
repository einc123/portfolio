import type { Project } from "./data";

/** One-time seed source for migrating static case studies into organisations. */
export const caseStudySeedProjects: Project[] = [
  {
    slug: "consultadhd",
    title: "ConsultADHD",
    url: "https://consultadhd.com/",
    logo: "/projects/consultadhd.png",
    logoLight: true,
    services: ["Web Design", "Web Development", "Brand Design"],
    featured: true,
    year: "2026",
    highlights: [
      "ADHD",
      "assessment",
      "diagnosis",
      "accessible",
      "pre-assessment",
      "clinical consultation",
      "accessibility",
    ],
    summary:
      "A calm, accessible digital home for private ADHD assessment — bridging the gap between diagnosis and effective care for adults and children.",
    overview:
      "ConsultADHD specialises in private ADHD assessment and diagnosis for adults and children across the UK. The service guides people from pre-assessment questionnaire through full clinical consultation, GP referral letters and treatment support plans — typically within 2–4 weeks. Online consultations, expert clinicians and NHS-standard reports sit at the heart of the offering, with accessibility options built into the site for patients who need them.",
    challenge:
      "ADHD journeys are often confusing and emotionally heavy. The brand and website needed to feel trustworthy and calming — not clinical or cold — while clearly explaining the path from discovery to diagnosis, pricing from £500, and how online assessment works for people who have waited years for clarity.",
    solution:
      "Brand and UI were designed in Figma, with logo and visual assets crafted in Illustrator and Photoshop. A teal-and-forest palette on a soft cream base signals care and focus. The site structure covers About, Services, Pre-Assessment and Contact, with patient stories, FAQs, staff login and built-in accessibility controls (contrast, spacing, motion reduction).",
    outcome:
      "ConsultADHD now has a professional, accessible presence that explains the assessment journey clearly, builds trust through patient stories, and gives people a straightforward route to start with a pre-assessment.",
    designTools: ["Figma", "Adobe Illustrator", "Adobe Photoshop"],
    stack: ["HTML", "CSS", "JavaScript", "PHP", "jQuery", "Bootstrap"],
    colours: [
      { name: "Teal", hex: "#039172" },
      { name: "Forest", hex: "#027A5F" },
      { name: "Deep Pine", hex: "#0B2F23" },
      { name: "Sage", hex: "#4A6358" },
      { name: "Cream", hex: "#F2EFE9" },
      { name: "Night", hex: "#071A13" },
    ],
  },
  {
    slug: "scoutcamp",
    title: "Scout Camp Management Platform",
    url: "https://scoutcamp.co.uk/",
    logo: "/projects/scoutcamp.png",
    services: ["Product Design", "Web Design", "Web Development"],
    featured: true,
    year: "2026",
    highlights: [
      "ScoutCamp",
      "Scout Camp",
      "registrations",
      "QR attendance",
      "camp operations",
      "800+",
      "offline-aware",
    ],
    summary:
      "Cloud camp operations for large Scout events — registrations, QR attendance, scheduling, transport and leader communications. Proven at 800+ people.",
    overview:
      "Scout Camp SCMP is a cloud management platform for large Scout camps. It covers registrations and records, QR attendance and lanyards, announcements, tasks and Kanban boards, risk assessments, insights, and optional add-ons such as parent portal, activity scheduling, minibus/transport, catering, medical & welfare, payments and jamboree hub tools. The product was originally developed for a Dunfermline District Scouts district camp and used to run an event of over 800 people — then expanded into the wider ScoutCamp platform.",
    challenge:
      "Large camps overwhelm spreadsheets: hundreds of young people and leaders need coordinated check-in, communications, transport and welfare tracking, often with patchy connectivity on site. District organisers needed one system that leaders could actually run under pressure.",
    solution:
      "Flows and interface were designed in Figma; brand and marketing visuals in Illustrator and Photoshop. The platform centres on camp operations — attendance, offline-aware sync, docs, analytics and modular add-ons — with a bold orange identity signalling energy and urgency for event week.",
    outcome:
      "Battle-tested at Dunfermline District scale (800+), ScoutCamp now packages those workflows for other large Scout events, with a public product site and launch path for wider adoption.",
    designTools: ["Figma", "Adobe Illustrator", "Adobe Photoshop"],
    stack: [
      "HTML",
      "CSS",
      "JavaScript",
      "PHP",
      "jQuery",
      "Bootstrap",
      "Databases",
    ],
    colours: [
      { name: "Camp Orange", hex: "#FF6B00" },
      { name: "Flame", hex: "#E85D00" },
      { name: "Ember", hex: "#C24100" },
      { name: "Glow", hex: "#FFA347" },
      { name: "Night", hex: "#1A0C04" },
    ],
  },
  {
    slug: "scoutingsite",
    title: "ScoutingSite",
    url: "https://scoutingsite.org.uk/",
    logo: "/projects/scoutingsite.png",
    logoLight: true,
    services: ["Product Design", "Web Design", "Web Development"],
    featured: true,
    year: "2025",
    highlights: [
      "ScoutingSite",
      "drag-and-drop",
      "OSM",
      "group email",
      "domains",
      "ScoutingSite AI",
      "GDPR",
    ],
    summary:
      "A website builder made for Scout groups, districts and counties — drag-and-drop sites, group email, domains and OSM-ready tools.",
    overview:
      "ScoutingSite is a professional website platform built for Scouting volunteers across the UK. Groups, districts and counties can launch a digital home with a drag-and-drop builder, GDPR-ready policies, SEO, Google Calendar integration, custom @yourgroup.org.uk email, and domain management. Premium features include OSM waiting-list integration and ScoutingSite AI for drafting pages and event copy in a Scout voice. Built by volunteers, for volunteers — developed under <! Euan MBCS />.",
    challenge:
      "Most Scout websites are outdated, hard to edit, or stuck on personal Gmail contact chains. Trustees need GDPR-friendly tooling, parents expect mobile-first clarity, and leaders don’t have time for complex CMS back-ends.",
    solution:
      "Product UI and marketing were designed in Figma, with brand assets in Illustrator and Photoshop. The platform combines a visual builder, pricing for Basic/Premium website plans and Basecamp/Summit email tiers, domain search, knowledge base and support — all in Scout purple with a focus on fast setup and trustee-friendly compliance.",
    outcome:
      "Scout groups can stand up a professional presence in minutes, keep communications on group-owned email, and manage recruitment forms that feed into OSM — without fighting a generic website tool.",
    designTools: ["Figma", "Adobe Illustrator", "Adobe Photoshop"],
    stack: [
      "HTML",
      "CSS",
      "JavaScript",
      "PHP",
      "jQuery",
      "Bootstrap",
      "Databases",
    ],
    colours: [
      { name: "Scout Purple", hex: "#590083" },
      { name: "Violet", hex: "#5D2D91" },
      { name: "Deep Purple", hex: "#4B2475" },
      { name: "Lilac Mist", hex: "#F3EFF9" },
      { name: "White", hex: "#FFFFFF" },
    ],
  },
  {
    slug: "kasc",
    title: "Kinross After School Club",
    url: "https://kasc.scot/",
    logo: "/projects/kasc.png",
    services: ["Web Design", "Web Development", "Brand Design"],
    featured: true,
    year: "2024",
    highlights: [
      "Kinross After School Club",
      "KASC",
      "wraparound",
      "childcare",
      "enrolment",
      "Care Inspectorate",
      "brand",
    ],
    summary:
      "A warm, playful digital home for a Kinross charity providing wraparound childcare — brand, site and parent-facing information in one clear system.",
    overview:
      "Kinross After School Club (KASC) is a non-profit registered charity established in 1991, based in Kinross Primary School. The club delivers affordable wraparound childcare with a focus on inclusive play, healthy eating and positive learning experiences for local families. The brief was to give KASC a distinctive brand and a website that parents could trust — covering enrolment, policies, team information and Care Inspectorate transparency.",
    challenge:
      "Parents needed quick answers about sessions, location and joining, while the club also had to surface statutory information (policies, reports, duty of candour) without feeling cold or corporate. The previous presence lacked a cohesive identity that matched the energy of the setting.",
    solution:
      "I designed a colourful, child-friendly brand mark in Illustrator and Photoshop, then prototyped the full site experience in Figma. The build uses a clear information architecture — Home, Information, Parent Zone and Join Us — with bright cyan accents and friendly illustration to mirror the club’s positivity-and-play ethos.",
    outcome:
      "KASC now has a recognisable brand and a structured site that supports enrolment for the school year, builds trust with Care Inspectorate and charity credentials, and gives parents a straightforward path into the club.",
    designTools: ["Figma", "Adobe Illustrator", "Adobe Photoshop"],
    stack: ["HTML", "CSS", "JavaScript", "PHP", "jQuery", "Bootstrap"],
    colours: [
      { name: "Sky", hex: "#5DCDF6" },
      { name: "Ocean", hex: "#139DCF" },
      { name: "Play Red", hex: "#E74C3C" },
      { name: "Leaf", hex: "#58D68D" },
      { name: "Sunny", hex: "#F39C12" },
      { name: "Ink", hex: "#1B1B1B" },
    ],
  },
  {
    slug: "fife-cycle-speedway",
    title: "Fife Cycle Speedway",
    url: "https://fifecyclespeedway.com/",
    logo: "/projects/fife-cycle-speedway.svg",
    services: ["Web Design", "Web Development"],
    featured: true,
    year: "2024",
    highlights: [
      "Fife Cycle Speedway",
      "cycle speedway",
      "live scores",
      "riders",
      "race-day",
      "league",
    ],
    summary:
      "A high-energy club site for Scotland’s fastest grassroots cycling sport — riders, results, live scores and joining info in one place.",
    overview:
      "Fife Cycle Speedway (the Fastbowl / Fife Revolutions) races at Broomhead Parks in Dunfermline. Cycle speedway is a short, physical outdoor track sport — typically four laps lasting around 35–40 seconds. The club needed a digital presence that matched the pace of the sport: team data, news, honours, socials and a live score experience for race days.",
    challenge:
      "Club information was fragmented across social channels. Parents, riders and fans needed a single source of truth for training times, committee contacts, results and league standing — with a look that felt competitive rather than generic.",
    solution:
      "Designed in Figma with brand assets refined in Illustrator and Photoshop, the site centres on bold blues and race-day red. Sections cover Team (riders, averages, results, league table), News, About, Honours and Join Us, plus a live score entry point for match days.",
    outcome:
      "The club now has a dedicated platform that supports recruitment, race-day engagement and year-round communication from their Dunfermline track base.",
    designTools: ["Figma", "Adobe Illustrator", "Adobe Photoshop"],
    stack: ["HTML", "CSS", "JavaScript", "PHP", "jQuery", "Bootstrap"],
    colours: [
      { name: "Track Blue", hex: "#1C5EAD" },
      { name: "Deep Blue", hex: "#153D6E" },
      { name: "Race Red", hex: "#DC3545" },
      { name: "Ash", hex: "#EFEFEF" },
      { name: "Ink", hex: "#1B1B1B" },
    ],
  },
  {
    slug: "dunfermline-scouts",
    title: "Dunfermline District Scouts",
    url: "https://dunfermline-scouts.org.uk/",
    logo: "/projects/dunfermline-scouts.png",
    services: ["Web Design", "Web Development"],
    featured: false,
    year: "2024",
    highlights: [
      "Dunfermline District Scouts",
      "ScoutCamp",
      "800+",
      "volunteering",
      "camping",
      "Youth Shaped",
    ],
    summary:
      "District-level Scout website covering sections, volunteering, camping and youth-shaped programmes — and the original home of ScoutCamp for an 800+ person district event.",
    overview:
      "Dunfermline District Scouts supports young people across Fife through Squirrels, Beavers, Cubs, Scouts, Explorers and Network. The district site connects families to sections, volunteering routes, camping (including Nine Acres and Fordell Firs), news and the wider Scouts Scotland ecosystem. It was also the catalyst for ScoutCamp: I originally developed the Scout Camp Management Platform for a Dunfermline District camp, where it was used to run an event of over 800 people — registrations, attendance and on-the-ground operations at district scale.",
    challenge:
      "District sites must serve parents, young people and adult volunteers at once — with clear routes into joining, leadership and camping — while respecting Scouts Scotland branding guidelines. Separately, running a large district camp exposed how spreadsheets and ad-hoc tools fall short when hundreds of young people and leaders need coordinated registrations, check-in and communications.",
    solution:
      "Wireframes and UI for the public district site were designed in Figma; district assets were refined in Illustrator and Photoshop. The build organises content around Youth Shaped sections, Camping, Volunteering and District Team/Trustees, using Scout blue as the primary signal colour. In parallel, the first ScoutCamp management platform was built specifically for that district camp — proving the workflow that later became scoutcamp.co.uk.",
    outcome:
      "A clearer district gateway for families and volunteers, plus a battle-tested camp operations system that successfully supported an 800+ person Dunfermline District event and seeded the ScoutCamp product.",
    designTools: ["Figma", "Adobe Illustrator", "Adobe Photoshop"],
    stack: ["HTML", "CSS", "JavaScript", "PHP", "jQuery", "Bootstrap"],
    colours: [
      { name: "Scout Blue", hex: "#0161CE" },
      { name: "Bright Blue", hex: "#006EE0" },
      { name: "White", hex: "#FFFFFF" },
      { name: "Ink", hex: "#1B1B1B" },
    ],
  },
  {
    slug: "nine-acres",
    title: "Nine Acres Memorial Campsite",
    url: "https://nineacres.org.uk/",
    logo: "/projects/nine-acres.png",
    services: ["Web Design", "Web Development", "Brand Design"],
    featured: false,
    year: "2024",
    highlights: [
      "Nine Acres",
      "Memorial Campsite",
      "booking",
      "Facilities",
      "outdoor",
    ],
    summary:
      "A calm, practical site for a Scout memorial campsite in Fife — facilities, directions and booking in a respectful tone.",
    overview:
      "Nine Acres Memorial Campsite sits in the heart of Fife and is connected with 2nd Fife Scouts and Dunfermline District Scouts. Visiting groups need more than a pretty landscape photo: they need pitch practicality, facility lists, directions that work on a phone in the car park, and a booking route that doesn’t feel bureaucratic. The brief was to keep the memorial character front of mind while making the campsite easy to plan around — for Scout sections, leaders and trustees alike.",
    challenge:
      "Memorial sites can tip into either cold formality or vague brochure copy. Booking and practical information had to feel easy for groups planning a weekend, without losing respect for the memorial context or clashing with Scouts Scotland identity guidelines.",
    solution:
      "Brand and layout were developed in Figma with Illustrator/Photoshop artwork. A green-led palette evokes the outdoor setting, with focused pages for Facilities, Directions, Contact and Book Now — short paragraphs, scannable lists and a booking CTA that stays visible without shouting.",
    outcome:
      "Groups can plan visits confidently, with a clearer booking path and a visual identity that feels grounded in Fife rather than a generic campsite template.",
    designTools: ["Figma", "Adobe Illustrator", "Adobe Photoshop"],
    stack: ["HTML", "CSS", "JavaScript", "PHP", "jQuery", "Bootstrap"],
    colours: [
      { name: "Canopy Green", hex: "#81A23D" },
      { name: "White", hex: "#FFFFFF" },
      { name: "Forest Ink", hex: "#2C3A1A" },
      { name: "Moss", hex: "#5F7A2C" },
    ],
  },
  {
    slug: "2nd-fife-scouts",
    title: "2nd Fife Scouts",
    url: "https://2ndfifescouts.org.uk/",
    logo: "/projects/2nd-fife-scouts.png",
    services: ["Web Design", "Web Development"],
    featured: false,
    year: "2024",
    highlights: [
      "2nd Fife Scouts",
      "Nine Acres",
      "volunteering",
      "Squirrels",
      "Network",
    ],
    summary:
      "Group website for 2nd Fife (Dunfermline) Scouts — sections, Nine Acres links and volunteering made simple.",
    overview:
      "2nd Fife (Dunfermline) Scout Group is a registered Scottish charity serving young people from Squirrels through Network. The group is closely linked with Nine Acres Memorial Campsite and needed a clear digital base for section ages, joining, hall/vehicle bookings and volunteering — without burying parents in district-level noise.",
    challenge:
      "Parents and leaders needed one place for section ages, joining and campsite connections. The site had to align with Scouts Scotland assets yet still feel distinctive to the group, so it didn’t read as a copy-paste district template.",
    solution:
      "Designed in Figma with supporting artwork in Illustrator and Photoshop. A burgundy/plum accent sets the group apart within the Dunfermline District family, with navigation for Sections, Nine Acres, Volunteering and Joining — short routes into the actions people actually take.",
    outcome:
      "A clearer group presence that supports recruitment in Dunfermline and day-to-day communication for leaders and families, with Nine Acres only a click away.",
    designTools: ["Figma", "Adobe Illustrator", "Adobe Photoshop"],
    stack: ["HTML", "CSS", "JavaScript", "PHP", "jQuery", "Bootstrap"],
    colours: [
      { name: "Group Plum", hex: "#72254E" },
      { name: "White", hex: "#FFFFFF" },
      { name: "Deep Plum", hex: "#4A1833" },
      { name: "Soft Rose", hex: "#F3E6EC" },
    ],
  },
  {
    slug: "3rd-fife-scouts",
    title: "3rd Fife Scouts",
    url: "https://3rdfifescouts.org.uk/",
    logo: "/projects/3rd-fife-scouts.png",
    services: ["Web Design", "Web Development"],
    featured: false,
    year: "2024",
    highlights: [
      "3rd Fife Scouts",
      "Royal British Legion",
      "volunteering",
      "joining",
      "Beavers",
    ],
    summary:
      "Clean group site for 3rd Fife (Royal British Legion) Scouts — programmes, volunteering and joining at a glance.",
    overview:
      "3rd Fife (Royal British Legion) Scout Group is a registered Scottish charity in Dunfermline. The website introduces Beavers through Network, plus routes for leaders and new joiners, within the wider Dunfermline District and Scouts Scotland network — aimed at busy parents who will only give the homepage a few seconds.",
    challenge:
      "The group needed a welcoming, easy-to-scan site that felt energetic for young people while remaining clear for parents and adult volunteers. Legion heritage and Scout branding both matter; neither should dominate the other.",
    solution:
      "UI designed in Figma; logo treatments and graphics refined in Illustrator and Photoshop. A warm gold/yellow accent gives the group a bright, optimistic identity across section and volunteering pages, with joining and volunteering CTAs kept obvious on mobile.",
    outcome:
      "Families in Dunfermline can quickly understand what’s on offer and how to get involved, with a consistent local Scout identity that still feels specific to 3rd Fife.",
    designTools: ["Figma", "Adobe Illustrator", "Adobe Photoshop"],
    stack: ["HTML", "CSS", "JavaScript", "PHP", "jQuery", "Bootstrap"],
    colours: [
      { name: "Legion Gold", hex: "#EDC853" },
      { name: "Warm Gold", hex: "#D4A017" },
      { name: "White", hex: "#FFFFFF" },
      { name: "Ink", hex: "#1B1B1B" },
    ],
  },
  {
    slug: "euanliv",
    title: "Euan Livingstone Portfolio",
    url: "https://euanliv.click/",
    logo: "/projects/euanliv.svg",
    services: ["Web Design", "Web Development", "Brand Design"],
    featured: false,
    year: "2026",
    highlights: [
      "euanliv.click",
      "portfolio",
      "typewriter",
      "accent",
      "case studies",
      "Google Calendar",
      "MBCS",
    ],
    summary:
      "My own portfolio rebuilt in Next.js — a minimalist personal site with motion, theming and case studies that doubles as a live product demo.",
    overview:
      "euanliv.click is the public face of my freelance work: selected projects, about, charity and local Dunfermline pages, contact, and Google Calendar booking. The brief was self-imposed — replace an older portfolio with something quieter and more intentional, close to references like restrained European studio sites, while still feeling personal to a Fife-based designer–developer with an MBCS membership.",
    challenge:
      "A portfolio has to prove craft without shouting. It needs fast performance, clear case studies, booking without friction, and enough personality that it doesn’t look like a generic template — plus light/dark modes and a system that can grow as projects ship.",
    solution:
      "Designed and built in Next.js, React and TypeScript with Tailwind CSS. The experience includes a code-style boot intro, a typewriter hero, session-based accent colours (with a footer hue swapper), frosted sticky navigation, Discord presence, live UK clock, SEO-ready case study routes and structured data, plus integrated Google Calendar consultations.",
    outcome:
      "A production portfolio that works as both marketing site and case study in its own right — showing how I design systems, ship front-end detail and keep charity/local work visible alongside commercial projects.",
    designTools: ["Figma", "Adobe Illustrator", "Adobe Photoshop"],
    stack: [
      "HTML",
      "CSS",
      "JavaScript",
      "TypeScript",
      "React",
      "Next.js",
      "Tailwind CSS",
    ],
    colours: [
      { name: "Accent Teal", hex: "#0F5C4C" },
      { name: "Signal Mint", hex: "#5FBFA8" },
      { name: "Ink", hex: "#0A0E0C" },
      { name: "Mist", hex: "#F4F6F5" },
      { name: "Glow", hex: "#B8D4C8" },
    ],
  },
  {
    slug: "coasters-and-crafters",
    title: "Coasters & Crafters",
    url: "https://coastersandcrafters.com/",
    logo: "/projects/coasters-and-crafters.png",
    logoLight: true,
    services: ["Web Design", "Web Development"],
    featured: true,
    year: "2025",
    highlights: [
      "Coasters & Crafters",
      "Atlas",
      "Minecraft",
      "creators",
      "communities",
    ],
    summary:
      "A community platform for Minecraft creators, parks and theme-park builders — now evolving into Atlas with a dark, high-visibility interface.",
    overview:
      "Coasters & Crafters is a community-driven platform where Minecraft creators, developers and community leaders connect, advertise and grow. The product serves theme-park builders, Discord communities and creative networks — with directories, news, events and livestream features. The brand is transitioning toward Atlas as an expanded evolution of the platform.",
    challenge:
      "The audience expects a modern, app-like experience that can surface many communities without feeling cluttered. The design needed a dark visual language that felt premium for creators while remaining usable for discovery and onboarding.",
    solution:
      "UI and flows were designed in Figma, with logo and marketing assets crafted in Illustrator and Photoshop. The live product is built on Next.js and React with a cyan-on-dark palette, community cards, search and a clear path for groups to start building their presence ahead of the Atlas relaunch.",
    outcome:
      "Creators get a dedicated home to promote Minecraft parks and communities, with a scalable front-end foundation ready for the next brand chapter.",
    designTools: ["Figma", "Adobe Illustrator", "Adobe Photoshop"],
    stack: ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js"],
    colours: [
      { name: "Signal Cyan", hex: "#16C3FD" },
      { name: "Deep Teal", hex: "#087990" },
      { name: "Ocean", hex: "#0C699D" },
      { name: "Frost", hex: "#CFF4FC" },
      { name: "Night", hex: "#303030" },
      { name: "Ink", hex: "#000000" },
    ],
  },
  {
    slug: "community-barter",
    title: "Community Barter",
    url: "https://communitybarter.co.uk/",
    logo: "/projects/community-barter.png",
    logoLight: true,
    services: ["Web Design", "Web Development", "Brand Design"],
    featured: false,
    year: "2023",
    highlights: [
      "Community Barter",
      "skills-sharing",
      "barter",
      "Edinburgh",
      "Lothians",
    ],
    summary:
      "Brand and platform for a local skills-sharing network across Edinburgh & the Lothians — connect, offer and receive without cash.",
    overview:
      "Community Barter is a skills-sharing platform where people in the same villages or towns exchange favours — walking a dog for mowing a lawn, tech help for home baking, and more. The product offers a secure connection layer for local communities, with ideas, pricing and barter flows for Edinburgh & the Lothians.",
    challenge:
      "Bartering can feel informal and hard to trust online. The brand and interface needed to feel simple, secure and neighbourly — encouraging people to start exchanging skills without friction.",
    solution:
      "A minimal black-and-white identity was crafted in Illustrator and Photoshop, with product flows prototyped in Figma. The site leads with clear propositions (“If you… I will…”), example barters, and paths to Barter Now / Login.",
    outcome:
      "A distinctive local platform identity and web experience that frames bartering as practical community connection rather than a marketplace.",
    designTools: ["Figma", "Adobe Illustrator", "Adobe Photoshop"],
    stack: ["HTML", "CSS", "JavaScript", "PHP", "jQuery", "Bootstrap"],
    colours: [
      { name: "Ink", hex: "#000000" },
      { name: "Charcoal", hex: "#3A3A3A" },
      { name: "Silver", hex: "#939393" },
      { name: "Mist", hex: "#E3E3E3" },
      { name: "White", hex: "#FFFFFF" },
    ],
  },
];

export const caseStudySeedSeo: Record<
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

export const charityProjectSlugs = [

  "fife-cycle-speedway",
  "kasc",
  "dunfermline-scouts",
  "2nd-fife-scouts",
  "3rd-fife-scouts",
  "nine-acres",

] as const;
