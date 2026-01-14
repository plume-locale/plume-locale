/**
 * Notes View (Refactored MVVM)
 * Orchestrates the notes view
 */

const NotesView = (() => {
    function init() {
        render();
        bindEvents();
    }

    function render() {
        const container = document.getElementById('notesList');
        if (!container) return;

        const state = StateManager.get('project');
        const html = NotesRender.renderNotesList(state.notes || []);
        container.innerHTML = html;
        NotesHandlers.attachListHandlers();
    }

    function bindEvents() {
        if (typeof EventBus !== 'undefined') {
            EventBus.on('project:updated', () => render());
            EventBus.on('note:created', () => render());
            EventBus.on('note:deleted', () => render());
        }
    }

    function loadProject() {
        const saved = localStorage.getItem('plume_locale_project');
        if (!saved) return;

        const loadedProject = JSON.parse(saved);
        const project = {
            ...loadedProject,
            notes: loadedProject.notes || []
        };

        StateManager.set('project', project);
    }

    function getAllNotes() {
        const state = StateManager.get('project');
        return state.notes || [];
    }

    function getNote(noteId) {
        const state = StateManager.get('project');
        return state.notes?.find(n => n.id === noteId) || null;
    }

    function destroy() {
        // Cleanup
    }

    return {
        init,
        render,
        bindEvents,
        loadProject,
        getAllNotes,
        getNote,
        destroy
    };
})();
