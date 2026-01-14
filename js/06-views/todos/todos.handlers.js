/**
 * Todos Handlers
 * Responsible for event handling and CRUD operations on todos
 */

const TodosHandlers = (() => {
    let currentDetailId = null;
    let autosaveDebounce = null;

    function attachListHandlers() {
        const listContainer = document.querySelector('.todos-container');
        if (!listContainer) return;

        // Click handlers for todo items
        listContainer.addEventListener('click', (e) => {
            const todoItem = e.target.closest('.todo-item');
            if (!todoItem) return;

            const todoId = todoItem.dataset.todoId;
            if (e.target.classList.contains('todo-checkbox')) {
                toggleTodo(todoId);
            } else if (e.target.classList.contains('todo-item-delete')) {
                deleteTodo(todoId);
            } else {
                openTodoDetail(todoId);
            }
        });

        // Drag and drop handlers for status change
        listContainer.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('todo-item')) {
                e.dataTransfer.effectAllowed = 'move';
                e.target.style.opacity = '0.5';
            }
        });

        listContainer.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('todo-item')) {
                e.target.style.opacity = '1';
            }
        });

        listContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        listContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            const draggedItem = document.querySelector('.todo-item[style*="opacity: 0.5"]');
            if (!draggedItem) return;

            const column = e.target.closest('.todos-column');
            if (!column) return;

            const columnTitle = column.querySelector('.todos-column-title').textContent;
            let newStatus;

            if (columnTitle.includes('À faire')) {
                newStatus = 'todo';
            } else if (columnTitle.includes('En cours')) {
                newStatus = 'inProgress';
            } else if (columnTitle.includes('Fait')) {
                newStatus = 'done';
            }

            if (newStatus) {
                const todoId = draggedItem.dataset.todoId;
                updateTodoStatus(todoId, newStatus);
            }
        });
    }

    function openAddTodoModal() {
        const html = TodosRender.renderAddTodoModal();
        ModalUI.open('Nouvelle tâche', html, () => {
            const form = document.getElementById('add-todo-form');
            if (form) {
                form.addEventListener('submit', handleAddTodo);
            }
        });
    }

    function handleAddTodo(e) {
        e.preventDefault();

        const text = document.getElementById('todo-text-input').value.trim();
        const priority = document.getElementById('todo-priority-input').value;
        const category = document.getElementById('todo-category-input').value.trim();

        if (!text) return;

        const newTodo = {
            id: `todo-${Date.now()}`,
            text,
            priority: priority || 'normal',
            category: category || '',
            status: 'todo',
            description: '',
            createdAt: new Date().toISOString()
        };

        const project = StateManager.getState().project;
        if (!project.todos) {
            project.todos = [];
        }

        project.todos.push(newTodo);
        StateManager.setState({ project });
        StorageService.saveProject(project);
        EventBus.emit('todos:created', newTodo);

        ModalUI.close();
        TodosView.render();
    }

    function openTodoDetail(todoId) {
        const project = StateManager.getState().project;
        const todo = project.todos?.find(t => t.id === todoId);

        if (!todo) return;

        currentDetailId = todoId;
        const html = TodosRender.renderTodoDetail(todo);
        ModalUI.open('Détails de la tâche', html, () => {
            attachTodoDetailHandlers(todoId);
        });
    }

    function attachTodoDetailHandlers(todoId) {
        const form = document.querySelector('.detail-view');
        if (!form) return;

        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('change', () => saveTodoDetail(todoId));
            input.addEventListener('input', () => {
                clearTimeout(autosaveDebounce);
                autosaveDebounce = setTimeout(() => saveTodoDetail(todoId), 1000);
            });
        });
    }

    function saveTodoDetail(todoId) {
        const project = StateManager.getState().project;
        const todo = project.todos?.find(t => t.id === todoId);

        if (!todo) return;

        const textInput = document.getElementById('todo-text');
        const statusSelect = document.getElementById('todo-status');
        const prioritySelect = document.getElementById('todo-priority');
        const descriptionInput = document.getElementById('todo-description');
        const categoryInput = document.getElementById('todo-category');

        if (textInput) todo.text = textInput.value.trim();
        if (statusSelect) todo.status = statusSelect.value;
        if (prioritySelect) todo.priority = prioritySelect.value;
        if (descriptionInput) todo.description = descriptionInput.value.trim();
        if (categoryInput) todo.category = categoryInput.value.trim();

        StateManager.setState({ project });
        StorageService.saveProject(project);
        EventBus.emit('todos:updated', todo);
    }

    function toggleTodo(todoId) {
        const project = StateManager.getState().project;
        const todo = project.todos?.find(t => t.id === todoId);

        if (!todo) return;

        todo.status = todo.status === 'done' ? 'todo' : 'done';
        StateManager.setState({ project });
        StorageService.saveProject(project);
        EventBus.emit('todos:updated', todo);
        TodosView.render();
    }

    function updateTodoStatus(todoId, newStatus) {
        const project = StateManager.getState().project;
        const todo = project.todos?.find(t => t.id === todoId);

        if (!todo) return;

        todo.status = newStatus;
        StateManager.setState({ project });
        StorageService.saveProject(project);
        EventBus.emit('todos:updated', todo);
        TodosView.render();
    }

    function deleteTodo(todoId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) return;

        const project = StateManager.getState().project;
        project.todos = project.todos?.filter(t => t.id !== todoId) || [];

        StateManager.setState({ project });
        StorageService.saveProject(project);
        EventBus.emit('todos:deleted', todoId);
        TodosView.render();

        if (currentDetailId === todoId) {
            ModalUI.close();
        }
    }

    function filterByStatus(status) {
        const project = StateManager.getState().project;
        const todos = project.todos || [];
        return todos.filter(t => t.status === status);
    }

    function filterByPriority(priority) {
        const project = StateManager.getState().project;
        const todos = project.todos || [];
        return todos.filter(t => t.priority === priority);
    }

    function filterByCategory(category) {
        const project = StateManager.getState().project;
        const todos = project.todos || [];
        return todos.filter(t => t.category === category);
    }

    function getAllCategories() {
        const project = StateManager.getState().project;
        const todos = project.todos || [];
        const categories = new Set();

        todos.forEach(todo => {
            if (todo.category) {
                todo.category.split(',').forEach(cat => {
                    categories.add(cat.trim());
                });
            }
        });

        return Array.from(categories).sort();
    }

    return {
        attachListHandlers,
        openAddTodoModal,
        openTodoDetail,
        toggleTodo,
        deleteTodo,
        filterByStatus,
        filterByPriority,
        filterByCategory,
        getAllCategories
    };
})();
