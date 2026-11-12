import toast from 'react-hot-toast';

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
                    toast.success("Suppression annulée");
                }}
            >
                Annuler
            </button>
        </span>
    ), { duration: 8000, icon: "🗑️" });
};
