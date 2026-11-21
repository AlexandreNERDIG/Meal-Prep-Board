import { useT } from '../i18n/LanguageProvider';
import { LANGUAGE_OPTIONS, isLanguage } from '../i18n/core';

// Language dropdown: reads LANGUAGE_OPTIONS, so adding a language never requires changing this component
const LanguageSwitch = ({ className = "langSelect" }: { className?: string }) => {
    const { language, setLanguage, t } = useT();

    return (
        <select
            className={className}
            value={language}
            aria-label={t("lang.label")}
            onChange={(e) => { if (isLanguage(e.target.value)) setLanguage(e.target.value); }}
        >
            {LANGUAGE_OPTIONS.map(option => (
                <option key={option.code} value={option.code}>{option.label}</option>
            ))}
        </select>
    );
};

export default LanguageSwitch;
