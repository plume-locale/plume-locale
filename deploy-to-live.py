#!/usr/bin/env python3
"""
Script de déploiement vers /live
Copie tous les fichiers nécessaires listés dans build_config.py vers le répertoire /live
Usage: python3 deploy-to-live.py
"""

import os
import sys
import shutil
from datetime import datetime

# Importer les listes depuis build_config.py
try:
    from build_config import CSS_ORDER, JS_ORDER, MODULE_CSS_FILES
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
    
    # Ajouter les fichiers du dossier doc
    doc_path = os.path.join(BUILD_DIR, 'doc')
    if os.path.exists(doc_path):
        for root, dirs, filenames in os.walk(doc_path):
            for filename in filenames:
                full_path = os.path.join(root, filename)
                rel_path = os.path.relpath(full_path, BUILD_DIR)
                files.append(rel_path.replace('\\', '/'))

    # Ajouter les fichiers CSS
    for css_file in CSS_ORDER:
        if css_file.startswith('../vendor/'):
            # Vendor CSS files
            files.append(css_file.replace('../', ''))
        elif css_file.startswith('js/'):
             # Module CSS files (already relative path)
             files.append(css_file)
        elif css_file == 'undo-redo.css':
             files.append(f'css/{css_file}')
        else:
            files.append(f'css/{css_file}')
    
    # Ajouter les CSS des modules
    files.extend(MODULE_CSS_FILES)
    
    # Ajouter les fichiers JS
    for js_file in JS_ORDER:
        if js_file.startswith('vendor/') or js_file.startswith('js/'):
            files.append(js_file)
        else:
            files.append(f'js/{js_file}')
    
    return files

def get_dest_path(file_path):
    """Détermine le chemin de destination pour un fichier donné dans /live"""
    # DOC
    if file_path.startswith('doc/'):
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
             # Logic from old script: file_path.replace('js/', '')
             return os.path.join('js', file_path.replace('js/', '')) 
        else:
             return os.path.join('js', file_path)
             
    # HTML
    if file_path.startswith('html/'):
         return file_path
         
    return file_path

def copy_file(src_path, dest_rel_path):
    """Copie un fichier vers son emplacement calculé dans /live"""
    try:
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
