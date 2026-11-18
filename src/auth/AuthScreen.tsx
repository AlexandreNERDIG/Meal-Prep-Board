import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import type { AuthErrorKind } from './AuthContext';
import { useT } from '../i18n/LanguageProvider';
import LanguageSwitch from '../Components/LanguageSwitch';
import type { MessageKey } from '../i18n/translations';
import './Auth.css';

type Mode = "signIn" | "signUp" | "forgot";

const MIN_PASSWORD = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ERROR_KEYS: Record<AuthErrorKind, MessageKey> = {
    credentials: "auth.errCredentials",
    notConfirmed: "auth.errNotConfirmed",
    weakPassword: "auth.errWeak",
    rateLimit: "auth.errRate",
    network: "auth.errNetwork",
    other: "auth.errOther",
};

const Brand = () => {
    const { t } = useT();
    return (
        <>
            <h1 className="authBrand">MyPrepBoard</h1>
            <p className="authTagline">{t("auth.tagline")}</p>
        </>
    );
};

export const AuthScreen = () => {
    const { t, tb } = useT();
    const { signIn, signUp, sendReset } = useAuth();

    const [mode, setMode] = useState<Mode>("signIn");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<{ key: MessageKey; email: string } | null>(null);

    const changeMode = (next: Mode) => {
        setMode(next);
        setError(null);
        setInfo(null);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (busy) return;
        setError(null);
        setInfo(null);

        const cleanEmail = email.trim();
        if (!EMAIL_PATTERN.test(cleanEmail)) { setError(t("auth.errEmail")); return; }
        if (mode === "signUp" && password.length < MIN_PASSWORD) { setError(t("auth.errShort")); return; }

        setBusy(true);
        try {
            if (mode === "forgot") {
                const result = await sendReset(cleanEmail);
                if (result.ok) setInfo({ key: "auth.resetSent", email: cleanEmail });
                else setError(t(ERROR_KEYS[result.kind]));
            } else if (mode === "signUp") {
                const result = await signUp(cleanEmail, password);
                if (!result.ok) setError(t(ERROR_KEYS[result.kind]));
                else if (result.needsConfirmation) { setInfo({ key: "auth.checkEmail", email: cleanEmail }); setPassword(""); }
            } else {
                const result = await signIn(cleanEmail, password);
                if (!result.ok) setError(t(ERROR_KEYS[result.kind]));
            }
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="authPage">
            <div className="authCard">
                <Brand />
                <h2>{t(mode === "signIn" ? "auth.title.signIn" : mode === "signUp" ? "auth.title.signUp" : "auth.title.forgot")}</h2>

                {info && <p className="authInfo" role="status">{tb(info.key, { email: info.email })}</p>}

                <form onSubmit={handleSubmit} noValidate>
                    <label className="authField">
                        {t("auth.email")}
                        <input type="email" name="email" autoComplete="email" inputMode="email" value={email}
                            onChange={e => setEmail(e.target.value)} required />
                    </label>

                    {mode !== "forgot" && (
                        <label className="authField">
                            {t("auth.password")}
                            <input type="password" name="password" value={password}
                                autoComplete={mode === "signUp" ? "new-password" : "current-password"}
                                onChange={e => setPassword(e.target.value)} required />
                            {mode === "signUp" && <small>{t("auth.passwordHint")}</small>}
                        </label>
                    )}

                    {error && <p className="authError" role="alert">{error}</p>}

                    <button type="submit" className="authSubmit" disabled={busy}>
                        {t(mode === "signIn" ? "auth.submit.signIn" : mode === "signUp" ? "auth.submit.signUp" : "auth.submit.forgot")}
                    </button>
                </form>

                {mode === "signIn" && (
                    <>
                        <button type="button" className="authLinkBtn" onClick={() => changeMode("forgot")}>{t("auth.forgotLink")}</button>
                        <button type="button" className="authLinkBtn" onClick={() => changeMode("signUp")}>{t("auth.toSignUp")}</button>
                    </>
                )}
                {mode === "signUp" && (
                    <>
                        <p className="authConsent">{t("auth.consent")}<Link to="/Privacy">{t("auth.consentLink")}</Link>.</p>
                        <button type="button" className="authLinkBtn" onClick={() => changeMode("signIn")}>{t("auth.toSignIn")}</button>
                    </>
                )}
                {mode === "forgot" && (
                    <button type="button" className="authLinkBtn" onClick={() => changeMode("signIn")}>{t("auth.back")}</button>
                )}

                <div className="authLang"><LanguageSwitch /></div>
            </div>
        </div>
    );
};

export const ResetPasswordScreen = () => {
    const { t } = useT();
    const { setNewPassword } = useAuth();
    const [password, setPassword] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (busy) return;
        if (password.length < MIN_PASSWORD) { setError(t("auth.errShort")); return; }
        setBusy(true);
        setError(null);
        const result = await setNewPassword(password);
        if (!result.ok) setError(t(ERROR_KEYS[result.kind]));
        setBusy(false);
    };

    return (
        <div className="authPage">
            <div className="authCard">
                <Brand />
                <h2>{t("auth.title.reset")}</h2>
                <form onSubmit={handleSubmit} noValidate>
                    <label className="authField">
                        {t("auth.newPassword")}
                        <input type="password" name="password" autoComplete="new-password" value={password}
                            onChange={e => setPassword(e.target.value)} required />
                        <small>{t("auth.passwordHint")}</small>
                    </label>
                    {error && <p className="authError" role="alert">{error}</p>}
                    <button type="submit" className="authSubmit" disabled={busy}>{t("auth.submit.reset")}</button>
                </form>
            </div>
        </div>
    );
};

export const Splash = ({ children }: { children?: ReactNode }) => (
    <div className="splash" role="status">
        <div className="splashSpinner" aria-hidden="true"></div>
        {children}
    </div>
);
