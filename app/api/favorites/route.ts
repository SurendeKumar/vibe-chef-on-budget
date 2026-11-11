import { NextRequest, NextResponse } from "next/server";
import { getDbPool, isDbConfigured } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  if (!isDbConfigured()) {
    return NextResponse.json({ favorites: [] });
  }
  try {
    const pool = getDbPool();
    const result = await pool!.query(
      `select id, mood, meal_name, description, estimated_cost, currency, match_reason, created_at
       from recommendations
       where is_favorite = true
       order by created_at desc
       limit 20`
    );
    return NextResponse.json({ favorites: result.rows });
  } catch (err) {
    console.error("Failed to load favorites:", err);
    return NextResponse.json({ favorites: [] });
  }
}

export async function PATCH(req: NextRequest) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  const { id, isFavorite } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "`id` is required" }, { status: 400 });
  }
  try {
    const pool = getDbPool();
    await pool!.query(`update recommendations set is_favorite = $1 where id = $2`, [
      Boolean(isFavorite),
      id,
    ]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to update favorite:", err);
    return NextResponse.json({ error: "Failed to update favorite" }, { status: 500 });
  }
}
