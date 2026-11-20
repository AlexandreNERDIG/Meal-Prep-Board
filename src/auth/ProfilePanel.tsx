import { useState } from 'react';
import type { FormEvent } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import type { AuthResult } from './AuthContext';
import { ERROR_KEYS } from './AuthScreen';
import { useT } from '../i18n/LanguageProvider';

const MIN_PASSWORD = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ProfilePanel = () => {
    const { t } = useT();
    const { status, user, updateProfile } = useAuth();

    const [name, setName] = useState<string>(user?.name ?? "");
    const [email, setEmail] = useState<string>(user?.email ?? "");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [busy, setBusy] = useState(false);

    if (status !== "signedIn" || !user) return null;


    const send = async (changes: Parameters<typeof updateProfile>[0]): Promise<boolean> => {
        setBusy(true);
        const result: AuthResult = await updateProfile(changes);
        setBusy(false);
        if (result.ok) return true;
        if (result.code === "email_exists") toast.error(t("settings.profile.emailTaken"));
        else if (result.code === "same_password") toast.error(t("settings.profile.passwordSame"));
        else toast.error(t(ERROR_KEYS[result.kind]));
        return false;
    };

    const saveName = async (e: FormEvent) => {
        e.preventDefault();
        if (await send({ name: name.trim() })) toast.success(t("settings.profile.nameSaved"));
    };

    const saveEmail = async (e: FormEvent) => {
        e.preventDefault();
        const clean = email.trim();
        if (clean === user.email) { toast(t("settings.profile.emailSame")); return; }
        if (!EMAIL_PATTERN.test(clean)) { toast.error(t("auth.errEmail")); return; }
        if (await send({ email: clean })) toast.success(t("settings.profile.emailSent", { email: clean }), { duration: 8000 });
    };

    const savePassword = async (e: FormEvent) => {
        e.preventDefault();
        if (password.length < MIN_PASSWORD) { toast.error(t("auth.errShort")); return; }
        if (password !== confirm) { toast.error(t("settings.profile.passwordMismatch")); return; }
        if (await send({ password })) {
            toast.success(t("settings.profile.passwordSaved"));
            setPassword("");
            setConfirm("");
        }
    };

    return (
        <div className="backupPanel">
            <h3>{t("settings.profile.title")}</h3>

            <form className="profileForm" onSubmit={saveName}>
                <label htmlFor="profileName">{t("settings.profile.name")}</label>
                <input id="profileName" type="text" className="settingsInput" value={name} maxLength={40}
                    onChange={(e) => setName(e.target.value)} placeholder={t("settings.profile.namePlaceholder")} />
                <button type="submit" className="fileBtn" disabled={busy}>{t("settings.profile.save")}</button>
            </form>

            <form className="profileForm" onSubmit={saveEmail}>
                <label htmlFor="profileEmail">{t("settings.profile.email")}</label>
                <input id="profileEmail" type="email" className="settingsInput" value={email}
                    onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                <button type="submit" className="fileBtn" disabled={busy}>{t("settings.profile.emailChange")}</button>
            </form>

            <form className="profileForm" onSubmit={savePassword}>
                <label htmlFor="profilePassword">{t("settings.profile.password")}</label>
                <input id="profilePassword" type="password" className="settingsInput" value={password}
                    onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder={t("auth.passwordHint")} />
                <input type="password" className="settingsInput" value={confirm} aria-label={t("settings.profile.passwordConfirm")}
                    onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" placeholder={t("settings.profile.passwordConfirm")} />
                <button type="submit" className="fileBtn" disabled={busy}>{t("settings.profile.passwordChange")}</button>
            </form>
        </div>
    );
};

export default ProfilePanel;
