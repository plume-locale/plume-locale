/**
 * Mindmap View
 * Orchestrates the mindmap view lifecycle and state management
 */

const MindmapView = (() => {
    let container = null;

    function init() {
        container = document.getElementById('view-mindmap');
        if (!container) return;

        loadProject();
        render();
        bindEvents();
    }

    function render() {
        if (!container) return;

        const nodes = MindmapHandlers.getAllNodes();
        const roots = MindmapHandlers.getRootNodes();
        const stats = MindmapHandlers.getNodeStats();

        let contentHtml = '';
        if (roots.length > 0) {
            contentHtml = roots.map(root => MindmapRender.renderMindmap(nodes, root.id)).join('');
        } else {
            contentHtml = MindmapRender.renderEmptyMindmap();
        }

        container.innerHTML = `
            <div class="view-header">
                <h2>Carte mentale</h2>
                <button class="btn" onclick="MindmapHandlers.openAddNodeModal('')">+ Nouveau nœud racine</button>
            </div>
            <div class="view-stats">
                <div class="stat-item">
                    <span class="stat-label">Total</span>
                    <span class="stat-value">${stats.total}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Racines</span>
                    <span class="stat-value">${stats.roots}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Concepts</span>
                    <span class="stat-value">${stats.byType.concept}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Personnages</span>
                    <span class="stat-value">${stats.byType.character}</span>
                </div>
            </div>
            <div class="view-content">
                ${contentHtml}
            </div>
        `;

        // Re-attach handlers
        MindmapHandlers.attachListHandlers();
        lucide.createIcons();
    }

    function bindEvents() {
        EventBus.on('mindmap:created', () => render());
        EventBus.on('mindmap:updated', () => render());
        EventBus.on('mindmap:deleted', () => render());
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

    return {
        init,
        render,
        bindEvents,
        destroy,
        loadProject
    };
})();
