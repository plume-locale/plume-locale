// ============================================
// NOTES HANDLERS - Gestionnaires d'événements
// ============================================

/**
 * NotesHandlers - Gestion des événements de la vue Notes
 */

const NotesHandlers = {

    attachListHandlers() {
        const container = DOMUtils.query('#notes-view');
        if (!container) return;

        container.addEventListener('click', (e) => {
            const action = e.target.closest('[data-action]')?.dataset.action;
            const noteId = parseInt(e.target.closest('[data-note-id]')?.dataset.noteId);

            if (action === 'add-note') {
                NotesView.openAddModal();
            }
            else if (action === 'toggle-archived') {
                this.toggleArchivedView();
            }
            else if (action === 'view-note' && noteId) {
                NotesView.openDetail(noteId);
            }
            else if (action === 'edit-note' && noteId) {
                NotesView.openEditModal(noteId);
            }
            else if (action === 'delete-note' && noteId) {
                this.handleDelete(noteId);
            }
            else if (action === 'toggle-pin' && noteId) {
                this.handleTogglePin(noteId);
            }
        });

        // Double-clic pour ouvrir
        container.addEventListener('dblclick', (e) => {
            const card = e.target.closest('.note-card');
            if (card) {
                const noteId = parseInt(card.dataset.noteId);
                NotesView.openDetail(noteId);
            }
        });
    },

    attachModalHandlers() {
        const form = DOMUtils.query('#add-note-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleCreate();
        });

        form.querySelector('[data-action="cancel"]')?.addEventListener('click', () => {
            ModalUI.close();
        });
    },

    attachDetailHandlers(noteId) {
        const modal = document.querySelector('.note-detail');
        if (!modal) return;

        modal.addEventListener('click', async (e) => {
            const action = e.target.closest('[data-action]')?.dataset.action;

            if (action === 'edit-note-from-detail') {
                ModalUI.close();
                NotesView.openEditModal(noteId);
            }
            else if (action === 'delete-note-from-detail') {
                const deleted = await this.handleDelete(noteId);
                if (deleted) {
                    ModalUI.close();
                }
            }
            else if (action === 'toggle-pin-from-detail') {
                await this.handleTogglePin(noteId);
                ModalUI.close();
                NotesView.openDetail(noteId);
            }
            else if (action === 'toggle-archive-from-detail') {
                await this.handleToggleArchive(noteId);
                ModalUI.close();
            }
        });
    },

    attachEditHandlers(noteId) {
        const form = DOMUtils.query('#edit-note-form');
        if (!form) return;

        const note = NoteService.findById(noteId);
        if (!note) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleUpdate(noteId);
        });

        form.querySelector('[data-action="cancel"]')?.addEventListener('click', () => {
            ModalUI.close();
        });
    },

    async handleCreate() {
        const form = DOMUtils.query('#add-note-form');
        const formData = this._getFormData(form);

        try {
            const note = NoteService.create(formData);

            ModalUI.close();
            ToastUI.success(`Note "${note.title}" créée`);

        } catch (error) {
            console.error('[NotesHandlers] Error creating note:', error);
            ToastUI.error(error.message || 'Erreur lors de la création');
        }
    },

    async handleUpdate(noteId) {
        const form = DOMUtils.query('#edit-note-form');
        const formData = this._getFormData(form);

        try {
            const note = NoteService.update(noteId, formData);

            ModalUI.close();
            ToastUI.success(`Note "${note.title}" mise à jour`);

        } catch (error) {
            console.error('[NotesHandlers] Error updating note:', error);
            ToastUI.error(error.message || 'Erreur lors de la mise à jour');
        }
    },

    async handleDelete(noteId) {
        const note = NoteService.findById(noteId);
        if (!note) return false;

        const confirmed = await ModalUI.confirm(
            `Supprimer "${note.title}" ?`,
            'Cette action est irréversible.',
            { danger: true }
        );

        if (!confirmed) return false;

        try {
            const success = NoteService.delete(noteId);

            if (success) {
                ToastUI.success(`Note "${note.title}" supprimée`);
            }

            return success;

        } catch (error) {
            console.error('[NotesHandlers] Error deleting note:', error);
            ToastUI.error('Erreur lors de la suppression');
            return false;
        }
    },

    async handleTogglePin(noteId) {
        try {
            const note = NoteService.togglePin(noteId);

            if (note) {
                ToastUI.success(note.pinned ? 'Note épinglée' : 'Note désépinglée');
            }

        } catch (error) {
            console.error('[NotesHandlers] Error toggling pin:', error);
            ToastUI.error('Erreur lors de l\'opération');
        }
    },

    async handleToggleArchive(noteId) {
        try {
            const note = NoteService.toggleArchive(noteId);

            if (note) {
                ToastUI.success(note.archived ? 'Note archivée' : 'Note désarchivée');
            }

        } catch (error) {
            console.error('[NotesHandlers] Error toggling archive:', error);
            ToastUI.error('Erreur lors de l\'opération');
        }
    },

    toggleArchivedView() {
        const archivedSection = DOMUtils.query('.notes-archived');
        if (archivedSection) {
            const isVisible = archivedSection.style.display !== 'none';
            archivedSection.style.display = isVisible ? 'none' : 'block';
        }
    },

    _getFormData(form) {
        const tagsInput = DOMUtils.query('#note-tags', form)?.value.trim() || '';
        const tags = tagsInput
            .split(',')
            .map(t => t.trim().toLowerCase())
            .filter(t => t.length > 0);

        return {
            title: DOMUtils.query('#note-title', form)?.value.trim() || '',
            category: DOMUtils.query('#note-category', form)?.value || 'general',
            content: DOMUtils.query('#note-content', form)?.value.trim() || '',
            color: DOMUtils.query('#note-color', form)?.value || '#f39c12',
            tags
        };
    }
};

window.NotesHandlers = NotesHandlers;
