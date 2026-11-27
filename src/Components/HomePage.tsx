import { useState, useEffect } from 'react';
import './HomePage.css';
import { X, Smartphone, MinusCircle, PlusCircle } from 'react-feather';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Recipe, Ingredient, recipeInfo, defaultList, RecipeIngredient } from './typeFile';
import { calcRecipeMacros, calcRecipeCost, formatMacros, formatPrice, isStockTracked, loadRecipes, loadMealHistory, DEFAULT_PORTIONS, unitLabel, scaleQuantity } from '../lib/recipeUtils';
import MacroSummary from './MacroSummary';
import SafeImage from './SafeImage';
import { useT } from '../i18n/LanguageProvider';
import { loadWebhook, isValidWebhook } from '../lib/discord';
import {
    loadGeneratorOptions, saveGeneratorOptions, pickRecipes, pickReplacement, MIN_RECIPES, MAX_RECIPES, MIN_PORTIONS, MAX_PORTIONS,
    type GeneratorOptions, type FavoritesMode,
} from '../lib/recipeGenerator';
import { GOALS } from '../lib/goalScore';

type Translate = ReturnType<typeof useT>["t"];

const buildGroceryLists = (recipeList: Recipe[], weekly: number[], portions: number[], currentStock: Ingredient[], t: Translate): [string[], string[]] => {
    const mergedGroceryMap = new Map<string, { quantity: number; unit: string }>();

    const addIngredients = (ingredients: RecipeIngredient[], factor: number) => {
        for (const ingre of ingredients) {
            const ing = currentStock.find(ele => ele.id == ingre.ingredientId);
            if (!ing || !isStockTracked(ing)) continue;
            const name = ing.name;

            const numMatch = ingre.quantity;
            const quantity = numMatch ? scaleQuantity(numMatch, factor) : 0;

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

    weekly.forEach((index, position) => addIngredients(recipeList[index]?.ingredient || [], (portions[position] ?? DEFAULT_PORTIONS) / DEFAULT_PORTIONS));

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
        
        const qtyToBuy = Math.round(Math.max(data.quantity - stockQty, 0) * 10) / 10;
        if (qtyToBuy > 0) {
            notAvailableGroceryList.push(`${qtyToBuy}${unitLabel(data.unit)} ${name}`);
        } 
    });

    return [availableGroceryList, notAvailableGroceryList];
};

const HomePage = () => {

    const { t, tb } = useT();
    const navigate = useNavigate();
    const RECIPES_KEY = "globalRecipeList";
    const WEEK_KEY = "currentWeek";

    useEffect(() => {
        if (!localStorage.getItem(RECIPES_KEY)) {
            localStorage.setItem(RECIPES_KEY, JSON.stringify(recipeInfo));
        }
    }, []);

    const [mealHistory, setmealHistory] = useState<Recipe[][]>(loadMealHistory);
    const [recipeList] = useState<Recipe[]>(loadRecipes);
    const [initialWeek] = useState<{ weekly: number[]; portions: number[] }>(() => {
        // The generated week is stored by recipe name (with its portions), so it survives page changes and recipe list edits
        const startPortions = loadGeneratorOptions().portions;
        try {
            const saved: unknown = JSON.parse(localStorage.getItem(WEEK_KEY) ?? "null");
            if (Array.isArray(saved)) {
                const entries = saved
                    .map((entry: unknown) => {
                        const name = typeof entry === "string" ? entry : (entry as { name?: unknown })?.name;
                        const savedPortions = Number((entry as { portions?: unknown })?.portions);
                        return {
                            index: recipeList.findIndex(recipe => recipe.recipeName === name),
                            portions: Number.isInteger(savedPortions) && savedPortions >= MIN_PORTIONS && savedPortions <= MAX_PORTIONS ? savedPortions : startPortions,
                        };
                    })
                    .filter(entry => entry.index !== -1);
                if (entries.length > 0) return { weekly: entries.map(entry => entry.index), portions: entries.map(entry => entry.portions) };
            }
        } catch { /* corrupted value: fall back to the default week */ }
        const defaults = recipeList.slice(0, 2).map((_, index) => index);
        return { weekly: defaults, portions: defaults.map(() => startPortions) };
    });
    const [weekly, setWeekly] = useState<number[]>(initialWeek.weekly);
    // Number of servings cooked for each recipe of the week (same order as `weekly`)
    const [portions, setPortions] = useState<number[]>(initialWeek.portions);
    const weeklyRecipes = weekly.map(index => recipeList[index]);
    const portionsOf = (position: number): number => portions[position] ?? DEFAULT_PORTIONS;
    const factorOf = (position: number): number => portionsOf(position) / DEFAULT_PORTIONS;

    useEffect(() => {
        try {
            localStorage.setItem(WEEK_KEY, JSON.stringify(weekly.map((index, position) => ({
                name: recipeList[index]?.recipeName,
                portions: portions[position] ?? DEFAULT_PORTIONS,
            }))));
        } catch { /* storage unavailable: the week is only kept in memory */ }
    }, [weekly, portions, recipeList]);
    const [options, setOptions] = useState<GeneratorOptions>(loadGeneratorOptions);

    const [currentStock, setCurrentStock] = useState<Ingredient[]>(() => {
            const exist = localStorage.getItem("currentStockList");
            return ((exist) ? JSON.parse(exist) : defaultList);
    });

    const [discordWebHook] = useState<string>(loadWebhook);
    const [pinnedNames, setPinnedNames] = useState<string[]>([]);

    const [modalState6, setModalState6] = useState<boolean>(false);
    const [askConfirmation, setAskConfirmation] = useState<boolean>(false);
    const [askConfirmation5, setAskConfirmation5] = useState<boolean>(false);
    
    const updateOptions = (patch: Partial<GeneratorOptions>) => {
        const next = { ...options, ...patch };
        setOptions(next);
        saveGeneratorOptions(next);
    };

    const pinnedRecipes = pinnedNames
        .map(name => recipeList.find(recipe => recipe.recipeName === name))
        .filter((recipe): recipe is Recipe => recipe !== undefined);

    const pinRecipe = (name: string) => {
        if (!name || pinnedNames.includes(name)) return;
        if (pinnedNames.length >= options.count) {
            toast.error(t("gen.pinFull"));
            return;
        }
        setPinnedNames(current => [...current, name]);
    };

    const unpinRecipe = (name: string) => setPinnedNames(current => current.filter(item => item !== name));

    const generateRecipe = () => {
        const picked = pickRecipes(recipeList, options, currentStock, mealHistory, Math.random, pinnedRecipes);

        if (picked.length === 0) {
            toast.error(t("gen.none"));
            return;
        }

        setWeekly(picked.map(recipe => recipeList.indexOf(recipe)));
        setPortions(picked.map(() => options.portions));
        if (picked.length < options.count) toast(t("gen.fewer", { count: picked.length }));
    };

    const replaceRecipe = (position: number) => {
        const replacement = pickReplacement(recipeList, options, weeklyRecipes);
        if (!replacement) return;
        setWeekly(current => current.map((index, i) => (i === position ? recipeList.indexOf(replacement) : index)));
    };

    const changePortions = (position: number, delta: number) => {
        setPortions(current => current.map((value, i) => i === position ? Math.min(MAX_PORTIONS, Math.max(MIN_PORTIONS, value + delta)) : value));
    };

    const handleOpenConfirmationModal = () => {setAskConfirmation(true)};
    const handleCloseConfirmationModal = () => {setAskConfirmation(false)};
    const handleOpenConfirmationModal5 = () => {setAskConfirmation5(true)};
    const handleCloseConfirmationModal5 = () => {setAskConfirmation5(false)};
    const handleOpenConfirmationModal6 = () => {setModalState6(true)};
    const handleCloseConfirmationModal6 = () => {setModalState6(false)};
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

    const recipeMacroText = (recipe : Recipe | undefined) => {
        return recipe ? formatMacros(calcRecipeMacros(recipe.ingredient, currentStock)) : "";
    }

    // Price of what is cooked for this recipe (all its servings), then the price of one serving
    const recipeCostText = (recipe : Recipe | undefined, position: number) => {
        if (!recipe) return "";
        const perServing = calcRecipeCost(recipe.ingredient, currentStock) / DEFAULT_PORTIONS;
        return `${formatPrice(perServing * portionsOf(position))} (${formatPrice(perServing)} ${t("price.perServing")})`;
    }

    const weeklyCost = weeklyRecipes.reduce((total, recipe, position) => total + calcRecipeCost(recipe.ingredient, currentStock) * factorOf(position), 0);
    const totalPortions = weeklyRecipes.reduce((total, _recipe, position) => total + portionsOf(position), 0);

    const weeklyRecipesReady = weeklyRecipes.length > 0;
    const weeklyIngredients = weeklyRecipes.flatMap((recipe, position) =>
        recipe.ingredient.map(ingredient => ({ ...ingredient, quantity: ingredient.quantity * factorOf(position) }))
    );
    // Average meal = everything cooked this week divided by the number of servings
    const mealMacros = weeklyRecipesReady ? calcRecipeMacros(weeklyIngredients, currentStock, totalPortions) : null;
    const weeklyMacros = weeklyRecipesReady ? calcRecipeMacros(weeklyIngredients, currentStock, 1) : null;

    const confirmedChoices = () => {
        const newRecipes = weeklyRecipes.map((recipe, position) => ({ ...recipe, portions: portionsOf(position) }));
        const updatedHistory = [...mealHistory, newRecipes];
        setmealHistory(updatedHistory);
        localStorage.setItem("mealHistoryList", JSON.stringify(updatedHistory))
        toast.success(t("home.toast.addedHistory"));
        handleCloseConfirmationModal();
    };

    const [availableGroceryList, notAvailableGroceryList] = buildGroceryLists(recipeList, weekly, portions, currentStock, t);
    
    const sendGroceryList = async (list: string[]) => {
        
        const message = {
            content: `${t("home.discordMessage")}\n${list.map(item => `• ${item}`).join('\n')}`,
        };
      
        try {
            const response = await fetch(discordWebHook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(message)
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            console.log('✅ Liste envoyée sur Discord !');
        } catch (error) {
            console.error('❌ Erreur lors de l’envoi :', error);
        }

        toast.success(t("home.toast.listSent"));
        handleCloseConfirmationModal5();
    };

    const handleConfirmClick = async () => {
        await sendGroceryList(notAvailableGroceryList);
        handleOpenConfirmationModal6(); 
    };

    // Sans webhook valide, on envoie la personne le configurer dans les Réglages
    const whichModal = () => {
        if (isValidWebhook(discordWebHook)) {
            handleOpenConfirmationModal5();
        } else {
            toast.error(t("home.toast.webhookMissing"));
            navigate("/Settings");
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

                <div className="genGroup goalGroup">
                    <span className="genLabel">{t("gen.goal")}</span>
                    <div className="genSegment" role="radiogroup" aria-label={t("gen.goal")}>
                        {GOALS.map(value => (
                            <button key={value} role="radio" aria-checked={options.goal === value} className={options.goal === value ? "active" : ""} onClick={() => updateOptions({ goal: value })}>{t(`gen.goal.${value}`)}</button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="pinnedRow">
                <span className="genLabel">{t("gen.pin")}</span>
                <select
                    className="pinSelect"
                    value=""
                    aria-label={t("gen.pin")}
                    onChange={(e) => pinRecipe(e.target.value)}
                >
                    <option value="">{t("gen.pinPlaceholder")}</option>
                    {recipeList
                        .filter(recipe => !pinnedNames.includes(recipe.recipeName))
                        .map(recipe => <option key={recipe.recipeName} value={recipe.recipeName}>{recipe.recipeName}</option>)}
                </select>
                {pinnedRecipes.map(recipe => (
                    <span className="pinChip" key={recipe.recipeName}>
                        {recipe.recipeName}
                        <X size={14} aria-label={t("gen.unpin")} onClick={() => unpinRecipe(recipe.recipeName)} />
                    </span>
                ))}
            </div>

            <div className="generateButton"><p onClick={generateRecipe}>{t("home.generate")}</p></div>

           {recipeList.length > 0 && (
                <div className="RecipeDisplay">
                    {weeklyRecipes.map((recipe, position) => {
                        const image = <div className="recipeImage"><SafeImage src={recipe.image} alt={recipe.recipeName}/></div>;
                        return (
                            <div className="recipe" key={`${position}-${weekly[position]}`}>
                                {position % 2 === 0 && image}
                                <div className="recipeDetails">
                                    <h2>{recipe.recipeName}</h2>
                                    <ul>
                                        {recipe.ingredient.map((element, index) => {
                                            const ing = currentStock.find(ingre => ingre.id == element.ingredientId)
                                            return (
                                                <li key={index}>{scaleQuantity(element.quantity, factorOf(position))}{ing ? unitLabel(ing.unit) : ""} {ing?.name}</li>
                                            )
                                        })}
                                    </ul>
                                    <h5>{recipeMacroText(recipe)}</h5>
                                    <h5>{recipeCostText(recipe, position)}</h5>
                                    <div className="portionsRow">
                                        <span className="genLabel">{t("home.portions")}</span>
                                        <div className="genStepper">
                                            <MinusCircle aria-label="-" onClick={() => changePortions(position, -1)} />
                                            <span className="genCount">{portionsOf(position)}</span>
                                            <PlusCircle aria-label="+" onClick={() => changePortions(position, 1)} />
                                        </div>
                                    </div>
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
                {mealMacros && weeklyMacros ? (
                    <div className="macroCards">
                        <MacroSummary
                            title={t("home.perDay")}
                            subtitle={t("home.perDaySub", { meals: totalPortions })}
                            macros={mealMacros}
                            cost={totalPortions > 0 ? weeklyCost / totalPortions : 0}
                            costLabel={t("home.perDayCost")}
                        />
                        <MacroSummary
                            title={t("home.week")}
                            subtitle={t("home.weekSub", { meals: totalPortions, recipes: weeklyRecipes.length })}
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
                <div className="SMSIcon" onClick={whichModal}><Smartphone></Smartphone></div>
            </div>

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

        </>
    )
}

export default HomePage;