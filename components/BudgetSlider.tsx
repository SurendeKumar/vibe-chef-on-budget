"use client";

interface Props {
  value: number;
  currency: string;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export default function BudgetSlider({
  value,
  currency,
  onChange,
  min = 2,
  max = 50,
}: Props) {
  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between mb-2">
        <label className="text-sm font-medium text-neutral-600">
          Budget per meal
        </label>
        <span className="text-xl font-semibold text-vibe-600">
          {currency} {value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-orange-500"
      />
      <div className="flex justify-between text-xs text-neutral-400 mt-1">
        <span>
          {currency} {min}
        </span>
        <span>
          {currency} {max}
        </span>
      </div>
    </div>
  );
}
