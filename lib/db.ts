import { Pool } from "pg";

// Supabase credentials are provisioned via `stripe projects` and live in
// process.env (synced from .env, which is never committed). Prefer the
// pooler URL for serverless/edge-friendly connections; fall back to the
// direct DB URL if the pooler isn't configured.
const rawConnectionString =
  process.env.SUPABASE_POOLER_URL || process.env.SUPABASE_DB_URL;

// Strip `sslmode` from the URL: recent pg versions treat sslmode=require as
// an alias for verify-full, which rejects Supabase's cert chain. We instead
// pass `ssl` explicitly below.
function stripSslMode(url: string): string {
  try {
    const u = new URL(url);
    u.searchParams.delete("sslmode");
    return u.toString();
  } catch {
    return url;
  }
}

const connectionString = rawConnectionString ? stripSslMode(rawConnectionString) : undefined;

let pool: Pool | null = null;

export function getDbPool(): Pool | null {
  if (!connectionString) return null;
  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 5,
    });
  }
  return pool;
}

export function isDbConfigured(): boolean {
  return Boolean(connectionString);
}
