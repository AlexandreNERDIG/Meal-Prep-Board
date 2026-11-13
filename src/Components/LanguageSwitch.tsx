import { useT } from '../i18n/LanguageProvider';
import { LANGUAGES } from '../i18n/core';

// Sélecteur de langue FR | EN 
const LanguageSwitch = () => {
    const { language, setLanguage, t } = useT();

    return (
        <div className="langSwitch" role="group" aria-label={t("lang.label")}>
            {LANGUAGES.map(code => (
                <button
                    key={code}
                    type="button"
                    className={language === code ? "active" : ""}
                    aria-pressed={language === code}
                    onClick={() => setLanguage(code)}
                >
                    {code.toUpperCase()}
                </button>
            ))}
        </div>
    );
};

export default LanguageSwitch;
