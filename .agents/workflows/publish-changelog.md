---
description: Publier le changelog depuis CHANGELOG.md vers le format i18n
---

# Workflow : Publication du Changelog

Ce workflow simplifie la mise à jour du changelog. Il suffit d'éditer le fichier `CHANGELOG.md` à la racine et de lancer cette commande.

// turbo-all

## Étapes

1. Lire le contenu de `g:\Mon Drive\plume-locale\CHANGELOG.md`.

2. Analyser le Markdown pour extraire les versions. Chaque section commençant par `# ` est une nouvelle version.
   Format attendu : `# [Version] - [YYYY-MM-DD]`
   Les sections `## ✨ Nouveautés` et `## 🐛 Corrections` sont extraites pour le contenu.

3. Pour chaque version, si elle n'est pas déjà présente dans `js/features/tools/changelog/changelog.i18n.data.js` (ou si elle a été modifiée), traduire le contenu vers l'anglais (en), l'allemand (de) et l'espagnol (es).

4. Mettre à jour `g:\Mon Drive\plume-locale\js\features\tools\changelog\changelog.i18n.data.js` avec les nouvelles données traduites.

5. Synchroniser le fichier vers le dossier `live` : `g:\Mon Drive\plume-locale\live\js\features\tools\changelog\changelog.i18n.data.js`.

6. Confirmer la publication et le nombre de versions traitées.
