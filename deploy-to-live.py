#!/usr/bin/env python3
"""
Script de déploiement vers /live
Copie tous les fichiers nécessaires listés dans build.light.py vers le répertoire /live
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
    """Écrit un message dans la console ET dans le fichier log"""
    print(message)
    if log_handle:
        log_handle.write(message + '\n')
        log_handle.flush()

# Ordre des fichiers CSS (copié depuis build.light.py)
CSS_ORDER = [
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
    '12.arc-board.css',
    '14.word-repetition.css',
    '14.product-tour.css',
]

# Ordre des fichiers JS (copié depuis build.light.py)
JS_ORDER = [
    'vendor/driver.js.iife.js',
    'js-refactor/01.app.refactor.js',
    '38.tension.js',
    '02.storage.js',
    'js-refactor/03.projects.refactor.js',
    '04.init.js',
    'js-refactor/05.undo-redo.refactor.js',
    'js-refactor/structure/structure.model.js',
    'js-refactor/structure/structure.repository.js',
    'js-refactor/structure/structure.viewmodel.js',
    'js-refactor/00.app.view.js',
    'js-refactor/structure/structure.view.js',
    'js-refactor/structure/structure-organizer.view.js',
    'js-refactor/structure/structure.helpers.js',
    'js-refactor/07.stats.refactor.js',
    'js-refactor/08.auto-detect.refactor.js',
    '09.floating-editor.js',
    'js-refactor/10.colorpalette.refactor.js',
    '11.updateStats.js',
    '12.import-export.js',
    '13.mobile-menu.js',
    '14.dragndrop-acts.js',
    'js-refactor/characters/characters.model.js',
    'js-refactor/characters/characters.repository.js',
    'js-refactor/characters/characters.viewmodel.js',
    'js-refactor/characters/characters.view.js',
    'js-refactor/16.split-view.js',
    'js-refactor/world/world.model.js',
    'js-refactor/world/world.repository.js',
    'js-refactor/world/world.viewmodel.js',
    'js-refactor/world/world.view.js',
    '18.timeline.js',
    '19.notes.js',
    '20.snapshots.js',
    'js-refactor/21.sceneVersions.refactor.js',
    '22.diff.js',
    '23.stats.js',
    'js-refactor/codex/codex.model.js',
    'js-refactor/codex/codex.repository.js',
    'js-refactor/codex/codex.viewmodel.js',
    'js-refactor/codex/codex.view.js',
    '25.globalSearch.js',
    'js-refactor/26.focusMode.refactor.js',
    '27.keyboardShortcuts.js',
    'js-refactor/revision/revision.model.js',
    'js-refactor/revision/revision.repository.js',
    'js-refactor/revision/revision.viewmodel.js',
    'js-refactor/revision/revision.view.js',
    'js-refactor/revision/revision.handlers.js',
    'js-refactor/revision/revision.main.js',
    'js-refactor/29.todos.refactor.js',
    'js-refactor/corkboard/corkboard.model.js',
    'js-refactor/corkboard/corkboard.repository.js',
    'js-refactor/corkboard/corkboard.viewmodel.js',
    'js-refactor/corkboard/corkboard.view.js',
    'js-refactor/corkboard/corkboard.handlers.js',
    'js-refactor/corkboard/corkboard.main.js',
    '31.mindmap.js',
    '32.touch-events.js',
    'js-refactor/plot/plot.model.js',
    'js-refactor/plot/plot.repository.js',
    'js-refactor/plot/plot.viewmodel.js',
    'js-refactor/plot/plot.view.js',
    'js-refactor/plot/plot.init.js',
    '34.relations-graph.js',
    '35.renderMap.js',
    '36.timeline-metro.js',
    '37.theme-manager.js',
    '39.export.js',
    '40.sidebar-views.js',
    '41.storageMonitoring.js',
    '42.mobile-swipe.js',
    'js-refactor/43.arcs.refactor.js',
    'js-refactor/arc-board/arc-board.config.js',
    'js-refactor/arc-board/arc-board.models.js',
    'js-refactor/arc-board/arc-board.repository.js',
    'js-refactor/arc-board/arc-board.viewmodel.js',
    'js-refactor/arc-board/arc-board.services.js',
    'js-refactor/arc-board/arc-board.views.js',
    'js-refactor/arc-board/arc-board.handlers.js',
    'js-refactor/arc-board/arc-board.main.js',
    'js-refactor/plotgrid/plot-grid.model.js',
    'js-refactor/plotgrid/plot-grid.repository.js',
    'js-refactor/plotgrid/plot-grid.viewmodel.js',
    'js-refactor/plotgrid/plot-grid.import-export.js',
    'js-refactor/plotgrid/plot-grid.view.js',
    'js-refactor/28.sceneNavigation.js',
    'js-refactor/synonyms/synonyms.config.js',
    'js-refactor/synonyms/synonyms.model.js',
    'js-refactor/synonyms/synonyms.dictionary.js',
    'js-refactor/synonyms/synonyms.service.js',
    'js-refactor/synonyms/synonyms.repository.js',
    'js-refactor/synonyms/synonyms.viewmodel.js',
    'js-refactor/synonyms/synonyms.view.js',
    'js-refactor/import-chapter/import-chapter.model.js',
    'js-refactor/import-chapter/import-chapter.viewmodel.js',
    'js-refactor/import-chapter/import-chapter.view.js',
    'js-refactor/word-repetition/word-repetition.model.js',
    'js-refactor/word-repetition/word-repetition.repository.js',
    'js-refactor/word-repetition/word-repetition.viewmodel.js',
    'js-refactor/word-repetition/word-repetition.view.js',
    'js-refactor/word-repetition/word-repetition.handlers.js',
    'js-refactor/word-repetition/word-repetition.main.js',
    'js-refactor/product-tour/product-tour.model.js',
    'js-refactor/product-tour/product-tour.repository.js',
    'js-refactor/product-tour/product-tour.viewmodel.js',
    'js-refactor/product-tour/product-tour.view.js',

]

# Fichiers HTML essentiels
HTML_FILES = [
    'html/head.html',
    'html/body.html',
    'html/footer.html'
]

# CSS des modules
MODULE_CSS_FILES = [
    'js-refactor/synonyms/synonyms.css'
]

# Fichiers de documentation
DOC_FILES = [
    'README.md',
    'LICENSE',
    '.gitignore'
]

# Scripts de build
BUILD_SCRIPTS = [
    'build.light.py',
    'build.py',
    'build.test.py',
    'build-timestamp.py'
]

def get_all_files_to_deploy():
    """Retourne la liste complète des fichiers à déployer"""
    files = []
    
    # Ajouter les fichiers CSS
    for css_file in CSS_ORDER:
        if css_file.startswith('../vendor/'):
            # Vendor CSS files
            files.append(css_file.replace('../', ''))
        else:
            files.append(f'css/{css_file}')
    
    # Ajouter les CSS des modules
    files.extend(MODULE_CSS_FILES)
    
    # Ajouter les fichiers JS
    for js_file in JS_ORDER:
        if js_file.startswith('vendor/') or js_file.startswith('js-refactor/'):
            files.append(js_file)
        else:
            files.append(f'js/{js_file}')
    
    # Ajouter les fichiers HTML
    files.extend(HTML_FILES)
    
    # Ajouter les fichiers de documentation
    files.extend(DOC_FILES)
    
    # Ajouter les scripts de build
    files.extend(BUILD_SCRIPTS)
    
    return files

def copy_file(src_path, dest_path):
    """Copie un fichier en créant les répertoires nécessaires"""
    try:
        # Créer le répertoire de destination si nécessaire
        dest_dir = os.path.dirname(dest_path)
        if dest_dir:
            os.makedirs(dest_dir, exist_ok=True)
        
        # Copier le fichier
        shutil.copy2(src_path, dest_path)
        return True
    except Exception as e:
        log(f"   [ERREUR] Impossible de copier {src_path}: {e}")
        return False

def deploy():
    """Déploie tous les fichiers vers le répertoire /live"""
    global log_handle
    
    # Ouvrir le fichier log
    log_handle = open(LOG_FILE, 'w', encoding='utf-8')
    
    log(f"========================================")
    log(f"Déploiement vers /live - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    log(f"========================================")
    log(f"Répertoire source: {BUILD_DIR}")
    log(f"Répertoire cible: {LIVE_DIR}")
    log("")
    
    # Créer le répertoire /live s'il n'existe pas
    if os.path.exists(LIVE_DIR):
        log(f"--- Nettoyage du répertoire /live existant ---")
        try:
            shutil.rmtree(LIVE_DIR)
            log(f"   [OK] Répertoire /live supprimé")
        except Exception as e:
            log(f"   [ERREUR] Impossible de supprimer /live: {e}")
            log_handle.close()
            return False
    
    log(f"--- Création du répertoire /live ---")
    try:
        os.makedirs(LIVE_DIR, exist_ok=True)
        log(f"   [OK] Répertoire /live créé")
    except Exception as e:
        log(f"   [ERREUR] Impossible de créer /live: {e}")
        log_handle.close()
        return False
    
    log("")
    log(f"--- Copie des fichiers ---")
    
    # Obtenir la liste des fichiers à déployer
    files_to_deploy = get_all_files_to_deploy()
    
    copied_count = 0
    missing_count = 0
    error_count = 0
    
    for file_path in files_to_deploy:
        src_path = os.path.join(BUILD_DIR, file_path)
        dest_path = os.path.join(LIVE_DIR, file_path)
        
        if not os.path.exists(src_path):
            log(f"   [!] Fichier manquant: {file_path}")
            missing_count += 1
            continue
        
        if copy_file(src_path, dest_path):
            copied_count += 1
        else:
            error_count += 1
    
    log("")
    log(f"========================================")
    log(f"DÉPLOIEMENT TERMINÉ")
    log(f"========================================")
    log(f"Fichiers copiés: {copied_count}")
    log(f"Fichiers manquants: {missing_count}")
    log(f"Erreurs: {error_count}")
    log(f"Total: {len(files_to_deploy)} fichiers")
    log("")
    log(f"Répertoire de déploiement: {LIVE_DIR}")
    
    # Calculer la taille totale
    total_size = 0
    for root, dirs, files in os.walk(LIVE_DIR):
        for file in files:
            file_path = os.path.join(root, file)
            total_size += os.path.getsize(file_path)
    
    log(f"Taille totale: {total_size:,} octets ({total_size / 1024 / 1024:.2f} MB)")
    
    log_handle.close()
    return error_count == 0

if __name__ == "__main__":
    success = deploy()
    sys.exit(0 if success else 1)
