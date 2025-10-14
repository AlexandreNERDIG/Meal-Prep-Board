import './CurrentStock.css';
import './NewMeal.css';
import { X } from 'react-feather';
import { Ingredient, defaultList } from './typeFile';
import { useState } from 'react';
import { Search, Aperture, MinusCircle, PlusCircle } from "react-feather"
import toast from 'react-hot-toast';

const CurrentStock = () => {

    const [currentStock, setCurrentStock] = useState<Ingredient[]>(() => {
        const exist = localStorage.getItem("currentStockList");
        return ((exist) ? JSON.parse(exist) : defaultList);
    });

    const [searchValue, setSearchValue] = useState<string>("");
    const [selectedCategory, setSelectedCategory] = useState<"Tout" | "Protéine" | "Légumes" | "Féculent" | "Boisson" | "Autre">("Tout");
    const [idCounter, setIdCounter] = useState(() => {
        const exist = localStorage.getItem("currentStockList");
        const list = exist ? JSON.parse(exist) : defaultList;
        const maxId = list.reduce((max: number, ing: Ingredient) => Math.max(max, parseInt(ing.id, 10)), 0);
        return maxId;
    });
    const [modalState, setModalState] = useState<Boolean>(false);
    const [ingredientToDelete, setIngredientToDelete] = useState<Ingredient | null>(null);

    const handleSearchInput = (e : React.ChangeEvent<HTMLInputElement>) => {setSearchValue(e.target.value)};
    const handleCategoryChange = (e : React.ChangeEvent<HTMLSelectElement>) => {setSelectedCategory(e.target.value as "Tout" | "Protéine" | "Légumes" | "Féculent" | "Boisson" | "Autre")};
    const handleOpenModal1 = () => {setModalState(true)};
    const handleCloseModal1 = () => {
        setFormData({
        id: ``,
        Name: "",
        Macro: "* Calories | * g C | * g P | * g F",
        Price: 0,
        Quantity: 0,
        Unit: "",
        Category: "",
        Image: "/img2/"
    })
        setModalState(false);
    };
    const handleOpenModal2 = (ingre : Ingredient) => {setIngredientToDelete(ingre)};
    const handleCloseModal2 = () => {setIngredientToDelete(null)};
    const handleCancelDelete = () => {setIngredientToDelete(null)};

    const handleMinusQuantityChange = (currentItem : Ingredient, event: React.MouseEvent) => {
        if (!currentStock) return;

        if (currentItem.id !== '6') {
            const multiplier = event.shiftKey ? 10 : 1
            let updatedList = currentStock.map(element => (element.id === currentItem.id) ? {...element, Quantity : Math.max(0, element.Quantity - (10 * multiplier))} : element)
            setCurrentStock(updatedList);
            localStorage.setItem("currentStockList", JSON.stringify(updatedList));
        }
        else {
            const multiplier = event.shiftKey ? 6 : 1
            let updatedList = currentStock.map(element => (element.id === currentItem.id) ? {...element, Quantity : Math.max(0, element.Quantity - (1 * multiplier))} : element)
            setCurrentStock(updatedList);
            localStorage.setItem("currentStockList", JSON.stringify(updatedList));
        }
    }

    const handlePlusQuantityChange = (currentItem : Ingredient, event : React.MouseEvent) => {
        if (!currentStock) return;

        if (currentItem.id !== '6') {
            const multiplier = event.shiftKey ? 10 : 1
            let updatedList = currentStock.map(element => (element.id === currentItem.id) ? {...element, Quantity : Math.max(0, element.Quantity + (10 * multiplier))} : element)
            setCurrentStock(updatedList);
            localStorage.setItem("currentStockList", JSON.stringify(updatedList));
        }
        else {
            const multiplier = event.shiftKey ? 6 : 1
            let updatedList = currentStock.map(element => (element.id === currentItem.id) ? {...element, Quantity : Math.max(0, element.Quantity + (1 * multiplier))} : element)
            setCurrentStock(updatedList);
            localStorage.setItem("currentStockList", JSON.stringify(updatedList));
        }
    }


    const [formData, setFormData] = useState<Ingredient>({
        id: "",
        Name: "",
        Macro: "* Calories | * g C | * g P | * g F",
        Price: 0,
        Quantity: 0,
        Unit: "",
        Category: "",
        Image: "/img2/"
    })

    const formHandler = (e : React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name] : value
        }))
    }

    const handleCategoryChangeBis = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData((prev) => ({
            ...prev,
            Category: e.target.value as "Protéine" | "Légumes" | "Féculent" | "Boisson" | "Autre"
        }));
    };

    const handleImagePath = (e : React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            toast.error("L'image n'a pas pu être chargée")
            return;
        }

        const fileName = file.name;

        setFormData((prev) => ({
            ...prev,
            Image : `/img2/${fileName}`
        }))
        toast.success("L'image a bien été chargée")
    }

    const triCurrentStockList = (currentStockArr : Ingredient[]) => {

        const protIngredient = currentStockArr.filter(element => element.Category === "Protéine");
        const veggieIngredient = currentStockArr.filter(element => element.Category === "Légumes");
        const feculentIngredient = currentStockArr.filter(element => element.Category === "Féculent");
        const drinkIngredient = currentStockArr.filter(element => element.Category === "Boisson");
        const otherIngredient = currentStockArr.filter(element => element.Category === "Autre");

        return [
            protIngredient,
            veggieIngredient,
            feculentIngredient,
            drinkIngredient,
            otherIngredient
        ].flat();
    }

    const ajouterIngredient = () => {

        if (
            !formData.Name?.trim() ||
            !formData.Unit?.trim() ||
            !formData.Category?.trim() ||
            formData.Price === undefined || formData.Price <= 0
        ) {
            toast.error("Veuillez remplir tous les champs obligatoires correctement");
            return;
        }

        const newIngredient : Ingredient = {
            ...formData,
            id: `${idCounter + 1}`
        }

        if (currentStock.some(ingre => ingre.Name.trim().toLowerCase() === newIngredient.Name.trim().toLowerCase())) {
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
        toast.error(`${ingredientToDelete.Name} a bien été supprimé`);
        setIngredientToDelete(null);
        handleCloseModal2();
    };

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
                <select className="category" name="category" value={selectedCategory} onChange={handleCategoryChange}>
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
                    ?.filter((item) => (selectedCategory === "Tout" || item.Category === selectedCategory) && item.Name.toLowerCase().includes(searchValue.toLowerCase()))
                    .map((item) => (
                      <div key={item.id} className="stockItem">
                        <img src={item.Image} alt={item.Name} />
                        <div className="subTextDiv">
                            <X className='deleteBtn' onClick={() => handleOpenModal2(item)}></X>
                            <h2>{item.Name}</h2>
                            <h4>{item.Macro}</h4>
                            <p><strong>Id : {item.id}</strong></p>
                            <div className="centeredCountDiv">
                                <div className="countDiv">
                                    <MinusCircle onClick={(e) => handleMinusQuantityChange(item, e)}></MinusCircle>
                                    <div className="currentCount">{item.Quantity} {item.Unit}</div>
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
                                    name="Name"
                                    value={formData.Name}
                                    onChange={formHandler}
                                    placeholder='Entrer le nom'
                                />
                            </div>
                            <div className="sousElement">
                                <label>Macro : </label>
                                <textarea
                                    name="Macro"
                                    value={formData.Macro}
                                    onChange={formHandler}
                                    placeholder='Entrer les macros'
                                />
                            </div>
                            <div className="sousElement">
                                <label>Prix : </label>
                                <textarea
                                    name="Price"
                                    value={formData.Price}
                                    onChange={formHandler}
                                    placeholder='Entrer le prix au kilo'
                                />
                            </div>
                            <div className="sousElement">
                                <label>Unité : </label>
                                <textarea
                                    name="Unit"
                                    value={formData.Unit}
                                    onChange={formHandler}
                                    placeholder="Entrer l'unité"
                                />
                            </div>
                            <div className="sousElement">
                                <label>Catégorie : </label>
                                <select className="category" name="category" value={formData.Category} onChange={handleCategoryChangeBis}>
                                    <option value="''">-- Choisir --</option>
                                    <option value="Protéine">Protéine</option>
                                    <option value="Légumes">Légumes</option>
                                    <option value="Féculent">Féculent</option>
                                    <option value="Boisson">Boisson</option>
                                    <option value="Autre">Autre</option>
                                </select>
                            </div>
                            <div className="sousElement">
                                <label>Image : </label>
                                <input type="file" onChange={handleImagePath}/>
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
                      <p>Es-tu sûr de vouloir supprimer <strong>{ingredientToDelete?.Name}</strong> ?<br/> Cette action est irréversible.</p>
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