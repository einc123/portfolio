"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  adminDeleteOrganisationCaseStudy,
  adminUpsertOrganisationCaseStudy,
  type ActionState,
} from "@/app/client/actions";
import type { Project } from "@/lib/data";

const initial: ActionState = {};

export type AdminCaseStudyDefaults = Project & {
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoHeadline?: string | null;
  showOnLocal?: boolean;
  showOnCharity?: boolean;
};

function useRefreshOnSuccess(state: ActionState) {
  const router = useRouter();
  const lastOk = useRef(false);
  useEffect(() => {
    if (state.ok && !lastOk.current) router.refresh();
    lastOk.current = Boolean(state.ok);
  }, [state.ok, router]);
}

function Feedback({ state }: { state: ActionState }) {
  if (state.error) return <p className="text-sm text-red-600">{state.error}</p>;
  if (state.ok) return <p className="text-sm text-accent">Saved.</p>;
  return null;
}

function coloursToText(colours: { name: string; hex: string }[]) {
  return colours.map((colour) => `${colour.name}|${colour.hex}`).join("\n");
}

export function AdminCaseStudyForm({
  organisationId,
  organisationName,
  organisationSlug,
  caseStudy,
}: {
  organisationId: number;
  organisationName: string;
  organisationSlug: string;
  caseStudy: AdminCaseStudyDefaults | null;
}) {
  const [saveState, saveAction, savePending] = useActionState(
    adminUpsertOrganisationCaseStudy,
    initial,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    adminDeleteOrganisationCaseStudy,
    initial,
  );
  useRefreshOnSuccess(saveState);
  useRefreshOnSuccess(deleteState);

  const exists = Boolean(caseStudy);

  return (
    <section className="mt-8 space-y-6 border border-line bg-surface px-5 py-6 sm:px-6">
      <div>
        <h2 className="font-display text-xl italic text-ink">Case study</h2>
        <p className="mt-2 text-sm text-muted">
          {exists
            ? "Editing this publishes updates on the portfolio. Remove it to hide the page."
            : "Create a case study to show this organisation on the portfolio. Without one, it stays off /work."}
        </p>
        {exists ? (
          <p className="mt-2 text-sm text-muted">
            Live at{" "}
            <Link
              href={`/work/${caseStudy!.slug}`}
              className="link-underline text-accent"
            >
              /work/{caseStudy!.slug}
            </Link>
          </p>
        ) : null}
      </div>

      <form action={saveAction} className="grid gap-4 sm:grid-cols-2">
        <input type="hidden" name="organisationId" value={organisationId} />

        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
            Title
          </span>
          <input
            name="title"
            required
            defaultValue={caseStudy?.title ?? organisationName}
            className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
          />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
            Portfolio slug
          </span>
          <input
            name="slug"
            required
            defaultValue={caseStudy?.slug ?? organisationSlug}
            className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
            Live site URL
          </span>
          <input
            name="url"
            type="url"
            required
            defaultValue={caseStudy?.url ?? ""}
            placeholder="https://"
            className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
          />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
            Logo path
          </span>
          <input
            name="logo"
            required
            defaultValue={caseStudy?.logo ?? `/projects/${organisationSlug}.png`}
            placeholder="/projects/example.png"
            className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
          />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
            Year
          </span>
          <input
            name="year"
            required
            defaultValue={caseStudy?.year ?? new Date().getFullYear().toString()}
            className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
          />
        </label>

        <div className="flex flex-wrap gap-4 sm:col-span-2">
          <label className="inline-flex items-center gap-2 text-sm text-muted">
            <input
              name="logoLight"
              type="checkbox"
              defaultChecked={Boolean(caseStudy?.logoLight)}
              className="h-4 w-4"
            />
            Light logo panel
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-muted">
            <input
              name="featured"
              type="checkbox"
              defaultChecked={Boolean(caseStudy?.featured)}
              className="h-4 w-4"
            />
            Featured on home
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-muted">
            <input
              name="showOnLocal"
              type="checkbox"
              defaultChecked={Boolean(caseStudy?.showOnLocal)}
              className="h-4 w-4"
            />
            Dunfermline page
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-muted">
            <input
              name="showOnCharity"
              type="checkbox"
              defaultChecked={Boolean(caseStudy?.showOnCharity)}
              className="h-4 w-4"
            />
            Charity page
          </label>
        </div>

        <label className="block sm:col-span-2">
          <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
            Summary
          </span>
          <textarea
            name="summary"
            required
            rows={3}
            defaultValue={caseStudy?.summary ?? ""}
            className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
            Overview
          </span>
          <textarea
            name="overview"
            required
            rows={4}
            defaultValue={caseStudy?.overview ?? ""}
            className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
            Challenge
          </span>
          <textarea
            name="challenge"
            required
            rows={3}
            defaultValue={caseStudy?.challenge ?? ""}
            className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
            Solution
          </span>
          <textarea
            name="solution"
            required
            rows={3}
            defaultValue={caseStudy?.solution ?? ""}
            className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
            Outcome
          </span>
          <textarea
            name="outcome"
            required
            rows={3}
            defaultValue={caseStudy?.outcome ?? ""}
            className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
            Services (comma-separated)
          </span>
          <input
            name="services"
            required
            defaultValue={(caseStudy?.services ?? []).join(", ")}
            className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
            Design tools (comma-separated)
          </span>
          <input
            name="designTools"
            required
            defaultValue={(caseStudy?.designTools ?? []).join(", ")}
            className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
            Stack (comma-separated)
          </span>
          <input
            name="stack"
            required
            defaultValue={(caseStudy?.stack ?? []).join(", ")}
            className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
            Highlights (comma-separated)
          </span>
          <input
            name="highlights"
            defaultValue={(caseStudy?.highlights ?? []).join(", ")}
            className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
            Colours (one per line: Name|#hex)
          </span>
          <textarea
            name="colours"
            required
            rows={4}
            defaultValue={coloursToText(caseStudy?.colours ?? [])}
            placeholder={"Teal|#039172\nForest|#027A5F"}
            className="mt-2 w-full border border-line bg-background px-4 py-3 font-mono text-sm text-ink outline-none focus:border-accent"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
            SEO title
          </span>
          <input
            name="seoTitle"
            defaultValue={caseStudy?.seoTitle ?? ""}
            className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
            SEO description
          </span>
          <textarea
            name="seoDescription"
            rows={3}
            defaultValue={caseStudy?.seoDescription ?? ""}
            className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
            On-page headline
          </span>
          <textarea
            name="seoHeadline"
            rows={2}
            defaultValue={caseStudy?.seoHeadline ?? ""}
            className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
          />
        </label>

        <div className="space-y-3 sm:col-span-2">
          <Feedback state={saveState} />
          <button
            type="submit"
            disabled={savePending}
            className="inline-flex min-h-11 items-center bg-accent px-5 text-sm font-medium text-on-accent disabled:opacity-60"
          >
            {savePending
              ? "Saving…"
              : exists
                ? "Save case study"
                : "Create case study"}
          </button>
        </div>
      </form>

      {exists ? (
        <form action={deleteAction} className="border-t border-line pt-6">
          <input type="hidden" name="organisationId" value={organisationId} />
          <p className="text-sm text-muted">
            Remove the case study from the portfolio. The organisation itself
            stays.
          </p>
          <Feedback state={deleteState} />
          <button
            type="submit"
            disabled={deletePending}
            className="mt-3 inline-flex min-h-10 items-center border border-line px-4 text-sm text-red-700 disabled:opacity-60"
          >
            {deletePending ? "Removing…" : "Remove from portfolio"}
          </button>
        </form>
      ) : null}
    </section>
  );
}
