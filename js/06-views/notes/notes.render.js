// ============================================
// NOTES RENDER - Rendu HTML Notes
// ============================================

/**
 * NotesRender - Génération du HTML pour la vue Notes
 */

const NotesRender = {

    renderList(notes) {
        if (notes.length === 0) {
            return this.renderEmptyState();
        }

        const pinned = notes.filter(n => n.pinned && !n.archived);
        const regular = notes.filter(n => !n.pinned && !n.archived);
        const archived = notes.filter(n => n.archived);

        return `
            <div class="notes-view">
                <div class="notes-header">
                    <h1>Notes</h1>
                    <div class="notes-header-actions">
                        <button class="btn btn-secondary" data-action="toggle-archived">
                            <i class="lucide-archive"></i> Archives (${archived.length})
                        </button>
                        <button class="btn btn-primary" data-action="add-note">
                            <i class="lucide-plus"></i> Nouvelle note
                        </button>
                    </div>
                </div>

                ${pinned.length > 0 ? `
                    <div class="notes-section">
                        <h2><i class="lucide-pin"></i> Épinglées</h2>
                        <div class="notes-grid">
                            ${pinned.map(n => this.renderCard(n)).join('')}
                        </div>
                    </div>
                ` : ''}

                ${regular.length > 0 ? `
                    <div class="notes-section">
                        <h2>Toutes les notes</h2>
                        <div class="notes-grid">
                            ${regular.map(n => this.renderCard(n)).join('')}
                        </div>
                    </div>
                ` : ''}

                <div class="notes-archived" style="display: none;">
                    <div class="notes-section">
                        <h2><i class="lucide-archive"></i> Archivées</h2>
                        <div class="notes-grid">
                            ${archived.map(n => this.renderCard(n)).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderCard(note) {
        const wordCount = note.getWordCount();

        return `
            <div class="note-card" data-note-id="${note.id}" style="border-left: 4px solid ${note.color}">
                <div class="note-card-header">
                    <h3 class="note-title">${DOMUtils.escape(note.title)}</h3>
                    <div class="note-badges">
                        ${note.pinned ? '<i class="lucide-pin note-pinned" title="Épinglée"></i>' : ''}
                        ${note.archived ? '<i class="lucide-archive note-archived" title="Archivée"></i>' : ''}
                    </div>
                </div>

                <div class="note-card-body">
                    <p class="note-preview">
                        ${note.content ?
                            TextUtils.truncate(DOMUtils.escape(TextUtils.stripHTML(note.content)), 150) :
                            '<em>Note vide</em>'}
                    </p>

                    <div class="note-meta">
                        <span class="note-category">
                            <i class="lucide-folder"></i> ${this._getCategoryLabel(note.category)}
                        </span>
                        <span class="note-wordcount">
                            <i class="lucide-file-text"></i> ${wordCount} mots
                        </span>
                        <span class="note-date">
                            <i class="lucide-clock"></i> ${DateUtils.relative(note.updatedAt)}
                        </span>
                    </div>

                    ${note.tags.length > 0 ? `
                        <div class="note-tags">
                            ${note.tags.slice(0, 3).map(tag =>
                                `<span class="tag">${DOMUtils.escape(tag)}</span>`
                            ).join('')}
                            ${note.tags.length > 3 ? `<span class="tag-more">+${note.tags.length - 3}</span>` : ''}
                        </div>
                    ` : ''}
                </div>

                <div class="note-card-actions">
                    <button class="btn-icon" data-action="toggle-pin" data-note-id="${note.id}" title="${note.pinned ? 'Désépingler' : 'Épingler'}">
                        <i class="lucide-pin"></i>
                    </button>
                    <button class="btn-icon" data-action="view-note" data-note-id="${note.id}" title="Voir">
                        <i class="lucide-eye"></i>
                    </button>
                    <button class="btn-icon" data-action="edit-note" data-note-id="${note.id}" title="Modifier">
                        <i class="lucide-edit"></i>
                    </button>
                    <button class="btn-icon" data-action="delete-note" data-note-id="${note.id}" title="Supprimer">
                        <i class="lucide-trash-2"></i>
                    </button>
                </div>
            </div>
        `;
    },

    renderEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="lucide-sticky-note" style="font-size: 64px;"></i>
                </div>
                <h2>Aucune note</h2>
                <p>Créez votre première note pour organiser vos idées et recherches.</p>
                <button class="btn btn-primary" data-action="add-note">
                    <i class="lucide-plus"></i> Créer une note
                </button>
            </div>
        `;
    },

    renderAddModal() {
        const categories = [
            { value: 'general', label: 'Général' },
            { value: 'research', label: 'Recherche' },
            { value: 'ideas', label: 'Idées' },
            { value: 'plot', label: 'Intrigue' },
            { value: 'character', label: 'Personnage' },
            { value: 'world', label: 'Univers' }
        ];

        return `
            <form id="add-note-form" class="note-form">
                <div class="form-group">
                    <label for="note-title">Titre *</label>
                    <input type="text" id="note-title" required placeholder="Ma note">
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="note-category">Catégorie</label>
                        <select id="note-category">
                            ${categories.map(c => `<option value="${c.value}">${c.label}</option>`).join('')}
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="note-color">Couleur</label>
                        <input type="color" id="note-color" value="#f39c12">
                    </div>
                </div>

                <div class="form-group">
                    <label for="note-content">Contenu</label>
                    <textarea id="note-content" rows="12" placeholder="Écrivez votre note ici..."></textarea>
                </div>

                <div class="form-group">
                    <label for="note-tags">Tags (séparés par des virgules)</label>
                    <input type="text" id="note-tags" placeholder="recherche, idée, important">
                </div>

                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" data-action="cancel">Annuler</button>
                    <button type="submit" class="btn btn-primary">Créer</button>
                </div>
            </form>
        `;
    },

    renderDetailModal(note) {
        return `
            <div class="note-detail" style="border-left: 6px solid ${note.color}">
                <div class="note-detail-header">
                    <div>
                        <h2>${DOMUtils.escape(note.title)}</h2>
                        <p class="note-detail-meta">
                            ${this._getCategoryLabel(note.category)} •
                            ${note.getWordCount()} mots •
                            Modifiée ${DateUtils.relative(note.updatedAt)}
                        </p>
                    </div>
                    <div class="note-detail-badges">
                        ${note.pinned ? '<span class="badge badge-pin"><i class="lucide-pin"></i> Épinglée</span>' : ''}
                        ${note.archived ? '<span class="badge badge-archive"><i class="lucide-archive"></i> Archivée</span>' : ''}
                    </div>
                </div>

                ${note.tags.length > 0 ? `
                    <div class="note-detail-tags">
                        ${note.tags.map(tag =>
                            `<span class="tag">${DOMUtils.escape(tag)}</span>`
                        ).join('')}
                    </div>
                ` : ''}

                <div class="note-detail-content">
                    ${note.content ?
                        `<div class="note-content">${TextUtils.nl2br(DOMUtils.escape(note.content))}</div>` :
                        '<p><em>Cette note est vide</em></p>'}
                </div>

                <div class="note-detail-actions">
                    <button class="btn btn-secondary" data-action="toggle-pin-from-detail" data-note-id="${note.id}">
                        <i class="lucide-pin"></i> ${note.pinned ? 'Désépingler' : 'Épingler'}
                    </button>
                    <button class="btn btn-secondary" data-action="toggle-archive-from-detail" data-note-id="${note.id}">
                        <i class="lucide-archive"></i> ${note.archived ? 'Désarchiver' : 'Archiver'}
                    </button>
                    <button class="btn btn-primary" data-action="edit-note-from-detail" data-note-id="${note.id}">
                        <i class="lucide-edit"></i> Modifier
                    </button>
                    <button class="btn btn-danger" data-action="delete-note-from-detail" data-note-id="${note.id}">
                        <i class="lucide-trash-2"></i> Supprimer
                    </button>
                </div>
            </div>
        `;
    },

    renderEditModal(note) {
        return this.renderAddModal()
            .replace('id="add-note-form"', `id="edit-note-form" data-note-id="${note.id}"`)
            .replace('id="note-title" required', `id="note-title" required value="${DOMUtils.escape(note.title)}"`)
            .replace('id="note-content"', `id="note-content">${DOMUtils.escape(note.content)}`)
            .replace('id="note-color" value="#f39c12"', `id="note-color" value="${note.color}"`)
            .replace('id="note-tags"', `id="note-tags" value="${note.tags.join(', ')}"`)
            .replace(`value="${note.category}"`, `value="${note.category}" selected`)
            .replace('<button type="submit" class="btn btn-primary">Créer</button>', '<button type="submit" class="btn btn-primary">Sauvegarder</button>');
    },

    _getCategoryLabel(category) {
        const labels = {
            general: 'Général',
            research: 'Recherche',
            ideas: 'Idées',
            plot: 'Intrigue',
            character: 'Personnage',
            world: 'Univers'
        };
        return labels[category] || category;
    }
};

window.NotesRender = NotesRender;
