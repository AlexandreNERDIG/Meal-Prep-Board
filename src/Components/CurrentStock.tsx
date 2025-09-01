import NavBar from './NavBar';
import './CurrentStock.css';
import './NewMeal.css';
import { Trash, Trash2, X} from 'react-feather';
import { Recipe, Ingredient } from './typeFile';
import { useState, useEffect } from 'react';
import { Search, Aperture, MinusCircle, PlusCircle } from "react-feather"
import toast from 'react-hot-toast';

const CurrentStock = () => {

    const defaultList: Ingredient[] = [
        // --- Protéines ---
        {
          id: "1",
          Name: "Blanc de poulet",
          Macro: "165 Calories | 0 g C | 31 g P | 3.6 g F",
          Price: 10, // prix/kg
          Quantity: 0,
          Unit: "g",
          Category: "Protéine",
          Image: "/img2/blanc-de-poulet.jpg"
        },
        {
          id: "2",
          Name: "Haut de cuisse de poulet",
          Macro: "209 Calories | 0 g C | 26 g P | 11 g F",
          Price: 9, // prix/kg
          Quantity: 0,
          Unit: "g",
          Category: "Protéine",
          Image: "/img2/haut-de-cuisse-de-poulet.jpg"
        },
        {
          id: "3",
          Name: "Saumon",
          Macro: "208 Calories | 0 g C | 20 g P | 13 g F",
          Price: 15,
          Quantity: 0,
          Unit: "g",
          Category: "Protéine",
          Image: "/img2/saumon.jpg"
        },
        {
          id: "4",
          Name: "Thon",
          Macro: "132 Calories | 0 g C | 28 g P | 1 g F",
          Price: 12,
          Quantity: 0,
          Unit: "g",
          Category: "Protéine",
          Image: "/img2/thon.jpeg"
        },
        {
          id: "5",
          Name: "Maquereau",
          Macro: "205 Calories | 0 g C | 19 g P | 13.9 g F",
          Price: 14,
          Quantity: 0,
          Unit: "g",
          Category: "Protéine",
          Image: "/img2/maquereau.jpeg"
        },
        {
          id: "6",
          Name: "Œuf",
          Macro: "70 Calories | 0.5 g C | 6 g P | 5 g F",
          Price: 0.25,
          Quantity: 5,
          Unit: `unités`,
          Category: "Protéine",
          Image: "/img2/oeuf.jpg"
        },
        {
          id: "7",
          Name: "Bœuf",
          Macro: "250 Calories | 0 g C | 26 g P | 17 g F",
          Price: 18,
          Quantity: 0,
          Unit: "g",
          Category: "Protéine",
          Image: "/img2/boeuf.jpg"
        },
    
        // --- Légumes ---
        {
          id: "8",
          Name: "Tomates cerise",
          Macro: "18 Calories | 3.9 g C | 0.9 g P | 0.2 g F",
          Price: 3,
          Quantity: 0,
          Unit: "g",
          Category: "Légumes",
          Image: "/img2/tomate-cerise.jpg"
        },
        {
          id: "9",
          Name: "Laitue",
          Macro: "15 Calories | 2.9 g C | 1.4 g P | 0.2 g F",
          Price: 2,
          Quantity: 0,
          Unit: "g",
          Category: "Légumes",
          Image: "/img2/laitue.jpg"
        },
        {
          id: "10",
          Name: "Poivron",
          Macro: "31 Calories | 6 g C | 1 g P | 0.3 g F",
          Price: 2,
          Quantity: 0,
          Unit: "g",
          Category: "Légumes",
          Image: "/img2/poivron.jpg"
        },
        {
          id: "11",
          Name: "Oignon",
          Macro: "40 Calories | 9 g C | 1.1 g P | 0.1 g F",
          Price: 1.5,
          Quantity: 0,
          Unit: "g",
          Category: "Légumes",
          Image: "/img2/oignon.jpg"
        },
        {
          id: "12",
          Name: "Choux de Bruxelles",
          Macro: "43 Calories | 9 g C | 3.4 g P | 0.3 g F",
          Price: 4,
          Quantity: 0,
          Unit: "g",
          Category: "Légumes",
          Image: "/img2/chou-bruxelles.jpg"
        },
    
        // --- Féculents ---
        {
          id: "13",
          Name: "Riz",
          Macro: "130 Calories | 28 g C | 2.7 g P | 0.3 g F",
          Price: 2,
          Quantity: 0,
          Unit: "g",
          Category: "Féculent",
          Image: "/img2/riz.jpg"
        },
        {
          id: "14",
          Name: "Pommes de terre",
          Macro: "77 Calories | 17 g C | 2 g P | 0.1 g F",
          Price: 3,
          Quantity: 0,
          Unit: "g",
          Category: "Féculent",
          Image: "/img2/pomme-de-terre.jpg"
        },
        {
          id: "15",
          Name: "Pâtes",
          Macro: "131 Calories | 25 g C | 5 g P | 1.1 g F",
          Price: 1.5,
          Quantity: 0,
          Unit: "g",
          Category: "Féculent",
          Image: "/img2/pates.jpg"
        },
        {
          id: "16",
          Name: "Pain",
          Macro: "265 Calories | 49 g C | 9 g P | 3.2 g F",
          Price: 2,
          Quantity: 0,
          Unit: "g",
          Category: "Féculent",
          Image: "/img2/pain.jpg"
        },
    
        // --- Boissons (100 mL) ---
        {
          id: "17",
          Name: "SodaStream Pespi",
          Macro: "0 Calories | 0 g C | 0 g P | 0 g F",
          Price: 5,
          Quantity: 0,
          Unit: "mL",
          Category: "Boisson",
          Image: "/img2/soda-stream-pepsi.jpg"
        },
        {
          id: "18",
          Name: "SodaStream Orange",
          Macro: "0 Calories | 0 g C | 0 g P | 0 g F",
          Price: 5,
          Quantity: 0,
          Unit: "mL",
          Category: "Boisson",
          Image: "/img2/soda-stream-orange.jpg"
        },
        {
          id: "19",
          Name: "SodaStream Coca Cerise",
          Macro: "0 Calories | 0 g C | 0 g P | 0 g F",
          Price: 5,
          Quantity: 0,
          Unit: "mL",
          Category: "Boisson",
          Image: "/img2/soda-stream-cerise.jpg"
        },
        {
          id: "20",
          Name: "SodaStream Limonade",
          Macro: "0 Calories | 0 g C | 0 g P | 0 g F",
          Price: 5,
          Quantity: 0,
          Unit: "mL",
          Category: "Boisson",
          Image: "/img2/soda-stream-limonade.jpg"
        }
];


    const [currentStock, setCurrentStock] = useState<Ingredient[]>(() => {
        const exist = localStorage.getItem("currentStockList");
        return ((exist) ? JSON.parse(exist) : defaultList);
    });

    const [searchValue, setSearchValue] = useState<string>("");

    const handleSearchInput = (e : React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value)
    }

    const [selectedCategory, setSelectedCategory] = useState<"Tout" | "Protéine" | "Légumes" | "Féculent" | "Boisson" | "Autre">("Tout");

    const handleCategoryChange = (e : React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCategory(e.target.value as "Tout" | "Protéine" | "Légumes" | "Féculent" | "Boisson" | "Autre");
    }

    const handleMinusQuantityChange = (currentItem : Ingredient, event: React.MouseEvent) => {
        if (!currentStock) return;

        if (currentItem.id !== '6') {
            const multiplier = event.shiftKey ? 10 : 1
            let updatedList = currentStock.map(element => (element.id === currentItem.id) ? {...element, Quantity : Math.max(0, element.Quantity - (50 * multiplier))} : element)
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
            let updatedList = currentStock.map(element => (element.id === currentItem.id) ? {...element, Quantity : Math.max(0, element.Quantity + (50 * multiplier))} : element)
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

    const [idCounter, setIdCounter] = useState(currentStock.length)

    const idAdd = () => {
        setIdCounter(idCounter + 1)
    }

    const idRemove = () => {
        setIdCounter(idCounter - 1)
    }

    const [modalState, setModalState] = useState<Boolean>(false);

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

    const handleOpenModal1 = () => {
        setModalState(true);
    }

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
        const newIngredient : Ingredient = {
            ...formData,
            id: `${idCounter + 1}`
        }

        if (currentStock.some(ingre => ingre.Name.trim().toLowerCase() === newIngredient.Name.trim().toLowerCase())) return;

        setCurrentStock((prev) => {
            let updated = [...prev, newIngredient];
            updated = triCurrentStockList(updated)
            localStorage.setItem("currentStockList", JSON.stringify(updated));
            return updated;
        });
        toast.success("L'ingrédient a bien été ajouté");
        idAdd()
        handleCloseModal1()
    }

    const [ingredientToDelete, setIngredientToDelete] = useState<Ingredient | null>(null);

    const handleOpenModal2 = (ingre : Ingredient) => {
        setIngredientToDelete(ingre)
    }

    const handleCloseModal2 = () => {
        setIngredientToDelete(null)
    }

    const handleCancelDelete = () => {
        setIngredientToDelete(null);
    }

    const deleteIngredient = () => {
        if (!ingredientToDelete) return;

        const updatedList = currentStock.filter(e => e.Name.trim().toLocaleLowerCase() !== ingredientToDelete.Name.trim().toLocaleLowerCase());
        setCurrentStock(updatedList);
        localStorage.setItem("currentStockList", JSON.stringify(updatedList));
        toast.error(`${ingredientToDelete.Name} à bien été supprimer`)
        setIngredientToDelete(null);
        handleCloseModal2()
    }

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
                                    <div className="currentCount">{item.Quantity}</div>
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
                                    <option value="''">""</option>
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