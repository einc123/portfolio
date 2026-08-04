import { createHash } from "crypto";

export function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function hashContractContent(title: string, bodyHtml: string): string {
  return sha256Hex(`${title}\n---\n${bodyHtml}`);
}

export function hashSignedPayload(input: {
  contentHash: string;
  signerName: string;
  signerEmail: string;
  signedAt: string;
  signatureData: string;
  signatureType: string;
}): string {
  return sha256Hex(
    [
      input.contentHash,
      input.signerName,
      input.signerEmail,
      input.signedAt,
      input.signatureType,
      input.signatureData,
    ].join("\n"),
  );
}
