#!/usr/bin/env python3
# =============================================================
# extract_wiktionary.py
# =============================================================
# Télécharge le dump JSON du Wiktionnaire français (kaikki.org)
# et extrait les synonymes + antonymes pour chaque mot.
# Produit un fichier intermédiaire : synonyms_raw.json
#
# Usage:
#   python extract_wiktionary.py
#
# Pré-requis:
#   pip install requests  (optionnel mais recommandé sur Windows)
# =============================================================

import json
import os
import sys
import ssl
from collections import defaultdict

# --- Configuration ---
DUMP_URL = "https://kaikki.org/dictionary/French/kaikki.org-dictionary-French.jsonl"
DUMP_FILE = "kaikki-french.jsonl"
OUTPUT_FILE = "synonyms_raw.json"


def download_with_progress(url, dest):
    """Télécharge un fichier avec progression. Gère les problèmes SSL Windows."""
    if os.path.exists(dest):
        size = os.path.getsize(dest)
        if size > 10_000_000:  # > 10 MB = déjà téléchargé
            print(f"[OK] Fichier déjà présent : {dest} ({size // 1_000_000} MB)")
            return
    print(f"[...] Téléchargement de {url}")
    print("      (fichier ~484 MB, patientez quelques minutes...)")

    # Essai 1 : requests (meilleur sur Windows)
    try:
        import requests
        with requests.get(url, stream=True, timeout=120, verify=False) as r:
            r.raise_for_status()
            total = int(r.headers.get('content-length', 0))
            downloaded = 0
            with open(dest, 'wb') as f:
                for chunk in r.iter_content(chunk_size=256 * 1024):
                    f.write(chunk)
                    downloaded += len(chunk)
                    if total:
                        pct = min(downloaded / total * 100, 100)
                        mb = downloaded / 1_000_000
                        total_mb = total / 1_000_000
                        print(f"\r      {pct:.1f}% ({mb:.0f}/{total_mb:.0f} MB)", end="", flush=True)
        print(f"\n[OK] Téléchargement terminé : {dest}")
        return
    except ImportError:
        print("  [INFO] 'requests' non installé, utilisation de urllib...")
    except Exception as e:
        print(f"\n  [WARN] requests a échoué ({e}), tentative urllib...")
        if os.path.exists(dest) and os.path.getsize(dest) < 10_000:
            os.remove(dest)

    # Essai 2 : urllib avec SSL désactivé (contournement certificat Windows)
    try:
        import urllib.request
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE

        def report(block_num, block_size, total_size):
            downloaded = block_num * block_size
            if total_size > 0:
                pct = min(downloaded / total_size * 100, 100)
                mb = downloaded / 1_000_000
                total_mb = total_size / 1_000_000
                print(f"\r      {pct:.1f}% ({mb:.0f}/{total_mb:.0f} MB)", end="", flush=True)

        opener = urllib.request.build_opener(urllib.request.HTTPSHandler(context=ctx))
        urllib.request.install_opener(opener)
        urllib.request.urlretrieve(url, dest, reporthook=report)
        print(f"\n[OK] Téléchargement terminé : {dest}")
        return
    except Exception as e:
        print(f"\n  [ERREUR] Impossible de télécharger : {e}")
        print("\n  📥 Téléchargement manuel requis :")
        print(f"     URL : {url}")
        print(f"     Destination : {dest}")
        print("     Collez le fichier dans ce dossier et relancez le script.")
        sys.exit(1)


def normalize(word):
    """Nettoie un mot pour l'indexation."""
    return word.strip().lower()


def extract_synonyms(dump_path, output_path):
    print(f"\n[...] Extraction des synonymes depuis {dump_path}")

    # Structure : { mot: { "synonymes": set(), "antonymes": set() } }
    dictionary = defaultdict(lambda: {"synonymes": set(), "antonymes": set()})

    total_lines = 0
    entries_with_synonyms = 0
    skipped = 0

    with open(dump_path, encoding="utf-8") as f:
        for line in f:
            total_lines += 1
            if total_lines % 50_000 == 0:
                print(f"      {total_lines:,} lignes traitées... ({entries_with_synonyms:,} mots avec synonymes)", flush=True)

            try:
                entry = json.loads(line)
            except json.JSONDecodeError:
                skipped += 1
                continue

            # On ne garde que les mots français
            lang = entry.get("lang_code", "")
            if lang != "fr":
                continue

            word = entry.get("word", "").strip()
            if not word or len(word) < 2:
                continue

            # Ignorer les noms propres, abréviations, etc.
            pos = entry.get("pos", "")
            if pos in ("name", "abbrev", "character", "symbol", "punct"):
                continue

            # Ignorer les mots avec caractères non-alphabétiques (sauf tirets/apostrophes)
            clean = word.replace("-", "").replace("'", "").replace("'", "")
            if not clean.isalpha():
                continue

            word_lower = normalize(word)
            found_any = False

            # Parcourir les "senses" (différents sens du mot)
            for sense in entry.get("senses", []):
                # --- Synonymes ---
                for link in sense.get("synonyms", []):
                    syn = link.get("word", "").strip()
                    if syn and syn.lower() != word_lower and len(syn) > 1:
                        # Exclure les locutions trop longues (> 4 mots)
                        if len(syn.split()) <= 4:
                            dictionary[word_lower]["synonymes"].add(normalize(syn))
                            found_any = True

                # --- Antonymes ---
                for link in sense.get("antonyms", []):
                    ant = link.get("word", "").strip()
                    if ant and ant.lower() != word_lower and len(ant) > 1:
                        if len(ant.split()) <= 4:
                            dictionary[word_lower]["antonymes"].add(normalize(ant))
                            found_any = True

            if found_any:
                entries_with_synonyms += 1

    print(f"\n[OK] Extraction terminée :")
    print(f"     - Lignes totales lues   : {total_lines:,}")
    print(f"     - Mots avec synonymes   : {entries_with_synonyms:,}")
    print(f"     - Lignes ignorées       : {skipped:,}")

    # Convertir les sets en listes triées + filtrer les entrées vides
    result = {}
    for word, data in dictionary.items():
        syns = sorted(list(data["synonymes"]))
        ants = sorted(list(data["antonymes"]))
        if syns:  # On ne garde que les mots qui ont au moins 1 synonyme
            result[word] = {
                "synonymes": syns,
                "antonymes": ants
            }

    # Trier le dictionnaire par mot
    result = dict(sorted(result.items()))

    print(f"\n[...] Écriture de {output_path} ({len(result):,} entrées)...")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    size_mb = os.path.getsize(output_path) / 1_000_000
    print(f"[OK] Fichier écrit : {output_path} ({size_mb:.1f} MB, {len(result):,} mots)")
    return len(result)


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    dump_path = os.path.join(script_dir, DUMP_FILE)
    output_path = os.path.join(script_dir, OUTPUT_FILE)

    print("=" * 60)
    print("  EXTRACTION WIKTIONNAIRE → Synonymes français")
    print("=" * 60)

    # Étape 1 : Téléchargement
    download_with_progress(DUMP_URL, dump_path)

    # Étape 2 : Extraction
    count = extract_synonyms(dump_path, output_path)

    print("\n" + "=" * 60)
    print(f"  Terminé ! {count:,} mots extraits.")
    print(f"  Fichier intermédiaire : {output_path}")
    print(f"  Prochaine étape : node convert_to_js.js")
    print("=" * 60)


if __name__ == "__main__":
    main()
