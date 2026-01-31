// ============================================================
// word-repetition.main.js - Point d'entrée et initialisation
// ============================================================

/**
 * [MVVM : Other]
 * Toggle l'affichage du panneau de répétitions de mots
 */
function toggleWordRepetitionPanel() {
    const container = document.getElementById('wordRepetitionContainer');
    const btn = document.getElementById('toolRepetitionBtn');

    if (!container) return;

    const isVisible = container.style.display !== 'none';

    if (isVisible) {
        container.style.display = 'none';
        if (btn) btn.classList.remove('active');
        WordRepetitionState.panelVisible = false;
        // Nettoyer les surlignages quand on ferme le panneau
        clearWordRepetitionHighlights();
    } else {
        container.style.display = 'block';
        if (btn) btn.classList.add('active');
        WordRepetitionState.panelVisible = true;

        // Initialiser le panneau si nécessaire
        initWordRepetitionPanel();
    }
}

/**
 * [MVVM : Other]
 * Affiche le panneau de répétitions (utile pour affichage programmatique)
 */
function showWordRepetitionPanel() {
    const container = document.getElementById('wordRepetitionContainer');
    const btn = document.getElementById('toolRepetitionBtn');

    if (!container) return;

    container.style.display = 'block';
    if (btn) btn.classList.add('active');
    WordRepetitionState.panelVisible = true;

    initWordRepetitionPanel();
}

/**
 * [MVVM : Other]
 * Cache le panneau de répétitions
 */
function hideWordRepetitionPanel() {
    const container = document.getElementById('wordRepetitionContainer');
    const btn = document.getElementById('toolRepetitionBtn');

    if (!container) return;

    container.style.display = 'none';
    if (btn) btn.classList.remove('active');
    WordRepetitionState.panelVisible = false;
    // Nettoyer les surlignages
    clearWordRepetitionHighlights();
}

/**
 * [MVVM : Other]
 * Nettoie tous les surlignages de répétition dans l'éditeur
 */
function clearWordRepetitionHighlights() {
    if (typeof WordRepetitionHandlers !== 'undefined' && WordRepetitionHandlers._clearAllHighlights) {
        WordRepetitionHandlers._clearAllHighlights();
    }
}

/**
 * [MVVM : Other]
 * Lance une analyse rapide pour la scène courante et affiche le résultat
 */
function analyzeCurrentSceneRepetitions() {
    showWordRepetitionPanel();

    // Lancer l'analyse après un court délai pour laisser le panneau s'afficher
    setTimeout(() => {
        WordRepetitionHandlers.onRefresh();
    }, 100);
}

/**
 * [MVVM : Other]
 * Intégration avec l'ouverture de scène
 * Appelé automatiquement quand une scène est ouverte
 */
function onSceneOpenedForRepetition() {
    if (WordRepetitionState.panelVisible) {
        // Effacer le rapport précédent car la scène a changé
        WordRepetitionViewModel.clearReport();

        // Re-rendre le panneau pour afficher l'état vide
        const container = document.getElementById('wordRepetitionContainer');
        if (container) {
            WordRepetitionView.renderPanel(container);
        }
    }
}

/**
 * [MVVM : Other]
 * Raccourci clavier pour analyser les répétitions
 * Ctrl+Shift+R
 */
function setupWordRepetitionKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl+Shift+R : Analyser les répétitions
        if (e.ctrlKey && e.shiftKey && e.key === 'R') {
            e.preventDefault();
            analyzeCurrentSceneRepetitions();
        }
    });
}

/**
 * [MVVM : Other]
 * Initialisation au chargement de l'application
 */
function initWordRepetitionModule() {
    // Configurer les raccourcis clavier
    setupWordRepetitionKeyboardShortcuts();

    // Restaurer l'état du panneau si il était ouvert
    const prefs = WordRepetitionRepository.getPreferences();
    if (!prefs.panelCollapsed && WordRepetitionState.panelVisible) {
        showWordRepetitionPanel();
    }

    console.log('[WordRepetition] Module initialisé');
}

// Auto-initialisation lorsque le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWordRepetitionModule);
} else {
    // DOM déjà prêt
    setTimeout(initWordRepetitionModule, 100);
}

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        toggleWordRepetitionPanel,
        showWordRepetitionPanel,
        hideWordRepetitionPanel,
        clearWordRepetitionHighlights,
        analyzeCurrentSceneRepetitions,
        onSceneOpenedForRepetition,
        initWordRepetitionModule
    };
}
