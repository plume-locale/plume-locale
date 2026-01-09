/**
 * History Service
 * Gestion de l'historique (Undo/Redo) pour le projet
 */

const HistoryService = (() => {
    'use strict';

    // Configuration
    const MAX_HISTORY_SIZE = 50;
    const DEBOUNCE_DELAY = 1000; // 1 seconde

    // État
    let historyStack = [];
    let redoStack = [];
    let debounceTimer = null;
    let isUndoRedoAction = false;

    /**
     * Sauvegarde l'état actuel dans l'historique
     */
    function saveToHistory() {
        const state = StateManager.getState();
        const project = state.project;

        if (!project || isUndoRedoAction) {
            return;
        }

        console.log('[History] Sauvegarde - Stack:', historyStack.length);

        // Créer une copie profonde du projet
        const snapshot = JSON.parse(JSON.stringify(project));

        // Ajouter à l'historique
        historyStack.push(snapshot);

        // Limiter la taille
        if (historyStack.length > MAX_HISTORY_SIZE) {
            historyStack.shift();
        }

        // Vider le redo stack car on a fait une nouvelle action
        redoStack = [];

        console.log('[History] État sauvegardé - Total:', historyStack.length);

        // Mettre à jour l'UI
        updateButtons();
    }

    /**
     * Sauvegarde immédiatement (annule le debounce)
     */
    function saveToHistoryImmediate() {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
            debounceTimer = null;
        }
        saveToHistory();
    }

    /**
     * Sauvegarde avec debounce (pour les modifications fréquentes)
     */
    function saveToHistoryDebounced() {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        debounceTimer = setTimeout(() => {
            saveToHistory();
            debounceTimer = null;
        }, DEBOUNCE_DELAY);
    }

    /**
     * Annule la dernière action
     */
    async function undo() {
        console.log('[History] Undo - Stack:', historyStack.length);

        if (historyStack.length === 0) {
            console.log('[History] Historique vide');
            if (window.ToastUI) {
                ToastUI.warning('Aucune action à annuler');
            } else {
                showNotification('⚠️ Aucune action à annuler');
            }
            return;
        }

        try {
            // Sauvegarder l'état actuel dans le redo stack
            const state = StateManager.getState();
            redoStack.push(JSON.parse(JSON.stringify(state.project)));
            console.log('[History] État actuel → redoStack');

            // Restaurer l'état précédent
            const previousState = historyStack.pop();
            console.log('[History] État précédent récupéré - Reste:', historyStack.length);

            // Flag pour éviter de sauvegarder cette restauration
            isUndoRedoAction = true;

            // Mettre à jour l'état
            StateManager.setState({ project: JSON.parse(JSON.stringify(previousState)) });

            // Aussi mettre à jour window.project pour compatibilité
            window.project = JSON.parse(JSON.stringify(previousState));

            // Sauvegarder
            if (window.StorageService) {
                await StorageService.saveProject(previousState);
            } else if (typeof saveProject === 'function') {
                await window.saveProject();
            }

            // Rafraîchir les vues
            refreshAllViews();

            isUndoRedoAction = false;
            updateButtons();

            if (window.ToastUI) {
                ToastUI.success('Action annulée');
            } else {
                showNotification('↶ Annulé');
            }

        } catch (error) {
            console.error('[History] Erreur undo:', error);
            isUndoRedoAction = false;
            if (window.ToastUI) {
                ToastUI.error('Erreur lors de l\'annulation');
            }
        }
    }

    /**
     * Rétablit la dernière action annulée
     */
    async function redo() {
        console.log('[History] Redo - RedoStack:', redoStack.length);

        if (redoStack.length === 0) {
            if (window.ToastUI) {
                ToastUI.warning('Aucune action à rétablir');
            } else {
                showNotification('⚠️ Aucune action à rétablir');
            }
            return;
        }

        try {
            // Sauvegarder l'état actuel dans l'historique
            const state = StateManager.getState();
            historyStack.push(JSON.parse(JSON.stringify(state.project)));

            // Restaurer l'état suivant
            const nextState = redoStack.pop();

            // Flag pour éviter de sauvegarder cette restauration
            isUndoRedoAction = true;

            // Mettre à jour l'état
            StateManager.setState({ project: JSON.parse(JSON.stringify(nextState)) });

            // Aussi mettre à jour window.project pour compatibilité
            window.project = JSON.parse(JSON.stringify(nextState));

            // Sauvegarder
            if (window.StorageService) {
                await StorageService.saveProject(nextState);
            } else if (typeof saveProject === 'function') {
                await window.saveProject();
            }

            // Rafraîchir les vues
            refreshAllViews();

            isUndoRedoAction = false;
            updateButtons();

            if (window.ToastUI) {
                ToastUI.success('Action rétablie');
            } else {
                showNotification('↷ Rétabli');
            }

        } catch (error) {
            console.error('[History] Erreur redo:', error);
            isUndoRedoAction = false;
            if (window.ToastUI) {
                ToastUI.error('Erreur lors du rétablissement');
            }
        }
    }

    /**
     * Rafraîchit toutes les vues
     */
    function refreshAllViews() {
        // Utiliser le nouveau système
        if (window.EventBus) {
            EventBus.emit('project:updated');
        }

        // Fallback: ancien système
        if (typeof renderActsList === 'function') {
            renderActsList();
        }
        if (typeof renderCharactersList === 'function') {
            renderCharactersList();
        }
        if (typeof renderWorldList === 'function') {
            renderWorldList();
        }
        if (typeof renderNotesList === 'function') {
            renderNotesList();
        }
    }

    /**
     * Affiche une notification simple
     * @param {string} message - Message à afficher
     */
    function showNotification(message) {
        if (window.ToastUI) {
            ToastUI.info(message);
        } else {
            // Notification basique
            const notification = document.createElement('div');
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--bg-secondary);
                color: var(--text-primary);
                padding: 1rem 1.5rem;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 10000;
            `;
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 2000);
        }
    }

    /**
     * Met à jour l'état des boutons undo/redo
     */
    function updateButtons() {
        const undoDisabled = historyStack.length === 0;
        const redoDisabled = redoStack.length === 0;

        // Boutons dans le header
        const headerUndoBtn = document.getElementById('headerUndoBtn');
        const headerRedoBtn = document.getElementById('headerRedoBtn');

        if (headerUndoBtn) {
            headerUndoBtn.disabled = undoDisabled;
            headerUndoBtn.title = historyStack.length > 0
                ? `Annuler (${historyStack.length} action(s) disponible(s)) - Ctrl+Z`
                : 'Aucune action à annuler';
        }

        if (headerRedoBtn) {
            headerRedoBtn.disabled = redoDisabled;
            headerRedoBtn.title = redoStack.length > 0
                ? `Rétablir (${redoStack.length} action(s) disponible(s)) - Ctrl+Y`
                : 'Aucune action à rétablir';
        }

        // Boutons dans le menu mobile
        const mobileUndoBtn = document.getElementById('mobileUndoBtn');
        const mobileRedoBtn = document.getElementById('mobileRedoBtn');

        if (mobileUndoBtn) {
            mobileUndoBtn.disabled = undoDisabled;
            mobileUndoBtn.style.opacity = undoDisabled ? '0.5' : '1';
            mobileUndoBtn.style.cursor = undoDisabled ? 'not-allowed' : 'pointer';
        }

        if (mobileRedoBtn) {
            mobileRedoBtn.disabled = redoDisabled;
            mobileRedoBtn.style.opacity = redoDisabled ? '0.5' : '1';
            mobileRedoBtn.style.cursor = redoDisabled ? 'not-allowed' : 'pointer';
        }
    }

    /**
     * Initialise le service d'historique
     */
    function init() {
        // S'abonner aux changements de projet
        if (window.StateManager) {
            StateManager.subscribeAll((state) => {
                if (state.project && !isUndoRedoAction) {
                    saveToHistoryDebounced();
                }
            });
        }

        // Écouter les raccourcis clavier
        document.addEventListener('keydown', (e) => {
            // Ctrl+Z - Undo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                undo();
            }
            // Ctrl+Y ou Ctrl+Shift+Z - Redo
            else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                redo();
            }
        });

        // Initialiser les boutons
        updateButtons();

        console.log('[History] Service initialisé');
    }

    /**
     * Réinitialise l'historique
     */
    function clear() {
        historyStack = [];
        redoStack = [];
        updateButtons();
    }

    // API publique
    return {
        init,
        clear,
        undo,
        redo,
        saveToHistory,
        saveToHistoryImmediate,
        saveToHistoryDebounced,
        updateButtons
    };
})();

// Exposer globalement pour compatibilité
window.HistoryService = HistoryService;
window.undo = () => HistoryService.undo();
window.redo = () => HistoryService.redo();
window.saveToHistory = () => HistoryService.saveToHistoryImmediate();
window.saveToHistoryImmediate = () => HistoryService.saveToHistoryImmediate();
window.updateUndoRedoButtons = () => HistoryService.updateButtons();

// Auto-initialisation
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => HistoryService.init());
} else {
    HistoryService.init();
}
