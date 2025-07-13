import { useState, useRef } from 'react';
import HomePage, { RecipeInfo } from './HomePage';
import NavBar from './NavBar';
import toast from 'react-hot-toast';
import './NewMeal.css';

const NewMeal = () => {

    const RECIPES_KEY = "globalRecipeList";
    const nameRef = useRef<HTMLTextAreaElement | null>(null);

    type Recipe = {
        RecipeName: string;
        Ingredient: string[];
        Macro: string;
        PrepTime: string;
        CookTime: string;
        Instructions: string;
        image: string;
    };

    /* Teste de l'affichage

    RecipeName: "Bœuf Bourguignon",
        Ingredient: [
            "1 kg de bœuf à braiser",
            "3 carottes",
            "2 oignons",
            "250 ml de vin rouge",
        ],
        Macro: "450 Calories | 15 g C | 38 g P | 22 g F",
        PrepTime: "20 min",
        CookTime: "3h",
        Instructions: "Faites revenir le bœuf dans l'huile, ajoutez les oignons, carottes, et l'ail. Saupoudrez de farine, versez le vin, le bouillon et laissez mijoter 2h30.",
        image: "../img/High-Volume-Korean-Beef-Bowls-807x1024.jpg"

        RecipeName: "",
        Ingredient: [""],
        Macro: "",
        PrepTime: "",
        CookTime: "",
        Instructions: "",
        image: ""

    */

    const [formData, setFormData] = useState<Recipe>({
        RecipeName: "",
        Ingredient: [""],
        Macro: "",
        PrepTime: "",
        CookTime: "",
        Instructions: "",
        image: ""
    });

    const [recipeList, setRecipeList] = useState<Recipe[]>(() => {
        const saved = localStorage.getItem(RECIPES_KEY);
        return ((saved) ? JSON.parse(saved) : RecipeInfo)
    });

    const handleChange = (e : React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name] : value
        }))
    }

    const handleChangeIngredient = (e : React.ChangeEvent<HTMLInputElement>) => {
        const index = Number(e.target.dataset.index);
        const value = e.target.value;

        setFormData((prev) => {
            const updatedIngredients = [...prev.Ingredient];
            updatedIngredients[index] = value
            return {
                ...prev,
                Ingredient : updatedIngredients
            }
        })
    }

    const ajouterIngredient = () => {
        setFormData((prev) => ({
            ...prev,
            Ingredient : [...prev.Ingredient, ""]
        }));
    }

    const ajouterRecette = () => {
        const confirmed = window.confirm("Etes-vous sûre de vouloir ajouter la Recette saisie ?")
        const alreadyExist = recipeList.some(element => element.RecipeName === formData.RecipeName)
        
        if (alreadyExist) {
            toast.error(`${formData.RecipeName} n'a pas pu être ajouté (Existe déjà)`)
            return;
        }

        if (!formData.RecipeName.trim() || formData.Ingredient.filter(i => i.trim() !== '').length === 0) {
            alert("Merci de remplir au moins le nom de la recette et un ingrédient.");
            return;
        }
        if (confirmed) {
            const updatedRecipeList = [...recipeList, formData];
            setRecipeList(updatedRecipeList)
            setFormData({
                RecipeName: "",
                Ingredient: [""],
                Macro: "",
                PrepTime: "",
                CookTime: "",
                Instructions: "",
                image: ""
            });
            localStorage.setItem(RECIPES_KEY, JSON.stringify(updatedRecipeList))
            toast.success(`${formData.RecipeName} ajoutée !`);
            nameRef.current?.focus();
        }
    }

    const handleJsonImport = (e : React.ChangeEvent<HTMLInputElement>) => { 
        const confirm = window.confirm("Y a-t-il plusieurs fichiers ?")

        if (!confirm) { //Seulement 1 fichier

            const file = e.target.files?.[0]
            if (!file) return;

            const reader = new FileReader()

            reader.onload = () => {
                const content = reader.result as string;
                const parsedData = JSON.parse(content);

                setFormData(parsedData)
            }

            reader.readAsText(file);
        }
        else { //Plusieurs Fichiers
            const files = e.target.files;
            if (!files) return;

            let seen = new Set();

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (!file) continue;

                const reader = new FileReader();

                reader.onload = () => {
                    const fileContent = reader.result as string;
                    const parsedFileContent = JSON.parse(fileContent);
                    const currentRecipeName = parsedFileContent.RecipeName?.trim()

                    setRecipeList(prev => {

                        const alreadyExist = prev.some(element => element.RecipeName === currentRecipeName)

                        if (!seen.has(currentRecipeName) && currentRecipeName && !alreadyExist) {
                            seen.add(currentRecipeName)
                            toast.success(`${currentRecipeName} à bien été ajouté`)


                            const updatedRecipeList = [...prev, parsedFileContent];
                            localStorage.setItem(RECIPES_KEY, JSON.stringify(updatedRecipeList))
                            return updatedRecipeList
                        }
                        else if (alreadyExist) {
                            toast.error(`${currentRecipeName} n'a pas pu être ajouté (Existe déjà)`)
                        }
                        return prev;
                    })
                }
                reader.readAsText(file);
                
            }
        }
        return;
    }
    
    const placeholder = "https://placehold.co/500x450/2c2c2c/ffffff?text=Pas+d'image&font=montserrat";

    return(
        <>
        <div className="globalNewMealSection">

            <div className='sectionHeader'><p>New Meal</p></div>

            <div className="Inputs">
                <div className="textInput">
                    <label>Nom de la recette : </label>
                    <textarea
                      name="RecipeName"
                      ref={nameRef}
                      value={formData.RecipeName}
                      onChange={handleChange}
                      placeholder='Entrer les informations'
                    />

                    <label>Ingredients : </label>
                    {formData.Ingredient.map( (element, index) => (
                        <div key={index}>
                            <input
                                name='Ingredient'
                                data-index={index}
                                value={element}
                                onChange={handleChangeIngredient}
                                placeholder='Entrer les informations'
                            />
                        </div>
                    ))}
                    <div className="centerButton">
                        <button onClick={ajouterIngredient} className='Btn'>Ajouter un Ingredient</button>
                    </div>

                    <label>Macros : </label>
                    <textarea
                      name="Macro"
                      value={formData.Macro}
                      onChange={handleChange}
                      placeholder='Entrer les informations'
                    />

                    <label>Temps de préparation : </label>
                    <textarea
                      name="PrepTime"
                      value={formData.PrepTime}
                      onChange={handleChange}
                      placeholder='Entrer les informations'
                    />

                    <label>Temps de cuisson : </label>
                    <textarea
                      name="CookTime"
                      value={formData.CookTime}
                      onChange={handleChange}
                      placeholder='Entrer les informations'
                    />

                    <label>Instructions : </label>
                    <textarea
                      name="Instructions"
                      value={formData.Instructions}
                      onChange={handleChange}
                      placeholder='Entrer les informations'
                    />

                    <label>Image : </label>
                    <textarea
                      name="image"
                      value={formData.image}
                      onChange={handleChange}
                      placeholder='Entrer les informations'
                    />
                </div>
                <div className="imageInput">
                    <img src={formData.image || placeholder} alt="Recette"/>
                </div>
            </div>
                <div className="centerButton2">
                    <button onClick={ajouterRecette} className='Btn2'>Ajouter la Recette à la Liste</button>
                    <input 
                      type='file'
                      accept=".json"
                      onChange={handleJsonImport}
                      className='Btn3'
                      multiple
                    />
                </div>
        </div>
        </>
    )
}

export default NewMeal;