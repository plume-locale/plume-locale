/**
 * Notes Handlers
 * Responsible for handling all user interactions in the notes view
 */

const NotesHandlers = (() => {
    /**
     * Attach event listeners to notes list
     */
    function attachListHandlers() {
        const container = document.getElementById('notesList');
        if (!container) return;

        container.addEventListener('click', (e) => {
            // Note item click
            const item = e.target.closest('.note-item');
            if (item) {
                const noteId = parseInt(item.dataset.noteId);
                openNoteDetail(noteId);
                return;
            }

            // Delete button
            const deleteBtn = e.target.closest('.note-item-delete');
            if (deleteBtn) {
                const item = deleteBtn.closest('.note-item');
                const noteId = parseInt(item.dataset.noteId);
                deleteNote(noteId);
                return;
            }
        });

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    /**
     * Open add note modal
     */
    function openAddNoteModal() {
        const html = NotesRender.renderAddNoteModal();
        ModalUI.open('add-note-modal', html);
        attachAddNoteHandlers();
    }

    /**
     * Attach handlers to add note form
     */
    function attachAddNoteHandlers() {
        const form = document.getElementById('add-note-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleAddNote();
        });
    }

    /**
     * Handle adding a new note
     */
    async function handleAddNote() {
        const title = document.getElementById('note-title-input')?.value.trim();
        const content = document.getElementById('note-content-input')?.value.trim();
        const categoriesStr = document.getElementById('note-categories-input')?.value.trim();

        if (!title) {
            alert('Le titre est requis');
            return;
        }

        try {
            const state = StateManager.get('project');

            const newNote = {
                id: Date.now(),
                title: title,
                content: content || '',
                categories: categoriesStr ? categoriesStr.split(',').map(c => c.trim()) : [],
                date: Date.now()
            };

            if (!state.notes) {
                state.notes = [];
            }

            state.notes.push(newNote);
            StateManager.set('project', state);

            if (typeof StorageService !== 'undefined') {
                await StorageService.saveProject(state);
            } else if (typeof saveProject === 'function') {
                saveProject();
            }

            ModalUI.close();
            NotesView.render();

            if (typeof EventBus !== 'undefined') {
                EventBus.emit('note:created', newNote);
            }
        } catch (error) {
            console.error('Error adding note:', error);
            alert('Erreur lors de la création de la note');
        }
    }

    /**
     * Open note detail view
     * @param {number} noteId - Note ID
     */
    function openNoteDetail(noteId) {
        const state = StateManager.get('project');
        const note = state.notes?.find(n => n.id === noteId);

        if (!note) return;

        const html = NotesRender.renderNoteDetail(note);
        const container = document.getElementById('editorView');
        if (container) {
            container.innerHTML = html;
            attachNoteDetailHandlers(noteId);

            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
    }

    /**
     * Attach handlers to note detail view
     * @param {number} noteId - Note ID
     */
    function attachNoteDetailHandlers(noteId) {
        const titleInput = document.getElementById('note-title');
        const contentInput = document.getElementById('note-content');
        const categoriesInput = document.getElementById('note-categories');

        // Auto-save with debouncing
        let saveTimeout;

        const autoSave = async () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(async () => {
                const title = titleInput.value;
                const content = contentInput.value;
                const categories = categoriesInput.value
                    .split(',')
                    .map(c => c.trim())
                    .filter(c => c);

                try {
                    const state = StateManager.get('project');
                    const note = state.notes?.find(n => n.id === noteId);

                    if (note) {
                        note.title = title || 'Sans titre';
                        note.content = content;
                        note.categories = categories;
                        StateManager.set('project', state);

                        if (typeof StorageService !== 'undefined') {
                            await StorageService.saveProject(state);
                        } else if (typeof saveProject === 'function') {
                            saveProject();
                        }

                        if (typeof EventBus !== 'undefined') {
                            EventBus.emit('note:updated', note);
                        }
                    }
                } catch (error) {
                    console.error('Error saving note:', error);
                }
            }, 1000);
        };

        if (titleInput) titleInput.addEventListener('change', autoSave);
        if (contentInput) contentInput.addEventListener('change', autoSave);
        if (categoriesInput) categoriesInput.addEventListener('change', autoSave);
    }

    /**
     * Delete a note
     * @param {number} noteId - Note ID
     */
    async function deleteNote(noteId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
            return;
        }

        try {
            const state = StateManager.get('project');
            if (state.notes) {
                state.notes = state.notes.filter(n => n.id !== noteId);
                StateManager.set('project', state);

                if (typeof StorageService !== 'undefined') {
                    await StorageService.saveProject(state);
                } else if (typeof saveProject === 'function') {
                    saveProject();
                }

                NotesView.render();

                if (typeof EventBus !== 'undefined') {
                    EventBus.emit('note:deleted', noteId);
                }
            }
        } catch (error) {
            console.error('Error deleting note:', error);
            alert('Erreur lors de la suppression');
        }
    }

    /**
     * Search notes
     * @param {string} query - Search query
     * @returns {Array} Matching notes
     */
    function searchNotes(query) {
        const state = StateManager.get('project');
        if (!state.notes) return [];

        const lowerQuery = query.toLowerCase();
        return state.notes.filter(n =>
            n.title.toLowerCase().includes(lowerQuery) ||
            n.content.toLowerCase().includes(lowerQuery) ||
            (n.categories && n.categories.some(c => c.toLowerCase().includes(lowerQuery)))
        );
    }

    /**
     * Filter notes by category
     * @param {string} category - Category to filter
     * @returns {Array} Filtered notes
     */
    function filterByCategory(category) {
        const state = StateManager.get('project');
        if (!state.notes) return [];

        if (!category) return state.notes;
        return state.notes.filter(n => n.categories && n.categories.includes(category));
    }

    /**
     * Get all categories
     * @returns {Array} Unique categories
     */
    function getAllCategories() {
        const state = StateManager.get('project');
        if (!state.notes) return [];

        const categories = new Set();
        state.notes.forEach(note => {
            if (note.categories) {
                note.categories.forEach(cat => categories.add(cat));
            }
        });

        return Array.from(categories).sort();
    }

    // Public API
    return {
        attachListHandlers,
        openAddNoteModal,
        attachAddNoteHandlers,
        handleAddNote,
        openNoteDetail,
        attachNoteDetailHandlers,
        deleteNote,
        searchNotes,
        filterByCategory,
        getAllCategories
    };
})();
