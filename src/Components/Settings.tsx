import AccountPanel from '../auth/AccountPanel';
import ProfilePanel from '../auth/ProfilePanel';
import BackupPanel from './BackupPanel';
import WebhookPanel from './WebhookPanel';
import { useT } from '../i18n/LanguageProvider';
import './Settings.css';

// Page « Réglages » : le compte, le webhook Discord et les sauvegardes
const Settings = () => {
    const { t } = useT();

    return (
        <div className="globalSettingsSection">
            <div className="sectionHeader"><p>{t("page.settings")}</p></div>
            <AccountPanel />
            <ProfilePanel />
            <WebhookPanel />
            <BackupPanel />
        </div>
    );
};

export default Settings;
