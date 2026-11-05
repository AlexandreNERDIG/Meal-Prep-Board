import './CurrentStock.css';
import './NewMeal.css';
import { X } from 'react-feather';
import { Ingredient, defaultList } from './typeFile';
import { useState } from 'react';
import { Search, Aperture, MinusCircle, PlusCircle } from "react-feather"
import toast from 'react-hot-toast';
import { priceUnitLabel } from '../lib/recipeUtils';

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
    image: "/img2/",
    trackStock: true
};

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
    const [selectedcategory, setSelectedcategory] = useState<"Tout" | "Protéine" | "Légumes" | "Féculent" | "Boisson" | "Autre">("Tout");
    const [idCounter, setIdCounter] = useState(() => {
        const exist = localStorage.getItem("currentStockList");
        const list = exist ? JSON.parse(exist) : defaultList;
        const maxId = list.reduce((max: number, ing: Ingredient) => Math.max(max, parseInt(ing.id, 10)), 0);
        return maxId;
    });
    const [modalState, setModalState] = useState<Boolean>(false);
    const [ingredientToDelete, setIngredientToDelete] = useState<Ingredient | null>(null);

    const handleSearchInput = (e : React.ChangeEvent<HTMLInputElement>) => {setSearchValue(e.target.value)};
    const handlecategoryChange = (e : React.ChangeEvent<HTMLSelectElement>) => {setSelectedcategory(e.target.value as "Tout" | "Protéine" | "Légumes" | "Féculent" | "Boisson" | "Autre")};
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

    const handlecategoryChangeBis = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData((prev) => ({
            ...prev,
            category: e.target.value as Ingredient["category"]
        }));
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

        const updatedList = currentStock.filter(e => e.id !== ingredientToDelete.id);
        setCurrentStock(updatedList);
        localStorage.setItem("currentStockList", JSON.stringify(updatedList));
        toast.error(`${ingredientToDelete.name} a bien été supprimé`);
        setIngredientToDelete(null);
        handleCloseModal2();
    };

    const macroBase = (formData.unit === "g" || formData.unit === "mL") ? `pour 100 ${formData.unit}` : "pour 1 unité";

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
                <select className="category" name="category" value={selectedcategory} onChange={handlecategoryChange}>
                    <option value="Tout">Tout</option>
                    <option value="Protéine">Protéine</option>
                    <option value="Légumes">Légumes</option>
                    <option value="Féculent">Féculent</option>
                    <option value="Boisson">Boisson</option>
                    <option value="Autre">Autre</option>
                </select>
            </div>

            <div className="currentStockGallery">
                {currentStock
                    ?.filter((item) => (selectedcategory === "Tout" || item.category === selectedcategory) && item.name.toLowerCase().includes(searchValue.toLowerCase()))
                    .map((item) => (
                      <div key={item.id} className="stockItem">
                        <img src={item.image} alt={item.name} />
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

                        <div className="textInput1">
                            <div className="sousElement">
                                <label>Nom : </label>
                                <textarea
                                    name="name"
                                    value={formData.name}
                                    onChange={formHandler}
                                    placeholder='Entrer le nom'
                                />
                            </div>
                            <div className="sousElement">
                                <label>Unité : </label>
                                <select className="category" name="unit" value={formData.unit} onChange={formHandler}>
                                    <option value="">-- Choisir --</option>
                                    <option value="g">g</option>
                                    <option value="mL">mL</option>
                                    <option value="unités">unités</option>
                                </select>
                            </div>
                            <div className="sousElement">
                                <label>Prix : </label>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    name="price"
                                    value={formData.price}
                                    onChange={formHandler}
                                    placeholder={`Prix (${priceUnitLabel(formData.unit)})`}
                                />
                            </div>
                            <div className="sousElement">
                                <label>Calories : </label>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    name="calories"
                                    value={formData.calories}
                                    onChange={formHandler}
                                    placeholder='kcal'
                                />
                            </div>
                            <div className="sousElement">
                                <label>Glucides : </label>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    name="carbs"
                                    value={formData.carbs}
                                    onChange={formHandler}
                                    placeholder='g'
                                />
                            </div>
                            <div className="sousElement">
                                <label>Protéines : </label>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    name="protein"
                                    value={formData.protein}
                                    onChange={formHandler}
                                    placeholder='g'
                                />
                            </div>
                            <div className="sousElement">
                                <label>Lipides : </label>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    name="fat"
                                    value={formData.fat}
                                    onChange={formHandler}
                                    placeholder='g'
                                />
                            </div>
                            <div className="sousElement">
                                <label>Catégorie : </label>
                                <select className="category" name="category" value={formData.category} onChange={handlecategoryChangeBis}>
                                    <option value="">-- Choisir --</option>
                                    <option value="Protéine">Protéine</option>
                                    <option value="Légumes">Légumes</option>
                                    <option value="Féculent">Féculent</option>
                                    <option value="Boisson">Boisson</option>
                                    <option value="Autre">Autre</option>
                                </select>
                            </div>
                            <div className="sousElement">
                                <label>Suivi dans le stock : </label>
                                <input type="checkbox" name="trackStock" checked={formData.trackStock} onChange={formHandler}/>
                                <span> (décocher pour les épices, sel... : ils n'apparaîtront pas dans la liste de courses)</span>
                            </div>
                            <div className="sousElement">
                                <label>Image : </label>
                                <input type="file" onChange={handleImagePath}/>
                            </div>
                        </div>

                        <p>{`Les macros sont à saisir ${macroBase}. Le prix est en ${priceUnitLabel(formData.unit)}.`}</p>

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
                      <p>Es-tu sûr de vouloir supprimer <strong>{ingredientToDelete?.name}</strong> ?<br/> Cette action est irréversible.</p>
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