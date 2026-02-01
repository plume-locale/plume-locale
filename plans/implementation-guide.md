# Product Tour Implementation Guide

## Quick Start

This guide provides step-by-step instructions for implementing the product tour in Plume.

## Prerequisites

- Basic understanding of JavaScript ES6+
- Familiarity with Plume's codebase structure
- Access to modify HTML, CSS, and JS files

## Implementation Steps

### Step 1: Add Driver.js Library

**File**: `html/head.html`

Add the following lines before the closing `</head>` tag:

```html
<!-- Driver.js - Product Tour Library -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/driver.js@1.3.1/dist/driver.css"/>
<script src="https://cdn.jsdelivr.net/npm/driver.js@1.3.1/dist/driver.iife.js"></script>
```

**Alternative (Self-hosted)**:
Download Driver.js and host it locally if CDN is not preferred.

---

### Step 2: Create Tour Styles

**File**: `css/14.product-tour.css`

```css
/* ============================================
   PRODUCT TOUR STYLES
   ============================================ */

/* Custom Driver.js theme for Plume */
.driver-popover {
    background: var(--bg-primary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    max-width: 400px;
}

.driver-popover-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.75rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--border-color);
}

.driver-popover-description {
    font-size: 0.95rem;
    line-height: 1.6;
    color: var(--text-secondary);
}

.driver-popover-description p {
    margin-bottom: 0.75rem;
}

.driver-popover-description ul {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
}

.driver-popover-description li {
    margin-bottom: 0.5rem;
}

.driver-popover-description strong {
    color: var(--text-primary);
    font-weight: 600;
}

/* Progress indicator */
.driver-popover-progress-text {
    font-size: 0.85rem;
    color: var(--text-muted);
    margin-bottom: 1rem;
    text-align: center;
}

/* Navigation buttons */
.driver-popover-footer {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-color);
}

.driver-popover-btn {
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
}

.driver-popover-next-btn {
    background: var(--primary-color);
    color: white;
    flex: 1;
}

.driver-popover-next-btn:hover {
    background: var(--primary-hover);
    transform: translateY(-1px);
}

.driver-popover-prev-btn {
    background: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
}

.driver-popover-prev-btn:hover {
    background: var(--bg-tertiary);
}

.driver-popover-close-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 1.5rem;
    line-height: 1;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.driver-popover-close-btn:hover {
    color: var(--text-primary);
}

/* Highlighted element styling */
.driver-active-element {
    outline: 3px solid var(--primary-color) !important;
    outline-offset: 4px;
    border-radius: 8px;
}

/* Overlay */
.driver-overlay {
    background: rgba(0, 0, 0, 0.75);
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

/* Arrow styling */
.driver-popover-arrow {
    border-color: var(--bg-primary);
}

.driver-popover-arrow-side-top {
    border-top-color: var(--bg-primary);
}

.driver-popover-arrow-side-bottom {
    border-bottom-color: var(--bg-primary);
}

.driver-popover-arrow-side-left {
    border-left-color: var(--bg-primary);
}

.driver-popover-arrow-side-right {
    border-right-color: var(--bg-primary);
}

/* Welcome modal */
.tour-welcome-modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 2rem;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    animation: slideIn 0.3s ease;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translate(-50%, -45%);
    }
    to {
        opacity: 1;
        transform: translate(-50%, -50%);
    }
}

.tour-welcome-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.75);
    z-index: 9999;
    animation: fadeIn 0.3s ease;
}

.tour-welcome-header {
    text-align: center;
    margin-bottom: 1.5rem;
}

.tour-welcome-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.tour-welcome-title {
    font-size: 1.75rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
}

.tour-welcome-subtitle {
    font-size: 1rem;
    color: var(--text-secondary);
}

.tour-welcome-content {
    margin-bottom: 2rem;
    line-height: 1.6;
    color: var(--text-secondary);
}

.tour-welcome-actions {
    display: flex;
    gap: 1rem;
}

.tour-welcome-btn {
    flex: 1;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
}

.tour-welcome-btn-primary {
    background: var(--primary-color);
    color: white;
}

.tour-welcome-btn-primary:hover {
    background: var(--primary-hover);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.tour-welcome-btn-secondary {
    background: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
}

.tour-welcome-btn-secondary:hover {
    background: var(--bg-tertiary);
}

.tour-welcome-checkbox {
    margin-top: 1rem;
    text-align: center;
}

.tour-welcome-checkbox label {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: var(--text-muted);
    cursor: pointer;
}

.tour-welcome-checkbox input[type="checkbox"] {
    cursor: pointer;
}

/* Tour button in header */
.tour-trigger-btn {
    background: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    padding: 0.5rem;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.tour-trigger-btn:hover {
    background: var(--bg-secondary);
    color: var(--primary-color);
    border-color: var(--primary-color);
}

.tour-trigger-btn i {
    width: 18px;
    height: 18px;
}

/* Secondary highlight for related elements */
.tour-highlight-secondary {
    outline: 2px dashed var(--primary-color);
    outline-offset: 2px;
    border-radius: 4px;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
}

/* Mobile responsive styles */
@media (max-width: 768px) {
    .driver-popover {
        max-width: 90vw;
        margin: 1rem;
    }
    
    .tour-welcome-modal {
        padding: 1.5rem;
        max-width: 90%;
    }
    
    .tour-welcome-actions {
        flex-direction: column;
    }
    
    .driver-popover-footer {
        flex-direction: column;
    }
    
    .driver-popover-next-btn,
    .driver-popover-prev-btn {
        width: 100%;
    }
}

/* Dark theme adjustments */
@media (prefers-color-scheme: dark) {
    .driver-overlay {
        background: rgba(0, 0, 0, 0.85);
    }
}

/* Print styles - hide tour elements */
@media print {
    .driver-popover,
    .driver-overlay,
    .tour-welcome-modal,
    .tour-welcome-overlay,
    .tour-trigger-btn {
        display: none !important;
    }
}

/* Accessibility - high contrast mode */
@media (prefers-contrast: high) {
    .driver-active-element {
        outline-width: 4px;
    }
    
    .driver-popover {
        border-width: 2px;
    }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
    .driver-popover,
    .tour-welcome-modal,
    .driver-overlay,
    .tour-welcome-overlay {
        animation: none;
    }
    
    .tour-highlight-secondary {
        animation: none;
    }
}
```

---

### Step 3: Create Tour Steps Configuration

**File**: `js/48.tour-steps.js`

```javascript
// [MVVM : View]
// Product Tour Steps Configuration
// Defines all tour steps with their targets, content, and behavior

/**
 * Get all tour steps based on current context
 * @returns {Array} Array of tour step objects
 */
function getTourSteps() {
    const isMobile = window.innerWidth < 768;
    
    // Return simplified tour for mobile
    if (isMobile) {
        return getMobileTourSteps();
    }
    
    // Full desktop tour
    return getDesktopTourSteps();
}

/**
 * Desktop tour steps (full experience)
 */
function getDesktopTourSteps() {
    return [
        // Step 1: Welcome
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
            }
        },
        
        // Step 2: Project Title
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
        },
        
        // Step 3: Navigation
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
                    </ul>
                `,
                side: 'bottom',
                align: 'center'
            }
        },
        
        // Step 4: Sidebar
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
                `,
                side: 'right',
                align: 'start'
            }
        },
        
        // Step 5: Search
        {
            element: '#globalSearch',
            popover: {
                title: 'Recherche Globale',
                description: `
                    <p>Recherchez n'importe quel contenu dans votre projet : texte, personnages, lieux, notes...</p>
                `,
                side: 'right',
                align: 'start'
            }
        },
        
        // Step 6: Progress Bar
        {
            element: '#projectProgressBar',
            popover: {
                title: 'Progression du Projet',
                description: `
                    <p>Visualisez l'avancement de votre écriture par statut de scène.</p>
                `,
                side: 'right',
                align: 'start'
            }
        },
        
        // Step 7: Add Buttons
        {
            element: '.sidebar-actions',
            popover: {
                title: 'Ajouter du Contenu',
                description: `
                    <p>Créez rapidement de nouveaux actes, chapitres et scènes.</p>
                `,
                side: 'right',
                align: 'end'
            }
        },
        
        // Step 8: Editor
        {
            element: '#sceneEditor',
            popover: {
                title: 'Éditeur de Scène',
                description: `
                    <p>L'éditeur principal pour écrire vos scènes avec formatage riche et sauvegarde automatique.</p>
                `,
                side: 'left',
                align: 'start'
            }
        },
        
        // Step 9: Characters
        {
            element: '#header-tab-characters',
            popover: {
                title: 'Base de Données Personnages',
                description: `
                    <p>Gérez tous vos personnages avec des fiches détaillées.</p>
                `,
                side: 'bottom',
                align: 'start'
            }
        },
        
        // Step 10: Completion
        {
            popover: {
                title: '🎉 Visite Terminée !',
                description: `
                    <p>Vous connaissez maintenant les principales fonctionnalités de Plume.</p>
                    <p><strong>Bonne écriture ! ✍️</strong></p>
                `,
                side: 'center',
                align: 'center'
            }
        }
    ];
}

/**
 * Mobile tour steps (simplified)
 */
function getMobileTourSteps() {
    return [
        {
            element: '#headerProjectTitle',
            popover: {
                title: '🪶 Bienvenue',
                description: '<p>Découvrez Plume en quelques étapes.</p>',
                side: 'bottom',
                align: 'start'
            }
        },
        {
            element: '.mobile-nav-toggle-btn',
            popover: {
                title: 'Menu',
                description: '<p>Accédez à toutes les fonctionnalités ici.</p>',
                side: 'bottom',
                align: 'end'
            }
        },
        {
            popover: {
                title: '✅ Terminé',
                description: '<p>Explorez l\'application !</p>',
                side: 'center',
                align: 'center'
            }
        }
    ];
}
```

---

### Step 4: Create Main Tour Implementation

**File**: `js/47.product-tour.js`

```javascript
// [MVVM : ViewModel]
// Product Tour Implementation
// Manages the interactive product tour for new users

// Tour state
let tourDriver = null;
let tourState = {
    completed: false,
    skipped: false,
    currentStep: 0,
    lastShown: null,
    version: '1.0'
};

/**
 * Initialize the product tour system
 */
async function initProductTour() {
    // Load tour state from storage
    tourState = await loadTourState();
    
    // Check if this is a first-time user
    if (!tourState.completed && !tourState.skipped) {
        // Show welcome modal after a short delay
        setTimeout(() => {
            showTourWelcomeModal();
        }, 1000);
    }
}

/**
 * Load tour state from IndexedDB
 */
async function loadTourState() {
    const saved = await loadSetting('productTourState');
    return saved || {
        completed: false,
        skipped: false,
        currentStep: 0,
        lastShown: null,
        version: '1.0'
    };
}

/**
 * Save tour state to IndexedDB
 */
async function saveTourState(state) {
    tourState = { ...tourState, ...state };
    await saveSetting('productTourState', tourState);
}

/**
 * Show welcome modal
 */
function showTourWelcomeModal() {
    const overlay = document.createElement('div');
    overlay.className = 'tour-welcome-overlay';
    
    const modal = document.createElement('div');
    modal.className = 'tour-welcome-modal';
    modal.innerHTML = `
        <div class="tour-welcome-header">
            <div class="tour-welcome-icon">🪶</div>
            <h2 class="tour-welcome-title">Bienvenue dans Plume</h2>
            <p class="tour-welcome-subtitle">Votre compagnon d'écriture</p>
        </div>
        <div class="tour-welcome-content">
            <p>Plume est une application complète pour écrire, organiser et visualiser vos histoires.</p>
            <p>Voulez-vous découvrir les fonctionnalités principales ? La visite prend environ 3 minutes.</p>
        </div>
        <div class="tour-welcome-actions">
            <button class="tour-welcome-btn tour-welcome-btn-secondary" onclick="skipTourWelcome()">
                Plus tard
            </button>
            <button class="tour-welcome-btn tour-welcome-btn-primary" onclick="startTourFromWelcome()">
                Commencer la visite
            </button>
        </div>
        <div class="tour-welcome-checkbox">
            <label>
                <input type="checkbox" id="tourDontShowAgain">
                Ne plus afficher ce message
            </label>
        </div>
    `;
    
    document.body.appendChild(overlay);
    document.body.appendChild(modal);
}

/**
 * Start tour from welcome modal
 */
function startTourFromWelcome() {
    const dontShow = document.getElementById('tourDontShowAgain')?.checked;
    closeTourWelcomeModal();
    
    if (dontShow) {
        saveTourState({ skipped: true });
    }
    
    startProductTour();
}

/**
 * Skip tour from welcome modal
 */
function skipTourWelcome() {
    const dontShow = document.getElementById('tourDontShowAgain')?.checked;
    closeTourWelcomeModal();
    
    if (dontShow) {
        saveTourState({ skipped: true });
    }
}

/**
 * Close welcome modal
 */
function closeTourWelcomeModal() {
    document.querySelector('.tour-welcome-overlay')?.remove();
    document.querySelector('.tour-welcome-modal')?.remove();
}

/**
 * Start the product tour
 */
function startProductTour() {
    // Ensure we're on the editor view
    if (currentView !== 'editor') {
        switchView('editor');
    }
    
    // Initialize Driver.js
    if (typeof driver === 'undefined') {
        console.error('Driver.js not loaded');
        showNotification('❌ Erreur: Bibliothèque de visite non chargée', 'error');
        return;
    }
    
    // Get tour steps
    const steps = getTourSteps();
    
    // Create driver instance
    tourDriver = driver({
        showProgress: true,
        steps: steps,
        onDestroyStarted: () => {
            // Tour ended (completed or skipped)
            if (tourDriver && !tourDriver.isLastStep()) {
                // User skipped the tour
                saveTourState({ skipped: true, lastShown: Date.now() });
            } else {
                // User completed the tour
                saveTourState({ completed: true, lastShown: Date.now() });
                showNotification('✅ Visite guidée terminée !', 'success');
            }
        },
        onNextClick: () => {
            tourDriver.moveNext();
        },
        onPrevClick: () => {
            tourDriver.movePrevious();
        }
    });
    
    // Start the tour
    tourDriver.drive();
}

/**
 * Reset tour state (for testing or user request)
 */
async function resetProductTour() {
    await saveTourState({
        completed: false,
        skipped: false,
        currentStep: 0,
        lastShown: null
    });
    
    showNotification('✅ Visite guidée réinitialisée', 'success');
}
```

---

### Step 5: Add Tour Button to Header

**File**: `html/body.html`

Find the `.header-actions` section and add the tour button:

```html
<div class="header-actions">
    <!-- Existing buttons... -->
    
    <!-- Product Tour Button -->
    <button class="header-action-btn tour-trigger-btn" 
            onclick="startProductTour()" 
            title="Démarrer la visite guidée">
        <i data-lucide="help-circle"></i>
    </button>
    
    <!-- Rest of existing buttons... -->
</div>
```

---

### Step 6: Initialize Tour on App Start

**File**: `js/04.init.js`

Add tour initialization to the `init()` function:

```javascript
async function init() {
    // ... existing initialization code ...
    
    // Initialize product tour
    await initProductTour();
    
    // ... rest of initialization ...
}
```

---

### Step 7: Add CSS Import

**File**: `html/head.html`

Add the tour CSS import:

```html
<link rel="stylesheet" href="css/14.product-tour.css">
```

---

### Step 8: Add JS Script Tags

**File**: `html/body.html` or `html/footer.html`

Add the tour scripts before the closing `</body>` tag:

```html
<script src="js/48.tour-steps.js"></script>
<script src="js/47.product-tour.js"></script>
```

---

## Testing Checklist

After implementation, test the following:

### Functional Tests
- [ ] Tour starts automatically for first-time users
- [ ] Welcome modal appears with correct content
- [ ] "Start Tour" button launches the tour
- [ ] "Skip" button closes modal
- [ ] "Don't show again" checkbox works
- [ ] All tour steps display correctly
- [ ] Navigation buttons (Next/Previous) work
- [ ] Close button exits tour
- [ ] ESC key exits tour
- [ ] Tour completion is saved
- [ ] Tour button in header works
- [ ] Tour can be restarted

### Visual Tests
- [ ] Popovers position correctly
- [ ] Highlighted elements are visible
- [ ] Overlay dims background
- [ ] Animations are smooth
- [ ] Text is readable
- [ ] Icons display correctly
- [ ] Progress indicator shows

### Responsive Tests
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Different orientations

### Browser Tests
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### Accessibility Tests
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Screen reader announces steps
- [ ] Color contrast sufficient
- [ ] Reduced motion respected

---

## Troubleshooting

### Tour doesn't start
- Check if Driver.js is loaded: `console.log(typeof driver)`
- Check browser console for errors
- Verify tour state: `loadTourState().then(console.log)`

### Steps don't highlight correctly
- Verify element selectors exist in DOM
- Check if elements are visible
- Try adding delays for dynamic content

### Styling issues
- Check CSS variable definitions
- Verify CSS file is loaded
- Check for conflicting styles

---

## Customization

### Change tour content
Edit `js/48.tour-steps.js` and modify step descriptions.

### Change tour behavior
Edit `js/47.product-tour.js` and modify Driver.js configuration.

### Change tour styling
Edit `css/14.product-tour.css` and modify CSS variables and classes.

---

## Maintenance

### Adding new steps
1. Add step definition to `getTourSteps()` in `js/48.tour-steps.js`
2. Test the new step
3. Update documentation

### Updating existing steps
1. Modify step in `js/48.tour-steps.js`
2. Test changes
3. Consider incrementing tour version

### Removing steps
1. Remove step from `getTourSteps()`
2. Test tour flow
3. Update documentation

---

**Document Version**: 1.0  
**Last Updated**: 2026-02-01  
**Status**: Ready for Implementation
