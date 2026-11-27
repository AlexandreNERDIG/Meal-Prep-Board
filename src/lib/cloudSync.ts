import type { Recipe, Ingredient } from '../Components/typeFile';
import { defaultList } from '../Components/typeFile';
import { loadRecipes, loadMealHistory, STOCK_DEFAULTS_VERSION } from './recipeUtils';

// Synchronisation avec la base de données (Supabase).
//
// Principe : l'appli continue de lire et d'écrire dans le localStorage comme avant (rapide, marche hors-ligne).
// Ce fichier s'occupe seulement de recopier ces données vers la base, et de les récupérer à la connexion.
//   - connexion : si le compte a déjà des données, elles remplacent celles de l'appareil ; sinon on envoie celles de l'appareil ;
//   - ensuite : chaque modification est envoyée ~1,5 s plus tard, en ne transmettant QUE ce qui a changé ;
//   - si l'envoi échoue (hors-ligne...), la modification reste sur l'appareil, marquée "à envoyer", et repart dès que possible.
// En cas de modifications sur deux appareils à la fois, la dernière personne qui envoie gagne.

// ---------------------------------------------------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------------------------------------------------

type CloudSettings = {
    language: string | null;
    generatorOptions: unknown;
    welcomeSeen: boolean;
    discordWebhook: string | null;
};

type LocalData = {
    ingredients: Ingredient[];
    recipes: Recipe[];
    history: Recipe[][];
    settings: CloudSettings;
};

type IngredientRow = {
    id: string; name: string; category: string; unit: string; quantity: number; price: number;
    calories: number; protein: number; fat: number; carbs: number; image: string; trackStock: boolean;
};

type RecipeRow = {
    name: string; prepTime: number; cookTime: number; instructions: string; image: string; status: string;
    macro: string | null; lines: { ingredientId: string; quantity: number }[];
};

// Ce que renvoie la fonction SQL load_snapshot()
type Snapshot = {
    ingredients: IngredientRow[];
    recipes: RecipeRow[];
    history: Recipe[][];
    settings: CloudSettings | null;
};

// Ce que reçoit la fonction SQL apply_changes()
type ChangePayload = {
    ingredients_delete?: string[];
    recipes_delete?: string[];
    ingredients_upsert?: IngredientRow[];
    recipes_upsert?: RecipeRow[];
    history?: Recipe[][];
    settings?: CloudSettings;
};

// Le morceau du client Supabase dont on a besoin (permet de tester avec un faux client)
export type CloudClient = {
    rpc: (fn: string, args?: Record<string, unknown>) => PromiseLike<{ data: unknown; error: { message: string } | null }>;
};

export type SyncStatus = "idle" | "syncing" | "error";

// ---------------------------------------------------------------------------------------------------------------------
// Clés du localStorage
// ---------------------------------------------------------------------------------------------------------------------

const KEY_RECIPES = "globalRecipeList";
const KEY_STOCK = "currentStockList";
const KEY_HISTORY = "mealHistoryList";
const KEY_LANGUAGE = "language";
const KEY_GENERATOR = "generatorOptions";
const KEY_WELCOME = "welcomeSeen";
const KEY_WEBHOOK = "discordWebhook";

const KEY_DIRTY = "cloudDirty";                 // "1" = il reste des modifications pas encore envoyées
const KEY_LOCAL_COPY = "localCopyBeforeCloud";  // copie de sécurité des données de l'appareil écrasées par celles du compte

const TRACKED_KEYS = new Set([KEY_RECIPES, KEY_STOCK, KEY_HISTORY, KEY_LANGUAGE, KEY_GENERATOR, KEY_WELCOME, KEY_WEBHOOK]);

// Tout ce qu'il faut effacer quand quelqu'un se déconnecte (l'appareil peut être partagé)
const CLEAR_ON_SIGN_OUT = [
    KEY_RECIPES, KEY_STOCK, KEY_HISTORY, KEY_LANGUAGE, KEY_GENERATOR, KEY_WELCOME, KEY_WEBHOOK, KEY_DIRTY, KEY_LOCAL_COPY,
];

const SEND_DELAY_MS = 1500;
const RETRY_DELAY_MS = 15000;

// ---------------------------------------------------------------------------------------------------------------------
// Conversions (fonctions pures : testées sans navigateur)
// ---------------------------------------------------------------------------------------------------------------------

const toIngredientRow = (i: Ingredient): IngredientRow => ({
    id: String(i.id),
    name: i.name,
    category: i.category ?? "",
    unit: i.unit ?? "",
    quantity: Number(i.quantity) || 0,
    price: Number(i.price) || 0,
    calories: Number(i.macro?.calories) || 0,
    protein: Number(i.macro?.protein) || 0,
    fat: Number(i.macro?.fat) || 0,
    carbs: Number(i.macro?.carbs) || 0,
    image: i.image ?? "",
    trackStock: i.trackStock !== false,
});

const toRecipeRow = (r: Recipe): RecipeRow => ({
    name: r.recipeName,
    prepTime: Math.max(0, Math.round(Number(r.prepTime) || 0)),
    cookTime: Math.max(0, Math.round(Number(r.cookTime) || 0)),
    instructions: r.instructions ?? "",
    image: r.image ?? "",
    status: r.status === "favorite" ? "favorite" : "normal",
    macro: r.macro ?? null,
    lines: (r.ingredient ?? []).map(line => ({ ingredientId: String(line.ingredientId), quantity: Number(line.quantity) || 0 })),
});

const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);

// Calcule ce qu'il faut envoyer pour passer de "before" (ce que la base contient) à "after" (ce que l'appareil contient).
// Renvoie null s'il n'y a rien à envoyer.
const diffLocal = (before: LocalData | null, after: LocalData): ChangePayload | null => {
    const payload: ChangePayload = {};

    // Ingrédients
    const beforeIngredients = new Map((before?.ingredients ?? []).map(i => [String(i.id), toIngredientRow(i)]));
    const afterIngredients = new Map(after.ingredients.map(i => [String(i.id), toIngredientRow(i)]));

    const ingredientsUpsert: IngredientRow[] = [];
    for (const [id, row] of afterIngredients) {
        const old = beforeIngredients.get(id);
        if (!old || !same(old, row)) ingredientsUpsert.push(row);
    }
    const ingredientsDelete = [...beforeIngredients.keys()].filter(id => !afterIngredients.has(id));

    // Un ingrédient qui apparaît ou disparaît change les liens des recettes qui l'utilisent : on renvoie ces recettes.
    const appearedOrGone = new Set<string>([
        ...ingredientsDelete,
        ...[...afterIngredients.keys()].filter(id => !beforeIngredients.has(id)),
    ]);

    // Recettes
    const beforeRecipes = new Map((before?.recipes ?? []).map(r => [r.recipeName, toRecipeRow(r)]));
    const afterRecipes = new Map(after.recipes.map(r => [r.recipeName, toRecipeRow(r)]));

    const recipesUpsert: RecipeRow[] = [];
    for (const [name, row] of afterRecipes) {
        const old = beforeRecipes.get(name);
        const touchesChangedIngredient = row.lines.some(line => appearedOrGone.has(line.ingredientId));
        if (!old || !same(old, row) || touchesChangedIngredient) recipesUpsert.push(row);
    }
    const recipesDelete = [...beforeRecipes.keys()].filter(name => !afterRecipes.has(name));

    if (ingredientsDelete.length) payload.ingredients_delete = ingredientsDelete;
    if (recipesDelete.length) payload.recipes_delete = recipesDelete;
    if (ingredientsUpsert.length) payload.ingredients_upsert = ingredientsUpsert;
    if (recipesUpsert.length) payload.recipes_upsert = recipesUpsert;

    if (!before || !same(before.history, after.history)) payload.history = after.history;
    if (!before || !same(before.settings, after.settings)) payload.settings = after.settings;

    // Premier envoi d'un compte vide : un historique et des réglages vides ne valent pas un envoi
    if (!before && after.history.length === 0) delete payload.history;

    return Object.keys(payload).length > 0 ? payload : null;
};

// Convertit la réponse de la base dans le format de l'appli
const snapshotToLocal = (snap: Snapshot): LocalData => ({
    ingredients: snap.ingredients.map((row): Ingredient => ({
        id: String(row.id),
        name: row.name,
        macro: { calories: Number(row.calories), protein: Number(row.protein), fat: Number(row.fat), carbs: Number(row.carbs) },
        price: Number(row.price),
        quantity: Number(row.quantity),
        unit: row.unit as Ingredient["unit"],
        category: row.category as Ingredient["category"],
        image: row.image,
        ...(row.trackStock === false ? { trackStock: false } : {}),
    })),
    recipes: snap.recipes.map((row): Recipe => ({
        recipeName: row.name,
        ingredient: row.lines.map(line => ({ ingredientId: String(line.ingredientId), quantity: Number(line.quantity) })),
        prepTime: Number(row.prepTime),
        cookTime: Number(row.cookTime),
        instructions: row.instructions,
        image: row.image,
        status: row.status === "favorite" ? "favorite" : "normal",
        ...(row.macro ? { macro: row.macro } : {}),
    })),
    history: snap.history,
    settings: snap.settings ?? { language: null, generatorOptions: null, welcomeSeen: false, discordWebhook: null },
});

// Le compte contient-il déjà quelque chose ? (sinon : première connexion, on envoie les données de l'appareil)
const cloudHasData = (snap: Snapshot): boolean =>
    snap.ingredients.length > 0 || snap.recipes.length > 0 || snap.history.length > 0 || snap.settings !== null;

// ---------------------------------------------------------------------------------------------------------------------
// Lecture / écriture du localStorage
// ---------------------------------------------------------------------------------------------------------------------

const parseJson = <T>(raw: string | null, fallback: T): T => {
    if (raw === null) return fallback;
    try { return JSON.parse(raw) as T; } catch { return fallback; }
};

const readLocal = (): LocalData => {
    const savedStock = localStorage.getItem(KEY_STOCK);
    const webhook = parseJson<unknown>(localStorage.getItem(KEY_WEBHOOK), "");
    return {
        ingredients: savedStock ? parseJson<Ingredient[]>(savedStock, defaultList) : defaultList,
        recipes: loadRecipes(),
        history: loadMealHistory(),
        settings: {
            language: localStorage.getItem(KEY_LANGUAGE),
            generatorOptions: parseJson<unknown>(localStorage.getItem(KEY_GENERATOR), null),
            welcomeSeen: localStorage.getItem(KEY_WELCOME) !== null,
            discordWebhook: typeof webhook === "string" && webhook !== "" ? webhook : null,
        },
    };
};

let suspended = 0;   // > 0 : nos propres écritures dans le localStorage ne doivent pas déclencher d'envoi

const silently = (action: () => void): void => {
    suspended++;
    try { action(); } finally { suspended--; }
};

const setOrRemove = (key: string, value: string | null): void => {
    if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value);
};

const writeLocal = (data: LocalData): void => {
    silently(() => {
        localStorage.setItem(KEY_RECIPES, JSON.stringify(data.recipes));
        localStorage.setItem(KEY_STOCK, JSON.stringify(data.ingredients));
        localStorage.setItem(KEY_HISTORY, JSON.stringify(data.history));
        setOrRemove(KEY_LANGUAGE, data.settings.language);
        setOrRemove(KEY_GENERATOR, data.settings.generatorOptions === null || data.settings.generatorOptions === undefined
            || (typeof data.settings.generatorOptions === "object" && Object.keys(data.settings.generatorOptions as object).length === 0)
            ? null : JSON.stringify(data.settings.generatorOptions));
        setOrRemove(KEY_WELCOME, data.settings.welcomeSeen ? "1" : null);
        setOrRemove(KEY_WEBHOOK, data.settings.discordWebhook ? JSON.stringify(data.settings.discordWebhook) : null);
        // Les données du compte sont déjà à jour : pas de migration des ingrédients par défaut à refaire dessus
        localStorage.setItem("stockDefaultsVersion", String(STOCK_DEFAULTS_VERSION));
    });
};

// ---------------------------------------------------------------------------------------------------------------------
// Moteur de synchronisation
// ---------------------------------------------------------------------------------------------------------------------

let client: CloudClient | null = null;
let baseline: LocalData | null = null;     // ce que la base contient, d'après le dernier échange réussi
let timer: ReturnType<typeof setTimeout> | null = null;
let sending: Promise<void> | null = null;
let changeCounter = 0;
let status: SyncStatus = "idle";
let trackingInstalled = false;
const listeners = new Set<(status: SyncStatus) => void>();

const setStatus = (next: SyncStatus): void => {
    status = next;
    listeners.forEach(listener => listener(next));
};

export const getSyncStatus = (): SyncStatus => status;

export const onSyncStatus = (listener: (status: SyncStatus) => void): (() => void) => {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
};

const markDirty = (): void => {
    try { localStorage.setItem(KEY_DIRTY, "1"); } catch { /* stockage indisponible */ }
};

const isDirty = (): boolean => {
    try { return localStorage.getItem(KEY_DIRTY) === "1"; } catch { return false; }
};

const schedule = (delay: number = SEND_DELAY_MS): void => {
    if (!client || !baseline) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => { void flush(); }, delay);
};

// À appeler une fois au démarrage : repère les modifications des données de l'appli dans le localStorage
export const installTracking = (): void => {
    if (trackingInstalled || typeof Storage === "undefined") return;
    trackingInstalled = true;

    const originalSet = Storage.prototype.setItem;
    const originalRemove = Storage.prototype.removeItem;

    const onChange = (storage: Storage, key: string) => {
        if (storage !== localStorage || suspended > 0 || !TRACKED_KEYS.has(key)) return;
        changeCounter++;
        markDirty();
        schedule();
    };

    Storage.prototype.setItem = function (this: Storage, key: string, value: string) {
        originalSet.call(this, key, value);
        onChange(this, key);
    };
    Storage.prototype.removeItem = function (this: Storage, key: string) {
        originalRemove.call(this, key);
        onChange(this, key);
    };

    const flushSoon = () => { if (document.visibilityState === "hidden") void flush(); };
    document.addEventListener("visibilitychange", flushSoon);
    window.addEventListener("pagehide", () => { void flush(); });
    window.addEventListener("online", () => { schedule(500); });
};

// Envoie tout de suite ce qui n'est pas encore parti. Ne lève jamais d'exception.
const flush = async (): Promise<void> => {
    if (timer) { clearTimeout(timer); timer = null; }
    if (!client || !baseline) return;

    if (sending) { await sending; }   // un envoi est en cours : on attend, puis on regarde s'il reste quelque chose

    const run = async () => {
        if (!client || !baseline) return;
        const startedAt = changeCounter;
        const next = readLocal();
        const payload = diffLocal(baseline, next);

        if (!payload) {
            if (startedAt === changeCounter) { try { localStorage.removeItem(KEY_DIRTY); } catch { /* idem */ } }
            setStatus("idle");
            return;
        }

        setStatus("syncing");
        try {
            const { error } = await client.rpc("apply_changes", { p: payload });
            if (error) throw new Error(error.message);
            baseline = next;
            if (startedAt === changeCounter) { try { localStorage.removeItem(KEY_DIRTY); } catch { /* idem */ } }
            setStatus("idle");
            if (startedAt !== changeCounter) schedule();    // d'autres modifications sont arrivées pendant l'envoi
        } catch (error) {
            console.error("Synchronisation impossible :", error);
            setStatus("error");
            schedule(RETRY_DELAY_MS);
        }
    };

    sending = run().finally(() => { sending = null; });
    await sending;
};

// Appelé à chaque connexion, AVANT d'afficher l'appli : met l'appareil et le compte d'accord.
// "seed" remplit les données de départ (recettes d'exemple...) quand l'appareil n'a encore rien.
export const initialSync = async (cloudClient: CloudClient, seed: () => void): Promise<"pulled" | "pushed" | "kept-local"> => {
    installTracking();
    client = cloudClient;
    baseline = null;

    const { data, error } = await cloudClient.rpc("load_snapshot");
    if (error) throw new Error(error.message);
    const snap = data as Snapshot;

    if (!cloudHasData(snap)) {
        // Première connexion de ce compte : on envoie ce qu'il y a sur l'appareil (données de départ comprises)
        silently(seed);
        baseline = null;
        const local = readLocal();
        const payload = diffLocal(null, local);
        if (payload) {
            const result = await cloudClient.rpc("apply_changes", { p: payload });
            if (result.error) throw new Error(result.error.message);
        }
        baseline = local;
        try { localStorage.removeItem(KEY_DIRTY); } catch { /* idem */ }
        setStatus("idle");
        return "pushed";
    }

    const cloudLocal = snapshotToLocal(snap);

    if (isDirty()) {
        // Des modifications faites sur cet appareil n'étaient pas parties (hors-ligne, onglet fermé...) : elles gagnent.
        silently(seed);
        baseline = cloudLocal;
        await flush();
        return "kept-local";
    }

    // Cas normal : le compte fait foi. On garde une copie des données de l'appareil si elles étaient différentes.
    const deviceData = readLocal();
    const hadDeviceData = localStorage.getItem(KEY_STOCK) !== null || localStorage.getItem(KEY_RECIPES) !== null;
    if (hadDeviceData && !same(
        { i: deviceData.ingredients, r: deviceData.recipes, h: deviceData.history },
        { i: cloudLocal.ingredients, r: cloudLocal.recipes, h: cloudLocal.history },
    )) {
        silently(() => {
            try { localStorage.setItem(KEY_LOCAL_COPY, JSON.stringify({ savedAt: new Date().toISOString(), data: deviceData })); }
            catch { /* plus de place : tant pis pour la copie */ }
        });
    }

    writeLocal(cloudLocal);
    baseline = readLocal();
    silently(seed);                 // complète ce qui manquerait (ex. historique absent) sans rien écraser
    setStatus("idle");
    schedule();                     // envoie la différence éventuelle créée par "seed"
    return "pulled";
};

// Appelé à la déconnexion : envoie ce qui reste, puis arrête et efface les données de l'appareil.
// Si l'envoi échoue (hors-ligne) et que "force" est faux, ne supprime rien et renvoie false : l'appelant doit prévenir la personne.
export const signOutCleanup = async (force: boolean = false): Promise<boolean> => {
    await flush();
    if (!force && isDirty()) return false;
    if (timer) { clearTimeout(timer); timer = null; }
    client = null;
    baseline = null;
    silently(() => { CLEAR_ON_SIGN_OUT.forEach(key => { try { localStorage.removeItem(key); } catch { /* idem */ } }); });
    setStatus("idle");
    return true;
};
