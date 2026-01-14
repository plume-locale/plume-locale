/**
 * Tension View
 * Orchestrates the tension view lifecycle and state management
 */

const TensionView = (() => {
    let container = null;
    let viewMode = 'chart'; // 'chart' or 'list'

    function init() {
        container = document.getElementById('view-tension');
        if (!container) return;

        loadProject();
        render();
        bindEvents();
    }

    function render() {
        if (!container) return;

        const scenes = TensionHandlers.getAllScenes();
        const stats = TensionHandlers.getTensionStats();

        let contentHtml = '';
        if (viewMode === 'chart') {
            contentHtml = TensionRender.renderTensionChart(scenes);
        } else {
            contentHtml = TensionRender.renderTensionList(scenes);
        }

        container.innerHTML = `
            <div class="view-header">
                <h2>Tension</h2>
                <div class="view-controls">
                    <button class="toggle-btn ${viewMode === 'chart' ? 'active' : ''}" 
                            onclick="TensionView.setViewMode('chart')">Graphique</button>
                    <button class="toggle-btn ${viewMode === 'list' ? 'active' : ''}" 
                            onclick="TensionView.setViewMode('list')">Liste</button>
                </div>
            </div>
            <div class="view-stats">
                <div class="stat-item">
                    <span class="stat-label">Moyenne</span>
                    <span class="stat-value">${stats.avg}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Min</span>
                    <span class="stat-value">${stats.min}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Max</span>
                    <span class="stat-value">${stats.max}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Critique</span>
                    <span class="stat-value">${stats.critical}</span>
                </div>
            </div>
            <div class="view-content">
                ${contentHtml}
            </div>
        `;

        // Re-attach handlers
        TensionHandlers.attachListHandlers();
        lucide.createIcons();
    }

    function bindEvents() {
        EventBus.on('tension:updated', () => render());
        EventBus.on('structure:updated', () => render());
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

    function setViewMode(mode) {
        viewMode = mode;
        render();
    }

    return {
        init,
        render,
        bindEvents,
        destroy,
        loadProject,
        setViewMode
    };
})();
