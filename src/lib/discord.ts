// Le lien (webhook) du salon Discord où part la liste de courses.
// Il est stocké dans le localStorage sous forme de texte JSON ("..."), comme avant : les données existantes restent valables.

export const WEBHOOK_KEY = "discordWebhook";

const WEBHOOK_PATTERN = /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[A-Za-z0-9_-]+$/;

export const isValidWebhook = (url: string): boolean => WEBHOOK_PATTERN.test(url);

export const loadWebhook = (): string => {
    try {
        const saved = localStorage.getItem(WEBHOOK_KEY);
        const value: unknown = saved ? JSON.parse(saved) : "";
        return typeof value === "string" ? value : "";
    } catch {
        return "";
    }
};

// Un lien vide efface le webhook
export const saveWebhook = (url: string): void => {
    localStorage.setItem(WEBHOOK_KEY, JSON.stringify(url));
};
