import NavBar from './NavBar';
import './MealHistory.css';
import { Bookmark, ShoppingCart } from 'react-feather';
import { useState } from 'react';

const MealHistory = () => {

    type Recipe = {
        RecipeName: string;
        Ingredient: string[];
        Macro: string;
        PrepTime: string;
        CookTime: string;
        Instructions: string;
        image: string;
        Status?: 'favorite' | 'normal';
    };

    const [mealHistory, setmealHistory] = useState<Recipe[][]>(() => {
        const saved = localStorage.getItem("mealHistoryList");
        return ((saved) ? JSON.parse(saved) : [[]])
    });

    const [currentModalRecipe, setCurrentModalRecipe] = useState<Recipe | null>(null);

    const handleOpenHistoryModal = (currentRecipe : Recipe) => {
        setCurrentModalRecipe(currentRecipe);
    };

    const handleCloseHistoryModal = () => {
        setCurrentModalRecipe(null);
    }

    const quotes: string[] = [
    "« Bien manger, c’est le début du bonheur. » – Julia Child",
    "« Un repas équilibré, c’est une pizza dans chaque main. »",
    "« Laisser mijoter, c’est aimer sans précipitation. »",
    "« Le secret d’une bonne recette, c’est de la faire avec amour. »",
    "« Manger est un besoin, savoir manger est un art. » – François de La Rochefoucauld",
    "« La gastronomie est l’art d’utiliser la nourriture pour créer du bonheur. » – Theodore Zeldin"
    ];

    const [currentQuote, setCurrentQuote] = useState<string>("« Un repas équilibré, c’est une pizza dans chaque main. »");

    const handleChangeQuote = () => {
        setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }
    
    return(
        <>
        <div className="globalMealHistorySection">

            <div className='sectionHeader'><p>Meal History</p></div>

            <div className="quotePlacement">
                <p className='Quote' onClick={handleChangeQuote}>{currentQuote}</p>
            </div>

            {mealHistory.map((weeklyMeal, weekIndex) => (
                
                <div className="weekDisplay" key={weekIndex}>
                    <div className="weekId"><p>Week {weekIndex + 1}</p></div>
                    <div className="recipeContainner">
                        {weeklyMeal.map((recipe, recipeIndex) => (
                            <div className="recipeDisplay" key={recipeIndex}>
                                <img src={recipe.image}/>
                                <div className="textSubDiv">
                                    <h2>{recipe.RecipeName}</h2>
                                    <Bookmark className='bookMarkIcon'></Bookmark>
                                    <p className='macrosPart'>{recipe.Macro}</p>
                                    <ShoppingCart className='ShoppingCartIcon'></ShoppingCart>
                                    <div className="centeredLinks">
                                        <button className="descBtn" onClick={() => handleOpenHistoryModal(recipe)}>Description</button>
                                    </div>
                                </div>
                            </div> 
                        ))}
                    </div>
                </div>
            ))}

        </div>

        {currentModalRecipe && (
            <div className="modalOverlay" onClick={handleCloseHistoryModal}>
                <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                    <h2>{currentModalRecipe.RecipeName}</h2>

                    <p><strong>Préparation :</strong> {currentModalRecipe.PrepTime}</p>
                    <p><strong>Cuisson :</strong> {currentModalRecipe.CookTime}</p>
                    <p><strong>Ingrédients :</strong> <br /><br />{currentModalRecipe.Ingredient.map((element, index) => (
                                <li key={index}>{element}</li>
                            ))}</p>
                    <p><strong>Instructions :</strong> <br /><br />{currentModalRecipe.Instructions}</p>
                    <p><strong>Macros :</strong> <br /><br />{currentModalRecipe.Macro}</p>
                    <button onClick={handleCloseHistoryModal}>Fermer</button>
                </div>
            </div>
        )}
        </>
    )
}

export default MealHistory;