import { useState } from 'react';
import './HomePage.css';
import NavBar from './NavBar';

export const RecipeInfo = [
    {
        RecipeName : "Korean Beef and Veggies with Gochujang Glaze",
        Ingredient: [
            "Pour la Base",
            "",
            "900 g de bœuf haché (10% de matière grasse)",
            "1 poivron vert moyen (150 g)",
            "1 petit oignon jaune (125 g)",
            "227 g de chou (un chou entier ou en sachet pré-rapé)",
            "2 carottes moyennes (150 g)",
            "1 c. à soupe d'huile",
            "3 tiges d'oignons verts (facultatif)",
            "",
    
            "Pour la Sauce",
            "",
            "30 g de sauce soja (sans gluten si nécessaire)",
            "45 g de gochujang",
            "42 g de miel",
            "30 g d'eau",
            "15 g d'ail haché",
            "15 g de gingembre haché",
            "",
    
            "Pour le Riz",
            "563 g de riz cuit"
        ],
        Macro : "572 Calories | 52g C | 42g P | 22g F",
        image : "../img/High-Volume-Korean-Beef-Bowls-807x1024.jpg"
    },
    {
        RecipeName : "Chicken Fajita Fried Rice",
        Ingredient: [
            "Pour le Poulet",
            "",
            "900 g de cuisses de poulet désossées et sans peau",
            "30 g d'huile",
            "15 g de jus de citron vert",
            "6 g de poudre d'ail",
            "1 g d'origan",
            "3 g de coriandre",
            "3 g de cumin",
            "3 g de paprika",
            "6 g de poudre de chili",
            "6 g de sel",
            "2 g de poivre",
            "",

            "Pour les Légumes et le Riz",
            "",
            "450 g de riz cuit",
            "1 oignon moyen (200 g)",
            "1 poivron rouge moyen (150 g)",
            "1 poivron vert moyen ou poblano (150 g)",
            "15 g d'ail haché",
            "30 g de jus de citron vert",
            "Sel et poivre à votre goût",
            "15 g d'huile",
            "¼ tasse de coriandre (facultatif pour garnir)",
            "1 citron vert (facultatif pour garnir)"
        ],
        Macro : "481 Calories | 41g C | 40g P | 18g F",
        image : "../img/Chicken-Fajita-Fried-Rice-807x1024.jpg"
    },
    {
        RecipeName : "Red Chicken Curry",
        Ingredient: [
            "Pour la Casserole",
            "",
            "1 kg de poulet",
            "1 kg de brocoli",
            "1 sachet de curry rouge",
            "Assaisonnements",
            "400 mL de lait de coco",
            "400 g d'oignons blancs",
            "50 g d'échalote",
            "",

            "Pour le Riz",
            "",
            "300 g de riz non cuit",
            "Sel",
            "15 g de sauce de poisson"
        ],
        Macro : "750 Calories | 51g C | 55g P | 27g F",
        image : "../img/thai-red-curry-34c1e6d.jpg"
    },
    {
        RecipeName: "Lemon Garlic Turkey Bowls",
        Ingredient: [
            "Pour les Pommes de Terre",
            "",
            "700 g de pommes de terre russet (environ 3 moyennes)",
            "8 g d'huile",
            "Sel et poivre à votre goût",
            "",
            
            "Pour le Brocoli",
            "",
            "454 g de brocoli surgelé ou frais",
            "5 g d'huile",
            "Sel et poivre à votre goût",
            "",
            
            "Pour les Bols",
            "",
            "900 g de dinde hachée (ou poulet)",
            "15 g d'huile",
            "300 g de riz cuit (meilleur avec du riz d'un jour ou congelé)",
            "20 g d'ail (6 gousses)",
            "60 g de jus de citron",
            "5 g de zeste de citron",
            "2 g d'origan séché",
            "3 g de coriandre séchée",
            "6 g de poudre d'oignon",
            "150 g de tzatziki (acheté en magasin)",
            "1 c. à café de flocons de piment rouge (facultatif)"
        ],
        Macro: "613 Calories | 54g C | 43g P | 25g F",
        image: "../img/Lemon-Garlic-Turkey-Bowls-806x1024.jpg"
    },
    {
        RecipeName: "Honey Sriracha Chicken Rice Bowls",
        Ingredient: [
            "Pour les Bols de Riz",
            "",
            "900 g de cuisses de poulet désossées et sans peau",
            "600 g de riz cuit",
            "340 g de brocoli",
            "3 carottes moyennes (150 g)",
            "1 petit oignon (125 g)",
            "50 g d'oignons verts (4 tiges)",
            "7.5 g d'ail haché",
            "15 g d'huile",
            "Spray d'huile",
            "",
            
            "Pour la Sauce",
            "",
            "45 g de sauce soja (sans gluten si nécessaire)",
            "23 g de jus de citron vert",
            "40 g de sriracha",
            "10 g d'huile de sésame",
            "84 g de miel",
            "7.5 g d'ail"
        ],
        Macro: "575 Calories | 62g C | 39g P | 19g F",
        image: "../img/Honey-Sriracha-Rice-Bowls-807x1024.jpg"
    },
    {
        RecipeName: "Teriyaki Ground Beef Bowls",
        Ingredient: [
            "Pour les Bols",
            "",
            "750 g de riz cuit",
            "900 g de bœuf haché (10% de matière grasse)",
            "1 courgette moyenne (250 g)",
            "227 g de carottes",
            "227 g de céleri",
            "1 petit oignon (125 g)",
            "15 g d'ail haché",
            "30 g d'huile",
            "120 g de sauce teriyaki (en bouteille)"
        ],
        Macro: "652 Calories | 66g C | 44g P | 24g F",
        image: "../img/Teriyaki-Ground-Beef-Bowls-WP-864x1024.jpg"
    },
    {
        RecipeName: "Honey BBQ Chicken with Potato Wedges",
        Ingredient: [
            "Pour le Brocoli",
            "",
            "680 g de brocoli",
            "30 g d'huile",
            "Sel et poivre",
            
            "",
            
            "Pour les Pommes de Terre",
            "",
            "750 g de pommes de terre russet (environ 5 petites)",
            "15 g d'huile",
            "6 g de poudre d'ail",
            "6 g de paprika",
            "8 g de poudre de chili",
            "Sel et poivre à votre goût",
            
            "",
            
            "Pour le Poulet",
            "",
            "1135 g de cuisses de poulet désossées et sans peau",
            "120 g de sauce BBQ (de préférence à base de vinaigre)",
            "42 g de miel",
            "Sel et poivre à votre goût"
        ],
        Macro: "542 Calories | 38g C | 44g P | 24g F",
        PrepTime: "15 minutes",
        CookTime: "35 minutes",
        image: "../img/Honey-BBQ-Chicken-WP-813x1024.png"
    },
    {
        RecipeName: "Spicy Adobo Chicken and Peppers",
        Ingredient: [
            "Pour le Poulet et les Légumes",
            "",
            "900 g de cuisses de poulet désossées et sans peau",
            "23 g d'huile d'olive",
            "1 poivron rouge moyen (150 g)",
            "1 poivron vert moyen (150 g)",
            "1 oignon moyen (200 g)",
            
            "",
            
            "Pour le Riz",
            "",
            "525 g de riz cuit",
            "15 g de jus de citron vert",
            
            "",
            
            "Pour la Sauce",
            "",
            "60 g de piments chipotle en sauce adobo",
            "3 g de poudre d'ail",
            "Sel et poivre à votre goût"
        ],
        Macro: "506 Calories | 39g C | 47g P | 18g F",
        PrepTime: "10 minutes",
        CookTime: "25 minutes",
        image: "../img/Spicy-Adobo-Chicken-and-Peppers-WP.jpg"
    },
    {
        RecipeName: "Teriyaki Rotisserie Chicken Bowls",
        Ingredient: [
            "Pour le Poulet",
            "",
            "681 g de poulet rôti effiloché",
            "135 g de sauce teriyaki",
            "10 g de graines de sésame",
            "2 oignons verts (10 g)",
            
            "",
            
            "Pour le Riz",
            "",
            "568 g de riz cuit",
            "15 g de sauce soja",
            "15 g de vinaigre de riz",
            "15 g d'huile piquante à l'ail",
            
            "",
            
            "Pour la Salade de Chou",
            "",
            "340 g de chou râpé",
            "100 g de carottes en bâtonnets",
            "30 g de vinaigre de riz",
            "15 g d'huile piquante à l'ail",
            "21 g de miel"
        ],
        Macro: "557 Calories | 63g C | 38g P | 17g F",
        PrepTime: "20 minutes",
        CookTime: "5 minutes",
        image: "../img/Teriyaki-Rotisserie-Chicken-Bowls-WP-807x1024.jpg"
    },
    {
        RecipeName: "Honey Garlic Chicken Noodle Bowls",
        Ingredient: [
            "Pour la Viande et les Légumes",
            "",
            "900 g de poulet haché (7% de matière grasse)",
            "227 g de nouilles de patates douces",
            "1 petit oignon (125 g)",
            "1 poivron rouge moyen (150 g)",
            "227 g de champignons",
            "227 g de chou râpé (pré-rapé)",
            "15 g d'ail (4 gousses)",
            "25 g d'oignons verts (5 tiges)",
            "30 g d'huile",
            "Sel et poivre",
            
            "",
            
            "Pour la Sauce",
            "",
            "30 g de sauce soja",
            "84 g de miel",
            "80 g de sauce d'huître",
            "10 g d'huile de sésame",
            "15 g de sriracha"
        ],
        Macro: "597 Calories | 66g C | 36g P | 21g F",
        PrepTime: "15 minutes",
        CookTime: "30 minutes",
        image: "../img/Honey-Garlic-Chicken-Noodle-Bowls-WP-807x1024.jpg"
    },
    {
        RecipeName: "Korean Beef and Rice Cakes (Tteokbokki)",
        Ingredient: [
            "1 carotte moyenne (60 g)",
            "5 oignons verts (40 g)",
            "15 g d'ail",
            "200 g de kimchi",
            "454 g de gâteaux de riz",
            "454 g de bœuf haché (10% de matière grasse)",
            "15 g de gochujang",
            "30 g de sauce soja",
            "8 g de sucre",
            "30 g d'eau de cuisson des gâteaux de riz",
            "Sel à votre goût"
        ],
        Macro: "531 Calories | 69g C | 31g P | 14.5g F",
        PrepTime: "5 minutes",
        CookTime: "20 minutes",
        image: "../img/Korean-Beef-and-Rice-Cakes-807x1024.jpg"
    }    
];


const HomePage = () => {

    const [weeklyRecipe1, setWeeklyRecipe1] = useState<number>(0);
    const [weeklyRecipe2, setWeeklyRecipe2] = useState<number>(0);

    const ChosenRecipe = () => {
        let finalWeeklyRecipe : number[] = [];
        while (finalWeeklyRecipe.length < 2) {
            let randomNumber = Math.floor(Math.random() * (RecipeInfo.length))
            if (!finalWeeklyRecipe.includes(randomNumber)) {
                finalWeeklyRecipe.push(randomNumber);
            }
        }
        setWeeklyRecipe1(finalWeeklyRecipe[0]);
        setWeeklyRecipe2(finalWeeklyRecipe[1]);
    }

    const ReplaceRecipe1 = () => {
        let randomNumber = Math.floor(Math.random() * (RecipeInfo.length));
        if (weeklyRecipe1 !== randomNumber) {
            setWeeklyRecipe1(randomNumber);
        }
    }

    const ReplaceRecipe2 = () => {
        let randomNumber = Math.floor(Math.random() * (RecipeInfo.length));
        if (weeklyRecipe2 !== randomNumber) {
            setWeeklyRecipe2(randomNumber);
        }
    }

    const WeeklyGroceries = () => {
        let finalGroceryList = [];
        for (const element of RecipeInfo[weeklyRecipe1].Ingredient) {
            finalGroceryList.push(element);
        }
        for (const element1 of RecipeInfo[weeklyRecipe2].Ingredient) {
            finalGroceryList.push(element1);
        }
        return (finalGroceryList);
    }

    return(
        <>
        <div className="globalHomeSection">

            <div className='sectionHeader'><p>Home Page</p></div>
            <div className="generateButton" onClick={ChosenRecipe}><p>Generate Weekly Recipe</p></div>

            <div className="RecipeDisplay" style={{}}>
                <div className="recipe">
                    <img src={RecipeInfo[weeklyRecipe1].image}/>
                    <div className="recipeDetails">
                        <h2>{RecipeInfo[weeklyRecipe1].RecipeName}</h2>
                        <ul>
                            {RecipeInfo[weeklyRecipe1].Ingredient.map((element, index) => (
                                <li key={index}>{element}</li>
                            ))}
                        </ul>
                        <h5>{RecipeInfo[weeklyRecipe1].Macro}</h5>
                        <div className="replaceButton"><p onClick={ReplaceRecipe1}>Replace Recipe</p></div>
                    </div>
                </div>
                <div className="recipe">
                    <div className="recipeDetails">
                        <h2>{RecipeInfo[weeklyRecipe2].RecipeName}</h2>
                        <ul>
                            {RecipeInfo[weeklyRecipe2].Ingredient.map((element, index) => (
                                <li key={index}>{element}</li>
                            ))}
                        </ul>
                        <h5>{RecipeInfo[weeklyRecipe2].Macro}</h5>
                        <div className="replaceButton"><p onClick={ReplaceRecipe2}>Replace Recipe</p></div>
                    </div>
                    <img src={RecipeInfo[weeklyRecipe2].image}/>
                </div>
            </div>

            <div className="NutritionSection">
                <div className="sectionHeader"><p>Weekly Intakes</p></div>
                <div className="WeeklyInfos">
                    <div className="WeeklyGroceries">
                        <h2>Grocery List</h2>
                        {WeeklyGroceries().map((element, index) => (
                            <p key={index}>{element}</p>
                        ))}
                    </div>
                    <div className="WeeklyMacro">
                        <h2>Weekly Macro</h2>
                        
                    </div>
                </div>
            </div>

        </div>
        </>
    )
}

export default HomePage;