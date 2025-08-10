import { useState, useEffect } from 'react';
import './HomePage.css';
import NavBar from './NavBar';
import { FaNimblr } from 'react-icons/fa';
import { Trash, Trash2, X} from 'react-feather';
import toast from 'react-hot-toast';
 
export const RecipeInfo = [
    {
        RecipeName: "Bœuf Bourguignon",
        Ingredient: [
            "1 kg de bœuf à braiser",
            "3 carottes",
            "2 oignons",
            "250 ml de vin rouge",
            "250 ml de bouillon de bœuf",
            "2 gousses d'ail",
            "1 bouquet garni",
            "1 cuillère à soupe de farine",
            "Sel et poivre au goût"
        ],
        Macro: "450 Calories | 15 g C | 38 g P | 22 g F",
        PrepTime: "20 min",
        CookTime: "3h",
        Instructions: "Faites revenir le bœuf dans l'huile, ajoutez les oignons, carottes, et l'ail. Saupoudrez de farine, versez le vin, le bouillon et laissez mijoter 2h30.",
        image: "../img/High-Volume-Korean-Beef-Bowls-807x1024.jpg"
    },
    {
        RecipeName: "Poulet Basquaise",
        Ingredient: [
            "750 g de cuisses de poulet",
            "2 poivrons",
            "2 tomates",
            "2 oignons",
            "2 gousses d'ail",
            "200 ml de bouillon de volaille",
            "1 cuillère à café de paprika",
            "1 cuillère à soupe d'huile d'olive",
            "Sel et poivre au goût"
        ],
        Macro: "400 Calories | 12 g C | 35 g P | 22 g F",
        PrepTime: "15 min",
        CookTime: "1h30",
        Instructions: "Faites revenir le poulet dans l'huile. Ajoutez les oignons, poivrons et l'ail. Versez le bouillon et laissez mijoter 1h.",
        image: "../img/Korean-Beef-and-Rice-Cakes-807x1024.jpg"
    },
    {
        RecipeName: "Bœuf Stroganoff",
        Ingredient: [
            "1 kg de bœuf à mijoter",
            "250 g de champignons",
            "2 oignons",
            "2 gousses d'ail",
            "150 ml de crème fraîche",
            "1 cuillère à soupe de moutarde",
            "1 cuillère à soupe de farine",
            "1 cuillère à soupe d'huile d'olive",
            "Sel et poivre au goût"
        ],
        Macro: "460 Calories | 18 g C | 35 g P | 25 g F",
        PrepTime: "20 min",
        CookTime: "1h30",
        Instructions: "Faites revenir le bœuf, les oignons et l'ail dans l'huile. Ajoutez les champignons. Mélangez la crème et la moutarde, incorporez et laissez mijoter 1h.",
        image: "../img/Honey-Garlic-Chicken-Noodle-Bowls-WP-807x1024.jpg"
    },
    {
        RecipeName: "Tajine d'Agneau",
        Ingredient: [
            "1 kg d'épaule d'agneau",
            "2 carottes",
            "2 oignons",
            "2 navets",
            "250 g de pommes de terre",
            "200 g de petits pois",
            "500 ml de bouillon de légumes",
            "2 gousses d'ail",
            "1 cuillère à café de cumin",
            "Sel et poivre au goût"
        ],
        Macro: "520 Calories | 25 g C | 42 g P | 28 g F",
        PrepTime: "15 min",
        CookTime: "2h",
        Instructions: "Faites revenir la viande d'agneau, puis ajoutez les oignons, l'ail, les carottes et les navets. Versez le bouillon et laissez mijoter 1h30. Ajoutez les pommes de terre et les petits pois 30 minutes avant la fin.",
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
    },
    {
        RecipeName: "Rôti de Porc à la Moutarde",
        Ingredient: [
            "1 kg de rôti de porc",
            "3 cuillères à soupe de moutarde de Dijon",
            "2 oignons",
            "2 gousses d'ail",
            "250 ml de bouillon de volaille",
            "1 cuillère à soupe d'huile d'olive",
            "1 cuillère à café de thym",
            "Sel et poivre au goût"
        ],
        Macro: "420 Calories | 10 g C | 35 g P | 25 g F",
        PrepTime: "15 min",
        CookTime: "2h",
        Instructions: "Badigeonnez le rôti de moutarde. Faites-le revenir avec les oignons et l'ail. Ajoutez le bouillon et laissez mijoter pendant 2h.",
        image: "../img/Poblano-Chicken-Harvest-Bowls-807x1024.jpg"
    },
    {
        RecipeName: "Blanquette de Veau",
        Ingredient: [
            "1 kg de veau à mijoter",
            "3 carottes",
            "2 poireaux",
            "2 oignons",
            "250 g de champignons",
            "150 ml de crème fraîche",
            "1 citron (jus)",
            "1 bouquet garni",
            "75 g de beurre",
            "1 cuillère à soupe de farine",
            "Sel et poivre au goût"
        ],
        Macro: "480 Calories | 18 g C | 42 g P | 22 g F",
        PrepTime: "20 min",
        CookTime: "2h",
        Instructions: "Faites revenir la viande avec les oignons et le beurre. Ajoutez les carottes, les poireaux et le bouquet garni. Couvrez d’eau et laissez mijoter 2 heures. À la fin, incorporez la crème, le jus de citron et la farine pour épaissir la sauce.",
        image: "../img/Tikka-Masala-Meatballs-807x1024.png"
    },
    {
        RecipeName: "Bœuf aux Carottes",
        Ingredient: [
            "1 kg de bœuf (paleron, macreuse)",
            "5 carottes",
            "2 oignons",
            "2 gousses d'ail",
            "300 ml de bouillon de bœuf",
            "1 cuillère à soupe de farine",
            "1 bouquet garni",
            "Sel et poivre au goût",
            "Huile d'olive pour la cuisson"
        ],
        Macro: "350 Calories | 12 g C | 35 g P | 15 g F",
        PrepTime: "15 min",
        CookTime: "1h30",
        Instructions: "Faites revenir le bœuf avec les oignons et l'ail. Ajoutez les carottes en rondelles. Saupoudrez de farine, puis ajoutez le bouillon. Laissez mijoter à feu doux pendant 1h30.",
        image: "../img/thai-red-curry-34c1e6d.jpg"
    },
    {
        RecipeName: "Poulet au Paprika et Pommes de Terre",
        Ingredient: [
            "750 g de cuisses de poulet",
            "3 pommes de terre",
            "2 oignons",
            "2 gousses d'ail",
            "250 ml de bouillon de volaille",
            "2 cuillères à soupe de paprika",
            "1 cuillère à soupe d'huile d'olive",
            "Sel et poivre au goût",
            "1 cuillère à café de thym"
        ],
        Macro: "400 Calories | 20 g C | 35 g P | 20 g F",
        PrepTime: "15 min",
        CookTime: "1h30",
        Instructions: "Faites revenir les cuisses de poulet avec les oignons, l'ail, et le paprika. Ajoutez les pommes de terre et le bouillon. Laissez mijoter jusqu'à ce que le poulet soit cuit.",
        image: "../img/Teriyaki-Ground-Beef-Bowls-WP-864x1024.jpg"
    }
];   


const HomePage = () => {

    const RECIPES_KEY = "globalRecipeList";

    type Recipe = {
        RecipeName: string;
        Ingredient: string[];
        Macro: string;
        PrepTime: string;
        CookTime: string;
        Instructions: string;
        image: string;
    }

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