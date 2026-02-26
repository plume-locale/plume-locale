# Build Dictionary — Pipeline d'enrichissement du vocabulaire

Ce dossier contient les scripts pour enrichir automatiquement le dictionnaire de synonymes de Plume à partir du **Wiktionnaire français** (source ouverte, licence CC BY-SA).

## 🎯 Objectif

Passer de ~740 mots à **20 000 – 40 000+ mots** avec leurs synonymes et antonymes.

---

## 📋 Prérequis

- **Python 3.8+** (pour l'extraction)
- **Node.js 14+** (pour la conversion)
- **~600 MB d'espace disque** (dump temporaire)
- **Connexion internet** (téléchargement unique de ~484 MB)

---

## 🚀 Utilisation en 2 étapes

### Étape 1 — Extraction (Python)

```bash
# Depuis ce dossier :
python extract_wiktionary.py
```

Cela va :
1. Télécharger le dump JSON du Wiktionnaire français (~484 MB) — **une seule fois**
2. Parser chaque entrée et extraire les synonymes/antonymes
3. Produire `synonyms_raw.json` (~15–30 MB)

⏱️ Durée estimée : 5–15 min (selon la connexion et le CPU)

---

### Étape 2 — Conversion (Node.js)

```bash
# Mode MERGE (recommandé) — conserve les entrées manuelles existantes :
node convert_to_js.js --mode merge

# Mode REPLACE — remplace tout (à n'utiliser qu'avec précaution) :
node convert_to_js.js --mode replace

# Avec options avancées :
node convert_to_js.js --mode merge --max-syns 8 --max-ants 5 --max-words 20000
```

#### Options disponibles

| Option | Défaut | Description |
|---|---|---|
| `--mode` | `merge` | `merge` ou `replace` |
| `--max-syns` | `10` | Synonymes max par mot |
| `--max-ants` | `6` | Antonymes max par mot |
| `--min-word` | `2` | Longueur minimale d'un mot |
| `--max-words` | illimité | Limite le nombre total de mots |
| `--output` | auto | Chemin du fichier JS de sortie |

---

## 📊 Résultats attendus

| Paramètre | Avant | Après |
|---|---|---|
| Mots indexés | ~740 | ~20 000 – 40 000 |
| Synonymes | ~5 000 | ~150 000 – 300 000 |
| Antonymes | ~2 000 | ~30 000 – 80 000 |
| Taille du fichier JS | ~90 KB | ~3 – 8 MB |

---

## 📁 Fichiers produits

```
scripts/build-dictionary/
├── extract_wiktionary.py       ← Script Python (étape 1)
├── convert_to_js.js            ← Script Node.js (étape 2)
├── README.md                   ← Ce fichier
├── kaikki-french.jsonl         ← Dump temporaire (484 MB, ignoré par git)
└── synonyms_raw.json           ← JSON intermédiaire (ignoré par git)
```

> ⚠️ Les fichiers `*.jsonl` et `synonyms_raw.json` ne doivent PAS être commités (trop lourds). Ajoutez-les au `.gitignore`.

---

## 🔄 Mise à jour périodique

Le Wiktionnaire est mis à jour mensuellement. Pour régénérer le dictionnaire :
1. Supprimer `kaikki-french.jsonl` pour forcer le re-téléchargement
2. Relancer les 2 scripts

---

## 📜 Licence des données

Les données du Wiktionnaire sont sous licence **Creative Commons Attribution-ShareAlike 3.0** (CC BY-SA 3.0). Si vous redistribuez Plume avec ce dictionnaire enrichi, mentionnez la source : *Wiktionnaire, l'encyclopédie libre*.
