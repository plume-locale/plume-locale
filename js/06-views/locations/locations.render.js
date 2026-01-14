/**
 * Locations Render
 * Responsible for generating HTML templates for the locations view
 * Pure functions - no DOM manipulation, returns HTML strings only
 */

const LocationsRender = (() => {
    // Type icons mapping
    const typeIcons = {
        'Lieu': 'map-pin',
        'Objet': 'package',
        'Concept': 'lightbulb',
        'Organisation': 'users',
        'Événement': 'calendar',
        'Autre': 'more-horizontal'
    };

    // Type order for consistent grouping
    const typeOrder = ['Lieu', 'Objet', 'Concept', 'Organisation', 'Événement', 'Autre'];

    /**
     * Render the main locations list grouped by type
     * @param {Array} locations - Array of location objects
     * @param {Object} collapsedGroups - Object tracking which groups are collapsed
     * @returns {string} HTML string
     */
    function renderLocationsList(locations, collapsedGroups = {}) {
        if (!locations || locations.length === 0) {
            return renderEmptyLocations();
        }

        // Group locations by type
        const groups = {};
        locations.forEach(location => {
            const type = location.type || 'Autre';
            if (!groups[type]) groups[type] = [];
            groups[type].push(location);
        });

        let html = '';
        typeOrder.forEach(type => {
            if (!groups[type]) return;

            const groupKey = 'world_' + type;
            const isCollapsed = collapsedGroups[groupKey] === true;
            const count = groups[type].length;

            // Sort locations alphabetically
            const sorted = [...groups[type]].sort((a, b) =>
                (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase(), 'fr')
            );

            html += `
                <div class="treeview-group">
                    <div class="treeview-header" data-group-key="${groupKey}" style="cursor: pointer;">
                        <i data-lucide="${isCollapsed ? 'chevron-right' : 'chevron-down'}" class="treeview-chevron" style="width:16px;height:16px;"></i>
                        <span class="treeview-label">${escapeHtml(type)}</span>
                        <span class="treeview-count">${count}</span>
                    </div>
                    <div class="treeview-children ${isCollapsed ? 'collapsed' : ''}">
                        ${sorted.map(location => renderLocationItem(location)).join('')}
                    </div>
                </div>
            `;
        });

        return html;
    }

    /**
     * Render a single location item in the list
     * @param {Object} location - Location object
     * @returns {string} HTML string
     */
    function renderLocationItem(location) {
        const icon = typeIcons[location.type] || 'circle';
        return `
            <div class="treeview-item" data-location-id="${location.id}">
                <span class="treeview-item-icon">
                    <i data-lucide="${icon}" style="width:14px;height:14px;vertical-align:middle;"></i>
                </span>
                <span class="treeview-item-label">${escapeHtml(location.name)}</span>
                <button class="treeview-item-delete" onclick="event.stopPropagation();" title="Supprimer">×</button>
            </div>
        `;
    }

    /**
     * Render empty state message
     * @returns {string} HTML string
     */
    function renderEmptyLocations() {
        return `
            <div style="padding: 2rem 1rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
                <i data-lucide="inbox" style="width:32px;height:32px;margin-bottom:0.5rem;opacity:0.5;"></i>
                <p>Aucun élément de monde créé</p>
                <p style="font-size: 0.75rem; margin-top: 0.5rem;">Cliquez sur "Ajouter" pour créer votre premier lieu</p>
            </div>
        `;
    }

    /**
     * Render location detail view
     * @param {Object} location - Location object
     * @returns {string} HTML string
     */
    function renderLocationDetail(location) {
        return `
            <div class="detail-view">
                <div class="detail-header">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div class="detail-title">${escapeHtml(location.name)}</div>
                        <span style="font-size: 0.9rem; padding: 0.5rem 1rem; background: var(--accent-gold); color: var(--bg-primary); border-radius: 2px;">
                            ${escapeHtml(location.type || 'Autre')}
                        </span>
                    </div>
                </div>

                ${renderLocationLinkedScenes(location)}

                <div class="detail-section">
                    <div class="detail-section-title">Informations de base</div>
                    <div class="detail-field">
                        <div class="detail-label">Nom</div>
                        <input type="text" class="form-input" id="location-name" value="${escapeHtml(location.name)}" 
                               placeholder="Nom du lieu/objet/concept">
                    </div>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Type</div>
                    <select class="form-input" id="location-type">
                        <option value="Lieu" ${location.type === 'Lieu' ? 'selected' : ''}>Lieu</option>
                        <option value="Objet" ${location.type === 'Objet' ? 'selected' : ''}>Objet</option>
                        <option value="Concept" ${location.type === 'Concept' ? 'selected' : ''}>Concept</option>
                        <option value="Organisation" ${location.type === 'Organisation' ? 'selected' : ''}>Organisation</option>
                        <option value="Événement" ${location.type === 'Événement' ? 'selected' : ''}>Événement</option>
                    </select>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Description</div>
                    <textarea class="form-input" id="location-description" rows="4" 
                              placeholder="Description générale">${escapeHtml(location.description || '')}</textarea>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Détails</div>
                    <textarea class="form-input" id="location-details" rows="4" 
                              placeholder="Détails spécifiques">${escapeHtml(location.details || '')}</textarea>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Histoire</div>
                    <textarea class="form-input" id="location-history" rows="4" 
                              placeholder="Historique et contexte">${escapeHtml(location.history || '')}</textarea>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Notes</div>
                    <textarea class="form-input" id="location-notes" rows="3" 
                              placeholder="Notes personnelles">${escapeHtml(location.notes || '')}</textarea>
                </div>
            </div>
        `;
    }

    /**
     * Render linked scenes for a location
     * @param {Object} location - Location object
     * @returns {string} HTML string
     */
    function renderLocationLinkedScenes(location) {
        if (!location.linkedScenes || location.linkedScenes.length === 0) {
            return '';
        }

        const state = StateManager.get('project');
        const scenesHtml = location.linkedScenes.map(sceneRef => {
            const act = state.acts.find(a => a.id === sceneRef.actId);
            if (!act) return '';

            const chapter = act.chapters.find(c => c.id === sceneRef.chapterId);
            if (!chapter) return '';

            const scene = chapter.scenes.find(s => s.id === sceneRef.sceneId);
            if (!scene) return '';

            const actNumber = toRoman(state.acts.indexOf(act) + 1);
            const chapterNumber = act.chapters.indexOf(chapter) + 1;
            const breadcrumb = `Acte ${actNumber} • Chapitre ${chapterNumber} • ${escapeHtml(scene.title)}`;

            return `
                <span class="link-badge" data-scene-link='${JSON.stringify(sceneRef)}'>
                    ${breadcrumb}
                </span>
            `;
        }).join('');

        return `
            <div class="detail-section">
                <div class="detail-section-title">
                    <i data-lucide="file-text" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;"></i>
                    Apparaît dans ${location.linkedScenes.length} scène(s)
                </div>
                <div class="quick-links">
                    ${scenesHtml}
                </div>
            </div>
        `;
    }

    /**
     * Render add location modal
     * @returns {string} HTML string
     */
    function renderAddLocationModal() {
        return `
            <form id="add-location-form">
                <div class="modal-field">
                    <label>Nom *</label>
                    <input type="text" id="location-name-input" class="form-input" placeholder="Nom du lieu, objet ou concept" required autofocus>
                </div>

                <div class="modal-field">
                    <label>Type *</label>
                    <select id="location-type-input" class="form-input" required>
                        <option value="">-- Sélectionner un type --</option>
                        <option value="Lieu">Lieu</option>
                        <option value="Objet">Objet</option>
                        <option value="Concept">Concept</option>
                        <option value="Organisation">Organisation</option>
                        <option value="Événement">Événement</option>
                    </select>
                </div>

                <div class="modal-field">
                    <label>Description</label>
                    <textarea id="location-desc-input" class="form-input" rows="4" placeholder="Description générale"></textarea>
                </div>

                <div class="modal-actions">
                    <button type="button" class="btn-secondary" onclick="ModalUI.close()">Annuler</button>
                    <button type="submit" class="btn">Créer</button>
                </div>
            </form>
        `;
    }

    /**
     * Render edit location modal
     * @param {Object} location - Location object
     * @returns {string} HTML string
     */
    function renderEditLocationModal(location) {
        return `
            <form id="edit-location-form">
                <input type="hidden" id="edit-location-id" value="${location.id}">

                <div class="modal-field">
                    <label>Nom *</label>
                    <input type="text" id="edit-location-name" class="form-input" value="${escapeHtml(location.name)}" required>
                </div>

                <div class="modal-field">
                    <label>Type *</label>
                    <select id="edit-location-type" class="form-input" required>
                        <option value="Lieu" ${location.type === 'Lieu' ? 'selected' : ''}>Lieu</option>
                        <option value="Objet" ${location.type === 'Objet' ? 'selected' : ''}>Objet</option>
                        <option value="Concept" ${location.type === 'Concept' ? 'selected' : ''}>Concept</option>
                        <option value="Organisation" ${location.type === 'Organisation' ? 'selected' : ''}>Organisation</option>
                        <option value="Événement" ${location.type === 'Événement' ? 'selected' : ''}>Événement</option>
                    </select>
                </div>

                <div class="modal-field">
                    <label>Description</label>
                    <textarea id="edit-location-desc" class="form-input" rows="4">${escapeHtml(location.description || '')}</textarea>
                </div>

                <div class="modal-actions">
                    <button type="button" class="btn-secondary" onclick="ModalUI.close()">Annuler</button>
                    <button type="submit" class="btn">Mettre à jour</button>
                </div>
            </form>
        `;
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

    /**
     * Convert number to Roman numerals
     * @param {number} num - Number to convert
     * @returns {string} Roman numeral
     */
    function toRoman(num) {
        const romanMap = [
            [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
            [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
            [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
        ];
        
        let roman = '';
        for (let [value, numeral] of romanMap) {
            while (num >= value) {
                roman += numeral;
                num -= value;
            }
        }
        return roman;
    }

    // Public API
    return {
        renderLocationsList,
        renderLocationItem,
        renderEmptyLocations,
        renderLocationDetail,
        renderLocationLinkedScenes,
        renderAddLocationModal,
        renderEditLocationModal,
        escapeHtml,
        toRoman
    };
})();
