import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useT } from '../i18n/LanguageProvider';
import { isCloudConfigured } from '../lib/supabase';
import { isActivityEnabled, setActivityEnabled } from '../lib/activity';
import './ActivityPanel.css';

const ActivityPanel = () => {
    const { t } = useT();
    const { status, user } = useAuth();
    const [enabled, setEnabled] = useState<boolean>(isActivityEnabled);

    if (!isCloudConfigured || status !== "signedIn" || !user) return null;

    const toggle = (checked: boolean) => {
        setEnabled(checked);
        setActivityEnabled(checked);
    };

    return (
        <div className="backupPanel">
            <h3>{t("activity.title")}</h3>
            <p>{t("activity.hint")}</p>
            <label className="activityToggle">
                <input type="checkbox" checked={enabled} onChange={(e) => toggle(e.target.checked)} />
                {t("activity.toggle")}
            </label>
        </div>
    );
};

export default ActivityPanel;
