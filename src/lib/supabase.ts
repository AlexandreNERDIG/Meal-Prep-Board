import { createClient } from '@supabase/supabase-js';

// Connexion à Supabase. Les deux valeurs viennent du fichier .env (publiques par conception : la sécurité repose sur les règles RLS).
// Si elles sont absentes, l'appli fonctionne comme avant, 100 % en local, sans compte.
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isCloudConfigured: boolean = Boolean(url && key);

export const supabase = isCloudConfigured ? createClient(url as string, key as string) : null;
