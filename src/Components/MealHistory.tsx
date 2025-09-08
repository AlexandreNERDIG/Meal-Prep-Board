import './MealHistory.css';
import { Bookmark, ShoppingCart, X } from 'react-feather';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Recipe, Ingredient } from './typeFile';
import { RecipeInfo } from './HomePage';
import defaultList from './CurrentStock'

const MealHistory = () => {

    const [mealHistory, setmealHistory] = useState<Recipe[][]>(() => {
        const saved = localStorage.getItem("mealHistoryList");
        return ((saved) ? JSON.parse(saved) : [{
            RecipeName: "Bœuf Bourguignon",
            Ingredient: [
                "1000g Boeuf",
                "180g Carotte",
                "160g Oignon",
                "250mL Vin Rouge",
                "250mL Bouillon de Bœuf",
                "10g Ail",
                "10g Farine",
                "Sel et Poivre"
            ],
            Macro: "450 Calories | 15 g C | 38 g P | 22 g F",
            PrepTime: "20 min",
            CookTime: "3h",
            Instructions: "Faites revenir le bœuf dans l'huile, ajoutez 2 oignons (160g), 3 carottes (180g), et 2 gousses d'ail (10g). Saupoudrez de farine, versez le vin, le bouillon et laissez mijoter 2h30.",
            image: "../img/Korean-Beef-and-Rice-Cakes-807x1024.jpg",
            Status: "normal"
        },
        {
            RecipeName: "Poulet Basquaise",
            Ingredient: [
                "750g Blanc de Poulet",
                "240g Poivron",
                "240g Tomate",
                "160g Oignon",
                "10g Ail",
                "200mL Bouillon de Volaille",
                "5g Paprika",
                "15mL Huile d'Olive",
                "Sel et Poivre"
            ],
            Macro: "400 Calories | 12 g C | 35 g P | 22 g F",
            PrepTime: "15 min",
            CookTime: "1h30",
            Instructions: "Faites revenir le poulet dans l'huile. Ajoutez 2 oignons (160g), 2 poivrons (240g), et 2 gousses d'ail (10g). Versez le bouillon et laissez mijoter 1h.",
            image: "../img/Korean-Beef-and-Rice-Cakes-807x1024.jpg",
            Status: "normal"
        }])
    });

    const [recipeList, setRecipeList] = useState<Recipe[]>(() => {
            const saved = localStorage.getItem("globalRecipeList");
            return ((saved) ? JSON.parse(saved) : RecipeInfo)
        });

    const [currentStock, setCurrentStock] = useState<Ingredient[]>(() => {
            const exist = localStorage.getItem("currentStockList");
            return ((exist) ? JSON.parse(exist) : defaultList);
        });

    useEffect( () => {
        localStorage.setItem("mealHistoryList", JSON.stringify(mealHistory))
    }, [mealHistory])

    const [currentModalRecipe, setCurrentModalRecipe] = useState<Recipe | null>(null);

    const handleOpenHistoryModal = (currentRecipe : Recipe) => {
        setCurrentModalRecipe(currentRecipe);
    };

    const handleCloseHistoryModal = () => {
        setCurrentModalRecipe(null);
    }

    const quotes: string[] = [
    "« Bien manger, c’est le début du bonheur. » – Julia Child",
    "« Un repas équilibré, c’est une pizza dans chaque main. »",
    "« Laisser mijoter, c’est aimer sans précipitation. »",
    "« Le secret d’une bonne recette, c’est de la faire avec amour. »",
    "« Manger est un besoin, savoir manger est un art. » – François de La Rochefoucauld",
    "« La gastronomie est l’art d’utiliser la nourriture pour créer du bonheur. » – Theodore Zeldin"
    ];

    const [currentQuote, setCurrentQuote] = useState<string>(quotes[Math.floor(Math.random() * quotes.length)]);

    const handleChangeQuote = () => {
        setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    };

    const changeFavoriteState = (targetRecipe: Recipe) => {
        const newStatus = targetRecipe.Status === "favorite" ? "normal" : "favorite";

        toast[newStatus === "favorite" ? "success" : "error"](
            `${targetRecipe.RecipeName} a été ${newStatus === "favorite" ? "ajouté aux favoris" : "supprimé des favoris"}`
        );
    
        setmealHistory(prevHistory => prevHistory.map(
            weeklyMeal => weeklyMeal.map(
                recipe => recipe.RecipeName === targetRecipe.RecipeName
                    ? { ...recipe, Status: newStatus }
                    : recipe
            )
        ));
    
        setRecipeList(prevList => prevList.map(
            recipe => recipe.RecipeName === targetRecipe.RecipeName
                ? { ...recipe, Status: newStatus }
                : recipe
        ));

        localStorage.setItem("globalRecipeList", JSON.stringify(recipeList));
    };

    const [recipesToDelete, setRecipesToDelete] = useState<Recipe[] | null>(null);

    const handleOpenModal2 = (ingre : Recipe[]) => {
        setRecipesToDelete(ingre);
    }

    const handleCloseModal2 = () => {
        setRecipesToDelete(null)
    }

    const handleCancelDelete = () => {
        setRecipesToDelete(null);
    }

    const deleteFromHistory = () => {
        if (!recipesToDelete) return;

        const updatedList = mealHistory.filter(e => e !== recipesToDelete);
        setmealHistory(updatedList);
        localStorage.setItem("mealHistoryList", JSON.stringify(updatedList));
        toast.success(`${recipesToDelete?.[0].RecipeName} et ${recipesToDelete?.[1].RecipeName} ont bien été supprimés`)
        setRecipesToDelete(null);
        handleCloseModal2();
    };

    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

    const handleOpenModal4 = (recipe : Recipe) => {
        setSelectedRecipe(recipe);
    }

    const handleCloseModal4 = () => {
        setSelectedRecipe(null)
    }

    const stockDeduction = (groceryList: string[]) => {
        if (!groceryList || !currentStock) return;

        const filteredGroceryList : string[] = [];

        for (const element of groceryList) {
            const parts = element.trim().split(" ");
            const numMatch = parts[0]?.match(/\d+/);
            const quantity = numMatch ? parseInt(numMatch[0], 10) : 0;

            if (quantity >= 10) {
                filteredGroceryList.push(element);
            }
        }

        if (!filteredGroceryList) return;

        const updatedStock = currentStock.map(item => {
            const match = filteredGroceryList.find(e => {
                const parts = e.trim().split(" ");
                const name = parts.slice(1).join(" ").split("(")[0].trim().toLowerCase();
                return item.Name.trim().toLowerCase().includes(name);
            });

            if (!match) return item;

            const numMatch = match.trim().split(" ")[0]?.match(/\d+/);
            const neededQuantity = numMatch ? parseInt(numMatch[0], 10) : 0;

            return {
                ...item,
                Quantity: Math.max(item.Quantity - neededQuantity, 0),
            };
        });

        setCurrentStock(updatedStock);
        localStorage.setItem("currentStockList", JSON.stringify(updatedStock));
        toast.success("Stocks mis à jour !");
        handleCloseModal4();
    };
    
    return(
        <>
        <div className="globalMealHistorySection">

            <div className='sectionHeader'><p>Meal History</p></div>

            <div className="quotePlacement">
                <p className='Quote' onClick={handleChangeQuote}>{currentQuote}</p>
            </div>

            {mealHistory.map((weeklyMeal, weekIndex) => (
                <div className="weekDisplay" key={weekIndex}>
                    <div className="weekId"><p>Week {weekIndex + 1}</p></div>
                    <div className="recipeContainner">
                        {weeklyMeal.map((recipe, recipeIndex) => (
                            <div className="recipeDisplay" key={recipeIndex}>
                                <img src={recipe.image}/>
                                <div className="textSubDiv">
                                    <h2>{recipe.RecipeName}</h2>
                                    <Bookmark 
                                        className='bookMarkIcon' 
                                        color={recipe.Status === "favorite" ? "#78dc7d" : "white"} 
                                        onClick={() => changeFavoriteState(recipe)} 
                                    />
                                    <X className='deleteIcon' onClick={() => handleOpenModal2(weeklyMeal)}></X>
                                    <p className='macrosPart'>{recipe.Macro}</p>
                                    <ShoppingCart className='ShoppingCartIcon' onClick={() => handleOpenModal4(recipe)}></ShoppingCart>
                                    <div className="centeredLinks">
                                        <button className="descBtn" onClick={() => handleOpenHistoryModal(recipe)}>Description</button>
                                    </div>
                                </div>
                            </div> 
                        ))}
                    </div>
                </div>
            ))}
        </div>

        {currentModalRecipe && (
            <div className="modalOverlay" onClick={handleCloseHistoryModal}>
                <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                    <h2>{currentModalRecipe.RecipeName}</h2>

                    <p><strong>Préparation :</strong> {currentModalRecipe.PrepTime}</p>
                    <p><strong>Cuisson :</strong> {currentModalRecipe.CookTime}</p>
                    <p><strong>Ingrédients :</strong> <br /><br />{currentModalRecipe.Ingredient.map((element, index) => (
                                <li key={index}>{element}</li>
                            ))}</p>
                    <p><strong>Instructions :</strong> <br /><br />{currentModalRecipe.Instructions}</p>
                    <p><strong>Macros :</strong> <br /><br />{currentModalRecipe.Macro}</p>
                    <button onClick={handleCloseHistoryModal}>Fermer</button>
                </div>
            </div>
        )}

        {recipesToDelete && (
            <div className="modalOverlay" onClick={handleCloseModal2}>
                <div className="deleteModalContent1" onClick={(e) => e.stopPropagation()}>
                    <div className="head1">
                        <h3>Confirmer la suppression</h3>
                        <div><X className='logo' onClick={handleCancelDelete}></X></div>
                    </div>
                  <p>Es-tu sûr de vouloir supprimer <strong>{recipesToDelete?.[0].RecipeName}</strong> et <strong>{recipesToDelete?.[1].RecipeName}</strong> ?<br/> Cette action est irréversible.</p>
                  <div className="deleteModalActions">
                    <button className="confirmDeleteBtn" onClick={deleteFromHistory}>Confirmer</button>
                    <button className="cancelDeleteBtn" onClick={handleCloseModal2}>Annuler</button>
                  </div>
                </div>
            </div>
        )}

        {selectedRecipe && (
            <div className="modalOverlay" onClick={handleCloseModal4}>
                <div className="deleteModalContent" onClick={(e) => e.stopPropagation()}>
                    <div className="head">
                        <h3>Voulez vous déduire cette recette des Stocks ?</h3>
                        <div><X className='logo' onClick={handleCloseModal4}></X></div>
                    </div>
                <p>Cette action concerne : </p>
                {selectedRecipe.Ingredient
                    .filter(e => {
                        const parts = e.trim().split(" ");
                        const numMatch = parts[0]?.match(/\d+/);
                        const quantity = numMatch ? parseInt(numMatch[0], 10) : 0;
                        return quantity >= 10;
                    })
                    .map((e, index) => (
                        <li key={index}>{e}</li>
                    ))
                }
                <div className="deleteModalActions">
                    <button className="confirmDeleteBtn" onClick={() => stockDeduction(selectedRecipe.Ingredient)}>Confirmer</button>
                    <button className="cancelDeleteBtn" onClick={handleCloseModal4}>Annuler</button>
                  </div>
                </div>
            </div>
        )}
        </>
    )
}

export default MealHistory;