/**
 * Handlers for keyboard shortcut actions
 */
const KeyboardShortcutsHandlers = {
    closeModals: () => {
        const modals = [
            'addChapterModal', 'addSceneModal', 'addActModal',
            'addCharacterModal', 'addWorldModal', 'addTimelineModal',
            'addNoteModal', 'addCodexModal', 'backupModal',
            'referencesModal', 'projectsModal', 'newProjectModal',
            'shortcutsModal'
        ];

        modals.forEach(id => {
            if (typeof closeModal === 'function') closeModal(id);
        });

        if (typeof closeSearchResults === 'function') closeSearchResults();

        // Close focus panel if open
        if (typeof focusPanelOpen !== 'undefined' && focusPanelOpen && typeof toggleFocusPanel === 'function') {
            toggleFocusPanel();
        }
    },

    focusSearch: (e) => {
        if (e) e.preventDefault();
        const searchInput = document.getElementById('globalSearch');
        if (searchInput) searchInput.focus();
    },

    saveProject: (e) => {
        if (e) e.preventDefault();
        if (typeof saveProject === 'function') saveProject();
    },

    toggleFocusMode: (e) => {
        if (e) e.preventDefault();
        if (typeof toggleFocusMode === 'function') toggleFocusMode();
    },

    toggleRevision: (e) => {
        if (e) e.preventDefault();
        if (typeof toggleRevisionMode === 'function') {
            toggleRevisionMode();
        } else if (typeof RevisionViewModel !== 'undefined') {
            RevisionViewModel.toggleRevisionMode();
        } else {
            console.warn('toggleRevisionMode not found');
        }
    },

    openShortcutsModal: () => {
        const modal = document.getElementById('shortcutsModal');
        if (modal) {
            modal.classList.add('active');
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    },

    closeShortcutsModal: () => {
        const modal = document.getElementById('shortcutsModal');
        if (modal) modal.classList.remove('active');
    }
};
