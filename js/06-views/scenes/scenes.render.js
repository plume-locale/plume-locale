// ============================================
// SCENES RENDER - Rendu HTML Scènes
// ============================================

/**
 * ScenesRender - Génération du HTML pour la vue Scènes
 *
 * Responsabilités :
 * - Générer le HTML de la vue complète
 * - Générer le HTML des cartes
 * - Générer le HTML des formulaires
 * - Générer le HTML des détails
 */

const ScenesRender = (function() {
    'use strict';

    /**
     * Rendu de la vue complète
     * @param {Object} options - Options de rendu
     * @returns {string}
     */
    function renderView(options = {}) {
        const { scenes = [], filter = 'all', sort = 'created', searchQuery = '' } = options;

        return `
            <div class="scenes-container">
                ${_renderToolbar(filter, sort, searchQuery)}
                ${scenes.length > 0 ? _renderGrid(scenes) : _renderEmpty()}
            </div>
        `;
    }

    /**
     * Rendu de la toolbar
     * @param {string} currentFilter
     * @param {string} currentSort
     * @param {string} searchQuery
     * @returns {string}
     */
    function _renderToolbar(currentFilter, currentSort, searchQuery) {
        return `
            <div class="toolbar">
                <div class="toolbar-left">
                    <button class="btn btn-primary" data-action="add-scene">
                        <i data-lucide="plus"></i>
                        Nouvelle scène
                    </button>

                    <div class="toolbar-filters">
                        <button class="btn btn-sm ${currentFilter === 'all' ? 'btn-primary' : 'btn-secondary'}"
                                data-action="filter" data-filter="all">
                            Toutes
                        </button>
                        <button class="btn btn-sm ${currentFilter === 'draft' ? 'btn-primary' : 'btn-secondary'}"
                                data-action="filter" data-filter="draft">
                            Brouillons
                        </button>
                        <button class="btn btn-sm ${currentFilter === 'revision' ? 'btn-primary' : 'btn-secondary'}"
                                data-action="filter" data-filter="revision">
                            Révisions
                        </button>
                        <button class="btn btn-sm ${currentFilter === 'final' ? 'btn-primary' : 'btn-secondary'}"
                                data-action="filter" data-filter="final">
                            Finales
                        </button>
                    </div>
                </div>

                <div class="toolbar-right">
                    <input type="text"
                           class="search-input"
                           placeholder="Rechercher une scène..."
                           value="${DOMUtils.escape(searchQuery)}"
                           data-action="search">

                    <select class="form-select" data-action="sort">
                        <option value="created" ${currentSort === 'created' ? 'selected' : ''}>Plus récentes</option>
                        <option value="updated" ${currentSort === 'updated' ? 'selected' : ''}>Modifiées récemment</option>
                        <option value="title" ${currentSort === 'title' ? 'selected' : ''}>Titre (A-Z)</option>
                        <option value="tension" ${currentSort === 'tension' ? 'selected' : ''}>Tension dramatique</option>
                    </select>
                </div>
            </div>
        `;
    }

    /**
     * Rendu de la grille de scènes
     * @param {Array} scenes
     * @returns {string}
     */
    function _renderGrid(scenes) {
        return `
            <div class="cards-grid">
                ${scenes.map(scene => renderCard(scene)).join('')}
            </div>
        `;
    }

    /**
     * Rendu d'une carte de scène
     * @param {Object} scene
     * @returns {string}
     */
    function renderCard(scene) {
        const wordCount = TextUtils.countWords(scene.content);
        const readingTime = TextUtils.readingTime(scene.content);
        const statusLabel = _getStatusLabel(scene.status);
        const statusColor = _getStatusColor(scene.status);

        return `
            <div class="card scene-card"
                 data-scene-id="${scene.id}"
                 style="border-left: 4px solid ${scene.color}">

                <div class="card-header">
                    <div>
                        <h3 class="card-title">
                            ${scene.icon ? `<i data-lucide="${scene.icon}"></i>` : ''}
                            ${DOMUtils.escape(scene.title)}
                        </h3>
                        <span class="badge badge-${statusColor}">${statusLabel}</span>
                    </div>

                    <div class="card-actions">
                        <button class="card-action-btn"
                                data-action="view-scene"
                                data-scene-id="${scene.id}"
                                title="Voir les détails">
                            <i data-lucide="eye"></i>
                        </button>
                        <button class="card-action-btn"
                                data-action="edit-scene"
                                data-scene-id="${scene.id}"
                                title="Modifier">
                            <i data-lucide="edit"></i>
                        </button>
                        <button class="card-action-btn"
                                data-action="duplicate-scene"
                                data-scene-id="${scene.id}"
                                title="Dupliquer">
                            <i data-lucide="copy"></i>
                        </button>
                        <button class="card-action-btn"
                                data-action="delete-scene"
                                data-scene-id="${scene.id}"
                                title="Supprimer">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </div>

                <div class="card-body">
                    ${scene.summary ? `
                        <p class="card-description">
                            ${DOMUtils.escape(TextUtils.truncate(scene.summary, 120))}
                        </p>
                    ` : `
                        <p class="card-description text-muted">
                            ${scene.content ? DOMUtils.escape(TextUtils.truncate(scene.content, 120)) : 'Aucun contenu'}
                        </p>
                    `}

                    ${scene.tags.length > 0 ? `
                        <div class="tags">
                            ${scene.tags.slice(0, 3).map(tag => `
                                <span class="tag">${DOMUtils.escape(tag)}</span>
                            `).join('')}
                            ${scene.tags.length > 3 ? `<span class="tag">+${scene.tags.length - 3}</span>` : ''}
                        </div>
                    ` : ''}
                </div>

                <div class="card-footer">
                    <div class="card-meta">
                        <span class="card-meta-item">
                            <i data-lucide="file-text"></i>
                            ${TextUtils.formatWordCount(wordCount)}
                        </span>
                        <span class="card-meta-item">
                            <i data-lucide="clock"></i>
                            ${readingTime.text}
                        </span>
                        <span class="card-meta-item" title="Tension dramatique">
                            <i data-lucide="activity"></i>
                            ${scene.tension}/10
                        </span>
                        ${scene.characters.length > 0 ? `
                            <span class="card-meta-item">
                                <i data-lucide="users"></i>
                                ${scene.characters.length}
                            </span>
                        ` : ''}
                        ${scene.locations.length > 0 ? `
                            <span class="card-meta-item">
                                <i data-lucide="map-pin"></i>
                                ${scene.locations.length}
                            </span>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Rendu de l'état vide
     * @returns {string}
     */
    function _renderEmpty() {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i data-lucide="file-text"></i>
                </div>
                <h3 class="empty-state-title">Aucune scène</h3>
                <p class="empty-state-description">
                    Commencez par créer votre première scène pour structurer votre histoire.
                </p>
                <button class="btn btn-primary" data-action="add-scene">
                    <i data-lucide="plus"></i>
                    Créer une scène
                </button>
            </div>
        `;
    }

    /**
     * Rendu du formulaire
     * @param {Object|null} scene - Scène à éditer (null pour création)
     * @returns {string}
     */
    function renderForm(scene = null) {
        const isEdit = scene !== null;

        return `
            <form class="scene-form" data-scene-id="${scene ? scene.id : ''}">
                <div class="form-group">
                    <label class="form-label required">Titre</label>
                    <input type="text"
                           class="form-input"
                           name="title"
                           value="${scene ? DOMUtils.escape(scene.title) : ''}"
                           placeholder="Ex: Le réveil"
                           required>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Statut</label>
                        <select class="form-select" name="status">
                            <option value="draft" ${!scene || scene.status === 'draft' ? 'selected' : ''}>Brouillon</option>
                            <option value="revision" ${scene && scene.status === 'revision' ? 'selected' : ''}>Révision</option>
                            <option value="final" ${scene && scene.status === 'final' ? 'selected' : ''}>Final</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Couleur</label>
                        <input type="color"
                               class="form-input"
                               name="color"
                               value="${scene ? scene.color : '#95a5a6'}">
                    </div>

                    <div class="form-group">
                        <label class="form-label">Tension (1-10)</label>
                        <input type="number"
                               class="form-input"
                               name="tension"
                               min="1"
                               max="10"
                               value="${scene ? scene.tension : 5}">
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Résumé</label>
                    <textarea class="form-textarea"
                              name="summary"
                              rows="3"
                              placeholder="Résumé court de la scène...">${scene ? DOMUtils.escape(scene.summary) : ''}</textarea>
                    <span class="form-help">Décrivez brièvement ce qui se passe dans cette scène</span>
                </div>

                <div class="form-group">
                    <label class="form-label">Contenu</label>
                    <textarea class="form-textarea"
                              name="content"
                              rows="10"
                              placeholder="Écrivez votre scène ici...">${scene ? DOMUtils.escape(scene.content) : ''}</textarea>
                </div>

                <div class="form-group">
                    <label class="form-label">Tags</label>
                    <input type="text"
                           class="form-input"
                           name="tags"
                           value="${scene ? scene.tags.join(', ') : ''}"
                           placeholder="action, mystère, révélation...">
                    <span class="form-help">Séparés par des virgules</span>
                </div>

                <div class="form-group">
                    <label class="form-label">Notes</label>
                    <textarea class="form-textarea"
                              name="notes"
                              rows="3"
                              placeholder="Notes personnelles sur cette scène...">${scene ? DOMUtils.escape(scene.notes) : ''}</textarea>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-action="cancel">
                        Annuler
                    </button>
                    <button type="submit" class="btn btn-primary">
                        ${isEdit ? 'Enregistrer' : 'Créer'}
                    </button>
                </div>
            </form>
        `;
    }

    /**
     * Rendu des détails d'une scène
     * @param {Object} scene
     * @returns {string}
     */
    function renderDetail(scene) {
        const stats = new Scene(scene).getStats();
        const statusLabel = _getStatusLabel(scene.status);

        return `
            <div class="scene-detail">
                <div class="scene-detail-header">
                    <div class="scene-color-bar" style="background: ${scene.color}"></div>
                    <span class="badge">${statusLabel}</span>
                </div>

                ${scene.summary ? `
                    <div class="scene-detail-section">
                        <h4>Résumé</h4>
                        <p>${DOMUtils.escape(scene.summary)}</p>
                    </div>
                ` : ''}

                ${scene.content ? `
                    <div class="scene-detail-section">
                        <h4>Contenu</h4>
                        <div class="scene-content">
                            ${DOMUtils.escape(scene.content).replace(/\n/g, '<br>')}
                        </div>
                    </div>
                ` : ''}

                <div class="scene-detail-section">
                    <h4>Statistiques</h4>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <span class="stat-label">Mots</span>
                            <span class="stat-value">${stats.words.toLocaleString()}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Caractères</span>
                            <span class="stat-value">${stats.characters.toLocaleString()}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Lecture</span>
                            <span class="stat-value">${stats.readingTime.text}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Tension</span>
                            <span class="stat-value">${scene.tension}/10</span>
                        </div>
                    </div>
                </div>

                ${scene.tags.length > 0 ? `
                    <div class="scene-detail-section">
                        <h4>Tags</h4>
                        <div class="tags">
                            ${scene.tags.map(tag => `<span class="tag">${DOMUtils.escape(tag)}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}

                ${scene.notes ? `
                    <div class="scene-detail-section">
                        <h4>Notes</h4>
                        <p>${DOMUtils.escape(scene.notes)}</p>
                    </div>
                ` : ''}

                <div class="scene-detail-section">
                    <h4>Métadonnées</h4>
                    <div class="metadata-list">
                        <div class="metadata-item">
                            <span class="metadata-label">Créée le</span>
                            <span class="metadata-value">${DateUtils.formatDate(scene.createdAt)}</span>
                        </div>
                        <div class="metadata-item">
                            <span class="metadata-label">Modifiée le</span>
                            <span class="metadata-value">${DateUtils.formatDate(scene.updatedAt)}</span>
                        </div>
                        ${scene.versions.length > 0 ? `
                            <div class="metadata-item">
                                <span class="metadata-label">Versions</span>
                                <span class="metadata-value">${scene.versions.length}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Obtient le label du statut
     * @param {string} status
     * @returns {string}
     */
    function _getStatusLabel(status) {
        const labels = {
            draft: 'Brouillon',
            revision: 'Révision',
            final: 'Final'
        };
        return labels[status] || status;
    }

    /**
     * Obtient la couleur du statut
     * @param {string} status
     * @returns {string}
     */
    function _getStatusColor(status) {
        const colors = {
            draft: 'secondary',
            revision: 'warning',
            final: 'success'
        };
        return colors[status] || 'secondary';
    }

    // API publique
    return {
        renderView,
        renderCard,
        renderForm,
        renderDetail
    };
})();

// Exposer globalement
window.ScenesRender = ScenesRender;
