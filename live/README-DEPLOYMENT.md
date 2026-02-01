# Déploiement Plume - Version Light

Ce répertoire `/live` contient une version de production de l'application Plume, prête à être déployée.

## Contenu

Cette version "light" inclut tous les fichiers essentiels pour faire fonctionner l'application, **à l'exception** des modules Storygrid et Thriller Board qui ont été retirés pour alléger la version de production.

### Fichiers inclus

- **CSS** : Tous les fichiers de style nécessaires (variables, base, composants, etc.)
- **JavaScript** : 
  - Fichiers refactorisés dans `js-refactor/` (architecture MVVM)
  - Fichiers originaux dans `js/` (non encore refactorisés)
  - Bibliothèques vendor (driver.js)
- **HTML** : Templates de base (head, body, footer)
- **Documentation** : README, LICENSE, .gitignore
- **Scripts de build** : Pour reconstruire l'application si nécessaire

### Modules inclus

- ✅ Structure (gestion des actes, chapitres, scènes)
- ✅ Personnages
- ✅ Monde (worldbuilding)
- ✅ Codex
- ✅ Corkboard (tableau de liège)
- ✅ Plot (intrigue)
- ✅ Arc Board (tableau des arcs narratifs)
- ✅ Plot Grid (grille d'intrigue)
- ✅ Synonymes (dictionnaire français local)
- ✅ Import de chapitres (.docx, .txt, .md, .epub, .pages)
- ✅ Analyseur de répétitions de mots
- ✅ Product Tour (visite guidée)
- ✅ Et tous les autres modules essentiels...

### Modules exclus

- ❌ Storygrid (retiré pour version light)
- ❌ Thriller Board (retiré pour version light)

## Comment déployer

### 1. Générer le répertoire /live

Depuis la racine du projet, exécutez :

```bash
./deploy-to-live.sh
```

Ce script va :
- Nettoyer le répertoire `/live` existant
- Copier tous les fichiers nécessaires listés dans `build.light.py`
- Générer un rapport de déploiement dans `deploy.log`

### 2. Construire le fichier HTML final

Pour générer un fichier HTML unique contenant toute l'application :

```bash
python3 build.light.py
```

Cela créera un fichier `plume-light-YYYY.MM.DD.HH.MM.html` dans le répertoire `build/`.

Vous pouvez aussi spécifier un nom de fichier personnalisé :

```bash
python3 build.light.py --output mon-fichier.html
```

### 3. Commiter et pousser vers GitHub

Une fois le déploiement effectué, vous pouvez commiter les changements :

```bash
git add live/
git commit -m "Deploy: version light pour production"
git push origin avant-refactor-todo
```

## Structure du répertoire

```
live/
├── css/                    # Fichiers CSS
├── js/                     # Fichiers JavaScript originaux
├── js-refactor/           # Fichiers JavaScript refactorisés (MVVM)
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
├── vendor/                 # Bibliothèques tierces
├── build.light.py         # Script de build light
├── build.py               # Script de build complet
├── build.test.py          # Script de build test
├── README.md              # Documentation principale
└── LICENSE                # Licence du projet
```

## Logs et rapports

- **deploy.log** : Rapport détaillé du dernier déploiement
- **build.light.log** : Rapport détaillé du dernier build light

## Notes importantes

1. **Fichiers manquants** : Certains fichiers peuvent être manquants si le développement n'est pas terminé. Le script de déploiement continue même si des fichiers sont absents et génère un rapport.

2. **Version light** : Cette version exclut volontairement les modules Storygrid et Thriller Board pour réduire la taille et la complexité.

3. **Mise à jour** : Pour mettre à jour le déploiement, relancez simplement `./deploy-to-live.sh`. Le répertoire sera nettoyé et recréé.

## Statistiques du dernier déploiement

- **Fichiers copiés** : 127
- **Fichiers manquants** : 2
- **Taille totale** : ~2.4 MB

## Support

Pour toute question ou problème, consultez la documentation principale dans le README.md à la racine du projet.
