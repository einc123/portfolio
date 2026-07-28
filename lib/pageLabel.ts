import { getProject, nav, site } from "@/lib/data";

const pageLabels: Record<string, string> = {
  "/": "Home",
  "/work": "Work",
  "/contact": "Contact",
  "/book": "Book a chat",
  "/dunfermline": "Dunfermline",
  "/charity": "Charity",
};

export function getPageLabel(pathname: string): string {
  const exact =
    pageLabels[pathname] ?? nav.find((item) => item.href === pathname)?.label;
  if (exact) return exact;

  if (pathname.startsWith("/work/")) {
    const slug = pathname.slice("/work/".length).split("/")[0];
    return getProject(slug)?.title ?? "Case study";
  }

  if (pathname.startsWith("/work")) return "Work";
  return "Page";
}

export function getTransitionTitle(pathname: string): string {
  return `${site.brand} / ${getPageLabel(pathname)}`;
}
