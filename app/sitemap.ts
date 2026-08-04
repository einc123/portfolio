import type { MetadataRoute } from "next";
import { listPublishedCaseStudies } from "@/lib/caseStudies";
import { caseStudySeedProjects } from "@/lib/caseStudySeed";
import { site } from "@/lib/data";

/**
 * Prefer a stable XML response for Google Search Console / crawlers.
 * D1 is optional enrichment — seed slugs keep case studies listed if the DB fails.
 */
export const revalidate = 3600;

function staticEntries(lastModified: Date): MetadataRoute.Sitemap {
  return [
    {
      url: site.url,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${site.url}/work`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${site.url}/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${site.url}/contact`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.7,
    },
    {
      url: `${site.url}/book`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.8,
    },
    {
      url: `${site.url}/dunfermline`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${site.url}/charity`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${site.url}/hosting`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${site.url}/photography`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${site.url}/cookies`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}

function caseStudyEntries(
  slugs: string[],
  lastModified: Date,
): MetadataRoute.Sitemap {
  return slugs.map((slug) => ({
    url: `${site.url}/work/${slug}`,
    lastModified,
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const seedSlugs = caseStudySeedProjects.map((project) => project.slug);

  let caseStudySlugs = seedSlugs;
  try {
    const projects = await listPublishedCaseStudies();
    if (projects.length > 0) {
      caseStudySlugs = projects.map((project) => project.slug);
    }
  } catch (error) {
    console.error("sitemap: could not load case studies from D1", error);
  }

  return [
    ...staticEntries(lastModified),
    ...caseStudyEntries(caseStudySlugs, lastModified),
  ];
}
