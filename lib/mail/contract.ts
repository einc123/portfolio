import { site } from "@/lib/data";
import { getRuntimeEnv } from "@/lib/runtimeEnv";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function sendMail(input: {
  toEmail: string;
  toName?: string | null;
  subject: string;
  text: string;
  html: string;
  replyToEmail?: string;
  replyToName?: string | null;
}) {
  const apiKey = await getRuntimeEnv("MAILERSEND_API_KEY");
  const fromEmail = await getRuntimeEnv("MAILERSEND_FROM_EMAIL");
  const fromName =
    (await getRuntimeEnv("MAILERSEND_FROM_NAME")) || site.name;

  if (!apiKey || !fromEmail) {
    throw new Error("MailerSend is not configured.");
  }

  const body: Record<string, unknown> = {
    from: { email: fromEmail, name: fromName },
    to: [
      {
        email: input.toEmail,
        name: input.toName?.trim() || undefined,
      },
    ],
    subject: input.subject,
    text: input.text,
    html: input.html,
  };

  if (input.replyToEmail) {
    body.reply_to = {
      email: input.replyToEmail,
      name: input.replyToName?.trim() || undefined,
    };
  }

  const response = await fetch("https://api.mailersend.com/v1/email", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`MailerSend failed: ${response.status} ${detail}`);
  }
}

function wrapContractEmail(input: {
  preheader: string;
  heading: string;
  introHtml: string;
  contractTitle: string;
  contractBodyHtml: string;
  ctaUrl?: string;
  ctaLabel?: string;
  footerNote: string;
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f4f6f5;color:#0a0e0c;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(input.preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f5;">
    <tr><td align="center" style="padding:28px 16px;">
      <table role="presentation" width="100%" style="max-width:640px;background:#fff;border:1px solid #d8ded9;">
        <tr><td style="padding:28px 24px;">
          <p style="margin:0;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#8a948c;">${escapeHtml(site.name)}</p>
          <h1 style="margin:12px 0 0;font-size:28px;line-height:1.15;">${escapeHtml(input.heading)}</h1>
          <div style="margin-top:16px;font-size:15px;line-height:1.55;color:#5c675f;">${input.introHtml}</div>
          ${
            input.ctaUrl
              ? `<p style="margin:24px 0 0;"><a href="${escapeHtml(input.ctaUrl)}" style="display:inline-block;background:#0f5c4c;color:#fff;text-decoration:none;padding:12px 18px;font-size:14px;">${escapeHtml(input.ctaLabel || "Open portal")}</a></p>`
              : ""
          }
          <hr style="border:none;border-top:1px solid #d8ded9;margin:28px 0;" />
          <h2 style="margin:0 0 12px;font-size:18px;">${escapeHtml(input.contractTitle)}</h2>
          <div style="font-size:14px;line-height:1.6;color:#0a0e0c;">${input.contractBodyHtml}</div>
          <p style="margin:28px 0 0;font-size:12px;color:#8a948c;">${escapeHtml(input.footerNote)}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendContractForSignatureEmail(input: {
  toEmail: string;
  toName?: string | null;
  organisationName: string;
  contractTitle: string;
  contractBodyHtml: string;
  dashboardUrl: string;
}) {
  const greeting = input.toName?.trim()
    ? `Hi ${input.toName.trim()},`
    : "Hi,";
  const subject = `Contract to sign · ${input.contractTitle}`;
  const text = [
    greeting,
    "",
    `A contract has been sent for ${input.organisationName}.`,
    "",
    input.contractTitle,
    "",
    `Review and sign in the client portal:`,
    input.dashboardUrl,
    "",
    `— ${site.name}`,
  ].join("\n");

  const html = wrapContractEmail({
    preheader: `Please sign ${input.contractTitle}`,
    heading: "Contract ready to sign",
    introHtml: `<p>${escapeHtml(greeting)}</p><p>A contract has been sent for <strong>${escapeHtml(input.organisationName)}</strong>. Please review and sign it in the client portal.</p>`,
    contractTitle: input.contractTitle,
    contractBodyHtml: input.contractBodyHtml,
    ctaUrl: input.dashboardUrl,
    ctaLabel: "Review & sign",
    footerNote: "If you weren’t expecting this, contact the sender.",
  });

  await sendMail({
    toEmail: input.toEmail,
    toName: input.toName,
    subject,
    text,
    html,
  });
}

export async function sendSignedContractCopies(input: {
  clientEmail: string;
  clientName?: string | null;
  organisationName: string;
  contractTitle: string;
  contractBodyHtml: string;
  signedAt: string;
  signerName: string;
  contentHash: string;
  signedPayloadHash: string;
}) {
  const adminEmail =
    (await getRuntimeEnv("CONTACT_TO_EMAIL"))?.trim() || site.email;
  const signedLabel = new Date(input.signedAt).toLocaleString("en-GB");

  const metaHtml = `
    <p><strong>Organisation:</strong> ${escapeHtml(input.organisationName)}</p>
    <p><strong>Signed by:</strong> ${escapeHtml(input.signerName)} (${escapeHtml(input.clientEmail)})</p>
    <p><strong>Signed at:</strong> ${escapeHtml(signedLabel)}</p>
    <p style="font-size:12px;color:#8a948c;"><strong>Content hash:</strong> ${escapeHtml(input.contentHash)}<br/><strong>Signature hash:</strong> ${escapeHtml(input.signedPayloadHash)}</p>
  `;

  const bodyWithMeta = `${metaHtml}<hr style="border:none;border-top:1px solid #d8ded9;margin:20px 0;" />${input.contractBodyHtml}`;

  const subject = `Signed contract · ${input.contractTitle}`;
  const text = [
    `Signed contract: ${input.contractTitle}`,
    `Organisation: ${input.organisationName}`,
    `Signed by: ${input.signerName} <${input.clientEmail}>`,
    `Signed at: ${signedLabel}`,
    `Content hash: ${input.contentHash}`,
    `Signature hash: ${input.signedPayloadHash}`,
    "",
    `— ${site.name}`,
  ].join("\n");

  const clientHtml = wrapContractEmail({
    preheader: `Your signed copy of ${input.contractTitle}`,
    heading: "Signed contract copy",
    introHtml: `<p>Hi ${escapeHtml(input.clientName?.trim() || "there")},</p><p>Here is your signed copy of <strong>${escapeHtml(input.contractTitle)}</strong>.</p>`,
    contractTitle: input.contractTitle,
    contractBodyHtml: bodyWithMeta,
    footerNote: "Keep this email for your records.",
  });

  const adminHtml = wrapContractEmail({
    preheader: `${input.organisationName} signed ${input.contractTitle}`,
    heading: "Contract signed",
    introHtml: `<p>${escapeHtml(input.organisationName)} signed <strong>${escapeHtml(input.contractTitle)}</strong>.</p>`,
    contractTitle: input.contractTitle,
    contractBodyHtml: bodyWithMeta,
    footerNote: "Stored in the client portal as well.",
  });

  await sendMail({
    toEmail: input.clientEmail,
    toName: input.clientName,
    subject,
    text,
    html: clientHtml,
  });

  await sendMail({
    toEmail: adminEmail,
    toName: site.name,
    subject,
    text,
    html: adminHtml,
    replyToEmail: input.clientEmail,
    replyToName: input.clientName,
  });
}
