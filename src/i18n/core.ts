import { fr, en } from './translations';
import type { TranslationKey, MessageKey } from './translations';

// Langues de l'appli. Pour en ajouter une : un nouveau dictionnaire dans translations.ts + une entrée ici.
export type Language = "fr" | "en";
export const LANGUAGES: Language[] = ["fr", "en"];

const STORAGE_KEY = "language";
const dictionaries: Record<Language, Record<TranslationKey, string>> = { fr, en };

const isLanguage = (value: unknown): value is Language => value === "fr" || value === "en";

// 1) le choix de l'utilisateur (sélecteur FR | EN), 2) sinon la langue du navigateur (français -> fr), 3) sinon anglais
export const detectLanguage = (): Language => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (isLanguage(saved)) return saved;
    } catch {
        // localStorage indisponible (navigation privée...) : on passe à la langue du navigateur
    }

    const preferred = typeof navigator !== "undefined" ? (navigator.languages?.length ? navigator.languages : [navigator.language]) : [];
    for (const locale of preferred) {
        const code = String(locale).toLowerCase().slice(0, 2);
        if (isLanguage(code)) return code;   // première langue du navigateur que l'appli sait parler
    }
    return "en";
};

// Langue courante, lisible en dehors de React (formatage des prix, messages d'erreur des fonctions utilitaires...)
let currentLanguage: Language = detectLanguage();

export const getLanguage = (): Language => currentLanguage;

export const setCurrentLanguage = (language: Language, remember: boolean = true): void => {
    currentLanguage = language;
    if (typeof document !== "undefined") document.documentElement.lang = language;
    if (!remember) return;
    try {
        localStorage.setItem(STORAGE_KEY, language);
    } catch {
        // tant pis : le choix ne sera pas mémorisé
    }
};

export type TranslateParams = Record<string, string | number>;

// translate("home.weekSub", { days: 5 }) -> "5 jours, 2 repas par jour"
// Pluriel : si params.count existe et que "<clé>_one" existe, on l'utilise quand count vaut 0 ou 1 en français, 1 en anglais
export const translate = (key: MessageKey, params?: TranslateParams, language: Language = currentLanguage): string => {
    const dictionary = dictionaries[language];
    let resolvedKey: string = key;

    if (params && typeof params.count === "number") {
        const count = params.count;
        const isOne = language === "fr" ? (count === 0 || count === 1) : count === 1;
        const pluralKey = `${key}_${isOne ? "one" : "other"}`;
        if (pluralKey in dictionary) resolvedKey = pluralKey;
    }

    const template = dictionary[resolvedKey as TranslationKey] ?? dictionary[key as TranslationKey] ?? key;
    if (!params) return template;

    return template.replace(/\{(\w+)\}/g, (match, name: string) => name in params ? String(params[name]) : match);
};
