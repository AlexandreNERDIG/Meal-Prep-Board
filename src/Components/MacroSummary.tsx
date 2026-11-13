import type { Macros } from '../lib/recipeUtils';
import { calorieSplit, formatPrice } from '../lib/recipeUtils';
import { useT } from '../i18n/LanguageProvider';

type MacroSummaryProps = {
    title: string;
    subtitle: string;
    macros: Macros;
    cost: number;
    costLabel: string;
};

// Carte de résumé des apports
const MacroSummary = ({ title, subtitle, macros, cost, costLabel }: MacroSummaryProps) => {
    const { t, language } = useT();
    const split = calorieSplit(macros);

    const tiles = [
        { key: "carbs", label: t("macro.carbs"), value: macros.carbs, percent: split.carbs },
        { key: "protein", label: t("macro.protein"), value: macros.protein, percent: split.protein },
        { key: "fat", label: t("macro.fat"), value: macros.fat, percent: split.fat },
    ] as const;

    return (
        <div className="macroCard">
            <div className="macroCardHead">
                <h3>{title}</h3>
                <span>{subtitle}</span>
            </div>

            <div className="macroCalories">
                <strong>{macros.calories.toLocaleString(language === "fr" ? "fr-FR" : "en-US")}</strong>
                <span>kcal</span>
            </div>

            <div
                className="macroSplitBar"
                role="img"
                aria-label={t("home.splitAria", { carbs: split.carbs, protein: split.protein, fat: split.fat })}
            >
                {tiles.map(tile => (
                    <div key={tile.key} className={`macroSeg ${tile.key}`} style={{ width: `${tile.percent}%` }} />
                ))}
            </div>

            <div className="macroTiles">
                {tiles.map(tile => (
                    <div key={tile.key} className={`macroTile ${tile.key}`}>
                        <span className="macroTileLabel">{tile.label}</span>
                        <strong>{tile.value} g</strong>
                        <span className="macroTilePercent">{tile.percent} %</span>
                    </div>
                ))}
            </div>

            <div className="macroCost">
                <strong>{formatPrice(cost)}</strong>
                <span>{costLabel}</span>
            </div>
        </div>
    )
}

export default MacroSummary;
