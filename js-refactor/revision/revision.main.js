/*
 * REVISION MODULE - MAIN
 * Initialization logic for the Revision module.
 */

const RevisionModule = {
    init() {
        console.log('Revision Module Initialized');
        // Initial badge update if project is already loaded
        if (typeof project !== 'undefined') {
            RevisionViewModel.updateAnnotationsButton();
        }
    }
};

// Auto-init on load if needed, or call from app.init
// document.addEventListener('DOMContentLoaded', () => RevisionModule.init());
