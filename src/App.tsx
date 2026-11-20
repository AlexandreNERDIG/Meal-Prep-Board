import { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './Components/HomePage';
import MealHistory from './Components/MealHistory';
import NavBar from './Components/NavBar';
import RecipeList from './Components/RecipeList';
import CurrentStock from './Components/CurrentStock';
import Settings from './Components/Settings';
import { recipeInfo, defaultList } from './Components/typeFile'
import toast, { Toaster } from 'react-hot-toast';
import { syncDefaultStock } from './lib/recipeUtils';
import { LanguageProvider, useT } from './i18n/LanguageProvider';
import Privacy from './Components/Privacy';
import Footer from './Components/Footer';
import Welcome from './Components/Welcome';
import ScrollToTop from './Components/ScrollToTop';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { AuthScreen, ResetPasswordScreen, Splash } from './auth/AuthScreen';
import { isCloudConfigured, supabase } from './lib/supabase';
import { initialSync, installTracking } from './lib/cloudSync';
import type { CloudClient } from './lib/cloudSync';
import './App.css';
import './responsive.css';

// Starting Data
const seedLocalStorage = () => {
    if (!localStorage.getItem("globalRecipeList")) {
      localStorage.setItem("globalRecipeList", JSON.stringify(recipeInfo));
    }

    if (!localStorage.getItem("mealHistoryList")) {
      localStorage.setItem("mealHistoryList", JSON.stringify([]));
    }

    if (!localStorage.getItem("currentStockList")) {
      localStorage.setItem("currentStockList", JSON.stringify(defaultList));
    }

    syncDefaultStock();
};

const Shell = () => (
    <>
        <Welcome />
        <div className='ContentDisplay'>
            <NavBar />
            <Routes>
                <Route path='/' element={<HomePage />} />
                <Route path='/RecipeList' element={<RecipeList />} />
                <Route path='/NewMeal' element={<Navigate to="/RecipeList" replace />} />
                <Route path='/MealHistory' element={<MealHistory />} />
                <Route path='/CurrentStock' element={<CurrentStock />} />
                <Route path='/Settings' element={<Settings />} />
                <Route path='/Privacy' element={<Privacy />} />
            </Routes>
            <Footer />
        </div>
    </>
);

let inflight: { userId: string; promise: ReturnType<typeof initialSync> } | null = null;

const runInitialSync = (userId: string) => {
    if (!inflight || inflight.userId !== userId) {
        const promise = initialSync(supabase as unknown as CloudClient, seedLocalStorage);
        inflight = { userId, promise };
        promise.catch(() => { if (inflight?.promise === promise) inflight = null; });
    }
    return inflight.promise;
};

const hasLocalData = (): boolean => {
    try { return localStorage.getItem("currentStockList") !== null && localStorage.getItem("globalRecipeList") !== null; } catch { return false; }
};

type Phase = "syncing" | "ready" | "failed" | "offline";

const Gate = () => {
    const { t, language, setLanguage } = useT();
    const { status, user } = useAuth();
    const [phase, setPhase] = useState<Phase>("syncing");
    const [attempt, setAttempt] = useState(0);
    const languageRef = useRef(language);
    languageRef.current = language;

    const [localSeeded] = useState(() => { if (!isCloudConfigured) seedLocalStorage(); return true; });

    const userId = user?.id ?? null;

    useEffect(() => {
        if (status !== "signedIn" || !userId) return;
        let cancelled = false;
        setPhase("syncing");

        runInitialSync(userId)
            .then(() => {
                if (cancelled) return;
                const saved = localStorage.getItem("language");
                if ((saved === "fr" || saved === "en") && saved !== languageRef.current) setLanguage(saved);
                setPhase("ready");
            })
            .catch((error) => {
                console.error("Synchronisation initiale impossible :", error);
                if (!cancelled) setPhase("failed");
            });

        return () => { cancelled = true; };
    }, [status, userId, attempt, setLanguage]);

    // Offline Mode we try again till it succeed and once it does we fetch and update
    useEffect(() => {
        if (phase !== "offline" || !userId) return;
        const retry = () => {
            inflight = null;
            runInitialSync(userId).then(result => { if (result === "pulled") window.location.reload(); }).catch(() => { /* on réessaiera */ });
        };
        const timer = setInterval(retry, 20000);
        window.addEventListener("online", retry);
        return () => { clearInterval(timer); window.removeEventListener("online", retry); };
    }, [phase, userId]);

    if (!isCloudConfigured) return localSeeded ? <Shell /> : null;

    if (status === "loading" || status === "disabled") return <Splash />;
    if (status === "recovery") return <ResetPasswordScreen />;

    if (status === "signedOut") {
        return (
            <Routes>
                <Route path='/Privacy' element={<div className='ContentDisplay'><NavBar /><Privacy /><Footer /></div>} />
                <Route path='*' element={<AuthScreen />} />
            </Routes>
        );
    }

    if (phase === "syncing") return <Splash><p>{t("sync.loading")}</p></Splash>;

    if (phase === "failed") {
        return (
            <Splash>
                <p>{t("sync.failed")}</p>
                <div className="splashActions">
                    <button type="button" className="fileBtn" onClick={() => { inflight = null; setAttempt(n => n + 1); }}>{t("sync.retry")}</button>
                    {hasLocalData() && (
                        <button type="button" className="fileBtn" onClick={() => { installTracking(); toast(t("sync.offlineToast")); setPhase("offline"); }}>
                            {t("sync.useLocal")}
                        </button>
                    )}
                </div>
            </Splash>
        );
    }

    return <Shell />;
};

function App() {
    return (
        <LanguageProvider>
        <Router>
            <ScrollToTop />
            <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
            <AuthProvider>
                <Gate />
            </AuthProvider>
        </Router>
        </LanguageProvider>
    );
}

export default App;
