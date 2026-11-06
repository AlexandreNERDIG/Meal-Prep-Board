import type { Macros } from '../lib/recipeUtils';
import { calorieSplit, formatPrice } from '../lib/recipeUtils';

type MacroSummaryProps = {
    title: string;
    subtitle: string;
    macros: Macros;
    cost: number;
    costLabel: string;
};

// Carte de résumé des apports : calories, répartition glucides / protéines / lipides, et coût
const MacroSummary = ({ title, subtitle, macros, cost, costLabel }: MacroSummaryProps) => {
    const split = calorieSplit(macros);

    const tiles = [
        { key: "carbs", label: "Glucides", value: macros.carbs, percent: split.carbs },
        { key: "protein", label: "Protéines", value: macros.protein, percent: split.protein },
        { key: "fat", label: "Lipides", value: macros.fat, percent: split.fat },
    ] as const;

    return (
        <div className="macroCard">
            <div className="macroCardHead">
                <h3>{title}</h3>
                <span>{subtitle}</span>
            </div>

            <div className="macroCalories">
                <strong>{macros.calories.toLocaleString("fr-FR")}</strong>
                <span>kcal</span>
            </div>

            <div
                className="macroSplitBar"
                role="img"
                aria-label={`Répartition des calories : ${split.carbs} % glucides, ${split.protein} % protéines, ${split.fat} % lipides`}
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
