// ============================================
// CHARACTERS RENDER - Rendu HTML Personnages
// ============================================

/**
 * CharactersRender - Génération du HTML pour la vue Personnages
 */

const CharactersRender = {

    /**
     * Rend la liste complète des personnages
     * @param {Array<Character>} characters
     * @returns {string}
     */
    renderList(characters) {
        if (characters.length === 0) {
            return this.renderEmptyState();
        }

        // Grouper par rôle
        const byRole = {
            protagonist: characters.filter(c => c.role === 'protagonist'),
            antagonist: characters.filter(c => c.role === 'antagonist'),
            secondary: characters.filter(c => c.role === 'secondary'),
            minor: characters.filter(c => c.role === 'minor')
        };

        return `
            <div class="characters-view">
                <div class="characters-header">
                    <h1>Personnages</h1>
                    <button class="btn btn-primary" data-action="add-character">
                        <i class="lucide-plus"></i> Nouveau personnage
                    </button>
                </div>

                ${byRole.protagonist.length > 0 ? this._renderGroup('Protagonistes', byRole.protagonist) : ''}
                ${byRole.antagonist.length > 0 ? this._renderGroup('Antagonistes', byRole.antagonist) : ''}
                ${byRole.secondary.length > 0 ? this._renderGroup('Personnages secondaires', byRole.secondary) : ''}
                ${byRole.minor.length > 0 ? this._renderGroup('Personnages mineurs', byRole.minor) : ''}
            </div>
        `;
    },

    /**
     * Rend un groupe de personnages
     * @private
     */
    _renderGroup(title, characters) {
        return `
            <div class="characters-group">
                <h2 class="characters-group-title">${title}</h2>
                <div class="characters-grid">
                    ${characters.map(c => this.renderCard(c)).join('')}
                </div>
            </div>
        `;
    },

    /**
     * Rend une carte de personnage
     * @param {Character} character
     * @returns {string}
     */
    renderCard(character) {
        const stats = character.getStats();

        return `
            <div class="character-card" data-character-id="${character.id}">
                <div class="character-card-header" style="border-left: 4px solid ${character.color}">
                    <div class="character-avatar" style="background: ${character.color}">
                        ${character.name.charAt(0).toUpperCase()}
                    </div>
                    <div class="character-card-info">
                        <h3 class="character-name">${DOMUtils.escape(character.name)}</h3>
                        ${character.aliases.length > 0 ? `
                            <div class="character-aliases">
                                ${character.aliases.slice(0, 2).map(alias =>
                                    `<span class="alias-tag">${DOMUtils.escape(alias)}</span>`
                                ).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>

                <div class="character-card-body">
                    <p class="character-description">
                        ${character.description ?
                            TextUtils.truncate(DOMUtils.escape(character.description), 120) :
                            '<em>Pas de description</em>'}
                    </p>

                    <div class="character-meta">
                        ${character.appearance.age ? `<span>👤 ${character.appearance.age} ans</span>` : ''}
                        ${character.background.occupation ? `<span>💼 ${DOMUtils.escape(character.background.occupation)}</span>` : ''}
                    </div>

                    <div class="character-stats">
                        <span title="Scènes"><i class="lucide-file-text"></i> ${stats.sceneCount}</span>
                        <span title="Relations"><i class="lucide-users"></i> ${stats.relationCount}</span>
                    </div>
                </div>

                <div class="character-card-actions">
                    <button class="btn-icon" data-action="view-character" data-character-id="${character.id}" title="Voir">
                        <i class="lucide-eye"></i>
                    </button>
                    <button class="btn-icon" data-action="edit-character" data-character-id="${character.id}" title="Modifier">
                        <i class="lucide-edit"></i>
                    </button>
                    <button class="btn-icon" data-action="delete-character" data-character-id="${character.id}" title="Supprimer">
                        <i class="lucide-trash-2"></i>
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Rend l'état vide
     */
    renderEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="lucide-users" style="font-size: 64px;"></i>
                </div>
                <h2>Aucun personnage</h2>
                <p>Commencez par créer votre premier personnage pour donner vie à votre histoire.</p>
                <button class="btn btn-primary" data-action="add-character">
                    <i class="lucide-plus"></i> Créer un personnage
                </button>
            </div>
        `;
    },

    /**
     * Rend la modale d'ajout
     */
    renderAddModal() {
        const roles = [
            { value: 'protagonist', label: 'Protagoniste' },
            { value: 'antagonist', label: 'Antagoniste' },
            { value: 'secondary', label: 'Secondaire' },
            { value: 'minor', label: 'Mineur' }
        ];

        return `
            <form id="add-character-form" class="character-form">
                <div class="form-section">
                    <h3>Informations de base</h3>

                    <div class="form-group">
                        <label for="char-name">Nom *</label>
                        <input type="text" id="char-name" required>
                    </div>

                    <div class="form-group">
                        <label for="char-role">Rôle</label>
                        <select id="char-role">
                            ${roles.map(r => `<option value="${r.value}">${r.label}</option>`).join('')}
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="char-description">Description</label>
                        <textarea id="char-description" rows="4" placeholder="Décrivez ce personnage..."></textarea>
                    </div>

                    <div class="form-group">
                        <label for="char-color">Couleur</label>
                        <input type="color" id="char-color" value="#3498db">
                    </div>
                </div>

                <div class="form-section">
                    <h3>Apparence</h3>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="char-age">Âge</label>
                            <input type="number" id="char-age" min="0" max="200">
                        </div>

                        <div class="form-group">
                            <label for="char-gender">Genre</label>
                            <input type="text" id="char-gender">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="char-physical">Description physique</label>
                        <textarea id="char-physical" rows="3"></textarea>
                    </div>
                </div>

                <div class="form-section">
                    <h3>Background</h3>

                    <div class="form-group">
                        <label for="char-occupation">Occupation</label>
                        <input type="text" id="char-occupation">
                    </div>

                    <div class="form-group">
                        <label for="char-history">Histoire</label>
                        <textarea id="char-history" rows="4"></textarea>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" data-action="cancel">Annuler</button>
                    <button type="submit" class="btn btn-primary">Créer</button>
                </div>
            </form>
        `;
    },

    /**
     * Rend la modale de détail
     */
    renderDetailModal(character, stats) {
        return `
            <div class="character-detail">
                <div class="character-detail-header" style="border-left: 6px solid ${character.color}">
                    <div class="character-detail-avatar" style="background: ${character.color}">
                        ${character.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2>${DOMUtils.escape(character.name)}</h2>
                        <p class="character-detail-role">${this._getRoleLabel(character.role)}</p>
                    </div>
                </div>

                <div class="character-detail-stats">
                    <div class="stat-card">
                        <div class="stat-value">${stats.sceneCount}</div>
                        <div class="stat-label">Scènes</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${TextUtils.formatWordCount(stats.wordCount)}</div>
                        <div class="stat-label">Mots</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.relationCount}</div>
                        <div class="stat-label">Relations</div>
                    </div>
                </div>

                ${character.description ? `
                    <div class="character-detail-section">
                        <h3>Description</h3>
                        <p>${DOMUtils.escape(character.description)}</p>
                    </div>
                ` : ''}

                ${character.appearance.age || character.appearance.gender || character.appearance.physicalDescription ? `
                    <div class="character-detail-section">
                        <h3>Apparence</h3>
                        <ul class="detail-list">
                            ${character.appearance.age ? `<li><strong>Âge :</strong> ${character.appearance.age} ans</li>` : ''}
                            ${character.appearance.gender ? `<li><strong>Genre :</strong> ${DOMUtils.escape(character.appearance.gender)}</li>` : ''}
                            ${character.appearance.physicalDescription ? `<li><strong>Description :</strong> ${DOMUtils.escape(character.appearance.physicalDescription)}</li>` : ''}
                        </ul>
                    </div>
                ` : ''}

                ${character.personality.traits.length > 0 ? `
                    <div class="character-detail-section">
                        <h3>Traits de personnalité</h3>
                        <div class="tags-list">
                            ${character.personality.traits.map(trait =>
                                `<span class="tag">${DOMUtils.escape(trait)}</span>`
                            ).join('')}
                        </div>
                    </div>
                ` : ''}

                ${character.background.occupation || character.background.history ? `
                    <div class="character-detail-section">
                        <h3>Background</h3>
                        <ul class="detail-list">
                            ${character.background.occupation ? `<li><strong>Occupation :</strong> ${DOMUtils.escape(character.background.occupation)}</li>` : ''}
                            ${character.background.history ? `<li><strong>Histoire :</strong> ${DOMUtils.escape(character.background.history)}</li>` : ''}
                        </ul>
                    </div>
                ` : ''}

                <div class="character-detail-actions">
                    <button class="btn btn-primary" data-action="edit-character-from-detail" data-character-id="${character.id}">
                        <i class="lucide-edit"></i> Modifier
                    </button>
                    <button class="btn btn-danger" data-action="delete-character-from-detail" data-character-id="${character.id}">
                        <i class="lucide-trash-2"></i> Supprimer
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Rend la modale d'édition
     */
    renderEditModal(character) {
        // Similaire à renderAddModal mais avec les valeurs pré-remplies
        return this.renderAddModal().replace(
            'id="add-character-form"',
            `id="edit-character-form" data-character-id="${character.id}"`
        ).replace(
            'id="char-name" required>',
            `id="char-name" required value="${DOMUtils.escape(character.name)}">`
        ).replace(
            'id="char-description"',
            `id="char-description">${DOMUtils.escape(character.description)}`
        ).replace(
            '<button type="submit" class="btn btn-primary">Créer</button>',
            '<button type="submit" class="btn btn-primary">Sauvegarder</button>'
        );
    },

    /**
     * Récupère le label d'un rôle
     * @private
     */
    _getRoleLabel(role) {
        const labels = {
            protagonist: 'Protagoniste',
            antagonist: 'Antagoniste',
            secondary: 'Personnage secondaire',
            minor: 'Personnage mineur'
        };
        return labels[role] || role;
    }
};

// Exposer globalement
window.CharactersRender = CharactersRender;
