import os
import glob
import re
import sys

# Configuration paths
BUILD_DIR = os.getcwd()
LIVE_DIR = os.path.join(BUILD_DIR, 'live')
OUTPUT_FILE = os.path.join(LIVE_DIR, 'index.html')

# We need to extract the lists from build.light.py
# explicit lists here to avoid import issues
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
    'js-refactor/investigation-board/investigation-board.css',
    'js-refactor/investigation-board/investigation-board.tabs.css',
]

JS_ORDER = [
    # Vendor libraries (bundled)
    'vendor/driver.js.iife.js',
    'vendor/idb.js',
    'js-refactor/01.app.refactor.js',
    # Localization Module
    'js-refactor/localization/locales/fr.js',
    'js-refactor/localization/locales/en.js',
    'js-refactor/localization/locales/de.js',
    'js-refactor/localization/locales/es.js',
    'js-refactor/localization/localization.model.js',
    'js-refactor/localization/localization.view.js',
    'js-refactor/localization/localization.manager.js',
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
    # Mobile Menu refactored files
    'js-refactor/mobile-menu/mobile-menu.model.js',
    'js-refactor/mobile-menu/mobile-menu.repository.js',
    'js-refactor/mobile-menu/mobile-menu.viewmodel.js',
    'js-refactor/mobile-menu/mobile-menu.view.js',
    'js-refactor/mobile-menu/mobile-menu.main.js',
    # Drag and Drop Acts Module
    'js-refactor/dragndrop-acts/dragndrop-acts.model.js',
    'js-refactor/dragndrop-acts/dragndrop-acts.repository.js',
    'js-refactor/dragndrop-acts/dragndrop-acts.viewmodel.js',
    'js-refactor/dragndrop-acts/dragndrop-acts.view.js',
    'js-refactor/dragndrop-acts/dragndrop-acts.handlers.js',
    'js-refactor/dragndrop-acts/dragndrop-acts.main.js',
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
    # Snapshots refactored files
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
    # Search refactored files
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
    # Keyboard Shortcuts refactored files
    'js-refactor/keyboard-shortcuts/keyboard-shortcuts.model.js',
    'js-refactor/keyboard-shortcuts/keyboard-shortcuts.repository.js',
    'js-refactor/keyboard-shortcuts/keyboard-shortcuts.viewmodel.js',
    'js-refactor/keyboard-shortcuts/keyboard-shortcuts.view.js',
    'js-refactor/keyboard-shortcuts/keyboard-shortcuts.handlers.js',
    'js-refactor/keyboard-shortcuts/keyboard-shortcuts.main.js',
    'js-refactor/revision/revision.model.js',
    'js-refactor/revision/revision.repository.js',
    'js-refactor/revision/revision.viewmodel.js',
    'js-refactor/revision/revision.view.js',
    'js-refactor/revision/revision.handlers.js',
    'js-refactor/revision/revision.main.js',
    # Todo refactored files
    'js-refactor/todo/todo.model.js',
    'js-refactor/todo/todo.repository.js',
    'js-refactor/todo/todo.viewmodel.js',
    'js-refactor/todo/todo.view.js',
    'js-refactor/todo/todo.handlers.js',
    'js-refactor/todo/todo.main.js',
    # Corkboard refactored files
    'js-refactor/corkboard/corkboard.model.js',
    'js-refactor/corkboard/corkboard.repository.js',
    'js-refactor/corkboard/corkboard.viewmodel.js',
    'js-refactor/corkboard/corkboard.view.js',
    'js-refactor/corkboard/corkboard.handlers.js',
    'js-refactor/corkboard/corkboard.main.js',
    # Mindmap refactored files
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
    # Mobile Swipe refactored files
    'js-refactor/mobile-swipe/mobile-swipe.model.js',
    'js-refactor/mobile-swipe/mobile-swipe.repository.js',
    'js-refactor/mobile-swipe/mobile-swipe.viewmodel.js',
    'js-refactor/mobile-swipe/mobile-swipe.view.js',
    'js-refactor/mobile-swipe/mobile-swipe.handlers.js',
    'js-refactor/mobile-swipe/mobile-swipe.main.js',
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
    # Synonyms Module
    'js-refactor/synonyms/synonyms.config.js',
    'js-refactor/synonyms/synonyms.model.js',
    'js-refactor/synonyms/synonyms.dictionary.js',
    'js-refactor/synonyms/synonyms.service.js',
    'js-refactor/synonyms/synonyms.repository.js',
    'js-refactor/synonyms/synonyms.viewmodel.js',
    'js-refactor/synonyms/synonyms.view.js',
    # Import Chapter Module
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
    # Investigation Board Module (New)
    'js-refactor/investigation-board/investigation-board.model.js',
    'js-refactor/investigation-board/investigation-board.store.js',
    'js-refactor/investigation-board/investigation-board.dashboard.js',
    'js-refactor/investigation-board/investigation-board.registry.js',
    'js-refactor/investigation-board/investigation-board.matrix.js',
    'js-refactor/investigation-board/investigation-board.mmo.js',
    'js-refactor/investigation-board/investigation-board.timeline.js',
    'js-refactor/investigation-board/investigation-board.demo.js',
    'js-refactor/investigation-board/investigation-board.sidebar.js',
    'js-refactor/investigation-board/investigation-board.view.js',
]

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

MODULE_CSS_FILES = [
    'js-refactor/synonyms/synonyms.css',
    'js-refactor/map/map.css',
    'js-refactor/keyboard-shortcuts/keyboard-shortcuts.css',
    # These are already in CSS_ORDER
    # 'js-refactor/investigation-board/investigation-board.css',
    # 'js-refactor/investigation-board/investigation-board.tabs.css'
]

def read_file(path):
    full_path = os.path.join(BUILD_DIR, path)
    if not os.path.exists(full_path):
        print(f"File not found: {path} (full: {full_path})")
        return ""
    with open(full_path, 'r', encoding='utf-8') as f:
        return f.read()

def clean_html_menu(body_content):
    # Same logic as build.light.py
    body_content = re.sub(r'<button[^>]+id="header-tab-thriller"[^>]*>.*?</button>', '', body_content, flags=re.DOTALL)
    body_content = re.sub(r'<button[^>]+id="header-tab-storygrid"[^>]*>.*?</button>', '', body_content, flags=re.DOTALL)
    body_content = re.sub(r'<button[^>]+data-view="thriller"[^>]*>.*?</button>', '', body_content, flags=re.DOTALL)
    body_content = re.sub(r'<button[^>]+data-view="storygrid"[^>]*>.*?</button>', '', body_content, flags=re.DOTALL)
    body_content = re.sub(r'<div[^>]+id="thrillerList"[^>]*>.*?</div>', '', body_content, flags=re.DOTALL)
    body_content = re.sub(r'<option[^>]+value="thriller"[^>]*>.*?</option>', '', body_content)
    return body_content

def generate_index():
    head = read_file('html/head.html')
    body = read_file('html/body.html')
    footer = read_file('html/footer.html')
    
    body = clean_html_menu(body)
    
    # CSS Links
    css_links = []
    
    processed_css = []
    
    for css in CSS_ORDER:
        filename = os.path.basename(css)
        link = f'<link rel="stylesheet" href="./css/{filename}">'
        css_links.append(link)
        processed_css.append(css)

    # 2. Other CSS files in css/ folder not in order (excluding storygrid)
    local_css_dir = os.path.join(BUILD_DIR, 'css')
    for filepath in glob.glob(os.path.join(local_css_dir, '*.css')):
        filename = os.path.basename(filepath)
        if filename not in [os.path.basename(c) for c in CSS_ORDER] and filename != '11.storygrid.css':
            link = f'<link rel="stylesheet" href="./css/{filename}">'
            css_links.append(link)

    # 3. Module CSS files
    for css in MODULE_CSS_FILES:
        # Check if basename already processed (to avoid dups if multiple paths have same name, unlikely but safekeeping)
        if css not in processed_css: 
             filename = os.path.basename(css)
             link = f'<link rel="stylesheet" href="./css/{filename}">'
             css_links.append(link)

    # JS Scripts
    js_scripts = []
    
    # helper to normalize js path to live/js/...
    def get_live_js_path(original_path):
        if original_path.startswith('vendor/'):
             return f'./js/{original_path}' # keep vendor/ struct inside js/
        elif original_path.startswith('js-refactor/'):
             return f'./js/{original_path.replace("js-refactor/", "")}'
        elif original_path.startswith('js/'):
             return f'./js/{original_path.replace("js/", "")}'
        else:
             return f'./js/{original_path}'

    # 1. JS_ORDER
    for js in JS_ORDER:
         src = get_live_js_path(js)
         js_scripts.append(f'<script src="{src}"></script>')
             
    # 2. Extra JS files
    local_js_dir = os.path.join(BUILD_DIR, 'js')
    for filepath in glob.glob(os.path.join(local_js_dir, '*.js')):
        filename = os.path.basename(filepath)
        
        is_in_order = False
        for order_item in JS_ORDER:
            # Check by basename if it matches something loose in JS_ORDER
            if os.path.basename(order_item) == filename:
                is_in_order = True
                break
        
        if (not is_in_order and 
            filename not in IGNORED_ORIGINALS and
            not filename.startswith('_') and
            'thriller' not in filename.lower() and
            'storygrid' not in filename.lower()):
            
            src = f'./js/{filename}'
            js_scripts.append(f'<script src="{src}"></script>')

    # Construct HTML
    html_content = f"""{head}
    <!-- Generated CSS Links -->
    {chr(10).join(css_links)}
</head>
{body}
    <!-- Generated JS Scripts -->
    {chr(10).join(js_scripts)}
{footer}"""

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"Generated {OUTPUT_FILE}")

if __name__ == "__main__":
    generate_index()
