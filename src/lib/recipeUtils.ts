import type { Recipe, Ingredient } from '../Components/typeFile';
import { recipeInfo, defaultList } from '../Components/typeFile';

// Image de remplacement quand un ingrédient n'a pas d'image (SVG intégré : aucun service externe)
export const NO_IMAGE = "data:image/svg+xml;utf8," + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="250" viewBox="0 0 300 250"><rect width="300" height="250" fill="#2c2c2c"/><text x="150" y="132" fill="#ffffff" font-family="sans-serif" font-size="18" text-anchor="middle">Pas d'image</text></svg>`
);

// Catégories d'ingrédients (filtre de la page Stock, menu déroulant de New Meal, formulaire d'ajout)
export const INGREDIENT_CATEGORIES = ["Protéine", "Légumes", "Féculent", "Boisson", "Autre"] as const;

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

// Répartition des calories entre glucides (4 kcal/g), protéines (4 kcal/g) et lipides (9 kcal/g), en %
export const calorieSplit = (macros: Macros): { carbs: number; protein: number; fat: number } => {
    const carbs = macros.carbs * 4;
    const protein = macros.protein * 4;
    const fat = macros.fat * 9;
    const total = carbs + protein + fat;

    if (total <= 0) return { carbs: 0, protein: 0, fat: 0 };

    const carbsPercent = Math.round((carbs / total) * 100);
    const proteinPercent = Math.round((protein / total) * 100);
    return { carbs: carbsPercent, protein: proteinPercent, fat: 100 - carbsPercent - proteinPercent };
};

// ---- Durées : stockées en MINUTES (nombre), affichées en "20 min" / "1h30" ----

// Convertit une durée en minutes. Accepte un nombre, ou un ancien texte ("20 min", "1h30", "3h", "45").
export const toMinutes = (value: unknown): number => {
    if (typeof value === "number") return Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
    if (typeof value !== "string") return 0;

    const parsed = value.trim().match(/^(?:(\d+)\s*h)?\s*(?:(\d+)\s*(?:min|m)?)?$/i);
    if (!parsed) return 0;

    return Number(parsed[1] ?? 0) * 60 + Number(parsed[2] ?? 0);
};

export const formatDuration = (value: number | string): string => {
    const total = toMinutes(value);
    if (total === 0) return "—";

    const hours = Math.floor(total / 60);
    const minutes = total % 60;

    if (hours === 0) return `${minutes} min`;
    return minutes === 0 ? `${hours}h` : `${hours}h${String(minutes).padStart(2, "0")}`;
};

// Remet une recette (ancien JSON, localStorage, fichier importé) au format actuel :
// temps en minutes, et status uniquement "favorite" ou "normal".
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const normalizeRecipe = (raw: Record<string, any>): Recipe => ({
    ...raw,
    prepTime: toMinutes(raw.prepTime),
    cookTime: toMinutes(raw.cookTime),
    status: raw.status === "favorite" ? "favorite" : "normal",
} as Recipe);

export const loadRecipes = (): Recipe[] => {
    const saved = localStorage.getItem("globalRecipeList");
    return (saved ? JSON.parse(saved) : recipeInfo).map(normalizeRecipe);
};

export const loadMealHistory = (): Recipe[][] => {
    const saved = localStorage.getItem("mealHistoryList");
    const history: Recipe[][] = saved ? JSON.parse(saved) : [];
    return history.map(week => week.map(normalizeRecipe));
};

// ---- Tri des recettes (page Recipe List) ----

export type RecipeSortKey = "default" | "name" | "time" | "calories" | "protein" | "cost";
export type SortDirection = "asc" | "desc";

export const RECIPE_SORTS: { key: RecipeSortKey; label: string; asc: string; desc: string }[] = [
    { key: "name", label: "Nom", asc: "De A à Z", desc: "De Z à A" },
    { key: "time", label: "Temps", asc: "Du plus rapide au plus long", desc: "Du plus long au plus rapide" },
    { key: "calories", label: "Calories", asc: "Du moins au plus calorique", desc: "Du plus au moins calorique" },
    { key: "protein", label: "Protéines", asc: "Du moins au plus protéiné", desc: "Du plus au moins protéiné" },
    { key: "cost", label: "Prix", asc: "Du moins cher au plus cher", desc: "Du plus cher au moins cher" },
];

const sortValue = (recipe: Recipe, key: RecipeSortKey, stock: Ingredient[]): number | string => {
    switch (key) {
        case "name": return recipe.recipeName.toLowerCase();
        case "time": return toMinutes(recipe.prepTime) + toMinutes(recipe.cookTime);
        case "calories": return calcRecipeMacros(recipe.ingredient, stock).calories;
        case "protein": return calcRecipeMacros(recipe.ingredient, stock).protein;
        case "cost": return calcRecipeCost(recipe.ingredient, stock);
        default: return 0;
    }
};

// Renvoie une NOUVELLE liste triée. Tri stable : à valeur égale, l'ordre d'origine est conservé.
export const sortRecipes = (recipes: Recipe[], key: RecipeSortKey, direction: SortDirection, stock: Ingredient[]): Recipe[] => {
    if (key === "default") return [...recipes];

    const sign = direction === "asc" ? 1 : -1;
    return recipes
        .map((recipe, index) => ({ recipe, index, value: sortValue(recipe, key, stock) }))
        .sort((a, b) => {
            const diff = typeof a.value === "string"
                ? a.value.localeCompare(String(b.value), "fr")
                : a.value - Number(b.value);
            return diff !== 0 ? sign * diff : a.index - b.index;
        })
        .map(entry => entry.recipe);
};

// Recherche : le texte (sans accents ni majuscules) doit se trouver dans le nom de la recette ou d'un de ses ingrédients
const normalizeText = (text: string): string => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export const recipeMatchesSearch = (recipe: Recipe, search: string, stock: Ingredient[]): boolean => {
    const needle = normalizeText(search);
    if (!needle) return true;

    if (normalizeText(recipe.recipeName).includes(needle)) return true;
    return recipe.ingredient.some(ingre => {
        const found = findIngredient(stock, ingre.ingredientId);
        return found ? normalizeText(found.name).includes(needle) : false;
    });
};

// ---- Stock : ajout des nouveaux ingrédients par défaut ----
// Le stock est enregistré dans le navigateur : quand j'ajoute de nouveaux ingrédients à la liste par défaut
// (ex : Agneau, Tofu), ils n'apparaissent pas tout seuls. Cette fonction les ajoute UNE fois (par numéro de version)
// sans toucher à ce que l'utilisateur a déjà modifié. Pour une prochaine mise à jour : augmenter STOCK_DEFAULTS_VERSION.
const STOCK_DEFAULTS_VERSION = 2;

export const syncDefaultStock = (): void => {
    try {
        const saved = localStorage.getItem("currentStockList");
        if (!saved) return;
        if (Number(localStorage.getItem("stockDefaultsVersion") ?? 0) >= STOCK_DEFAULTS_VERSION) return;

        const stock: Ingredient[] = JSON.parse(saved);
        const known = new Set(stock.map(ingredient => String(ingredient.id)));
        const missing = defaultList.filter(ingredient => !known.has(String(ingredient.id)));

        // "Sel et Poivre" passe de 0,50 € à 0 € (seulement si l'utilisateur ne l'a pas changé lui-même)
        const updated = stock.map(ingredient =>
            (String(ingredient.id) === "60" && ingredient.price === 0.5) ? { ...ingredient, price: 0 } : ingredient
        );

        localStorage.setItem("currentStockList", JSON.stringify([...updated, ...missing]));
        localStorage.setItem("stockDefaultsVersion", String(STOCK_DEFAULTS_VERSION));
    } catch {
        // stock illisible : on ne touche à rien
    }
};
