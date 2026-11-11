import { NextRequest, NextResponse } from "next/server";
import { getMealRecommendations } from "@/lib/openrouter";
import { getDbPool, isDbConfigured } from "@/lib/db";
import type { Meal, RecommendRequestBody } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: RecommendRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { mood, budget, currency = "USD", cravings } = body;

  if (!mood || typeof budget !== "number" || budget <= 0) {
    return NextResponse.json(
      { error: "`mood` (string) and `budget` (positive number) are required." },
      { status: 400 }
    );
  }

  const meals: Meal[] = await getMealRecommendations(mood, budget, currency, cravings);

  const ids: (string | null)[] = [];

  if (isDbConfigured()) {
    try {
      const pool = getDbPool();
      if (pool) {
        for (const meal of meals) {
          const result = await pool.query(
            `insert into recommendations
              (mood, cravings, budget, currency, meal_name, emoji, cuisine, description, estimated_cost, match_reason)
             values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             returning id`,
            [
              mood,
              cravings ?? null,
              budget,
              currency,
              meal.name,
              meal.emoji,
              meal.cuisine,
              meal.description,
              meal.estimatedCost,
              meal.matchReason,
            ]
          );
          ids.push(result.rows[0]?.id ?? null);
        }
      }
    } catch (err) {
      // Non-fatal: the recommendation still works without persistence.
      console.error("Failed to persist recommendations:", err);
    }
  }

  return NextResponse.json({
    meals: meals.map((meal, i) => ({ ...meal, id: ids[i] ?? null })),
  });
}
