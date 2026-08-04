import {
  execute,
  queryRows,
  slugify,
  type SqlParams,
} from "@/lib/db";
import type { Project } from "@/lib/data";
import { caseStudySeedProjects } from "@/lib/caseStudySeed";

export type DbCaseStudy = {
  organisation_id: number;
  slug: string;
  title: string;
  url: string;
  logo: string;
  logo_light: number;
  services_json: string;
  featured: number;
  summary: string;
  overview: string;
  challenge: string;
  solution: string;
  outcome: string;
  design_tools_json: string;
  stack_json: string;
  colours_json: string;
  highlights_json: string | null;
  year: string;
  seo_title: string | null;
  seo_description: string | null;
  seo_headline: string | null;
  show_on_local: number;
  show_on_charity: number;
};

export type CaseStudyInput = {
  organisationId: number;
  slug: string;
  title: string;
  url: string;
  logo: string;
  logoLight?: boolean;
  services: string[];
  featured?: boolean;
  summary: string;
  overview: string;
  challenge: string;
  solution: string;
  outcome: string;
  designTools: string[];
  stack: string[];
  colours: { name: string; hex: string }[];
  highlights?: string[];
  year: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoHeadline?: string | null;
  showOnLocal?: boolean;
  showOnCharity?: boolean;
};

export type CaseStudySeo = {
  title: string;
  description: string;
  headline: string;
};

function parseJsonArray<T>(raw: string | null | undefined, fallback: T[]): T[] {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

export function mapCaseStudyRow(row: DbCaseStudy): Project {
  const highlights = parseJsonArray<string>(row.highlights_json, []);
  return {
    slug: row.slug,
    title: row.title,
    url: row.url,
    logo: row.logo,
    logoLight: Boolean(row.logo_light) || undefined,
    services: parseJsonArray<string>(row.services_json, []),
    featured: Boolean(row.featured),
    summary: row.summary,
    overview: row.overview,
    challenge: row.challenge,
    solution: row.solution,
    outcome: row.outcome,
    designTools: parseJsonArray<string>(row.design_tools_json, []),
    stack: parseJsonArray<string>(row.stack_json, []),
    colours: parseJsonArray<{ name: string; hex: string }>(
      row.colours_json,
      [],
    ),
    highlights: highlights.length ? highlights : undefined,
    year: row.year,
  };
}

export function mapCaseStudySeo(row: DbCaseStudy, project: Project): CaseStudySeo {
  return {
    title: row.seo_title?.trim() || `${project.title} case study`,
    description:
      row.seo_description?.trim() ||
      `${project.summary} Design and development by Euan Livingstone MBCS.`,
    headline: row.seo_headline?.trim() || project.summary,
  };
}

export async function listPublishedCaseStudies() {
  try {
    const rows = await queryRows<DbCaseStudy>(
      `SELECT * FROM organisation_case_studies
       ORDER BY featured DESC, year DESC, title ASC`,
    );
    return rows.map(mapCaseStudyRow);
  } catch (error) {
    console.error("listPublishedCaseStudies: falling back to seed", error);
    return caseStudySeedProjects;
  }
}

export async function listFeaturedCaseStudies(limit = 3) {
  try {
    const rows = await queryRows<DbCaseStudy>(
      `SELECT * FROM organisation_case_studies
       WHERE featured = 1
       ORDER BY year DESC, title ASC
       LIMIT :limit`,
      { limit },
    );
    return rows.map(mapCaseStudyRow);
  } catch (error) {
    console.error("listFeaturedCaseStudies: falling back to seed", error);
    return caseStudySeedProjects
      .filter((project) => project.featured)
      .slice(0, limit);
  }
}

export async function listLocalCaseStudies() {
  try {
    const rows = await queryRows<DbCaseStudy>(
      `SELECT * FROM organisation_case_studies
       WHERE show_on_local = 1
       ORDER BY year DESC, title ASC`,
    );
    return rows.map(mapCaseStudyRow);
  } catch (error) {
    console.error("listLocalCaseStudies: falling back to seed", error);
    return caseStudySeedProjects.filter((project) =>
      /scout|fife|dunfermline|nine-acres|kasc|cycle/i.test(
        `${project.slug} ${project.title}`,
      ),
    );
  }
}

export async function listCharityCaseStudies() {
  try {
    const rows = await queryRows<DbCaseStudy>(
      `SELECT * FROM organisation_case_studies
       WHERE show_on_charity = 1
       ORDER BY year DESC, title ASC`,
    );
    return rows.map(mapCaseStudyRow);
  } catch (error) {
    console.error("listCharityCaseStudies: falling back to seed", error);
    return caseStudySeedProjects.filter((project) =>
      /scout|charity|community|nine-acres|kasc|cycle|coasters|barter/i.test(
        `${project.slug} ${project.title} ${(project.highlights || []).join(" ")}`,
      ),
    );
  }
}

export async function findCaseStudyBySlug(slug: string) {
  try {
    const rows = await queryRows<DbCaseStudy>(
      `SELECT * FROM organisation_case_studies WHERE slug = :slug LIMIT 1`,
      { slug },
    );
    const row = rows[0];
    if (!row) return null;
    const project = mapCaseStudyRow(row);
    return { row, project, seo: mapCaseStudySeo(row, project) };
  } catch (error) {
    console.error("findCaseStudyBySlug: falling back to seed", error);
    const project = caseStudySeedProjects.find((item) => item.slug === slug);
    if (!project) return null;
    return {
      row: null,
      project,
      seo: {
        title: `${project.title} case study`,
        description: `${project.summary} Design and development by Euan Livingstone MBCS.`,
        headline: project.summary,
      },
    };
  }
}

export async function findCaseStudyByOrganisationId(organisationId: number) {
  const id = Number(organisationId);
  if (!Number.isFinite(id) || id <= 0) return null;
  const rows = await queryRows<DbCaseStudy>(
    `SELECT * FROM organisation_case_studies
     WHERE organisation_id = :id LIMIT 1`,
    { id },
  );
  const row = rows[0];
  if (!row) return null;
  const project = mapCaseStudyRow(row);
  return { row, project, seo: mapCaseStudySeo(row, project) };
}

export async function getAdjacentCaseStudies(slug: string) {
  const projects = await listPublishedCaseStudies();
  const index = projects.findIndex((project) => project.slug === slug);
  if (index === -1) return { prev: null, next: null };
  return {
    prev: projects[(index - 1 + projects.length) % projects.length] ?? null,
    next: projects[(index + 1) % projects.length] ?? null,
  };
}

export async function findOrganisationBySlug(slug: string) {
  const rows = await queryRows<{
    id: number;
    name: string;
    slug: string;
    description: string | null;
  }>(
    `SELECT id, name, slug, description FROM client_organisations
     WHERE slug = :slug LIMIT 1`,
    { slug },
  );
  return rows[0] ?? null;
}

export async function ensureOrganisationWithSlug(input: {
  name: string;
  slug: string;
  description?: string | null;
}) {
  const existing = await findOrganisationBySlug(input.slug);
  if (existing) return existing;

  const result = await execute(
    `INSERT INTO client_organisations (name, slug, description)
     VALUES (:name, :slug, :description)`,
    {
      name: input.name,
      slug: input.slug,
      description: input.description?.trim() || null,
    },
  );
  return {
    id: result.insertId,
    name: input.name,
    slug: input.slug,
    description: input.description?.trim() || null,
  };
}

function caseStudyParams(input: CaseStudyInput): SqlParams {
  const slug = slugify(input.slug) || `case-${input.organisationId}`;
  return {
    organisationId: input.organisationId,
    slug,
    title: input.title.trim(),
    url: input.url.trim(),
    logo: input.logo.trim(),
    logoLight: input.logoLight ? 1 : 0,
    servicesJson: JSON.stringify(input.services),
    featured: input.featured ? 1 : 0,
    summary: input.summary.trim(),
    overview: input.overview.trim(),
    challenge: input.challenge.trim(),
    solution: input.solution.trim(),
    outcome: input.outcome.trim(),
    designToolsJson: JSON.stringify(input.designTools),
    stackJson: JSON.stringify(input.stack),
    coloursJson: JSON.stringify(input.colours),
    highlightsJson: input.highlights?.length
      ? JSON.stringify(input.highlights)
      : null,
    year: input.year.trim(),
    seoTitle: input.seoTitle?.trim() || null,
    seoDescription: input.seoDescription?.trim() || null,
    seoHeadline: input.seoHeadline?.trim() || null,
    showOnLocal: input.showOnLocal ? 1 : 0,
    showOnCharity: input.showOnCharity ? 1 : 0,
  };
}

export async function upsertCaseStudy(input: CaseStudyInput) {
  const params = caseStudyParams(input);
  await execute(
    `INSERT INTO organisation_case_studies (
       organisation_id, slug, title, url, logo, logo_light,
       services_json, featured, summary, overview, challenge, solution, outcome,
       design_tools_json, stack_json, colours_json, highlights_json, year,
       seo_title, seo_description, seo_headline, show_on_local, show_on_charity,
       updated_at
     ) VALUES (
       :organisationId, :slug, :title, :url, :logo, :logoLight,
       :servicesJson, :featured, :summary, :overview, :challenge, :solution, :outcome,
       :designToolsJson, :stackJson, :coloursJson, :highlightsJson, :year,
       :seoTitle, :seoDescription, :seoHeadline, :showOnLocal, :showOnCharity,
       datetime('now')
     )
     ON CONFLICT(organisation_id) DO UPDATE SET
       slug = excluded.slug,
       title = excluded.title,
       url = excluded.url,
       logo = excluded.logo,
       logo_light = excluded.logo_light,
       services_json = excluded.services_json,
       featured = excluded.featured,
       summary = excluded.summary,
       overview = excluded.overview,
       challenge = excluded.challenge,
       solution = excluded.solution,
       outcome = excluded.outcome,
       design_tools_json = excluded.design_tools_json,
       stack_json = excluded.stack_json,
       colours_json = excluded.colours_json,
       highlights_json = excluded.highlights_json,
       year = excluded.year,
       seo_title = excluded.seo_title,
       seo_description = excluded.seo_description,
       seo_headline = excluded.seo_headline,
       show_on_local = excluded.show_on_local,
       show_on_charity = excluded.show_on_charity,
       updated_at = datetime('now')`,
    params,
  );
}

export async function deleteCaseStudy(organisationId: number) {
  await execute(
    `DELETE FROM organisation_case_studies WHERE organisation_id = :id`,
    { id: organisationId },
  );
}

export async function organisationHasCaseStudy(organisationId: number) {
  const rows = await queryRows<{ organisation_id: number }>(
    `SELECT organisation_id FROM organisation_case_studies
     WHERE organisation_id = :id LIMIT 1`,
    { id: organisationId },
  );
  return Boolean(rows[0]);
}
