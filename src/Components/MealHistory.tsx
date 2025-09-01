import NavBar from './NavBar';
import './MealHistory.css';
import { Bookmark, ShoppingCart, X } from 'react-feather';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Recipe, Ingredient } from './typeFile';

const MealHistory = () => {

    const [mealHistory, setmealHistory] = useState<Recipe[][]>(() => {
        const saved = localStorage.getItem("mealHistoryList");
        return ((saved) ? JSON.parse(saved) : [[]])
    });

    useEffect( () => {
        localStorage.setItem("mealHistoryList", JSON.stringify(mealHistory))
    }, [mealHistory])

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

    const [currentQuote, setCurrentQuote] = useState<string>(quotes[Math.floor(Math.random() * quotes.length)]);

    const handleChangeQuote = () => {
        setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    };

    const changeFavoriteState = (targetRecipe: Recipe) => {
        targetRecipe.Status === "favorite" ? toast.error(`${targetRecipe.RecipeName} a été suprimmé des favoris`) : toast.success(`${targetRecipe.RecipeName} a été ajouté aux favoris`)
        setmealHistory(prevHistory => {
            return prevHistory.map(weeklyMeal => {
                return weeklyMeal.map(recipe => {
                    if (recipe.RecipeName === targetRecipe.RecipeName) {
                        return {
                        ...recipe,
                        Status: recipe.Status === "favorite" ? "normal" : "favorite"
                        };
                    }
                    return recipe;
                });
            });
        });
    };

    const [recipesToDelete, setRecipesToDelete] = useState<Recipe[] | null>(null);

    const handleOpenModal2 = (ingre : Recipe[]) => {
        setRecipesToDelete(ingre)
    }

    const handleCloseModal2 = () => {
        setRecipesToDelete(null)
    }

    const handleCancelDelete = () => {
        setRecipesToDelete(null);
    }

    const deleteFromHistory = () => {
        if (!recipesToDelete) return;

        const updatedList = mealHistory.filter(e => e !== recipesToDelete);
        setmealHistory(updatedList);
        localStorage.setItem("currentStockList", JSON.stringify(updatedList));
        toast.success(`${recipesToDelete?.[0].RecipeName} et ${recipesToDelete?.[1].RecipeName} ont bien été supprimés`)
        setRecipesToDelete(null);
        handleCloseModal2()
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
                                    <Bookmark 
                                        className='bookMarkIcon' 
                                        color={recipe.Status === "favorite" ? "#78dc7d" : "white"} 
                                        onClick={() => changeFavoriteState(recipe)} 
                                    />
                                    <X className='deleteIcon' onClick={() => handleOpenModal2(weeklyMeal)}></X>
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

        {recipesToDelete && (
            <div className="modalOverlay" onClick={handleCloseModal2}>
                <div className="deleteModalContent1" onClick={(e) => e.stopPropagation()}>
                    <div className="head1">
                        <h3>Confirmer la suppression</h3>
                        <div><X className='logo' onClick={handleCancelDelete}></X></div>
                    </div>
                  <p>Es-tu sûr de vouloir supprimer <strong>{recipesToDelete?.[0].RecipeName}</strong> et <strong>{recipesToDelete?.[1].RecipeName}</strong> ?<br/> Cette action est irréversible.</p>
                  <div className="deleteModalActions">
                    <button className="confirmDeleteBtn" onClick={deleteFromHistory}>Confirmer</button>
                    <button className="cancelDeleteBtn" onClick={handleCloseModal2}>Annuler</button>
                  </div>
                </div>
            </div>
        )}
        </>
    )
}

export default MealHistory;