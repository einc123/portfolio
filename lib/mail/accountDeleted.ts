import { site } from "@/lib/data";
import { getRuntimeEnv } from "@/lib/runtimeEnv";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function sendAccountDeletedEmail(input: {
  toEmail: string;
  fullName?: string | null;
}) {
  const apiKey = await getRuntimeEnv("MAILERSEND_API_KEY");
  const fromEmail = await getRuntimeEnv("MAILERSEND_FROM_EMAIL");
  const fromName =
    (await getRuntimeEnv("MAILERSEND_FROM_NAME")) || site.name;

  if (!apiKey || !fromEmail) {
    throw new Error("MailerSend is not configured.");
  }

  const greeting = input.fullName?.trim()
    ? `Hi ${input.fullName.trim()},`
    : "Hi,";
  const subject = `Your ${site.name} client portal account has been deleted`;
  const text = [
    greeting,
    "",
    `Your client portal account on ${site.name} has been deleted.`,
    "",
    "You will no longer be able to sign in. If you think this was a mistake, contact us.",
    "",
    `— ${site.name}`,
    site.email,
  ].join("\n");

  const html = `
    <p>${escapeHtml(greeting)}</p>
    <p>Your client portal account on ${escapeHtml(site.name)} has been deleted.</p>
    <p>You will no longer be able to sign in. If you think this was a mistake, contact us at <a href="mailto:${escapeHtml(site.email)}">${escapeHtml(site.email)}</a>.</p>
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
      to: [{ email: input.toEmail }],
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
