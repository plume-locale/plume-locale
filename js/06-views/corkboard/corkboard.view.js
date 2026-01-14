/**
 * Corkboard View
 * Orchestrates the corkboard view lifecycle and state management
 */

const CorkboardView = (() => {
    let container = null;

    function init() {
        container = document.getElementById('view-corkboard');
        if (!container) return;

        loadProject();
        render();
        bindEvents();
    }

    function render() {
        if (!container) return;

        const pins = getAllPins();
        const html = CorkboardRender.renderCorkboardGrid(pins);

        container.innerHTML = `
            <div class="view-header">
                <h2>Tableau liège</h2>
                <button class="btn" onclick="CorkboardHandlers.openAddCorkboardModal()">+ Nouvelle épingle</button>
            </div>
            <div class="view-content">
                ${html}
            </div>
        `;

        // Re-attach handlers
        CorkboardHandlers.attachListHandlers();
        lucide.createIcons();
    }

    function bindEvents() {
        EventBus.on('corkboard:created', () => render());
        EventBus.on('corkboard:updated', () => render());
        EventBus.on('corkboard:deleted', () => render());
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

    function getAllPins() {
        const project = StateManager.getState().project;
        return project.corkboard || [];
    }

    function getPin(pinId) {
        const project = StateManager.getState().project;
        return project.corkboard?.find(p => p.id === pinId);
    }

    return {
        init,
        render,
        bindEvents,
        destroy,
        loadProject,
        getAllPins,
        getPin
    };
})();
