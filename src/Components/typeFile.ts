export type Recipe = {
    RecipeName: string;
    Ingredient: string[];
    Macro: string;
    PrepTime: string;
    CookTime: string;
    Instructions: string;
    image: string;
    Status: 'favorite' | 'normal';
};

export type Ingredient = {
    id: string;
    Name: string;
    Macro: string;
    Price: number;
    Quantity: number;
    Unit: string;
    Category: 'Protéine' | 'Légumes' | 'Féculent' | 'Boisson' | 'Autre' | "";
    Image: string;
}

export const RecipeInfo = [
    {
        RecipeName: "Bœuf Bourguignon",
        Ingredient: [
            "1000g Boeuf",
            "180g Carotte",
            "160g Oignon",
            "250mL Vin Rouge",
            "250mL Bouillon de Bœuf",
            "10g Ail",
            "10g Farine",
            "Sel et Poivre"
        ],
        Macro: "450 Calories | 15 g C | 38 g P | 22 g F",
        PrepTime: "20 min",
        CookTime: "3h",
        Instructions: "Faites revenir le bœuf dans l'huile, ajoutez 2 oignons (160g), 3 carottes (180g), et 2 gousses d'ail (10g). Saupoudrez de farine, versez le vin, le bouillon et laissez mijoter 2h30.",
        image: "../img/boeuf-bourgignon.jpg",
        Status: "normal"
    },
    {
        RecipeName: "Poulet Basquaise",
        Ingredient: [
            "750g Cuisse de Poulet",
            "240g Poivron",
            "240g Tomate",
            "160g Oignon",
            "10g Ail",
            "200mL Bouillon de Volaille",
            "5g Paprika",
            "15mL Huile d'Olive",
            "Sel et Poivre"
        ],
        Macro: "400 Calories | 12 g C | 35 g P | 22 g F",
        PrepTime: "15 min",
        CookTime: "1h30",
        Instructions: "Faites revenir le poulet dans l'huile. Ajoutez 2 oignons (160g), 2 poivrons (240g), et 2 gousses d'ail (10g). Versez le bouillon et laissez mijoter 1h.",
        image: "../img/poulet-basquaise.jpg",
        Status: "normal"
    },
    {
        RecipeName: "Bœuf Stroganoff",
        Ingredient: [
            "1000g Boeuf",
            "250g Champignon",
            "160g Oignon",
            "10g Ail",
            "150mL Crème Fraîche",
            "15g Moutarde",
            "10g Farine",
            "15mL Huile d'Olive",
            "Sel et Poivre"
        ],
        Macro: "460 Calories | 18 g C | 35 g P | 25 g F",
        PrepTime: "20 min",
        CookTime: "1h30",
        Instructions: "Faites revenir le bœuf, 2 oignons (160g) et 2 gousses d'ail (10g) dans l'huile. Ajoutez les champignons (250g). Mélangez la crème et la moutarde, incorporez et laissez mijoter 1h.",
        image: "../img/Honey-Garlic-Chicken-Noodle-Bowls-WP-807x1024.jpg",
        Status: "normal"
    },
    {
        RecipeName: "Tajine d'Agneau",
        Ingredient: [
            "1000g Épaule d'Agneau",
            "120g Carotte",
            "160g Oignon",
            "160g Navet",
            "250g Pommes de Terre",
            "200g Petit Pois",
            "500mL Bouillon de Légumes",
            "10g Ail",
            "5g Cumin",
            "Sel et Poivre"
        ],
        Macro: "520 Calories | 25 g C | 42 g P | 28 g F",
        PrepTime: "15 min",
        CookTime: "2h",
        Instructions: "Faites revenir l'agneau, puis ajoutez 2 oignons (160g), 2 gousses d'ail (10g), 2 carottes (120g) et 2 navets (160g). Versez le bouillon et laissez mijoter 1h30. Ajoutez les pommes de terre (250g) et les petits pois (200g) 30 minutes avant la fin.",
        image: "../img/High-Volume-Korean-Beef-Bowls-807x1024.jpg",
        Status: "normal"
    },
    {
        RecipeName: "Daube Provençale",
        Ingredient: [
            "1000g Boeuf",
            "250mL Vin Rouge",
            "120g Carotte",
            "160g Oignon",
            "10g Ail",
            "240g Tomate",
            "10g Farine",
            "15mL Huile d'Olive",
            "Sel et Poivre"
        ],
        Macro: "450 Calories | 15 g C | 38 g P | 20 g F",
        PrepTime: "15 min",
        CookTime: "2h30",
        Instructions: "Faites dorer la viande, ajoutez 2 oignons (160g), 2 gousses d'ail (10g) et 2 carottes (120g). Versez le vin (250mL) et les tomates (240g), laissez mijoter 2h30.",
        image: "../img/Chicken-Fajita-Fried-Rice-807x1024.jpg",
        Status: "normal"
    },
    {
        RecipeName: "Rôti à la Moutarde",
        Ingredient: [
            "1000g Rôti de Porc",
            "45g Moutarde de Dijon",
            "160g Oignon",
            "10g Ail",
            "250mL Bouillon de Volaille",
            "15mL Huile d'Olive",
            "5g Thym",
            "Sel et Poivre"
        ],
        Macro: "420 Calories | 10 g C | 35 g P | 25 g F",
        PrepTime: "15 min",
        CookTime: "2h",
        Instructions: "Badigeonnez le rôti avec la moutarde (45g). Faites-le revenir avec 2 oignons (160g) et 2 gousses d'ail (10g). Ajoutez le bouillon et laissez mijoter 2h.",
        image: "../img/Poblano-Chicken-Harvest-Bowls-807x1024.jpg",
        Status: "normal"
    },
    {
        RecipeName: "Blanquette de Veau",
        Ingredient: [
            "1000g Veau",
            "180g Carotte",
            "180g Poireau",
            "160g Oignon",
            "250g Champignon",
            "150mL Crème Fraîche",
            "50mL Jus de Citron",
            "75g Beurre",
            "10g Farine",
            "Sel et Poivre"
        ],
        Macro: "480 Calories | 18 g C | 42 g P | 22 g F",
        PrepTime: "20 min",
        CookTime: "2h",
        Instructions: "Faites revenir la viande avec 2 oignons (160g) et le beurre (75g). Ajoutez 3 carottes (180g), 2 poireaux (180g). Couvrez d’eau et laissez mijoter 2h. À la fin, incorporez la crème (150mL), le jus de citron (50mL) et la farine (10g).",
        image: "../img/Tikka-Masala-Meatballs-807x1024.png",
        Status: "normal"
    },
    {
        RecipeName: "Bœuf aux Carottes",
        Ingredient: [
            "1000g Boeuf",
            "300g Carotte",
            "160g Oignon",
            "10g Ail",
            "300mL Bouillon de Bœuf",
            "10g Farine",
            "15mL Huile d'Olive",
            "Sel et Poivre"
        ],
        Macro: "350 Calories | 12 g C | 35 g P | 15 g F",
        PrepTime: "15 min",
        CookTime: "1h30",
        Instructions: "Faites revenir le bœuf avec 2 oignons (160g) et 2 gousses d'ail (10g). Ajoutez 5 carottes (300g) en rondelles. Saupoudrez de farine, puis ajoutez le bouillon. Laissez mijoter 1h30.",
        image: "../img/thai-red-curry-34c1e6d.jpg",
        Status: "normal"
    },
    {
        RecipeName: "Poulet Paprika / Patate",
        Ingredient: [
            "750g Cuisse de Poulet",
            "300g Pommes de Terre",
            "160g Oignon",
            "10g Ail",
            "250mL Bouillon de Volaille",
            "10g Paprika",
            "15mL Huile d'Olive",
            "5g Thym",
            "Sel et Poivre"
        ],
        Macro: "400 Calories | 20 g C | 35 g P | 20 g F",
        PrepTime: "15 min",
        CookTime: "1h30",
        Instructions: "Faites revenir les cuisses de poulet avec 2 oignons (160g), 2 gousses d'ail (10g), et le paprika (10g). Ajoutez les pommes de terre (300g) et le bouillon. Laissez mijoter jusqu'à cuisson complète.",
        image: "../img/Teriyaki-Ground-Beef-Bowls-WP-864x1024.jpg",
        Status: "normal"
    },
    {
        RecipeName: "Sriracha Lime Chicken Bowls",
        Ingredient: [
            "900g Haut de cuisse de poulet",
            "450g Brocoli",
            "300g Patate douce",
            "150g Ciboule",
            "300g Riz",
            "30mL Huile d'olive",
            "45g Sauce Sriracha",
            "45g Citron vert",
            "37g Miel",
            "Sel et Poivre"
        ],
        Macro: "498 Calories | 52 g C | 41 g P | 14 g F",
        PrepTime: "20 min",
        CookTime: "40 min",
        Instructions: "Cuire le riz. Mélanger la sauce avec sriracha, citron et miel, puis mariner le poulet avant cuisson au four. Rôtir la patate douce et faire revenir le brocoli avec la ciboule, puis combiner tous les ingrédients et servir chaud.",
        image: "../img/Sriracha-Lime-Chicken-Bowls-807x1024.jpg",
        Status: "normal"
    },  
    {   
        RecipeName: "Peanut Turkey Stir Fry",
        Ingredient: [
            "900g Dinde",
            "680g Poêlé Wok",
            "150g Riz",
            "15mL Huile d'olive",
            "45mL Sauce soja",
            "84g Miel",
            "56g Beurre de cacahuète",
            "30mL Vinaigre de riz",
            "10mL Huile de sésame",
            "Sel et Poivre"
        ],
        Macro: "632 Calories | 57 g C | 42 g P | 26 g F",
        PrepTime: "5 min",
        CookTime: "25 min",
        Instructions: "Cuire le riz. Faire revenir la dinde et les légumes dans l’huile d’olive. Ajouter la sauce au beurre de cacahuète et mélanger jusqu’à épaississement, puis servir chaud.",
        image: "../img/Peanut-Turkey-Stir-Fry.jpg",
        Status: "normal"
    },  
    {   
        RecipeName: "Spicy Glazed Beef & Vegetables",
        Ingredient: [
            "900g Boeuf",
            "60g Poivron",
            "160g Oignon",
            "250g Chou",
            "200g Carotte",
            "15mL Huile d'olive",
            "45mL Sauce soja",
            "45g Purée de piment",
            "15g Miel",
            "10g Ail",
            "10g Gingembre",
            "150g Riz",
            "Sel et Poivre"
        ],
        Macro: "572 Calories | 52 g C | 42 g P | 22 g F",
        PrepTime: "20 min",
        CookTime: "30 min",
        Instructions: "Cuire le riz. Faire revenir le boeuf et les légumes, puis ajouter la sauce épicée et laisser épaissir. Servir le tout chaud avec le riz.",
        image: "../img/High-Volume-Korean-Beef-Bowls-807x1024.jpg",
        Status: "normal"
    },  
    {   
        RecipeName: "Poblano Chicken Harvest Bowls",
        Ingredient: [
            "900g Blanc de poulet",
            "150g Riz",
            "15g Jus de citron",
            "200g Poivron",
            "100g Oignon",
            "15g Ail",
            "15mL Huile d'olive",
            "110g Yaourt grec",
            "600g Patate douce",
            "230g Brocoli",
            "23mL Huile d'olive",
            "6g Ail en poudre",
            "6g Origan séché",
            "50g Graines de courge",
            "50g Feta",
            "Sel et Poivre"
        ],
        Macro: "655 Calories | 58 g C | 48 g P | 26 g F",
        PrepTime: "30 min",
        CookTime: "35 min",
        Instructions: "Cuire le riz et préparer la sauce poblano en mixant les poivrons, oignon et ail avec le yaourt. Rôtir les légumes et faire revenir le poulet assaisonné. Assembler le tout avec les graines de courge et la feta avant de servir.",
        image: "../img/Poblano-Chicken-Harvest-Bowls-807x1024.jpg",
        Status: "normal"
    },  
    {   
        RecipeName: "Chicken Fajita Fried Rice",
        Ingredient: [
            "900g Blanc de poulet",
            "30mL Huile d'olive",
            "15g Jus de citron",
            "6g Ail en poudre",
            "1g Origan séché",
            "3g Coriandre",
            "3g Cumin",
            "3g Paprika",
            "6g Piment en poudre",
            "6g Sel",
            "2g Poivre",
            "450g Riz",
            "200g Oignon",
            "150g Poivron rouge",
            "150g Poivron vert",
            "15g Ail",
            "30g Jus de citron",
            "15mL Huile d'olive",
            "Sel et Poivre"
        ],
        Macro: "481 Calories | 41 g C | 40 g P | 18 g F",
        PrepTime: "20 min",
        CookTime: "30 min",
        Instructions: "Préparer le riz. Mariner le poulet avec les épices, puis le cuire par portions. Faire revenir les légumes, ajouter le riz et le poulet, mélanger et assaisonner avant de servir.",
        image: "../img/Chicken-Fajita-Fried-Rice-807x1024.jpg",
        Status: "normal"
    }
];

export const defaultList: Ingredient[] = [
    // --- Protéines ---
    {
      id: "1",
      Name: "Blanc de poulet",
      Macro: "165 Calories | 0 g C | 31 g P | 3.6 g F",
      Price: 10, // prix/kg
      Quantity: 0,
      Unit: "g",
      Category: "Protéine",
      Image: "/img2/blanc-de-poulet.jpg"
    },
    {
      id: "2",
      Name: "Haut de cuisse de poulet",
      Macro: "209 Calories | 0 g C | 26 g P | 11 g F",
      Price: 9, // prix/kg
      Quantity: 0,
      Unit: "g",
      Category: "Protéine",
      Image: "/img2/haut-de-cuisse-de-poulet.jpg"
    },
    {
      id: "3",
      Name: "Saumon",
      Macro: "208 Calories | 0 g C | 20 g P | 13 g F",
      Price: 15,
      Quantity: 0,
      Unit: "g",
      Category: "Protéine",
      Image: "/img2/saumon.jpg"
    },
    {
      id: "4",
      Name: "Thon",
      Macro: "132 Calories | 0 g C | 28 g P | 1 g F",
      Price: 12,
      Quantity: 0,
      Unit: "g",
      Category: "Protéine",
      Image: "/img2/thon.jpeg"
    },
    {
      id: "5",
      Name: "Maquereau",
      Macro: "205 Calories | 0 g C | 19 g P | 13.9 g F",
      Price: 14,
      Quantity: 0,
      Unit: "g",
      Category: "Protéine",
      Image: "/img2/maquereau.jpeg"
    },
    {
      id: "6",
      Name: "Oeuf",
      Macro: "70 Calories | 0.5 g C | 6 g P | 5 g F",
      Price: 0.25,
      Quantity: 5,
      Unit: `unités`,
      Category: "Protéine",
      Image: "/img2/oeuf.jpg"
    },
    {
      id: "7",
      Name: "Boeuf",
      Macro: "250 Calories | 0 g C | 26 g P | 17 g F",
      Price: 18,
      Quantity: 0,
      Unit: "g",
      Category: "Protéine",
      Image: "/img2/boeuf.jpg"
    },
    {
      id: "25",
      Name: "Veau",
      Macro: "172 Calories | 0 g C | 24 g P | 7 g F",
      Price: 16,
      Quantity: 0,
      Unit: "g",
      Category: "Protéine",
      Image: "/img2/veau.jpg"
    },  
    {
      id: "30",
      Name: "Porc",
      Macro: "242 Calories | 0 g C | 27 g P | 14 g F",
      Price: 13,
      Quantity: 0,
      Unit: "g",
      Category: "Protéine",
      Image: "/img2/lomo-porc.jpeg"
    },

    // --- Légumes ---
    {
      id: "8",
      Name: "Tomates cerise",
      Macro: "18 Calories | 3.9 g C | 0.9 g P | 0.2 g F",
      Price: 3,
      Quantity: 0,
      Unit: "g",
      Category: "Légumes",
      Image: "/img2/tomate-cerise.jpg"
    },
    {
      id: "9",
      Name: "Laitue",
      Macro: "15 Calories | 2.9 g C | 1.4 g P | 0.2 g F",
      Price: 2,
      Quantity: 0,
      Unit: "g",
      Category: "Légumes",
      Image: "/img2/laitue.jpg"
    },
    {
      id: "10",
      Name: "Poivron",
      Macro: "31 Calories | 6 g C | 1 g P | 0.3 g F",
      Price: 2,
      Quantity: 0,
      Unit: "g",
      Category: "Légumes",
      Image: "/img2/poivron.jpg"
    },
    {
      id: "11",
      Name: "Oignon",
      Macro: "40 Calories | 9 g C | 1.1 g P | 0.1 g F",
      Price: 1.5,
      Quantity: 0,
      Unit: "g",
      Category: "Légumes",
      Image: "/img2/oignon.jpg"
    },
    {
      id: "12",
      Name: "Choux de Bruxelles",
      Macro: "43 Calories | 9 g C | 3.4 g P | 0.3 g F",
      Price: 4,
      Quantity: 0,
      Unit: "g",
      Category: "Légumes",
      Image: "/img2/chou-bruxelles.jpg"
    },
    {
      id: "21",
      Name: "Carotte",
      Macro: "41 Calories | 10 g C | 0.9 g P | 0.2 g F",
      Price: 2,
      Quantity: 0,
      Unit: "g",
      Category: "Légumes",
      Image: "/img2/carotte.jpg"
    },
    {
      id: "22",
      Name: "Tomate",
      Macro: "18 Calories | 3.9 g C | 0.9 g P | 0.2 g F",
      Price: 2,
      Quantity: 0,
      Unit: "g",
      Category: "Légumes",
      Image: "/img2/tomate.jpg"
    },
    {
      id: "23",
      Name: "Champignon",
      Macro: "22 Calories | 3.3 g C | 3.1 g P | 0.3 g F",
      Price: 3,
      Quantity: 0,
      Unit: "g",
      Category: "Légumes",
      Image: "/img2/champignon.jpg"
    },
    {
      id: "24",
      Name: "Poireau",
      Macro: "61 Calories | 14 g C | 1.5 g P | 0.3 g F",
      Price: 2.5,
      Quantity: 0,
      Unit: "g",
      Category: "Légumes",
      Image: "/img2/poireau.jpg"
    },
    {
        id: "31",
        Name: "Brocoli",
        Macro: "34 Calories | 7 g C | 3 g P | 0.4 g F",
        Price: 3,
        Quantity: 0,
        Unit: "g",
        Category: "Légumes",
        Image: "/img2/brocoli.jpg"
    },
    {
        id: "33",
        Name: "Ciboule",
        Macro: "32 Calories | 7.3 g C | 1.8 g P | 0.2 g F",
        Price: 4,
        Quantity: 0,
        Unit: "g",
        Category: "Légumes",
        Image: "/img2/ciboule.jpg"
    },
    {
        id: "34",
        Name: "Citron vert",
        Macro: "30 Calories | 11 g C | 0.7 g P | 0.2 g F",
        Price: 4,
        Quantity: 0,
        Unit: "g",
        Category: "Autre",
        Image: "/img2/citron-vert.jpg"
    },
    {
        id: "41",
        Name: "Poêlé Wok",
        Macro: "95 Calories | 7 g C | 2 g P | 0.5 g F",
        Price: 4,
        Quantity: 0,
        Unit: "g",
        Category: "Légumes",
        Image: "/img2/poele-wok.jpg"
    },

    {
        id: "44",
        Name: "Ail",
        Macro: "149 Calories | 33 g C | 6.4 g P | 0.5 g F",
        Price: 3,
        Quantity: 0,
        Unit: "g",
        Category: "Légumes",
        Image: "/img2/ail.jpg"
    },
    {
        id: "45",
        Name: "Chou",
        Macro: "25 Calories | 5 g C | 1.3 g P | 0.1 g F",
        Price: 2,
        Quantity: 0,
        Unit: "g",
        Category: "Légumes",
        Image: "/img2/chou.png"
    },
    {
        id: "43",
        Name: "Gingembre",
        Macro: "80 Calories | 18 g C | 1.8 g P | 0.8 g F",
        Price: 5,
        Quantity: 0,
        Unit: "g",
        Category: "Légumes",
        Image: "/img2/gingembre.jpg"
    },
    {
        id: "48",
        Name: "Graines de courge",
        Macro: "446 Calories | 16 g C | 19 g P | 19 g F",
        Price: 5,
        Quantity: 0,
        Unit: "g",
        Category: "Autre",
        Image: "/img2/graines-courge.jpg"
    },
    {
        id: "50",
        Name: "Haricots verts",
        Macro: "31 Calories | 7 g C | 2 g P | 0.2 g F",
        Price: 3,
        Quantity: 0,
        Unit: "g",
        Category: "Légumes",
        Image: "/img2/haricots-verts.jpg"
    },
    {
        id: "51",
        Name: "Sauce tomate",
        Macro: "29 Calories | 5 g C | 1 g P | 0.2 g F",
        Price: 3,
        Quantity: 0,
        Unit: "g",
        Category: "Légumes",
        Image: "/img2/sauce-tomate.jpg"
    },
    {
        id: "52",
        Name: "Pois",
        Macro: "81 Calories | 14 g C | 5 g P | 0.4 g F",
        Price: 3,
        Quantity: 0,
        Unit: "g",
        Category: "Légumes",
        Image: "/img2/pois.jpg"
    },

    // --- Féculents ---
    {
      id: "13",
      Name: "Riz",
      Macro: "130 Calories | 28 g C | 2.7 g P | 0.3 g F",
      Price: 2,
      Quantity: 0,
      Unit: "g",
      Category: "Féculent",
      Image: "/img2/riz.jpg"
    },
    {
      id: "14",
      Name: "Pommes de terre",
      Macro: "77 Calories | 17 g C | 2 g P | 0.1 g F",
      Price: 3,
      Quantity: 0,
      Unit: "g",
      Category: "Féculent",
      Image: "/img2/pomme-de-terre.jpg"
    },
    {
      id: "15",
      Name: "Pâtes",
      Macro: "131 Calories | 25 g C | 5 g P | 1.1 g F",
      Price: 1.5,
      Quantity: 0,
      Unit: "g",
      Category: "Féculent",
      Image: "/img2/pates.jpg"
    },
    {
      id: "16",
      Name: "Pain",
      Macro: "265 Calories | 49 g C | 9 g P | 3.2 g F",
      Price: 2,
      Quantity: 0,
      Unit: "g",
      Category: "Féculent",
      Image: "/img2/pain.jpg"
    },
    {
        id: "47",
        Name: "Patate douce",
        Macro: "86 Calories | 20 g C | 1.6 g P | 0.1 g F",
        Price: 2.5,
        Quantity: 0,
        Unit: "g",
        Category: "Féculent",
        Image: "/img2/patate-douce.jpg"
    },

    // --- Boissons (100 mL) ---
    {
      id: "17",
      Name: "SodaStream Pespi",
      Macro: "0 Calories | 0 g C | 0 g P | 0 g F",
      Price: 5,
      Quantity: 0,
      Unit: "mL",
      Category: "Boisson",
      Image: "/img2/soda-stream-pepsi.jpg"
    },
    {
      id: "18",
      Name: "SodaStream Orange",
      Macro: "0 Calories | 0 g C | 0 g P | 0 g F",
      Price: 5,
      Quantity: 0,
      Unit: "mL",
      Category: "Boisson",
      Image: "/img2/soda-stream-orange.jpg"
    },
    {
      id: "19",
      Name: "SodaStream Coca Cerise",
      Macro: "0 Calories | 0 g C | 0 g P | 0 g F",
      Price: 5,
      Quantity: 0,
      Unit: "mL",
      Category: "Boisson",
      Image: "/img2/soda-stream-cerise.jpg"
    },
    {
      id: "20",
      Name: "SodaStream Limonade",
      Macro: "0 Calories | 0 g C | 0 g P | 0 g F",
      Price: 5,
      Quantity: 0,
      Unit: "mL",
      Category: "Boisson",
      Image: "/img2/soda-stream-limonade.jpg"
    },
    {
      id: "26",
      Name: "Vin rouge",
      Macro: "85 Calories | 2.6 g C | 0.1 g P | 0 g F",
      Price: 10,
      Quantity: 0,
      Unit: "mL",
      Category: "Boisson",
      Image: "/img2/vin-rouge.jpg"
    },
    // --- Autre --- 
    {
      id: "27",
      Name: "Huile d'olive",
      Macro: "884 Calories | 0 g C | 0 g P | 100 g F",
      Price: 6,
      Quantity: 0,
      Unit: "mL",
      Category: "Autre",
      Image: "/img2/huile-olive.jpg"
    },
    {
      id: "28",
      Name: "Crème fraîche",
      Macro: "292 Calories | 2.9 g C | 2.4 g P | 30 g F",
      Price: 4,
      Quantity: 0,
      Unit: "g",
      Category: "Autre",
      Image: "/img2/creme-fraiche.jpg"
    },
    {
      id: "29",
      Name: "Beurre",
      Macro: "717 Calories | 0.1 g C | 0.9 g P | 81 g F",
      Price: 5,
      Quantity: 0,
      Unit: "g",
      Category: "Autre",
      Image: "/img2/beurre.jpg"
    },
    {
        id: "35",
        Name: "Miel",
        Macro: "304 Calories | 82 g C | 0.3 g P | 0 g F",
        Price: 8,
        Quantity: 0,
        Unit: "g",
        Category: "Autre",
        Image: "/img2/miel.jpg"
    },
    {
        id: "36",
        Name: "Sauce Sriracha",
        Macro: "93 Calories | 20 g C | 1 g P | 0.9 g F",
        Price: 6,
        Quantity: 0,
        Unit: "g",
        Category: "Autre",
        Image: "/img2/sriracha.jpg"
    },
    {
        id: "37",
        Name: "Beurre de cacahuète",
        Macro: "588 Calories | 20 g C | 25 g P | 50 g F",
        Price: 9,
        Quantity: 0,
        Unit: "g",
        Category: "Autre",
        Image: "/img2/beurre-cacahuete.jpg"
    },
    {
        id: "38",
        Name: "Sauce soja",
        Macro: "53 Calories | 5 g C | 8 g P | 0 g F",
        Price: 4,
        Quantity: 0,
        Unit: "mL",
        Category: "Autre",
        Image: "/img2/sauce-soja.jpg"
    },
    {
        id: "39",
        Name: "Vinaigre de riz",
        Macro: "18 Calories | 0 g C | 0 g P | 0 g F",
        Price: 3,
        Quantity: 0,
        Unit: "mL",
        Category: "Autre",
        Image: "/img2/vinaigre-riz.jpg"
    },
    {
        id: "40",
        Name: "Huile de sésame",
        Macro: "884 Calories | 0 g C | 0 g P | 100 g F",
        Price: 7,
        Quantity: 0,
        Unit: "mL",
        Category: "Autre",
        Image: "/img2/huile-sesame.jpg"
    },
    {
        id: "42",
        Name: "Purée de piment",
        Macro: "109 Calories | 22 g C | 2 g P | 0.5 g F",
        Price: 7,
        Quantity: 0,
        Unit: "g",
        Category: "Autre",
        Image: "/img2/puree-piment.jpg"
    },
    {
        id: "49",
        Name: "Feta",
        Macro: "264 Calories | 4 g C | 14 g P | 21 g F",
        Price: 4,
        Quantity: 0,
        Unit: "g",
        Category: "Autre",
        Image: "/img2/feta.jpg"
    },
    {
        id: "46",
        Name: "Yaourt grec",
        Macro: "59 Calories | 3.6 g C | 10 g P | 0.4 g F",
        Price: 3,
        Quantity: 0,
        Unit: "g",
        Category: "Autre",
        Image: "/img2/yaourt-grec.png"
    },
];