# Guide de déploiement Plume

Ce document explique comment déployer une version de production de l'application Plume dans le répertoire `/live` de votre dépôt GitHub.

## Vue d'ensemble

Le processus de déploiement copie tous les fichiers essentiels listés dans [`build.light.py`](build.light.py:1) vers un répertoire `/live` qui peut ensuite être commité et poussé vers GitHub.

## Fichiers de déploiement

### Scripts disponibles

1. **[`deploy-to-live.sh`](deploy-to-live.sh:1)** - Script shell principal de déploiement
2. **[`deploy-to-live.py`](deploy-to-live.py:1)** - Script Python alternatif (nécessite Python 3)
3. **[`build.light.py`](build.light.py:1)** - Définit les fichiers à inclure et permet de générer un HTML unique

### Logs générés

- **`deploy.log`** - Rapport détaillé du déploiement
- **`build.light.log`** - Rapport du build (si utilisé)

## Processus de déploiement

### Étape 1 : Exécuter le script de déploiement

```bash
./deploy-to-live.sh
```

Ce script va :
1. Nettoyer le répertoire `/live` existant (s'il existe)
2. Créer un nouveau répertoire `/live`
3. Copier tous les fichiers nécessaires selon la liste définie dans [`build.light.py`](build.light.py:1)
4. Générer un rapport dans `deploy.log`

**Sortie attendue :**
```
========================================
Déploiement vers /live - 2026-02-01 15:07:43
========================================
Répertoire source: /workspace/.../
Répertoire cible: /workspace/.../live

--- Nettoyage du répertoire /live existant ---
   [OK] Répertoire /live supprimé
--- Création du répertoire /live ---
   [OK] Répertoire /live créé

--- Copie des fichiers ---
   [!] Fichier manquant: js-refactor/48.product-tour.handlers.js
   [!] Fichier manquant: js-refactor/48.product-tour.main.js

========================================
DÉPLOIEMENT TERMINÉ
========================================
Fichiers copiés: 127
Fichiers manquants: 2

Répertoire de déploiement: /workspace/.../live
Taille totale: 2.4M
```

### Étape 2 : Vérifier le contenu

Vérifiez que le répertoire `/live` contient bien tous les fichiers nécessaires :

```bash
ls -la live/
```

Vous devriez voir :
- `css/` - Fichiers de style
- `js/` - Fichiers JavaScript originaux
- `js-refactor/` - Fichiers JavaScript refactorisés
- `html/` - Templates HTML
- `vendor/` - Bibliothèques tierces
- Scripts de build et documentation

### Étape 3 : Commiter et pousser vers GitHub

```bash
# Ajouter le répertoire /live au staging
git add live/

# Commiter les changements
git commit -m "Deploy: version light pour production"

# Pousser vers GitHub
git push origin avant-refactor-todo
```

## Version Light vs Version Complète

### Version Light (déployée dans `/live`)

La version light **exclut** les modules suivants pour réduire la taille et la complexité :
- ❌ Storygrid
- ❌ Thriller Board

### Modules inclus

- ✅ Structure (actes, chapitres, scènes)
- ✅ Personnages
- ✅ Monde (worldbuilding)
- ✅ Codex
- ✅ Corkboard
- ✅ Plot
- ✅ Arc Board
- ✅ Plot Grid
- ✅ Synonymes
- ✅ Import de chapitres
- ✅ Analyseur de répétitions
- ✅ Product Tour
- ✅ Tous les autres modules essentiels

## Générer un fichier HTML unique

Si vous souhaitez générer un fichier HTML unique contenant toute l'application :

```bash
python3 build.light.py
```

Cela créera un fichier dans `build/plume-light-YYYY.MM.DD.HH.MM.html`.

Avec un nom personnalisé :

```bash
python3 build.light.py --output plume-production.html
```

## Structure du répertoire /live

```
live/
├── css/                    # Styles CSS
│   ├── 01.variables.css
│   ├── 02.base.css
│   ├── 03.header.css
│   └── ...
├── js/                     # JavaScript original
│   ├── 02.storage.js
│   ├── 04.init.js
│   └── ...
├── js-refactor/           # JavaScript refactorisé (MVVM)
│   ├── arc-board/
│   ├── characters/
│   ├── codex/
│   ├── corkboard/
│   ├── import-chapter/
│   ├── plot/
│   ├── plotgrid/
│   ├── structure/
│   ├── synonyms/
│   ├── word-repetition/
│   └── world/
├── html/                   # Templates HTML
│   ├── head.html
│   ├── body.html
│   └── footer.html
├── vendor/                 # Bibliothèques tierces
│   ├── driver.css
│   └── driver.js.iife.js
├── build.light.py         # Script de build
├── README.md              # Documentation
├── LICENSE                # Licence
└── README-DEPLOYMENT.md   # Ce fichier
```

## Personnalisation

### Ajouter des fichiers au déploiement

Pour ajouter des fichiers au déploiement, modifiez [`build.light.py`](build.light.py:1) :

1. Ajoutez les fichiers CSS dans `CSS_ORDER`
2. Ajoutez les fichiers JS dans `JS_ORDER`
3. Ajoutez d'autres fichiers dans les listes appropriées

Puis relancez [`deploy-to-live.sh`](deploy-to-live.sh:1).

### Exclure des fichiers

Pour exclure des fichiers, retirez-les simplement des listes dans [`build.light.py`](build.light.py:1).

## Dépannage

### Fichiers manquants

Si des fichiers sont signalés comme manquants dans `deploy.log`, c'est normal si :
- Le développement de ces fichiers n'est pas terminé
- Les fichiers ont été renommés ou déplacés

Le script continue malgré les fichiers manquants.

### Erreur de permission

Si vous obtenez une erreur de permission :

```bash
chmod +x deploy-to-live.sh
```

### Python non disponible

Si Python n'est pas disponible, utilisez le script shell :

```bash
./deploy-to-live.sh
```

## Maintenance

### Mettre à jour le déploiement

Pour mettre à jour le répertoire `/live` après des modifications :

```bash
./deploy-to-live.sh
git add live/
git commit -m "Update: mise à jour du déploiement"
git push origin avant-refactor-todo
```

### Nettoyer le déploiement

Pour supprimer le répertoire `/live` :

```bash
rm -rf live/
```

## Statistiques

- **Fichiers déployés** : ~127 fichiers
- **Taille totale** : ~2.4 MB
- **Modules inclus** : 15+ modules
- **Temps de déploiement** : < 1 seconde

## Ressources

- [`build.light.py`](build.light.py:1) - Configuration des fichiers à déployer
- [`deploy-to-live.sh`](deploy-to-live.sh:1) - Script de déploiement shell
- [`deploy-to-live.py`](deploy-to-live.py:1) - Script de déploiement Python
- `deploy.log` - Rapport de déploiement
- [`live/README-DEPLOYMENT.md`](live/README-DEPLOYMENT.md:1) - Documentation dans /live

## Support

Pour toute question ou problème, consultez :
1. Les logs de déploiement (`deploy.log`)
2. La documentation dans `/live/README-DEPLOYMENT.md`
3. Le code source des scripts de déploiement
