import type { Recipe, Ingredient } from '../Components/typeFile';

// Nombre de portions par défaut d'une recette (c'était écrit en dur dans 3 composants)
export const DEFAULT_PORTIONS = 5;

export type Macros = {
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
};

const macroRatio = (ingredient: Ingredient, quantity: number): number => {
    return (ingredient.unit === "g" || ingredient.unit === "mL") ? quantity / 100 : quantity;
};

const priceRatio = (ingredient: Ingredient, quantity: number): number => {
    return (ingredient.unit === "g" || ingredient.unit === "mL") ? quantity / 1000 : quantity;
};

export const findIngredient = (stock: Ingredient[], ingredientId: string): Ingredient | undefined => {
    return stock.find(ingredient => String(ingredient.id) === String(ingredientId));
};

// Macros TOTALES d'une liste d'ingrédients
export const sumMacros = (ingredients: Recipe["ingredient"], stock: Ingredient[]): Macros => {
    const total: Macros = { calories: 0, carbs: 0, protein: 0, fat: 0 };

    for (const ingre of ingredients) {
        const found = findIngredient(stock, ingre.ingredientId);
        if (!found) continue;

        const ratio = macroRatio(found, Number(ingre.quantity) || 0);
        total.calories += found.macro.calories * ratio;
        total.carbs += found.macro.carbs * ratio;
        total.protein += found.macro.protein * ratio;
        total.fat += found.macro.fat * ratio;
    }

    return total;
};

// Macros PAR PORTION, arrondies
export const calcRecipeMacros = (ingredients: Recipe["ingredient"], stock: Ingredient[], portions: number = DEFAULT_PORTIONS): Macros => {
    const total = sumMacros(ingredients, stock);
    const divider = portions > 0 ? portions : 1;

    return {
        calories: Math.round(total.calories / divider),
        carbs: Math.round(total.carbs / divider),
        protein: Math.round(total.protein / divider),
        fat: Math.round(total.fat / divider),
    };
};

// Même format d'affichage qu'avant : "450 Calories | 15 g C | 38 g P | 22 g F"
export const formatMacros = (macros: Macros): string => {
    return `${macros.calories} Calories | ${macros.carbs} g C | ${macros.protein} g P | ${macros.fat} g F`;
};

// Coût TOTAL de la recette en euros
export const calcRecipeCost = (ingredients: Recipe["ingredient"], stock: Ingredient[]): number => {
    let total = 0;

    for (const ingre of ingredients) {
        const found = findIngredient(stock, ingre.ingredientId);
        if (!found) continue;

        total += found.price * priceRatio(found, Number(ingre.quantity) || 0);
    }

    return total;
};

export const formatPrice = (amount: number): string => {
    return `${amount.toFixed(2).replace(".", ",")} €`;
};

// Un ingrédient est suivi dans le stock sauf si trackStock vaut false, ou s'il n'a pas d'unité (ex : "Sel et Poivre").
export const isStockTracked = (ingredient: Ingredient | undefined): boolean => {
    if (!ingredient) return false;
    return ingredient.trackStock !== false && ingredient.unit !== "";
};

// Texte du prix selon l'unité (pour les libellés des formulaires)
export const priceUnitLabel = (unit: Ingredient["unit"]): string => {
    if (unit === "g") return "€ / kg";
    if (unit === "mL") return "€ / L";
    return "€ / unité";
};
