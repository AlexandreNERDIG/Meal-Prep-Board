import { useState } from 'react';
import NavBar from './NavBar';
import HomePage, { RecipeInfo } from './HomePage';
import toast from "react-hot-toast"
import { Trash, Trash2, X, Download} from 'react-feather';
import './RecipeList.css';
import { data } from '@remix-run/router/dist/utils';
import { Recipe, Ingredient } from './typeFile';



const RecipeList = () => {

    const RECIPES_KEY = "globalRecipeList";
    const [isHovered, setIsHovered] = useState(false);

    const [recipeList, setRecipeList] = useState<Recipe[]>(() => {
        const saved = localStorage.getItem(RECIPES_KEY);
        return ((saved) ? JSON.parse(saved) : RecipeInfo)
    });

    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

    const handleOpenModal = (recipe: Recipe) => {
        setSelectedRecipe(recipe);
    };

    const handleCloseModal = () => {
        setSelectedRecipe(null);
    };

    const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);

    const handleAskDelete = () => {
        setRecipeToDelete(selectedRecipe);
    };

    const handleConfirmDelete = () => {
        if (!recipeToDelete) return;

        const updatedRecipeList = recipeList.filter(element => element.RecipeName !== recipeToDelete.RecipeName);
        setRecipeList(updatedRecipeList);
        localStorage.setItem(RECIPES_KEY, JSON.stringify(updatedRecipeList));
        toast.error(`${recipeToDelete.RecipeName} à bien été supprimer`)
        setRecipeToDelete(null);
        handleCloseModal()
    };

    const handleCancelDelete = () => {
        setRecipeToDelete(null);
    }

    const handleSingleDownloadRecipe = (recipe : Recipe) => {
        const dataStr = JSON.stringify(recipe, null, 2);
        const blob = new Blob([dataStr], { type : "application/json"});
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `${recipe.RecipeName || "recette"}.json`;
        a.click();

        URL.revokeObjectURL(url);

        toast.success("Téléchargement en cours");
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
                            <h3>{element.PrepTime}</h3>
                            <h2>{element.RecipeName}</h2>
                            <p>{element.Instructions}</p>
                            <p className="macro">{element.Macro}</p>
                            <div className="centeredButton">
                                <button className="descBtn" onClick={() => handleOpenModal(element)}>Description</button>
                                <Download className='DlBoutton' onClick={() => handleSingleDownloadRecipe(element)}></Download>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        {selectedRecipe && (
            <div className="modalOverlay" onClick={handleCloseModal}>
                <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                    <div className="boxInfos">
                        <h2>{selectedRecipe.RecipeName}</h2>
                        <div 
                          className="icon"
                          onMouseEnter={() => setIsHovered(true)}
                          onMouseLeave={() => setIsHovered(false)}
                        >
                            {isHovered ? <Trash2 onClick={handleAskDelete}></Trash2> : <Trash onClick={handleAskDelete}></Trash>}
                        </div>
                    </div>
                    <p><strong>Préparation :</strong> {selectedRecipe.PrepTime}</p>
                    <p><strong>Cuisson :</strong> {selectedRecipe.CookTime}</p>
                    <p><strong>Ingrédients :</strong> <br /><br />{selectedRecipe.Ingredient.map((element, index) => (
                                <li key={index}>{element}</li>
                            ))}</p>
                    <p><strong>Instructions :</strong> <br /><br />{selectedRecipe.Instructions}</p>
                    <p><strong>Macros :</strong> <br /><br />{selectedRecipe.Macro}</p>
                    <button onClick={handleCloseModal}>Fermer</button>
                </div>
            </div>
        )}
        {recipeToDelete && (
            <div className="modalOverlay" onClick={handleCloseModal}>
                <div className="deleteModalContent" onClick={(e) => e.stopPropagation()}>
                    <div className="head">
                        <h3>Confirmer la suppression</h3>
                        <div><X className='logo' onClick={handleCancelDelete}></X></div>
                    </div>
                  <p>Es-tu sûr de vouloir supprimer <strong>{recipeToDelete?.RecipeName}</strong> ?<br/> Cette action est irréversible.</p>
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