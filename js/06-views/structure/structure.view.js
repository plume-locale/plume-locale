// Migrated from js/06.structure.js

// Note: migrated into view folder. Further refactor into render/handlers/state files recommended.

function refreshAllViews() {
    // Rafraîchir tous les affichages après un undo/redo
    renderActsList();
    
    // Restaurer l'état d'expansion immédiatement après le rendu
    setTimeout(() => restoreTreeState(), 100);
    
    updateStats();
    
    // Rafraîchir la vue actuelle
    switch(currentView) {
        case 'editor':
            // Render the acts/chapters sidebar
            renderActsList();
            // renderViewContent will handle rendering the editor
            break;
        case 'characters':
            renderCharactersList();
            break;
        case 'world':
            renderWorldList();
            break;
        case 'timeline':
            renderTimelineList();
            break;
        case 'notes':
            renderNotesList();
            break;
        case 'codex':
            renderCodexList();
            break;
        case 'stats':
            renderStats();
            break;
        case 'analysis':
            renderAnalysis();
            break;
        case 'versions':
            renderVersionsList();
            break;
        case 'todos':
            if (typeof renderTodosList === 'function') renderTodosList();
            break;
        case 'corkboard':
            if (typeof renderCorkBoard === 'function') renderCorkBoard();
            break;
        case 'mindmap':
            if (typeof renderMindmapView === 'function') renderMindmapView();
            break;
        case 'plot':
            if (typeof renderPlotView === 'function') renderPlotView();
            break;
        case 'relations':
            if (typeof renderRelationsView === 'function') renderRelationsView();
            break;
        case 'map':
            if (typeof renderMapView === 'function') renderMapView();
            break;
        case 'timelineviz':
            if (typeof renderTimelineVizView === 'function') renderTimelineVizView();
            break;
    }
    
    // Rafraîchir l'éditeur si une scène est ouverte
    if (currentSceneId) {
        const scene = findScene(currentActId, currentChapterId, currentSceneId);
        if (scene) {
            document.getElementById('sceneTitle').value = scene.title;
            document.getElementById('sceneContent').value = scene.content || '';
            updateWordCount();
        }
    }
}

// Raccourcis clavier pour undo/redo
document.addEventListener('keydown', function(e) {
    // Ctrl+Z ou Cmd+Z pour undo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (typeof EventBus !== 'undefined') EventBus.emit('history:undo');
        else if (typeof undo === 'function') undo();
    }
    // Ctrl+Y ou Cmd+Shift+Z pour redo
    else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (typeof EventBus !== 'undefined') EventBus.emit('history:redo');
        else if (typeof redo === 'function') redo();
    }
});

function loadProject() {
    const saved = localStorage.getItem('plume_locale_project');
    if (saved) {
        const loadedProject = JSON.parse(saved);
        
        // Migration: Convert old structure (chapters array) to new structure (acts array)
        if (loadedProject.chapters && !loadedProject.acts) {
            console.log('Migrating old project structure to acts-based structure...');
            project = {
                title: loadedProject.title || "Mon Roman",
                acts: [
                    {
                        id: Date.now(),
                        title: "Acte I",
                        chapters: loadedProject.chapters || []
                    }
                ],
                characters: loadedProject.characters || [],
                world: loadedProject.world || []
            };
            // Save migrated structure
            saveProject();
            console.log('Migration complete!');
        } else {
            // Ensure all data structures exist
            project = {
                ...loadedProject,
                characters: loadedProject.characters || [],
                world: loadedProject.world || [],
                timeline: loadedProject.timeline || [],
                notes: loadedProject.notes || [],
                codex: loadedProject.codex || [],
                stats: loadedProject.stats || {
                    dailyGoal: 500,
                    totalGoal: 80000,
                    writingSessions: []
                },
                versions: loadedProject.versions || [],
                relationships: loadedProject.relationships || [],
                metroTimeline: loadedProject.metroTimeline || [],
                characterColors: loadedProject.characterColors || {}
            };
            
            // Ensure all scenes have linked arrays
            project.acts.forEach(act => {
                act.chapters.forEach(chapter => {
                    chapter.scenes.forEach(scene => {
                        if (!scene.linkedCharacters) scene.linkedCharacters = [];
                        if (!scene.linkedElements) scene.linkedElements = [];
                    });
                });
            });
            
            // Ensure all characters have linked arrays
            project.characters.forEach(char => {
                if (!char.linkedScenes) char.linkedScenes = [];
                if (!char.linkedElements) char.linkedElements = [];
            });
            
            // Ensure all world elements have linked arrays
            project.world.forEach(elem => {
                if (!elem.linkedScenes) elem.linkedScenes = [];
                if (!elem.linkedElements) elem.linkedElements = [];
            });
        }
    }
}

// Act Management
function addAct() {
    const title = document.getElementById('actTitleInput').value.trim();
    if (!title) return;

    const act = {
        id: Date.now(),
        title: title,
        chapters: []
    };

    project.acts.push(act);
    
    // Auto-déplier le nouvel acte
    expandedActs.add(act.id);
    
    document.getElementById('actTitleInput').value = '';
    closeModal('addActModal');
    saveProject();
    renderActsList();
}

function deleteAct(actId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet acte et tous ses chapitres ?')) return;
    
    project.acts = project.acts.filter(a => a.id !== actId);
    if (currentActId === actId) {
        currentActId = null;
        currentChapterId = null;
        currentSceneId = null;
        showEmptyState();
    }
    saveProject();
    renderActsList();
}

function toggleAct(actId) {
    const element = document.getElementById(`act-${actId}`);
    const icon = element.querySelector('.act-icon');
    const chaptersContainer = element.querySelector('.act-chapters');
    
    const isExpanded = icon.classList.contains('expanded');
    
    icon.classList.toggle('expanded');
    chaptersContainer.classList.toggle('visible');
    
    // Sauvegarder l'état
    if (isExpanded) {
        expandedActs.delete(actId);
    } else {
        expandedActs.add(actId);
    }
    saveTreeState();
}

function startEditingAct(actId, element) {
    const act = project.acts.find(a => a.id === actId);
    if (!act) return;

    const originalText = act.title;
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'editing-input';
    input.value = originalText;
    
    element.textContent = '';
    element.appendChild(input);
    input.focus();
    input.select();

    const finishEditing = () => {
        const newTitle = input.value.trim();
        if (newTitle && newTitle !== originalText) {
            act.title = newTitle;
            saveProject();
        }
        renderActsList();
    };

    input.addEventListener('blur', finishEditing);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            finishEditing();
        } else if (e.key === 'Escape') {
            renderActsList();
*** End File