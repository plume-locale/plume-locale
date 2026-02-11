#!/usr/bin/env python3
"""
Script de déploiement vers /live
Copie tous les fichiers nécessaires listés dans build_config.py vers le répertoire /live
Usage: python3 deploy-to-live.py
"""

import os
import sys
import shutil
import glob
import re
from datetime import datetime

# Importer les listes depuis build_config.py
try:
    from build_config import CSS_ORDER, JS_ORDER, MODULE_CSS_FILES, IGNORED_ORIGINALS
except ImportError:
    print("ERREUR: build_config.py introuvable.")
    sys.exit(1)

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

def get_all_files_to_deploy():
    """Retourne la liste complète des fichiers à déployer"""
    files = []
    
    # 1. Ajouter les fichiers du dossier doc
    doc_path = os.path.join(BUILD_DIR, 'doc')
    if os.path.exists(doc_path):
        for root, dirs, filenames in os.walk(doc_path):
            for filename in filenames:
                full_path = os.path.join(root, filename)
                rel_path = os.path.relpath(full_path, BUILD_DIR)
                files.append(rel_path.replace('\\', '/'))

    # 1b. Ajouter les fichiers du dossier demo
    demo_path = os.path.join(BUILD_DIR, 'demo')
    if os.path.exists(demo_path):
        for root, dirs, filenames in os.walk(demo_path):
            for filename in filenames:
                full_path = os.path.join(root, filename)
                rel_path = os.path.relpath(full_path, BUILD_DIR)
                files.append(rel_path.replace('\\', '/'))


    # 2. Ajouter les fichiers CSS
    processed_css = set()
    
    # CSS_ORDER
    for css_file in CSS_ORDER:
        if css_file.startswith('../vendor/'):
            # Vendor CSS files
            rel_path = css_file.replace('../', '')
        elif css_file.startswith('js/'):
             # Module CSS files (already relative path)
             rel_path = css_file
        elif css_file == 'undo-redo.css':
             rel_path = f'css/{css_file}'
        else:
            rel_path = f'css/{css_file}'
        
        files.append(rel_path)
        processed_css.add(os.path.basename(rel_path))
    
    # MODULE_CSS_FILES
    for css_path in MODULE_CSS_FILES:
        files.append(css_path)
        processed_css.add(os.path.basename(css_path))
        
    # Extra CSS (loose files) - logic from build.light.py
    css_dir = os.path.join(BUILD_DIR, 'css')
    for filepath in glob.glob(os.path.join(css_dir, '*.css')):
        filename = os.path.basename(filepath)
        if filename not in processed_css and filename != '11.storygrid.css':
            files.append(f'css/{filename}')
            processed_css.add(filename)
    
    # 3. Ajouter les fichiers JS
    processed_js = set()
    
    # JS_ORDER
    for js_file in JS_ORDER:
        if js_file.startswith('vendor/') or js_file.startswith('js/'):
            rel_path = js_file
        else:
            rel_path = f'js/{js_file}'
        
        files.append(rel_path)
        processed_js.add(os.path.basename(rel_path))
    
    # Extra JS (loose files) - logic from build.light.py
    js_dir = os.path.join(BUILD_DIR, 'js')
    for filepath in glob.glob(os.path.join(js_dir, '*.js')):
        filename = os.path.basename(filepath)
        
        if (filename not in processed_js and 
            filename not in IGNORED_ORIGINALS and
            not filename.startswith('_') and
            'thriller' not in filename.lower() and
            'storygrid' not in filename.lower()):
            
            files.append(f'js/{filename}')
            processed_js.add(filename)
    
    files.append('landing.html')
    
    return files

def get_dest_path(file_path):
    """Détermine le chemin de destination pour un fichier donné dans /live"""
    # DOC & DEMO
    if file_path.startswith('doc/') or file_path.startswith('demo/'):
         return file_path

    # CSS -> live/css/filename.css (flattened)
    if file_path.endswith('.css'):
        return os.path.join('css', os.path.basename(file_path))
    
    # JS -> live/js/...
    if file_path.endswith('.js'):
        if file_path.startswith('vendor/'):
             return os.path.join('js', file_path) # js/vendor/...
        elif file_path.startswith('js/'):
             # Merging js/ and js-refactor/ if they existed, but here we just strip one level if needed
             return os.path.join('js', file_path.replace('js/', '')) 
        else:
             return os.path.join('js', file_path)
             
    # HTML
    if file_path.startswith('html/'):
         return file_path
    
    # Landing page -> index.html
    if file_path == 'landing.html':
        return 'index.html'
         
    return file_path

def copy_file(src_path, dest_rel_path):
    """Copie un fichier vers son emplacement calculé dans /live"""
    try:
        # Normaliser le chemin pour l'OS actuel
        dest_rel_path = dest_rel_path.replace('/', os.sep).replace('\\', os.sep)
        dest_full_path = os.path.join(LIVE_DIR, dest_rel_path)
        
        # Créer le répertoire de destination
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
    
    # DESTROY index.html at root (explicit requirement)
    root_index = os.path.join(BUILD_DIR, 'index.html')
    if os.path.exists(root_index):
        log(f"--- Destruction de index.html à la racine ---")
        try:
            os.remove(root_index)
            log(f"   [OK] index.html supprimé de la racine")
        except Exception as e:
            log(f"   [ERREUR] Impossible de supprimer index.html: {e}")

    # Créer le répertoire /live s'il n'existe pas
    if os.path.exists(LIVE_DIR):
        log(f"--- Nettoyage du répertoire /live existant ---")
        try:
            # Sur Windows, rmtree peut échouer si des fichiers sont ouverts ou indexés.
            # On essaie une approche plus permissive.
            import time
            def remove_readonly(func, path, excinfo):
                import os, stat
                os.chmod(path, stat.S_IWRITE)
                func(path)

            for i in range(3):
                try:
                    shutil.rmtree(LIVE_DIR, onerror=remove_readonly)
                    log(f"   [OK] Répertoire /live supprimé (tentative {i+1})")
                    break
                except Exception as e:
                    if i == 2: # Dernière tentative
                        log(f"   [ATTENTION] Impossible de supprimer complètement /live: {e}. On continue quand même...")
                    else:
                        time.sleep(1)
        except Exception as e:
            log(f"   [ATTENTION] Erreur lors du nettoyage de /live: {e}")
    
    log(f"--- Création/Vérification du répertoire /live ---")
    try:
        os.makedirs(LIVE_DIR, exist_ok=True)
        log(f"   [OK] Répertoire /live créé")
    except Exception as e:
        log(f"   [ERREUR] Impossible de créer /live: {e}")
        log_handle.close()
        return False
    
    log("")
    log(f"--- Copie des fichiers ---")
    
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
    log(f"DÉPLOIEMENT TERMINÉ")
    log(f"========================================")
    log(f"Fichiers copiés: {copied_count}")
    log(f"Fichiers manquants: {missing_count}")
    log(f"Erreurs: {error_count}")
    log(f"Total: {len(files_to_deploy)} fichiers")
    log("")
    
    # Generate index.html explicitly after deployment
    log(f"--- Génération de index.html ---")
    try:
        import subprocess
        gen_script = os.path.join(BUILD_DIR, 'generate_live_index.py')
        # Run with absolute path and specific CWD
        result = subprocess.run([sys.executable, gen_script], 
                               cwd=BUILD_DIR, 
                               capture_output=True, 
                               text=True)
        if result.returncode == 0:
            log(f"   [OK] index.html généré avec succès")
        else:
            # Try to log output for debugging
            log(f"   [ERREUR] Échec de la génération: {result.stderr or result.stdout}")
            error_count += 1
    except Exception as e:
        log(f"   [ERREUR] Exception lors de la génération: {e}")
        error_count += 1
        
    log_handle.close()
    return error_count == 0

if __name__ == "__main__":
    success = deploy()
    sys.exit(0 if success else 1)

