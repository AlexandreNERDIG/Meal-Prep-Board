import { useState } from 'react';
import toast from "react-hot-toast"
import { Trash, Trash2, X, Download} from 'react-feather';
import './RecipeList.css';
import { Recipe, recipeInfo, Ingredient, defaultList } from './typeFile';
import MealHistory from './MealHistory';

const RecipeList = () => {

    const RECIPES_KEY = "globalRecipeList";
    const [isHovered, setIsHovered] = useState(false);

    const [recipeList, setRecipeList] = useState<Recipe[]>(() => {
        const saved = localStorage.getItem(RECIPES_KEY);
        return ((saved) ? JSON.parse(saved) : recipeInfo)
    });

    const [currentStock, setCurrentStock] = useState<Ingredient[]>(() => {
            const exist = localStorage.getItem("currentStockList");
            return ((exist) ? JSON.parse(exist) : defaultList);
    });

    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);

    const handleOpenModal = (recipe: Recipe) => {setSelectedRecipe(recipe)};
    const handleCloseModal = () => {setSelectedRecipe(null)};
    const handleAskDelete = () => {setRecipeToDelete(selectedRecipe)};
    const handleCancelDelete = () => {setRecipeToDelete(null)};

    const handleConfirmDelete = () => {
        if (!recipeToDelete) return;

        const updatedRecipeList = recipeList.filter(element => element.recipeName !== recipeToDelete.recipeName);
        setRecipeList(updatedRecipeList);
        localStorage.setItem(RECIPES_KEY, JSON.stringify(updatedRecipeList));
        toast.error(`${recipeToDelete.recipeName} à bien été supprimer`)
        setRecipeToDelete(null);
        handleCloseModal()
    };

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
        <div className="globalRecipeListSection">

            <div className='sectionHeader'><p>Recipe List</p></div>

            <div className="gallery">
                {recipeList.map((element, index) => (
                    <div key={index} className="flashCard">
                        <img src={element.image}/>
                        <div className="subDivText">
                            <h3>{element.prepTime}</h3>
                            <h2>{element.recipeName}</h2>
                            <p>{element.instructions}</p>
                            <p className="macro">{macroCalculator(element)}</p>
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
                        <div 
                          className="icon"
                          onMouseEnter={() => setIsHovered(true)}
                          onMouseLeave={() => setIsHovered(false)}
                        >
                            {isHovered ? <Trash2 onClick={handleAskDelete}></Trash2> : <Trash onClick={handleAskDelete}></Trash>}
                        </div>
                    </div>
                    <p><strong>Préparation :</strong> {selectedRecipe.prepTime}</p>
                    <p><strong>Cuisson :</strong> {selectedRecipe.cookTime}</p>
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
                  <p>Es-tu sûr de vouloir supprimer <strong>{recipeToDelete?.recipeName}</strong> ?<br/> Cette action est irréversible.</p>
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