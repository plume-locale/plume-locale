/**
 * Relations Render
 * Responsible for generating HTML templates for the relations view
 */

const RelationsRender = (() => {
    function renderRelationsGraph(characters, locations) {
        if ((!characters || characters.length === 0) && (!locations || locations.length === 0)) {
            return renderEmptyRelations();
        }

        const charConnections = buildCharacterConnections(characters);
        const locConnections = buildLocationConnections(locations);

        return `
            <div class="relations-container">
                <div class="relations-tabs">
                    <button class="relations-tab-btn active" data-tab="characters" onclick="RelationsView.switchTab('characters')">
                        Personnages
                    </button>
                    <button class="relations-tab-btn" data-tab="locations" onclick="RelationsView.switchTab('locations')">
                        Lieux
                    </button>
                    <button class="relations-tab-btn" data-tab="all" onclick="RelationsView.switchTab('all')">
                        Tous
                    </button>
                </div>

                <div id="relations-characters" class="relations-view active">
                    <div class="relations-canvas" id="canvas-characters"></div>
                    <div class="relations-list">
                        ${renderCharactersList(characters, charConnections)}
                    </div>
                </div>

                <div id="relations-locations" class="relations-view">
                    <div class="relations-canvas" id="canvas-locations"></div>
                    <div class="relations-list">
                        ${renderLocationsList(locations, locConnections)}
                    </div>
                </div>

                <div id="relations-all" class="relations-view">
                    <p style="text-align: center; color: var(--text-muted); padding: 2rem;">
                        Vue combinée - Personnages et Lieux
                    </p>
                </div>
            </div>
        `;
    }

    function renderCharactersList(characters, connections) {
        if (!characters || characters.length === 0) return '<p style="padding: 1rem; color: var(--text-muted);">Aucun personnage</p>';

        return `
            <div class="entities-list">
                <h3>Personnages</h3>
                ${characters.map(char => {
                    const relations = connections[char.id] || [];
                    return `
                        <div class="entity-card" data-entity-id="${char.id}">
                            <h4>${escapeHtml(char.name)}</h4>
                            <div class="entity-meta">
                                <span class="entity-role">${escapeHtml(char.role || 'Personnage')}</span>
                            </div>
                            ${relations.length > 0 ? `
                                <div class="entity-relations">
                                    <span class="relations-count">${relations.length} relation(s)</span>
                                </div>
                            ` : ''}
                            <button class="entity-edit-btn" onclick="event.stopPropagation();">Éditer</button>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    function renderLocationsList(locations, connections) {
        if (!locations || locations.length === 0) return '<p style="padding: 1rem; color: var(--text-muted);">Aucun lieu</p>';

        return `
            <div class="entities-list">
                <h3>Lieux</h3>
                ${locations.map(loc => {
                    const relations = connections[loc.id] || [];
                    return `
                        <div class="entity-card" data-entity-id="${loc.id}">
                            <h4>${escapeHtml(loc.name)}</h4>
                            <div class="entity-meta">
                                <span class="entity-type">${escapeHtml(loc.type || 'Lieu')}</span>
                            </div>
                            ${relations.length > 0 ? `
                                <div class="entity-relations">
                                    <span class="relations-count">${relations.length} lien(s)</span>
                                </div>
                            ` : ''}
                            <button class="entity-edit-btn" onclick="event.stopPropagation();">Éditer</button>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    function renderRelationDetail(entity, type) {
        const isCharacter = type === 'character';

        return `
            <div class="detail-view">
                <div class="detail-header">
                    <input type="text" id="entity-name" class="detail-title-input" 
                           value="${escapeHtml(entity.name || '')}" placeholder="Nom">
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">${isCharacter ? 'Rôle' : 'Type'}</div>
                    <input type="text" id="entity-role" class="form-input" 
                           value="${escapeHtml(entity.role || entity.type || '')}" 
                           placeholder="${isCharacter ? 'Ex: Héros' : 'Ex: Château'}">
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Connexions</div>
                    <div class="connections-editor">
                        <input type="text" id="entity-connections" class="form-input" 
                               placeholder="IDs d'autres entités, séparés par des virgules">
                        <small style="color: var(--text-muted); display: block; margin-top: 0.5rem;">
                            Exemple: char1, char2, loc1
                        </small>
                    </div>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Description</div>
                    <textarea id="entity-description" class="form-input" rows="6" 
                              placeholder="Description">${escapeHtml(entity.description || '')}</textarea>
                </div>
            </div>
        `;
    }

    function renderEmptyRelations() {
        return `
            <div style="padding: 2rem 1rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
                <i data-lucide="git-network" style="width:32px;height:32px;margin-bottom:0.5rem;opacity:0.5;"></i>
                <p>Aucun personnage ou lieu</p>
            </div>
        `;
    }

    function buildCharacterConnections(characters) {
        const connections = {};
        if (!characters) return connections;

        characters.forEach(char => {
            connections[char.id] = char.connections || [];
        });

        return connections;
    }

    function buildLocationConnections(locations) {
        const connections = {};
        if (!locations) return connections;

        locations.forEach(loc => {
            connections[loc.id] = loc.connections || [];
        });

        return connections;
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return {
        renderRelationsGraph,
        renderCharactersList,
        renderLocationsList,
        renderRelationDetail,
        renderEmptyRelations,
        buildCharacterConnections,
        buildLocationConnections,
        escapeHtml
    };
})();
