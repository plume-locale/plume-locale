#!/usr/bin/env python3
"""
Script de dÃ©ploiement vers /live
Copie tous les fichiers nÃ©cessaires listÃ©s dans build.light.py vers le rÃ©pertoire /live
Usage: python3 deploy-to-live.py
"""

import os
import sys
import shutil
from datetime import datetime

# Importer les listes de fichiers depuis build.light.py
BUILD_DIR = os.path.dirname(os.path.abspath(__file__))
LIVE_DIR = os.path.join(BUILD_DIR, 'live')
LOG_FILE = os.path.join(BUILD_DIR, 'deploy.log')

# Fichier log global
log_handle = None

def log(message):
    """Ã‰crit un message dans la console ET dans le fichier log"""
    print(message)
    if log_handle:
        log_handle.write(message + '\n')
        log_handle.flush()

# Ordre des fichiers CSS (copiÃ© depuis build.light.py)
CSS_ORDER = [
    # Vendor CSS (bundled)
    '../vendor/driver.css',
    '01.variables.css',
    '02.base.css',
    '03.header.css',
    '04.sidebar.css',
    '05.modals.css',
    '06.editor.css',
    '07.characters.css',
    '08.visualizations.css',
    '09.utilities.css',
    '10.mobile.css',
    '15.colorpalette.css',
    'undo-redo.css',
    '12.arc-board.css',
    '14.word-repetition.css',
    '14.product-tour.css',
    'investigation-board.css',
    'investigation-board.tabs.css',
]

# Ordre des fichiers JS (copiÃ© depuis build.light.py)
JS_ORDER = [
    # Vendor libraries (bundled)
    'vendor/driver.js.iife.js',
    'vendor/idb.js',
    'js/01.app.refactor.js',
    # Localization Module
    'js/localization/locales/fr.js',
    'js/localization/locales/en.js',
    'js/localization/locales/de.js',
    'js/localization/locales/es.js',
    'js/localization/localization.model.js',
    'js/localization/localization.view.js',
    'js/localization/localization.manager.js',
    # Tension Module
    'js/tension/tension.model.js',
    'js/tension/tension.repository.js',
    'js/tension/tension.viewmodel.js',
    'js/tension/tension.view.js',
    'js/tension/tension.handlers.js',
    'js/tension/tension.main.js',
    # Storage Module
    'js/storage/storage.model.js',
    'js/storage/storage.repository.js',
    'js/storage/storage.viewmodel.js',
    'js/storage/storage.view.js',
    'js/storage/storage.main.js',
    'js/project/project.model.js',
    'js/project/project.repository.js',
    'js/project/project.viewmodel.js',
    'js/project/project.view.js',
    'js/project/project.handlers.js',
    'js/project/project.main.js',
    # Floating Editor Module
    'js/floating-editor/floating-editor.model.js',
    'js/floating-editor/floating-editor.repository.js',
    'js/floating-editor/floating-editor.view.js',
    'js/floating-editor/floating-editor.viewmodel.js',
    'js/floating-editor/floating-editor.handlers.js',
    'js/floating-editor/floating-editor.main.js',
    '04.init.js',
    'js/undo-redo/undo-redo.model.js',
    'js/undo-redo/undo-redo.repository.js',
    'js/undo-redo/undo-redo.viewmodel.js',
    'js/undo-redo/undo-redo.view.js',
    'js/undo-redo/undo-redo.handlers.js',
    'js/undo-redo/undo-redo.main.js',
    # Structure refactored files 1/2
    'js/structure/structure.model.js',
    'js/structure/structure.repository.js',
    'js/structure/structure.viewmodel.js',
    # App
    'js/00.app.view.js',
    # Structure refactored files 2/2
    'js/structure/structure.view.js',
    'js/structure/structure-organizer.view.js',
    'js/structure/structure.helpers.js',
    'js/stats/stats.model.js',
    'js/stats/stats.repository.js',
    'js/stats/stats.viewmodel.js',
    'js/stats/stats.view.js',
    'js/stats/stats.main.js',
    'js/auto-detect/auto-detect.model.js',
    'js/auto-detect/auto-detect.repository.js',
    'js/auto-detect/auto-detect.viewmodel.js',
    'js/auto-detect/auto-detect.view.js',
    'js/auto-detect/auto-detect.handlers.js',
    'js/auto-detect/auto-detect.main.js',
    'js/colorpalette/color-palette.model.js',
    'js/colorpalette/color-palette.repository.js',
    'js/colorpalette/color-palette.viewmodel.js',
    'js/colorpalette/color-palette.view.js',
    'js/colorpalette/color-palette.handlers.js',
    'js/colorpalette/color-palette.main.js',
    # Mobile Menu refactored files (order: model -> repository -> viewmodel -> view -> main)
    'js/mobile-menu/mobile-menu.model.js',
    'js/mobile-menu/mobile-menu.repository.js',
    'js/mobile-menu/mobile-menu.viewmodel.js',
    'js/mobile-menu/mobile-menu.view.js',
    'js/mobile-menu/mobile-menu.main.js',
    # Drag and Drop Acts Module
    'js/dragndrop-acts/dragndrop-acts.model.js',
    'js/dragndrop-acts/dragndrop-acts.repository.js',
    'js/dragndrop-acts/dragndrop-acts.viewmodel.js',
    'js/dragndrop-acts/dragndrop-acts.view.js',
    'js/dragndrop-acts/dragndrop-acts.handlers.js',
    'js/dragndrop-acts/dragndrop-acts.main.js',
    # Characters refactored files 
    'js/characters/characters.model.js',
    'js/characters/characters.repository.js',
    'js/characters/characters.viewmodel.js',
    'js/characters/characters.view.js',
    # Split View Module
    'js/splitview/splitview.model.js',
    'js/splitview/splitview.repository.js',
    'js/splitview/splitview.viewmodel.js',
    'js/splitview/splitview.view.js',
    'js/splitview/splitview.coordinator.js',
    'js/splitview/splitview.handlers.js',
    'js/splitview/splitview.main.js',
    # World refactored files 
    'js/world/world.model.js',
    'js/world/world.repository.js',
    'js/world/world.viewmodel.js',
    'js/world/world.view.js',
    '18.timeline.js',
    'js/notes/notes.model.js',
    'js/notes/notes.repository.js',
    'js/notes/notes.viewmodel.js',
    'js/notes/notes.view.js',
    'js/notes/notes.handlers.js',
    'js/notes/notes.main.js',
    # Snapshots refactored files (order: model -> repository -> viewmodel -> view -> main)
    'js/snapshots/snapshots.model.js',
    'js/snapshots/snapshots.repository.js',
    'js/snapshots/snapshots.viewmodel.js',
    'js/snapshots/snapshots.view.js',
    'js/snapshots/snapshots.main.js',
    'js/sceneVersion/sceneVersion.model.js',
    'js/sceneVersion/sceneVersion.repository.js',
    'js/sceneVersion/sceneVersion.viewmodel.js',
    'js/sceneVersion/sceneVersion.view.js',
    'js/sceneVersion/sceneVersion.main.js',
    # Diff refactored files
    'js/diff/diff.model.js',
    'js/diff/diff.repository.js',
    'js/diff/diff.viewmodel.js',
    'js/diff/diff.view.js',
    'js/diff/diff.handlers.js',
    'js/diff/diff.main.js',
    # Codex refactored files
    'js/codex/codex.model.js',
    'js/codex/codex.repository.js',
    'js/codex/codex.viewmodel.js',
    'js/codex/codex.view.js',
    # Search refactored files (order: model -> repository -> viewmodel -> view -> handlers -> main)
    'js/search/search.model.js',
    'js/search/search.repository.js',
    'js/search/search.viewmodel.js',
    'js/search/search.view.js',
    'js/search/search.handlers.js',
    'js/search/search.main.js',
    # Focus Mode refactored files
    'js/focusMode/focusMode.model.js',
    'js/focusMode/focusMode.repository.js',
    'js/focusMode/focusMode.viewmodel.js',
    'js/focusMode/focusMode.view.js',
    'js/focusMode/focusMode.handlers.js',
    'js/focusMode/focusMode.main.js',
    # Keyboard Shortcuts refactored files (order: model -> repository -> viewmodel -> view -> handlers -> main)
    'js/keyboard-shortcuts/keyboard-shortcuts.model.js',
    'js/keyboard-shortcuts/keyboard-shortcuts.repository.js',
    'js/keyboard-shortcuts/keyboard-shortcuts.viewmodel.js',
    'js/keyboard-shortcuts/keyboard-shortcuts.view.js',
    'js/keyboard-shortcuts/keyboard-shortcuts.handlers.js',
    'js/keyboard-shortcuts/keyboard-shortcuts.main.js',
    'js/revision/revision.model.js',
    'js/revision/revision.repository.js',
    'js/revision/revision.viewmodel.js',
    'js/revision/revision.view.js',
    'js/revision/revision.handlers.js',
    'js/revision/revision.main.js',
    # Todo refactored files (order: model -> repository -> viewmodel -> view -> handlers -> main)
    'js/todo/todo.model.js',
    'js/todo/todo.repository.js',
    'js/todo/todo.viewmodel.js',
    'js/todo/todo.view.js',
    'js/todo/todo.handlers.js',
    'js/todo/todo.main.js',
    # Corkboard refactored files (order: model -> repository -> viewmodel -> view -> handlers -> main)
    'js/corkboard/corkboard.model.js',
    'js/corkboard/corkboard.repository.js',
    'js/corkboard/corkboard.viewmodel.js',
    'js/corkboard/corkboard.view.js',
    'js/corkboard/corkboard.handlers.js',
    'js/corkboard/corkboard.main.js',
    # Mindmap refactored files (order: model -> repository -> viewmodel -> view -> handlers -> main)
    'js/mindmap/mindmap.model.js',
    'js/mindmap/mindmap.repository.js',
    'js/mindmap/mindmap.viewmodel.js',
    'js/mindmap/mindmap.view.js',
    'js/mindmap/mindmap.handlers.js',
    'js/mindmap/mindmap.main.js',
    # Plot module refactored files
    'js/plot/plot.model.js',
    'js/plot/plot.repository.js',
    'js/plot/plot.viewmodel.js',
    'js/plot/plot.view.js',
    'js/plot/plot.init.js',
    'js/relation-map/relation-map.model.js',
    'js/relation-map/relation-map.repository.js',
    'js/relation-map/relation-map.viewmodel.js',
    'js/relation-map/relation-map.view.js',
    'js/relation-map/relation-map.handlers.js',
    'js/relation-map/relation-map.main.js',
    'js/map/map.model.js',
    'js/map/map.repository.js',
    'js/map/map.viewmodel.js',
    'js/map/map.view.js',
    'js/map/map.handlers.js',
    'js/map/map.main.js',
    'js/timeline-metro/timeline-metro.model.js',
    'js/timeline-metro/timeline-metro.repository.js',
    'js/timeline-metro/timeline-metro.viewmodel.js',
    'js/timeline-metro/timeline-metro.view.js',
    'js/timeline-metro/timeline-metro.handlers.js',
    'js/timeline-metro/timeline-metro.main.js',
    'js/theme-manager/theme-manager.model.js',
    'js/theme-manager/theme-manager.repository.js',
    'js/theme-manager/theme-manager.viewmodel.js',
    'js/theme-manager/theme-manager.view.js',
    'js/theme-manager/theme-manager.main.js',
    # Import/Export Module
    'js/import-export/import-export.model.js',
    'js/import-export/import-export.repository.js',
    'js/import-export/google-drive.service.js',
    'js/import-export/import-export.viewmodel.js',
    'js/import-export/import-export.view.js',
    'js/import-export/import-export.handlers.js',
    'js/import-export/import-export.main.js',
    # Sidebar View Module
    'js/sidebar-view/sidebar-view.model.js',
    'js/sidebar-view/sidebar-view.repository.js',
    'js/sidebar-view/sidebar-view.viewmodel.js',
    'js/sidebar-view/sidebar-view.view.js',
    'js/sidebar-view/sidebar-view.main.js',
    # Storage Monitoring Refactored Module
    'js/storageMonitoring/storageMonitoring.model.js',
    'js/storageMonitoring/storageMonitoring.repository.js',
    'js/storageMonitoring/storageMonitoring.viewmodel.js',
    'js/storageMonitoring/storageMonitoring.view.js',
    'js/storageMonitoring/storageMonitoring.main.js',
    # Mobile Swipe refactored files
    'js/mobile-swipe/mobile-swipe.model.js',
    'js/mobile-swipe/mobile-swipe.repository.js',
    'js/mobile-swipe/mobile-swipe.viewmodel.js',
    'js/mobile-swipe/mobile-swipe.view.js',
    'js/mobile-swipe/mobile-swipe.handlers.js',
    'js/mobile-swipe/mobile-swipe.main.js',
    # '44.storygrid.js',  # RETIRÃ‰ pour version Light
    # Arc Board
    'js/arc-board/arc-board.config.js',
    'js/arc-board/arc-board.models.js',
    'js/arc-board/arc-board.repository.js',
    'js/arc-board/arc-board.viewmodel.js',
    'js/arc-board/arc-board.services.js',
    'js/arc-board/arc-board.views.js',
    'js/arc-board/arc-board.handlers.js',
    'js/arc-board/arc-board.main.js',
    # Plot Grid Module
    'js/plotgrid/plot-grid.model.js',
    'js/plotgrid/plot-grid.repository.js',
    'js/plotgrid/plot-grid.viewmodel.js',
    'js/plotgrid/plot-grid.import-export.js',
    'js/plotgrid/plot-grid.view.js',
    # Scene Navigation Module
    'js/sceneNavigation/scene-navigation.model.js',
    'js/sceneNavigation/scene-navigation.repository.js',
    'js/sceneNavigation/scene-navigation.viewmodel.js',
    'js/sceneNavigation/scene-navigation.view.js',
    'js/sceneNavigation/scene-navigation.handlers.js',
    'js/sceneNavigation/scene-navigation.main.js',
    # Synonyms Module (French synonyms dictionary - local)
    'js/synonyms/synonyms.config.js',
    'js/synonyms/synonyms.model.js',
    'js/synonyms/synonyms.dictionary.js',
    'js/synonyms/synonyms.service.js',
    'js/synonyms/synonyms.repository.js',
    'js/synonyms/synonyms.viewmodel.js',
    'js/synonyms/synonyms.view.js',
    # Import Chapter Module (import .docx, .txt, .md, .epub, .pages)
    'js/import-chapter/import-chapter.model.js',
    'js/import-chapter/import-chapter.viewmodel.js',
    'js/import-chapter/import-chapter.view.js',
    # Word Repetition Analyzer Module
    'js/word-repetition/word-repetition.model.js',
    'js/word-repetition/word-repetition.repository.js',
    'js/word-repetition/word-repetition.viewmodel.js',
    'js/word-repetition/word-repetition.view.js',
    'js/word-repetition/word-repetition.handlers.js',
    'js/word-repetition/word-repetition.main.js',
    # Product tour
    'js/product-tour/product-tour.model.js',
    'js/product-tour/product-tour.repository.js',
    'js/product-tour/product-tour.viewmodel.js',
    'js/product-tour/product-tour.view.js',
    'js/product-tour/product-tour.handlers.js',
    'js/product-tour/product-tour.main.js',
    
    # Investigation Board Module (New)
    'js/investigation-board/investigation-board.model.js',
    'js/investigation-board/investigation-board.store.js',
    'js/investigation-board/investigation-board.dashboard.js',
    'js/investigation-board/investigation-board.registry.js',
    'js/investigation-board/investigation-board.matrix.js',
    'js/investigation-board/investigation-board.mmo.js',
    'js/investigation-board/investigation-board.timeline.js',
    'js/investigation-board/investigation-board.demo.js',
    'js/investigation-board/investigation-board.sidebar.js',
    'js/investigation-board/investigation-board.view.js',
]

# Fichiers HTML essentiels
HTML_FILES = [
    'html/head.html',
    'html/body.html',
    'html/footer.html'
]

# CSS des modules
MODULE_CSS_FILES = [
    'css/synonyms.css',
    'css/map.css',
    'css/keyboard-shortcuts.css'
]



def get_all_files_to_deploy():
    """Retourne la liste complÃ¨te des fichiers Ã  dÃ©ployer"""
    files = []
    
    # Ajouter les fichiers CSS
    for css_file in CSS_ORDER:
        if css_file.startswith('../vendor/'):
            # Vendor CSS files
            files.append(css_file.replace('../', ''))
        elif css_file.startswith('js/'):
             # Module CSS files (already relative path)
             files.append(css_file)
        elif css_file == 'undo-redo.css':
             # Special case if needed, but undo-redo.css is likely in css/
             files.append(f'css/{css_file}')
        else:
            files.append(f'css/{css_file}')
    
    # Ajouter les CSS des modules
    files.extend(MODULE_CSS_FILES)
    
    # Ajouter les fichiers JS
    for js_file in JS_ORDER:
        if js_file.startswith('vendor/') or js_file.startswith('js/'):
            files.append(js_file)
        else:
            files.append(f'js/{js_file}')
    

    
    
    return files

def get_dest_path(file_path):
    """DÃ©termine le chemin de destination pour un fichier donnÃ©"""
    # CSS -> live/css/filename.css (flattened)
    if file_path.endswith('.css'):
        return os.path.join('css', os.path.basename(file_path))
    
    # JS -> live/js/... (merged roots)
    if file_path.endswith('.js'):
        if file_path.startswith('vendor/'):
             return os.path.join('js', file_path) # js/vendor/...
        elif file_path.startswith('js/'):
             return os.path.join('js', file_path.replace('js/', '')) # js/... (without js-refactor prefix)
        elif file_path.startswith('js/'):
             return os.path.join('js', file_path.replace('js/', '')) # js/... (without js prefix)
        else:
             return os.path.join('js', file_path)
             

        
    # HTML -> root (already handled by index.html generation, but if we deployed other html...)
    if file_path.startswith('html/'):
         return file_path
         
    return file_path

def copy_file(src_path, dest_rel_path): # Changed second arg to relative path in live/
    """Copie un fichier vers son emplacement calculÃ© dans /live"""
    try:
        dest_full_path = os.path.join(LIVE_DIR, dest_rel_path)
        
        # CrÃ©er le rÃ©pertoire de destination si nÃ©cessaire
        dest_dir = os.path.dirname(dest_full_path)
        if dest_dir:
            os.makedirs(dest_dir, exist_ok=True)
        
        # Copier le fichier
        shutil.copy2(src_path, dest_full_path)
        return True
    except Exception as e:
        log(f"   [ERREUR] Impossible de copier {src_path} vers {dest_rel_path}: {e}")
        return False

def deploy():
    """DÃ©ploie tous les fichiers vers le rÃ©pertoire /live"""
    global log_handle
    
    # Ouvrir le fichier log
    log_handle = open(LOG_FILE, 'w', encoding='utf-8')
    
    log(f"========================================")
    log(f"DÃ©ploiement vers /live - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    log(f"========================================")
    log(f"RÃ©pertoire source: {BUILD_DIR}")
    log(f"RÃ©pertoire cible: {LIVE_DIR}")
    log("")
    
    # CrÃ©er le rÃ©pertoire /live s'il n'existe pas
    if os.path.exists(LIVE_DIR):
        log(f"--- Nettoyage du rÃ©pertoire /live existant ---")
        try:
            shutil.rmtree(LIVE_DIR)
            log(f"   [OK] RÃ©pertoire /live supprimÃ©")
        except Exception as e:
            log(f"   [ERREUR] Impossible de supprimer /live: {e}")
            log_handle.close()
            return False
    
    log(f"--- CrÃ©ation du rÃ©pertoire /live ---")
    try:
        os.makedirs(LIVE_DIR, exist_ok=True)
        log(f"   [OK] RÃ©pertoire /live crÃ©Ã©")
    except Exception as e:
        log(f"   [ERREUR] Impossible de crÃ©er /live: {e}")
        log_handle.close()
        return False
    
    log("")
    log(f"--- Copie des fichiers ---")
    
    # Obtenir la liste des fichiers Ã  dÃ©ployer
    files_to_deploy = get_all_files_to_deploy()
    
    copied_count = 0
    missing_count = 0
    error_count = 0
    
    for file_path in files_to_deploy:
        src_path = os.path.join(BUILD_DIR, file_path)
        dest_rel_path = get_dest_path(file_path)
        
        if not os.path.exists(src_path):
            log(f"   [!] Fichier manquant: {file_path}")
            missing_count += 1
            continue
        
        if copy_file(src_path, dest_rel_path):
            copied_count += 1
        else:
            error_count += 1
    
    log("")
    log(f"========================================")
    log(f"DÃ‰PLOIEMENT TERMINÃ‰")
    log(f"========================================")
    log(f"Fichiers copiÃ©s: {copied_count}")
    log(f"Fichiers manquants: {missing_count}")
    log(f"Erreurs: {error_count}")
    log(f"Total: {len(files_to_deploy)} fichiers")
    log("")
    log(f"RÃ©pertoire de dÃ©ploiement: {LIVE_DIR}")
    
    # Calculer la taille totale
    total_size = 0
    for root, dirs, files in os.walk(LIVE_DIR):
        for file in files:
            file_path = os.path.join(root, file)
            total_size += os.path.getsize(file_path)
    
    log(f"Taille totale: {total_size:,} octets ({total_size / 1024 / 1024:.2f} MB)")
    
    # Generate index.html explicitly after deployment
    log(f"--- GÃ©nÃ©ration de index.html ---")
    try:
        import subprocess
        result = subprocess.run([sys.executable, 'generate_live_index.py'], capture_output=True, text=True)
        if result.returncode == 0:
            log(f"   [OK] index.html gÃ©nÃ©rÃ© avec succÃ¨s")
        else:
            log(f"   [ERREUR] Ã‰chec de la gÃ©nÃ©ration de index.html: {result.stderr}")
            error_count += 1
    except Exception as e:
        log(f"   [ERREUR] Exception lors de la gÃ©nÃ©ration de index.html: {e}")
        error_count += 1
        
    log_handle.close()
    return error_count == 0

if __name__ == "__main__":
    success = deploy()
    sys.exit(0 if success else 1)

