/**
 * Keyboard Service
 * Gestion des raccourcis clavier globaux de l'application
 */

const KeyboardService = (() => {
    'use strict';

    /**
     * Ferme toutes les modales ouvertes
     */
    function closeAllModals() {
        // Utiliser le nouveau système ModalUI si disponible
        if (window.ModalUI && typeof ModalUI.close === 'function') {
            ModalUI.close();
        }

        // Fallback: fermer les modales de l'ancien système
        const oldModals = [
            'addChapterModal',
            'addSceneModal',
            'addActModal',
            'addCharacterModal',
            'addWorldModal',
            'addTimelineModal',
            'addNoteModal',
            'addCodexModal',
            'backupModal',
            'referencesModal',
            'projectsModal',
            'newProjectModal'
        ];

        oldModals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.remove('active');
            }
        });

        // Fermer les résultats de recherche si ouverts
        if (typeof closeSearchResults === 'function') {
            closeSearchResults();
        }
    }

    /**
     * Ferme le panneau de focus s'il est ouvert
     */
    function closeFocusPanel() {
        if (window.focusPanelOpen && typeof toggleFocusPanel === 'function') {
            toggleFocusPanel();
        }
    }

    /**
     * Focus sur le champ de recherche globale
     */
    function focusGlobalSearch() {
        const searchInput = document.getElementById('globalSearch');
        if (searchInput) {
            searchInput.focus();
        }
    }

    /**
     * Sauvegarde le projet
     */
    async function saveProject() {
        try {
            // Utiliser le nouveau StorageService si disponible
            if (window.StorageService && typeof StorageService.saveProject === 'function') {
                const state = StateManager.getState();
                if (state.project) {
                    await StorageService.saveProject(state.project);
                    if (window.ToastUI) {
                        ToastUI.success('Projet sauvegardé');
                    }
                }
            }
            // Fallback: ancien système
            else if (typeof window.saveProject === 'function') {
                await window.saveProject();
            }
        } catch (error) {
            console.error('[Keyboard] Erreur sauvegarde:', error);
            if (window.ToastUI) {
                ToastUI.error('Erreur lors de la sauvegarde');
            }
        }
    }

    /**
     * Toggle le mode focus
     */
    function toggleFocusMode() {
        if (typeof window.toggleFocusMode === 'function') {
            window.toggleFocusMode();
        }
    }

    /**
     * Toggle le mode révision
     */
    function toggleRevisionMode() {
        if (window.currentSceneId && typeof window.toggleRevisionMode === 'function') {
            window.toggleRevisionMode();
        }
    }

    /**
     * Gestionnaire principal des événements clavier
     * @param {KeyboardEvent} e - Événement clavier
     */
    function handleKeyDown(e) {
        // ESC - Fermer les modales et panneaux
        if (e.key === 'Escape') {
            closeAllModals();
            closeFocusPanel();
            return;
        }

        // Ctrl/Cmd + F - Focus recherche globale
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            focusGlobalSearch();
            return;
        }

        // Ctrl/Cmd + S - Sauvegarder
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveProject();
            return;
        }

        // F11 - Mode focus
        if (e.key === 'F11') {
            e.preventDefault();
            toggleFocusMode();
            return;
        }

        // Ctrl/Cmd + R - Mode révision
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            toggleRevisionMode();
            return;
        }

        // Publier l'événement pour que d'autres modules puissent réagir
        if (window.EventBus) {
            EventBus.emit('keyboard:shortcut', {
                key: e.key,
                ctrl: e.ctrlKey,
                meta: e.metaKey,
                shift: e.shiftKey,
                alt: e.altKey
            });
        }
    }

    /**
     * Initialise le service de clavier
     */
    function init() {
        document.addEventListener('keydown', handleKeyDown);
        console.log('[Keyboard] Service initialisé');
    }

    /**
     * Nettoie les écouteurs d'événements
     */
    function destroy() {
        document.removeEventListener('keydown', handleKeyDown);
    }

    // API publique
    return {
        init,
        destroy,
        closeAllModals,
        focusGlobalSearch,
        saveProject
    };
})();

// Auto-initialisation
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => KeyboardService.init());
} else {
    KeyboardService.init();
}
