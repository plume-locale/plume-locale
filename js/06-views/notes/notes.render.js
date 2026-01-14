/**
 * Notes Render
 * Responsible for generating HTML templates for the notes view
 * Pure functions - no DOM manipulation, returns HTML strings only
 */

const NotesRender = (() => {
    /**
     * Render notes list
     * @param {Array} notes - Array of note objects
     * @returns {string} HTML string
     */
    function renderNotesList(notes) {
        if (!notes || notes.length === 0) {
            return renderEmptyNotes();
        }

        // Sort by date (newest first)
        const sorted = [...notes].sort((a, b) => (b.date || 0) - (a.date || 0));

        return `
            <div class="notes-list">
                ${sorted.map(note => renderNoteItem(note)).join('')}
            </div>
        `;
    }

    /**
     * Render single note item in list
     * @param {Object} note - Note object
     * @returns {string} HTML string
     */
    function renderNoteItem(note) {
        const dateStr = formatDate(note.date);
        const preview = (note.content || '').substring(0, 100).replace(/\n/g, ' ');

        return `
            <div class="note-item" data-note-id="${note.id}">
                <div class="note-item-header">
                    <h4 class="note-item-title">${escapeHtml(note.title || 'Sans titre')}</h4>
                    <span class="note-item-date">${dateStr}</span>
                </div>
                <p class="note-item-preview">${escapeHtml(preview)}</p>
                <button class="note-item-delete" onclick="event.stopPropagation();" title="Supprimer">×</button>
            </div>
        `;
    }

    /**
     * Render note detail view
     * @param {Object} note - Note object
     * @returns {string} HTML string
     */
    function renderNoteDetail(note) {
        return `
            <div class="detail-view">
                <div class="detail-header">
                    <input type="text" id="note-title" class="detail-title-input" value="${escapeHtml(note.title || '')}" 
                           placeholder="Titre de la note">
                    <span class="note-detail-date">${formatDate(note.date)}</span>
                </div>

                <div class="detail-section">
                    <textarea id="note-content" class="form-input note-editor" rows="20" 
                              placeholder="Écrivez votre note ici...">${escapeHtml(note.content || '')}</textarea>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Catégories</div>
                    <input type="text" id="note-categories" class="form-input" value="${escapeHtml((note.categories || []).join(', '))}" 
                           placeholder="Séparez par des virgules">
                </div>
            </div>
        `;
    }

    /**
     * Render add note modal
     * @returns {string} HTML string
     */
    function renderAddNoteModal() {
        return `
            <form id="add-note-form">
                <div class="modal-field">
                    <label>Titre *</label>
                    <input type="text" id="note-title-input" class="form-input" placeholder="Titre de la note" required autofocus>
                </div>

                <div class="modal-field">
                    <label>Contenu</label>
                    <textarea id="note-content-input" class="form-input" rows="6" placeholder="Contenu de la note"></textarea>
                </div>

                <div class="modal-field">
                    <label>Catégories</label>
                    <input type="text" id="note-categories-input" class="form-input" placeholder="Ex: idée, personnage, monde">
                </div>

                <div class="modal-actions">
                    <button type="button" class="btn-secondary" onclick="ModalUI.close()">Annuler</button>
                    <button type="submit" class="btn">Créer</button>
                </div>
            </form>
        `;
    }

    /**
     * Render empty state
     * @returns {string} HTML string
     */
    function renderEmptyNotes() {
        return `
            <div style="padding: 2rem 1rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
                <i data-lucide="sticky-note" style="width:32px;height:32px;margin-bottom:0.5rem;opacity:0.5;"></i>
                <p>Aucune note créée</p>
                <p style="font-size: 0.75rem; margin-top: 0.5rem;">Cliquez sur "Ajouter" pour créer votre première note</p>
            </div>
        `;
    }

    /**
     * Format date to readable string
     * @param {number} timestamp - Unix timestamp
     * @returns {string} Formatted date
     */
    function formatDate(timestamp) {
        if (!timestamp) return 'Pas de date';
        const date = new Date(timestamp);
        return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Public API
    return {
        renderNotesList,
        renderNoteItem,
        renderNoteDetail,
        renderAddNoteModal,
        renderEmptyNotes,
        formatDate,
        escapeHtml
    };
})();
