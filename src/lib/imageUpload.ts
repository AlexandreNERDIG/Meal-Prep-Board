// Lit une image choisie par l'utilisateur, la réduit (côté le plus long : MAX_SIDE px) et la renvoie sous forme
// de "data URL" JPEG. L'image est ainsi stockée directement dans les données de l'appli (localStorage, puis base de
// données plus tard) au lieu d'un simple chemin de fichier qui n'existerait pas sur le serveur / le téléphone.
const MAX_SIDE = 800;
const QUALITY = 0.82;

export const fileToResizedDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();

        img.onload = () => {
            URL.revokeObjectURL(url);
            const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
            const canvas = document.createElement("canvas");
            canvas.width = Math.max(1, Math.round(img.width * scale));
            canvas.height = Math.max(1, Math.round(img.height * scale));

            const ctx = canvas.getContext("2d");
            if (!ctx) { reject(new Error("canvas")); return; }

            // Fond blanc : un PNG transparent deviendrait noir en JPEG
            ctx.fillStyle = "#fff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL("image/jpeg", QUALITY));
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("image"));
        };

        img.src = url;
    });
