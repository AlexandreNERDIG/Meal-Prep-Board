import { useState, useEffect } from 'react';
import './HomePage.css';
import { X, Smartphone} from 'react-feather';
import toast from 'react-hot-toast';
import { Recipe, Ingredient, recipeInfo, defaultList, RecipeIngredient } from './typeFile';
import axios from 'axios';
import { calcRecipeMacros, calcRecipeCost, formatMacros, formatPrice, isStockTracked, loadRecipes, loadMealHistory, DEFAULT_PORTIONS, unitLabel } from '../lib/recipeUtils';
import MacroSummary from './MacroSummary';
import BackupPanel from './BackupPanel';
import { useT } from '../i18n/LanguageProvider';

const HomePage = () => {

    const { t, tb } = useT();
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
            toast.success(t("home.toast.webhookOk"));
            localStorage.setItem("discordWebhook", JSON.stringify(discordWebHook));
            handleCloseModal7();
        } else {
            toast.error(t("home.toast.webhookBad"));
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
                availableGroceryList.push(t("home.grocery.inStock", { quantity: data.quantity, unit: unitLabel(data.unit), name, stock: stockQty })); 
            } 
            
            else if (stockQty > 0 && data.quantity > stockQty) {
                availableGroceryList.push(t("home.grocery.partial", { quantity: data.quantity, unit: unitLabel(data.unit), name, stock: stockQty })); 
            };
            
            const qtyToBuy = Math.max(data.quantity - stockQty, 0); 
            if (qtyToBuy > 0) {
                notAvailableGroceryList.push(`${qtyToBuy}${unitLabel(data.unit)} ${name}`);
            } 
        });

        return [availableGroceryList, notAvailableGroceryList];
    };

    const stockDeduction = (groceryList: string[]) => {
        if (!groceryList || !currentStock) return;

        const parseGroceryLine = (line: string) => {
            const parsed = line.trim().match(/^(\d+(?:\.\d+)?)\s*(?:g|mL|unités|units)?\s+(.+?)(?:\s+\((?:en stock|in stock|besoin de|need)\s*:.*\))?$/i);
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
        toast.success(t("home.toast.stockUpdated"));
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
        return `${formatPrice(total)} (${formatPrice(total / DEFAULT_PORTIONS)} ${t("price.perServing")})`;
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
        toast.success(t("home.toast.addedHistory"));
        handleCloseConfirmationModal();
    };

    const weeklyGroceries = WeeklyGroceries(recipeList, weeklyRecipe1, weeklyRecipe2, currentStock);
    const [availableGroceryList, setAvailableGroceryList] = useState(weeklyGroceries[0]);
    const [notAvailableGroceryList, setNotAvailableGroceryList] = useState(weeklyGroceries[1]);
    
    const sendGroceryList = async (list: string[]) => {
        
        const message = {
            content: `${t("home.discordMessage")}\n${list.map(item => `• ${item}`).join('\n')}`,
        };
      
        try {
            await axios.post(discordWebHook, message);
            console.log('✅ Liste envoyée sur Discord !');
        } catch (error) {
            console.error('❌ Erreur lors de l’envoi :', error);
        }

        toast.success(t("home.toast.listSent"));
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

            <div className='sectionHeader'><p>{t("page.home")}</p></div>
            <div className="generateButton"><p onClick={generateRecipe}>{t("home.generate")}</p></div>

           {recipeList.length > 0 && (
                <div className="RecipeDisplay">
                    <div className="recipe">
                        <img src={recipeList[weeklyRecipe1]?.image} alt={recipeList[weeklyRecipe1]?.recipeName}/>
                        <div className="recipeDetails">
                            <h2>{recipeList[weeklyRecipe1]?.recipeName}</h2>
                            <ul>
                                {recipeList[weeklyRecipe1]?.ingredient.map((element, index) => {
                                    const ing = currentStock.find(ingre => ingre.id == element.ingredientId)
                                    return (
                                        <li key={index}>{element.quantity}{ing ? unitLabel(ing.unit) : ""} {ing?.name}</li>
                                    )
                                })}
                            </ul>
                            <h5>{recipeMacroText(recipeList[weeklyRecipe1])}</h5>
                            <h5>{recipeCostText(recipeList[weeklyRecipe1])}</h5>
                            <div className="replaceButton"><p onClick={ReplaceRecipe1}>{t("home.replace")}</p></div>
                        </div>
                    </div>
                    <div className="recipe">
                        <div className="recipeDetails">
                            <h2>{recipeList[weeklyRecipe2]?.recipeName}</h2>
                            <ul>
                                {recipeList[weeklyRecipe2]?.ingredient.map((element, index) => {
                                    const ing = currentStock.find(ingre => ingre.id == element.ingredientId)
                                    return (
                                        <li key={index}>{element.quantity}{ing ? unitLabel(ing.unit) : ""} {ing?.name}</li>
                                    )
                                })}
                            </ul>
                            <h5>{recipeMacroText(recipeList[weeklyRecipe2])}</h5>
                            <h5>{recipeCostText(recipeList[weeklyRecipe2])}</h5>
                            <div className="replaceButton"><p onClick={ReplaceRecipe2}>{t("home.replace")}</p></div>
                        </div>
                        <img src={recipeList[weeklyRecipe2]?.image} alt={recipeList[weeklyRecipe2]?.recipeName}/>
                    </div>
                </div>
            )}

            <div className="NutritionSection">
                <div className="sectionHeader"><p>{t("home.weeklyIntakes")}</p></div>
                {dailyMacros && weeklyMacros ? (
                    <div className="macroCards">
                        <MacroSummary
                            title={t("home.perDay")}
                            subtitle={t("home.perDaySub")}
                            macros={dailyMacros}
                            cost={weeklyCost / DEFAULT_PORTIONS}
                            costLabel={t("home.perDayCost")}
                        />
                        <MacroSummary
                            title={t("home.week")}
                            subtitle={t("home.weekSub", { days: DEFAULT_PORTIONS })}
                            macros={weeklyMacros}
                            cost={weeklyCost}
                            costLabel={t("home.weekCost")}
                        />
                    </div>
                ) : (
                    <p className="emptyHint">{t("home.emptyHint")}</p>
                )}
            </div>

            <div className="centeredButtonDiv">
                <div className="confirmationButtonSection" onClick={handleOpenConfirmationModal}>{t("home.confirmMeals")}</div>
                <div className="confirmationButtonSection" onClick={handleOpenModal7}>{t("home.discord")}</div>
                <div className="SMSIcon" onClick={whichModal}><Smartphone></Smartphone></div>
            </div>

            <BackupPanel />

        </div>

        {/* Modal de confirmation d'ajout des recettes à l'historique */}

        {askConfirmation && (
            <div className="modalOverlay" onClick={handleCloseConfirmationModal}>
                <div className="deleteModalContent" onClick={(e) => e.stopPropagation()}>
                    <div className="head">
                        <h3>{t("home.confirmAdd.title")}</h3>
                        <div><X className='logo' onClick={handleCloseConfirmationModal}></X></div>
                    </div>
                  <p>{tb("home.confirmAdd.body", { page: t("page.history") })}</p>
                  <div className="deleteModalActions">
                    <button className="confirmDeleteBtn" onClick={confirmedChoices}>{t("common.confirm")}</button>
                    <button className="cancelDeleteBtn" onClick={handleCloseConfirmationModal}>{t("common.cancel")}</button>
                  </div>
                </div>
            </div>
        )}

        {/* Modal de confirmation d'envoie de la liste de course */}

        {askConfirmation5 && (
            <div className="modalOverlay" onClick={handleCloseConfirmationModal5}>
                <div className="deleteModalContent4" onClick={(e) => e.stopPropagation()}>
                    <div className="head">
                        <h3>{t("home.sendList.title")}</h3>
                        <div><X className='logo' onClick={handleCloseConfirmationModal5}></X></div>
                    </div>

                    <h3 className='titleH3'>{t("home.sendList.available")}</h3>
                    <div className="ingreList">
                        {availableGroceryList.map(element => (
                            <p>{element}</p>
                        ))}
                    </div>

                    <h3 className='titleH3'>{t("home.sendList.missing")}</h3>
                    <div className="ingreList">
                        {notAvailableGroceryList.map(element => (
                            <p>{element}</p>
                        ))}
                    </div>

                    <div className="deleteModalActions">
                        <button className="confirmDeleteBtn" onClick={handleConfirmClick}>{t("common.confirm")}</button>
                        <button className="cancelDeleteBtn" onClick={handleCloseConfirmationModal5}>{t("common.cancel")}</button>
                    </div>
                </div>
            </div>
        )}

        {/* Modal de confirmation d'acutalisation des stocks Automatiquement ou Manuellement */}

        {modalState6 && (
            <div className="modalOverlay" onClick={handleCloseConfirmationModal6}>
                <div className="deleteModalContent" onClick={(e) => e.stopPropagation()}>
                    <div className="head">
                        <h3>{t("home.autoStock.title")}</h3>
                        <div><X className='logo' onClick={handleCloseConfirmationModal6}></X></div>
                    </div>
                  <p>{tb("home.autoStock.body", { page: t("page.history") })}</p>
                  <div className="deleteModalActions">
                    <button className="confirmDeleteBtn" onClick={() => stockDeduction(availableGroceryList)}>{t("common.confirm")}</button>
                    <button className="cancelDeleteBtn" onClick={handleCloseConfirmationModal6}>{t("common.cancel")}</button>
                  </div>
                </div>
            </div>
        )}

        {/* Modal d'initialisation du WebHook */}

        {modalState7 && (
            <div className="modalOverlay" onClick={handleCloseModal7}>
                <div className="deleteModalContent" onClick={(e) => e.stopPropagation()}>
                    <div className="head">
                        <h3>{t("home.webhook.title")}</h3>
                        <div><X className='logo' onClick={handleCloseModal7}></X></div>
                    </div>

                    <p>{tb("home.webhook.body", { button: t("home.discord") })}</p>
                    
                    <input type="text" onChange={handleChange} placeholder="https://discord.com/api/webhooks/1234567891234567891/T9fFJvBWwqqNCRHHwNr1GU1ckkgY_fvT1d5FiKindKJuG45_ZK_vMxAd_h5bKxmt9twh"/>
                    
                    <div className="deleteModalActions">
                        <button className="confirmDeleteBtn" onClick={handleDiscordWebHook}>{t("common.confirm")}</button>
                        <button className="cancelDeleteBtn" onClick={handleCloseModal7}>{t("common.cancel")}</button>
                    </div>
                </div>
            </div>
        )}
        </>
    )
}

export default HomePage;