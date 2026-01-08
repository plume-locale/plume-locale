// ============================================
// ARC BOARD RENDER - Rendu HTML Arc Board
// ============================================

const ArcBoardRender = (function() {
    'use strict';

    function renderView(options = {}) {
        const { arcsByStatus = {}, filterCategory = 'all' } = options;

        return `
            <div class="arc-board-container">
                ${_renderToolbar(filterCategory)}
                <div class="arc-board-columns">
                    ${_renderColumn('planned', 'Planifiés', arcsByStatus.planned || [])}
                    ${_renderColumn('in-progress', 'En cours', arcsByStatus['in-progress'] || [])}
                    ${_renderColumn('completed', 'Terminés', arcsByStatus.completed || [])}
                </div>
            </div>
        `;
    }

    function _renderToolbar(filterCategory) {
        return `
            <div class="toolbar">
                <div class="toolbar-left">
                    <button class="btn btn-primary" data-action="add-arc">
                        <i data-lucide="plus"></i>
                        Nouvel arc
                    </button>
                    <div class="toolbar-filters">
                        <button class="btn btn-sm ${filterCategory === 'all' ? 'btn-primary' : 'btn-secondary'}"
                                data-action="filter" data-category="all">
                            Tous
                        </button>
                        <button class="btn btn-sm ${filterCategory === 'plot' ? 'btn-primary' : 'btn-secondary'}"
                                data-action="filter" data-category="plot">
                            Intrigue
                        </button>
                        <button class="btn btn-sm ${filterCategory === 'character' ? 'btn-primary' : 'btn-secondary'}"
                                data-action="filter" data-category="character">
                            Personnage
                        </button>
                        <button class="btn btn-sm ${filterCategory === 'theme' ? 'btn-primary' : 'btn-secondary'}"
                                data-action="filter" data-category="theme">
                            Thème
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    function _renderColumn(status, title, arcs) {
        return `
            <div class="arc-column" data-status="${status}">
                <div class="arc-column-header">
                    <h3>${title}</h3>
                    <span class="arc-column-count">${arcs.length}</span>
                </div>
                <div class="arc-column-body">
                    ${arcs.length > 0 ? arcs.map(arc => _renderCard(arc)).join('') : '<p class="text-muted">Aucun arc</p>'}
                </div>
            </div>
        `;
    }

    function _renderCard(arc) {
        const categoryLabel = _getCategoryLabel(arc.category);
        const priorityClass = arc.priority || 'medium';

        return `
            <div class="arc-card" data-arc-id="${arc.id}" style="border-left: 4px solid ${arc.color}">
                <div class="arc-card-header">
                    <h4>${DOMUtils.escape(arc.title)}</h4>
                    <div class="arc-card-actions">
                        <button class="btn-icon" data-action="edit-arc" data-arc-id="${arc.id}">
                            <i data-lucide="edit"></i>
                        </button>
                        <button class="btn-icon" data-action="delete-arc" data-arc-id="${arc.id}">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </div>
                ${arc.description ? `<p class="arc-card-description">${DOMUtils.escape(TextUtils.truncate(arc.description, 100))}</p>` : ''}
                <div class="arc-card-footer">
                    <span class="badge">${categoryLabel}</span>
                    <span class="badge badge-${priorityClass}">${_getPriorityLabel(arc.priority)}</span>
                    <span class="arc-scenes-count">${arc.scenes?.length || 0} scènes</span>
                </div>
            </div>
        `;
    }

    function renderForm(arc = null) {
        return `
            <form class="arc-form">
                <div class="form-group">
                    <label class="form-label required">Titre</label>
                    <input type="text" class="form-input" name="title"
                           value="${arc ? DOMUtils.escape(arc.title) : ''}"
                           placeholder="Ex: La quête du héros" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Catégorie</label>
                        <select class="form-select" name="category">
                            <option value="plot" ${!arc || arc.category === 'plot' ? 'selected' : ''}>Intrigue</option>
                            <option value="character" ${arc && arc.category === 'character' ? 'selected' : ''}>Personnage</option>
                            <option value="theme" ${arc && arc.category === 'theme' ? 'selected' : ''}>Thème</option>
                            <option value="subplot" ${arc && arc.category === 'subplot' ? 'selected' : ''}>Intrigue secondaire</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Priorité</label>
                        <select class="form-select" name="priority">
                            <option value="low" ${arc && arc.priority === 'low' ? 'selected' : ''}>Basse</option>
                            <option value="medium" ${!arc || arc.priority === 'medium' ? 'selected' : ''}>Moyenne</option>
                            <option value="high" ${arc && arc.priority === 'high' ? 'selected' : ''}>Haute</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Couleur</label>
                        <input type="color" class="form-input" name="color"
                               value="${arc ? arc.color : '#3498db'}">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea class="form-textarea" name="description" rows="4"
                              placeholder="Description de l'arc...">${arc ? DOMUtils.escape(arc.description) : ''}</textarea>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-action="cancel">Annuler</button>
                    <button type="submit" class="btn btn-primary">${arc ? 'Enregistrer' : 'Créer'}</button>
                </div>
            </form>
        `;
    }

    function renderEmpty() {
        return `
            <div class="empty-state">
                <div class="empty-state-icon"><i data-lucide="git-branch"></i></div>
                <h3 class="empty-state-title">Aucun arc narratif</h3>
                <p class="empty-state-description">Créez des arcs pour organiser votre intrigue.</p>
                <button class="btn btn-primary" data-action="add-arc">
                    <i data-lucide="plus"></i>
                    Créer un arc
                </button>
            </div>
        `;
    }

    function _getCategoryLabel(category) {
        const labels = { plot: 'Intrigue', character: 'Personnage', theme: 'Thème', subplot: 'Sec.' };
        return labels[category] || category;
    }

    function _getPriorityLabel(priority) {
        const labels = { low: 'Basse', medium: 'Moyenne', high: 'Haute' };
        return labels[priority] || priority;
    }

    return { renderView, renderForm, renderEmpty };
})();

window.ArcBoardRender = ArcBoardRender;
