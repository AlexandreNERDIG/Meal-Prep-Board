import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from "react-hot-toast"
import { Trash, Trash2, X, Download, Edit2, Aperture, Search, ArrowUp, ArrowDown } from 'react-feather';
import './RecipeList.css';
import { Recipe, Ingredient, defaultList } from './typeFile';
import { calcRecipeMacros, calcRecipeCost, formatMacros, formatPrice, formatDuration, loadRecipes, DEFAULT_PORTIONS, RECIPE_SORT_KEYS, sortRecipes, recipeMatchesSearch, unitLabel } from '../lib/recipeUtils';
import { useT } from '../i18n/LanguageProvider';
import type { RecipeSortKey, SortDirection } from '../lib/recipeUtils';
import { toastUndo } from '../lib/undoToast';

const RecipeList = () => {

    const { t, tb } = useT();
    const RECIPES_KEY = "globalRecipeList";
    const [isHovered, setIsHovered] = useState(false);

    const [recipeList, setRecipeList] = useState<Recipe[]>(loadRecipes);

    const [currentStock] = useState<Ingredient[]>(() => {
            const exist = localStorage.getItem("currentStockList");
            return ((exist) ? JSON.parse(exist) : defaultList);
    });

    const navigate = useNavigate();

    const [searchValue, setSearchValue] = useState("");
    const [sortKey, setSortKey] = useState<RecipeSortKey>("default");
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

    // Un clic sur un critère le sélectionne (du plus petit au plus grand) ; un 2e clic inverse l'ordre.
    const handleSortClick = (key: RecipeSortKey) => {
        if (key === sortKey) {
            setSortDirection(prev => prev === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            setSortDirection("asc");
        }
    }

    const visibleRecipes = useMemo(() => {
        const filtered = recipeList.filter(recipe => recipeMatchesSearch(recipe, searchValue, currentStock));
        return sortRecipes(filtered, sortKey, sortDirection, currentStock);
    }, [recipeList, searchValue, sortKey, sortDirection, currentStock]);

    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);

    const handleOpenModal = (recipe: Recipe) => {setSelectedRecipe(recipe)};
    const handleCloseModal = () => {setSelectedRecipe(null)};
    const handleAskDelete = () => {setRecipeToDelete(selectedRecipe)};
    const handleCancelDelete = () => {setRecipeToDelete(null)};

    const handleConfirmDelete = () => {
        if (!recipeToDelete) return;

        const deleted = recipeToDelete;
        const deletedIndex = recipeList.findIndex(element => element.recipeName === deleted.recipeName);

        const updatedRecipeList = recipeList.filter(element => element.recipeName !== deleted.recipeName);
        setRecipeList(updatedRecipeList);
        localStorage.setItem(RECIPES_KEY, JSON.stringify(updatedRecipeList));
        toastUndo(t("recipes.deleted", { name: deleted.recipeName }), () => restoreRecipe(deleted, deletedIndex));
        setRecipeToDelete(null);
        handleCloseModal()
    };

    const restoreRecipe = (recipe: Recipe, index: number) => {
        const current = loadRecipes();
        if (current.some(element => element.recipeName === recipe.recipeName)) return;

        const restored = [...current];
        restored.splice(Math.min(Math.max(index, 0), restored.length), 0, recipe);
        localStorage.setItem(RECIPES_KEY, JSON.stringify(restored));
        setRecipeList(restored);
    }

    const handleEdit = () => {
        if (!selectedRecipe) return;
        navigate("/NewMeal", { state: { editName: selectedRecipe.recipeName } });
    }

    const handleSingleDownloadRecipe = (recipe : Recipe) => {
        const dataStr = JSON.stringify(recipe, null, 2);
        const blob = new Blob([dataStr], { type : "application/json"});
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `${recipe.recipeName || t("common.recipe").toLowerCase()}.json`;
        a.click();

        URL.revokeObjectURL(url);
        toast.success(t("recipes.downloading"));
    }

    const macroCalculator = (recipe : Recipe) => {
        return formatMacros(calcRecipeMacros(recipe.ingredient, currentStock));
    }

    const costCalculator = (recipe : Recipe) => {
        const total = calcRecipeCost(recipe.ingredient, currentStock);
        return `${formatPrice(total)} (${formatPrice(total / DEFAULT_PORTIONS)} ${t("price.perServing")})`;
    }

    return(
        <>
        <div className="globalRecipeListSection">

            <div className='sectionHeader'><p>{t("page.recipes")}</p></div>

            <div className="searchBarContainer">
                <div className="inputSection">
                    <div className="searchLogoContainer"><Aperture></Aperture></div>
                    <input type="text" className='searchInput' value={searchValue} onChange={(e) => setSearchValue(e.target.value)} placeholder={t("recipes.search")}/>
                    <div className="searchIconContainer"><Search></Search></div>
                </div>
            </div>

            <div className="sortBar">
                <span className="sortLabel">{t("sort.by")}</span>
                <div className="chipRow">
                    <button
                        type="button"
                        className={`chip ${sortKey === "default" ? "active" : ""}`}
                        onClick={() => { setSortKey("default"); setSortDirection("asc"); }}
                    >
                        {t("sort.default")}
                    </button>
                    {RECIPE_SORT_KEYS.map(sort => (
                        <button
                            type="button"
                            key={sort}
                            className={`chip ${sortKey === sort ? "active" : ""}`}
                            onClick={() => handleSortClick(sort)}
                        >
                            {t(`sort.${sort}` as const)}
                            {sortKey === sort && (sortDirection === "asc" ? <ArrowUp size={14}/> : <ArrowDown size={14}/>)}
                        </button>
                    ))}
                </div>
                <p className="sortHint">
                    {t("recipes.count", { count: visibleRecipes.length })}
                    {sortKey !== "default" ? ` · ${t(`sort.${sortKey}.${sortDirection}` as const)}` : ""}
                </p>
            </div>

            <div className="gallery">
                {visibleRecipes.length === 0 && <p className="emptyStock">{t("recipes.empty")}</p>}
                {visibleRecipes.map((element) => (
                    <div key={element.recipeName} className="flashCard">
                        <img src={element.image} alt={element.recipeName}/>
                        <div className="subDivText">
                            <h3>{formatDuration(element.prepTime)}</h3>
                            <h2>{element.recipeName}</h2>
                            <p className='InstructionFlashCard'>{element.instructions}</p>
                            <p className="macro">{macroCalculator(element)}</p>
                            <p className="macro">{costCalculator(element)}</p>
                            <div className="centeredButton">
                                <button className="descBtn" onClick={() => handleOpenModal(element)}>{t("common.description")}</button>
                                <Download className='DlBoutton' onClick={() => handleSingleDownloadRecipe(element)}></Download>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Modal d'affichage de recette */}

        {selectedRecipe && (
            <div className="modalOverlay" onClick={handleCloseModal}>
                <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                    <div className="boxInfos">
                        <h2>{selectedRecipe.recipeName}</h2>
                        <div className="modalIcons">
                            <div className="icon editIcon" title={t("recipes.edit")}>
                                <Edit2 onClick={handleEdit}></Edit2>
                            </div>
                            <div
                              className="icon"
                              title={t("recipes.delete")}
                              onMouseEnter={() => setIsHovered(true)}
                              onMouseLeave={() => setIsHovered(false)}
                            >
                                {isHovered ? <Trash2 onClick={handleAskDelete}></Trash2> : <Trash onClick={handleAskDelete}></Trash>}
                            </div>
                        </div>
                    </div>
                    <p><strong>{t("modal.prep")}</strong> {formatDuration(selectedRecipe.prepTime)}</p>
                    <p><strong>{t("modal.cook")}</strong> {formatDuration(selectedRecipe.cookTime)}</p>
                    <p><strong>{t("modal.ingredients")}</strong> <br/><br/>
                        {selectedRecipe.ingredient.map((element, index) => {
                            const ing = currentStock.find(ingre => ingre.id == element.ingredientId)
                            return (
                                <li key={index}>{ing?.name} {element.quantity} {ing ? unitLabel(ing.unit) : ""}</li>
                            )
                        })}
                    </p>
                    <p><strong>{t("modal.instructions")}</strong> <br /><br />{selectedRecipe.instructions}</p>
                    <p><strong>{t("modal.macros")}</strong> <br /><br />{macroCalculator(selectedRecipe)}</p>
                    <p><strong>{t("modal.cost")}</strong> <br /><br />{costCalculator(selectedRecipe)}</p>
                    <button onClick={handleCloseModal}>{t("common.close")}</button>
                </div>
            </div>
        )}

        {/* Modal de suppression de recette */}

        {recipeToDelete && (
            <div className="modalOverlay" onClick={handleCloseModal}>
                <div className="deleteModalContent" onClick={(e) => e.stopPropagation()}>
                    <div className="head">
                        <h3>{t("modal.confirmDelete")}</h3>
                        <div><X className='logo' onClick={handleCancelDelete}></X></div>
                    </div>
                  <p>{tb("modal.sure", { name: recipeToDelete?.recipeName ?? "" })}</p>
                  <div className="deleteModalActions">
                    <button className="confirmDeleteBtn" onClick={handleConfirmDelete}>{t("common.confirm")}</button>
                    <button className="cancelDeleteBtn" onClick={handleCancelDelete}>{t("common.cancel")}</button>
                  </div>
                </div>
            </div>
        )}
        </>
    )
}

export default RecipeList;