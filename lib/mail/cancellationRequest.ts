import { site } from "@/lib/data";
import { getRuntimeEnv } from "@/lib/runtimeEnv";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function sendSubscriptionCancellationRequestEmail(input: {
  requesterEmail: string;
  requesterName?: string | null;
  organisationName?: string | null;
  subscriptionId: string;
  subscriptionLabel: string;
  amountLabel?: string | null;
  status: string;
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
  const subject = `Cancellation request · ${input.subscriptionLabel}`;
  const lines = [
    "A client requested subscription cancellation from the portal.",
    "",
    `Client: ${who}`,
    `Email: ${input.requesterEmail}`,
    input.organisationName
      ? `Organisation: ${input.organisationName}`
      : null,
    `Subscription: ${input.subscriptionLabel}`,
    `Stripe id: ${input.subscriptionId}`,
    `Status: ${input.status}`,
    input.amountLabel ? `Amount: ${input.amountLabel}` : null,
    "",
    "They were told Euan Livingstone will be in touch.",
  ].filter((line): line is string => line != null);

  const text = lines.join("\n");
  const html = `
    <p>A client requested subscription cancellation from the portal.</p>
    <ul>
      <li><strong>Client:</strong> ${escapeHtml(who)}</li>
      <li><strong>Email:</strong> ${escapeHtml(input.requesterEmail)}</li>
      ${
        input.organisationName
          ? `<li><strong>Organisation:</strong> ${escapeHtml(input.organisationName)}</li>`
          : ""
      }
      <li><strong>Subscription:</strong> ${escapeHtml(input.subscriptionLabel)}</li>
      <li><strong>Stripe id:</strong> <code>${escapeHtml(input.subscriptionId)}</code></li>
      <li><strong>Status:</strong> ${escapeHtml(input.status)}</li>
      ${
        input.amountLabel
          ? `<li><strong>Amount:</strong> ${escapeHtml(input.amountLabel)}</li>`
          : ""
      }
    </ul>
    <p style="color:#666;font-size:13px;">They were told ${escapeHtml(site.name)} will be in touch.</p>
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
      subject,
      text,
      html,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`MailerSend failed: ${response.status} ${detail}`);
  }
}
