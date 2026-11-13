import { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { X, Upload, Image as ImageIcon } from 'react-feather';
import toast from 'react-hot-toast';
import './NewMeal.css';
import { Recipe, Ingredient, RecipeIngredient, defaultList } from './typeFile';
import { calcRecipeMacros, calcRecipeCost, formatMacros, formatPrice, formatDuration, findIngredient, normalizeRecipe, loadRecipes, INGREDIENT_CATEGORIES, DEFAULT_PORTIONS, NO_IMAGE, categoryLabel, unitLabel } from '../lib/recipeUtils';
import { useT } from '../i18n/LanguageProvider';
import { fileToResizedDataUrl } from "../lib/imageUpload";

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

const isRecipeLike = (value: unknown): value is Record<string, unknown> => {
    if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
    const candidate = value as Record<string, unknown>;
    return typeof candidate.recipeName === "string" && Array.isArray(candidate.ingredient);
};

type PendingImport = { fresh: Recipe[]; duplicates: Recipe[] };

const toRows = (recipe: Recipe): IngredientRow[] => recipe.ingredient.length > 0
    ? recipe.ingredient.map(ing => ({ ingredientId: String(ing.ingredientId), quantity: String(ing.quantity) }))
    : [emptyRow];

const NewMeal = () => {

    const { t, tb } = useT();
    const RECIPES_KEY = "globalRecipeList";
    const nameRef = useRef<HTMLTextAreaElement | null>(null);

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
            alert(t("new.alertRequired"));
            handleCloseConfirmationModal();
            return;
        }

        // En mode édition, la recette a le droit de garder son propre nom
        const alreadyExist = recipeList.some(element => element.recipeName === formData.recipeName.trim() && element.recipeName !== editingName)

        if (alreadyExist) {
            toast.error(t("new.errExists", { name: formData.recipeName }))
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
                toast.success(t("new.updated", { name: newRecipe.recipeName }));
                handleCloseConfirmationModal();
                navigate("/RecipeList");
                return;
            }

            const updatedRecipeList = [...recipeList, newRecipe];
            setRecipeList(updatedRecipeList)
            resetForm();
            localStorage.setItem(RECIPES_KEY, JSON.stringify(updatedRecipeList))
            toast.success(t("new.added", { name: newRecipe.recipeName }));
            nameRef.current?.focus();
            handleCloseConfirmationModal();
        }
    }

    // Import de fichiers JSON :
    //  - 1 fichier  : la recette est chargée dans le formulaire (on peut la relire / la modifier avant de l'ajouter)
    //  - plusieurs  : elles sont ajoutées directement à la liste
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
                toast.error(t("new.errJson", { name }))
                return null;
            }

            if (!isRecipeLike(parsed)) {
                toast.error(t("new.errFormat", { name }))
                return null;
            }

            return normalizeRecipe(parsed);
        }

        if (contents.length === 1) {
            const recipe = parseRecipe(contents[0].name, contents[0].text);
            if (!recipe) return;

            setFormData({ ...emptyRecipe, ...recipe })
            setRows(toRows(recipe))
            toast.success(t("new.loaded", { name: recipe.recipeName }))
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
                toast.error(t("new.errNoName", { name }))
                continue;
            }
            // Même recette présente deux fois dans la sélection : on ne garde que la première
            if (fresh.some(element => element.recipeName === currentRecipeName) || duplicates.some(element => element.recipeName === currentRecipeName)) continue;

            (existingNames.has(currentRecipeName) ? duplicates : fresh).push({ ...recipe, recipeName: currentRecipeName });
        }

        if (duplicates.length > 0) {
            setPendingImport({ fresh, duplicates }); 
            return;
        }

        applyImport(fresh, [], false);
    }

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

        if (fresh.length > 0) toast.success(t("new.imp.added", { count: fresh.length }))
        if (replace && duplicates.length > 0) toast.success(t("new.imp.replaced", { count: duplicates.length }))
        if (!replace && duplicates.length > 0) toast(t("new.imp.kept", { count: duplicates.length }))

        setPendingImport(null);
    }

    const handleImagePath = async (e : React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            toast.error(t("image.errLoad"))
            return;
        }

        try {
            const image = await fileToResizedDataUrl(file);
            setFormData((prev) => ({
                ...prev,
                image
            }))
            toast.success(t("image.okLoad"))
        } catch {
            toast.error(t("image.errLoad"))
        }
    }

    const placeholder = NO_IMAGE;
    const imageName = formData.image.startsWith("data:") ? t("image.custom") : (formData.image.split("/").pop() || "");

    return(
        <>
        <div className="globalNewMealSection">

            <div className='sectionHeader'><p>{editingName ? t("page.editMeal") : t("page.newMeal")}</p></div>

            <div className="Inputs">
                <div className="textInput">
                    <label>{t("new.name")} </label>
                    <textarea
                      name="recipeName"
                      ref={nameRef}
                      value={formData.recipeName}
                      onChange={handleChange}
                      placeholder={t("new.namePlaceholder")}
                    />

                    <label>{t("new.ingredients")} </label>
                    {rows.map((row, index) => {
                        const selectedIngredient = findIngredient(currentStock, row.ingredientId);

                        return (
                            <div key={index} className="ingredientRow">
                                <select
                                    value={row.ingredientId}
                                    onChange={(e) => handleRowChange(index, "ingredientId", e.target.value)}
                                >
                                    <option value="">{t("new.chooseIngredient")}</option>
                                    {INGREDIENT_CATEGORIES.map(category => (
                                        <optgroup key={category} label={categoryLabel(category)}>
                                            {currentStock
                                                .filter(ing => ing.category === category)
                                                .map(ing => (
                                                    <option
                                                        key={ing.id}
                                                        value={ing.id}
                                                        disabled={rows.some((r, i) => i !== index && r.ingredientId === ing.id)}
                                                    >
                                                        {ing.name}{ing.unit ? ` (${unitLabel(ing.unit)})` : ""}
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
                                    placeholder={t("new.quantity")}
                                />
                                <span className="unitLabel">{selectedIngredient ? unitLabel(selectedIngredient.unit) : ""}</span>
                                <X className="removeIngredient" onClick={() => supprimerIngredient(index)}></X>
                            </div>
                        )
                    })}
                    <div className="centerButton">
                        <button onClick={ajouterIngredient} className='Btn'>{t("new.addIngredient")}</button>
                    </div>

                    <label>{t("new.macrosLabel", { n: DEFAULT_PORTIONS })} </label>
                    <p className="previewValue">{previewMacros}</p>

                    <label>{t("new.costLabel")} </label>
                    <p className="previewValue">{`${formatPrice(previewCost)} (${formatPrice(previewCost / DEFAULT_PORTIONS)} ${t("price.perServing")})`}</p>

                    <label>{t("new.prepLabel")} </label>
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

                    <label>{t("new.cookLabel")} </label>
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

                    <label>{t("new.instructions")} </label>
                    <textarea
                      name="instructions"
                      value={formData.instructions}
                      onChange={handleChange}
                      placeholder={t("new.instructionsPlaceholder")}
                    />

                    <label>{t("new.image")} </label>
                    <div className="fileRow">
                        <label className="fileBtn">
                            <ImageIcon size={16}/> {t("image.choose")}
                            <input type="file" accept="image/*" onChange={handleImagePath}/>
                        </label>
                        <span className="fileName">{imageName || t("common.noImage")}</span>
                    </div>
                </div>
                <div className="imageInput">
                    <img src={formData.image || placeholder} alt={t("new.imageAlt")}/>
                </div>
            </div>
                <div className="centerButton2">
                    <button onClick={handleOpenConfirmationModal} className='Btn2'>{editingName ? t("new.save") : t("new.add")}</button>
                    {editingName
                        ? <button onClick={() => navigate("/RecipeList")} className='Btn2'>{t("common.cancel")}</button>
                        : (
                            <label className="fileBtn importBtn">
                                <Upload size={16}/> {t("new.import")}
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
                                <h3>{editingName ? t("new.confirmEdit") : t("new.confirmAdd")}</h3>
                                <div><X className='logo' onClick={handleCloseConfirmationModal}></X></div>
                            </div>
                          <p>{tb("new.confirmBody", { page: t("page.recipes") })}</p>
                          <div className="deleteModalActions">
                            <button className="confirmDeleteBtn" onClick={ajouterRecette}>{t("common.confirm")}</button>
                            <button className="cancelDeleteBtn" onClick={handleCloseConfirmationModal}>{t("common.cancel")}</button>
                          </div>
                        </div>
                    </div>
        )}

        {/* Modal : certaines recettes importées existent déjà */}

        {pendingImport && (
            <div className="modalOverlay" onClick={() => setPendingImport(null)}>
                <div className="deleteModalContent" onClick={(e) => e.stopPropagation()}>
                    <div className="head">
                        <h3>{t("new.dup.title", { count: pendingImport.duplicates.length })}</h3>
                        <div><X className='logo' onClick={() => setPendingImport(null)}></X></div>
                    </div>
                    <p>
                        {pendingImport.duplicates.slice(0, 5).map(element => element.recipeName).join(", ")}
                        {pendingImport.duplicates.length > 5 ? t("new.dup.more", { count: pendingImport.duplicates.length - 5 }) : ""}
                    </p>
                    <p>{t("new.dup.question")}</p>
                    <div className="deleteModalActions">
                        <button className="confirmDeleteBtn" onClick={() => applyImport(pendingImport.fresh, pendingImport.duplicates, true)}>{t("new.dup.replace")}</button>
                        <button className="cancelDeleteBtn" onClick={() => applyImport(pendingImport.fresh, pendingImport.duplicates, false)}>{t("new.dup.keep")}</button>
                    </div>
                </div>
            </div>
        )}
        </>
    )
}

export default NewMeal;
