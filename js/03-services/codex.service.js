// Codex Service - Wiki/encyclopédie de l'univers
const CodexService = (() => {
    function add(entry) {
        const state = StateManager.getState();
        const project = state.project;
        
        if (!project.codex) project.codex = [];
        
        const newEntry = {
            id: Date.now(),
            title: entry.title || '',
            category: entry.category || '',
            summary: entry.summary || '',
            content: entry.content || '',
            tags: entry.tags || [],
            ...entry
        };

        project.codex.push(newEntry);
        StateManager.setState({ project });
        
        if (window.StorageService) StorageService.saveProject(project);
        return newEntry;
    }

    function update(id, updates) {
        const state = StateManager.getState();
        const project = state.project;
        
        const entry = project.codex?.find(e => e.id === id);
        if (!entry) return null;
        
        Object.assign(entry, updates);
        StateManager.setState({ project });
        
        if (window.StorageService) StorageService.saveProject(project);
        return entry;
    }

    function remove(id) {
        const state = StateManager.getState();
        const project = state.project;
        
        if (!project.codex) return false;
        
        project.codex = project.codex.filter(e => e.id !== id);
        StateManager.setState({ project });
        
        if (window.StorageService) StorageService.saveProject(project);
        return true;
    }

    function getById(id) {
        const state = StateManager.getState();
        return state.project?.codex?.find(e => e.id === id) || null;
    }

    function getAll() {
        const state = StateManager.getState();
        return state.project?.codex || [];
    }

    function getByCategory(category) {
        return getAll().filter(e => e.category === category);
    }

    return { add, update, remove, getById, getAll, getByCategory };
})();

window.CodexService = CodexService;
window.addCodexEntry = () => {
    const title = prompt('Titre de l\'entrée :');
    if (title) CodexService.add({ title });
};
window.deleteCodexEntry = (id) => {
    if (confirm('Supprimer cette entrée ?')) CodexService.remove(id);
};
