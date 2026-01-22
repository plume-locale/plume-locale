#!/usr/bin/env python3
"""
Script de build Plume TEST
Reconstruit le fichier HTML en utilisant les fichiers refactorisés de js-refactor/
Usage: python3 build.test.py [--output fichier.html]
"""

import os
import sys
import glob
from datetime import datetime

BUILD_DIR = os.path.dirname(os.path.abspath(__file__))
LOG_FILE = os.path.join(BUILD_DIR, 'build.test.log')

# Fichier log global
log_handle = None

def log(message):
    """Écrit un message dans la console ET dans le fichier log"""
    print(message)
    if log_handle:
        log_handle.write(message + '\n')
        log_handle.flush()

# Ordre des fichiers CSS (identique à build-timestamp.py)
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

# Ordre des fichiers JS - MODIFIÉ pour js-refactor
JS_ORDER = [
    '01.app.js',
    '02.storage.js',
    'js-refactor/03.projects.refactor.js',
    '04.init.js',
    '05.undo-redo.js',
    'js-refactor/06.structure.model.js',
    'js-refactor/06.structure.repository.js',
    'js-refactor/06.structure.viewmodel.js',
    'js-refactor/00.app.view.js',
    'js-refactor/06.structure.view.js',
    'js-refactor/06.structure.helpers.js',
    'js-refactor/07.stats.refactor.js',
    '08.auto-detect.js',
    '09.floating-editor.js',
    '10.colorpalette.js',
    '11.updateStats.js',
    '12.import-export.js',
    '13.mobile-menu.js',
    '14.dragndrop-acts.js',
    'js-refactor/15.characters.model.js',
    'js-refactor/15.characters.repository.js',
    'js-refactor/15.characters.viewmodel.js',
    'js-refactor/15.characters.view.js',
    'js-refactor/16.split-view.js',
    'js-refactor/17.world.model.js',
    'js-refactor/17.world.repository.js',
    'js-refactor/17.world.viewmodel.js',
    'js-refactor/17.world.view.js',
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
    '45.arc-board.js'
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

# Fichiers originaux à ignorer (car remplacés par js-refactor)
IGNORED_ORIGINALS = [
    '03.project.js',
    '06.structure.js',
    '07.stats.js',
    '15.characters.js',
    '17.world.js'
]

def collect_js():
    """Collecte tous les fichiers JS dans l'ordre - VERSION REFACTORISÉE"""
    js_content = []
    found_count = 0
    missing = []
    
    # D'abord les fichiers ordonnés
    for filename in JS_ORDER:
        # Déterminer le chemin complet
        if filename.startswith('js-refactor/'):
            # Fichier dans js-refactor/
            filepath = os.path.join(BUILD_DIR, filename)
        else:
            # Fichier dans js/
            filepath = os.path.join(BUILD_DIR, 'js', filename)
        
        if os.path.exists(filepath):
            # Lire le fichier avec le bon chemin relatif
            if filename.startswith('js-refactor/'):
                content = read_file(filename)
            else:
                content = read_file(f'js/{filename}')
            
            js_content.append(f'// ========== {filename} ==========')
            js_content.append(content)
            js_content.append('')
            found_count += 1
        else:
            missing.append(filename)
    
    # Ensuite les fichiers non listés dans js/ (pas js-refactor/)
    js_dir = os.path.join(BUILD_DIR, 'js')
    extra = []
    for filepath in glob.glob(os.path.join(js_dir, '*.js')):
        filename = os.path.basename(filepath)
        # Vérifier que ce fichier n'est pas déjà dans JS_ORDER et n'est pas ignoré
        if (filename not in JS_ORDER and 
            f'js-refactor/{filename}' not in JS_ORDER and 
            filename not in IGNORED_ORIGINALS):
            content = read_file(f'js/{filename}')
            js_content.append(f'// ========== {filename} ==========')
            js_content.append(content)
            js_content.append('')
            extra.append(filename)
    
    log(f"   [OK] {found_count} fichiers JS trouves")
    if missing:
        log(f"   [!] {len(missing)} fichiers JS manquants:")
        for f in missing:
            log(f"      - {f}")
    if extra:
        log(f"   [i] {len(extra)} fichiers JS supplementaires:")
        for f in extra:
            log(f"      + {f}")
    
    return '\n'.join(js_content)

def build(output_file=None):
    """Construit le fichier HTML final"""
    global log_handle
    
    # Ouvrir le fichier log
    log_handle = open(LOG_FILE, 'w', encoding='utf-8')
    
    log(f"========================================")
    log(f"Build Plume TEST - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    log(f"========================================")
    log(f"Repertoire de travail: {BUILD_DIR}")
    log(f"Fichier log: {LOG_FILE}")
    log(f"UTILISE LES FICHIERS REFACTORISES DE js-refactor/")
    log("")
    
    # Vérifier que les dossiers existent
    css_dir = os.path.join(BUILD_DIR, 'css')
    js_dir = os.path.join(BUILD_DIR, 'js')
    js_refactor_dir = os.path.join(BUILD_DIR, 'js-refactor')
    html_dir = os.path.join(BUILD_DIR, 'html')
    
    log("--- Verification des dossiers ---")
    for d, name in [(css_dir, 'css'), (js_dir, 'js'), (js_refactor_dir, 'js-refactor'), (html_dir, 'html')]:
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
    
    log("--- Collecte JavaScript (VERSION REFACTORISEE) ---")
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
        log(f"BUILD TEST TERMINE AVEC SUCCES!")
        log(f"========================================")
        log(f"Fichier: {output_path}")
        log(f"Taille: {size:,} octets ({len(output):,} caracteres)")
    else:
        log("")
        log(f"[ERREUR] Le fichier n'a pas ete cree!")
    
    log_handle.close()
    return output_path

if __name__ == "__main__":
    
    # Récupérer la date/heure actuelle au format YYYY.MM.DD.HH.MM
    timestamp = datetime.now().strftime('%Y.%m.%d.%H.%M')
    
    # Nom de fichier par défaut avec horodatage
    default_output = f'plume-build-test-{timestamp}.html'
    
    # Déterminer le nom de fichier de sortie
    output = default_output
    
    # Vérifier si l'utilisateur a fourni un nom de fichier via l'argument --output
    if len(sys.argv) > 2 and sys.argv[1] == '--output':
        # Utiliser le nom fourni par l'utilisateur
        output = sys.argv[2]
        
    # La fonction log n'est pas encore initialisée ici, on utilise print
    print(f"Fichier de sortie déterminé: {output}") 
        
    try:
        # Appeler la fonction build avec le nom de fichier déterminé
        build(output)
    except Exception as e:
        # En cas d'erreur, écrire dans le log
        with open(LOG_FILE, 'a', encoding='utf-8') as f:
            f.write(f"\n[ERREUR FATALE] {e}\n")
            import traceback
            f.write(traceback.format_exc())
        sys.exit(1)
