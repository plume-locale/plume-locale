---
description: Traduire le changelog en 4 langues et générer changelog.i18n.data.js
---

# Workflow : Traduction du changelog

Ce workflow est déclenché quand l'utilisateur ajoute ou modifie des entrées dans `changelog.manual.data.js` et veut mettre à jour le fichier i18n.

// turbo-all

## Étapes

1. Lire le contenu de `g:\Mon Drive\plume-locale\js\features\tools\changelog\changelog.manual.data.js` pour récupérer toutes les entrées.

2. Pour chaque entrée dans `CHANGELOG_MANUAL_DATA`, traduire les champs suivants du **français** vers **l'anglais (en)**, **l'allemand (de)** et **l'espagnol (es)** :
   - `summary`
   - Chaque élément de `features[]`
   - Chaque élément de `fixes[]`
   - `notes` (si non vide)
   
   Règles de traduction :
   - Conserver le ton technique et concis de l'original
   - Ne pas traduire les noms propres d'interface (ex: "Google Drive", "Scrivener")
   - Conserver les balises Markdown (`**`, `##`, `-`)
   - Générer chaque bloc `content` dans la langue cible en suivant le même format que le bloc FR

3. Générer le fichier `g:\Mon Drive\plume-locale\js\features\tools\changelog\changelog.i18n.data.js` avec la structure suivante :

```js
/* ==========================================
   CHANGELOG I18N — Généré automatiquement par Antigravity
   NE PAS MODIFIER À LA MAIN.
   Lancer le workflow /translate-changelog pour regénérer.
   ========================================== */

window.CHANGELOG_I18N_DATA = {
  fr: [ /* entrées FR */ ],
  en: [ /* entrées EN */ ],
  de: [ /* entrées DE */ ],
  es: [ /* entrées ES */ ],
};

const _clLocale = localStorage.getItem('plume_locale') || 'fr';
window.CHANGELOG_DATA = window.CHANGELOG_I18N_DATA[_clLocale]
                     || window.CHANGELOG_I18N_DATA['fr'];
```

Chaque entrée dans chaque langue a la structure :
```js
{
  version: "X.Y.Z",
  date: "YYYY-MM-DD",
  type: "minor",
  summary: "...",
  content: `# ...` // markdown complet avec ## ✨ Nouveautés / ## 🐛 Corrections
}
```

4. Pour chaque langue, le champ `content` est construit ainsi :
```
# {summary traduit}

**Date :** {date formatée dans la langue cible}

## ✨ {titre "Nouveautés" dans la langue cible}

- {feature 1 traduite}
- {feature 2 traduite}
...

## 🐛 {titre "Corrections" dans la langue cible}

- {fix 1 traduit}
...
```

   Titres de section par langue :
   - FR : `Nouveautés` / `Corrections`
   - EN : `What's New` / `Bug Fixes`
   - DE : `Neuheiten` / `Fehlerbehebungen`
   - ES : `Novedades` / `Correcciones`

5. Écrire le fichier `changelog.i18n.data.js` avec le contenu généré en écrasant l'existant.

6. Confirmer à l'utilisateur que le fichier a été généré avec le nombre d'entrées traduites et les langues produites.
