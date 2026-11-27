export type Goal = "any" | "protein" | "light" | "bulk";

export const GOALS: Goal[] = ["any", "protein", "light", "bulk"];

type PerPortion = { calories: number; protein: number };

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

export const isGoal = (value: unknown): value is Goal =>
    typeof value === "string" && (GOALS as string[]).includes(value);

export const goalScore = (macros: PerPortion, goal: Goal): number => {
    if (goal === "any" || macros.calories <= 0) return 0;
    const proteinShare = (macros.protein * 4) / macros.calories;
    if (goal === "protein") return clamp(proteinShare / 0.35, 0, 1) * 6;
    if (goal === "light") return clamp((800 - macros.calories) / 400, 0, 1) * 6;
    return clamp((macros.calories - 500) / 400, 0, 1) * 4 + clamp(macros.protein / 40, 0, 1) * 2;
};
