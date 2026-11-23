import type { Ingredient } from '../Components/typeFile';

export type FoodProduct = {
    name: string;
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
    unit: Ingredient["unit"];
    category: Ingredient["category"];
};

type OffResponse = {
    status?: number;
    product?: {
        product_name?: string;
        product_quantity_unit?: string;
        quantity?: string;
        categories_tags?: string[];
        nutriments?: Record<string, number | string | undefined>;
    };
};

const FIELDS = "product_name,nutriments,quantity,product_quantity_unit,categories_tags";
const TIMEOUT_MS = 8000;

const CATEGORY_HINTS: { category: Ingredient["category"]; words: string[] }[] = [
    { category: "Boisson", words: ["beverage", "drink", "water", "juice", "soda"] },
    { category: "Protéine", words: ["meat", "fish", "seafood", "poultry", "egg", "tofu", "sausage", "ham", "cheese", "dairy", "yogurt", "legume"] },
    { category: "Légumes", words: ["vegetable", "fruit", "salad", "tomato"] },
    { category: "Féculent", words: ["cereal", "pasta", "rice", "bread", "potato", "flour", "noodle", "grain"] },
];

export const isValidBarcode = (code: string): boolean => /^\d{8,14}$/.test(code);

const toNumber = (value: unknown): number => {
    const parsed = typeof value === "number" ? value : Number(String(value ?? "").replace(",", "."));
    return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed * 10) / 10 : 0;
};

const guessCategory = (tags: string[]): Ingredient["category"] => {
    const joined = tags.join(" ").toLowerCase();
    const hit = CATEGORY_HINTS.find(hint => hint.words.some(word => joined.includes(word)));
    return hit ? hit.category : "Autre";
};

const guessUnit = (category: Ingredient["category"], quantityUnit: string, quantity: string): Ingredient["unit"] => {
    const text = `${quantityUnit} ${quantity}`.toLowerCase();
    if (category === "Boisson" || /\b\d+([.,]\d+)?\s*(ml|cl|l)\b/.test(text)) return "mL";
    return "g";
};

export const lookupBarcode = async (code: string): Promise<FoodProduct | null> => {
    if (!isValidBarcode(code)) return null;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
        const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}?fields=${FIELDS}`, { signal: controller.signal });
        if (!response.ok) return null;
        const data: OffResponse = await response.json();
        const product = data.product;
        if (data.status !== 1 || !product?.product_name) return null;
        const n = product.nutriments ?? {};
        const category = guessCategory(product.categories_tags ?? []);
        return {
            name: product.product_name.trim(),
            calories: toNumber(n["energy-kcal_100g"]),
            carbs: toNumber(n["carbohydrates_100g"]),
            protein: toNumber(n["proteins_100g"]),
            fat: toNumber(n["fat_100g"]),
            unit: guessUnit(category, product.product_quantity_unit ?? "", product.quantity ?? ""),
            category,
        };
    } finally {
        clearTimeout(timer);
    }
};
