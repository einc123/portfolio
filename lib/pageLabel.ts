import { nav, site } from "@/lib/data";

const pageLabels: Record<string, string> = {
  "/": "Home",
  "/work": "Work",
  "/about": "About",
  "/contact": "Contact",
  "/book": "Book a chat",
  "/dunfermline": "Dunfermline",
  "/charity": "Charity",
  "/hosting": "Hosting",
  "/photography": "Photography",
  "/cookies": "Cookies",
  "/client/login": "Client login",
  "/client/dashboard": "Dashboard",
  "/client/invoices": "Invoices",
  "/client/profile": "Profile",
  "/client/security": "Security",
  "/client/select-org": "Organisations",
  "/client/admin": "Admin",
  "/client/admin/organisations": "Organisations",
  "/client/admin/create": "Create",
};

export function getPageLabel(pathname: string): string {
  const exact =
    pageLabels[pathname] ?? nav.find((item) => item.href === pathname)?.label;
  if (exact) return exact;

  if (pathname.startsWith("/work/")) return "Case study";
  if (pathname.startsWith("/client/admin/people/")) return "Manage person";
  if (pathname.startsWith("/client/admin/organisations/")) {
    return "Manage organisation";
  }
  if (pathname.startsWith("/work")) return "Work";
  if (pathname.startsWith("/client/register")) return "Register";
  if (pathname.startsWith("/client")) return "Client";
  return "Page";
}

export function getTransitionTitle(pathname: string): string {
  return `${site.brand} / ${getPageLabel(pathname)}`;
}
