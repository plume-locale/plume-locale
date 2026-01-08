// ============================================
// STRUCTURE RENDER - Rendu HTML Structure
// ============================================

/**
 * StructureRender - Génération du HTML pour la vue Structure
 *
 * Responsabilités :
 * - Générer le HTML de l'arbre hiérarchique
 * - Générer le HTML des formulaires
 */

const StructureRender = (function() {
    'use strict';

    /**
     * Rendu de la vue complète
     * @param {Object} options
     * @returns {string}
     */
    function renderView(options = {}) {
        const { acts = [], expandedActs = new Set(), expandedChapters = new Set() } = options;

        return `
            <div class="structure-container">
                ${_renderToolbar()}
                ${acts.length > 0 ? _renderTree(acts, expandedActs, expandedChapters) : renderEmpty()}
            </div>
        `;
    }

    /**
     * Rendu de la toolbar
     * @returns {string}
     */
    function _renderToolbar() {
        return `
            <div class="toolbar">
                <div class="toolbar-left">
                    <button class="btn btn-primary" data-action="add-act">
                        <i data-lucide="plus"></i>
                        Nouvel acte
                    </button>
                    <button class="btn btn-secondary" data-action="expand-all">
                        <i data-lucide="chevrons-down"></i>
                        Tout déplier
                    </button>
                    <button class="btn btn-secondary" data-action="collapse-all">
                        <i data-lucide="chevrons-up"></i>
                        Tout replier
                    </button>
                </div>
                <div class="toolbar-right">
                    <div class="structure-stats">
                        <span class="stat-label">Structure narrative</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Rendu de l'arbre
     * @param {Array} acts
     * @param {Set} expandedActs
     * @param {Set} expandedChapters
     * @returns {string}
     */
    function _renderTree(acts, expandedActs, expandedChapters) {
        return `
            <div class="structure-tree">
                ${acts.map(act => _renderAct(act, expandedActs, expandedChapters)).join('')}
            </div>
        `;
    }

    /**
     * Rendu d'un acte
     * @param {Object} act
     * @param {Set} expandedActs
     * @param {Set} expandedChapters
     * @returns {string}
     */
    function _renderAct(act, expandedActs, expandedChapters) {
        const isExpanded = expandedActs.has(act.id);
        const chapters = act.chapters || [];
        const totalScenes = chapters.reduce((sum, ch) => sum + (ch.scenes?.length || 0), 0);

        return `
            <div class="tree-act" data-act-id="${act.id}">
                <div class="tree-act-header">
                    <button class="tree-toggle ${isExpanded ? 'expanded' : ''}"
                            data-action="toggle-act"
                            data-act-id="${act.id}">
                        <i data-lucide="chevron-right"></i>
                    </button>
                    <div class="tree-act-title" data-action="view-act" data-act-id="${act.id}">
                        <i data-lucide="book-open"></i>
                        <span>${DOMUtils.escape(act.title)}</span>
                        <span class="tree-count">${chapters.length} ch., ${totalScenes} sc.</span>
                    </div>
                    <div class="tree-actions">
                        <button class="btn-icon" data-action="add-chapter" data-act-id="${act.id}" title="Ajouter un chapitre">
                            <i data-lucide="plus"></i>
                        </button>
                        <button class="btn-icon" data-action="delete-act" data-act-id="${act.id}" title="Supprimer l'acte">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </div>
                ${isExpanded && chapters.length > 0 ? `
                    <div class="tree-act-children">
                        ${chapters.map(chapter => _renderChapter(act.id, chapter, expandedChapters)).join('')}
                    </div>
                ` : ''}
                ${isExpanded && chapters.length === 0 ? `
                    <div class="tree-empty">
                        <p>Aucun chapitre</p>
                        <button class="btn btn-sm btn-secondary" data-action="add-chapter" data-act-id="${act.id}">
                            Ajouter un chapitre
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Rendu d'un chapitre
     * @param {number} actId
     * @param {Object} chapter
     * @param {Set} expandedChapters
     * @returns {string}
     */
    function _renderChapter(actId, chapter, expandedChapters) {
        const isExpanded = expandedChapters.has(chapter.id);
        const scenes = chapter.scenes || [];

        return `
            <div class="tree-chapter" data-chapter-id="${chapter.id}">
                <div class="tree-chapter-header">
                    <button class="tree-toggle ${isExpanded ? 'expanded' : ''}"
                            data-action="toggle-chapter"
                            data-chapter-id="${chapter.id}">
                        <i data-lucide="chevron-right"></i>
                    </button>
                    <div class="tree-chapter-title">
                        <i data-lucide="folder"></i>
                        <span>${DOMUtils.escape(chapter.title)}</span>
                        <span class="tree-count">${scenes.length} scène${scenes.length > 1 ? 's' : ''}</span>
                    </div>
                    <div class="tree-actions">
                        <button class="btn-icon" data-action="add-scene" data-act-id="${actId}" data-chapter-id="${chapter.id}" title="Ajouter une scène">
                            <i data-lucide="plus"></i>
                        </button>
                        <button class="btn-icon" data-action="delete-chapter" data-act-id="${actId}" data-chapter-id="${chapter.id}" title="Supprimer le chapitre">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </div>
                ${isExpanded && scenes.length > 0 ? `
                    <div class="tree-chapter-children">
                        ${scenes.map(scene => _renderScene(actId, chapter.id, scene)).join('')}
                    </div>
                ` : ''}
                ${isExpanded && scenes.length === 0 ? `
                    <div class="tree-empty">
                        <p>Aucune scène</p>
                        <button class="btn btn-sm btn-secondary" data-action="add-scene" data-act-id="${actId}" data-chapter-id="${chapter.id}">
                            Ajouter une scène
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Rendu d'une scène
     * @param {number} actId
     * @param {number} chapterId
     * @param {Object} scene
     * @returns {string}
     */
    function _renderScene(actId, chapterId, scene) {
        const wordCount = scene.content ? TextUtils.countWords(scene.content) : 0;
        const statusClass = scene.status || 'draft';
        const statusLabel = _getStatusLabel(statusClass);

        return `
            <div class="tree-scene" data-scene-id="${scene.id}">
                <div class="tree-scene-header"
                     data-action="open-scene"
                     data-act-id="${actId}"
                     data-chapter-id="${chapterId}"
                     data-scene-id="${scene.id}">
                    <div class="tree-scene-title">
                        <i data-lucide="file-text"></i>
                        <span>${DOMUtils.escape(scene.title)}</span>
                    </div>
                    <div class="tree-scene-meta">
                        <span class="badge badge-sm badge-${statusClass}">${statusLabel}</span>
                        <span class="tree-scene-words">${TextUtils.formatWordCount(wordCount)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Rendu de l'état vide
     * @returns {string}
     */
    function renderEmpty() {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i data-lucide="book-open"></i>
                </div>
                <h3 class="empty-state-title">Aucune structure</h3>
                <p class="empty-state-description">
                    Commencez par créer un acte pour organiser votre histoire.
                </p>
                <button class="btn btn-primary" data-action="add-act">
                    <i data-lucide="plus"></i>
                    Créer un acte
                </button>
            </div>
        `;
    }

    /**
     * Rendu du formulaire d'acte
     * @param {Object|null} act
     * @returns {string}
     */
    function renderActForm(act = null) {
        return `
            <form class="act-form">
                <div class="form-group">
                    <label class="form-label required">Titre de l'acte</label>
                    <input type="text"
                           class="form-input"
                           name="title"
                           value="${act ? DOMUtils.escape(act.title) : ''}"
                           placeholder="Ex: Acte I"
                           required
                           autofocus>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-action="cancel">
                        Annuler
                    </button>
                    <button type="submit" class="btn btn-primary">
                        ${act ? 'Enregistrer' : 'Créer'}
                    </button>
                </div>
            </form>
        `;
    }

    /**
     * Rendu du formulaire de chapitre
     * @param {Object|null} chapter
     * @returns {string}
     */
    function renderChapterForm(chapter = null) {
        return `
            <form class="chapter-form">
                <div class="form-group">
                    <label class="form-label required">Titre du chapitre</label>
                    <input type="text"
                           class="form-input"
                           name="title"
                           value="${chapter ? DOMUtils.escape(chapter.title) : ''}"
                           placeholder="Ex: Chapitre 1"
                           required
                           autofocus>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-action="cancel">
                        Annuler
                    </button>
                    <button type="submit" class="btn btn-primary">
                        ${chapter ? 'Enregistrer' : 'Créer'}
                    </button>
                </div>
            </form>
        `;
    }

    /**
     * Rendu du formulaire de scène
     * @param {Object|null} scene
     * @returns {string}
     */
    function renderSceneForm(scene = null) {
        return `
            <form class="scene-form">
                <div class="form-group">
                    <label class="form-label required">Titre de la scène</label>
                    <input type="text"
                           class="form-input"
                           name="title"
                           value="${scene ? DOMUtils.escape(scene.title) : ''}"
                           placeholder="Ex: La rencontre"
                           required
                           autofocus>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-action="cancel">
                        Annuler
                    </button>
                    <button type="submit" class="btn btn-primary">
                        ${scene ? 'Enregistrer' : 'Créer'}
                    </button>
                </div>
            </form>
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
            final: 'Final',
            progress: 'En cours',
            complete: 'Terminé',
            review: 'À réviser'
        };
        return labels[status] || status;
    }

    // API publique
    return {
        renderView,
        renderEmpty,
        renderActForm,
        renderChapterForm,
        renderSceneForm
    };
})();

// Exposer globalement
window.StructureRender = StructureRender;
