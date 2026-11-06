import { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon } from 'react-feather';
import toast from 'react-hot-toast';
import './NewMeal.css';
import { Recipe, Ingredient, RecipeIngredient, defaultList } from './typeFile';
import { calcRecipeMacros, calcRecipeCost, formatMacros, formatPrice, formatDuration, findIngredient, normalizeRecipe, loadRecipes, INGREDIENT_CATEGORIES, DEFAULT_PORTIONS } from '../lib/recipeUtils';

type IngredientRow = {
    ingredientId: string;
    quantity: string;
};

const emptyRow: IngredientRow = { ingredientId: "", quantity: "" };

const emptyRecipe: Recipe = {
    recipeName: "",
    ingredient: [],
    prepTime: 0,
    cookTime: 0,
    instructions: "",
    image: "",
    status: "normal"
};

// Un JSON de recette valide a au minimum un nom et une liste d'ingrédients
const isRecipeLike = (value: unknown): value is Record<string, unknown> => {
    if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
    const candidate = value as Record<string, unknown>;
    return typeof candidate.recipeName === "string" && Array.isArray(candidate.ingredient);
};

const NewMeal = () => {

    const RECIPES_KEY = "globalRecipeList";
    const nameRef = useRef<HTMLTextAreaElement | null>(null);

    const [formData, setFormData] = useState<Recipe>(emptyRecipe);
    const [rows, setRows] = useState<IngredientRow[]>([emptyRow]);

    const [recipeList, setRecipeList] = useState<Recipe[]>(loadRecipes);

    const [currentStock] = useState<Ingredient[]>(() => {
        const exist = localStorage.getItem("currentStockList");
        return ((exist) ? JSON.parse(exist) : defaultList);
    });

    const [askConfirmation, setAskConfirmation] = useState<boolean>(false);

    const handleOpenConfirmationModal = () => {setAskConfirmation(true)};
    const handleCloseConfirmationModal = () => {setAskConfirmation(false)};

    const handleChange = (e : React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name] : value
        }))
    }

    // Les temps sont des nombres de minutes : on ne garde que les chiffres (impossible d'oublier "min")
    const handleTimeChange = (field : "prepTime" | "cookTime", value : string) => {
        const minutes = Math.max(0, parseInt(value, 10) || 0);

        setFormData((prev) => ({
            ...prev,
            [field] : minutes
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

    // Import de fichiers JSON :
    //  - 1 fichier  : la recette est chargée dans le formulaire (on peut la relire / la modifier avant de l'ajouter)
    //  - plusieurs  : elles sont ajoutées directement à la liste
    // Les anciens JSON (temps en texte, status "mealprep"...) sont remis au bon format par normalizeRecipe.
    const handleJsonImport = async (e : React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        e.target.value = "";  // permet de réimporter le même fichier juste après
        if (files.length === 0) return;

        const contents = await Promise.all(files.map(async file => ({ name: file.name, text: await file.text() })));

        const parseRecipe = (name : string, text : string): Recipe | null => {
            let parsed : unknown;
            try {
                parsed = JSON.parse(text);
            } catch {
                toast.error(`${name} n'est pas un fichier JSON valide`)
                return null;
            }

            if (!isRecipeLike(parsed)) {
                toast.error(`${name} n'a pas le format d'une recette`)
                return null;
            }

            return normalizeRecipe(parsed);
        }

        if (contents.length === 1) {
            const recipe = parseRecipe(contents[0].name, contents[0].text);
            if (!recipe) return;

            setFormData({ ...emptyRecipe, ...recipe })
            setRows(recipe.ingredient.length > 0
                ? recipe.ingredient.map(ing => ({ ingredientId: String(ing.ingredientId), quantity: String(ing.quantity) }))
                : [emptyRow]
            )
            toast.success(`${recipe.recipeName} chargée dans le formulaire`)
            return;
        }

        const updatedRecipeList = [...recipeList];

        for (const { name, text } of contents) {
            const recipe = parseRecipe(name, text);
            if (!recipe) continue;

            const currentRecipeName = recipe.recipeName.trim();

            if (!currentRecipeName || updatedRecipeList.some(element => element.recipeName === currentRecipeName)) {
                toast.error(`${currentRecipeName || name} n'a pas pu être ajouté (Existe déjà)`)
                continue;
            }

            updatedRecipeList.push({ ...recipe, recipeName: currentRecipeName });
            toast.success(`${currentRecipeName} à bien été ajouté`)
        }

        if (updatedRecipeList.length !== recipeList.length) {
            setRecipeList(updatedRecipeList);
            localStorage.setItem(RECIPES_KEY, JSON.stringify(updatedRecipeList))
        }
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
    const imageName = formData.image.split("/").pop() || "";

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
                                    {INGREDIENT_CATEGORIES.map(category => (
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
                    <div className="timeRow">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={formData.prepTime || ""}
                          onChange={(e) => handleTimeChange("prepTime", e.target.value)}
                          placeholder='20'
                        />
                        <span className="unitLabel">min</span>
                        {formData.prepTime >= 60 && <span className="timeHint">{`= ${formatDuration(formData.prepTime)}`}</span>}
                    </div>

                    <label>Temps de cuisson : </label>
                    <div className="timeRow">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={formData.cookTime || ""}
                          onChange={(e) => handleTimeChange("cookTime", e.target.value)}
                          placeholder='30'
                        />
                        <span className="unitLabel">min</span>
                        {formData.cookTime >= 60 && <span className="timeHint">{`= ${formatDuration(formData.cookTime)}`}</span>}
                    </div>

                    <label>Instructions : </label>
                    <textarea
                      name="instructions"
                      value={formData.instructions}
                      onChange={handleChange}
                      placeholder='Entrer les instructions'
                    />

                    <label>Image : </label>
                    <div className="fileRow">
                        <label className="fileBtn">
                            <ImageIcon size={16}/> Choisir une image
                            <input type="file" accept="image/*" onChange={handleImagePath}/>
                        </label>
                        <span className="fileName">{imageName || "Aucune image"}</span>
                    </div>
                </div>
                <div className="imageInput">
                    <img src={formData.image || placeholder} alt="Recette"/>
                </div>
            </div>
                <div className="centerButton2">
                    <button onClick={handleOpenConfirmationModal} className='Btn2'>Ajouter la Recette à la Liste</button>
                    <label className="fileBtn importBtn">
                        <Upload size={16}/> Importer des recettes (.json)
                        <input type="file" accept=".json,application/json" multiple onChange={handleJsonImport}/>
                    </label>
                </div>
        </div>

        {/* Modal de confirmation d'ajout de la recette */}

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
