import { useState } from 'react';
import toast from 'react-hot-toast';
import { useT } from '../i18n/LanguageProvider';
import { isValidWebhook, loadWebhook, saveWebhook } from '../lib/discord';

// Bloc « Discord » des Réglages : où envoyer la liste de courses
const WebhookPanel = () => {
    const { t } = useT();
    const [saved, setSaved] = useState<string>(loadWebhook);
    const [value, setValue] = useState<string>(saved);

    const handleSave = () => {
        const url = value.trim();
        if (!isValidWebhook(url)) {
            toast.error(t("home.toast.webhookBad"));
            return;
        }
        saveWebhook(url);
        setSaved(url);
        setValue(url);
        toast.success(t("home.toast.webhookOk"));
    };

    const handleRemove = () => {
        saveWebhook("");
        setSaved("");
        setValue("");
        toast.success(t("settings.discord.removed"));
    };

    return (
        <div className="backupPanel">
            <h3>{t("settings.discord.title")}</h3>
            <p>{t("settings.discord.hint")}</p>
            <input
                type="text"
                className="webhookInput"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="https://discord.com/api/webhooks/1234567891234567891/AbCdEf..."
                aria-label={t("settings.discord.title")}
            />
            <div className="backupActions">
                <button type="button" className="fileBtn" onClick={handleSave}>{t("settings.discord.save")}</button>
                <button type="button" className="fileBtn" disabled={saved === ""} onClick={handleRemove}>{t("settings.discord.remove")}</button>
            </div>
        </div>
    );
};

export default WebhookPanel;
