#!/usr/bin/env python3
"""
build-changelog-from-git.py
────────────────────────────
Génère changelog.data.js à partir des commits git réels.

Les commits sont groupés par "session de travail" (date + thème détecté).
Chaque groupe devient une entrée dans le changelog avec :
  - hash court du dernier commit du groupe
  - date
  - type auto-détecté (feat → minor, fix → patch, refactor → patch)
  - résumé généré depuis les messages de commit

Usage:
    python build-changelog-from-git.py
    python build-changelog-from-git.py --max-groups 20
    python build-changelog-from-git.py --preview   # affiche sans écrire les fichiers
"""

import subprocess
import json
import os
import sys
import re
from datetime import datetime, timedelta
from collections import defaultdict

SCRIPT_DIR  = os.path.dirname(os.path.abspath(__file__))
OUTPUT_FILE = os.path.join(SCRIPT_DIR, 'js', 'features', 'tools', 'changelog', 'changelog.data.js')
OUTPUT_LIVE = os.path.join(SCRIPT_DIR, 'live', 'js', 'features', 'tools', 'changelog', 'changelog.data.js')

# ── Paramètres ────────────────────────────────────────────────────────────────
MAX_GROUPS   = 20     # nombre max d'entrées dans le changelog
GROUP_WINDOW = 3      # jours : les commits dans cette fenêtre sont regroupés

# ── Mots-clés pour détecter le type ────────────────────────────────────────
FEAT_WORDS   = ['feat', 'ajout', 'add', 'nouveau', 'new', 'implémen', 'implement',
                'refonte', 'proto', 'creation', 'création', 'migration']
FIX_WORDS    = ['fix', 'correc', 'bug', 'revert', 'hotfix']
BREAK_WORDS  = ['breaking', 'BREAKING', 'majeur', 'major', 'migration complète', 'refonte complète']

# ── Préfixes à nettoyer dans les messages ──────────────────────────────────
CLEAN_PREFIXES = ['feat:', 'fix:', 'chore:', 'refactor:', 'feat(', 'fix(', 'chore(',
                  'WIP:', 'wip:', 'update', 'Update', 'maj ', 'correction de ',
                  'Correction de ', 'correction ', 'Correction ']

def run(cmd):
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True, encoding='utf-8',
                       cwd=SCRIPT_DIR)
    return r.stdout.strip()

def clean_message(msg):
    """Nettoie un message de commit pour l'affichage."""
    msg = msg.strip()
    # Supprimer les préfixes conventionnels
    msg = re.sub(r'^(feat|fix|chore|refactor|style|docs|test|build|ci|perf|revert)(\([^)]+\))?:\s*', '', msg, flags=re.I)
    # Supprimer les duplications connues (messages concaténés dans git log)
    msg = msg.split('\n')[0][:120]
    # Capitaliser
    if msg:
        msg = msg[0].upper() + msg[1:]
    return msg

def detect_type(messages):
    """Détecte le type de la release à partir des messages de commit."""
    text = ' '.join(messages).lower()
    for w in BREAK_WORDS:
        if w.lower() in text:
            return 'major'
    for w in FEAT_WORDS:
        if w in text:
            return 'minor'
    for w in FIX_WORDS:
        if w in text:
            return 'patch'
    return 'patch'

def group_commits(commits):
    """Groupe les commits par fenêtre temporelle de GROUP_WINDOW jours."""
    if not commits:
        return []
    groups = []
    current_group = [commits[0]]
    current_date = commits[0]['date']

    for commit in commits[1:]:
        diff = (current_date - commit['date']).days
        if diff <= GROUP_WINDOW:
            current_group.append(commit)
        else:
            groups.append(current_group)
            current_group = [commit]
            current_date = commit['date']

    if current_group:
        groups.append(current_group)

    return groups[:MAX_GROUPS]

def format_group_as_markdown(group, idx, total):
    """Génère le contenu Markdown d'un groupe de commits."""
    main_commit = group[0]  # Le plus récent
    date_str = main_commit['date'].strftime('%d %B %Y')
    msg_type = detect_type([c['msg'] for c in group])

    # Titre : message du commit le plus significatif
    # Chercher un commit avec "feat" en priorité
    title_commit = next(
        (c for c in group if any(w in c['msg'].lower() for w in FEAT_WORDS)),
        group[0]
    )
    title = clean_message(title_commit['msg'])

    # Sections : feat / fix / autre
    feats  = [c for c in group if any(w in c['msg'].lower() for w in FEAT_WORDS)
              and not any(w in c['msg'].lower() for w in FIX_WORDS)]
    fixes  = [c for c in group if any(w in c['msg'].lower() for w in FIX_WORDS)]
    others = [c for c in group if c not in feats and c not in fixes]

    lines = [f'# {title}', '',
             f'**Date :** {date_str} · **Commit :** `{main_commit["hash"]}`', '']

    if feats:
        lines += ['## ✨ Nouveautés', '']
        for c in feats[:8]:
            lines.append(f'- {clean_message(c["msg"])}')
        lines.append('')

    if fixes:
        lines += ['## 🐛 Corrections', '']
        for c in fixes[:8]:
            lines.append(f'- {clean_message(c["msg"])}')
        lines.append('')

    if others and not feats and not fixes:
        lines += ['## 🔧 Modifications', '']
        for c in others[:6]:
            lines.append(f'- {clean_message(c["msg"])}')
        lines.append('')

    return '\n'.join(lines).strip()

def escape_backticks(s):
    s = s.replace('\\', '\\\\')
    s = s.replace('`', '\\`')
    s = s.replace('${', '\\${')
    return s

def build(preview=False):
    print("📖 Lecture de l'historique git...")

    # Récupérer tous les commits
    raw = run('git log --all --format="%h|%as|%s" --date=short')
    if not raw:
        print("❌ Pas de commits trouvés.")
        return

    commits = []
    seen_msgs = set()
    for line in raw.splitlines():
        parts = line.strip().split('|', 2)
        if len(parts) < 3:
            continue
        h, date_s, msg = parts
        # Dédupliquer les messages très similaires (artefacts de git log --all)
        msg_key = msg[:40]
        if msg_key in seen_msgs:
            continue
        seen_msgs.add(msg_key)
        try:
            d = datetime.strptime(date_s, '%Y-%m-%d')
        except ValueError:
            continue
        commits.append({'hash': h, 'date': d, 'msg': msg})

    # Trier du plus récent au plus ancien
    commits.sort(key=lambda c: c['date'], reverse=True)
    print(f"   {len(commits)} commits trouvés.")

    # Grouper
    groups = group_commits(commits)
    print(f"   {len(groups)} groupes générés.")

    # Construire les entrées de changelog
    entries = []
    for i, group in enumerate(groups):
        main = group[0]
        msg_type = detect_type([c['msg'] for c in group])
        date_str = main['date'].strftime('%Y-%m-%d')
        
        # Résumé : titre court du groupe
        title_commit = next(
            (c for c in group if any(w in c['msg'].lower() for w in FEAT_WORDS)),
            group[0]
        )
        summary = clean_message(title_commit['msg'])[:80]

        content = format_group_as_markdown(group, i, len(groups))

        entries.append({
            'version': main['hash'],
            'date': date_str,
            'type': msg_type,
            'summary': summary,
            'content': content,
            'commit_count': len(group),
        })

    if preview:
        for e in entries:
            print(f"\n── {e['version']} ({e['date']}) [{e['type']}] ──")
            print(f"   {e['summary']}")
            print(f"   {e['commit_count']} commit(s)")
        return

    # Générer le JS
    now = datetime.now().strftime('%Y-%m-%d %H:%M')
    lines = [
        f'/* ==========================================',
        f'   CHANGELOG DATA — Généré le {now}',
        f'   Source : git log (historique réel)',
        f'   NE PAS MODIFIER À LA MAIN.',
        f'   Exécuter build-changelog-from-git.py pour regénérer.',
        f'   ========================================== */',
        '',
        'window.CHANGELOG_DATA = [',
    ]

    for i, entry in enumerate(entries):
        comma = '' if i == len(entries) - 1 else ','
        safe_content = escape_backticks(entry['content'])
        lines += [
            '  {',
            f'    "version": {json.dumps(entry["version"])},',
            f'    "date":    {json.dumps(entry["date"])},',
            f'    "type":    {json.dumps(entry["type"])},',
            f'    "summary": {json.dumps(entry["summary"])},',
            f'    "content": `{safe_content}`',
            f'  }}{comma}',
        ]

    lines += ['];', '']
    output = '\n'.join(lines)

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(output)
    print(f"\n✅ Écrit : {OUTPUT_FILE}")

    if os.path.exists(os.path.dirname(OUTPUT_LIVE)):
        os.makedirs(os.path.dirname(OUTPUT_LIVE), exist_ok=True)
        with open(OUTPUT_LIVE, 'w', encoding='utf-8') as f:
            f.write(output)
        print(f"✅ Écrit : {OUTPUT_LIVE}")

    print(f"\n🎉 {len(entries)} entrée(s) de changelog générées depuis git.")

if __name__ == '__main__':
    preview = '--preview' in sys.argv
    build(preview=preview)
