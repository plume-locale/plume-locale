/**
 * Timeline Metro UI
 * Timeline style métro avec lignes de personnages
 */

const TimelineMetroUI = (() => {
    'use strict';

    function render() {
        const container = document.getElementById('timelineVizList');
        if (!container) return;
        
        const state = StateManager.getState();
        const project = state.project;
        
        if (!project.metroTimeline) project.metroTimeline = [];
        if (!project.characterColors) project.characterColors = {};
        
        // Assigner couleurs par défaut
        const defaultColors = ['#E53935', '#1E88E5', '#43A047', '#FB8C00', '#8E24AA'];
        project.characters?.forEach((char, i) => {
            if (!project.characterColors[char.id]) {
                project.characterColors[char.id] = defaultColors[i % defaultColors.length];
            }
        });
        
        const eventCount = project.metroTimeline.length;
        const charCount = project.characters?.length || 0;
        
        container.innerHTML = '<div class="timeline-metro-sidebar"><h3>Timeline Métro</h3><div>'+eventCount+' événements</div><div>'+charCount+' personnages</div><button onclick="openMetroEventModal()">+ Événement</button></div>';
        
        renderMainView();
    }

    function renderMainView() {
        const editorView = document.getElementById('editorView');
        if (!editorView) return;
        
        const state = StateManager.getState();
        const project = state.project;
        const charCount = project.characters?.length || 0;
        
        if (charCount === 0) {
            editorView.innerHTML = '<div class="metro-empty">Créez des personnages pour utiliser la timeline métro</div>';
            return;
        }
        
        editorView.innerHTML = '<div class="metro-timeline"><div class="metro-toolbar"><button onclick="openMetroEventModal()">+ Événement</button></div><div class="metro-canvas">Timeline Metro</div></div>';
    }

    function createEvent() {
        const title = prompt('Titre événement:');
        if (!title) return;
        
        const state = StateManager.getState();
        const project = state.project;
        
        if (!project.metroTimeline) project.metroTimeline = [];
        
        const event = {
            id: Date.now(),
            title: title,
            date: '',
            characters: [],
            order: project.metroTimeline.length
        };
        
        project.metroTimeline.push(event);
        
        StateManager.setState({ project });
        if (window.StorageService) StorageService.saveProject(project);
        
        render();
    }

    function deleteEvent(id) {
        if (!confirm('Supprimer cet événement ?')) return;
        
        const state = StateManager.getState();
        const project = state.project;
        
        project.metroTimeline = project.metroTimeline.filter(e => e.id !== id);
        
        StateManager.setState({ project });
        if (window.StorageService) StorageService.saveProject(project);
        
        render();
    }

    return {
        render,
        renderMainView,
        createEvent,
        deleteEvent
    };
})();

window.TimelineMetroUI = TimelineMetroUI;
window.renderTimelineVizView = () => TimelineMetroUI.render();
window.openMetroEventModal = () => TimelineMetroUI.createEvent();

console.log('[TimelineMetro] UI initialisée');
