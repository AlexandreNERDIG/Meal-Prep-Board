import { useState, useEffect } from 'react';
import { Download, Upload, X } from 'react-feather';
import toast from 'react-hot-toast';
import { buildBackup, backupFileName, parseBackup, mergeBackup, readCurrentData, writeData } from '../lib/backup';
import type { BackupData } from '../lib/backup';

const FLASH_KEY = "backupFlashMessage";

type IncomingBackup = { data: BackupData; fileName: string };

// Exporter / importer toutes les données de l'appli (recettes, stock, historique) dans un seul fichier JSON
const BackupPanel = () => {

    const [incoming, setIncoming] = useState<IncomingBackup | null>(null);

    // Après un import on recharge la page (pour que chaque écran relise les nouvelles données) : le message est affiché après le rechargement
    useEffect(() => {
        try {
            const message = sessionStorage.getItem(FLASH_KEY);
            if (message) {
                sessionStorage.removeItem(FLASH_KEY);
                toast.success(message);
            }
        } catch {
            // sessionStorage indisponible : tant pis pour le message
        }
    }, []);

    const reloadWithMessage = (message: string) => {
        try {
            sessionStorage.setItem(FLASH_KEY, message);
        } catch {
            // idem
        }
        window.location.reload();
    }

    const handleExport = () => {
        const backup = buildBackup(readCurrentData());
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = backupFileName();
        a.click();

        URL.revokeObjectURL(url);
        toast.success("Sauvegarde téléchargée");
    }

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;

        const result = parseBackup(await file.text());
        if (!result.ok) {
            toast.error(result.error);
            return;
        }
        setIncoming({ data: result.data, fileName: file.name });
    }

    const handleMerge = () => {
        if (!incoming) return;
        const { data, added } = mergeBackup(readCurrentData(), incoming.data);
        writeData(data);
        reloadWithMessage(`Fusion terminée : ${added.recipes} recette(s), ${added.ingredients} ingrédient(s), ${added.weeks} semaine(s) ajouté(s)`);
    }

    const handleReplace = () => {
        if (!incoming) return;
        writeData(incoming.data);
        reloadWithMessage("Sauvegarde restaurée");
    }

    return (
        <>
        <div className="backupPanel">
            <h3>Mes données</h3>
            <p>Une sauvegarde contient tes recettes, ton stock et ton historique. Elle te permet de les récupérer si tu changes de navigateur ou d'appareil.</p>
            <div className="backupActions">
                <button type="button" className="fileBtn" onClick={handleExport}>
                    <Download size={16}/> Exporter mes données
                </button>
                <label className="fileBtn">
                    <Upload size={16}/> Importer une sauvegarde
                    <input type="file" accept=".json,application/json" onChange={handleFile}/>
                </label>
            </div>
        </div>

        {incoming && (
            <div className="modalOverlay" onClick={() => setIncoming(null)}>
                <div className="deleteModalContent" onClick={(e) => e.stopPropagation()}>
                    <div className="head">
                        <h3>Importer cette sauvegarde ?</h3>
                        <div><X className='logo' onClick={() => setIncoming(null)}></X></div>
                    </div>
                    <p><strong>{incoming.fileName}</strong> contient {incoming.data.recipes.length} recette(s), {incoming.data.stock.length} ingrédient(s) et {incoming.data.history.length} semaine(s) d'historique.</p>
                    <p><strong>Fusionner</strong> ajoute ce qui te manque sans rien écraser. <strong>Tout remplacer</strong> efface tes données actuelles : exporte-les d'abord si tu veux les garder.</p>
                    <div className="deleteModalActions">
                        <button className="confirmDeleteBtn" onClick={handleMerge}>Fusionner</button>
                        <button className="cancelDeleteBtn" onClick={handleReplace}>Tout remplacer</button>
                    </div>
                </div>
            </div>
        )}
        </>
    )
}

export default BackupPanel;
