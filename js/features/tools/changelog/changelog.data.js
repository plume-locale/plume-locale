/* ==========================================
   CHANGELOG DATA — Généré le 2026-02-26 18:36
   Source : git log (historique réel)
   NE PAS MODIFIER À LA MAIN.
   Exécuter build-changelog-from-git.py pour regénérer.
   ========================================== */

window.CHANGELOG_DATA = [
  {
    "version": "617a966",
    "date":    "2026-02-26",
    "type":    "minor",
    "summary": "Nouveau dictionnaire de synonymes fr",
    "content": `# Nouveau dictionnaire de synonymes fr

**Date :** 26 February 2026 · **Commit :** \`617a966\`

## ✨ Nouveautés

- Nouveau dictionnaire de synonymes fr
- Ajout i18n manquants
- Ajout d'autres product-tour et suppression de thriller board
- Ajout de product-tour sur differents item
- Ajout d'un deploy to prd

## 🐛 Corrections

- Maj synonymes en 4 langues, correctio nde la fonctio ndessin dans globalnotes
- Correction de i18n scrivener 3eme fois
- Correction de la détection de langue du navigateur pour live/index.html
- Correction langue par défaut
- Correction du tour editor
- Correction mediaqueries <900px
- Freeze mobile <900px
- Mise à jour intelligente des scirpts python et correction du bug mobile qui freezait l'app`
  },
  {
    "version": "868ad58",
    "date":    "2026-02-20",
    "type":    "minor",
    "summary": "Introduce focus mode, interface customizer, and mobile menu features with new co",
    "content": `# Introduce focus mode, interface customizer, and mobile menu features with new core application views, styles, and HTML s

**Date :** 20 February 2026 · **Commit :** \`868ad58\`

## ✨ Nouveautés

- Introduce focus mode, interface customizer, and mobile menu features with new core application views, styles, and HTML s
- Establish core application structure with internationalization support for multiple languages and keyboard shortcut mana
- Implement Metro Timeline visualization and arc editor for worldbuilding and planning.
- Feat : Structure HTML : Mise à jour de body.html  pour supporter la nouvelle barre de progression. Design System : Utili
- Feat : amélioration UI Onglets (Tabs) : CSS mis à jour pour flex width, min-width: 80px, max-width: 240px, styles avec t
- Feat : import Scrivener
- Feat : scène unique invisible, comportement de l'accordeon et calcul de tension
- Implement interface customizer with module management, user settings, and admin controls, including new localization fil

## 🐛 Corrections

- Correction de tension en mode mobile, du menu mobile, de mention-help
- Correction des builds locaux et /live
- Chapitre monoscène, correctio nde la détectio nde tension et du comportement de l'accordeon
- Correction de narrative-overview
- Afficher tous les actes même sans passages
- Flush l'accumulateur aux frontières d'actes
- Pas de wrapper acte quand un seul acte
- On claude/fix-narrative-overview-zOWbq: !!GitHub_Desktop<claude/fix-narrative-overview-zOWbq>`
  },
  {
    "version": "09201a9",
    "date":    "2026-02-16",
    "type":    "minor",
    "summary": "Add 300px wide narrative overview sidebar",
    "content": `# Add 300px wide narrative overview sidebar

**Date :** 16 February 2026 · **Commit :** \`09201a9\`

## ✨ Nouveautés

- Add 300px wide narrative overview sidebar
- Refonte ergonomique mobile: editeur plein ecran + bottom nav + treeview tactile
- Add missing sidebar.no_info translation key to all locales
- Introduce scene versioning, implement core app view orchestration, and add tools sidebar and global notes viewmodels.
- Add \`characters.css\` for character sheet and detail view styling and update \`.gitignore\` to ignore \`__pycache__\`.
- Refonte du menu contextuel GlobalNotes avec actions utiles
- I18n: ajouter les traductions tabs presets pour es.js et de.js
- Système de presets pour sauvegarder les dispositions d'onglets

## 🐛 Corrections

- Fix ES6 class syntax errors in narrative overview
- Ajout du système de calques et correction de l'i18n
- Correction de l'oubli de Plot Grid et correction des2 icones identiques pour corkBoard et Plot grid
- Coorection des onglets qui disparaissaient & correction des arcs e du drag n drop
- I18n correction
- Merge branch 'claude/mobile-ui-ergonomics-n1E9F' into claude/fix-mobile-menu-toggle-9r64J
- Remove duplicate toggleFloatingEditorMenu() causing mobile menu toggle failure
- Correction de traduction`
  },
  {
    "version": "e8f4054",
    "date":    "2026-02-12",
    "type":    "minor",
    "summary": "Ajout des stats en \u00e9l\u00e9ment masquables",
    "content": `# Ajout des stats en élément masquables

**Date :** 12 February 2026 · **Commit :** \`e8f4054\`

## ✨ Nouveautés

- Ajout des stats en élément masquables
- Ajout des liminaires et des la personnalisation de l'interface
- Ajout de templates de création re roman
- Feat : projet demo en multi-langue
- Ajout plotgrid
- Proto de demo
- Feat : ajout d'un editeur de tour WYSIWYG
- Proto du product tour

## 🐛 Corrections

- Correction de landing
- Ajout de la landing page et correction de 'Organiser'
- Correction de la bascule de vue après la suppression d'un projet
- Fix product-tour
- Fix : product-tour data
- Fix : pointer events
- Correctino de aperçu avant impression
- Correction CSS projet en vue mobile`
  },
  {
    "version": "59d8706",
    "date":    "2026-02-08",
    "type":    "minor",
    "summary": "Ajout de la doc",
    "content": `# Ajout de la doc

**Date :** 08 February 2026 · **Commit :** \`59d8706\`

## ✨ Nouveautés

- Ajout de la doc
- Ajout de Allemenad et espagnol

## 🐛 Corrections

- Correction de searchbar
- Deplacement de la doc et correction icone clavier et menu mobile
- Fix to localisation
- Fix : effacer demo retiré
- Fix build live
- Fix : plus de terme Importé après un import
- Fix : scene
- Fix du live`
  },
  {
    "version": "7d061e0",
    "date":    "2026-02-04",
    "type":    "minor",
    "summary": "Feat : test google drive int\u00e9gration",
    "content": `# Feat : test google drive intégration

**Date :** 04 February 2026 · **Commit :** \`7d061e0\`

## ✨ Nouveautés

- Feat : test google drive intégration
- Add i18n implementation planning documentation
- Add GitHub Pages setup documentation
- Add GitHub Actions workflow to deploy live directory to GitHub Pages
- Add: génération automatique de index.html dans /live
- Deploy: ajout du système de déploiement et répertoire /live
- Implement strict MVVM architecture with CRUD model
- Add comprehensive cleanup of Driver.js DOM elements

## 🐛 Corrections

- Fix : scroll souris
- Fix ; correction du séparateur de scène qui ne marchait pas
- Fix : refactor de dragndrop-act en MVVM et correction de Organiser les actes/chapitres
- Fix : refactor de mobile-swipe en MVVM
- Fix : refactor keyboard-shortcuts in MVVM
- Fix : refactor mobile-menu en MVVM
- Refactor de snapshots en MVVM
- Fix : refactor en MVVM de stockage`
  },
  {
    "version": "96ff6a2",
    "date":    "2026-01-31",
    "type":    "minor",
    "summary": "Liens carte\u2194carte/colonne en mode Solo (pas seulement inter-arcs)",
    "content": `# Liens carte↔carte/colonne en mode Solo (pas seulement inter-arcs)

**Date :** 31 January 2026 · **Commit :** \`96ff6a2\`

## ✨ Nouveautés

- Liens carte↔carte/colonne en mode Solo (pas seulement inter-arcs)
- Liens inter-arcs entre cartes (carte→carte, colonne→carte, etc.)
- Arcs interactifs et slider de transparence en mode Compare
- Poignée de redimensionnement vertical en mode Compare
- Sidebar droite dédiée pour l'analyseur de répétitions
- Surlignage des occurrences dans l'éditeur
- Ajout de l'analyseur de répétitions de mots (MVVM)
- Refonte mode Compare avec arcs complets côte à côte

## 🐛 Corrections

- Afficher les noms des arcs dans les tags inter-arcs
- Améliorer lisibilité des tags inter-arcs
- Z-index du layer connexions pour visibilité en mode Compare
- Opacité uniquement sur le fond en mode Compare
- Z-index élevé sur colonnes en mode Compare
- Permettre aux événements de déborder en mode Compare
- Éviter le stacking context causé par opacity en mode Compare
- Contrôle opacité à gauche et transparence réelle en mode Compare`
  },
  {
    "version": "3935ce0",
    "date":    "2026-01-27",
    "type":    "minor",
    "summary": "Proto : analyse de la respiration du texte",
    "content": `# Proto : analyse de la respiration du texte

**Date :** 27 January 2026 · **Commit :** \`3935ce0\`

## ✨ Nouveautés

- Proto : analyse de la respiration du texte
- Org : named folders for refactored features
- Fermer tous les panneaux du toolsSidebar lors de la sortie de la vue structure
- Créer un élément flottant scene sur le canvas quand "Arc général" est sélectionné
- Ajouts des règles pour claude et antigravity
- Implement comprehensive undo-redo system for all features
- Support navigation entre scènes en mode chapitre et acte
- Afficher le nombre de mots avant/après le curseur

## 🐛 Corrections

- Merge branch 'claude/rebuild-undo-redo-lrbB5' into claude/fix-arc-card-deletion-yNDES
- Rafraîchir arc-board lors des modifications depuis arcScenePanel
- Synchronisation complète CRUD entre arc-board et arcScenePanel
- Mettre à jour scenePresence quand un élément flottant scene est droppé dans une colonne
- Position et z-index des éléments flottants scene
- Supprimer la carte arc-board lors du retrait d'un arc depuis arcScenePanel
- Mettre à jour arcScenePanel lors de la suppression d'une carte liée
- Correction des textarea en vue structure`
  },
  {
    "version": "53dbac2",
    "date":    "2026-01-23",
    "type":    "minor",
    "summary": "Aligner les panneaux annotations, todos et arcs avec la sidebar gauche",
    "content": `# Aligner les panneaux annotations, todos et arcs avec la sidebar gauche

**Date :** 23 January 2026 · **Commit :** \`53dbac2\`

## ✨ Nouveautés

- Aligner les panneaux annotations, todos et arcs avec la sidebar gauche
- Ajouter bouton toggle linksPanel + forcer refresh au retour sur Structure
- Merge pull request #1 from plume-locale/claude/add-vertical-tools-sidebar-iXJEF
- Ajouter une sidebar verticale d'outils à côté de la sidebar principale
- Feat : add plot grid
- Feat : ajour d'un fichier .md qui liste les fonctions par fichier.js
- Feat : Caractérisation des MVVM : Other
- Feat : déf des fonctions selon MVVM

## 🐛 Corrections

- Unifier le rendu du linksPanel avec refreshLinksPanel()
- Déplacer les modifications JS vers js-refactor/
- Fix
- Fix thiller board
- Fix : correction de viewmodel
- Fix : Hormosnisation des modèles de commentaires
- Fix : correction des fichiers non UTF-8
- Correction de split-view.js`
  },
  {
    "version": "ec73b8b",
    "date":    "2026-01-19",
    "type":    "major",
    "summary": "Ajouter un bouton de suppression sur chaque carte thriller",
    "content": `# Ajouter un bouton de suppression sur chaque carte thriller

**Date :** 19 January 2026 · **Commit :** \`ec73b8b\`

## ✨ Nouveautés

- Ajouter un bouton de suppression sur chaque carte thriller
- Ajouter un ascenseur horizontal pour la grille thriller
- Ajouter des sockets individuels pour chaque témoin dans les cartes alibi
- Refonte complète de l'affichage des cartes Alibi
- Ajouter le bouton de suppression pour les éléments thriller dans le treeview
- Implémenter la création automatique de swimlanes et cartes
- Implémenter le drag & drop depuis le treeview et corriger les modales
- Implémenter le drag & drop de cartes et améliorer l'affichage des stacks

## 🐛 Corrections

- Correction des fond et bordure dans les modales
- Ajouter logs pour débugger les dimensions SVG et les styles CSS
- Ajouter logs de debug détaillés pour renderThrillerConnections et drawConnectionLine
- Ajouter logs de debug au chargement et au rendu de la grille
- Ajouter logs de debug détaillés pour la création de connexions`
  },
  {
    "version": "20434d1",
    "date":    "2026-01-09",
    "type":    "major",
    "summary": "Migration batch 5 FINAL: 5 derniers modules - 100% MIGRATION COMPL\u00c8TE! \ud83c\udf89",
    "content": `# Migration batch 5 FINAL: 5 derniers modules - 100% MIGRATION COMPLÈTE! 🎉

**Date :** 09 January 2026 · **Commit :** \`20434d1\`

## ✨ Nouveautés

- Migration batch 5 FINAL: 5 derniers modules - 100% MIGRATION COMPLÈTE! 🎉
- Batch 5: Mise à jour build-v2.py - Migration 100% complète
- WIP: Batch 5 - Ajout timeline-metro, export et project-extended
- WIP: Batch 5 - Ajout split-view et mindmap (partiel)
- Migration batch 4: 8 modules UI et services vers architecture MVC
- Migration batch 3: 9 services et utilitaires vers architecture MVC
- Migration batch 2: 8 utilitaires et services vers architecture MVC
- Ajout document de progression de migration

## 🐛 Corrections

- Ajout de fichiers de diagnostic et test pour débugger la démo
- Correction de l'auto-detection des personnages et des lieux
- Correction de panneau latéral en mode focus
- Revert "no message"`
  },
  {
    "version": "fe03339",
    "date":    "2025-12-29",
    "type":    "patch",
    "summary": "Update plume-locale.html",
    "content": `# Update plume-locale.html

**Date :** 29 December 2025 · **Commit :** \`fe03339\`

## 🔧 Modifications

- Update plume-locale.html`
  },
  {
    "version": "8d82fac",
    "date":    "2025-12-19",
    "type":    "patch",
    "summary": "Create plume-locale.html",
    "content": `# Create plume-locale.html

**Date :** 19 December 2025 · **Commit :** \`8d82fac\`

## 🔧 Modifications

- Create plume-locale.html
- Initial commit`
  }
];
