// ============================================
// NOTE SERVICE - Service métier Notes
// ============================================

/**
 * NoteService - Logique métier pour les notes
 */

const NoteService = {

    create(noteData) {
        const note = new Note(noteData);
        note.validate();

        const state = StateManager.getState();
        if (!state.project) {
            throw new Error('Aucun projet actif');
        }

        state.project.notes.push(note.toJSON());
        state.project.touch();

        EventBus.emit('note:created', note);
        StorageService.saveProject(state.project);

        return note;
    },

    update(noteId, updates) {
        const noteData = this._findNoteData(noteId);
        if (!noteData) {
            throw new Error('Note introuvable');
        }

        Object.assign(noteData, updates);
        noteData.updatedAt = Date.now();

        const note = new Note(noteData);
        note.validate();

        const state = StateManager.getState();
        state.project.touch();

        EventBus.emit('note:updated', note);
        StorageService.saveProject(state.project);

        return note;
    },

    delete(noteId) {
        const state = StateManager.getState();
        if (!state.project) return false;

        const index = state.project.notes.findIndex(n => n.id === noteId);
        if (index === -1) return false;

        state.project.notes.splice(index, 1);
        state.project.touch();

        EventBus.emit('note:deleted', noteId);
        StorageService.saveProject(state.project);

        return true;
    },

    findById(noteId) {
        const noteData = this._findNoteData(noteId);
        return noteData ? new Note(noteData) : null;
    },

    findAll() {
        const state = StateManager.getState();
        if (!state.project) return [];

        return state.project.notes.map(data => new Note(data));
    },

    search(query) {
        return this.findAll().filter(note =>
            TextUtils.contains(note.title, query) ||
            TextUtils.contains(note.content, query)
        );
    },

    findByCategory(category) {
        return this.findAll().filter(note => note.category === category);
    },

    findByTag(tag) {
        return this.findAll().filter(note =>
            note.tags.includes(tag.toLowerCase())
        );
    },

    findPinned() {
        return this.findAll().filter(note => note.pinned && !note.archived);
    },

    findArchived() {
        return this.findAll().filter(note => note.archived);
    },

    getAllTags() {
        const tags = new Set();
        this.findAll().forEach(note => {
            note.tags.forEach(tag => tags.add(tag));
        });
        return Array.from(tags).sort();
    },

    togglePin(noteId) {
        const note = this.findById(noteId);
        if (!note) return null;

        return this.update(noteId, { pinned: !note.pinned });
    },

    toggleArchive(noteId) {
        const note = this.findById(noteId);
        if (!note) return null;

        return this.update(noteId, { archived: !note.archived });
    },

    _findNoteData(noteId) {
        const state = StateManager.getState();
        return ArrayUtils.findById(state.project?.notes || [], noteId);
    }
};

window.NoteService = NoteService;
