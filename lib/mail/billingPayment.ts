import { site } from "@/lib/data";
import { getRuntimeEnv } from "@/lib/runtimeEnv";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const colors = {
  paper: "#f4f6f5",
  ink: "#0a0e0c",
  muted: "#5c675f",
  faint: "#8a948c",
  accent: "#0f5c4c",
  onAccent: "#ffffff",
  line: "#d8ded9",
  soft: "#d7ebe4",
  white: "#ffffff",
} as const;

export type BillingPaymentKind = "invoice" | "subscription" | "maintenance";

function kindLabel(kind: BillingPaymentKind) {
  switch (kind) {
    case "maintenance":
      return "Maintenance subscription";
    case "subscription":
      return "Subscription";
    default:
      return "Invoice";
  }
}

function buildSubject(input: {
  kind: BillingPaymentKind;
  organisationName: string;
  description: string;
}) {
  const label = kindLabel(input.kind);
  return `${label} ready to pay · ${input.organisationName}`;
}

function buildHtml(input: {
  kind: BillingPaymentKind;
  organisationName: string;
  description: string;
  amountLabel: string;
  paymentUrl: string;
  recipientName?: string | null;
}) {
  const greeting = input.recipientName?.trim()
    ? `Hi ${escapeHtml(input.recipientName.trim())},`
    : "Hi,";
  const org = escapeHtml(input.organisationName);
  const description = escapeHtml(input.description);
  const amount = escapeHtml(input.amountLabel);
  const url = escapeHtml(input.paymentUrl);
  const name = escapeHtml(site.name);
  const brand = escapeHtml(site.brand);
  const siteUrl = escapeHtml(site.url);
  const label = escapeHtml(kindLabel(input.kind));
  const headline =
    input.kind === "maintenance"
      ? "Maintenance ready."
      : input.kind === "subscription"
        ? "Subscription ready."
        : "Invoice ready.";
  const bodyCopy =
    input.kind === "maintenance"
      ? `A website maintenance subscription has been set up for <strong style="color:${colors.ink};">${org}</strong>. Use the button below to pay the first invoice and activate it.`
      : input.kind === "subscription"
        ? `A subscription has been created for <strong style="color:${colors.ink};">${org}</strong>. Use the button below to pay the first invoice.`
        : `An invoice is ready for <strong style="color:${colors.ink};">${org}</strong>. Use the button below to review and pay securely via Stripe.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>${label} ready to pay</title>
</head>
<body style="margin:0;padding:0;background:${colors.paper};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">
    ${label} for ${org}: ${amount}. Pay securely via Stripe.
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${colors.paper};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">
          <tr>
            <td style="padding:0 0 20px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;letter-spacing:0.04em;color:${colors.faint};">
              ${brand}
            </td>
          </tr>
          <tr>
            <td style="background:${colors.white};border:1px solid ${colors.line};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:${colors.ink};padding:28px 28px 24px;">
                    <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(238,243,240,0.5);">
                      Client billing
                    </p>
                    <h1 style="margin:14px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:32px;font-weight:400;font-style:italic;line-height:1.05;letter-spacing:-0.02em;color:#eef3f0;">
                      ${headline}
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:28px 28px 8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;line-height:1.55;color:${colors.ink};">
                    <p style="margin:0 0 16px;color:${colors.muted};">
                      ${greeting}
                    </p>
                    <p style="margin:0 0 16px;color:${colors.muted};">
                      ${bodyCopy}
                    </p>
                    <p style="margin:0 0 22px;color:${colors.ink};">
                      <strong>${description}</strong><br />
                      <span style="color:${colors.muted};">${amount}</span>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 28px 8px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background:${colors.accent};">
                          <a href="${url}" style="display:inline-block;padding:14px 22px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;font-weight:600;line-height:1;color:${colors.onAccent};text-decoration:none;">
                            Pay now
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 28px 8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:13px;line-height:1.5;color:${colors.faint};">
                    Or paste this link into your browser:<br />
                    <a href="${url}" style="color:${colors.accent};word-break:break-all;text-decoration:underline;">${url}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 28px 28px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${colors.soft};">
                      <tr>
                        <td style="padding:16px 18px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:13px;line-height:1.5;color:${colors.ink};">
                          <strong style="display:block;margin:0 0 6px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${colors.accent};">
                            Secure payment
                          </strong>
                          You’ll pay on Stripe’s hosted invoice page. You can also review invoices and subscriptions any time in the client portal.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:22px 4px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;line-height:1.5;color:${colors.faint};">
              ${name} · Web designer &amp; developer<br />
              <a href="${siteUrl}" style="color:${colors.accent};text-decoration:none;">${siteUrl.replace(/^https?:\/\//, "")}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildText(input: {
  kind: BillingPaymentKind;
  organisationName: string;
  description: string;
  amountLabel: string;
  paymentUrl: string;
  recipientName?: string | null;
}) {
  const greeting = input.recipientName?.trim()
    ? `Hi ${input.recipientName.trim()},`
    : "Hi,";
  const intro =
    input.kind === "maintenance"
      ? `A website maintenance subscription has been set up for ${input.organisationName}. Pay the first invoice to activate it:`
      : input.kind === "subscription"
        ? `A subscription has been created for ${input.organisationName}. Pay the first invoice here:`
        : `An invoice is ready for ${input.organisationName}. Review and pay securely via Stripe:`;

  return [
    greeting,
    "",
    intro,
    "",
    input.description,
    input.amountLabel,
    "",
    input.paymentUrl,
    "",
    `— ${site.name}`,
    site.url,
  ].join("\n");
}

export async function sendBillingPaymentEmail(input: {
  toEmail: string;
  recipientName?: string | null;
  organisationName: string;
  kind: BillingPaymentKind;
  description: string;
  amountLabel: string;
  paymentUrl: string;
}) {
  const apiKey = await getRuntimeEnv("MAILERSEND_API_KEY");
  const fromEmail = await getRuntimeEnv("MAILERSEND_FROM_EMAIL");
  const fromName =
    (await getRuntimeEnv("MAILERSEND_FROM_NAME")) || site.name;

  if (!apiKey || !fromEmail) {
    throw new Error("MailerSend is not configured.");
  }
  if (!input.paymentUrl.trim()) {
    throw new Error("Missing payment link for billing email.");
  }

  const subject = buildSubject(input);
  const text = buildText(input);
  const html = buildHtml(input);

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
