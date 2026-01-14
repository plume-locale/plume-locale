/**
 * Relations Graph View
 * Orchestrates the relations graph view lifecycle and state management
 */

const RelationsGraphView = (() => {
    let container = null;
    let currentTab = 'characters';

    function init() {
        container = document.getElementById('view-relations-graph');
        if (!container) return;

        loadProject();
        render();
        bindEvents();
    }

    function render() {
        if (!container) return;

        const characters = RelationsGraphHandlers.getAllCharacters();
        const locations = RelationsGraphHandlers.getAllLocations();
        const stats = RelationsGraphHandlers.getRelationshipStats();

        const html = RelationsRender.renderRelationsGraph(characters, locations);

        container.innerHTML = `
            <div class="view-header">
                <h2>Relations</h2>
            </div>
            <div class="view-stats">
                <div class="stat-item">
                    <span class="stat-label">Personnages</span>
                    <span class="stat-value">${stats.totalCharacters}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Lieux</span>
                    <span class="stat-value">${stats.totalLocations}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Connexions</span>
                    <span class="stat-value">${stats.totalConnections}</span>
                </div>
            </div>
            <div class="view-content">
                ${html}
            </div>
        `;

        // Re-attach handlers
        RelationsGraphHandlers.attachListHandlers();
        lucide.createIcons();
    }

    function bindEvents() {
        EventBus.on('characters:updated', () => render());
        EventBus.on('characters:created', () => render());
        EventBus.on('characters:deleted', () => render());
        EventBus.on('locations:updated', () => render());
        EventBus.on('locations:created', () => render());
        EventBus.on('locations:deleted', () => render());
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

    function switchTab(tabName) {
        currentTab = tabName;

        const tabs = document.querySelectorAll('.relations-view');
        const buttons = document.querySelectorAll('.relations-tab-btn');

        tabs.forEach(tab => tab.classList.remove('active'));
        buttons.forEach(btn => btn.classList.remove('active'));

        const selectedTab = document.getElementById(`relations-${tabName}`);
        const selectedBtn = document.querySelector(`[data-tab="${tabName}"]`);

        if (selectedTab) selectedTab.classList.add('active');
        if (selectedBtn) selectedBtn.classList.add('active');
    }

    return {
        init,
        render,
        bindEvents,
        destroy,
        loadProject,
        switchTab
    };
})();
