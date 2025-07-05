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
                        </div>
                    </div>
                ))}
            </div>
        </div>
        </>
    )
}

export default RecipeList;