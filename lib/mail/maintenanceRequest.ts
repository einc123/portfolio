import { site } from "@/lib/data";
import { getRuntimeEnv } from "@/lib/runtimeEnv";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function sendMaintenanceRequestEmail(input: {
  requesterEmail: string;
  requesterName?: string | null;
  organisationName?: string | null;
  organisationId: number;
  subject: string;
  details: string;
  hasActiveMaintenance: boolean;
  hourlyRateLabel: string;
  subscriptionId?: string | null;
}) {
  const apiKey = await getRuntimeEnv("MAILERSEND_API_KEY");
  const fromEmail = await getRuntimeEnv("MAILERSEND_FROM_EMAIL");
  const fromName =
    (await getRuntimeEnv("MAILERSEND_FROM_NAME")) || site.name;
  const toEmail =
    (await getRuntimeEnv("CONTACT_TO_EMAIL"))?.trim() || site.email;

  if (!apiKey || !fromEmail) {
    throw new Error("MailerSend is not configured.");
  }

  const who = input.requesterName?.trim() || input.requesterEmail;
  const coverage = input.hasActiveMaintenance
    ? "Active maintenance subscription — cover if it falls under the Maintenance Subscription Contract"
    : `No active maintenance subscription — billable at ${input.hourlyRateLabel}/hour`;

  const mailSubject = `Maintenance request · ${input.subject}`;
  const lines = [
    "A client raised a maintenance request from the portal.",
    "",
    `Client: ${who}`,
    `Email: ${input.requesterEmail}`,
    input.organisationName
      ? `Organisation: ${input.organisationName} (#${input.organisationId})`
      : `Organisation id: ${input.organisationId}`,
    `Coverage: ${coverage}`,
    input.subscriptionId
      ? `Maintenance subscription: ${input.subscriptionId}`
      : null,
    `Subject: ${input.subject}`,
    "",
    "Details:",
    input.details,
  ].filter((line): line is string => line != null);

  const text = lines.join("\n");
  const html = `
    <p>A client raised a maintenance request from the portal.</p>
    <ul>
      <li><strong>Client:</strong> ${escapeHtml(who)}</li>
      <li><strong>Email:</strong> ${escapeHtml(input.requesterEmail)}</li>
      <li><strong>Organisation:</strong> ${escapeHtml(
        input.organisationName || String(input.organisationId),
      )} (#${input.organisationId})</li>
      <li><strong>Coverage:</strong> ${escapeHtml(coverage)}</li>
      ${
        input.subscriptionId
          ? `<li><strong>Maintenance subscription:</strong> <code>${escapeHtml(input.subscriptionId)}</code></li>`
          : ""
      }
      <li><strong>Subject:</strong> ${escapeHtml(input.subject)}</li>
    </ul>
    <p><strong>Details</strong></p>
    <pre style="white-space:pre-wrap;font-family:inherit;background:#f6f6f6;padding:12px;border:1px solid #ddd;">${escapeHtml(input.details)}</pre>
  `.trim();

  const response = await fetch("https://api.mailersend.com/v1/email", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
    body: JSON.stringify({
      from: { email: fromEmail, name: fromName },
      to: [{ email: toEmail }],
      reply_to: {
        email: input.requesterEmail,
        name: input.requesterName?.trim() || undefined,
      },
      subject: mailSubject,
      text,
      html,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`MailerSend failed: ${response.status} ${detail}`);
  }
}
