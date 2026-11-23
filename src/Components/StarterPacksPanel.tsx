import { useState } from 'react';
import toast from 'react-hot-toast';
import { Download } from 'react-feather';
import { useT } from '../i18n/LanguageProvider';
import { isLanguage } from '../i18n/core';
import type { Language } from '../i18n/core';
import { loadRecipes } from '../lib/recipeUtils';
import { STARTER_PACKS, mergeStarterPack } from '../lib/starterRecipes';

const StarterPacksPanel = () => {
    const { t, language } = useT();
    const [pack, setPack] = useState<Language>(language);

    const handleAdd = () => {
        const { recipes, added } = mergeStarterPack(loadRecipes(), pack);
        if (added === 0) {
            toast(t("starter.none"));
            return;
        }
        localStorage.setItem("globalRecipeList", JSON.stringify(recipes));
        toast.success(t("starter.added", { count: added }));
    };

    return (
        <div className="backupPanel">
            <h3>{t("starter.title")}</h3>
            <p>{t("starter.hint")}</p>
            <select
                className="settingsInput"
                value={pack}
                aria-label={t("starter.title")}
                onChange={(e) => { if (isLanguage(e.target.value)) setPack(e.target.value); }}
            >
                {STARTER_PACKS.map(option => <option key={option.code} value={option.code}>{option.label}</option>)}
            </select>
            <div className="backupActions">
                <button type="button" className="fileBtn" onClick={handleAdd}>
                    <Download size={16} /> {t("starter.add")}
                </button>
            </div>
        </div>
    );
};

export default StarterPacksPanel;
