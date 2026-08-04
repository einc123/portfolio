"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  signOrganisationContractAction,
  type ActionState,
} from "@/app/client/actions";
import type { DbOrganisationContract } from "@/lib/contracts/store";

const initial: ActionState = {};

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

export function ClientContractsPanel({
  contracts,
  defaultSignerName,
  canSign,
}: {
  contracts: DbOrganisationContract[];
  defaultSignerName: string;
  canSign: boolean;
}) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const active = contracts.find((row) => row.id === activeId) ?? null;

  return (
    <section className="w-full border border-line bg-surface px-5 py-6 sm:px-6">
      <h2 className="font-display text-2xl italic text-ink">Contracts</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Agreements for this organisation. Owners can review and sign pending
        contracts.
      </p>

      {contracts.length === 0 ? (
        <p className="mt-4 text-sm text-muted">No contracts yet.</p>
      ) : (
        <ul className="mt-5 divide-y divide-line border border-line bg-background">
          {contracts.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-4"
            >
              <div className="min-w-0">
                <p className="font-medium text-ink">{row.title}</p>
                <p className="mt-1 text-sm text-muted">
                  {row.status === "signed"
                    ? `Signed ${formatWhen(row.signed_at)}${row.signer_name ? ` · ${row.signer_name}` : ""}`
                    : row.status === "pending"
                      ? `Awaiting signature · Sent ${formatWhen(row.sent_at)}`
                      : row.status === "voided"
                        ? `Withdrawn · Sent ${formatWhen(row.sent_at)}`
                        : row.status}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveId(row.id)}
                  className="min-h-10 border border-line px-4 text-xs uppercase tracking-[0.12em] text-ink"
                >
                  {row.status === "pending" && canSign ? "Review & sign" : "View"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {active ? (
        <ContractSignModal
          contract={active}
          defaultSignerName={defaultSignerName}
          canSign={canSign && active.status === "pending"}
          onClose={() => setActiveId(null)}
        />
      ) : null}
    </section>
  );
}

function ContractSignModal({
  contract,
  defaultSignerName,
  canSign,
  onClose,
}: {
  contract: DbOrganisationContract;
  defaultSignerName: string;
  canSign: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    signOrganisationContractAction,
    initial,
  );
  const [signatureType, setSignatureType] = useState<"typed" | "drawn">("typed");
  const [signatureData, setSignatureData] = useState(defaultSignerName);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);

  useEffect(() => {
    if (state.ok) {
      router.refresh();
      onClose();
    }
  }, [state.ok, router, onClose]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function pointerPos(
    event: React.PointerEvent<HTMLCanvasElement>,
  ): { x: number; y: number } {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`contract-title-${contract.id}`}
      onClick={onClose}
    >
      <div
        className="max-h-[92svh] w-full max-w-3xl overflow-y-auto border border-line bg-background"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-line bg-background px-5 py-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-faint">
              {contract.status === "signed" ? "Signed contract" : "Contract"}
            </p>
            <h3
              id={`contract-title-${contract.id}`}
              className="mt-1 font-display text-2xl italic text-ink"
            >
              {contract.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-9 border border-line px-3 text-xs uppercase tracking-[0.12em]"
          >
            Close
          </button>
        </div>

        <div
          className="prose-contract px-5 py-6 text-sm leading-relaxed text-ink [&_h2]:mb-3 [&_h2]:mt-0 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:italic [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_p]:mb-3 [&_p]:text-muted"
          dangerouslySetInnerHTML={{ __html: contract.body_html }}
        />

        {contract.status === "signed" ? (
          <div className="border-t border-line px-5 py-5 text-sm text-muted">
            <p>
              Signed by <strong className="text-ink">{contract.signer_name}</strong>{" "}
              on {formatWhen(contract.signed_at)}.
            </p>
            {contract.signature_type === "drawn" && contract.signature_data ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={contract.signature_data}
                alt="Signature"
                className="mt-3 max-h-24 border border-line bg-white"
              />
            ) : contract.signature_data ? (
              <p className="mt-3 font-display text-2xl italic text-ink">
                {contract.signature_data}
              </p>
            ) : null}
            {contract.signed_payload_hash ? (
              <p className="mt-3 break-all text-[11px] text-faint">
                Signature hash: {contract.signed_payload_hash}
              </p>
            ) : null}
          </div>
        ) : canSign ? (
          <form action={action} className="space-y-4 border-t border-line px-5 py-5">
            <input type="hidden" name="contractId" value={contract.id} />
            <input
              type="hidden"
              name="userAgent"
              value={typeof navigator !== "undefined" ? navigator.userAgent : ""}
            />
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
                Full legal name
              </span>
              <input
                name="signerName"
                required
                defaultValue={defaultSignerName}
                className="mt-2 w-full border border-line bg-surface px-4 py-3 text-ink outline-none focus:border-accent"
              />
            </label>
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
                Type your signature
              </span>
              <input
                type="text"
                required={signatureType === "typed"}
                value={signatureType === "typed" ? signatureData : defaultSignerName}
                onChange={(event) => {
                  setSignatureType("typed");
                  setSignatureData(event.target.value);
                }}
                className="mt-2 w-full border border-line bg-surface px-4 py-3 font-display text-2xl italic text-ink outline-none focus:border-accent"
              />
            </label>
            <input type="hidden" name="signatureType" value={signatureType} />
            <input type="hidden" name="signatureData" value={signatureData} />
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-faint">
                Or draw (optional — replaces typed signature if used)
              </p>
              <canvas
                ref={canvasRef}
                width={640}
                height={160}
                className="mt-2 w-full touch-none border border-line bg-white"
                onPointerDown={(event) => {
                  drawing.current = true;
                  const ctx = event.currentTarget.getContext("2d");
                  if (!ctx) return;
                  const { x, y } = pointerPos(event);
                  ctx.strokeStyle = "#0a0e0c";
                  ctx.lineWidth = 2;
                  ctx.lineCap = "round";
                  ctx.beginPath();
                  ctx.moveTo(x, y);
                  event.currentTarget.setPointerCapture(event.pointerId);
                }}
                onPointerMove={(event) => {
                  if (!drawing.current) return;
                  const ctx = event.currentTarget.getContext("2d");
                  if (!ctx) return;
                  const { x, y } = pointerPos(event);
                  ctx.lineTo(x, y);
                  ctx.stroke();
                }}
                onPointerUp={(event) => {
                  drawing.current = false;
                  const data = event.currentTarget.toDataURL("image/png");
                  setSignatureType("drawn");
                  setSignatureData(data);
                }}
              />
              <button
                type="button"
                onClick={() => {
                  clearCanvas();
                  setSignatureType("typed");
                  setSignatureData(defaultSignerName);
                }}
                className="mt-2 text-xs text-muted underline-offset-2 hover:underline"
              >
                Clear drawing
              </button>
            </div>
            {state.error ? (
              <p className="text-sm text-red-600">{state.error}</p>
            ) : null}
            <button
              type="submit"
              disabled={pending}
              className="inline-flex min-h-11 items-center bg-accent px-5 text-sm font-medium text-on-accent disabled:opacity-60"
            >
              {pending ? "Submitting…" : "Sign & submit"}
            </button>
          </form>
        ) : (
          <div className="border-t border-line px-5 py-5 text-sm text-muted">
            Only organisation owners can sign this contract.
          </div>
        )}
      </div>
    </div>
  );
}
