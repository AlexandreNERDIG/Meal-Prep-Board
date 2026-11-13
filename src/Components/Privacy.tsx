import { Link } from 'react-router-dom';
import { useT } from '../i18n/LanguageProvider';
import './Privacy.css';

const SECTIONS = ["data", "discord", "fonts", "tracking", "offline"] as const;

const Privacy = () => {
    const { t } = useT();

    return (
        <div className="globalPrivacySection">
            <div className="sectionHeader"><p>{t("privacy.title")}</p></div>

            {SECTIONS.map((section) => (
                <div className="privacyCard" key={section}>
                    <h3>{t(`privacy.${section}.title`)}</h3>
                    <p>{t(`privacy.${section}.text`)}</p>
                </div>
            ))}

            <Link className="privacyBack" to="/">{t("privacy.back")}</Link>
        </div>
    );
};

export default Privacy;
