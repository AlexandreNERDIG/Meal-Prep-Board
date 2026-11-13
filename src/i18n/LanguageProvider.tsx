import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { getLanguage, setCurrentLanguage, translate } from './core';
import type { Language, TranslateParams } from './core';
import type { MessageKey } from './translations';

type LanguageContextValue = {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: MessageKey, params?: TranslateParams) => string;
    // Pour les passages mis en gras
    tb: (key: MessageKey, params?: TranslateParams) => ReactNode;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguageState] = useState<Language>(getLanguage());

    const setLanguage = useCallback((next: Language) => {
        setCurrentLanguage(next);
        setLanguageState(next);
    }, []);

    if (typeof document !== "undefined" && document.documentElement.lang !== language) {
        document.documentElement.lang = language;
    }

    const t = useCallback((key: MessageKey, params?: TranslateParams) => translate(key, params, language), [language]);

    const tb = useCallback((key: MessageKey, params?: TranslateParams): ReactNode => {
        return translate(key, params, language)
            .split("**")
            .map((part, index) => {
                const lines = part.split("\n").flatMap((line, i) => i === 0 ? [line] : [<br key={`br-${i}`}/>, line]);
                return index % 2 === 1 ? <strong key={index}>{lines}</strong> : <span key={index}>{lines}</span>;
            });
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, tb }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useT = (): LanguageContextValue => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error("useT() doit être utilisé à l'intérieur de <LanguageProvider>");
    return context;
};
