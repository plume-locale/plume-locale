// ============================================
// PROJECT SERVICE - Service métier Projets
// ============================================

/**
 * ProjectService - Logique métier pour les projets
 */

const ProjectService = {

    /**
     * Crée un nouveau projet
     */
    async create(projectData) {
        const project = new Project(projectData);
        project.validate();

        await StorageService.saveProject(project);

        EventBus.emit('project:created', project);

        return project;
    },

    /**
     * Charge un projet
     */
    async load(projectId) {
        const project = await StorageService.loadProject(projectId);

        if (project) {
            StateManager.setState({
                project: project.toJSON(),
                currentProjectId: projectId
            });

            EventBus.emit('project:loaded', project);
        }

        return project;
    },

    /**
     * Sauvegarde le projet actuel
     */
    async save() {
        const state = StateManager.getState();
        if (!state.project) {
            throw new Error('Aucun projet actif');
        }

        const project = new Project(state.project);
        await StorageService.saveProject(project);

        EventBus.emit('project:saved', project);

        return project;
    },

    /**
     * Liste tous les projets
     */
    async list() {
        return await StorageService.listProjects();
    },

    /**
     * Supprime un projet
     */
    async delete(projectId) {
        const success = await StorageService.deleteProject(projectId);

        if (success) {
            const state = StateManager.getState();
            if (state.currentProjectId === projectId) {
                StateManager.setState({
                    project: null,
                    currentProjectId: null
                });
            }

            EventBus.emit('project:deleted', projectId);
        }

        return success;
    },

    /**
     * Récupère le projet actuel
     */
    getCurrent() {
        const state = StateManager.getState();
        return state.project ? new Project(state.project) : null;
    },

    /**
     * Statistiques du projet actuel
     */
    getStats() {
        const project = this.getCurrent();
        return project ? project.getStats() : null;
    },

    /**
     * Recherche dans le projet
     */
    search(query) {
        const project = this.getCurrent();
        return project ? project.search(query) : null;
    },

    /**
     * Exporte le projet
     */
    async export(projectId) {
        return await StorageService.exportProject(projectId);
    },

    /**
     * Importe un projet
     */
    async import(jsonData) {
        return await StorageService.importProject(jsonData);
    },

    /**
     * Crée un snapshot
     */
    createSnapshot(description) {
        const project = this.getCurrent();
        if (!project) {
            throw new Error('Aucun projet actif');
        }

        const snapshot = project.createSnapshot(description);

        const state = StateManager.getState();
        state.project = project.toJSON();

        StorageService.saveProject(state.project);
        EventBus.emit('snapshot:created', snapshot);

        return snapshot;
    }
};

window.ProjectService = ProjectService;
