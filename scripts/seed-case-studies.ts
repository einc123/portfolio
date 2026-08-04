import { resolve } from "path";
import { readFileSync } from "fs";
import {
  caseStudySeedProjects,
  caseStudySeedSeo,
  charityProjectSlugs,
  localProjectSlugs,
} from "../lib/caseStudySeed";
import {
  ensureOrganisationWithSlug,
  findCaseStudyByOrganisationId,
  upsertCaseStudy,
} from "../lib/caseStudies";

function loadEnvFile(filePath: string) {
  try {
    const raw = readFileSync(filePath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    /* optional */
  }
}

loadEnvFile(resolve(process.cwd(), ".env.local"));
loadEnvFile(resolve(process.cwd(), ".env"));

async function main() {
  const target = (process.argv[2] || "local").toLowerCase();
  if (target === "remote") {
    process.env.CLOUDFLARE_D1_MODE = "remote";
  } else {
    process.env.CLOUDFLARE_D1_MODE = "local";
  }

  const localSet = new Set<string>(localProjectSlugs);
  const charitySet = new Set<string>(charityProjectSlugs);
  let created = 0;
  let updated = 0;

  for (const project of caseStudySeedProjects) {
    const org = await ensureOrganisationWithSlug({
      name: project.title,
      slug: project.slug,
      description: project.summary,
    });

    const existing = await findCaseStudyByOrganisationId(org.id);
    const seo = caseStudySeedSeo[project.slug];

    await upsertCaseStudy({
      organisationId: org.id,
      slug: project.slug,
      title: project.title,
      url: project.url,
      logo: project.logo,
      logoLight: project.logoLight,
      services: project.services,
      featured: project.featured,
      summary: project.summary,
      overview: project.overview,
      challenge: project.challenge,
      solution: project.solution,
      outcome: project.outcome,
      designTools: project.designTools,
      stack: project.stack,
      colours: project.colours,
      highlights: project.highlights,
      year: project.year,
      seoTitle: seo?.title ?? null,
      seoDescription: seo?.description ?? null,
      seoHeadline: seo?.headline ?? null,
      showOnLocal: localSet.has(project.slug),
      showOnCharity: charitySet.has(project.slug),
    });

    if (existing) updated += 1;
    else created += 1;
    console.log(`${existing ? "UPDATE" : "CREATE"} ${project.slug} → org #${org.id}`);
  }

  console.log(
    `\nDone (${target}): ${created} created, ${updated} updated, ${caseStudySeedProjects.length} total.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
