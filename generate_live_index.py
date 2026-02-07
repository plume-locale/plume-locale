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
    'investigation-board.css',
    'investigation-board.tabs.css',
]

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
    # Mobile Menu refactored files
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
    # Snapshots refactored files
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
    # Search refactored files
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
    # Keyboard Shortcuts refactored files
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
    # Todo refactored files
    'js/todo/todo.model.js',
    'js/todo/todo.repository.js',
    'js/todo/todo.viewmodel.js',
    'js/todo/todo.view.js',
    'js/todo/todo.handlers.js',
    'js/todo/todo.main.js',
    # Corkboard refactored files
    'js/corkboard/corkboard.model.js',
    'js/corkboard/corkboard.repository.js',
    'js/corkboard/corkboard.viewmodel.js',
    'js/corkboard/corkboard.view.js',
    'js/corkboard/corkboard.handlers.js',
    'js/corkboard/corkboard.main.js',
    # Mindmap refactored files
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
    # Synonyms Module
    'js/synonyms/synonyms.config.js',
    'js/synonyms/synonyms.model.js',
    'js/synonyms/synonyms.dictionary.js',
    'js/synonyms/synonyms.service.js',
    'js/synonyms/synonyms.repository.js',
    'js/synonyms/synonyms.viewmodel.js',
    'js/synonyms/synonyms.view.js',
    # Import Chapter Module
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
    'css/synonyms.css',
    'css/map.css',
    'css/keyboard-shortcuts.css',
    # These are already in CSS_ORDER
    # 'css/investigation-board.css',
    # 'css/investigation-board.tabs.css'
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
        elif original_path.startswith('js/'):
             return f'./js/{original_path.replace("js/", "")}'
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

