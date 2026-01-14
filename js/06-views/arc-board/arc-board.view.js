/**
 * Arc Board View
 * Orchestrates the arc board view lifecycle and state management
 */

const ArcBoardView = (() => {
    let container = null;

    function init() {
        container = document.getElementById('view-arc-board');
        if (!container) return;

        loadProject();
        render();
        bindEvents();
    }

    function render() {
        if (!container) return;

        const arcs = getAllArcs();
        const stats = ArcBoardHandlers.getArcStats();
        const html = ArcBoardRender.renderArcBoard(arcs);

        container.innerHTML = `
            <div class="view-header">
                <h2>Arcs narratifs</h2>
                <button class="btn" onclick="ArcBoardHandlers.openAddArcModal()">+ Nouvel arc</button>
            </div>
            <div class="view-stats">
                <div class="stat-item">
                    <span class="stat-label">Total</span>
                    <span class="stat-value">${stats.total}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Actifs</span>
                    <span class="stat-value">${stats.active}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Complétés</span>
                    <span class="stat-value">${stats.completed}</span>
                </div>
            </div>
            <div class="view-content">
                ${html}
            </div>
        `;

        // Re-attach handlers
        ArcBoardHandlers.attachListHandlers();
        lucide.createIcons();
    }

    function bindEvents() {
        EventBus.on('arcBoard:created', () => render());
        EventBus.on('arcBoard:updated', () => render());
        EventBus.on('arcBoard:deleted', () => render());
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

    function getAllArcs() {
        const project = StateManager.getState().project;
        return project.arcs || [];
    }

    function getArc(arcId) {
        const project = StateManager.getState().project;
        return project.arcs?.find(a => a.id === arcId);
    }

    return {
        init,
        render,
        bindEvents,
        destroy,
        loadProject,
        getAllArcs,
        getArc
    };
})();
