import { useState, useRef } from 'react';
import { X} from 'react-feather';
import toast from 'react-hot-toast';
import './NewMeal.css';
import { Recipe, Ingredient, RecipeIngredient, recipeInfo, defaultList } from './typeFile';
import { calcRecipeMacros, calcRecipeCost, formatMacros, formatPrice, findIngredient, DEFAULT_PORTIONS } from '../lib/recipeUtils';

type IngredientRow = {
    ingredientId: string;
    quantity: string;
};

const emptyRow: IngredientRow = { ingredientId: "", quantity: "" };

const emptyRecipe: Recipe = {
    recipeName: "",
    ingredient: [],
    prepTime: "",
    cookTime: "",
    instructions: "",
    image: "",
    status: "normal"
};

const CATEGORIES: Ingredient["category"][] = ["Protéine", "Légumes", "Féculent", "Boisson", "Autre"];

const NewMeal = () => {

    const RECIPES_KEY = "globalRecipeList";
    const nameRef = useRef<HTMLTextAreaElement | null>(null);

    const [formData, setFormData] = useState<Recipe>(emptyRecipe);
    const [rows, setRows] = useState<IngredientRow[]>([emptyRow]);

    const [recipeList, setRecipeList] = useState<Recipe[]>(() => {
        const saved = localStorage.getItem(RECIPES_KEY);
        return ((saved) ? JSON.parse(saved) : recipeInfo)
    });

    const [currentStock] = useState<Ingredient[]>(() => {
        const exist = localStorage.getItem("currentStockList");
        return ((exist) ? JSON.parse(exist) : defaultList);
    });

    const [modalState, setModalState] = useState<boolean>(false);
    const [askConfirmation, setAskConfirmation] = useState<boolean>(false);

    const handleOpenConfirmationModal = () => {setAskConfirmation(true)};
    const handleCloseConfirmationModal = () => {setAskConfirmation(false)};
    const handleOpenModal1 = () => {setModalState(true)};
    const handleCloseModal1 = () => {setModalState(false)};

    const handleChange = (e : React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name] : value
        }))
    }

    const handleRowChange = (index : number, field : keyof IngredientRow, value : string) => {
        setRows((prev) => prev.map((row, i) => (i === index) ? { ...row, [field] : value } : row));
    }

    const ajouterIngredient = () => {
        setRows((prev) => [...prev, emptyRow]);
    }

    const supprimerIngredient = (index : number) => {
        setRows((prev) => (prev.length > 1) ? prev.filter((_, i) => i !== index) : [emptyRow]);
    }

    const validIngredients = (): RecipeIngredient[] => {
        return rows
            .filter(row => row.ingredientId !== "" && Number(row.quantity.replace(",", ".")) > 0)
            .map(row => ({ ingredientId: row.ingredientId, quantity: Number(row.quantity.replace(",", ".")) }));
    }

    const previewIngredients = validIngredients();
    const previewMacros = formatMacros(calcRecipeMacros(previewIngredients, currentStock));
    const previewCost = calcRecipeCost(previewIngredients, currentStock);

    const resetForm = () => {
        setFormData(emptyRecipe);
        setRows([emptyRow]);
    }

    const ajouterRecette = () => {
        const alreadyExist = recipeList.some(element => element.recipeName === formData.recipeName.trim())

        if (alreadyExist) {
            toast.error(`${formData.recipeName} n'a pas pu être ajouté (Existe déjà)`)
            handleCloseConfirmationModal();
            return;
        }

        const ingredients = validIngredients();

        if (!formData.recipeName.trim() || ingredients.length === 0) {
            alert("Merci de remplir au moins le nom de la recette et un ingrédient (avec sa quantité).");
            handleCloseConfirmationModal();
            return;
        }
        if (askConfirmation) {
            const newRecipe : Recipe = {
                ...formData,
                recipeName: formData.recipeName.trim(),
                ingredient: ingredients
            };
            const updatedRecipeList = [...recipeList, newRecipe];
            setRecipeList(updatedRecipeList)
            resetForm();
            localStorage.setItem(RECIPES_KEY, JSON.stringify(updatedRecipeList))
            toast.success(`${newRecipe.recipeName} ajoutée !`);
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

                let parsedFileContent;
                try {
                    parsedFileContent = JSON.parse(fileContent);
                } catch {
                    toast.error(`${file.name} n'est pas un fichier JSON valide`)
                    return;
                }

                const currentRecipeName = parsedFileContent.recipeName?.trim()

                setRecipeList(prev => {
                    const alreadyExist = prev.some(element => element.recipeName === currentRecipeName);

                    if (!seen.has(currentRecipeName) && currentRecipeName && !alreadyExist) {
                        seen.add(currentRecipeName)
                        toast.success(`${currentRecipeName} à bien été ajouté`)
                        // status : uniquement "favorite" ou "normal" (certains anciens JSON avaient d'autres valeurs)
                        const updatedRecipeList = [...prev, { ...parsedFileContent, status: parsedFileContent.status === "favorite" ? "favorite" : "normal" }];
                        localStorage.setItem(RECIPES_KEY, JSON.stringify(updatedRecipeList))
                        return updatedRecipeList
                    }
                    return prev;
                })
                const alreadyExist = recipeList.some(element => element.recipeName === currentRecipeName);

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

            let parsedData : Recipe;
            try {
                parsedData = JSON.parse(content);
            } catch {
                toast.error("Ce fichier n'est pas un fichier JSON valide")
                return;
            }

            setFormData({ ...emptyRecipe, ...parsedData, status: parsedData.status === "favorite" ? "favorite" : "normal" })
            setRows((parsedData.ingredient && parsedData.ingredient.length > 0)
                ? parsedData.ingredient.map(ing => ({ ingredientId: String(ing.ingredientId), quantity: String(ing.quantity) }))
                : [emptyRow]
            )
        }
        reader.readAsText(importedFiles[0]);
        handleCloseModal1();
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
                      name="recipeName"
                      ref={nameRef}
                      value={formData.recipeName}
                      onChange={handleChange}
                      placeholder='Entrer le nom de la recette'
                    />

                    <label>Ingredients : </label>
                    {rows.map((row, index) => {
                        const selectedIngredient = findIngredient(currentStock, row.ingredientId);

                        return (
                            <div key={index} className="ingredientRow">
                                <select
                                    value={row.ingredientId}
                                    onChange={(e) => handleRowChange(index, "ingredientId", e.target.value)}
                                >
                                    <option value="">-- Choisir un ingrédient --</option>
                                    {CATEGORIES.map(category => (
                                        <optgroup key={category} label={category}>
                                            {currentStock
                                                .filter(ing => ing.category === category)
                                                .map(ing => (
                                                    <option
                                                        key={ing.id}
                                                        value={ing.id}
                                                        disabled={rows.some((r, i) => i !== index && r.ingredientId === ing.id)}
                                                    >
                                                        {ing.name}{ing.unit ? ` (${ing.unit})` : ""}
                                                    </option>
                                                ))
                                            }
                                        </optgroup>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={row.quantity}
                                    onChange={(e) => handleRowChange(index, "quantity", e.target.value)}
                                    placeholder='Quantité'
                                />
                                <span className="unitLabel">{selectedIngredient?.unit || ""}</span>
                                <X className="removeIngredient" onClick={() => supprimerIngredient(index)}></X>
                            </div>
                        )
                    })}
                    <div className="centerButton">
                        <button onClick={ajouterIngredient} className='Btn'>Ajouter un Ingredient</button>
                    </div>

                    <label>Macros (par portion, pour {DEFAULT_PORTIONS} portions) : </label>
                    <p className="previewValue">{previewMacros}</p>

                    <label>Coût : </label>
                    <p className="previewValue">{`${formatPrice(previewCost)} (${formatPrice(previewCost / DEFAULT_PORTIONS)} / portion)`}</p>

                    <label>Temps de préparation : </label>
                    <textarea
                      name="prepTime"
                      value={formData.prepTime}
                      onChange={handleChange}
                      placeholder='Entrer le temps de préparation'
                    />

                    <label>Temps de cuisson : </label>
                    <textarea
                      name="cookTime"
                      value={formData.cookTime}
                      onChange={handleChange}
                      placeholder='Entrer le temps de cuisson'
                    />

                    <label>Instructions : </label>
                    <textarea
                      name="instructions"
                      value={formData.instructions}
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

        {/* Modal d'ajout d'ingrédient */}

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

        {/* Modal d'ajout d'ingrédient */}

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
