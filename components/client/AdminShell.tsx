import { ClientPortalHero } from "@/components/client/ClientPortalHero";
import { AdminSubnav } from "@/components/client/AdminSubnav";
import { resolveDbDriver, type DbDriverMode } from "@/lib/db";

const MODE_LABEL: Record<DbDriverMode, string> = {
  binding: "Workers D1 binding",
  remote: "D1 HTTP API",
  local: "Local SQLite",
};

export async function AdminShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  let mode: DbDriverMode = "local";
  let configured: string = "auto";
  try {
    const resolved = await resolveDbDriver();
    mode = resolved.mode;
    configured = resolved.configured;
  } catch {
    mode = "local";
  }

  return (
    <>
      <ClientPortalHero
        eyebrow="Admin"
        title={title}
        description={description}
        isAdmin
      />
      <p className="mt-4 text-[11px] uppercase tracking-[0.14em] text-faint">
        Database ·{" "}
        <span className="text-ink" title={`CLOUDFLARE_D1_MODE=${configured}`}>
          {mode}
        </span>
        <span className="text-faint"> — {MODE_LABEL[mode]}</span>
        {configured !== "auto" && configured !== mode ? (
          <span className="text-faint"> (forced {configured})</span>
        ) : null}
        {configured === "auto" ? (
          <span className="text-faint"> (auto)</span>
        ) : null}
      </p>
      <AdminSubnav />
      <div className="mt-8">{children}</div>
    </>
  );
}
