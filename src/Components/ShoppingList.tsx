import { useState } from 'react';
import toast from 'react-hot-toast';
import { Printer, Share2 } from 'react-feather';
import { useT } from '../i18n/LanguageProvider';
import type { Ingredient } from './typeFile';
import { INGREDIENT_CATEGORIES, categoryLabel, loadRecipes, unitLabel } from '../lib/recipeUtils';
import { buildShoppingItems, loadChecked, saveChecked } from '../lib/shopping';
import type { ShoppingItem } from '../lib/shopping';
import './ShoppingList.css';

const loadStock = (): Ingredient[] => {
    try {
        const saved: unknown = JSON.parse(localStorage.getItem("currentStockList") ?? "[]");
        return Array.isArray(saved) ? saved as Ingredient[] : [];
    } catch { return []; }
};

const ShoppingList = () => {
    const { t } = useT();
    const [items, setItems] = useState<ShoppingItem[]>(() => buildShoppingItems(loadRecipes(), loadStock()));
    const [checked, setChecked] = useState<string[]>(() => loadChecked());

    const line = (item: ShoppingItem) => `${item.toBuy}${unitLabel(item.unit)} ${item.name}`;
    const validChecked = checked.filter(id => items.some(item => item.id === id));

    const toggle = (id: string) => {
        const next = checked.includes(id) ? checked.filter(other => other !== id) : [...checked, id];
        setChecked(next);
        saveChecked(next);
    };

    const markBought = () => {
        const stock = loadStock();
        const bought = items.filter(item => validChecked.includes(item.id));
        const updated = stock.map(ingredient => {
            const match = bought.find(item => item.id === ingredient.id);
            return match ? { ...ingredient, quantity: Math.round((ingredient.quantity + match.toBuy) * 10) / 10 } : ingredient;
        });
        localStorage.setItem("currentStockList", JSON.stringify(updated));
        const remaining = items.filter(item => !validChecked.includes(item.id));
        setItems(remaining);
        setChecked([]);
        saveChecked([]);
        toast.success(t("shopping.stockUpdated"));
    };

    const shareText = () => `${t("shopping.shareTitle")}\n${items.map(item => `• ${line(item)}`).join('\n')}`;

    const share = async () => {
        const text = shareText();
        try {
            if (navigator.share) {
                await navigator.share({ text });
                return;
            }
            await navigator.clipboard.writeText(text);
            toast.success(t("shopping.copied"));
        } catch {
            toast.error(t("shopping.shareError"));
        }
    };

    return (
        <div className="globalShoppingSection">
            <div className="sectionHeader"><p>{t("page.shopping")}</p></div>

            {items.length === 0 ? (
                <p className="emptyHint">{t("shopping.empty")}</p>
            ) : (
                <>
                    <div className="shoppingActions">
                        <button type="button" className="fileBtn" onClick={() => void share()}><Share2 size={16} /> {t("shopping.share")}</button>
                        <button type="button" className="fileBtn" onClick={() => window.print()}><Printer size={16} /> {t("shopping.print")}</button>
                    </div>

                    {INGREDIENT_CATEGORIES.map(category => {
                        const group = items.filter(item => item.category === category);
                        if (group.length === 0) return null;
                        return (
                            <div className="shoppingGroup" key={category}>
                                <h3>{categoryLabel(category)}</h3>
                                {group.map(item => (
                                    <label className={`shoppingRow ${validChecked.includes(item.id) ? "done" : ""}`} key={item.id}>
                                        <input type="checkbox" checked={validChecked.includes(item.id)} onChange={() => toggle(item.id)} />
                                        <span>{line(item)}</span>
                                    </label>
                                ))}
                            </div>
                        );
                    })}

                    <div className="shoppingActions noPrint">
                        <button type="button" className="fileBtn" disabled={validChecked.length === 0} onClick={markBought}>
                            {t("shopping.bought", { count: validChecked.length })}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ShoppingList;
