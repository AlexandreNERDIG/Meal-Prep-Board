import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from "react-hot-toast"
import { Trash, Trash2, X, Download, Edit2, Aperture, Search, ArrowUp, ArrowDown } from 'react-feather';
import './RecipeList.css';
import { Recipe, Ingredient, defaultList } from './typeFile';
import { calcRecipeMacros, calcRecipeCost, formatMacros, formatPrice, formatDuration, loadRecipes, DEFAULT_PORTIONS, RECIPE_SORTS, sortRecipes, recipeMatchesSearch } from '../lib/recipeUtils';
import type { RecipeSortKey, SortDirection } from '../lib/recipeUtils';
import { toastUndo } from '../lib/undoToast';

const RecipeList = () => {

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

    const activeSort = RECIPE_SORTS.find(sort => sort.key === sortKey);

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
        toastUndo(`${deleted.recipeName} a bien été supprimée`, () => restoreRecipe(deleted, deletedIndex));
        setRecipeToDelete(null);
        handleCloseModal()
    };

    // Annuler la suppression : on remet la recette à sa place. Le localStorage fait foi (le toast peut rester affiché longtemps).
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
        a.download = `${recipe.recipeName || "recette"}.json`;
        a.click();

        URL.revokeObjectURL(url);
        toast.success("Téléchargement en cours");
    }

    const macroCalculator = (recipe : Recipe) => {
        return formatMacros(calcRecipeMacros(recipe.ingredient, currentStock));
    }

    const costCalculator = (recipe : Recipe) => {
        const total = calcRecipeCost(recipe.ingredient, currentStock);
        return `${formatPrice(total)} (${formatPrice(total / DEFAULT_PORTIONS)} / portion)`;
    }

    return(
        <>
        <div className="globalRecipeListSection">

            <div className='sectionHeader'><p>Recipe List</p></div>

            <div className="searchBarContainer">
                <div className="inputSection">
                    <div className="searchLogoContainer"><Aperture></Aperture></div>
                    <input type="text" className='searchInput' value={searchValue} onChange={(e) => setSearchValue(e.target.value)} placeholder='Une recette, un ingrédient ?'/>
                    <div className="searchIconContainer"><Search></Search></div>
                </div>
            </div>

            <div className="sortBar">
                <span className="sortLabel">Trier par</span>
                <div className="chipRow">
                    <button
                        type="button"
                        className={`chip ${sortKey === "default" ? "active" : ""}`}
                        onClick={() => { setSortKey("default"); setSortDirection("asc"); }}
                    >
                        Ordre d'ajout
                    </button>
                    {RECIPE_SORTS.map(sort => (
                        <button
                            type="button"
                            key={sort.key}
                            className={`chip ${sortKey === sort.key ? "active" : ""}`}
                            onClick={() => handleSortClick(sort.key)}
                        >
                            {sort.label}
                            {sortKey === sort.key && (sortDirection === "asc" ? <ArrowUp size={14}/> : <ArrowDown size={14}/>)}
                        </button>
                    ))}
                </div>
                <p className="sortHint">
                    {visibleRecipes.length} recette{visibleRecipes.length > 1 ? "s" : ""}
                    {activeSort ? ` · ${sortDirection === "asc" ? activeSort.asc : activeSort.desc}` : ""}
                </p>
            </div>

            <div className="gallery">
                {visibleRecipes.length === 0 && <p className="emptyStock">Aucune recette ne correspond à ta recherche.</p>}
                {visibleRecipes.map((element) => (
                    <div key={element.recipeName} className="flashCard">
                        <img src={element.image}/>
                        <div className="subDivText">
                            <h3>{formatDuration(element.prepTime)}</h3>
                            <h2>{element.recipeName}</h2>
                            <p>{element.instructions}</p>
                            <p className="macro">{macroCalculator(element)}</p>
                            <p className="macro">{costCalculator(element)}</p>
                            <div className="centeredButton">
                                <button className="descBtn" onClick={() => handleOpenModal(element)}>Description</button>
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
                            <div className="icon editIcon" title="Modifier la recette">
                                <Edit2 onClick={handleEdit}></Edit2>
                            </div>
                            <div
                              className="icon"
                              title="Supprimer la recette"
                              onMouseEnter={() => setIsHovered(true)}
                              onMouseLeave={() => setIsHovered(false)}
                            >
                                {isHovered ? <Trash2 onClick={handleAskDelete}></Trash2> : <Trash onClick={handleAskDelete}></Trash>}
                            </div>
                        </div>
                    </div>
                    <p><strong>Préparation :</strong> {formatDuration(selectedRecipe.prepTime)}</p>
                    <p><strong>Cuisson :</strong> {formatDuration(selectedRecipe.cookTime)}</p>
                    <p><strong>Ingrédients :</strong> <br/><br/>
                        {selectedRecipe.ingredient.map((element, index) => {
                            const ing = currentStock.find(ingre => ingre.id == element.ingredientId)
                            return (
                                <li key={index}>{ing?.name} {element.quantity} {ing?.unit}</li>
                            )
                        })}
                    </p>
                    <p><strong>Instructions :</strong> <br /><br />{selectedRecipe.instructions}</p>
                    <p><strong>Macros :</strong> <br /><br />{macroCalculator(selectedRecipe)}</p>
                    <p><strong>Coût :</strong> <br /><br />{costCalculator(selectedRecipe)}</p>
                    <button onClick={handleCloseModal}>Fermer</button>
                </div>
            </div>
        )}

        {/* Modal de suppression de recette */}

        {recipeToDelete && (
            <div className="modalOverlay" onClick={handleCloseModal}>
                <div className="deleteModalContent" onClick={(e) => e.stopPropagation()}>
                    <div className="head">
                        <h3>Confirmer la suppression</h3>
                        <div><X className='logo' onClick={handleCancelDelete}></X></div>
                    </div>
                  <p>Es-tu sûr de vouloir supprimer <strong>{recipeToDelete?.recipeName}</strong> ?<br/> Tu pourras l'annuler juste après.</p>
                  <div className="deleteModalActions">
                    <button className="confirmDeleteBtn" onClick={handleConfirmDelete}>Confirmer</button>
                    <button className="cancelDeleteBtn" onClick={handleCancelDelete}>Annuler</button>
                  </div>
                </div>
            </div>
        )}
        </>
    )
}

export default RecipeList;