#!/usr/bin/env python3
"""
Script de déploiement INTELLIGENT vers /live
Copie seulement les fichiers modifiés depuis le dernier déploiement.
Vérifie la taille et la date de modification des fichiers.
Supprime automatiquement les fichiers/dossiers orphelins dans /live
(présents dans /live mais dont la source a été supprimée).
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
    
    files.append('html/index.html')
    files.append('html/index-translations.js')

    
    return files

def get_dest_path(file_path):
    """Détermine le chemin de destination pour un fichier donné dans /live"""
    # DOC & DEMO
    if file_path.startswith('doc/') or file_path.startswith('demo/'):
         return file_path

    # Landing page -> index.html (New version)
    if file_path == 'html/index.html':
        return 'index.html'

    # Landing page translations -> directly in /live
    if file_path == 'html/index-translations.js':
        return 'index-translations.js'


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
         
    return file_path

# Files/dirs that must never be deleted from /live even if not in the deploy list
PROTECTED_LIVE_PATHS = {
    'app.html',
    'index.html',
    'index-translations.js',
}

def cleanup_orphans(expected_dest_paths):
    """
    Supprime les fichiers présents dans /live qui ne font plus partie
    du déploiement (fichiers supprimés côté source).
    
    :param expected_dest_paths: set de chemins RELATIFS attendus dans /live
                                (ex: 'js/core/00.app.view.js', 'css/mobile.css')
    """
    if not os.path.exists(LIVE_DIR):
        return 0, 0

    deleted_files = 0
    deleted_dirs = 0

    # 1. Supprimer les fichiers orphelins
    for root, dirs, files in os.walk(LIVE_DIR, topdown=False):
        # Ignorer les dossiers protégés (demo/, doc/)
        rel_root = os.path.relpath(root, LIVE_DIR).replace('\\', '/')
        if rel_root.startswith('demo') or rel_root.startswith('doc'):
            continue
        
        for filename in files:
            full_path = os.path.join(root, filename)
            rel_path = os.path.relpath(full_path, LIVE_DIR).replace('\\', '/')
            
            # Ne jamais supprimer les fichiers protégés
            if rel_path in PROTECTED_LIVE_PATHS or filename in PROTECTED_LIVE_PATHS:
                continue
            
            # Supprimer si pas dans les chemins attendus
            if rel_path not in expected_dest_paths:
                try:
                    os.remove(full_path)
                    log(f"   [SUPPRIME] {rel_path}")
                    deleted_files += 1
                except Exception as e:
                    log(f"   [ERREUR] Impossible de supprimer {rel_path}: {e}")

    # 2. Supprimer les dossiers vides (après suppression des fichiers)
    for root, dirs, files in os.walk(LIVE_DIR, topdown=False):
        rel_root = os.path.relpath(root, LIVE_DIR).replace('\\', '/')
        # Ne pas supprimer la racine /live ni les dossiers protégés
        if rel_root in ('.', 'demo', 'doc'):
            continue
        if rel_root.startswith('demo/') or rel_root.startswith('doc/'):
            continue
        
        try:
            # os.rmdir ne supprime que les dossiers vides
            os.rmdir(root)
            log(f"   [DOSSIER VIDE SUPPRIME] {rel_root}/")
            deleted_dirs += 1
        except OSError:
            # Dossier non vide -> normal, on ignore
            pass

    return deleted_files, deleted_dirs

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
    
    # --- Nettoyage des fichiers orphelins dans /live ---
    log("")
    log(f"--- Nettoyage des fichiers orphelins dans /live ---")
    
    # Construire l'ensemble des chemins de destination attendus
    expected_live_paths = set()
    for file_path in files_to_deploy:
        dest_rel = get_dest_path(file_path)
        dest_rel = dest_rel.replace('\\', '/')
        expected_live_paths.add(dest_rel)
    
    deleted_f, deleted_d = cleanup_orphans(expected_live_paths)
    if deleted_f == 0 and deleted_d == 0:
        log(f"   [OK] Aucun fichier orphelin trouvé")
    else:
        log(f"   [OK] {deleted_f} fichier(s) et {deleted_d} dossier(s) vide(s) supprimés")

    # Toujours regénérer l'index si des fichiers ont changé,
    # OU si l'index n'existe pas,
    # OU si html/body.html a changé (car il n'est pas copié mais injecté)
    force_regen = False
    body_src = os.path.join(BUILD_DIR, 'html/body.html')
    app_target = os.path.join(LIVE_DIR, 'app.html')
    if os.path.exists(body_src) and file_has_changed(body_src, app_target):
        force_regen = True

    if copied_count > 0 or deleted_f > 0 or not os.path.exists(os.path.join(LIVE_DIR, 'app.html')) or force_regen:
        log(f"--- Régénération de app.html ---")
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
