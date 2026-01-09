// Drag and Drop Service
const DragDropService = (() => {
    let draggedAct = null;
    let draggedChapter = { chapterId: null, actId: null };
    let draggedScene = { sceneId: null, chapterId: null, actId: null };

    function setupActDragAndDrop() {
        document.querySelectorAll('.act-header').forEach(header => {
            const handle = header.querySelector('.drag-handle');
            if (!handle) return;
            
            handle.addEventListener('dragstart', (e) => {
                draggedAct = parseInt(header.dataset.actId);
                header.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.stopPropagation();
            });
            
            handle.addEventListener('dragend', () => {
                header.classList.remove('dragging');
                draggedAct = null;
            });
            
            header.addEventListener('dragover', (e) => {
                e.preventDefault();
                const targetId = parseInt(e.currentTarget.dataset.actId);
                if (draggedAct && draggedAct !== targetId) {
                    e.currentTarget.classList.add('drag-over');
                }
            });
            
            header.addEventListener('dragleave', () => {
                header.classList.remove('drag-over');
            });
            
            header.addEventListener('drop', (e) => {
                e.preventDefault();
                header.classList.remove('drag-over');
                const targetId = parseInt(e.currentTarget.dataset.actId);
                if (draggedAct && draggedAct !== targetId) {
                    reorderActs(draggedAct, targetId);
                }
            });
        });
    }

    function reorderActs(draggedId, targetId) {
        const state = StateManager.getState();
        const project = state.project;
        const draggedIndex = project.acts.findIndex(a => a.id === draggedId);
        const targetIndex = project.acts.findIndex(a => a.id === targetId);
        
        if (draggedIndex === -1 || targetIndex === -1) return;
        
        const [removed] = project.acts.splice(draggedIndex, 1);
        project.acts.splice(targetIndex, 0, removed);
        
        StateManager.setState({ project });
        if (window.StorageService) StorageService.saveProject(project);
        if (typeof renderActsList === 'function') renderActsList();
    }

    function init() {
        if (window.EventBus) {
            EventBus.on('view:rendered', setupActDragAndDrop);
        }
        setupActDragAndDrop();
    }

    return { init, setupActDragAndDrop };
})();

window.DragDropService = DragDropService;
window.setupActDragAndDrop = () => DragDropService.setupActDragAndDrop();
window.setupChapterDragAndDrop = () => {}; // Placeholder
window.setupSceneDragAndDrop = () => {}; // Placeholder

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => DragDropService.init());
} else {
    DragDropService.init();
}
