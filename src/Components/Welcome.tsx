import { useEffect, useRef, useState } from 'react';
import { MinusCircle, PlusCircle } from 'react-feather';
import { useAuth } from '../auth/AuthContext';
import { useT } from '../i18n/LanguageProvider';
import { starterStock } from '../i18n/starterIngredients';
import { MAX_PORTIONS, MIN_PORTIONS, loadGeneratorOptions, saveGeneratorOptions } from '../lib/recipeGenerator';
import { starterRecipes } from '../lib/starterRecipes';
import type { Language } from '../i18n/core';
import type { Ingredient } from './typeFile';
import LanguageSwitch from './LanguageSwitch';
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
    const { t, tb, language } = useT();
    const { status, user, updateProfile } = useAuth();
    const startLanguage = useRef<Language>(language);
    const [name, setName] = useState<string>(user?.name ?? "");
    const [portions, setPortions] = useState<number>(() => loadGeneratorOptions().portions);

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

    const translateStarterData = (from: Language, to: Language) => {
        if (from === to) return;
        try {
            const namesFrom = new Map(starterStock(from).map(item => [item.id, item.name]));
            const namesTo = new Map(starterStock(to).map(item => [item.id, item.name]));
            const stock: Ingredient[] = JSON.parse(localStorage.getItem("currentStockList") ?? "[]");
            const renamed = stock.map(item => item.name === namesFrom.get(item.id) ? { ...item, name: namesTo.get(item.id) ?? item.name } : item);
            localStorage.setItem("currentStockList", JSON.stringify(renamed));

            const recipes: { recipeName: string }[] = JSON.parse(localStorage.getItem("globalRecipeList") ?? "[]");
            const starterNames = new Set(starterRecipes(from).map(recipe => recipe.recipeName));
            if (recipes.length > 0 && recipes.every(recipe => starterNames.has(recipe.recipeName))) {
                localStorage.setItem("globalRecipeList", JSON.stringify(starterRecipes(to)));
            }
        } catch { return; }
    };

    const close = () => {
        translateStarterData(startLanguage.current, language);
        saveGeneratorOptions({ ...loadGeneratorOptions(), portions });
        const cleanName = name.trim();
        if (status === "signedIn" && user && cleanName && cleanName !== user.name) void updateProfile({ name: cleanName });
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

                <div className="welcomeSetup">
                    <div className="welcomeSetupRow">
                        <span>{t("lang.label")}</span>
                        <LanguageSwitch className="settingsInput" />
                    </div>
                    {status === "signedIn" && user && (
                        <div className="welcomeSetupRow">
                            <span>{t("settings.profile.name")}</span>
                            <input className="settingsInput" type="text" value={name} maxLength={40}
                                placeholder={t("settings.profile.namePlaceholder")} onChange={(e) => setName(e.target.value)} />
                        </div>
                    )}
                    <div className="welcomeSetupRow">
                        <span>{t("household.portions")}</span>
                        <div className="genStepper">
                            <MinusCircle aria-label="-" onClick={() => setPortions(value => Math.max(MIN_PORTIONS, value - 1))} />
                            <span className="genCount">{portions}</span>
                            <PlusCircle aria-label="+" onClick={() => setPortions(value => Math.min(MAX_PORTIONS, value + 1))} />
                        </div>
                    </div>
                    <p className="welcomeNote">{t("welcome.setup.hint")}</p>
                </div>

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
