import './CurrentStock.css';
import './NewMeal.css';
import { X } from 'react-feather';
import { Ingredient } from './typeFile';
import { useState } from 'react';
import { Search, Aperture, MinusCircle, PlusCircle } from "react-feather"
import toast from 'react-hot-toast';

export const defaultList: Ingredient[] = [
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
      Name: "Oeuf",
      Macro: "70 Calories | 0.5 g C | 6 g P | 5 g F",
      Price: 0.25,
      Quantity: 5,
      Unit: `unités`,
      Category: "Protéine",
      Image: "/img2/oeuf.jpg"
    },
    {
      id: "7",
      Name: "Boeuf",
      Macro: "250 Calories | 0 g C | 26 g P | 17 g F",
      Price: 18,
      Quantity: 0,
      Unit: "g",
      Category: "Protéine",
      Image: "/img2/boeuf.jpg"
    },
    {
      id: "25",
      Name: "Veau",
      Macro: "172 Calories | 0 g C | 24 g P | 7 g F",
      Price: 16,
      Quantity: 0,
      Unit: "g",
      Category: "Protéine",
      Image: "/img2/veau.jpg"
    },  
    {
      id: "30",
      Name: "Porc",
      Macro: "242 Calories | 0 g C | 27 g P | 14 g F",
      Price: 13,
      Quantity: 0,
      Unit: "g",
      Category: "Protéine",
      Image: "/img2/lomo-porc.jpeg"
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
    {
      id: "21",
      Name: "Carotte",
      Macro: "41 Calories | 10 g C | 0.9 g P | 0.2 g F",
      Price: 2,
      Quantity: 0,
      Unit: "g",
      Category: "Légumes",
      Image: "/img2/carotte.jpg"
    },
    {
      id: "22",
      Name: "Tomate",
      Macro: "18 Calories | 3.9 g C | 0.9 g P | 0.2 g F",
      Price: 2,
      Quantity: 0,
      Unit: "g",
      Category: "Légumes",
      Image: "/img2/tomate.jpg"
    },
    {
      id: "23",
      Name: "Champignon",
      Macro: "22 Calories | 3.3 g C | 3.1 g P | 0.3 g F",
      Price: 3,
      Quantity: 0,
      Unit: "g",
      Category: "Légumes",
      Image: "/img2/champignon.jpg"
    },
    {
      id: "24",
      Name: "Poireau",
      Macro: "61 Calories | 14 g C | 1.5 g P | 0.3 g F",
      Price: 2.5,
      Quantity: 0,
      Unit: "g",
      Category: "Légumes",
      Image: "/img2/poireau.jpg"
    },
    {
        id: "31",
        Name: "Brocoli",
        Macro: "34 Calories | 7 g C | 3 g P | 0.4 g F",
        Price: 3,
        Quantity: 0,
        Unit: "g",
        Category: "Légumes",
        Image: "/img2/brocoli.jpg"
    },
    {
        id: "33",
        Name: "Ciboule",
        Macro: "32 Calories | 7.3 g C | 1.8 g P | 0.2 g F",
        Price: 4,
        Quantity: 0,
        Unit: "g",
        Category: "Légumes",
        Image: "/img2/ciboule.jpg"
    },
    {
        id: "34",
        Name: "Citron vert",
        Macro: "30 Calories | 11 g C | 0.7 g P | 0.2 g F",
        Price: 4,
        Quantity: 0,
        Unit: "g",
        Category: "Autre",
        Image: "/img2/citron-vert.jpg"
    },
    {
        id: "41",
        Name: "Poêlé Wok",
        Macro: "95 Calories | 7 g C | 2 g P | 0.5 g F",
        Price: 4,
        Quantity: 0,
        Unit: "g",
        Category: "Légumes",
        Image: "/img2/poele-wok.jpg"
    },

    {
        id: "44",
        Name: "Ail",
        Macro: "149 Calories | 33 g C | 6.4 g P | 0.5 g F",
        Price: 3,
        Quantity: 0,
        Unit: "g",
        Category: "Légumes",
        Image: "/img2/ail.jpg"
    },
    {
        id: "45",
        Name: "Chou",
        Macro: "25 Calories | 5 g C | 1.3 g P | 0.1 g F",
        Price: 2,
        Quantity: 0,
        Unit: "g",
        Category: "Légumes",
        Image: "/img2/chou.png"
    },
    {
        id: "43",
        Name: "Gingembre",
        Macro: "80 Calories | 18 g C | 1.8 g P | 0.8 g F",
        Price: 5,
        Quantity: 0,
        Unit: "g",
        Category: "Légumes",
        Image: "/img2/gingembre.jpg"
    },
    {
        id: "48",
        Name: "Graines de courge",
        Macro: "446 Calories | 16 g C | 19 g P | 19 g F",
        Price: 5,
        Quantity: 0,
        Unit: "g",
        Category: "Autre",
        Image: "/img2/graines-courge.jpg"
    },
    {
        id: "50",
        Name: "Haricots verts",
        Macro: "31 Calories | 7 g C | 2 g P | 0.2 g F",
        Price: 3,
        Quantity: 0,
        Unit: "g",
        Category: "Légumes",
        Image: "/img2/haricots-verts.jpg"
    },
    {
        id: "51",
        Name: "Sauce tomate",
        Macro: "29 Calories | 5 g C | 1 g P | 0.2 g F",
        Price: 3,
        Quantity: 0,
        Unit: "g",
        Category: "Légumes",
        Image: "/img2/sauce-tomate.jpg"
    },
    {
        id: "52",
        Name: "Pois",
        Macro: "81 Calories | 14 g C | 5 g P | 0.4 g F",
        Price: 3,
        Quantity: 0,
        Unit: "g",
        Category: "Légumes",
        Image: "/img2/pois.jpg"
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
    {
        id: "47",
        Name: "Patate douce",
        Macro: "86 Calories | 20 g C | 1.6 g P | 0.1 g F",
        Price: 2.5,
        Quantity: 0,
        Unit: "g",
        Category: "Féculent",
        Image: "/img2/patate-douce.jpg"
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
    },
    {
      id: "26",
      Name: "Vin rouge",
      Macro: "85 Calories | 2.6 g C | 0.1 g P | 0 g F",
      Price: 10,
      Quantity: 0,
      Unit: "mL",
      Category: "Boisson",
      Image: "/img2/vin-rouge.jpg"
    },
    // --- Autre --- 
    {
      id: "27",
      Name: "Huile d'olive",
      Macro: "884 Calories | 0 g C | 0 g P | 100 g F",
      Price: 6,
      Quantity: 0,
      Unit: "mL",
      Category: "Autre",
      Image: "/img2/huile-olive.jpg"
    },
    {
      id: "28",
      Name: "Crème fraîche",
      Macro: "292 Calories | 2.9 g C | 2.4 g P | 30 g F",
      Price: 4,
      Quantity: 0,
      Unit: "g",
      Category: "Autre",
      Image: "/img2/creme-fraiche.jpg"
    },
    {
      id: "29",
      Name: "Beurre",
      Macro: "717 Calories | 0.1 g C | 0.9 g P | 81 g F",
      Price: 5,
      Quantity: 0,
      Unit: "g",
      Category: "Autre",
      Image: "/img2/beurre.jpg"
    },
    {
        id: "35",
        Name: "Miel",
        Macro: "304 Calories | 82 g C | 0.3 g P | 0 g F",
        Price: 8,
        Quantity: 0,
        Unit: "g",
        Category: "Autre",
        Image: "/img2/miel.jpg"
    },
    {
        id: "36",
        Name: "Sauce Sriracha",
        Macro: "93 Calories | 20 g C | 1 g P | 0.9 g F",
        Price: 6,
        Quantity: 0,
        Unit: "g",
        Category: "Autre",
        Image: "/img2/sriracha.jpg"
    },
    {
        id: "37",
        Name: "Beurre de cacahuète",
        Macro: "588 Calories | 20 g C | 25 g P | 50 g F",
        Price: 9,
        Quantity: 0,
        Unit: "g",
        Category: "Autre",
        Image: "/img2/beurre-cacahuete.jpg"
    },
    {
        id: "38",
        Name: "Sauce soja",
        Macro: "53 Calories | 5 g C | 8 g P | 0 g F",
        Price: 4,
        Quantity: 0,
        Unit: "mL",
        Category: "Autre",
        Image: "/img2/sauce-soja.jpg"
    },
    {
        id: "39",
        Name: "Vinaigre de riz",
        Macro: "18 Calories | 0 g C | 0 g P | 0 g F",
        Price: 3,
        Quantity: 0,
        Unit: "mL",
        Category: "Autre",
        Image: "/img2/vinaigre-riz.jpg"
    },
    {
        id: "40",
        Name: "Huile de sésame",
        Macro: "884 Calories | 0 g C | 0 g P | 100 g F",
        Price: 7,
        Quantity: 0,
        Unit: "mL",
        Category: "Autre",
        Image: "/img2/huile-sesame.jpg"
    },
    {
        id: "42",
        Name: "Purée de piment",
        Macro: "109 Calories | 22 g C | 2 g P | 0.5 g F",
        Price: 7,
        Quantity: 0,
        Unit: "g",
        Category: "Autre",
        Image: "/img2/puree-piment.jpg"
    },
    {
        id: "49",
        Name: "Feta",
        Macro: "264 Calories | 4 g C | 14 g P | 21 g F",
        Price: 4,
        Quantity: 0,
        Unit: "g",
        Category: "Autre",
        Image: "/img2/feta.jpg"
    },
    {
        id: "46",
        Name: "Yaourt grec",
        Macro: "59 Calories | 3.6 g C | 10 g P | 0.4 g F",
        Price: 3,
        Quantity: 0,
        Unit: "g",
        Category: "Autre",
        Image: "/img2/yaourt-grec.png"
    },
];

const CurrentStock = () => {

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
        toast.error(`${ingredientToDelete.Name} a bien été supprimé`)
        setIngredientToDelete(null);
        idRemove()
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