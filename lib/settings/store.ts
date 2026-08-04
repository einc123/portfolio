import { execute, queryRows } from "@/lib/db";

export const HOURLY_RATE_PENCE_KEY = "hourly_rate_pence";
export const DEFAULT_HOURLY_RATE_PENCE = 3599;

export async function getSiteSetting(key: string): Promise<string | null> {
  const rows = await queryRows<{ value: string }>(
    `SELECT value FROM site_settings WHERE key = :key LIMIT 1`,
    { key },
  );
  return rows[0]?.value ?? null;
}

export async function setSiteSetting(key: string, value: string) {
  await execute(
    `INSERT INTO site_settings (key, value, updated_at)
     VALUES (:key, :value, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET
       value = excluded.value,
       updated_at = datetime('now')`,
    { key, value },
  );
}

export async function getHourlyRatePence(): Promise<number> {
  const raw = await getSiteSetting(HOURLY_RATE_PENCE_KEY);
  if (raw == null) {
    await setSiteSetting(
      HOURLY_RATE_PENCE_KEY,
      String(DEFAULT_HOURLY_RATE_PENCE),
    );
    return DEFAULT_HOURLY_RATE_PENCE;
  }
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 0) return DEFAULT_HOURLY_RATE_PENCE;
  return n;
}

export async function setHourlyRatePence(pence: number) {
  if (!Number.isFinite(pence) || pence < 0) {
    throw new Error("Hourly rate must be a non-negative amount.");
  }
  await setSiteSetting(HOURLY_RATE_PENCE_KEY, String(Math.round(pence)));
}

export function formatGbpFromPence(pence: number): string {
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(pence / 100);
  } catch {
    return `£${(pence / 100).toFixed(2)}`;
  }
}
