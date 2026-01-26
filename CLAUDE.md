# Plume - Instructions de Projet

## 🛠 Commandes Utiles
- **Build complet** : `python build.py`
- **Tests d'intégrité** : `python build.test.py`
- **Output** : `build/plume-build.html`

## 🏗 Architecture & Patterns
- **Architecture** : MVVM (Model-View-ViewModel) + Repository (CRUD)
- **Localisation** : `js-refactor/` contient les modules refactorisés.
- **Style de Code** :
  - Chaque fonction doit avoir son commentaire `// [MVVM : Type]`.
  - Conventions de nommage strictes : `XX.domaine.type.js`.

## 🛡 Principes de Travail
- **Modularité** : Séparer strictement la vue (DOM) de la logique (ViewModel).
- **Communication** : Expliquer le raisonnement avant d'appliquer des changements.
- **Persistance** : Utiliser les Repositories pour toute interaction avec le stockage.

Pour les règles détaillées, se référer à `.clauderules` ou `.cursorrules`.
