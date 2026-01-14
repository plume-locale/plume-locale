/**
 * Codex Render
 * Responsible for generating HTML templates for the codex view
 */

const CodexRender = (() => {
    function renderCodexList(entries) {
        if (!entries || entries.length === 0) {
            return renderEmptyCodex();
        }

        const sorted = [...entries].sort((a, b) =>
            (a.title || '').toLowerCase().localeCompare((b.title || '').toLowerCase(), 'fr')
        );

        return `
            <div class="codex-list">
                ${sorted.map(entry => renderCodexItem(entry)).join('')}
            </div>
        `;
    }

    function renderCodexItem(entry) {
        const category = entry.category || 'Général';
        return `
            <div class="codex-item" data-codex-id="${entry.id}">
                <div class="codex-item-header">
                    <h4 class="codex-item-title">${escapeHtml(entry.title)}</h4>
                    <span class="codex-item-category">${escapeHtml(category)}</span>
                </div>
                <p class="codex-item-description">${escapeHtml((entry.description || '').substring(0, 100))}</p>
                <button class="codex-item-delete" onclick="event.stopPropagation();" title="Supprimer">×</button>
            </div>
        `;
    }

    function renderCodexDetail(entry) {
        return `
            <div class="detail-view">
                <div class="detail-header">
                    <input type="text" id="codex-title" class="detail-title-input" value="${escapeHtml(entry.title || '')}" 
                           placeholder="Titre de l'entrée">
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Catégorie</div>
                    <input type="text" id="codex-category" class="form-input" value="${escapeHtml(entry.category || 'Général')}" 
                           placeholder="Ex: Personnages, Lieux, Concepts">
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Description</div>
                    <textarea id="codex-description" class="form-input" rows="4" 
                              placeholder="Description courte">${escapeHtml(entry.description || '')}</textarea>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Contenu détaillé</div>
                    <textarea id="codex-content" class="form-input codex-editor" rows="12" 
                              placeholder="Contenu complet de l'entrée">${escapeHtml(entry.content || '')}</textarea>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Mots-clés</div>
                    <input type="text" id="codex-keywords" class="form-input" value="${escapeHtml((entry.keywords || []).join(', '))}" 
                           placeholder="Séparez par des virgules">
                </div>
            </div>
        `;
    }

    function renderAddCodexModal() {
        return `
            <form id="add-codex-form">
                <div class="modal-field">
                    <label>Titre *</label>
                    <input type="text" id="codex-title-input" class="form-input" placeholder="Titre de l'entrée" required autofocus>
                </div>

                <div class="modal-field">
                    <label>Catégorie</label>
                    <input type="text" id="codex-category-input" class="form-input" placeholder="Ex: Personnages">
                </div>

                <div class="modal-field">
                    <label>Description</label>
                    <textarea id="codex-description-input" class="form-input" rows="4" placeholder="Description courte"></textarea>
                </div>

                <div class="modal-actions">
                    <button type="button" class="btn-secondary" onclick="ModalUI.close()">Annuler</button>
                    <button type="submit" class="btn">Créer</button>
                </div>
            </form>
        `;
    }

    function renderEmptyCodex() {
        return `
            <div style="padding: 2rem 1rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
                <i data-lucide="book" style="width:32px;height:32px;margin-bottom:0.5rem;opacity:0.5;"></i>
                <p>Aucune entrée de codex</p>
            </div>
        `;
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return {
        renderCodexList,
        renderCodexItem,
        renderCodexDetail,
        renderAddCodexModal,
        renderEmptyCodex,
        escapeHtml
    };
})();
