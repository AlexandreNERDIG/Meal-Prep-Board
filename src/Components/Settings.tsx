import AccountPanel from '../auth/AccountPanel';
import ProfilePanel from '../auth/ProfilePanel';
import BackupPanel from './BackupPanel';
import LanguagePanel from './LanguagePanel';
import WebhookPanel from './WebhookPanel';
import { useT } from '../i18n/LanguageProvider';
import './Settings.css';

// Settings page: account, language, Discord webhook and backups
const Settings = () => {
    const { t } = useT();

    return (
        <div className="globalSettingsSection">
            <div className="sectionHeader"><p>{t("page.settings")}</p></div>
            <AccountPanel />
            <ProfilePanel />
            <LanguagePanel />
            <WebhookPanel />
            <BackupPanel />
        </div>
    );
};

export default Settings;
