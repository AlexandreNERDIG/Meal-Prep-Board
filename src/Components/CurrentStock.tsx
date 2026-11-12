import './CurrentStock.css';
import './NewMeal.css';
import { X } from 'react-feather';
import { Ingredient, defaultList } from './typeFile';
import { useState } from 'react';
import { Search, Aperture, MinusCircle, PlusCircle, Upload } from "react-feather"
import toast from 'react-hot-toast';
import { toastUndo } from '../lib/undoToast';
import { priceUnitLabel, INGREDIENT_CATEGORIES, NO_IMAGE } from '../lib/recipeUtils';

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

const CurrentStock = () => {

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
    const [ingredientToDelete, setIngredientToDelete] = useState<Ingredient | null>(null);

    const handleSearchInput = (e : React.ChangeEvent<HTMLInputElement>) => {setSearchValue(e.target.value)};
    const handleOpenModal1 = () => {setModalState(true)};
    const handleCloseModal1 = () => {
        setFormData(emptyIngredientForm)
        setModalState(false);
    };
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

    const handleImagePath = (e : React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            toast.error("L'image n'a pas pu être chargée")
            return;
        }

        const filename = file.name;

        setFormData((prev) => ({
            ...prev,
            image : `/img2/${filename}`
        }))
        toast.success("L'image a bien été chargée")
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
            toast.error("Veuillez remplir tous les champs obligatoires correctement");
            return;
        }

        const newIngredient : Ingredient = {
            id: `${idCounter + 1}`,
            name: formData.name.trim(),
            macro: {
                calories: toNumber(formData.calories),
                carbs: toNumber(formData.carbs),
                protein: toNumber(formData.protein),
                fat: toNumber(formData.fat),
            },
            price: price,
            quantity: 0,
            unit: formData.unit,
            category: formData.category,
            image: formData.image,
            trackStock: formData.trackStock
        }

        if (currentStock.some(ingre => ingre.name.trim().toLowerCase() === newIngredient.name.trim().toLowerCase())) {
            toast.error("Cet ingrédient existe déjà dans le stock");
            return;
        }


        setCurrentStock((prev) => {
            let updated = [...prev, newIngredient];
            updated = triCurrentStockList(updated)
            localStorage.setItem("currentStockList", JSON.stringify(updated));
            return updated;
        });
        toast.success("L'ingrédient a bien été ajouté");
        setIdCounter(idCounter + 1);
        handleCloseModal1()
    }

    const deleteIngredient = () => {
        if (!ingredientToDelete) return;

        const deleted = ingredientToDelete;
        const updatedList = currentStock.filter(e => e.id !== deleted.id);
        setCurrentStock(updatedList);
        localStorage.setItem("currentStockList", JSON.stringify(updatedList));
        toastUndo(`${deleted.name} a bien été supprimé`, () => restoreIngredient(deleted));
        setIngredientToDelete(null);
        handleCloseModal2();
    };

    // Annuler la suppression : l'ingrédient (avec sa quantité) revient dans le stock, à sa place triée
    const restoreIngredient = (ingredient: Ingredient) => {
        const saved = localStorage.getItem("currentStockList");
        const current: Ingredient[] = saved ? JSON.parse(saved) : [];
        if (current.some(e => e.id === ingredient.id)) return;

        const restored = triCurrentStockList([...current, ingredient]);
        localStorage.setItem("currentStockList", JSON.stringify(restored));
        setCurrentStock(restored);
    }

    const macroBase = (formData.unit === "g" || formData.unit === "mL")
        ? `pour 100 ${formData.unit}`
        : (formData.unit === "unités" ? "pour 1 unité" : "choisis d'abord l'unité");

    const visibleItems = currentStock.filter((item) => (selectedcategory === "Tout" || item.category === selectedcategory) && item.name.toLowerCase().includes(searchValue.toLowerCase()));

    const countFor = (category: CategoryFilter) => (category === "Tout") ? currentStock.length : currentStock.filter(item => item.category === category).length;

    const imageName = formData.image.split("/").pop() || "";

    return(
        <>
        <div className="globalCurrentStockSection">

            <div className='sectionHeader'><p>Current Stock</p></div>

            <div className="searchBarContainer">
                <div className="inputSection">
                    <div className="searchLogoContainer"><Aperture></Aperture></div>
                    <input type="text" className='searchInput' value={searchValue} onChange={handleSearchInput} placeholder='Vous cherchez un aliment en particulier ?'/>
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
                        {category}
                        <span className="chipCount">{countFor(category)}</span>
                    </button>
                ))}
            </div>

            <div className="currentStockGallery">
                {visibleItems.length === 0 && <p className="emptyStock">Aucun ingrédient trouvé.</p>}
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
                            <h2>{item.name}</h2>
                            <h4>{`${item.macro.calories} Calories | ${item.macro.carbs} g C | ${item.macro.protein} g P | ${item.macro.fat} g F`}</h4>
                            <p>{`${item.price} ${priceUnitLabel(item.unit)}`}</p>
                            <p><strong>Id : {item.id}</strong></p>
                            <div className="centeredCountDiv">
                                <div className="countDiv">
                                    <MinusCircle onClick={(e) => handleMinusQuantityChange(item, e)}></MinusCircle>
                                    <div className="currentCount">{item.quantity} {item.unit}</div>
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

            {/* Modal d'ajout d'ingrédient */}

           {modalState && (
                <div className="modalOverlay" onClick={handleCloseModal1}>
                    <div className="deleteModalContent2" onClick={(e) => e.stopPropagation()}>
                        <div className="head">
                            <h3>Formulaire d'Ajout d'Ingrédient</h3>
                            <div><X className='logo' onClick={handleCloseModal1}></X></div>
                        </div>

                        <div className="ingredientForm">
                            <div className="formField">
                                <label htmlFor="ingredientName">Nom</label>
                                <input
                                    id="ingredientName"
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={formHandler}
                                    placeholder="Ex : Blanc de poulet"
                                />
                            </div>

                            <div className="formField">
                                <span className="fieldTitle">Catégorie</span>
                                <div className="chipRow chipRowLeft">
                                    {INGREDIENT_CATEGORIES.map(category => (
                                        <button
                                            type="button"
                                            key={category}
                                            className={`chip ${formData.category === category ? "active" : ""}`}
                                            onClick={() => handleFormCategory(category)}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="formField">
                                <span className="fieldTitle">Unité</span>
                                <div className="chipRow chipRowLeft">
                                    {UNITS.map(unit => (
                                        <button
                                            type="button"
                                            key={unit}
                                            className={`chip ${formData.unit === unit ? "active" : ""}`}
                                            onClick={() => handleFormUnit(unit)}
                                        >
                                            {unit}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="formField">
                                <label htmlFor="ingredientPrice">Prix</label>
                                <div className="inputWithSuffix">
                                    <input
                                        id="ingredientPrice"
                                        type="text"
                                        inputMode="decimal"
                                        name="price"
                                        value={formData.price}
                                        onChange={formHandler}
                                        placeholder="0,00"
                                    />
                                    <span>{priceUnitLabel(formData.unit)}</span>
                                </div>
                            </div>

                            <div className="formField">
                                <span className="fieldTitle">Valeurs nutritionnelles <small>{macroBase}</small></span>
                                <div className="macroInputs">
                                    {([
                                        { name: "calories", label: "Calories", suffix: "kcal" },
                                        { name: "carbs", label: "Glucides", suffix: "g" },
                                        { name: "protein", label: "Protéines", suffix: "g" },
                                        { name: "fat", label: "Lipides", suffix: "g" },
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
                                    Suivre dans le stock
                                    <small>Décocher pour les épices, le sel... : ils n'apparaîtront pas dans la liste de courses.</small>
                                </span>
                            </label>

                            <div className="formField">
                                <span className="fieldTitle">Image</span>
                                <div className="fileRow">
                                    <label className="fileBtn">
                                        <Upload size={16}/> Choisir une image
                                        <input type="file" accept="image/*" onChange={handleImagePath}/>
                                    </label>
                                    <span className="fileName">{imageName || "Aucune image"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="deleteModalActions">
                            <button className="confirmDeleteBtn" onClick={ajouterIngredient}>Ajouté l'Ingrédient</button>
                            <button className="cancelDeleteBtn" onClick={handleCloseModal1}>Annuler</button>
                        </div>
                    </div>
                </div>
            )} 

            {/* Modal de confirmation de suppression d'un ingrédient */}

            {ingredientToDelete && (
                <div className="modalOverlay" onClick={handleCloseModal2}>
                    <div className="deleteModalContent1" onClick={(e) => e.stopPropagation()}>
                        <div className="head1">
                            <h3>Confirmer la suppression</h3>
                            <div><X className='logo' onClick={handleCancelDelete}></X></div>
                        </div>
                      <p>Es-tu sûr de vouloir supprimer <strong>{ingredientToDelete?.name}</strong> ?<br/> Tu pourras l'annuler juste après.</p>
                      <div className="deleteModalActions">
                        <button className="confirmDeleteBtn" onClick={deleteIngredient}>Confirmer</button>
                        <button className="cancelDeleteBtn" onClick={handleCloseModal2}>Annuler</button>
                      </div>
                    </div>
                </div>
            )}
        </div>
        </>
    )
}

export default CurrentStock;