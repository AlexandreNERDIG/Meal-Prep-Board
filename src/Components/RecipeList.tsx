import { useState } from 'react';
import NavBar from './NavBar';
import HomePage, { RecipeInfo } from './HomePage';
import './RecipeList.css';



const RecipeList = () => {

    type Recipe = {
        RecipeName: string;
        Ingredient: string[];
        Macro: string;
        PrepTime: string;
        CookTime: string;
        Instructions: string;
        image: string;
    };

    const RECIPES_KEY = "globalRecipeList";

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
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        {selectedRecipe && (
            <div className="modalOverlay" onClick={handleCloseModal}>
                <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                    <h2>{selectedRecipe.RecipeName}</h2>
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
        </>
    )
}

export default RecipeList;