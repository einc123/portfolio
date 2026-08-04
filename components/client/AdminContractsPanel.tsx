"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  adminDeleteOrganisationContract,
  adminSendOrganisationContract,
  adminUpdateContractTemplate,
  adminWithdrawOrganisationContract,
  type ActionState,
} from "@/app/client/actions";
import type {
  DbContractTemplate,
  OrganisationContractRow,
} from "@/lib/contracts/store";
import {
  getParticularsFieldsUsed,
  isBagpipesTemplateSlug,
  particularsForTemplateSlug,
} from "@/lib/contracts/particulars";

const initial: ActionState = {};

type OrgOption = { id: number; name: string };

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
  if (state.ok) {
    return (
      <p className="text-sm text-accent">
        {state.message?.trim() || "Saved."}
      </p>
    );
  }
  return null;
}

function formatWhen(value: string | null) {
  if (!value) return "—";
  const date = new Date(value.includes("T") ? value : `${value}Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusLabel(status: OrganisationContractRow["status"]) {
  if (status === "voided") return "Withdrawn";
  return status;
}

function SendContractForm({
  organisations,
  templates,
}: {
  organisations: OrgOption[];
  templates: DbContractTemplate[];
}) {
  const [sendState, sendAction, sendPending] = useActionState(
    adminSendOrganisationContract,
    initial,
  );
  useRefreshOnSuccess(sendState);

  const activeTemplates = templates.filter((row) => row.is_active);
  const [templateId, setTemplateId] = useState<string>("");
  const selected = activeTemplates.find(
    (row) => String(row.id) === templateId,
  );
  const selectedSlug = selected?.slug ?? null;
  const bagpipes = isBagpipesTemplateSlug(selectedSlug);
  const defaults = particularsForTemplateSlug(selectedSlug);
  const usedFields = selected
    ? getParticularsFieldsUsed(selected.body_html)
    : [];
  const usesScope = usedFields.includes("scope");
  const usesFees = usedFields.includes("fees");
  const usesTimeline = usedFields.includes("timeline");
  const usesNotes = usedFields.includes("notes");
  const hasParticulars = usedFields.length > 0;

  return (
    <section className="border border-line bg-surface px-5 py-6 sm:px-6">
      <h2 className="font-display text-2xl italic text-ink">Send contract</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Emails every organisation owner a copy and places it on their dashboard
        for signature. Only fields used by the selected contract are shown.
      </p>
      <form action={sendAction} className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
            Organisation
          </span>
          <select
            name="organisationId"
            required
            defaultValue=""
            className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
          >
            <option value="" disabled>
              Choose…
            </option>
            {organisations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
            Contract
          </span>
          <select
            name="templateId"
            required
            value={templateId}
            onChange={(event) => setTemplateId(event.target.value)}
            className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
          >
            <option value="" disabled>
              Choose…
            </option>
            {activeTemplates.map((row) => (
              <option key={row.id} value={row.id}>
                {row.title}
              </option>
            ))}
          </select>
        </label>

        {templateId ? (
          hasParticulars ? (
            <>
              {usesScope ? (
                <label className="block sm:col-span-2">
                  <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
                    {bagpipes ? "Type of event" : "Scope"}
                  </span>
                  {bagpipes ? (
                    <input
                      key={`scope-${selectedSlug}`}
                      name="scope"
                      required
                      defaultValue={defaults.scope}
                      placeholder="Wedding, ceilidh, ceremony…"
                      className="mt-2 w-full border border-line bg-background px-4 py-3 text-sm text-ink outline-none focus:border-accent"
                    />
                  ) : (
                    <textarea
                      key={`scope-${selectedSlug}`}
                      name="scope"
                      rows={5}
                      defaultValue={defaults.scope}
                      className="mt-2 w-full resize-y border border-line bg-background px-4 py-3 text-sm text-ink outline-none focus:border-accent"
                    />
                  )}
                </label>
              ) : (
                <input type="hidden" name="scope" value="" />
              )}

              {usesFees ? (
                <label
                  className={`block ${bagpipes || !usesTimeline ? "sm:col-span-2" : ""}`}
                >
                  <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
                    {bagpipes ? "Price" : "Fees"}
                  </span>
                  {bagpipes ? (
                    <input
                      key={`fees-${selectedSlug}`}
                      name="fees"
                      required
                      defaultValue={defaults.fees}
                      placeholder="£250"
                      className="mt-2 w-full border border-line bg-background px-4 py-3 text-sm text-ink outline-none focus:border-accent"
                    />
                  ) : (
                    <textarea
                      key={`fees-${selectedSlug}`}
                      name="fees"
                      rows={4}
                      defaultValue={defaults.fees}
                      className="mt-2 w-full resize-y border border-line bg-background px-4 py-3 text-sm text-ink outline-none focus:border-accent"
                    />
                  )}
                </label>
              ) : (
                <input type="hidden" name="fees" value="" />
              )}

              {usesTimeline ? (
                <label className={`block ${usesFees ? "" : "sm:col-span-2"}`}>
                  <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
                    Timeline
                  </span>
                  <textarea
                    key={`timeline-${selectedSlug}`}
                    name="timeline"
                    rows={4}
                    defaultValue={defaults.timeline}
                    className="mt-2 w-full resize-y border border-line bg-background px-4 py-3 text-sm text-ink outline-none focus:border-accent"
                  />
                </label>
              ) : (
                <input type="hidden" name="timeline" value="" />
              )}

              {usesNotes ? (
                <label className="block sm:col-span-2">
                  <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
                    Additional notes
                  </span>
                  <textarea
                    key={`notes-${selectedSlug}`}
                    name="notes"
                    rows={3}
                    defaultValue={defaults.notes}
                    placeholder={
                      bagpipes
                        ? "Venue, timing, dress, tune requests…"
                        : undefined
                    }
                    className="mt-2 w-full resize-y border border-line bg-background px-4 py-3 text-sm text-ink outline-none focus:border-accent"
                  />
                </label>
              ) : (
                <input type="hidden" name="notes" value="" />
              )}
            </>
          ) : (
            <>
              <p className="sm:col-span-2 text-sm text-muted">
                This contract has no particulars fields — it can be sent as-is.
              </p>
              <input type="hidden" name="scope" value="" />
              <input type="hidden" name="fees" value="" />
              <input type="hidden" name="timeline" value="" />
              <input type="hidden" name="notes" value="" />
            </>
          )
        ) : (
          <p className="sm:col-span-2 text-sm text-muted">
            Choose a contract to enter particulars.
          </p>
        )}

        <div className="space-y-3 sm:col-span-2">
          <Feedback state={sendState} />
          <button
            type="submit"
            disabled={sendPending || organisations.length === 0 || !templateId}
            className="inline-flex min-h-11 items-center bg-accent px-5 text-sm font-medium text-on-accent disabled:opacity-60"
          >
            {sendPending ? "Sending…" : "Send to organisation owners"}
          </button>
        </div>
      </form>
    </section>
  );
}

export function AdminContractsPanel({
  organisations,
  templates,
  contracts,
}: {
  organisations: OrgOption[];
  templates: DbContractTemplate[];
  contracts: OrganisationContractRow[];
}) {
  const [editingId, setEditingId] = useState<number | null>(
    templates[0]?.id ?? null,
  );
  const editing = templates.find((row) => row.id === editingId) ?? null;

  return (
    <div className="space-y-8">
      <SendContractForm organisations={organisations} templates={templates} />

      <section className="border border-line bg-surface px-5 py-6 sm:px-6">
        <h2 className="font-display text-2xl italic text-ink">
          Edit contract templates
        </h2>
        <p className="mt-2 text-sm text-muted">
          Placeholders:{" "}
          <code className="text-xs">
            {"{{organisation_name}} {{client_name}} {{client_email}} {{date}} {{provider_name}} {{provider_trading}} {{provider_location}} {{provider_email}} {{scope}} {{fees}} {{timeline}} {{notes}}"}
          </code>
          . Agreements use Scots law and the exclusive jurisdiction of the
          Scottish Courts. Unsigned contracts may be withdrawn at any time.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {templates.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => setEditingId(row.id)}
              className={`min-h-9 border px-3 text-xs uppercase tracking-[0.12em] ${
                editingId === row.id
                  ? "border-accent bg-accent text-on-accent"
                  : "border-line text-ink"
              }`}
            >
              {row.title}
            </button>
          ))}
        </div>
        {editing ? (
          <TemplateEditor key={editing.id} template={editing} />
        ) : null}
      </section>

      <section className="border border-line bg-surface px-5 py-6 sm:px-6">
        <h2 className="font-display text-2xl italic text-ink">
          Sent contracts
        </h2>
        <p className="mt-2 text-sm text-muted">
          Withdraw unsigned contracts at any time, or delete a contract to
          remove it entirely.
        </p>
        {contracts.length === 0 ? (
          <p className="mt-3 text-sm text-muted">None sent yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line border border-line bg-background">
            {contracts.map((row) => (
              <SentContractRow key={row.id} contract={row} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function SentContractRow({
  contract,
}: {
  contract: OrganisationContractRow;
}) {
  const [withdrawState, withdrawAction, withdrawPending] = useActionState(
    adminWithdrawOrganisationContract,
    initial,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    adminDeleteOrganisationContract,
    initial,
  );
  useRefreshOnSuccess(withdrawState);
  useRefreshOnSuccess(deleteState);

  return (
    <li className="px-4 py-3 text-sm text-ink">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-medium">{contract.title}</span>
        <span className="capitalize text-muted">
          {statusLabel(contract.status)}
        </span>
      </div>
      <p className="mt-1 text-muted">
        {contract.organisation_name} · Sent {formatWhen(contract.sent_at)}
        {contract.signed_at
          ? ` · Signed ${formatWhen(contract.signed_at)} by ${contract.signer_name || "—"}`
          : ""}
      </p>
      {contract.content_hash ? (
        <p className="mt-1 break-all text-[11px] text-faint">
          Hash {contract.content_hash.slice(0, 16)}…
          {contract.signed_payload_hash
            ? ` · Sig ${contract.signed_payload_hash.slice(0, 16)}…`
            : ""}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        {contract.status === "pending" ? (
          <form action={withdrawAction}>
            <input type="hidden" name="contractId" value={contract.id} />
            <button
              type="submit"
              disabled={withdrawPending || deletePending}
              className="min-h-9 border border-line px-3 text-xs disabled:opacity-60"
            >
              {withdrawPending ? "Withdrawing…" : "Withdraw"}
            </button>
          </form>
        ) : null}
        <form action={deleteAction}>
          <input type="hidden" name="contractId" value={contract.id} />
          <button
            type="submit"
            disabled={deletePending || withdrawPending}
            className="min-h-9 border border-line px-3 text-xs text-red-700 disabled:opacity-60"
            onClick={(event) => {
              if (
                !window.confirm(
                  `Delete “${contract.title}” for ${contract.organisation_name}? This cannot be undone.`,
                )
              ) {
                event.preventDefault();
              }
            }}
          >
            {deletePending ? "Deleting…" : "Delete"}
          </button>
        </form>
      </div>
      {withdrawState.error || deleteState.error ? (
        <p className="mt-2 text-sm text-red-600">
          {withdrawState.error || deleteState.error}
        </p>
      ) : null}
      {(withdrawState.ok && withdrawState.message) ||
      (deleteState.ok && deleteState.message) ? (
        <p className="mt-2 text-sm text-accent">
          {withdrawState.message || deleteState.message}
        </p>
      ) : null}
    </li>
  );
}

function TemplateEditor({ template }: { template: DbContractTemplate }) {
  const [state, action, pending] = useActionState(
    adminUpdateContractTemplate,
    initial,
  );
  useRefreshOnSuccess(state);

  return (
    <form action={action} className="mt-5 space-y-4">
      <input type="hidden" name="templateId" value={template.id} />
      <label className="block">
        <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
          Title
        </span>
        <input
          name="title"
          required
          defaultValue={template.title}
          className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
        />
      </label>
      <label className="block">
        <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
          Body (HTML)
        </span>
        <textarea
          name="bodyHtml"
          required
          rows={16}
          defaultValue={template.body_html}
          className="mt-2 w-full border border-line bg-background px-4 py-3 font-mono text-xs text-ink outline-none focus:border-accent"
        />
      </label>
      <label className="inline-flex items-center gap-2 text-sm text-muted">
        <input
          name="isActive"
          type="checkbox"
          defaultChecked={Boolean(template.is_active)}
          className="h-4 w-4"
        />
        Active (available to send)
      </label>
      <Feedback state={state} />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center border border-line px-5 text-sm disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save template"}
      </button>
    </form>
  );
}
