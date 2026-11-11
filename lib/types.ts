export type Mood =
  | "happy"
  | "stressed"
  | "sad"
  | "tired"
  | "adventurous"
  | "romantic"
  | "celebratory"
  | "lazy"
  | "anxious"
  | "homesick";

export interface MoodOption {
  id: Mood;
  label: string;
  emoji: string;
}

export const MOOD_OPTIONS: MoodOption[] = [
  { id: "happy", label: "Happy", emoji: "😄" },
  { id: "stressed", label: "Stressed", emoji: "😩" },
  { id: "sad", label: "Sad", emoji: "😢" },
  { id: "tired", label: "Tired", emoji: "🥱" },
  { id: "adventurous", label: "Adventurous", emoji: "🤠" },
  { id: "romantic", label: "Romantic", emoji: "😍" },
  { id: "celebratory", label: "Celebratory", emoji: "🎉" },
  { id: "lazy", label: "Lazy", emoji: "🛋️" },
  { id: "anxious", label: "Anxious", emoji: "😰" },
  { id: "homesick", label: "Homesick", emoji: "🏠" },
];

export interface Meal {
  name: string;
  emoji: string;
  cuisine: string;
  description: string;
  estimatedCost: number;
  currency: string;
  matchReason: string;
}

export interface RecommendRequestBody {
  mood: Mood;
  budget: number;
  currency?: string;
  cravings?: string;
}

export interface RecommendResponseBody {
  id: string | null;
  meals: Meal[];
}

export interface FavoriteRecord {
  id: string;
  mood: Mood;
  meal_name: string;
  description: string;
  estimated_cost: number;
  currency: string;
  match_reason: string;
  created_at: string;
}
