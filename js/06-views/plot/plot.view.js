/**
 * Plot View
 * Orchestrates the plot view lifecycle and state management
 */

const PlotView = (() => {
    let container = null;

    function init() {
        container = document.getElementById('view-plot');
        if (!container) return;

        loadProject();
        render();
        bindEvents();
    }

    function render() {
        if (!container) return;

        const plots = getAllPlots();
        const stats = PlotHandlers.getPlotStats();
        const html = PlotRender.renderPlotStructure(plots);

        container.innerHTML = `
            <div class="view-header">
                <h2>Intrigues</h2>
                <button class="btn" onclick="PlotHandlers.openAddPlotModal()">+ Nouvelle intrigue</button>
            </div>
            <div class="view-stats">
                <div class="stat-item">
                    <span class="stat-label">Total</span>
                    <span class="stat-value">${stats.total}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Principales</span>
                    <span class="stat-value">${stats.main}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Secondaires</span>
                    <span class="stat-value">${stats.secondary}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Avancement</span>
                    <span class="stat-value">${stats.avgProgress}%</span>
                </div>
            </div>
            <div class="view-content">
                ${html}
            </div>
        `;

        // Re-attach handlers
        PlotHandlers.attachListHandlers();
        lucide.createIcons();
    }

    function bindEvents() {
        EventBus.on('plot:created', () => render());
        EventBus.on('plot:updated', () => render());
        EventBus.on('plot:deleted', () => render());
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

    function getAllPlots() {
        const project = StateManager.getState().project;
        return project.plots || [];
    }

    function getPlot(plotId) {
        const project = StateManager.getState().project;
        return project.plots?.find(p => p.id === plotId);
    }

    return {
        init,
        render,
        bindEvents,
        destroy,
        loadProject,
        getAllPlots,
        getPlot
    };
})();
