"use client";

import { useState } from "react";
import type { Meal } from "@/lib/types";

interface Props {
  meal: Meal & { id: string | null };
}

export default function MealCard({ meal }: Props) {
  const [favorited, setFavorited] = useState(false);
  const [saving, setSaving] = useState(false);

  async function toggleFavorite() {
    if (!meal.id) return;
    setSaving(true);
    const next = !favorited;
    try {
      const res = await fetch("/api/favorites", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: meal.id, isFavorite: next }),
      });
      if (res.ok) setFavorited(next);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-3xl">{meal.emoji}</span>
          <div>
            <h3 className="font-semibold text-lg leading-tight">{meal.name}</h3>
            <p className="text-xs uppercase tracking-wide text-neutral-400">
              {meal.cuisine}
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled={!meal.id || saving}
          onClick={toggleFavorite}
          title={meal.id ? "Save as favorite" : "Favorites unavailable (no database)"}
          className="text-xl disabled:opacity-30"
        >
          {favorited ? "❤️" : "🤍"}
        </button>
      </div>

      <p className="text-sm text-neutral-600">{meal.description}</p>

      <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
        <span className="text-sm text-neutral-500">Est. cost</span>
        <span className="font-semibold text-vibe-600">
          {meal.currency} {meal.estimatedCost.toFixed(2)}
        </span>
      </div>

      <p className="text-xs text-neutral-400 italic">“{meal.matchReason}”</p>
    </div>
  );
}
