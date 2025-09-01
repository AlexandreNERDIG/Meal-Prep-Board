import { useState, useEffect } from 'react';
import './HomePage.css';
import NavBar from './NavBar';
import { FaNimblr } from 'react-icons/fa';
import { Trash, Trash2, X} from 'react-feather';
import toast from 'react-hot-toast';
import { Recipe, Ingredient } from './typeFile';
 
export const RecipeInfo = [
    {
        RecipeName: "Bœuf Bourguignon",
        Ingredient: [
            "1000g Bœuf à Braiser",
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
        image: "../img/Korean-Beef-and-Rice-Cakes-807x1024.jpg",
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
        image: "../img/Korean-Beef-and-Rice-Cakes-807x1024.jpg",
        Status: "normal"
    },
    {
        RecipeName: "Bœuf Stroganoff",
        Ingredient: [
            "1000g Bœuf à Mijoter",
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
            "250g Pomme de Terre",
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
            "1000g Bœuf à Mijoter",
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
            "1000g Veau à Mijoter",
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
            "1000g Bœuf (Paleron, Macreuse)",
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
            "300g Pomme de Terre",
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
    }
];


const HomePage = () => {

    const RECIPES_KEY = "globalRecipeList";

    const [weeklyRecipe1, setWeeklyRecipe1] = useState<number>(0);
    const [weeklyRecipe2, setWeeklyRecipe2] = useState<number>(0);
    
    const [mealHistory, setmealHistory] = useState<Recipe[][]>(() => {
        const saved = localStorage.getItem("mealHistoryList");
        return ((saved) ? JSON.parse(saved) : [[{
            RecipeName: "Poulet Basquaise",
            Ingredient: [
                "750 g de cuisses de poulet",
                "2 poivrons",
                "2 tomates",
                "2 oignons",
                "2 gousses d'ail",
                "200 ml de bouillon de volaille",
            ],
            Macro: "400 Calories | 12 g C | 35 g P | 22 g F",
            PrepTime: "15 min",
            CookTime: "1h30",
            Instructions: "Faites revenir le poulet dans l'huile. Ajoutez les oignons, poivrons et l'ail. Versez le bouillon et laissez mijoter 1h.",
            image: "../img/High-Volume-Korean-Beef-Bowls-807x1024.jpg"
        },
        {
            RecipeName: "Daube Provençale",
            Ingredient: [
                "1 kg de bœuf à mijoter",
                "250 ml de vin rouge",
                "2 carottes",
                "2 oignons",
                "2 gousses d'ail",
                "2 tomates",
                "1 bouquet garni",
                "1 cuillère à soupe de farine",
                "Sel et poivre au goût",
                "Huile d'olive pour la cuisson"
            ],
            Macro: "450 Calories | 15 g C | 38 g P | 20 g F",
            PrepTime: "15 min",
            CookTime: "2h30",
            Instructions: "Faites dorer la viande, ajoutez les oignons, l'ail et les carottes. Versez le vin et les tomates, et laissez mijoter pendant 2h30.",
            image: "../img/Chicken-Fajita-Fried-Rice-807x1024.jpg"
        }]])
    });

    const [recipeList, setRecipeList] = useState<Recipe[]>(() => {
        const saved = localStorage.getItem(RECIPES_KEY);
        return ((saved) ? JSON.parse(saved) : RecipeInfo)
    });

    const ChosenRecipe = () => {
        let finalWeeklyRecipe : number[] = [];
        while (finalWeeklyRecipe.length < 2) {
            let randomNumber = Math.floor(Math.random() * (recipeList.length))
            if (!finalWeeklyRecipe.includes(randomNumber)) {
                finalWeeklyRecipe.push(randomNumber);
            }
        }
        setWeeklyRecipe1(finalWeeklyRecipe[0]);
        setWeeklyRecipe2(finalWeeklyRecipe[1]);
    }

    const ReplaceRecipe1 = () => {
        let randomNumber = Math.floor(Math.random() * (recipeList.length));
        if (weeklyRecipe1 !== randomNumber) {
            setWeeklyRecipe1(randomNumber);
        }
    }

    const ReplaceRecipe2 = () => {
        let randomNumber = Math.floor(Math.random() * (recipeList.length));
        if (weeklyRecipe2 !== randomNumber) {
            setWeeklyRecipe2(randomNumber);
        }
    }

    const WeeklyGroceries = () => {
        let finalGroceryList = [""];
        for (const element of recipeList[weeklyRecipe1].Ingredient) {
            finalGroceryList.push(element);
        }
        for (const element1 of recipeList[weeklyRecipe2].Ingredient) {
            finalGroceryList.push(element1);
        }
        return (finalGroceryList);
    }

    const DailyMacros = () => {
        let NumTab1 = recipeList[weeklyRecipe1].Macro.match(/\d+/g)
        let NumTab2 = recipeList[weeklyRecipe2].Macro.match(/\d+/g)
        let ConstArr = ["Calories", "Carbs", "Proteines", "Fat"]
        let FinalArr = [""]
        if (NumTab1 == null || NumTab2 == null) {
            return null
        }
        for (let i =0; i < NumTab1.length; i++) {
            let ValeurFinale = +NumTab1[i] + +NumTab2[i]
            FinalArr.push(ValeurFinale + " " + ConstArr[i])
        }
        return FinalArr;
    }

    const WeeklyMacros = () => {
        let NumTab1 = recipeList[weeklyRecipe1].Macro.match(/\d+/g)
        let NumTab2 = recipeList[weeklyRecipe2].Macro.match(/\d+/g)
        let ConstArr = ["Calories", "Carbs", "Proteines", "Fat"]
        let FinalArr = [""]
        if (NumTab1 == null || NumTab2 == null) {
            return null
        }
        for (let i =0; i < NumTab1.length; i++) {
            let ValeurFinale = (+NumTab1[i] * 5) + (+NumTab2[i] * 5)
            FinalArr.push(ValeurFinale + " " + ConstArr[i])
        }
        return FinalArr;
    }

    const confirmedChoices = () => {
        const newRecipes = [
            recipeList[weeklyRecipe1],
            recipeList[weeklyRecipe2]
        ];
        const updatedHistory = [...mealHistory, newRecipes];
        setmealHistory(updatedHistory);
        localStorage.setItem("mealHistoryList", JSON.stringify(updatedHistory))
        toast.success("Recettes ajoutées à l'historique !");
        handleCloseConfirmationModal();
    };

    const dailyMacros = DailyMacros();
    const weeklyMacros = WeeklyMacros();

    const [askConfirmation, setAskConfirmation] = useState<boolean>(false);

    const handleOpenConfirmationModal = () => {
        setAskConfirmation(true);
    }

    const handleCloseConfirmationModal = () => {
        setAskConfirmation(false);
    }

    return(
        <>
        <div className="globalHomeSection">

            <div className='sectionHeader'><p>Home Page</p></div>
            <div className="generateButton"><p onClick={ChosenRecipe}>Generate Weekly Recipe</p></div>

            <div className="RecipeDisplay">
                <div className="recipe">
                    <img src={recipeList[weeklyRecipe1].image}/>
                    <div className="recipeDetails">
                        <h2>{recipeList[weeklyRecipe1].RecipeName}</h2>
                        <ul>
                            {recipeList[weeklyRecipe1].Ingredient.map((element, index) => (
                                <li key={index}>{element}</li>
                            ))}
                        </ul>
                        <h5>{recipeList[weeklyRecipe1].Macro}</h5>
                        <div className="replaceButton"><p onClick={ReplaceRecipe1}>Replace Recipe</p></div>
                    </div>
                </div>
                <div className="recipe">
                    <div className="recipeDetails">
                        <h2>{recipeList[weeklyRecipe2].RecipeName}</h2>
                        <ul>
                            {recipeList[weeklyRecipe2].Ingredient.map((element, index) => (
                                <li key={index}>{element}</li>
                            ))}
                        </ul>
                        <h5>{recipeList[weeklyRecipe2].Macro}</h5>
                        <div className="replaceButton"><p onClick={ReplaceRecipe2}>Replace Recipe</p></div>
                    </div>
                    <img src={recipeList[weeklyRecipe2].image}/>
                </div>
            </div>

            <div className="NutritionSection">
                <div className="sectionHeader"><p>Weekly Intakes</p></div>
                <div className="WeeklyInfos">
                    <div className="subMacro">
                            <h3 className='MacrosSubPart'>Daily Macros : </h3>
                            {dailyMacros ? dailyMacros.map((element, index) => (
                                <p key={index}>{element}</p>
                            ))
                            : <p>{"Pas d'info mais Hassoul ca devrait pas arriver"}</p>}
                    </div>
                    <div className="subMacro">
                            <h3 className='MacrosSubPart'>Weekly Macros : </h3>
                            {weeklyMacros ? weeklyMacros.map((element, index) => (
                            <p key={index}>{element}</p> 
                            ))
                            : <p>{"Pas d'info mais Hassoul ca devrait pas arriver"}</p>}
                    </div>
                </div>
            </div>

            <div className="confirmationButtonSection" onClick={handleOpenConfirmationModal}>Confirm Meal Choices</div>

        </div>

        {askConfirmation && (
            <div className="modalOverlay" onClick={handleCloseConfirmationModal}>
                <div className="deleteModalContent" onClick={(e) => e.stopPropagation()}>
                    <div className="head">
                        <h3>Etes-vous sûre de vouloir ajouté la recette ?</h3>
                        <div><X className='logo' onClick={handleCloseConfirmationModal}></X></div>
                    </div>
                  <p>Cette action n'est pas définitive et peut être annulé dans la rubrique <strong>"Meal History"</strong>.</p>
                  <div className="deleteModalActions">
                    <button className="confirmDeleteBtn" onClick={confirmedChoices}>Confirmer</button>
                    <button className="cancelDeleteBtn" onClick={handleCloseConfirmationModal}>Annuler</button>
                  </div>
                </div>
            </div>
        )}
        </>
    )
}

export default HomePage;