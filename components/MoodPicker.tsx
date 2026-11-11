"use client";

import { MOOD_OPTIONS, type Mood } from "@/lib/types";

interface Props {
  value: Mood | null;
  onChange: (mood: Mood) => void;
}

export default function MoodPicker({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
      {MOOD_OPTIONS.map((opt) => {
        const selected = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={[
              "flex flex-col items-center gap-1 rounded-xl border px-3 py-3 text-sm transition",
              selected
                ? "border-vibe-500 bg-vibe-50 text-vibe-700 shadow-sm"
                : "border-neutral-200 bg-white hover:border-vibe-300 hover:bg-vibe-50/50",
            ].join(" ")}
          >
            <span className="text-2xl">{opt.emoji}</span>
            <span className="font-medium">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
