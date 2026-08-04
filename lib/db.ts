import Database from "better-sqlite3";
import { mkdirSync } from "fs";
import { dirname, resolve } from "path";

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

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

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

function configuredDriver(): Driver {
  const mode = (process.env.CLOUDFLARE_D1_MODE || "auto").trim().toLowerCase();
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

function hasRemoteCredentials() {
  return Boolean(
    process.env.CLOUDFLARE_ACCOUNT_ID?.trim() &&
      process.env.CLOUDFLARE_API_TOKEN?.trim(),
  );
}

let localDb: Database.Database | null = null;

function getLocalSqlite() {
  if (localDb) return localDb;
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
  const accountId = required("CLOUDFLARE_ACCOUNT_ID");
  const token = required("CLOUDFLARE_API_TOKEN");
  const databaseId =
    process.env.CLOUDFLARE_D1_DATABASE_ID?.trim() ||
    "df8d7356-f8ff-45d0-90db-7378540e0273";

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
  const db = getLocalSqlite();
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

async function runQuery<T extends Record<string, unknown>>(
  sql: string,
  params: SqlParams = {},
): Promise<{ results: T[]; insertId: number; changes: number }> {
  const { sql: statement, values } = bindNamed(sql, params);
  const driver = configuredDriver();

  if (driver === "binding" || driver === "auto") {
    const binding = await getBindingDb();
    if (binding) {
      const prepared = binding.prepare(statement).bind(...values);
      if (/^\s*select/i.test(statement)) {
        const { results } = await prepared.all<T>();
        return { results, insertId: 0, changes: 0 };
      }
      const result = await prepared.run();
      return {
        results: [],
        insertId: result.meta?.last_row_id ?? 0,
        changes: result.meta?.changes ?? 0,
      };
    }
    if (driver === "binding") {
      throw new Error("D1 binding DB is not available in this runtime.");
    }
  }

  if (driver === "remote" || (driver === "auto" && hasRemoteCredentials())) {
    const remote = await remoteQuery<T>(statement, values);
    return {
      results: remote.results,
      insertId: remote.meta.last_row_id,
      changes: remote.meta.changes,
    };
  }

  return runLocal<T>(statement, values);
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

export function getDbDriver() {
  const driver = configuredDriver();
  if (driver !== "auto") return driver;
  if (hasRemoteCredentials()) return "remote";
  return "local";
}
