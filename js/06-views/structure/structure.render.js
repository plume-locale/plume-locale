/**
 * Structure Render
 * Responsible for generating HTML for the acts/chapters/scenes structure view
 */

const StructureRender = (() => {
    /**
     * Render the entire acts structure
     * @param {Array} acts - Array of acts
     * @param {Set} expandedActs - Set of expanded act IDs
     * @returns {string} HTML string
     */
    function renderActsList(acts, expandedActs = new Set()) {
        if (!acts || acts.length === 0) {
            return renderEmptyStructure();
        }

        let html = '<div class="structure-tree">';

        acts.forEach((act, actIndex) => {
            const isExpanded = expandedActs.has(act.id);
            html += renderAct(act, isExpanded, actIndex);
        });

        html += '</div>';
        return html;
    }

    /**
     * Render a single act with its chapters
     * @param {Object} act - Act object
     * @param {boolean} isExpanded - Whether act is expanded
     * @param {number} actIndex - Act index for numbering
     * @returns {string} HTML string
     */
    function renderAct(act, isExpanded, actIndex) {
        const chapterCount = (act.chapters || []).length;
        const totalScenes = (act.chapters || []).reduce((sum, ch) => sum + (ch.scenes || []).length, 0);
        const totalWords = (act.chapters || []).reduce((sum, ch) => {
            return sum + (ch.scenes || []).reduce((sceneSum, sc) => sceneSum + (countWords(sc.content || '') || 0), 0);
        }, 0);

        return `
            <div class="act-item" id="act-${act.id}" data-act-id="${act.id}">
                <div class="act-header" data-act-id="${act.id}">
                    <span class="drag-handle" title="Drag to reorder">⋮⋮</span>
                    <span class="act-icon ${isExpanded ? 'expanded' : ''}" onclick="StructureHandlers.toggleAct(${act.id})">
                        ▶
                    </span>
                    <span class="act-title" ondblclick="StructureHandlers.startEditingAct(${act.id}, this)">
                        ${DOMUtils.escape(act.title)}
                    </span>
                    <span class="act-meta">
                        ${chapterCount} chapitre(s) • ${totalScenes} scène(s) • ${totalWords} mots
                    </span>
                    <div class="act-actions">
                        <button onclick="StructureHandlers.openAddChapterModal(${act.id})" title="Ajouter un chapitre">
                            <i data-lucide="plus"></i>
                        </button>
                        <button onclick="StructureHandlers.deleteAct(${act.id})" title="Supprimer cet acte">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </div>

                <div class="act-chapters ${isExpanded ? 'visible' : ''}">
                    ${(act.chapters || []).map((chapter, chIndex) => renderChapter(chapter, act.id, chIndex)).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Render a single chapter with its scenes
     * @param {Object} chapter - Chapter object
     * @param {number} actId - Parent act ID
     * @param {number} chapterIndex - Chapter index for numbering
     * @returns {string} HTML string
     */
    function renderChapter(chapter, actId, chapterIndex) {
        const sceneCount = (chapter.scenes || []).length;
        const totalWords = (chapter.scenes || []).reduce((sum, scene) => sum + (countWords(scene.content || '') || 0), 0);

        return `
            <div class="chapter-item" data-chapter-id="${chapter.id}" data-act-id="${actId}">
                <div class="chapter-header" data-chapter-id="${chapter.id}" data-act-id="${actId}">
                    <span class="drag-handle" title="Drag to reorder">⋮⋮</span>
                    <span class="chapter-number">Chapitre ${chapterIndex + 1}</span>
                    <span class="chapter-title" ondblclick="StructureHandlers.startEditingChapter(${actId}, ${chapter.id}, this)">
                        ${DOMUtils.escape(chapter.title || '')}
                    </span>
                    <span class="chapter-meta">
                        ${sceneCount} scène(s) • ${totalWords} mots
                    </span>
                    <div class="chapter-actions">
                        <button onclick="StructureHandlers.openAddSceneModal(${actId}, ${chapter.id})" title="Ajouter une scène">
                            <i data-lucide="plus"></i>
                        </button>
                        <button onclick="StructureHandlers.deleteChapter(${actId}, ${chapter.id})" title="Supprimer ce chapitre">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </div>

                <div class="chapter-scenes">
                    ${(chapter.scenes || []).map((scene, sceneIndex) => renderSceneItem(scene, actId, chapter.id, sceneIndex)).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Render a single scene item
     * @param {Object} scene - Scene object
     * @param {number} actId - Parent act ID
     * @param {number} chapterId - Parent chapter ID
     * @param {number} sceneIndex - Scene index
     * @returns {string} HTML string
     */
    function renderSceneItem(scene, actId, chapterId, sceneIndex) {
        const wordCount = countWords(scene.content || '') || 0;
        const statusIcon = getStatusIcon(scene.status);

        return `
            <div class="scene-item" 
                data-scene-id="${scene.id}" 
                data-chapter-id="${chapterId}" 
                data-act-id="${actId}"
                onclick="StructureHandlers.openScene(${actId}, ${chapterId}, ${scene.id})">
                <span class="drag-handle" title="Drag to reorder">⋮⋮</span>
                <span class="scene-number">${sceneIndex + 1}</span>
                <span class="scene-title">
                    ${DOMUtils.escape(scene.title || 'Sans titre')}
                </span>
                <span class="scene-meta">
                    ${statusIcon}
                    <span class="word-count" title="Nombre de mots">${wordCount}</span>
                </span>
            </div>
        `;
    }

    /**
     * Render empty structure state
     * @returns {string} HTML string
     */
    function renderEmptyStructure() {
        return `
            <div class="structure-empty-state" style="
                padding: 2rem;
                text-align: center;
                color: var(--text-muted);
            ">
                <div style="font-size: 3em; margin-bottom: 1rem;">📚</div>
                <h3>Aucun acte</h3>
                <p>Commencez par créer votre première acte</p>
                <button onclick="StructureHandlers.openAddActModal()" style="
                    margin-top: 1rem;
                    padding: 0.5rem 1.5rem;
                    background: var(--primary);
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                ">
                    Créer un acte
                </button>
            </div>
        `;
    }

    /**
     * Render add act modal
     * @returns {string} HTML string
     */
    function renderAddActModal() {
        return `
            <div class="modal-content add-act-modal">
                <h2>Nouveau acte</h2>
                <form id="add-act-form" style="display: grid; gap: 1rem;">
                    <div class="form-group">
                        <label for="act-title">Titre de l'acte *</label>
                        <input type="text" id="act-title" required placeholder="Ex: Acte I - L'Exposition">
                    </div>
                    <div class="form-actions" style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;">
                        <button type="button" onclick="ModalUI.close()">Annuler</button>
                        <button type="submit">Créer</button>
                    </div>
                </form>
            </div>
        `;
    }

    /**
     * Render add chapter modal
     * @param {number} actId - Parent act ID
     * @returns {string} HTML string
     */
    function renderAddChapterModal(actId) {
        return `
            <div class="modal-content add-chapter-modal">
                <h2>Nouveau chapitre</h2>
                <form id="add-chapter-form" style="display: grid; gap: 1rem;">
                    <input type="hidden" id="chapter-act-id" value="${actId}">
                    <div class="form-group">
                        <label for="chapter-title">Titre du chapitre</label>
                        <input type="text" id="chapter-title" placeholder="Ex: La Fuite">
                    </div>
                    <div class="form-actions" style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;">
                        <button type="button" onclick="ModalUI.close()">Annuler</button>
                        <button type="submit">Créer</button>
                    </div>
                </form>
            </div>
        `;
    }

    /**
     * Render add scene modal
     * @param {number} actId - Parent act ID
     * @param {number} chapterId - Parent chapter ID
     * @returns {string} HTML string
     */
    function renderAddSceneModal(actId, chapterId) {
        return `
            <div class="modal-content add-scene-modal">
                <h2>Nouvelle scène</h2>
                <form id="add-scene-form" style="display: grid; gap: 1rem;">
                    <input type="hidden" id="scene-act-id" value="${actId}">
                    <input type="hidden" id="scene-chapter-id" value="${chapterId}">
                    <div class="form-group">
                        <label for="scene-title">Titre de la scène *</label>
                        <input type="text" id="scene-title" required placeholder="Ex: La Rencontre">
                    </div>
                    <div class="form-group">
                        <label for="scene-status">Statut</label>
                        <select id="scene-status">
                            <option value="draft">Brouillon</option>
                            <option value="writing">En cours</option>
                            <option value="edited">Édité</option>
                            <option value="finalized">Finalisé</option>
                        </select>
                    </div>
                    <div class="form-actions" style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;">
                        <button type="button" onclick="ModalUI.close()">Annuler</button>
                        <button type="submit">Créer</button>
                    </div>
                </form>
            </div>
        `;
    }

    /**
     * Render scene editor (full view)
     * @param {Object} scene - Scene object
     * @param {number} actId - Act ID
     * @param {number} chapterId - Chapter ID
     * @returns {string} HTML string
     */
    function renderSceneEditor(scene, actId, chapterId) {
        return `
            <div class="scene-editor" data-scene-id="${scene.id}">
                <div class="editor-header">
                    <input type="text" 
                        id="scene-title" 
                        class="scene-title-input"
                        value="${DOMUtils.escape(scene.title || '')}"
                        placeholder="Titre de la scène"
                        onchange="StructureHandlers.updateSceneTitle(${actId}, ${chapterId}, ${scene.id}, this.value)">
                    
                    <div class="editor-meta">
                        <select id="scene-status" onchange="StructureHandlers.updateSceneStatus(${actId}, ${chapterId}, ${scene.id}, this.value)">
                            <option value="draft" ${scene.status === 'draft' ? 'selected' : ''}>Brouillon</option>
                            <option value="writing" ${scene.status === 'writing' ? 'selected' : ''}>En cours</option>
                            <option value="edited" ${scene.status === 'edited' ? 'selected' : ''}>Édité</option>
                            <option value="finalized" ${scene.status === 'finalized' ? 'selected' : ''}>Finalisé</option>
                        </select>
                        <span class="word-count" id="word-count">0 mots</span>
                    </div>
                </div>

                <textarea 
                    id="scene-content" 
                    class="scene-content-editor"
                    placeholder="Écrivez votre scène ici..."
                    onchange="StructureHandlers.updateSceneContent(${actId}, ${chapterId}, ${scene.id}, this.value)"
                    oninput="StructureHandlers.updateWordCount()">${DOMUtils.escape(scene.content || '')}</textarea>

                <div class="editor-footer">
                    <button onclick="StructureHandlers.deleteScene(${actId}, ${chapterId}, ${scene.id})" class="delete-btn">
                        <i data-lucide="trash-2"></i> Supprimer
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Helper: Get status icon
     * @param {string} status - Scene status
     * @returns {string} HTML for status icon
     */
    function getStatusIcon(status) {
        const icons = {
            'draft': '✍️',
            'writing': '📝',
            'edited': '✓',
            'finalized': '✓✓'
        };
        return `<span class="status-icon" title="${status}">${icons[status] || '✍️'}</span>`;
    }

    /**
     * Helper: Count words
     * @param {string} text - Text to count
     * @returns {number} Word count
     */
    function countWords(text) {
        if (!text) return 0;
        return text.trim().split(/\s+/).filter(w => w.length > 0).length;
    }

    // Public API
    return {
        renderActsList,
        renderAct,
        renderChapter,
        renderSceneItem,
        renderEmptyStructure,
        renderAddActModal,
        renderAddChapterModal,
        renderAddSceneModal,
        renderSceneEditor,
        getStatusIcon,
        countWords
    };
})();

/**
 * DOM Utilities
 */
const DOMUtils = (() => {
    function escape(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return { escape };
})();
