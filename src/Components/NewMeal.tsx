import { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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

// Import de plusieurs fichiers : recettes nouvelles + recettes dont le nom existe déjà (on demande quoi en faire)
type PendingImport = { fresh: Recipe[]; duplicates: Recipe[] };

const toRows = (recipe: Recipe): IngredientRow[] => recipe.ingredient.length > 0
    ? recipe.ingredient.map(ing => ({ ingredientId: String(ing.ingredientId), quantity: String(ing.quantity) }))
    : [emptyRow];

const NewMeal = () => {

    const RECIPES_KEY = "globalRecipeList";
    const nameRef = useRef<HTMLTextAreaElement | null>(null);

    // Mode édition : on arrive depuis "Recipe List" avec le nom de la recette à modifier
    const navigate = useNavigate();
    const location = useLocation();
    const requestedEditName = (location.state as { editName?: string } | null)?.editName ?? null;
    const [recipeToEdit] = useState<Recipe | undefined>(() => requestedEditName ? loadRecipes().find(element => element.recipeName === requestedEditName) : undefined);
    const editingName = recipeToEdit ? recipeToEdit.recipeName : null;

    const [formData, setFormData] = useState<Recipe>(recipeToEdit ?? emptyRecipe);
    const [rows, setRows] = useState<IngredientRow[]>(recipeToEdit ? toRows(recipeToEdit) : [emptyRow]);
    const [pendingImport, setPendingImport] = useState<PendingImport | null>(null);

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
        const ingredients = validIngredients();

        if (!formData.recipeName.trim() || ingredients.length === 0) {
            alert("Merci de remplir au moins le nom de la recette et un ingrédient (avec sa quantité).");
            handleCloseConfirmationModal();
            return;
        }

        // En mode édition, la recette a le droit de garder son propre nom
        const alreadyExist = recipeList.some(element => element.recipeName === formData.recipeName.trim() && element.recipeName !== editingName)

        if (alreadyExist) {
            toast.error(`${formData.recipeName} n'a pas pu être enregistré (Existe déjà)`)
            handleCloseConfirmationModal();
            return;
        }

        if (askConfirmation) {
            const newRecipe : Recipe = {
                ...formData,
                recipeName: formData.recipeName.trim(),
                ingredient: ingredients
            };

            if (editingName) {
                const updatedRecipeList = recipeList.map(element => element.recipeName === editingName ? newRecipe : element);
                localStorage.setItem(RECIPES_KEY, JSON.stringify(updatedRecipeList))
                toast.success(`${newRecipe.recipeName} modifiée !`);
                handleCloseConfirmationModal();
                navigate("/RecipeList");
                return;
            }

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
            setRows(toRows(recipe))
            toast.success(`${recipe.recipeName} chargée dans le formulaire`)
            return;
        }

        const fresh : Recipe[] = [];
        const duplicates : Recipe[] = [];
        const existingNames = new Set(recipeList.map(element => element.recipeName));

        for (const { name, text } of contents) {
            const recipe = parseRecipe(name, text);
            if (!recipe) continue;

            const currentRecipeName = recipe.recipeName.trim();

            if (!currentRecipeName) {
                toast.error(`${name} n'a pas de nom de recette`)
                continue;
            }
            // Même recette présente deux fois dans la sélection : on ne garde que la première
            if (fresh.some(element => element.recipeName === currentRecipeName) || duplicates.some(element => element.recipeName === currentRecipeName)) continue;

            (existingNames.has(currentRecipeName) ? duplicates : fresh).push({ ...recipe, recipeName: currentRecipeName });
        }

        if (duplicates.length > 0) {
            setPendingImport({ fresh, duplicates });   // on demande : remplacer ou garder les existantes ?
            return;
        }

        applyImport(fresh, [], false);
    }

    // fresh : recettes nouvelles ; duplicates : recettes importées dont le nom existe déjà ; replace : écraser les existantes ou les garder
    const applyImport = (fresh : Recipe[], duplicates : Recipe[], replace : boolean) => {
        const replacements = new Map(duplicates.map(element => [element.recipeName, element]));
        const updatedRecipeList = [
            ...recipeList.map(element => (replace && replacements.has(element.recipeName)) ? replacements.get(element.recipeName)! : element),
            ...fresh
        ];

        if (fresh.length > 0 || replace) {
            setRecipeList(updatedRecipeList);
            localStorage.setItem(RECIPES_KEY, JSON.stringify(updatedRecipeList))
        }

        if (fresh.length > 0) toast.success(`${fresh.length} recette${fresh.length > 1 ? "s" : ""} ajoutée${fresh.length > 1 ? "s" : ""}`)
        if (replace && duplicates.length > 0) toast.success(`${duplicates.length} recette${duplicates.length > 1 ? "s" : ""} remplacée${duplicates.length > 1 ? "s" : ""}`)
        if (!replace && duplicates.length > 0) toast(`${duplicates.length} recette${duplicates.length > 1 ? "s" : ""} déjà présente${duplicates.length > 1 ? "s" : ""} : conservée${duplicates.length > 1 ? "s" : ""} telle${duplicates.length > 1 ? "s" : ""} quelle${duplicates.length > 1 ? "s" : ""}`)

        setPendingImport(null);
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

            <div className='sectionHeader'><p>{editingName ? "Edit Meal" : "New Meal"}</p></div>

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
                    <button onClick={handleOpenConfirmationModal} className='Btn2'>{editingName ? "Enregistrer les modifications" : "Ajouter la Recette à la Liste"}</button>
                    {editingName
                        ? <button onClick={() => navigate("/RecipeList")} className='Btn2'>Annuler</button>
                        : (
                            <label className="fileBtn importBtn">
                                <Upload size={16}/> Importer des recettes (.json)
                                <input type="file" accept=".json,application/json" multiple onChange={handleJsonImport}/>
                            </label>
                        )}
                </div>
        </div>

        {/* Modal de confirmation d'ajout de la recette */}

        {askConfirmation && (
                    <div className="modalOverlay" onClick={handleCloseConfirmationModal}>
                        <div className="deleteModalContent" onClick={(e) => e.stopPropagation()}>
                            <div className="head">
                                <h3>{editingName ? "Enregistrer les modifications ?" : "Etes-vous sûre de vouloir ajouté la recette ?"}</h3>
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

        {/* Modal : certaines recettes importées existent déjà */}

        {pendingImport && (
            <div className="modalOverlay" onClick={() => setPendingImport(null)}>
                <div className="deleteModalContent" onClick={(e) => e.stopPropagation()}>
                    <div className="head">
                        <h3>{pendingImport.duplicates.length} recette{pendingImport.duplicates.length > 1 ? "s existent" : " existe"} déjà</h3>
                        <div><X className='logo' onClick={() => setPendingImport(null)}></X></div>
                    </div>
                    <p>
                        {pendingImport.duplicates.slice(0, 5).map(element => element.recipeName).join(", ")}
                        {pendingImport.duplicates.length > 5 ? ` et ${pendingImport.duplicates.length - 5} autre${pendingImport.duplicates.length - 5 > 1 ? "s" : ""}` : ""}
                    </p>
                    <p>Remplacer par la version du fichier, ou garder les tiennes ?</p>
                    <div className="deleteModalActions">
                        <button className="confirmDeleteBtn" onClick={() => applyImport(pendingImport.fresh, pendingImport.duplicates, true)}>Remplacer</button>
                        <button className="cancelDeleteBtn" onClick={() => applyImport(pendingImport.fresh, pendingImport.duplicates, false)}>Garder les miennes</button>
                    </div>
                </div>
            </div>
        )}
        </>
    )
}

export default NewMeal;
