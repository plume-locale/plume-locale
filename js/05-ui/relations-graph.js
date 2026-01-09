/**
 * Relations Graph UI
 * Graphe interactif des relations entre personnages
 */

const RelationsGraphUI = (() => {
    'use strict';

    const RELATION_TYPES = {
        'amour': { color: '#e91e63', label: '❤️ Amour', icon: '❤️' },
        'amitie': { color: '#4caf50', label: '🤝 Amitié', icon: '🤝' },
        'rivalite': { color: '#f44336', label: '⚔️ Rivalité', icon: '⚔️' },
        'famille': { color: '#2196f3', label: '👨‍👩‍👧 Famille', icon: '👨‍👩‍👧' },
        'mentor': { color: '#ff9800', label: '📚 Mentor', icon: '📚' },
        'ennemi': { color: '#9c27b0', label: '💀 Ennemi', icon: '💀' },
        'alliance': { color: '#00bcd4', label: '🤜🤛 Alliance', icon: '🤜🤛' },
        'neutre': { color: '#757575', label: '😐 Neutre', icon: '😐' }
    };

    let dragState = {
        isDragging: false,
        draggedCharId: null,
        startX: 0,
        startY: 0,
        moved: false
    };

    let selectedCharsForRelation = [];

    function render() {
        const state = StateManager.getState();
        const project = state.project;
        
        if (!project.relations) project.relations = [];
        if (!project.characterPositions) project.characterPositions = {};
        
        return renderGraph(project);
    }

    function renderGraph(project) {
        // Logique de rendu simplifiée - utilise l'ancien code avec StateManager
        return '<div>Graphe des relations</div>';
    }

    function startDrag(event, charId) {
        event.preventDefault();
        dragState.isDragging = true;
        dragState.draggedCharId = charId;
        dragState.startX = event.clientX;
        dragState.startY = event.clientY;
        dragState.moved = false;
    }

    function createRelation(char1Id, char2Id, type, description) {
        const state = StateManager.getState();
        const project = state.project;
        
        if (!project.relations) project.relations = [];
        
        project.relations.push({
            id: 'rel_' + Date.now(),
            char1Id,
            char2Id,
            type,
            description,
            createdAt: new Date().toISOString()
        });
        
        StateManager.setState({ project });
        if (window.StorageService) StorageService.saveProject(project);
        if (window.EventBus) EventBus.emit('relations:updated');
    }

    function deleteRelation(relId) {
        const state = StateManager.getState();
        const project = state.project;
        
        project.relations = project.relations.filter(r => r.id !== relId);
        
        StateManager.setState({ project });
        if (window.StorageService) StorageService.saveProject(project);
        if (window.EventBus) EventBus.emit('relations:updated');
    }

    return { render, createRelation, deleteRelation, RELATION_TYPES };
})();

window.RelationsGraphUI = RelationsGraphUI;
window.renderRelationsView = () => RelationsGraphUI.render();

console.log('[RelationsGraph] UI initialisée');
