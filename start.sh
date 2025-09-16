#!/bin/bash

echo "============================="
echo "  🚀 Lancement Meal Prep Board"
echo "============================="

# Aller dans le dossier du script
# Cela correspond à %~dp0 dans le batch (le chemin du script)
# On utilise dirname et $0
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Vérifier si node_modules existe
if [ ! -d "node_modules" ]; then
  echo "📦 Installation des dépendances..."
  npm install
fi

echo "▶️  Lancement de l'application..."
npm run dev

# Pause
# On peut attendre une touche pour fermer, si le script est dans un terminal
echo "Appuie sur une touche pour quitter..."
read -n 1 -s
