import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';

type AuthStatus = "disabled" | "loading" | "signedOut" | "signedIn" | "recovery";

type AuthUser = { id: string; email: string; name: string };

type ProfileChanges = { name?: string; email?: string; password?: string };

export type AuthErrorKind = "credentials" | "notConfirmed" | "weakPassword" | "rateLimit" | "network" | "other";
export type AuthResult = { ok: true; needsConfirmation?: boolean } | { ok: false; kind: AuthErrorKind; message: string; code: string };

type AuthContextValue = {
    status: AuthStatus;
    user: AuthUser | null;
    signIn: (email: string, password: string) => Promise<AuthResult>;
    signUp: (email: string, password: string) => Promise<AuthResult>;
    sendReset: (email: string) => Promise<AuthResult>;
    setNewPassword: (password: string) => Promise<AuthResult>;
    updateProfile: (changes: ProfileChanges) => Promise<AuthResult>;
    signOutNow: () => Promise<void>;
    deleteAccount: () => Promise<AuthResult>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type RawError = { message?: string; code?: string; status?: number; name?: string };

const classifyAuthError = (error: RawError): AuthErrorKind => {
    const code = error.code ?? "";
    const message = (error.message ?? "").toLowerCase();
    if (code === "invalid_credentials" || message.includes("invalid login credentials")) return "credentials";
    if (code === "email_not_confirmed" || message.includes("email not confirmed")) return "notConfirmed";
    if (code === "weak_password" || message.includes("password should be at least") || message.includes("weak password")) return "weakPassword";
    if (code === "over_email_send_rate_limit" || code === "over_request_rate_limit" || error.status === 429) return "rateLimit";
    if (error.name === "AuthRetryableFetchError" || message.includes("failed to fetch") || message.includes("network")) return "network";
    return "other";
};

const fail = (error: RawError): AuthResult => ({ ok: false, kind: classifyAuthError(error), message: error.message ?? "", code: error.code ?? "" });

// Le nom affiché est rangé dans les métadonnées du compte (user_metadata.display_name)
const toUser = (user: { id: string; email?: string; user_metadata?: Record<string, unknown> }): AuthUser => ({
    id: user.id,
    email: user.email ?? "",
    name: typeof user.user_metadata?.display_name === "string" ? user.user_metadata.display_name : "",
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [status, setStatus] = useState<AuthStatus>(supabase ? "loading" : "disabled");
    const [user, setUser] = useState<AuthUser | null>(null);

    useEffect(() => {
        if (!supabase) return;
        let active = true;

        supabase.auth.getSession().then(({ data }) => {
            if (!active) return;
            const session = data.session;
            setUser(session ? toUser(session.user) : null);
            setStatus(prev => prev === "recovery" ? prev : session ? "signedIn" : "signedOut");
        });

        const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
            if (!active) return;
            setUser(session ? toUser(session.user) : null);
            if (event === "PASSWORD_RECOVERY") setStatus("recovery");
            else if (event === "SIGNED_OUT") setStatus("signedOut");
            else if (event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
                setStatus(prev => prev === "recovery" ? prev : session ? "signedIn" : "signedOut");
            }
        });

        return () => { active = false; listener.subscription.unsubscribe(); };
    }, []);

    const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
        if (!supabase) return { ok: false, kind: "other", message: "", code: "" };
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            return error ? fail(error) : { ok: true };
        } catch (error) {
            return fail({ message: String(error), name: "AuthRetryableFetchError" });
        }
    }, []);

    const signUp = useCallback(async (email: string, password: string): Promise<AuthResult> => {
        if (!supabase) return { ok: false, kind: "other", message: "", code: "" };
        try {
            const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
            if (error) return fail(error);
            return { ok: true, needsConfirmation: !data.session };
        } catch (error) {
            return fail({ message: String(error), name: "AuthRetryableFetchError" });
        }
    }, []);

    const sendReset = useCallback(async (email: string): Promise<AuthResult> => {
        if (!supabase) return { ok: false, kind: "other", message: "", code: "" };
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
            return error ? fail(error) : { ok: true };
        } catch (error) {
            return fail({ message: String(error), name: "AuthRetryableFetchError" });
        }
    }, []);

    const setNewPassword = useCallback(async (password: string): Promise<AuthResult> => {
        if (!supabase) return { ok: false, kind: "other", message: "", code: "" };
        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) return fail(error);
            setStatus("signedIn");
            return { ok: true };
        } catch (error) {
            return fail({ message: String(error), name: "AuthRetryableFetchError" });
        }
    }, []);

    // Modifie le nom affiché, l'adresse e-mail et/ou le mot de passe du compte connecté.
    // Un changement d'adresse n'est effectif qu'après le clic sur le lien envoyé par e-mail.
    const updateProfile = useCallback(async (changes: ProfileChanges): Promise<AuthResult> => {
        if (!supabase) return { ok: false, kind: "other", message: "", code: "" };
        const attributes: { email?: string; password?: string; data?: { display_name: string } } = {};
        if (changes.name !== undefined) attributes.data = { display_name: changes.name };
        if (changes.email !== undefined) attributes.email = changes.email;
        if (changes.password !== undefined) attributes.password = changes.password;
        try {
            const { error } = await supabase.auth.updateUser(attributes, changes.email !== undefined ? { emailRedirectTo: window.location.origin } : undefined);
            return error ? fail(error) : { ok: true, needsConfirmation: changes.email !== undefined };
        } catch (error) {
            return fail({ message: String(error), name: "AuthRetryableFetchError" });
        }
    }, []);

    const signOutNow = useCallback(async (): Promise<void> => {
        if (!supabase) return;
        await supabase.auth.signOut();
    }, []);

    const deleteAccount = useCallback(async (): Promise<AuthResult> => {
        if (!supabase) return { ok: false, kind: "other", message: "", code: "" };
        try {
            const { error } = await supabase.rpc("delete_my_account");
            if (error) return fail(error);
            await supabase.auth.signOut();
            return { ok: true };
        } catch (error) {
            return fail({ message: String(error), name: "AuthRetryableFetchError" });
        }
    }, []);

    return (
        <AuthContext.Provider value={{ status, user, signIn, signUp, sendReset, setNewPassword, updateProfile, signOutNow, deleteAccount }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextValue => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth() doit être utilisé à l'intérieur de <AuthProvider>");
    return context;
};
