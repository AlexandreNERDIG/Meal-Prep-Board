import { useEffect, useState } from 'react';
import { useT } from '../i18n/LanguageProvider';
import './Welcome.css';

// Fenêtre de bienvenue, affichée une seule fois (puis mémorisée dans localStorage["welcomeSeen"]).
// Pour la revoir : supprimer la clé "welcomeSeen" dans les outils de développement du navigateur.
const WELCOME_KEY = "welcomeSeen";

// Événement "beforeinstallprompt" (Chrome / Edge / Android) : pas dans les types TypeScript standard
type InstallPromptEvent = Event & { prompt: () => Promise<void> };

const isStandalone = () =>
    window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

const Welcome = () => {
    const { t, tb } = useT();

    const [open, setOpen] = useState(() => {
        try { return !localStorage.getItem(WELCOME_KEY); } catch { return false; }
    });
    const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);

    useEffect(() => {
        const onPrompt = (e: Event) => {
            e.preventDefault();
            setInstallEvent(e as InstallPromptEvent);
        };
        window.addEventListener("beforeinstallprompt", onPrompt);
        return () => window.removeEventListener("beforeinstallprompt", onPrompt);
    }, []);

    const close = () => {
        try { localStorage.setItem(WELCOME_KEY, "1"); } catch { /* stockage indisponible : la fenêtre se rouvrira, sans gravité */ }
        setOpen(false);
    };

    const install = async () => {
        if (!installEvent) return;
        await installEvent.prompt();
        setInstallEvent(null);
    };

    if (!open) return null;

    return (
        <div className="welcomeOverlay" role="dialog" aria-modal="true" aria-labelledby="welcomeTitle">
            <div className="welcomeCard">
                <h2 id="welcomeTitle">{t("welcome.title")}</h2>
                <p>{t("welcome.intro")}</p>

                <ul>
                    <li>{tb("welcome.step1", { page: t("page.home") })}</li>
                    <li>{tb("welcome.step2", { page: t("page.recipes") })}</li>
                    <li>{tb("welcome.step3", { page: t("page.stock") })}</li>
                </ul>

                <p className="welcomeNote">{t("welcome.data")}</p>

                {!isStandalone() && installEvent && (
                    <button className="cancelDeleteBtn" onClick={install}>{t("welcome.install")}</button>
                )}
                {!isStandalone() && !installEvent && isIos() && (
                    <p className="welcomeNote">{t("welcome.iosHint")}</p>
                )}

                <button className="confirmDeleteBtn" onClick={close}>{t("welcome.start")}</button>
            </div>
        </div>
    );
};

export default Welcome;
