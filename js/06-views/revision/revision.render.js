/**
 * Revision Render
 * Responsible for generating HTML templates for the revision view
 */

const RevisionRender = (() => {
    function renderRevisionsList(revisions) {
        if (!revisions || revisions.length === 0) {
            return renderEmptyRevisions();
        }

        const sorted = [...revisions].sort((a, b) => {
            const dateA = new Date(a.timestamp || 0);
            const dateB = new Date(b.timestamp || 0);
            return dateB - dateA;
        });

        return `
            <div class="revisions-list">
                ${sorted.map(rev => renderRevisionItem(rev)).join('')}
            </div>
        `;
    }

    function renderRevisionItem(revision) {
        const date = formatDate(revision.timestamp);
        const status = revision.status || 'active';

        return `
            <div class="revision-item" data-revision-id="${revision.id}">
                <div class="revision-header">
                    <h4 class="revision-title">${escapeHtml(revision.title)}</h4>
                    <span class="revision-date">${date}</span>
                </div>
                <p class="revision-description">${escapeHtml(revision.description || '')}</p>
                <div class="revision-meta">
                    <span class="revision-status ${status}">${getStatusLabel(status)}</span>
                    <span class="revision-type">${escapeHtml(revision.type || 'Révision')}</span>
                </div>
                <div class="revision-actions">
                    <button class="revision-view-btn" title="Voir les détails">Détails</button>
                    <button class="revision-compare-btn" title="Comparer avec la version précédente">Comparer</button>
                    <button class="revision-restore-btn" title="Restaurer cette version">Restaurer</button>
                    <button class="revision-delete-btn" title="Supprimer">×</button>
                </div>
            </div>
        `;
    }

    function renderRevisionDetail(revision) {
        return `
            <div class="detail-view">
                <div class="detail-header">
                    <input type="text" id="revision-title" class="detail-title-input" value="${escapeHtml(revision.title)}" 
                           placeholder="Titre de la révision">
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Type</div>
                    <select id="revision-type" class="form-input">
                        <option value="Révision" ${revision.type === 'Révision' ? 'selected' : ''}>Révision</option>
                        <option value="Relecture" ${revision.type === 'Relecture' ? 'selected' : ''}>Relecture</option>
                        <option value="Édition" ${revision.type === 'Édition' ? 'selected' : ''}>Édition</option>
                        <option value="Réécriture" ${revision.type === 'Réécriture' ? 'selected' : ''}>Réécriture</option>
                        <option value="Sauvegarde" ${revision.type === 'Sauvegarde' ? 'selected' : ''}>Sauvegarde</option>
                    </select>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Statut</div>
                    <select id="revision-status" class="form-input">
                        <option value="active" ${revision.status === 'active' ? 'selected' : ''}>Actif</option>
                        <option value="archived" ${revision.status === 'archived' ? 'selected' : ''}>Archivé</option>
                        <option value="rejected" ${revision.status === 'rejected' ? 'selected' : ''}>Rejeté</option>
                    </select>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Description</div>
                    <textarea id="revision-description" class="form-input" rows="4" 
                              placeholder="Qu'a été changé ?">${escapeHtml(revision.description || '')}</textarea>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Notes de l'auteur</div>
                    <textarea id="revision-notes" class="form-input" rows="6" 
                              placeholder="Notes personnelles">${escapeHtml(revision.notes || '')}</textarea>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Changements apportés</div>
                    <input type="text" id="revision-changes" class="form-input" 
                           value="${escapeHtml(revision.changes ? revision.changes.join(', ') : '')}" 
                           placeholder="Ex: Structure, Dialogue, Descriptions">
                </div>

                <div class="detail-info">
                    <small>Créée: ${formatDate(revision.timestamp)}</small>
                </div>
            </div>
        `;
    }

    function renderAddRevisionModal() {
        return `
            <form id="add-revision-form">
                <div class="modal-field">
                    <label>Titre de la révision *</label>
                    <input type="text" id="revision-title-input" class="form-input" 
                           placeholder="Ex: Révision acte 2" required autofocus>
                </div>

                <div class="modal-field">
                    <label>Type</label>
                    <select id="revision-type-input" class="form-input">
                        <option value="Révision">Révision</option>
                        <option value="Relecture">Relecture</option>
                        <option value="Édition">Édition</option>
                        <option value="Réécriture">Réécriture</option>
                        <option value="Sauvegarde">Sauvegarde</option>
                    </select>
                </div>

                <div class="modal-field">
                    <label>Description</label>
                    <textarea id="revision-description-input" class="form-input" rows="3" 
                              placeholder="Qu'a été changé ?"></textarea>
                </div>

                <div class="modal-actions">
                    <button type="button" class="btn-secondary" onclick="ModalUI.close()">Annuler</button>
                    <button type="submit" class="btn">Créer</button>
                </div>
            </form>
        `;
    }

    function renderEmptyRevisions() {
        return `
            <div style="padding: 2rem 1rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
                <i data-lucide="history" style="width:32px;height:32px;margin-bottom:0.5rem;opacity:0.5;"></i>
                <p>Aucune révision</p>
            </div>
        `;
    }

    function formatDate(timestamp) {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function getStatusLabel(status) {
        const labels = {
            'active': 'Actif',
            'archived': 'Archivé',
            'rejected': 'Rejeté'
        };
        return labels[status] || status;
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return {
        renderRevisionsList,
        renderRevisionItem,
        renderRevisionDetail,
        renderAddRevisionModal,
        renderEmptyRevisions,
        formatDate,
        escapeHtml
    };
})();
