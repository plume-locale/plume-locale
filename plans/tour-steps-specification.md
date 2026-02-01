# Product Tour Steps Specification

## Overview

This document defines all tour steps for the Plume product tour, including element selectors, content, positioning, and interactions.

## Tour Configuration

```javascript
const TOUR_CONFIG = {
    animate: true,
    opacity: 0.75,
    padding: 10,
    allowClose: true,
    overlayClickNext: false,
    doneBtnText: 'Terminer',
    closeBtnText: 'Fermer',
    nextBtnText: 'Suivant',
    prevBtnText: 'Précédent',
    showProgress: true,
    progressText: 'Étape {{current}} sur {{total}}',
    showButtons: ['next', 'previous', 'close'],
    disableActiveInteraction: false
};
```

## Tour Steps Definition

### Stage 1: Welcome & Orientation

#### Step 1: Welcome to Plume
```javascript
{
    element: '#headerProjectTitle',
    popover: {
        title: '🪶 Bienvenue dans Plume',
        description: `
            <p>Plume est votre espace d'écriture complet pour créer des histoires captivantes.</p>
            <p>Cette visite guidée vous présentera les fonctionnalités principales en quelques minutes.</p>
            <p><strong>Vous pouvez quitter à tout moment en appuyant sur Échap.</strong></p>
        `,
        side: 'bottom',
        align: 'start'
    },
    onHighlightStarted: () => {
        // Ensure we're on the editor view
        if (currentView !== 'editor') {
            switchView('editor');
        }
    }
}
```

#### Step 2: Project Title
```javascript
{
    element: '#headerProjectTitle',
    popover: {
        title: 'Titre du Projet',
        description: `
            <p>Cliquez sur le titre pour renommer votre projet.</p>
            <p>Chaque projet est sauvegardé automatiquement dans votre navigateur.</p>
        `,
        side: 'bottom',
        align: 'start'
    }
}
```

#### Step 3: Navigation Header
```javascript
{
    element: '.header-nav',
    popover: {
        title: 'Navigation Principale',
        description: `
            <p>La barre de navigation vous permet d'accéder à toutes les fonctionnalités :</p>
            <ul>
                <li><strong>Structure</strong> : Écriture et organisation</li>
                <li><strong>Personnages</strong> : Base de données des personnages</li>
                <li><strong>Univers</strong> : Lieux et éléments du monde</li>
                <li><strong>Visualisations</strong> : Graphiques et cartes</li>
                <li><strong>Outils</strong> : Statistiques et analyse</li>
            </ul>
        `,
        side: 'bottom',
        align: 'center'
    }
}
```

#### Step 4: Header Actions
```javascript
{
    element: '.header-actions',
    popover: {
        title: 'Actions Rapides',
        description: `
            <p>Accédez rapidement aux fonctions essentielles :</p>
            <ul>
                <li><strong>Annuler/Rétablir</strong> : Historique des modifications</li>
                <li><strong>Timer Pomodoro</strong> : Gestion du temps d'écriture</li>
                <li><strong>Thèmes</strong> : Personnalisation de l'interface</li>
                <li><strong>Projets</strong> : Gestion de vos projets</li>
            </ul>
        `,
        side: 'bottom',
        align: 'end'
    }
}
```

### Stage 2: Core Writing Features

#### Step 5: Sidebar Structure
```javascript
{
    element: '.sidebar',
    popover: {
        title: 'Structure du Projet',
        description: `
            <p>La barre latérale affiche la structure de votre histoire :</p>
            <ul>
                <li><strong>Actes</strong> : Grandes parties de votre récit</li>
                <li><strong>Chapitres</strong> : Subdivisions des actes</li>
                <li><strong>Scènes</strong> : Unités d'écriture individuelles</li>
            </ul>
            <p>Cliquez sur une scène pour l'éditer.</p>
        `,
        side: 'right',
        align: 'start'
    }
}
```

#### Step 6: Search Function
```javascript
{
    element: '#globalSearch',
    popover: {
        title: 'Recherche Globale',
        description: `
            <p>Recherchez n'importe quel contenu dans votre projet :</p>
            <ul>
                <li>Texte des scènes</li>
                <li>Noms de personnages</li>
                <li>Éléments de l'univers</li>
                <li>Notes et annotations</li>
            </ul>
        `,
        side: 'right',
        align: 'start'
    }
}
```

#### Step 7: Progress Bar
```javascript
{
    element: '#projectProgressBar',
    popover: {
        title: 'Progression du Projet',
        description: `
            <p>Visualisez l'avancement de votre écriture :</p>
            <ul>
                <li><span style="color: var(--status-draft)">●</span> Brouillon</li>
                <li><span style="color: var(--status-progress)">●</span> En cours</li>
                <li><span style="color: var(--status-review)">●</span> À réviser</li>
                <li><span style="color: var(--status-complete)">●</span> Terminé</li>
            </ul>
        `,
        side: 'right',
        align: 'start'
    }
}
```

#### Step 8: Status Filters
```javascript
{
    element: '#statusFilters',
    popover: {
        title: 'Filtres de Statut',
        description: `
            <p>Filtrez les scènes par statut pour vous concentrer sur ce qui compte.</p>
            <p>Cliquez sur un filtre pour masquer/afficher les scènes correspondantes.</p>
        `,
        side: 'right',
        align: 'start'
    }
}
```

#### Step 9: Add Content Buttons
```javascript
{
    element: '.sidebar-actions',
    popover: {
        title: 'Ajouter du Contenu',
        description: `
            <p>Créez rapidement de nouveaux éléments :</p>
            <ul>
                <li><strong>+ Acte</strong> : Nouvelle grande partie</li>
                <li><strong>+ Chapitre</strong> : Nouveau chapitre</li>
                <li><strong>+ Scène</strong> : Nouvelle scène</li>
            </ul>
        `,
        side: 'right',
        align: 'end'
    }
}
```

#### Step 10: Scene Editor
```javascript
{
    element: '#sceneEditor',
    popover: {
        title: 'Éditeur de Scène',
        description: `
            <p>L'éditeur principal pour écrire vos scènes.</p>
            <p>Fonctionnalités disponibles :</p>
            <ul>
                <li>Formatage de texte riche</li>
                <li>Détection automatique des personnages</li>
                <li>Compteur de mots en temps réel</li>
                <li>Sauvegarde automatique</li>
            </ul>
        `,
        side: 'left',
        align: 'start'
    },
    onHighlightStarted: () => {
        // Make sure we have a scene selected
        if (!currentSceneId && project.acts.length > 0) {
            const firstAct = project.acts[0];
            if (firstAct.chapters.length > 0) {
                const firstChapter = firstAct.chapters[0];
                if (firstChapter.scenes.length > 0) {
                    const firstScene = firstChapter.scenes[0];
                    currentActId = firstAct.id;
                    currentChapterId = firstChapter.id;
                    currentSceneId = firstScene.id;
                    renderEditor();
                }
            }
        }
    }
}
```

#### Step 11: Editor Toolbar
```javascript
{
    element: '#editorToolbar',
    popover: {
        title: 'Barre d\'Outils',
        description: `
            <p>Formatez votre texte avec les outils d'édition :</p>
            <ul>
                <li>Gras, italique, souligné</li>
                <li>Titres et listes</li>
                <li>Couleurs et surlignage</li>
                <li>Liens et images</li>
            </ul>
        `,
        side: 'bottom',
        align: 'start'
    }
}
```

#### Step 12: Scene Status
```javascript
{
    element: '.scene-status-badge',
    popover: {
        title: 'Statut de la Scène',
        description: `
            <p>Cliquez sur le badge pour changer le statut de la scène.</p>
            <p>Utilisez les statuts pour suivre votre progression :</p>
            <ul>
                <li><strong>Brouillon</strong> : Première version</li>
                <li><strong>En cours</strong> : En cours d'écriture</li>
                <li><strong>À réviser</strong> : Nécessite une relecture</li>
                <li><strong>Terminé</strong> : Version finale</li>
            </ul>
        `,
        side: 'top',
        align: 'start'
    }
}
```

#### Step 13: Links Panel
```javascript
{
    element: '#linksPanel',
    popover: {
        title: 'Liens Automatiques',
        description: `
            <p>Plume détecte automatiquement les personnages et éléments mentionnés dans votre texte.</p>
            <p>Cliquez sur un lien pour accéder à sa fiche détaillée.</p>
        `,
        side: 'left',
        align: 'start'
    }
}
```

#### Step 14: Split View
```javascript
{
    element: '#splitModeToggle',
    popover: {
        title: 'Mode Split',
        description: `
            <p>Activez le mode split pour afficher deux scènes côte à côte.</p>
            <p>Idéal pour :</p>
            <ul>
                <li>Comparer deux versions</li>
                <li>Référencer une scène en écrivant</li>
                <li>Travailler sur plusieurs scènes</li>
            </ul>
        `,
        side: 'bottom',
        align: 'end'
    }
}
```

### Stage 3: Database Features

#### Step 15: Characters Tab
```javascript
{
    element: '#header-tab-characters',
    popover: {
        title: 'Base de Données Personnages',
        description: `
            <p>Gérez tous vos personnages au même endroit.</p>
            <p>Créez des fiches détaillées avec :</p>
            <ul>
                <li>Informations biographiques</li>
                <li>Apparence et traits</li>
                <li>Relations avec d'autres personnages</li>
                <li>Arcs narratifs</li>
            </ul>
            <p><em>Cliquez pour découvrir cette section.</em></p>
        `,
        side: 'bottom',
        align: 'start'
    },
    onNext: () => {
        switchView('characters');
    }
}
```

#### Step 16: Character List
```javascript
{
    element: '#charactersList',
    popover: {
        title: 'Liste des Personnages',
        description: `
            <p>Organisez vos personnages par groupes :</p>
            <ul>
                <li>Protagonistes</li>
                <li>Antagonistes</li>
                <li>Personnages secondaires</li>
                <li>Groupes personnalisés</li>
            </ul>
            <p>Cliquez sur un personnage pour voir sa fiche complète.</p>
        `,
        side: 'right',
        align: 'start'
    }
}
```

#### Step 17: World Tab
```javascript
{
    element: '#header-tab-world',
    popover: {
        title: 'Univers et Worldbuilding',
        description: `
            <p>Construisez votre univers avec des fiches détaillées :</p>
            <ul>
                <li><strong>Lieux</strong> : Villes, bâtiments, régions</li>
                <li><strong>Objets</strong> : Artefacts, technologies</li>
                <li><strong>Concepts</strong> : Magie, systèmes politiques</li>
                <li><strong>Organisations</strong> : Guildes, gouvernements</li>
            </ul>
        `,
        side: 'bottom',
        align: 'start'
    },
    onNext: () => {
        switchView('world');
    }
}
```

#### Step 18: Notes and Codex
```javascript
{
    element: '#header-tab-notes',
    popover: {
        title: 'Notes et Codex',
        description: `
            <p><strong>Notes</strong> : Idées, recherches, brouillons</p>
            <p><strong>Codex</strong> : Wiki de votre univers avec entrées structurées</p>
            <p>Parfait pour organiser vos recherches et votre worldbuilding.</p>
        `,
        side: 'bottom',
        align: 'start'
    }
}
```

### Stage 4: Visualization Tools

#### Step 19: Visualization Tools
```javascript
{
    element: '.nav-group:nth-child(3)',
    popover: {
        title: 'Outils de Visualisation',
        description: `
            <p>Visualisez votre histoire de différentes manières :</p>
            <ul>
                <li><strong>Mindmap</strong> : Carte mentale de vos idées</li>
                <li><strong>Relations</strong> : Graphe des relations entre personnages</li>
                <li><strong>Carte</strong> : Carte géographique de votre univers</li>
                <li><strong>Timeline</strong> : Chronologie des événements</li>
            </ul>
        `,
        side: 'bottom',
        align: 'center'
    }
}
```

#### Step 20: Corkboard View
```javascript
{
    element: '#header-tab-corkboard',
    popover: {
        title: 'Vue Tableau (Corkboard)',
        description: `
            <p>Visualisez vos scènes comme des cartes sur un tableau.</p>
            <p>Idéal pour :</p>
            <ul>
                <li>Vue d'ensemble de votre structure</li>
                <li>Réorganisation par glisser-déposer</li>
                <li>Planification visuelle</li>
            </ul>
        `,
        side: 'bottom',
        align: 'start'
    }
}
```

#### Step 21: Plot Tracking
```javascript
{
    element: '#header-tab-plot',
    popover: {
        title: 'Suivi de l\'Intrigue',
        description: `
            <p>Suivez l'évolution de votre intrigue scène par scène.</p>
            <p>Visualisez :</p>
            <ul>
                <li>La tension narrative</li>
                <li>Les arcs des personnages</li>
                <li>Les points de retournement</li>
                <li>Le rythme de l'histoire</li>
            </ul>
        `,
        side: 'bottom',
        align: 'start'
    }
}
```

#### Step 22: Narrative Arcs
```javascript
{
    element: '#header-tab-arcs',
    popover: {
        title: 'Arcs Narratifs',
        description: `
            <p>Créez et suivez plusieurs arcs narratifs parallèles :</p>
            <ul>
                <li>Arc principal</li>
                <li>Arcs secondaires</li>
                <li>Arcs de personnages</li>
                <li>Sous-intrigues</li>
            </ul>
            <p>Visualisez comment ils s'entrecroisent dans votre histoire.</p>
        `,
        side: 'bottom',
        align: 'start'
    }
}
```

#### Step 23: Thriller Board
```javascript
{
    element: '#header-tab-thriller',
    popover: {
        title: 'Tableau Thriller',
        description: `
            <p>Outil spécialisé pour les histoires à mystère :</p>
            <ul>
                <li><strong>Indices</strong> : Pistes et preuves</li>
                <li><strong>Secrets</strong> : Informations cachées</li>
                <li><strong>Alibis</strong> : Emplois du temps</li>
                <li><strong>Questions</strong> : Mystères à résoudre</li>
                <li><strong>Révélations</strong> : Moments clés</li>
            </ul>
        `,
        side: 'bottom',
        align: 'start'
    }
}
```

### Stage 5: Advanced Features

#### Step 24: Statistics
```javascript
{
    element: '#header-tab-stats',
    popover: {
        title: 'Statistiques',
        description: `
            <p>Suivez votre progression d'écriture :</p>
            <ul>
                <li>Nombre de mots total et par section</li>
                <li>Objectifs quotidiens</li>
                <li>Historique d'écriture</li>
                <li>Temps de lecture estimé</li>
            </ul>
        `,
        side: 'bottom',
        align: 'start'
    }
}
```

#### Step 25: Analysis Tools
```javascript
{
    element: '#header-tab-analysis',
    popover: {
        title: 'Analyse de Texte',
        description: `
            <p>Analysez la qualité de votre écriture :</p>
            <ul>
                <li>Répétitions de mots</li>
                <li>Lisibilité</li>
                <li>Longueur des phrases</li>
                <li>Distribution narration/dialogue</li>
                <li>Fréquence des mots</li>
            </ul>
        `,
        side: 'bottom',
        align: 'start'
    }
}
```

#### Step 26: Snapshots
```javascript
{
    element: '#header-tab-versions',
    popover: {
        title: 'Snapshots et Versions',
        description: `
            <p>Créez des instantanés de votre projet à différents moments.</p>
            <p>Utile pour :</p>
            <ul>
                <li>Sauvegarder des versions importantes</li>
                <li>Comparer différentes versions</li>
                <li>Revenir en arrière si nécessaire</li>
                <li>Expérimenter sans risque</li>
            </ul>
        `,
        side: 'bottom',
        align: 'start'
    }
}
```

#### Step 27: Storage Badge
```javascript
{
    element: '#storage-badge',
    popover: {
        title: 'Espace de Stockage',
        description: `
            <p>Surveillez l'utilisation de votre espace de stockage local.</p>
            <p>Plume sauvegarde tout dans votre navigateur (IndexedDB).</p>
            <p><strong>Conseil</strong> : Exportez régulièrement vos projets pour les sauvegarder.</p>
        `,
        side: 'bottom',
        align: 'end'
    }
}
```

#### Step 28: Project Management
```javascript
{
    element: 'button[onclick="openProjectsModal()"]',
    popover: {
        title: 'Gestion des Projets',
        description: `
            <p>Gérez tous vos projets d'écriture :</p>
            <ul>
                <li>Créer de nouveaux projets</li>
                <li>Basculer entre projets</li>
                <li>Exporter/Importer des projets</li>
                <li>Supprimer des projets</li>
            </ul>
        `,
        side: 'bottom',
        align: 'end'
    }
}
```

### Stage 6: Completion

#### Step 29: Tour Complete
```javascript
{
    element: 'body',
    popover: {
        title: '🎉 Visite Terminée !',
        description: `
            <p>Vous connaissez maintenant les principales fonctionnalités de Plume.</p>
            
            <h4>Prochaines étapes :</h4>
            <ol>
                <li>Créez votre premier acte et chapitre</li>
                <li>Écrivez votre première scène</li>
                <li>Ajoutez vos personnages</li>
                <li>Explorez les outils de visualisation</li>
            </ol>
            
            <p><strong>Astuce</strong> : Vous pouvez relancer cette visite à tout moment en cliquant sur le bouton <i data-lucide="help-circle"></i> dans l'en-tête.</p>
            
            <p style="text-align: center; margin-top: 1.5rem;">
                <strong>Bonne écriture ! ✍️</strong>
            </p>
        `,
        side: 'center',
        align: 'center'
    },
    onDeselected: () => {
        // Mark tour as completed
        saveTourState({ completed: true, completedAt: Date.now() });
        showNotification('✅ Visite guidée terminée !', 'success');
    }
}
```

## Mobile Tour Steps (Simplified)

For mobile devices (< 768px), use a condensed version with 10 key steps:

1. Welcome
2. Project Title
3. Mobile Navigation
4. Sidebar Structure
5. Scene Editor
6. Characters
7. World
8. Visualizations Overview
9. Statistics
10. Tour Complete

## Conditional Steps

Some steps should only appear under certain conditions:

### If No Content Exists
```javascript
{
    condition: () => project.acts.length === 0,
    element: '.sidebar-actions',
    popover: {
        title: 'Commencez Ici',
        description: `
            <p>Votre projet est vide. Commencez par créer votre premier acte !</p>
            <p>Cliquez sur <strong>+ Acte</strong> pour démarrer.</p>
        `,
        side: 'right',
        align: 'end'
    }
}
```

### If Split View is Active
```javascript
{
    condition: () => splitViewActive,
    element: '.split-container',
    popover: {
        title: 'Mode Split Actif',
        description: `
            <p>Vous êtes en mode split. Vous pouvez :</p>
            <ul>
                <li>Redimensionner les panneaux</li>
                <li>Afficher différentes scènes</li>
                <li>Basculer entre les panneaux</li>
            </ul>
        `,
        side: 'top',
        align: 'center'
    }
}
```

## Step Interactions

### Auto-Navigation Steps
Some steps automatically navigate to the relevant view:

```javascript
onNext: () => {
    switchView('characters');
    // Wait for view to render
    setTimeout(() => driver.moveNext(), 300);
}
```

### Highlight Multiple Elements
For complex UI areas:

```javascript
onHighlightStarted: () => {
    // Add custom highlighting
    document.querySelectorAll('.related-element').forEach(el => {
        el.classList.add('tour-highlight-secondary');
    });
},
onDeselected: () => {
    // Remove custom highlighting
    document.querySelectorAll('.related-element').forEach(el => {
        el.classList.remove('tour-highlight-secondary');
    });
}
```

## Accessibility Enhancements

### ARIA Labels
```javascript
{
    element: '#someElement',
    popover: {
        title: 'Feature Name',
        description: 'Feature description',
        ariaLabel: 'Tour step: Feature Name. Feature description.'
    }
}
```

### Keyboard Shortcuts
- `Esc`: Exit tour
- `Enter`: Next step
- `Shift+Enter`: Previous step
- `Tab`: Navigate within popover
- `Space`: Activate buttons

## Localization Support

Structure for future translations:

```javascript
const tourSteps = {
    fr: [ /* French steps */ ],
    en: [ /* English steps */ ],
    es: [ /* Spanish steps */ ]
};

const currentLanguage = loadSetting('language') || 'fr';
const steps = tourSteps[currentLanguage];
```

## Analytics Events (Optional)

Track tour engagement:

```javascript
// Tour started
trackEvent('tour_started', { timestamp: Date.now() });

// Step viewed
trackEvent('tour_step_viewed', { step: stepNumber, stepId: stepId });

// Tour completed
trackEvent('tour_completed', { duration: completionTime });

// Tour skipped
trackEvent('tour_skipped', { lastStep: currentStep });
```

---

**Document Version**: 1.0  
**Last Updated**: 2026-02-01  
**Status**: Ready for Implementation
