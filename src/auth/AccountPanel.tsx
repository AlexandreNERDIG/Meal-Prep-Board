import { useEffect, useState } from 'react';
import { LogOut, Trash2, X } from 'react-feather';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { useT } from '../i18n/LanguageProvider';
import { getSyncStatus, onSyncStatus, signOutCleanup } from '../lib/cloudSync';
import type { SyncStatus } from '../lib/cloudSync';

const AccountPanel = () => {
    const { t, tb } = useT();
    const { status, user, signOutNow, deleteAccount } = useAuth();

    const [syncStatus, setSyncStatus] = useState<SyncStatus>(getSyncStatus());
    const [modal, setModal] = useState<"none" | "unsent" | "delete">("none");
    const [busy, setBusy] = useState(false);

    useEffect(() => onSyncStatus(setSyncStatus), []);

    if (status !== "signedIn" || !user) return null;

    const finishSignOut = async (force: boolean) => {
        setBusy(true);
        const done = await signOutCleanup(force);
        if (!done) {
            setBusy(false);
            setModal("unsent");
            return;
        }
        await signOutNow();
        window.location.assign("/");
    };

    const handleDelete = async () => {
        setBusy(true);
        const result = await deleteAccount();
        if (!result.ok) {
            setBusy(false);
            toast.error(t("account.deleteFailed"));
            return;
        }
        await signOutCleanup(true);
        window.location.assign("/");
    };

    return (
        <>
        <div className="backupPanel accountPanel">
            <h3>{t("account.title")}</h3>
            <p>{tb("account.signedInAs", { email: user.email })}</p>
            <p className={`accountStatus${syncStatus === "error" ? " error" : ""}`} role="status">
                {t(syncStatus === "syncing" ? "account.status.syncing" : syncStatus === "error" ? "account.status.error" : "account.status.idle")}
            </p>
            <div className="accountActions">
                <button type="button" className="fileBtn" disabled={busy} onClick={() => finishSignOut(false)}>
                    <LogOut size={16}/> {t("account.signOut")}
                </button>
                <button type="button" className="fileBtn danger" disabled={busy} onClick={() => setModal("delete")}>
                    <Trash2 size={16}/> {t("account.delete")}
                </button>
            </div>
        </div>

        {modal !== "none" && (
            <div className="modalOverlay" onClick={() => !busy && setModal("none")}>
                <div className="deleteModalContent" onClick={(e) => e.stopPropagation()}>
                    <div className="head">
                        <h3>{t(modal === "delete" ? "account.deleteTitle" : "account.unsentTitle")}</h3>
                        <div><X className='logo' onClick={() => !busy && setModal("none")}></X></div>
                    </div>
                    <p>{tb(modal === "delete" ? "account.deleteExplain" : "account.unsentExplain")}</p>
                    <div className="deleteModalActions">
                        <button className="confirmDeleteBtn" disabled={busy}
                            onClick={() => modal === "delete" ? handleDelete() : finishSignOut(true)}>
                            {t(modal === "delete" ? "account.deleteConfirm" : "account.signOutAnyway")}
                        </button>
                        <button className="cancelDeleteBtn" disabled={busy} onClick={() => setModal("none")}>{t("common.cancel")}</button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};

export default AccountPanel;
