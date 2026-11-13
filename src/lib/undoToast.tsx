import toast from 'react-hot-toast';
import { translate } from '../i18n/core';

// Notification avec un bouton "Annuler" (suppressions) : onUndo remet l'élément supprimé.
export const toastUndo = (message: string, onUndo: () => void) => {
    toast((t) => (
        <span className="undoToast">
            {message}
            <button
                type="button"
                className="undoBtn"
                onClick={() => {
                    onUndo();
                    toast.dismiss(t.id);
                    toast.success(translate("common.undone"));
                }}
            >
                {translate("common.undo")}
            </button>
        </span>
    ), { duration: 8000, icon: "🗑️" });
};
