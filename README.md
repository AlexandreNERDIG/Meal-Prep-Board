# MyPrepBoard

Application web de meal prep : planifier ses repas de la semaine, suivre son stock, ses prix et ses macros, générer la liste de courses. Disponible en français, anglais et espagnol, installable comme une appli (PWA) et utilisable hors ligne.

## Fonctionnalités

- Générateur de repas de la semaine (favoris, variété, stock disponible, objectif nutritionnel, nombre de portions)
- Recettes (création, import / export JSON, photo depuis l'appareil) et historique des repas
- Stock d'ingrédients avec scan de code-barres (Open Food Facts) et photo de l'objet
- Liste de courses, avec envoi optionnel sur un salon Discord
- Compte (Supabase) avec synchronisation entre appareils, sauvegarde et restauration des données

## Stack

React 18, Vite, TypeScript (mode strict), react-router-dom, Supabase (authentification et base PostgreSQL), hébergement Netlify.

## Démarrer en local

Prérequis : Node.js 20 ou plus récent.

```bash
git clone https://github.com/AlexandreNERDIG/Meal-Prep-Board.git
cd Meal-Prep-Board
cp .env.example .env
npm install
npm run dev
```

Renseigne dans `.env` l'URL de ton projet Supabase et sa clé publishable (Supabase : Project Settings, puis API Keys). Seules des clés publiques vont dans ce fichier : n'y mets jamais la clé `service_role` ni aucun secret.

## Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Vérification TypeScript puis build de production dans `dist/` |
| `npm run preview` | Prévisualiser le build |
| `npm run lint` | ESLint |

## Base de données

Les scripts SQL sont dans `supabase/sql/` et s'exécutent dans l'ordre (SQL Editor de Supabase) : `001_schema.sql`, `002_schema_v2.sql`, `003_feedback.sql`, `004_activity.sql`, `005_hardening.sql`.

## Déploiement

Le site est déployé sur Netlify à chaque push sur `main`.

- Commande de build : `npm run build`, dossier publié : `dist` (voir `netlify.toml`)
- Variables d'environnement à définir dans Netlify : `VITE_SUPABASE_URL` et `VITE_SUPABASE_PUBLISHABLE_KEY`
- En-têtes de sécurité (dont la Content-Security-Policy) : `public/_headers`
- Redirection des routes vers `index.html` : `public/_redirects`
- Supabase, Authentication, URL Configuration : la Site URL et les Redirect URLs doivent contenir le domaine de production
- Les emails d'authentification partent de Resend (SMTP personnalisé dans Supabase)

## Structure

```
src/
  Components/   pages et composants de l'interface
  auth/         connexion, inscription, compte
  lib/          logique métier (recettes, stock, synchronisation, sauvegarde, courses)
  i18n/         traductions (fr, en, es)
supabase/sql/   scripts de la base de données
public/         icônes, manifest, service worker, en-têtes HTTP
```

## Données et crédits

- Les informations produits (scan de code-barres) viennent d'[Open Food Facts](https://world.openfoodfacts.org), sous licence ODbL ; leur source est indiquée dans l'appli.
- Les données de l'utilisateur sont stockées dans son navigateur et, s'il est connecté, dans sa base Supabase. Voir la page Confidentialité de l'appli.

## Webhook Discord (optionnel)

Dans Discord : Paramètres du serveur, Intégrations, Webhooks, puis copie l'URL du webhook. Dans l'appli, ouvre Réglages et colle l'URL dans le bloc Discord. Traite cette URL comme un mot de passe : toute personne qui la possède peut écrire dans le salon.
