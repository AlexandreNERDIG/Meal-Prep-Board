import { useState } from 'react';
import { MinusCircle, PlusCircle } from 'react-feather';
import { useT } from '../i18n/LanguageProvider';
import { MAX_PORTIONS, MIN_PORTIONS, loadGeneratorOptions, saveGeneratorOptions } from '../lib/recipeGenerator';

const HouseholdPanel = () => {
    const { t } = useT();
    const [portions, setPortions] = useState<number>(() => loadGeneratorOptions().portions);

    const change = (value: number) => {
        const next = Math.min(MAX_PORTIONS, Math.max(MIN_PORTIONS, value));
        setPortions(next);
        saveGeneratorOptions({ ...loadGeneratorOptions(), portions: next });
    };

    return (
        <div className="backupPanel">
            <h3>{t("household.title")}</h3>
            <p>{t("household.hint")}</p>
            <div className="genGroup">
                <span className="genLabel">{t("household.portions")}</span>
                <div className="genStepper">
                    <MinusCircle aria-label="-" onClick={() => change(portions - 1)} />
                    <span className="genCount">{portions}</span>
                    <PlusCircle aria-label="+" onClick={() => change(portions + 1)} />
                </div>
            </div>
        </div>
    );
};

export default HouseholdPanel;
