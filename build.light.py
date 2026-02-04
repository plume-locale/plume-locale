#!/usr/bin/env python3
"""
Script de build Plume LIGHT
Basé sur build.test.py, retire les modules Storygrid et Thriller.
Usage: python3 build.light.py [--output fichier.html]
"""

import os
import sys
import glob
import re
from datetime import datetime

BUILD_DIR = os.path.dirname(os.path.abspath(__file__))
LOG_FILE = os.path.join(BUILD_DIR, 'build.light.log')

# Fichier log global
log_handle = None

def log(message):
    """Écrit un message dans la console ET dans le fichier log"""
    print(message)
    if log_handle:
        log_handle.write(message + '\n')
        log_handle.flush()

# Ordre des fichiers CSS
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
    '14.word-repetition.css' ,
    '14.product-tour.css' ,
]

# Ordre des fichiers JS
JS_ORDER = [
    # Vendor libraries (bundled)
    'vendor/driver.js.iife.js',
    'vendor/idb.js',
    'js-refactor/01.app.refactor.js',
    # Tension Module
    'js-refactor/tension/tension.model.js',
    'js-refactor/tension/tension.repository.js',
    'js-refactor/tension/tension.viewmodel.js',
    'js-refactor/tension/tension.view.js',
    'js-refactor/tension/tension.handlers.js',
    'js-refactor/tension/tension.main.js',
    # Storage Module
    'js-refactor/storage/storage.model.js',
    'js-refactor/storage/storage.repository.js',
    'js-refactor/storage/storage.viewmodel.js',
    'js-refactor/storage/storage.view.js',
    'js-refactor/storage/storage.main.js',
    'js-refactor/project/project.model.js',
    'js-refactor/project/project.repository.js',
    'js-refactor/project/project.viewmodel.js',
    'js-refactor/project/project.view.js',
    'js-refactor/project/project.handlers.js',
    'js-refactor/project/project.main.js',
    # Floating Editor Module
    'js-refactor/floating-editor/floating-editor.model.js',
    'js-refactor/floating-editor/floating-editor.repository.js',
    'js-refactor/floating-editor/floating-editor.view.js',
    'js-refactor/floating-editor/floating-editor.viewmodel.js',
    'js-refactor/floating-editor/floating-editor.handlers.js',
    'js-refactor/floating-editor/floating-editor.main.js',
    '04.init.js',
    'js-refactor/undo-redo/undo-redo.model.js',
    'js-refactor/undo-redo/undo-redo.repository.js',
    'js-refactor/undo-redo/undo-redo.viewmodel.js',
    'js-refactor/undo-redo/undo-redo.view.js',
    'js-refactor/undo-redo/undo-redo.handlers.js',
    'js-refactor/undo-redo/undo-redo.main.js',
    # Structure refactored files 1/2
    'js-refactor/structure/structure.model.js',
    'js-refactor/structure/structure.repository.js',
    'js-refactor/structure/structure.viewmodel.js',
    # App
    'js-refactor/00.app.view.js',
    # Structure refactored files 2/2
    'js-refactor/structure/structure.view.js',
    'js-refactor/structure/structure-organizer.view.js',
    'js-refactor/structure/structure.helpers.js',
    'js-refactor/stats/stats.model.js',
    'js-refactor/stats/stats.repository.js',
    'js-refactor/stats/stats.viewmodel.js',
    'js-refactor/stats/stats.view.js',
    'js-refactor/stats/stats.main.js',
    'js-refactor/auto-detect/auto-detect.model.js',
    'js-refactor/auto-detect/auto-detect.repository.js',
    'js-refactor/auto-detect/auto-detect.viewmodel.js',
    'js-refactor/auto-detect/auto-detect.view.js',
    'js-refactor/auto-detect/auto-detect.handlers.js',
    'js-refactor/auto-detect/auto-detect.main.js',
    'js-refactor/colorpalette/color-palette.model.js',
    'js-refactor/colorpalette/color-palette.repository.js',
    'js-refactor/colorpalette/color-palette.viewmodel.js',
    'js-refactor/colorpalette/color-palette.view.js',
    'js-refactor/colorpalette/color-palette.handlers.js',
    'js-refactor/colorpalette/color-palette.main.js',
    # Mobile Menu refactored files (order: model -> repository -> viewmodel -> view -> main)
    'js-refactor/mobile-menu/mobile-menu.model.js',
    'js-refactor/mobile-menu/mobile-menu.repository.js',
    'js-refactor/mobile-menu/mobile-menu.viewmodel.js',
    'js-refactor/mobile-menu/mobile-menu.view.js',
    'js-refactor/mobile-menu/mobile-menu.main.js',
    '14.dragndrop-acts.js',
    # Characters refactored files 
    'js-refactor/characters/characters.model.js',
    'js-refactor/characters/characters.repository.js',
    'js-refactor/characters/characters.viewmodel.js',
    'js-refactor/characters/characters.view.js',
    # Split View Module
    'js-refactor/splitview/splitview.model.js',
    'js-refactor/splitview/splitview.repository.js',
    'js-refactor/splitview/splitview.viewmodel.js',
    'js-refactor/splitview/splitview.view.js',
    'js-refactor/splitview/splitview.coordinator.js',
    'js-refactor/splitview/splitview.handlers.js',
    'js-refactor/splitview/splitview.main.js',
    # World refactored files 
    'js-refactor/world/world.model.js',
    'js-refactor/world/world.repository.js',
    'js-refactor/world/world.viewmodel.js',
    'js-refactor/world/world.view.js',
    '18.timeline.js',
    'js-refactor/notes/notes.model.js',
    'js-refactor/notes/notes.repository.js',
    'js-refactor/notes/notes.viewmodel.js',
    'js-refactor/notes/notes.view.js',
    'js-refactor/notes/notes.handlers.js',
    'js-refactor/notes/notes.main.js',
    # Snapshots refactored files (order: model -> repository -> viewmodel -> view -> main)
    'js-refactor/snapshots/snapshots.model.js',
    'js-refactor/snapshots/snapshots.repository.js',
    'js-refactor/snapshots/snapshots.viewmodel.js',
    'js-refactor/snapshots/snapshots.view.js',
    'js-refactor/snapshots/snapshots.main.js',
    'js-refactor/sceneVersion/sceneVersion.model.js',
    'js-refactor/sceneVersion/sceneVersion.repository.js',
    'js-refactor/sceneVersion/sceneVersion.viewmodel.js',
    'js-refactor/sceneVersion/sceneVersion.view.js',
    'js-refactor/sceneVersion/sceneVersion.main.js',
    # Diff refactored files
    'js-refactor/diff/diff.model.js',
    'js-refactor/diff/diff.repository.js',
    'js-refactor/diff/diff.viewmodel.js',
    'js-refactor/diff/diff.view.js',
    'js-refactor/diff/diff.handlers.js',
    'js-refactor/diff/diff.main.js',
    # Codex refactored files
    'js-refactor/codex/codex.model.js',
    'js-refactor/codex/codex.repository.js',
    'js-refactor/codex/codex.viewmodel.js',
    'js-refactor/codex/codex.view.js',
    # Search refactored files (order: model -> repository -> viewmodel -> view -> handlers -> main)
    'js-refactor/search/search.model.js',
    'js-refactor/search/search.repository.js',
    'js-refactor/search/search.viewmodel.js',
    'js-refactor/search/search.view.js',
    'js-refactor/search/search.handlers.js',
    'js-refactor/search/search.main.js',
    # Focus Mode refactored files
    'js-refactor/focusMode/focusMode.model.js',
    'js-refactor/focusMode/focusMode.repository.js',
    'js-refactor/focusMode/focusMode.viewmodel.js',
    'js-refactor/focusMode/focusMode.view.js',
    'js-refactor/focusMode/focusMode.handlers.js',
    'js-refactor/focusMode/focusMode.main.js',
    '27.keyboardShortcuts.js',
    'js-refactor/revision/revision.model.js',
    'js-refactor/revision/revision.repository.js',
    'js-refactor/revision/revision.viewmodel.js',
    'js-refactor/revision/revision.view.js',
    'js-refactor/revision/revision.handlers.js',
    'js-refactor/revision/revision.main.js',
    # Todo refactored files (order: model -> repository -> viewmodel -> view -> handlers -> main)
    'js-refactor/todo/todo.model.js',
    'js-refactor/todo/todo.repository.js',
    'js-refactor/todo/todo.viewmodel.js',
    'js-refactor/todo/todo.view.js',
    'js-refactor/todo/todo.handlers.js',
    'js-refactor/todo/todo.main.js',
    # Corkboard refactored files (order: model -> repository -> viewmodel -> view -> handlers -> main)
    'js-refactor/corkboard/corkboard.model.js',
    'js-refactor/corkboard/corkboard.repository.js',
    'js-refactor/corkboard/corkboard.viewmodel.js',
    'js-refactor/corkboard/corkboard.view.js',
    'js-refactor/corkboard/corkboard.handlers.js',
    'js-refactor/corkboard/corkboard.main.js',
    # Mindmap refactored files (order: model -> repository -> viewmodel -> view -> handlers -> main)
    'js-refactor/mindmap/mindmap.model.js',
    'js-refactor/mindmap/mindmap.repository.js',
    'js-refactor/mindmap/mindmap.viewmodel.js',
    'js-refactor/mindmap/mindmap.view.js',
    'js-refactor/mindmap/mindmap.handlers.js',
    'js-refactor/mindmap/mindmap.main.js',
    # Plot module refactored files
    'js-refactor/plot/plot.model.js',
    'js-refactor/plot/plot.repository.js',
    'js-refactor/plot/plot.viewmodel.js',
    'js-refactor/plot/plot.view.js',
    'js-refactor/plot/plot.init.js',
    'js-refactor/relation-map/relation-map.model.js',
    'js-refactor/relation-map/relation-map.repository.js',
    'js-refactor/relation-map/relation-map.viewmodel.js',
    'js-refactor/relation-map/relation-map.view.js',
    'js-refactor/relation-map/relation-map.handlers.js',
    'js-refactor/relation-map/relation-map.main.js',
    'js-refactor/map/map.model.js',
    'js-refactor/map/map.repository.js',
    'js-refactor/map/map.viewmodel.js',
    'js-refactor/map/map.view.js',
    'js-refactor/map/map.handlers.js',
    'js-refactor/map/map.main.js',
    'js-refactor/timeline-metro/timeline-metro.model.js',
    'js-refactor/timeline-metro/timeline-metro.repository.js',
    'js-refactor/timeline-metro/timeline-metro.viewmodel.js',
    'js-refactor/timeline-metro/timeline-metro.view.js',
    'js-refactor/timeline-metro/timeline-metro.handlers.js',
    'js-refactor/timeline-metro/timeline-metro.main.js',
    'js-refactor/theme-manager/theme-manager.model.js',
    'js-refactor/theme-manager/theme-manager.repository.js',
    'js-refactor/theme-manager/theme-manager.viewmodel.js',
    'js-refactor/theme-manager/theme-manager.view.js',
    'js-refactor/theme-manager/theme-manager.main.js',
    # Import/Export Module
    'js-refactor/import-export/import-export.model.js',
    'js-refactor/import-export/import-export.repository.js',
    'js-refactor/import-export/google-drive.service.js',
    'js-refactor/import-export/import-export.viewmodel.js',
    'js-refactor/import-export/import-export.view.js',
    'js-refactor/import-export/import-export.handlers.js',
    'js-refactor/import-export/import-export.main.js',
    # Sidebar View Module
    'js-refactor/sidebar-view/sidebar-view.model.js',
    'js-refactor/sidebar-view/sidebar-view.repository.js',
    'js-refactor/sidebar-view/sidebar-view.viewmodel.js',
    'js-refactor/sidebar-view/sidebar-view.view.js',
    'js-refactor/sidebar-view/sidebar-view.main.js',
    # Storage Monitoring Refactored Module
    'js-refactor/storageMonitoring/storageMonitoring.model.js',
    'js-refactor/storageMonitoring/storageMonitoring.repository.js',
    'js-refactor/storageMonitoring/storageMonitoring.viewmodel.js',
    'js-refactor/storageMonitoring/storageMonitoring.view.js',
    'js-refactor/storageMonitoring/storageMonitoring.main.js',
    '42.mobile-swipe.js',
    # '44.storygrid.js',  # RETIRÉ pour version Light
    # Arc Board
    'js-refactor/arc-board/arc-board.config.js',
    'js-refactor/arc-board/arc-board.models.js',
    'js-refactor/arc-board/arc-board.repository.js',
    'js-refactor/arc-board/arc-board.viewmodel.js',
    'js-refactor/arc-board/arc-board.services.js',
    'js-refactor/arc-board/arc-board.views.js',
    'js-refactor/arc-board/arc-board.handlers.js',
    'js-refactor/arc-board/arc-board.main.js',
    # Plot Grid Module
    'js-refactor/plotgrid/plot-grid.model.js',
    'js-refactor/plotgrid/plot-grid.repository.js',
    'js-refactor/plotgrid/plot-grid.viewmodel.js',
    'js-refactor/plotgrid/plot-grid.import-export.js',
    'js-refactor/plotgrid/plot-grid.view.js',
    # Scene Navigation Module
    'js-refactor/sceneNavigation/scene-navigation.model.js',
    'js-refactor/sceneNavigation/scene-navigation.repository.js',
    'js-refactor/sceneNavigation/scene-navigation.viewmodel.js',
    'js-refactor/sceneNavigation/scene-navigation.view.js',
    'js-refactor/sceneNavigation/scene-navigation.handlers.js',
    'js-refactor/sceneNavigation/scene-navigation.main.js',
    # Synonyms Module (French synonyms dictionary - local)
    'js-refactor/synonyms/synonyms.config.js',
    'js-refactor/synonyms/synonyms.model.js',
    'js-refactor/synonyms/synonyms.dictionary.js',
    'js-refactor/synonyms/synonyms.service.js',
    'js-refactor/synonyms/synonyms.repository.js',
    'js-refactor/synonyms/synonyms.viewmodel.js',
    'js-refactor/synonyms/synonyms.view.js',
    # Import Chapter Module (import .docx, .txt, .md, .epub, .pages)
    'js-refactor/import-chapter/import-chapter.model.js',
    'js-refactor/import-chapter/import-chapter.viewmodel.js',
    'js-refactor/import-chapter/import-chapter.view.js',
    # Word Repetition Analyzer Module
    'js-refactor/word-repetition/word-repetition.model.js',
    'js-refactor/word-repetition/word-repetition.repository.js',
    'js-refactor/word-repetition/word-repetition.viewmodel.js',
    'js-refactor/word-repetition/word-repetition.view.js',
    'js-refactor/word-repetition/word-repetition.handlers.js',
    'js-refactor/word-repetition/word-repetition.main.js',
    # Product tour
    'js-refactor/product-tour/product-tour.model.js',
    'js-refactor/product-tour/product-tour.repository.js',
    'js-refactor/product-tour/product-tour.viewmodel.js',
    'js-refactor/product-tour/product-tour.view.js',
    'js-refactor/product-tour/product-tour.handlers.js',
    'js-refactor/product-tour/product-tour.main.js',
]

def read_file(path):
    """Lit un fichier et retourne son contenu, gère plusieurs encodages"""
    full_path = os.path.join(BUILD_DIR, path)
    if not os.path.exists(full_path):
        log(f"   [!] Fichier non trouve: {full_path}")
        return ''
    
    encodings = ['utf-8', 'cp1252', 'latin-1', 'iso-8859-1']
    for encoding in encodings:
        try:
            with open(full_path, 'r', encoding=encoding) as f:
                content = f.read()
                return content
        except UnicodeDecodeError:
            continue
    
    with open(full_path, 'rb') as f:
        return f.read().decode('utf-8', errors='replace')

def collect_css():
    """Collecte tous les fichiers CSS dans l'ordre"""
    css_content = []
    css_dir = os.path.join(BUILD_DIR, 'css')
    found_count = 0
    
    for filename in CSS_ORDER:
        if filename.startswith('../vendor/'):
            # Vendor CSS files (bundled libraries)
            vendor_path = filename.replace('../', '')
            filepath = os.path.join(BUILD_DIR, vendor_path)
            if os.path.exists(filepath):
                content = read_file(vendor_path)
                css_content.append(f'/* ========== {vendor_path} ========== */')
                css_content.append(content)
                css_content.append('')
                found_count += 1
        else:
            filepath = os.path.join(css_dir, filename)
            if os.path.exists(filepath):
                content = read_file(f'css/{filename}')
                css_content.append(f'/* ========== {filename} ========== */')
                css_content.append(content)
                css_content.append('')
                found_count += 1
    
    # Ensuite les fichiers non listés (sauf Storygrid)
    for filepath in glob.glob(os.path.join(css_dir, '*.css')):
        filename = os.path.basename(filepath)
        if filename not in CSS_ORDER and filename != '11.storygrid.css':
            content = read_file(f'css/{filename}')
            css_content.append(f'/* ========== {filename} ========== */')
            css_content.append(content)
            css_content.append('')
            found_count += 1
    
    # Ajouter les CSS des modules dans js-refactor/
    module_css_files = [
        'js-refactor/synonyms/synonyms.css',
        'js-refactor/map/map.css'
    ]
    for css_path in module_css_files:
        filepath = os.path.join(BUILD_DIR, css_path)
        if os.path.exists(filepath):
            content = read_file(css_path)
            css_content.append(f'/* ========== {css_path} ========== */')
            css_content.append(content)
            css_content.append('')
            found_count += 1

    log(f"   [OK] {found_count} fichiers CSS trouves")
    return '\n'.join(css_content)

# Fichiers originaux à ignorer (déjà refactorisés ou retirés)
IGNORED_ORIGINALS = [
    '_01.app.js', '_03.project.js', '_05.undo-redo.js', '_06.structure.js', '_07.stats.js', 
    '_08.auto-detect.js', '_09.floating-editor.js', '_10.colorpalette.js', '_11.updateStats.js',
    '_15.characters.js', '_16.split-view.js', '_17.world.js', '_19.notes.js', '_21.sceneVersions.js', '_22.diff.js', 
    '_23.stats.js', '_24.codex.js', '_25.globalSearch.js', '_26.focusMode.js', 
    '_26.focusMode.refactor.js', 
    '_28.revision.js', '_29.todos.js', '_30.corkboard.js', '_30.corkboard.refactor.js', 
    '_31.mindmap.js', '_32.touch-events.js',
    '_33.plot.js', '_34.relations-graph.js', '_35.renderMap.js', '_36.timeline-metro.js', '_43.arcs.js', '_44.storygrid.js', 
    '_45.arc-board.js', '_45.arc-board.refactor.js', '_46.thriller-board.js', '38.tension.js', '40.sidebar-views.js',
    '12.import-export.js', '39.export.js', '41.storageMonitoring.js', '02.storage.js', '20.snapshots.js', '13.mobile-menu.js'
]

def collect_js():
    """Collecte tous les fichiers JS dans l'ordre"""
    js_content = []
    found_count = 0
    
    for filename in JS_ORDER:
        if filename.startswith('vendor/'):
            # Vendor files (bundled libraries)
            filepath = os.path.join(BUILD_DIR, filename)
            if os.path.exists(filepath):
                content = read_file(filename)
                js_content.append(f'// ========== {filename} ==========')
                js_content.append(content)
                js_content.append('')
                found_count += 1
        elif filename.startswith('js-refactor/'):
            filepath = os.path.join(BUILD_DIR, filename)
            if os.path.exists(filepath):
                content = read_file(filename)
                js_content.append(f'// ========== {filename} ==========')
                js_content.append(content)
                js_content.append('')
                found_count += 1
        else:
            filepath = os.path.join(BUILD_DIR, 'js', filename)
            if os.path.exists(filepath):
                content = read_file(f'js/{filename}')
                js_content.append(f'// ========== {filename} ==========')
                js_content.append(content)
                js_content.append('')
                found_count += 1
    
    # Extra JS files (sans Storygrid ni Thriller)
    js_dir = os.path.join(BUILD_DIR, 'js')
    for filepath in glob.glob(os.path.join(js_dir, '*.js')):
        filename = os.path.basename(filepath)
        if (filename not in JS_ORDER and 
            f'js-refactor/{filename}' not in JS_ORDER and 
            filename not in IGNORED_ORIGINALS and
            not filename.startswith('_') and
            'thriller' not in filename.lower() and
            'storygrid' not in filename.lower()):
            content = read_file(f'js/{filename}')
            js_content.append(f'// ========== {filename} ==========')
            js_content.append(content)
            js_content.append('')
    
    log(f"   [OK] {found_count} fichiers JS trouves")
    return '\n'.join(js_content)

def clean_html_menu(body_content):
    """Retire les éléments du menu Header et Mobile liés à Thriller et Storygrid"""
    # Header buttons (by ID)
    body_content = re.sub(r'<button[^>]+id="header-tab-thriller"[^>]*>.*?</button>', '', body_content, flags=re.DOTALL)
    body_content = re.sub(r'<button[^>]+id="header-tab-storygrid"[^>]*>.*?</button>', '', body_content, flags=re.DOTALL)
    
    # Mobile buttons (by data-view)
    body_content = re.sub(r'<button[^>]+data-view="thriller"[^>]*>.*?</button>', '', body_content, flags=re.DOTALL)
    body_content = re.sub(r'<button[^>]+data-view="storygrid"[^>]*>.*?</button>', '', body_content, flags=re.DOTALL)
    
    # Sidebar lists
    body_content = re.sub(r'<div[^>]+id="thrillerList"[^>]*>.*?</div>', '', body_content, flags=re.DOTALL)

    # Template options
    body_content = re.sub(r'<option[^>]+value="thriller"[^>]*>.*?</option>', '', body_content)
    
    return body_content

def build(output_file=None):
    """Construit le fichier HTML final"""
    global log_handle
    log_handle = open(LOG_FILE, 'w', encoding='utf-8')
    
    log(f"========================================")
    log(f"Build Plume LIGHT - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    log(f"========================================")
    
    head = read_file('html/head.html')
    body = read_file('html/body.html')
    footer = read_file('html/footer.html')
    
    # Nettoyage du menu
    body = clean_html_menu(body)
    
    css = collect_css()
    js = collect_js()
    
    output = f"""{head}
    <style>
{css}
    </style>
</head>
{body}
    <script>
{js}
    </script>
{footer}"""
    
    output_path = os.path.join(BUILD_DIR, 'build', output_file)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(output)
    
    log(f"BUILD LIGHT TERMINE: {output_path}")
    log_handle.close()
    return output_path

if __name__ == "__main__":
    timestamp = datetime.now().strftime('%Y.%m.%d.%H.%M')
    output = f'plume-light-{timestamp}.html'
    if len(sys.argv) > 2 and sys.argv[1] == '--output':
        output = sys.argv[2]
        
    print(f"Build Light -> {output}") 
    build(output)
