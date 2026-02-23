#!/usr/bin/env python3
"""
Script de déploiement PRODUCTION vers /live
Basé sur deploy-to-live-smart.py, mais désactive les raccourcis d'administration :
- Ctrl + Alt + A (Menu Admin / Customizer)
- Ctrl + Alt + T (Éditeur de Product Tour)
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
LOG_FILE = os.path.join(BUILD_DIR, 'deploy-production.log')

# Fichier log global
log_handle = None

def log(message):
    """Écrit un message dans la console ET dans le fichier log"""
    print(message)
    if log_handle:
        log_handle.write(message + '\n')
        log_handle.flush()

def get_file_hash(filepath):
    """Calcule le hash MD5 d'un fichier"""
    hash_md5 = hashlib.md5()
    try:
        with open(filepath, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()
    except Exception:
        return None

def file_has_changed(src_path, dest_full_path):
    """Détermine si le fichier a changé"""
    if not os.path.exists(dest_full_path):
        return True
    
    # Pour la production, on force le changement sur les fichiers patchés 
    # pour être sûr qu'ils sont bien "nettoyés" même si le script a été relancé
    filename = os.path.basename(src_path)
    if filename in ["interface-customizer.view.js", "product-tour.editor.view.js"]:
        return True

    if os.path.getsize(src_path) != os.path.getsize(dest_full_path):
        return True
    
    src_mtime = os.path.getmtime(src_path)
    dest_mtime = os.path.getmtime(dest_full_path)
    
    if abs(src_mtime - dest_mtime) > 0.01:
        src_hash = get_file_hash(src_path)
        dest_hash = get_file_hash(dest_full_path)
        return src_hash != dest_hash
        
    return False

def apply_production_patches(content, filename):
    """Désactive les raccourcis admin dans le contenu JS"""
    patched = False
    
    if "interface-customizer.view.js" in filename:
        # Désactiver Ctrl + Alt + A
        old_str = "if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'a')"
        new_str = "if (false && e.ctrlKey && e.altKey && e.key.toLowerCase() === 'a')"
        if old_str in content:
            content = content.replace(old_str, new_str)
            patched = True
            log(f"   [PATCH] Ctrl+Alt+A désactivé dans {filename}")
            
    elif "product-tour.editor.view.js" in filename:
        # Désactiver Ctrl + Alt + T
        old_str = "if (e.ctrlKey && e.altKey && e.key === 't')"
        new_str = "if (false && e.ctrlKey && e.altKey && e.key === 't')"
        if old_str in content:
            content = content.replace(old_str, new_str)
            patched = True
            log(f"   [PATCH] Ctrl+Alt+T désactivé dans {filename}")
            
    return content, patched

def get_all_files_to_deploy():
    """Retourne la liste complète des fichiers à déployer (identique au script original)"""
    files = []
    
    # Doc
    doc_path = os.path.join(BUILD_DIR, 'doc')
    if os.path.exists(doc_path):
        for root, dirs, filenames in os.walk(doc_path):
            for filename in filenames:
                full_path = os.path.join(root, filename)
                rel_path = os.path.relpath(full_path, BUILD_DIR)
                files.append(rel_path.replace('\\', '/'))

    # Demo
    demo_path = os.path.join(BUILD_DIR, 'demo')
    if os.path.exists(demo_path):
        for root, dirs, filenames in os.walk(demo_path):
            for filename in filenames:
                full_path = os.path.join(root, filename)
                rel_path = os.path.relpath(full_path, BUILD_DIR)
                files.append(rel_path.replace('\\', '/'))

    # CSS
    processed_css = set()
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
    
    for css_path in MODULE_CSS_FILES:
        files.append(css_path)
        processed_css.add(os.path.basename(css_path))
        
    css_dir = os.path.join(BUILD_DIR, 'css')
    for filepath in glob.glob(os.path.join(css_dir, '*.css')):
        filename = os.path.basename(filepath)
        if filename not in processed_css and filename != '11.storygrid.css':
            files.append(f'css/{filename}')
            processed_css.add(filename)
    
    # JS
    processed_js = set()
    for js_file in JS_ORDER:
        if js_file.startswith('vendor/') or js_file.startswith('js/'):
            rel_path = js_file
        else:
            rel_path = f'js/{js_file}'
        files.append(rel_path)
        processed_js.add(os.path.basename(js_file))
    
    js_root = os.path.join(BUILD_DIR, 'js')
    for root, dirs, filenames in os.walk(js_root):
        if 'demo' in root.split(os.sep): continue
        for filename in filenames:
            if not filename.endswith('.js'): continue
            filepath = os.path.join(root, filename)
            rel_path = os.path.relpath(filepath, BUILD_DIR).replace('\\', '/')
            if (rel_path not in files and 
                filename not in processed_js and 
                filename not in IGNORED_ORIGINALS and
                not filename.startswith('_')):
                files.append(rel_path)
                processed_js.add(filename)
    
    files.append('landing.html')
    return files

def get_dest_path(file_path):
    """Détermine le chemin de destination pour un fichier donné dans /live"""
    if file_path.startswith('doc/') or file_path.startswith('demo/'):
         return file_path
    if file_path.endswith('.css'):
        return os.path.join('css', os.path.basename(file_path))
    if file_path.endswith('.js'):
        if file_path.startswith('vendor/'):
             return os.path.join('js', file_path) 
        elif file_path.startswith('js/'):
             return os.path.join('js', file_path.replace('js/', '')) 
        else:
             return os.path.join('js', file_path)
    if file_path.startswith('html/'):
         return file_path
    if file_path == 'landing.html':
        return 'index.html'
    return file_path

def copy_and_patch_file(src_path, dest_rel_path):
    """Copie et applique les patchs de production si nécessaire"""
    try:
        dest_rel_path = dest_rel_path.replace('/', os.sep).replace('\\', os.sep)
        dest_full_path = os.path.join(LIVE_DIR, dest_rel_path)
        
        dest_dir = os.path.dirname(dest_full_path)
        if dest_dir:
            os.makedirs(dest_dir, exist_ok=True)
        
        filename = os.path.basename(src_path)
        if filename.endswith('.js'):
            with open(src_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            patched_content, was_patched = apply_production_patches(content, filename)
            
            with open(dest_full_path, 'w', encoding='utf-8') as f:
                f.write(patched_content)
            
            # Note: on ne peut pas utiliser shutil.copy2 pour préserver le mtime 
            # si on a modifié le contenu, mais c'est voulu ici.
            return True
        else:
            shutil.copy2(src_path, dest_full_path)
            return True
    except Exception as e:
        log(f"   [ERREUR] Impossible de traiter {src_path}: {e}")
        return False

def deploy():
    """Déploie en mode PRODUCTION"""
    global log_handle
    log_handle = open(LOG_FILE, 'w', encoding='utf-8')
    
    log(f"========================================")
    log(f"DÉPLOIEMENT PRODUCTION (Raccourcis Admin OFF)")
    log(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    log(f"========================================")
    
    os.makedirs(LIVE_DIR, exist_ok=True)
    files_to_deploy = get_all_files_to_deploy()
    
    copied = 0
    skipped = 0
    errors = 0
    
    for file_path in files_to_deploy:
        src_path = os.path.join(BUILD_DIR, file_path)
        dest_rel_path = get_dest_path(file_path)
        dest_full_path = os.path.join(LIVE_DIR, dest_rel_path.replace('/', os.sep).replace('\\', os.sep))
        
        if not os.path.exists(src_path): continue
        
        if file_has_changed(src_path, dest_full_path):
            if copy_and_patch_file(src_path, dest_rel_path):
                log(f"   [COPIE] {file_path} -> {dest_rel_path}")
                copied += 1
            else:
                errors += 1
        else:
            skipped += 1
    
    log(f"\nRésumé: {copied} copiés, {skipped} sautés, {errors} erreurs.")
    
    # Régénération index
    log(f"--- Régénération de index.html ---")
    import subprocess
    gen_script = os.path.join(BUILD_DIR, 'generate_live_index.py')
    subprocess.run([sys.executable, gen_script], cwd=BUILD_DIR)
    
    log_handle.close()
    return errors == 0

if __name__ == "__main__":
    success = deploy()
    sys.exit(0 if success else 1)
