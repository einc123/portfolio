import { ClientPortalHero } from "@/components/client/ClientPortalHero";
import { AdminSubnav } from "@/components/client/AdminSubnav";

export function AdminShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <ClientPortalHero
        eyebrow="Admin"
        title={title}
        description={description}
        isAdmin
      />
      <AdminSubnav />
      <div className="mt-8">{children}</div>
    </>
  );
}
