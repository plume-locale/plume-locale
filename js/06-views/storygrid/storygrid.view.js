/**
 * Storygrid View
 * Orchestrates the storygrid view lifecycle and state management
 */

const StorygridView = (() => {
    let container = null;

    function init() {
        container = document.getElementById('view-storygrid');
        if (!container) return;

        loadProject();
        render();
        bindEvents();
    }

    function render() {
        if (!container) return;

        const elements = getAllElements();
        const stats = StorygridHandlers.getStorygridStats();
        const html = StorygridRender.renderStorygrid(elements);

        container.innerHTML = `
            <div class="view-header">
                <h2>Story Grid</h2>
                <button class="btn" onclick="StorygridHandlers.openAddStorygridModal()">+ Nouvel élément</button>
            </div>
            <div class="view-stats">
                <div class="stat-item">
                    <span class="stat-label">Total</span>
                    <span class="stat-value">${stats.total}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Couverture</span>
                    <span class="stat-value">${stats.coverage}%</span>
                </div>
            </div>
            <div class="view-content">
                ${html}
            </div>
        `;

        // Re-attach handlers
        StorygridHandlers.attachListHandlers();
        lucide.createIcons();
    }

    function bindEvents() {
        EventBus.on('storygrid:created', () => render());
        EventBus.on('storygrid:updated', () => render());
        EventBus.on('storygrid:deleted', () => render());
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

    function getAllElements() {
        const project = StateManager.getState().project;
        return project.storygrid || [];
    }

    function getElement(elementId) {
        const project = StateManager.getState().project;
        return project.storygrid?.find(e => e.id === elementId);
    }

    return {
        init,
        render,
        bindEvents,
        destroy,
        loadProject,
        getAllElements,
        getElement
    };
})();
