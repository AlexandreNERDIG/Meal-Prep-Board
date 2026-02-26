import './MealHistory.css';
import { Bookmark, ShoppingCart, X } from 'react-feather';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Recipe, Ingredient, recipeInfo, RecipeIngredient } from './typeFile';
import defaultList from './CurrentStock'

const MealHistory = () => {

    const quotes: string[] = [
    "« Bien manger, c’est le début du bonheur. » – Julia Child",
    "« Un repas équilibré, c’est une pizza dans chaque main. »",
    "« Laisser mijoter, c’est aimer sans précipitation. »",
    "« Le secret d’une bonne recette, c’est de la faire avec amour. »",
    "« Manger est un besoin, savoir manger est un art. » – François de La Rochefoucauld",
    "« La gastronomie est l’art d’utiliser la nourriture pour créer du bonheur. » – Theodore Zeldin"
    ];

    const [mealHistory, setmealHistory] = useState<Recipe[][]>(() => {
        const saved = localStorage.getItem("mealHistoryList");
        return ((saved) ? JSON.parse(saved) : recipeInfo)
    });

    const [recipeList, setRecipeList] = useState<Recipe[]>(() => {
        const saved = localStorage.getItem("globalRecipeList");
        return ((saved) ? JSON.parse(saved) : recipeInfo)
    });

    const [currentStock, setCurrentStock] = useState<Ingredient[]>(() => {
        const exist = localStorage.getItem("currentStockList");
        return ((exist) ? JSON.parse(exist) : defaultList);
    });

    useEffect( () => {
        localStorage.setItem("mealHistoryList", JSON.stringify(mealHistory))
    }, [mealHistory])

    const [currentModalRecipe, setCurrentModalRecipe] = useState<Recipe | null>(null);
    const [currentQuote, setCurrentQuote] = useState<string>(quotes[Math.floor(Math.random() * quotes.length)]);
    const [recipesToDelete, setRecipesToDelete] = useState<Recipe[] | null>(null);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

    const handleOpenHistoryModal = (currentRecipe : Recipe) => {setCurrentModalRecipe(currentRecipe)};
    const handleCloseHistoryModal = () => {setCurrentModalRecipe(null)};
    const handleChangeQuote = () => {setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)])};
    const handleOpenModal2 = (ingre : Recipe[]) => {setRecipesToDelete(ingre)};
    const handleCloseModal2 = () => {setRecipesToDelete(null)};
    const handleCancelDelete = () => {setRecipesToDelete(null)};
    const handleOpenModal4 = (recipe : Recipe) => {setSelectedRecipe(recipe)};
    const handleCloseModal4 = () => {setSelectedRecipe(null)};

    const changeFavoriteState = (targetRecipe: Recipe) => {
        const newStatus = targetRecipe.status === "favorite" ? "normal" : "favorite";

        toast[newStatus === "favorite" ? "success" : "error"](
            `${targetRecipe.recipeName} a été ${newStatus === "favorite" ? "ajouté aux favoris" : "supprimé des favoris"}`
        );
    
        setmealHistory(prevHistory => prevHistory.map(
            weeklyMeal => weeklyMeal.map(
                recipe => recipe.recipeName === targetRecipe.recipeName
                    ? { ...recipe, status: newStatus }
                    : recipe
            )
        ));
    
        setRecipeList(prevList => prevList.map(
            recipe => recipe.recipeName === targetRecipe.recipeName
                ? { ...recipe, status: newStatus }
                : recipe
        ));
    };

    useEffect(() => {
        localStorage.setItem("globalRecipeList", JSON.stringify(recipeList));
    }, [recipeList]);

    const deleteFromHistory = () => {
        if (!recipesToDelete) return;

        const updatedList = mealHistory.filter(e => e !== recipesToDelete);
        setmealHistory(updatedList);
        localStorage.setItem("mealHistoryList", JSON.stringify(updatedList));
        toast.success(`${recipesToDelete?.[0].recipeName} et ${recipesToDelete?.[1].recipeName} ont bien été supprimés`)
        setRecipesToDelete(null);
        handleCloseModal2();
    };

    const stockDeduction = (groceryList: RecipeIngredient[]) => {
        if (!groceryList || !currentStock) return;

        const filteredGroceryList : RecipeIngredient[] = [];

        for (const element of groceryList) {
            const quantity = element.quantity ? element.quantity : 0;

            if (quantity >= 10) {
                filteredGroceryList.push(element);
            }
        }

        if (!filteredGroceryList) return;

        const updatedStock = currentStock.map(item => {
            const match = filteredGroceryList.find(e => {
                const ing = currentStock.find(ele => ele.id == e.ingredientId);
                const name = ing ? ing.name : ""
                return item.name.trim().toLowerCase().includes(name);
            });

            if (!match) return item;

            const numMatch = match.quantity;
            const neededQuantity = numMatch ? numMatch : 0;

            return {
                ...item,
                Quantity: Math.max(item.quantity - neededQuantity, 0),
            };
        });

        setCurrentStock(updatedStock);
        localStorage.setItem("currentStockList", JSON.stringify(updatedStock));
        toast.success("Stocks mis à jour !");
        handleCloseModal4();
    };

    const macroCalculator = (recipe : Recipe) => {
        const portions = 5
        let cals = 0
        let carbs = 0
        let prot = 0
        let fat = 0

        for (const ingre of recipe.ingredient) {
            const found = currentStock.find(ingredient => ingredient.id == ingre.ingredientId)

            if (!found) continue;

            const ratio = ingre.quantity / 100
            cals += found.macro.calories * ratio
            carbs += found.macro.carbs * ratio
            prot += found.macro.protein * ratio
            fat += found.macro.fat * ratio
        }
        return (`${Math.round(cals / portions)} Calories | ${Math.round(carbs / portions)} g C | ${Math.round(prot / portions)} g P | ${Math.round(fat / portions)} g F`)
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
                                    <h2>{recipe.recipeName}</h2>
                                    <Bookmark 
                                        className='bookMarkIcon' 
                                        color={recipe.status === "favorite" ? "#78dc7d" : "white"} 
                                        onClick={() => changeFavoriteState(recipe)} 
                                    />
                                    <X className='deleteIcon' onClick={() => handleOpenModal2(weeklyMeal)}></X>
                                    <p className='macrosPart'>{macroCalculator(recipe)}</p>
                                    <ShoppingCart className='ShoppingCartIcon' onClick={() => handleOpenModal4(recipe)}></ShoppingCart>
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

        {/* Modal d'affichage de la recette */}

        {currentModalRecipe && (
            <div className="modalOverlay" onClick={handleCloseHistoryModal}>
                <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                    <h2>{currentModalRecipe.recipeName}</h2>

                    <p><strong>Préparation :</strong> {currentModalRecipe.prepTime}</p>
                    <p><strong>Cuisson :</strong> {currentModalRecipe.cookTime}</p>
                    <p><strong>Ingrédients :</strong> <br /><br />{currentModalRecipe.ingredient.map((element, index) => {
                        const ing = currentStock.find(ele => ele.id == element.ingredientId)
                        return (
                            <li key={index}>{ing?.name} {element.quantity} {ing?.unit}</li>
                        )
                    })}</p>
                    <p><strong>Instructions :</strong> <br /><br />{currentModalRecipe.instructions}</p>
                    <p><strong>Macros :</strong> <br /><br />{macroCalculator(currentModalRecipe)}</p>
                    <button onClick={handleCloseHistoryModal}>Fermer</button>
                </div>
            </div>
        )}

        {/* Modal de confirmation de suppression de l'historique */}

        {recipesToDelete && (
            <div className="modalOverlay" onClick={handleCloseModal2}>
                <div className="deleteModalContent1" onClick={(e) => e.stopPropagation()}>
                    <div className="head1">
                        <h3>Confirmer la suppression</h3>
                        <div><X className='logo' onClick={handleCancelDelete}></X></div>
                    </div>
                  <p>Es-tu sûr de vouloir supprimer <strong>{recipesToDelete?.[0].recipeName}</strong> et <strong>{recipesToDelete?.[1].recipeName}</strong> ?<br/> Cette action est irréversible.</p>
                  <div className="deleteModalActions">
                    <button className="confirmDeleteBtn" onClick={deleteFromHistory}>Confirmer</button>
                    <button className="cancelDeleteBtn" onClick={handleCloseModal2}>Annuler</button>
                  </div>
                </div>
            </div>
        )}

        {/* Modal de confirmation de déduction des stocks */}

        {selectedRecipe && (
            <div className="modalOverlay" onClick={handleCloseModal4}>
                <div className="deleteModalContent" onClick={(e) => e.stopPropagation()}>
                    <div className="head">
                        <h3>Voulez vous déduire cette recette des Stocks ?</h3>
                        <div><X className='logo' onClick={handleCloseModal4}></X></div>
                    </div>
                <p>Cette action concerne : </p>
                {selectedRecipe.ingredient
                    .filter(e => {
                        const quantity = e.quantity ? e.quantity : 0;
                        return quantity >= 10;
                    })
                    .map((e, index) => {
                        const ing = currentStock.find(ele => ele.id == e.ingredientId)
                        return(
                            <li key={index}>{ing?.name}{e.quantity}</li>
                        )
                    })
                }
                <div className="deleteModalActions">
                    <button className="confirmDeleteBtn" onClick={() => stockDeduction(selectedRecipe.ingredient)}>Confirmer</button>
                    <button className="cancelDeleteBtn" onClick={handleCloseModal4}>Annuler</button>
                  </div>
                </div>
            </div>
        )}
        </>
    )
}

export default MealHistory;