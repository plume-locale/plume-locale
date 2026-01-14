/**
 * Todos View
 * Orchestrates the todos view lifecycle and state management
 */

const TodosView = (() => {
    let container = null;

    function init() {
        container = document.getElementById('view-todos');
        if (!container) return;

        loadProject();
        render();
        bindEvents();
    }

    function render() {
        if (!container) return;

        const todos = getAllTodos();
        const html = TodosRender.renderTodosList(todos);

        container.innerHTML = `
            <div class="view-header">
                <h2>Tâches</h2>
                <button class="btn" onclick="TodosHandlers.openAddTodoModal()">+ Nouvelle tâche</button>
            </div>
            <div class="view-content">
                ${html}
            </div>
        `;

        // Re-attach handlers
        TodosHandlers.attachListHandlers();
        lucide.createIcons();
    }

    function bindEvents() {
        EventBus.on('todos:created', () => render());
        EventBus.on('todos:updated', () => render());
        EventBus.on('todos:deleted', () => render());
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

    function getAllTodos() {
        const project = StateManager.getState().project;
        return project.todos || [];
    }

    function getTodo(todoId) {
        const project = StateManager.getState().project;
        return project.todos?.find(t => t.id === todoId);
    }

    return {
        init,
        render,
        bindEvents,
        destroy,
        loadProject,
        getAllTodos,
        getTodo
    };
})();
