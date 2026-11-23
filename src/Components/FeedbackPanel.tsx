import { useState } from 'react';
import type { FormEvent } from 'react';
import toast from 'react-hot-toast';
import { Send } from 'react-feather';
import { useAuth } from '../auth/AuthContext';
import { useT } from '../i18n/LanguageProvider';
import { isCloudConfigured, supabase } from '../lib/supabase';
import './FeedbackPanel.css';

const KINDS = ["idea", "bug", "other"] as const;
type Kind = typeof KINDS[number];
const MAX_LENGTH = 2000;

const FeedbackPanel = () => {
    const { t, language } = useT();
    const { status, user } = useAuth();
    const [kind, setKind] = useState<Kind>("idea");
    const [message, setMessage] = useState("");
    const [busy, setBusy] = useState(false);

    const client = supabase;
    if (!isCloudConfigured || !client || status !== "signedIn" || !user) return null;

    const send = async (e: FormEvent) => {
        e.preventDefault();
        const clean = message.trim();
        if (!clean) { toast.error(t("feedback.empty")); return; }
        setBusy(true);
        const { error } = await client.from("feedback").insert({ user_id: user.id, kind, message: clean, language });
        setBusy(false);
        if (error) { toast.error(t("feedback.error")); return; }
        setMessage("");
        toast.success(t("feedback.sent"));
    };

    return (
        <div className="backupPanel">
            <h3>{t("feedback.title")}</h3>
            <p>{t("feedback.hint")}</p>
            <form className="profileForm" onSubmit={send}>
                <label htmlFor="feedbackKind">{t("feedback.kind")}</label>
                <select id="feedbackKind" className="settingsInput" value={kind} onChange={(e) => setKind(e.target.value as Kind)}>
                    {KINDS.map(option => <option key={option} value={option}>{t(`feedback.kind.${option}`)}</option>)}
                </select>
                <label htmlFor="feedbackMessage">{t("feedback.message")}</label>
                <textarea id="feedbackMessage" className="settingsInput feedbackText" rows={5} maxLength={MAX_LENGTH}
                    value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t("feedback.placeholder")} />
                <button type="submit" className="fileBtn" disabled={busy}><Send size={16} /> {t("feedback.send")}</button>
            </form>
        </div>
    );
};

export default FeedbackPanel;
