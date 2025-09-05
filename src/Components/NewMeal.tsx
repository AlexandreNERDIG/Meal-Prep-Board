import { useState, useRef } from 'react';
import { RecipeInfo } from './HomePage';
import { X} from 'react-feather';
import toast from 'react-hot-toast';
import './NewMeal.css';
import { Recipe } from './typeFile';

const NewMeal = () => {

    const RECIPES_KEY = "globalRecipeList";
    const nameRef = useRef<HTMLTextAreaElement | null>(null);

    const [formData, setFormData] = useState<Recipe>({
        RecipeName: "",
        Ingredient: [""],
        Macro: "",
        PrepTime: "",
        CookTime: "",
        Instructions: "",
        image: "",
        Status: "normal"
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

    const [askConfirmation, setAskConfirmation] = useState<boolean>(false);

    const handleOpenConfirmationModal = () => {
        setAskConfirmation(true);
    }

    const handleCloseConfirmationModal = () => {
        setAskConfirmation(false);
    }

    const ajouterRecette = () => {
        const alreadyExist = recipeList.some(element => element.RecipeName === formData.RecipeName)
        
        if (alreadyExist) {
            toast.error(`${formData.RecipeName} n'a pas pu être ajouté (Existe déjà)`)
            setFormData({
                RecipeName: "",
                Ingredient: [""],
                Macro: "",
                PrepTime: "",
                CookTime: "",
                Instructions: "",
                image: "",
                Status: "normal"
            });
            handleCloseConfirmationModal();
            return;
        }

        if (!formData.RecipeName.trim() || formData.Ingredient.filter(i => i.trim() !== '').length === 0) {
            alert("Merci de remplir au moins le nom de la recette et un ingrédient.");
            handleCloseConfirmationModal();
            return;
        }
        if (askConfirmation) {
            const updatedRecipeList = [...recipeList, formData];
            setRecipeList(updatedRecipeList)
            setFormData({
                RecipeName: "",
                Ingredient: [""],
                Macro: "",
                PrepTime: "",
                CookTime: "",
                Instructions: "",
                image: "",
                Status: "normal"
            });
            localStorage.setItem(RECIPES_KEY, JSON.stringify(updatedRecipeList))
            toast.success(`${formData.RecipeName} ajoutée !`);
            nameRef.current?.focus();
            handleCloseConfirmationModal();
        }
    }

    const [importedFiles, setImportedFiles] = useState<FileList | null>(null);

    const handleMultiJsonImport = () => {
        if (!importedFiles) return;

        let seen = new Set();

        for (let i = 0; i < importedFiles.length; i++) {

            const file = importedFiles[i];
            if (!file) continue;

            const reader = new FileReader();

            reader.onload = () => {
                const fileContent = reader.result as string;
                const parsedFileContent = JSON.parse(fileContent);
                const currentRecipeName = parsedFileContent.RecipeName?.trim()

                setRecipeList(prev => {
                    const alreadyExist = prev.some(element => element.RecipeName === currentRecipeName);

                    if (!seen.has(currentRecipeName) && currentRecipeName && !alreadyExist) {
                        seen.add(currentRecipeName)
                        toast.success(`${currentRecipeName} à bien été ajouté`)
                        const updatedRecipeList = [...prev, parsedFileContent];
                        localStorage.setItem(RECIPES_KEY, JSON.stringify(updatedRecipeList))
                        return updatedRecipeList
                    }
                    return prev;
                })
                const alreadyExist = recipeList.some(element => element.RecipeName === currentRecipeName);

                if (seen.has(currentRecipeName) || alreadyExist) {
                        toast.error(`${currentRecipeName} n'a pas pu être ajouté (Existe déjà)`)
                }
            }
            reader.readAsText(file);
        }
        handleCloseModal1();
    }

    const handleSingleJsonImport = () => {
        if (!importedFiles || importedFiles.length === 0) return;
    
        const reader = new FileReader()
        reader.onload = () => {
            const content = reader.result as string;
            const parsedData = JSON.parse(content);
            setFormData(parsedData)
        }
        reader.readAsText(importedFiles[0]);
        handleCloseModal1();
    }


    const [modalState, setModalState] = useState<boolean>(false);

    const handleOpenModal1 = () => {
        setModalState(true);
    }

    const handleCloseModal1 = () => {
        setModalState(false);
    }

    const handleImagePath = (e : React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            toast.error("L'image n'a pas pu être chargée")
            return;
        }

        const fileName = file.name;

        setFormData((prev) => ({
            ...prev,
            image : `../img/${fileName}`
        }))
        toast.success("L'image a bien été chargée")
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
                      placeholder='Entrer le nom de la recette'
                    />

                    <label>Ingredients : </label>
                    {formData.Ingredient.map( (element, index) => (
                        <div key={index}>
                            <input
                                name='Ingredient'
                                data-index={index}
                                value={element}
                                onChange={handleChangeIngredient}
                                placeholder='Entrer les ingrédients'
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
                      placeholder='Entrer les macros'
                    />

                    <label>Temps de préparation : </label>
                    <textarea
                      name="PrepTime"
                      value={formData.PrepTime}
                      onChange={handleChange}
                      placeholder='Entrer le temps de préparation'
                    />

                    <label>Temps de cuisson : </label>
                    <textarea
                      name="CookTime"
                      value={formData.CookTime}
                      onChange={handleChange}
                      placeholder='Entrer le temps de cuisson'
                    />

                    <label>Instructions : </label>
                    <textarea
                      name="Instructions"
                      value={formData.Instructions}
                      onChange={handleChange}
                      placeholder='Entrer les instructions'
                    />

                    <label>Image : </label>
                    <input type="file" onChange={handleImagePath}/>
                </div>
                <div className="imageInput">
                    <img src={formData.image || placeholder} alt="Recette"/>
                </div>
            </div>
                <div className="centerButton2">
                    <button onClick={handleOpenConfirmationModal} className='Btn2'>Ajouter la Recette à la Liste</button>
                    <input 
                      type='file'
                      accept=".json"
                      onChange={(e) => {
                        if (e.target.files) {
                            setImportedFiles(e.target.files);
                            handleOpenModal1();
                        }
                      }}
                      className='Btn3'
                      multiple
                    />
                </div>
        </div>
        {modalState && (
                    <div className="modalOverlay" onClick={handleCloseModal1}>
                        <div className="deleteModalContent" onClick={(e) => e.stopPropagation()}>
                            <div className="head">
                                <h3>Confirmer le nombre de Fichier</h3>
                                <div><X className='logo' onClick={handleCloseModal1}></X></div>
                            </div>
                          <p>Combien de fichier avez-vous <strong>importer</strong> ?</p>
                          <div className="deleteModalActions">
                            <button className="confirmDeleteBtn" onClick={handleMultiJsonImport}>Plusieurs</button>
                            <button className="cancelDeleteBtn" onClick={handleSingleJsonImport}>1 seul</button>
                          </div>
                        </div>
                    </div>
        )}
        {askConfirmation && (
                    <div className="modalOverlay" onClick={handleCloseConfirmationModal}>
                        <div className="deleteModalContent" onClick={(e) => e.stopPropagation()}>
                            <div className="head">
                                <h3>Etes-vous sûre de vouloir ajouté la recette ?</h3>
                                <div><X className='logo' onClick={handleCloseConfirmationModal}></X></div>
                            </div>
                          <p>Cette action n'est pas définitive et peut être annulé dans la rubrique <strong>"Recipe List"</strong>.</p>
                          <div className="deleteModalActions">
                            <button className="confirmDeleteBtn" onClick={ajouterRecette}>Confirmer</button>
                            <button className="cancelDeleteBtn" onClick={handleCloseConfirmationModal}>Annuler</button>
                          </div>
                        </div>
                    </div>
        )}
        </>
    )
}

export default NewMeal;