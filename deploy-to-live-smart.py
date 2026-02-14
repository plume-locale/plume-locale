#!/usr/bin/env python3
"""
Script de déploiement INTELLIGENT vers /live
Copie seulement les fichiers modifiés depuis le dernier déploiement.
Vérifie la taille et la date de modification des fichiers.
Usage: python3 deploy-to-live-smart.py
"""

import os
import sys
import shutil
import glob
import hashlib
from datetime import datetime

# Importer les listes depuis build_config.py
try:
    from build_config import CSS_ORDER, JS_ORDER, MODULE_CSS_FILES, IGNORED_ORIGINALS
except ImportError:
    print("ERREUR: build_config.py introuvable.")
    sys.exit(1)

BUILD_DIR = os.path.dirname(os.path.abspath(__file__))
LIVE_DIR = os.path.join(BUILD_DIR, 'live')
LOG_FILE = os.path.join(BUILD_DIR, 'deploy-smart.log')

# Fichier log global
log_handle = None

def log(message):
    """Écrit un message dans la console ET dans le fichier log"""
    print(message)
    if log_handle:
        log_handle.write(message + '\n')
        log_handle.flush()

def get_file_hash(filepath):
    """Calcule le hash MD5 d'un fichier pour une comparaison précise"""
    hash_md5 = hashlib.md5()
    try:
        with open(filepath, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()
    except Exception:
        return None

def file_has_changed(src_path, dest_full_path):
    """
    Détermine si le fichier a changé.
    1. Si la destination n'existe pas -> Changé
    2. Si la taille diffère -> Changé
    3. Si le mtime diffère ET le hash MD5 diffère -> Changé
    (On vérifie le hash seulement si le mtime est différent pour gagner du temps)
    """
    if not os.path.exists(dest_full_path):
        return True
    
    # Vérification rapide : taille
    if os.path.getsize(src_path) != os.path.getsize(dest_full_path):
        return True
    
    # Vérification mtime
    # Note: shutil.copy2 préserve le mtime, donc ils devraient être identiques si non modifiés
    src_mtime = os.path.getmtime(src_path)
    dest_mtime = os.path.getmtime(dest_full_path)
    
    # Si le mtime est différent, on fait une vérification de contenu (hash) pour être sûr
    if abs(src_mtime - dest_mtime) > 0.01: # Marge pour les arrondis de certains systèmes de fichiers
        src_hash = get_file_hash(src_path)
        dest_hash = get_file_hash(dest_full_path)
        return src_hash != dest_hash
        
    return False

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
            rel_path = css_file.replace('../', '')
        elif css_file.startswith('js/'):
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
        
    # Extra CSS (loose files)
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
        processed_js.add(os.path.basename(js_file))
    
    # Extra JS (loose files)
    js_root = os.path.join(BUILD_DIR, 'js')
    for root, dirs, filenames in os.walk(js_root):
        if 'demo' in root.split(os.sep): 
             continue
             
        for filename in filenames:
            if not filename.endswith('.js'):
                continue
                
            filepath = os.path.join(root, filename)
            rel_path = os.path.relpath(filepath, BUILD_DIR).replace('\\', '/')
            
            if (rel_path not in files and 
                filename not in processed_js and 
                filename not in IGNORED_ORIGINALS and
                not filename.startswith('_') and
                'thriller' not in filename.lower() and
                'storygrid' not in filename.lower()):
                
                files.append(rel_path)
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
             return os.path.join('js', file_path) 
        elif file_path.startswith('js/'):
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
        dest_rel_path = dest_rel_path.replace('/', os.sep).replace('\\', os.sep)
        dest_full_path = os.path.join(LIVE_DIR, dest_rel_path)
        
        dest_dir = os.path.dirname(dest_full_path)
        if dest_dir:
            os.makedirs(dest_dir, exist_ok=True)
        
        shutil.copy2(src_path, dest_full_path)
        return True
    except Exception as e:
        log(f"   [ERREUR] Impossible de copier {src_path} vers {dest_rel_path}: {e}")
        return False

def deploy():
    """Déploie intelligemment les fichiers vers le répertoire /live"""
    global log_handle
    
    log_handle = open(LOG_FILE, 'w', encoding='utf-8')
    
    log(f"========================================")
    log(f"DÉPLOIEMENT INTELLIGENT VERS /LIVE")
    log(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    log(f"========================================")
    log(f"Répertoire source: {BUILD_DIR}")
    log(f"Répertoire cible: {LIVE_DIR}")
    log("")
    
    # Destruction de index.html à la racine (si présent)
    root_index = os.path.join(BUILD_DIR, 'index.html')
    if os.path.exists(root_index):
        try:
            os.remove(root_index)
            log(f"--- [OK] index.html supprimé de la racine ---")
        except Exception as e:
            log(f"--- [ERREUR] Impossible de supprimer index.html: {e} ---")

    # Créer le répertoire /live s'il n'existe pas
    os.makedirs(LIVE_DIR, exist_ok=True)
    
    files_to_deploy = get_all_files_to_deploy()
    
    copied_count = 0
    skipped_count = 0
    missing_count = 0
    error_count = 0
    
    log(f"--- Analyse de {len(files_to_deploy)} fichiers ---")
    
    for file_path in files_to_deploy:
        src_path = os.path.join(BUILD_DIR, file_path)
        dest_rel_path = get_dest_path(file_path)
        dest_full_path = os.path.join(LIVE_DIR, dest_rel_path.replace('/', os.sep).replace('\\', os.sep))
        
        if not os.path.exists(src_path):
            log(f"   [!] Fichier source manquant: {file_path}")
            missing_count += 1
            continue
        
        if file_has_changed(src_path, dest_full_path):
            if copy_file(src_path, dest_rel_path):
                log(f"   [COPIE] {file_path} -> {dest_rel_path}")
                copied_count += 1
            else:
                error_count += 1
        else:
            skipped_count += 1
    
    log("")
    log(f"========================================")
    log(f"RÉSUMÉ")
    log(f"========================================")
    log(f"Fichiers copiés: {copied_count}")
    log(f"Fichiers inchangés (sautés): {skipped_count}")
    log(f"Fichiers manquants: {missing_count}")
    log(f"Erreurs: {error_count}")
    log(f"Total traité: {len(files_to_deploy)} fichiers")
    log("")
    
    # Toujours regénérer l'index si des fichiers ont changé
    if copied_count > 0 or not os.path.exists(os.path.join(LIVE_DIR, 'index.html')):
        log(f"--- Régénération de index.html ---")
        try:
            import subprocess
            gen_script = os.path.join(BUILD_DIR, 'generate_live_index.py')
            result = subprocess.run([sys.executable, gen_script], 
                                   cwd=BUILD_DIR, 
                                   capture_output=True, 
                                   text=True)
            if result.returncode == 0:
                log(f"   [OK] index.html mis à jour")
            else:
                log(f"   [ERREUR] Échec de la génération: {result.stderr or result.stdout}")
                error_count += 1
        except Exception as e:
            log(f"   [ERREUR] Exception lors de la génération: {e}")
            error_count += 1
    else:
        log(f"--- index.html est déjà à jour ---")
        
    log_handle.close()
    return error_count == 0

if __name__ == "__main__":
    success = deploy()
    sys.exit(0 if success else 1)
