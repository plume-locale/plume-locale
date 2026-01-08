// ============================================
// NOTES VIEW - Vue des notes
// ============================================

/**
 * NotesView - Contrôleur de la vue Notes
 */

const NotesView = {

    async init(params = {}) {
        console.log('[NotesView] Initializing...');

        this._bindEvents();
        await this.render();

        if (params.noteId) {
            this.openDetail(params.noteId);
        }

        console.log('[NotesView] Initialized');
    },

    async render() {
        const container = DOMUtils.query('#notes-view');
        if (!container) {
            console.error('[NotesView] Container #notes-view not found');
            return;
        }

        const notes = NoteService.findAll();
        const html = NotesRender.renderList(notes);

        container.innerHTML = html;
        NotesHandlers.attachListHandlers();
    },

    async openAddModal() {
        const html = NotesRender.renderAddModal();

        ModalUI.open('add-note-modal', html, {
            title: 'Nouvelle note',
            width: 'large'
        });

        NotesHandlers.attachModalHandlers();
    },

    async openDetail(noteId) {
        const note = NoteService.findById(noteId);
        if (!note) {
            ToastUI.error('Note introuvable');
            return;
        }

        const html = NotesRender.renderDetailModal(note);

        ModalUI.open('note-detail-modal', html, {
            title: note.title,
            width: 'large'
        });

        NotesHandlers.attachDetailHandlers(noteId);
    },

    async openEditModal(noteId) {
        const note = NoteService.findById(noteId);
        if (!note) {
            ToastUI.error('Note introuvable');
            return;
        }

        const html = NotesRender.renderEditModal(note);

        ModalUI.open('edit-note-modal', html, {
            title: `Modifier ${note.title}`,
            width: 'large'
        });

        NotesHandlers.attachEditHandlers(noteId);
    },

    _bindEvents() {
        EventBus.on('note:created', () => this.render());
        EventBus.on('note:updated', () => this.render());
        EventBus.on('note:deleted', () => this.render());
    },

    destroy() {
        EventBus.off('note:created');
        EventBus.off('note:updated');
        EventBus.off('note:deleted');

        console.log('[NotesView] Destroyed');
    }
};

window.NotesView = NotesView;
