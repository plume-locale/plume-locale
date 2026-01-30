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
    # '11.storygrid.css',  # RETIRÉ pour version Light
    '12.arc-board.css',
    #'undo-redo.css'
]

# Ordre des fichiers JS
JS_ORDER = [
    'js-refactor/01.app.refactor.js',
    '38.tension.js',
    '02.storage.js',
    'js-refactor/03.projects.refactor.js',
    '04.init.js',
    'js-refactor/05.undo-redo.refactor.js',
    # Structure refactored files 1/2
    'js-refactor/structure/structure.model.js',
    'js-refactor/structure/structure.repository.js',
    'js-refactor/structure/structure.viewmodel.js',
    # App
    'js-refactor/00.app.view.js',
    # Structure refactored files 2/2
    'js-refactor/structure/structure.view.js',
    'js-refactor/structure/structure.helpers.js',
    'js-refactor/07.stats.refactor.js',
    'js-refactor/08.auto-detect.refactor.js',
    '09.floating-editor.js',
    'js-refactor/10.colorpalette.refactor.js',
    '11.updateStats.js',
    '12.import-export.js',
    '13.mobile-menu.js',
    '14.dragndrop-acts.js',
    # Characters refactored files 
    'js-refactor/characters/characters.model.js',
    'js-refactor/characters/characters.repository.js',
    'js-refactor/characters/characters.viewmodel.js',
    'js-refactor/characters/characters.view.js',
    'js-refactor/16.split-view.js',
    # World refactored files 
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
    # Codex refactored files
    'js-refactor/codex/codex.model.js',
    'js-refactor/codex/codex.repository.js',
    'js-refactor/codex/codex.viewmodel.js',
    'js-refactor/codex/codex.view.js',
    '25.globalSearch.js',
    'js-refactor/26.focusMode.refactor.js',
    '27.keyboardShortcuts.js',
    'js-refactor/28.revision.refactor.js',
    'js-refactor/29.todos.refactor.js',
    # Corkboard refactored files (order: model -> repository -> viewmodel -> view -> handlers -> main)
    'js-refactor/corkboard/corkboard.model.js',
    'js-refactor/corkboard/corkboard.repository.js',
    'js-refactor/corkboard/corkboard.viewmodel.js',
    'js-refactor/corkboard/corkboard.view.js',
    'js-refactor/corkboard/corkboard.handlers.js',
    'js-refactor/corkboard/corkboard.main.js',
    '31.mindmap.js',
    '32.touch-events.js',
    # Plot module refactored files
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
    # Thriller Board - RETIRÉ pour version Light
    # 'js-refactor/thriller-board/thriller-board.constants.js',
    # 'js-refactor/thriller-board/thriller-board.model.js',
    # 'js-refactor/thriller-board/thriller-board.repository.js',
    # 'js-refactor/thriller-board/thriller-board.helpers.js',
    # 'js-refactor/thriller-board/thriller-board.viewmodel.js',
    # 'js-refactor/thriller-board/thriller-board.type-editor.js',
    # 'js-refactor/thriller-board/thriller-board.view.js',
    # Plot Grid Module
    'js-refactor/plotgrid/plot-grid.model.js',
    'js-refactor/plotgrid/plot-grid.repository.js',
    'js-refactor/plotgrid/plot-grid.viewmodel.js',
    'js-refactor/plotgrid/plot-grid.import-export.js',
    'js-refactor/plotgrid/plot-grid.view.js',
    'js-refactor/28.sceneNavigation.js',
    # Synonyms Module (French synonyms dictionary with Datamuse API)
    'js-refactor/synonyms/synonyms.config.js',
    'js-refactor/synonyms/synonyms.model.js',
    'js-refactor/synonyms/synonyms.service.js',
    'js-refactor/synonyms/synonyms.repository.js',
    'js-refactor/synonyms/synonyms.viewmodel.js',
    'js-refactor/synonyms/synonyms.view.js'
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
        'js-refactor/synonyms/synonyms.css'
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

# Fichiers originaux à ignorer
IGNORED_ORIGINALS = [
    '03.project.js', '06.structure.js', '07.stats.js', '08.auto-detect.js',
    '15.characters.js', '17.world.js', '01.app.js', '10.colorpalette.js',
    '21.sceneVersions.js', '26.focusMode.js', '28.revision.js', '29.todos.js',
    '24.codex.js',
    '30.corkboard.js', '30.corkboard.refactor.js', '33.plot.js', '43.arcs.js', '45.arc-board.js',
    '45.arc-board.refactor.js', '46.thriller-board.js', '44.storygrid.js'
]

def collect_js():
    """Collecte tous les fichiers JS dans l'ordre"""
    js_content = []
    found_count = 0
    
    for filename in JS_ORDER:
        if filename.startswith('js-refactor/'):
            filepath = os.path.join(BUILD_DIR, filename)
        else:
            filepath = os.path.join(BUILD_DIR, 'js', filename)
        
        if os.path.exists(filepath):
            if filename.startswith('js-refactor/'):
                content = read_file(filename)
            else:
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
