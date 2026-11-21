import LanguageSwitch from './LanguageSwitch';
import { useT } from '../i18n/LanguageProvider';

const LanguagePanel = () => {
    const { t } = useT();

    return (
        <div className="backupPanel">
            <h3>{t("settings.language.title")}</h3>
            <p>{t("settings.language.hint")}</p>
            <LanguageSwitch className="settingsInput" />
        </div>
    );
};

export default LanguagePanel;
