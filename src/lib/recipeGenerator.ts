import type { Recipe, Ingredient } from '../Components/typeFile';

// Critères du générateur de recettes de la page d'accueil
export type FavoritesMode = "any" | "prefer" | "only";   // peu importe / favoris d'abord / favoris uniquement

export type GeneratorOptions = {
    count: number;           // nombre de recettes à proposer
    favorites: FavoritesMode;
};

export const MIN_RECIPES = 1;
export const MAX_RECIPES = 4;
export const GENERATOR_KEY = "generatorOptions";

export const DEFAULT_GENERATOR_OPTIONS: GeneratorOptions = {
    count: 2,
    favorites: "prefer",
};

// Relit les options sauvegardées en vérifiant chaque champ (un vieux JSON ou une valeur bizarre ne doit pas casser la page)
export const sanitizeOptions = (raw: unknown): GeneratorOptions => {
    const d = DEFAULT_GENERATOR_OPTIONS;
    const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;

    const count = Number(o.count);
    return {
        count: Number.isInteger(count) ? Math.min(MAX_RECIPES, Math.max(MIN_RECIPES, count)) : d.count,
        favorites: o.favorites === "any" || o.favorites === "prefer" || o.favorites === "only" ? o.favorites : d.favorites,
    };
};

export const loadGeneratorOptions = (): GeneratorOptions => {
    try {
        const saved = localStorage.getItem(GENERATOR_KEY);
        return sanitizeOptions(saved ? JSON.parse(saved) : null);
    } catch {
        return DEFAULT_GENERATOR_OPTIONS;
    }
};

export const saveGeneratorOptions = (options: GeneratorOptions) => {
    try { localStorage.setItem(GENERATOR_KEY, JSON.stringify(options)); } catch { /* stockage indisponible : on garde juste les options en mémoire */ }
};

// Recettes qui respectent le critère strict ("favoris uniquement")
export const filterCandidates = (recipes: Recipe[], options: GeneratorOptions): Recipe[] =>
    options.favorites === "only" ? recipes.filter(recipe => recipe.status === "favorite") : recipes;

// Mélange (Fisher-Yates)
const shuffle = <T,>(items: T[], random: () => number): T[] => {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
};

// Les recettes triées de la meilleure à la moins bonne : favoris (si "favoris d'abord"), variété (rien cuisiné ces 3 dernières semaines) et stock disponible
export const rankRecipes = (
    candidates: Recipe[],
    options: GeneratorOptions,
    stock: Ingredient[],
    history: Recipe[][],
    random: () => number = Math.random,
): Recipe[] => {
    const recentNames = new Set(history.slice(-3).flat().map(r => r.recipeName));

    const scores = new Map<Recipe, number>();

    for (const recipe of candidates) {
        let score = 1;

        if (options.favorites === "prefer" && recipe.status === "favorite") score += 2;

        score += recentNames.has(recipe.recipeName) ? -2 : 1;

        for (const ing of recipe.ingredient) {
            const stockItem = stock.find(ele => String(ele.id) === String(ing.ingredientId));
            const needed = ing.quantity ? ing.quantity : 0;

            if (stockItem && stockItem.quantity >= needed) {
                if (stockItem.category === "Protéine") score += 1;
                else if (stockItem.category === "Féculent" || stockItem.category === "Légumes") score += 0.5;
            }
        }

        scores.set(recipe, score);
    }

    // Mélange avant le tri : à score égal, l'ordre change d'une génération à l'autre
    return shuffle(candidates, random).sort((a, b) => (scores.get(b) ?? 0) - (scores.get(a) ?? 0));
};

// Choisit `count` recettes au hasard parmi les mieux classées (on pioche dans le haut du classement, pas toujours les premières)
export const pickRecipes = (
    recipes: Recipe[],
    options: GeneratorOptions,
    stock: Ingredient[],
    history: Recipe[][],
    random: () => number = Math.random,
): Recipe[] => {
    const candidates = filterCandidates(recipes, options);
    if (candidates.length === 0) return [];

    const ranked = rankRecipes(candidates, options, stock, history, random);
    const pool = ranked.slice(0, Math.max(6, options.count * 3));
    return shuffle(pool, random).slice(0, options.count);
};

// Une autre recette pour remplacer celle à l'écran : on respecte "favoris uniquement" et on évite celles déjà affichées
export const pickReplacement = (
    recipes: Recipe[],
    options: GeneratorOptions,
    shown: Recipe[],
    random: () => number = Math.random,
): Recipe | null => {
    const notShown = (list: Recipe[]) => list.filter(recipe => !shown.includes(recipe));
    let pool = notShown(filterCandidates(recipes, options));
    if (pool.length === 0) pool = notShown(recipes);   // plus rien qui respecte le critère : on prend n'importe quelle autre
    return pool.length === 0 ? null : pool[Math.floor(random() * pool.length)];
};
