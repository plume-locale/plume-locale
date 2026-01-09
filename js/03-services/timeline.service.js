/**
 * Timeline Service
 * Gestion de la chronologie du projet
 */

const TimelineService = (() => {
    'use strict';

    function add(event) {
        const state = StateManager.getState();
        const project = state.project;
        
        if (!project.timeline) project.timeline = [];
        
        const newEvent = {
            id: Date.now(),
            title: event.title || '',
            date: event.date || '',
            location: event.location || '',
            characters: event.characters || '',
            description: event.description || '',
            consequences: '',
            notes: '',
            order: project.timeline.length,
            ...event
        };

        project.timeline.push(newEvent);
        StateManager.setState({ project });
        
        if (window.StorageService) {
            StorageService.saveProject(project);
        }
        
        return newEvent;
    }

    function update(id, updates) {
        const state = StateManager.getState();
        const project = state.project;
        
        const event = project.timeline?.find(e => e.id === id);
        if (!event) return null;
        
        Object.assign(event, updates);
        StateManager.setState({ project });
        
        if (window.StorageService) {
            StorageService.saveProject(project);
        }
        
        return event;
    }

    function remove(id) {
        const state = StateManager.getState();
        const project = state.project;
        
        if (!project.timeline) return false;
        
        project.timeline = project.timeline.filter(e => e.id !== id);
        StateManager.setState({ project });
        
        if (window.StorageService) {
            StorageService.saveProject(project);
        }
        
        return true;
    }

    function getById(id) {
        const state = StateManager.getState();
        return state.project?.timeline?.find(e => e.id === id) || null;
    }

    function getAll() {
        const state = StateManager.getState();
        const timeline = state.project?.timeline || [];
        return [...timeline].sort((a, b) => a.order - b.order);
    }

    return { add, update, remove, getById, getAll };
})();

window.TimelineService = TimelineService;
