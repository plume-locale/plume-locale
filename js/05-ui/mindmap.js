/**
 * Mindmap UI
 * Carte mentale interactive drag & drop
 */

const MindmapUI = (() => {
    'use strict';

    let currentMindmapId = null;
    let state = {
        zoom: 1,
        panX: 0,
        panY: 0,
        isDragging: false,
        draggedNode: null,
        selectedNode: null
    };

    function render() {
        const container = document.getElementById('mindmapList');
        if (!container) return;
        
        const projectState = StateManager.getState();
        const project = projectState.project;
        
        if (!project.mindmaps) project.mindmaps = [];
        
        container.innerHTML = '<div class="mindmap-sidebar"><h3>Mindmaps</h3><button onclick="createNewMindmap()">+ Nouvelle</button></div>';
        renderCanvas();
    }

    function renderCanvas() {
        const editorView = document.getElementById('editorView');
        if (!editorView) return;
        
        const projectState = StateManager.getState();
        const project = projectState.project;
        const mindmap = project.mindmaps?.find(m => m.id === currentMindmapId);
        
        if (!mindmap) {
            editorView.innerHTML = '<div class="mindmap-empty">Aucune mindmap sélectionnée</div>';
            return;
        }
        
        editorView.innerHTML = '<div class="mindmap-canvas"><div>Mindmap: ' + mindmap.title + '</div></div>';
    }

    function createNew() {
        const title = prompt('Nom de la mindmap:', 'Nouvelle mindmap');
        if (!title) return;
        
        const projectState = StateManager.getState();
        const project = projectState.project;
        
        if (!project.mindmaps) project.mindmaps = [];
        
        const newMindmap = {
            id: Date.now(),
            title: title,
            nodes: [],
            links: []
        };
        
        project.mindmaps.push(newMindmap);
        currentMindmapId = newMindmap.id;
        
        StateManager.setState({ project });
        if (window.StorageService) StorageService.saveProject(project);
        if (window.EventBus) EventBus.emit('mindmap:created', newMindmap);
        
        render();
    }

    function deleteMap(id) {
        if (!confirm('Supprimer cette mindmap ?')) return;
        
        const projectState = StateManager.getState();
        const project = projectState.project;
        
        project.mindmaps = project.mindmaps.filter(m => m.id !== id);
        if (currentMindmapId === id) {
            currentMindmapId = project.mindmaps.length > 0 ? project.mindmaps[0].id : null;
        }
        
        StateManager.setState({ project });
        if (window.StorageService) StorageService.saveProject(project);
        
        render();
    }

    function selectMap(id) {
        currentMindmapId = id;
        renderCanvas();
    }

    return {
        render,
        renderCanvas,
        createNew,
        deleteMap,
        selectMap,
        getState: () => state
    };
})();

window.MindmapUI = MindmapUI;
window.renderMindmapView = () => MindmapUI.render();
window.createNewMindmap = () => MindmapUI.createNew();

console.log('[Mindmap] UI initialisée');
