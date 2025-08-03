import NavBar from './NavBar';
import './MealHistory.css';
import { useState } from 'react';

const MealHistory = () => {

    const MealRecipeHistory_Key  = "MealRecipeHistory";

    type Recipe = {
        RecipeName: string;
        Ingredient: string[];
        Macro: string;
        PrepTime: string;
        CookTime: string;
        Instructions: string;
        image: string;
    };

    const [mealHistoryList, setMealHistoryList] = useState<Recipe[]>(() => {
        const isSaved = localStorage.getItem("mealHistoryList");
        
        return ((isSaved) 
        ? JSON.parse(isSaved) 
        : [{
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
        }])
    });
    
    return(
        <>
        <div className="globalMealHistorySection">

            <div className='sectionHeader'><p>Meal History</p></div>
            

        </div>
        </>
    )
}

export default MealHistory;