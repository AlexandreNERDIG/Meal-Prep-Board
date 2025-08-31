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