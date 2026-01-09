/**
 * Narrative Arcs Service
 * Gestion des arcs narratifs à travers le récit
 */

const NarrativeArcsService = (() => {
    'use strict';

    const ARC_TYPES = {
        character: { icon: 'user', label: 'Personnage', color: '#3498db' },
        plot: { icon: 'book-open', label: 'Intrigue', color: '#e74c3c' },
        theme: { icon: 'message-circle', label: 'Thème', color: '#9b59b6' },
        subplot: { icon: 'file-text', label: 'Intrigue secondaire', color: '#16a085' },
        relationship: { icon: 'heart', label: 'Relation', color: '#e91e63' },
        mystery: { icon: 'search', label: 'Mystère', color: '#607d8b' },
        conflict: { icon: 'swords', label: 'Conflit', color: '#ff5722' },
        growth: { icon: 'sprout', label: 'Croissance', color: '#4caf50' }
    };

    function init(project) {
        if (!project.narrativeArcs) {
            project.narrativeArcs = [];
        }
    }

    function create(title, type, description, relatedCharacters = [], importance = 'major') {
        const state = StateManager.getState();
        const project = state.project;
        
        init(project);
        
        const arc = {
            id: 'arc_' + Date.now(),
            title,
            type,
            color: ARC_TYPES[type]?.color || '#3498db',
            description,
            relatedCharacters,
            importance,
            resolution: { type: 'ongoing', sceneId: null },
            scenePresence: [],
            created: new Date().toISOString().split('T')[0],
            updated: new Date().toISOString().split('T')[0]
        };
        
        project.narrativeArcs.push(arc);
        StateManager.setState({ project });
        
        if (window.StorageService) StorageService.saveProject(project);
        if (window.EventBus) EventBus.emit('arcs:created', arc);
        
        return arc;
    }

    function update(arcId, updates) {
        const state = StateManager.getState();
        const project = state.project;
        
        const index = project.narrativeArcs.findIndex(a => a.id === arcId);
        if (index !== -1) {
            project.narrativeArcs[index] = {
                ...project.narrativeArcs[index],
                ...updates,
                updated: new Date().toISOString().split('T')[0]
            };
            
            StateManager.setState({ project });
            if (window.StorageService) StorageService.saveProject(project);
            if (window.EventBus) EventBus.emit('arcs:updated', project.narrativeArcs[index]);
        }
    }

    function remove(arcId) {
        const state = StateManager.getState();
        const project = state.project;
        
        project.narrativeArcs = project.narrativeArcs.filter(a => a.id !== arcId);
        
        StateManager.setState({ project });
        if (window.StorageService) StorageService.saveProject(project);
        if (window.EventBus) EventBus.emit('arcs:deleted', arcId);
    }

    function getById(arcId) {
        const state = StateManager.getState();
        return state.project.narrativeArcs?.find(a => a.id === arcId);
    }

    function getAll() {
        const state = StateManager.getState();
        return state.project.narrativeArcs || [];
    }

    function addToScene(arcId, actId, chapterId, sceneId, intensity = 3, status = 'development') {
        const arc = getById(arcId);
        if (!arc) return;
        
        if (!arc.scenePresence) arc.scenePresence = [];
        
        arc.scenePresence.push({
            actId,
            chapterId,
            sceneId,
            intensity,
            status,
            notes: ''
        });
        
        update(arcId, { scenePresence: arc.scenePresence });
    }

    function removeFromScene(arcId, sceneId) {
        const arc = getById(arcId);
        if (!arc) return;
        
        arc.scenePresence = arc.scenePresence.filter(p => p.sceneId !== sceneId);
        update(arcId, { scenePresence: arc.scenePresence });
    }

    return {
        ARC_TYPES,
        init,
        create,
        update,
        remove,
        getById,
        getAll,
        addToScene,
        removeFromScene
    };
})();

window.NarrativeArcsService = NarrativeArcsService;
window.initNarrativeArcs = () => NarrativeArcsService.init(StateManager.getState().project);

console.log('[NarrativeArcs] Service initialisé');
