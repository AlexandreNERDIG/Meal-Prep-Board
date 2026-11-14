import './CurrentStock.css';
import './NewMeal.css';
import { X } from 'react-feather';
import { Ingredient, defaultList } from './typeFile';
import { useEffect, useState } from 'react';
import { Search, Aperture, MinusCircle, PlusCircle, Upload, Edit2 } from "react-feather"
import toast from 'react-hot-toast';
import { toastUndo } from '../lib/undoToast';
import { priceUnitLabel, INGREDIENT_CATEGORIES, NO_IMAGE, formatMacros, categoryLabel, unitLabel } from '../lib/recipeUtils';
import { useT } from '../i18n/LanguageProvider';
import { fileToResizedDataUrl } from "../lib/imageUpload";
import { parseQuantityInput } from "../lib/quantity";

type IngredientForm = {
    name: string;
    calories: string;
    carbs: string;
    protein: string;
    fat: string;
    price: string;
    unit: Ingredient["unit"];
    category: Ingredient["category"];
    image: string;
    trackStock: boolean;
};

const emptyIngredientForm: IngredientForm = {
    name: "",
    calories: "",
    carbs: "",
    protein: "",
    fat: "",
    price: "",
    unit: "",
    category: "",
    image: "",
    trackStock: true
};

const UNITS = ["g", "mL", "unités"] as const;

type CategoryFilter = "Tout" | typeof INGREDIENT_CATEGORIES[number];

const toNumber = (value: string): number => {
    const parsed = Number(value.replace(",", "."));
    return (Number.isFinite(parsed) && parsed >= 0) ? parsed : 0;
};

// Case de quantité : on tape directement un nombre (ou +250 / -100 pour ajouter / retirer), validé avec Entrée ou en quittant la case
type QuantityInputProps = { value: number; unit: Ingredient["unit"]; hint: string; onCommit: (quantity: number) => void };

const QuantityInput = ({ value, unit, hint, onCommit }: QuantityInputProps) => {
    const [draft, setDraft] = useState<string>(String(value));

    // Les boutons - / + (ou une autre action) changent la valeur : la case suit
    useEffect(() => { setDraft(String(value)); }, [value]);

    const commit = () => {
        const parsed = parseQuantityInput(draft, value);
        if (parsed !== null && parsed !== value) onCommit(parsed);
        else setDraft(String(value));
    };

    return (
        <div className="quantityField">
            <input
                className="currentCountInput"
                type="text"
                inputMode="decimal"
                value={draft}
                title={hint}
                aria-label={hint}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commit}
                onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
            />
            <span className="currentUnit">{unitLabel(unit)}</span>
        </div>
    );
};

const CurrentStock = () => {

    const { t, tb } = useT();

    const [currentStock, setCurrentStock] = useState<Ingredient[]>(() => {
        const exist = localStorage.getItem("currentStockList");
        return ((exist) ? JSON.parse(exist) : defaultList);
    });

    const [searchValue, setSearchValue] = useState<string>("");
    const [selectedcategory, setSelectedcategory] = useState<CategoryFilter>("Tout");
    const [idCounter, setIdCounter] = useState(() => {
        const exist = localStorage.getItem("currentStockList");
        const list = exist ? JSON.parse(exist) : defaultList;
        const maxId = list.reduce((max: number, ing: Ingredient) => Math.max(max, parseInt(ing.id, 10)), 0);
        return maxId;
    });
    const [modalState, setModalState] = useState<Boolean>(false);
    const [editingId, setEditingId] = useState<string | null>(null);   // null = on ajoute un nouvel ingrédient, sinon on modifie celui-ci
    const [ingredientToDelete, setIngredientToDelete] = useState<Ingredient | null>(null);

    const handleSearchInput = (e : React.ChangeEvent<HTMLInputElement>) => {setSearchValue(e.target.value)};
    const handleOpenModal1 = () => {setModalState(true)};
    const handleCloseModal1 = () => {
        setFormData(emptyIngredientForm)
        setEditingId(null);
        setModalState(false);
    };

    const handleOpenEdit = (ingre : Ingredient) => {
        setFormData({
            name: ingre.name,
            calories: String(ingre.macro.calories),
            carbs: String(ingre.macro.carbs),
            protein: String(ingre.macro.protein),
            fat: String(ingre.macro.fat),
            price: String(ingre.price),
            unit: ingre.unit,
            category: ingre.category,
            image: ingre.image === "/img2/" ? "" : ingre.image,
            trackStock: ingre.trackStock !== false
        });
        setEditingId(ingre.id);
        setModalState(true);
    };

    const handleSetQuantity = (currentItem : Ingredient, quantity : number) => {
        const updatedList = currentStock.map(element => (element.id === currentItem.id) ? {...element, quantity} : element);
        setCurrentStock(updatedList);
        localStorage.setItem("currentStockList", JSON.stringify(updatedList));
    }
    const handleOpenModal2 = (ingre : Ingredient) => {setIngredientToDelete(ingre)};
    const handleCloseModal2 = () => {setIngredientToDelete(null)};
    const handleCancelDelete = () => {setIngredientToDelete(null)};

    const handleMinusQuantityChange = (currentItem : Ingredient, event: React.MouseEvent) => {
        if (!currentStock) return;

        if (currentItem.unit !== 'unités') {
            const multiplier = event.shiftKey ? 10 : 1
            let updatedList = currentStock.map(element => (element.id === currentItem.id) ? {...element, quantity : Math.max(0, element.quantity - (10 * multiplier))} : element)
            setCurrentStock(updatedList);
            localStorage.setItem("currentStockList", JSON.stringify(updatedList));
        }
        else {
            const multiplier = event.shiftKey ? 6 : 1
            let updatedList = currentStock.map(element => (element.id === currentItem.id) ? {...element, quantity : Math.max(0, element.quantity - (1 * multiplier))} : element)
            setCurrentStock(updatedList);
            localStorage.setItem("currentStockList", JSON.stringify(updatedList));
        }
    }

    const handlePlusQuantityChange = (currentItem : Ingredient, event : React.MouseEvent) => {
        if (!currentStock) return;

        if (currentItem.unit !== 'unités') {
            const multiplier = event.shiftKey ? 10 : 1
            let updatedList = currentStock.map(element => (element.id === currentItem.id) ? {...element, quantity : Math.max(0, element.quantity + (10 * multiplier))} : element)
            setCurrentStock(updatedList);
            localStorage.setItem("currentStockList", JSON.stringify(updatedList));
        }
        else {
            const multiplier = event.shiftKey ? 6 : 1
            let updatedList = currentStock.map(element => (element.id === currentItem.id) ? {...element, quantity : Math.max(0, element.quantity + (1 * multiplier))} : element)
            setCurrentStock(updatedList);
            localStorage.setItem("currentStockList", JSON.stringify(updatedList));
        }
    }


    const [formData, setFormData] = useState<IngredientForm>(emptyIngredientForm);

    const formHandler = (e : React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const isCheckbox = (e.target as HTMLInputElement).type === "checkbox";

        setFormData((prev) => ({
            ...prev,
            [name] : isCheckbox ? (e.target as HTMLInputElement).checked : value
        }))
    }

    const handleFormCategory = (category: Ingredient["category"]) => {
        setFormData((prev) => ({ ...prev, category }));
    };

    const handleFormUnit = (unit: Ingredient["unit"]) => {
        setFormData((prev) => ({ ...prev, unit }));
    };

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

    const triCurrentStockList = (currentStockArr : Ingredient[]) => {

        const protIngredient = currentStockArr.filter(element => element.category === "Protéine");
        const veggieIngredient = currentStockArr.filter(element => element.category === "Légumes");
        const feculentIngredient = currentStockArr.filter(element => element.category === "Féculent");
        const drinkIngredient = currentStockArr.filter(element => element.category === "Boisson");
        const otherIngredient = currentStockArr.filter(element => element.category === "Autre");

        return [
            protIngredient,
            veggieIngredient,
            feculentIngredient,
            drinkIngredient,
            otherIngredient
        ].flat();
    }

    const ajouterIngredient = () => {

        const price = toNumber(formData.price);

        if (
            !formData.name.trim() ||
            !formData.unit ||
            !formData.category ||
            price <= 0
        ) {
            toast.error(t("stock.errFields"));
            return;
        }

        const fields = {
            name: formData.name.trim(),
            macro: {
                calories: toNumber(formData.calories),
                carbs: toNumber(formData.carbs),
                protein: toNumber(formData.protein),
                fat: toNumber(formData.fat),
            },
            price: price,
            unit: formData.unit,
            category: formData.category,
            image: formData.image,
            trackStock: formData.trackStock
        };

        // Le nom doit rester unique (en modification, l'ingrédient ne se compare pas à lui-même)
        if (currentStock.some(ingre => ingre.id !== editingId && ingre.name.trim().toLowerCase() === fields.name.toLowerCase())) {
            toast.error(t("stock.errExists"));
            return;
        }

        if (editingId) {
            // Modification : l'id et la quantité ne changent pas (les recettes retrouvent l'ingrédient par son id)
            const edited = currentStock.map(ingre => ingre.id === editingId ? { ...ingre, ...fields } : ingre);
            const categoryChanged = currentStock.find(ingre => ingre.id === editingId)?.category !== fields.category;
            const updated = categoryChanged ? triCurrentStockList(edited) : edited;   // la carte ne bouge que si elle change de catégorie
            setCurrentStock(updated);
            localStorage.setItem("currentStockList", JSON.stringify(updated));
            toast.success(t("stock.updated"));
            handleCloseModal1();
            return;
        }

        const newIngredient : Ingredient = {
            id: `${idCounter + 1}`,
            quantity: 0,
            ...fields
        }

        setCurrentStock((prev) => {
            let updated = [...prev, newIngredient];
            updated = triCurrentStockList(updated)
            localStorage.setItem("currentStockList", JSON.stringify(updated));
            return updated;
        });
        toast.success(t("stock.added"));
        setIdCounter(idCounter + 1);
        handleCloseModal1()
    }

    const deleteIngredient = () => {
        if (!ingredientToDelete) return;

        const deleted = ingredientToDelete;
        const updatedList = currentStock.filter(e => e.id !== deleted.id);
        setCurrentStock(updatedList);
        localStorage.setItem("currentStockList", JSON.stringify(updatedList));
        toastUndo(t("stock.deleted", { name: deleted.name }), () => restoreIngredient(deleted));
        setIngredientToDelete(null);
        handleCloseModal2();
    };

    const restoreIngredient = (ingredient: Ingredient) => {
        const saved = localStorage.getItem("currentStockList");
        const current: Ingredient[] = saved ? JSON.parse(saved) : [];
        if (current.some(e => e.id === ingredient.id)) return;

        const restored = triCurrentStockList([...current, ingredient]);
        localStorage.setItem("currentStockList", JSON.stringify(restored));
        setCurrentStock(restored);
    }

    const macroBase = (formData.unit === "g" || formData.unit === "mL")
        ? t("stock.per100", { unit: formData.unit })
        : (formData.unit === "unités" ? t("stock.per1") : t("stock.pickUnit"));

    const visibleItems = currentStock.filter((item) => (selectedcategory === "Tout" || item.category === selectedcategory) && item.name.toLowerCase().includes(searchValue.toLowerCase()));

    const countFor = (category: CategoryFilter) => (category === "Tout") ? currentStock.length : currentStock.filter(item => item.category === category).length;

    const originalUnit = editingId ? currentStock.find(ingre => ingre.id === editingId)?.unit : undefined;

    const imageName = formData.image.startsWith("data:") ? t("image.custom") : (formData.image.split("/").pop() || "");

    return(
        <>
        <div className="globalCurrentStockSection">

            <div className='sectionHeader'><p>{t("page.stock")}</p></div>

            <div className="searchBarContainer">
                <div className="inputSection">
                    <div className="searchLogoContainer"><Aperture></Aperture></div>
                    <input type="text" className='searchInput' value={searchValue} onChange={handleSearchInput} placeholder={t("stock.search")}/>
                    <div className="searchIconContainer"><Search></Search></div>
                </div>
            </div>

            <div className="chipRow categoryFilter">
                {(["Tout", ...INGREDIENT_CATEGORIES] as CategoryFilter[]).map(category => (
                    <button
                        type="button"
                        key={category}
                        className={`chip ${selectedcategory === category ? "active" : ""}`}
                        onClick={() => setSelectedcategory(category)}
                    >
                        {category === "Tout" ? t("cat.Tout") : categoryLabel(category)}
                        <span className="chipCount">{countFor(category)}</span>
                    </button>
                ))}
            </div>

            <div className="currentStockGallery">
                {visibleItems.length === 0 && <p className="emptyStock">{t("stock.empty")}</p>}
                {visibleItems
                    .map((item) => (
                      <div key={item.id} className="stockItem">
                        <img
                            src={(item.image && item.image !== "/img2/") ? item.image : NO_IMAGE}
                            alt={item.name}
                            onError={(e) => { if (e.currentTarget.src !== NO_IMAGE) e.currentTarget.src = NO_IMAGE; }}
                        />
                        <div className="subTextDiv">
                            <X className='deleteBtn' onClick={() => handleOpenModal2(item)}></X>
                            <Edit2 className='editBtn' aria-label={t("stock.edit")} onClick={() => handleOpenEdit(item)}></Edit2>
                            <h2>{item.name}</h2>
                            <h4>{formatMacros(item.macro)}</h4>
                            <p>{`${item.price} ${priceUnitLabel(item.unit)}`}</p>
                            <p><strong>Id : {item.id}</strong></p>
                            <div className="centeredCountDiv">
                                <div className="countDiv">
                                    <MinusCircle onClick={(e) => handleMinusQuantityChange(item, e)}></MinusCircle>
                                    <QuantityInput value={item.quantity} unit={item.unit} hint={t("stock.qtyHint")} onCommit={(quantity) => handleSetQuantity(item, quantity)} />
                                    <PlusCircle onClick={(e) => handlePlusQuantityChange(item, e)}></PlusCircle>
                                </div>
                            </div>
                        </div>
                      </div>
                    ))
                }
                <div className="addItem">
                    <PlusCircle onClick={handleOpenModal1}></PlusCircle>
                </div>
            </div>

            {/* Modal d'ajout / de modification d'ingrédient */}

           {modalState && (
                <div className="modalOverlay" onClick={handleCloseModal1}>
                    <div className="deleteModalContent2" onClick={(e) => e.stopPropagation()}>
                        <div className="head">
                            <h3>{editingId ? t("stock.editTitle") : t("stock.formTitle")}</h3>
                            <div><X className='logo' onClick={handleCloseModal1}></X></div>
                        </div>

                        <div className="ingredientForm">
                            <div className="formField">
                                <label htmlFor="ingredientName">{t("stock.name")}</label>
                                <input
                                    id="ingredientName"
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={formHandler}
                                    placeholder={t("stock.namePlaceholder")}
                                />
                            </div>

                            <div className="formField">
                                <span className="fieldTitle">{t("stock.category")}</span>
                                <div className="chipRow chipRowLeft">
                                    {INGREDIENT_CATEGORIES.map(category => (
                                        <button
                                            type="button"
                                            key={category}
                                            className={`chip ${formData.category === category ? "active" : ""}`}
                                            onClick={() => handleFormCategory(category)}
                                        >
                                            {categoryLabel(category)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="formField">
                                <span className="fieldTitle">{t("stock.unit")}</span>
                                <div className="chipRow chipRowLeft">
                                    {UNITS.map(unit => (
                                        <button
                                            type="button"
                                            key={unit}
                                            className={`chip ${formData.unit === unit ? "active" : ""}`}
                                            onClick={() => handleFormUnit(unit)}
                                        >
                                            {unitLabel(unit)}
                                        </button>
                                    ))}
                                </div>
                                {editingId && originalUnit && formData.unit !== originalUnit && <small>{t("stock.unitChangeHint")}</small>}
                            </div>

                            <div className="formField">
                                <label htmlFor="ingredientPrice">{t("stock.price")}</label>
                                <div className="inputWithSuffix">
                                    <input
                                        id="ingredientPrice"
                                        type="text"
                                        inputMode="decimal"
                                        name="price"
                                        value={formData.price}
                                        onChange={formHandler}
                                        placeholder={t("stock.pricePlaceholder")}
                                    />
                                    <span>{priceUnitLabel(formData.unit)}</span>
                                </div>
                            </div>

                            <div className="formField">
                                <span className="fieldTitle">{t("stock.nutrition")} <small>{macroBase}</small></span>
                                <div className="macroInputs">
                                    {([
                                        { name: "calories", label: t("stock.calories"), suffix: "kcal" },
                                        { name: "carbs", label: t("macro.carbs"), suffix: "g" },
                                        { name: "protein", label: t("macro.protein"), suffix: "g" },
                                        { name: "fat", label: t("macro.fat"), suffix: "g" },
                                    ] as const).map(field => (
                                        <div className="macroInput" key={field.name}>
                                            <label htmlFor={`ingredient-${field.name}`}>{field.label}</label>
                                            <div className="inputWithSuffix">
                                                <input
                                                    id={`ingredient-${field.name}`}
                                                    type="text"
                                                    inputMode="decimal"
                                                    name={field.name}
                                                    value={formData[field.name]}
                                                    onChange={formHandler}
                                                    placeholder="0"
                                                />
                                                <span>{field.suffix}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <label className="checkField">
                                <input type="checkbox" name="trackStock" checked={formData.trackStock} onChange={formHandler}/>
                                <span>
                                    {t("stock.track")}
                                    <small>{t("stock.trackHint")}</small>
                                </span>
                            </label>

                            <div className="formField">
                                <span className="fieldTitle">{t("stock.image")}</span>
                                <div className="fileRow">
                                    <label className="fileBtn">
                                        <Upload size={16}/> {t("image.choose")}
                                        <input type="file" accept="image/*" onChange={handleImagePath}/>
                                    </label>
                                    <span className="fileName">{imageName || t("common.noImage")}</span>
                                </div>
                            </div>
                        </div>

                        <div className="deleteModalActions">
                            <button className="confirmDeleteBtn" onClick={ajouterIngredient}>{editingId ? t("stock.saveButton") : t("stock.addButton")}</button>
                            <button className="cancelDeleteBtn" onClick={handleCloseModal1}>{t("common.cancel")}</button>
                        </div>
                    </div>
                </div>
            )} 

            {/* Modal de confirmation de suppression d'un ingrédient */}

            {ingredientToDelete && (
                <div className="modalOverlay" onClick={handleCloseModal2}>
                    <div className="deleteModalContent1" onClick={(e) => e.stopPropagation()}>
                        <div className="head1">
                            <h3>{t("modal.confirmDelete")}</h3>
                            <div><X className='logo' onClick={handleCancelDelete}></X></div>
                        </div>
                      <p>{tb("modal.sure", { name: ingredientToDelete?.name ?? "" })}</p>
                      <div className="deleteModalActions">
                        <button className="confirmDeleteBtn" onClick={deleteIngredient}>{t("common.confirm")}</button>
                        <button className="cancelDeleteBtn" onClick={handleCloseModal2}>{t("common.cancel")}</button>
                      </div>
                    </div>
                </div>
            )}
        </div>
        </>
    )
}

export default CurrentStock;