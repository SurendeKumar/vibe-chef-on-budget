"use client";

import { useState } from "react";
import MoodPicker from "@/components/MoodPicker";
import BudgetSlider from "@/components/BudgetSlider";
import MealCard from "@/components/MealCard";
import type { Meal, Mood } from "@/lib/types";

export default function Home() {
  const [mood, setMood] = useState<Mood | null>(null);
  const [budget, setBudget] = useState(12);
  const [cravings, setCravings] = useState("");
  const [meals, setMeals] = useState<(Meal & { id: string | null })[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!mood) {
      setError("Pick a mood first \u2014 we need to know how you're feeling!");
      return;
    }
    setError(null);
    setLoading(true);
    setMeals([]);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood, budget, currency: "USD", cravings }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Something went wrong.");
      }
      const data = await res.json();
      setMeals(data.meals ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight">
          🍽️ Vibe Chef <span className="text-vibe-600">on a Budget</span>
        </h1>
        <p className="mt-2 text-neutral-500">
          Tell us your mood and how much you want to spend — we&apos;ll tell you
          what to eat.
        </p>
      </header>

      <section className="rounded-2xl border border-neutral-200 bg-white/70 backdrop-blur p-6 shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-medium text-neutral-600 mb-2">
            How are you feeling?
          </label>
          <MoodPicker value={mood} onChange={setMood} />
        </div>

        <BudgetSlider value={budget} currency="USD" onChange={setBudget} />

        <div>
          <label className="block text-sm font-medium text-neutral-600 mb-2">
            Craving anything specific? (optional)
          </label>
          <input
            type="text"
            value={cravings}
            onChange={(e) => setCravings(e.target.value)}
            placeholder="e.g. something spicy, Italian, vegetarian..."
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-vibe-500"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full rounded-xl bg-vibe-600 py-3 font-semibold text-white transition hover:bg-vibe-700 disabled:opacity-60"
        >
          {loading ? "Thinking about food..." : "Recommend my meal 🍲"}
        </button>
      </section>

      {meals.length > 0 && (
        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          {meals.map((meal, i) => (
            <MealCard key={meal.id ?? i} meal={meal} />
          ))}
        </section>
      )}

      <footer className="mt-16 text-center text-xs text-neutral-400">
        Built with Next.js, OpenRouter &amp; Supabase — provisioned via{" "}
        <code>stripe projects</code>.
      </footer>
    </main>
  );
}
