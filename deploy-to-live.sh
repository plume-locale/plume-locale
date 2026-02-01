#!/bin/bash
# Script de déploiement vers /live
# Copie tous les fichiers nécessaires listés dans build.light.py vers le répertoire /live

# Ne pas arrêter sur erreur pour permettre de continuer même si des fichiers sont manquants
# set -e

BUILD_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LIVE_DIR="$BUILD_DIR/live"
LOG_FILE="$BUILD_DIR/deploy.log"

# Fonction de log
log() {
    echo "$1" | tee -a "$LOG_FILE"
}

# Initialiser le fichier log
echo "" > "$LOG_FILE"

log "========================================"
log "Déploiement vers /live - $(date '+%Y-%m-%d %H:%M:%S')"
log "========================================"
log "Répertoire source: $BUILD_DIR"
log "Répertoire cible: $LIVE_DIR"
log ""

# Nettoyer et créer le répertoire /live
if [ -d "$LIVE_DIR" ]; then
    log "--- Nettoyage du répertoire /live existant ---"
    rm -rf "$LIVE_DIR"
    log "   [OK] Répertoire /live supprimé"
fi

log "--- Création du répertoire /live ---"
mkdir -p "$LIVE_DIR"
log "   [OK] Répertoire /live créé"
log ""

log "--- Copie des fichiers ---"

COPIED=0
MISSING=0

# Fonction pour copier un fichier
copy_file() {
    local src="$BUILD_DIR/$1"
    local dest="$LIVE_DIR/$1"
    
    if [ -f "$src" ]; then
        mkdir -p "$(dirname "$dest")"
        cp "$src" "$dest"
        ((COPIED++))
    else
        log "   [!] Fichier manquant: $1"
        ((MISSING++))
    fi
}

# Fichiers CSS
copy_file "vendor/driver.css"
copy_file "css/01.variables.css"
copy_file "css/02.base.css"
copy_file "css/03.header.css"
copy_file "css/04.sidebar.css"
copy_file "css/05.modals.css"
copy_file "css/06.editor.css"
copy_file "css/07.characters.css"
copy_file "css/08.visualizations.css"
copy_file "css/09.utilities.css"
copy_file "css/10.mobile.css"
copy_file "css/12.arc-board.css"
copy_file "css/14.word-repetition.css"
copy_file "css/14.product-tour.css"

# CSS des modules
copy_file "js-refactor/synonyms/synonyms.css"

# Fichiers JS vendor
copy_file "vendor/driver.js.iife.js"

# Fichiers JS refactored
copy_file "js-refactor/01.app.refactor.js"
copy_file "js-refactor/03.projects.refactor.js"
copy_file "js-refactor/05.undo-redo.refactor.js"
copy_file "js-refactor/structure/structure.model.js"
copy_file "js-refactor/structure/structure.repository.js"
copy_file "js-refactor/structure/structure.viewmodel.js"
copy_file "js-refactor/00.app.view.js"
copy_file "js-refactor/structure/structure.view.js"
copy_file "js-refactor/structure/structure-organizer.view.js"
copy_file "js-refactor/structure/structure.helpers.js"
copy_file "js-refactor/07.stats.refactor.js"
copy_file "js-refactor/08.auto-detect.refactor.js"
copy_file "js-refactor/10.colorpalette.refactor.js"
copy_file "js-refactor/characters/characters.model.js"
copy_file "js-refactor/characters/characters.repository.js"
copy_file "js-refactor/characters/characters.viewmodel.js"
copy_file "js-refactor/characters/characters.view.js"
copy_file "js-refactor/16.split-view.js"
copy_file "js-refactor/world/world.model.js"
copy_file "js-refactor/world/world.repository.js"
copy_file "js-refactor/world/world.viewmodel.js"
copy_file "js-refactor/world/world.view.js"
copy_file "js-refactor/21.sceneVersions.refactor.js"
copy_file "js-refactor/codex/codex.model.js"
copy_file "js-refactor/codex/codex.repository.js"
copy_file "js-refactor/codex/codex.viewmodel.js"
copy_file "js-refactor/codex/codex.view.js"
copy_file "js-refactor/26.focusMode.refactor.js"
copy_file "js-refactor/28.revision.refactor.js"
copy_file "js-refactor/29.todos.refactor.js"
copy_file "js-refactor/corkboard/corkboard.model.js"
copy_file "js-refactor/corkboard/corkboard.repository.js"
copy_file "js-refactor/corkboard/corkboard.viewmodel.js"
copy_file "js-refactor/corkboard/corkboard.view.js"
copy_file "js-refactor/corkboard/corkboard.handlers.js"
copy_file "js-refactor/corkboard/corkboard.main.js"
copy_file "js-refactor/plot/plot.model.js"
copy_file "js-refactor/plot/plot.repository.js"
copy_file "js-refactor/plot/plot.viewmodel.js"
copy_file "js-refactor/plot/plot.view.js"
copy_file "js-refactor/plot/plot.init.js"
copy_file "js-refactor/43.arcs.refactor.js"
copy_file "js-refactor/arc-board/arc-board.config.js"
copy_file "js-refactor/arc-board/arc-board.models.js"
copy_file "js-refactor/arc-board/arc-board.repository.js"
copy_file "js-refactor/arc-board/arc-board.viewmodel.js"
copy_file "js-refactor/arc-board/arc-board.services.js"
copy_file "js-refactor/arc-board/arc-board.views.js"
copy_file "js-refactor/arc-board/arc-board.handlers.js"
copy_file "js-refactor/arc-board/arc-board.main.js"
copy_file "js-refactor/plotgrid/plot-grid.model.js"
copy_file "js-refactor/plotgrid/plot-grid.repository.js"
copy_file "js-refactor/plotgrid/plot-grid.viewmodel.js"
copy_file "js-refactor/plotgrid/plot-grid.import-export.js"
copy_file "js-refactor/plotgrid/plot-grid.view.js"
copy_file "js-refactor/28.sceneNavigation.js"
copy_file "js-refactor/synonyms/synonyms.config.js"
copy_file "js-refactor/synonyms/synonyms.model.js"
copy_file "js-refactor/synonyms/synonyms.dictionary.js"
copy_file "js-refactor/synonyms/synonyms.service.js"
copy_file "js-refactor/synonyms/synonyms.repository.js"
copy_file "js-refactor/synonyms/synonyms.viewmodel.js"
copy_file "js-refactor/synonyms/synonyms.view.js"
copy_file "js-refactor/import-chapter/import-chapter.model.js"
copy_file "js-refactor/import-chapter/import-chapter.viewmodel.js"
copy_file "js-refactor/import-chapter/import-chapter.view.js"
copy_file "js-refactor/word-repetition/word-repetition.model.js"
copy_file "js-refactor/word-repetition/word-repetition.repository.js"
copy_file "js-refactor/word-repetition/word-repetition.viewmodel.js"
copy_file "js-refactor/word-repetition/word-repetition.view.js"
copy_file "js-refactor/word-repetition/word-repetition.handlers.js"
copy_file "js-refactor/word-repetition/word-repetition.main.js"
copy_file "js-refactor/48.product-tour.model.js"
copy_file "js-refactor/48.product-tour.repository.js"
copy_file "js-refactor/48.product-tour.viewmodel.js"
copy_file "js-refactor/48.product-tour.view.js"
copy_file "js-refactor/48.product-tour.handlers.js"
copy_file "js-refactor/48.product-tour.main.js"

# Fichiers JS originaux (non refactorisés)
copy_file "js/38.tension.js"
copy_file "js/02.storage.js"
copy_file "js/04.init.js"
copy_file "js/09.floating-editor.js"
copy_file "js/11.updateStats.js"
copy_file "js/12.import-export.js"
copy_file "js/13.mobile-menu.js"
copy_file "js/14.dragndrop-acts.js"
copy_file "js/18.timeline.js"
copy_file "js/19.notes.js"
copy_file "js/20.snapshots.js"
copy_file "js/22.diff.js"
copy_file "js/23.stats.js"
copy_file "js/25.globalSearch.js"
copy_file "js/27.keyboardShortcuts.js"
copy_file "js/31.mindmap.js"
copy_file "js/32.touch-events.js"
copy_file "js/34.relations-graph.js"
copy_file "js/35.renderMap.js"
copy_file "js/36.timeline-metro.js"
copy_file "js/37.theme-manager.js"
copy_file "js/39.export.js"
copy_file "js/40.sidebar-views.js"
copy_file "js/41.storageMonitoring.js"
copy_file "js/42.mobile-swipe.js"

# Fichiers HTML
copy_file "html/head.html"
copy_file "html/body.html"
copy_file "html/footer.html"

# Fichiers de documentation
copy_file "README.md"
copy_file "LICENSE"
copy_file ".gitignore"

# Scripts de build
copy_file "build.light.py"
copy_file "build.py"
copy_file "build.test.py"
copy_file "build-timestamp.py"

log ""
log "========================================"
log "DÉPLOIEMENT TERMINÉ"
log "========================================"
log "Fichiers copiés: $COPIED"
log "Fichiers manquants: $MISSING"
log ""
log "Répertoire de déploiement: $LIVE_DIR"

# Calculer la taille totale
if [ -d "$LIVE_DIR" ]; then
    TOTAL_SIZE=$(du -sh "$LIVE_DIR" | cut -f1)
    log "Taille totale: $TOTAL_SIZE"
fi

log ""
log "Pour commiter et pousser vers GitHub:"
log "  git add live/"
log "  git commit -m 'Deploy: version light pour production'"
log "  git push origin avant-refactor-todo"
