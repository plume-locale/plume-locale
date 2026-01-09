/**
 * Project Extended Service
 * Fonctions étendues de gestion de projet (wrapper pour 03.project.js)
 */

const ProjectExtendedService = (() => {
    'use strict';

    function switchView(view) {
        // Délègue au code legacy si disponible
        if (window.switchView && typeof window.switchView === 'function') {
            window.switchView(view);
            return;
        }
        
        // Sinon, implémentation basique
        const state = StateManager.getState();
        state.currentView = view;
        StateManager.setState(state);
        
        if (window.EventBus) EventBus.emit('view:changed', view);
    }

    function renderViewContent(view, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // Délègue au code legacy
        if (window.renderViewContent && typeof window.renderViewContent === 'function') {
            window.renderViewContent(view, containerId);
            return;
        }
        
        // Implémentation basique
        container.innerHTML = '<div class="view-'+view+'">Vue: '+view+'</div>';
    }

    function updateProjectProgress() {
        const state = StateManager.getState();
        const project = state.project;
        
        let totalScenes = 0;
        let completedScenes = 0;
        
        project.acts?.forEach(act => {
            act.chapters?.forEach(chapter => {
                chapter.scenes?.forEach(scene => {
                    totalScenes++;
                    if (scene.status === 'Terminé') {
                        completedScenes++;
                    }
                });
            });
        });
        
        const progress = totalScenes > 0 ? (completedScenes / totalScenes) * 100 : 0;
        
        return {
            total: totalScenes,
            completed: completedScenes,
            percentage: Math.round(progress)
        };
    }

    function getProjectStats() {
        const state = StateManager.getState();
        const project = state.project;
        
        let stats = {
            acts: project.acts?.length || 0,
            chapters: 0,
            scenes: 0,
            words: 0,
            characters: project.characters?.length || 0,
            locations: project.world?.length || 0,
            notes: project.notes?.length || 0
        };
        
        project.acts?.forEach(act => {
            stats.chapters += act.chapters?.length || 0;
            act.chapters?.forEach(chapter => {
                stats.scenes += chapter.scenes?.length || 0;
                chapter.scenes?.forEach(scene => {
                    if (scene.content) {
                        const words = scene.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0);
                        stats.words += words.length;
                    }
                });
            });
        });
        
        return stats;
    }

    function autoInitProject() {
        const state = StateManager.getState();
        let project = state.project;
        
        // S'assurer que les structures de base existent
        if (!project.acts) project.acts = [];
        if (!project.characters) project.characters = [];
        if (!project.world) project.world = [];
        if (!project.notes) project.notes = [];
        if (!project.timeline) project.timeline = [];
        if (!project.arcs) project.arcs = [];
        
        // Créer un acte par défaut si vide
        if (project.acts.length === 0) {
            const defaultAct = {
                id: Date.now(),
                title: 'Acte 1',
                chapters: []
            };
            project.acts.push(defaultAct);
        }
        
        StateManager.setState({ project });
        return project;
    }

    function validateProject(project) {
        const errors = [];
        
        if (!project.title) {
            errors.push('Titre du projet manquant');
        }
        
        if (!Array.isArray(project.acts)) {
            errors.push('Structure des actes invalide');
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    return {
        switchView,
        renderViewContent,
        updateProjectProgress,
        getProjectStats,
        autoInitProject,
        validateProject
    };
})();

window.ProjectExtendedService = ProjectExtendedService;
window.autoInitProject = () => ProjectExtendedService.autoInitProject();
window.getProjectStats = () => ProjectExtendedService.getProjectStats();

console.log('[ProjectExtended] Service initialisé');
