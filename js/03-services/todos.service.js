// Todos Service - Gestion des tâches du projet
const TodosService = (() => {
    function add(todo) {
        const state = StateManager.getState();
        const project = state.project;
        
        if (!project.todos) project.todos = [];
        
        const newTodo = {
            id: Date.now(),
            text: todo.text || '',
            completed: false,
            priority: todo.priority || 'normal',
            dueDate: todo.dueDate || null,
            category: todo.category || 'general',
            ...todo
        };

        project.todos.push(newTodo);
        StateManager.setState({ project });
        
        if (window.StorageService) StorageService.saveProject(project);
        return newTodo;
    }

    function toggle(id) {
        const state = StateManager.getState();
        const project = state.project;
        
        const todo = project.todos?.find(t => t.id === id);
        if (!todo) return null;
        
        todo.completed = !todo.completed;
        StateManager.setState({ project });
        
        if (window.StorageService) StorageService.saveProject(project);
        return todo;
    }

    function remove(id) {
        const state = StateManager.getState();
        const project = state.project;
        
        if (!project.todos) return false;
        
        project.todos = project.todos.filter(t => t.id !== id);
        StateManager.setState({ project });
        
        if (window.StorageService) StorageService.saveProject(project);
        return true;
    }

    function getAll() {
        const state = StateManager.getState();
        return state.project?.todos || [];
    }

    function getActive() {
        return getAll().filter(t => !t.completed);
    }

    function getCompleted() {
        return getAll().filter(t => t.completed);
    }

    return { add, toggle, remove, getAll, getActive, getCompleted };
})();

window.TodosService = TodosService;
window.addTodo = () => {
    const text = prompt('Nouvelle tâche :');
    if (text) TodosService.add({ text });
};
window.toggleTodo = (id) => TodosService.toggle(id);
window.deleteTodo = (id) => {
    if (confirm('Supprimer cette tâche ?')) TodosService.remove(id);
};
