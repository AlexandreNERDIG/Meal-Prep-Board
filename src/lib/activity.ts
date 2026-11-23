import { isCloudConfigured, supabase } from './supabase';

const OPT_OUT_KEY = "activityOptOut";
const LAST_PING_KEY = "lastActivityPing";

export const isActivityEnabled = (): boolean => {
    try { return localStorage.getItem(OPT_OUT_KEY) !== "1"; } catch { return true; }
};

export const setActivityEnabled = (enabled: boolean) => {
    try {
        if (enabled) localStorage.removeItem(OPT_OUT_KEY);
        else localStorage.setItem(OPT_OUT_KEY, "1");
    } catch { return; }
};

export const recordActivity = async (): Promise<void> => {
    if (!isCloudConfigured || !supabase || !isActivityEnabled()) return;
    const today = new Date().toISOString().slice(0, 10);
    try {
        if (localStorage.getItem(LAST_PING_KEY) === today) return;
        const { error } = await supabase.rpc("record_activity");
        if (!error) localStorage.setItem(LAST_PING_KEY, today);
    } catch { return; }
};
