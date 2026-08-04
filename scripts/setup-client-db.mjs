import { readFileSync, mkdirSync } from "fs";
import { dirname, resolve } from "path";
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

function splitStatements(sql) {
  const withoutLineComments = sql
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");

  return withoutLineComments
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

async function applyRemote(statements) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
  const token = process.env.CLOUDFLARE_API_TOKEN?.trim();
  const databaseId =
    process.env.CLOUDFLARE_D1_DATABASE_ID?.trim() ||
    "df8d7356-f8ff-45d0-90db-7378540e0273";

  if (!accountId || !token) {
    throw new Error(
      "Remote migrate needs CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in .env.local",
    );
  }

  for (const statement of statements) {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sql: statement }),
      },
    );
    const payload = await response.json();
    if (!response.ok || !payload.success) {
      const detail = JSON.stringify(payload.errors || payload);
      if (/duplicate column/i.test(detail)) {
        console.log("SKIP (exists):", statement.slice(0, 72).replace(/\s+/g, " "), "…");
        continue;
      }
      throw new Error(`D1 migrate failed: ${detail}`);
    }
    console.log("OK:", statement.slice(0, 72).replace(/\s+/g, " "), "…");
  }
}

function applyLocal(statements) {
  const file =
    process.env.D1_LOCAL_PATH?.trim() ||
    resolve(process.cwd(), ".data", "euanliv-click.sqlite");
  mkdirSync(dirname(file), { recursive: true });
  const db = new Database(file);
  db.pragma("foreign_keys = ON");
  try {
    for (const statement of statements) {
      try {
        db.exec(statement);
        console.log("OK:", statement.slice(0, 72).replace(/\s+/g, " "), "…");
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (/duplicate column/i.test(message)) {
          console.log(
            "SKIP (exists):",
            statement.slice(0, 72).replace(/\s+/g, " "),
            "…",
          );
          continue;
        }
        throw error;
      }
    }
  } finally {
    db.close();
  }
  console.log("Local file:", file);
}

async function main() {
  const target = (process.argv[2] || "local").toLowerCase();
  const migrationsDir = resolve(process.cwd(), "migrations");
  const { readdirSync } = await import("fs");
  const files = readdirSync(migrationsDir)
    .filter((name) => name.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const sqlPath = resolve(migrationsDir, file);
    const sql = readFileSync(sqlPath, "utf8");
    const statements = splitStatements(sql);
    console.log(`\nApplying ${file}…`);

    if (target === "remote") {
      await applyRemote(statements);
    } else {
      applyLocal(statements);
    }
  }

  if (target === "remote") {
    console.log("\nRemote D1 schema ready (euanliv-click).");
    return;
  }

  console.log("\nLocal migrations complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
