export type RecipeIngredient = {
  ingredientId: string;
  quantity: number;
};

export type Recipe = {
    recipeName: string;
    ingredient: RecipeIngredient[];
    prepTime: number; // en minutes
    cookTime: number; // en minutes
    instructions: string;
    image: string;
    status: 'favorite' | 'normal';
    macro?: string;
    portions?: number; // servings cooked that week: only set on recipes stored in the meal history
};

export type Ingredient = {
    id: string;
    name: string;
    macro: {
      calories : number;
      protein : number;
      fat : number;
      carbs : number;
    };
    price: number;
    quantity: number;
    unit: "g" | "mL" | "unités" | "";
    category: 'Protéine' | 'Légumes' | 'Féculent' | 'Boisson' | 'Autre' | "";
    image: string;
    // false = ingrédient non suivi dans le stock (épices, sel...) : jamais dans la liste de courses ni déduit.
    // Absent = suivi (les ingrédients déjà enregistrés dans ton localStorage n'ont pas ce champ).
    trackStock?: boolean;
}

export const recipeInfo: Recipe[] = [
  {
    recipeName: "Bœuf Bourguignon",
    ingredient: [
      { ingredientId: "7", quantity: 1000 },
      { ingredientId: "21", quantity: 180 },
      { ingredientId: "11", quantity: 160 },
      { ingredientId: "26", quantity: 250 },
      { ingredientId: "61", quantity: 250 },
      { ingredientId: "44", quantity: 10 },
      { ingredientId: "55", quantity: 10 }
    ],
    prepTime: 20,
    cookTime: 180,
    instructions:
      "Faites revenir le bœuf dans l'huile, ajoutez 2 oignons (160g), 3 carottes (180g), et 2 gousses d'ail (10g). Saupoudrez de farine, versez le vin, le bouillon et laissez mijoter 2h30.",
    image: "",
    status: "normal"
  },
  {
    recipeName: "Poulet Basquaise",
    ingredient: [
      { ingredientId: "1", quantity: 850 },
      { ingredientId: "10", quantity: 240 },
      { ingredientId: "22", quantity: 240 },
      { ingredientId: "13", quantity: 250 },
      { ingredientId: "11", quantity: 160 },
      { ingredientId: "44", quantity: 10 },
      { ingredientId: "61", quantity: 200 },
      { ingredientId: "27", quantity: 15 }
    ],
    prepTime: 15,
    cookTime: 90,
    instructions:
      "Faites revenir le poulet dans l'huile. Ajoutez 2 oignons (160g), 2 poivrons (240g), et 2 gousses d'ail (10g). Versez le bouillon et laissez mijoter 1h. Servez avec les pâtes cuites (250g).",
    image: "",
    status: "normal"
  }
];

export const defaultList: Ingredient[] = [
  // --- Protéines ---
  { id: "1", name: "Blanc de poulet", macro: { calories: 165, carbs: 0, protein: 31, fat: 3.6 }, price: 10, quantity: 0, unit: "g", category: "Protéine", image: "" },
  { id: "2", name: "Haut de cuisse de poulet", macro: { calories: 209, carbs: 0, protein: 26, fat: 11 }, price: 9, quantity: 0, unit: "g", category: "Protéine", image: "" },
  { id: "3", name: "Saumon", macro: { calories: 208, carbs: 0, protein: 20, fat: 13 }, price: 15, quantity: 0, unit: "g", category: "Protéine", image: "" },
  { id: "4", name: "Thon", macro: { calories: 132, carbs: 0, protein: 28, fat: 1 }, price: 12, quantity: 0, unit: "g", category: "Protéine", image: "" },
  { id: "5", name: "Maquereau", macro: { calories: 205, carbs: 0, protein: 19, fat: 13.9 }, price: 14, quantity: 0, unit: "g", category: "Protéine", image: "" },
  { id: "6", name: "Oeuf", macro: { calories: 70, carbs: 0.5, protein: 6, fat: 5 }, price: 0.25, quantity: 5, unit: "unités", category: "Protéine", image: "" },
  { id: "7", name: "Boeuf", macro: { calories: 250, carbs: 0, protein: 26, fat: 17 }, price: 18, quantity: 0, unit: "g", category: "Protéine", image: "" },
  { id: "25", name: "Veau", macro: { calories: 172, carbs: 0, protein: 24, fat: 7 }, price: 16, quantity: 0, unit: "g", category: "Protéine", image: "" },
  { id: "30", name: "Porc", macro: { calories: 242, carbs: 0, protein: 27, fat: 14 }, price: 13, quantity: 0, unit: "g", category: "Protéine", image: "" },
  { id: "53", name: "Dinde", macro: { calories: 135, carbs: 0, protein: 30, fat: 1.5 }, price: 11, quantity: 0, unit: "g", category: "Protéine", image: "" }, // **NOUVEAU**

  // --- Légumes ---
  { id: "8", name: "Tomates cerise", macro: { calories: 18, carbs: 3.9, protein: 0.9, fat: 0.2 }, price: 3, quantity: 0, unit: "g", category: "Légumes", image: "" },
  { id: "9", name: "Laitue", macro: { calories: 15, carbs: 2.9, protein: 1.4, fat: 0.2 }, price: 2, quantity: 0, unit: "g", category: "Légumes", image: "" },
  { id: "10", name: "Poivron", macro: { calories: 31, carbs: 6, protein: 1, fat: 0.3 }, price: 2, quantity: 0, unit: "g", category: "Légumes", image: "" },
  { id: "11", name: "Oignon", macro: { calories: 40, carbs: 9, protein: 1.1, fat: 0.1 }, price: 1.5, quantity: 0, unit: "g", category: "Légumes", image: "" },
  { id: "12", name: "Choux de Bruxelles", macro: { calories: 43, carbs: 9, protein: 3.4, fat: 0.3 }, price: 4, quantity: 0, unit: "g", category: "Légumes", image: "" },
  { id: "21", name: "Carotte", macro: { calories: 41, carbs: 10, protein: 0.9, fat: 0.2 }, price: 2, quantity: 0, unit: "g", category: "Légumes", image: "" },
  { id: "22", name: "Tomate", macro: { calories: 18, carbs: 3.9, protein: 0.9, fat: 0.2 }, price: 2, quantity: 0, unit: "g", category: "Légumes", image: "" },
  { id: "23", name: "Champignon", macro: { calories: 22, carbs: 3.3, protein: 3.1, fat: 0.3 }, price: 3, quantity: 0, unit: "g", category: "Légumes", image: "" },
  { id: "24", name: "Poireau", macro: { calories: 61, carbs: 14, protein: 1.5, fat: 0.3 }, price: 2.5, quantity: 0, unit: "g", category: "Légumes", image: "" },
  { id: "31", name: "Brocoli", macro: { calories: 34, carbs: 7, protein: 3, fat: 0.4 }, price: 3, quantity: 0, unit: "g", category: "Légumes", image: "" },
  { id: "33", name: "Ciboule", macro: { calories: 32, carbs: 7.3, protein: 1.8, fat: 0.2 }, price: 4, quantity: 0, unit: "g", category: "Légumes", image: "" },
  { id: "41", name: "Poêlé Wok", macro: { calories: 95, carbs: 7, protein: 2, fat: 0.5 }, price: 4, quantity: 0, unit: "g", category: "Légumes", image: "" },
  { id: "44", name: "Ail", macro: { calories: 149, carbs: 33, protein: 6.4, fat: 0.5 }, price: 3, quantity: 0, unit: "g", category: "Légumes", image: "" },
  { id: "45", name: "Chou", macro: { calories: 25, carbs: 5, protein: 1.3, fat: 0.1 }, price: 2, quantity: 0, unit: "g", category: "Légumes", image: "" },
  { id: "43", name: "Gingembre", macro: { calories: 80, carbs: 18, protein: 1.8, fat: 0.8 }, price: 5, quantity: 0, unit: "g", category: "Légumes", image: "" },
  { id: "54", name: "Coriandre", macro: { calories: 23, carbs: 3.7, protein: 2.1, fat: 0.5 }, price: 3, quantity: 0, unit: "g", category: "Légumes", image: "" }, // **NOUVEAU**

  // --- Féculents ---
  { id: "13", name: "Riz", macro: { calories: 352, carbs: 70, protein: 8, fat: 3 }, price: 2, quantity: 0, unit: "g", category: "Féculent", image: "" },
  { id: "14", name: "Pommes de terre", macro: { calories: 77, carbs: 17, protein: 2, fat: 0.1 }, price: 3, quantity: 0, unit: "g", category: "Féculent", image: "" },
  { id: "15", name: "Pâtes", macro: { calories: 131, carbs: 25, protein: 5, fat: 1.1 }, price: 1.5, quantity: 0, unit: "g", category: "Féculent", image: "" },
  { id: "16", name: "Pain", macro: { calories: 265, carbs: 49, protein: 9, fat: 3.2 }, price: 2, quantity: 0, unit: "g", category: "Féculent", image: "" },
  { id: "47", name: "Patate douce", macro: { calories: 86, carbs: 20, protein: 1.6, fat: 0.1 }, price: 2.5, quantity: 0, unit: "g", category: "Féculent", image: "" },

  // --- Boissons ---
  { id: "17", name: "SodaStream Pespi", macro: { calories: 0, carbs: 0, protein: 0, fat: 0 }, price: 5, quantity: 0, unit: "mL", category: "Boisson", image: "" },
  { id: "18", name: "SodaStream Orange", macro: { calories: 0, carbs: 0, protein: 0, fat: 0 }, price: 5, quantity: 0, unit: "mL", category: "Boisson", image: "" },
  { id: "19", name: "SodaStream Coca Cerise", macro: { calories: 0, carbs: 0, protein: 0, fat: 0 }, price: 5, quantity: 0, unit: "mL", category: "Boisson", image: "" },
  { id: "20", name: "SodaStream Limonade", macro: { calories: 0, carbs: 0, protein: 0, fat: 0 }, price: 5, quantity: 0, unit: "mL", category: "Boisson", image: "" },
  { id: "26", name: "Vin rouge", macro: { calories: 85, carbs: 2.6, protein: 0.1, fat: 0 }, price: 10, quantity: 0, unit: "mL", category: "Boisson", image: "" },

  // --- Autres  ---
  { id: "27", name: "Huile d'olive", macro: { calories: 884, carbs: 0, protein: 0, fat: 100 }, price: 6, quantity: 0, unit: "mL", category: "Autre", image: "" },
  { id: "28", name: "Crème fraîche", macro: { calories: 292, carbs: 2.9, protein: 2.4, fat: 30 }, price: 4, quantity: 0, unit: "g", category: "Autre", image: "" },
  { id: "29", name: "Beurre", macro: { calories: 717, carbs: 0.1, protein: 0.9, fat: 81 }, price: 5, quantity: 0, unit: "g", category: "Autre", image: "" },
  { id: "35", name: "Miel", macro: { calories: 304, carbs: 82, protein: 0.3, fat: 0 }, price: 8, quantity: 0, unit: "g", category: "Autre", image: "" },
  { id: "36", name: "Sauce Sriracha", macro: { calories: 93, carbs: 20, protein: 1, fat: 0.9 }, price: 6, quantity: 0, unit: "g", category: "Autre", image: "" },
  { id: "37", name: "Beurre de cacahuète", macro: { calories: 588, carbs: 20, protein: 25, fat: 50 }, price: 9, quantity: 0, unit: "g", category: "Autre", image: "" },
  { id: "38", name: "Sauce soja", macro: { calories: 53, carbs: 5, protein: 8, fat: 0 }, price: 4, quantity: 0, unit: "mL", category: "Autre", image: "" },
  { id: "39", name: "Vinaigre de riz", macro: { calories: 18, carbs: 0, protein: 0, fat: 0 }, price: 3, quantity: 0, unit: "mL", category: "Autre", image: "" },
  { id: "40", name: "Huile de sésame", macro: { calories: 884, carbs: 0, protein: 0, fat: 100 }, price: 7, quantity: 0, unit: "mL", category: "Autre", image: "" },
  { id: "42", name: "Purée de piment", macro: { calories: 109, carbs: 22, protein: 2, fat: 0.5 }, price: 7, quantity: 0, unit: "g", category: "Autre", image: "" },
  { id: "49", name: "Feta", macro: { calories: 264, carbs: 4, protein: 14, fat: 21 }, price: 4, quantity: 0, unit: "g", category: "Autre", image: "" },
  { id: "46", name: "Yaourt grec", macro: { calories: 59, carbs: 3.6, protein: 10, fat: 0.4 }, price: 3, quantity: 0, unit: "g", category: "Autre", image: "" },
  { id: "34", name: "Citron vert", macro: { calories: 30, carbs: 11, protein: 0.7, fat: 0.2 }, price: 4, quantity: 0, unit: "g", category: "Autre", image: "" },
  { id: "48", name: "Graines de courge", macro: { calories: 446, carbs: 16, protein: 19, fat: 19 }, price: 5, quantity: 0, unit: "g", category: "Autre", image: "" },
  { id: "50", name: "Haricots verts", macro: { calories: 31, carbs: 7, protein: 2, fat: 0.2 }, price: 3, quantity: 0, unit: "g", category: "Légumes", image: "" },
  { id: "51", name: "Sauce tomate", macro: { calories: 29, carbs: 5, protein: 1, fat: 0.2 }, price: 3, quantity: 0, unit: "g", category: "Légumes", image: "" },
  { id: "52", name: "Pois", macro: { calories: 81, carbs: 14, protein: 5, fat: 0.4 }, price: 3, quantity: 0, unit: "g", category: "Légumes", image: "" },
  { id: "55", name: "Farine", macro: { calories: 364, carbs: 76, protein: 10, fat: 1 }, price: 1, quantity: 0, unit: "g", category: "Autre", image: "" }, 
  { id: "56", name: "Moutarde", macro: { calories: 66, carbs: 6.7, protein: 4.5, fat: 3.6 }, price: 3, quantity: 0, unit: "g", category: "Autre", image: "" }, 
  { id: "57", name: "Jus de Citron", macro: { calories: 29, carbs: 9.3, protein: 0.4, fat: 0.1 }, price: 2, quantity: 0, unit: "mL", category: "Autre", image: "" }, 
  { id: "58", name: "Parmesan", macro: { calories: 431, carbs: 4.1, protein: 38, fat: 29 }, price: 8, quantity: 0, unit: "g", category: "Autre", image: "" }, 
  { id: "59", name: "Tzatziki", macro: { calories: 97, carbs: 5.6, protein: 5.5, fat: 6 }, price: 5, quantity: 0, unit: "g", category: "Autre", image: "" }, 
  { id: "60", name: "Sel et Poivre", macro: { calories: 0, carbs: 0, protein: 0, fat: 0 }, price: 0, quantity: 0, unit: "", category: "Autre", image: "" }, 
  { id: "61", name: "Bouillon (Cube/Liquide)", macro: { calories: 5, carbs: 0.5, protein: 0.5, fat: 0 }, price: 1.5, quantity: 0, unit: "mL", category: "Autre", image: "" }, 
  // --- Ajoutés pour les recettes importées ---
  { id: "62", name: "Agneau", macro: { calories: 294, carbs: 0, protein: 25, fat: 21 }, price: 20, quantity: 0, unit: "g", category: "Protéine", image: "" },
  { id: "63", name: "Navet", macro: { calories: 28, carbs: 6.4, protein: 0.9, fat: 0.1 }, price: 2, quantity: 0, unit: "g", category: "Légumes", image: "" },
  { id: "64", name: "Sauce teriyaki", macro: { calories: 89, carbs: 16, protein: 5.9, fat: 0 }, price: 5, quantity: 0, unit: "mL", category: "Autre", image: "" },
  { id: "65", name: "Graines de sésame", macro: { calories: 573, carbs: 23, protein: 18, fat: 50 }, price: 12, quantity: 0, unit: "g", category: "Autre", image: "" },
  { id: "66", name: "Tofu", macro: { calories: 144, carbs: 2.8, protein: 17, fat: 8.7 }, price: 7, quantity: 0, unit: "g", category: "Protéine", image: "" },
  { id: "67", name: "Paprika", macro: { calories: 282, carbs: 54, protein: 14, fat: 13 }, price: 15, quantity: 0, unit: "g", category: "Autre", image: "" },
];