// ============================================
// NOTE MODEL - Modèle de données Note
// ============================================

/**
 * Note - Modèle représentant une note
 */

class Note {
    constructor(data = {}) {
        this.id = data.id || Date.now();
        this.title = data.title || 'Nouvelle note';
        this.content = data.content || '';
        this.category = data.category || 'general'; // general, research, ideas, plot, character, world
        this.color = data.color || '#f39c12';

        // Organisation
        this.tags = data.tags || [];
        this.pinned = data.pinned || false;
        this.archived = data.archived || false;

        // Liens
        this.links = data.links || []; // Liens vers scènes, personnages, etc.

        // Timestamps
        this.createdAt = data.createdAt || Date.now();
        this.updatedAt = data.updatedAt || Date.now();
    }

    validate() {
        if (!Validators.required(this.title)) {
            throw new Error('Le titre de la note est requis');
        }
        return true;
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            content: this.content,
            category: this.category,
            color: this.color,
            tags: this.tags,
            pinned: this.pinned,
            archived: this.archived,
            links: this.links,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    clone() {
        return new Note(JSON.parse(JSON.stringify(this.toJSON())));
    }

    touch() {
        this.updatedAt = Date.now();
    }

    addTag(tag) {
        const normalized = tag.trim().toLowerCase();
        if (normalized && !this.tags.includes(normalized)) {
            this.tags.push(normalized);
            this.touch();
        }
    }

    removeTag(tag) {
        this.tags = ArrayUtils.remove(this.tags, tag.toLowerCase());
        this.touch();
    }

    togglePin() {
        this.pinned = !this.pinned;
        this.touch();
    }

    toggleArchive() {
        this.archived = !this.archived;
        this.touch();
    }

    getWordCount() {
        return TextUtils.countWords(this.content);
    }
}

window.Note = Note;
