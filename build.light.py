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

# Importer les listes depuis build_config.py
try:
    from build_config import CSS_ORDER, JS_ORDER, MODULE_CSS_FILES, IGNORED_ORIGINALS
except ImportError:
    print("ERREUR: build_config.py introuvable.")
    sys.exit(1)

# Fichier log global
log_handle = None

def log(message):
    """Écrit un message dans la console ET dans le fichier log"""
    print(message)
    if log_handle:
        log_handle.write(message + '\n')
        log_handle.flush()

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
    processed_files = set()
    
    # 1. CSS_ORDER
    for filename in CSS_ORDER:
        if filename.startswith('../vendor/'):
            # Vendor CSS files
            vendor_path = filename.replace('../', '')
            filepath = os.path.join(BUILD_DIR, vendor_path)
            if os.path.exists(filepath):
                content = read_file(vendor_path)
                css_content.append(f'/* ========== {vendor_path} ========== */')
                css_content.append(content)
                css_content.append('')
                found_count += 1
                processed_files.add(os.path.basename(filename))
        else:
            filepath = os.path.join(css_dir, filename)
            if os.path.exists(filepath):
                content = read_file(f'css/{filename}')
                css_content.append(f'/* ========== {filename} ========== */')
                css_content.append(content)
                css_content.append('')
                found_count += 1
                processed_files.add(filename)
    
    # 2. Ensuite les fichiers non listés (sauf Storygrid)
    for filepath in glob.glob(os.path.join(css_dir, '*.css')):
        filename = os.path.basename(filepath)
        if filename not in processed_files and filename != '11.storygrid.css':
            content = read_file(f'css/{filename}')
            css_content.append(f'/* ========== {filename} ========== */')
            css_content.append(content)
            css_content.append('')
            found_count += 1
            processed_files.add(filename)
    
    # 3. Ajouter les CSS des modules additionnels si pas encore inclus
    for css_path in MODULE_CSS_FILES:
        filename = os.path.basename(css_path)
        if filename not in processed_files:
            filepath = os.path.join(BUILD_DIR, css_path)
            if os.path.exists(filepath):
                content = read_file(css_path)
                css_content.append(f'/* ========== {css_path} ========== */')
                css_content.append(content)
                css_content.append('')
                found_count += 1
                processed_files.add(filename)

    log(f"   [OK] {found_count} fichiers CSS trouves")
    return '\n'.join(css_content)

def collect_js():
    """Collecte tous les fichiers JS dans l'ordre"""
    js_content = []
    found_count = 0
    
    # 1. JS_ORDER
    for filename in JS_ORDER:
        if filename.startswith('vendor/'):
            filepath = os.path.join(BUILD_DIR, filename)
            if os.path.exists(filepath):
                content = read_file(filename)
                js_content.append(f'// ========== {filename} ==========')
                js_content.append(content)
                js_content.append('')
                found_count += 1
        elif filename.startswith('js/'):
            filepath = os.path.join(BUILD_DIR, filename)
            if os.path.exists(filepath):
                content = read_file(filename)
                js_content.append(f'// ========== {filename} ==========')
                js_content.append(content)
                js_content.append('')
                found_count += 1
        else:
            filepath = os.path.join(BUILD_DIR, 'js', filename)
            if os.path.exists(filepath):
                content = read_file(f'js/{filename}')
                js_content.append(f'// ========== {filename} ==========')
                js_content.append(content)
                js_content.append('')
                found_count += 1
    
    # 2. Extra JS files (sans Storygrid ni Thriller)
    js_root = os.path.join(BUILD_DIR, 'js')
    for root, dirs, files in os.walk(js_root):
        # Skip certain directories if needed, but here we want to scan all
        if 'demo' in root.split(os.sep): # Example: skip demo if it contains scripts we don't want to bundle
             continue
             
        for filename in files:
            if not filename.endswith('.js'):
                continue
                
            filepath = os.path.join(root, filename)
            rel_path = os.path.relpath(filepath, BUILD_DIR).replace('\\', '/')
            
            is_in_order = False
            for order_item in JS_ORDER:
                if order_item.replace('\\', '/') == rel_path:
                    is_in_order = True
                    break
            
            # Additional check by basename for files moved but order still original (fallback)
            if not is_in_order:
                for order_item in JS_ORDER:
                    if os.path.basename(order_item) == filename:
                        is_in_order = True
                        break
                    
            if (not is_in_order and 
                filename not in IGNORED_ORIGINALS and
                not filename.startswith('_') and
                'thriller' not in filename.lower() and
                'storygrid' not in filename.lower()):
                
                content = read_file(rel_path)
                js_content.append(f'// ========== {rel_path} ==========')
                js_content.append(content)
                js_content.append('')
    
    log(f"   [OK] {found_count} fichiers JS trouves")
    return '\n'.join(js_content)

def clean_html_menu(body_content):
    """Retire les éléments du menu Header et Mobile liés à Thriller et Storygrid"""
    body_content = re.sub(r'<button[^>]+id="header-tab-thriller"[^>]*>.*?</button>', '', body_content, flags=re.DOTALL)
    body_content = re.sub(r'<button[^>]+id="header-tab-storygrid"[^>]*>.*?</button>', '', body_content, flags=re.DOTALL)
    body_content = re.sub(r'<button[^>]+data-view="thriller"[^>]*>.*?</button>', '', body_content, flags=re.DOTALL)
    body_content = re.sub(r'<button[^>]+data-view="storygrid"[^>]*>.*?</button>', '', body_content, flags=re.DOTALL)
    body_content = re.sub(r'<div[^>]+id="thrillerList"[^>]*>.*?</div>', '', body_content, flags=re.DOTALL)
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
    
    if output_file.startswith('build') or os.path.isabs(output_file):
        output_path = os.path.join(BUILD_DIR, output_file)
    else:
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
