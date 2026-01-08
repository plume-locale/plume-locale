// ============================================
// STORY GRID RENDER - Rendu HTML Story Grid
// ============================================

const StoryGridRender = (function() {
    'use strict';

    function renderView(options = {}) {
        const { scenes = [], sortBy = 'order', sortDirection = 'asc', filterStatus = 'all' } = options;

        return `
            <div class="story-grid-container">
                ${_renderToolbar(filterStatus)}
                ${scenes.length > 0 ? _renderTable(scenes, sortBy, sortDirection) : renderEmpty()}
            </div>
        `;
    }

    function _renderToolbar(filterStatus) {
        return `
            <div class="toolbar">
                <div class="toolbar-left">
                    <h2>Grille d'histoire</h2>
                </div>
                <div class="toolbar-right">
                    <select class="form-select" data-action="filter">
                        <option value="all" ${filterStatus === 'all' ? 'selected' : ''}>Tous les statuts</option>
                        <option value="draft" ${filterStatus === 'draft' ? 'selected' : ''}>Brouillons</option>
                        <option value="revision" ${filterStatus === 'revision' ? 'selected' : ''}>Révisions</option>
                        <option value="final" ${filterStatus === 'final' ? 'selected' : ''}>Finales</option>
                    </select>
                </div>
            </div>
        `;
    }

    function _renderTable(scenes, sortBy, sortDirection) {
        const totalWords = scenes.reduce((sum, s) => sum + TextUtils.countWords(s.scene.content || ''), 0);

        return `
            <div class="story-grid-table-container">
                <table class="story-grid-table">
                    <thead>
                        <tr>
                            ${_renderHeader('order', '#', sortBy, sortDirection)}
                            ${_renderHeader('title', 'Titre', sortBy, sortDirection)}
                            <th>Acte / Chapitre</th>
                            ${_renderHeader('status', 'Statut', sortBy, sortDirection)}
                            ${_renderHeader('wordcount', 'Mots', sortBy, sortDirection)}
                            ${_renderHeader('tension', 'Tension', sortBy, sortDirection)}
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${scenes.map((s, idx) => _renderRow(s, idx)).join('')}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="4"><strong>Total</strong></td>
                            <td><strong>${TextUtils.formatWordCount(totalWords)}</strong></td>
                            <td colspan="2"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;
    }

    function _renderHeader(key, label, sortBy, sortDirection) {
        const isSorted = sortBy === key;
        const icon = isSorted ? (sortDirection === 'asc' ? '↑' : '↓') : '';

        return `
            <th class="sortable ${isSorted ? 'sorted' : ''}"
                data-action="sort"
                data-sort-by="${key}">
                ${label} ${icon}
            </th>
        `;
    }

    function _renderRow(sceneData, idx) {
        const { order, actTitle, chapterTitle, actId, chapterId, scene } = sceneData;
        const wordCount = TextUtils.countWords(scene.content || '');
        const statusLabel = _getStatusLabel(scene.status);
        const statusClass = scene.status || 'draft';

        return `
            <tr class="story-grid-row" data-scene-id="${scene.id}">
                <td class="text-center">${order}</td>
                <td>
                    <button class="btn-link"
                            data-action="open-scene"
                            data-act-id="${actId}"
                            data-chapter-id="${chapterId}"
                            data-scene-id="${scene.id}">
                        ${DOMUtils.escape(scene.title)}
                    </button>
                </td>
                <td class="text-muted">${DOMUtils.escape(actTitle)} / ${DOMUtils.escape(chapterTitle)}</td>
                <td>
                    <span class="badge badge-${statusClass}">${statusLabel}</span>
                </td>
                <td class="text-right">${wordCount.toLocaleString()}</td>
                <td class="text-center">${scene.tension || 5}/10</td>
                <td>
                    <button class="btn-icon"
                            data-action="open-scene"
                            data-act-id="${actId}"
                            data-chapter-id="${chapterId}"
                            data-scene-id="${scene.id}"
                            title="Ouvrir">
                        <i data-lucide="eye"></i>
                    </button>
                </td>
            </tr>
        `;
    }

    function renderEmpty() {
        return `
            <div class="empty-state">
                <div class="empty-state-icon"><i data-lucide="table"></i></div>
                <h3 class="empty-state-title">Aucune scène</h3>
                <p class="empty-state-description">
                    Créez des scènes pour voir la grille d'histoire.
                </p>
            </div>
        `;
    }

    function _getStatusLabel(status) {
        const labels = {
            draft: 'Brouillon',
            revision: 'Révision',
            final: 'Final',
            progress: 'En cours',
            complete: 'Terminé'
        };
        return labels[status] || status;
    }

    return { renderView, renderEmpty };
})();

window.StoryGridRender = StoryGridRender;
