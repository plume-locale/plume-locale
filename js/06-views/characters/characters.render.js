/**
 * Characters Render
 * Responsible for generating HTML for the characters view
 */

const CharactersRender = (() => {
    /**
     * Render the characters list grouped by type
     * @param {Character[]} characters - Array of characters
     * @param {string[]} races - Array of available races
     * @returns {string} HTML string
     */
    function renderList(characters, races = []) {
        if (!characters || characters.length === 0) {
            return renderEmptyState();
        }

        // Group characters by race
        const groups = {};
        races.forEach(race => {
            groups[race] = [];
        });
        groups['Non classé'] = [];

        characters.forEach(char => {
            const raceKey = (char.race && races.includes(char.race)) ? char.race : 'Non classé';
            if (!groups[raceKey]) groups[raceKey] = [];
            groups[raceKey].push(char);
        });

        let html = '<div class="characters-list" style="margin-left: 0; border-left: none; padding-left: 0;">';

        // Render each group
        Object.keys(groups).forEach(raceName => {
            const charsInGroup = groups[raceName];

            if (charsInGroup.length > 0) {
                // Sort alphabetically
                charsInGroup.sort((a, b) => {
                    const nameA = (a.name || a.firstName || '').toLowerCase();
                    const nameB = (b.name || b.firstName || '').toLowerCase();
                    return nameA.localeCompare(nameB, 'fr');
                });

                // Group header
                html += `
                    <div class="characters-group-header" style="
                        padding: 6px 12px;
                        background: var(--bg-secondary, rgba(255,255,255,0.05));
                        color: var(--text-muted);
                        font-size: 0.75rem;
                        font-weight: bold;
                        text-transform: uppercase;
                        border-top: 1px solid var(--border-color);
                        border-bottom: 1px solid var(--border-color);
                        margin-top: 8px;
                        margin-bottom: 4px;
                        display: flex;
                        justify-content: space-between;
                    ">
                        <span>${raceName}</span>
                        <span style="opacity: 0.6;">${charsInGroup.length}</span>
                    </div>
                `;

                // Characters in group
                charsInGroup.forEach(char => {
                    html += renderListItem(char);
                });
            }
        });

        html += '</div>';
        return html;
    }

    /**
     * Render a single character list item
     * @param {Character} character - Character object
     * @returns {string} HTML string
     */
    function renderListItem(character) {
        const displayName = character.name || character.firstName || 'Sans nom';
        
        return `
            <div class="character-list-item" data-character-id="${character.id}" style="
                padding: 8px 12px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                cursor: pointer;
                border-left: 4px solid ${character.color || '#3498db'};
                transition: background 0.2s;
            " onclick="CharactersView.openDetail(${character.id})">
                <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
                    <span style="font-size: 1.2em;">${character.avatarEmoji || '🙂'}</span>
                    <div>
                        <div style="font-weight: 500;">${displayName}</div>
                        ${character.role ? `<div style="font-size: 0.85rem; color: var(--text-muted);">${character.role}</div>` : ''}
                    </div>
                </div>
                <button class="character-delete-btn" 
                    onclick="event.stopPropagation(); CharactersHandlers.handleDelete(${character.id})" 
                    title="Supprimer"
                    style="background: none; border: none; cursor: pointer; color: var(--text-muted); font-size: 1.3em;">
                    ×
                </button>
            </div>
        `;
    }

    /**
     * Render empty state
     * @returns {string} HTML string
     */
    function renderEmptyState() {
        return `
            <div class="characters-empty-state" style="
                padding: 2rem;
                text-align: center;
                color: var(--text-muted);
            ">
                <div style="font-size: 3em; margin-bottom: 1rem;">👥</div>
                <p>Aucun personnage</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">Cliquez ci-dessous pour en créer un</p>
            </div>
        `;
    }

    /**
     * Render character detail modal
     * @param {Character} character - Character object
     * @returns {string} HTML string
     */
    function renderDetailSheet(character) {
        const metaInfo = [];
        if (character.age) metaInfo.push(`${character.age}${character.birthPlace ? ', né à ' + character.birthPlace : ''}`);
        if (character.residence) metaInfo.push(character.residence);

        return `
            <div class="character-detail-sheet" data-character-id="${character.id}">
                <!-- Header -->
                <div class="character-detail-header" style="
                    padding: 2rem;
                    background: linear-gradient(135deg, ${character.color}20 0%, transparent 100%);
                    border-bottom: 1px solid var(--border-color);
                ">
                    <div style="display: flex; gap: 1.5rem;">
                        <div class="character-avatar" onclick="CharactersHandlers.changeAvatar(${character.id})" title="Changer l'avatar" style="
                            font-size: 4em;
                            cursor: pointer;
                            width: 80px;
                            height: 80px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            border-radius: 8px;
                            background: ${character.color}20;
                        ">
                            ${character.avatarEmoji || '🙂'}
                        </div>
                        <div style="flex: 1;">
                            <h2 style="margin: 0 0 0.5rem 0;">${DOMUtils.escape(character.name)}</h2>
                            ${character.role ? `<p style="margin: 0.25rem 0; color: var(--text-muted);">${DOMUtils.escape(character.role)}</p>` : ''}
                            ${metaInfo.length > 0 ? `<p style="margin: 0.5rem 0 0 0; font-size: 0.9rem; color: var(--text-muted);">${metaInfo.join(' • ')}</p>` : ''}
                        </div>
                    </div>
                </div>

                <!-- Basic Info Section -->
                <div class="character-detail-section" style="padding: 1.5rem; border-bottom: 1px solid var(--border-color);">
                    <h3 style="margin: 0 0 1rem 0;">Informations civiles</h3>
                    <div class="character-info-grid" style="
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 1rem;
                    ">
                        ${renderInfoField('Prénom', character.firstName)}
                        ${renderInfoField('Nom', character.lastName)}
                        ${renderInfoField('Surnom', character.nickname)}
                        ${renderInfoField('Pronoms', character.pronouns)}
                        ${renderInfoField('Sexe', character.sex)}
                        ${renderInfoField('Race', character.race)}
                        ${renderInfoField('Âge', character.age)}
                        ${renderInfoField('Lieu de naissance', character.birthPlace)}
                        ${renderInfoField('Résidence', character.residence)}
                        ${renderInfoField('Occupation', character.occupation)}
                    </div>
                </div>

                <!-- Physical Description Section -->
                <div class="character-detail-section" style="padding: 1.5rem; border-bottom: 1px solid var(--border-color);">
                    <h3 style="margin: 0 0 1rem 0;">Apparence physique</h3>
                    <div class="character-info-grid" style="
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 1rem;
                    ">
                        ${renderInfoField('Taille', character.height)}
                        ${renderInfoField('Poids', character.weight)}
                        ${renderInfoField('Morphologie', character.bodyType)}
                        ${renderInfoField('Couleur cheveux', character.hairColor)}
                        ${renderInfoField('Couleur yeux', character.eyeColor)}
                        ${renderInfoField('Voix', character.voice)}
                    </div>
                    ${character.physicalDescription ? `
                        <div style="margin-top: 1rem;">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Description complète</label>
                            <p style="margin: 0; white-space: pre-wrap; color: var(--text-secondary);">${DOMUtils.escape(character.physicalDescription)}</p>
                        </div>
                    ` : ''}
                </div>

                <!-- Personality Section -->
                <div class="character-detail-section" style="padding: 1.5rem; border-bottom: 1px solid var(--border-color);">
                    <h3 style="margin: 0 0 1rem 0;">Personnalité</h3>
                    <div style="
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 1rem;
                        margin-bottom: 1rem;
                    ">
                        ${renderInfoField('Qualités', character.qualities?.join(', '))}
                        ${renderInfoField('Défauts', character.flaws?.join(', '))}
                        ${renderInfoField('Goûts', character.tastes)}
                        ${renderInfoField('Habitudes', character.habits)}
                        ${renderInfoField('Peurs', character.fears)}
                    </div>
                </div>

                <!-- Background Section -->
                <div class="character-detail-section" style="padding: 1.5rem; border-bottom: 1px solid var(--border-color);">
                    <h3 style="margin: 0 0 1rem 0;">Passé et contexte</h3>
                    <div class="character-info-grid" style="
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 1rem;
                        margin-bottom: 1rem;
                    ">
                        ${renderInfoField('Éducation', character.education)}
                        ${renderInfoField('Richesse', character.wealth ? `${character.wealth}/100` : '')}
                        ${renderInfoField('Secrets', character.secrets)}
                        ${renderInfoField('Croyances', character.beliefs)}
                    </div>
                </div>

                <!-- Notes Section -->
                ${character.notes ? `
                    <div class="character-detail-section" style="padding: 1.5rem;">
                        <h3 style="margin: 0 0 1rem 0;">Notes personnelles</h3>
                        <p style="margin: 0; white-space: pre-wrap; color: var(--text-secondary);">${DOMUtils.escape(character.notes)}</p>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Helper to render an info field
     * @param {string} label - Field label
     * @param {string} value - Field value
     * @returns {string} HTML string
     */
    function renderInfoField(label, value) {
        if (!value) return '';
        return `
            <div>
                <label style="display: block; font-size: 0.85rem; font-weight: 500; color: var(--text-muted); margin-bottom: 0.25rem;">${label}</label>
                <div style="color: var(--text-primary);">${DOMUtils.escape(value.toString())}</div>
            </div>
        `;
    }

    /**
     * Render add character modal
     * @returns {string} HTML string
     */
    function renderAddModal() {
        return `
            <div class="modal-content add-character-modal">
                <h2>Nouveau personnage</h2>
                <form id="add-character-form" style="display: grid; gap: 1rem;">
                    <div class="form-group">
                        <label for="character-name">Nom *</label>
                        <input type="text" id="character-name" required placeholder="Nom du personnage">
                    </div>
                    <div class="form-group">
                        <label for="character-role">Rôle</label>
                        <input type="text" id="character-role" placeholder="Ex: Héros, Antagoniste, Compagnon...">
                    </div>
                    <div class="form-group">
                        <label for="character-description">Description</label>
                        <textarea id="character-description" rows="4" placeholder="Brève description du personnage..."></textarea>
                    </div>
                    <div class="form-actions" style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;">
                        <button type="button" onclick="ModalUI.close()" style="padding: 0.5rem 1.5rem;">Annuler</button>
                        <button type="submit" style="padding: 0.5rem 1.5rem;">Créer</button>
                    </div>
                </form>
            </div>
        `;
    }

    // Public API
    return {
        renderList,
        renderListItem,
        renderEmptyState,
        renderDetailSheet,
        renderAddModal,
        renderInfoField
    };
})();

/**
 * DOM Utilities for safe rendering
 */
const DOMUtils = (() => {
    function escape(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return {
        escape
    };
})();
