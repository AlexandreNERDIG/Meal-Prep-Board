@echo off
title Meal Prep Board

echo =============================
echo   🚀 Lancement Meal Prep Board
echo =============================

:: Aller dans le dossier où se trouve le script (au lieu d’un chemin fixe)
cd /d %~dp0

:: Vérifier si node_modules existe
if not exist node_modules (
    echo 📦 Installation des dépendances...
    call npm install
)

echo ▶️  Lancement de l'application...
call npm run dev

pause