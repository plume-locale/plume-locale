# Plan de Migration - Architecture v2.0

## Vue d'ensemble
Migration progressive de l'ancien code monolithique (45 fichiers, 1.6MB) vers la nouvelle architecture MVC.

## Stratégie : Migration Hybride Progressive

### Phase 1 : Préparation ✅ TERMINÉE
- ✅ Nouvelle architecture créée (48 fichiers, 13K lignes)
- ✅ Tests et validation des nouveaux modules
- ✅ Architecture MVC fonctionnelle

### Phase 2 : Build System (EN COURS)
**Objectif** : Créer un build.py v2 qui supporte les deux architectures

**Actions** :
1. Créer `build-v2.py` - Nouveau script de build
2. Charger la nouvelle architecture en priorité
3. Garder l'ancien code en fallback pour les fonctionnalités non migrées

**Fichiers modifiés** :
- `build-v2.py` (nouveau)
- Génère `plume-v2.html` (nouvelle version)

### Phase 3 : Migration Core (Priorité 1)
**Remplacer** :
- ❌ `js/01.app.js` (3.6K) → ✅ `js/00-core/00.app.js` (nouveau)
- ❌ `js/02.storage.js` (12K) → ✅ `js/01-infrastructure/storage.js` (nouveau)
- ❌ `js/03.project.js` (47K) → ✅ Services + Models (nouveau)
- ❌ `js/04.init.js` (7.0K) → ✅ Intégré dans App.js

**Impact** : Remplace le cœur de l'application (70K → 13K lignes)

### Phase 4 : Migration Vues (Priorité 2)
**Remplacer** :
- ❌ `js/15.characters.js` (69K) → ✅ `js/06-views/characters/` (3 fichiers, nouveau)
- ❌ `js/17.world.js` (12K) → ✅ `js/06-views/locations/` (3 fichiers, nouveau)
- ❌ `js/19.notes.js` (21K) → ✅ `js/06-views/notes/` (3 fichiers, nouveau)
- ❌ `js/06.structure.js` (45K) → ✅ `js/06-views/structure/` (3 fichiers, nouveau)
- ❌ `js/44.storygrid.js` → ✅ `js/06-views/story-grid/` (3 fichiers, nouveau)
- ❌ `js/45.arc-board.js` → ✅ `js/06-views/arc-board/` (3 fichiers, nouveau)

**Impact** : Remplace les vues principales (180K → 35K lignes)

### Phase 5 : Migration Fonctionnalités Restantes
**À migrer progressivement** :
- `js/16.split-view.js` (91K) - Vue séparée scènes
- `js/18.timeline.js` (7.4K) - Timeline
- `js/30.corkboard.js` (30K) - Corkboard
- `js/31.mindmap.js` - Mindmap
- `js/33.plot.js` - Arcs narratifs
- `js/34.relations-graph.js` - Graphe de relations
- `js/35.renderMap.js` - Carte
- `js/36.timeline-metro.js` - Timeline Metro

### Phase 6 : Migration Utilitaires
**À migrer** :
- `js/05.undo-redo.js` (5.5K)
- `js/07.stats.js` (37K)
- `js/08.auto-detect.js` (21K)
- `js/09.floating-editor.js` (14K)
- `js/12.import-export.js` (5.8K)
- `js/20.snapshots.js` (9.1K)
- `js/21.sceneVersions.js` (18K)
- `js/25.globalSearch.js` (8.4K)
- `js/26.focusMode.js` (11K)
- `js/28.revision.js` (37K)

### Phase 7 : Cleanup Final
- Supprimer les anciens fichiers une fois tout migré
- Mettre à jour build.py pour utiliser uniquement la v2
- Tests complets de régression

## Mapping Fichiers Ancien → Nouveau

### Core System
| Ancien | Nouveau | Statut |
|--------|---------|--------|
| 01.app.js | 00-core/00.app.js | ✅ Créé |
| 02.storage.js | 01-infrastructure/storage.js | ✅ Créé |
| 03.project.js | 03-services/project.service.js + 04-models/Project.js | ✅ Créé |

### Vues Principales
| Ancien | Nouveau | Statut |
|--------|---------|--------|
| 15.characters.js | 06-views/characters/ (3 fichiers) | ✅ Créé |
| 17.world.js | 06-views/locations/ (3 fichiers) | ✅ Créé |
| 19.notes.js | 06-views/notes/ (3 fichiers) | ✅ Créé |
| 06.structure.js | 06-views/structure/ (3 fichiers) | ✅ Créé |
| 44.storygrid.js | 06-views/story-grid/ (3 fichiers) | ✅ Créé |
| 45.arc-board.js | 06-views/arc-board/ (3 fichiers) | ✅ Créé |

### Fonctionnalités À Migrer
| Ancien | Nouveau | Statut |
|--------|---------|--------|
| 16.split-view.js | 06-views/split-view/ | ⏳ À faire |
| 18.timeline.js | 06-views/timeline/ | ⏳ À faire |
| 30.corkboard.js | 06-views/corkboard/ | ⏳ À faire |
| 31.mindmap.js | 06-views/mindmap/ | ⏳ À faire |
| 33.plot.js | 06-views/plot/ | ⏳ À faire |

## Avantages de cette Approche

1. **Migration Progressive** - Pas de big bang, changements incrémentaux
2. **Cohabitation** - Ancien et nouveau code fonctionnent ensemble
3. **Testable** - Chaque étape peut être testée indépendamment
4. **Réversible** - Possibilité de rollback si problème
5. **Réduction de Code** - ~60% de code en moins (1.6MB → 650KB estimé)

## Prochaine Étape Immédiate

**Créer `build-v2.py`** qui :
1. Charge la nouvelle architecture (js/00-core/, js/02-utils/, etc.)
2. Charge les anciens fichiers non encore migrés
3. Génère `plume-v2.html` pour tester

Voulez-vous que je commence par créer le nouveau script de build ?
