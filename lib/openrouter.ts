import type { Meal, Mood } from "./types";

// Free OpenRouter models worth trying, in order of preference. OpenRouter's
// free catalog changes frequently (models get deprecated or rate-limited),
// so we fail over to the next model if one is unavailable. Verified
// available against the live /models endpoint as of this writing; update
// this list if OpenRouter's free catalog shifts again.
const CANDIDATE_MODELS = [
  "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
  "baidu/ernie-5.5-flash-preview:free",
  "liquid/lfm-2.5-2.6b:free",
  "google/gemma-4-31b-it:free",
  "google/gemma-4-26b-a4b-it:free",
];

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

function getApiKey(): string {
  const key = process.env.MOOD_MEAL_AI_API_KEY || process.env.OPENROUTER_PLAN_API_KEY;
  if (!key) {
    throw new Error(
      "Missing OpenRouter API key. Run `stripe projects env --pull` to sync credentials."
    );
  }
  return key;
}

function buildPrompt(mood: Mood, budget: number, currency: string, cravings?: string) {
  return [
    {
      role: "system" as const,
      content:
        "You are Vibe Chef, a friendly meal-recommendation assistant. " +
        "You suggest real, specific meals (homemade or takeout) that match a person's " +
        "current mood and fit within their budget. Always respond with strict JSON only, " +
        "no markdown, no commentary \u2014 matching this TypeScript type exactly: " +
        '{ "meals": Array<{ "name": string; "emoji": string; "cuisine": string; ' +
        '"description": string; "estimatedCost": number; "matchReason": string }> }. ' +
        "Return exactly 3 meals. estimatedCost must be a number (no currency symbol) " +
        "and must not exceed the given budget. matchReason should briefly explain why " +
        "the meal fits the mood (comfort, energy, celebration, etc.).",
    },
    {
      role: "user" as const,
      content:
        `My mood right now is: ${mood}. ` +
        `My budget per meal is ${budget} ${currency}. ` +
        (cravings ? `I'm also craving: ${cravings}. ` : "") +
        "Recommend 3 meals for me.",
    },
  ];
}

function tryParseMeals(raw: string, currency: string): Meal[] | null {
  try {
    // Strip code fences if the model ignores instructions.
    const cleaned = raw.trim().replace(/^```json\s*|^```\s*|```$/g, "");
    const parsed = JSON.parse(cleaned);
    const meals = parsed.meals;
    if (!Array.isArray(meals) || meals.length === 0) return null;
    return meals.map((m: any) => ({
      name: String(m.name ?? "Mystery meal"),
      emoji: String(m.emoji ?? "🍽️"),
      cuisine: String(m.cuisine ?? "Fusion"),
      description: String(m.description ?? ""),
      estimatedCost: Number(m.estimatedCost ?? 0),
      currency,
      matchReason: String(m.matchReason ?? ""),
    }));
  } catch {
    return null;
  }
}

export async function getMealRecommendations(
  mood: Mood,
  budget: number,
  currency: string = "USD",
  cravings?: string
): Promise<Meal[]> {
  const apiKey = getApiKey();
  const messages = buildPrompt(mood, budget, currency, cravings);

  let lastError: unknown = null;
  const attempts: string[] = [];

  for (const model of CANDIDATE_MODELS) {
    try {
      const res = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://vibe-chef.local",
          "X-Title": "Vibe Chef on a Budget",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.8,
          response_format: { type: "json_object" },
        }),
      });

      if (!res.ok) {
        lastError = new Error(`OpenRouter ${model} responded ${res.status}`);
        attempts.push(`${model}: HTTP ${res.status}`);
        continue;
      }

      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content) {
        lastError = new Error(`OpenRouter ${model} returned no content`);
        attempts.push(`${model}: no content`);
        continue;
      }

      const meals = tryParseMeals(content, currency);
      if (meals) return meals;
      lastError = new Error(`OpenRouter ${model} returned unparsable JSON`);
      attempts.push(`${model}: unparsable JSON`);
    } catch (err) {
      lastError = err;
      attempts.push(`${model}: ${err instanceof Error ? err.message : "unknown error"}`);
    }
  }

  console.error("All OpenRouter models failed:", attempts.join(" | "), lastError);
  return fallbackMeals(mood, budget, currency);
}

// Local fallback so the app still demos something sensible if the AI
// provider is unreachable (free-tier rate limits, network hiccup, etc).
function fallbackMeals(mood: Mood, budget: number, currency: string): Meal[] {
  const base: Record<Mood, Meal[]> = {
    happy: [
      { name: "Street Tacos", emoji: "🌮", cuisine: "Mexican", description: "Three al pastor tacos with pineapple salsa.", estimatedCost: Math.min(budget, 9), currency, matchReason: "Fun, colorful, and shareable \u2014 matches a happy mood." },
    ],
    stressed: [
      { name: "Creamy Mac & Cheese", emoji: "🧀", cuisine: "Comfort food", description: "Stovetop mac and cheese with crispy breadcrumbs.", estimatedCost: Math.min(budget, 8), currency, matchReason: "Warm, soft, and nostalgic \u2014 great stress-relief food." },
    ],
    sad: [
      { name: "Chicken Noodle Soup", emoji: "🍜", cuisine: "Comfort food", description: "Classic homemade chicken noodle soup.", estimatedCost: Math.min(budget, 7), currency, matchReason: "Soothing and gentle for a low mood." },
    ],
    tired: [
      { name: "One-Pan Fried Rice", emoji: "🍚", cuisine: "Chinese", description: "Quick egg fried rice with whatever veggies you have.", estimatedCost: Math.min(budget, 6), currency, matchReason: "Minimal effort, maximum comfort when you're exhausted." },
    ],
    adventurous: [
      { name: "Korean Corn Dogs", emoji: "🌽", cuisine: "Korean", description: "Mozzarella-stuffed corn dogs with a sugar-savory crust.", estimatedCost: Math.min(budget, 10), currency, matchReason: "Novel and a little wild \u2014 perfect for an adventurous streak." },
    ],
    romantic: [
      { name: "Garlic Butter Pasta for Two", emoji: "🍝", cuisine: "Italian", description: "Simple linguine in garlic butter with parmesan.", estimatedCost: Math.min(budget, 14), currency, matchReason: "Easy to share and feels a little fancy." },
    ],
    celebratory: [
      { name: "Loaded Nachos Platter", emoji: "🎉", cuisine: "Tex-Mex", description: "A big shareable platter for celebrating.", estimatedCost: Math.min(budget, 16), currency, matchReason: "Big, festive, and built for sharing good news." },
    ],
    lazy: [
      { name: "Instant Ramen Upgrade", emoji: "🍲", cuisine: "Japanese", description: "Instant ramen with a soft egg and scallions.", estimatedCost: Math.min(budget, 4), currency, matchReason: "Almost zero effort, still satisfying." },
    ],
    anxious: [
      { name: "Plain Buttered Toast + Tea", emoji: "🍞", cuisine: "Comfort food", description: "Simple, familiar, and easy on the stomach.", estimatedCost: Math.min(budget, 3), currency, matchReason: "Low-stimulation food for an anxious moment." },
    ],
    homesick: [
      { name: "Grandma's Style Stew", emoji: "🍲", cuisine: "Home-style", description: "A slow-simmered, familiar stew.", estimatedCost: Math.min(budget, 11), currency, matchReason: "Tastes like home when you need it most." },
    ],
  };
  return base[mood] ?? base.happy;
}
