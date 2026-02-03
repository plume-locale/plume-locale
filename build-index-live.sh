#!/bin/bash
# Script pour générer index.html dans le répertoire /live
# Assemble head.html, body.html, footer.html avec tous les CSS et JS

set -e

BUILD_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LIVE_DIR="$BUILD_DIR/live"
OUTPUT_FILE="$LIVE_DIR/index.html"

echo "========================================" echo "Génération de index.html dans /live"
echo "========================================" 
echo "Répertoire: $LIVE_DIR"
echo ""

# Créer le fichier index.html
cat > "$OUTPUT_FILE" << 'EOF_HEAD'
EOF_HEAD

# Ajouter head.html
cat "$LIVE_DIR/html/head.html" >> "$OUTPUT_FILE"

# Ajouter les CSS
echo "    <style>" >> "$OUTPUT_FILE"

# CSS Vendor
if [ -f "$LIVE_DIR/vendor/driver.css" ]; then
    echo "/* ========== vendor/driver.css ========== */" >> "$OUTPUT_FILE"
    cat "$LIVE_DIR/vendor/driver.css" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
fi

# CSS files in order
for css_file in \
    "01.variables.css" \
    "02.base.css" \
    "03.header.css" \
    "04.sidebar.css" \
    "05.modals.css" \
    "06.editor.css" \
    "07.characters.css" \
    "08.visualizations.css" \
    "09.utilities.css" \
    "10.mobile.css" \
    "12.arc-board.css" \
    "14.word-repetition.css" \
    "14.product-tour.css"
do
    if [ -f "$LIVE_DIR/css/$css_file" ]; then
        echo "/* ========== $css_file ========== */" >> "$OUTPUT_FILE"
        cat "$LIVE_DIR/css/$css_file" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
    fi
done

# CSS des modules
if [ -f "$LIVE_DIR/js-refactor/synonyms/synonyms.css" ]; then
    echo "/* ========== js-refactor/synonyms/synonyms.css ========== */" >> "$OUTPUT_FILE"
    cat "$LIVE_DIR/js-refactor/synonyms/synonyms.css" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
fi

echo "    </style>" >> "$OUTPUT_FILE"
echo "</head>" >> "$OUTPUT_FILE"

# Ajouter body.html
cat "$LIVE_DIR/html/body.html" >> "$OUTPUT_FILE"

# Ajouter les JavaScript
echo "    <script>" >> "$OUTPUT_FILE"

# JS Vendor
if [ -f "$LIVE_DIR/vendor/driver.js.iife.js" ]; then
    echo "// ========== vendor/driver.js.iife.js ==========" >> "$OUTPUT_FILE"
    cat "$LIVE_DIR/vendor/driver.js.iife.js" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
fi

# JS files in order (refactored)
for js_file in \
    "js-refactor/01.app.refactor.js" \
    "js/38.tension.js" \
    "js/02.storage.js" \
    "js-refactor/03.projects.refactor.js" \
    "js/04.init.js" \
    "js-refactor/05.undo-redo.refactor.js" \
    "js-refactor/structure/structure.model.js" \
    "js-refactor/structure/structure.repository.js" \
    "js-refactor/structure/structure.viewmodel.js" \
    "js-refactor/00.app.view.js" \
    "js-refactor/structure/structure.view.js" \
    "js-refactor/structure/structure-organizer.view.js" \
    "js-refactor/structure/structure.helpers.js" \
    "js-refactor/07.stats.refactor.js" \
    "js-refactor/08.auto-detect.refactor.js" \
    "js/09.floating-editor.js" \
    "js-refactor/10.colorpalette.refactor.js" \
    "js/11.updateStats.js" \
    "js/12.import-export.js" \
    "js/13.mobile-menu.js" \
    "js/14.dragndrop-acts.js" \
    "js-refactor/characters/characters.model.js" \
    "js-refactor/characters/characters.repository.js" \
    "js-refactor/characters/characters.viewmodel.js" \
    "js-refactor/characters/characters.view.js" \
    "js-refactor/16.split-view.js" \
    "js-refactor/world/world.model.js" \
    "js-refactor/world/world.repository.js" \
    "js-refactor/world/world.viewmodel.js" \
    "js-refactor/world/world.view.js" \
    "js/18.timeline.js" \
    "js/19.notes.js" \
    "js/20.snapshots.js" \
    "js-refactor/21.sceneVersions.refactor.js" \
    "js/22.diff.js" \
    "js/23.stats.js" \
    "js-refactor/codex/codex.model.js" \
    "js-refactor/codex/codex.repository.js" \
    "js-refactor/codex/codex.viewmodel.js" \
    "js-refactor/codex/codex.view.js" \
    "js/25.globalSearch.js" \
    "js-refactor/26.focusMode.refactor.js" \
    "js/27.keyboardShortcuts.js" \
    "js-refactor/28.revision.refactor.js" \
    "js-refactor/29.todos.refactor.js" \
    "js-refactor/corkboard/corkboard.model.js" \
    "js-refactor/corkboard/corkboard.repository.js" \
    "js-refactor/corkboard/corkboard.viewmodel.js" \
    "js-refactor/corkboard/corkboard.view.js" \
    "js-refactor/corkboard/corkboard.handlers.js" \
    "js-refactor/corkboard/corkboard.main.js" \
    "js/31.mindmap.js" \
    "js/32.touch-events.js" \
    "js-refactor/plot/plot.model.js" \
    "js-refactor/plot/plot.repository.js" \
    "js-refactor/plot/plot.viewmodel.js" \
    "js-refactor/plot/plot.view.js" \
    "js-refactor/plot/plot.init.js" \
    "js/34.relations-graph.js" \
    "js/35.renderMap.js" \
    "js/36.timeline-metro.js" \
    "js/37.theme-manager.js" \
    "js/39.export.js" \
    "js/40.sidebar-views.js" \
    "js/41.storageMonitoring.js" \
    "js/42.mobile-swipe.js" \
    "js-refactor/43.arcs.refactor.js" \
    "js-refactor/arc-board/arc-board.config.js" \
    "js-refactor/arc-board/arc-board.models.js" \
    "js-refactor/arc-board/arc-board.repository.js" \
    "js-refactor/arc-board/arc-board.viewmodel.js" \
    "js-refactor/arc-board/arc-board.services.js" \
    "js-refactor/arc-board/arc-board.views.js" \
    "js-refactor/arc-board/arc-board.handlers.js" \
    "js-refactor/arc-board/arc-board.main.js" \
    "js-refactor/plotgrid/plot-grid.model.js" \
    "js-refactor/plotgrid/plot-grid.repository.js" \
    "js-refactor/plotgrid/plot-grid.viewmodel.js" \
    "js-refactor/plotgrid/plot-grid.import-export.js" \
    "js-refactor/plotgrid/plot-grid.view.js" \
    "js-refactor/28.sceneNavigation.js" \
    "js-refactor/synonyms/synonyms.config.js" \
    "js-refactor/synonyms/synonyms.model.js" \
    "js-refactor/synonyms/synonyms.dictionary.js" \
    "js-refactor/synonyms/synonyms.service.js" \
    "js-refactor/synonyms/synonyms.repository.js" \
    "js-refactor/synonyms/synonyms.viewmodel.js" \
    "js-refactor/synonyms/synonyms.view.js" \
    "js-refactor/import-chapter/import-chapter.model.js" \
    "js-refactor/import-chapter/import-chapter.viewmodel.js" \
    "js-refactor/import-chapter/import-chapter.view.js" \
    "js-refactor/word-repetition/word-repetition.model.js" \
    "js-refactor/word-repetition/word-repetition.repository.js" \
    "js-refactor/word-repetition/word-repetition.viewmodel.js" \
    "js-refactor/word-repetition/word-repetition.view.js" \
    "js-refactor/word-repetition/word-repetition.handlers.js" \
    "js-refactor/word-repetition/word-repetition.main.js" \
    "js-refactor/product-tour/product-tour.model.js" \
    "js-refactor/product-tour/product-tour.repository.js" \
    "js-refactor/product-tour/product-tour.viewmodel.js" \
    "js-refactor/product-tour/product-tour.view.js"
do
    if [ -f "$LIVE_DIR/$js_file" ]; then
        echo "// ========== $js_file ==========" >> "$OUTPUT_FILE"
        cat "$LIVE_DIR/$js_file" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
    fi
done

echo "    </script>" >> "$OUTPUT_FILE"

# Ajouter footer.html
cat "$LIVE_DIR/html/footer.html" >> "$OUTPUT_FILE"

# Afficher les statistiques
FILE_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
echo ""
echo "========================================" 
echo "GÉNÉRATION TERMINÉE"
echo "========================================" 
echo "Fichier: $OUTPUT_FILE"
echo "Taille: $FILE_SIZE"
echo ""
echo "L'application est maintenant prête dans /live/index.html"
