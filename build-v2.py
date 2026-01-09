#!/usr/bin/env python3
"""
Script de build Plume v2.0 - Nouvelle Architecture
Utilise la nouvelle architecture MVC à la place de l'ancien code monolithique
Usage: python3 build-v2.py [--output fichier.html]
"""

import os
import sys
import glob
from datetime import datetime

BUILD_DIR = os.path.dirname(os.path.abspath(__file__))
LOG_FILE = os.path.join(BUILD_DIR, 'build-v2.log')

# Fichier log global
log_handle = None

def log(message):
    """Écrit un message dans la console ET dans le fichier log"""
    print(message)
    if log_handle:
        log_handle.write(message + '\n')
        log_handle.flush()

# ========== NOUVELLE ARCHITECTURE v2.0 ==========

# Ordre des fichiers JS de la NOUVELLE architecture
JS_V2_ORDER = [
    # Core (chargés en premier)
    'js/00-core/01.state.js',
    'js/00-core/02.events.js',
    'js/00-core/03.router.js',

    # Utils
    'js/02-utils/dom.js',
    'js/02-utils/text.js',
    'js/02-utils/array.js',
    'js/02-utils/date.js',
    'js/02-utils/color.js',
    'js/02-utils/validators.js',
    'js/02-utils/diff.js',

    # Infrastructure
    'js/01-infrastructure/storage.js',
    'js/01-infrastructure/keyboard.js',
    'js/01-infrastructure/mobile-gestures.js',
    'js/01-infrastructure/mobile-menu.js',
    'js/01-infrastructure/sidebar-resize.js',
    'js/01-infrastructure/drag-drop.js',
    'js/01-infrastructure/storage-monitoring.js',
    'js/01-infrastructure/touch-events.js',

    # Models
    'js/04-models/Project.js',
    'js/04-models/Scene.js',
    'js/04-models/Character.js',
    'js/04-models/Location.js',
    'js/04-models/Arc.js',
    'js/04-models/Note.js',

    # Services
    'js/03-services/project.service.js',
    'js/03-services/scene.service.js',
    'js/03-services/character.service.js',
    'js/03-services/location.service.js',
    'js/03-services/note.service.js',
    'js/03-services/stats.service.js',
    'js/03-services/history.service.js',
    'js/03-services/import-export.service.js',
    'js/03-services/timeline.service.js',
    'js/03-services/snapshot.service.js',
    'js/03-services/search.service.js',
    'js/03-services/stats-advanced.service.js',
    'js/03-services/stats-extended.service.js',
    'js/03-services/auto-detect.service.js',
    'js/03-services/scene-versions.service.js',
    'js/03-services/codex.service.js',
    'js/03-services/todos.service.js',
    'js/03-services/tension-words.service.js',
    'js/03-services/plot.service.js',
    'js/03-services/narrative-arcs.service.js',
    'js/03-services/theme.service.js',

    # UI Components
    'js/05-ui/modal.js',
    'js/05-ui/toast.js',
    'js/05-ui/mobile-views.js',
    'js/05-ui/color-palette.js',
    'js/05-ui/focus-mode.js',
    'js/05-ui/floating-editor.js',
    'js/05-ui/map-renderer.js',
    'js/05-ui/relations-graph.js',
    'js/05-ui/corkboard.js',
    'js/05-ui/revision-mode.js',

    # Views - Characters
    'js/06-views/characters/characters.render.js',
    'js/06-views/characters/characters.handlers.js',
    'js/06-views/characters/characters.view.js',

    # Views - Locations
    'js/06-views/locations/locations.render.js',
    'js/06-views/locations/locations.handlers.js',
    'js/06-views/locations/locations.view.js',

    # Views - Notes
    'js/06-views/notes/notes.render.js',
    'js/06-views/notes/notes.handlers.js',
    'js/06-views/notes/notes.view.js',

    # Views - Scenes
    'js/06-views/scenes/scenes.render.js',
    'js/06-views/scenes/scenes.handlers.js',
    'js/06-views/scenes/scenes.view.js',

    # Views - Structure
    'js/06-views/structure/structure.render.js',
    'js/06-views/structure/structure.handlers.js',
    'js/06-views/structure/structure.view.js',

    # Views - Arc Board
    'js/06-views/arc-board/arc-board.render.js',
    'js/06-views/arc-board/arc-board.handlers.js',
    'js/06-views/arc-board/arc-board.view.js',

    # Views - Story Grid
    'js/06-views/story-grid/story-grid.render.js',
    'js/06-views/story-grid/story-grid.handlers.js',
    'js/06-views/story-grid/story-grid.view.js',

    # App (orchestrateur - chargé en dernier)
    'js/00-core/00.app.js',

    # Compatibility Bridge (assure compatibilité avec l'ancien HTML)
    'js/00-core/99.compatibility-bridge.js',
]

# Anciens fichiers EXCLUS (déjà migrés dans v2)
EXCLUDED_OLD_FILES = [
    '01.app.js',        # Remplacé par 00-core/00.app.js
    '02.storage.js',    # Remplacé par 01-infrastructure/storage.js
    '04.init.js',       # Intégré dans App.js
    '05.undo-redo.js',  # Remplacé par 03-services/history.service.js
    '06.structure.js',  # Remplacé par 06-views/structure/
    '07.stats.js',      # Remplacé par 03-services/stats-extended.service.js
    '08.auto-detect.js', # Remplacé par 03-services/auto-detect.service.js
    '09.floating-editor.js', # Remplacé par 05-ui/floating-editor.js
    '10.colorpalette.js', # Remplacé par 05-ui/color-palette.js + sidebar-resize.js
    '11.updateStats.js', # Remplacé par 03-services/stats.service.js
    '12.import-export.js', # Remplacé par 03-services/import-export.service.js
    '13.mobile-menu.js', # Remplacé par 01-infrastructure/mobile-menu.js
    '14.dragndrop-acts.js', # Remplacé par 01-infrastructure/drag-drop.js
    '15.characters.js', # Remplacé par 06-views/characters/
    '17.world.js',      # Remplacé par 06-views/locations/
    '18.timeline.js',   # Remplacé par 03-services/timeline.service.js
    '19.notes.js',      # Remplacé par 06-views/notes/
    '20.snapshots.js',  # Remplacé par 03-services/snapshot.service.js
    '21.sceneVersions.js', # Remplacé par 03-services/scene-versions.service.js
    '22.diff.js',       # Remplacé par 02-utils/diff.js
    '23.stats.js',      # Remplacé par 03-services/stats-advanced.service.js
    '24.codex.js',      # Remplacé par 03-services/codex.service.js
    '25.globalSearch.js', # Remplacé par 03-services/search.service.js
    '26.focusMode.js',  # Remplacé par 05-ui/focus-mode.js
    '27.keyboardShortcuts.js', # Remplacé par 01-infrastructure/keyboard.js
    '29.todos.js',      # Remplacé par 03-services/todos.service.js
    '35.renderMap.js',  # Remplacé par 05-ui/map-renderer.js
    '40.sidebar-views.js', # Remplacé par 05-ui/mobile-views.js
    '41.storageMonitoring.js', # Remplacé par 01-infrastructure/storage-monitoring.js
    '42.mobile-swipe.js', # Remplacé par 01-infrastructure/mobile-gestures.js
    '44.storygrid.js',  # Remplacé par 06-views/story-grid/
    '45.arc-board.js',  # Remplacé par 06-views/arc-board/
    '28.revision.js',   # Remplacé par 05-ui/revision-mode.js
    '30.corkboard.js',  # Remplacé par 05-ui/corkboard.js
    '32.touch-events.js', # Remplacé par 01-infrastructure/touch-events.js
    '33.plot.js',       # Remplacé par 03-services/plot.service.js
    '34.relations-graph.js', # Remplacé par 05-ui/relations-graph.js
    '37.theme-manager.js', # Remplacé par 03-services/theme.service.js
    '38.tension.js',    # Remplacé par 03-services/tension-words.service.js
    '43.arcs.js',       # Remplacé par 03-services/narrative-arcs.service.js
]

# Anciens fichiers À GARDER (fonctionnalités non encore migrées)
OLD_FILES_TO_KEEP = [
    '03.project.js',    # Contient encore beaucoup de fonctions nécessaires (à garder temporairement)
    '16.split-view.js',
    '31.mindmap.js',
    '36.timeline-metro.js',
    '39.export.js',
]

# Ordre des fichiers CSS (inchangé)
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
    '11.storygrid.css',
    '12.arc-board.css'
]

def read_file(path):
    """Lit un fichier et retourne son contenu"""
    full_path = os.path.join(BUILD_DIR, path)
    if not os.path.exists(full_path):
        log(f"   [!] Fichier non trouvé: {path}")
        return ''

    encodings = ['utf-8', 'cp1252', 'latin-1', 'iso-8859-1']

    for encoding in encodings:
        try:
            with open(full_path, 'r', encoding=encoding) as f:
                content = f.read()
                if encoding != 'utf-8':
                    log(f"   [!] {path} lu en {encoding}")
                return content
        except UnicodeDecodeError:
            continue

    log(f"   [ERREUR] {path} - encodage inconnu")
    with open(full_path, 'rb') as f:
        return f.read().decode('utf-8', errors='replace')

def collect_css():
    """Collecte tous les fichiers CSS"""
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

    for filepath in glob.glob(os.path.join(css_dir, '*.css')):
        filename = os.path.basename(filepath)
        if filename not in CSS_ORDER:
            content = read_file(f'css/{filename}')
            css_content.append(f'/* ========== {filename} ========== */')
            css_content.append(content)
            css_content.append('')
            found_count += 1

    log(f"   [OK] {found_count} fichiers CSS trouvés")
    return '\n'.join(css_content)

def collect_js_v2():
    """Collecte les fichiers JS de la NOUVELLE architecture v2"""
    js_content = []
    found_count = 0
    missing = []

    log("   === NOUVELLE ARCHITECTURE v2.0 ===")

    for filepath in JS_V2_ORDER:
        full_path = os.path.join(BUILD_DIR, filepath)
        if os.path.exists(full_path):
            content = read_file(filepath)
            js_content.append(f'// ========== {filepath} ==========')
            js_content.append(content)
            js_content.append('')
            found_count += 1
        else:
            missing.append(filepath)

    log(f"   [OK] {found_count} nouveaux fichiers JS trouvés")
    if missing:
        log(f"   [!] {len(missing)} fichiers v2 manquants:")
        for f in missing:
            log(f"      - {f}")

    return js_content, found_count

def collect_js_old():
    """Collecte les anciens fichiers JS NON MIGRÉS"""
    js_content = []
    js_dir = os.path.join(BUILD_DIR, 'js')
    found_count = 0

    log("   === ANCIEN CODE (non migré) ===")

    for filename in OLD_FILES_TO_KEEP:
        filepath = os.path.join(js_dir, filename)
        if os.path.exists(filepath):
            content = read_file(f'js/{filename}')
            js_content.append(f'// ========== [OLD] js/{filename} ==========')
            js_content.append(content)
            js_content.append('')
            found_count += 1

    log(f"   [OK] {found_count} anciens fichiers conservés")
    log(f"   [i] {len(EXCLUDED_OLD_FILES)} fichiers exclus (déjà migrés)")

    return js_content, found_count

def build_v2(output_file='plume-v2.html'):
    """Construit le fichier HTML avec la nouvelle architecture"""
    global log_handle

    log_handle = open(LOG_FILE, 'w', encoding='utf-8')

    log(f"========================================")
    log(f"Build Plume v2.0 - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    log(f"========================================")
    log(f"Nouvelle architecture MVC")
    log(f"Répertoire: {BUILD_DIR}")
    log("")

    # Lire les templates HTML
    log("--- Templates HTML ---")
    head = read_file('html/head.html')
    body = read_file('html/body.html')
    footer = read_file('html/footer.html')

    log(f"   [OK] head.html ({len(head)} caractères)")
    log(f"   [OK] body.html ({len(body)} caractères)")
    log(f"   [OK] footer.html ({len(footer)} caractères)")
    log("")

    # Collecter CSS
    log("--- CSS ---")
    css = collect_css()
    log(f"   Total: {len(css):,} caractères")
    log("")

    # Collecter JS v2 + anciens
    log("--- JavaScript ---")
    js_v2, count_v2 = collect_js_v2()
    js_old, count_old = collect_js_old()

    # Combiner v2 + anciens
    js_combined = js_v2 + js_old
    js = '\n'.join(js_combined)

    log(f"   Total: {count_v2} nouveaux + {count_old} anciens = {count_v2 + count_old} fichiers")
    log(f"   Total: {len(js):,} caractères")
    log("")

    # Assembler
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

    # Écrire
    output_path = os.path.join(BUILD_DIR, 'build', output_file)
    build_dir = os.path.dirname(output_path)

    log(f"--- Écriture ---")
    os.makedirs(build_dir, exist_ok=True)

    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(output)

        size = os.path.getsize(output_path)
        log("")
        log(f"========================================")
        log(f"BUILD v2.0 TERMINÉ !")
        log(f"========================================")
        log(f"Fichier: {output_path}")
        log(f"Taille: {size:,} octets")
        log(f"Architecture: NOUVELLE (v2.0)")
        log(f"Fichiers exclus: {len(EXCLUDED_OLD_FILES)} (migrés)")
        log(f"Fichiers gardés: {count_old} (à migrer)")

    except Exception as e:
        log(f"   [ERREUR] {e}")
        log_handle.close()
        return None

    log_handle.close()
    return output_path

if __name__ == "__main__":
    output = 'plume-v2.html'
    if len(sys.argv) > 2 and sys.argv[1] == '--output':
        output = sys.argv[2]

    try:
        result = build_v2(output)
        if result:
            print(f"\n✅ Build réussi : {result}")
        else:
            print(f"\n❌ Build échoué - voir {LOG_FILE}")
            sys.exit(1)
    except Exception as e:
        with open(LOG_FILE, 'a', encoding='utf-8') as f:
            f.write(f"\n[ERREUR FATALE] {e}\n")
            import traceback
            f.write(traceback.format_exc())
        print(f"\n❌ Erreur fatale - voir {LOG_FILE}")
        raise
