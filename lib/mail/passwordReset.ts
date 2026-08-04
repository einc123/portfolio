import { site } from "@/lib/data";
import { getRuntimeEnv } from "@/lib/runtimeEnv";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function sendPasswordResetEmail(input: {
  toEmail: string;
  resetUrl: string;
  fullName?: string | null;
}) {
  const apiKey = await getRuntimeEnv("MAILERSEND_API_KEY");
  const fromEmail = await getRuntimeEnv("MAILERSEND_FROM_EMAIL");
  const fromName =
    (await getRuntimeEnv("MAILERSEND_FROM_NAME")) || "Euan Livingstone";

  if (!apiKey || !fromEmail) {
    throw new Error("MailerSend is not configured.");
  }

  const greeting = input.fullName?.trim()
    ? `Hi ${input.fullName.trim()},`
    : "Hi,";
  const subject = `Reset your ${site.name} client portal password`;
  const text = [
    greeting,
    "",
    "A password reset was requested for your client portal account.",
    "",
    "Reset your password:",
    input.resetUrl,
    "",
    "This link expires in 2 hours. If you didn't request it, you can ignore this email.",
    "",
    `— ${site.name}`,
  ].join("\n");

  const html = `
    <p>${escapeHtml(greeting)}</p>
    <p>A password reset was requested for your client portal account.</p>
    <p><a href="${escapeHtml(input.resetUrl)}">Reset your password</a></p>
    <p style="color:#666;font-size:13px;">This link expires in 2 hours. If you didn't request it, ignore this email.</p>
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
