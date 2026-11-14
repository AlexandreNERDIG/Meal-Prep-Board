// Lit ce que l'utilisateur tape dans la case "quantité" d'un ingrédient du stock :
//   "1050"  -> 1050 (nouvelle quantité)
//   "+250"  -> quantité actuelle + 250 (ajout rapide)
//   "-100"  -> quantité actuelle - 100 (jamais en dessous de 0)
// Renvoie null si le texte n'est pas un nombre (la case revient alors à l'ancienne valeur).
export const parseQuantityInput = (raw: string, current: number): number | null => {
    const match = raw.trim().replace(",", ".").match(/^([+-])?\s*(\d+(?:\.\d+)?|\.\d+)$/);
    if (!match) return null;

    const amount = parseFloat(match[2]);
    const next = match[1] === "+" ? current + amount : match[1] === "-" ? current - amount : amount;

    return Math.max(0, Math.round(next * 100) / 100);
};
