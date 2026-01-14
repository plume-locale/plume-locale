/**
 * Codex View (Refactored MVVM)
 * Orchestrates the codex view
 */

const CodexView = (() => {
    function init() {
        render();
        bindEvents();
    }

    function render() {
        const container = document.getElementById('codexList');
        if (!container) return;

        const state = StateManager.get('project');
        const html = CodexRender.renderCodexList(state.codex || []);
        container.innerHTML = html;
        CodexHandlers.attachListHandlers();
    }

    function bindEvents() {
        if (typeof EventBus !== 'undefined') {
            EventBus.on('project:updated', () => render());
            EventBus.on('codex:created', () => render());
            EventBus.on('codex:deleted', () => render());
        }
    }

    function loadProject() {
        const saved = localStorage.getItem('plume_locale_project');
        if (!saved) return;

        const loadedProject = JSON.parse(saved);
        const project = {
            ...loadedProject,
            codex: loadedProject.codex || []
        };

        StateManager.set('project', project);
    }

    function getAllEntries() {
        const state = StateManager.get('project');
        return state.codex || [];
    }

    function getEntry(codexId) {
        const state = StateManager.get('project');
        return state.codex?.find(c => c.id === codexId) || null;
    }

    function destroy() {}

    return {
        init,
        render,
        bindEvents,
        loadProject,
        getAllEntries,
        getEntry,
        destroy
    };
})();
