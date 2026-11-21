import { defaultList } from '../Components/typeFile';
import type { Ingredient } from '../Components/typeFile';
import type { Language } from './core';

// Names of the starter ingredients in the other languages (French is the base name in defaultList).
// Brand names (SodaStream...) are kept as they are.
const NAMES: Record<string, { en: string; es: string }> = {
    "1": { en: "Chicken breast", es: "Pechuga de pollo" },
    "2": { en: "Chicken thigh", es: "Muslo de pollo" },
    "3": { en: "Salmon", es: "Salmón" },
    "4": { en: "Tuna", es: "Atún" },
    "5": { en: "Mackerel", es: "Caballa" },
    "6": { en: "Egg", es: "Huevo" },
    "7": { en: "Beef", es: "Ternera" },
    "8": { en: "Cherry tomatoes", es: "Tomates cherry" },
    "9": { en: "Lettuce", es: "Lechuga" },
    "10": { en: "Bell pepper", es: "Pimiento" },
    "11": { en: "Onion", es: "Cebolla" },
    "12": { en: "Brussels sprouts", es: "Coles de Bruselas" },
    "13": { en: "Rice", es: "Arroz" },
    "14": { en: "Potatoes", es: "Patatas" },
    "15": { en: "Pasta", es: "Pasta" },
    "16": { en: "Bread", es: "Pan" },
    "21": { en: "Carrot", es: "Zanahoria" },
    "22": { en: "Tomato", es: "Tomate" },
    "23": { en: "Mushroom", es: "Champiñón" },
    "24": { en: "Leek", es: "Puerro" },
    "25": { en: "Veal", es: "Ternera blanca" },
    "26": { en: "Red wine", es: "Vino tinto" },
    "27": { en: "Olive oil", es: "Aceite de oliva" },
    "28": { en: "Crème fraîche", es: "Nata agria" },
    "29": { en: "Butter", es: "Mantequilla" },
    "30": { en: "Pork", es: "Cerdo" },
    "31": { en: "Broccoli", es: "Brócoli" },
    "33": { en: "Scallion", es: "Cebolleta" },
    "34": { en: "Lime", es: "Lima" },
    "35": { en: "Honey", es: "Miel" },
    "36": { en: "Sriracha sauce", es: "Salsa sriracha" },
    "37": { en: "Peanut butter", es: "Crema de cacahuete" },
    "38": { en: "Soy sauce", es: "Salsa de soja" },
    "39": { en: "Rice vinegar", es: "Vinagre de arroz" },
    "40": { en: "Sesame oil", es: "Aceite de sésamo" },
    "41": { en: "Wok stir-fry mix", es: "Salteado para wok" },
    "42": { en: "Chili paste", es: "Pasta de chile" },
    "43": { en: "Ginger", es: "Jengibre" },
    "44": { en: "Garlic", es: "Ajo" },
    "45": { en: "Cabbage", es: "Col" },
    "46": { en: "Greek yogurt", es: "Yogur griego" },
    "47": { en: "Sweet potato", es: "Boniato" },
    "48": { en: "Pumpkin seeds", es: "Pipas de calabaza" },
    "49": { en: "Feta", es: "Feta" },
    "50": { en: "Green beans", es: "Judías verdes" },
    "51": { en: "Tomato sauce", es: "Salsa de tomate" },
    "52": { en: "Peas", es: "Guisantes" },
    "53": { en: "Turkey", es: "Pavo" },
    "54": { en: "Cilantro", es: "Cilantro" },
    "55": { en: "Flour", es: "Harina" },
    "56": { en: "Mustard", es: "Mostaza" },
    "57": { en: "Lemon juice", es: "Zumo de limón" },
    "58": { en: "Parmesan", es: "Parmesano" },
    "59": { en: "Tzatziki", es: "Tzatziki" },
    "60": { en: "Salt and pepper", es: "Sal y pimienta" },
    "61": { en: "Stock (cube/liquid)", es: "Caldo (pastilla/líquido)" },
    "62": { en: "Lamb", es: "Cordero" },
    "63": { en: "Turnip", es: "Nabo" },
    "64": { en: "Teriyaki sauce", es: "Salsa teriyaki" },
    "65": { en: "Sesame seeds", es: "Semillas de sésamo" },
    "66": { en: "Tofu", es: "Tofu" },
    "67": { en: "Paprika", es: "Pimentón" },
};

// The starter stock of a new account, with ingredient names in the account language.
// Ingredients created later by the person keep the name they typed, and changing the language afterwards does not rename anything.
export const starterStock = (language: Language): Ingredient[] => {
    if (language === "fr") return defaultList;
    const key = language as "en" | "es";
    return defaultList.map(ingredient => ({ ...ingredient, name: NAMES[ingredient.id]?.[key] ?? ingredient.name }));
};
