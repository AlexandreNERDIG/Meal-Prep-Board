import { useState, useEffect } from 'react';
import './HomePage.css';
import { X, Smartphone} from 'react-feather';
import toast from 'react-hot-toast';
import { Recipe, Ingredient, recipeInfo, defaultList, RecipeIngredient } from './typeFile';
import axios from 'axios';
import { calcRecipeMacros, calcRecipeCost, formatMacros, formatPrice, isStockTracked, loadRecipes, loadMealHistory, DEFAULT_PORTIONS } from '../lib/recipeUtils';
import MacroSummary from './MacroSummary';
import BackupPanel from './BackupPanel';

const HomePage = () => {

    const RECIPES_KEY = "globalRecipeList";

    useEffect(() => {
        if (!localStorage.getItem(RECIPES_KEY)) {
            localStorage.setItem(RECIPES_KEY, JSON.stringify(recipeInfo));
        }
    }, []);

    const [weeklyRecipe1, setWeeklyRecipe1] = useState<number>(0);
    const [weeklyRecipe2, setWeeklyRecipe2] = useState<number>(1);
    const [mealHistory, setmealHistory] = useState<Recipe[][]>(loadMealHistory);

    const [recipeList] = useState<Recipe[]>(loadRecipes);

    const [currentStock, setCurrentStock] = useState<Ingredient[]>(() => {
            const exist = localStorage.getItem("currentStockList");
            return ((exist) ? JSON.parse(exist) : defaultList);
    });

    const [discordWebHook, setDiscordWebHook] = useState<string>(() => {
        const saved = localStorage.getItem("discordWebhook");
        return ((saved) ? JSON.parse(saved) : "")
    });

    const [modalState6, setModalState6] = useState<Boolean>(false);
    const [askConfirmation, setAskConfirmation] = useState<boolean>(false);
    const [askConfirmation5, setAskConfirmation5] = useState<boolean>(false);
    const [modalState7, setModalState7] = useState<boolean>(false);
    
    const getRecipeScore = (recipe : Recipe) => {
        let score = 1;

        if (recipe.status === "favorite") score += 2;

        recipe.ingredient.forEach(ing => {
            const stockItem = currentStock.find(ele => ele.id == ing.ingredientId);
            const ingNum = ing.quantity ? ing.quantity : 0;

            if (stockItem && stockItem.quantity >= ingNum) {
              if (stockItem.category === "Protéine") score += 1;
              else if (stockItem.category === "Féculent" || stockItem.category === "Légumes") score += 0.5;
            }
        });

        const last3weeks = mealHistory.slice(-3).flat();

        if (last3weeks.some(r => r.recipeName === recipe.recipeName)) {
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
        scoredRecipes.forEach(e => console.log(e.score, e.recipe.recipeName));
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

    const handleOpenConfirmationModal = () => {setAskConfirmation(true)};
    const handleCloseConfirmationModal = () => {setAskConfirmation(false)};
    const handleOpenConfirmationModal5 = () => {setAskConfirmation5(true)};
    const handleCloseConfirmationModal5 = () => {setAskConfirmation5(false)};
    const handleOpenConfirmationModal6 = () => {setModalState6(true)};
    const handleCloseConfirmationModal6 = () => {setModalState6(false)};
    const handleOpenModal7 = () => {setModalState7(true)};
    const handleCloseModal7 = () => {setModalState7(false)};
    const handleChange = (e : React.ChangeEvent<HTMLInputElement>) => {setDiscordWebHook(e.target.value)};

    const handleDiscordWebHook = () => {
        const regex = /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[A-Za-z0-9_-]+$/;

        if (regex.test(discordWebHook)) {
            toast.success("Le discord Web Hook est maintenant fonctionnel");
            localStorage.setItem("discordWebhook", JSON.stringify(discordWebHook));
            handleCloseModal7();
        } else {
            toast.error("Le discord Web Hook n'est pas valide");
        }
    };

    const WeeklyGroceries = (recipeList: Recipe[], weeklyRecipe1: number, weeklyRecipe2: number, currentStock: Ingredient[]): [string[], string[]] => {
        const mergedGroceryMap = new Map<string, { quantity: number; unit: string }>();

        const addIngredients = (ingredients: RecipeIngredient[]) => {
            for (const ingre of ingredients) {
                const ing = currentStock.find(ele => ele.id == ingre.ingredientId);
                if (!ing || !isStockTracked(ing)) continue;
                const name = ing.name;

                const numMatch = ingre.quantity;
                const quantity = numMatch ? numMatch : 0;

                const unitMatch = ing?.unit;
                const unit = unitMatch ? unitMatch : "g";

                const existing = mergedGroceryMap.get(name);
                if (existing) {
                    mergedGroceryMap.set(name, { quantity: existing.quantity + quantity, unit });
                } else {
                    mergedGroceryMap.set(name, { quantity, unit });
                }
            }
        };

        addIngredients(recipeList[weeklyRecipe1]?.ingredient || []);
        addIngredients(recipeList[weeklyRecipe2]?.ingredient || []);

        const availableGroceryList: string[] = [];
        const notAvailableGroceryList: string[] = [];

        mergedGroceryMap.forEach((data, name) => {
            const stockItem = currentStock.find(item => item.name.trim().toLowerCase() === name.trim().toLowerCase());
            const stockQty = stockItem?.quantity || 0; 

            if (stockQty >= data.quantity && data.quantity > 0) {
                availableGroceryList.push(`${data.quantity}${data.unit} ${name} (en stock: ${stockQty}${data.unit})`); 
            } 
            
            else if (stockQty > 0 && data.quantity > stockQty) {
                availableGroceryList.push(`${stockQty}${data.unit} ${name} (Besoin de: ${data.quantity}${data.unit})`); 
            };
            
            const qtyToBuy = Math.max(data.quantity - stockQty, 0); 
            if (qtyToBuy > 0) {
                notAvailableGroceryList.push(`${qtyToBuy}${data.unit} ${name}`);
            } 
        });

        return [availableGroceryList, notAvailableGroceryList];
    };

    const stockDeduction = (groceryList: string[]) => {
        if (!groceryList || !currentStock) return;

        const parseGroceryLine = (line: string) => {
            const parsed = line.trim().match(/^(\d+(?:\.\d+)?)\s*(?:g|mL|unités)?\s+(.+?)(?:\s+\((?:en stock|Besoin de):.*\))?$/);
            if (!parsed) return null;
            return { quantity: parseFloat(parsed[1]), name: parsed[2].trim().toLowerCase() };
        };

        const updatedStock = currentStock.map(item => {
            const match = groceryList
                .map(parseGroceryLine)
                .find(parsed => parsed !== null && parsed.name === item.name.trim().toLowerCase());

            if (!match) return item;

            return {
                ...item,
                quantity: Math.max(item.quantity - match.quantity, 0),
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

    const recipeMacroText = (recipe : Recipe | undefined) => {
        return recipe ? formatMacros(calcRecipeMacros(recipe.ingredient, currentStock)) : "";
    }

    const recipeCostText = (recipe : Recipe | undefined) => {
        if (!recipe) return "";
        const total = calcRecipeCost(recipe.ingredient, currentStock);
        return `${formatPrice(total)} (${formatPrice(total / DEFAULT_PORTIONS)} / portion)`;
    }

    const weeklyCost = (recipeList[weeklyRecipe1] && recipeList[weeklyRecipe2])
        ? calcRecipeCost(recipeList[weeklyRecipe1].ingredient, currentStock) + calcRecipeCost(recipeList[weeklyRecipe2].ingredient, currentStock)
        : 0;
    
    // Apports : on additionne les ingrédients des 2 recettes, puis on divise par le nombre de portions
    //  - par jour    : 1 portion de chaque recette (total / DEFAULT_PORTIONS)
    //  - la semaine  : les 2 recettes entières (total / 1)
    const weeklyRecipesReady = Boolean(recipeList[weeklyRecipe1] && recipeList[weeklyRecipe2]);
    const weeklyIngredients = weeklyRecipesReady
        ? [...recipeList[weeklyRecipe1].ingredient, ...recipeList[weeklyRecipe2].ingredient]
        : [];
    const dailyMacros = weeklyRecipesReady ? calcRecipeMacros(weeklyIngredients, currentStock, DEFAULT_PORTIONS) : null;
    const weeklyMacros = weeklyRecipesReady ? calcRecipeMacros(weeklyIngredients, currentStock, 1) : null;

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

    const weeklyGroceries = WeeklyGroceries(recipeList, weeklyRecipe1, weeklyRecipe2, currentStock);
    const [availableGroceryList, setAvailableGroceryList] = useState(weeklyGroceries[0]);
    const [notAvailableGroceryList, setNotAvailableGroceryList] = useState(weeklyGroceries[1]);
    
    const sendGroceryList = async (list: string[]) => {
        
        const message = {
            content: `🛒 **Liste de courses non disponibles :**\n${list.map(item => `• ${item}`).join('\n')}`,
        };
      
        try {
            await axios.post(discordWebHook, message);
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

    const whichModal = () => {
        const regex = /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[A-Za-z0-9_-]+$/;

        if (regex.test(discordWebHook)) {
            handleOpenConfirmationModal5();
        } else {
            handleOpenModal7();
        }
    }

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
                            <h2>{recipeList[weeklyRecipe1]?.recipeName}</h2>
                            <ul>
                                {recipeList[weeklyRecipe1]?.ingredient.map((element, index) => {
                                    const ing = currentStock.find(ingre => ingre.id == element.ingredientId)
                                    return (
                                        <li key={index}>{element.quantity}{ing?.unit} {ing?.name}</li>
                                    )
                                })}
                            </ul>
                            <h5>{recipeMacroText(recipeList[weeklyRecipe1])}</h5>
                            <h5>{recipeCostText(recipeList[weeklyRecipe1])}</h5>
                            <div className="replaceButton"><p onClick={ReplaceRecipe1}>Replace Recipe</p></div>
                        </div>
                    </div>
                    <div className="recipe">
                        <div className="recipeDetails">
                            <h2>{recipeList[weeklyRecipe2]?.recipeName}</h2>
                            <ul>
                                {recipeList[weeklyRecipe2]?.ingredient.map((element, index) => {
                                    const ing = currentStock.find(ingre => ingre.id == element.ingredientId)
                                    return (
                                        <li key={index}>{element.quantity}{ing?.unit} {ing?.name}</li>
                                    )
                                })}
                            </ul>
                            <h5>{recipeMacroText(recipeList[weeklyRecipe2])}</h5>
                            <h5>{recipeCostText(recipeList[weeklyRecipe2])}</h5>
                            <div className="replaceButton"><p onClick={ReplaceRecipe2}>Replace Recipe</p></div>
                        </div>
                        <img src={recipeList[weeklyRecipe2]?.image}/>
                    </div>
                </div>
            )}

            <div className="NutritionSection">
                <div className="sectionHeader"><p>Weekly Intakes</p></div>
                {dailyMacros && weeklyMacros ? (
                    <div className="macroCards">
                        <MacroSummary
                            title="Par jour"
                            subtitle="1 portion de chaque recette"
                            macros={dailyMacros}
                            cost={weeklyCost / DEFAULT_PORTIONS}
                            costLabel="par jour"
                        />
                        <MacroSummary
                            title="Sur la semaine"
                            subtitle={`${DEFAULT_PORTIONS} jours, 2 repas par jour`}
                            macros={weeklyMacros}
                            cost={weeklyCost}
                            costLabel="pour la semaine"
                        />
                    </div>
                ) : (
                    <p className="emptyHint">Génère les recettes de la semaine pour voir tes apports.</p>
                )}
            </div>

            <div className="centeredButtonDiv">
                <div className="confirmationButtonSection" onClick={handleOpenConfirmationModal}>Confirm Meal Choices</div>
                <div className="confirmationButtonSection" onClick={handleOpenModal7}>Discord Web Hook</div>
                <div className="SMSIcon" onClick={whichModal}><Smartphone></Smartphone></div>
            </div>

            <BackupPanel />

        </div>

        {/* Modal de confirmation d'ajout des recettes à l'historique */}

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

        {/* Modal de confirmation d'envoie de la liste de course */}

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
                        <button className="confirmDeleteBtn" onClick={handleConfirmClick}>Confirmer</button>
                        <button className="cancelDeleteBtn" onClick={handleCloseConfirmationModal5}>Annuler</button>
                    </div>
                </div>
            </div>
        )}

        {/* Modal de confirmation d'acutalisation des stocks Automatiquement ou Manuellement */}

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

        {/* Modal d'initialisation du WebHook */}

        {modalState7 && (
            <div className="modalOverlay" onClick={handleCloseModal7}>
                <div className="deleteModalContent" onClick={(e) => e.stopPropagation()}>
                    <div className="head">
                        <h3>Veuillez entrer le discord web hook à utiliser ?</h3>
                        <div><X className='logo' onClick={handleCloseModal7}></X></div>
                    </div>

                    <p>Cette action n'est pas définitive, vous pourrez toujours le changer en recliquant sur : <strong className='green'>"Discord Web Hook"</strong></p>
                    
                    <input type="text" onChange={handleChange} placeholder="https://discord.com/api/webhooks/1234567891234567891/T9fFJvBWwqqNCRHHwNr1GU1ckkgY_fvT1d5FiKindKJuG45_ZK_vMxAd_h5bKxmt9twh"/>
                    
                    <div className="deleteModalActions">
                        <button className="confirmDeleteBtn" onClick={handleDiscordWebHook}>Confirmer</button>
                        <button className="cancelDeleteBtn" onClick={handleCloseModal7}>Annuler</button>
                    </div>
                </div>
            </div>
        )}
        </>
    )
}

export default HomePage;