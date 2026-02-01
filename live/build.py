#!/usr/bin/env python3
"""
Script de build Plume
Reconstruit le fichier HTML complet à partir des modules
Usage: python3 build.py [--output fichier.html]
"""

import os
import sys
import glob
from datetime import datetime

BUILD_DIR = os.path.dirname(os.path.abspath(__file__))
LOG_FILE = os.path.join(BUILD_DIR, 'build.log')

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
    '11.storygrid.css',
    '12.arc-board.css',
    '13.thriller-board.css',
    '14.word-repetition.css'
]

# Ordre des fichiers JS (selon concat.sh)
JS_ORDER = [
    '01.app.js',
    '02.storage.js',
    '03.project.js',
    '04.init.js',
    '05.undo-redo.js',
    '06.structure.js',
    '07.stats.js',
    '08.auto-detect.js',
    '09.floating-editor.js',
    '10.colorpalette.js',
    '11.updateStats.js',
    '12.import-export.js',
    '13.mobile-menu.js',
    '14.dragndrop-acts.js',
    '15.characters.js',
    '16.split-view.js',
    '17.world.js',
    '18.timeline.js',
    '19.notes.js',
    '20.snapshots.js',
    '21.sceneVersions.js',
    '22.diff.js',
    '23.stats.js',
    '24.codex.js',
    '25.globalSearch.js',
    '26.focusMode.js',
    '27.keyboardShortcuts.js',
    '28.revision.js',
    '29.todos.js',
    '30.corkboard.js',
    '31.mindmap.js',
    '32.touch-events.js',
    '33.plot.js',
    '34.relations-graph.js',
    '35.renderMap.js',
    '36.timeline-metro.js',
    '37.theme-manager.js',
    '38.tension.js',
    '39.export.js',
    '40.sidebar-views.js',
    '41.storageMonitoring.js',
    '42.mobile-swipe.js',
    '43.arcs.js',
    '44.storygrid.js',
    '45.arc-board.js',
    '46.thriller-board.js'
]

def read_file(path):
    """Lit un fichier et retourne son contenu, gère plusieurs encodages"""
    full_path = os.path.join(BUILD_DIR, path)
    if not os.path.exists(full_path):
        log(f"   [!] Fichier non trouve: {full_path}")
        return ''
    
    # Essayer différents encodages
    encodings = ['utf-8', 'cp1252', 'latin-1', 'iso-8859-1']
    
    for encoding in encodings:
        try:
            with open(full_path, 'r', encoding=encoding) as f:
                content = f.read()
                if encoding != 'utf-8':
                    log(f"   [!] {path} lu en {encoding} (pas UTF-8)")
                return content
        except UnicodeDecodeError:
            continue
    
    # Si aucun encodage ne fonctionne, lire en binaire et décoder avec erreurs ignorées
    log(f"   [ERREUR] {path} - encodage inconnu, lecture forcee")
    with open(full_path, 'rb') as f:
        return f.read().decode('utf-8', errors='replace')

def collect_css():
    """Collecte tous les fichiers CSS dans l'ordre"""
    css_content = []
    css_dir = os.path.join(BUILD_DIR, 'css')
    found_count = 0
    
    # D'abord les fichiers ordonnés
    for filename in CSS_ORDER:
        filepath = os.path.join(css_dir, filename)
        if os.path.exists(filepath):
            content = read_file(f'css/{filename}')
            css_content.append(f'/* ========== {filename} ========== */')
            css_content.append(content)
            css_content.append('')
            found_count += 1
    
    # Ensuite les fichiers non listés
    for filepath in glob.glob(os.path.join(css_dir, '*.css')):
        filename = os.path.basename(filepath)
        if filename not in CSS_ORDER:
            content = read_file(f'css/{filename}')
            css_content.append(f'/* ========== {filename} ========== */')
            css_content.append(content)
            css_content.append('')
            found_count += 1
    
    log(f"   [OK] {found_count} fichiers CSS trouves")
    return '\n'.join(css_content)

def collect_js():
    """Collecte tous les fichiers JS dans l'ordre"""
    js_content = []
    js_dir = os.path.join(BUILD_DIR, 'js')
    js_refactor_dir = os.path.join(BUILD_DIR, 'js-refactor')
    found_count = 0
    missing = []

    # D'abord les fichiers ordonnés depuis js/
    for filename in JS_ORDER:
        filepath = os.path.join(js_dir, filename)
        if os.path.exists(filepath):
            content = read_file(f'js/{filename}')
            js_content.append(f'// ========== {filename} ==========')
            js_content.append(content)
            js_content.append('')
            found_count += 1
        else:
            missing.append(filename)

    # Ensuite les fichiers non listés depuis js/
    extra = []
    for filepath in glob.glob(os.path.join(js_dir, '*.js')):
        filename = os.path.basename(filepath)
        if filename not in JS_ORDER:
            content = read_file(f'js/{filename}')
            js_content.append(f'// ========== {filename} ==========')
            js_content.append(content)
            js_content.append('')
            extra.append(filename)

    # Collecter les fichiers js-refactor/ (triés par nom)
    refactor_files = []
    if os.path.exists(js_refactor_dir):
        for filepath in sorted(glob.glob(os.path.join(js_refactor_dir, '*.js'))):
            filename = os.path.basename(filepath)
            content = read_file(f'js-refactor/{filename}')
            js_content.append(f'// ========== js-refactor/{filename} ==========')
            js_content.append(content)
            js_content.append('')
            refactor_files.append(filename)

        # Collecter les fichiers du sous-dossier arc-board/
        arc_board_dir = os.path.join(js_refactor_dir, 'arc-board')
        if os.path.exists(arc_board_dir):
            for filepath in sorted(glob.glob(os.path.join(arc_board_dir, '*.js'))):
                filename = os.path.basename(filepath)
                content = read_file(f'js-refactor/arc-board/{filename}')
                js_content.append(f'// ========== js-refactor/arc-board/{filename} ==========')
                js_content.append(content)
                js_content.append('')
                refactor_files.append(f'arc-board/{filename}')

        # Collecter les fichiers du sous-dossier import-chapter/
        import_chapter_dir = os.path.join(js_refactor_dir, 'import-chapter')
        if os.path.exists(import_chapter_dir):
            for filepath in sorted(glob.glob(os.path.join(import_chapter_dir, '*.js'))):
                filename = os.path.basename(filepath)
                content = read_file(f'js-refactor/import-chapter/{filename}')
                js_content.append(f'// ========== js-refactor/import-chapter/{filename} ==========')
                js_content.append(content)
                js_content.append('')
                refactor_files.append(f'import-chapter/{filename}')

        # Collecter les fichiers du sous-dossier word-repetition/
        word_repetition_dir = os.path.join(js_refactor_dir, 'word-repetition')
        if os.path.exists(word_repetition_dir):
            for filepath in sorted(glob.glob(os.path.join(word_repetition_dir, '*.js'))):
                filename = os.path.basename(filepath)
                content = read_file(f'js-refactor/word-repetition/{filename}')
                js_content.append(f'// ========== js-refactor/word-repetition/{filename} ==========')
                js_content.append(content)
                js_content.append('')
                refactor_files.append(f'word-repetition/{filename}')

    log(f"   [OK] {found_count} fichiers JS trouves")
    if missing:
        log(f"   [!] {len(missing)} fichiers JS manquants:")
        for f in missing:
            log(f"      - {f}")
    if extra:
        log(f"   [i] {len(extra)} fichiers JS supplementaires:")
        for f in extra:
            log(f"      + {f}")
    if refactor_files:
        log(f"   [i] {len(refactor_files)} fichiers js-refactor/ inclus")

    return '\n'.join(js_content)

def build(output_file='plume-build.html'):
    """Construit le fichier HTML final"""
    global log_handle
    
    # Ouvrir le fichier log
    log_handle = open(LOG_FILE, 'w', encoding='utf-8')
    
    log(f"========================================")
    log(f"Build Plume - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    log(f"========================================")
    log(f"Repertoire de travail: {BUILD_DIR}")
    log(f"Fichier log: {LOG_FILE}")
    log("")
    
    # Vérifier que les dossiers existent
    css_dir = os.path.join(BUILD_DIR, 'css')
    js_dir = os.path.join(BUILD_DIR, 'js')
    html_dir = os.path.join(BUILD_DIR, 'html')
    
    log("--- Verification des dossiers ---")
    for d, name in [(css_dir, 'css'), (js_dir, 'js'), (html_dir, 'html')]:
        if os.path.exists(d):
            files = os.listdir(d)
            log(f"   [OK] {name}/ existe ({len(files)} fichiers)")
        else:
            log(f"   [ERREUR] {name}/ N'EXISTE PAS!")
    log("")
    
    # Lire les templates HTML
    log("--- Lecture des templates HTML ---")
    head = read_file('html/head.html')
    body = read_file('html/body.html')
    footer = read_file('html/footer.html')
    
    if not head:
        log("   [ERREUR] head.html est vide ou manquant!")
    else:
        log(f"   [OK] head.html ({len(head)} caracteres)")
    
    if not body:
        log("   [ERREUR] body.html est vide ou manquant!")
    else:
        log(f"   [OK] body.html ({len(body)} caracteres)")
        
    if not footer:
        log("   [ERREUR] footer.html est vide ou manquant!")
    else:
        log(f"   [OK] footer.html ({len(footer)} caracteres)")
    log("")
    
    # Collecter CSS et JS
    log("--- Collecte CSS ---")
    css = collect_css()
    log(f"   Total: {len(css):,} caracteres")
    log("")
    
    log("--- Collecte JavaScript ---")
    js = collect_js()
    log(f"   Total: {len(js):,} caracteres")
    log("")
    
    # Assembler le fichier
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
    
    # Écrire le fichier
    output_path = os.path.join(BUILD_DIR, 'build', output_file)
    build_dir = os.path.dirname(output_path)
    
    log(f"--- Ecriture du fichier ---")
    log(f"   Dossier cible: {build_dir}")
    
    try:
        os.makedirs(build_dir, exist_ok=True)
        log(f"   [OK] Dossier build/ pret")
    except Exception as e:
        log(f"   [ERREUR] Creation dossier: {e}")
        log_handle.close()
        return None
    
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(output)
        log(f"   [OK] Fichier ecrit: {output_path}")
    except Exception as e:
        log(f"   [ERREUR] Ecriture: {e}")
        log_handle.close()
        return None
    
    # Vérifier que le fichier existe
    if os.path.exists(output_path):
        size = os.path.getsize(output_path)
        log("")
        log(f"========================================")
        log(f"BUILD TERMINE AVEC SUCCES!")
        log(f"========================================")
        log(f"Fichier: {output_path}")
        log(f"Taille: {size:,} octets ({len(output):,} caracteres)")
    else:
        log("")
        log(f"[ERREUR] Le fichier n'a pas ete cree!")
    
    log_handle.close()
    return output_path

if __name__ == "__main__":
    output = 'plume-build.html'
    if len(sys.argv) > 2 and sys.argv[1] == '--output':
        output = sys.argv[2]
    
    try:
        build(output)
    except Exception as e:
        # En cas d'erreur, écrire dans le log
        with open(LOG_FILE, 'a', encoding='utf-8') as f:
            f.write(f"\n[ERREUR FATALE] {e}\n")
            import traceback
            f.write(traceback.format_exc())
        raise
