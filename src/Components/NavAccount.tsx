import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Settings } from 'react-feather';
import { useAuth } from '../auth/AuthContext';
import { useT } from '../i18n/LanguageProvider';
import { getSyncStatus, onSyncStatus } from '../lib/cloudSync';
import type { SyncStatus } from '../lib/cloudSync';

const NavAccount = () => {
    const { t } = useT();
    const { status, user } = useAuth();

    const [syncStatus, setSyncStatus] = useState<SyncStatus>(getSyncStatus());
    const [online, setOnline] = useState<boolean>(navigator.onLine);

    useEffect(() => onSyncStatus(setSyncStatus), []);

    useEffect(() => {
        const goOnline = () => setOnline(true);
        const goOffline = () => setOnline(false);
        window.addEventListener("online", goOnline);
        window.addEventListener("offline", goOffline);
        return () => {
            window.removeEventListener("online", goOnline);
            window.removeEventListener("offline", goOffline);
        };
    }, []);

    if (status !== "signedIn" || !user) return null;

    const state = !online || syncStatus === "error" ? "error" : syncStatus === "syncing" ? "busy" : "ok";
    const label = !online
        ? t("nav.offline")
        : t(syncStatus === "syncing" ? "account.status.syncing" : syncStatus === "error" ? "account.status.error" : "account.status.idle");

    return (
        <div className="navAccount">
            <span className={`statusDot ${state}`} role="img" aria-label={label} title={label}></span>
            
            <NavLink to="/Settings" style={{ textDecoration: 'none', color: 'inherit' }}>
                <span className="navAccountName" title={user.email}>
                    {user.name || user.email.split("@")[0]}
                </span>
            </NavLink>
            
            <NavLink to="/Settings" className="navGear" aria-label={t("page.settings")} title={t("page.settings")}>
                <Settings size={20}/>
            </NavLink>
        </div>
    );
};

export default NavAccount;
