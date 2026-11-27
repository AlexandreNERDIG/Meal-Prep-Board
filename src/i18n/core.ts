import { fr, en } from './translations';
import { es } from './es';
import type { TranslationKey, MessageKey } from './translations';

// To add a language: add it here, create its dictionary in translations.ts and register it in `dictionaries` below
export const LANGUAGE_OPTIONS = [
    { code: "fr", label: "Français", locale: "fr-FR" },
    { code: "en", label: "English", locale: "en-US" },
    { code: "es", label: "Español", locale: "es-ES" },
] as const;

export type Language = typeof LANGUAGE_OPTIONS[number]["code"];
const LANGUAGES: Language[] = LANGUAGE_OPTIONS.map(option => option.code);
export const localeOf = (language: Language): string => LANGUAGE_OPTIONS.find(option => option.code === language)?.locale ?? "en-US";

const STORAGE_KEY = "language";
const dictionaries: Record<Language, Record<TranslationKey, string>> = { fr, en, es };

export const isLanguage = (value: unknown): value is Language => LANGUAGES.some(code => code === value);

const detectLanguage = (): Language => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (isLanguage(saved)) return saved;
    } catch {
        // localStorage indisponible (navigation privée...) : on passe à la langue du navigateur
    }

    const preferred = typeof navigator !== "undefined" ? (navigator.languages?.length ? navigator.languages : [navigator.language]) : [];
    for (const locale of preferred) {
        const code = String(locale).toLowerCase().slice(0, 2);
        if (isLanguage(code)) return code; 
    }
    return "en";
};

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

export const translate = (key: MessageKey, params?: TranslateParams, language: Language = currentLanguage): string => {
    const dictionary = dictionaries[language];
    let resolvedKey: string = key;

    if (params && typeof params.count === "number") {
        const count = params.count;
        const isOne = new Intl.PluralRules(localeOf(language)).select(count) === "one";
        const pluralKey = `${key}_${isOne ? "one" : "other"}`;
        if (pluralKey in dictionary) resolvedKey = pluralKey;
    }

    const template = dictionary[resolvedKey as TranslationKey] ?? dictionary[key as TranslationKey] ?? key;
    if (!params) return template;

    return template.replace(/\{(\w+)\}/g, (match, name: string) => name in params ? String(params[name]) : match);
};
