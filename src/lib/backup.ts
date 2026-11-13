import type { Recipe, Ingredient } from '../Components/typeFile';
import { defaultList } from '../Components/typeFile';
import { normalizeRecipe, loadRecipes, loadMealHistory } from './recipeUtils';
import { translate } from '../i18n/core';

// Sauvegarde complète de l'appli : un seul fichier JSON lisible, avec les recettes, le stock et l'historique.
// Le fichier contient "app" et "version" : l'import vérifie que c'est bien un fichier de Meal Prep Board.

export const BACKUP_APP = "meal-prep-board";
export const BACKUP_VERSION = 1;

export type BackupData = {
    recipes: Recipe[];
    stock: Ingredient[];
    history: Recipe[][];
};

export type Backup = {
    app: typeof BACKUP_APP;
    version: number;
    exportedAt: string;
    data: BackupData;
};

export type ParseResult =
    | { ok: true; data: BackupData }
    | { ok: false; error: string };

export type MergeReport = { recipes: number; ingredients: number; weeks: number };

export const buildBackup = (data: BackupData, now: Date = new Date()): Backup => ({
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    data,
});

export const backupFileName = (now: Date = new Date()): string => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `meal-prep-board-sauvegarde-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.json`;
};

const isObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

const isRecipeLike = (value: unknown): value is Record<string, unknown> =>
    isObject(value) && typeof value.recipeName === "string" && Array.isArray(value.ingredient);

const isIngredientLike = (value: unknown): value is Ingredient => {
    if (!isObject(value)) return false;
    const macro = value.macro;
    return (typeof value.id === "string" || typeof value.id === "number")
        && typeof value.name === "string"
        && isObject(macro)
        && ["calories", "carbs", "protein", "fat"].every(key => typeof macro[key] === "number")
        && typeof value.price === "number"
        && typeof value.quantity === "number";
};

// Lit le texte d'un fichier de sauvegarde. Ne modifie rien : renvoie soit les données valides, soit un message d'erreur.
export const parseBackup = (text: string): ParseResult => {
    let parsed: unknown;
    try {
        parsed = JSON.parse(text);
    } catch {
        return { ok: false, error: translate("backup.errJson") };
    }

    if (!isObject(parsed) || parsed.app !== BACKUP_APP || !isObject(parsed.data)) {
        return { ok: false, error: translate("backup.errNotBackup") };
    }
    if (typeof parsed.version !== "number" || parsed.version > BACKUP_VERSION) {
        return { ok: false, error: translate("backup.errNewer") };
    }

    const { recipes = [], stock = [], history = [] } = parsed.data;

    if (!Array.isArray(recipes) || !recipes.every(isRecipeLike)) {
        return { ok: false, error: translate("backup.errRecipes") };
    }
    if (!Array.isArray(stock) || !stock.every(isIngredientLike)) {
        return { ok: false, error: translate("backup.errStock") };
    }
    if (!Array.isArray(history) || !history.every(week => Array.isArray(week) && week.every(isRecipeLike))) {
        return { ok: false, error: translate("backup.errHistory") };
    }

    return {
        ok: true,
        data: {
            recipes: recipes.map(normalizeRecipe),
            stock: stock.map(ingredient => ({ ...ingredient, id: String(ingredient.id) })),
            history: history.map(week => week.map(normalizeRecipe)),
        },
    };
};

// Fusion : on AJOUTE ce qui manque (recette de même nom, ingrédient de même numéro, semaine identique), sans rien écraser.
export const mergeBackup = (current: BackupData, incoming: BackupData): { data: BackupData; added: MergeReport } => {
    const recipeNames = new Set(current.recipes.map(recipe => recipe.recipeName));
    const newRecipes = incoming.recipes.filter(recipe => !recipeNames.has(recipe.recipeName));

    const ingredientIds = new Set(current.stock.map(ingredient => String(ingredient.id)));
    const newIngredients = incoming.stock.filter(ingredient => !ingredientIds.has(String(ingredient.id)));

    const knownWeeks = new Set(current.history.map(week => JSON.stringify(week)));
    const newWeeks = incoming.history.filter(week => !knownWeeks.has(JSON.stringify(week)));

    return {
        data: {
            recipes: [...current.recipes, ...newRecipes],
            stock: [...current.stock, ...newIngredients],
            history: [...current.history, ...newWeeks],
        },
        added: { recipes: newRecipes.length, ingredients: newIngredients.length, weeks: newWeeks.length },
    };
};

// ---- Lecture / écriture dans le navigateur (localStorage) ----

export const readCurrentData = (): BackupData => {
    const savedStock = localStorage.getItem("currentStockList");
    return {
        recipes: loadRecipes(),
        stock: savedStock ? JSON.parse(savedStock) : defaultList,
        history: loadMealHistory(),
    };
};

export const writeData = (data: BackupData): void => {
    localStorage.setItem("globalRecipeList", JSON.stringify(data.recipes));
    localStorage.setItem("currentStockList", JSON.stringify(data.stock));
    localStorage.setItem("mealHistoryList", JSON.stringify(data.history));
};
