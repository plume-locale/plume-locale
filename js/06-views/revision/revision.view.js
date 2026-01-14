/**
 * Revision View
 * Orchestrates the revision view lifecycle and state management
 */

const RevisionView = (() => {
    let container = null;

    function init() {
        container = document.getElementById('view-revision');
        if (!container) return;

        loadProject();
        render();
        bindEvents();
    }

    function render() {
        if (!container) return;

        const revisions = getAllRevisions();
        const html = RevisionRender.renderRevisionsList(revisions);

        container.innerHTML = `
            <div class="view-header">
                <h2>Révisions</h2>
                <button class="btn" onclick="RevisionHandlers.openAddRevisionModal()">+ Nouvelle révision</button>
            </div>
            <div class="view-content">
                ${html}
            </div>
        `;

        // Re-attach handlers
        RevisionHandlers.attachListHandlers();
        lucide.createIcons();
    }

    function bindEvents() {
        EventBus.on('revisions:created', () => render());
        EventBus.on('revisions:updated', () => render());
        EventBus.on('revisions:deleted', () => render());
        EventBus.on('project:updated', () => render());
    }

    function destroy() {
        if (container) {
            container.innerHTML = '';
        }
    }

    function loadProject() {
        const project = StorageService.loadProject();
        if (project) {
            StateManager.setState({ project });
        }
    }

    function getAllRevisions() {
        const project = StateManager.getState().project;
        return project.revisions || [];
    }

    function getRevision(revisionId) {
        const project = StateManager.getState().project;
        return project.revisions?.find(r => r.id === revisionId);
    }

    return {
        init,
        render,
        bindEvents,
        destroy,
        loadProject,
        getAllRevisions,
        getRevision
    };
})();
