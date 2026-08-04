import { mkdirSync } from "fs";
import { dirname, resolve } from "path";
import { getRuntimeEnv } from "@/lib/runtimeEnv";

export type DbUser = {
  id: number;
  email: string;
  password_hash: string | null;
  full_name: string | null;
  is_admin: number;
  totp_secret: string | null;
  totp_enabled: number;
  status: "invited" | "active" | "disabled";
  invite_token: string | null;
  invite_expires_at: string | null;
  billing_confirmed: number;
  billing_name: string | null;
  billing_line1: string | null;
  billing_line2: string | null;
  billing_city: string | null;
  billing_postcode: string | null;
  billing_country: string | null;
  billing_phone: string | null;
  stripe_customer_id: string | null;
  must_reset_password: number;
  password_reset_token: string | null;
  password_reset_expires_at: string | null;
  preferred_theme: "light" | "dark" | null;
  preferred_accent: string | null;
};

export type DbOrganisation = {
  id: number;
  name: string;
  slug: string;
  billing_confirmed: number;
  description: string | null;
  hosting_type: "managed" | "unmanaged";
  unmanaged_provider: "verpex" | "spaceship" | "other" | null;
  hosting_url: string | null;
  website_url: string | null;
};

export type DbMembership = DbOrganisation & {
  role: "member" | "owner";
};

export type DbPasskey = {
  id: number;
  user_id: number;
  credential_id: string;
  public_key: string;
  counter: number;
  transports: string | null;
  device_type: string | null;
  backed_up: number;
};

export type SqlParams = Record<
  string,
  string | number | boolean | Date | null | undefined
>;

export type ExecuteResult = {
  insertId: number;
  changes: number;
};

type D1Like = {
  prepare: (sql: string) => {
    bind: (...values: unknown[]) => {
      all: <T = Record<string, unknown>>() => Promise<{ results: T[] }>;
      run: () => Promise<{
        meta?: { last_row_id?: number; changes?: number };
      }>;
    };
  };
};

type Driver = "auto" | "binding" | "remote" | "local";

function toSqlValue(value: SqlParams[string]): string | number | null {
  if (value === undefined || value === null) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "boolean") return value ? 1 : 0;
  return value;
}

/** Convert `:name` placeholders to `?` and ordered values for D1/SQLite. */
export function bindNamed(sql: string, params: SqlParams = {}) {
  const values: Array<string | number | null> = [];
  const converted = sql.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, (_, key: string) => {
    if (!(key in params)) {
      throw new Error(`Missing SQL parameter: ${key}`);
    }
    values.push(toSqlValue(params[key]));
    return "?";
  });
  return { sql: converted, values };
}

async function resolveConfiguredDriver(): Promise<Driver> {
  const mode = (
    (await getRuntimeEnv("CLOUDFLARE_D1_MODE")) ||
    process.env.CLOUDFLARE_D1_MODE ||
    "auto"
  )
    .trim()
    .toLowerCase();
  if (
    mode === "local" ||
    mode === "remote" ||
    mode === "binding" ||
    mode === "auto"
  ) {
    return mode;
  }
  return "auto";
}

async function resolveRemoteCredentials() {
  const accountId =
    (await getRuntimeEnv("CLOUDFLARE_ACCOUNT_ID")) ||
    process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
  const token =
    (await getRuntimeEnv("CLOUDFLARE_API_TOKEN")) ||
    process.env.CLOUDFLARE_API_TOKEN?.trim();
  const databaseId =
    (await getRuntimeEnv("CLOUDFLARE_D1_DATABASE_ID")) ||
    process.env.CLOUDFLARE_D1_DATABASE_ID?.trim() ||
    "df8d7356-f8ff-45d0-90db-7378540e0273";
  return {
    accountId: accountId?.trim() || "",
    token: token?.trim() || "",
    databaseId,
  };
}

async function hasRemoteCredentials() {
  const { accountId, token } = await resolveRemoteCredentials();
  return Boolean(accountId && token);
}

/** True on Cloudflare Workers / workerd (never use better-sqlite3 there). */
function isCloudflareRuntime() {
  return (
    typeof (globalThis as { WebSocketPair?: unknown }).WebSocketPair !==
      "undefined" ||
    process.env.CF_PAGES === "1" ||
    typeof process.env.CF_WORKER !== "undefined"
  );
}

type BetterSqlite = {
  default: new (
    path: string,
  ) => {
    pragma: (sql: string) => unknown;
    prepare: (sql: string) => {
      all: (...values: unknown[]) => unknown[];
      run: (...values: unknown[]) => { lastInsertRowid: number | bigint; changes: number };
    };
    close: () => void;
  };
};

let localDb: InstanceType<BetterSqlite["default"]> | null = null;

async function getLocalSqlite() {
  if (localDb) return localDb;
  if (isCloudflareRuntime()) {
    throw new Error(
      "Local SQLite is not available on Cloudflare Workers. Use the D1 binding (DB).",
    );
  }
  const { default: Database } = (await import("better-sqlite3")) as BetterSqlite;
  const file =
    process.env.D1_LOCAL_PATH?.trim() ||
    resolve(process.cwd(), ".data", "euanliv-click.sqlite");
  mkdirSync(dirname(file), { recursive: true });
  localDb = new Database(file);
  localDb.pragma("journal_mode = WAL");
  localDb.pragma("foreign_keys = ON");
  return localDb;
}

async function getBindingDb(): Promise<D1Like | null> {
  try {
    // Avoid a static import so builds succeed without the optional adapter.
    const importer = new Function(
      "return import('@opennextjs/cloudflare')",
    ) as () => Promise<{
      getCloudflareContext?: (opts?: { async?: boolean }) =>
        | { env?: { DB?: D1Like } }
        | Promise<{ env?: { DB?: D1Like } }>;
    }>;
    const mod = await importer();
    if (!mod.getCloudflareContext) return null;
    const ctx = await mod.getCloudflareContext({ async: true });
    return ctx?.env?.DB ?? null;
  } catch {
    return null;
  }
}

async function remoteQuery<T extends Record<string, unknown>>(
  sql: string,
  params: Array<string | number | null>,
): Promise<{ results: T[]; meta: { last_row_id: number; changes: number } }> {
  const { accountId, token, databaseId } = await resolveRemoteCredentials();
  if (!accountId || !token) {
    throw new Error(
      "Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN (set as Worker secrets for remote mode).",
    );
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql, params }),
    },
  );

  const payload = (await response.json()) as {
    success?: boolean;
    errors?: { message?: string }[];
    result?: Array<{
      results?: T[];
      meta?: { last_row_id?: number; changes?: number };
    }>;
  };

  if (!response.ok || !payload.success) {
    const detail =
      payload.errors?.map((error) => error.message).filter(Boolean).join("; ") ||
      `HTTP ${response.status}`;
    throw new Error(`D1 query failed: ${detail}`);
  }

  const first = payload.result?.[0];
  return {
    results: first?.results ?? [],
    meta: {
      last_row_id: first?.meta?.last_row_id ?? 0,
      changes: first?.meta?.changes ?? 0,
    },
  };
}

async function runLocal<T extends Record<string, unknown>>(
  statement: string,
  values: Array<string | number | null>,
) {
  const db = await getLocalSqlite();
  if (/^\s*select/i.test(statement)) {
    const rows = db.prepare(statement).all(...values) as T[];
    return { results: rows, insertId: 0, changes: 0 };
  }
  const info = db.prepare(statement).run(...values);
  return {
    results: [] as T[],
    insertId: Number(info.lastInsertRowid),
    changes: info.changes,
  };
}

async function runViaBinding<T extends Record<string, unknown>>(
  statement: string,
  values: Array<string | number | null>,
  binding: D1Like,
) {
  const prepared = binding.prepare(statement).bind(...values);
  if (/^\s*select/i.test(statement)) {
    const { results } = await prepared.all<T>();
    return { results, insertId: 0, changes: 0 };
  }
  const result = await prepared.run();
  return {
    results: [] as T[],
    insertId: result.meta?.last_row_id ?? 0,
    changes: result.meta?.changes ?? 0,
  };
}

async function runQuery<T extends Record<string, unknown>>(
  sql: string,
  params: SqlParams = {},
): Promise<{ results: T[]; insertId: number; changes: number }> {
  const { sql: statement, values } = bindNamed(sql, params);
  const driver = await resolveConfiguredDriver();
  const remoteReady = await hasRemoteCredentials();

  // Explicit remote mode: use the D1 HTTP API (Worker secrets via getRuntimeEnv).
  if (driver === "remote") {
    if (!remoteReady) {
      throw new Error(
        "CLOUDFLARE_D1_MODE=remote needs CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN as Worker secrets.",
      );
    }
    const remote = await remoteQuery<T>(statement, values);
    return {
      results: remote.results,
      insertId: remote.meta.last_row_id,
      changes: remote.meta.changes,
    };
  }

  if (driver === "binding" || driver === "auto") {
    const binding = await getBindingDb();
    if (binding) {
      try {
        return await runViaBinding<T>(statement, values, binding);
      } catch (error) {
        if (driver === "binding") throw error;
        console.error("D1 binding query failed; trying fallback", error);
      }
    } else if (driver === "binding") {
      throw new Error("D1 binding DB is not available in this runtime.");
    }
  }

  if ((driver === "auto" || driver === "remote") && remoteReady) {
    const remote = await remoteQuery<T>(statement, values);
    return {
      results: remote.results,
      insertId: remote.meta.last_row_id,
      changes: remote.meta.changes,
    };
  }

  if (driver === "local" || driver === "auto") {
    if (isCloudflareRuntime()) {
      throw new Error(
        "D1 unavailable on Cloudflare Workers (no working binding/remote credentials).",
      );
    }
    return runLocal<T>(statement, values);
  }

  throw new Error(`Unsupported D1 mode: ${driver}`);
}

export async function queryRows<T extends Record<string, unknown>>(
  sql: string,
  params?: SqlParams,
) {
  const { results } = await runQuery<T>(sql, params);
  return results;
}

export async function execute(sql: string, params?: SqlParams): Promise<ExecuteResult> {
  const { insertId, changes } = await runQuery(sql, params);
  return { insertId, changes };
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
}

export type DbDriverMode = "binding" | "remote" | "local";

export function getDbDriver(): DbDriverMode {
  const mode = (process.env.CLOUDFLARE_D1_MODE || "auto").trim().toLowerCase();
  if (mode === "binding" || mode === "remote" || mode === "local") return mode;
  if (
    process.env.CLOUDFLARE_ACCOUNT_ID?.trim() &&
    process.env.CLOUDFLARE_API_TOKEN?.trim()
  ) {
    return "remote";
  }
  return "local";
}

/**
 * Effective D1 access path for this request — same order as `runQuery`.
 */
export async function resolveDbDriver(): Promise<{
  mode: DbDriverMode;
  configured: Driver;
}> {
  const configured = await resolveConfiguredDriver();

  if (configured === "remote") {
    if (!(await hasRemoteCredentials())) {
      throw new Error(
        "CLOUDFLARE_D1_MODE=remote needs API credentials (Worker secrets).",
      );
    }
    return { mode: "remote", configured };
  }

  if (configured === "local") {
    return { mode: "local", configured };
  }

  const binding = await getBindingDb();
  if (binding) return { mode: "binding", configured };

  if (configured === "binding") {
    throw new Error("D1 binding DB is not available in this runtime.");
  }

  if (await hasRemoteCredentials()) {
    return { mode: "remote", configured };
  }

  return { mode: "local", configured };
}
