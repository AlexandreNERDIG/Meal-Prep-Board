import './MealHistory.css';
import { Bookmark, ShoppingCart, X } from 'react-feather';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { toastUndo } from '../lib/undoToast';
import { Recipe, Ingredient, RecipeIngredient, defaultList } from './typeFile';
import { calcRecipeMacros, formatMacros, formatDuration, findIngredient, isStockTracked, loadRecipes, loadMealHistory, unitLabel } from '../lib/recipeUtils';
import { useT } from '../i18n/LanguageProvider';
import type { TranslationKey } from '../i18n/translations';

const MealHistory = () => {

    const { t, tb } = useT();
    const QUOTE_COUNT = 6;

    const [mealHistory, setmealHistory] = useState<Recipe[][]>(loadMealHistory);

    const [recipeList, setRecipeList] = useState<Recipe[]>(loadRecipes);

    const [currentStock, setCurrentStock] = useState<Ingredient[]>(() => {
        const exist = localStorage.getItem("currentStockList");
        return ((exist) ? JSON.parse(exist) : defaultList);
    });

    useEffect( () => {
        localStorage.setItem("mealHistoryList", JSON.stringify(mealHistory))
    }, [mealHistory])

    const [currentModalRecipe, setCurrentModalRecipe] = useState<Recipe | null>(null);
    const [quoteIndex, setQuoteIndex] = useState<number>(() => Math.floor(Math.random() * QUOTE_COUNT));
    const [recipesToDelete, setRecipesToDelete] = useState<Recipe[] | null>(null);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

    const handleOpenHistoryModal = (currentRecipe : Recipe) => {setCurrentModalRecipe(currentRecipe)};
    const handleCloseHistoryModal = () => {setCurrentModalRecipe(null)};
    const handleChangeQuote = () => {setQuoteIndex(previous => (previous + 1 + Math.floor(Math.random() * (QUOTE_COUNT - 1))) % QUOTE_COUNT)};
    const handleOpenModal2 = (ingre : Recipe[]) => {setRecipesToDelete(ingre)};
    const handleCloseModal2 = () => {setRecipesToDelete(null)};
    const handleCancelDelete = () => {setRecipesToDelete(null)};
    const handleOpenModal4 = (recipe : Recipe) => {setSelectedRecipe(recipe)};
    const handleCloseModal4 = () => {setSelectedRecipe(null)};

    const changeFavoriteState = (targetRecipe: Recipe) => {
        const newStatus = targetRecipe.status === "favorite" ? "normal" : "favorite";

        toast[newStatus === "favorite" ? "success" : "error"](
            t(newStatus === "favorite" ? "history.favAdded" : "history.favRemoved", { name: targetRecipe.recipeName })
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

        const deleted = recipesToDelete;
        const deletedIndex = mealHistory.indexOf(deleted);
        const updatedList = mealHistory.filter(e => e !== deleted);
        setmealHistory(updatedList);
        localStorage.setItem("mealHistoryList", JSON.stringify(updatedList));
        toastUndo(t("history.deleted", { first: deleted[0]?.recipeName ?? "", second: deleted[1]?.recipeName ?? "" }), () => restoreWeek(deleted, deletedIndex));
        setRecipesToDelete(null);
        handleCloseModal2();
    };

    const restoreWeek = (week: Recipe[], index: number) => {
        const current = loadMealHistory();
        if (current.some(w => JSON.stringify(w) === JSON.stringify(week))) return;

        const restored = [...current];
        restored.splice(Math.min(Math.max(index, 0), restored.length), 0, week);
        localStorage.setItem("mealHistoryList", JSON.stringify(restored));
        setmealHistory(restored);
    }

    const stockDeduction = (groceryList: RecipeIngredient[]) => {
        if (!groceryList || !currentStock) return;

        const filteredGroceryList : RecipeIngredient[] = [];

        for (const element of groceryList) {
            const quantity = element.quantity ? element.quantity : 0;

            if (quantity > 0 && isStockTracked(findIngredient(currentStock, element.ingredientId))) {
                filteredGroceryList.push(element);
            }
        }

        if (!filteredGroceryList) return;

        const updatedStock = currentStock.map(item => {
            const match = filteredGroceryList.find(e => String(e.ingredientId) === String(item.id));

            if (!match) return item;

            const numMatch = match.quantity;
            const neededQuantity = numMatch ? numMatch : 0;

            return {
                ...item,
                quantity: Math.max(item.quantity - neededQuantity, 0),
            };
        });

        setCurrentStock(updatedStock);
        localStorage.setItem("currentStockList", JSON.stringify(updatedStock));
        toast.success(t("home.toast.stockUpdated"));
        handleCloseModal4();
    };

    const macroCalculator = (recipe : Recipe) => {
        return formatMacros(calcRecipeMacros(recipe.ingredient, currentStock));
    }
    
    return(
        <>
        <div className="globalMealHistorySection">

            <div className='sectionHeader'><p>{t("page.history")}</p></div>

            <div className="quotePlacement">
                <p className='Quote' onClick={handleChangeQuote}>{t(`quote.${quoteIndex}` as TranslationKey)}</p>
            </div>

            {mealHistory.map((weeklyMeal, weekIndex) => (
                <div className="weekDisplay" key={weekIndex}>
                    <div className="weekId"><p>{t("history.week", { n: weekIndex + 1 })}</p></div>
                    <div className="recipeContainner">
                        {weeklyMeal.map((recipe, recipeIndex) => (
                            <div className="recipeDisplay" key={recipeIndex}>
                                <img src={recipe.image} alt={recipe.recipeName}/>
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
                                        <button className="descBtn" onClick={() => handleOpenHistoryModal(recipe)}>{t("common.description")}</button>
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

                    <p><strong>{t("modal.prep")}</strong> {formatDuration(currentModalRecipe.prepTime)}</p>
                    <p><strong>{t("modal.cook")}</strong> {formatDuration(currentModalRecipe.cookTime)}</p>
                    <p><strong>{t("modal.ingredients")}</strong> <br /><br />{currentModalRecipe.ingredient.map((element, index) => {
                        const ing = currentStock.find(ele => ele.id == element.ingredientId)
                        return (
                            <li key={index}>{ing?.name} {element.quantity} {ing ? unitLabel(ing.unit) : ""}</li>
                        )
                    })}</p>
                    <p><strong>{t("modal.instructions")}</strong> <br /><br />{currentModalRecipe.instructions}</p>
                    <p><strong>{t("modal.macros")}</strong> <br /><br />{macroCalculator(currentModalRecipe)}</p>
                    <button onClick={handleCloseHistoryModal}>{t("common.close")}</button>
                </div>
            </div>
        )}

        {/* Modal de confirmation de suppression de l'historique */}

        {recipesToDelete && (
            <div className="modalOverlay" onClick={handleCloseModal2}>
                <div className="deleteModalContent1" onClick={(e) => e.stopPropagation()}>
                    <div className="head1">
                        <h3>{t("modal.confirmDelete")}</h3>
                        <div><X className='logo' onClick={handleCancelDelete}></X></div>
                    </div>
                  <p>{tb("history.deleteAsk", { first: recipesToDelete?.[0].recipeName ?? "", second: recipesToDelete?.[1].recipeName ?? "" })}</p>
                  <div className="deleteModalActions">
                    <button className="confirmDeleteBtn" onClick={deleteFromHistory}>{t("common.confirm")}</button>
                    <button className="cancelDeleteBtn" onClick={handleCloseModal2}>{t("common.cancel")}</button>
                  </div>
                </div>
            </div>
        )}

        {/* Modal de confirmation de déduction des stocks */}

        {selectedRecipe && (
            <div className="modalOverlay" onClick={handleCloseModal4}>
                <div className="deleteModalContent" onClick={(e) => e.stopPropagation()}>
                    <div className="head">
                        <h3>{t("history.stockTitle")}</h3>
                        <div><X className='logo' onClick={handleCloseModal4}></X></div>
                    </div>
                <p>{t("history.stockConcerns")}</p>
                {selectedRecipe.ingredient
                    .filter(e => {
                        const quantity = e.quantity ? e.quantity : 0;
                        return quantity > 0 && isStockTracked(findIngredient(currentStock, e.ingredientId));
                    })
                    .map((e, index) => {
                        const ing = currentStock.find(ele => ele.id == e.ingredientId)
                        return(
                            <li key={index}>{ing?.name} {e.quantity}</li>
                        )
                    })
                }
                <div className="deleteModalActions">
                    <button className="confirmDeleteBtn" onClick={() => stockDeduction(selectedRecipe.ingredient)}>{t("common.confirm")}</button>
                    <button className="cancelDeleteBtn" onClick={handleCloseModal4}>{t("common.cancel")}</button>
                  </div>
                </div>
            </div>
        )}
        </>
    )
}

export default MealHistory;