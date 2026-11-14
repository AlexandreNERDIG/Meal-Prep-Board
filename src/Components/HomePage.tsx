import { useState, useEffect } from 'react';
import './HomePage.css';
import { X, Smartphone, MinusCircle, PlusCircle, Heart } from 'react-feather';
import toast from 'react-hot-toast';
import { Recipe, Ingredient, recipeInfo, defaultList, RecipeIngredient } from './typeFile';
import axios from 'axios';
import { calcRecipeMacros, calcRecipeCost, formatMacros, formatPrice, isStockTracked, loadRecipes, loadMealHistory, DEFAULT_PORTIONS, unitLabel } from '../lib/recipeUtils';
import MacroSummary from './MacroSummary';
import BackupPanel from './BackupPanel';
import { useT } from '../i18n/LanguageProvider';
import {
    loadGeneratorOptions, saveGeneratorOptions, pickRecipes, pickReplacement, MIN_RECIPES, MAX_RECIPES,
    type GeneratorOptions, type FavoritesMode,
} from '../lib/recipeGenerator';

const HomePage = () => {

    const { t, tb } = useT();
    const RECIPES_KEY = "globalRecipeList";

    useEffect(() => {
        if (!localStorage.getItem(RECIPES_KEY)) {
            localStorage.setItem(RECIPES_KEY, JSON.stringify(recipeInfo));
        }
    }, []);

    const [mealHistory, setmealHistory] = useState<Recipe[][]>(loadMealHistory);
    const [recipeList] = useState<Recipe[]>(loadRecipes);
    const [weekly, setWeekly] = useState<number[]>(() => recipeList.slice(0, 2).map((_, index) => index));
    const weeklyRecipes = weekly.map(index => recipeList[index]);
    const [options, setOptions] = useState<GeneratorOptions>(loadGeneratorOptions);

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
    
    const updateOptions = (patch: Partial<GeneratorOptions>) => {
        const next = { ...options, ...patch };
        setOptions(next);
        saveGeneratorOptions(next);
    };

    const generateRecipe = () => {
        const picked = pickRecipes(recipeList, options, currentStock, mealHistory);

        if (picked.length === 0) {
            toast.error(t("gen.none"));
            return;
        }

        setWeekly(picked.map(recipe => recipeList.indexOf(recipe)));
        if (picked.length < options.count) toast(t("gen.fewer", { count: picked.length }));
    };

    const replaceRecipe = (position: number) => {
        const replacement = pickReplacement(recipeList, options, weeklyRecipes);
        if (!replacement) return;
        setWeekly(current => current.map((index, i) => (i === position ? recipeList.indexOf(replacement) : index)));
    };

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

    const WeeklyGroceries = (recipeList: Recipe[], weekly: number[], currentStock: Ingredient[]): [string[], string[]] => {
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

        weekly.forEach(index => addIngredients(recipeList[index]?.ingredient || []));

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
        const [available, notAvailable] = WeeklyGroceries(recipeList, weekly, currentStock);
        setAvailableGroceryList(available);
        setNotAvailableGroceryList(notAvailable);
    }, [weekly, currentStock, recipeList]);

    const recipeMacroText = (recipe : Recipe | undefined) => {
        return recipe ? formatMacros(calcRecipeMacros(recipe.ingredient, currentStock)) : "";
    }

    const recipeCostText = (recipe : Recipe | undefined) => {
        if (!recipe) return "";
        const total = calcRecipeCost(recipe.ingredient, currentStock);
        return `${formatPrice(total)} (${formatPrice(total / DEFAULT_PORTIONS)} ${t("price.perServing")})`;
    }

    const weeklyCost = weeklyRecipes.reduce((total, recipe) => total + calcRecipeCost(recipe.ingredient, currentStock), 0);

    const weeklyRecipesReady = weeklyRecipes.length > 0;
    const weeklyIngredients = weeklyRecipes.flatMap(recipe => recipe.ingredient);
    const dailyMacros = weeklyRecipesReady ? calcRecipeMacros(weeklyIngredients, currentStock, DEFAULT_PORTIONS) : null;
    const weeklyMacros = weeklyRecipesReady ? calcRecipeMacros(weeklyIngredients, currentStock, 1) : null;

    const confirmedChoices = () => {
        const newRecipes = [...weeklyRecipes];
        const updatedHistory = [...mealHistory, newRecipes];
        setmealHistory(updatedHistory);
        localStorage.setItem("mealHistoryList", JSON.stringify(updatedHistory))
        toast.success(t("home.toast.addedHistory"));
        handleCloseConfirmationModal();
    };

    const weeklyGroceries = WeeklyGroceries(recipeList, weekly, currentStock);
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
        const [available, notAvailable] = WeeklyGroceries(recipeList, weekly, currentStock);
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
            <div className="generatorPanel">
                <div className="genGroup">
                    <span className="genLabel">{t("gen.count")}</span>
                    <div className="genStepper">
                        <MinusCircle aria-label="-" onClick={() => updateOptions({ count: Math.max(MIN_RECIPES, options.count - 1) })} />
                        <span className="genCount">{options.count}</span>
                        <PlusCircle aria-label="+" onClick={() => updateOptions({ count: Math.min(MAX_RECIPES, options.count + 1) })} />
                    </div>
                </div>

                <div className="genGroup genGroupGrow">
                    <span className="genLabel">{t("gen.favorites")}</span>
                    <div className="genSegment" role="radiogroup" aria-label={t("gen.favorites")}>
                        {(["any", "prefer", "only"] as FavoritesMode[]).map(value => (
                            <button key={value} role="radio" aria-checked={options.favorites === value} className={options.favorites === value ? "active" : ""} onClick={() => updateOptions({ favorites: value })}>{t(`gen.fav.${value}`)}</button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="generateButton"><p onClick={generateRecipe}>{t("home.generate")}</p></div>

           {recipeList.length > 0 && (
                <div className="RecipeDisplay">
                    {weeklyRecipes.map((recipe, position) => {
                        const image = <img src={recipe.image} alt={recipe.recipeName}/>;
                        return (
                            <div className="recipe" key={`${position}-${weekly[position]}`}>
                                {position % 2 === 0 && image}
                                <div className="recipeDetails">
                                    <h2>{recipe.recipeName}</h2>
                                    <ul>
                                        {recipe.ingredient.map((element, index) => {
                                            const ing = currentStock.find(ingre => ingre.id == element.ingredientId)
                                            return (
                                                <li key={index}>{element.quantity}{ing ? unitLabel(ing.unit) : ""} {ing?.name}</li>
                                            )
                                        })}
                                    </ul>
                                    <h5>{recipeMacroText(recipe)}</h5>
                                    <h5>{recipeCostText(recipe)}</h5>
                                    <div className="replaceButton"><p onClick={() => replaceRecipe(position)}>{t("home.replace")}</p></div>
                                </div>
                                {position % 2 === 1 && image}
                            </div>
                        );
                    })}
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
                            subtitle={t("home.weekSub", { days: DEFAULT_PORTIONS, meals: weeklyRecipes.length })}
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