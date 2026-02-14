import os
import glob
import re
import sys

# Importer les listes depuis build_config.py
try:
    from build_config import CSS_ORDER, JS_ORDER, MODULE_CSS_FILES, IGNORED_ORIGINALS
except ImportError:
    print("ERREUR: build_config.py introuvable.")
    sys.exit(1)

# Configuration paths
BUILD_DIR = os.path.dirname(os.path.abspath(__file__))
LIVE_DIR = os.path.join(BUILD_DIR, 'live')
OUTPUT_FILE = os.path.join(LIVE_DIR, 'app.html')

def read_file(path):
    full_path = os.path.join(BUILD_DIR, path)
    if not os.path.exists(full_path):
        print(f"File not found: {path} (full: {full_path})")
        return ""
    
    # Try multiple encodings
    for enc in ['utf-8', 'cp1252', 'latin-1']:
        try:
            with open(full_path, 'r', encoding=enc) as f:
                return f.read()
        except UnicodeDecodeError:
            continue
    return ""

def clean_html_menu(body_content):
    # Same logic as build.light.py
    body_content = re.sub(r'<button[^>]+id="header-tab-thriller"[^>]*>.*?</button>', '', body_content, flags=re.DOTALL)
    body_content = re.sub(r'<button[^>]+id="header-tab-storygrid"[^>]*>.*?</button>', '', body_content, flags=re.DOTALL)
    body_content = re.sub(r'<button[^>]+data-view="thriller"[^>]*>.*?</button>', '', body_content, flags=re.DOTALL)
    body_content = re.sub(r'<button[^>]+data-view="storygrid"[^>]*>.*?</button>', '', body_content, flags=re.DOTALL)
    body_content = re.sub(r'<div[^>]+id="thrillerList"[^>]*>.*?</div>', '', body_content, flags=re.DOTALL)
    body_content = re.sub(r'<option[^>]+value="thriller"[^>]*>.*?</option>', '', body_content)
    return body_content

def generate_index():
    head = read_file('html/head.html')
    body = read_file('html/body.html')
    footer = read_file('html/footer.html')
    
    body = clean_html_menu(body)
    
    # CSS Links
    css_links = []
    processed_css = []
    
    # 1. CSS_ORDER
    for css in CSS_ORDER:
        filename = os.path.basename(css)
        link = f'<link rel="stylesheet" href="./css/{filename}">'
        css_links.append(link)
        processed_css.append(filename)

    # 2. Other CSS files in css/ folder not in order (excluding storygrid)
    local_css_dir = os.path.join(BUILD_DIR, 'css')
    for filepath in glob.glob(os.path.join(local_css_dir, '*.css')):
        filename = os.path.basename(filepath)
        if filename not in processed_css and filename not in ['11.storygrid.css', 'landing-page.css']:
            link = f'<link rel="stylesheet" href="./css/{filename}">'
            css_links.append(link)

    # 3. Module CSS files
    for css in MODULE_CSS_FILES:
        filename = os.path.basename(css)
        if filename not in processed_css: 
             link = f'<link rel="stylesheet" href="./css/{filename}">'
             css_links.append(link)

    # JS Scripts
    js_scripts = []
    
    # helper to normalize js path to live/js/...
    def get_live_js_path(original_path):
        if original_path.startswith('vendor/'):
             return f'./js/{original_path}' # keep vendor/ struct inside js/
        elif original_path.startswith('js/'):
             return f'./js/{original_path.replace("js/", "")}'
        else:
             return f'./js/{original_path}'

    # 1. JS_ORDER
    for js in JS_ORDER:
         src = get_live_js_path(js)
         js_scripts.append(f'<script src="{src}"></script>')
             
    # 2. Extra JS files
    js_root = os.path.join(BUILD_DIR, 'js')
    for root, dirs, files in os.walk(js_root):
        if 'demo' in root.split(os.sep): 
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
                
                src = f'./js/{rel_path.replace("js/", "")}'
                js_scripts.append(f'<script src="{src}"></script>')

    # Embed the demo project as a global variable to avoid fetch/CORS issues
    demo_json = read_file('demo/project.json')
    demo_script = ""
    if demo_json:
        # On échappe les backticks et on s'assure que c'est du JSON valide pour du JS
        demo_script = f'<script>window.PLUME_DEMO_PROJECT = {demo_json};</script>'

    # Construct HTML
    html_content = f"""{head}
    <!-- Generated CSS Links -->
    {chr(10).join(css_links)}
    {demo_script}
</head>
{body}
    <!-- Generated JS Scripts -->
    {chr(10).join(js_scripts)}
{footer}"""

    # Create LIVE_DIR if it doesn't exist (though deploy script should create it)
    os.makedirs(LIVE_DIR, exist_ok=True)

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"Generated {OUTPUT_FILE}")

if __name__ == "__main__":
    generate_index()
