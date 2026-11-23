import type { Ingredient, Recipe } from '../Components/typeFile';
import { DEFAULT_PORTIONS, isStockTracked, scaleQuantity } from './recipeUtils';

const WEEK_KEY = "currentWeek";
const CHECKED_KEY = "shoppingChecked";

export type ShoppingItem = {
    id: string;
    name: string;
    unit: Ingredient["unit"];
    category: Ingredient["category"];
    toBuy: number;
};

export const buildShoppingItems = (recipes: Recipe[], stock: Ingredient[]): ShoppingItem[] => {
    let saved: unknown = null;
    try { saved = JSON.parse(localStorage.getItem(WEEK_KEY) ?? "null"); } catch { return []; }
    if (!Array.isArray(saved)) return [];

    const needed = new Map<string, number>();
    for (const entry of saved) {
        const name = typeof entry === "string" ? entry : (entry as { name?: unknown })?.name;
        const portions = Number((entry as { portions?: unknown })?.portions);
        const factor = (Number.isFinite(portions) && portions > 0 ? portions : DEFAULT_PORTIONS) / DEFAULT_PORTIONS;
        const recipe = recipes.find(item => item.recipeName === name);
        if (!recipe) continue;
        for (const line of recipe.ingredient) {
            needed.set(line.ingredientId, (needed.get(line.ingredientId) ?? 0) + scaleQuantity(line.quantity, factor));
        }
    }

    const items: ShoppingItem[] = [];
    needed.forEach((quantity, id) => {
        const ingredient = stock.find(item => item.id === id);
        if (!ingredient || !isStockTracked(ingredient)) return;
        const toBuy = Math.round(Math.max(quantity - ingredient.quantity, 0) * 10) / 10;
        if (toBuy > 0) items.push({ id, name: ingredient.name, unit: ingredient.unit, category: ingredient.category, toBuy });
    });
    return items;
};

export const loadChecked = (): string[] => {
    try {
        const saved: unknown = JSON.parse(localStorage.getItem(CHECKED_KEY) ?? "[]");
        return Array.isArray(saved) ? saved.filter((id): id is string => typeof id === "string") : [];
    } catch { return []; }
};

export const saveChecked = (ids: string[]) => {
    try { localStorage.setItem(CHECKED_KEY, JSON.stringify(ids)); } catch { return; }
};
