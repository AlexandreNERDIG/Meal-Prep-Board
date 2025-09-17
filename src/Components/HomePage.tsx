import { useState, useEffect } from 'react';
import './HomePage.css';
import { X, Smartphone} from 'react-feather';
import toast from 'react-hot-toast';
import { Recipe, Ingredient, RecipeInfo, defaultList } from './typeFile';
import axios from 'axios';

const HomePage = () => {

    const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1416785367654465699/T9fFJvBWwqqNCRHHwNr1GU1ckkgY_fvT1d5FiKindKJuG45_ZK_vMxAd_h5bKxmt9tWH';

    const RECIPES_KEY = "globalRecipeList";

    useEffect(() => {
        if (!localStorage.getItem(RECIPES_KEY)) {
            localStorage.setItem(RECIPES_KEY, JSON.stringify(RecipeInfo));
        }
    }, []);

    const [weeklyRecipe1, setWeeklyRecipe1] = useState<number>(0);
    const [weeklyRecipe2, setWeeklyRecipe2] = useState<number>(2);
    
    const [mealHistory, setmealHistory] = useState<Recipe[][]>(() => {
        const saved = localStorage.getItem("mealHistoryList");
        return ((saved) ? JSON.parse(saved) : [{
            "RecipeName": "Bœuf Bourguignon",
            "Ingredient": [
              "1000g Boeuf",
              "180g Carotte",
              "160g Oignon",
              "250mL Vin Rouge",
              "250mL Bouillon de Bœuf",
              "10g Ail",
              "10g Farine",
              "Sel et Poivre"
            ],
            "Macro": "450 Calories | 15 g C | 38 g P | 22 g F",
            "PrepTime": "20 min",
            "CookTime": "3h",
            "Instructions": "Faites revenir le bœuf dans l'huile, ajoutez 2 oignons (160g), 3 carottes (180g), et 2 gousses d'ail (10g). Saupoudrez de farine, versez le vin, le bouillon et laissez mijoter 2h30.",
            "image": "../img/boeuf-bourgignon.jpg",
            "Status": "normal"
        },
        {
            "RecipeName": "Poulet Basquaise",
            "Ingredient": [
              "750g Cuisse de Poulet",
              "240g Poivron",
              "240g Tomate",
              "160g Oignon",
              "10g Ail",
              "200mL Bouillon de Volaille",
              "5g Paprika",
              "15mL Huile d'Olive",
              "Sel et Poivre"
            ],
            "Macro": "400 Calories | 12 g C | 35 g P | 22 g F",
            "PrepTime": "15 min",
            "CookTime": "1h30",
            "Instructions": "Faites revenir le poulet dans l'huile. Ajoutez 2 oignons (160g), 2 poivrons (240g), et 2 gousses d'ail (10g). Versez le bouillon et laissez mijoter 1h.",
            "image": "../img/poulet-basquaise.jpg",
            "Status": "normal"
        }])
    });

    const [recipeList] = useState<Recipe[]>(() => {
        const saved = localStorage.getItem(RECIPES_KEY);
        return ((saved) ? JSON.parse(saved) : RecipeInfo)
    });

    const [currentStock, setCurrentStock] = useState<Ingredient[]>(() => {
            const exist = localStorage.getItem("currentStockList");
            return ((exist) ? JSON.parse(exist) : defaultList);
    });
    
    const getRecipeScore = (recipe : Recipe) => {
        let score = 1;

        if (recipe.Status === "favorite") score += 2;

        recipe.Ingredient.forEach(ing => {
            const ingParts = ing.split(" ");
            const numMatch = ingParts[0].match(/\d+/); 
            const ingNum = numMatch ? parseInt(numMatch[0], 10) : 0;
            const ingName = ingParts.slice(1).join(" ");

            const found = currentStock.find(s => s.Name.toLowerCase().includes(ingName.toLowerCase()) && s.Quantity >= ingNum);
            if (found) {
              if (found.Category === "Protéine") score += 1;
              else if (found.Category === "Féculent" || found.Category === "Légumes") score += 0.5;
            }
        });

        const last3weeks = mealHistory.slice(-3).flat();

        if (last3weeks.some(r => r.RecipeName === recipe.RecipeName)) {
            score -= 2 
        } else {
            score += 1
        }

        return score;
    }

    const sortedChosenRecipe = () => {
        const scoredRecipes = recipeList.map(recipe => ({
            recipe,
            score: getRecipeScore(recipe)
        }));
        scoredRecipes.forEach(e => console.log(e.score, e.recipe.RecipeName));
        scoredRecipes.sort((a, b) => b.score - a.score);
        return scoredRecipes.map(item => item.recipe);
    }

    const generateRecipe = () => {
        const topRecipes = sortedChosenRecipe().slice(0, 6); 
        let firstIndex = Math.floor(Math.random() * topRecipes.length);
        let secondIndex;
        do {
            secondIndex = Math.floor(Math.random() * topRecipes.length);
        } while (secondIndex === firstIndex);

        setWeeklyRecipe1(recipeList.indexOf(topRecipes[firstIndex]));
        setWeeklyRecipe2(recipeList.indexOf(topRecipes[secondIndex]));
    };

    const ReplaceRecipe1 = () => {
        let randomNumber = Math.floor(Math.random() * (recipeList.length));
        if (weeklyRecipe1 !== randomNumber) {
            setWeeklyRecipe1(randomNumber);
        }
    }

    const ReplaceRecipe2 = () => {
        let randomNumber = Math.floor(Math.random() * (recipeList.length));
        if (weeklyRecipe2 !== randomNumber) {
            setWeeklyRecipe2(randomNumber);
        }
    }

    const [modalState6, setModalState6] = useState<Boolean>(false);

    const handleOpenConfirmationModal6 = () => {
        setModalState6(true);
    }

    const handleCloseConfirmationModal6 = () => {
        setModalState6(false);
    }

    const WeeklyGroceries = (recipeList: Recipe[], weeklyRecipe1: number, weeklyRecipe2: number, currentStock: Ingredient[]): [string[], string[]] => {
        const mergedGroceryMap = new Map<string, { quantity: number; unit: string }>();

        const addIngredients = (ingredients: string[]) => {
            for (const ingre of ingredients) {
                const parts = ingre.trim().split(" ");
                const numMatch = parts[0]?.match(/\d+/);
                const quantity = numMatch ? parseInt(numMatch[0], 10) : 0;
                const unitMatch = parts[0]?.match(/[a-zA-Z]+/);
                const unit = unitMatch ? unitMatch[0] : "g";

                const name = parts.slice(1).join(" ").trim().toLowerCase();

                const existing = mergedGroceryMap.get(name);
                if (existing) {
                    mergedGroceryMap.set(name, { quantity: existing.quantity + quantity, unit });
                } else {
                    mergedGroceryMap.set(name, { quantity, unit });
                }
            }
        };

        addIngredients(recipeList[weeklyRecipe1]?.Ingredient || []);
        addIngredients(recipeList[weeklyRecipe2]?.Ingredient || []);

        const availableGroceryList: string[] = [];
        const notAvailableGroceryList: string[] = [];

        mergedGroceryMap.forEach((data, name) => {
            const stockItem = currentStock.find(item => item.Name.trim().toLowerCase() === name); 
            const stockQty = stockItem?.Quantity || 0; 

            if (stockQty >= data.quantity && data.quantity >= 10) {
                availableGroceryList.push(`${data.quantity}${data.unit} ${name} (en stock: ${stockQty}${data.unit})`); 
            } 
            
            else if (stockQty > 0 && data.quantity > stockQty && data.quantity >= 10) {
                availableGroceryList.push(`${stockQty}${data.unit} ${name} (Besoin de: ${data.quantity}${data.unit})`); 
            };
            
            const qtyToBuy = Math.max(data.quantity - stockQty, 0); 
            if (qtyToBuy > 0 && data.quantity >= 10) {
                notAvailableGroceryList.push(`${qtyToBuy}${data.unit} ${name}`);
            } 
        });

        return [availableGroceryList, notAvailableGroceryList];
    };

    const stockDeduction = (groceryList: string[]) => {
        if (!groceryList || !currentStock) return;

        const updatedStock = currentStock.map(item => {
            const match = groceryList.find(e => {
                const parts = e.trim().split(" ");
                const name = parts.slice(1).join(" ").split("(")[0].trim().toLowerCase();
                return item.Name.trim().toLowerCase() === name;
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
        handleCloseConfirmationModal6();
    };

    useEffect(() => {
        const [available, notAvailable] = WeeklyGroceries(recipeList, weeklyRecipe1, weeklyRecipe2, currentStock);
        setAvailableGroceryList(available);
        setNotAvailableGroceryList(notAvailable);
    }, [weeklyRecipe1, weeklyRecipe2, currentStock, recipeList]);
    
    const DailyMacros = () : string[] | null => {
        let NumTab1 = recipeList[weeklyRecipe1].Macro.match(/\d+/g)
        let NumTab2 = recipeList[weeklyRecipe2].Macro.match(/\d+/g)
        let ConstArr = ["Calories", "Carbs", "Proteines", "Fat"]
        let FinalArr = [""]
        if (NumTab1 == null || NumTab2 == null) {
            return null
        }
        for (let i =0; i < NumTab1.length; i++) {
            let ValeurFinale = +NumTab1[i] + +NumTab2[i]
            FinalArr.push(ValeurFinale + " " + ConstArr[i])
        }
        return FinalArr;
    }

    const WeeklyMacros = () : string[] | null => {
        let NumTab1 = recipeList[weeklyRecipe1].Macro.match(/\d+/g)
        let NumTab2 = recipeList[weeklyRecipe2].Macro.match(/\d+/g)
        let ConstArr = ["Calories", "Carbs", "Proteines", "Fat"]
        let FinalArr = [""]
        if (NumTab1 == null || NumTab2 == null) {
            return null
        }
        for (let i =0; i < NumTab1.length; i++) {
            let ValeurFinale = (+NumTab1[i] * 5) + (+NumTab2[i] * 5)
            FinalArr.push(ValeurFinale + " " + ConstArr[i])
        }
        return FinalArr;
    }

    const confirmedChoices = () => {
        const newRecipes = [
            recipeList[weeklyRecipe1],
            recipeList[weeklyRecipe2]
        ];
        const updatedHistory = [...mealHistory, newRecipes];
        setmealHistory(updatedHistory);
        localStorage.setItem("mealHistoryList", JSON.stringify(updatedHistory))
        toast.success("Recettes ajoutées à l'historique !");
        handleCloseConfirmationModal();
    };

    const dailyMacros = DailyMacros();
    const weeklyMacros = WeeklyMacros();
    const weeklyGroceries = WeeklyGroceries(recipeList, weeklyRecipe1, weeklyRecipe2, currentStock);
    const [availableGroceryList, setAvailableGroceryList] = useState(weeklyGroceries[0]);
    const [notAvailableGroceryList, setNotAvailableGroceryList] = useState(weeklyGroceries[1]);


    const [askConfirmation, setAskConfirmation] = useState<boolean>(false);

    const handleOpenConfirmationModal = () => {
        setAskConfirmation(true);
    }

    const handleCloseConfirmationModal = () => {
        setAskConfirmation(false);
    }

    const [askConfirmation5, setAskConfirmation5] = useState<boolean>(false);

    const handleOpenConfirmationModal5 = () => {
        setAskConfirmation5(true);
    }

    const handleCloseConfirmationModal5 = () => {
        setAskConfirmation5(false);
    }
    
    const sendGroceryList = async (list: string[]) => {
        
        const message = {
            content: `🛒 **Liste de courses non disponibles :**\n${list.map(item => `• ${item}`).join('\n')}`,
        };
      
        try {
            await axios.post(DISCORD_WEBHOOK_URL, message);
            console.log('✅ Liste envoyée sur Discord !');
        } catch (error) {
            console.error('❌ Erreur lors de l’envoi :', error);
        }

        toast.success("Liste de course envoyé");
        handleCloseConfirmationModal5();
    };

    const handleConfirmClick = async () => {
        const [available, notAvailable] = WeeklyGroceries(recipeList, weeklyRecipe1, weeklyRecipe2, currentStock);
        setAvailableGroceryList(available);
        setNotAvailableGroceryList(notAvailable);

        await sendGroceryList(notAvailable);
        handleOpenConfirmationModal6(); 
    };

    return(
        <>
        <div className="globalHomeSection">

            <div className='sectionHeader'><p>Home Page</p></div>
            <div className="generateButton"><p onClick={generateRecipe}>Generate Weekly Recipe</p></div>

           {recipeList.length > 0 && (
                <div className="RecipeDisplay">
                    <div className="recipe">
                        <img src={recipeList[weeklyRecipe1]?.image} />
                        <div className="recipeDetails">
                            <h2>{recipeList[weeklyRecipe1]?.RecipeName}</h2>
                            <ul>
                                {recipeList[weeklyRecipe1]?.Ingredient.map((element, index) => (
                                    <li key={index}>{element}</li>
                                ))}
                            </ul>
                            <h5>{recipeList[weeklyRecipe1]?.Macro}</h5>
                            <div className="replaceButton"><p onClick={ReplaceRecipe1}>Replace Recipe</p></div>
                        </div>
                    </div>
                    <div className="recipe">
                        <div className="recipeDetails">
                            <h2>{recipeList[weeklyRecipe2]?.RecipeName}</h2>
                            <ul>
                                {recipeList[weeklyRecipe2]?.Ingredient.map((element, index) => (
                                    <li key={index}>{element}</li>
                                ))}
                            </ul>
                            <h5>{recipeList[weeklyRecipe2]?.Macro}</h5>
                            <div className="replaceButton"><p onClick={ReplaceRecipe2}>Replace Recipe</p></div>
                        </div>
                        <img src={recipeList[weeklyRecipe2]?.image}/>
                    </div>
                </div>
            )}

            <div className="NutritionSection">
                <div className="sectionHeader"><p>Weekly Intakes</p></div>
                <div className="WeeklyInfos">
                    <div className="subMacro">
                            <h3 className='MacrosSubPart'>Daily Macros : </h3>
                            {dailyMacros ? dailyMacros.map((element, index) => (
                                <p key={index}>{element}</p>
                            ))
                            : <p>{"Pas d'info mais Hassoul ca devrait pas arriver"}</p>}
                    </div>
                    <div className="subMacro">
                            <h3 className='MacrosSubPart'>Weekly Macros : </h3>
                            {weeklyMacros ? weeklyMacros.map((element, index) => (
                            <p key={index}>{element}</p> 
                            ))
                            : <p>{"Pas d'info mais Hassoul ca devrait pas arriver"}</p>}
                    </div>
                </div>
            </div>

            <div className="centeredButtonDiv">
                <div className="confirmationButtonSection" onClick={handleOpenConfirmationModal}>Confirm Meal Choices</div>
                <div className="SMSIcon" onClick={handleOpenConfirmationModal5}><Smartphone></Smartphone></div>
            </div>

        </div>

        {askConfirmation && (
            <div className="modalOverlay" onClick={handleCloseConfirmationModal}>
                <div className="deleteModalContent" onClick={(e) => e.stopPropagation()}>
                    <div className="head">
                        <h3>Etes-vous sûre de vouloir ajouté la recette ?</h3>
                        <div><X className='logo' onClick={handleCloseConfirmationModal}></X></div>
                    </div>
                  <p>Cette action n'est pas définitive et peut être annulé dans la rubrique <strong>"Meal History"</strong>.</p>
                  <div className="deleteModalActions">
                    <button className="confirmDeleteBtn" onClick={confirmedChoices}>Confirmer</button>
                    <button className="cancelDeleteBtn" onClick={handleCloseConfirmationModal}>Annuler</button>
                  </div>
                </div>
            </div>
        )}

        {askConfirmation5 && (
            <div className="modalOverlay" onClick={handleCloseConfirmationModal5}>
                <div className="deleteModalContent4" onClick={(e) => e.stopPropagation()}>
                    <div className="head">
                        <h3>Etes-vous sûre de vouloir envoyer la liste de course ?</h3>
                        <div><X className='logo' onClick={handleCloseConfirmationModal5}></X></div>
                    </div>

                    <h3 className='titleH3'>Ingrédient Disponible</h3>
                    <div className="ingreList">
                        {availableGroceryList.map(element => (
                            <p>{element}</p>
                        ))}
                    </div>

                    <h3 className='titleH3'>Ingrédient Manquant</h3>
                    <div className="ingreList">
                        {notAvailableGroceryList.map(element => (
                            <p>{element}</p>
                        ))}
                    </div>

                    <div className="deleteModalActions">
                        <button 
                            className="confirmDeleteBtn" onClick={handleConfirmClick}>Confirmer</button>
                        <button className="cancelDeleteBtn" onClick={handleCloseConfirmationModal5}>Annuler</button>
                    </div>
                </div>
            </div>
        )}

        {modalState6 && (
            <div className="modalOverlay" onClick={handleCloseConfirmationModal6}>
                <div className="deleteModalContent" onClick={(e) => e.stopPropagation()}>
                    <div className="head">
                        <h3>Voulez vous actualiser les stocks Automatiquement ?</h3>
                        <div><X className='logo' onClick={handleCloseConfirmationModal6}></X></div>
                    </div>
                  <p>Cette action n'est pas définitive, vous pourrez toujours actualiser les stocks dans <strong>"Meal History"</strong>.</p>
                  <div className="deleteModalActions">
                    <button className="confirmDeleteBtn" onClick={() => stockDeduction(availableGroceryList)}>Confirmer</button>
                    <button className="cancelDeleteBtn" onClick={handleCloseConfirmationModal6}>Annuler</button>
                  </div>
                </div>
            </div>
        )}
        </>
    )
}

export default HomePage;