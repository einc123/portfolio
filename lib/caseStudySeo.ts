import { site } from "@/lib/data";
import {
  findCaseStudyBySlug,
  type CaseStudySeo,
} from "@/lib/caseStudies";
export {
  charityProjectSlugs,
  localProjectSlugs,
} from "@/lib/caseStudySeed";

export async function getCaseStudySeo(slug: string): Promise<CaseStudySeo> {
  const found = await findCaseStudyBySlug(slug);
  if (found) return found.seo;

  return {
    title: "Case study",
    description: `Web design case study by ${site.name}.`,
    headline: "",
  };
}
