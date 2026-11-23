import AccountPanel from '../auth/AccountPanel';
import HouseholdPanel from './HouseholdPanel';
import ProfilePanel from '../auth/ProfilePanel';
import ActivityPanel from './ActivityPanel';
import BackupPanel from './BackupPanel';
import LanguagePanel from './LanguagePanel';
import StarterPacksPanel from './StarterPacksPanel';
import WebhookPanel from './WebhookPanel';
import FeedbackPanel from './FeedbackPanel';
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
            <HouseholdPanel />
            <LanguagePanel />
            <StarterPacksPanel />
            <WebhookPanel />
            <ActivityPanel />
            <BackupPanel />
            <FeedbackPanel />
        </div>
    );
};

export default Settings;
