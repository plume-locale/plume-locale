#!/usr/bin/env python3
"""
Script de build Plume LIGHT
BasÃ© sur build.test.py, retire les modules Storygrid et Thriller.
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
    """Ã‰crit un message dans la console ET dans le fichier log"""
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
    '14.word-repetition.css',
    '14.product-tour.css',
    'investigation-board.css',
    'investigation-board.tabs.css',
]

# Ordre des fichiers JS
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

def read_file(path):
    """Lit un fichier et retourne son contenu, gÃ¨re plusieurs encodages"""
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
    
    # Ensuite les fichiers non listÃ©s (sauf Storygrid)
    for filepath in glob.glob(os.path.join(css_dir, '*.css')):
        filename = os.path.basename(filepath)
        if filename not in CSS_ORDER and filename != '11.storygrid.css':
            content = read_file(f'css/{filename}')
            css_content.append(f'/* ========== {filename} ========== */')
            css_content.append(content)
            css_content.append('')
            found_count += 1
    
    # Ajouter les CSS des modules dans css/
    module_css_files = [
        'css/synonyms.css',
        'css/map.css',
        'css/keyboard-shortcuts.css',
        'css/investigation-board.css',
        'css/investigation-board.tabs.css'
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

# Fichiers originaux Ã  ignorer (dÃ©jÃ  refactorisÃ©s ou retirÃ©s)
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
    '12.import-export.js', '39.export.js', '41.storageMonitoring.js', '02.storage.js', '20.snapshots.js', '13.mobile-menu.js',
    '27.keyboardShortcuts.js', '42.mobile-swipe.js', '14.dragndrop-acts.js'
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
        elif filename.startswith('js/'):
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
            f'js/{filename}' not in JS_ORDER and 
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
    """Retire les Ã©lÃ©ments du menu Header et Mobile liÃ©s Ã  Thriller et Storygrid"""
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
    
    if 'build' in output_file or os.path.isabs(output_file):
        output_path = os.path.join(BUILD_DIR, output_file)
    else:
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

