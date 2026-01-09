/**
 * Corkboard UI
 * Vue tableau de liège pour l'organisation visuelle des scènes
 */

const CorkboardUI = (() => {
    'use strict';

    let filter = {
        type: 'all',
        actId: null,
        chapterId: null
    };

    function render() {
        const state = StateManager.getState();
        const project = state.project;
        
        return renderBoard(project);
    }

    function renderBoard(project) {
        // Collecte des scènes selon le filtre
        let scenes = [];
        
        if (filter.type === 'all') {
            project.acts.forEach(act => {
                act.chapters.forEach(chapter => {
                    chapter.scenes.forEach(scene => {
                        scenes.push({
                            ...scene,
                            actId: act.id,
                            actTitle: act.title,
                            chapterId: chapter.id,
                            chapterTitle: chapter.title
                        });
                    });
                });
            });
        } else if (filter.type === 'act') {
            const act = project.acts.find(a => a.id === filter.actId);
            if (act) {
                act.chapters.forEach(chapter => {
                    chapter.scenes.forEach(scene => {
                        scenes.push({
                            ...scene,
                            actId: act.id,
                            actTitle: act.title,
                            chapterId: chapter.id,
                            chapterTitle: chapter.title
                        });
                    });
                });
            }
        }
        
        return renderSceneCards(scenes);
    }

    function renderSceneCards(scenes) {
        // Rendu simplifié
        return '<div class="corkboard">Scènes: ' + scenes.length + '</div>';
    }

    function setFilter(type, actId = null, chapterId = null) {
        filter = { type, actId, chapterId };
    }

    function setCorkColor(actId, chapterId, sceneId, color) {
        const state = StateManager.getState();
        const project = state.project;
        
        const act = project.acts.find(a => a.id === actId);
        if (!act) return;
        
        const chapter = act.chapters.find(c => c.id === chapterId);
        if (!chapter) return;
        
        const scene = chapter.scenes.find(s => s.id === sceneId);
        if (!scene) return;
        
        scene.corkColor = color;
        StateManager.setState({ project });
        
        if (window.StorageService) StorageService.saveProject(project);
        if (window.EventBus) EventBus.emit('cork:updated');
    }

    function updateSynopsis(actId, chapterId, sceneId, synopsis) {
        const state = StateManager.getState();
        const project = state.project;
        
        const act = project.acts.find(a => a.id === actId);
        if (!act) return;
        
        const chapter = act.chapters.find(c => c.id === chapterId);
        if (!chapter) return;
        
        const scene = chapter.scenes.find(s => s.id === sceneId);
        if (!scene) return;
        
        scene.synopsis = synopsis;
        StateManager.setState({ project });
        
        if (window.StorageService) StorageService.saveProject(project);
    }

    return {
        render,
        setFilter,
        setCorkColor,
        updateSynopsis
    };
})();

window.CorkboardUI = CorkboardUI;
window.renderCorkBoard = () => CorkboardUI.render();
window.openCorkBoardView = () => CorkboardUI.render();

console.log('[Corkboard] UI initialisée');
