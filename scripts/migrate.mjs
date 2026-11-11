// Applies sql/schema.sql to the Supabase Postgres database provisioned via
// `stripe projects add supabase/project`. Uses the direct (non-pooled) DB
// URL, which is the right connection type for DDL/migrations.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { Client } from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The direct "db.<ref>.supabase.co" host often only resolves over IPv6,
// which many sandboxes/networks can't reach. The pooler host is IPv4-safe
// and works fine for a single-statement DDL script like this one, so try
// direct first and fall back to the pooler.
const candidates = [process.env.SUPABASE_DB_URL, process.env.SUPABASE_POOLER_URL].filter(
  Boolean
);

if (candidates.length === 0) {
  console.error(
    "Missing SUPABASE_DB_URL / SUPABASE_POOLER_URL. Run `stripe projects env --pull` first to sync credentials into .env."
  );
  process.exit(1);
}

const sql = readFileSync(path.join(__dirname, "..", "sql", "schema.sql"), "utf8");

function stripSslMode(url) {
  try {
    const u = new URL(url);
    u.searchParams.delete("sslmode");
    return u.toString();
  } catch {
    return url;
  }
}

let lastError;
for (const rawConnectionString of candidates) {
  const connectionString = stripSslMode(rawConnectionString);
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  try {
    await client.connect();
    await client.query(sql);
    console.log("✅ Schema applied successfully.");
    lastError = null;
    break;
  } catch (err) {
    lastError = err;
    console.warn(`⚠️  Connection attempt failed (${connectionString.split("@")[1]}):`, err.message);
  } finally {
    await client.end().catch(() => {});
  }
}

if (lastError) {
  console.error("❌ Migration failed:", lastError);
  process.exitCode = 1;
}
