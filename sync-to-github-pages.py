#!/usr/bin/env python3
"""
Script de synchronisation de /live vers /plume-locale.github.io (GitHub Pages)
Auteur: Plume Locale Sync Utility

Ce script :
1. Analyse le dossier /live (source) et le dossier /plume-locale.github.io (destination).
2. Copie les fichiers nouveaux ou modifiés de /live vers la destination.
3. Supprime les fichiers dans la destination qui ne sont plus présents dans /live.
4. Préserve les fichiers essentiels au dépôt GitHub (.git, .gitignore, README.md, LICENSE, CNAME, img/).

Usage: python sync-to-github-pages.py
"""

import os
import sys
import shutil
import hashlib
from datetime import datetime

# Configuration des chemins
# Le script est supposé être dans /plume-locale
PLUME_DIR = os.path.dirname(os.path.abspath(__file__))
SOURCE_DIR = os.path.join(PLUME_DIR, 'live')
# Le dossier .github.io est un dossier frère de /plume-locale
GITHUB_REPO_DIR = os.path.join(os.path.dirname(PLUME_DIR), 'plume-locale.github.io')
LOG_FILE = os.path.join(PLUME_DIR, 'sync-github-pages.log')

# Fichiers et dossiers à NE JAMAIS SUPPRIMER dans la destination
# (Chemins relatifs à la racine du dépôt GitHub)
PROTECTED_PATHS = {
    '.git',
    '.github',
    '.gitignore',
    'README.md',
    'LICENSE',
    'CNAME',
    'img',  # Screenshots et assets du dépôt
    'sync-github-pages.log',
    '.nojekyll'
}

log_handle = None

def log(message):
    """Écrit un message dans la console et dans le fichier log"""
    print(message)
    if log_handle:
        log_handle.write(message + '\n')
        log_handle.flush()

def get_file_hash(filepath):
    """Calcule le hash MD5 d'un fichier pour une comparaison précise"""
    hash_md5 = hashlib.md5()
    try:
        if not os.path.isfile(filepath):
            return None
        with open(filepath, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()
    except Exception:
        return None

def file_has_changed(src_path, dest_full_path):
    """
    Détermine si le fichier a changé.
    Vérifie l'existence, la taille, puis le hash si nécessaire.
    """
    if not os.path.exists(dest_full_path):
        return True
    
    # Vérification rapide : taille
    try:
        if os.path.getsize(src_path) != os.path.getsize(dest_full_path):
            return True
    except OSError:
        return True
    
    # Vérification fine : date de modification
    # (shutil.copy2 préserve les dates)
    try:
        src_mtime = os.path.getmtime(src_path)
        dest_mtime = os.path.getmtime(dest_full_path)
        
        # Si le mtime est différent, on vérifie le contenu
        if abs(src_mtime - dest_mtime) > 0.01:
            src_hash = get_file_hash(src_path)
            dest_hash = get_file_hash(dest_full_path)
            return src_hash != dest_hash
    except OSError:
        return True
        
    return False

def sync():
    """Exécute la synchronisation"""
    global log_handle
    
    # Vérifications de base
    if not os.path.exists(SOURCE_DIR):
        print(f"ERREUR: Dossier source introuvable: {SOURCE_DIR}")
        print("Avez-vous lancé 'deploy-to-live-smart.py' ?")
        return False
        
    if not os.path.exists(GITHUB_REPO_DIR):
        print(f"ERREUR: Dossier destination introuvable: {GITHUB_REPO_DIR}")
        print("Le dossier 'plume-locale.github.io' doit être au même niveau que 'plume-locale'.")
        return False

    # Ouverture du log
    try:
        log_handle = open(LOG_FILE, 'w', encoding='utf-8')
    except Exception as e:
        print(f"Avertissement: Impossible de créer le fichier log: {e}")

    log(f"============================================================")
    log(f"SYNCHRONISATION VERS GITHUB PAGES (plume-locale.github.io)")
    log(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    log(f"============================================================")
    log(f"Source:      {SOURCE_DIR}")
    log(f"Destination: {GITHUB_REPO_DIR}")
    log("")

    # 1. Parcourir la source et mettre à jour la destination
    copied_count = 0
    skipped_count = 0
    error_count = 0
    
    # Ensemble des chemins relatifs attendus (pour détecter les orphelins plus tard)
    expected_rel_paths = set()

    log("--- Phase 1: Mise à jour des fichiers ---")
    
    for root, dirs, files in os.walk(SOURCE_DIR):
        for filename in files:
            src_full_path = os.path.join(root, filename)
            rel_path = os.path.relpath(src_full_path, SOURCE_DIR)
            # Nettoyer le chemin pour la comparaison
            clean_rel_path = rel_path.replace('\\', '/')
            expected_rel_paths.add(clean_rel_path)
            
            dest_full_path = os.path.join(GITHUB_REPO_DIR, rel_path)
            
            if file_has_changed(src_full_path, dest_full_path):
                try:
                    dest_dir = os.path.dirname(dest_full_path)
                    os.makedirs(dest_dir, exist_ok=True)
                    shutil.copy2(src_full_path, dest_full_path)
                    log(f"   [COPIE] {clean_rel_path}")
                    copied_count += 1
                except Exception as e:
                    log(f"   [ERREUR] Impossible de copier {clean_rel_path}: {e}")
                    error_count += 1
            else:
                skipped_count += 1

    # 2. Nettoyage des fichiers orphelins (présents dans dest mais pas dans source)
    log("\n--- Phase 2: Nettoyage des fichiers orphelins ---")
    deleted_files = 0
    deleted_dirs = 0

    # On utilise topdown=False pour supprimer les fichiers avant les dossiers
    for root, dirs, files in os.walk(GITHUB_REPO_DIR, topdown=False):
        rel_root = os.path.relpath(root, GITHUB_REPO_DIR).replace('\\', '/')
        
        # Vérifier si on est dans un dossier protégé
        is_protected_dir = False
        if rel_root != '.':
            for p in PROTECTED_PATHS:
                if rel_root == p or rel_root.startswith(p + '/'):
                    is_protected_dir = True
                    break
        
        if is_protected_dir:
            continue

        # Supprimer les fichiers non attendus
        for filename in files:
            full_path = os.path.join(root, filename)
            rel_path = os.path.relpath(full_path, GITHUB_REPO_DIR).replace('\\', '/')
            
            if rel_path in PROTECTED_PATHS:
                continue
            
            if rel_path not in expected_rel_paths:
                try:
                    os.remove(full_path)
                    log(f"   [SUPPRIME] {rel_path}")
                    deleted_files += 1
                except Exception as e:
                    log(f"   [ERREUR] Suppression impossible: {rel_path} ({e})")

    # 3. Supprimer les dossiers vides orphelins
    for root, dirs, files in os.walk(GITHUB_REPO_DIR, topdown=False):
        rel_root = os.path.relpath(root, GITHUB_REPO_DIR).replace('\\', '/')
        
        # Ne pas toucher à la racine ni aux chemins protégés
        if rel_root == '.':
            continue
            
        is_protected = False
        for p in PROTECTED_PATHS:
            if rel_root == p or rel_root.startswith(p + '/'):
                is_protected = True
                break
        
        if is_protected:
            continue
            
        # Si le dossier est vide maintenant
        if not os.listdir(root):
            try:
                os.rmdir(root)
                log(f"   [DOSSIER VIDE SUPPRIME] {rel_root}/")
                deleted_dirs += 1
            except Exception:
                pass

    log("")
    log(f"============================================================")
    log(f"RÉSUMÉ FINAL")
    log(f"============================================================")
    log(f"Fichiers mis à jour:       {copied_count}")
    log(f"Fichiers déjà à jour:      {skipped_count}")
    log(f"Fichiers orphelins :       {deleted_files} supprimé(s)")
    log(f"Dossiers vides :           {deleted_dirs} supprimé(s)")
    log(f"Erreurs rencontrées:       {error_count}")
    log(f"Log complet écrit dans:    {LOG_FILE}")
    log(f"============================================================")
    
    if log_handle:
        log_handle.close()
        
    return error_count == 0

if __name__ == "__main__":
    success = sync()
    sys.exit(0 if success else 1)
