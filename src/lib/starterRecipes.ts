import type { Recipe } from '../Components/typeFile';
import { recipeInfo } from '../Components/typeFile';
import type { Language } from '../i18n/core';

// Starter recipes. Quantities are written for 5 servings and only use ingredients of the starter stock (see defaultList).
// The texts exist in every language; the structure (ingredients, times) is shared.
type Text = { name: string; steps: string };

type ClassicRecipe = {
    ingredient: Recipe["ingredient"];
    prepTime: number;
    cookTime: number;
    text: Record<Language, Text>;
};

const CLASSICS: ClassicRecipe[] = [
    {
        ingredient: [{ ingredientId: "1", quantity: 750 }, { ingredientId: "13", quantity: 300 }, { ingredientId: "31", quantity: 400 }, { ingredientId: "38", quantity: 60 }, { ingredientId: "44", quantity: 10 }, { ingredientId: "27", quantity: 20 }],
        prepTime: 15, cookTime: 25,
        text: {
            fr: { name: "Poulet, riz et brocoli", steps: "Cuisez le riz (300 g). Faites dorer le poulet coupé en dés dans l'huile avec l'ail, ajoutez le brocoli et la sauce soja, couvrez 8 minutes. Servez sur le riz." },
            en: { name: "Chicken, rice and broccoli", steps: "Cook the rice (300 g). Brown the diced chicken in the oil with the garlic, add the broccoli and the soy sauce, cover for 8 minutes. Serve over the rice." },
            es: { name: "Pollo, arroz y brócoli", steps: "Cuece el arroz (300 g). Dora el pollo en dados con el aceite y el ajo, añade el brócoli y la salsa de soja y tapa 8 minutos. Sirve sobre el arroz." },
        },
    },
    {
        ingredient: [{ ingredientId: "15", quantity: 800 }, { ingredientId: "4", quantity: 300 }, { ingredientId: "51", quantity: 400 }, { ingredientId: "11", quantity: 150 }, { ingredientId: "44", quantity: 10 }, { ingredientId: "27", quantity: 15 }, { ingredientId: "58", quantity: 50 }],
        prepTime: 10, cookTime: 20,
        text: {
            fr: { name: "Pâtes tomate et thon", steps: "Faites revenir l'oignon et l'ail dans l'huile, ajoutez la sauce tomate et laissez mijoter 10 minutes. Ajoutez le thon émietté, mélangez aux pâtes cuites et finissez avec le parmesan." },
            en: { name: "Tuna and tomato pasta", steps: "Soften the onion and garlic in the oil, add the tomato sauce and simmer for 10 minutes. Add the flaked tuna, toss with the cooked pasta and finish with the parmesan." },
            es: { name: "Pasta con tomate y atún", steps: "Sofríe la cebolla y el ajo en el aceite, añade la salsa de tomate y cocina a fuego lento 10 minutos. Agrega el atún desmenuzado, mezcla con la pasta cocida y termina con el parmesano." },
        },
    },
    {
        ingredient: [{ ingredientId: "6", quantity: 8 }, { ingredientId: "14", quantity: 700 }, { ingredientId: "11", quantity: 200 }, { ingredientId: "27", quantity: 60 }],
        prepTime: 15, cookTime: 30,
        text: {
            fr: { name: "Tortilla espagnole", steps: "Faites cuire les pommes de terre en lamelles et l'oignon dans l'huile jusqu'à ce qu'ils soient tendres. Mélangez-les aux œufs battus, versez dans la poêle et cuisez 5 minutes de chaque côté." },
            en: { name: "Spanish tortilla", steps: "Slowly cook the sliced potatoes and the onion in the oil until tender. Mix them with the beaten eggs, pour into the pan and cook for 5 minutes on each side." },
            es: { name: "Tortilla española", steps: "Cocina las patatas en láminas y la cebolla en el aceite a fuego lento hasta que estén tiernas. Mézclalas con los huevos batidos, vierte en la sartén y cuaja 5 minutos por cada lado." },
        },
    },
    {
        ingredient: [{ ingredientId: "53", quantity: 800 }, { ingredientId: "47", quantity: 700 }, { ingredientId: "10", quantity: 250 }, { ingredientId: "27", quantity: 20 }, { ingredientId: "67", quantity: 10 }, { ingredientId: "44", quantity: 10 }],
        prepTime: 15, cookTime: 35,
        text: {
            fr: { name: "Dinde et patate douce au four", steps: "Coupez la dinde, la patate douce et les poivrons en morceaux. Mélangez avec l'huile, le paprika et l'ail, étalez sur une plaque et enfournez 35 minutes à 200 °C." },
            en: { name: "Oven-baked turkey and sweet potato", steps: "Cut the turkey, sweet potato and peppers into pieces. Toss with the oil, paprika and garlic, spread on a tray and bake for 35 minutes at 200 °C (390 °F)." },
            es: { name: "Pavo y boniato al horno", steps: "Corta el pavo, el boniato y los pimientos en trozos. Mézclalos con el aceite, el pimentón y el ajo, extiéndelos en una bandeja y hornea 35 minutos a 200 °C." },
        },
    },
    {
        ingredient: [{ ingredientId: "3", quantity: 700 }, { ingredientId: "13", quantity: 300 }, { ingredientId: "50", quantity: 400 }, { ingredientId: "57", quantity: 30 }, { ingredientId: "27", quantity: 15 }],
        prepTime: 10, cookTime: 25,
        text: {
            fr: { name: "Saumon, riz et haricots verts", steps: "Cuisez le riz (300 g) et les haricots verts. Faites cuire le saumon 4 minutes de chaque côté à la poêle avec l'huile, puis arrosez de jus de citron." },
            en: { name: "Salmon, rice and green beans", steps: "Cook the rice (300 g) and the green beans. Pan-fry the salmon with the oil for 4 minutes on each side, then drizzle with the lemon juice." },
            es: { name: "Salmón, arroz y judías verdes", steps: "Cuece el arroz (300 g) y las judías verdes. Haz el salmón a la plancha con el aceite 4 minutos por cada lado y rocíalo con el zumo de limón." },
        },
    },
    {
        ingredient: [{ ingredientId: "66", quantity: 500 }, { ingredientId: "41", quantity: 500 }, { ingredientId: "13", quantity: 280 }, { ingredientId: "38", quantity: 60 }, { ingredientId: "40", quantity: 10 }, { ingredientId: "43", quantity: 15 }, { ingredientId: "65", quantity: 10 }],
        prepTime: 15, cookTime: 15,
        text: {
            fr: { name: "Wok de tofu et légumes", steps: "Faites dorer le tofu en cubes dans l'huile de sésame avec le gingembre, ajoutez le mélange de légumes et la sauce soja, saisissez 6 minutes. Servez sur le riz et parsemez de graines de sésame." },
            en: { name: "Tofu and vegetable stir-fry", steps: "Brown the cubed tofu in the sesame oil with the ginger, add the vegetable mix and the soy sauce, and stir-fry for 6 minutes. Serve over the rice and sprinkle with the sesame seeds." },
            es: { name: "Salteado de tofu y verduras", steps: "Dora el tofu en cubos con el aceite de sésamo y el jengibre, añade las verduras y la salsa de soja y saltea 6 minutos. Sirve sobre el arroz y espolvorea con las semillas de sésamo." },
        },
    },
    {
        ingredient: [{ ingredientId: "2", quantity: 800 }, { ingredientId: "59", quantity: 250 }, { ingredientId: "8", quantity: 300 }, { ingredientId: "49", quantity: 150 }, { ingredientId: "9", quantity: 150 }, { ingredientId: "16", quantity: 200 }, { ingredientId: "27", quantity: 20 }],
        prepTime: 20, cookTime: 20,
        text: {
            fr: { name: "Bowls grecs au poulet", steps: "Faites griller les hauts de cuisse dans l'huile 20 minutes. Dressez dans des bols avec la laitue, les tomates cerise, la feta émiettée, le tzatziki et le pain grillé." },
            en: { name: "Greek chicken bowls", steps: "Grill the chicken thighs in the oil for 20 minutes. Build the bowls with the lettuce, cherry tomatoes, crumbled feta, tzatziki and toasted bread." },
            es: { name: "Bowls griegos de pollo", steps: "Asa los muslos de pollo con el aceite durante 20 minutos. Monta los bols con la lechuga, los tomates cherry, la feta desmenuzada, el tzatziki y el pan tostado." },
        },
    },
    {
        ingredient: [{ ingredientId: "7", quantity: 700 }, { ingredientId: "15", quantity: 800 }, { ingredientId: "51", quantity: 500 }, { ingredientId: "11", quantity: 150 }, { ingredientId: "21", quantity: 150 }, { ingredientId: "44", quantity: 10 }, { ingredientId: "58", quantity: 40 }],
        prepTime: 15, cookTime: 40,
        text: {
            fr: { name: "Pâtes à la bolognaise", steps: "Faites revenir l'oignon, la carotte et l'ail hachés, ajoutez le bœuf et faites-le dorer. Versez la sauce tomate et laissez mijoter 30 minutes. Servez sur les pâtes avec le parmesan." },
            en: { name: "Spaghetti bolognese", steps: "Soften the chopped onion, carrot and garlic, add the beef and brown it. Pour in the tomato sauce and simmer for 30 minutes. Serve over the pasta with the parmesan." },
            es: { name: "Pasta a la boloñesa", steps: "Sofríe la cebolla, la zanahoria y el ajo picados, añade la ternera y dórala. Agrega la salsa de tomate y cocina a fuego lento 30 minutos. Sirve sobre la pasta con el parmesano." },
        },
    },
    {
        ingredient: [{ ingredientId: "24", quantity: 600 }, { ingredientId: "14", quantity: 600 }, { ingredientId: "21", quantity: 200 }, { ingredientId: "61", quantity: 1000 }, { ingredientId: "28", quantity: 100 }, { ingredientId: "29", quantity: 20 }],
        prepTime: 15, cookTime: 30,
        text: {
            fr: { name: "Soupe poireaux pommes de terre", steps: "Faites suer les poireaux dans le beurre, ajoutez les pommes de terre, les carottes et le bouillon, et cuisez 25 minutes. Mixez et ajoutez la crème fraîche." },
            en: { name: "Leek and potato soup", steps: "Sweat the leeks in the butter, add the potatoes, carrots and stock, and cook for 25 minutes. Blend and stir in the crème fraîche." },
            es: { name: "Sopa de puerro y patata", steps: "Rehoga los puerros en la mantequilla, añade las patatas, las zanahorias y el caldo y cocina 25 minutos. Tritura y agrega la nata." },
        },
    },
    {
        ingredient: [{ ingredientId: "30", quantity: 750 }, { ingredientId: "64", quantity: 120 }, { ingredientId: "13", quantity: 300 }, { ingredientId: "31", quantity: 300 }, { ingredientId: "33", quantity: 40 }, { ingredientId: "65", quantity: 10 }],
        prepTime: 15, cookTime: 25,
        text: {
            fr: { name: "Porc teriyaki et riz", steps: "Faites dorer le porc en lamelles, ajoutez la sauce teriyaki et le brocoli et laissez caraméliser 8 minutes. Servez sur le riz avec la ciboule et les graines de sésame." },
            en: { name: "Teriyaki pork with rice", steps: "Brown the sliced pork, add the teriyaki sauce and the broccoli and let it caramelise for 8 minutes. Serve over the rice with the scallion and sesame seeds." },
            es: { name: "Cerdo teriyaki con arroz", steps: "Dora el cerdo en tiras, añade la salsa teriyaki y el brócoli y deja caramelizar 8 minutos. Sirve sobre el arroz con la cebolleta y las semillas de sésamo." },
        },
    },
];

const classics = (language: Language): Recipe[] => CLASSICS.map(recipe => ({
    recipeName: recipe.text[language].name,
    ingredient: recipe.ingredient.map(ingredient => ({ ...ingredient })),
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    instructions: recipe.text[language].steps,
    image: "",
    status: "normal",
}));

// To add a pack: add a line here (and its texts above)
export const STARTER_PACKS: { code: Language; label: string }[] = [
    { code: "fr", label: "Français" },
    { code: "en", label: "English" },
    { code: "es", label: "Español" },
];

export const starterRecipes = (language: Language): Recipe[] =>
    language === "fr" ? [...recipeInfo, ...classics("fr")] : classics(language);

// Adds the recipes of a pack that are not in the list yet (same name = skipped). Returns the new list and how many were added.
export const mergeStarterPack = (current: Recipe[], language: Language): { recipes: Recipe[]; added: number } => {
    const names = new Set(current.map(recipe => recipe.recipeName.trim().toLowerCase()));
    const fresh = starterRecipes(language).filter(recipe => !names.has(recipe.recipeName.trim().toLowerCase()));
    return { recipes: [...current, ...fresh], added: fresh.length };
};
