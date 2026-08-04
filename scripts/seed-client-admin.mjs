import { readFileSync, mkdirSync } from "fs";
import { dirname, resolve } from "path";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";

function loadEnvFile(filePath) {
  try {
    const raw = readFileSync(filePath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    /* optional */
  }
}

loadEnvFile(resolve(process.cwd(), ".env.local"));
loadEnvFile(resolve(process.cwd(), ".env"));

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function d1Query(sql, params = []) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
  const token = process.env.CLOUDFLARE_API_TOKEN?.trim();
  const databaseId =
    process.env.CLOUDFLARE_D1_DATABASE_ID?.trim() ||
    "df8d7356-f8ff-45d0-90db-7378540e0273";

  if (!accountId || !token) {
    throw new Error(
      "Remote seed needs CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in .env.local",
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
  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(`D1 seed failed: ${JSON.stringify(payload.errors || payload)}`);
  }
  return payload.result?.[0] ?? { results: [], meta: {} };
}

async function seedRemote({ email, passwordHash, orgName, slug }) {
  await d1Query(
    `INSERT INTO client_users
      (email, password_hash, full_name, is_admin, status, billing_confirmed)
     VALUES (?, ?, ?, 1, 'active', 1)
     ON CONFLICT(email) DO UPDATE SET
       password_hash = excluded.password_hash,
       full_name = excluded.full_name,
       is_admin = 1,
       status = 'active',
       billing_confirmed = 1,
       updated_at = datetime('now')`,
    [email, passwordHash, "Euan Livingstone"],
  );

  const users = await d1Query(
    `SELECT id FROM client_users WHERE email = ? LIMIT 1`,
    [email],
  );
  const userId = users.results?.[0]?.id;
  if (!userId) throw new Error("Could not resolve admin user id.");

  await d1Query(
    `INSERT INTO client_organisations (name, slug, billing_confirmed)
     VALUES (?, ?, 1)
     ON CONFLICT(slug) DO UPDATE SET
       name = excluded.name,
       billing_confirmed = 1,
       updated_at = datetime('now')`,
    [orgName, slug],
  );

  const orgs = await d1Query(
    `SELECT id FROM client_organisations WHERE slug = ? LIMIT 1`,
    [slug],
  );
  const orgId = orgs.results?.[0]?.id;
  if (!orgId) throw new Error("Could not resolve organisation id.");

  await d1Query(
    `INSERT OR IGNORE INTO client_organisation_members (user_id, organisation_id, role)
     VALUES (?, ?, 'owner')`,
    [userId, orgId],
  );
}

function seedLocal({ email, passwordHash, orgName, slug }) {
  const file =
    process.env.D1_LOCAL_PATH?.trim() ||
    resolve(process.cwd(), ".data", "euanliv-click.sqlite");
  mkdirSync(dirname(file), { recursive: true });
  const db = new Database(file);
  db.pragma("foreign_keys = ON");

  try {
    db.prepare(
      `INSERT INTO client_users
        (email, password_hash, full_name, is_admin, status, billing_confirmed)
       VALUES (?, ?, ?, 1, 'active', 1)
       ON CONFLICT(email) DO UPDATE SET
         password_hash = excluded.password_hash,
         full_name = excluded.full_name,
         is_admin = 1,
         status = 'active',
         billing_confirmed = 1,
         updated_at = datetime('now')`,
    ).run(email, passwordHash, "Euan Livingstone");

    const user = db
      .prepare(`SELECT id FROM client_users WHERE email = ? LIMIT 1`)
      .get(email);
    if (!user?.id) throw new Error("Could not resolve admin user id.");

    db.prepare(
      `INSERT INTO client_organisations (name, slug, billing_confirmed)
       VALUES (?, ?, 1)
       ON CONFLICT(slug) DO UPDATE SET
         name = excluded.name,
         billing_confirmed = 1,
         updated_at = datetime('now')`,
    ).run(orgName, slug);

    const org = db
      .prepare(`SELECT id FROM client_organisations WHERE slug = ? LIMIT 1`)
      .get(slug);
    if (!org?.id) throw new Error("Could not resolve organisation id.");

    db.prepare(
      `INSERT OR IGNORE INTO client_organisation_members (user_id, organisation_id, role)
       VALUES (?, ?, 'owner')`,
    ).run(user.id, org.id);
  } finally {
    db.close();
  }
}

async function main() {
  const target = (process.argv[2] || "local").toLowerCase();
  const email = (process.env.ADMIN_EMAIL || "hello@euanliv.click").toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const orgName = process.env.ADMIN_ORG_NAME || "Euan Livingstone";

  if (!password || password.length < 10) {
    throw new Error(
      "Set ADMIN_PASSWORD (10+ chars) in the environment before seeding.",
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const slug = slugify(orgName) || "admin-org";
  const payload = { email, passwordHash, orgName, slug };

  if (target === "remote") {
    await seedRemote(payload);
  } else {
    seedLocal(payload);
  }

  console.log("Admin user ready:", email);
  console.log("Organisation:", orgName);
  console.log("Target:", target);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
