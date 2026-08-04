import { execute, queryRows } from "@/lib/db";
import {
  hashContractContent,
  hashSignedPayload,
} from "@/lib/contracts/hash";
import { CONTRACT_TEMPLATE_SEEDS, CONTRACT_SCOTS_MARKER, CONTRACT_WITHDRAW_MARKER } from "@/lib/contracts/templates";
import { site } from "@/lib/data";

export type DbContractTemplate = {
  id: number;
  slug: string;
  title: string;
  body_html: string;
  sort_order: number;
  is_active: number;
};

export type DbOrganisationContract = {
  id: number;
  organisation_id: number;
  template_id: number | null;
  title: string;
  body_html: string;
  status: "pending" | "signed" | "voided";
  content_hash: string;
  sent_at: string | null;
  sent_by_user_id: number | null;
  signed_at: string | null;
  signer_user_id: number | null;
  signer_name: string | null;
  signer_email: string | null;
  signature_data: string | null;
  signature_type: "typed" | "drawn" | null;
  signed_payload_hash: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
};

export type OrganisationContractRow = DbOrganisationContract & {
  organisation_name?: string;
  template_slug?: string | null;
};

export type ContractSendFields = {
  organisationName: string;
  clientName: string;
  clientEmail: string;
  date?: string;
  /** Plain text; newlines preserved as HTML breaks/paragraphs */
  scope?: string | null;
  fees?: string | null;
  timeline?: string | null;
  notes?: string | null;
};

const FALLBACK_SCOPE =
  "As agreed in writing between the parties (proposal, email, or statement of work).";
const FALLBACK_FEES = "As quoted / agreed in writing between the parties.";
const FALLBACK_TIMELINE =
  "As agreed in writing; dependent on timely Client feedback and materials.";
const FALLBACK_NOTES = "None.";

/** True if the template body references any per-send particulars placeholders. */
export function templateUsesParticularsPlaceholders(html: string) {
  return /\{\{(scope|fees|timeline|notes)\}\}/.test(html);
}

/** Escape plain text and turn newlines into paragraphs / breaks. */
export function formatContractPlainField(
  value: string | null | undefined,
  fallback: string,
): string {
  const trimmed = value?.trim();
  const source = trimmed || fallback;
  const blocks = source.split(/\n{2,}/).map((block) => {
    const html = escapeHtml(block.trim()).replaceAll("\n", "<br />");
    return `<p>${html}</p>`;
  });
  return blocks.join("\n");
}

export function buildContractParticularsSection(fields: {
  scope?: string | null;
  fees?: string | null;
  timeline?: string | null;
  notes?: string | null;
}): string | null {
  const rows: { label: string; value: string }[] = [];
  if (fields.scope?.trim()) {
    rows.push({ label: "Scope", value: fields.scope.trim() });
  }
  if (fields.fees?.trim()) {
    rows.push({ label: "Fees", value: fields.fees.trim() });
  }
  if (fields.timeline?.trim()) {
    rows.push({ label: "Timeline", value: fields.timeline.trim() });
  }
  if (fields.notes?.trim()) {
    rows.push({ label: "Additional notes", value: fields.notes.trim() });
  }
  if (rows.length === 0) return null;

  const body = rows
    .map(
      (row) =>
        `<h3>${escapeHtml(row.label)}</h3>\n${formatContractPlainField(row.value, row.value)}`,
    )
    .join("\n");

  return `<h2>Agreed particulars</h2>\n${body}`;
}

export function renderContractPlaceholders(
  html: string,
  vars: ContractSendFields,
) {
  const date =
    vars.date ||
    new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return html
    .replaceAll("{{organisation_name}}", escapeHtml(vars.organisationName))
    .replaceAll("{{client_name}}", escapeHtml(vars.clientName))
    .replaceAll("{{client_email}}", escapeHtml(vars.clientEmail))
    .replaceAll("{{date}}", escapeHtml(date))
    .replaceAll("{{provider_name}}", escapeHtml(site.name))
    .replaceAll("{{provider_email}}", escapeHtml(site.email))
    .replaceAll("{{provider_trading}}", escapeHtml(site.tradingAs))
    .replaceAll("{{provider_location}}", escapeHtml(site.locationFormal))
    .replaceAll(
      "{{scope}}",
      formatContractPlainField(vars.scope, FALLBACK_SCOPE),
    )
    .replaceAll(
      "{{fees}}",
      formatContractPlainField(vars.fees, FALLBACK_FEES),
    )
    .replaceAll(
      "{{timeline}}",
      formatContractPlainField(vars.timeline, FALLBACK_TIMELINE),
    )
    .replaceAll(
      "{{notes}}",
      formatContractPlainField(vars.notes, FALLBACK_NOTES),
    );
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function ensureContractTemplatesSeeded() {
  const existing = await queryRows<{ slug: string; body_html: string }>(
    `SELECT slug, body_html FROM contract_templates`,
  );
  const bySlug = new Map(existing.map((row) => [row.slug, row]));

  for (const seed of CONTRACT_TEMPLATE_SEEDS) {
    const current = bySlug.get(seed.slug);
    if (!current) {
      await execute(
        `INSERT INTO contract_templates (slug, title, body_html, sort_order, is_active)
         VALUES (:slug, :title, :bodyHtml, :sortOrder, 1)`,
        {
          slug: seed.slug,
          title: seed.title,
          bodyHtml: seed.bodyHtml,
          sortOrder: seed.sortOrder,
        },
      );
      continue;
    }

    // Upgrade legacy seed bodies (Scots law / withdrawal clause / known content fixes).
    const needsUpgrade =
      !current.body_html.includes(CONTRACT_SCOTS_MARKER) ||
      !current.body_html.includes(CONTRACT_WITHDRAW_MARKER) ||
      (seed.slug === "drone-photography" &&
        current.body_html.includes("DJI Mini 3")) ||
      (seed.slug === "maintenance-subscription" &&
        current.body_html.includes("{{scope}}"));

    if (needsUpgrade) {
      await execute(
        `UPDATE contract_templates
         SET title = :title,
             body_html = :bodyHtml,
             sort_order = :sortOrder,
             updated_at = datetime('now')
         WHERE slug = :slug`,
        {
          slug: seed.slug,
          title: seed.title,
          bodyHtml: seed.bodyHtml,
          sortOrder: seed.sortOrder,
        },
      );
    }
  }
}

export async function listContractTemplates(activeOnly = false) {
  await ensureContractTemplatesSeeded();
  if (activeOnly) {
    return queryRows<DbContractTemplate>(
      `SELECT * FROM contract_templates
       WHERE is_active = 1
       ORDER BY sort_order ASC, title ASC`,
    );
  }
  return queryRows<DbContractTemplate>(
    `SELECT * FROM contract_templates
     ORDER BY sort_order ASC, title ASC`,
  );
}

export async function findContractTemplateById(id: number) {
  const rows = await queryRows<DbContractTemplate>(
    `SELECT * FROM contract_templates WHERE id = :id LIMIT 1`,
    { id },
  );
  return rows[0] ?? null;
}

export async function updateContractTemplate(input: {
  id: number;
  title: string;
  bodyHtml: string;
  isActive: boolean;
}) {
  await execute(
    `UPDATE contract_templates
     SET title = :title,
         body_html = :bodyHtml,
         is_active = :isActive,
         updated_at = datetime('now')
     WHERE id = :id`,
    {
      id: input.id,
      title: input.title,
      bodyHtml: input.bodyHtml,
      isActive: input.isActive ? 1 : 0,
    },
  );
}

export async function listOrganisationOwners(organisationId: number) {
  return queryRows<{
    id: number;
    email: string;
    full_name: string | null;
  }>(
    `SELECT u.id, u.email, u.full_name
     FROM client_organisation_members m
     INNER JOIN client_users u ON u.id = m.user_id
     WHERE m.organisation_id = :organisationId
       AND m.role = 'owner'
       AND u.status != 'disabled'
     ORDER BY u.full_name ASC, u.email ASC`,
    { organisationId },
  );
}

export async function createOrganisationContract(input: {
  organisationId: number;
  templateId: number;
  title: string;
  bodyHtml: string;
  sentByUserId: number;
}) {
  const contentHash = hashContractContent(input.title, input.bodyHtml);
  const result = await execute(
    `INSERT INTO organisation_contracts
      (organisation_id, template_id, title, body_html, status, content_hash,
       sent_at, sent_by_user_id)
     VALUES
      (:organisationId, :templateId, :title, :bodyHtml, 'pending', :contentHash,
       datetime('now'), :sentByUserId)`,
    {
      organisationId: input.organisationId,
      templateId: input.templateId,
      title: input.title,
      bodyHtml: input.bodyHtml,
      contentHash,
      sentByUserId: input.sentByUserId,
    },
  );
  return findOrganisationContractById(result.insertId);
}

export async function findOrganisationContractById(id: number) {
  const rows = await queryRows<DbOrganisationContract>(
    `SELECT * FROM organisation_contracts WHERE id = :id LIMIT 1`,
    { id },
  );
  return rows[0] ?? null;
}

export async function listContractsForOrganisation(organisationId: number) {
  return queryRows<DbOrganisationContract>(
    `SELECT * FROM organisation_contracts
     WHERE organisation_id = :organisationId
     ORDER BY created_at DESC, id DESC`,
    { organisationId },
  );
}

export async function listAllOrganisationContracts() {
  return queryRows<OrganisationContractRow>(
    `SELECT c.*, o.name AS organisation_name, t.slug AS template_slug
     FROM organisation_contracts c
     INNER JOIN client_organisations o ON o.id = c.organisation_id
     LEFT JOIN contract_templates t ON t.id = c.template_id
     ORDER BY c.created_at DESC, c.id DESC`,
  );
}

export async function signOrganisationContract(input: {
  contractId: number;
  signerUserId: number;
  signerName: string;
  signerEmail: string;
  signatureData: string;
  signatureType: "typed" | "drawn";
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const contract = await findOrganisationContractById(input.contractId);
  if (!contract) throw new Error("Contract not found.");
  if (contract.status !== "pending") {
    throw new Error("This contract is not awaiting signature.");
  }

  const signedAt = new Date().toISOString();
  const signedPayloadHash = hashSignedPayload({
    contentHash: contract.content_hash,
    signerName: input.signerName,
    signerEmail: input.signerEmail,
    signedAt,
    signatureData: input.signatureData,
    signatureType: input.signatureType,
  });

  await execute(
    `UPDATE organisation_contracts
     SET status = 'signed',
         signed_at = :signedAt,
         signer_user_id = :signerUserId,
         signer_name = :signerName,
         signer_email = :signerEmail,
         signature_data = :signatureData,
         signature_type = :signatureType,
         signed_payload_hash = :signedPayloadHash,
         ip_address = :ipAddress,
         user_agent = :userAgent,
         updated_at = datetime('now')
     WHERE id = :id AND status = 'pending'`,
    {
      id: input.contractId,
      signedAt,
      signerUserId: input.signerUserId,
      signerName: input.signerName,
      signerEmail: input.signerEmail,
      signatureData: input.signatureData,
      signatureType: input.signatureType,
      signedPayloadHash,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
    },
  );

  return findOrganisationContractById(input.contractId);
}

export async function withdrawOrganisationContract(contractId: number) {
  const contract = await findOrganisationContractById(contractId);
  if (!contract) throw new Error("Contract not found.");
  if (contract.status !== "pending") {
    throw new Error("Only pending (unsigned) contracts can be withdrawn.");
  }

  await execute(
    `UPDATE organisation_contracts
     SET status = 'voided',
         updated_at = datetime('now')
     WHERE id = :id AND status = 'pending'`,
    { id: contractId },
  );

  return findOrganisationContractById(contractId);
}

export async function deleteOrganisationContract(contractId: number) {
  const contract = await findOrganisationContractById(contractId);
  if (!contract) throw new Error("Contract not found.");

  await execute(`DELETE FROM organisation_contracts WHERE id = :id`, {
    id: contractId,
  });
}
